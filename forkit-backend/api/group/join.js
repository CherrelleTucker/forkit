// ForkIt Backend - Group Fork: Join Session
import { runSecurityChecks } from '../../lib/security.js';
import { joinSession, sendPushToHost } from '../../lib/group.js';

export default async function handler(req, res) {
  if (!runSecurityChecks(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { code, name } = req.body || {};

  if (!code || typeof code !== 'string' || code.trim().length !== 4) {
    return res.status(400).json({ error: 'A 4-character session code is required.' });
  }
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'name is required.' });
  }

  try {
    const { participantId, session } = await joinSession(
      code.trim(),
      name.trim().slice(0, 20),
    );
    // Notify host (fire-and-forget)
    if (session.hostPushToken) {
      sendPushToHost(
        session.hostPushToken,
        'Fork Around',
        `${name.trim().slice(0, 20)} joined your session!`,
        { type: 'group_join', code: session.code },
      );
    }
    const host = Object.values(session.participants).find((p) => p.isHost);
    return res.status(200).json({
      participantId,
      code: session.code,
      locationName: session.locationName || '',
      hostName: host ? host.name : '',
      hostRadius: host?.filters?.radiusMiles || null,
      participants: Object.values(session.participants).map((p) => ({
        name: p.name,
        isHost: p.isHost,
        ready: !!p.filters,
      })),
    });
  } catch (error) {
    const msg = error.message;
    if (msg === 'SESSION_NOT_FOUND') {
      return res.status(404).json({ error: 'Session not found. Check the code and try again.' });
    }
    if (msg === 'SESSION_NOT_JOINABLE') {
      return res.status(409).json({ error: 'This session is no longer accepting new members.' });
    }
    if (msg === 'SESSION_FULL') {
      return res.status(409).json({ error: 'This session is full (max 8 people).' });
    }
    console.error('Group join error:', error);
    return res.status(500).json({ error: 'Failed to join session.' });
  }
}
