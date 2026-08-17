import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComplaints, fetchWaterTanks, fetchGarbageBins } from '@/lib/api';
import { VillageMap } from '@/components/VillageMap';
import { CategoryBadge, StatusBadge } from '@/components/Badges';
import type { Complaint, WaterTank, GarbageBin } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/types';
import { useI18n } from '@/context/I18nContext';
import { MapPin, Droplets, Trash2, ClipboardList, Filter, ArrowRight } from 'lucide-react';

type LayerType = 'all' | 'complaints' | 'water_tanks' | 'garbage_bins';

export function MapPage() {
  const { t, village } = useI18n();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [waterTanks, setWaterTanks] = useState<WaterTank[]>([]);
  const [garbageBins, setGarbageBins] = useState<GarbageBin[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState<LayerType>('all');

  useEffect(() => {
    async function load() {
      try {
        const [c, t, b] = await Promise.all([
          fetchComplaints(),
          fetchWaterTanks(),
          fetchGarbageBins(),
        ]);
        setComplaints(c);
        setWaterTanks(t);
        setGarbageBins(b);
      } catch (err) {
        console.error('Map load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const showComplaints = activeLayer === 'all' || activeLayer === 'complaints';
  const showWaterTanks = activeLayer === 'all' || activeLayer === 'water_tanks';
  const showGarbageBins = activeLayer === 'all' || activeLayer === 'garbage_bins';

  const layerComplaints = showComplaints ? complaints : [];
  const layerWaterTanks = showWaterTanks ? waterTanks : [];
  const layerGarbageBins = showGarbageBins ? garbageBins : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Village Map</h1>
        <p className="text-sm text-slate-500">Digital twin view of village infrastructure and complaints</p>
      </div>

      {/* Layer toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500 mr-2">
          <Filter size={16} /> Layers:
        </span>
        <LayerToggle
          active={activeLayer === 'all'}
          onClick={() => setActiveLayer('all')}
          icon={MapPin}
          label="All"
          color="#3b82f6"
        />
        <LayerToggle
          active={activeLayer === 'complaints'}
          onClick={() => setActiveLayer('complaints')}
          icon={ClipboardList}
          label={`Complaints (${complaints.length})`}
          color="#ef4444"
        />
        <LayerToggle
          active={activeLayer === 'water_tanks'}
          onClick={() => setActiveLayer('water_tanks')}
          icon={Droplets}
          label={`Water Tanks (${waterTanks.length})`}
          color="#3b82f6"
        />
        <LayerToggle
          active={activeLayer === 'garbage_bins'}
          onClick={() => setActiveLayer('garbage_bins')}
          icon={Trash2}
          label={`Garbage Bins (${garbageBins.length})`}
          color="#f97316"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map */}
        <div className="card overflow-hidden lg:col-span-2">
          <VillageMap
            complaints={layerComplaints}
            waterTanks={layerWaterTanks}
            garbageBins={layerGarbageBins}
            height="600px"
            showAll
            centerOn={village ? { lat: village.latitude, lng: village.longitude } : null}
          />
        </div>

        {/* Side panel - legend & list */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="card p-5">
            <h3 className="mb-3 font-bold text-slate-900">Map Legend</h3>
            <div className="space-y-2 text-sm">
              {showComplaints && (
                <>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Complaints</p>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                    const colors: Record<string, string> = {
                      road_damage: '#ef4444', garbage_overflow: '#f97316', water_leakage: '#3b82f6',
                      street_light: '#eab308', drainage: '#06b6d4', other: '#64748b',
                    };
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[key] }} />
                        <span className="text-slate-600">{label}</span>
                      </div>
                    );
                  })}
                </>
              )}
              {showWaterTanks && (
                <>
                  <p className="mt-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Water Tanks</p>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-slate-600">Water Tank Location</span>
                  </div>
                </>
              )}
              {showGarbageBins && (
                <>
                  <p className="mt-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Garbage Bins</p>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                    <span className="text-slate-600">Garbage Bin Location</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick list */}
          {showComplaints && layerComplaints.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-3 font-bold text-slate-900">Recent Complaints</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {layerComplaints.slice(0, 8).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/complaints/${c.id}`)}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-100 p-2.5 text-left transition-all hover:border-slate-200 hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700">{c.title}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <CategoryBadge category={c.category} showIcon={false} />
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                    <ArrowRight size={14} className="ml-2 flex-shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LayerToggle({ active, onClick, icon: Icon, label, color }: {
  active: boolean;
  onClick: () => void;
  icon: typeof MapPin;
  label: string;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-slate-900 text-white shadow-sm'
          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
      }`}
    >
      <Icon size={16} style={{ color: active ? color : undefined }} />
      {label}
    </button>
  );
}
