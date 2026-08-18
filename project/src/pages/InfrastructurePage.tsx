import { useNavigate } from 'react-router-dom';
import { ModuleHeader, FeatureGrid, ModuleCardBox, ModulePageWrapper, StatusRow } from '@/components/ModulePage';
import {
  Wrench, Route, Building, Building2, Lightbulb, Construction,
  AlertTriangle, TrendingUp,
} from 'lucide-react';

const FEATURES = [
  { icon: Route, label: 'Roads', value: '18 km', color: '#64748b' },
  { icon: Building2, label: 'Bridges', value: '2', color: '#64748b' },
  { icon: Building, label: 'Govt Buildings', value: '6', color: '#3b82f6' },
  { icon: Lightbulb, label: 'Street Lights', value: '48', color: '#eab308' },
  { icon: Construction, label: 'Active Projects', value: '3', color: '#f59e0b' },
  { icon: AlertTriangle, label: 'Road Damages', value: '5', color: '#ef4444' },
  { icon: Wrench, label: 'Maintenance Due', value: '2', color: '#f59e0b' },
  { icon: TrendingUp, label: 'Asset Value', value: '2.4 Cr', color: '#22c55e' },
];

export function InfrastructurePage() {
  const navigate = useNavigate();
  return (
    <ModulePageWrapper>
      <ModuleHeader title="Infrastructure" subtitle="Roads, bridges, buildings, street lights, and government assets" icon={Wrench} color="#64748b" />
      <FeatureGrid features={FEATURES} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title="Road Condition" icon={Route} color="#64748b">
          <div className="space-y-2.5">
            <StatusRow label="Main Street" value="Good" status="good" />
            <StatusRow label="Market Road" value="2 potholes" status="bad" />
            <StatusRow label="School Road" value="Good" status="good" />
            <StatusRow label="Farm Access Road" value="Worn surface" status="moderate" />
            <StatusRow label="Ring Road" value="Good" status="good" />
          </div>
        </ModuleCardBox>

        <ModuleCardBox title="Street Light Status" icon={Lightbulb} color="#eab308" actionLabel="View Energy" onAction={() => navigate('/energy')}>
          <div className="space-y-2.5">
            <StatusRow label="Main Street (12)" value="All working" status="good" />
            <StatusRow label="Market Road (8)" value="2 not working" status="bad" />
            <StatusRow label="School Zone (10)" value="All working" status="good" />
            <StatusRow label="Park Area (8)" value="All working" status="good" />
            <StatusRow label="Residential (10)" value="All working" status="good" />
          </div>
        </ModuleCardBox>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title="Active Projects" icon={Construction} color="#f59e0b">
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Drainage Upgrade — Main Street</p>
              <p className="mt-1 text-xs text-slate-500">Progress: 65% | Expected: Sep 2026</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Bus Stop Construction</p>
              <p className="mt-1 text-xs text-slate-500">Progress: 40% | Expected: Oct 2026</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Street Light Replacement — Market Road</p>
              <p className="mt-1 text-xs text-slate-500">Progress: 20% | Expected: Aug 2026</p>
            </div>
          </div>
        </ModuleCardBox>

        <ModuleCardBox title="Infrastructure Risk Assessment" icon={AlertTriangle} color="#ef4444" actionLabel="View AI Analytics" onAction={() => navigate('/analytics')}>
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Market Road — High Risk</p>
              <p className="mt-1 text-xs text-slate-500">2 potholes need immediate repair. Monsoon risk: high.</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Farm Access Bridge — Moderate</p>
              <p className="mt-1 text-xs text-slate-500">Minor cracks detected. Inspection recommended within 30 days.</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Old Drainage System — Low Risk</p>
              <p className="mt-1 text-xs text-slate-500">Upgrade in progress. Current system functional.</p>
            </div>
          </div>
        </ModuleCardBox>
      </div>
    </ModulePageWrapper>
  );
}
