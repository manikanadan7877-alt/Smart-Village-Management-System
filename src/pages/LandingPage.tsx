import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import type { LucideIcon } from 'lucide-react';
import {
  Trees, Sprout, Droplets, Trash2, HeartPulse, Wrench, GraduationCap,
  ClipboardList, BarChart3, ArrowRight, ArrowDown, Menu, X,
  Users, Activity, Shield, Bot, FileText, Database, Cpu,
  CheckCircle2, Globe,
} from 'lucide-react';

const HERO_IMG = 'https://images.pexels.com/photos/30946066/pexels-photo-30946066.png?auto=compress&cs=tinysrgb&h=650&w=940';

export function LandingPage() {
  const { t, language, setLanguage } = useI18n();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function goToLogin() {
    if (session) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }

  function scrollToSection(id: string) {
    setMobileNav(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  const navItems = [
    { id: 'home', label: t('landing.nav.home') },
    { id: 'about', label: t('landing.nav.about') },
    { id: 'services', label: t('landing.nav.services') },
    { id: 'features', label: t('landing.nav.features') },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-950/90 backdrop-blur-xl shadow-lg shadow-black/20' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30">
              <Trees size={22} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">{t('landing.brand')}</p>
              <p className="text-[11px] text-slate-400">{t('landing.brandSub')}</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language selector */}
            <div className="hidden items-center gap-1 rounded-lg bg-white/5 p-0.5 sm:flex">
              <button
                onClick={() => setLanguage('en')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  language === 'en' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  language === 'ta' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                தம
              </button>
            </div>

            <button
              onClick={goToLogin}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
            >
              {t('landing.signIn')}
            </button>

            <button
              onClick={() => setMobileNav((s) => !s)}
              className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden"
            >
              {mobileNav ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileNav && (
          <div className="border-t border-white/5 bg-slate-950/95 px-6 py-4 lg:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left text-sm font-medium text-slate-300 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${language === 'en' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('ta')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${language === 'ta' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'}`}
                >
                  தமிழ்
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero section */}
      <section id="home" className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt="Smart Village"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/60 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 to-transparent" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md"
            style={{ animation: 'fadeInUp 0.6s ease-out' }}
          >
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            AI-Powered Rural Governance Platform
          </div>

          <h1
            className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
            style={{ animation: 'fadeInUp 0.7s ease-out' }}
          >
            {t('landing.hero.headline')}
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-300"
            style={{ animation: 'fadeInUp 0.8s ease-out' }}
          >
            {t('landing.hero.subtitle')}
          </p>

          <div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ animation: 'fadeInUp 0.9s ease-out' }}
          >
            <button
              onClick={goToLogin}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:brightness-110"
            >
              {t('landing.hero.cta')}
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => scrollToSection('modules')}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10"
            >
              {t('landing.hero.cta2')}
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => scrollToSection('about')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 transition-colors hover:text-white"
        >
          <span className="text-[11px] uppercase tracking-widest">{t('landing.hero.scroll')}</span>
          <div className="flex h-9 w-5 items-start justify-center rounded-full border-2 border-slate-400 p-1">
            <div className="h-2 w-1 rounded-full bg-slate-400 animate-bounce" />
          </div>
          <ArrowDown size={16} />
        </button>
      </section>

      {/* About section */}
      <section id="about" data-reveal className="relative py-24">
        <div className={`mx-auto max-w-5xl px-6 transition-all duration-700 ${visibleSections.has('about') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">{t('landing.about.title')}</h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-400">
              {t('landing.about.desc')}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: Database, label: t('landing.about.stat1'), color: '#3b82f6' },
              { icon: Activity, label: t('landing.about.stat2'), color: '#22c55e' },
              { icon: Cpu, label: t('landing.about.stat3'), color: '#06b6d4' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center backdrop-blur-md transition-all hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  <stat.icon size={26} />
                </div>
                <p className="text-base font-semibold text-slate-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules section */}
      <section id="modules" data-reveal className="relative py-24">
        <div className={`mx-auto max-w-7xl px-6 transition-all duration-700 ${visibleSections.has('modules') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">{t('landing.modules.title')}</h2>
            <p className="mt-3 text-lg text-slate-400">{t('landing.modules.subtitle')}</p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Sprout, title: t('landing.modules.agri'), desc: t('landing.modules.agriDesc'), color: '#22c55e' },
              { icon: Droplets, title: t('landing.modules.water'), desc: t('landing.modules.waterDesc'), color: '#3b82f6' },
              { icon: Trash2, title: t('landing.modules.waste'), desc: t('landing.modules.wasteDesc'), color: '#f97316' },
              { icon: HeartPulse, title: t('landing.modules.health'), desc: t('landing.modules.healthDesc'), color: '#ef4444' },
              { icon: Wrench, title: t('landing.modules.infra'), desc: t('landing.modules.infraDesc'), color: '#f59e0b' },
              { icon: GraduationCap, title: t('landing.modules.edu'), desc: t('landing.modules.eduDesc'), color: '#3b82f6' },
              { icon: ClipboardList, title: t('landing.modules.citizen'), desc: t('landing.modules.citizenDesc'), color: '#06b6d4' },
              { icon: BarChart3, title: t('landing.modules.analytics'), desc: t('landing.modules.analyticsDesc'), color: '#8b5cf6' },
            ].map((mod, i) => (
              <div
                key={mod.title}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-white/10 hover:bg-white/[0.05]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${mod.color}15`, color: mod.color }}
                >
                  <mod.icon size={24} />
                </div>
                <h3 className="mb-2 text-base font-bold text-white">{mod.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem section */}
      <section id="services" data-reveal className="relative overflow-hidden py-24">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(6,182,212,0.3) 0%, transparent 50%)',
          }}
        />
        <div className={`relative mx-auto max-w-5xl px-6 transition-all duration-700 ${visibleSections.has('services') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">{t('landing.ecosystem.title')}</h2>
            <p className="mt-3 text-lg text-slate-400">{t('landing.ecosystem.subtitle')}</p>
          </div>

          {/* Network flow */}
          <div className="mt-16 flex flex-col items-center gap-4 lg:flex-row lg:justify-center lg:gap-2">
            {[
              { icon: Users, label: t('landing.ecosystem.citizens'), color: '#3b82f6', flow: t('landing.ecosystem.flow1') },
              { icon: Shield, label: t('landing.ecosystem.admin'), color: '#22c55e', flow: t('landing.ecosystem.flow2') },
              { icon: Database, label: t('landing.ecosystem.resources'), color: '#f59e0b', flow: t('landing.ecosystem.flow3') },
              { icon: ClipboardList, label: t('landing.ecosystem.services'), color: '#06b6d4', flow: t('landing.ecosystem.flow4') },
              { icon: Bot, label: t('landing.ecosystem.ai'), color: '#8b5cf6', flow: undefined },
            ].map((node, i, arr) => (
              <div key={node.label} className="flex flex-col items-center gap-3 lg:flex-row">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 backdrop-blur-md transition-all hover:scale-105"
                    style={{ backgroundColor: `${node.color}15`, color: node.color }}
                  >
                    <node.icon size={32} />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">{node.label}</p>
                  {node.flow && (
                    <p className="max-w-[120px] text-center text-[11px] leading-tight text-slate-500">{node.flow}</p>
                  )}
                </div>
                {i < arr.length - 1 && (
                  <div className="hidden lg:block">
                    <ArrowRight size={20} className="text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" data-reveal className="relative py-24">
        <div className={`mx-auto max-w-7xl px-6 transition-all duration-700 ${visibleSections.has('features') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">{t('landing.features.title')}</h2>
            <p className="mt-3 text-lg text-slate-400">{t('landing.features.subtitle')}</p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Database, title: t('landing.features.f1'), desc: t('landing.features.f1d'), color: '#3b82f6' },
              { icon: Activity, title: t('landing.features.f2'), desc: t('landing.features.f2d'), color: '#22c55e' },
              { icon: Cpu, title: t('landing.features.f3'), desc: t('landing.features.f3d'), color: '#06b6d4' },
              { icon: ClipboardList, title: t('landing.features.f4'), desc: t('landing.features.f4d'), color: '#f97316' },
              { icon: Bot, title: t('landing.features.f5'), desc: t('landing.features.f5d'), color: '#8b5cf6' },
              { icon: Shield, title: t('landing.features.f6'), desc: t('landing.features.f6d'), color: '#ef4444' },
              { icon: FileText, title: t('landing.features.f7'), desc: t('landing.features.f7d'), color: '#eab308' },
            ].map((feat) => (
              <div
                key={feat.title}
                className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-md transition-all hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${feat.color}15`, color: feat.color }}
                >
                  <feat.icon size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section data-reveal className="relative py-24">
        <div className={`mx-auto max-w-3xl px-6 transition-all duration-700 ${visibleSections.has('features') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-slate-900 to-cyan-600/10 p-12 text-center backdrop-blur-xl">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.4) 0%, transparent 60%)',
              }}
            />
            <div className="relative z-10">
              <CheckCircle2 size={40} className="mx-auto mb-4 text-blue-400" />
              <h2 className="text-3xl font-bold sm:text-4xl">{t('landing.cta.title')}</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">{t('landing.cta.subtitle')}</p>
              <button
                onClick={goToLogin}
                className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:brightness-110"
              >
                {t('landing.cta.button')}
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400">
              <Trees size={16} />
            </div>
            <span className="text-sm font-semibold text-slate-300">Smart Village Management System</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Globe size={14} />
            {t('landing.footer')}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
