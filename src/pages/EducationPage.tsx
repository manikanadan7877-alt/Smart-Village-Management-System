import { useNavigate } from 'react-router-dom';
import { EditableModulePage, type ModuleFeatureConfig, type ModuleCardConfig } from '@/components/EditableModulePage';
import {
  GraduationCap, School, Users, BookOpen, Calendar, Award,
  Building, TrendingUp,
} from 'lucide-react';

const FEATURES: ModuleFeatureConfig[] = [
  { key: 'schools', labelKey: 'edu.schools', defaultValue: '4', icon: School, color: '#3b82f6' },
  { key: 'students', labelKey: 'edu.students', defaultValue: '386', icon: Users, color: '#3b82f6' },
  { key: 'teachers', labelKey: 'edu.teachers', defaultValue: '24', icon: GraduationCap, color: '#22c55e' },
  { key: 'avg_attendance', labelKey: 'edu.avgAttendance', defaultValue: '91%', icon: Calendar, color: '#22c55e' },
  { key: 'scholarship_students', labelKey: 'edu.scholarshipStudents', defaultValue: '42', icon: Award, color: '#eab308' },
  { key: 'libraries', labelKey: 'edu.libraries', defaultValue: '2', icon: Building, color: '#06b6d4' },
  { key: 'textbooks_issued', labelKey: 'edu.textbooksIssued', defaultValue: '1,240', icon: BookOpen, color: '#22c55e' },
  { key: 'pass_rate', labelKey: 'edu.passRate', defaultValue: '94%', icon: TrendingUp, color: '#22c55e' },
];

export function EducationPage() {
  const navigate = useNavigate();

  const cards: ModuleCardConfig[] = [
    {
      titleKey: 'edu.schoolsOverview',
      icon: School,
      color: '#3b82f6',
      rows: [
        { key: 'school_govt_primary', label: 'Govt Primary School', defaultValue: '142 students', defaultStatus: 'good' },
        { key: 'school_govt_high', label: 'Govt High School', defaultValue: '168 students', defaultStatus: 'good' },
        { key: 'school_panchayat_middle', label: 'Panchayat Middle School', defaultValue: '56 students', defaultStatus: 'good' },
        { key: 'school_anganwadi', label: 'Anganwadi Center', defaultValue: '20 children', defaultStatus: 'good' },
      ],
    },
    {
      titleKey: 'edu.attendanceToday',
      icon: Calendar,
      color: '#22c55e',
      rows: [
        { key: 'att_primary', label: 'Primary School', defaultValue: '94%', defaultStatus: 'good' },
        { key: 'att_high', label: 'High School', defaultValue: '89%', defaultStatus: 'good' },
        { key: 'att_middle', label: 'Middle School', defaultValue: '91%', defaultStatus: 'good' },
      ],
    },
    {
      titleKey: 'edu.studentPerformance',
      icon: TrendingUp,
      color: '#eab308',
      actionLabelKey: 'edu.viewAnalytics',
      onAction: () => navigate('/analytics'),
      rows: [
        { key: 'perf_10th', label: '10th Board Result', defaultValue: '94% pass', defaultStatus: 'good' },
        { key: 'perf_12th', label: '12th Board Result', defaultValue: '88% pass', defaultStatus: 'good' },
        { key: 'perf_olympiad', label: 'Science Olympiad', defaultValue: '2 medals', defaultStatus: 'good' },
        { key: 'perf_sports', label: 'Sports Achievements', defaultValue: 'District level', defaultStatus: 'good' },
      ],
    },
    {
      titleKey: 'edu.schoolFacilities',
      icon: Building,
      color: '#06b6d4',
      rows: [
        { key: 'fac_smart_class', label: 'Smart Classroom', defaultValue: '2 schools', defaultStatus: 'good' },
        { key: 'fac_computer_lab', label: 'Computer Lab', defaultValue: '3 labs', defaultStatus: 'good' },
        { key: 'fac_playground', label: 'Playground', defaultValue: 'All schools', defaultStatus: 'good' },
        { key: 'fac_drinking_water', label: 'Drinking Water', defaultValue: 'All schools', defaultStatus: 'good' },
        { key: 'fac_toilets', label: 'Toilets', defaultValue: 'All schools', defaultStatus: 'good' },
      ],
    },
  ];

  return (
    <EditableModulePage
      moduleName="education"
      titleKey="edu.title"
      subtitleKey="edu.subtitle"
      icon={GraduationCap}
      color="#3b82f6"
      features={FEATURES}
      cards={cards}
    />
  );
}
