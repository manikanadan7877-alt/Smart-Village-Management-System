import { HeartPulse, Users, Stethoscope, Pill } from 'lucide-react';

export function HealthcarePage() {
  const stats = [
    { label: 'Population', value: '3,240', icon: Users, color: 'blue' },
    { label: 'Health Workers', value: '12', icon: Stethoscope, color: 'green' },
    { label: 'Active Patients', value: '48', icon: HeartPulse, color: 'red' },
    { label: 'Medicine Stock', value: '85%', icon: Pill, color: 'amber' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Healthcare</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor healthcare services and resources</p>
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
        <h2 className="mb-4 font-bold text-slate-900">Health Camps Schedule</h2>
        <div className="space-y-3">
          {[
            { date: 'Aug 25', title: 'General Health Check-up', status: 'Scheduled' },
            { date: 'Sep 02', title: 'Vaccination Drive', status: 'Scheduled' },
            { date: 'Sep 10', title: 'Eye Check-up Camp', status: 'Planning' },
          ].map((camp) => (
            <div key={camp.title} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{camp.title}</p>
                <p className="text-xs text-slate-500">{camp.date}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">{camp.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
