// ForkIt Backend - Group Fork: Create Session
import { runSecurityChecks } from '../../lib/security.js';
import { createSession } from '../../lib/group.js';

export default async function handler(req, res) {
  if (!runSecurityChecks(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { hostName, latitude, longitude, locationName } = req.body || {};

  if (!hostName || typeof hostName !== 'string' || hostName.trim().length === 0) {
    return res.status(400).json({ error: 'hostName is required.' });
  }
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
  }

  try {
    const safeName = typeof locationName === 'string' ? locationName.trim().slice(0, 60) : '';
    const { code, hostId, session } = await createSession(
      hostName.trim().slice(0, 20),
      { latitude, longitude },
      safeName,
    );
    return res.status(200).json({
      code,
      hostId,
      participantCount: Object.keys(session.participants).length,
    });
  } catch (error) {
    if (error.message === 'CODE_COLLISION') {
      return res.status(503).json({ error: 'Service busy. Please try again.' });
    }
    console.error('Group create error:', error);
    return res.status(500).json({ error: 'Failed to create session.' });
  }
}
