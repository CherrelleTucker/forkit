// ForkIt Backend - Group Fork session management
// Uses Redis (via ioredis) for ephemeral session storage

import Redis from 'ioredis';

let redis;
function getRedis() {
  if (!redis) redis = new Redis(process.env.REDIS_URL);
  return redis;
}

// Session config
const SESSION_TTL = 3600; // 1 hour — sessions auto-expire
const CODE_LENGTH = 4;
const MAX_PARTICIPANTS = 8;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 for readability

/**
 * Generate a short, readable session code.
 * @returns {string} e.g. "W7KP"
 */
function generateCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

/**
 * Get the Redis key for a session.
 * @param {string} code - session code
 * @returns {string}
 */
function sessionKey(code) {
  return `group:${code.toUpperCase()}`;
}

/**
 * Get a session object from Redis.
 * @param {string} key - Redis key
 * @returns {Promise<object|null>}
 */
async function getJSON(key) {
  const raw = await getRedis().get(key);
  if (!raw) return null;
  return JSON.parse(raw);
}

/**
 * Set a session object in Redis with TTL.
 * @param {string} key - Redis key
 * @param {object} value - session object
 * @returns {Promise<void>}
 */
async function setJSON(key, value) {
  await getRedis().set(key, JSON.stringify(value), 'EX', SESSION_TTL);
}

/**
 * Create a new group session.
 * @param {string} hostName - display name for the host
 * @param {{latitude: number, longitude: number}} coords - host's location
 * @param {string} locationName - human-readable name for the host's location (e.g. "NSSTC")
 * @returns {Promise<{code: string, hostId: string, session: object}>}
 */
export async function createSession(hostName, coords, locationName) {
  // Try up to 5 times to find an unused code
  let code;
  for (let i = 0; i < 5; i++) {
    code = generateCode();
    const existing = await getJSON(sessionKey(code));
    if (!existing) break;
    if (i === 4) throw new Error('CODE_COLLISION');
  }

  const hostId = generateCode() + generateCode(); // 8-char participant ID
  const session = {
    code,
    hostId,
    coords,
    locationName: locationName || '',
    status: 'waiting', // waiting | picking | done
    createdAt: Date.now(),
    participants: {
      [hostId]: {
        name: hostName,
        isHost: true,
        filters: null, // set when host submits filters
        joinedAt: Date.now(),
      },
    },
    result: null,
  };

  await setJSON(sessionKey(code), session);
  return { code, hostId, session };
}

/**
 * Get a session by code.
 * @param {string} code - session code
 * @returns {Promise<object|null>}
 */
export async function getSession(code) {
  return getJSON(sessionKey(code.toUpperCase()));
}

/**
 * Join an existing session.
 * @param {string} code - session code
 * @param {string} name - display name
 * @returns {Promise<{participantId: string, session: object}>}
 */
export async function joinSession(code, name) {
  const key = sessionKey(code);
  const session = await getJSON(key);
  if (!session) throw new Error('SESSION_NOT_FOUND');
  if (session.status !== 'waiting') throw new Error('SESSION_NOT_JOINABLE');

  const participantCount = Object.keys(session.participants).length;
  if (participantCount >= MAX_PARTICIPANTS) throw new Error('SESSION_FULL');

  const participantId = generateCode() + generateCode();
  session.participants[participantId] = {
    name,
    isHost: false,
    filters: null,
    joinedAt: Date.now(),
  };

  await setJSON(key, session);
  return { participantId, session };
}

/**
 * Submit filters for a participant.
 * @param {string} code - session code
 * @param {string} participantId - the participant's ID
 * @param {object} filters - { radiusMiles, maxPrice, minRating, openNow, cuisineKeyword, hiddenGems }
 * @returns {Promise<object>} updated session
 */
