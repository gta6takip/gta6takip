'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw,
  ExternalLink,
  Sparkles,
  ArrowUp,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Flame,
  Target,
  TrendingUp,
  X,
  Check,
  Share2,
  Lock,
  Code2,
  Info,
  HelpCircle,
  MessageSquarePlus,
  Send,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const APP_VERSION = 'v1.0.28';

const THEMES = {
  vice: {
    id: 'vice',
    label: { tr: 'Vice Sunset', en: 'Vice Sunset' },
    dot: '#ec4899',
    bg: 'bg-[#140b1e] text-pink-50',
    card: 'bg-[#1e112d]/95 border-pink-500/25',
    subCard: 'bg-[#170c24] border-pink-500/20',
    muted: 'text-pink-200/70',
    accentText: 'text-pink-400',
    accentBg: 'bg-pink-500',
    accentGradient: 'from-pink-500 via-fuchsia-400 to-amber-400',
    badgeGlow: 'from-pink-500 to-amber-400 text-zinc-950 shadow-[0_0_18px_rgba(236,72,153,0.7)]',
    btnPrimary: 'bg-gradient-to-r from-pink-500 to-amber-400 text-zinc-950 hover:brightness-110',
    pill: 'bg-pink-950/60 text-pink-200 border-pink-500/30',
    sparkStroke: '#f472b6',
    sparkStop: 'rgba(244, 114, 182, 0.32)',
  },
  light: {
    id: 'light',
    label: { tr: 'Açık', en: 'Light' },
    dot: '#ea580c',
    bg: 'bg-zinc-50 text-zinc-900',
    card: 'bg-white border-zinc-200 shadow-sm',
    subCard: 'bg-zinc-100/80 border-zinc-200',
    muted: 'text-zinc-600',
    accentText: 'text-orange-600',
    accentBg: 'bg-orange-600',
    accentGradient: 'from-orange-600 via-amber-500 to-yellow-500',
    badgeGlow: 'from-orange-500 to-amber-500 text-white shadow-[0_0_14px_rgba(234,88,12,0.45)]',
    btnPrimary: 'bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:brightness-105',
    pill: 'bg-zinc-100 text-zinc-700 border-zinc-300',
    sparkStroke: '#ea580c',
    sparkStop: 'rgba(234, 88, 12, 0.22)',
  },
  dark: {
    id: 'dark',
    label: { tr: 'Koyu', en: 'Dark' },
    dot: '#f97316',
    bg: 'bg-[#0b0d12] text-zinc-100',
    card: 'bg-[#131722] border-zinc-800/90',
    subCard: 'bg-[#0f131c] border-zinc-800/80',
    muted: 'text-zinc-400',
    accentText: 'text-orange-400',
    accentBg: 'bg-orange-500',
    accentGradient: 'from-orange-500 via-amber-400 to-yellow-400',
    badgeGlow: 'from-orange-500 to-amber-400 text-zinc-950 shadow-[0_0_16px_rgba(249,115,22,0.65)]',
    btnPrimary: 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 hover:brightness-110',
    pill: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/70',
    sparkStroke: '#fb923c',
    sparkStop: 'rgba(251, 146, 60, 0.32)',
  },
  leonida: {
    id: 'leonida',
    label: { tr: 'Leonida Neon', en: 'Leonida Neon' },
    dot: '#22d3ee',
    bg: 'bg-[#07111a] text-cyan-50',
    card: 'bg-[#0d1b28] border-cyan-500/25',
    subCard: 'bg-[#09141f] border-cyan-500/20',
    muted: 'text-cyan-200/70',
    accentText: 'text-cyan-400',
    accentBg: 'bg-cyan-400',
    accentGradient: 'from-cyan-400 via-teal-300 to-emerald-400',
    badgeGlow: 'from-cyan-400 to-emerald-400 text-zinc-950 shadow-[0_0_18px_rgba(34,211,238,0.7)]',
    btnPrimary: 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 hover:brightness-110',
    pill: 'bg-cyan-950/60 text-cyan-200 border-cyan-500/30',
    sparkStroke: '#22d3ee',
    sparkStop: 'rgba(34, 211, 238, 0.30)',
  },
  ocean: {
    id: 'ocean',
    label: { tr: 'Ocean Drive', en: 'Ocean Drive' },
    dot: '#60a5fa',
    bg: 'bg-[#090f1d] text-slate-100',
    card: 'bg-[#10192d] border-blue-500/25',
    subCard: 'bg-[#0c1324] border-blue-500/20',
    muted: 'text-slate-400',
    accentText: 'text-blue-400',
    accentBg: 'bg-blue-500',
    accentGradient: 'from-blue-400 via-indigo-400 to-violet-400',
    badgeGlow: 'from-blue-400 to-violet-400 text-zinc-950 shadow-[0_0_18px_rgba(96,165,250,0.65)]',
    btnPrimary: 'bg-gradient-to-r from-blue-400 to-violet-400 text-zinc-950 hover:brightness-110',
    pill: 'bg-blue-950/60 text-blue-200 border-blue-500/30',
    sparkStroke: '#60a5fa',
    sparkStop: 'rgba(96, 165, 250, 0.30)',
  },
};

const MILESTONES = [
  { key: 'groundwork', min: 1, tr: 'Altyapı', en: 'Groundwork' },
  { key: 'exe', min: 10, tr: 'Exe Çalışıyor', en: 'Exe runs' },
  { key: 'frame', min: 20, tr: 'İlk Kare', en: 'First frame' },
  { key: 'menu', min: 30, tr: 'Ana Menü', en: 'Main menu' },
  { key: 'world', min: 40, tr: 'Oyun Dünyası', en: 'In the world' },
  { key: 'playable', min: 50, tr: 'Oynanabilir', en: 'Playable' },
];

