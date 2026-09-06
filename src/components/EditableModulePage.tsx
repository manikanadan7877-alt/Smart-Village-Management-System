import { useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useModuleMetrics } from '@/hooks/useModuleMetrics';
import { EditMetricModal, type EditField } from '@/components/EditMetricModal';
import { ModuleHeader, FeatureGrid, ModuleCardBox, ModulePageWrapper } from '@/components/ModulePage';
import { CreditCard as Edit3, CheckCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ModuleFeatureConfig {
  key: string;
  labelKey: string;
  defaultValue: string;
  icon: LucideIcon;
  color: string;
}

export interface ModuleStatusRowConfig {
  key: string;
  label: string;
  defaultValue: string;
  defaultStatus: 'good' | 'moderate' | 'bad';
  editType?: 'text' | 'select';
  editOptions?: string[];
}

export interface ModuleCardConfig {
  titleKey: string;
  icon: LucideIcon;
  color: string;
  rows?: ModuleStatusRowConfig[];
  actionLabelKey?: string;
  onAction?: () => void;
  children?: ReactNode;
}

interface EditableModulePageProps {
  moduleName: string;
  titleKey: string;
  subtitleKey: string;
  icon: LucideIcon;
  color: string;
  features: ModuleFeatureConfig[];
  cards: ModuleCardConfig[];
  extraContent?: ReactNode;
}

export function EditableModulePage({
  moduleName,
  titleKey,
  subtitleKey,
  icon,
  color,
  features,
  cards,
  extraContent,
}: EditableModulePageProps) {
  const { profile } = useAuth();
  const { t } = useI18n();
  const { metrics, saveMetric } = useModuleMetrics(moduleName);
  const [editModal, setEditModal] = useState<{ open: boolean; fields: EditField[]; initialValues: Record<string, string>; title: string }>({
    open: false, fields: [], initialValues: {}, title: '',
  });
  const [toast, setToast] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  function getMetric(key: string, fallback: string): string {
    return metrics[key] ?? fallback;
  }

  function showToast() {
    setToast(t('common.updatedSuccessfully'));
    setTimeout(() => setToast(null), 3000);
  }

  const featureData = features.map((f) => ({
    icon: f.icon,
    label: t(f.labelKey),
    value: getMetric(`feature_${f.key}`, f.defaultValue),
    color: f.color,
  }));

  async function handleEditSave(values: Record<string, string>) {
    for (const [key, value] of Object.entries(values)) {
      const fullKey = features.some((f) => f.key === key) ? `feature_${key}` : key;
      await saveMetric(fullKey, value);
    }
    showToast();
  }

  function openEditFeature() {
    const fields: EditField[] = features.map((f) => ({
      key: f.key,
      label: t(f.labelKey),
      type: 'text',
    }));
    const initialValues: Record<string, string> = {};
    features.forEach((f) => {
      initialValues[f.key] = getMetric(`feature_${f.key}`, f.defaultValue);
    });
    setEditModal({ open: true, fields, initialValues, title: t('common.edit') });
  }

  function openEditCardRow(row: ModuleStatusRowConfig) {
    const fields: EditField[] = [{
      key: row.key,
      label: row.label,
      type: row.editType ?? 'text',
      options: row.editOptions,
    }];
    setEditModal({
      open: true,
      fields,
      initialValues: { [row.key]: getMetric(row.key, row.defaultValue) },
      title: row.label,
    });
  }

  return (
    <ModulePageWrapper>
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-lg ring-1 ring-green-200">
          <CheckCircle size={18} /> {toast}
        </div>
      )}
      <div className="relative">
        <ModuleHeader title={t(titleKey)} subtitle={t(subtitleKey)} icon={icon} color={color} />
        {isAdmin && features.length > 0 && (
          <button
            onClick={openEditFeature}
            className="absolute right-0 top-0 flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Edit3 size={15} /> {t('common.edit')}
          </button>
        )}
      </div>
      <FeatureGrid features={featureData} />

      <div className="grid gap-6 lg:grid-cols-2">
        {cards.map((card, idx) => (
          <ModuleCardBox
            key={idx}
            title={t(card.titleKey)}
            icon={card.icon}
            color={card.color}
            actionLabel={card.actionLabelKey ? t(card.actionLabelKey) : undefined}
            onAction={card.onAction}
          >
            {card.children ? card.children : (
              <div className="space-y-2.5">
                {card.rows!.map((row) => {
                  const value = getMetric(row.key, row.defaultValue);
                  const status = deriveStatus(value, row.defaultStatus);
                  return (
                    <div key={row.key} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                      <span className="text-sm font-medium text-slate-600">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${status === 'good' ? 'bg-green-500' : status === 'moderate' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <span className={`text-sm font-bold ${status === 'good' ? 'text-green-600' : status === 'moderate' ? 'text-amber-600' : 'text-red-600'}`}>{value}</span>
                        {isAdmin && (
                          <button
                            onClick={() => openEditCardRow(row)}
                            className="ml-1 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Edit3 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ModuleCardBox>
        ))}
      </div>

      {extraContent}

      <EditMetricModal
        open={editModal.open}
        onClose={() => setEditModal({ ...editModal, open: false })}
        title={editModal.title}
        fields={editModal.fields}
        initialValues={editModal.initialValues}
        onSave={handleEditSave}
      />
    </ModulePageWrapper>
  );
}

function deriveStatus(value: string, defaultStatus: 'good' | 'moderate' | 'bad'): 'good' | 'moderate' | 'bad' {
  const lower = value.toLowerCase();
  if (lower.includes('critical') || lower.includes('stopped') || lower.includes('inactive') || lower.includes('bad') || lower.includes('low stock') || lower.includes('full')) {
    return 'bad';
  }
  if (lower.includes('warning') || lower.includes('moderate') || lower.includes('maintenance') || lower.includes('nearly full') || lower.includes('filling')) {
    return 'moderate';
  }
  return 'good';
}
