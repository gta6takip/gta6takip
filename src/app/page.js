'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ExternalLink,
  Cpu,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Clock,
  Palette,
} from 'lucide-react';

const THEMES = [
  { id: 'portwatch-dark', tr: 'PortWatch Koyu', en: 'PortWatch Dark' },
  { id: 'portwatch-light', tr: 'PortWatch Açık', en: 'PortWatch Light' },
];

const TRANSLATIONS = {
  tr: {
    headerSubtitle: '120sn Otomatik İlerleme Takibi (PortWatch VI)',
    themeLabel: 'Tema Seç',
    online: 'Çevrimiçi',
    activeConnections: 'Aktif Ziyaretçiler',
    close: 'Kapat',
    leader: 'Lider:',
    syncing: 'Güncelleniyor...',
    autoRefresh: 'Oto Yenile',
    secShort: 'sn',
    heroBadge: 'Her 120 Saniyede Otomatik Tarama',
    heroTitle: 'Ekiplerin Tamamlanma Yüzdeleri',
    heroSubtitle:
      'PortWatch VI verileri ve GitHub commit akışlarıyla otomatik güncellenen PC port takip paneli.',
    peak: 'Zirve',
    next: 'Sonraki',
    leaderboardTitle: 'Portlama Ekipleri Sıralaması',
    teamWord: 'Ekip',
    highToLow: 'Yüksekten düşüğe',
    openSource: 'Açık Kaynak',
    closedTeam: 'Kapalı Ekip',
    stagePrefix: 'Aşama:',
    developing: 'Geliştirme',
    noFps: 'FPS bilgisi yok',
    lastUpdate: 'Son Güncelleme Saati:',
    notSynced: 'Senkronize ediliyor...',
    unknownTime: 'Bilinmiyor',
    source: 'Kaynak',
    footerText:
      'GTA6takip bağımsız bir topluluk takip sitesidir; Rockstar Games veya Take-Two ile resmi bağlantısı yoktur.',
    stageLevel1: 'Groundwork',
    stageLevel2: 'First Frame / Menu',
    stageLevel3: 'In the World',
    stageLevel4: 'Playable',
    stageTooltip: 'Aşama Seviyesi',
    visitorPrefix: 'Ziyaretçi',
  },
  en: {
    headerSubtitle: '120s Auto Progress Tracker (PortWatch VI)',
    themeLabel: 'Select Theme',
    online: 'Online',
    activeConnections: 'Active Visitors',
    close: 'Close',
    leader: 'Leader:',
    syncing: 'Syncing...',
    autoRefresh: 'Auto Refresh',
    secShort: 's',
    heroBadge: 'Auto Scan Every 120 Seconds',
    heroTitle: 'Team Completion Progress',
    heroSubtitle:
      'Live PC port tracker automatically synced with PortWatch VI and GitHub commits.',
    peak: 'Peak',
    next: 'Next',
    leaderboardTitle: 'Porting Teams Leaderboard',
    teamWord: 'Teams',
    highToLow: 'Highest to lowest',
    openSource: 'Open Source',
    closedTeam: 'Closed Team',
    stagePrefix: 'Stage:',
    developing: 'In Development',
    noFps: 'No FPS data',
    lastUpdate: 'Last Updated:',
    notSynced: 'Syncing...',
    unknownTime: 'Unknown',
    source: 'Source',
    footerText:
      'GTA6takip is an independent community tracker; not affiliated with Rockstar Games or Take-Two.',
    stageLevel1: 'Groundwork',
    stageLevel2: 'First Frame / Menu',
    stageLevel3: 'In the World',
    stageLevel4: 'Playable',
    stageTooltip: 'Stage Level',
    visitorPrefix: 'Visitor',
  },
};

const FALLBACK_PROJECTS = [
  {
    id: 1,
    name: 'Belobug',
    percentage: 77.4,
    fps: '3 FPS (RX 9070 XT)',
    stage: 'Playable • First act',
    description: 'AMD Radeon için VIctory fork\'u; açık dünya dokuları ve görevler oynanabilir durumda.',
    repo_url: 'https://github.com/Belobug/VIctory-Belobug-AMD',
    is_open_source: true,
    updated_at: null,
  },
  {
    id: 2,
    name: 'ZETTROX',
    percentage: 64.2,
    fps: '2 FPS (NVIDIA)',
    stage: 'Playable • Prologue cleared',
    description: 'Lucia prologue bölümünü geçip Jason\'ın ilk görevi "Gone Fishing" aşamasına ulaştı.',
    repo_url: 'https://github.com/Zettrox/ztrx',
    is_open_source: true,
    updated_at: null,
  },
  {
    id: 3,
    name: 'suri',
    percentage: 61,
    fps: '3 FPS',
    stage: 'Playable • Kapalı Derleme',
    description: 'Kapalı ekip: victory-fork tabanlı özel derleme, perakende sürüme yakın ışıklandırma.',
    repo_url: 'https://portwatch-vi.xyz/#race',
    is_open_source: false,
    updated_at: null,
  },
];

