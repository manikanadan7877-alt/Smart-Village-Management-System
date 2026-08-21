import { useEffect, useState } from 'react';
import { fetchComplaints, fetchWaterTanks, fetchGarbageBins, computeStats } from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import { ProgressBar, getWaterLevelColor, getFillLevelColor } from '@/components/ProgressBar';
import type { Complaint, WaterTank, GarbageBin } from '@/lib/types';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/types';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, AreaChart, Area,
} from 'recharts';
import {
  ClipboardList, Clock, CheckCircle, AlertTriangle, Droplets, Trash2,
  TrendingUp, PieChart as PieIcon, BarChart3, Activity,
} from 'lucide-react';

const STATUS_CHART_COLORS: Record<string, string> = {
  pending: '#f59e0b', in_progress: '#3b82f6', resolved: '#10b981', rejected: '#64748b',
};
const CATEGORY_CHART_COLORS: Record<string, string> = {
  road_damage: '#ef4444', garbage_overflow: '#f97316', water_leakage: '#3b82f6',
  street_light: '#eab308', drainage: '#06b6d4', other: '#64748b',
};

export function AnalyticsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [waterTanks, setWaterTanks] = useState<WaterTank[]>([]);
  const [garbageBins, setGarbageBins] = useState<GarbageBin[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  const stats = computeStats(complaints);

  const categoryData = stats.byCategory.map((item) => ({
    name: CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] ?? item.category,
    value: item.count,
    color: CATEGORY_CHART_COLORS[item.category] ?? '#64748b',
  }));

  const statusData = stats.byStatus.map((item) => ({
    name: STATUS_LABELS[item.status],
    value: item.count,
    color: STATUS_CHART_COLORS[item.status],
  }));

  const trendData = stats.recentTrend.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    complaints: d.count,
  }));

  const waterData = waterTanks.map((t) => ({
    name: t.name,
    fill: (t.current_level_liters / t.capacity_liters) * 100,
    current: t.current_level_liters,
    capacity: t.capacity_liters,
  }));

  const garbageData = garbageBins.map((b) => ({
    name: b.name,
    fill: (b.current_level_liters / b.capacity_liters) * 100,
    current: b.current_level_liters,
    capacity: b.capacity_liters,
  }));

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
        <p className="text-sm text-slate-500">Village-wide insights and performance metrics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Complaints" value={stats.total} icon={ClipboardList} color="#3b82f6" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="#f59e0b" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} color="#10b981" />
        <StatCard label="High Priority" value={stats.high} icon={AlertTriangle} color="#ef4444" />
      </div>

      {/* Trend + Status Pie */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-900">Complaint Trend (7 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="complaintGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '13px' }}
              />
              <Area type="monotone" dataKey="complaints" stroke="#3b82f6" strokeWidth={2} fill="url(#complaintGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <PieIcon size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-900">Status Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown + Priority */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-900">Complaints by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-900">Priority Levels</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'High', count: stats.high, color: '#ef4444' },
              { label: 'Medium', count: stats.medium, color: '#f59e0b' },
              { label: 'Low', count: stats.low, color: '#10b981' },
            ].map((p) => {
              const pct = stats.total > 0 ? (p.count / stats.total) * 100 : 0;
              return (
                <div key={p.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">{p.label} Priority</span>
                    <span className="font-bold text-slate-900">{p.count}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100">
                    <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400">Resolution Rate</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {stats.total > 0 ? `${((stats.resolved / stats.total) * 100).toFixed(0)}%` : '0%'}
            </p>
          </div>
        </div>
      </div>

      {/* Resource monitoring */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Water tanks */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Droplets size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-900">Water Tank Levels</h3>
          </div>
          {waterData.length > 0 ? (
            <div className="space-y-3">
              {waterTanks.map((t) => {
                const pct = (t.current_level_liters / t.capacity_liters) * 100;
                const color = getWaterLevelColor(pct);
                return (
                  <div key={t.id} className="rounded-xl border border-slate-100 p-3">
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{t.name}</span>
                      <span className="font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
                    </div>
                    <ProgressBar value={t.current_level_liters} max={t.capacity_liters} color={color} height="h-2.5" />
                    <p className="mt-1 text-xs text-slate-400">
                      {t.current_level_liters.toLocaleString()} / {t.capacity_liters.toLocaleString()} L
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">No water tanks registered</p>
          )}
        </div>

        {/* Garbage bins */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Trash2 size={20} className="text-orange-600" />
            <h3 className="font-bold text-slate-900">Garbage Bin Fill Levels</h3>
          </div>
          {garbageData.length > 0 ? (
            <div className="space-y-3">
              {garbageBins.map((b) => {
                const pct = (b.current_level_liters / b.capacity_liters) * 100;
                const color = getFillLevelColor(pct);
                return (
                  <div key={b.id} className="rounded-xl border border-slate-100 p-3">
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{b.name}</span>
                      <span className="font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
                    </div>
                    <ProgressBar value={b.current_level_liters} max={b.capacity_liters} color={color} height="h-2.5" />
                    <p className="mt-1 text-xs text-slate-400">
                      {b.current_level_liters} / {b.capacity_liters} L
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">No garbage bins registered</p>
          )}
        </div>
      </div>
    </div>
  );
}
