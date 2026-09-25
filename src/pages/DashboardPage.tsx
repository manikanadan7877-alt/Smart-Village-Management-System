import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useMapSearch } from '@/context/MapSearchContext';
import { fetchComplaints, fetchWaterTanks, fetchGarbageBins } from '@/lib/api';
import { VillageMap } from '@/components/VillageMap';
import { AIAssistant } from '@/components/AIAssistant';
import type { Complaint, WaterTank, GarbageBin } from '@/lib/types';
import {
  Users, Droplets, Zap, Sprout, Cloud,
  AlertTriangle, Plus, Send, ClipboardList, FileText, Bot,
  Activity, MapPin, Lightbulb, Radio, CloudRain, Wind,
  Layers, Eye, Sparkles,
} from 'lucide-react';

export function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { mapCenter } = useMapSearch();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [waterTanks, setWaterTanks] = useState<WaterTank[]>([]);
  const [garbageBins, setGarbageBins] = useState<GarbageBin[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState<'2d' | '3d'>('2d');
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [c, wt, gb] = await Promise.all([
          fetchComplaints(),
          fetchWaterTanks(),
          fetchGarbageBins(),
        ]);
        setComplaints(c);
        setWaterTanks(wt);
        setGarbageBins(gb);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isAdmin = profile?.role === 'admin';
  const pendingCount = complaints.filter((c) => c.status === 'pending').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;
  const totalComplaints = complaints.length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;

  const avgWaterPct = waterTanks.length > 0
    ? Math.round(waterTanks.reduce((sum, wt) => sum + (wt.capacity_liters > 0 ? (wt.current_level_liters / wt.capacity_liters) * 100 : 0), 0) / waterTanks.length)
    : 0;
  const lowWaterTanks = waterTanks.filter((wt) => {
    const pct = wt.capacity_liters > 0 ? (wt.current_level_liters / wt.capacity_liters) * 100 : 0;
    return pct <= 30;
  });

  const fullBins = garbageBins.filter((b) => {
    const pct = b.capacity_liters > 0 ? (b.current_level_liters / b.capacity_liters) * 100 : 0;
    return pct >= 80;
  });

  const villageHealthScore = Math.round(
    (avgWaterPct * 0.25) +
    (resolutionRate * 0.25) +
    (Math.max(0, 100 - fullBins.length * 15) * 0.25) +
    (Math.max(0, 100 - lowWaterTanks.length * 15) * 0.25)
  );
  void villageHealthScore;

  // Build alerts from real data
  interface AlertItem {
    type: 'water' | 'waste' | 'complaint' | 'weather';
    title: string;
    subtitle: string;
    severity: 'high' | 'medium' | 'low';
    route: string;
  }
  const alerts: AlertItem[] = [];
  lowWaterTanks.forEach((wt) => {
    const pct = (wt.current_level_liters / wt.capacity_liters) * 100;
    alerts.push({
      type: 'water', title: `${t('dash.waterShortage')}: ${wt.name}`, subtitle: `${pct.toFixed(0)}%`,
      severity: 'high', route: '/water-tanks',
    });
  });
  fullBins.forEach((b) => {
    const pct = (b.current_level_liters / b.capacity_liters) * 100;
    alerts.push({
      type: 'waste', title: `${t('waste.full')}: ${b.name}`, subtitle: `${pct.toFixed(0)}%`,
      severity: 'high', route: '/garbage-bins',
    });
  });
  complaints.filter((c) => c.priority === 'high' && c.status !== 'resolved').slice(0, 2).forEach((c) => {
    alerts.push({
      type: 'complaint', title: c.title, subtitle: c.location_label,
      severity: 'high', route: `/complaints/${c.id}`,
    });
  });
  if (alerts.length < 3) {
    alerts.push({
      type: 'weather', title: '28°C', subtitle: t('dash.partlyCloudy'),
      severity: 'low', route: '/dashboard',
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400/30 border-t-green-400" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Admin';

  return (
    <div className="-m-4 min-h-[calc(100vh-4rem)] rounded-tl-2xl bg-[#e8eef5] p-4 lg:p-6 space-y-5">
      {/* Welcome section */}
      <div className="cmd-fade-up" style={{ animationDelay: '0s' }}>
        <h1 className="text-2xl font-bold text-white">
          {t('dash.welcome')}, {firstName}!
        </h1>
        <p className="text-sm text-slate-400 mt-1">{t('dash.overview')}</p>
      </div>

      {/* Top status cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 cmd-fade-up" style={{ animationDelay: '0.05s' }}>
        <StatusCard label={t('dash.population')} value="1,248" icon={Users} color="#3b82f6" subtitle={t('dash.registered')} onClick={() => navigate('/dashboard')} />
        <StatusCard
          label={t('dash.waterStatus')}
          value={avgWaterPct >= 60 ? t('dash.good') : avgWaterPct >= 30 ? t('dash.fair') : t('dash.needsAttention')}
          icon={Droplets}
          color={avgWaterPct >= 60 ? '#22c55e' : avgWaterPct >= 30 ? '#f59e0b' : '#ef4444'}
          subtitle={`${waterTanks.length} ${t('dash.tanks')} • ${avgWaterPct}%`}
          onClick={() => navigate('/water-tanks')}
        />
        <StatusCard label={t('dash.energyStatus')} value={t('dash.normal')} icon={Zap} color="#eab308" subtitle={t('dash.consumption')} onClick={() => navigate('/dashboard')} />
        <StatusCard label={t('dash.agriStatus')} value={t('dash.good')} icon={Sprout} color="#22c55e" subtitle={t('dash.cropsHealthy')} onClick={() => navigate('/agriculture')} />
        <StatusCard
          label="Complaints"
          value={`${pendingCount} pending`}
          icon={ClipboardList}
          color={pendingCount > 0 ? '#f59e0b' : '#22c55e'}
          subtitle={`${resolvedCount} resolved`}
          onClick={() => navigate('/complaints')}
        />
        <StatusCard label={t('dash.weather')} value="28°C" icon={Cloud} color="#06b6d4" subtitle={t('dash.partlyCloudy')} onClick={() => navigate('/dashboard')} />
      </div>

      {/* Main map + side panels */}
      <div className="grid gap-4 xl:grid-cols-[1fr_320px] cmd-fade-up" style={{ animationDelay: '0.1s' }}>
        {/* Hero map */}
        <div className="cmd-glass overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-green-400" />
              <h3 className="font-bold text-white">{t('dash.digitalTwin')}</h3>
              <span className="rounded bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">{t('dash.live')}</span>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-white/[0.04] p-0.5">
              <button
                onClick={() => setMapMode('2d')}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-all ${mapMode === '2d' ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Layers size={13} /> {t('dash.2dMap')}
              </button>
              <button
                onClick={() => setMapMode('3d')}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-all ${mapMode === '3d' ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Eye size={13} /> {t('dash.3dTwin')}
              </button>
            </div>
          </div>
          <div className="relative" style={{ height: '440px' }}>
            <VillageMap
              complaints={complaints}
              waterTanks={waterTanks}
              garbageBins={garbageBins}
              height="440px"
              showAll
              centerOn={mapCenter ? { lat: mapCenter.lat, lng: mapCenter.lng } : null}
            />
            {mapMode === '3d' && (
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-[11px] text-slate-300 backdrop-blur-sm">
                3D view enabled
              </div>
            )}
            {/* Map legend */}
            <div className="pointer-events-none absolute top-3 right-3 cmd-glass px-3 py-2 text-[10px]">
              <div className="flex flex-col gap-1.5">
                <LegendDot color="#22c55e" label={t('dash.waterTanks')} />
                <LegendDot color="#f97316" label={t('nav.waste')} />
                <LegendDot color="#ef4444" label={t('nav.citizen')} />
              </div>
            </div>
          </div>
        </div>

        {/* Right side panels */}
        <div className="space-y-4">
          {/* Important Alerts */}
          <div className="cmd-glass p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400" />
                <h4 className="text-sm font-bold text-white">{t('dash.importantAlerts')}</h4>
              </div>
              <button
                onClick={() => navigate(isAdmin ? '/garbage-bins' : '/complaints')}
                className="text-[11px] font-medium text-green-400 hover:text-green-300"
              >
                {t('dash.viewAll')}
              </button>
            </div>
            <div className="cmd-scrollbar max-h-[180px] space-y-2 overflow-y-auto pr-1">
              {alerts.slice(0, 5).map((a, i) => (
                <button
                  key={i}
                  onClick={() => navigate(a.route)}
                  className="w-full rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5 text-left transition-colors hover:bg-white/[0.05]"
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${a.severity === 'high' ? 'bg-red-500' : a.severity === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-200">{a.title}</p>
                      <p className="truncate text-[10px] text-slate-500">{a.subtitle}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="cmd-glass p-4">
            <h4 className="mb-3 text-sm font-bold text-white">{t('dash.quickActions')}</h4>
            <div className="grid grid-cols-2 gap-2">
              <QuickBtn icon={Plus} label={t('dash.addAsset')} onClick={() => navigate('/water-tanks')} />
              <QuickBtn icon={Send} label={t('dash.sendAlert')} onClick={() => navigate('/complaints/new')} />
              <QuickBtn icon={ClipboardList} label={t('dash.newComplaint')} onClick={() => navigate('/complaints/new')} />
              <QuickBtn icon={Droplets} label={t('dash.waterRequest')} onClick={() => navigate('/water-tanks')} />
              <QuickBtn icon={FileText} label={t('dash.viewReports')} onClick={() => navigate('/reports')} />
              <QuickBtn icon={Bot} label={t('dash.aiAssistant')} onClick={() => setAiOpen(true)} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant modal */}
      {aiOpen && <AIAssistant onClose={() => setAiOpen(false)} />}
      <div className="grid gap-4 lg:grid-cols-3 cmd-fade-up" style={{ animationDelay: '0.15s' }}>
        {/* AI Prediction */}
        <div className="cmd-glass p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              <h4 className="text-sm font-bold text-white">{t('dash.aiPrediction')}</h4>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-[11px] font-medium text-green-400 hover:text-green-300"
            >
              {t('dash.viewAll')}
            </button>
          </div>
          <div className="space-y-2.5">
            <PredictionRow label={t('dash.waterShortage')} value={t('dash.lowRisk')} color="#22c55e" />
            <PredictionRow label={t('dash.cropYield')} value={t('dash.highYield')} color="#22c55e" />
            <PredictionRow label={t('dash.powerDemand')} value={t('dash.normal')} color="#3b82f6" />
            <PredictionRow label={t('dash.diseaseRisk')} value={t('dash.lowRisk')} color="#22c55e" />
          </div>
        </div>

        {/* At-a-glance — spans 2 cols */}
        <div className="cmd-glass p-4 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <Activity size={16} className="text-cyan-400" />
            <h4 className="text-sm font-bold text-white">{t('dash.atGlance')}</h4>
            <span className="ml-auto rounded bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">{t('dash.realTime')}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <GlanceCard icon={Droplets} label={t('dash.waterTanks')} value={waterTanks.length} color="#3b82f6" />
            <GlanceCard icon={Lightbulb} label={t('dash.streetLights')} value={48} color="#eab308" />
            <GlanceCard icon={Sprout} label={t('dash.activeFarms')} value={12} color="#22c55e" />
            <GlanceCard icon={Radio} label={t('dash.iotSensors')} value={34} color="#06b6d4" />
            <GlanceCard icon={CloudRain} label={t('dash.rainfall')} value="12mm" color="#3b82f6" />
            <GlanceCard icon={Wind} label={t('dash.airQuality')} value={t('dash.good')} color="#22c55e" />
          </div>
        </div>
      </div>

    </div>
  );
}

// --- Sub-components ---

function StatusCard({
  label, value, icon: Icon, color, subtitle, onClick,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="cmd-glass cmd-glass-hover group p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="mb-2 flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Icon size={16} />
        </div>
        <span className="text-[11px] font-medium text-slate-400">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      {subtitle && <p className="mt-0.5 text-[10px] text-slate-500 truncate">{subtitle}</p>}
    </button>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-slate-300">{label}</span>
    </div>
  );
}

function QuickBtn({ icon: Icon, label, onClick }: { icon: typeof Plus; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] py-3 text-center transition-all hover:border-white/10 hover:bg-white/[0.05]"
    >
      <Icon size={18} className="text-green-400" />
      <span className="text-[10px] font-medium text-slate-300">{label}</span>
    </button>
  );
}

function PredictionRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
      <span className="text-xs text-slate-300">{label}</span>
      <span className="text-xs font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}

function GlanceCard({ icon: Icon, label, value, color }: { icon: typeof Droplets; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-center transition-colors hover:bg-white/[0.04]">
      <Icon size={18} className="mx-auto mb-1.5" style={{ color }} />
      <p className="text-base font-bold text-white">{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
