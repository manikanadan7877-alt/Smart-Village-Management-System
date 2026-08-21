import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Complaint } from '@/lib/types';
import { MapPin, Loader2 } from 'lucide-react';

export function MapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('complaints')
        .select('*')
        .not('latitude', 'is', null);
      setComplaints((data as Complaint[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Digital Twin Map</h1>
        <p className="mt-1 text-sm text-slate-500">View reported issues and village infrastructure</p>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={24} />
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center">
            <MapPin size={32} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No mapped complaints yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <MapPin size={18} className="text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.title}</p>
                  <p className="text-xs text-slate-500">{c.location_label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
