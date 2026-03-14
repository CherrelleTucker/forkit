// ForkIt Backend - Group Fork: Trigger the Pick
// Host calls this to merge filters, search Places API, and pick a restaurant
import { runSecurityChecks } from '../../lib/security.js';
import { startPick, saveResult } from '../../lib/group.js';
import { parsePriceLevel } from '../../lib/places.js';

const MILES_TO_METERS = 1609.34;

export default async function handler(req, res) {
  if (!runSecurityChecks(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { code, hostId } = req.body || {};
  if (!code || !hostId) {
    return res.status(400).json({ error: 'code and hostId are required.' });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  let session, mergedFilters;
  try {
    const result = await startPick(code.trim(), hostId);
    session = result.session;
    mergedFilters = result.mergedFilters;
  } catch (error) {
    const msg = error.message;
    if (msg === 'SESSION_NOT_FOUND') {
      return res.status(404).json({ error: 'Session not found.' });
    }
    if (msg === 'NOT_HOST') {
      return res.status(403).json({ error: 'Only the host can trigger the pick.' });
    }
    if (msg === 'ALREADY_PICKING') {
      return res.status(409).json({ error: 'Pick already in progress.' });
    }
    if (msg === 'NOT_ENOUGH_READY') {
      return res.status(400).json({ error: 'At least 2 people need to set their filters.' });
    }
    console.error('Group pick start error:', error);
    return res.status(500).json({ error: 'Failed to start pick.' });
  }

  // Search using merged filters and host's coordinates
  try {
    const { coords } = session;
    const radiusMeters = Math.round(mergedFilters.radiusMiles * MILES_TO_METERS);

    const fieldMask = [
      'places.id', 'places.displayName', 'places.formattedAddress',
      'places.location', 'places.rating', 'places.userRatingCount',
      'places.priceLevel', 'places.types', 'places.businessStatus',
      'places.currentOpeningHours',
    ].join(',');

    let allPlaces = [];
    const hasKeywords = mergedFilters.keywords.length > 0;

    if (hasKeywords) {
      // Search each keyword separately and combine
      const apiUrl = 'https://places.googleapis.com/v1/places:searchText';
      const lat = coords.latitude;
      const lng = coords.longitude;
      const latDelta = radiusMeters / 111320;
      const lngDelta = radiusMeters / (111320 * Math.cos(lat * (Math.PI / 180)));

      const searches = mergedFilters.keywords.map((kw) =>
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': fieldMask,
          },
          body: JSON.stringify({
            textQuery: `${kw} restaurant`,
            includedType: 'restaurant',
            maxResultCount: 20,
            locationRestriction: {
              rectangle: {
                low: { latitude: lat - latDelta, longitude: lng - lngDelta },
                high: { latitude: lat + latDelta, longitude: lng + lngDelta },
              },
            },
          }),
        }),
      );

      const settled = await Promise.allSettled(searches);
      for (const result of settled) {
        if (result.status === 'fulfilled' && result.value.ok) {
          const data = await result.value.json();
          if (data.places?.length > 0) {
            const existingIds = new Set(allPlaces.map((p) => p.id));
            allPlaces = allPlaces.concat(data.places.filter((p) => !existingIds.has(p.id)));
          }
        }
      }
    } else {
      // Standard multi-query Nearby Search
      const apiUrl = 'https://places.googleapis.com/v1/places:searchNearby';
      const locationRestriction = {
        circle: {
          center: { latitude: coords.latitude, longitude: coords.longitude },
          radius: radiusMeters,
        },
      };

      const makeRequest = (types, rankPreference) =>
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': fieldMask,
          },
          body: JSON.stringify({
            includedTypes: types,
            maxResultCount: 20,
            locationRestriction,
            rankPreference,
          }),
        });

      const settled = await Promise.allSettled([
        makeRequest(['restaurant'], 'DISTANCE'),
        makeRequest(['restaurant'], 'POPULARITY'),
        makeRequest(['american_restaurant'], 'POPULARITY'),
        makeRequest(['mexican_restaurant'], 'POPULARITY'),
        makeRequest(['italian_restaurant'], 'POPULARITY'),
        makeRequest(['chinese_restaurant'], 'POPULARITY'),
      ]);

      for (const result of settled) {
        if (result.status === 'fulfilled' && result.value.ok) {
          const data = await result.value.json();
          if (data.places?.length > 0) {
            const existingIds = new Set(allPlaces.map((p) => p.id));
            allPlaces = allPlaces.concat(data.places.filter((p) => !existingIds.has(p.id)));
          }
        }
      }
    }

    // Transform to legacy format
    let results = allPlaces.map((place) => ({
      place_id: place.id,
      name: place.displayName?.text || '',
      vicinity: place.formattedAddress || '',
      geometry: {
        location: {
          lat: place.location?.latitude || 0,
          lng: place.location?.longitude || 0,
        },
      },
      rating: place.rating || null,
      user_ratings_total: place.userRatingCount || 0,
      price_level: place.priceLevel ? parsePriceLevel(place.priceLevel) : null,
      types: place.types || [],
      business_status: place.businessStatus || 'OPERATIONAL',
      opening_hours: place.currentOpeningHours
        ? {
            open_now: place.currentOpeningHours.openNow || false,
            periods: (place.currentOpeningHours.periods || []).map((p) => ({
              open: p.open ? { day: p.open.day, hour: p.open.hour, minute: p.open.minute } : null,
              close: p.close ? { day: p.close.day, hour: p.close.hour, minute: p.close.minute } : null,
            })),
          }
        : null,
    }));

    // Apply merged filters
    if (mergedFilters.openNow) {
      results = results.filter((r) => r.opening_hours?.open_now);
    }
    if (mergedFilters.maxPrice != null) {
      results = results.filter((r) => r.price_level === null || r.price_level <= mergedFilters.maxPrice);
    }
    if (mergedFilters.minRating != null) {
      results = results.filter((r) => (r.rating || 0) >= mergedFilters.minRating);
    }
    if (mergedFilters.excludeTerms?.length > 0) {
      results = results.filter((r) => {
        const nameLower = (r.name || '').toLowerCase();
        const typesJoined = (r.types || []).join(' ').toLowerCase();
        return !mergedFilters.excludeTerms.some((term) => nameLower.includes(term) || typesJoined.includes(term));
      });
    }

    if (results.length === 0) {
      // Reset session status so host can retry with different filters
      await saveResult(code.trim(), null);
      return res.status(200).json({
        status: 'no_results',
        message: 'No restaurants matched everyone\'s filters. Try loosening your criteria.',
      });
    }

    // Pick a random restaurant
    const picked = results[Math.floor(Math.random() * results.length)];
    await saveResult(code.trim(), picked, mergedFilters);

    return res.status(200).json({
      status: 'done',
      result: picked,
      totalSearched: allPlaces.length,
      totalMatched: results.length,
    });
  } catch (error) {
    console.error('Group pick search error:', error);
    return res.status(500).json({ error: 'Search failed. Please try again.' });
  }
}
