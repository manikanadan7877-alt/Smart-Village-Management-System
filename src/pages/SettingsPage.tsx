import { useNavigate } from 'react-router-dom';
import { ModuleHeader, ModulePageWrapper, ModuleCardBox, StatusRow } from '@/components/ModulePage';
import { useAuth } from '@/context/AuthContext';
import { Settings, Bell, Globe, Shield, User, Palette } from 'lucide-react';

export function SettingsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <ModulePageWrapper>
      <ModuleHeader title="Settings" subtitle="Manage your account and application preferences" icon={Settings} color="#64748b" />

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title="Account" icon={User} color="#3b82f6" actionLabel="Edit Profile" onAction={() => navigate('/profile')}>
          <div className="space-y-2.5">
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-xs text-slate-500">Full Name</p>
              <p className="text-sm font-semibold text-slate-900">{profile?.full_name || 'User'}</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-xs text-slate-500">Role</p>
              <p className="text-sm font-semibold text-slate-900 capitalize">{profile?.role || '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-xs text-slate-500">Phone</p>
              <p className="text-sm font-semibold text-slate-900">{profile?.phone || 'Not set'}</p>
            </div>
          </div>
        </ModuleCardBox>

        <ModuleCardBox title="Notifications" icon={Bell} color="#f59e0b">
          <div className="space-y-2.5">
            <StatusRow label="Water level alerts" value="Enabled" status="good" />
            <StatusRow label="Waste collection alerts" value="Enabled" status="good" />
            <StatusRow label="Complaint updates" value="Enabled" status="good" />
            <StatusRow label="Emergency notifications" value="Enabled" status="good" />
            <StatusRow label="Weekly report emails" value="Disabled" status="moderate" />
          </div>
        </ModuleCardBox>

        <ModuleCardBox title="Language & Region" icon={Globe} color="#06b6d4">
          <div className="space-y-3">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-600">Display Language</p>
              <div className="flex gap-2">
                <button className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">English</button>
                <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">தமிழ்</button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-600">Timezone</p>
              <p className="text-sm text-slate-700">Asia/Kolkata (IST)</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-600">Date Format</p>
              <p className="text-sm text-slate-700">DD/MM/YYYY</p>
            </div>
          </div>
        </ModuleCardBox>

        <ModuleCardBox title="Security" icon={Shield} color="#22c55e">
          <div className="space-y-2.5">
            <StatusRow label="Email Verification" value="Verified" status="good" />
            <StatusRow label="Two-Factor Auth" value="Disabled" status="moderate" />
            <StatusRow label="Session Timeout" value="30 minutes" status="good" />
            <StatusRow label="Password Last Changed" value="Never" status="moderate" />
          </div>
        </ModuleCardBox>
      </div>
    </ModulePageWrapper>
  );
}
