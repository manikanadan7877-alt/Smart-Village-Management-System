import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

export interface ModuleFeature {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
  detail?: string;
}

export interface ModuleCard {
  title: string;
  icon: LucideIcon;
  color: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function ModuleHeader({
  title,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Icon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export function FeatureGrid({ features }: { features: ModuleFeature[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {features.map((f) => (
        <div key={f.label} className="card p-5 hover:shadow-md transition-shadow">
          <div
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${f.color}15`, color: f.color }}
          >
            <f.icon size={20} />
          </div>
          <p className="text-sm font-medium text-slate-500">{f.label}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{f.value}</p>
          {f.detail && <p className="mt-1 text-xs text-slate-400">{f.detail}</p>}
        </div>
      ))}
    </div>
  );
}

export function ModuleCardBox({ title, icon: Icon, color, children, actionLabel, onAction }: ModuleCard) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={20} style={{ color }} />
          <h3 className="font-bold text-slate-900">{title}</h3>
        </div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {actionLabel} <ArrowRight size={15} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function StatusRow({ label, value, status }: { label: string; value: string; status: 'good' | 'moderate' | 'bad' }) {
  const colors = { good: 'text-green-600', moderate: 'text-amber-600', bad: 'text-red-600' };
  const dots = { good: 'bg-green-500', moderate: 'bg-amber-500', bad: 'bg-red-500' };
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dots[status]}`} />
        <span className={`text-sm font-bold ${colors[status]}`}>{value}</span>
      </div>
    </div>
  );
}

export function ModulePageWrapper({ children }: { children: ReactNode }) {
  return <div className="animate-fade-in space-y-6">{children}</div>;
}
