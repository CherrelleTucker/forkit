// ForkIt Backend - Group Fork: Rejoin Session (host recovery)
import { runSecurityChecks } from '../../lib/security.js';
import { getSession } from '../../lib/group.js';

export default async function handler(req, res) {
  if (!runSecurityChecks(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { code, hostId } = req.body || {};

  if (!code || typeof code !== 'string' || code.trim().length !== 4) {
    return res.status(400).json({ error: 'A 4-character session code is required.' });
  }
  if (!hostId || typeof hostId !== 'string') {
    return res.status(400).json({ error: 'hostId is required.' });
  }

  try {
    const session = await getSession(code.trim());
    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired.' });
    }
    if (session.hostId !== hostId) {
      return res.status(403).json({ error: 'Invalid host credentials.' });
    }

    const host = Object.values(session.participants).find((p) => p.isHost);
    return res.status(200).json({
      code: session.code,
      status: session.status,
      locationName: session.locationName || '',
      hostName: host ? host.name : '',
      hostRadius: host?.filters?.radiusMiles || null,
      participants: Object.values(session.participants).map((p) => ({
        name: p.name,
        isHost: p.isHost,
        ready: !!p.filters,
      })),
      result: session.status === 'done' ? session.result : null,
      mergedFilters: session.status === 'done' ? session.mergedFilters || null : null,
    });
  } catch (error) {
    console.error('Group rejoin error:', error);
    return res.status(500).json({ error: 'Failed to rejoin session.' });
  }
}
