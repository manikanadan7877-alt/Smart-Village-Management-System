import type { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '@/lib/types';
import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS } from '@/lib/types';
import { CATEGORY_COLORS, PRIORITY_COLORS, STATUS_COLORS } from '@/lib/constants';
import {
  Construction, Trash2, Droplets, Lightbulb, Waves, AlertCircle,
  AlertTriangle, ArrowUp, ArrowDown, Minus, Clock, Loader, CheckCircle, XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function CategoryBadge({ category, showIcon = true }: { category: ComplaintCategory; showIcon?: boolean }) {
  const icons: Record<ComplaintCategory, LucideIcon> = {
    road_damage: Construction,
    garbage_overflow: Trash2,
    water_leakage: Droplets,
    street_light: Lightbulb,
    drainage: Waves,
    other: AlertCircle,
  };
  const Icon = icons[category];
  const color = CATEGORY_COLORS[category];
  return (
    <span
      className="badge"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {showIcon && <Icon size={13} />}
      {CATEGORY_LABELS[category]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ComplaintPriority }) {
  const icons: Record<ComplaintPriority, LucideIcon> = {
    high: ArrowUp,
    medium: Minus,
    low: ArrowDown,
  };
  const Icon = icons[priority];
  const color = PRIORITY_COLORS[priority];
  return (
    <span className="badge" style={{ backgroundColor: `${color}15`, color }}>
      <Icon size={13} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const icons: Record<ComplaintStatus, LucideIcon> = {
    pending: Clock,
    in_progress: Loader,
    resolved: CheckCircle,
    rejected: XCircle,
  };
  const Icon = icons[status];
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  return (
    <span className="badge" style={{ backgroundColor: `${color}15`, color }}>
      <Icon size={13} className={status === 'in_progress' ? 'animate-spin' : ''} />
      {label}
    </span>
  );
}

export function AlertTriangleBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="badge bg-red-50 text-red-600">
      <AlertTriangle size={13} />
      Alert
    </span>
  );
}
