import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { I18nProvider } from '@/context/I18nContext';
import { Layout } from '@/components/Layout';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SubmitComplaintPage } from '@/pages/SubmitComplaintPage';
import { ComplaintsPage } from '@/pages/ComplaintsPage';
import { ComplaintDetailPage } from '@/pages/ComplaintDetailPage';
import { MapPage } from '@/pages/MapPage';
import { WaterTanksPage } from '@/pages/WaterTanksPage';
import { GarbageBinsPage } from '@/pages/GarbageBinsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AgriculturePage } from '@/pages/AgriculturePage';
import { HealthcarePage } from '@/pages/HealthcarePage';
import { EducationPage } from '@/pages/EducationPage';
import { InfrastructurePage } from '@/pages/InfrastructurePage';
import { SettingsPage } from '@/pages/SettingsPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><AuthPage mode="signup" /></PublicRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/complaints" element={<ProtectedRoute><ComplaintsPage /></ProtectedRoute>} />
      <Route path="/complaints/new" element={<ProtectedRoute><SubmitComplaintPage /></ProtectedRoute>} />
      <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
      <Route path="/water-tanks" element={<ProtectedRoute adminOnly><WaterTanksPage /></ProtectedRoute>} />
      <Route path="/garbage-bins" element={<ProtectedRoute adminOnly><GarbageBinsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute adminOnly><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      <Route path="/agriculture" element={<ProtectedRoute><AgriculturePage /></ProtectedRoute>} />
      <Route path="/healthcare" element={<ProtectedRoute><HealthcarePage /></ProtectedRoute>} />
      <Route path="/education" element={<ProtectedRoute><EducationPage /></ProtectedRoute>} />
      <Route path="/infrastructure" element={<ProtectedRoute><InfrastructurePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <I18nProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </I18nProvider>
    </AuthProvider>
  );
}
