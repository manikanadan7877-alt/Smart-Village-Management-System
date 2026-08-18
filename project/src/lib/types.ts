export type UserRole = 'citizen' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export type ComplaintCategory =
  | 'road_damage'
  | 'garbage_overflow'
  | 'water_leakage'
  | 'street_light'
  | 'drainage'
  | 'other';

export type ComplaintPriority = 'high' | 'medium' | 'low';
export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export interface Complaint {
  id: string;
  user_id: string;
  title: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  description: string;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  location_label: string;
  status: ComplaintStatus;
  ai_category: string | null;
  ai_confidence: number | null;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface WaterTank {
  id: string;
  name: string;
  location_label: string;
  latitude: number | null;
  longitude: number | null;
  capacity_liters: number;
  current_level_liters: number;
  created_at: string;
  updated_at: string;
}

export interface GarbageBin {
  id: string;
  name: string;
  location_label: string;
  latitude: number | null;
  longitude: number | null;
  capacity_liters: number;
  current_level_liters: number;
  created_at: string;
  updated_at: string;
}

export interface ClassificationResult {
  category: ComplaintCategory;
  confidence: number;
  priority: ComplaintPriority;
}

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  road_damage: 'Road Damage',
  garbage_overflow: 'Garbage Overflow',
  water_leakage: 'Water Leakage',
  street_light: 'Street Light Failure',
  drainage: 'Drainage Problem',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<ComplaintCategory, string> = {
  road_damage: 'Construction',
  garbage_overflow: 'Trash2',
  water_leakage: 'Droplets',
  street_light: 'Lightbulb',
  drainage: 'Waves',
  other: 'AlertCircle',
};

export const PRIORITY_LABELS: Record<ComplaintPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

export const CATEGORY_OPTIONS: { value: ComplaintCategory; label: string }[] = [
  { value: 'road_damage', label: 'Road Damage' },
  { value: 'garbage_overflow', label: 'Garbage Overflow' },
  { value: 'water_leakage', label: 'Water Leakage' },
  { value: 'street_light', label: 'Street Light Failure' },
  { value: 'drainage', label: 'Drainage Problem' },
  { value: 'other', label: 'Other' },
];
