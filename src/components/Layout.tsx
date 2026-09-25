import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useMapSearch } from '@/context/MapSearchContext';
import { AIAssistant } from '@/components/AIAssistant';
import { NotificationBell } from '@/components/NotificationBell';
import { LocationSearch } from '@/components/LocationSearch';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Map, ClipboardList, Droplets, Trash2, BarChart3, User,
  LogOut, Menu, X, Trees, Cloud, Settings,
  Sprout, GraduationCap, Wrench, FileText,
  Bot, Mic, MessageSquare,
} from 'lucide-react';
import { useState, useEffect, type ReactNode } from 'react';

interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/map', labelKey: 'nav.map', icon: Map },
  { to: '/agriculture', labelKey: 'nav.agriculture', icon: Sprout },
  { to: '/water-tanks', labelKey: 'nav.water', icon: Droplets, adminOnly: true },
  { to: '/education', labelKey: 'nav.education', icon: GraduationCap },
  { to: '/garbage-bins', labelKey: 'nav.waste', icon: Trash2, adminOnly: true },
  { to: '/infrastructure', labelKey: 'nav.infrastructure', icon: Wrench },
  { to: '/complaints', labelKey: 'nav.citizen', icon: ClipboardList },
  { to: '/analytics', labelKey: 'nav.analytics', icon: BarChart3, adminOnly: true },
  { to: '/reports', labelKey: 'nav.reports', icon: FileText },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || profile?.role === 'admin');

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen cmd-bg cmd-grid-pattern">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.06] bg-[#080d1a]/95 backdrop-blur-xl lg:flex">
        <SidebarContent items={items} profile={profile} onSignOut={handleSignOut} onOpenAI={() => setAiOpen(true)} t={t} />
      </aside>

      {/* Sidebar - Mobile */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/[0.06] bg-[#080d1a] lg:hidden cmd-slide-right">
            <SidebarContent
              items={items}
              profile={profile}
              onSignOut={handleSignOut}
              onNavigate={() => setMobileOpen(false)}
              onOpenAI={() => setAiOpen(true)}
              t={t}
            />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <TopBar profile={profile} onMobileMenu={() => setMobileOpen(true)} onSignOut={handleSignOut} t={t} />

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] rounded-tl-2xl bg-slate-50 p-4 lg:p-6">{children}</main>
      </div>

      {/* AI Assistant modal */}
      {aiOpen && <AIAssistant onClose={() => setAiOpen(false)} />}
    </div>
  );
}

type TFunc = (key: string) => string;

function TopBar({ profile, onMobileMenu, onSignOut, t }: { profile: { full_name: string; role: string } | null; onMobileMenu: () => void; onSignOut: () => void; t: TFunc }) {
  const [now, setNow] = useState(new Date());
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { setMapCenter } = useMapSearch();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-white/[0.06] bg-[#080d1a]/80 px-4 backdrop-blur-xl lg:px-6">
      {/* Left: menu + logo */}
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"
          onClick={onMobileMenu}
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
            <Trees size={20} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-white leading-tight">{t('header.title')}</p>
            <p className="text-[11px] text-slate-400 leading-tight">{t('header.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Center: search */}
      <LocationSearch
        className="hidden md:block"
        onSelect={(r) => {
          setMapCenter({ lat: r.lat, lng: r.lon, name: r.name });
          if (window.location.pathname !== '/dashboard') navigate('/dashboard');
        }}
      />

      {/* Right: weather, date, time, notifications, profile */}
      <div className="flex items-center gap-2 lg:gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 xl:flex">
          <Cloud size={16} className="text-cyan-400" />
          <div className="text-xs">
            <span className="font-semibold text-white">28°C</span>
            <span className="text-slate-400 ml-1">{t('dash.partlyCloudy')}</span>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 xl:flex">
          <div className="text-right text-xs leading-tight">
            <p className="font-semibold text-white">{timeStr}</p>
            <p className="text-slate-400">{dateStr}</p>
          </div>
        </div>

        <NotificationBell />
        <button className="hidden rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white sm:block">
          <MessageSquare size={18} />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile((s) => !s)}
            className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-white/5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-white leading-tight">{profile?.full_name || 'User'}</p>
              <p className="text-[10px] capitalize text-slate-400 leading-tight">{profile?.role || ''}</p>
            </div>
          </button>
          {showProfile && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-12 z-40 w-48 cmd-glass p-2 cmd-slide-right">
                <button
                  onClick={() => { setShowProfile(false); navigate('/profile'); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                >
                  <User size={16} /> {t('header.myProfile')}
                </button>
                <button
                  onClick={() => { setShowProfile(false); navigate('/settings'); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                >
                  <Settings size={16} /> {t('header.settings')}
                </button>
                <div className="my-1 border-t border-white/[0.06]" />
                <button
                  onClick={() => { setShowProfile(false); onSignOut(); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <LogOut size={16} /> {t('header.signOut')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function SidebarContent({
  items,
  profile,
  onSignOut,
  onNavigate,
  onOpenAI,
  t,
}: {
  items: NavItem[];
  profile: { full_name: string; role: string } | null;
  onSignOut: () => void;
  onNavigate?: () => void;
  onOpenAI: () => void;
  t: TFunc;
}) {
  const navigate = useNavigate();

  function handleNavClick(item: NavItem, e: React.MouseEvent) {
    e.preventDefault();
    navigate(item.to);
    onNavigate?.();
  }

  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
            <Trees size={22} />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Digital Twin</p>
            <p className="text-[11px] text-slate-400 leading-tight">Village System</p>
          </div>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="cmd-scrollbar flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={(e) => handleNavClick(item, e)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'cmd-nav-active text-white'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`
            }
          >
            <item.icon size={18} className="flex-shrink-0" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>

      {/* AI Assistant section */}
      <div className="border-t border-white/[0.06] p-3">
        <button onClick={onOpenAI} className="cmd-glass cmd-glass-hover w-full rounded-xl p-3.5 text-left transition-all">
          <div className="mb-2 flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 text-white cmd-pulse-glow">
              <Bot size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">{t('ai.title')}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{t('ai.greeting')}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] py-1.5 text-[11px] font-medium text-slate-300">
              <Mic size={13} className="text-green-400" /> {t('ai.openChat')}
            </span>
            <span className="flex items-center justify-center rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-[10px] font-medium text-slate-300">
              EN / தம
            </span>
          </div>
        </button>
      </div>

      {/* Profile + sign out */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white">
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{profile?.full_name || 'User'}</p>
            <p className="text-[11px] text-slate-400 capitalize">{profile?.role || ''}</p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={18} />
          {t('header.signOut')}
        </button>
      </div>
    </>
  );
}
