'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sun, Moon, RefreshCw, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// --- INLINE BAYRAK SVG'LERİ ---
const FlagTR = () => (
  <svg viewBox="0 0 36 24" className="w-4 h-3 rounded-[2px] shrink-0" aria-hidden="true">
    <rect width="36" height="24" fill="#E30A17" />
    <circle cx="13.5" cy="12" r="6" fill="#FFFFFF" />
    <circle cx="15" cy="12" r="4.8" fill="#E30A17" />
    <polygon fill="#FFFFFF" points="19.5,12 21.8,12.75 20.38,10.8 20.38,13.2 21.8,11.25" />
  </svg>
);

const FlagEN = () => (
  <svg viewBox="0 0 36 24" className="w-4 h-3 rounded-[2px] shrink-0" aria-hidden="true">
    <rect width="36" height="24" fill="#B22234" />
    <path d="M0,3.7h36M0,7.4h36M0,11.1h36M0,14.8h36M0,18.5h36M0,22.2h36" stroke="#FFFFFF" strokeWidth="1.85" />
    <rect width="15.5" height="13" fill="#3C3B6E" />
  </svg>
);

// --- SADE 3D SVG İKONLAR ---
const Icon3DLogo = () => (
  <svg viewBox="0 0 40 40" className="w-9 h-9 shrink-0 drop-shadow-[0_4px_10px_rgba(236,72,153,0.4)]" aria-hidden="true">
    <defs>
      <linearGradient id="pwLogo3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7c5cff" />
        <stop offset="55%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
    <rect x="2" y="3" width="36" height="35" rx="10" fill="#4c1d95" opacity="0.4" />
    <rect x="2" y="2" width="36" height="34" rx="10" fill="url(#pwLogo3d)" />
    <text x="20" y="24" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900" fontFamily="system-ui, sans-serif">
      VI
    </text>
  </svg>
);

