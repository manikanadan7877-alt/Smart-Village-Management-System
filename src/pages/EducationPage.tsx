import { GraduationCap, Users, BookOpen, School } from 'lucide-react';

export function EducationPage() {
  const stats = [
    { label: 'Schools', value: '4', icon: School, color: 'indigo' },
    { label: 'Students', value: '420', icon: Users, color: 'blue' },
    { label: 'Teachers', value: '18', icon: GraduationCap, color: 'green' },
    { label: 'Libraries', value: '2', icon: BookOpen, color: 'amber' },
  ];

  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Education</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor educational facilities and enrollment</p>
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
        <h2 className="mb-4 font-bold text-slate-900">Schools Overview</h2>
        <div className="space-y-3">
          {[
            { name: 'Government Primary School', students: 180, level: 'Primary' },
            { name: 'Zilla Parishad High School', students: 160, level: 'Secondary' },
            { name: 'Anganwadi Center', students: 80, level: 'Pre-Primary' },
          ].map((school) => (
            <div key={school.name} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{school.name}</p>
                <p className="text-xs text-slate-500">{school.students} students · {school.level}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
