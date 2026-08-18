import { useNavigate } from 'react-router-dom';
import { ModuleHeader, FeatureGrid, ModuleCardBox, ModulePageWrapper, StatusRow } from '@/components/ModulePage';
import {
  Zap, Lightbulb, Sun, Gauge, Battery, AlertTriangle,
  TrendingDown, BarChart3, Plug,
} from 'lucide-react';

const FEATURES = [
  { icon: Zap, label: 'Daily Consumption', value: '2,450 kWh', color: '#eab308' },
  { icon: Sun, label: 'Solar Generation', value: '1,820 kWh', color: '#22c55e' },
  { icon: Lightbulb, label: 'Street Lights', value: '48 / 50', color: '#eab308' },
  { icon: Battery, label: 'Battery Backup', value: '85%', color: '#22c55e' },
  { icon: Gauge, label: 'Peak Demand', value: '3,100 kWh', color: '#f59e0b' },
  { icon: Plug, label: 'Smart Meters', value: '320', color: '#3b82f6' },
  { icon: AlertTriangle, label: 'Power Outages', value: '0', color: '#22c55e' },
  { icon: TrendingDown, label: 'Energy Saved', value: '12%', color: '#22c55e' },
];

export function EnergyPage() {
  const navigate = useNavigate();
  return (
    <ModulePageWrapper>
      <ModuleHeader title="Energy Management" subtitle="Power generation, solar, street lights, and consumption" icon={Zap} color="#eab308" />
      <FeatureGrid features={FEATURES} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title="Solar Power Plants" icon={Sun} color="#22c55e">
          <div className="space-y-2.5">
            <StatusRow label="Plant 1 — Panchayat Roof" value="820 kWh" status="good" />
            <StatusRow label="Plant 2 — School Roof" value="640 kWh" status="good" />
            <StatusRow label="Plant 3 — Water Tank" value="360 kWh" status="moderate" />
          </div>
        </ModuleCardBox>

        <ModuleCardBox title="Street Light Status" icon={Lightbulb} color="#eab308" actionLabel="View Infrastructure" onAction={() => navigate('/infrastructure')}>
          <div className="space-y-2.5">
            <StatusRow label="Main Street" value="All working" status="good" />
            <StatusRow label="Market Road" value="2 not working" status="bad" />
            <StatusRow label="School Zone" value="All working" status="good" />
            <StatusRow label="Park Area" value="All working" status="good" />
          </div>
        </ModuleCardBox>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title="Consumption by Zone" icon={BarChart3} color="#3b82f6">
          <div className="space-y-3">
            {[
              { zone: 'Residential', usage: 980, pct: 40 },
              { zone: 'Agriculture', usage: 720, pct: 29 },
              { zone: 'Commercial', usage: 450, pct: 18 },
              { zone: 'Public', usage: 300, pct: 12 },
            ].map((z) => (
              <div key={z.zone}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium text-slate-600">{z.zone}</span>
                  <span className="font-bold text-slate-900">{z.usage} kWh</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-blue-500 transition-all" style={{ width: `${z.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ModuleCardBox>

        <ModuleCardBox title="Energy Saving Recommendations" icon={TrendingDown} color="#22c55e" actionLabel="View AI Analytics" onAction={() => navigate('/analytics')}>
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Replace 2 faulty street lights on Market Road</p>
              <p className="mt-1 text-xs text-slate-500">Estimated savings: 8 kWh/day</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Shift agricultural pumping to solar hours (10AM-3PM)</p>
              <p className="mt-1 text-xs text-slate-500">Estimated savings: 120 kWh/day</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Upgrade to LED bulbs in 15 households</p>
              <p className="mt-1 text-xs text-slate-500">Estimated savings: 25 kWh/day</p>
            </div>
          </div>
        </ModuleCardBox>
      </div>
    </ModulePageWrapper>
  );
}
