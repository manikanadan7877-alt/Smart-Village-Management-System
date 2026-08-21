import { useNavigate } from 'react-router-dom';
import { ModuleHeader, FeatureGrid, ModuleCardBox, ModulePageWrapper, StatusRow } from '@/components/ModulePage';
import {
  FileText, Calendar, Download, History, FileBarChart, FileSpreadsheet,
} from 'lucide-react';

const FEATURES = [
  { icon: Calendar, label: 'Daily Reports', value: '30', color: '#3b82f6' },
  { icon: FileBarChart, label: 'Weekly Reports', value: '4', color: '#22c55e' },
  { icon: FileSpreadsheet, label: 'Monthly Reports', value: '12', color: '#eab308' },
  { icon: FileText, label: 'Annual Reports', value: '1', color: '#64748b' },
  { icon: Download, label: 'Exports Today', value: '5', color: '#06b6d4' },
  { icon: History, label: 'Report History', value: '47', color: '#3b82f6' },
];

export function ReportsPage() {
  const navigate = useNavigate();
  return (
    <ModulePageWrapper>
      <ModuleHeader title="Reports" subtitle="Daily, weekly, monthly, and annual village reports" icon={FileText} color="#3b82f6" />
      <FeatureGrid features={FEATURES} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title="Recent Reports" icon={History} color="#3b82f6">
          <div className="space-y-3">
            {[
              { name: 'Daily Report — Aug 14, 2026', type: 'Daily', date: 'Today' },
              { name: 'Weekly Summary — Week 32', type: 'Weekly', date: '2 days ago' },
              { name: 'Water Usage Report — July', type: 'Monthly', date: '14 days ago' },
              { name: 'Complaint Resolution — July', type: 'Monthly', date: '14 days ago' },
              { name: 'Annual Village Report 2025', type: 'Annual', date: 'Jan 2026' },
            ].map((r) => (
              <div key={r.name} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-700">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.type} • {r.date}</p>
                </div>
                <div className="flex gap-1.5">
                  <button className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100" title="Download PDF">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ModuleCardBox>

        <div className="space-y-6">
          <ModuleCardBox title="Export Options" icon={Download} color="#22c55e">
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
                <FileText size={24} className="text-red-600" />
                <span className="text-xs font-semibold text-slate-700">Export PDF</span>
              </button>
              <button className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
                <FileSpreadsheet size={24} className="text-green-600" />
                <span className="text-xs font-semibold text-slate-700">Export Excel</span>
              </button>
            </div>
          </ModuleCardBox>

          <ModuleCardBox title="Report Categories" icon={FileBarChart} color="#06b6d4" actionLabel="View Analytics" onAction={() => navigate('/analytics')}>
            <div className="space-y-2.5">
              <StatusRow label="Water Management Reports" value="12 available" status="good" />
              <StatusRow label="Energy Reports" value="8 available" status="good" />
              <StatusRow label="Complaint Reports" value="15 available" status="good" />
              <StatusRow label="Healthcare Reports" value="6 available" status="good" />
              <StatusRow label="Education Reports" value="6 available" status="good" />
            </div>
          </ModuleCardBox>
        </div>
      </div>
    </ModulePageWrapper>
  );
}
