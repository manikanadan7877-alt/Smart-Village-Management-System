import { useNavigate } from 'react-router-dom';
import { ModuleHeader, FeatureGrid, ModuleCardBox, ModulePageWrapper, StatusRow } from '@/components/ModulePage';
import {
  Sprout, Tractor, Wheat, Droplets, FlaskConical, Bug, TrendingUp,
  Sun, CloudRain, Map, Activity, Beaker,
} from 'lucide-react';

const FEATURES = [
  { icon: Tractor, label: 'Active Farmers', value: '142', color: '#22c55e' },
  { icon: Sprout, label: 'Farms', value: '12', color: '#22c55e' },
  { icon: Wheat, label: 'Crop Types', value: '8', color: '#eab308' },
  { icon: Droplets, label: 'Soil Moisture', value: '68%', color: '#3b82f6' },
  { icon: FlaskConical, label: 'Soil pH', value: '6.8', color: '#06b6d4' },
  { icon: Bug, label: 'Pest Alerts', value: '0', color: '#22c55e' },
  { icon: Sun, label: 'Sunlight', value: '8.2 hrs', color: '#eab308' },
  { icon: CloudRain, label: 'Rainfall', value: '12mm', color: '#3b82f6' },
];

export function AgriculturePage() {
  const navigate = useNavigate();
  return (
    <ModulePageWrapper>
      <ModuleHeader title="Agriculture" subtitle="Farms, crops, soil health, and irrigation monitoring" icon={Sprout} color="#22c55e" />
      <FeatureGrid features={FEATURES} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title="Crop Health Status" icon={Activity} color="#22c55e">
          <div className="space-y-2.5">
            <StatusRow label="Paddy" value="Healthy" status="good" />
            <StatusRow label="Sugarcane" value="Healthy" status="good" />
            <StatusRow label="Cotton" value="Moderate" status="moderate" />
            <StatusRow label="Groundnut" value="Healthy" status="good" />
          </div>
        </ModuleCardBox>

        <ModuleCardBox title="Irrigation Status" icon={Droplets} color="#3b82f6">
          <div className="space-y-2.5">
            <StatusRow label="North Canal" value="Flowing" status="good" />
            <StatusRow label="South Borewell" value="Active" status="good" />
            <StatusRow label="Drip System A" value="Active" status="good" />
            <StatusRow label="Rainwater Storage" value="12mm stored" status="moderate" />
          </div>
        </ModuleCardBox>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title="Fertilizer Recommendations" icon={Beaker} color="#06b6d4">
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Paddy Fields (Zone 1)</p>
              <p className="mt-1 text-xs text-slate-500">Apply urea 20kg/acre within 5 days. Current nitrogen level: moderate.</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Cotton Fields (Zone 3)</p>
              <p className="mt-1 text-xs text-slate-500">Potash supplementation recommended. Soil potassium: low.</p>
            </div>
          </div>
        </ModuleCardBox>

        <ModuleCardBox title="Crop Yield Prediction" icon={TrendingUp} color="#eab308" actionLabel="View Analytics" onAction={() => navigate('/analytics')}>
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Paddy — Expected: 4.2 tons/acre</p>
              <p className="mt-1 text-xs text-slate-500">High yield predicted based on soil and weather conditions.</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Sugarcane — Expected: 38 tons/acre</p>
              <p className="mt-1 text-xs text-slate-500">Normal yield expected. Irrigation schedule on track.</p>
            </div>
          </div>
        </ModuleCardBox>
      </div>

      <ModuleCardBox title="Farm Map Overview" icon={Map} color="#22c55e" actionLabel="Open Full Map" onAction={() => navigate('/map')}>
        <p className="text-sm text-slate-500">12 active farms mapped across 4 zones. Click "Open Full Map" to view all farm locations with crop details.</p>
      </ModuleCardBox>
    </ModulePageWrapper>
  );
}