const FALLBACK_TEAMS = [
  {
    name: 'CGBJ',
    progress: 91.5,
    fps: '25 FPS (30 FPS Ara Sahne)',
    gpu: 'NVIDIA (8GB RAM)',
    type: 'open',
    stage: 'Oynanabilir • Hikâye Yarısı',
    delta: '+37.0%',
    url: 'https://github.com/codec-d/cool_fox',
    summaryTr: 'Ara sahnelerde 30 FPS, oyun içinde ortalama 25 FPS (8 GB RAM / 16 GB VRAM). Hikâyenin yarısı oynanabilir (GitHub deposu şu an 404 / kaldırılmış durumda).',
    summaryEn: '30 FPS in cutscenes, 25 FPS average in gameplay (8 GB RAM / 16 GB VRAM). Half the story playable (GitHub repo currently returns 404).',
  },
  { name: 'NotNozy', progress: 87.8, fps: '16 FPS', gpu: 'AMD (Rumble)', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+26.8%', url: 'https://portwatch-vi.xyz/#race', isNew: true },
  { name: 'darkworldhm', progress: 84.8, fps: '15-24 FPS', gpu: 'RTX 50 Serisi', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+23.8%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'Doomsday', progress: 84.0, fps: '4 FPS', gpu: 'AMD / NVIDIA', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+19.5%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'AvatarManz', progress: 83.1, fps: '16 FPS (13-22 FPS)', gpu: 'RX 7900 XTX', type: 'open', stage: 'Oynanabilir • İlk Perde (Sesli)', delta: '+23.1%', url: 'https://github.com/avatarmanz/VIctory-7900XTX' },
  { name: 'Belobug', progress: 79.0, fps: '8 FPS', gpu: 'RX 9070 XT', type: 'open', stage: 'Oynanabilir • İlk Perde (RT)', delta: '+10.7%', url: 'https://github.com/Belobug/VIctory-Belobug-AMD' },
  { name: 'DexNom', progress: 78.0, fps: '3 FPS', gpu: 'RX 7900 XTX', type: 'open', stage: 'Oynanabilir • İlk Perde', delta: '+12.0%', url: 'https://github.com/DexNom/VIctory' },
  { name: 'suri', progress: 75.0, fps: '3 FPS', gpu: 'Özel Yapı', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+14.0%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'Kelvaroq', progress: 68.8, fps: 'PortWatch Canlı', gpu: 'Açık Kaynak', type: 'open', stage: 'Oynanabilir', url: 'https://github.com/fablinoo/kelvaroq', isNew: true },
  { name: 'hyphennn', progress: 59.8, fps: '3 FPS', gpu: 'RTX 4070', type: 'open', stage: 'Oynanabilir • Açılış Sahnesi', delta: '+4.0%', url: 'https://github.com/fxceless/victory-fork' },
  { name: 'Uilian (VItoriaBr)', progress: 59.6, fps: '4 FPS', gpu: 'RTX 5060 Ti', type: 'open', stage: 'Oynanabilir • Önsöz Geçildi', delta: '+5.2%', url: 'https://github.com/uiliannn/VItoriaBr' },
  { name: 'omonkey', progress: 57.9, fps: '~5 FPS', gpu: 'Rumble Yayını', type: 'private', stage: 'Oynanabilir • Hapishane Sahnesi', delta: '+2.4%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'VIctory', progress: 50.3, fps: '1 FPS (30 FPS Menü)', gpu: 'RX 6700 XT', type: 'open', stage: 'Oynanabilir • İlk Sahne', delta: '+10.3%', url: 'https://github.com/Marvisak/VIctory' },
  { name: 'Zortos', progress: 45.0, fps: 'PC Boot', gpu: 'Bağımsız', type: 'private', stage: 'Oyun Dünyası • PC Boot', url: 'https://x.com/Zortosdev', isZortos: true },
  { name: 'XCL', progress: 35.0, fps: '30 FPS (Menü)', gpu: 'AMD / NVIDIA', type: 'open', stage: 'Ana Menü', url: 'https://github.com/xcl-dev/xcl' },
  { name: 'Five Star Recomp', progress: 30.0, fps: '30 FPS (Ara Sahne)', gpu: 'C# Katmanı', type: 'open', stage: 'Ana Menü', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'keylime', progress: 30.0, fps: '30 FPS (Vulkan)', gpu: 'C++20 / Vulkan', type: 'open', stage: 'Ana Menü', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'Xbox2Windows', progress: 25.0, fps: 'Tanılama', gpu: 'Statik Recomp', type: 'open', stage: 'İlk Kare', url: 'https://github.com/R0Y00/Xbox2Windows' },
  { name: 'Port of the Americas', progress: 25.0, fps: 'Linux / Proton', gpu: 'AMD (vkd3d)', type: 'open', stage: 'İlk Kare', url: 'https://portwatch-vi.xyz/#race', isNew: true },
  { name: 'TuxBox', progress: 20.0, fps: '4K İstem', gpu: 'Linux / Proton', type: 'open', stage: 'İlk Kare', url: 'https://github.com/brcly/TuxBox' },
  { name: 'vice-pc', progress: 12.0, fps: 'Exe Boot', gpu: 'Açık Kaynak', type: 'open', stage: 'Exe Çalışıyor', url: 'https://github.com/natedemoss/vice-pc' },
  { name: 'ScarlettCompat', progress: 10.0, fps: '113 Boot', gpu: 'AMD (C++)', type: 'open', stage: 'Exe Çalışıyor', url: 'https://portwatch-vi.xyz/#race', isNew: true },
  { name: 'XValkyrie', progress: 2.9, fps: 'Ön Aşama', gpu: 'C++ / HLSL', type: 'open', stage: 'Altyapı', url: 'https://github.com/sammwyy/xvalkyrie' },
  { name: 'AnyXboxX', progress: 2.5, fps: 'GDK Örnekleri', gpu: 'HLE Emülatör', type: 'open', stage: 'Altyapı', url: 'https://github.com/LooperSalty/AnyXboxX' },
];

const FALLBACK_NEWS = [
  { tagTr: 'REKOR', tagEn: 'RECORD', tr: "CGBJ %91.5 ile lider (25 FPS · 30 FPS Ara Sahne) ve kodlarını GitHub'da açtı!", en: 'CGBJ leads at 91.5% (25 FPS · 30 FPS cutscenes) and went open source on GitHub!' },
  { tagTr: 'AÇIK KAYNAK', tagEn: 'OPEN SOURCE', tr: 'Açık kaynak lideri CGBJ (%91.5); AvatarManz (%83.1) ve Belobug (%79) takipte.', en: 'CGBJ (91.5%) leads open source; AvatarManz (83.1%) & Belobug (79%) follow.' },
  { tagTr: 'GÜNCEL', tagEn: 'LIVE', tr: "PortWatch üzerinde 40 girişim takip ediliyor; 18'si oyunu başlatabiliyor (İlk 3 ort. %88).", en: '40 total efforts tracked on PortWatch, with 18 booting GTA VI (Top-3 avg 88%).' },
];

const CHANGELOG = [
  {
    version: 'v1.0.28',
    dateTr: '26 Kasım 2026',
    dateEn: 'November 26, 2026',
    itemsTr: [
      'Alt menüye tema uyumlu "Tavsiye / Fikir" butonu ve e-posta bildirim kutucuğu eklendi.',
    ],
    itemsEn: [
      'Added a theme-matched "Feedback / Idea" button and modal in the footer.',
    ],
  },
  {
    version: 'v1.0.27',
    dateTr: '26 Kasım 2026',
    dateEn: 'November 26, 2026',
    itemsTr: [
      'SON GELİŞMELER altındaki harici haber akışı kutusu kaldırılarak daha sade bir önceki görünüme dönüldü.',
    ],
    itemsEn: [
      'Removed the external news feed box under LATEST UPDATES to restore the cleaner layout.',
    ],
  },
  {
    version: 'v1.0.25',
    dateTr: '26 Kasım 2026',
    dateEn: 'November 26, 2026',
    itemsTr: [
      'Mobil arayüz iyileştirildi: ilk 10 ekip + Tümünü Göster butonu, kategori filtreleri ve 2 satırlı kesilmeyen aşama etiketleri eklendi (masaüstü düzeni korundu).',
      'Kart başlıklarında yüzde ve Kaynak butonu mobilde sağ üste sabitlendi; Canlı Veri rozeti hizası ve REKOR kartındaki çift parantez düzeltildi.',
    ],
    itemsEn: [
      'Improved mobile UX: added Top 10 + Show All toggle, category filters, and 2-row milestone labels on mobile without changing desktop layout.',
      'Pinned percentage & Source button to top-right on mobile cards, aligned Live FAQ badge, and cleaned nested parentheses in news cards.',
    ],
  },
];

const FlagTR = () => (
  <svg viewBox="0 0 24 16" className="w-4 h-3 rounded-[2px] shrink-0" aria-hidden="true">
    <rect width="24" height="16" fill="#E30A17" />
    <circle cx="9.5" cy="8" r="4.2" fill="#FFFFFF" />
    <circle cx="10.6" cy="8" r="3.4" fill="#E30A17" />
    <polygon points="15.2,8 13.7,8.5 14.3,7 13.3,5.8 14.8,5.9" fill="#FFFFFF" />
  </svg>
);

const FlagUS = () => (
  <svg viewBox="0 0 24 16" className="w-4 h-3 rounded-[2px] shrink-0" aria-hidden="true">
    <rect width="24" height="16" fill="#B22234" />
    <rect y="2" width="24" height="2" fill="#FFFFFF" />
    <rect y="6" width="24" height="2" fill="#FFFFFF" />
    <rect y="10" width="24" height="2" fill="#FFFFFF" />
    <rect y="14" width="24" height="2" fill="#FFFFFF" />
    <rect width="10" height="9" fill="#3C3B6E" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0 text-emerald-400" aria-hidden="true">
    <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.375c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.813 14.125c-.25.703-1.438 1.344-2 1.422-.516.078-1.172.109-1.891-.125-.438-.141-1-.328-1.719-.641-3.016-1.297-4.984-4.328-5.141-4.531-.156-.203-1.234-1.641-1.234-3.125s.781-2.219 1.063-2.516c.281-.297.609-.375.813-.375.203 0 .406.016.578.016.188 0 .438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.094.203-.156.328-.297.5-.141.172-.313.391-.438.516-.156.141-.313.297-.141.594.172.297.781 1.281 1.672 2.078 1.156 1.031 2.125 1.344 2.422 1.5.297.156.469.125.641-.078.172-.203.734-.859.938-1.156.203-.297.406-.25.672-.156.266.094 1.703.813 2 .953.297.156.484.219.563.344.078.125.078.719-.172 1.422z" />
  </svg>
);

function localizeDynamicText(text, lang) {
  if (!text) return '';
  if (lang === 'tr') {
    return String(text)
      .replace(/Playable/gi, 'Oynanabilir')
      .replace(/Free Roam/gi, 'Serbest Dolaşım')
      .replace(/First Act/gi, 'İlk Perde')
      .replace(/Private Build/gi, 'Özel Yapı')
      .replace(/Opening Scene/gi, 'Açılış Sahnesi')
      .replace(/Prologue Cleared/gi, 'Önsöz Geçildi')
      .replace(/Prison Scene/gi, 'Hapishane Sahnesi')
      .replace(/In the World/gi, 'Oyun Dünyası')
      .replace(/Main Menu/gi, 'Ana Menü')
      .replace(/First Frame/gi, 'İlk Kare')
      .replace(/Exe Runs/gi, 'Exe Çalışıyor')
      .replace(/Groundwork/gi, 'Altyapı')
      .replace(/RTX 50 Series/gi, 'RTX 50 Serisi');
  }
  return String(text)
    .replace(/Oynanabilir/gi, 'Playable')
    .replace(/Serbest Dolaşım/gi, 'Free Roam')
    .replace(/Hikâye Yarısı/gi, 'Half the Story')
    .replace(/İlk Perde/gi, 'First Act')
    .replace(/İlk Sahne/gi, 'First Scene')
    .replace(/\(Sesli\)/gi, '(With Sound)')
    .replace(/\(30 FPS Ara Sahne\)/gi, '(30 FPS Cutscenes)')
    .replace(/\(30 FPS Menü\)/gi, '(30 FPS Menu)')
    .replace(/Özel Yapı/gi, 'Private Build')
    .replace(/Açılış Sahnesi/gi, 'Opening Scene')
    .replace(/Önsöz Geçildi/gi, 'Prologue Cleared')
    .replace(/Hapishane Sahnesi/gi, 'Prison Scene')
    .replace(/Oyun Dünyası/gi, 'In the World')
    .replace(/Ana Menü/gi, 'Main Menu')
    .replace(/İlk Kare/gi, 'First Frame')
    .replace(/Exe Çalışıyor/gi, 'Exe Runs')
    .replace(/Altyapı/gi, 'Groundwork')
    .replace(/RTX 50 Serisi/gi, 'RTX 50 Series')
    .replace(/Bağımsız/gi, 'Independent');
}

function cleanNestedParens(text) {
  return String(text || '').replace(/\(([^()]+)\s*\(([^()]+)\)\)/g, '($1 · $2)');
}

function extractPeakFps(teams) {
  let max = 0;
  for (const t of teams) {
    if (Number(t.progress) < 50) continue;
    const cleaned = String(t.fps || '')
      .toLowerCase()
      .replace(/\(\s*\d+[^)]*\)/g, ' ');
    if (cleaned.includes('men') || cleaned.includes('ara sahne') || cleaned.includes('cutscene')) continue;
    const matches = cleaned.match(/\d+/g);
    if (matches) {
      for (const m of matches) {
        const val = Number(m);
        if (val > max && val <= 60) {
          max = val;
        }
      }
    }
  }
  return max > 0 ? max : 25;
}

function getNewsBadgeStyle(tagRaw) {
  const tag = String(tagRaw || '').toUpperCase();
  if (tag.includes('REKOR') || tag.includes('RECORD')) {
    return 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.45)]';
  }
  if (tag.includes('AÇIK') || tag.includes('OPEN')) {
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.45)]';
  }
  return 'bg-red-500/20 text-red-300 border-red-400/50 shadow-[0_0_12px_rgba(248,113,113,0.5)] animate-pulse';
}

