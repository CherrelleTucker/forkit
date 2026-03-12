// ForkIt Backend - Group Fork: Poll Session Status
import { runSecurityChecks, setCorsHeaders } from '../../lib/security.js';
import { getSession } from '../../lib/group.js';

export default async function handler(req, res) {
  // Allow GET for polling — need custom CORS since runSecurityChecks expects POST
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }

  if (!runSecurityChecks(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const code = req.query.code;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'code query parameter is required.' });
  }

  try {
    const session = await getSession(code.trim());
    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired.' });
    }

    // Find the host's radius from their submitted filters (if any)
    const host = Object.values(session.participants).find((p) => p.isHost);
    const hostName = host ? host.name : '';
    const hostRadius = host?.filters?.radiusMiles || null;

    return res.status(200).json({
      code: session.code,
      status: session.status,
      locationName: session.locationName || '',
      hostName,
      hostRadius,
      participants: Object.values(session.participants).map((p) => ({
        name: p.name,
        isHost: p.isHost,
        ready: !!p.filters,
      })),
      result: session.status === 'done' ? session.result : null,
    });
  } catch (error) {
    console.error('Group status error:', error);
    return res.status(500).json({ error: 'Failed to get session status.' });
  }
}
