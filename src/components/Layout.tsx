import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { AIAssistant } from '@/components/AIAssistant';
import { LocationSearch } from '@/components/LocationSearch';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Map, ClipboardList, Droplets, Trash2, BarChart3, User,
  LogOut, Menu, X, Trees, Bell, Cloud, Settings,
  Sprout, HeartPulse, GraduationCap, Wrench,
  Bot, Mic, MessageSquare, Languages, Loader2,
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
  { to: '/healthcare', labelKey: 'nav.healthcare', icon: HeartPulse },
  { to: '/education', labelKey: 'nav.education', icon: GraduationCap },
  { to: '/garbage-bins', labelKey: 'nav.waste', icon: Trash2, adminOnly: true },
  { to: '/infrastructure', labelKey: 'nav.infrastructure', icon: Wrench },
  { to: '/complaints', labelKey: 'nav.citizen', icon: ClipboardList },
  { to: '/analytics', labelKey: 'nav.analytics', icon: BarChart3, adminOnly: true },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || profile?.role === 'admin');

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError('');
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      setSigningOut(false);
      setSignOutError('Unable to sign out. Please try again.');
    }
  }

  return (
    <div className="min-h-screen cmd-bg cmd-grid-pattern">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.06] bg-[#080d1a]/95 backdrop-blur-xl lg:flex">
        <SidebarContent items={items} profile={profile} onSignOut={handleSignOut} onOpenAI={() => setAiOpen(true)} />
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
            />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <TopBar profile={profile} onMobileMenu={() => setMobileOpen(true)} />

        {/* Page content */}
        <main className="cmd-main-bg min-h-[calc(100vh-4rem)] rounded-tl-2xl p-4 lg:p-6">{children}</main>
      </div>

      {/* AI Assistant modal */}
      {aiOpen && <AIAssistant onClose={() => setAiOpen(false)} />}
    </div>
  );
}

function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
      className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
      title="Switch language"
    >
      <Languages size={14} />
      {lang === 'en' ? 'தமிழ்' : 'EN'}
    </button>
  );
}

function TopBar({ profile, onMobileMenu }: { profile: { full_name: string; role: string } | null; onMobileMenu: () => void }) {
  const { t, village } = useI18n();
  const [now, setNow] = useState(new Date());
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError('');
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      setSigningOut(false);
      setSignOutError('Unable to sign out. Please try again.');
    }
  }

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const locale = useI18n().lang === 'ta' ? 'ta-IN' : 'en-US';
  const dateStr = now.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

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

      {/* Center: location search */}
      <LocationSearch />

      {/* Right: language, weather, date, time, notifications, profile */}
      <div className="flex items-center gap-2 lg:gap-3">
        <LanguageToggle />
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

        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
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
              <div className="absolute right-0 top-12 z-40 w-52 cmd-glass p-2 cmd-slide-right">
                <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                  <p className="text-[11px] text-slate-400">{village?.name || '—'}</p>
                  <p className="text-[10px] text-slate-500">{village?.district}, {village?.state}</p>
                </div>
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
                  <Settings size={16} /> {t('nav.settings')}
                </button>
                <div className="my-1 border-t border-white/[0.06]" />
                {signOutError && (
                  <p className="px-3 py-1.5 text-[11px] text-red-400">{signOutError}</p>
                )}
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                  {signingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  {signingOut ? 'Signing out...' : t('header.signOut')}
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
}: {
  items: NavItem[];
  profile: { full_name: string; role: string } | null;
  onSignOut: () => void;
  onNavigate?: () => void;
  onOpenAI: () => void;
}) {
  const { t, village } = useI18n();
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

      {/* Village context display */}
      {village && (
        <div className="px-3 py-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2.5 py-2">
            <Map size={14} className="flex-shrink-0 text-green-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-slate-200">{village.name}</p>
              <p className="truncate text-[10px] text-slate-500">{village.district}, {village.state}</p>
            </div>
          </div>
        </div>
      )}

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
                  : 'cmd-nav-inactive text-slate-300 hover:bg-white/[0.06] hover:text-white'
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
              <p className="text-[10px] text-slate-400 leading-tight">EN / தமிழ் / Tanglish</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] py-1.5 text-[11px] font-medium text-slate-300">
              <Mic size={13} className="text-green-400" /> Open Chat
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
