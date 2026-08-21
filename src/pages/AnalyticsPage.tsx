import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Complaint } from '@/lib/types';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/types';
import { BarChart3, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#6b7280'];

export function AnalyticsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('complaints').select('*');
      setComplaints((data as Complaint[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  const categoryData = Object.keys(CATEGORY_LABELS).map((key) => ({
    name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS],
    value: complaints.filter((c) => c.category === key).length,
  })).filter((d) => d.value > 0);

  const statusData = Object.keys(STATUS_LABELS).map((key) => ({
    name: STATUS_LABELS[key as keyof typeof STATUS_LABELS],
    value: complaints.filter((c) => c.status === key).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Insights and statistics for village management</p>
      </div>

      {complaints.length === 0 ? (
        <div className="card text-center">
          <BarChart3 size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No data to analyze yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-4 font-bold text-slate-900">Complaints by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="mb-4 font-bold text-slate-900">Complaints by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
