import { useNavigate } from 'react-router-dom';
import { ModuleHeader, FeatureGrid, ModuleCardBox, ModulePageWrapper, StatusRow } from '@/components/ModulePage';
import {
  Wallet, TrendingUp, TrendingDown, Building, FileBarChart,
  PiggyBank, Receipt,
} from 'lucide-react';

const TOTAL_BUDGET = 5000000;
const SPENT = 2850000;
const REMAINING = TOTAL_BUDGET - SPENT;

const FEATURES = [
  { icon: Wallet, label: 'Total Budget', value: '50,00,000', color: '#3b82f6' },
  { icon: Receipt, label: 'Amount Spent', value: '28,50,000', color: '#ef4444' },
  { icon: PiggyBank, label: 'Remaining', value: '21,50,000', color: '#22c55e' },
  { icon: Building, label: 'Govt Funds', value: '35,00,000', color: '#3b82f6' },
  { icon: TrendingDown, label: 'Project Expenses', value: '18,50,000', color: '#f59e0b' },
  { icon: TrendingUp, label: 'Revenue', value: '4,20,000', color: '#22c55e' },
];

export function BudgetPage() {
  const navigate = useNavigate();
  const spentPct = Math.round((SPENT / TOTAL_BUDGET) * 100);
  return (
    <ModulePageWrapper>
      <ModuleHeader title="Budget & Finance" subtitle="Village budget, expenses, government funds, and financial reports" icon={Wallet} color="#22c55e" />
      <FeatureGrid features={FEATURES} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title="Budget Utilization" icon={FileBarChart} color="#3b82f6">
          <div className="mb-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-slate-600">Spent: {spentPct}%</span>
              <span className="font-bold text-slate-900">28.5L / 50L</span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100">
              <div className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${spentPct}%` }} />
            </div>
          </div>
          <div className="space-y-2.5">
            <StatusRow label="Q1 (Apr-Jun)" value="7.5L spent" status="good" />
            <StatusRow label="Q2 (Jul-Sep)" value="12.0L spent" status="moderate" />
            <StatusRow label="Q3 (Oct-Dec)" value="9.0L spent" status="good" />
            <StatusRow label="Q4 (Jan-Mar)" value="0.0L (upcoming)" status="good" />
          </div>
        </ModuleCardBox>

        <ModuleCardBox title="Major Expenses" icon={Receipt} color="#ef4444">
          <div className="space-y-3">
            {[
              { item: 'Drainage Upgrade Project', amount: '8,50,000', pct: 30 },
              { item: 'Solar Plant Installation', amount: '6,20,000', pct: 22 },
              { item: 'Road Repair & Maintenance', amount: '4,50,000', pct: 16 },
              { item: 'School Infrastructure', amount: '3,80,000', pct: 13 },
              { item: 'Water Tank Construction', amount: '2,50,000', pct: 9 },
            ].map((e) => (
              <div key={e.item}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium text-slate-600">{e.item}</span>
                  <span className="font-bold text-slate-900">{e.amount}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-amber-500 transition-all" style={{ width: `${e.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ModuleCardBox>
      </div>

      <ModuleCardBox title="Financial Analytics" icon={TrendingUp} color="#22c55e" actionLabel="View Detailed Reports" onAction={() => navigate('/reports')}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-100 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">4.2L</p>
            <p className="mt-1 text-xs text-slate-500">Revenue Collected</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">35L</p>
            <p className="mt-1 text-xs text-slate-500">Govt Grants</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">1.5L</p>
            <p className="mt-1 text-xs text-slate-500">Pending Bills</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 text-center">
            <p className="text-2xl font-bold text-cyan-600">57%</p>
            <p className="mt-1 text-xs text-slate-500">Budget Utilized</p>
          </div>
        </div>
      </ModuleCardBox>
    </ModulePageWrapper>
  );
}
