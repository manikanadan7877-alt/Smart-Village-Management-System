import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWaterTanks, createWaterTank, updateWaterTank, deleteWaterTank } from '@/lib/api';
import { ProgressBar, getWaterLevelColor } from '@/components/ProgressBar';
import { Modal } from '@/components/Modal';
import { VillageMap } from '@/components/VillageMap';
import type { WaterTank } from '@/lib/types';
import { VILLAGE_CENTER } from '@/lib/constants';
import { Droplets, Plus, Edit3, Trash2, AlertTriangle, Loader2, MapPin } from 'lucide-react';

export function WaterTanksPage() {
  const { profile } = useAuth();
  const [tanks, setTanks] = useState<WaterTank[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WaterTank | null>(null);
  const [form, setForm] = useState({
    name: '', location_label: '', latitude: VILLAGE_CENTER[0], longitude: VILLAGE_CENTER[1],
    capacity_liters: 10000, current_level_liters: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await fetchWaterTanks();
      setTanks(data);
    } catch (err) {
      console.error('Water tanks load error:', err);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({
      name: '', location_label: '', latitude: VILLAGE_CENTER[0], longitude: VILLAGE_CENTER[1],
      capacity_liters: 10000, current_level_liters: 0,
    });
    setModalOpen(true);
  }

  function openEdit(tank: WaterTank) {
    setEditing(tank);
    setForm({
      name: tank.name,
      location_label: tank.location_label,
      latitude: tank.latitude ?? VILLAGE_CENTER[0],
      longitude: tank.longitude ?? VILLAGE_CENTER[1],
      capacity_liters: tank.capacity_liters,
      current_level_liters: tank.current_level_liters,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateWaterTank(editing.id, form);
      } else {
        await createWaterTank(form);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this water tank?')) return;
    try {
      await deleteWaterTank(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  async function quickUpdateLevel(tank: WaterTank, delta: number) {
    const newLevel = Math.max(0, Math.min(tank.capacity_liters, tank.current_level_liters + delta));
    try {
      await updateWaterTank(tank.id, { current_level_liters: newLevel });
      await load();
    } catch (err) {
      console.error('Quick update error:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Water Tanks</h1>
          <p className="text-sm text-slate-500">Monitor and manage village water supply</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="btn-primary">
            <Plus size={18} /> Add Water Tank
          </button>
        )}
      </div>

      {tanks.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16">
          <Droplets size={48} className="mb-3 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700">No water tanks registered</h3>
          <p className="mt-1 text-sm text-slate-400">
            {isAdmin ? 'Add a water tank to start monitoring' : 'Water tank data will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tanks.map((tank) => {
            const pct = tank.capacity_liters > 0 ? (tank.current_level_liters / tank.capacity_liters) * 100 : 0;
            const color = getWaterLevelColor(pct);
            const isLow = pct <= 20;
            return (
              <div key={tank.id} className="card p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
                      <Droplets size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{tank.name}</h3>
                      {tank.location_label && (
                        <p className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={11} /> {tank.location_label}
                        </p>
                      )}
                    </div>
                  </div>
                  {isLow && (
                    <span className="badge bg-red-50 text-red-600">
                      <AlertTriangle size={12} /> Low
                    </span>
                  )}
                </div>

                <div className="mb-2 flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{pct.toFixed(0)}<span className="text-lg">%</span></p>
                    <p className="text-xs text-slate-500">
                      {tank.current_level_liters.toLocaleString()} / {tank.capacity_liters.toLocaleString()} liters
                    </p>
                  </div>
                </div>

                <ProgressBar value={tank.current_level_liters} max={tank.capacity_liters} color={color} height="h-3" />

                {isAdmin && (
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => quickUpdateLevel(tank, -500)}
                      className="flex-1 rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      -500L
                    </button>
                    <button
                      onClick={() => quickUpdateLevel(tank, 500)}
                      className="flex-1 rounded-lg bg-blue-100 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors"
                    >
                      +500L
                    </button>
                    <button onClick={() => openEdit(tank)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDelete(tank.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Water Tank' : 'Add Water Tank'} size="lg">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Tank Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., North Colony Tank"
                className="input"
              />
            </div>
            <div>
              <label className="label">Location Label</label>
              <input
                type="text"
                value={form.location_label}
                onChange={(e) => setForm({ ...form, location_label: e.target.value })}
                placeholder="e.g., Near the market"
                className="input"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Capacity (liters)</label>
              <input
                type="number"
                value={form.capacity_liters}
                onChange={(e) => setForm({ ...form, capacity_liters: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Current Level (liters)</label>
              <input
                type="number"
                value={form.current_level_liters}
                onChange={(e) => setForm({ ...form, current_level_liters: Number(e.target.value) })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Click map to set location</label>
            <VillageMap
              selectable
              selectedLocation={{ lat: form.latitude, lng: form.longitude }}
              onLocationSelect={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })}
              height="250px"
            />
          </div>
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {editing ? 'Save Changes' : 'Add Tank'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
