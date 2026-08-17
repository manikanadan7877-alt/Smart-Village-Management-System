// Default village center coordinates (Chennai area as a representative village location)
export const VILLAGE_CENTER: [number, number] = [13.0860, 80.2750];
export const VILLAGE_ZOOM = 15;

export const CATEGORY_COLORS: Record<string, string> = {
  road_damage: '#ef4444',
  garbage_overflow: '#f97316',
  water_leakage: '#3b82f6',
  street_light: '#eab308',
  drainage: '#06b6d4',
  other: '#64748b',
};

export const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  resolved: '#10b981',
  rejected: '#64748b',
};
