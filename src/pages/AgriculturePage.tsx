import { useNavigate } from 'react-router-dom';
import { EditableModulePage, type ModuleFeatureConfig, type ModuleCardConfig } from '@/components/EditableModulePage';
import {
  Sprout, Tractor, Wheat, Droplets, FlaskConical, Bug,
  Sun, CloudRain, Activity, Beaker, TrendingUp, Map,
} from 'lucide-react';

const FEATURES: ModuleFeatureConfig[] = [
  { key: 'active_farmers', labelKey: 'agri.activeFarmers', defaultValue: '142', icon: Tractor, color: '#22c55e' },
  { key: 'farms', labelKey: 'agri.farms', defaultValue: '12', icon: Sprout, color: '#22c55e' },
  { key: 'crop_types', labelKey: 'agri.cropTypes', defaultValue: '8', icon: Wheat, color: '#eab308' },
  { key: 'soil_moisture', labelKey: 'agri.soilMoisture', defaultValue: '68%', icon: Droplets, color: '#3b82f6' },
  { key: 'soil_ph', labelKey: 'agri.soilPh', defaultValue: '6.8', icon: FlaskConical, color: '#06b6d4' },
  { key: 'pest_alerts', labelKey: 'agri.pestAlerts', defaultValue: '0', icon: Bug, color: '#22c55e' },
  { key: 'sunlight', labelKey: 'agri.sunlight', defaultValue: '8.2 hrs', icon: Sun, color: '#eab308' },
  { key: 'rainfall', labelKey: 'agri.rainfall', defaultValue: '12mm', icon: CloudRain, color: '#3b82f6' },
];

export function AgriculturePage() {
  const navigate = useNavigate();

  const cards: ModuleCardConfig[] = [
    {
      titleKey: 'agri.cropHealth',
      icon: Activity,
      color: '#22c55e',
      rows: [
        { key: 'crop_paddy', label: 'Paddy', defaultValue: 'Healthy', defaultStatus: 'good', editType: 'select', editOptions: ['Healthy', 'Moderate', 'At Risk', 'Critical'] },
        { key: 'crop_sugarcane', label: 'Sugarcane', defaultValue: 'Healthy', defaultStatus: 'good', editType: 'select', editOptions: ['Healthy', 'Moderate', 'At Risk', 'Critical'] },
        { key: 'crop_cotton', label: 'Cotton', defaultValue: 'Moderate', defaultStatus: 'moderate', editType: 'select', editOptions: ['Healthy', 'Moderate', 'At Risk', 'Critical'] },
        { key: 'crop_groundnut', label: 'Groundnut', defaultValue: 'Healthy', defaultStatus: 'good', editType: 'select', editOptions: ['Healthy', 'Moderate', 'At Risk', 'Critical'] },
      ],
    },
    {
      titleKey: 'agri.irrigationStatus',
      icon: Droplets,
      color: '#3b82f6',
      rows: [
        { key: 'irr_north_canal', label: 'North Canal', defaultValue: 'Flowing', defaultStatus: 'good', editType: 'select', editOptions: ['Flowing', 'Active', 'Inactive', 'Maintenance'] },
        { key: 'irr_south_borewell', label: 'South Borewell', defaultValue: 'Active', defaultStatus: 'good', editType: 'select', editOptions: ['Flowing', 'Active', 'Inactive', 'Maintenance'] },
        { key: 'irr_drip_a', label: 'Drip System A', defaultValue: 'Active', defaultStatus: 'good', editType: 'select', editOptions: ['Flowing', 'Active', 'Inactive', 'Maintenance'] },
        { key: 'irr_rainwater', label: 'Rainwater Storage', defaultValue: '12mm stored', defaultStatus: 'moderate' },
      ],
    },
    {
      titleKey: 'agri.fertilizerRecs',
      icon: Beaker,
      color: '#06b6d4',
      rows: [
        { key: 'fert_paddy', label: 'Paddy Fields (Zone 1)', defaultValue: 'Apply urea 20kg/acre', defaultStatus: 'moderate' },
        { key: 'fert_cotton', label: 'Cotton Fields (Zone 3)', defaultValue: 'Potash supplement needed', defaultStatus: 'moderate' },
      ],
    },
    {
      titleKey: 'agri.yieldPrediction',
      icon: TrendingUp,
      color: '#eab308',
      actionLabelKey: 'agri.viewAnalytics',
      onAction: () => navigate('/analytics'),
      rows: [
        { key: 'yield_paddy', label: 'Paddy', defaultValue: '4.2 tons/acre', defaultStatus: 'good' },
        { key: 'yield_sugarcane', label: 'Sugarcane', defaultValue: '38 tons/acre', defaultStatus: 'good' },
      ],
    },
    {
      titleKey: 'agri.farmMap',
      icon: Map,
      color: '#22c55e',
      actionLabelKey: 'agri.openFullMap',
      onAction: () => navigate('/map'),
      rows: [
        { key: 'farms_mapped', label: 'Active Farms Mapped', defaultValue: '12 farms across 4 zones', defaultStatus: 'good' },
      ],
    },
  ];

  return (
    <EditableModulePage
      moduleName="agriculture"
      titleKey="agri.title"
      subtitleKey="agri.subtitle"
      icon={Sprout}
      color="#22c55e"
      features={FEATURES}
      cards={cards}
    />
  );
}
