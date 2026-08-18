import { useNavigate } from 'react-router-dom';
import { ModuleHeader, FeatureGrid, ModuleCardBox, ModulePageWrapper, StatusRow } from '@/components/ModulePage';
import {
  GraduationCap, School, Users, BookOpen, Calendar, Award,
  Building, TrendingUp,
} from 'lucide-react';

const FEATURES = [
  { icon: School, label: 'Schools', value: '4', color: '#3b82f6' },
  { icon: Users, label: 'Students', value: '386', color: '#3b82f6' },
  { icon: GraduationCap, label: 'Teachers', value: '24', color: '#22c55e' },
  { icon: Calendar, label: 'Avg Attendance', value: '91%', color: '#22c55e' },
  { icon: Award, label: 'Scholarship Students', value: '42', color: '#eab308' },
  { icon: Building, label: 'Libraries', value: '2', color: '#06b6d4' },
  { icon: BookOpen, label: 'Textbooks Issued', value: '1,240', color: '#22c55e' },
  { icon: TrendingUp, label: 'Pass Rate', value: '94%', color: '#22c55e' },
];

export function EducationPage() {
  const navigate = useNavigate();
  return (
    <ModulePageWrapper>
      <ModuleHeader title="Education" subtitle="Schools, students, teachers, attendance, and performance" icon={GraduationCap} color="#3b82f6" />
      <FeatureGrid features={FEATURES} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title="Schools Overview" icon={School} color="#3b82f6">
          <div className="space-y-2.5">
            <StatusRow label="Govt Primary School" value="142 students" status="good" />
            <StatusRow label="Govt High School" value="168 students" status="good" />
            <StatusRow label="Panchayat Middle School" value="56 students" status="good" />
            <StatusRow label="Anganwadi Center" value="20 children" status="good" />
          </div>
        </ModuleCardBox>

        <ModuleCardBox title="Attendance Today" icon={Calendar} color="#22c55e">
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium text-slate-600">Primary School</span>
                <span className="font-bold text-slate-900">94%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-green-500 transition-all" style={{ width: '94%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium text-slate-600">High School</span>
                <span className="font-bold text-slate-900">89%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-green-500 transition-all" style={{ width: '89%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium text-slate-600">Middle School</span>
                <span className="font-bold text-slate-900">91%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-green-500 transition-all" style={{ width: '91%' }} />
              </div>
            </div>
          </div>
        </ModuleCardBox>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title="Student Performance" icon={TrendingUp} color="#eab308" actionLabel="View Analytics" onAction={() => navigate('/analytics')}>
          <div className="space-y-2.5">
            <StatusRow label="10th Board Result" value="94% pass" status="good" />
            <StatusRow label="12th Board Result" value="88% pass" status="good" />
            <StatusRow label="Science Olympiad" value="2 medals" status="good" />
            <StatusRow label="Sports Achievements" value="District level" status="good" />
          </div>
        </ModuleCardBox>

        <ModuleCardBox title="School Facilities" icon={Building} color="#06b6d4">
          <div className="space-y-2.5">
            <StatusRow label="Smart Classroom" value="2 schools" status="good" />
            <StatusRow label="Computer Lab" value="3 labs" status="good" />
            <StatusRow label="Playground" value="All schools" status="good" />
            <StatusRow label="Drinking Water" value="All schools" status="good" />
            <StatusRow label="Toilets" value="All schools" status="good" />
          </div>
        </ModuleCardBox>
      </div>
    </ModulePageWrapper>
  );
}
