import { supabase } from '@/lib/supabase';
import type {
  Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus,
  WaterTank, GarbageBin, ClassificationResult, Profile,
} from '@/lib/types';

// ---- Complaints ----

export async function fetchComplaints(): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Complaint[];
}

export async function fetchComplaint(id: string): Promise<Complaint | null> {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Complaint | null;
}

export async function fetchMyComplaints(userId: string): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Complaint[];
}

export async function createComplaint(input: {
  title: string;
  category: ComplaintCategory;
  description: string;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  location_label: string;
  priority: ComplaintPriority;
  ai_category: string | null;
  ai_confidence: number | null;
}): Promise<Complaint> {
  const { data, error } = await supabase
    .from('complaints')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Complaint;
}

export async function updateComplaint(
  id: string,
  updates: Partial<Pick<Complaint, 'status' | 'priority' | 'admin_notes' | 'category'>>
): Promise<void> {
  const { error } = await supabase
    .from('complaints')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

// ---- Image upload ----

export async function uploadComplaintImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('complaints')
    .upload(fileName, file, { contentType: file.type });
  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('complaints')
    .getPublicUrl(fileName);
  return urlData.publicUrl;
}

// ---- AI Classification ----

export async function classifyComplaint(filename: string, category?: string): Promise<ClassificationResult> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/classify-complaint`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ filename, category }),
  });
  if (!response.ok) {
    throw new Error(`Classification failed (${response.status})`);
  }
  const data = await response.json();
  if (!data || !data.category) {
    throw new Error('Invalid classification response');
  }
  return data as ClassificationResult;
}

// ---- Water Tanks ----

export async function fetchWaterTanks(): Promise<WaterTank[]> {
  const { data, error } = await supabase
    .from('water_tanks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as WaterTank[];
}

export async function createWaterTank(input: {
  name: string;
  location_label: string;
  latitude: number;
  longitude: number;
  capacity_liters: number;
  current_level_liters: number;
}): Promise<void> {
  const { error } = await supabase.from('water_tanks').insert(input);
  if (error) throw error;
}

export async function updateWaterTank(id: string, updates: Partial<WaterTank>): Promise<void> {
  const { error } = await supabase.from('water_tanks').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteWaterTank(id: string): Promise<void> {
  const { error } = await supabase.from('water_tanks').delete().eq('id', id);
  if (error) throw error;
}

// ---- Garbage Bins ----

export async function fetchGarbageBins(): Promise<GarbageBin[]> {
  const { data, error } = await supabase
    .from('garbage_bins')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as GarbageBin[];
}

export async function createGarbageBin(input: {
  name: string;
  location_label: string;
  latitude: number;
  longitude: number;
  capacity_liters: number;
  current_level_liters: number;
}): Promise<void> {
  const { error } = await supabase.from('garbage_bins').insert(input);
  if (error) throw error;
}

export async function updateGarbageBin(id: string, updates: Partial<GarbageBin>): Promise<void> {
  const { error } = await supabase.from('garbage_bins').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteGarbageBin(id: string): Promise<void> {
  const { error } = await supabase.from('garbage_bins').delete().eq('id', id);
  if (error) throw error;
}

// ---- Profile ----

export async function updateProfile(id: string, updates: Partial<Pick<Profile, 'full_name' | 'phone'>>): Promise<void> {
  const { error } = await supabase.from('profiles').update(updates).eq('id', id);
  if (error) throw error;
}

// ---- Analytics helper ----

export interface ComplaintStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
  high: number;
  medium: number;
  low: number;
  byCategory: { category: string; count: number }[];
  byStatus: { status: ComplaintStatus; count: number }[];
  recentTrend: { date: string; count: number }[];
}

export function computeStats(complaints: Complaint[]): ComplaintStats {
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'pending').length;
  const in_progress = complaints.filter((c) => c.status === 'in_progress').length;
  const resolved = complaints.filter((c) => c.status === 'resolved').length;
  const rejected = complaints.filter((c) => c.status === 'rejected').length;
  const high = complaints.filter((c) => c.priority === 'high').length;
  const medium = complaints.filter((c) => c.priority === 'medium').length;
  const low = complaints.filter((c) => c.priority === 'low').length;

  const categoryMap = new Map<string, number>();
  complaints.forEach((c) => {
    categoryMap.set(c.category, (categoryMap.get(c.category) ?? 0) + 1);
  });
  const byCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));

  const byStatus: { status: ComplaintStatus; count: number }[] = [
    { status: 'pending', count: pending },
    { status: 'in_progress', count: in_progress },
    { status: 'resolved', count: resolved },
    { status: 'rejected', count: rejected },
  ];

  // Recent trend: last 7 days
  const trendMap = new Map<string, number>();
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    trendMap.set(key, 0);
  }
  complaints.forEach((c) => {
    const key = c.created_at.slice(0, 10);
    if (trendMap.has(key)) {
      trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
    }
  });
  const recentTrend = Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }));

  return { total, pending, in_progress, resolved, rejected, high, medium, low, byCategory, byStatus, recentTrend };
}
