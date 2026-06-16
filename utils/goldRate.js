// utils/goldRate.js
let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchGoldRates() {
  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_MS) return _cache;

  try {
    const res = await fetch("/api/gold-rate");
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.error) throw new Error();
    _cache = data;
    _cacheTime = now;
    return data;
  } catch {
    return null; // caller handles null gracefully
  }
}

/**
 * Get price per gram for a given rati value.
 * rati: 10 | 14 | 18 | 21 | 22 | 24
 */
export function rateForRati(rates, rati) {
  if (!rates) return null;
  const map = {
    24: rates.price_gram_24k,
    22: rates.price_gram_22k,
    21: rates.price_gram_21k,
    18: rates.price_gram_18k,
    14: rates.price_gram_14k,
    10: rates.price_gram_10k,
  };
  // For rati values not directly in the map, interpolate via purity
  return map[rati] ?? rates.price_gram_24k * (rati / 24);
}
