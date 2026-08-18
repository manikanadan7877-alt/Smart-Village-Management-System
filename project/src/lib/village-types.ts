export type Language = 'en' | 'ta';

export interface VillageContext {
  name: string;
  district: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface SearchResult {
  displayName: string;
  name: string;
  district: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
}
