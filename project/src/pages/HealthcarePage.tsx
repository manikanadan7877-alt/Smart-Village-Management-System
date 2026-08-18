import { useNavigate } from 'react-router-dom';
import { ModuleHeader, FeatureGrid, ModuleCardBox, ModulePageWrapper, StatusRow } from '@/components/ModulePage';
import {
  HeartPulse, Stethoscope, Users, Syringe, Pill, Ambulance,
  Activity, AlertTriangle, Brain,
} from 'lucide-react';

const FEATURES = [
  { icon: Stethoscope, label: 'Doctors', value: '3', color: '#3b82f6' },
  { icon: Users, label: 'Active Patients', value: '47', color: '#3b82f6' },
  { icon: Syringe, label: 'Vaccinated', value: '1,156', color: '#22c55e' },
  { icon: Pill, label: 'Medicines in Stock', value: '42', color: '#22c55e' },
  { icon: Ambulance, label: 'Ambulance', value: 'Available', color: '#22c55e' },
  { icon: AlertTriangle, label: 'Emergency Cases', value: '0', color: '#22c55e' },
  { icon: HeartPulse, label: 'Health Camp', value: 'Monthly', color: '#06b6d4' },
  { icon: Activity, label: 'OPD Today', value: '18', color: '#eab308' },
];

export function HealthcarePage() {
  const navigate = useNavigate();
  return (
    <ModulePageWrapper>
      <ModuleHeader title="Healthcare" subtitle="PHC, doctors, patients, vaccination, and disease monitoring" icon={HeartPulse} color="#ef4444" />
      <FeatureGrid features={FEATURES} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title="PHC Status" icon={Stethoscope} color="#3b82f6">
          <div className="space-y-2.5">
            <StatusRow label="General Ward" value="6/20 beds" status="good" />
            <StatusRow label="Maternity Ward" value="2/8 beds" status="good" />
            <StatusRow label="Emergency" value="Available" status="good" />
            <StatusRow label="Lab Services" value="Operational" status="good" />
          </div>
        </ModuleCardBox>

        <ModuleCardBox title="Vaccination Progress" icon={Syringe} color="#22c55e">
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium text-slate-600">Children (0-5 yrs)</span>
                <span className="font-bold text-slate-900">92%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-green-500 transition-all" style={{ width: '92%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium text-slate-600">Pregnant Women</span>
                <span className="font-bold text-slate-900">88%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-green-500 transition-all" style={{ width: '88%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium text-slate-600">Elderly (60+)</span>
                <span className="font-bold text-slate-900">76%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-amber-500 transition-all" style={{ width: '76%' }} />
              </div>
            </div>
          </div>
        </ModuleCardBox>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title="Medicine Stock" icon={Pill} color="#06b6d4">
          <div className="space-y-2.5">
            <StatusRow label="Paracetamol" value="In stock" status="good" />
            <StatusRow label="Antibiotics" value="Low stock" status="moderate" />
            <StatusRow label="ORS Sachets" value="In stock" status="good" />
            <StatusRow label="Insulin" value="In stock" status="good" />
          </div>
        </ModuleCardBox>

        <ModuleCardBox title="Disease Prediction" icon={Brain} color="#ef4444" actionLabel="View AI Analytics" onAction={() => navigate('/analytics')}>
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Dengue Risk — Low</p>
              <p className="mt-1 text-xs text-slate-500">No active cases. Fogging scheduled next week.</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Seasonal Flu — Moderate</p>
              <p className="mt-1 text-xs text-slate-500">3 cases reported this week. Monitor for outbreak.</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">Water-borne Disease — Low Risk</p>
              <p className="mt-1 text-xs text-slate-500">Water quality tests normal across all tanks.</p>
            </div>
          </div>
        </ModuleCardBox>
      </div>
    </ModulePageWrapper>
  );
}
