import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchComplaints, fetchWaterTanks, fetchGarbageBins } from '@/lib/api';
import { VillageMap } from '@/components/VillageMap';
import { AIAssistant } from '@/components/AIAssistant';
import type { Complaint, WaterTank, GarbageBin } from '@/lib/types';
import {
  Users, Droplets, Zap, Sprout, HeartPulse, Cloud,
  AlertTriangle, Plus, Send, ClipboardList, FileText, Bot,
  Activity, MapPin, Lightbulb, Radio, CloudRain, Wind,
  Layers, Eye, Sparkles,
} from 'lucide-react';

export function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [waterTanks, setWaterTanks] = useState<WaterTank[]>([]);
  const [garbageBins, setGarbageBins] = useState<GarbageBin[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState<'2d' | '3d'>('2d');
  const [aiOpen, setAiOpen] = useState(false);

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
    ? Math.round(waterTanks.reduce((sum, t) => sum + (t.capacity_liters > 0 ? (t.current_level_liters / t.capacity_liters) * 100 : 0), 0) / waterTanks.length)
    : 0;
  const lowWaterTanks = waterTanks.filter((t) => {
    const pct = t.capacity_liters > 0 ? (t.current_level_liters / t.capacity_liters) * 100 : 0;
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

  // Build alerts from real data
  interface AlertItem {
    type: 'water' | 'waste' | 'complaint' | 'weather';
    title: string;
    subtitle: string;
    severity: 'high' | 'medium' | 'low';
    route: string;
  }
  const alerts: AlertItem[] = [];
  lowWaterTanks.forEach((t) => {
    const pct = (t.current_level_liters / t.capacity_liters) * 100;
    alerts.push({
      type: 'water', title: `Water level low: ${t.name}`, subtitle: `${pct.toFixed(0)}% remaining`,
      severity: 'high', route: '/water-tanks',
    });
  });
  fullBins.forEach((b) => {
    const pct = (b.current_level_liters / b.capacity_liters) * 100;
    alerts.push({
      type: 'waste', title: `Waste bin almost full: ${b.name}`, subtitle: `${pct.toFixed(0)}% filled`,
      severity: 'high', route: '/garbage-bins',
    });
  });
  complaints.filter((c) => c.priority === 'high' && c.status !== 'resolved').slice(0, 2).forEach((c) => {
    alerts.push({
      type: 'complaint', title: c.title, subtitle: `High priority • ${c.location_label}`,
      severity: 'high', route: `/complaints/${c.id}`,
    });
  });
  if (alerts.length < 3) {
    alerts.push({
      type: 'weather', title: 'Temperature normal', subtitle: '28°C — within seasonal range',
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
    <div className="cmd-bg cmd-grid-pattern -m-4 min-h-[calc(100vh-4rem)] rounded-tl-2xl p-4 lg:p-6 space-y-5">
      {/* Welcome section */}
      <div className="cmd-fade-up" style={{ animationDelay: '0s' }}>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {firstName}!
        </h1>
        <p className="text-sm text-slate-400 mt-1">Here's the overview of your village today.</p>
      </div>

      {/* Top status cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 cmd-fade-up" style={{ animationDelay: '0.05s' }}>
        <StatusCard label="Population" value="1,248" icon={Users} color="#3b82f6" subtitle="Registered residents" onClick={() => navigate('/dashboard')} />
        <StatusCard
          label="Water Status"
          value={avgWaterPct >= 60 ? 'Good' : avgWaterPct >= 30 ? 'Moderate' : 'Critical'}
          icon={Droplets}
          color={avgWaterPct >= 60 ? '#22c55e' : avgWaterPct >= 30 ? '#f59e0b' : '#ef4444'}
          subtitle={`${waterTanks.length} tanks • avg ${avgWaterPct}%`}
          onClick={() => navigate('/water-tanks')}
        />
        <StatusCard label="Energy Status" value="Moderate" icon={Zap} color="#eab308" subtitle="Consumption normal" onClick={() => navigate('/energy')} />
        <StatusCard label="Agriculture Status" value="Good" icon={Sprout} color="#22c55e" subtitle="Crops healthy" onClick={() => navigate('/agriculture')} />
        <StatusCard
          label="Village Health Score"
          value={`${villageHealthScore} / 100`}
          icon={HeartPulse}
          color={villageHealthScore >= 75 ? '#22c55e' : villageHealthScore >= 50 ? '#f59e0b' : '#ef4444'}
          subtitle={villageHealthScore >= 75 ? 'Excellent' : villageHealthScore >= 50 ? 'Fair' : 'Needs attention'}
          onClick={() => navigate('/analytics')}
        />
        <StatusCard label="Current Weather" value="28°C" icon={Cloud} color="#06b6d4" subtitle="Partly Cloudy" onClick={() => navigate('/dashboard')} />
      </div>

      {/* Main map + side panels */}
      <div className="grid gap-4 xl:grid-cols-[1fr_320px] cmd-fade-up" style={{ animationDelay: '0.1s' }}>
        {/* Hero map */}
        <div className="cmd-glass overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-green-400" />
              <h3 className="font-bold text-white">Digital Twin Map</h3>
              <span className="rounded bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">LIVE</span>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-white/[0.04] p-0.5">
              <button
                onClick={() => setMapMode('2d')}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-all ${mapMode === '2d' ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Layers size={13} /> 2D Map
              </button>
              <button
                onClick={() => setMapMode('3d')}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-all ${mapMode === '3d' ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Eye size={13} /> 3D Twin
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
            />
            {mapMode === '3d' && (
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-[11px] text-slate-300 backdrop-blur-sm">
                3D view enabled — drag to rotate the village model
              </div>
            )}
            {/* Map legend */}
            <div className="pointer-events-none absolute top-3 right-3 cmd-glass px-3 py-2 text-[10px]">
              <div className="flex flex-col gap-1.5">
                <LegendDot color="#22c55e" label="Water Tanks" />
                <LegendDot color="#f97316" label="Waste Bins" />
                <LegendDot color="#ef4444" label="Complaints" />
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
                <h4 className="text-sm font-bold text-white">Important Alerts</h4>
              </div>
              <button
                onClick={() => navigate(isAdmin ? '/garbage-bins' : '/complaints')}
                className="text-[11px] font-medium text-green-400 hover:text-green-300"
              >
                View All
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
            <h4 className="mb-3 text-sm font-bold text-white">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <QuickBtn icon={Plus} label="Add Asset" onClick={() => navigate('/water-tanks')} />
              <QuickBtn icon={Send} label="Send Alert" onClick={() => navigate('/complaints/new')} />
              <QuickBtn icon={ClipboardList} label="New Complaint" onClick={() => navigate('/complaints/new')} />
              <QuickBtn icon={Droplets} label="Water Request" onClick={() => navigate('/water-tanks')} />
              <QuickBtn icon={FileText} label="View Reports" onClick={() => navigate('/reports')} />
              <QuickBtn icon={Bot} label="AI Assistant" onClick={() => setAiOpen(true)} />
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
              <h4 className="text-sm font-bold text-white">AI Prediction Summary</h4>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-[11px] font-medium text-green-400 hover:text-green-300"
            >
              View All
            </button>
          </div>
          <div className="space-y-2.5">
            <PredictionRow label="Water Shortage" value="Low Risk" color="#22c55e" />
            <PredictionRow label="Crop Yield" value="High Yield" color="#22c55e" />
            <PredictionRow label="Power Demand" value="Normal" color="#3b82f6" />
            <PredictionRow label="Disease Outbreak" value="Low Risk" color="#22c55e" />
          </div>
        </div>

        {/* At-a-glance — spans 2 cols */}
        <div className="cmd-glass p-4 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <Activity size={16} className="text-cyan-400" />
            <h4 className="text-sm font-bold text-white">At a Glance</h4>
            <span className="ml-auto rounded bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">REAL-TIME</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <GlanceCard icon={Droplets} label="Water Tanks" value={waterTanks.length} color="#3b82f6" />
            <GlanceCard icon={Lightbulb} label="Street Lights" value={48} color="#eab308" />
            <GlanceCard icon={Sprout} label="Active Farms" value={12} color="#22c55e" />
            <GlanceCard icon={Radio} label="IoT Sensors" value={34} color="#06b6d4" />
            <GlanceCard icon={CloudRain} label="Rainfall" value="12mm" color="#3b82f6" />
            <GlanceCard icon={Wind} label="Air Quality" value="Good" color="#22c55e" />
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


