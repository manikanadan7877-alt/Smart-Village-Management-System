export function ProgressBar({
  value,
  max,
  color,
  height = 'h-2.5',
}: {
  value: number;
  max: number;
  color: string;
  height?: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className={`w-full ${height} rounded-full bg-slate-100 overflow-hidden`}>
      <div
        className={`${height} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function getLevelColor(pct: number, thresholds: { warning: number; critical: number }) {
  if (pct >= thresholds.critical) return '#ef4444';
  if (pct >= thresholds.warning) return '#f59e0b';
  return '#10b981';
}

export function getFillLevelColor(pct: number) {
  // For garbage bins: high fill is bad
  if (pct >= 80) return '#ef4444';
  if (pct >= 60) return '#f59e0b';
  return '#10b981';
}

export function getWaterLevelColor(pct: number) {
  // For water tanks: low level is bad
  if (pct <= 20) return '#ef4444';
  if (pct <= 40) return '#f59e0b';
  return '#10b981';
}
