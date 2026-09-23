/**
 * City → coordinates via OpenStreetMap Nominatim (free, no key).
 * Results are cached in-memory for the server lifetime.
 * Swap `geocode()` internals for Google Geocoding API when a key exists.
 */

export type LatLng = { lat: number; lng: number; label: string };

const cache = new Map<string, LatLng>();

// Sensible fallback: center of India.
const FALLBACK: LatLng = { lat: 21.1, lng: 78.0, label: "India" };

export async function geocode(query: string): Promise<LatLng> {
  const key = query.trim().toLowerCase();
  if (!key) return FALLBACK;
  const hit = cache.get(key);
  if (hit) return hit;

  try {
    const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      q: query,
      format: "jsonv2",
      limit: "1",
      countrycodes: "in",
    })}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SERVEX-Marketplace/1.0 (contact: support@servex.local)",
        Accept: "application/json",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`geocode ${res.status}`);
    const rows = (await res.json()) as { lat: string; lon: string; display_name: string }[];
    if (rows.length > 0) {
      const result: LatLng = {
        lat: Number(rows[0].lat),
        lng: Number(rows[0].lon),
        label: rows[0].display_name.split(",").slice(0, 3).join(","),
      };
      cache.set(key, result);
      return result;
    }
  } catch (err) {
    console.warn("[geocode] failed for", query, err instanceof Error ? err.message : err);
  }
  cache.set(key, FALLBACK);
  return FALLBACK;
}
