// ForkIt Backend - Group Fork: Submit Filters
import { runSecurityChecks } from '../../lib/security.js';
import { submitFilters } from '../../lib/group.js';

export default async function handler(req, res) {
  if (!runSecurityChecks(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { code, participantId, filters } = req.body || {};

  if (!code || !participantId) {
    return res.status(400).json({ error: 'code and participantId are required.' });
  }
  if (!filters || typeof filters !== 'object') {
    return res.status(400).json({ error: 'filters object is required.' });
  }

  // Sanitize filters
  const sanitized = {
    radiusMiles: Math.min(Math.max(Number(filters.radiusMiles) || 3, 0.25), 15),
    maxPrice: filters.maxPrice != null ? Math.min(Math.max(Math.round(Number(filters.maxPrice)), 0), 4) : null,
    minRating: filters.minRating != null ? Math.min(Math.max(Number(filters.minRating), 0), 5) : null,
    openNow: Boolean(filters.openNow),
    hiddenGems: Boolean(filters.hiddenGems),
    cuisineKeyword: typeof filters.cuisineKeyword === 'string' ? filters.cuisineKeyword.slice(0, 100) : '',
    excludeKeyword: typeof filters.excludeKeyword === 'string' ? filters.excludeKeyword.slice(0, 200) : '',
    groupSize: ['2-4', '5-8', '8+'].includes(filters.groupSize) ? filters.groupSize : '2-4',
  };

  try {
    const session = await submitFilters(code.trim(), participantId, sanitized);
    return res.status(200).json({
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
    if (msg === 'SESSION_NOT_JOINABLE') {
      return res.status(409).json({ error: 'Session is no longer accepting changes.' });
    }
    console.error('Group filters error:', error);
    return res.status(500).json({ error: 'Failed to submit filters.' });
  }
}
