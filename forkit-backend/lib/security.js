// ForkIt Backend - Security middleware
// Rate limiting and origin checking

// Allowed origins for CORS and origin checking
const ALLOWED_ORIGINS = [
  'https://forkit-web.vercel.app',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
];

// In-memory rate limit store (resets on cold start, which is fine for Vercel)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP (autocomplete needs headroom)

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Checks rate limit for the given request.
 * Returns { allowed: true } or { allowed: false, retryAfter: seconds }
 */
export function checkRateLimit(req) {
  const ip = getClientIp(req);
  const now = Date.now();

  // Cleanup old entries periodically
  if (rateLimitStore.size > 1000) {
    cleanupExpiredEntries();
  }

  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // New window
    rateLimitStore.set(ip, { windowStart: now, count: 1 });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count };
}

/**
 * Checks if the request origin is allowed.
 * Mobile apps (React Native) don't send Origin headers, so those are allowed through.
 * Only blocks web requests from unknown origins.
 */
export function checkOrigin(req) {
  const origin = req.headers['origin'];
  const referer = req.headers['referer'];

  // No origin header = likely a mobile app or server-side request — allow
  if (!origin && !referer) {
    return { allowed: true, origin: 'mobile/direct' };
  }

  // Check origin header
  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      return { allowed: true, origin };
    }
    console.warn(`Blocked request from unauthorized origin: ${origin}`);
    return { allowed: false, origin };
  }

  // Check referer as fallback
  if (referer) {
    const allowed = ALLOWED_ORIGINS.some(o => referer.startsWith(o));
    if (allowed) {
      return { allowed: true, origin: referer };
    }
    console.warn(`Blocked request from unauthorized referer: ${referer}`);
    return { allowed: false, origin: referer };
  }

  return { allowed: true, origin: 'unknown' };
}

/**
 * Sets CORS headers for allowed origins only.
 */
export function setCorsHeaders(req, res) {
  const origin = req.headers['origin'];
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Mobile apps — allow all (they don't use CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Integrity-Token');
}

/**
 * Run all security checks. Returns true if request should proceed, false if blocked.
 * Sends the appropriate error response when blocking.
 */
export function runSecurityChecks(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.status(204).end();
    return false; // handled, don't proceed
  }

  // Origin check
  const originCheck = checkOrigin(req);
  if (!originCheck.allowed) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }

  // Rate limit check
  const rateCheck = checkRateLimit(req);
  if (!rateCheck.allowed) {
    res.setHeader('Retry-After', rateCheck.retryAfter);
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: rateCheck.retryAfter,
    });
    return false;
  }

  // Set CORS headers for the actual response
  setCorsHeaders(req, res);

  return true; // all checks passed
}
