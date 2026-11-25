'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCw, ExternalLink, Sparkles, X, TrendingUp, Cpu, Radio } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const APP_VERSION = 'v1.0.2';

const CHANGELOG = {
  tr: [
    {
      version: 'v1.0.2',
      date: '25 Kasım 2026',
      items: [
        '120 saniyelik canlı geri sayım sayacı ("Sonraki kontrol") eklendi.',
        '"Son Gelişmeler" mini bülten bandı ve Test Edilen Ekran Kartları (FPS) özeti eklendi.',
        'Yüzdesi artan ekipler için yeşil artış rozeti (▲ +%...) eklendi.',
      ],
    },
    {
      version: 'v1.0.1',
      date: '25 Kasım 2026',
      items: [
        'Android ve dar mobil ekranlarda geliştirici isimlerinin "..." şeklinde kesilmesi düzeltildi.',
        'Tamamen sade ve güvenli salt takip düzeni korundu.',
      ],
    },
    {
      version: 'v1.0.0',
      date: '25 Kasım 2026',
      items: [
        'PortWatch VI #race düzenine uyumlu sade ve modern arayüz eklendi.',
        '2 standart (Koyu/Açık) + 3 GTA VI temalı olmak üzere 5 tema desteği getirildi.',
        'Zortos, vice-pc ve XValkyrie dahil 15 ekip için 120 saniyede bir otomatik veri akışı sağlandı.',
      ],
    },
  ],
  en: [
    {
      version: 'v1.0.2',
      date: 'November 25, 2026',
      items: [
        'Added live 120s countdown timer ("Next check").',
        'Added "Latest Updates" mini news strip and Tested GPUs (FPS) summary bar.',
        'Added green progress delta badge (▲ +...%) for advancing teams.',
      ],
    },
    {
      version: 'v1.0.1',
      date: 'November 25, 2026',
      items: [
        'Fixed developer names truncating with "..." on narrow Android mobile screens.',
        'Kept the clean, read-only leaderboard layout.',
      ],
    },
    {
      version: 'v1.0.0',
      date: 'November 25, 2026',
      items: [
        'Introduced clean leaderboard layout inspired by PortWatch VI #race.',
        'Added 5 themes: 2 standard (Dark/Light) + 3 GTA VI themed (Vice Sunset, Leonida Neon, Ocean Drive).',
        'Expanded automatic 120s live tracking to 15 teams including Zortos, vice-pc, and XValkyrie.',
      ],
    },
  ],
};

const NEWS_FEED = {
  tr: [
    { tag: 'LİDER', text: 'Belobug AMD sürümü %77.4 ile ilk bölüm oynanışında liderliğini koruyor.' },
    { tag: 'YENİ', text: 'Zortos PC başlatma duyurusu yaptı; vice-pc ve XValkyrie takibe eklendi.' },
    { tag: 'NOT', text: 'Leonida projesi Take-Two DMCA bildirimi sonrası GitHub’dan kaldırıldı.' },
  ],
  en: [
    { tag: 'LEADER', text: 'Belobug AMD build leads at 77.4% with First Act playable.' },
    { tag: 'NEW', text: 'Zortos reported PC boot; vice-pc and XValkyrie added to live tracking.' },
    { tag: 'NOTE', text: 'Leonida was taken down from GitHub following a Take-Two DMCA notice.' },
  ],
};

