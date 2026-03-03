// ForkIt Backend - Places Autocomplete Proxy
// Proxies requests to Google Places Autocomplete (New) API for address suggestions

import { runSecurityChecks } from '../lib/security.js';

export default async function handler(req, res) {
  // Run security checks (CORS, origin, rate limiting)
  if (!runSecurityChecks(req, res)) return;

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Extract and validate input
  const body = req.body || {};
  const input = typeof body.input === 'string' ? body.input.trim() : '';

  if (!input || input.length < 2) {
    return res.status(400).json({ error: 'Input must be at least 2 characters.' });
  }

  // Cap input length to prevent abuse
  if (input.length > 200) {
    return res.status(400).json({ error: 'Input too long.' });
  }

  // Optional location bias (lat/lng from user's device)
  const latitude = body.latitude != null ? Number(body.latitude) : null;
  const longitude = body.longitude != null ? Number(body.longitude) : null;

  // Get API key from environment
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const requestBody = {
      input,
    };

    // Bias results toward user's location if provided
    if (latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude)) {
      requestBody.locationBias = {
        circle: {
          center: { latitude, longitude },
          radius: 50000, // 50km bias radius
        },
      };
    }

    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Places Autocomplete API error:', response.status, errorText);
      return res.status(502).json({ error: 'Autocomplete failed. Please try again.' });
    }

    const data = await response.json();

    // Transform to a simple format for the client
    const suggestions = (data.suggestions || [])
      .filter(s => s.placePrediction)
      .slice(0, 5)
      .map(s => ({
        placeId: s.placePrediction.placeId,
        description: s.placePrediction.text?.text || '',
        mainText: s.placePrediction.structuredFormat?.mainText?.text || '',
        secondaryText: s.placePrediction.structuredFormat?.secondaryText?.text || '',
      }));

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error calling Places Autocomplete API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
