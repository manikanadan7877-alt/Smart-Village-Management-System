import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { fetchGarbageBins, createGarbageBin, updateGarbageBin, deleteGarbageBin } from '@/lib/api';
import { ProgressBar, getFillLevelColor } from '@/components/ProgressBar';
import { Modal } from '@/components/Modal';
import { VillageMap } from '@/components/VillageMap';
import type { GarbageBin } from '@/lib/types';
import { VILLAGE_CENTER } from '@/lib/constants';
import { Trash2, Plus, CreditCard as Edit3, AlertTriangle, Loader2, MapPin, CheckCircle } from 'lucide-react';

export function GarbageBinsPage() {
  const { profile } = useAuth();
  const { t } = useI18n();
  const [bins, setBins] = useState<GarbageBin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GarbageBin | null>(null);
  const [form, setForm] = useState({
    name: '', location_label: '', latitude: VILLAGE_CENTER[0], longitude: VILLAGE_CENTER[1],
    capacity_liters: 500, current_level_liters: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await fetchGarbageBins();
      setBins(data);
    } catch (err) {
      console.error('Garbage bins load error:', err);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({
      name: '', location_label: '', latitude: VILLAGE_CENTER[0], longitude: VILLAGE_CENTER[1],
      capacity_liters: 500, current_level_liters: 0,
    });
    setModalOpen(true);
  }

  function openEdit(bin: GarbageBin) {
    setEditing(bin);
    setForm({
      name: bin.name,
      location_label: bin.location_label,
      latitude: bin.latitude ?? VILLAGE_CENTER[0],
      longitude: bin.longitude ?? VILLAGE_CENTER[1],
      capacity_liters: bin.capacity_liters,
      current_level_liters: bin.current_level_liters,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateGarbageBin(editing.id, form);
        setToast(t('common.updatedSuccessfully'));
      } else {
        await createGarbageBin(form);
      }
      setModalOpen(false);
      await load();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.failedToSave'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('common.confirmDelete'))) return;
    try {
      await deleteGarbageBin(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.failedToSave'));
    }
  }

  async function markCollected(bin: GarbageBin) {
    try {
      await updateGarbageBin(bin.id, { current_level_liters: 0 });
      await load();
      setToast(t('common.updatedSuccessfully'));
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Mark collected error:', err);
    }
  }

  async function quickUpdateLevel(bin: GarbageBin, delta: number) {
    const newLevel = Math.max(0, Math.min(bin.capacity_liters, bin.current_level_liters + delta));
    try {
      await updateGarbageBin(bin.id, { current_level_liters: newLevel });
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
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-lg ring-1 ring-green-200">
          <CheckCircle size={18} /> {toast}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('waste.title')}</h1>
          <p className="text-sm text-slate-500">{t('waste.subtitle')}</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="btn-primary">
            <Plus size={18} /> {t('waste.addBin')}
          </button>
        )}
      </div>

      {bins.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16">
          <Trash2 size={48} className="mb-3 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700">{t('waste.noBins')}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {isAdmin ? t('waste.addStart') : t('waste.dataAppear')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bins.map((bin) => {
            const pct = bin.capacity_liters > 0 ? (bin.current_level_liters / bin.capacity_liters) * 100 : 0;
            const color = getFillLevelColor(pct);
            const isFull = pct >= 80;
            return (
              <div key={bin.id} className="card p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
                      <Trash2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{bin.name}</h3>
                      {bin.location_label && (
                        <p className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={11} /> {bin.location_label}
                        </p>
                      )}
                    </div>
                  </div>
                  {isFull ? (
                    <span className="badge bg-red-50 text-red-600">
                      <AlertTriangle size={12} /> {t('waste.full')}
                    </span>
                  ) : pct >= 60 ? (
                    <span className="badge bg-amber-50 text-amber-600">
                      <AlertTriangle size={12} /> {t('waste.filling')}
                    </span>
                  ) : (
                    <span className="badge bg-green-50 text-green-600">
                      <CheckCircle size={12} /> {t('waste.ok')}
                    </span>
                  )}
                </div>

                <div className="mb-2">
                  <p className="text-3xl font-bold text-slate-900">{pct.toFixed(0)}<span className="text-lg">%</span></p>
                  <p className="text-xs text-slate-500">
                    {bin.current_level_liters} / {bin.capacity_liters} {t('water.liters')}
                  </p>
                </div>

                <ProgressBar value={bin.current_level_liters} max={bin.capacity_liters} color={color} height="h-3" />

                {isAdmin && (
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => quickUpdateLevel(bin, -50)}
                      className="flex-1 rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      -50L
                    </button>
                    <button
                      onClick={() => quickUpdateLevel(bin, 50)}
                      className="flex-1 rounded-lg bg-orange-100 py-2 text-sm font-medium text-orange-700 hover:bg-orange-200 transition-colors"
                    >
                      +50L
                    </button>
                    {pct > 0 && (
                      <button
                        onClick={() => markCollected(bin)}
                        className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-200 transition-colors"
                        title="Mark as collected"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button onClick={() => openEdit(bin)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDelete(bin.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('waste.editBin') : t('waste.addBin')} size="lg">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t('waste.binName')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Main Street Bin 1"
                className="input"
              />
            </div>
            <div>
              <label className="label">{t('water.locationLabel')}</label>
              <input
                type="text"
                value={form.location_label}
                onChange={(e) => setForm({ ...form, location_label: e.target.value })}
                placeholder="e.g., Near the park"
                className="input"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t('water.capacity')}</label>
              <input
                type="number"
                value={form.capacity_liters}
                onChange={(e) => setForm({ ...form, capacity_liters: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="label">{t('waste.currentFill')}</label>
              <input
                type="number"
                value={form.current_level_liters}
                onChange={(e) => setForm({ ...form, current_level_liters: Number(e.target.value) })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">{t('water.clickMap')}</label>
            <VillageMap
              selectable
              selectedLocation={{ lat: form.latitude, lng: form.longitude }}
              onLocationSelect={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })}
              height="250px"
            />
          </div>
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">{t('common.cancel')}</button>
            <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {editing ? t('common.saveChanges') : t('waste.addBin')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
