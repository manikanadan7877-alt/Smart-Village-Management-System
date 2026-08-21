import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Save, User } from 'lucide-react';

export function ProfilePage() {
  const { profile, session, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', session?.user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account information</p>
      </div>

      <div className="card space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <User size={28} />
          </div>
          <div>
            <p className="font-bold text-slate-900">{profile?.full_name || 'User'}</p>
            <p className="text-sm text-slate-500">{session?.user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium capitalize text-blue-600">
              {profile?.role || 'citizen'}
            </span>
          </div>
        </div>

        <div>
          <label className="label">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="label">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            className="input"
          />
        </div>

        {saved && (
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
            Profile saved successfully!
          </div>
        )}

        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Profile</>}
        </button>
      </div>
    </div>
  );
}