export default function HomePage() {
  const [lang, setLang] = useState('tr');
  const [themeKey, setThemeKey] = useState('vice');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [radarOpen, setRadarOpen] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [showBackTop, setShowBackTop] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAllMobile, setShowAllMobile] = useState(false);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('idle');

  const [teams, setTeams] = useState(FALLBACK_TEAMS);
  const [news, setNews] = useState(FALLBACK_NEWS);
  const [totalEfforts, setTotalEfforts] = useState(40);
  const [bootingCount, setBootingCount] = useState(18);
  const [top3Avg, setTop3Avg] = useState(88.0);
  const [onlineCount, setOnlineCount] = useState(1);
  const [countdown, setCountdown] = useState(120);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);

  const theme = THEMES[themeKey] || THEMES.vice;

  const supabaseClient = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    try {
      return createClient(url, key);
    } catch {
      return null;
    }
  }, []);

  const fetchSyncData = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();

      const rawTeams = Array.isArray(data?.teams)
        ? data.teams
        : Array.isArray(data?.projects)
          ? data.projects
          : null;

      if (rawTeams && rawTeams.length > 0) {
        const normalized = rawTeams.map((item) => {
          const itemName = item.name || item.title || 'Unknown';
          const fallback = FALLBACK_TEAMS.find(
            (f) => f.name.toLowerCase() === String(itemName).toLowerCase()
          );

          const rawPct =
            item.progress ??
            item.pct ??
            item.percent ??
            item.percentage ??
            item.score ??
            item.value;
          const parsedPct = Number(String(rawPct ?? '').replace('%', '').trim());
          const finalProgress =
            !Number.isNaN(parsedPct) && parsedPct > 0
              ? parsedPct
              : fallback?.progress ?? 0;

          const isPrivate =
            item.type === 'private' ||
            item.isPrivate === true ||
            item.openSource === false ||
            item.isOpen === false ||
            (fallback ? fallback.type === 'private' : false);

          return {
            name: itemName,
            progress: finalProgress,
            fps: item.fps || item.fpsText || item.perf || item.performance || fallback?.fps || '—',
            gpu: item.gpu || item.hardware || item.device || fallback?.gpu || '',
            type: isPrivate ? 'private' : 'open',
            stage: item.stage || item.stageText || item.milestone || item.status || fallback?.stage || '',
            delta: item.delta || item.change || item.diff || fallback?.delta || '',
            url: item.url || item.link || item.repoUrl || item.github || fallback?.url || 'https://portwatch-vi.xyz/#race',
            summaryTr: item.summaryTr || fallback?.summaryTr || '',
            summaryEn: item.summaryEn || fallback?.summaryEn || '',
            isNew: Boolean(item.isNew) && String(itemName).toLowerCase() !== 'cgbj',
            isZortos: item.isZortos || String(itemName).toLowerCase() === 'zortos',
          };
        });

        for (const fb of FALLBACK_TEAMS) {
          if (!normalized.some((n) => n.name.toLowerCase() === fb.name.toLowerCase())) {
            normalized.push(fb);
          }
        }

        normalized.sort((a, b) => b.progress - a.progress);
        setTeams(normalized);
      }

      if (data?.totalEfforts || data?.summary?.totalEfforts) {
        setTotalEfforts(Math.max(40, Number(data.totalEfforts || data.summary.totalEfforts)));
      }
      if (data?.bootingCount || data?.summary?.bootingCount) {
        setBootingCount(Math.max(18, Number(data.bootingCount || data.summary.bootingCount)));
      }
      if (data?.top3Avg || data?.summary?.top3Avg) {
        setTop3Avg(Math.max(88.0, Number(data.top3Avg || data.summary.top3Avg)));
      }
      if (Array.isArray(data?.news) && data.news.length > 0) {
        setNews(data.news);
      }
    } catch {
      // Mevcut veya yedek veri korunur
    } finally {
      setSyncing(false);
      setCountdown(120);
    }
  };

  useEffect(() => {
    fetchSyncData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchSyncData();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 360);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!supabaseClient) return undefined;
    let channel;
    try {
      const clientId = `v-${Math.random().toString(36).slice(2, 10)}`;
      channel = supabaseClient.channel('gta6takip-presence', {
        config: { presence: { key: clientId } },
      });
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const count = Object.keys(state).length;
          if (count > 0) setOnlineCount(count);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ online_at: new Date().toISOString() });
          }
        });
    } catch {
      // Supabase presence hatasında varsayılan 1 korunur
    }
    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [supabaseClient]);

  const leader = teams[0] || FALLBACK_TEAMS[0];
  const secondTeam = teams[1] || FALLBACK_TEAMS[1];
  const thirdTeam = teams[2] || FALLBACK_TEAMS[2];
  const openLeader = teams.find((t) => t.type === 'open') || leader;
  const playableCount = useMemo(
    () => teams.filter((t) => Number(t.progress) >= 50).length,
    [teams]
  );
  const peakFps = useMemo(() => extractPeakFps(teams), [teams]);
  const fpsPct = Math.min(100, Math.round((peakFps / 30) * 100));

  const rankedTeams = useMemo(
    () => teams.map((t, i) => ({ ...t, globalRank: i + 1 })),
    [teams]
  );

  const filteredTeams = useMemo(() => {
    if (typeFilter === 'all') return rankedTeams;
    return rankedTeams.filter((t) => t.type === typeFilter);
  }, [rankedTeams, typeFilter]);

  const openCount = useMemo(
    () => teams.filter((t) => t.type === 'open').length,
    [teams]
  );
  const privateCount = teams.length - openCount;

  const faqItems = useMemo(() => {
    const etaTr =
      leader.progress >= 95 && peakFps >= 30
        ? `En yakın yapı (${leader.name} · %${leader.progress}) sona çok yaklaştı; ancak tüm oyunun hatasız bitirilmesi ve stabil optimizasyon için net bir çıkış tarihi yok.`
        : `Şu an en yakın yapı (${leader.name} · %${leader.progress}, tepe ${peakFps} FPS) hızla ilerliyor; ancak tüm oyunun 30+ FPS ve hatasız tamamlanması için net bir tarih yok. Resmi PC sürümü ise söylentilere göre 2027 başını hedefliyor.`;

    const etaEn =
      leader.progress >= 95 && peakFps >= 30
        ? `The closest build (${leader.name} · ${leader.progress}%) is nearing completion, though there is no fixed ETA for a bug-free full playthrough.`
        : `The closest build (${leader.name} · ${leader.progress}%, peak ${peakFps} FPS) is progressing fast, but there is no firm ETA for a full 30+ FPS release. Rockstar's official PC version is rumored for early 2027.`;

    const statusTr = `PortWatch üzerinden gelen son canlı verilere göre ${totalEfforts} girişimden ${bootingCount}'si oyunu başlatabiliyor ve ${playableCount} ekip "Oynanabilir" barajını geçmiş durumda. Zirvedeki #1 ${leader.name} (%${leader.progress}), açılış ve ilk yarı görevlerini geçip ${localizeDynamicText(leader.fps, 'tr')} civarı akıcı görüntü alarak videosunu paylaştı. Hemen arkasında #2 ${secondTeam.name} (%${secondTeam.progress} · ${localizeDynamicText(secondTeam.fps, 'tr')}) ve #3 ${thirdTeam.name} (%${thirdTeam.progress} · ${localizeDynamicText(thirdTeam.fps, 'tr')}) canlı yayınlarla ilerliyor. Kodu herkese açık tarafta ise ${openLeader.name} (%${openLeader.progress} · ${localizeDynamicText(openLeader.fps, 'tr')}) önde. Kısacası oyun siyah ekrandan çıkıp görev oynanabilen seviyeye geldi; geriye optimizasyon ve herkesin indirebileceği kararlı bir sürüm kaldı.`;

    const statusEn = `According to live PortWatch data, ${bootingCount} out of ${totalEfforts} tracked efforts can boot GTA VI and ${playableCount} teams have crossed the "Playable" milestone. At the top, #1 ${leader.name} (${leader.progress}%) has cleared the intro into mid-story missions at ${localizeDynamicText(leader.fps, 'en')} with shared footage. Right behind, #2 ${secondTeam.name} (${secondTeam.progress}% · ${localizeDynamicText(secondTeam.fps, 'en')}) and #3 ${thirdTeam.name} (${thirdTeam.progress}% · ${localizeDynamicText(thirdTeam.fps, 'en')}) are pushing ahead on live streams. On the open-source side, ${openLeader.name} (${openLeader.progress}% · ${localizeDynamicText(openLeader.fps, 'en')}) leads. In short, the game has moved past black screens into real mission gameplay—now it's about optimization and a stable public build.`;

    return [
      {
        qTr: 'AMD ve NVIDIA neden fark ediyor?',
        qEn: 'Why do AMD and NVIDIA perform differently?',
        aTr: 'PS5 ve Xbox Series X|S konsolları AMD RDNA2 grafik mimarisi kullandığı için sızdırılan konsol shader kodları AMD kartlarda daha doğrudan çalışıyor. NVIDIA kartlarda ise RDNA2 shaderlarının ekstra DXIL/HLSL dönüşümünden geçmesi gerektiği için aynı ekipte bile FPS ve görüntü kararlılığı fark edebiliyor.',
        aEn: 'PS5 and Xbox Series X|S use AMD RDNA2 graphics, so leaked console shaders map more directly to AMD GPUs. NVIDIA GPUs require extra RDNA2-to-DXIL/HLSL translation, which creates differences in FPS and rendering stability.',
        live: false,
      },
      {
        qTr: 'Port ekipleri tam olarak ne için çalışıyor?',
        qEn: 'What exactly are the port teams working on?',
        aTr: 'Resmi PC sürümü çıkana kadar, sızdırılan Xbox Series çalıştırılabilir dosyasını (.exe) Windows veya Linux/Proton üzerinde açabilmek için uyumluluk katmanları (sistem DLL yönlendirmeleri, bellek yönetimi ve GPU shader çeviricileri) geliştiriyorlar.',
        aEn: 'Until the official PC version arrives, teams are building compatibility layers (console DLL shims, memory management, and GPU shader translators) to run the leaked Xbox Series executable on Windows or Linux/Proton.',
        live: false,
      },
      {
        qTr: 'GTA VI, tahmini ne zaman tamamen portlanacak?',
        qEn: 'When is GTA VI expected to be fully ported?',
        aTr: etaTr,
        aEn: etaEn,
        live: true,
      },
      {
        qTr: 'Şimdi son durum tam olarak nedir?',
        qEn: 'What is the exact current status right now?',
        aTr: statusTr,
        aEn: statusEn,
        live: true,
      },
    ];
  }, [leader, secondTeam, thirdTeam, openLeader, playableCount, peakFps, totalEfforts, bootingCount]);

  const fastestTeam = useMemo(() => {
    let best = leader;
    let bestVal = -1;
    for (const t of teams) {
      const num = parseFloat(String(t.delta || '').replace(/[^0-9.]/g, ''));
      if (!Number.isNaN(num) && num > bestVal) {
        bestVal = num;
        best = t;
      }
    }
    return best;
  }, [teams, leader]);

  const sparkPoints = useMemo(() => {
    const endPct = Math.min(100, Math.max(50, leader.progress));
    const pts = [
      { x: 10, y: 50 - (0 / 100) * 40, label: lang === 'tr' ? '23 Kas' : 'Nov 23', val: '0%' },
      { x: 76, y: 50 - (40 / 100) * 40, label: lang === 'tr' ? '24 Kas' : 'Nov 24', val: '40%' },
      { x: 142, y: 50 - (61 / 100) * 40, label: lang === 'tr' ? '25 Kas' : 'Nov 25', val: '61%' },
      { x: 208, y: 50 - (endPct / 100) * 40, label: lang === 'tr' ? 'Bugün' : 'Today', val: `${endPct}%` },
    ];
    const line = pts.map((p) => `${p.x},${p.y.toFixed(1)}`).join(' ');
    const area = `10,52 ${line} 208,52`;
    return { pts, line, area };
  }, [leader.progress, lang]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('https://gta6takip.vercel.app/');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    setFeedbackStatus('sending');
    try {
      const res = await fetch('https://formsubmit.co/ajax/gta6takip@yandex.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: feedbackName.trim() || 'Anonim Ziyaretçi',
          email: feedbackEmail.trim() || 'belirtilmedi@gta6takip.vercel.app',
          message: feedbackMsg.trim(),
          _subject: 'GTA6takip — Yeni Tavsiye / Fikir',
          _template: 'table',
        }),
      });
      if (!res.ok) throw new Error('Send failed');
      setFeedbackStatus('sent');
      setFeedbackName('');
      setFeedbackEmail('');
      setFeedbackMsg('');
    } catch {
      setFeedbackStatus('error');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${theme.card}`}>
        <div className="max-w-4xl mx-auto px-3 sm:px-5 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`font-black tracking-tight text-lg sm:text-xl bg-gradient-to-r ${theme.accentGradient} bg-clip-text text-transparent`}>
                GTA6TAKİP
              </span>
              <button
                type="button"
                onClick={() => setChangelogOpen(true)}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-full border transition hover:scale-105 ${theme.pill}`}
                title={lang === 'tr' ? 'Sürüm Notları' : 'Release Notes'}
              >
                {APP_VERSION}
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:hidden">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {onlineCount} {lang === 'tr' ? 'Çevrimiçi' : 'Online'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {onlineCount} {lang === 'tr' ? 'Çevrimiçi' : 'Online'}
            </span>

            <div className={`inline-flex rounded-lg border p-0.5 ${theme.subCard}`}>
              <button
                type="button"
                onClick={() => setLang('tr')}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold transition ${
                  lang === 'tr' ? theme.btnPrimary : theme.muted
                }`}
              >
                <FlagTR />
                TR
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold transition ${
                  lang === 'en' ? theme.btnPrimary : theme.muted
                }`}
              >
                <FlagUS />
                EN
              </button>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setThemeMenuOpen((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${theme.subCard}`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.dot }} />
                <span>{lang === 'tr' ? 'Tema' : 'Theme'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
              {themeMenuOpen && (
                <div className={`absolute right-0 mt-1.5 w-40 rounded-xl border p-1 shadow-xl z-50 ${theme.card}`}>
                  {Object.values(THEMES).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setThemeKey(t.id);
                        setThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition hover:bg-white/5 ${
                        themeKey === t.id ? theme.accentText : ''
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.dot }} />
                        {t.label[lang]}
                      </span>
                      {themeKey === t.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={fetchSyncData}
              disabled={syncing}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${theme.subCard}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{countdown}s</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-5 py-4 sm:py-5 space-y-5">
        <section className={`rounded-2xl border p-4 sm:p-5 ${theme.card}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold tracking-wider ${theme.accentText}`}>
                  {lang === 'tr' ? 'GENEL İLERLEME · EN YAKIN YAPI' : 'OVERALL PROGRESS · CLOSEST EFFORT'}
                </span>
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${theme.pill}`}>
                  {totalEfforts} {lang === 'tr' ? 'Girişim' : 'Tracked'} · {bootingCount} Boot
                </span>
              </div>

              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black tracking-tight">
                  {lang === 'tr' ? `%${leader.progress}` : `${leader.progress}%`}
                </span>
                <span className={`text-sm font-semibold ${theme.muted}`}>
                  {lang === 'tr' ? 'Lider:' : 'Leader:'}{' '}
                  <strong className={theme.accentText}>{leader.name}</strong> ·{' '}
                  {lang === 'tr' ? `İlk 3 ort. %${top3Avg}` : `Top-3 avg ${top3Avg}%`}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs ${theme.subCard}`}>
                  <Target className={`w-3.5 h-3.5 ${theme.accentText}`} />
                  <span className="font-semibold">
                    {lang === 'tr' ? '30 FPS Barajı:' : '30 FPS Target:'}
                  </span>
                  <span className="font-bold">{peakFps} / 30 FPS</span>
                  <div className="w-14 h-1.5 rounded-full bg-zinc-700/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`}
                      style={{ width: `${fpsPct}%` }}
                    />
                  </div>
                </div>

                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${theme.subCard}`}>
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span className={theme.muted}>
                    {lang === 'tr' ? '24s En Hızlı:' : '24h Fastest:'}
                  </span>
                  <span className="font-bold">{fastestTeam.name}</span>
                  {fastestTeam.delta && (
                    <span className="text-emerald-400 font-bold">▲ {fastestTeam.delta}</span>
                  )}
                </div>
              </div>
            </div>

            <div className={`rounded-xl border p-3 md:w-60 shrink-0 ${theme.subCard}`}>
              <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                <span className={`inline-flex items-center gap-1 ${theme.muted}`}>
                  <TrendingUp className={`w-3.5 h-3.5 ${theme.accentText}`} />
                  {lang === 'tr' ? 'Günlük Yükseliş' : 'Daily Trend'}
                </span>
                <span className={theme.accentText}>0% → {leader.progress}%</span>
              </div>
              <svg viewBox="0 0 220 56" className="w-full h-12 overflow-visible" aria-label="Progress Sparkline">
                <defs>
                  <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.sparkStop} />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                  </linearGradient>
                </defs>
                <polygon points={sparkPoints.area} fill="url(#sparkFill)" />
                <polyline
                  fill="none"
                  stroke={theme.sparkStroke}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sparkPoints.line}
                />
                {sparkPoints.pts.map((p, idx) => (
                  <circle
                    key={p.label}
                    cx={p.x}
                    cy={p.y}
                    r={idx === sparkPoints.pts.length - 1 ? 4 : 2.5}
                    fill={theme.sparkStroke}
                  />
                ))}
              </svg>
              <div className={`flex justify-between text-[10px] mt-0.5 ${theme.muted}`}>
                <span>{sparkPoints.pts[0].label}</span>
                <span>{sparkPoints.pts[1].label}</span>
                <span>{sparkPoints.pts[2].label}</span>
                <span className={`font-bold ${theme.accentText}`}>{sparkPoints.pts[3].label}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-sm font-bold tracking-wider opacity-80">
            {lang === 'tr' ? 'SON GELİŞMELER' : 'LATEST UPDATES'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {news.slice(0, 3).map((item, idx) => {
              const badgeLabel = lang === 'tr' ? item.tagTr || 'GÜNCEL' : item.tagEn || 'LIVE';
              const rawMsg =
                lang === 'tr'
                  ? item.tr || item.text
                  : item.en || localizeDynamicText(item.tr || item.text, 'en');
              return (
                <div key={idx} className={`rounded-xl border p-3 text-xs leading-relaxed ${theme.card}`}>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-black text-[10px] mb-1.5 border ${getNewsBadgeStyle(
                      badgeLabel
                    )}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {badgeLabel}
                  </span>
                  <p className={theme.muted}>{cleanNestedParens(rawMsg)}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className={`rounded-xl border p-3.5 ${theme.card}`}>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold opacity-85">
              {lang === 'tr' ? "Test Edilen GPU'lar:" : 'Tested GPUs:'}
            </span>
            <span className={`px-2 py-0.5 rounded-md border ${theme.pill}`}>
              {lang === 'tr' ? 'RTX 50 Serisi: 15-24 FPS' : 'RTX 50 Series: 15-24 FPS'}
            </span>
            <span className={`px-2 py-0.5 rounded-md border ${theme.pill}`}>RX 7900 XTX: 16 FPS</span>
            <span className={`px-2 py-0.5 rounded-md border ${theme.pill}`}>RX 9070 XT: 8 FPS</span>
            <span className={`px-2 py-0.5 rounded-md border ${theme.pill}`}>RTX 4070: 3-10 FPS</span>
            <span className={`px-2 py-0.5 rounded-md border ${theme.pill}`}>RTX 5060 Ti: 4 FPS</span>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold tracking-wider opacity-80">
                {lang === 'tr'
                  ? `AKTİF EKİPLER (${filteredTeams.length})`
                  : `ACTIVE EFFORTS (${filteredTeams.length})`}
              </h2>
              <span className={`text-xs sm:hidden ${theme.muted}`}>
                {lang === 'tr' ? '6 Aşama' : '6 Stages'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className={`inline-flex rounded-lg border p-0.5 text-[11px] font-semibold ${theme.subCard}`}>
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('all');
                    setShowAllMobile(false);
                  }}
                  className={`px-2.5 py-1 rounded-md transition ${
                    typeFilter === 'all' ? theme.btnPrimary : theme.muted
                  }`}
                >
                  {lang === 'tr' ? `Tümü (${teams.length})` : `All (${teams.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('open');
                    setShowAllMobile(false);
                  }}
                  className={`px-2.5 py-1 rounded-md transition ${
                    typeFilter === 'open' ? theme.btnPrimary : theme.muted
                  }`}
                >
                  {lang === 'tr' ? `Açık Kaynak (${openCount})` : `Open (${openCount})`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('private');
                    setShowAllMobile(false);
                  }}
                  className={`px-2.5 py-1 rounded-md transition ${
                    typeFilter === 'private' ? theme.btnPrimary : theme.muted
                  }`}
                >
                  {lang === 'tr' ? `Kapalı (${privateCount})` : `Private (${privateCount})`}
                </button>
              </div>
              <span className={`hidden sm:inline text-xs ${theme.muted}`}>
                {lang === 'tr' ? '6 Aşamalı İlerleme Ölçeği' : '6-Stage Progress Scale'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTeams.map((team, idx) => {
              const rank = team.globalRank;
              const isTop3 = rank <= 3;
              const isHot = rank === 1;
              const isNewBadge = Boolean(team.isNew);
              const barWidth = Math.min(100, Math.max(2, team.progress));
              const hideOnMobile = idx >= 10 && !showAllMobile;
              const leaderSummary =
                rank === 1
                  ? lang === 'tr'
                    ? team.summaryTr ||
                      `${team.name} şu an %${team.progress} ile genel lider (${localizeDynamicText(team.fps, 'tr')}).`
                    : team.summaryEn ||
                      `${team.name} currently leads at ${team.progress}% (${localizeDynamicText(team.fps, 'en')}).`
                  : '';

              return (
                <article
                  key={team.name}
                  className={`rounded-2xl border p-3.5 sm:p-4 transition ${theme.card} ${
                    rank === 1 ? 'ring-1 ring-orange-500/40' : ''
                  } ${hideOnMobile ? 'hidden sm:block' : ''}`}
                >
                  <div className="flex items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black shrink-0 ${
                          rank === 1 ? theme.btnPrimary : `border ${theme.pill}`
                        }`}
                      >
                        #{rank}
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                        {team.name}
                      </h3>

                      {isHot && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 text-zinc-950 shadow-[0_0_16px_rgba(249,115,22,0.75)] animate-pulse">
                          <Flame className="w-3 h-3 fill-current" />
                          HOT
                        </span>
                      )}

                      {isNewBadge && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-gradient-to-r animate-pulse ${theme.badgeGlow}`}
                        >
                          <Sparkles className="w-3 h-3" />
                          {lang === 'tr' ? 'YENİ' : 'NEW'}
                        </span>
                      )}

                      {isTop3 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-red-500/20 text-red-300 border border-red-400/50 shadow-[0_0_12px_rgba(248,113,113,0.55)] animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.9)]" />
                          {lang === 'tr' ? 'CANLI' : 'LIVE'}
                        </span>
                      )}

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${theme.pill}`}>
                        {team.type === 'private' ? (
                          <Lock className="w-3 h-3 opacity-80" />
                        ) : (
                          <Code2 className="w-3 h-3 opacity-80" />
                        )}
                        <span>
                          {team.type === 'private'
                            ? lang === 'tr'
                              ? 'Kapalı Ekip'
                              : 'Private Build'
                            : lang === 'tr'
                              ? 'Açık Kaynak'
                              : 'Open Source'}
                        </span>
                      </span>

                      {team.delta && (
                        <span className="text-[11px] font-bold text-emerald-400">
                          ▲ {team.delta}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-lg sm:text-xl font-black ${theme.accentText}`}>
                        {lang === 'tr' ? `%${team.progress}` : `${team.progress}%`}
                      </span>
                      <a
                        href={team.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg border text-xs font-semibold transition hover:opacity-80 ${theme.subCard}`}
                      >
                        <span>{team.isZortos ? 'X' : lang === 'tr' ? 'Kaynak' : 'Source'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mt-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-md border font-semibold ${theme.pill}`}>
                      {localizeDynamicText(team.fps, lang)}
                    </span>
                    {team.gpu && (
                      <span className={`px-2 py-0.5 rounded-md border ${theme.pill}`}>
                        {localizeDynamicText(team.gpu, lang)}
                      </span>
                    )}
                    {team.stage && (
                      <span className={theme.muted}>{localizeDynamicText(team.stage, lang)}</span>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="relative h-2.5 w-full rounded-full bg-zinc-700/35 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient} transition-all duration-500`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-2 gap-y-1">
                      {MILESTONES.map((m) => {
                        const reached = team.progress >= m.min;
                        return (
                          <div key={m.key} className="flex items-center gap-1 min-w-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                reached ? theme.accentBg : 'bg-zinc-600/50'
                              }`}
                            />
                            <span
                              className={`text-[10px] leading-tight truncate ${
                                reached ? 'font-semibold opacity-95' : theme.muted
                              }`}
                            >
                              {m[lang]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {leaderSummary && (
                    <div className={`mt-3 rounded-xl border px-3 py-2 text-xs leading-relaxed flex items-start gap-2 ${theme.subCard}`}>
                      <Info className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${theme.accentText}`} />
                      <p className={theme.muted}>
                        <strong className={theme.accentText}>
                          {lang === 'tr' ? 'Aşama Özeti: ' : 'Stage Summary: '}
                        </strong>
                        {leaderSummary}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {filteredTeams.length > 10 && (
            <div className="sm:hidden pt-1">
              <button
                type="button"
                onClick={() => setShowAllMobile((v) => !v)}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${theme.card} ${theme.accentText}`}
              >
                {showAllMobile ? (
                  <>
                    <span>{lang === 'tr' ? 'İlk 10 Ekibi Göster' : 'Show Top 10 Only'}</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>
                      {lang === 'tr'
                        ? `Tümünü Göster (${filteredTeams.length - 10} ekip daha)`
                        : `Show All (${filteredTeams.length - 10} more)`}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        <section className={`rounded-2xl border p-4 space-y-2.5 ${theme.card}`}>
          <div className="flex items-center gap-2">
            <HelpCircle className={`w-4 h-4 ${theme.accentText} shrink-0`} />
            <h2 className="text-xs sm:text-sm font-bold tracking-wider">
              {lang === 'tr' ? 'MERAK EDİLEN SORULAR' : 'FREQUENTLY ASKED QUESTIONS'}
            </h2>
          </div>

          <div className="space-y-2">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className={`rounded-xl border overflow-hidden ${theme.subCard}`}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-white/5 transition"
                  >
                    <span className="text-xs font-bold leading-snug">
                      {lang === 'tr' ? item.qTr : item.qEn}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.live && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {lang === 'tr' ? 'Canlı Veri' : 'Live'}
                        </span>
                      )}
                      {isOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 opacity-75" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 opacity-75" />
                      )}
                    </div>
                  </button>
                  {isOpen && (
                    <div className={`px-3.5 pb-3 pt-1 text-xs leading-relaxed border-t ${theme.card} ${theme.muted}`}>
                      {lang === 'tr' ? item.aTr : item.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className={`rounded-2xl border overflow-hidden ${theme.card}`}>
          <button
            type="button"
            onClick={() => setRadarOpen((v) => !v)}
            className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2.5 flex-wrap">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">
                {lang === 'tr' ? 'DMCA & Güvenlik Radarı' : 'DMCA & Security Radar'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {lang === 'tr'
                  ? '2 Kaldırılan · Sahte .EXE Uyarısı'
                  : '2 Takedowns · Fake .EXE Warning'}
              </span>
            </div>
            {radarOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
          </button>

          {radarOpen && (
            <div className={`px-4 pb-4 pt-2 border-t space-y-2.5 text-xs ${theme.subCard}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={`p-2.5 rounded-xl border ${theme.card}`}>
                  <span className="font-bold text-red-400">Leonida (DMCA)</span>
                  <p className={`mt-0.5 ${theme.muted}`}>
                    {lang === 'tr'
                      ? '24 Kasım 2026 — Take-Two DMCA bildirimiyle GitHub ana deposu ve 3.007 fork devre dışı bırakıldı.'
                      : 'Nov 24, 2026 — Main GitHub repo and 3,007 forks disabled via Take-Two DMCA notice.'}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl border ${theme.card}`}>
                  <span className="font-bold text-red-400">ZETTROX (Kaldırıldı)</span>
                  <p className={`mt-0.5 ${theme.muted}`}>
                    {lang === 'tr'
                      ? '25 Kasım 2026 — Eski %64.2 lideri Zettrox/ztrx deposu GitHub üzerinden silindi.'
                      : 'Nov 25, 2026 — Former 64.2% leader Zettrox/ztrx repository was removed from GitHub.'}
                  </p>
                </div>
              </div>
              <p className="text-amber-300/90 leading-relaxed font-medium">
                {lang === 'tr'
                  ? 'Güvenlik Uyarısı: İnternette dolaşan "GTA 6 PC Kurulum / Crack .exe" dosyalarının tamamı sahtedir ve zararlı yazılım içerir. Hiçbir geliştirici ekip halka açık oynanabilir bir kurulum dosyası dağıtmamaktadır.'
                  : 'Security Warning: All "GTA 6 PC Installer / Crack .exe" files circulating online are fake and contain malware. No development team distributes a public playable installer.'}
              </p>
            </div>
          )}
        </section>

        <footer className={`pt-2 pb-10 space-y-4 text-center text-xs ${theme.muted}`}>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setFeedbackStatus('idle');
                setFeedbackOpen(true);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition ${theme.btnPrimary}`}
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>{lang === 'tr' ? 'Tavsiye / Fikir' : 'Feedback / Idea'}</span>
            </button>
            <a
              href="https://x.com/batmancodex"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition hover:opacity-85 ${theme.card}`}
            >
              <IconX />
              <span>@batmancodex</span>
            </a>
            <a
              href="https://wa.me/?text=GTA%20VI%20PC%20Port%20Takip%3A%20https%3A%2F%2Fgta6takip.vercel.app%2F"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition hover:opacity-85 ${theme.card}`}
            >
              <IconWhatsApp />
              <span>{lang === 'tr' ? "WhatsApp'ta Paylaş" : 'Share on WhatsApp'}</span>
            </a>
            <a
              href="https://x.com/intent/tweet?text=GTA%20VI%20PC%20Port%20Takip&url=https%3A%2F%2Fgta6takip.vercel.app%2F"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition hover:opacity-85 ${theme.card}`}
            >
              <IconX />
              <span>{lang === 'tr' ? "X'te Paylaş" : 'Share on X'}</span>
            </a>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition hover:opacity-85 ${theme.card}`}
            >
              <Share2 className={`w-3.5 h-3.5 ${theme.accentText}`} />
              <span>{copied ? (lang === 'tr' ? 'Kopyalandı' : 'Copied') : (lang === 'tr' ? 'Linki Kopyala' : 'Copy Link')}</span>
            </button>
          </div>
          <p className="max-w-2xl mx-auto leading-relaxed opacity-80">
            {lang === 'tr'
              ? 'GTA6takip, PortWatch projesinin kâr gütmeyen, hobi amaçlı Türkçe alternatifidir. Veriler halka açık kaynaklardan derlenir; hiçbir korsan veya telifli dosya barındırılmaz.'
              : 'GTA6takip is a non-profit, hobbyist tracker inspired by PortWatch. Data is aggregated from public sources; no pirated or copyrighted files are hosted.'}
          </p>
        </footer>
      </main>

      {showBackTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={lang === 'tr' ? 'Yukarı çık' : 'Back to top'}
          className={`fixed bottom-5 right-4 z-40 p-3 rounded-full shadow-lg transition hover:scale-110 ${theme.btnPrimary}`}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {feedbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-5 space-y-4 ${theme.card}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className={`w-4 h-4 ${theme.accentText}`} />
                <h3 className="text-base font-black">
                  {lang === 'tr' ? 'Tavsiye / Fikir Gönder' : 'Send Feedback / Idea'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackOpen(false)}
                className={`p-1 rounded-lg border ${theme.subCard}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedbackStatus === 'sent' ? (
              <div className={`rounded-xl border p-4 text-center space-y-2 ${theme.subCard}`}>
                <p className="text-sm font-bold text-emerald-400">
                  {lang === 'tr' ? 'Mesajın iletildi, teşekkürler!' : 'Your message has been sent, thank you!'}
                </p>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold ${theme.btnPrimary}`}
                >
                  {lang === 'tr' ? 'Kapat' : 'Close'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-3 text-xs">
                <div>
                  <label className={`block font-semibold mb-1 ${theme.muted}`}>
                    {lang === 'tr' ? 'Adın / Rumuzun (opsiyonel)' : 'Name / Nickname (optional)'}
                  </label>
                  <input
                    type="text"
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    placeholder={lang === 'tr' ? 'Örn: Ahmet' : 'e.g. Alex'}
                    className={`w-full rounded-xl border px-3 py-2 outline-none ${theme.subCard}`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${theme.muted}`}>
                    {lang === 'tr' ? 'E-posta (opsiyonel, dönüş istersen)' : 'Email (optional, for reply)'}
                  </label>
                  <input
                    type="email"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                    className={`w-full rounded-xl border px-3 py-2 outline-none ${theme.subCard}`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${theme.muted}`}>
                    {lang === 'tr' ? 'Tavsiye / Fikrin *' : 'Your Feedback / Idea *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={feedbackMsg}
                    onChange={(e) => setFeedbackMsg(e.target.value)}
                    placeholder={
                      lang === 'tr'
                        ? 'Site hakkında düşüncelerini, önerini veya hata bildirimini yazabilirsin...'
                        : 'Share your thoughts, feature ideas, or bug reports...'
                    }
                    className={`w-full rounded-xl border px-3 py-2 outline-none resize-none ${theme.subCard}`}
                  />
                </div>

                {feedbackStatus === 'error' && (
                  <p className="text-red-400 font-semibold">
                    {lang === 'tr'
                      ? 'Gönderilirken bir hata oluştu, lütfen tekrar dene.'
                      : 'Failed to send, please try again.'}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={feedbackStatus === 'sending'}
                  className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${theme.btnPrimary}`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {feedbackStatus === 'sending'
                      ? lang === 'tr'
                        ? 'Gönderiliyor...'
                        : 'Sending...'
                      : lang === 'tr'
                        ? 'Gönder'
                        : 'Send'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {changelogOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-5 space-y-4 max-h-[85vh] overflow-y-auto ${theme.card}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black">
                {lang === 'tr' ? 'Sürüm Notları' : 'Release Notes'}
              </h3>
              <button
                type="button"
                onClick={() => setChangelogOpen(false)}
                className={`p-1 rounded-lg border ${theme.subCard}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {CHANGELOG.map((rel) => (
                <div key={rel.version} className={`rounded-xl border p-3.5 space-y-2 ${theme.subCard}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-black text-sm ${theme.accentText}`}>{rel.version}</span>
                    <span className={`text-xs ${theme.muted}`}>{lang === 'tr' ? rel.dateTr : rel.dateEn}</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-xs leading-relaxed">
                    {(lang === 'tr' ? rel.itemsTr : rel.itemsEn).map((line, i) => (
                      <li key={i}>{line}</li>
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
