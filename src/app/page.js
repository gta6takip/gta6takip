'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sun, Moon, RefreshCw, ExternalLink } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// --- INLINE BAYRAK SVG'LERİ ---
const FlagTR = () => (
  <svg viewBox="0 0 36 24" className="w-4 h-3 rounded-[2px] shrink-0 shadow-sm" aria-hidden="true">
    <rect width="36" height="24" fill="#E30A17" />
    <circle cx="13.5" cy="12" r="6" fill="#FFFFFF" />
    <circle cx="15" cy="12" r="4.8" fill="#E30A17" />
    <polygon fill="#FFFFFF" points="19.5,12 21.8,12.75 20.38,10.8 20.38,13.2 21.8,11.25" />
  </svg>
);

const FlagEN = () => (
  <svg viewBox="0 0 36 24" className="w-4 h-3 rounded-[2px] shrink-0 shadow-sm" aria-hidden="true">
    <rect width="36" height="24" fill="#B22234" />
    <path d="M0,3.7h36M0,7.4h36M0,11.1h36M0,14.8h36M0,18.5h36M0,22.2h36" stroke="#FFFFFF" strokeWidth="1.85" />
    <rect width="15.5" height="13" fill="#3C3B6E" />
  </svg>
);

// --- 3D GÖRÜNÜMLÜ ÖZEL SVG İKONLAR ---
const Icon3DLogo = () => (
  <svg viewBox="0 0 48 48" className="w-11 h-11 shrink-0 drop-shadow-[0_6px_12px_rgba(236,72,153,0.45)]" aria-hidden="true">
    <defs>
      <linearGradient id="vi3dBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="50%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
      <linearGradient id="vi3dGloss" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="3" y="5" width="42" height="40" rx="13" fill="#4c1d95" opacity="0.45" />
    <rect x="3" y="3" width="42" height="40" rx="13" fill="url(#vi3dBg)" />
    <rect x="5" y="4" width="38" height="18" rx="10" fill="url(#vi3dGloss)" />
    <text x="24" y="29" textAnchor="middle" fill="#ffffff" fontSize="19" fontWeight="900" fontFamily="system-ui, sans-serif">
      VI
    </text>
  </svg>
);

const Icon3DTrophy = () => (
  <svg viewBox="0 0 40 40" className="w-9 h-9 shrink-0 drop-shadow-[0_4px_8px_rgba(245,158,11,0.4)]" aria-hidden="true">
    <defs>
      <linearGradient id="trophy3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="55%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <path d="M12 8h16v10a8 8 0 01-16 0V8z" fill="url(#trophy3d)" />
    <path d="M8 10h4v6a4 4 0 01-4-4v-2zm20 0h4v2a4 4 0 01-4 4v-6z" fill="#fbbf24" />
    <rect x="17" y="25" width="6" height="5" fill="#d97706" />
    <rect x="13" y="30" width="14" height="4" rx="2" fill="#92400e" />
    <ellipse cx="17" cy="12" rx="2.5" ry="4" fill="#ffffff" opacity="0.35" />
  </svg>
);

