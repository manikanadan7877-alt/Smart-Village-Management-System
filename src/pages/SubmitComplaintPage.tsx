import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { ComplaintCategory } from '@/lib/types';
import { CATEGORY_OPTIONS } from '@/lib/types';
import { Loader2, MapPin, Camera, Send } from 'lucide-react';

export function SubmitComplaintPage() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('road_damage');
  const [description, setDescription] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: insertError } = await supabase
      .from('complaints')
      .insert({
        user_id: session?.user.id,
        title,
        category,
        description,
        location_label: locationLabel,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      navigate('/complaints');
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Report an Issue</h1>
        <p className="mt-1 text-sm text-slate-500">Submit a new complaint or issue in your village</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief title for the issue"
            className="input"
          />
        </div>

        <div>
          <label className="label">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
            className="input"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the issue in detail..."
            className="input"
          />
        </div>

        <div>
          <label className="label">Location</label>
          <div className="relative">
            <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="e.g., Near the village temple"
              className="input pl-11"
            />
          </div>
        </div>

        <div>
          <label className="label">Photo (optional)</label>
          <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-8 text-slate-400">
            <Camera size={24} />
            <span className="ml-2 text-sm">Photo upload coming soon</span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Submit Complaint</>}
        </button>
      </form>
    </div>
  );
}
