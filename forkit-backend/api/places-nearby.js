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

  // Determine which API to use based on whether keyword is provided
  const hasKeyword = keyword && keyword.trim().length > 0;
  let allPlaces = [];

  try {
    if (hasKeyword) {
      // Use Text Search API for keyword searches (with pagination)
      const apiUrl = 'https://places.googleapis.com/v1/places:searchText';
      const requestBody = {
        textQuery: `${keyword.trim()} restaurant`,
        includedType: 'restaurant',
        maxResultCount: 20,
        locationBias: {
          circle: {
            center: {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            },
            radius: parseFloat(radius),
          },
        },
      };
      console.log(`Using Text Search API for keyword: "${keyword.trim()}"`);

      // Paginate through results
      let pageToken = null;
      let pageCount = 0;
      const maxPages = 3;

      do {
        const paginatedRequestBody = pageToken
          ? { ...requestBody, pageToken }
          : requestBody;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': fieldMask,
          },
          body: JSON.stringify(paginatedRequestBody),
        });

        if (!response.ok) {
          if (allPlaces.length > 0) break;
          const errorText = await response.text();
          console.error('Places API error:', response.status, errorText);
          return res.status(response.status).json({ error: 'Places API request failed', details: errorText });
        }

        const pageData = await response.json();
        if (pageData.places?.length > 0) {
          allPlaces = allPlaces.concat(pageData.places);
        }
        pageToken = pageData.nextPageToken || null;
        pageCount++;
        console.log(`Text Search page ${pageCount}: ${pageData.places?.length || 0} places, total: ${allPlaces.length}`);

        if (pageToken && pageCount < maxPages) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } while (pageToken && pageCount < maxPages);

    } else {
      // Use Nearby Search - make multiple parallel requests for more variety
      // (Nearby Search doesn't support pagination, max 20 per request)
      const apiUrl = 'https://places.googleapis.com/v1/places:searchNearby';
      const locationRestriction = {
        circle: {
          center: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          },
          radius: parseFloat(radius),
        },
      };

      console.log('Using Nearby Search API with multi-query strategy');

      // Helper to make a search request
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

      // Make parallel requests with different types and rankings for maximum variety
      const responses = await Promise.all([
        makeRequest(['restaurant'], 'DISTANCE'),
        makeRequest(['restaurant'], 'POPULARITY'),
        makeRequest(['american_restaurant'], 'POPULARITY'),
        makeRequest(['mexican_restaurant'], 'POPULARITY'),
        makeRequest(['italian_restaurant'], 'POPULARITY'),
        makeRequest(['chinese_restaurant'], 'POPULARITY'),
      ]);

      const labels = ['restaurant/distance', 'restaurant/popularity', 'american', 'mexican', 'italian', 'chinese'];

      // Process all responses and deduplicate
      for (let i = 0; i < responses.length; i++) {
        if (responses[i].ok) {
          const data = await responses[i].json();
          if (data.places?.length > 0) {
            const existingIds = new Set(allPlaces.map(p => p.id));
            const newPlaces = data.places.filter(p => !existingIds.has(p.id));
            allPlaces = allPlaces.concat(newPlaces);
            console.log(`${labels[i]}: ${data.places.length} places (${newPlaces.length} new)`);
          } else {
            console.log(`${labels[i]}: 0 places returned`);
          }
        } else {
          const errorText = await responses[i].text();
          console.error(`${labels[i]} FAILED: ${responses[i].status} - ${errorText}`);
        }
      }

      if (allPlaces.length === 0) {
        return res.status(500).json({ error: 'No results from Places API' });
      }
    }

    console.log(`Total unique places fetched: ${allPlaces.length}`);

    const data = { places: allPlaces };

    // Transform new API response to match old API format for client compatibility
    const transformedData = {
      status: data.places && data.places.length > 0 ? 'OK' : 'ZERO_RESULTS',
      _debug: { totalFetched: allPlaces.length, timestamp: new Date().toISOString() },
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

    // Note: Keyword filtering is now handled by Text Search API when keyword is provided
    // No need for client-side keyword filtering anymore

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
