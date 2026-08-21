import { useI18n } from '@/context/I18nContext';
import { Globe, Bell, Shield } from 'lucide-react';

export function SettingsPage() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your application preferences</p>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Globe size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Language</p>
            <p className="text-xs text-slate-500">Choose your preferred language</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLanguage('en')}
            className={`rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
              language === 'en' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
              language === 'hi' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
            }`}
          >
            हिन्दी (Hindi)
          </button>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Bell size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Notifications</p>
            <p className="text-xs text-slate-500">Manage your notification preferences</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Email notifications</span>
          <button className="relative h-6 w-11 rounded-full bg-blue-600">
            <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Push notifications</span>
          <button className="relative h-6 w-11 rounded-full bg-slate-200">
            <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
          </button>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <Shield size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Privacy & Security</p>
            <p className="text-xs text-slate-500">Your data is protected with Row Level Security</p>
          </div>
        </div>
      </div>
    </div>
  );
}
