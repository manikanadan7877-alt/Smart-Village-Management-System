import { HardHat, Route, Lightbulb, Building2 } from 'lucide-react';

export function InfrastructurePage() {
  const stats = [
    { label: 'Road Projects', value: '6', icon: Route, color: 'orange' },
    { label: 'Street Lights', value: '340', icon: Lightbulb, color: 'amber' },
    { label: 'Buildings', value: '12', icon: Building2, color: 'slate' },
    { label: 'Active Projects', value: '3', icon: HardHat, color: 'blue' },
  ];

  const colorMap: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Infrastructure</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor roads, lighting, and public infrastructure</p>
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
        <h2 className="mb-4 font-bold text-slate-900">Active Projects</h2>
        <div className="space-y-3">
          {[
            { name: 'Road Repair - Main Street', progress: 65 },
            { name: 'Street Light Installation', progress: 40 },
            { name: 'Community Hall Renovation', progress: 80 },
          ].map((project) => (
            <div key={project.name} className="rounded-xl bg-slate-50 p-3">
              <div className="mb-2 flex justify-between">
                <p className="text-sm font-medium text-slate-900">{project.name}</p>
                <span className="text-xs text-slate-500">{project.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
