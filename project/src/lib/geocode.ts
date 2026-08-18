import type { SearchResult } from './village-types';

export async function searchLocations(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=5&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    });
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any): SearchResult => {
      const addr = item.address || {};
      return {
        displayName: item.display_name || item.name,
        name: addr.town || addr.village || addr.city || addr.county || item.name || 'Unknown',
        district: addr.county || addr.state_district || '',
        state: addr.state || '',
        country: addr.country || '',
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      };
    });
  } catch {
    throw new Error('Unable to search location right now. Please try again.');
  }
}