const Icon3DCode = () => (
  <svg viewBox="0 0 40 40" className="w-9 h-9 shrink-0 drop-shadow-[0_4px_8px_rgba(16,185,129,0.4)]" aria-hidden="true">
    <defs>
      <linearGradient id="code3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <rect x="4" y="6" width="32" height="30" rx="9" fill="#065f46" opacity="0.4" />
    <rect x="4" y="4" width="32" height="30" rx="9" fill="url(#code3d)" />
    <path d="M15 14l-5 5 5 5M25 14l5 5-5 5M21.5 13l-3 12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const Icon3DPulse = () => (
  <svg viewBox="0 0 40 40" className="w-9 h-9 shrink-0 drop-shadow-[0_4px_8px_rgba(236,72,153,0.4)]" aria-hidden="true">
    <defs>
      <linearGradient id="pulse3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#db2777" />
      </linearGradient>
    </defs>
    <rect x="4" y="6" width="32" height="30" rx="9" fill="#831843" opacity="0.4" />
    <rect x="4" y="4" width="32" height="30" rx="9" fill="url(#pulse3d)" />
    <path d="M9 20h5l3-7 5 13 3-6h6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const Icon3DClock = () => (
  <svg viewBox="0 0 40 40" className="w-9 h-9 shrink-0 drop-shadow-[0_4px_8px_rgba(147,51,234,0.4)]" aria-hidden="true">
    <defs>
      <linearGradient id="clock3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#7e22ce" />
      </linearGradient>
    </defs>
    <circle cx="20" cy="21" r="15" fill="#4c1d95" opacity="0.4" />
    <circle cx="20" cy="19" r="15" fill="url(#clock3d)" />
    <path d="M20 11v8l5 3" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const Icon3DGamepad = () => (
  <svg viewBox="0 0 28 28" className="w-5 h-5 shrink-0 drop-shadow-[0_2px_4px_rgba(236,72,153,0.45)]" aria-hidden="true">
    <defs>
      <linearGradient id="gp3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#9333ea" />
      </linearGradient>
    </defs>
    <rect x="2" y="7" width="24" height="15" rx="7" fill="url(#gp3d)" />
    <path d="M8 12v5M5.5 14.5h5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="19" cy="13" r="1.2" fill="#fff" />
    <circle cx="21.5" cy="15.5" r="1.2" fill="#fff" />
  </svg>
);

const Icon3DGlobe = () => (
  <svg viewBox="0 0 28 28" className="w-5 h-5 shrink-0 drop-shadow-[0_2px_4px_rgba(147,51,234,0.45)]" aria-hidden="true">
    <defs>
      <linearGradient id="gl3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    <circle cx="14" cy="14" r="11" fill="url(#gl3d)" />
    <ellipse cx="14" cy="14" rx="5" ry="10.5" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.85" />
    <path d="M3.5 14h21" stroke="#ffffff" strokeWidth="1.4" opacity="0.85" />
  </svg>
);

const Icon3DWrench = () => (
  <svg viewBox="0 0 28 28" className="w-5 h-5 shrink-0 drop-shadow-[0_2px_4px_rgba(249,115,22,0.45)]" aria-hidden="true">
    <defs>
      <linearGradient id="wr3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fb923c" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
    </defs>
    <circle cx="14" cy="14" r="11" fill="url(#wr3d)" />
    <path d="M17.5 8.5a4 4 0 00-4.9 4.9l-4.4 4.4a1.4 1.4 0 002 2l4.4-4.4a4 4 0 004.9-4.9l-2.2 2.2-2-2 2.2-2.2z" fill="#ffffff" />
  </svg>
);

const Icon3DMonitor = () => (
  <svg viewBox="0 0 28 28" className="w-5 h-5 shrink-0 drop-shadow-[0_2px_4px_rgba(14,165,233,0.45)]" aria-hidden="true">
    <defs>
      <linearGradient id="mon3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
    </defs>
    <rect x="3" y="4" width="22" height="15" rx="3.5" fill="url(#mon3d)" />
    <rect x="5.5" y="6.5" width="17" height="10" rx="1.5" fill="#0f172a" opacity="0.4" />
    <path d="M11 19v3M17 19v3M9 22h10" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const RankMedal3D = ({ rank }) => {
  if (rank > 3) {
    return (
      <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-500/25 flex items-center justify-center text-xs font-black text-pink-500 shrink-0">
        #{rank}
      </span>
    );
  }
  const palettes = {
    1: { top: '#fef08a', mid: '#f59e0b', bot: '#b45309', shadow: 'rgba(245,158,11,0.5)' },
    2: { top: '#f8fafc', mid: '#94a3b8', bot: '#475569', shadow: 'rgba(148,163,184,0.5)' },
    3: { top: '#fed7aa', mid: '#ea580c', bot: '#9a3412', shadow: 'rgba(234,88,12,0.5)' },
  };
  const p = palettes[rank];
  return (
    <svg
      viewBox="0 0 36 36"
      className="w-8 h-8 shrink-0"
      style={{ filter: `drop-shadow(0 4px 6px ${p.shadow})` }}
      aria-label={`#${rank}`}
    >
      <defs>
        <linearGradient id={`medal-${rank}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p.top} />
          <stop offset="55%" stopColor={p.mid} />
          <stop offset="100%" stopColor={p.bot} />
        </linearGradient>
      </defs>
      <circle cx="18" cy="19" r="14" fill={p.bot} opacity="0.45" />
      <circle cx="18" cy="17" r="14" fill={`url(#medal-${rank})`} />
      <text x="18" y="22" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="system-ui, sans-serif">
        {rank}
      </text>
    </svg>
  );
};

const TEXT = {
  tr: {
    badge: 'PORTWATCH VI · CANLI YARIŞ',
    title: 'GTA VI PC Port Takibi',
    subtitle: 'PortWatch VI verileri ve açık kaynak GitHub depoları her 120 saniyede bir otomatik olarak güncellenir.',
    onlineBtn: 'Çevrimiçi',
    onlineTooltip: 'Şu an siteyi canlı takip eden kullanıcı sayısı',
    statTeams: 'Takip Edilen Ekip',
    statOpen: 'Açık Kaynak',
    statLeader: 'Lider İlerleme',
    statSync: 'Son Güncelleme',
    refresh: 'Yenile',
    filterAll: 'Tümü',
    filterOpen: 'Açık Kaynak',
    filterClosed: 'Kapalı Ekip',
    openSource: 'AÇIK KAYNAK',
    closedTeam: 'KAPALI EKİP',
    latestCommit: 'Son Commit',
    shareWa: "WhatsApp'ta Paylaş",
    shareX: "X'te Paylaş",
    disclaimer:
      'GTA6takip, PortWatch projesinin kâr gütmeyen, hobi amaçlı alternatifidir. Veriler otomatik olarak portwatch-vi.xyz/#race ve açık GitHub depolarından alınır.',
    loadingTeams: 'Takım verileri yükleniyor...',
    autoSyncNote: '120 sn otomatik senkronizasyon aktif',
  },
  en: {
    badge: 'PORTWATCH VI · LIVE RACE',
    title: 'GTA VI PC Port Tracker',
    subtitle: 'PortWatch VI race data and open-source GitHub repositories sync automatically every 120 seconds.',
    onlineBtn: 'Online',
    onlineTooltip: 'Live users currently watching this tracker',
    statTeams: 'Tracked Teams',
    statOpen: 'Open Source',
    statLeader: 'Leader Progress',
    statSync: 'Last Sync',
    refresh: 'Refresh',
    filterAll: 'All',
    filterOpen: 'Open Source',
    filterClosed: 'Closed Team',
    openSource: 'OPEN SOURCE',
    closedTeam: 'CLOSED TEAM',
    latestCommit: 'Latest Commit',
    shareWa: 'Share on WhatsApp',
    shareX: 'Share on X',
    disclaimer:
      'GTA6takip is a non-profit, hobbyist alternative to PortWatch. Data syncs automatically from portwatch-vi.xyz/#race and public GitHub repositories.',
    loadingTeams: 'Loading team progress...',
    autoSyncNote: '120s auto-sync active',
  },
};

export default function Home() {
  const [lang, setLang] = useState('tr');
  const [theme, setTheme] = useState('light');
  const [teams, setTeams] = useState([]);
  const [filter, setFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState('--:--:--');
  const [syncing, setSyncing] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [onlinePulseOpen, setOnlinePulseOpen] = useState(false);

  const t = TEXT[lang];

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('gta6takip_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);
      const savedLang = localStorage.getItem('gta6takip_lang');
      if (savedLang === 'tr' || savedLang === 'en') setLang(savedLang);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('portwatch-dark', theme === 'dark');
    document.documentElement.classList.toggle('portwatch-light', theme === 'light');
    try {
      localStorage.setItem('gta6takip_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const fetchSync = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      const data = await res.json();
      const rawList =
        (Array.isArray(data) && data) ||
        data.teams ||
        data.projects ||
        data.data ||
        data.items ||
        data.race ||
        Object.values(data).find((v) => Array.isArray(v)) ||
        [];
      if (Array.isArray(rawList)) {
        setTeams(rawList);
      }
      setLastUpdated(new Date().toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US'));
    } catch {
      // ignore
    } finally {
      setSyncing(false);
    }
  }, [lang]);

  useEffect(() => {
    fetchSync();
    const id = setInterval(fetchSync, 120000);
    return () => clearInterval(id);
  }, [fetchSync]);

  // Supabase Realtime Çevrimiçi Sayacı
  useEffect(() => {
    if (!supabase) return;
    const key = `viewer_${Math.random().toString(36).slice(2, 9)}`;
    const room = supabase.channel('gta6takip_presence', {
      config: { presence: { key } },
    });
    room
      .on('presence', { event: 'sync' }, () => {
        const state = room.presenceState();
        setOnlineCount(Math.max(1, Object.keys(state).length));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await room.track({ online_at: new Date().toISOString() });
        }
      });
    return () => {
      supabase.removeChannel(room);
    };
  }, []);

  const renderStageIcon = (stageText = '') => {
    const s = String(stageText).toLowerCase();
    if (s.includes('oynan') || s.includes('play') || s.includes('menü') || s.includes('menu')) {
      return <Icon3DGamepad />;
    }
    if (s.includes('harita') || s.includes('world') || s.includes('map')) {
      return <Icon3DGlobe />;
    }
    return <Icon3DWrench />;
  };

  const openSourceCount = teams.filter((tm) => tm.open_source ?? tm.isOpenSource ?? tm.is_open_source).length;
  const topPct = teams.length
    ? Math.max(...teams.map((tm) => Number(tm.percentage ?? tm.progress ?? tm.pct ?? 0)))
    : 0;

  const filteredTeams = teams.filter((tm) => {
    const isOpen = Boolean(tm.open_source ?? tm.isOpenSource ?? tm.is_open_source);
    if (filter === 'open') return isOpen;
    if (filter === 'closed') return !isOpen;
    return true;
  });

  const shareText =
    lang === 'tr'
      ? 'GTA VI PC Port geliştirme sürecini canlı takip ediyorum! 🚀'
      : 'Tracking GTA VI PC Port progress live! 🚀';
  const shareUrl = 'https://gta6takip.vercel.app/';

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* ÜST CAM NAVBAR */}
      <nav
        className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(11, 17, 32, 0.82)' : 'rgba(241, 245, 249, 0.82)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Icon3DLogo />
            <div>
              <div className="text-[10px] font-extrabold tracking-wider text-pink-500 uppercase">{t.badge}</div>
              <div className="text-base sm:text-lg font-black pw-text-gradient leading-tight">GTA6TAKİP</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* ÇEVRİMİÇİ BUTONU */}
            <button
              type="button"
              onClick={() => setOnlinePulseOpen((v) => !v)}
              title={t.onlineTooltip}
              className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shadow-[0_2px_10px_rgba(16,185,129,0.2)] hover:bg-emerald-500/20 transition"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span>
                {onlineCount} {t.onlineBtn}
              </span>
            </button>

            {/* DİL SEÇİCİ */}
            <div
              className="flex items-center rounded-xl p-1 border"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <button
                onClick={() => {
                  setLang('tr');
                  localStorage.setItem('gta6takip_lang', 'tr');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  lang === 'tr' ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm' : ''
                }`}
              >
                <FlagTR /> TR
              </button>
              <button
                onClick={() => {
                  setLang('en');
                  localStorage.setItem('gta6takip_lang', 'en');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  lang === 'en' ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm' : ''
                }`}
              >
                <FlagEN /> EN
              </button>
            </div>

            {/* TEMA DEĞİŞTİR */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border hover:border-pink-500/50 transition"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* YENİLE */}
            <button
              onClick={fetchSync}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold hover:border-pink-500/50 transition"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-pink-500' : ''}`} />
              <span className="hidden sm:inline">{t.refresh}</span>
            </button>
          </div>
        </div>

        {onlinePulseOpen && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-2 text-[11px] text-emerald-500 font-semibold">
            ● {t.onlineTooltip}: {onlineCount} · {t.autoSyncNote}
          </div>
        )}
      </nav>

      {/* HERO & 3D İSTATİSTİK KARTLARI */}
      <header className="pw-hero-bg border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 space-y-5">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black pw-text-gradient tracking-tight">{t.title}</h1>
            <p className="text-xs sm:text-sm mt-1.5 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              {t.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div
              className="rounded-2xl p-4 border shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <Icon3DTrophy />
              <div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{t.statTeams}</div>
                <div className="text-lg font-black">{teams.length}</div>
              </div>
            </div>

            <div
              className="rounded-2xl p-4 border shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <Icon3DCode />
              <div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{t.statOpen}</div>
                <div className="text-lg font-black">{openSourceCount}</div>
              </div>
            </div>

            <div
              className="rounded-2xl p-4 border shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <Icon3DPulse />
              <div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{t.statLeader}</div>
                <div className="text-lg font-black pw-text-gradient">
                  {lang === 'tr' ? `%${topPct}` : `${topPct}%`}
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl p-4 border shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <Icon3DClock />
              <div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{t.statSync}</div>
                <div className="text-base sm:text-lg font-black">{lastUpdated}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ANA LİSTE & FİLTRELER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: t.filterAll },
              { id: 'open', label: t.filterOpen },
              { id: 'closed', label: t.filterClosed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  filter === tab.id
                    ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-sm'
                    : 'border hover:border-pink-500/40'
                }`}
                style={filter !== tab.id ? { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' } : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {t.autoSyncNote}
          </span>
        </div>

        {/* TAKIM KARTLARI */}
        {filteredTeams.length === 0 ? (
          <div
            className="rounded-2xl p-10 border text-center text-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            {t.loadingTeams}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeams.map((team, idx) => {
              const rank = teams.indexOf(team) + 1 || idx + 1;
              const pct = Number(team.percentage ?? team.progress ?? team.pct ?? 0);
              const pctLabel = lang === 'tr' ? `%${pct}` : `${pct}%`;
              const isOpen = Boolean(team.open_source ?? team.isOpenSource ?? team.is_open_source);
              const stage = lang === 'tr' ? team.stage_tr || team.stage : team.stage_en || team.stage;
              const fps = lang === 'tr' ? team.fps_tr || team.fps : team.fps_en || team.fps;
              const desc = lang === 'tr' ? team.desc_tr || team.description || team.desc : team.desc_en || team.description || team.desc;
              const commit = team.commit_msg || team.commitMessage || team.lastCommit;
              const repoUrl = team.url || team.repo_url || team.github_url;

              return (
                <article
                  key={team.name || idx}
                  className="rounded-2xl p-5 border shadow-sm hover:-translate-y-0.5 hover:border-pink-500/50 transition-all duration-200 flex flex-col justify-between gap-3"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                        <RankMedal3D rank={rank} />
                        <div className="min-w-0">
                          <h2 className="font-extrabold text-base sm:text-lg truncate">{team.name || team.title}</h2>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                              isOpen ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-400'
                            }`}
                          >
                            {isOpen ? t.openSource : t.closedTeam}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xl sm:text-2xl font-black pw-text-gradient">{pctLabel}</span>
                        {repoUrl && (
                          <a
                            href={repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl border hover:border-pink-500 transition"
                            style={{ borderColor: 'var(--border-color)' }}
                            aria-label="Open repository"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 3D PARLAK İLERLEME ÇUBUĞU */}
                    <div className="w-full h-3.5 rounded-full overflow-hidden bg-slate-500/20 p-[1px] shadow-inner mb-3">
                      <div
                        className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                        style={{
                          width: `${Math.min(100, Math.max(0, pct))}%`,
                          background: 'linear-gradient(90deg, #9333ea 0%, #ec4899 55%, #f97316 100%)',
                          boxShadow: '0 0 12px rgba(236, 72, 153, 0.5)',
                        }}
                      >
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/25 rounded-full" />
                      </div>
                    </div>

                    {/* 3D AŞAMA & FPS ROZETLERİ */}
                    <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {stage && (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-medium"
                          style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)' }}
                        >
                          {renderStageIcon(stage)}
                          {stage}
                        </span>
                      )}
                      {fps && (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-medium"
                          style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)' }}
                        >
                          <Icon3DMonitor />
                          {fps}
                        </span>
                      )}
                    </div>
                  </div>

                  {(commit || desc) && (
                    <p
                      className="text-xs line-clamp-2 pt-2 border-t"
                      style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
                    >
                      {commit ? `${t.latestCommit}: ${commit}` : desc}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* ALT SOSYAL & PAYLAŞIM ŞERİDİ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <a
            href="https://x.com/batmancodex"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold hover:border-pink-500 transition shadow-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <span>𝕏 | batmancodex</span>
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold text-emerald-500 hover:border-emerald-500 transition shadow-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <span>{t.shareWa}</span>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold hover:border-sky-500 transition shadow-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <span>{t.shareX}</span>
          </a>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
        <p>{t.disclaimer}</p>
      </footer>
    </div>
  );
}