const TESTED_GPUS = [
  { gpu: 'RX 9070 XT', fps: '3 FPS', team: 'Belobug' },
  { gpu: 'RTX 5060 Ti', fps: '4 FPS', team: 'Uilian' },
  { gpu: 'RTX 4070', fps: '3 FPS', team: 'hyphennn' },
  { gpu: 'NVIDIA', fps: '2 FPS', team: 'ZETTROX' },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const THEMES = {
  dark: {
    id: 'dark',
    labelTr: 'Koyu',
    labelEn: 'Dark',
    dot: '#7c5cff',
    isDark: true,
    bgPage: '#0b0d12',
    bgNav: 'rgba(11,13,18,0.84)',
    bgCard: '#11141b',
    border: 'rgba(255,255,255,0.08)',
    textPrimary: '#f3f4f6',
    textMuted: '#9ca3af',
    trackBg: '#1c202a',
    accent: '#e85595',
    glow: 'rgba(232, 85, 149, 0.65)',
    barGradient: 'linear-gradient(90deg, #7c5cff 0%, #ec4899 100%)',
    ambient: 'radial-gradient(ellipse 80% 35% at 50% 0%, rgba(168, 85, 247, 0.15), transparent)',
  },
  light: {
    id: 'light',
    labelTr: 'Açık',
    labelEn: 'Light',
    dot: '#e2e8f0',
    isDark: false,
    bgPage: '#f4f6fa',
    bgNav: 'rgba(244,246,250,0.86)',
    bgCard: '#ffffff',
    border: 'rgba(15,23,42,0.08)',
    textPrimary: '#0f172a',
    textMuted: '#64748b',
    trackBg: '#e2e8f0',
    accent: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.5)',
    barGradient: 'linear-gradient(90deg, #7c5cff 0%, #ec4899 100%)',
    ambient: 'radial-gradient(ellipse 80% 35% at 50% 0%, rgba(236, 72, 153, 0.08), transparent)',
  },
  'vice-sunset': {
    id: 'vice-sunset',
    labelTr: 'Vice Sunset',
    labelEn: 'Vice Sunset',
    dot: 'linear-gradient(135deg, #ec4899, #f97316)',
    isDark: true,
    bgPage: '#13081e',
    bgNav: 'rgba(19,8,30,0.86)',
    bgCard: '#1d0e2d',
    border: 'rgba(236,72,153,0.18)',
    textPrimary: '#fdf2f8',
    textMuted: '#c4b5fd',
    trackBg: '#2e1647',
    accent: '#f472b6',
    glow: 'rgba(244, 114, 182, 0.7)',
    barGradient: 'linear-gradient(90deg, #ec4899 0%, #f97316 100%)',
    ambient: 'radial-gradient(ellipse 85% 40% at 50% 0%, rgba(236, 72, 153, 0.22), transparent)',
  },
  'leonida-neon': {
    id: 'leonida-neon',
    labelTr: 'Leonida Neon',
    labelEn: 'Leonida Neon',
    dot: 'linear-gradient(135deg, #06b6d4, #f43f5e)',
    isDark: true,
    bgPage: '#06131a',
    bgNav: 'rgba(6,19,26,0.86)',
    bgCard: '#0c1d27',
    border: 'rgba(6,182,212,0.18)',
    textPrimary: '#ecfeff',
    textMuted: '#7dd3fc',
    trackBg: '#132d3b',
    accent: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.7)',
    barGradient: 'linear-gradient(90deg, #06b6d4 0%, #f43f5e 100%)',
    ambient: 'radial-gradient(ellipse 85% 40% at 50% 0%, rgba(6, 182, 212, 0.20), transparent)',
  },
  'ocean-drive': {
    id: 'ocean-drive',
    labelTr: 'Ocean Drive',
    labelEn: 'Ocean Drive',
    dot: 'linear-gradient(135deg, #f59e0b, #fb7185)',
    isDark: true,
    bgPage: '#150d13',
    bgNav: 'rgba(21,13,19,0.86)',
    bgCard: '#21141d',
    border: 'rgba(245,158,11,0.18)',
    textPrimary: '#fffbeb',
    textMuted: '#fda4af',
    trackBg: '#331d2c',
    accent: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.7)',
    barGradient: 'linear-gradient(90deg, #f59e0b 0%, #fb7185 100%)',
    ambient: 'radial-gradient(ellipse 85% 40% at 50% 0%, rgba(245, 158, 11, 0.18), transparent)',
  },
};

