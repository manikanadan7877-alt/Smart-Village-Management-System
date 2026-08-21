import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchComplaint, updateComplaint } from '@/lib/api';
import { CategoryBadge, PriorityBadge, StatusBadge } from '@/components/Badges';
import { VillageMap } from '@/components/VillageMap';
import { Modal } from '@/components/Modal';
import type { Complaint, ComplaintStatus, ComplaintPriority, ComplaintCategory } from '@/lib/types';
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_OPTIONS } from '@/lib/types';
import { ArrowLeft, MapPin, Calendar, Sparkles, CreditCard as Edit3, Save, X, AlertCircle, User, Clock, Image as ImageIcon } from 'lucide-react';

export function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<ComplaintStatus>('pending');
  const [editPriority, setEditPriority] = useState<ComplaintPriority>('medium');
  const [editCategory, setEditCategory] = useState<ComplaintCategory>('other');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await fetchComplaint(id);
        setComplaint(data);
        if (data) {
          setEditStatus(data.status);
          setEditPriority(data.priority);
          setEditCategory(data.category);
          setEditNotes(data.admin_notes);
        }
      } catch (err) {
        console.error('Complaint detail error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const isAdmin = profile?.role === 'admin';
  const isOwner = complaint?.user_id === profile?.id;
  const canEdit = isAdmin || isOwner;

  async function handleSave() {
    if (!complaint) return;
    setSaving(true);
    setError(null);
    try {
      await updateComplaint(complaint.id, {
        status: editStatus,
        priority: editPriority,
        category: editCategory,
        admin_notes: editNotes,
      });
      setComplaint({ ...complaint, status: editStatus, priority: editPriority, category: editCategory, admin_notes: editNotes });
      setEditOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update complaint');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={48} className="mb-3 text-slate-300" />
        <h2 className="text-lg font-bold text-slate-700">Complaint not found</h2>
        <button onClick={() => navigate('/complaints')} className="btn-secondary mt-4">
          Back to Complaints
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost -ml-2">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{complaint.title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <CategoryBadge category={complaint.category} />
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>
        {canEdit && (
          <button onClick={() => setEditOpen(true)} className="btn-secondary">
            <Edit3 size={16} /> Update
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Image */}
          {complaint.image_url && (
            <div className="card overflow-hidden">
              <img src={complaint.image_url} alt="Complaint" className="w-full max-h-96 object-cover" />
            </div>
          )}

          {/* Description */}
          <div className="card p-6">
            <h2 className="mb-3 font-bold text-slate-900">Description</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              {complaint.description || 'No description provided'}
            </p>
          </div>

          {/* AI Analysis */}
          {(complaint.ai_category || complaint.ai_confidence) && (
            <div className="card border-blue-200 bg-blue-50/30 p-6">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={20} className="text-blue-600" />
                <h2 className="font-bold text-slate-900">AI Analysis</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Predicted Category</p>
                  <p className="mt-1 text-sm font-bold text-slate-900 capitalize">
                    {complaint.ai_category?.replace(/_/g, ' ') ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Confidence Score</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {complaint.ai_confidence ? `${(complaint.ai_confidence * 100).toFixed(0)}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Assigned Priority</p>
                  <p className="mt-1 text-sm font-bold capitalize" style={{
                    color: complaint.priority === 'high' ? '#ef4444' : complaint.priority === 'medium' ? '#f59e0b' : '#10b981'
                  }}>
                    {complaint.priority}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Map */}
          {complaint.latitude && complaint.longitude && (
            <div className="card p-6">
              <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                <MapPin size={20} className="text-blue-600" />
                Location
              </h2>
              <VillageMap
                complaints={[complaint]}
                height="300px"
                centerOn={{ lat: complaint.latitude, lng: complaint.longitude }}
              />
              {complaint.location_label && (
                <p className="mt-3 text-sm text-slate-600">{complaint.location_label}</p>
              )}
            </div>
          )}

          {/* Admin notes */}
          {complaint.admin_notes && (
            <div className="card p-6">
              <h2 className="mb-2 font-bold text-slate-900">Admin Notes</h2>
              <p className="text-sm text-slate-600">{complaint.admin_notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-4 font-bold text-slate-900">Details</h3>
            <div className="space-y-3 text-sm">
              <DetailRow icon={Calendar} label="Submitted" value={new Date(complaint.created_at).toLocaleDateString()} />
              <DetailRow icon={Clock} label="Updated" value={new Date(complaint.updated_at).toLocaleDateString()} />
              <DetailRow icon={MapPin} label="Location" value={complaint.location_label || 'Not specified'} />
              <DetailRow icon={User} label="Reporter" value={isOwner ? 'You' : 'Anonymous'} />
              {complaint.image_url && <DetailRow icon={ImageIcon} label="Photo" value="Attached" />}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-bold text-slate-900">Status Timeline</h3>
            <div className="space-y-3">
              {(['pending', 'in_progress', 'resolved'] as const).map((s, i) => {
                const statusOrder = ['pending', 'in_progress', 'resolved', 'rejected'];
                const currentIdx = statusOrder.indexOf(complaint.status);
                const thisIdx = statusOrder.indexOf(s);
                const isDone = thisIdx <= currentIdx && complaint.status !== 'rejected';
                const isCurrent = complaint.status === s;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        isDone ? 'bg-blue-600 text-white' : isCurrent ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className={`text-sm font-medium ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                      {STATUS_LABELS[s]}
                    </span>
                  </div>
                );
              })}
              {complaint.status === 'rejected' && (
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-400 text-xs font-bold text-white">!</div>
                  <span className="text-sm font-medium text-slate-600">Rejected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Update Complaint">
        <div className="space-y-4">
          {isAdmin && (
            <>
              <div>
                <label className="label">Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as ComplaintStatus)} className="input">
                  {(Object.keys(STATUS_LABELS) as ComplaintStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as ComplaintPriority)} className="input">
                  {(Object.keys(PRIORITY_LABELS) as ComplaintPriority[]).map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Category</label>
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as ComplaintCategory)} className="input">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Admin Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Add internal notes about this complaint..."
                  className="input resize-none"
                />
              </div>
            </>
          )}
          {!isAdmin && isOwner && (
            <div>
              <label className="label">Category</label>
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as ComplaintCategory)} className="input">
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-400">Citizens can update the complaint category.</p>
            </div>
          )}
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setEditOpen(false)} className="btn-secondary">
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-500">
        <Icon size={15} /> {label}
      </span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
