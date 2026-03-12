// ForkIt Backend - Group Fork: Leave Session
import { runSecurityChecks } from '../../lib/security.js';
import { leaveSession } from '../../lib/group.js';

export default async function handler(req, res) {
  if (!runSecurityChecks(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { code, participantId } = req.body || {};
  if (!code || !participantId) {
    return res.status(400).json({ error: 'code and participantId are required.' });
  }

  try {
    const session = await leaveSession(code.trim(), participantId);
    if (!session) {
      // Host left — session destroyed
      return res.status(200).json({ status: 'session_ended' });
    }
    return res.status(200).json({
      status: 'left',
      participants: Object.values(session.participants).map((p) => ({
        name: p.name,
        isHost: p.isHost,
        ready: !!p.filters,
      })),
    });
  } catch (error) {
    const msg = error.message;
    if (msg === 'SESSION_NOT_FOUND') {
      return res.status(404).json({ error: 'Session not found.' });
    }
    if (msg === 'NOT_IN_SESSION') {
      return res.status(403).json({ error: 'You are not in this session.' });
    }
    console.error('Group leave error:', error);
    return res.status(500).json({ error: 'Failed to leave session.' });
  }
}
