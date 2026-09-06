import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { Loader2, Save } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

export interface EditField {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select';
  options?: string[];
}

interface EditMetricModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: EditField[];
  initialValues: Record<string, string>;
  onSave: (values: Record<string, string>) => Promise<void>;
}

export function EditMetricModal({ open, onClose, title, fields, initialValues, onSave }: EditMetricModalProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setError(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(values);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.failedToSave'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="label">{field.label}</label>
            {field.type === 'select' && field.options ? (
              <select
                value={values[field.key] ?? ''}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                className="input"
              >
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={values[field.key] ?? ''}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                className="input"
              />
            )}
          </div>
        ))}
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">{t('common.cancel')}</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {t('common.saveChanges')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