function localizeDynamicText(raw, lang) {
  if (!raw) return '';
  let text = String(raw).trim();

  if (lang === 'en') {
    const trToEn = [
      [/\(Menü\)/gi, '(Menu)'],
      [/Oynanabilir/gi, 'Playable'],
      [/Ana Menü/gi, 'Main Menu'],
      [/Oyun Dünyası/gi, 'In the World'],
      [/İlk Kare/gi, 'First Frame'],
      [/Exe Çalışıyor/gi, 'Exe Runs'],
      [/Altyapı/gi, 'Groundwork'],
      [/Kapalı Ekip/gi, 'Closed Team'],
      [/Açık Kaynak/gi, 'Open Source'],
      [/Tanılama Modu/gi, 'Diagnostic Mode'],
    ];
    for (const [re, rep] of trToEn) text = text.replace(re, rep);
    return text;
  }

  const enToTr = [
    [/Playable/gi, 'Oynanabilir'],
    [/Main [Mm]enu/gi, 'Ana Menü'],
    [/In the [Ww]orld/gi, 'Oyun Dünyası'],
    [/First [Ff]rame/gi, 'İlk Kare'],
    [/First [Aa]ct/gi, 'İlk Bölüm'],
    [/Prologue [Cc]leared/gi, 'Giriş Bölümü Geçildi'],
    [/Prologue Geçildi/gi, 'Giriş Bölümü Geçildi'],
    [/Lucia prologue bölümünü/gi, 'Lucia giriş bölümünü'],
    [/VIctory fork'u/gi, 'VIctory tabanlı sürüm'],
    [/Opening [Ss]cene/gi, 'Açılış Sahnesi'],
    [/Prison [Ss]cene/gi, 'Hapishane Sahnesi'],
    [/Private [Bb]uild/gi, 'Özel Sürüm'],
    [/Diagnostic [Mm]ode/gi, 'Tanılama Modu'],
    [/GDK Samples/gi, 'GDK Örnekleri'],
    [/\(Menu\)/gi, '(Menü)'],
  ];
  for (const [re, rep] of enToTr) text = text.replace(re, rep);
  return text;
}

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

const XLogoSVG = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppLogoSVG = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="currentColor" aria-hidden="true">
    <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.453 3.484 1.328 5l-1.391 5.078 5.203-1.359c1.469.797 3.125 1.219 4.828 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.813 14.125c-.25.703-1.438 1.344-2 1.422-.516.078-1.172.109-1.891-.125-.438-.141-1-.328-1.719-.641-3.016-1.297-4.984-4.328-5.141-4.531-.141-.203-1.219-1.625-1.219-3.094 0-1.469.766-2.188 1.047-2.484.281-.297.609-.375.813-.375.203 0 .406.016.578.016.188 0 .438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.109.203-.156.344-.313.516-.156.188-.328.406-.469.547-.156.156-.313.328-.141.625.188.297.813 1.344 1.75 2.172 1.203 1.078 2.219 1.406 2.516 1.563.297.156.469.125.641-.078.172-.203.75-.875.953-1.172.203-.297.406-.25.672-.156.281.094 1.766.828 2.063.984.297.141.5.219.578.344.078.125.078.719-.172 1.422z" />
  </svg>
);

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
    <svg viewBox="0 0 42 42" className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]" aria-hidden="true">
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
    brand: 'GTA6TAKİP',
    eyebrow: 'LİDERLİK TABLOSU',
    title: 'GTA VI Port Ekipleri',
    subtitle:
      'PortWatch VI verileri ve açık kaynak GitHub depoları, her 120 saniyede bir otomatik olarak güncellenir.',
    onlineBtn: 'Çevrimiçi',
    liveBadge: 'CANLI',
    updatesBtn: 'Güncelleme Notları',
    updatesTitle: 'Güncelleme Notları',
    nextCheck: 'Sonraki kontrol',
    newsTitle: 'Son Gelişmeler',
    gpuTitle: 'Test Edilen Ekran Kartları',
    filterAll: 'Tümü',
    filterOpen: 'Açık Kaynak',
    filterClosed: 'Kapalı Ekip',
    openSource: 'Açık Kaynak',
    closedTeam: 'Kapalı Ekip',
    lastSync: 'Son Güncelleme',
    refresh: 'Yenile',
    viewRepo: 'GitHub',
    viewPortwatch: 'PortWatch',
    viewSource: 'Kaynak',
    shareWa: "WhatsApp'ta Paylaş",
    shareX: "X'te Paylaş",
    disclaimer:
      'GTA6takip, PortWatch projesinin kâr gütmeyen, hobi amaçlı alternatifidir. Veriler otomatik olarak portwatch-vi.xyz/#race ve açık GitHub depolarından alınır.',
    loading: 'Veriler yükleniyor...',
  },
  en: {
    brand: 'GTA6TAKIP',
    eyebrow: 'LEADERBOARD',
    title: 'GTA VI Port Teams',
    subtitle:
      'PortWatch VI race data and open-source GitHub repositories sync automatically every 120 seconds.',
    onlineBtn: 'Online',
    liveBadge: 'LIVE',
    updatesBtn: 'Release Notes',
    updatesTitle: 'Release Notes',
    nextCheck: 'Next check',
    newsTitle: 'Latest Updates',
    gpuTitle: 'Tested GPUs & FPS',
    filterAll: 'All',
    filterOpen: 'Open Source',
    filterClosed: 'Closed Team',
    openSource: 'Open Source',
    closedTeam: 'Closed Team',
    lastSync: 'Last Sync',
    refresh: 'Refresh',
    viewRepo: 'GitHub',
    viewPortwatch: 'PortWatch',
    viewSource: 'Source',
    shareWa: 'Share on WhatsApp',
    shareX: 'Share on X',
    disclaimer:
      'GTA6takip is a non-profit, hobbyist alternative to PortWatch. Data syncs automatically from portwatch-vi.xyz/#race and public GitHub repositories.',
    loading: 'Loading team progress...',
  },
};