const Icon3DTeamAvatar = ({ index, isOpen }) => {
  const gradients = [
    ['#a855f7', '#ec4899'],
    ['#6366f1', '#38bdf8'],
    ['#ec4899', '#f97316'],
    ['#10b981', '#06b6d4'],
    ['#f59e0b', '#ef4444'],
    ['#8b5cf6', '#d946ef'],
  ];
  const [c1, c2] = gradients[index % gradients.length];
  const gid = `team-av-${index}`;
  return (
    <svg viewBox="0 0 42 42" className="w-10 h-10 shrink-0 drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect x="1" y="2" width="40" height="39" rx="11" fill="#000000" opacity="0.3" />
      <rect x="1" y="1" width="40" height="38" rx="11" fill={`url(#${gid})`} />
      <rect x="3" y="2" width="36" height="16" rx="8" fill="#ffffff" opacity="0.18" />
      {isOpen ? (
        <path d="M15 16l-4 4 4 4M27 16l4 4-4 4M22.5 14l-3 12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ) : (
        <path d="M16 19v-2a5 5 0 0110 0v2m-11 0h12a1 1 0 011 1v7a2 2 0 01-2 2H16a2 2 0 01-2-2v-7a1 1 0 011-1z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}
    </svg>
  );
};

const Icon3DMonitor = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
    <defs>
      <linearGradient id="mon3dMin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    <rect x="2" y="3" width="20" height="13" rx="3" fill="url(#mon3dMin)" />
    <path d="M9 16v3M15 16v3M7 19h10" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const Icon3DGamepad = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
    <defs>
      <linearGradient id="gp3dMin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#9333ea" />
      </linearGradient>
    </defs>
    <rect x="2" y="6" width="20" height="12" rx="6" fill="url(#gp3dMin)" />
    <circle cx="16.5" cy="11" r="1" fill="#fff" />
    <circle cx="18.5" cy="13" r="1" fill="#fff" />
    <path d="M7.5 10v4M5.5 12h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MILESTONES = {
  tr: ['Altyapı', 'Exe Çalışıyor', 'İlk Kare', 'Ana Menü', 'Oyun Dünyası', 'Oynanabilir'],
  en: ['Groundwork', 'Exe runs', 'First frame', 'Main menu', 'In the world', 'Playable'],
};

const TEXT = {
  tr: {
    eyebrow: 'LİDERLİK TABLOSU',
    title: 'Yarış',
    subtitle:
      'PortWatch VI verileri ve açık kaynak GitHub depoları her 120 saniyede bir otomatik olarak güncellenir.',
    onlineBtn: 'Çevrimiçi',
    filterAll: 'Tümü',
    filterOpen: 'Açık Kaynak',
    filterClosed: 'Kapalı Ekip',
    openSource: 'Açık Kaynak',
    closedTeam: 'Kapalı Ekip',
    details: 'Detaylar',
    hideDetails: 'Gizle',
    latestCommit: 'Son Commit',
    lastSync: 'Son Güncelleme',
    refresh: 'Yenile',
    viewRepo: 'GitHub',
    viewPortwatch: 'PortWatch',
    shareWa: "WhatsApp'ta Paylaş",
    shareX: "X'te Paylaş",
    disclaimer:
      'GTA6takip, PortWatch projesinin kâr gütmeyen, hobi amaçlı alternatifidir. Veriler otomatik olarak portwatch-vi.xyz/#race ve açık GitHub depolarından alınır.',
    loading: 'Veriler yükleniyor...',
  },
  en: {
    eyebrow: 'LEADERBOARD',
    title: 'The race',
    subtitle:
      'PortWatch VI race data and open-source GitHub repositories sync automatically every 120 seconds.',
    onlineBtn: 'Online',
    filterAll: 'All',
    filterOpen: 'Open Source',
    filterClosed: 'Closed Team',
    openSource: 'Open Source',
    closedTeam: 'Closed Team',
    details: 'Details',
    hideDetails: 'Hide details',
    latestCommit: 'Latest Commit',
    lastSync: 'Last Sync',
    refresh: 'Refresh',
    viewRepo: 'GitHub',
    viewPortwatch: 'PortWatch',
    shareWa: 'Share on WhatsApp',
    shareX: 'Share on X',
    disclaimer:
      'GTA6takip is a non-profit, hobbyist alternative to PortWatch. Data syncs automatically from portwatch-vi.xyz/#race and public GitHub repositories.',
    loading: 'Loading race data...',
  },
};

export default function Home() {
  const [lang, setLang] = useState('tr');
  const [theme, setTheme] = useState('dark');
  const [teams, setTeams] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState({ 0: true, 1: true, 2: true });
  const [lastUpdated, setLastUpdated] = useState('--:--:--');
  const [syncing, setSyncing] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);

  const t = TEXT[lang];
  const isDark = theme === 'dark';

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
    document.documentElement.classList.toggle('portwatch-dark', isDark);
    document.documentElement.classList.toggle('portwatch-light', !isDark);
    try {
      localStorage.setItem('gta6takip_theme', theme);
    } catch {
      // ignore
    }
  }, [theme, isDark]);

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

  const filteredTeams = teams.filter((tm) => {
    const isOpen = Boolean(tm.open_source ?? tm.isOpenSource ?? tm.is_open_source);
    if (filter === 'open') return isOpen;
    if (filter === 'closed') return !isOpen;
    return true;
  });

  const shareText =
    lang === 'tr'
      ? 'GTA VI PC Port geliştirme yarışını canlı takip ediyorum! 🚀'
      : 'Tracking the GTA VI PC Port race live! 🚀';
  const shareUrl = 'https://gta6takip.vercel.app/';

  const bgPage = isDark ? '#0b0d12' : '#f4f6fa';
  const bgCard = isDark ? '#11141b' : '#ffffff';
  const borderCol = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const textPrimary = isDark ? '#f3f4f6' : '#0f172a';
  const textMuted = isDark ? '#9ca3af' : '#64748b';
  const trackBg = isDark ? '#1c202a' : '#e2e8f0';

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{
        backgroundColor: bgPage,
        color: textPrimary,
        backgroundImage: isDark
          ? 'radial-gradient(ellipse 80% 35% at 50% 0%, rgba(168, 85, 247, 0.14), transparent)'
          : 'radial-gradient(ellipse 80% 35% at 50% 0%, rgba(236, 72, 153, 0.08), transparent)',
      }}
    >
      {/* ÜST SADE BAR */}
      <nav
        className="sticky top-0 z-40 backdrop-blur-md border-b"
        style={{
          backgroundColor: isDark ? 'rgba(11,13,18,0.82)' : 'rgba(244,246,250,0.85)',
          borderColor: borderCol,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Icon3DLogo />
            <span className="font-black text-base tracking-tight">GTA6TAKİP</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Çevrimiçi Butonu */}
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {onlineCount} {t.onlineBtn}
            </span>

            {/* TR | EN */}
            <div
              className="flex items-center rounded-full p-0.5 border"
              style={{ backgroundColor: bgCard, borderColor: borderCol }}
            >
              <button
                onClick={() => {
                  setLang('tr');
                  localStorage.setItem('gta6takip_lang', 'tr');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                  lang === 'tr' ? 'bg-pink-500 text-white' : ''
                }`}
              >
                <FlagTR /> TR
              </button>
              <button
                onClick={() => {
                  setLang('en');
                  localStorage.setItem('gta6takip_lang', 'en');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                  lang === 'en' ? 'bg-pink-500 text-white' : ''
                }`}
              >
                <FlagEN /> EN
              </button>
            </div>

            {/* Tema */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-full border transition hover:opacity-80"
              style={{ backgroundColor: bgCard, borderColor: borderCol }}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Yenile */}
            <button
              onClick={fetchSync}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition hover:opacity-80"
              style={{ backgroundColor: bgCard, borderColor: borderCol }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-pink-500' : ''}`} />
              <span className="hidden sm:inline">{t.refresh}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ANA KONTEYNER (PORTWATCH #RACE DÜZENİ) */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Başlık & Filtre Satırı */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="max-w-xl">
            <div
              className="text-[11px] font-bold uppercase tracking-[0.18em] mb-1.5"
              style={{ color: textMuted }}
            >
              {t.eyebrow}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">{t.title}</h1>
            <p className="text-sm leading-relaxed" style={{ color: textMuted }}>
              {t.subtitle} ({t.lastSync}: <span style={{ color: textPrimary }}>{lastUpdated}</span>)
            </p>
          </div>

          {/* Segmented Filter Pill */}
          <div
            className="inline-flex items-center p-1 rounded-xl border self-start md:self-auto"
            style={{ backgroundColor: bgCard, borderColor: borderCol }}
          >
            {[
              { id: 'all', label: t.filterAll },
              { id: 'open', label: t.filterOpen },
              { id: 'closed', label: t.filterClosed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === tab.id
                    ? isDark
                      ? 'bg-[#1f2430] text-white'
                      : 'bg-slate-900 text-white'
                    : ''
                }`}
                style={filter !== tab.id ? { color: textMuted } : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* TEK SÜTUNLU LİDERLİK KARTLARI */}
        {filteredTeams.length === 0 ? (
          <div
            className="rounded-2xl p-10 border text-center text-sm"
            style={{ backgroundColor: bgCard, borderColor: borderCol, color: textMuted }}
          >
            {t.loading}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTeams.map((team, idx) => {
              const rank = teams.indexOf(team) + 1 || idx + 1;
              const pct = Number(team.percentage ?? team.progress ?? team.pct ?? 0);
              const pctLabel = lang === 'tr' ? `%${pct}` : `${pct}%`;
              const isOpen = Boolean(team.open_source ?? team.isOpenSource ?? team.is_open_source);
              const stage = lang === 'tr' ? team.stage_tr || team.stage : team.stage_en || team.stage;
              const fps = lang === 'tr' ? team.fps_tr || team.fps : team.fps_en || team.fps;
              const desc =
                lang === 'tr'
                  ? team.desc_tr || team.description || team.desc
                  : team.desc_en || team.description || team.desc;
              const commit = team.commit_msg || team.commitMessage || team.lastCommit;
              const repoUrl = team.url || team.repo_url || team.github_url;
              const repoSlug = repoUrl ? repoUrl.replace('https://github.com/', '').replace('https://', '') : 'portwatch-vi.xyz';
              const isExpanded = Boolean(expanded[rank - 1]);

              // 6 parçalı PortWatch çubuk hesabı
              const filledSegments = Math.min(6, Math.max(0, (pct / 100) * 6));

              return (
                <article
                  key={team.name || idx}
                  className="rounded-2xl p-5 sm:p-6 border transition-colors"
                  style={{ backgroundColor: bgCard, borderColor: borderCol }}
                >
                  {/* Band 1: Üst Satır */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className="text-2xl font-black w-7 text-center shrink-0"
                        style={{ color: rank <= 3 ? '#e85595' : textMuted }}
                      >
                        {rank}
                      </span>
                      <Icon3DTeamAvatar index={idx} isOpen={isOpen} />
                      <div className="min-w-0">
                        <h2 className="text-base sm:text-lg font-bold truncate">{team.name || team.title}</h2>
                        <p className="text-xs truncate" style={{ color: textMuted }}>
                          {repoSlug}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl sm:text-[28px] font-black leading-none tracking-tight">
                        {pctLabel}
                      </div>
                      {stage && (
                        <div className="inline-flex items-center gap-1.5 text-xs mt-1.5" style={{ color: textMuted }}>
                          <Icon3DGamepad />
                          <span>{stage}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Band 2: Sade Etiketler */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        isOpen ? 'bg-purple-500/15 text-purple-400' : 'bg-slate-500/15 text-slate-400'
                      }`}
                    >
                      {isOpen ? t.openSource : t.closedTeam}
                    </span>
                    {fps && (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: trackBg, color: textPrimary }}
                      >
                        <Icon3DMonitor />
                        {fps}
                      </span>
                    )}
                  </div>

                  {/* Band 3: 6 Parçalı PortWatch İlerleme Çubuğu */}
                  <div className="grid grid-cols-6 gap-1.5 my-4">
                    {[0, 1, 2, 3, 4, 5].map((segIdx) => {
                      const segFill = Math.min(1, Math.max(0, filledSegments - segIdx)) * 100;
                      return (
                        <div
                          key={segIdx}
                          className="h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: trackBg }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${segFill}%`,
                              background: 'linear-gradient(90deg, #7c5cff 0%, #ec4899 100%)',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Aşama Noktaları */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[11px] mb-4">
                    {MILESTONES[lang].map((mLabel, mIdx) => {
                      const reached = filledSegments >= mIdx + 0.5;
                      return (
                        <div key={mLabel} className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: reached ? '#ec4899' : textMuted, opacity: reached ? 1 : 0.4 }}
                          />
                          <span className="truncate" style={{ color: reached ? textPrimary : textMuted }}>
                            {mLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detay Açılır Alan */}
                  {isExpanded && (commit || desc) && (
                    <div
                      className="text-xs leading-relaxed py-3 border-t"
                      style={{ color: textMuted, borderColor: borderCol }}
                    >
                      {desc && <p className="mb-1">{desc}</p>}
                      {commit && (
                        <p>
                          <strong style={{ color: textPrimary }}>{t.latestCommit}:</strong> {commit}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Alt Aksiyon Satırı */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t"
                    style={{ borderColor: borderCol }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpanded((prev) => ({ ...prev, [rank - 1]: !isExpanded }))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition hover:opacity-80"
                      style={{ borderColor: borderCol, color: textPrimary }}
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {isExpanded ? t.hideDetails : t.details}
                    </button>

                    {repoUrl && (
                      <a
                        href={repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition hover:opacity-90 ${
                          isDark ? 'bg-white text-[#0b0d12]' : 'bg-slate-900 text-white'
                        }`}
                      >
                        <span>{isOpen ? t.viewRepo : t.viewPortwatch}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ALT SOSYAL & PAYLAŞIM ŞERİDİ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <a
            href="https://x.com/batmancodex"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-semibold transition hover:opacity-80"
            style={{ backgroundColor: bgCard, borderColor: borderCol }}
          >
            <span>𝕏 | batmancodex</span>
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-semibold text-emerald-400 transition hover:opacity-80"
            style={{ backgroundColor: bgCard, borderColor: borderCol }}
          >
            <span>{t.shareWa}</span>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-semibold transition hover:opacity-80"
            style={{ backgroundColor: bgCard, borderColor: borderCol }}
          >
            <span>{t.shareX}</span>
          </a>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center text-xs" style={{ color: textMuted }}>
        <p>{t.disclaimer}</p>
      </footer>
    </div>
  );
}