export async function submitFilters(code, participantId, filters) {
  const key = sessionKey(code);
  const session = await getJSON(key);
  if (!session) throw new Error('SESSION_NOT_FOUND');
  if (!session.participants[participantId]) throw new Error('NOT_IN_SESSION');
  if (session.status !== 'waiting') throw new Error('SESSION_NOT_JOINABLE');

  session.participants[participantId].filters = filters;
  await setJSON(key, session);
  return session;
}

/**
 * Compute the merged/overlap filters from all participants.
 * Strategy: use the most restrictive values (smallest radius, lowest max price,
 * highest min rating, open now if anyone wants it, union of keywords).
 * @param {object} participants - the session participants map
 * @returns {object|null} merged filters
 */
export function mergeFilters(participants) {
  const entries = Object.values(participants).filter((p) => p.filters);
  if (entries.length === 0) return null;

  let minRadius = Infinity;
  let lowestMaxPrice = 4;
  let highestMinRating = 0;
  let openNow = false;
  let hiddenGems = false;
  const keywords = [];
  const excludeTerms = [];

  for (const p of entries) {
    const f = p.filters;
    if (f.radiusMiles < minRadius) minRadius = f.radiusMiles;
    if (f.maxPrice != null && f.maxPrice < lowestMaxPrice) lowestMaxPrice = f.maxPrice;
    if (f.minRating != null && f.minRating > highestMinRating) highestMinRating = f.minRating;
    if (f.openNow) openNow = true;
    if (f.hiddenGems) hiddenGems = true;
    if (f.cuisineKeyword?.trim()) keywords.push(f.cuisineKeyword.trim());
    if (f.excludeKeyword?.trim()) {
      f.excludeKeyword.split(',').forEach((t) => {
        const term = t.trim().toLowerCase();
        if (term && !excludeTerms.includes(term)) excludeTerms.push(term);
      });
    }
  }

  return {
    radiusMiles: minRadius === Infinity ? 3 : minRadius,
    maxPrice: lowestMaxPrice,
    minRating: highestMinRating,
    openNow,
    hiddenGems,
    keywords, // array — backend will search each keyword
    excludeTerms, // array — union of all exclude terms, lowercased
  };
}

/**
 * Mark session as picking (host triggered the pick).
 * @param {string} code - session code
 * @param {string} hostId - must be the host
 * @returns {Promise<{session: object, mergedFilters: object}>} updated session with merged filters
 */
export async function startPick(code, hostId) {
  const key = sessionKey(code);
  const session = await getJSON(key);
  if (!session) throw new Error('SESSION_NOT_FOUND');
  if (session.hostId !== hostId) throw new Error('NOT_HOST');
  if (session.status !== 'waiting') throw new Error('ALREADY_PICKING');

  // Check at least 2 participants have submitted filters
  const readyCount = Object.values(session.participants).filter((p) => p.filters).length;
  if (readyCount < 2) throw new Error('NOT_ENOUGH_READY');

  session.status = 'picking';
  await setJSON(key, session);
  return { session, mergedFilters: mergeFilters(session.participants) };
}

/**
 * Save the pick result to the session.
 * @param {string} code - session code
 * @param {object} result - the picked restaurant
 * @returns {Promise<object>} updated session
 */
export async function saveResult(code, result) {
  const key = sessionKey(code);
  const session = await getJSON(key);
  if (!session) throw new Error('SESSION_NOT_FOUND');

  session.status = 'done';
  session.result = result;
  await setJSON(key, session);
  return session;
}

/**
 * Remove a participant from a session.
 * @param {string} code - session code
 * @param {string} participantId - who's leaving
 * @returns {Promise<object|null>} updated session, or null if session was deleted
 */
export async function leaveSession(code, participantId) {
  const key = sessionKey(code);
  const session = await getJSON(key);
  if (!session) throw new Error('SESSION_NOT_FOUND');

  const participant = session.participants[participantId];
  if (!participant) throw new Error('NOT_IN_SESSION');

  // If host leaves, kill the session
  if (participant.isHost) {
    await getRedis().del(key);
    return null;
  }

  delete session.participants[participantId];
  await setJSON(key, session);
  return session;
}
