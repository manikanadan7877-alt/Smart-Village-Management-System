import { Wheat, TrendingUp, Droplets, Sun } from 'lucide-react';

export function AgriculturePage() {
  const stats = [
    { label: 'Active Farms', value: '124', icon: Wheat, color: 'amber' },
    { label: 'Crop Yield (ton)', value: '1,420', icon: TrendingUp, color: 'green' },
    { label: 'Irrigation Coverage', value: '87%', icon: Droplets, color: 'cyan' },
    { label: 'Solar Pumps', value: '32', icon: Sun, color: 'orange' },
  ];

  const colorMap: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agriculture</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor agricultural activities and resources</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[stat.color]}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="mb-4 font-bold text-slate-900">Crop Distribution</h2>
        <div className="space-y-3">
          {[
            { crop: 'Rice', pct: 35 },
            { crop: 'Wheat', pct: 28 },
            { crop: 'Sugarcane', pct: 20 },
            { crop: 'Vegetables', pct: 17 },
          ].map((item) => (
            <div key={item.crop}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-slate-700">{item.crop}</span>
                <span className="text-slate-500">{item.pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
