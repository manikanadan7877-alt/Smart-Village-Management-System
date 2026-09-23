import { useNavigate } from 'react-router-dom';
import { EditableModulePage, type ModuleFeatureConfig, type ModuleCardConfig } from '@/components/EditableModulePage';
import {
  Wrench, Route, Building, Building2, Lightbulb, Construction,
  AlertTriangle, TrendingUp,
} from 'lucide-react';

const FEATURES: ModuleFeatureConfig[] = [
  { key: 'roads', labelKey: 'infra.roads', defaultValue: '18 km', icon: Route, color: '#64748b' },
  { key: 'bridges', labelKey: 'infra.bridges', defaultValue: '2', icon: Building2, color: '#64748b' },
  { key: 'govt_buildings', labelKey: 'infra.govtBuildings', defaultValue: '6', icon: Building, color: '#3b82f6' },
  { key: 'street_lights', labelKey: 'infra.streetLights', defaultValue: '48', icon: Lightbulb, color: '#eab308' },
  { key: 'active_projects', labelKey: 'infra.activeProjects', defaultValue: '3', icon: Construction, color: '#f59e0b' },
  { key: 'road_damages', labelKey: 'infra.roadDamages', defaultValue: '5', icon: AlertTriangle, color: '#ef4444' },
  { key: 'maintenance_due', labelKey: 'infra.maintenanceDue', defaultValue: '2', icon: Wrench, color: '#f59e0b' },
  { key: 'asset_value', labelKey: 'infra.assetValue', defaultValue: '2.4 Cr', icon: TrendingUp, color: '#22c55e' },
];

export function InfrastructurePage() {
  const navigate = useNavigate();

  const cards: ModuleCardConfig[] = [
    {
      titleKey: 'infra.roadCondition',
      icon: Route,
      color: '#64748b',
      rows: [
        { key: 'road_main_street', label: 'Main Street', defaultValue: 'Good', defaultStatus: 'good', editType: 'select', editOptions: ['Good', 'Worn surface', '2 potholes', 'Under repair', 'Critical'] },
        { key: 'road_market', label: 'Market Road', defaultValue: '2 potholes', defaultStatus: 'bad', editType: 'select', editOptions: ['Good', 'Worn surface', '2 potholes', 'Under repair', 'Critical'] },
        { key: 'road_school', label: 'School Road', defaultValue: 'Good', defaultStatus: 'good', editType: 'select', editOptions: ['Good', 'Worn surface', '2 potholes', 'Under repair', 'Critical'] },
        { key: 'road_farm_access', label: 'Farm Access Road', defaultValue: 'Worn surface', defaultStatus: 'moderate', editType: 'select', editOptions: ['Good', 'Worn surface', '2 potholes', 'Under repair', 'Critical'] },
        { key: 'road_ring', label: 'Ring Road', defaultValue: 'Good', defaultStatus: 'good', editType: 'select', editOptions: ['Good', 'Worn surface', '2 potholes', 'Under repair', 'Critical'] },
      ],
    },
    {
      titleKey: 'infra.streetLightStatus',
      icon: Lightbulb,
      color: '#eab308',
      rows: [
        { key: 'lights_main_street', label: 'Main Street (12)', defaultValue: 'All working', defaultStatus: 'good', editType: 'select', editOptions: ['All working', '1 not working', '2 not working', 'All not working'] },
        { key: 'lights_market', label: 'Market Road (8)', defaultValue: '2 not working', defaultStatus: 'bad', editType: 'select', editOptions: ['All working', '1 not working', '2 not working', 'All not working'] },
        { key: 'lights_school_zone', label: 'School Zone (10)', defaultValue: 'All working', defaultStatus: 'good', editType: 'select', editOptions: ['All working', '1 not working', '2 not working', 'All not working'] },
        { key: 'lights_park', label: 'Park Area (8)', defaultValue: 'All working', defaultStatus: 'good', editType: 'select', editOptions: ['All working', '1 not working', '2 not working', 'All not working'] },
        { key: 'lights_residential', label: 'Residential (10)', defaultValue: 'All working', defaultStatus: 'good', editType: 'select', editOptions: ['All working', '1 not working', '2 not working', 'All not working'] },
      ],
    },
    {
      titleKey: 'infra.activeProjects',
      icon: Construction,
      color: '#f59e0b',
      rows: [
        { key: 'proj_drainage', label: 'Drainage Upgrade — Main Street', defaultValue: '65% complete', defaultStatus: 'good' },
        { key: 'proj_bus_stop', label: 'Bus Stop Construction', defaultValue: '40% complete', defaultStatus: 'moderate' },
        { key: 'proj_street_lights', label: 'Street Light Replacement — Market Road', defaultValue: '20% complete', defaultStatus: 'moderate' },
      ],
    },
    {
      titleKey: 'infra.riskAssessment',
      icon: AlertTriangle,
      color: '#ef4444',
      actionLabelKey: 'infra.viewAiAnalytics',
      onAction: () => navigate('/analytics'),
      rows: [
        { key: 'risk_market_road', label: 'Market Road', defaultValue: 'High Risk', defaultStatus: 'bad', editType: 'select', editOptions: ['Low Risk', 'Moderate', 'High Risk', 'Critical'] },
        { key: 'risk_farm_bridge', label: 'Farm Access Bridge', defaultValue: 'Moderate', defaultStatus: 'moderate', editType: 'select', editOptions: ['Low Risk', 'Moderate', 'High Risk', 'Critical'] },
        { key: 'risk_drainage', label: 'Old Drainage System', defaultValue: 'Low Risk', defaultStatus: 'good', editType: 'select', editOptions: ['Low Risk', 'Moderate', 'High Risk', 'Critical'] },
      ],
    },
  ];

  return (
    <EditableModulePage
      moduleName="infrastructure"
      titleKey="infra.title"
      subtitleKey="infra.subtitle"
      icon={Wrench}
      color="#64748b"
      features={FEATURES}
      cards={cards}
    />
  );
}
