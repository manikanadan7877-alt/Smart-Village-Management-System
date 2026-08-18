import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/lib/api';
import { User, Phone, Shield, Save, Loader2, CheckCircle, Calendar } from 'lucide-react';

export function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile(profile.id, { full_name: fullName, phone });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500">Manage your account information</p>
      </div>

      {/* Profile header card */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-bold text-white shadow-md">
            {profile.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{profile.full_name || 'Anonymous User'}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className={`badge ${profile.role === 'admin' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                {profile.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                {profile.role === 'admin' ? 'Administrator' : 'Citizen'}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar size={12} /> Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-6">
        <h3 className="mb-4 font-bold text-slate-900">Edit Information</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input pl-11"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input pl-11"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="label">Account Type</label>
            <div className="relative">
              <Shield size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={profile.role === 'admin' ? 'Administrator' : 'Citizen'}
                disabled
                className="input pl-11 bg-slate-50 text-slate-500"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Account type cannot be changed after registration</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          {saved && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
              <CheckCircle size={18} /> Profile updated successfully
            </div>
          )}

          <button onClick={handleSave} disabled={saving} className="btn-primary w-full sm:w-auto">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
