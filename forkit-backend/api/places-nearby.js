// ForkIt Backend - Places Nearby Search Proxy
// Proxies requests to Google Places API (New) with server-side API key management

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Extract request parameters
  const {
    latitude,
    longitude,
    radius,
    keyword,
    opennow,
    maxPrice,
    minRating,
    excludedPlaceIds, // Array of place IDs to exclude (recently shown)
  } = req.body;

  // Validate required parameters
  if (!latitude || !longitude || !radius) {
    return res.status(400).json({
      error: 'Missing required parameters: latitude, longitude, radius',
    });
  }

  // Validate latitude and longitude ranges
  if (latitude < -90 || latitude > 90) {
    return res.status(400).json({ error: 'Invalid latitude. Must be between -90 and 90.' });
  }

  if (longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: 'Invalid longitude. Must be between -180 and 180.' });
  }

  // Validate radius (1 mile to 15 miles = ~1600m to ~24000m)
  if (radius < 100 || radius > 50000) {
    return res.status(400).json({ error: 'Invalid radius. Must be between 100 and 50000 meters.' });
  }

  // Get API key from environment
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Verify Play Integrity token if provided
  const integrityToken = req.headers['x-integrity-token'];
  if (integrityToken) {
    // Log that we received a token (actual verification happens in verify-integrity endpoint)
    console.log('Received integrity token for nearby search');
  }

  // Build request body for new Places API
  const requestBody = {
    includedTypes: ['restaurant'],
    maxResultCount: 20, // Maximum allowed by Places API (New) searchNearby
    rankPreference: 'DISTANCE', // Prioritize closer restaurants
    locationRestriction: {
      circle: {
        center: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        radius: parseFloat(radius),
      },
    },
  };

  // Note: The new Places API searchNearby doesn't support keyword filtering
  // Keyword filtering will be done client-side on the results
  // For keyword search, would need to use Text Search API instead

  // Build field mask for response
  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.rating',
    'places.userRatingCount',
    'places.priceLevel',
    'places.types',
    'places.businessStatus',
    'places.currentOpeningHours',
  ].join(',');

  try {
    // Make request to Google Places API (New)
    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Places API error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Places API request failed',
        details: errorText,
      });
    }

    const data = await response.json();

    // Transform new API response to match old API format for client compatibility
    const transformedData = {
      status: data.places && data.places.length > 0 ? 'OK' : 'ZERO_RESULTS',
      results: (data.places || []).map((place) => ({
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
          ? { open_now: place.currentOpeningHours.openNow || false }
          : null,
      })),
    };

    // Apply client-side filters that can't be handled by the API
    let filteredResults = transformedData.results;

    // Filter out recently shown places
    if (excludedPlaceIds && Array.isArray(excludedPlaceIds) && excludedPlaceIds.length > 0) {
      const excludedSet = new Set(excludedPlaceIds);
      filteredResults = filteredResults.filter((r) => !excludedSet.has(r.place_id));
      console.log(`Excluded ${excludedPlaceIds.length} recently shown places`);
    }

    // Filter by open now if requested
    if (opennow) {
      filteredResults = filteredResults.filter(
        (r) => r.opening_hours && r.opening_hours.open_now
      );
    }

    // Filter by max price if specified
    if (maxPrice !== undefined && maxPrice !== null) {
      filteredResults = filteredResults.filter(
        (r) => r.price_level === null || r.price_level <= maxPrice
      );
    }

    // Filter by minimum rating if specified
    if (minRating !== undefined && minRating !== null) {
      filteredResults = filteredResults.filter(
        (r) => (r.rating || 0) >= minRating
      );
    }

    // Filter by keyword if specified (search in name and types)
    if (keyword && keyword.trim()) {
      const keywordLower = keyword.trim().toLowerCase();
      filteredResults = filteredResults.filter((r) => {
        const nameMatch = r.name.toLowerCase().includes(keywordLower);
        const typeMatch = r.types.some(t => t.toLowerCase().includes(keywordLower));
        const vicinityMatch = r.vicinity.toLowerCase().includes(keywordLower);
        return nameMatch || typeMatch || vicinityMatch;
      });
    }

    // Update status if filtering removed all results
    transformedData.results = filteredResults;
    if (filteredResults.length === 0) {
      transformedData.status = 'ZERO_RESULTS';
    }

    return res.status(200).json(transformedData);
  } catch (error) {
    console.error('Error calling Places API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

// Helper function to convert priceLevel enum to numeric value
function parsePriceLevel(priceLevel) {
  const priceLevelMap = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };
  return priceLevelMap[priceLevel] || null;
}
