import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import {
  FileText, MapPin, Droplets, Trash2, BarChart3,
  Plus, Wheat, HeartPulse, GraduationCap, HardHat, TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Complaint } from '@/lib/types';

export function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useI18n();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComplaints() {
      const { data } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setComplaints((data as Complaint[]) ?? []);
      setLoading(false);
    }
    loadComplaints();
  }, []);

  const isAdmin = profile?.role === 'admin';
  const pendingCount = complaints.filter((c) => c.status === 'pending').length;

  const stats = [
    { label: 'Total Complaints', value: complaints.length, icon: FileText, color: 'blue' },
    { label: 'Pending', value: pendingCount, icon: TrendingUp, color: 'amber' },
  ];

  const modules = [
    { path: '/complaints/new', label: t('submitComplaint'), icon: Plus, color: 'blue' },
    { path: '/complaints', label: t('complaints'), icon: FileText, color: 'slate' },
    { path: '/map', label: t('map'), icon: MapPin, color: 'green' },
    { path: '/agriculture', label: t('agriculture'), icon: Wheat, color: 'amber' },
    { path: '/healthcare', label: t('healthcare'), icon: HeartPulse, color: 'red' },
    { path: '/education', label: t('education'), icon: GraduationCap, color: 'indigo' },
    { path: '/infrastructure', label: t('infrastructure'), icon: HardHat, color: 'orange' },
  ];

  if (isAdmin) {
    modules.push(
      { path: '/water-tanks', label: t('waterTanks'), icon: Droplets, color: 'cyan' },
      { path: '/garbage-bins', label: t('garbageBins'), icon: Trash2, color: 'slate' },
      { path: '/analytics', label: t('analytics'), icon: BarChart3, color: 'purple' },
    );
  }

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {profile?.full_name || 'User'}!
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening in your village today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[stat.color]}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Module grid */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900">Modules</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {modules.map((module) => (
            <Link
              key={module.path}
              to={module.path}
              className="card flex flex-col items-center gap-3 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colorMap[module.color]}`}>
                <module.icon size={26} />
              </div>
              <p className="text-sm font-semibold text-slate-700 text-center">{module.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent complaints */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900">Recent Complaints</h2>
        {loading ? (
          <div className="card animate-pulse">
            <div className="h-4 w-3/4 rounded bg-slate-200" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="card text-center">
            <p className="text-sm text-slate-500">No complaints yet. Be the first to report an issue!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((complaint) => (
              <Link
                key={complaint.id}
                to={`/complaints/${complaint.id}`}
                className="card flex items-center justify-between transition-all hover:shadow-md"
              >
                <div>
                  <p className="font-semibold text-slate-900">{complaint.title}</p>
                  <p className="text-xs text-slate-500 capitalize">{complaint.category.replace(/_/g, ' ')}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  complaint.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                  complaint.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                  complaint.status === 'resolved' ? 'bg-green-50 text-green-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {complaint.status.replace(/_/g, ' ')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
