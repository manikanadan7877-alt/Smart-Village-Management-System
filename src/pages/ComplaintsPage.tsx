import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Complaint, ComplaintStatus } from '@/lib/types';
import { STATUS_LABELS, CATEGORY_LABELS } from '@/lib/types';
import { FileText, Loader2, Filter } from 'lucide-react';

export function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ComplaintStatus | 'all'>('all');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });
      setComplaints((data as Complaint[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === 'all' ? complaints : complaints.filter((c) => c.status === filter);

  const statusFilters: (ComplaintStatus | 'all')[] = ['all', 'pending', 'in_progress', 'resolved', 'rejected'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaints</h1>
          <p className="mt-1 text-sm text-slate-500">View and track all reported issues</p>
        </div>
        <Link to="/complaints/new" className="btn-primary">
          <FileText size={18} />
          New Complaint
        </Link>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <Filter size={16} className="text-slate-400" />
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {f === 'all' ? 'All' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center">
          <p className="text-sm text-slate-500">No complaints found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((complaint) => (
            <Link
              key={complaint.id}
              to={`/complaints/${complaint.id}`}
              className="card flex items-center justify-between transition-all hover:shadow-md"
            >
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{complaint.title}</p>
                <p className="text-xs text-slate-500">
                  {CATEGORY_LABELS[complaint.category]} · {new Date(complaint.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                complaint.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                complaint.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                complaint.status === 'resolved' ? 'bg-green-50 text-green-600' :
                'bg-red-50 text-red-600'
              }`}>
                {STATUS_LABELS[complaint.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
