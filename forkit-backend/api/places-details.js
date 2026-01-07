// ForkIt Backend - Place Details Proxy
// Proxies requests to Google Places API (New) for detailed place information

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Extract place ID from request body
  const { placeId } = req.body;

  // Validate required parameter
  if (!placeId || typeof placeId !== 'string' || !placeId.trim()) {
    return res.status(400).json({
      error: 'Missing or invalid required parameter: placeId',
    });
  }

  // Get API key from environment
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Build field mask for response (matching fields the app needs)
  const fieldMask = [
    'id',
    'displayName',
    'formattedAddress',
    'nationalPhoneNumber',
    'websiteUri',
    'googleMapsUri',
    'location',
    'rating',
    'userRatingCount',
    'priceLevel',
    'currentOpeningHours',
    'businessStatus',
  ].join(',');

  try {
    // Make request to Google Places API (New)
    // Note: place.id format is like "places/ChIJN1t_tDeuEmsRUsoyG83frY4"
    // We need to use the full format or just the ID part
    const placeIdParam = placeId.startsWith('places/') ? placeId : `places/${placeId}`;

    const url = `https://places.googleapis.com/v1/${placeIdParam}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Places API error:', response.status, errorText);

      // Handle specific error cases
      if (response.status === 404) {
        return res.status(404).json({
          error: 'Place not found',
          status: 'NOT_FOUND',
        });
      }

      return res.status(response.status).json({
        error: 'Places API request failed',
        details: errorText,
      });
    }

    const data = await response.json();

    // Transform new API response to match old API format for client compatibility
    const transformedData = {
      status: 'OK',
      result: {
        place_id: data.id || placeId,
        name: data.displayName?.text || '',
        formatted_address: data.formattedAddress || '',
        formatted_phone_number: data.nationalPhoneNumber || null,
        website: data.websiteUri || null,
        url: data.googleMapsUri || null,
        geometry: {
          location: {
            lat: data.location?.latitude || 0,
            lng: data.location?.longitude || 0,
          },
        },
        rating: data.rating || null,
        user_ratings_total: data.userRatingCount || 0,
        price_level: data.priceLevel ? parsePriceLevel(data.priceLevel) : null,
        opening_hours: data.currentOpeningHours
          ? {
              open_now: data.currentOpeningHours.openNow || false,
              weekday_text: data.currentOpeningHours.weekdayDescriptions || [],
            }
          : null,
        business_status: data.businessStatus || 'OPERATIONAL',
        vicinity: data.formattedAddress || '',
      },
    };

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
