import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchComplaints } from '@/lib/api';
import { CategoryBadge, PriorityBadge, StatusBadge } from '@/components/Badges';
import type { Complaint, ComplaintStatus, ComplaintCategory } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/types';
import { Plus, Search, ClipboardList, MapPin, Calendar } from 'lucide-react';

export function ComplaintsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'all'>('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchComplaints();
        setComplaints(data);
      } catch (err) {
        console.error('Complaints load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isAdmin = profile?.role === 'admin';
  const visibleComplaints = isAdmin ? complaints : complaints.filter((c) => c.user_id === profile?.id);

  const filtered = visibleComplaints.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location_label.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaints</h1>
          <p className="text-sm text-slate-500">
            {isAdmin ? 'Manage all village complaints' : 'Track your submitted complaints'}
          </p>
        </div>
        {!isAdmin && (
          <button onClick={() => navigate('/complaints/new')} className="btn-primary">
            <Plus size={18} />
            New Complaint
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search complaints..."
              className="input pl-11"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | 'all')}
            className="input sm:w-40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ComplaintCategory | 'all')}
            className="input sm:w-44"
          >
            <option value="all">All Categories</option>
            {(Object.keys(CATEGORY_LABELS) as ComplaintCategory[]).map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/complaints/${c.id}`)}
              className="card p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <CategoryBadge category={c.category} />
                <StatusBadge status={c.status} />
              </div>
              <h3 className="mb-1.5 font-bold text-slate-900 line-clamp-2">{c.title}</h3>
              <p className="mb-3 text-sm text-slate-500 line-clamp-2">{c.description || 'No description'}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                {c.location_label && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {c.location_label}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <PriorityBadge priority={c.priority} />
                {c.image_url && (
                  <img src={c.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList size={48} className="mb-3 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700">No complaints found</h3>
          <p className="mt-1 text-sm text-slate-400">
            {visibleComplaints.length === 0
              ? (isAdmin ? 'No complaints have been submitted yet' : 'You haven\'t submitted any complaints yet')
              : 'Try adjusting your filters'}
          </p>
          {!isAdmin && visibleComplaints.length === 0 && (
            <button onClick={() => navigate('/complaints/new')} className="btn-primary mt-4">
              <Plus size={18} /> Submit Your First Complaint
            </button>
          )}
        </div>
      )}
    </div>
  );
}