export default function Home() {
  const [lang, setLang] = useState('tr');
  const [themeId, setThemeId] = useState('dark');
  const [teams, setTeams] = useState([]);
  const [deltas, setDeltas] = useState({});
  const [filter, setFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState('--:--:--');
  const [countdown, setCountdown] = useState(120);
  const [syncing, setSyncing] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [showChangelog, setShowChangelog] = useState(false);
  const prevPctsRef = useRef({});

  const t = TEXT[lang];
  const activeTheme = THEMES[themeId] || THEMES.dark;

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('gta6takip_theme');
      if (savedTheme && THEMES[savedTheme]) setThemeId(savedTheme);
      const savedLang = localStorage.getItem('gta6takip_lang');
      if (savedLang === 'tr' || savedLang === 'en') setLang(savedLang);
      const savedPcts = JSON.parse(localStorage.getItem('gta6takip_prev_pcts') || '{}');
      if (savedPcts && typeof savedPcts === 'object') prevPctsRef.current = savedPcts;
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('portwatch-dark', activeTheme.isDark);
    document.documentElement.classList.toggle('portwatch-light', !activeTheme.isDark);
    try {
      localStorage.setItem('gta6takip_theme', themeId);
    } catch {
      // ignore
    }
  }, [themeId, activeTheme.isDark]);

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

      if (Array.isArray(rawList) && rawList.length > 0) {
        const nextDeltas = {};
        const nextSnapshot = { ...prevPctsRef.current };

        for (const item of rawList) {
          const name = item.name || item.title;
          const pct = Number(item.percentage ?? item.progress ?? item.pct ?? 0);
          if (!name) continue;
          const prev = prevPctsRef.current[name];
          if (typeof prev === 'number' && pct > prev) {
            nextDeltas[name] = Number((pct - prev).toFixed(1));
          }
          nextSnapshot[name] = pct;
        }

        if (Object.keys(nextDeltas).length > 0) {
          setDeltas((old) => ({ ...old, ...nextDeltas }));
        }
        prevPctsRef.current = nextSnapshot;
        try {
          localStorage.setItem('gta6takip_prev_pcts', JSON.stringify(nextSnapshot));
        } catch {
          // ignore
        }
        setTeams(rawList);
      }
      setLastUpdated(new Date().toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US'));
      setCountdown(120);
    } catch {
      // ignore
    } finally {
      setSyncing(false);
    }
  }, [lang]);

  useEffect(() => {
    fetchSync();
    const syncTimer = setInterval(fetchSync, 120000);
    return () => clearInterval(syncTimer);
  }, [fetchSync]);

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 120));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

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
      ? 'GTA VI PC Port geliştirme ekiplerini canlı takip ediyorum! 🚀'
      : 'Tracking the GTA VI PC Port teams live! 🚀';
  const shareUrl = 'https://gta6takip.vercel.app/';

  const countdownStr = `${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(
    countdown % 60
  ).padStart(2, '0')}`;

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: activeTheme.bgPage,
        color: activeTheme.textPrimary,
        backgroundImage: activeTheme.ambient,
      }}
    >
      {/* ÜST SADE BAR */}
      <nav
        className="sticky top-0 z-40 backdrop-blur-md border-b"
        style={{
          backgroundColor: activeTheme.bgNav,
          borderColor: activeTheme.border,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Icon3DLogo />
            <span className="font-black text-base tracking-tight">{t.brand}</span>
            <button
              type="button"
              onClick={() => setShowChangelog(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition hover:opacity-85"
              style={{
                backgroundColor: activeTheme.bgCard,
                borderColor: activeTheme.border,
                color: activeTheme.accent,
              }}
              title={t.updatesBtn}
            >
              <Sparkles className="w-3 h-3" />
              <span>{APP_VERSION}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {onlineCount} {t.onlineBtn}
            </span>

            <div
              className="flex items-center gap-1 rounded-full p-1 border"
              style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
              title="Tema / Theme"
            >
              {Object.values(THEMES).map((th) => {
                const selected = th.id === themeId;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setThemeId(th.id)}
                    title={lang === 'tr' ? th.labelTr : th.labelEn}
                    aria-label={th.labelEn}
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-transform ${
                      selected ? 'scale-110 ring-2 ring-offset-1 ring-pink-500' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ background: th.dot }}
                  />
                );
              })}
            </div>

            <div
              className="flex items-center rounded-full p-0.5 border"
              style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
            >
              <button
                onClick={() => {
                  setLang('tr');
                  localStorage.setItem('gta6takip_lang', 'tr');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                  lang === 'tr' ? 'text-white' : ''
                }`}
                style={lang === 'tr' ? { backgroundColor: activeTheme.accent } : undefined}
              >
                <FlagTR /> TR
              </button>
              <button
                onClick={() => {
                  setLang('en');
                  localStorage.setItem('gta6takip_lang', 'en');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                  lang === 'en' ? 'text-white' : ''
                }`}
                style={lang === 'en' ? { backgroundColor: activeTheme.accent } : undefined}
              >
                <FlagEN /> EN
              </button>
            </div>

            <button
              onClick={fetchSync}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-semibold transition hover:opacity-80"
              style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`}
                style={syncing ? { color: activeTheme.accent } : undefined}
              />
              <span className="hidden sm:inline">{t.refresh}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ANA KONTEYNER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-5">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div
              className="text-[11px] font-bold uppercase tracking-[0.18em] mb-1.5"
              style={{ color: activeTheme.textMuted }}
            >
              {t.eyebrow}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">{t.title}</h1>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: activeTheme.textMuted }}>
              {t.subtitle} ({t.lastSync}:{' '}
              <span className="font-semibold" style={{ color: activeTheme.textPrimary }}>
                {lastUpdated}
              </span>{' '}
              · {t.nextCheck}:{' '}
              <span className="font-mono font-bold" style={{ color: activeTheme.accent }}>
                {countdownStr}
              </span>
              )
            </p>
          </div>

          <div
            className="inline-flex items-center p-1 rounded-xl border self-start md:self-auto"
            style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
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
                  filter === tab.id ? 'text-white' : ''
                }`}
                style={
                  filter === tab.id
                    ? { background: activeTheme.barGradient }
                    : { color: activeTheme.textMuted }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* SON GELİŞMELER MİNİ BÜLTEN */}
        <section
          className="rounded-2xl p-4 border space-y-2.5"
          style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
        >
          <div className="flex items-center gap-2 text-xs font-bold" style={{ color: activeTheme.accent }}>
            <Radio className="w-3.5 h-3.5" />
            <span>{t.newsTitle}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {NEWS_FEED[lang].map((item, i) => (
              <div
                key={i}
                className="rounded-xl p-2.5 border text-xs leading-relaxed"
                style={{ backgroundColor: activeTheme.bgPage, borderColor: activeTheme.border }}
              >
                <span
                  className="inline-block text-[9px] font-black px-1.5 py-0.5 rounded mr-1.5 text-white"
                  style={{ background: activeTheme.barGradient }}
                >
                  {item.tag}
                </span>
                <span style={{ color: activeTheme.textMuted }}>{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* TEST EDİLEN EKRAN KARTLARI ÖZETİ */}
        <section
          className="rounded-2xl px-4 py-3 border flex flex-wrap items-center gap-2"
          style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-bold mr-1" style={{ color: activeTheme.textPrimary }}>
            <Cpu className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
            {t.gpuTitle}:
          </span>
          {TESTED_GPUS.map((item) => (
            <span
              key={item.gpu}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
              style={{ backgroundColor: activeTheme.bgPage, borderColor: activeTheme.border }}
            >
              <span>{item.gpu}</span>
              <span style={{ color: activeTheme.accent }}>{item.fps}</span>
              <span style={{ color: activeTheme.textMuted }}>({item.team})</span>
            </span>
          ))}
        </section>

        {/* TEK SÜTUNLU LİDERLİK KARTLARI */}
        {filteredTeams.length === 0 ? (
          <div
            className="rounded-2xl p-10 border text-center text-sm"
            style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border, color: activeTheme.textMuted }}
          >
            {t.loading}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTeams.map((team, idx) => {
              const rank = teams.indexOf(team) + 1 || idx + 1;
              const teamName = team.name || team.title || '';
              const pct = Number(team.percentage ?? team.progress ?? team.pct ?? 0);
              const pctLabel = lang === 'tr' ? `%${pct}` : `${pct}%`;
              const delta = deltas[teamName];
              const isOpen = Boolean(team.open_source ?? team.isOpenSource ?? team.is_open_source);
              const rawStage = lang === 'tr' ? team.stage_tr || team.stage : team.stage_en || team.stage;
              const rawFps = lang === 'tr' ? team.fps_tr || team.fps : team.fps_en || team.fps;
              const rawDesc =
                lang === 'tr'
                  ? team.desc_tr || team.description || team.desc
                  : team.desc_en || team.description || team.desc;

              const stage = localizeDynamicText(rawStage, lang);
              const fps = localizeDynamicText(rawFps, lang);
              const desc = localizeDynamicText(rawDesc, lang);

              const repoUrl = team.url || team.repo_url || team.github_url;
              const xUrl = team.x_url || (teamName.toLowerCase() === 'zortos' ? 'https://x.com/Zortosdev' : null);
              const repoSlug = repoUrl
                ? repoUrl.replace('https://github.com/', '').replace('https://', '').split('/')[0] === 'portwatch-vi.xyz'
                  ? 'portwatch-vi.xyz'
                  : repoUrl.replace('https://github.com/', '').replace('https://', '').slice(0, 42)
                : 'portwatch-vi.xyz';
              const filledSegments = Math.min(6, Math.max(0, (pct / 100) * 6));

              return (
                <article
                  key={teamName || idx}
                  className="rounded-2xl p-4 sm:p-6 border transition-colors"
                  style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
                >
                  {/* ANDROID MOBİL UYUMLU BAŞLIK */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                      <div className="flex items-center gap-1.5 shrink-0 pt-1">
                        <span
                          className="text-xl sm:text-2xl font-black w-6 text-center"
                          style={{ color: rank <= 3 ? activeTheme.accent : activeTheme.textMuted }}
                        >
                          {rank}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider border"
                          style={{
                            color: rank <= 3 ? '#ffffff' : activeTheme.accent,
                            background: rank <= 3 ? activeTheme.barGradient : 'transparent',
                            borderColor: activeTheme.accent,
                            boxShadow: rank <= 3 ? `0 0 12px ${activeTheme.glow}` : `0 0 6px ${activeTheme.glow}`,
                          }}
                          title={t.liveBadge}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full animate-ping"
                            style={{ backgroundColor: rank <= 3 ? '#ffffff' : activeTheme.accent }}
                          />
                          {rank <= 3 && <span>{t.liveBadge}</span>}
                        </span>
                      </div>

                      <Icon3DTeamAvatar index={idx} isOpen={isOpen} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold break-words leading-snug">{teamName}</h2>
                          {xUrl && (
                            <a
                              href={xUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-6 h-6 rounded-lg border transition hover:opacity-80 shrink-0"
                              style={{
                                backgroundColor: activeTheme.trackBg,
                                borderColor: activeTheme.border,
                                color: activeTheme.textPrimary,
                              }}
                              title={`${teamName} X`}
                              aria-label={`${teamName} X`}
                            >
                              <XLogoSVG className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs break-all" style={{ color: activeTheme.textMuted }}>
                          {repoSlug}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pl-8 sm:pl-0">
                      <div className="flex items-center gap-2">
                        {delta && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-400">
                            <TrendingUp className="w-3 h-3" />
                            {lang === 'tr' ? `+%${delta}` : `+${delta}%`}
                          </span>
                        )}
                        <div className="text-2xl sm:text-[28px] font-black leading-none tracking-tight">
                          {pctLabel}
                        </div>
                      </div>
                      {stage && (
                        <div className="inline-flex items-center gap-1.5 text-xs" style={{ color: activeTheme.textMuted }}>
                          <Icon3DGamepad />
                          <span>{stage}</span>
                        </div>
                      )}
                    </div>
                  </div>

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
                        style={{ backgroundColor: activeTheme.trackBg, color: activeTheme.textPrimary }}
                      >
                        <Icon3DMonitor />
                        {fps}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-6 gap-1.5 my-4">
                    {[0, 1, 2, 3, 4, 5].map((segIdx) => {
                      const segFill = Math.min(1, Math.max(0, filledSegments - segIdx)) * 100;
                      return (
                        <div
                          key={segIdx}
                          className="h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: activeTheme.trackBg }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${segFill}%`,
                              background: activeTheme.barGradient,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[11px] mb-3">
                    {MILESTONES[lang].map((mLabel, mIdx) => {
                      const reached = filledSegments >= mIdx + 0.5;
                      return (
                        <div key={mLabel} className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: reached ? activeTheme.accent : activeTheme.textMuted,
                              opacity: reached ? 1 : 0.4,
                            }}
                          />
                          <span
                            className="truncate"
                            style={{ color: reached ? activeTheme.textPrimary : activeTheme.textMuted }}
                          >
                            {mLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t"
                    style={{ borderColor: activeTheme.border }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: activeTheme.textMuted }}>
                      {desc || stage}
                    </p>

                    {repoUrl && (
                      <a
                        href={repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition hover:opacity-90 shrink-0 self-start sm:self-auto ${
                          activeTheme.isDark ? 'bg-white text-[#0b0d12]' : 'bg-slate-900 text-white'
                        }`}
                      >
                        <span>
                          {isOpen
                            ? t.viewRepo
                            : repoUrl.includes('portwatch')
                            ? t.viewPortwatch
                            : t.viewSource}
                        </span>
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
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition hover:opacity-85"
            style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
          >
            <XLogoSVG className="w-3.5 h-3.5" />
            <span>| batmancodex</span>
          </a>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold text-emerald-400 transition hover:opacity-85"
            style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
          >
            <WhatsAppLogoSVG className="w-4 h-4 text-emerald-400" />
            <span>{t.shareWa}</span>
          </a>

          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition hover:opacity-85"
            style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
          >
            <XLogoSVG className="w-3.5 h-3.5" />
            <span>{t.shareX}</span>
          </a>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center text-xs" style={{ color: activeTheme.textMuted }}>
        <p>{t.disclaimer}</p>
      </footer>

      {/* GÜNCELLEME NOTLARI PENCERESİ */}
      {showChangelog && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowChangelog(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-5 border shadow-2xl space-y-4"
            style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: activeTheme.border }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: activeTheme.accent }} />
                <h3 className="font-extrabold text-sm">{t.updatesTitle}</h3>
              </div>
              <button type="button" onClick={() => setShowChangelog(false)} className="p-1 rounded-lg hover:opacity-75">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {CHANGELOG[lang].map((entry) => (
                <div key={entry.version} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-black text-white"
                      style={{ background: activeTheme.barGradient }}
                    >
                      {entry.version}
                    </span>
                    <span className="text-[11px]" style={{ color: activeTheme.textMuted }}>
                      {entry.date}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs leading-relaxed" style={{ color: activeTheme.textMuted }}>
                    {entry.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: activeTheme.accent }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
