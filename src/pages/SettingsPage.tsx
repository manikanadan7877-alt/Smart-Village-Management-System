import { useNavigate } from 'react-router-dom';
import { ModuleHeader, ModulePageWrapper, ModuleCardBox, StatusRow } from '@/components/ModulePage';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { Settings, Bell, Globe, Shield, User } from 'lucide-react';

export function SettingsPage() {
  const { profile } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const navigate = useNavigate();

  return (
    <ModulePageWrapper>
      <ModuleHeader title={t('settings.title')} subtitle={t('settings.subtitle')} icon={Settings} color="#64748b" />

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title={t('settings.account')} icon={User} color="#3b82f6" actionLabel={t('settings.editProfile')} onAction={() => navigate('/profile')}>
          <div className="space-y-2.5">
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-xs text-slate-500">{t('settings.fullName')}</p>
              <p className="text-sm font-semibold text-slate-900">{profile?.full_name || 'User'}</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-xs text-slate-500">{t('settings.role')}</p>
              <p className="text-sm font-semibold text-slate-900 capitalize">{profile?.role || '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-xs text-slate-500">{t('settings.phone')}</p>
              <p className="text-sm font-semibold text-slate-900">{profile?.phone || t('settings.notSet')}</p>
            </div>
          </div>
        </ModuleCardBox>

        <ModuleCardBox title={t('settings.notifications')} icon={Bell} color="#f59e0b">
          <div className="space-y-2.5">
            <StatusRow label={t('settings.waterAlerts')} value={t('settings.enabled')} status="good" />
            <StatusRow label={t('settings.wasteAlerts')} value={t('settings.enabled')} status="good" />
            <StatusRow label={t('settings.complaintAlerts')} value={t('settings.enabled')} status="good" />
            <StatusRow label={t('settings.emergencyAlerts')} value={t('settings.enabled')} status="good" />
            <StatusRow label={t('settings.weeklyReports')} value={t('settings.disabled')} status="moderate" />
          </div>
        </ModuleCardBox>

        <ModuleCardBox title={t('settings.languageRegion')} icon={Globe} color="#06b6d4">
          <div className="space-y-3">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-600">{t('lang.displayLanguage')}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    language === 'en'
                      ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t('lang.english')}
                </button>
                <button
                  onClick={() => setLanguage('ta')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    language === 'ta'
                      ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t('lang.tamil')}
                </button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-600">{t('lang.timezone')}</p>
              <p className="text-sm text-slate-700">Asia/Kolkata (IST)</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-600">{t('lang.dateFormat')}</p>
              <p className="text-sm text-slate-700">DD/MM/YYYY</p>
            </div>
          </div>
        </ModuleCardBox>

        <ModuleCardBox title={t('settings.security')} icon={Shield} color="#22c55e">
          <div className="space-y-2.5">
            <StatusRow label={t('settings.emailVerified')} value={t('settings.emailVerified')} status="good" />
            <StatusRow label={t('settings.twoFactor')} value={t('settings.disabled')} status="moderate" />
            <StatusRow label={t('settings.sessionTimeout')} value={t('settings.30minutes')} status="good" />
            <StatusRow label={t('settings.passwordChanged')} value={t('settings.never')} status="moderate" />
          </div>
        </ModuleCardBox>
      </div>
    </ModulePageWrapper>
  );
}