function StageVisualBadge({ percentage, stage = '', t }) {
  const pct = Number(percentage) || 0;
  const s = stage.toLowerCase();

  let level = 1;
  let label = t.stageLevel1;
  let boxClass = 'bg-purple-500/15 text-purple-500 border-purple-500/30';
  let stepFill = 'bg-purple-500';

  if (pct >= 50 || s.includes('playable') || s.includes('akıcı')) {
    level = 4;
    label = t.stageLevel4;
    boxClass = 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
    stepFill = 'bg-emerald-500';
  } else if (pct >= 40 || s.includes('world') || s.includes('oyun içi')) {
    level = 3;
    label = t.stageLevel3;
    boxClass = 'bg-amber-500/15 text-amber-500 border-amber-500/30';
    stepFill = 'bg-amber-500';
  } else if (pct >= 20 || s.includes('menu') || s.includes('frame')) {
    level = 2;
    label = t.stageLevel2;
    boxClass = 'bg-sky-500/15 text-sky-500 border-sky-500/30';
    stepFill = 'bg-sky-500';
  }

  return (
    <div
      title={`${t.stageTooltip} ${level}/4: ${stage || label}`}
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs font-bold shrink-0 ${boxClass}`}
    >
      <span>{label}</span>
      <span className="hidden sm:inline-flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={`w-1.5 h-2.5 rounded-sm ${
              step <= level ? stepFill : 'bg-slate-400/30'
            }`}
          />
        ))}
      </span>
    </div>
  );
}

function formatUpdateTime(dateStr, t, lang) {
  if (!dateStr) return t.notSynced;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return t.unknownTime;
  return d.toLocaleTimeString(lang === 'en' ? 'en-US' : 'tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function HomePage() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [syncing, setSyncing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showOnlinePanel, setShowOnlinePanel] = useState(false);
  const [theme, setTheme] = useState('portwatch-dark');
  const [lang, setLang] = useState('tr');

  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('gta6takip_theme');
      if (savedTheme && THEMES.some((th) => th.id === savedTheme)) {
        setTheme(savedTheme);
      }

      const savedLang = localStorage.getItem('gta6takip_lang');
      if (savedLang === 'tr' || savedLang === 'en') {
        setLang(savedLang);
      }
    } catch {
      // ignore
    }

    handleAutoSync();

    let visitorId = '';
    try {
      visitorId = sessionStorage.getItem('gta6takip_vid') || '';
      if (!visitorId) {
        visitorId = `Ziyaretci-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        sessionStorage.setItem('gta6takip_vid', visitorId);
      }
    } catch {
      visitorId = `Ziyaretci-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    }

    setOnlineUsers([visitorId]);

    const presenceChannel = supabase.channel('gta6takip-online-room', {
      config: { presence: { key: visitorId } },
    });

    const syncPresenceList = () => {
      const state = presenceChannel.presenceState();
      const names = Array.from(new Set(Object.keys(state)));
      setOnlineUsers(names.length > 0 ? names : [visitorId]);
    };

    presenceChannel
      .on('presence', { event: 'sync' }, syncPresenceList)
      .on('presence', { event: 'join' }, syncPresenceList)
      .on('presence', { event: 'leave' }, syncPresenceList)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user: visitorId,
            online_at: new Date().toISOString(),
          });
        }
      });

    const handleLeave = () => {
      try {
        presenceChannel.untrack();
        supabase.removeChannel(presenceChannel);
      } catch {
        // ignore
      }
    };

    window.addEventListener('pagehide', handleLeave);
    window.addEventListener('beforeunload', handleLeave);

    return () => {
      window.removeEventListener('pagehide', handleLeave);
      window.removeEventListener('beforeunload', handleLeave);
      handleLeave();
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('gta6takip_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('gta6takip_lang', lang);
    } catch {
      // ignore
    }
  }, [lang]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleAutoSync();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  async function handleAutoSync() {
    if (syncing) return;
    setSyncing(true);
    const nowIso = new Date().toISOString();

    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      const json = await res.json();
      if (json?.ok && Array.isArray(json.projects) && json.projects.length > 0) {
        setProjects(json.projects);
      } else {
        setProjects((prev) => prev.map((item) => ({ ...item, updated_at: nowIso })));
      }
      setSecondsLeft(120);
    } catch {
      setProjects((prev) => prev.map((item) => ({ ...item, updated_at: nowIso })));
      setSecondsLeft(120);
    } finally {
      setSyncing(false);
    }
  }

  const topScore =
    projects.length > 0
      ? Math.max(...projects.map((p) => Number(p.percentage) || 0))
      : 77.4;

  const leaderName = projects[0]?.name || 'Belobug';
  const onlineCount = Math.max(1, onlineUsers.length);

  return (
    <div
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
      className="min-h-screen flex flex-col transition-colors duration-200"
    >
      {/* Üst Çubuk */}
      <header
        style={{ backgroundColor: 'var(--header-bg)', borderColor: 'var(--card-border)' }}
        className="sticky top-0 z-30 backdrop-blur-xl border-b"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gta-bar-fill flex items-center justify-center shadow-sm text-white font-black text-sm tracking-tight">
              VI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight">
                  GTA6takip
                </span>
                <span
                  style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
                  className="hidden sm:inline-flex items-center text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full border font-semibold"
                >
                  LEONIDA • PC PORT
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
                {t.headerSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* TR | EN SVG Bayraklı Dil Seçici */}
            <div
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              className="inline-flex items-center p-0.5 rounded-xl border"
            >
              <button
                type="button"
                onClick={() => setLang('tr')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  lang === 'tr' ? 'gta-bar-fill text-white shadow-sm' : 'opacity-75 hover:opacity-100'
                }`}
              >
                <svg className="w-4 h-3 rounded-[2px] shrink-0 shadow-sm" viewBox="0 0 30 20" aria-hidden="true">
                  <rect width="30" height="20" fill="#E30A17" />
                  <circle cx="11.5" cy="10" r="5" fill="#fff" />
                  <circle cx="12.8" cy="10" r="4" fill="#E30A17" />
                  <polygon points="16.5,10 19.2,9.1 17.5,11.4 17.5,8.6 19.2,10.9" fill="#fff" />
                </svg>
                <span>TR</span>
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  lang === 'en' ? 'gta-bar-fill text-white shadow-sm' : 'opacity-75 hover:opacity-100'
                }`}
              >
                <svg className="w-4 h-3 rounded-[2px] shrink-0 shadow-sm" viewBox="0 0 30 20" aria-hidden="true">
                  <rect width="30" height="20" fill="#fff" />
                  <rect y="0" width="30" height="2.8" fill="#B22234" />
                  <rect y="5.7" width="30" height="2.8" fill="#B22234" />
                  <rect y="11.4" width="30" height="2.8" fill="#B22234" />
                  <rect y="17.1" width="30" height="2.9" fill="#B22234" />
                  <rect width="13" height="11.4" fill="#3C3B6E" />
                </svg>
                <span>EN</span>
              </button>
            </div>

            {/* Tema Seçici */}
            <div
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border"
            >
              <Palette style={{ color: 'var(--text-secondary)' }} className="w-3.5 h-3.5 hidden sm:block" />
              <select
                aria-label={t.themeLabel}
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                style={{ color: 'var(--text-primary)' }}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {THEMES.map((th) => (
                  <option key={th.id} value={th.id} className="bg-slate-900 text-white">
                    {lang === 'en' ? th.en : th.tr}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowOnlinePanel((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 transition cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Users className="w-3.5 h-3.5" />
                <span>{onlineCount} {t.online}</span>
              </button>

              {showOnlinePanel && (
                <div
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                  className="absolute right-0 mt-2 w-60 rounded-2xl border shadow-2xl p-3.5 z-40"
                >
                  <div
                    style={{ borderColor: 'var(--card-border)' }}
                    className="flex items-center justify-between border-b pb-2 mb-2"
                  >
                    <span className="text-xs font-extrabold">
                      {t.activeConnections} ({onlineCount})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOnlinePanel(false)}
                      style={{ color: 'var(--text-secondary)' }}
                      className="text-[11px] hover:underline cursor-pointer"
                    >
                      {t.close}
                    </button>
                  </div>
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto vice-scroll list-none p-0 m-0">
                    {(onlineUsers.length > 0 ? onlineUsers : [`${t.visitorPrefix}-1`]).map((nick, i) => (
                      <li
                        key={`${nick}-${i}`}
                        style={{ backgroundColor: 'var(--card-inner)' }}
                        className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate font-semibold">{nick}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span style={{ color: 'var(--text-secondary)' }}>{t.leader}</span>
              <span className="font-bold">{leaderName}</span>
              <span className="font-black pw-text-gradient">%{topScore}</span>
            </div>

            <button
              type="button"
              onClick={handleAutoSync}
              disabled={syncing}
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border hover:opacity-90 transition cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-pink-500 ${syncing ? 'animate-spin' : ''}`}
              />
              <span>{syncing ? t.syncing : `${t.autoRefresh} (${secondsLeft}${t.secShort})`}</span>
            </button>
          </div>
        </div>
      </header>

      {/* PortWatch VI Gün Batımı Hero Şeridi */}
      <section className="pw-hero-bg relative overflow-hidden border-b border-white/10">
        <svg
          className="absolute right-0 bottom-0 h-full w-72 sm:w-96 opacity-20 pointer-events-none select-none"
          viewBox="0 0 400 180"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="290" cy="110" r="64" fill="url(#pwSun)" />
          <rect x="210" y="108" width="160" height="4" fill="#120824" />
          <rect x="210" y="120" width="160" height="5" fill="#120824" />
          <rect x="210" y="134" width="160" height="7" fill="#120824" />
          <path
            d="M0 180 L0 135 L35 135 L35 110 L65 110 L65 142 L95 142 L95 95 L130 95 L130 148 L170 148 L170 120 L205 120 L205 180 Z"
            fill="#0b1120"
            opacity="0.65"
          />
          <defs>
            <linearGradient id="pwSun" x1="290" y1="46" x2="290" y2="174" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fbbf24" />
              <stop offset="0.55" stopColor="#ec4899" />
              <stop offset="1" stopColor="#9333ea" />
            </linearGradient>
          </defs>
        </svg>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6 relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-pink-200 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {t.heroBadge}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {t.heroTitle}
            </h1>
            <p className="text-xs text-purple-100/85">
              {t.heroSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-950/45 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-white shrink-0">
            <div className="px-2.5 text-center">
              <div className="text-[10px] uppercase tracking-wider text-purple-200/75">{t.peak}</div>
              <div className="text-lg sm:text-xl font-extrabold text-amber-300">%{topScore}</div>
            </div>
            <div className="px-2.5 border-l border-white/15 text-center">
              <div className="text-[10px] uppercase tracking-wider text-purple-200/75">{t.next}</div>
              <div className="text-lg sm:text-xl font-extrabold text-pink-300 tabular-nums">{secondsLeft}{t.secShort}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ana İçerik: Tam Genişlikte İlerleme Bar Çubukları */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
            <Cpu className="w-4 h-4 text-pink-500" />
            {t.leaderboardTitle} ({projects.length} {t.teamWord})
          </h2>
          <span style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
            {t.highToLow}
          </span>
        </div>

        <ul className="flex flex-col gap-3.5 list-none p-0 m-0">
          {projects.map((proj, index) => {
            const pct = Math.min(100, Math.max(0, Number(proj.percentage) || 0));

            return (
              <li
                key={proj.id || index}
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                className="rounded-2xl p-4 sm:p-5 border shadow-sm transition"
              >
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                    <span
                      className={`text-base font-black shrink-0 ${
                        index < 3 ? 'pw-text-gradient' : 'opacity-60'
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold tracking-tight truncate">
                      {proj.name}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0 border ${
                        proj.is_open_source
                          ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25'
                          : 'bg-pink-500/15 text-pink-600 border-pink-500/25'
                      }`}
                    >
                      {proj.is_open_source ? t.openSource : t.closedTeam}
                    </span>
                  </div>

                  <span className="text-xl sm:text-2xl font-extrabold tabular-nums pw-text-gradient shrink-0">
                    %{pct}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div
                    style={{ backgroundColor: 'var(--track-bg)' }}
                    className="relative flex-1 h-3 rounded-full overflow-hidden"
                  >
                    <div
                      className="gta-bar-fill h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  <StageVisualBadge percentage={pct} stage={proj.stage} t={t} />
                </div>

                <div
                  style={{ backgroundColor: 'var(--card-inner)', borderColor: 'var(--card-border)' }}
                  className="rounded-xl px-3 py-2 border mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <span className="font-semibold">
                    {t.stagePrefix} {proj.stage || t.developing}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {proj.fps && proj.fps !== '-' ? proj.fps : t.noFps}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 text-xs">
                  <div className="space-y-1">
                    <p style={{ color: 'var(--text-secondary)' }} className="leading-relaxed">
                      {proj.description}
                    </p>
                    <p
                      style={{ color: 'var(--text-secondary)' }}
                      className="inline-flex items-center gap-1.5 text-[11px] opacity-80 pt-0.5"
                    >
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{t.lastUpdate} {formatUpdateTime(proj.updated_at, t, lang)}</span>
                    </p>
                  </div>

                  {proj.repo_url && (
                    <a
                      href={proj.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ borderColor: 'var(--card-border)' }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-pink-500 hover:opacity-80 text-xs font-semibold transition shrink-0 self-start sm:self-end"
                    >
                      {t.source} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </main>

      <footer
        style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
        className="border-t py-4 px-4 text-center text-[11px]"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{t.footerText}</span>
        </div>
      </footer>
    </div>
  );
}
