import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VILLAGE_CENTER, VILLAGE_ZOOM, CATEGORY_COLORS, STATUS_COLORS } from '@/lib/constants';
import type { Complaint, WaterTank, GarbageBin } from '@/lib/types';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/types';

// Fix default marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface MapMarker {
  lat: number;
  lng: number;
  type: 'complaint' | 'water_tank' | 'garbage_bin';
  color?: string;
  popupHtml: string;
}

interface VillageMapProps {
  complaints?: Complaint[];
  waterTanks?: WaterTank[];
  garbageBins?: GarbageBin[];
  height?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectable?: boolean;
  selectedLocation?: { lat: number; lng: number } | null;
  centerOn?: { lat: number; lng: number } | null;
  showAll?: boolean;
}

function createColoredMarker(color: string, pulse = false): L.DivIcon {
  const size = pulse ? 18 : 14;
  return L.divIcon({
    className: '',
    html: `<div class="custom-marker ${pulse ? 'custom-marker-pulse' : ''}" style="width:${size}px;height:${size}px;background:${color}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function VillageMap({
  complaints = [],
  waterTanks = [],
  garbageBins = [],
  height = '400px',
  onLocationSelect,
  selectable = false,
  selectedLocation = null,
  centerOn = null,
  showAll = false,
}: VillageMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: VILLAGE_CENTER,
      zoom: VILLAGE_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle map click for location selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!selectable) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (clickMarkerRef.current) {
        clickMarkerRef.current.setLatLng([lat, lng]);
      } else {
        clickMarkerRef.current = L.marker([lat, lng], { icon: defaultIcon })
          .addTo(map)
          .bindPopup('Selected location')
          .openPopup();
      }
      onLocationSelect?.(lat, lng);
    };

    map.on('click', handleClick);
    map.getContainer().style.cursor = 'crosshair';

    return () => {
      map.off('click', handleClick);
      map.getContainer().style.cursor = '';
    };
  }, [selectable, onLocationSelect]);

  // Update selected location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectable) return;

    if (selectedLocation) {
      if (clickMarkerRef.current) {
        clickMarkerRef.current.setLatLng([selectedLocation.lat, selectedLocation.lng]);
      } else {
        clickMarkerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], { icon: defaultIcon })
          .addTo(map)
          .bindPopup('Selected location')
          .openPopup();
      }
      map.setView([selectedLocation.lat, selectedLocation.lng], 16);
    }
  }, [selectedLocation, selectable]);

  // Center on a specific location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !centerOn) return;
    map.setView([centerOn.lat, centerOn.lng], 17);
  }, [centerOn]);

  // Render markers
  useEffect(() => {
    const layer = markerLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    const markers: MapMarker[] = [];

    complaints.forEach((c) => {
      if (c.latitude && c.longitude) {
        const color = showAll ? CATEGORY_COLORS[c.category] : STATUS_COLORS[c.status];
        markers.push({
          lat: c.latitude,
          lng: c.longitude,
          type: 'complaint',
          color,
          popupHtml: `
            <div style="min-width:200px">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${escapeHtml(c.title)}</div>
              <div style="color:#64748b;font-size:12px;margin-bottom:6px">${CATEGORY_LABELS[c.category]} • ${STATUS_LABELS[c.status]}</div>
              <div style="font-size:12px;color:#475569">${escapeHtml(c.location_label || 'No location label')}</div>
            </div>
          `,
        });
      }
    });

    waterTanks.forEach((t) => {
      if (t.latitude && t.longitude) {
        const pct = t.capacity_liters > 0 ? (t.current_level_liters / t.capacity_liters) * 100 : 0;
        const color = pct <= 20 ? '#ef4444' : pct <= 40 ? '#f59e0b' : '#3b82f6';
        markers.push({
          lat: t.latitude,
          lng: t.longitude,
          type: 'water_tank',
          color,
          popupHtml: `
            <div style="min-width:180px">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${escapeHtml(t.name)}</div>
              <div style="color:#64748b;font-size:12px;margin-bottom:6px">Water Tank</div>
              <div style="font-size:12px;color:#475569">Level: ${pct.toFixed(0)}% (${t.current_level_liters}/${t.capacity_liters}L)</div>
            </div>
          `,
        });
      }
    });

    garbageBins.forEach((b) => {
      if (b.latitude && b.longitude) {
        const pct = b.capacity_liters > 0 ? (b.current_level_liters / b.capacity_liters) * 100 : 0;
        const color = pct >= 80 ? '#ef4444' : pct >= 60 ? '#f59e0b' : '#f97316';
        markers.push({
          lat: b.latitude,
          lng: b.longitude,
          type: 'garbage_bin',
          color,
          popupHtml: `
            <div style="min-width:180px">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${escapeHtml(b.name)}</div>
              <div style="color:#64748b;font-size:12px;margin-bottom:6px">Garbage Bin</div>
              <div style="font-size:12px;color:#475569">Fill: ${pct.toFixed(0)}% (${b.current_level_liters}/${b.capacity_liters}L)</div>
            </div>
          `,
        });
      }
    });

    markers.forEach((m) => {
      const pulse = m.type === 'complaint';
      L.marker([m.lat, m.lng], { icon: createColoredMarker(m.color || '#3b82f6', pulse) })
        .addTo(layer)
        .bindPopup(m.popupHtml);
    });
  }, [complaints, waterTanks, garbageBins, showAll]);

  return <div ref={containerRef} style={{ height, width: '100%' }} className="z-0" />;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
