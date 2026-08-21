import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { GarbageBin } from '@/lib/types';
import { Trash2, Loader2, Plus } from 'lucide-react';

export function GarbageBinsPage() {
  const [bins, setBins] = useState<GarbageBin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('garbage_bins').select('*').order('created_at', { ascending: false });
      setBins((data as GarbageBin[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Garbage Bins</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor garbage bin fill levels</p>
        </div>
        <button className="btn-primary"><Plus size={18} /> Add Bin</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={24} />
        </div>
      ) : bins.length === 0 ? (
        <div className="card text-center">
          <Trash2 size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No garbage bins registered yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bins.map((bin) => {
            const pct = bin.capacity_liters > 0 ? (bin.current_level_liters / bin.capacity_liters) * 100 : 0;
            return (
              <div key={bin.id} className="card">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{bin.name}</p>
                    <p className="text-xs text-slate-500">{bin.location_label}</p>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${pct > 80 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {bin.current_level_liters} / {bin.capacity_liters} liters
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
