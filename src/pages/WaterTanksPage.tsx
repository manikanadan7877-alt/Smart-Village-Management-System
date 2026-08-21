import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { WaterTank } from '@/lib/types';
import { Droplets, Loader2, Plus } from 'lucide-react';

export function WaterTanksPage() {
  const [tanks, setTanks] = useState<WaterTank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('water_tanks').select('*').order('created_at', { ascending: false });
      setTanks((data as WaterTank[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Water Tanks</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor water tank levels across the village</p>
        </div>
        <button className="btn-primary"><Plus size={18} /> Add Tank</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={24} />
        </div>
      ) : tanks.length === 0 ? (
        <div className="card text-center">
          <Droplets size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No water tanks registered yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tanks.map((tank) => {
            const pct = tank.capacity_liters > 0 ? (tank.current_level_liters / tank.capacity_liters) * 100 : 0;
            return (
              <div key={tank.id} className="card">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <Droplets size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{tank.name}</p>
                    <p className="text-xs text-slate-500">{tank.location_label}</p>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-cyan-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {tank.current_level_liters.toLocaleString()} / {tank.capacity_liters.toLocaleString()} liters
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
