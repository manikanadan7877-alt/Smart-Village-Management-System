import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import {
  Trees, LayoutDashboard, FileText, MapPin, User, Settings,
  LogOut, Menu, X, Droplets, Trash2, BarChart3, Wheat, HeartPulse,
  GraduationCap, HardHat, Plus, Globe,
} from 'lucide-react';

interface NavItem {
  path: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { path: '/complaints/new', labelKey: 'submitComplaint', icon: Plus },
  { path: '/complaints', labelKey: 'complaints', icon: FileText },
  { path: '/map', labelKey: 'map', icon: MapPin },
  { path: '/water-tanks', labelKey: 'waterTanks', icon: Droplets, adminOnly: true },
  { path: '/garbage-bins', labelKey: 'garbageBins', icon: Trash2, adminOnly: true },
  { path: '/analytics', labelKey: 'analytics', icon: BarChart3, adminOnly: true },
  { path: '/agriculture', labelKey: 'agriculture', icon: Wheat },
  { path: '/healthcare', labelKey: 'healthcare', icon: HeartPulse },
  { path: '/education', labelKey: 'education', icon: GraduationCap },
  { path: '/infrastructure', labelKey: 'infrastructure', icon: HardHat },
  { path: '/profile', labelKey: 'profile', icon: User },
  { path: '/settings', labelKey: 'settings', icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 flex h-full w-64 flex-col bg-slate-900 text-slate-300 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <Trees size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Digital Twin Village</h1>
            <p className="text-xs text-slate-400">Smart Management</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 px-3 py-4">
          <div className="mb-3 flex items-center gap-2 px-3">
            <Globe size={16} className="text-slate-400" />
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="text-xs font-medium text-slate-400 hover:text-white"
            >
              {language === 'en' ? 'English' : 'हिन्दी'}
            </button>
          </div>
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-white">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-slate-400 capitalize">{profile?.role || ''}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={18} />
            {t('signOut')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <Trees size={20} className="text-blue-600" />
            <span className="text-sm font-bold">Digital Twin Village</span>
          </div>
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
