// ForkIt Backend - Shared Places API helpers

/**
 * Convert Google Places API v2 priceLevel enum to legacy numeric value.
 * @param {string} priceLevel - e.g. "PRICE_LEVEL_MODERATE"
 * @returns {number|null}
 */
export function parsePriceLevel(priceLevel) {
  const priceLevelMap = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };
  return priceLevelMap[priceLevel] ?? null;
}
