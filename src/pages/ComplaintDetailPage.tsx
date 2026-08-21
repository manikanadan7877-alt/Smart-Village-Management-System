import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Complaint, ComplaintStatus } from '@/lib/types';
import { STATUS_LABELS, CATEGORY_LABELS, PRIORITY_LABELS } from '@/lib/types';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

export function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState<ComplaintStatus>('pending');
  const [saving, setSaving] = useState(false);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (data) {
        setComplaint(data as Complaint);
        setAdminNotes(data.admin_notes || '');
        setStatus(data.status as ComplaintStatus);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from('complaints')
      .update({ admin_notes: adminNotes, status })
      .eq('id', id);
    setSaving(false);
    navigate('/complaints');
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="card text-center">
        <p className="text-sm text-slate-500">Complaint not found.</p>
        <Link to="/complaints" className="mt-4 inline-block btn-secondary">Back to Complaints</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/complaints" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to Complaints
      </Link>

      <div className="card space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{complaint.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {CATEGORY_LABELS[complaint.category]} · {PRIORITY_LABELS[complaint.priority]} Priority
          </p>
        </div>

        {complaint.description && (
          <p className="text-sm text-slate-600">{complaint.description}</p>
        )}

        {complaint.image_url && (
          <img src={complaint.image_url} alt={complaint.title} className="rounded-xl" />
        )}

        {complaint.location_label && (
          <p className="text-sm text-slate-500">Location: {complaint.location_label}</p>
        )}

        {complaint.ai_category && (
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-700">AI Classification</p>
            <p className="text-xs text-blue-600">
              Category: {complaint.ai_category} · Confidence: {complaint.ai_confidence ? `${(Number(complaint.ai_confidence) * 100).toFixed(0)}%` : 'N/A'}
            </p>
          </div>
        )}

        <div>
          <p className="text-sm text-slate-500">Status: {STATUS_LABELS[complaint.status]}</p>
        </div>
      </div>

      {isAdmin && (
        <div className="card space-y-4">
          <h2 className="font-bold text-slate-900">Admin Actions</h2>
          <div>
            <label className="label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
              className="input"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="label">Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="input"
              placeholder="Add internal notes..."
            />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      )}
    </div>
  );
}
