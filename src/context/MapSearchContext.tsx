import { createContext, useContext, useState, type ReactNode } from 'react';
import type { SearchResult } from '@/lib/village-types';

interface MapSearchContextType {
  mapCenter: { lat: number; lng: number; name: string } | null;
  setMapCenter: (center: { lat: number; lng: number; name: string } | null) => void;
}

const MapSearchContext = createContext<MapSearchContextType | undefined>(undefined);

export function MapSearchProvider({ children }: { children: ReactNode }) {
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; name: string } | null>(null);
  return (
    <MapSearchContext.Provider value={{ mapCenter, setMapCenter }}>
      {children}
    </MapSearchContext.Provider>
  );
}

export function useMapSearch() {
  const ctx = useContext(MapSearchContext);
  if (!ctx) throw new Error('useMapSearch must be used inside MapSearchProvider');
  return ctx;
}
