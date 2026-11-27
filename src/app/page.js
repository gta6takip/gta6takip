'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  RefreshCw,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Shield,
  ShieldAlert,
  ShieldCheck,
  BadgeCheck,
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
  MessageCircle,
  Send,
  Globe,
  Clock,
  Reply,
  Volume2,
  VolumeX,
  User,
  KeyRound,
  Cpu,
  Ban,
  Trash2,
  Pin,
  Search,
  List,
  LayoutGrid,
  Monitor,
  Crown,
  BarChart3,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const APP_VERSION = 'v1.1.2';
const INITIAL_TEAMS_LIMIT = 5;
const CHAT_COOLDOWN_SEC = 30;
const CHAT_COOLDOWN_KEY = 'gta6takip_chat_cooldown_until';
const CHAT_SOUND_KEY = 'gta6takip_chat_sound';
const CHAT_CLIENT_KEY = 'gta6takip_client_id';
const CHAT_REACTIONS_KEY = 'gta6takip_reactions';
const CHAT_REACTION_EMOJIS = ['🔥', '👍', '😂'];

function playChatChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!window.__gta6AudioCtx) {
      window.__gta6AudioCtx = new AudioCtx();
    }
    const ctx = window.__gta6AudioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(660, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.09, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.13);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.075);
    gain2.gain.setValueAtTime(0.001, now + 0.075);
    gain2.gain.linearRampToValueAtTime(0.08, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.075);
    osc2.stop(now + 0.26);
  } catch {
    // Tarayıcı ses izni yoksa sessizce geç
  }
}

const NICK_PALETTES_DARK = [
  { pill: 'bg-pink-500/20 text-pink-100 border-pink-400/40 shadow-[0_2px_10px_rgba(236,72,153,0.16)]', avatar: 'bg-gradient-to-br from-pink-400 to-rose-500 text-zinc-950' },
  { pill: 'bg-amber-500/20 text-amber-100 border-amber-400/40 shadow-[0_2px_10px_rgba(245,158,11,0.16)]', avatar: 'bg-gradient-to-br from-amber-300 to-orange-500 text-zinc-950' },
  { pill: 'bg-cyan-500/20 text-cyan-100 border-cyan-400/40 shadow-[0_2px_10px_rgba(34,211,238,0.16)]', avatar: 'bg-gradient-to-br from-cyan-300 to-sky-500 text-zinc-950' },
  { pill: 'bg-violet-500/20 text-violet-100 border-violet-400/40 shadow-[0_2px_10px_rgba(139,92,246,0.16)]', avatar: 'bg-gradient-to-br from-violet-300 to-fuchsia-500 text-zinc-950' },
  { pill: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40 shadow-[0_2px_10px_rgba(16,185,129,0.16)]', avatar: 'bg-gradient-to-br from-emerald-300 to-teal-500 text-zinc-950' },
  { pill: 'bg-sky-500/20 text-sky-100 border-sky-400/40 shadow-[0_2px_10px_rgba(56,189,248,0.16)]', avatar: 'bg-gradient-to-br from-sky-300 to-indigo-500 text-zinc-950' },
];

const NICK_PALETTES_LIGHT = [
  { pill: 'bg-pink-100 text-pink-950 border-pink-300 shadow-sm', avatar: 'bg-gradient-to-br from-pink-500 to-rose-600 text-white' },
  { pill: 'bg-amber-100 text-amber-950 border-amber-300 shadow-sm', avatar: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' },
  { pill: 'bg-cyan-100 text-cyan-950 border-cyan-300 shadow-sm', avatar: 'bg-gradient-to-br from-cyan-500 to-sky-600 text-white' },
  { pill: 'bg-violet-100 text-violet-950 border-violet-300 shadow-sm', avatar: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white' },
  { pill: 'bg-emerald-100 text-emerald-950 border-emerald-300 shadow-sm', avatar: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' },
  { pill: 'bg-sky-100 text-sky-950 border-sky-300 shadow-sm', avatar: 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white' },
];

function getNickStyle(name, isLight) {
  const str = String(name || 'U');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  const list = isLight ? NICK_PALETTES_LIGHT : NICK_PALETTES_DARK;
  return list[hash % list.length];
}

const IconAmd = ({ className = 'w-3.5 h-3.5 shrink-0' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M18.324 9.137L24 14.813V0H9.187l5.676 5.676h3.461v3.461zM14.813 18.324H5.676V9.187L0 14.863V24h9.137l5.676-5.676z" />
  </svg>
);

const IconNvidia = ({ className = 'w-3.5 h-3.5 shrink-0' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M8.948 8.798v-1.43a6.7 6.7 0 0 1 .424-.018c3.922-.124 6.493 3.374 6.493 3.374s-2.774 3.851-5.75 3.851c-.398 0-.787-.062-1.167-.185v-4.34a3.01 3.01 0 0 1 2.752 1.724l2.044-1.724s-1.494-1.959-4.012-1.959c-.269 0-.531.02-.784.051v.656zm0-4.366v1.894c.14-.011.281-.017.424-.022 5.475-.176 9.048 4.492 9.048 4.492s-4.093 4.976-8.353 4.976c-.379 0-.751-.035-1.119-.098v1.186c.309.04.626.063.95.063 3.963 0 6.83-2.022 9.603-4.416.459.369 2.341 1.265 2.725 1.658-2.633 2.203-8.765 3.979-12.244 3.979-.338 0-.67-.016-.994-.047v1.727H24V4.432H8.948zm0 9.95v1.298c-3.779-.673-4.827-4.597-4.827-4.597s1.815-2.011 4.827-2.326v1.282c-.008 0-.016-.001-.024-.001-1.579-.191-2.815 1.285-2.815 1.285s.692 2.482 2.839 3.059zM2.393 10.94s2.241-3.307 6.555-3.635V6.05C3.97 6.451 0 10.654 0 10.654s2.348 6.798 8.948 7.428v-1.307c-4.832-.608-6.555-5.835-6.555-5.835z" />
  </svg>
);

const GpuBadgeIcons = ({ gpu, isLight }) => {
  const lower = String(gpu || '').toLowerCase();
  const hasAmd = lower.includes('amd');
  const hasNvidia = lower.includes('nvidia');
  if (!hasAmd && !hasNvidia) return null;
  return (
    <span className="inline-flex items-center gap-1 shrink-0">
      {hasAmd && (
        <IconAmd className={`w-3 h-3 ${isLight ? 'text-[#c8102e]' : 'text-[#ff5c5c]'}`} />
      )}
      {hasNvidia && (
        <IconNvidia className={`w-3.5 h-3.5 ${isLight ? 'text-[#598c00]' : 'text-[#8ce000]'}`} />
      )}
    </span>
  );
};

const THEMES = {
  vice: {
    id: 'vice',
    label: { tr: 'Vice Sunset', en: 'Vice Sunset' },
    dot: '#ec4899',
    bg: 'bg-[#140b1e] text-pink-50',
    card: 'bg-[#1e112d]/95 border-pink-500/25',
    menuBg: 'bg-[#1e112d] border-pink-500/35',
    subCard: 'bg-[#170c24] border-pink-500/20',
    muted: 'text-pink-200/70',
    accentText: 'text-pink-400',
    accentBg: 'bg-pink-500',
    accentGradient: 'from-pink-500 via-fuchsia-400 to-amber-400',
    btnPrimary: 'bg-gradient-to-r from-pink-500 to-amber-400 text-zinc-950 hover:brightness-110',
    pill: 'bg-pink-950/60 text-pink-200 border-pink-500/30',
    softChip: 'bg-pink-500/12 text-pink-200/90',
    sparkStroke: '#f472b6',
    sparkStop: 'rgba(244, 114, 182, 0.32)',
    sbTrack: '#170c24',
    sbThumb: 'rgba(236, 72, 153, 0.48)',
    sbThumbHover: 'rgba(244, 114, 182, 0.85)',
  },
  light: {
    id: 'light',
    label: { tr: 'Açık', en: 'Light' },
    dot: '#ea580c',
    bg: 'bg-zinc-50 text-zinc-900',
    card: 'bg-white border-zinc-200 shadow-sm',
    menuBg: 'bg-white border-zinc-200',
    subCard: 'bg-zinc-100/80 border-zinc-200',
    muted: 'text-zinc-600',
    accentText: 'text-orange-600',
    accentBg: 'bg-orange-600',
    accentGradient: 'from-orange-600 via-amber-500 to-yellow-500',
    btnPrimary: 'bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:brightness-105',
    pill: 'bg-zinc-100 text-zinc-700 border-zinc-300',
    softChip: 'bg-zinc-100 text-zinc-700',
    sparkStroke: '#ea580c',
    sparkStop: 'rgba(234, 88, 12, 0.22)',
    sbTrack: '#f4f4f5',
    sbThumb: 'rgba(234, 88, 12, 0.42)',
    sbThumbHover: 'rgba(234, 88, 12, 0.78)',
  },
  dark: {
    id: 'dark',
    label: { tr: 'Koyu', en: 'Dark' },
    dot: '#f97316',
    bg: 'bg-[#0b0d12] text-zinc-100',
    card: 'bg-[#131722] border-zinc-800/90',
    menuBg: 'bg-[#131722] border-zinc-700',
    subCard: 'bg-[#0f131c] border-zinc-800/80',
    muted: 'text-zinc-400',
    accentText: 'text-orange-400',
    accentBg: 'bg-orange-500',
    accentGradient: 'from-orange-500 via-amber-400 to-yellow-400',
    btnPrimary: 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 hover:brightness-110',
    pill: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/70',
    softChip: 'bg-zinc-800/70 text-zinc-300',
    sparkStroke: '#fb923c',
    sparkStop: 'rgba(251, 146, 60, 0.32)',
    sbTrack: '#0f131c',
    sbThumb: 'rgba(249, 115, 22, 0.48)',
    sbThumbHover: 'rgba(251, 146, 60, 0.85)',
  },
  leonida: {
    id: 'leonida',
    label: { tr: 'Leonida Neon', en: 'Leonida Neon' },
    dot: '#22d3ee',
    bg: 'bg-[#07111a] text-cyan-50',
    card: 'bg-[#0d1b28] border-cyan-500/25',
    menuBg: 'bg-[#0d1b28] border-cyan-500/35',
    subCard: 'bg-[#09141f] border-cyan-500/20',
    muted: 'text-cyan-200/70',
    accentText: 'text-cyan-400',
    accentBg: 'bg-cyan-400',
    accentGradient: 'from-cyan-400 via-teal-300 to-emerald-400',
    btnPrimary: 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 hover:brightness-110',
    pill: 'bg-cyan-950/60 text-cyan-200 border-cyan-500/30',
    softChip: 'bg-cyan-500/12 text-cyan-200/90',
    sparkStroke: '#22d3ee',
    sparkStop: 'rgba(34, 211, 238, 0.30)',
    sbTrack: '#09141f',
    sbThumb: 'rgba(34, 211, 238, 0.48)',
    sbThumbHover: 'rgba(34, 211, 238, 0.85)',
  },
  ocean: {
    id: 'ocean',
    label: { tr: 'Ocean Drive', en: 'Ocean Drive' },
    dot: '#60a5fa',
    bg: 'bg-[#090f1d] text-slate-100',
    card: 'bg-[#10192d] border-blue-500/25',
    menuBg: 'bg-[#10192d] border-blue-500/35',
    subCard: 'bg-[#0c1324] border-blue-500/20',
    muted: 'text-slate-400',
    accentText: 'text-blue-400',
    accentBg: 'bg-blue-500',
    accentGradient: 'from-blue-400 via-indigo-400 to-violet-400',
    btnPrimary: 'bg-gradient-to-r from-blue-400 to-violet-400 text-zinc-950 hover:brightness-110',
    pill: 'bg-blue-950/60 text-blue-200 border-blue-500/30',
    softChip: 'bg-blue-500/12 text-blue-200/90',
    sparkStroke: '#60a5fa',
    sparkStop: 'rgba(96, 165, 250, 0.30)',
    sbTrack: '#0c1324',
    sbThumb: 'rgba(96, 165, 250, 0.48)',
    sbThumbHover: 'rgba(96, 165, 250, 0.85)',
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
    name: 'Belobug',
    progress: 91.3,
    fps: '22 FPS',
    gpu: 'AMD',
    type: 'open',
    stage: 'Oynanabilir • Hikâye %80',
    updatedAt: '2026-11-26T00:57:17Z',
    url: 'https://github.com/Belobug/VIctory-Belobug-AMD',
  },
  { name: 'CGBJ', progress: 89.6, fps: '25 FPS', gpu: 'Özel Yapı', type: 'private', stage: 'Oynanabilir • Hikâye %80', updatedAt: '2026-11-26', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'NotNozy', progress: 87.1, fps: '16 FPS', gpu: 'AMD', type: 'private', stage: 'Oynanabilir • Hikâye %80', updatedAt: '2026-11-26', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'darkworldhm', progress: 84.8, fps: '15 FPS', gpu: 'NVIDIA', type: 'private', stage: 'Oynanabilir • İlk Perde', updatedAt: '2026-11-26', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'Doomsday', progress: 82.1, fps: '4 FPS', gpu: 'AMD / NVIDIA', type: 'private', stage: 'Oynanabilir • İlk Perde', updatedAt: '2026-11-26', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'AvatarManz', progress: 81.8, fps: '16 FPS', gpu: 'AMD', type: 'open', stage: 'Oynanabilir • İlk Perde', updatedAt: '2026-11-26', url: 'https://github.com/avatarmanz/VIctory-7900XTX' },
  { name: 'DexNom', progress: 77.4, fps: '3 FPS', gpu: 'AMD', type: 'open', stage: 'Oynanabilir • İlk Perde', updatedAt: '2026-11-25', url: 'https://github.com/DexNom/VIctory' },
  { name: 'suri', progress: 73.8, fps: '3 FPS', gpu: 'Özel Yapı', type: 'private', stage: 'Oynanabilir • İlk Perde', updatedAt: '2026-11-25', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'Kelvaroq', progress: 68.8, fps: '10 FPS', gpu: 'NVIDIA', type: 'open', stage: 'Oynanabilir', updatedAt: '2026-11-26', url: 'https://github.com/stellarr-studio/kelvaroq' },
  { name: 'hyphennn', progress: 59.8, fps: '3 FPS', gpu: 'NVIDIA', type: 'open', stage: 'Oynanabilir', updatedAt: '2026-11-25', url: 'https://github.com/fxceless/victory-fork' },
  { name: 'Uilian', progress: 59.6, fps: '4 FPS', gpu: 'NVIDIA', type: 'open', stage: 'Oynanabilir', updatedAt: '2026-11-25', url: 'https://github.com/uiliannn/VItoriaBr' },
  { name: 'VIctory', progress: 50.3, fps: '1 FPS', gpu: 'AMD', type: 'open', stage: 'Oynanabilir', updatedAt: '2026-11-26', url: 'https://github.com/Marvisak/VIctory' },
  { name: 'XCL', progress: 35.0, fps: 'Ana Menü', gpu: 'AMD / NVIDIA', type: 'open', stage: 'Ana Menü', updatedAt: '2026-11-25', url: 'https://github.com/xcl-dev/xcl' },
];

const FALLBACK_NEWS = [
  { tagTr: 'REKOR', tagEn: 'RECORD', tr: 'Belobug %91.3 ile yeni genel lider (22 FPS · AMD)!', en: 'Belobug leads overall at 91.3% (22 FPS · AMD)!' },
  { tagTr: 'AÇIK KAYNAK', tagEn: 'OPEN SOURCE', tr: 'Açık kaynak lideri Belobug (%91.3); AvatarManz (%81.8) ve DexNom (%77.4) takipte.', en: 'Belobug (91.3%) leads open source; AvatarManz (81.8%) & DexNom (77.4%) follow.' },
  { tagTr: 'GÜNCEL', tagEn: 'LIVE', tr: 'PortWatch üzerinde 40 girişim takip ediliyor; 18 proje oyunu başlatabiliyor (İlk 3 ort. %89.3).', en: '40 total efforts tracked on PortWatch, with 18 booting GTA VI (Top-3 avg 89.3%).' },
];

const CHANGELOG = [
  {
    version: 'v1.1.2',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'Mobil görünüm cilası: Sol alttaki Tavsiye / Fikir butonu mobilde yuvarlak ikon butonuna alındı, alt boşluk artırılarak içerik üstüne binme giderildi.',
      'Kompakt listede ilerleme çubuğu mobilde tam genişliğe yayıldı; Günlük Yükseliş grafiği kartın iki ucuna tam hizalandı.',
      'Mobil filtre şeridi sıkılaştırıldı, uzun ekip adlarında başlık rozeti alt satıra alınarak tek satır korundu ve Son Gelişmeler kartları mobilde yatay kaydırılabilir yapıldı.',
    ],
    itemsEn: [
      'Mobile polish: Switched the floating Feedback button to a compact circular icon on mobile with extra footer padding to eliminate content overlap.',
      'Expanded the Compact view progress bar across full mobile width and stretched the Daily Trend sparkline edge-to-edge.',
      'Tightened mobile filter controls, kept team card headers single-line on mobile, and made Latest Updates horizontally swipeable on mobile.',
    ],
  },
  {
    version: 'v1.1.1',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'Üst özet kartına %100 hedef halkası, istatistik simgeli "İlk 3 Ort." rozeti ve kral taçlı parlayan Zirve Lider vurgusu eklendi.',
      'Ekip kartlarında CANLI yazısı kaldırılıp her geliştiricinin başına yavaşça yanıp sönen kırmızı nokta eklendi; HOT yalnızca #1 liderde kaldı.',
      'FPS etiketlerine ekran (monitör) simgesi, AMD/NVIDIA kartlarına marka logoları eklendi ve #1 liderin Aşama Özeti oyuncu dilinde sadeleştirildi.',
    ],
    itemsEn: [
      'Added a 100% circular progress ring, stats-badged Top-3 Average, and glowing crowned Top Leader to the hero summary card.',
      'Replaced the flashing LIVE badge with a gentle slow-pulsing red dot next to every team; kept HOT exclusive to #1.',
      'Added monitor icons for FPS, brand logos for AMD/NVIDIA cards, and a clearer gamer-friendly Stage Summary for #1.',
    ],
  },
  {
    version: 'v1.1.0',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'Arayüz Cilası: Aktif Ekipler başlık ve arama çubuğu sıfır kaymalı 2 satırlı düzene alındı; tek tıkla "Kompakt / Detaylı" görünüm geçişi eklendi.',
      'Masaüstü ve mobilde varsayılan İlk 5 ekip + "Tüm Ekipleri Göster" butonuyla Canlı Sohbete ve SSS bölümüne erişim çok daha rahat hale getirildi.',
    ],
    itemsEn: [
      'UI Polish: Moved Active Efforts header, search, and filters to a rock-solid 2-row layout and added a Compact / Detailed view toggle.',
      'Defaulted both desktop and mobile to Top 5 teams with a "Show All Teams" toggle for quicker access to Live Chat and FAQ.',
    ],
  },
  {
    version: 'v1.0.50',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'Canlı Sohbette kullanıcı adına tıklayarak @etiketle akışı düzeltildi; emoji tepkileri tarayıcıda kalıcı hale getirilip sunucuda hız sınırıyla korundu.',
      'Sekme arka plandayken 120sn otomatik veri yenilemesini duraklatan performans optimizasyonu eklendi.',
    ],
    itemsEn: [
      'Fixed click-to-@mention in Live Chat; persisted emoji reactions locally and added server-side reaction rate limiting.',
      'Paused 120s auto-sync while tab is in the background to cut server load and save battery.',
    ],
  },
];

const COUNTRY_FALLBACK_NAMES = {
  TR: { tr: 'Türkiye', en: 'Turkey' },
  DE: { tr: 'Almanya', en: 'Germany' },
  IE: { tr: 'İrlanda', en: 'Ireland' },
  US: { tr: 'ABD', en: 'United States' },
  GB: { tr: 'Birleşik Krallık', en: 'United Kingdom' },
  NL: { tr: 'Hollanda', en: 'Netherlands' },
  FR: { tr: 'Fransa', en: 'France' },
  AZ: { tr: 'Azerbaycan', en: 'Azerbaijan' },
  PL: { tr: 'Polonya', en: 'Poland' },
  RU: { tr: 'Rusya', en: 'Russia' },
  BR: { tr: 'Brezilya', en: 'Brazil' },
  CA: { tr: 'Kanada', en: 'Canada' },
};

const FlagTR = ({ className = 'w-4 h-3 rounded-[2px] shrink-0' }) => (
  <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
    <rect width="24" height="16" fill="#E30A17" />
    <circle cx="9.5" cy="8" r="4.2" fill="#FFFFFF" />
    <circle cx="10.6" cy="8" r="3.4" fill="#E30A17" />
    <polygon points="15.2,8 13.7,8.5 14.3,7 13.3,5.8 14.8,5.9" fill="#FFFFFF" />
  </svg>
);

const FlagUS = ({ className = 'w-4 h-3 rounded-[2px] shrink-0' }) => (
  <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
    <rect width="24" height="16" fill="#B22234" />
    <rect y="2" width="24" height="2" fill="#FFFFFF" />
    <rect y="6" width="24" height="2" fill="#FFFFFF" />
    <rect y="10" width="24" height="2" fill="#FFFFFF" />
    <rect y="14" width="24" height="2" fill="#FFFFFF" />
    <rect width="10" height="9" fill="#3C3B6E" />
  </svg>
);

const CountryFlag = ({ code }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const cc = String(code || '').trim().toLowerCase();

  if (cc === 'tr') return <FlagTR className="w-5 h-3.5 rounded-[2px] shrink-0 shadow-sm" />;
  if (cc === 'us') return <FlagUS className="w-5 h-3.5 rounded-[2px] shrink-0 shadow-sm" />;

  if (!/^[a-z]{2}$/.test(cc) || imgFailed) {
    return <Globe className="w-4 h-4 opacity-75 shrink-0" aria-hidden="true" />;
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${cc}.png`}
      srcSet={`https://flagcdn.com/w80/${cc}.png 2x`}
      alt={cc.toUpperCase()}
      width={20}
      height={14}
      loading="eager"
      onError={() => setImgFailed(true)}
      className="w-5 h-3.5 rounded-[2px] object-cover shrink-0 shadow-sm"
    />
  );
};

function getCountryLabel(code, lang) {
  const cc = String(code || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return lang === 'tr' ? 'Diğer' : 'Other';
  try {
    if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
      const dn = new Intl.DisplayNames([lang === 'tr' ? 'tr' : 'en'], { type: 'region' });
      const name = dn.of(cc);
      if (name) return name;
    }
  } catch {
    // Fallback listeye geç
  }
  return COUNTRY_FALLBACK_NAMES[cc]?.[lang] || cc;
}

function guessClientCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Istanbul')) return 'TR';
    const navLang = (typeof navigator !== 'undefined' && navigator.language) || '';
    const parts = navLang.split('-');
    if (parts[1] && /^[A-Za-z]{2}$/.test(parts[1])) return parts[1].toUpperCase();
    if (parts[0]?.toLowerCase() === 'tr') return 'TR';
  } catch {
    // Varsayılan TR
  }
  return 'TR';
}

function formatTeamUpdated(rawDate, lang) {
  if (!rawDate) return '';
  const str = String(rawDate).trim();
  const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(`${str}T12:00:00Z`);
    if (Number.isNaN(d.getTime())) return str;
    return d.toLocaleDateString(locale, {
      timeZone: 'Europe/Istanbul',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str;
  const datePart = d.toLocaleDateString(locale, {
    timeZone: 'Europe/Istanbul',
    day: 'numeric',
    month: 'short',
  });
  const timePart = d.toLocaleTimeString(locale, {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${datePart} · ${timePart} ${lang === 'tr' ? 'TSİ' : 'TRT'}`;
}

function formatChatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

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
      .replace(/Compatibility layer/gi, 'Uyumluluk Katmanı')
      .replace(/Static recompilation/gi, 'Statik Recomp')
      .replace(/RTX 50 Series/gi, 'RTX 50 Serisi');
  }
  return String(text)
    .replace(/Oynanabilir/gi, 'Playable')
    .replace(/Serbest Dolaşım/gi, 'Free Roam')
    .replace(/Hikâye Yarısı/gi, 'Half the Story')
    .replace(/Hikâye/gi, 'Story')
    .replace(/İlk Perde/gi, 'First Act')
    .replace(/İlk Sahne/gi, 'First Scene')
    .replace(/\(Sesli\)/gi, '(With Sound)')
    .replace(/Ara Sahne/gi, 'Cutscenes')
    .replace(/Menü/gi, 'Menu')
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
    .replace(/Bağımsız/gi, 'Independent')
    .replace(/Ön Aşama/gi, 'Early Stage')
    .replace(/GDK Örnekleri/gi, 'GDK Samples')
    .replace(/HLE Emülatör/gi, 'HLE Emulator')
    .replace(/Statik Recomp/gi, 'Static Recomp')
    .replace(/Tanılama/gi, 'Diagnostics')
    .replace(/C# Katmanı/gi, 'C# Layer')
    .replace(/Rumble Yayını/gi, 'Rumble Stream')
    .replace(/Açık Kaynak/gi, 'Open Source')
    .replace(/PortWatch Canlı/gi, 'PortWatch Live')
    .replace(/4K İstem/gi, '4K Prompt')
    .replace(/%(\d+(?:[.,]\d+)?)/g, '$1%');
}

function buildLeaderSummary(team, lang) {
  const fpsStr = localizeDynamicText(team.fps || '—', lang);
  const gpuStr = team.gpu ? localizeDynamicText(team.gpu, lang) : '';
  const stageStr = team.stage ? localizeDynamicText(team.stage, lang) : '';
  const isOpen = team.type !== 'private';

  if (lang === 'tr') {
    const gpuPhrase = gpuStr ? `${gpuStr} ekran kartlarında ` : '';
    const openPhrase = isOpen
      ? 'Kodları GitHub üzerinden herkese açık geliştiriliyor'
      : 'Şu an kapalı (özel) bir geliştirme yapısı olarak ilerliyor';
    const stagePhrase = stageStr ? ` (${stageStr})` : '';
    return `${team.name}, %${team.progress} ilerleme ile şu an yarışta 1. sırada. Oyun ${gpuPhrase}ortalama ${fpsStr} civarında oynanabiliyor${stagePhrase} — yani siyah ekran ve çökme dönemi geride kaldı. ${openPhrase}; ancak herkesin tek tıkla kurup sorunsuz oynayabileceği stabil 30+ FPS seviyesine henüz ulaşılmadı.`;
  }

  const gpuPhraseEn = gpuStr ? `on ${gpuStr} GPUs ` : '';
  const openPhraseEn = isOpen
    ? 'Its source code is publicly developed on GitHub'
    : 'It is currently developed as a private build';
  const stagePhraseEn = stageStr ? ` (${stageStr})` : '';
  return `${team.name} leads the race at ${team.progress}%. GTA VI runs ${gpuPhraseEn}at around ${fpsStr}${stagePhraseEn}, meaning actual gameplay is working past menus and crashes. ${openPhraseEn}, though a smooth, public 30+ FPS build for everyone is still ahead.`;
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

function getNewsBadgeStyle(tagRaw, isLight) {
  const tag = String(tagRaw || '').toUpperCase();
  if (tag.includes('REKOR') || tag.includes('RECORD')) {
    return isLight
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.45)]';
  }
  if (tag.includes('AÇIK') || tag.includes('OPEN')) {
    return isLight
      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.45)]';
  }
  return isLight
    ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
    : 'bg-red-500/20 text-red-300 border-red-400/50 shadow-[0_0_12px_rgba(248,113,113,0.5)] animate-pulse';
}

export default function HomePage() {
  const [lang, setLang] = useState('tr');
  const [themeKey, setThemeKey] = useState('vice');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [onlineMenuOpen, setOnlineMenuOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [radarOpen, setRadarOpen] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [showBackTop, setShowBackTop] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [gpuFilter, setGpuFilter] = useState('all');
  const [teamSearch, setTeamSearch] = useState('');
  const [showAllTeams, setShowAllTeams] = useState(false);
  const [compactView, setCompactView] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const chatOpenRef = useRef(false);
  const [chatRoom, setChatRoom] = useState('tr');
  const chatRoomRef = useRef('tr');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatNick, setChatNick] = useState('');
  const [chatClientId, setChatClientId] = useState('');
  const [staffPinOpen, setStaffPinOpen] = useState(false);
  const [staffPin, setStaffPin] = useState('');
  const [banningId, setBanningId] = useState(null);
  const [clearingId, setClearingId] = useState(null);
  const [pinnedNotice, setPinnedNotice] = useState(null);
  const [pinEditorOpen, setPinEditorOpen] = useState(false);
  const [pinDraft, setPinDraft] = useState('');
  const [pinSaving, setPinSaving] = useState(false);
  const [unreadWhileClosed, setUnreadWhileClosed] = useState(0);
  const [unreadWhileScrolled, setUnreadWhileScrolled] = useState(0);
  const [myReactions, setMyReactions] = useState({});
  const [chatNotice, setChatNotice] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [chatCooldown, setChatCooldown] = useState(0);
  const [chatSoundOn, setChatSoundOn] = useState(true);
  const chatSoundOnRef = useRef(true);
  const ownMsgIdsRef = useRef(new Set());
  const lastOwnSendAtRef = useRef(0);
  const forceScrollRef = useRef(false);
  const chatSectionRef = useRef(null);
  const chatListRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('idle');

  const [teams, setTeams] = useState(FALLBACK_TEAMS);
  const [news, setNews] = useState(FALLBACK_NEWS);
  const [totalEfforts, setTotalEfforts] = useState(40);
  const [bootingCount, setBootingCount] = useState(18);
  const [top3Avg, setTop3Avg] = useState(89.3);
  const [lastSyncAt, setLastSyncAt] = useState('');
  const [onlineCount, setOnlineCount] = useState(1);
  const [countryStats, setCountryStats] = useState([{ code: 'TR', count: 1 }]);
  const [countdown, setCountdown] = useState(120);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);

  const theme = THEMES[themeKey] || THEMES.vice;
  const isLight = themeKey === 'light';

  const onlineBtnClass = isLight
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200/70'
    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20';

  const onlineDotClass = isLight ? 'bg-emerald-600' : 'bg-emerald-400';

  const faqLiveBadgeClass = isLight
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

  const dmcaBadgeClass = isLight
    ? 'bg-amber-100 text-amber-900 border-amber-300'
    : 'bg-amber-500/15 text-amber-400 border-amber-500/30';

  const leaderGlowClass = isLight
    ? 'text-amber-700 font-black drop-shadow-[0_0_6px_rgba(217,119,6,0.35)]'
    : 'text-amber-300 font-black drop-shadow-[0_0_10px_rgba(251,191,36,0.75)]';

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

  useEffect(() => {
    chatOpenRef.current = chatOpen;
    if (chatOpen) {
      setUnreadWhileClosed(0);
    }
  }, [chatOpen]);

  useEffect(() => {
    chatRoomRef.current = chatRoom;
  }, [chatRoom]);

  useEffect(() => {
    chatSoundOnRef.current = chatSoundOn;
  }, [chatSoundOn]);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('gta6takip_theme');
      if (savedTheme && THEMES[savedTheme]) setThemeKey(savedTheme);
      const savedLang = localStorage.getItem('gta6takip_lang');
      if (savedLang === 'tr' || savedLang === 'en') {
        setLang(savedLang);
        setChatRoom(savedLang);
        chatRoomRef.current = savedLang;
      }
      const savedNick = localStorage.getItem('gta6takip_nick');
      if (savedNick) setChatNick(savedNick);

      let cid = localStorage.getItem(CHAT_CLIENT_KEY) || '';
      if (cid.length < 8) {
        const rand =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID().replace(/-/g, '').slice(0, 20)
            : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
        cid = `c_${rand}`;
        localStorage.setItem(CHAT_CLIENT_KEY, cid);
      }
      setChatClientId(cid);

      const savedReactionsRaw = localStorage.getItem(CHAT_REACTIONS_KEY);
      if (savedReactionsRaw) {
        const parsed = JSON.parse(savedReactionsRaw);
        if (parsed && typeof parsed === 'object') setMyReactions(parsed);
      }

      const savedSound = localStorage.getItem(CHAT_SOUND_KEY);
      if (savedSound === '0') {
        setChatSoundOn(false);
        chatSoundOnRef.current = false;
      }
      const savedUntil = Number(localStorage.getItem(CHAT_COOLDOWN_KEY) || '0');
      if (savedUntil > Date.now()) {
        setChatCooldown(Math.min(CHAT_COOLDOWN_SEC, Math.ceil((savedUntil - Date.now()) / 1000)));
      }
    } catch {
      // Depolama erişilemezse varsayılan korunur
    }
  }, []);

  useEffect(() => {
    if (chatCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      try {
        const until = Number(localStorage.getItem(CHAT_COOLDOWN_KEY) || '0');
        const remain = Math.ceil((until - Date.now()) / 1000);
        if (remain <= 0) {
          setChatCooldown(0);
          localStorage.removeItem(CHAT_COOLDOWN_KEY);
        } else {
          setChatCooldown(Math.min(CHAT_COOLDOWN_SEC, remain));
        }
      } catch {
        setChatCooldown((prev) => (prev > 1 ? prev - 1 : 0));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [chatCooldown > 0]);

  const startChatCooldown = (seconds = CHAT_COOLDOWN_SEC) => {
    const sec = Math.max(1, Math.min(CHAT_COOLDOWN_SEC, Math.ceil(seconds)));
    const until = Date.now() + sec * 1000;
    try {
      localStorage.setItem(CHAT_COOLDOWN_KEY, String(until));
    } catch {
      // Yoksay
    }
    setChatCooldown(sec);
  };

  const handleToggleChatSound = () => {
    const next = !chatSoundOn;
    setChatSoundOn(next);
    chatSoundOnRef.current = next;
    try {
      localStorage.setItem(CHAT_SOUND_KEY, next ? '1' : '0');
    } catch {
      // Yoksay
    }
    if (next) {
      playChatChime();
    }
  };

  const fetchChatMessages = async (targetRoom = chatRoomRef.current) => {
    setChatLoading(true);
    try {
      const res = await fetch(`/api/chat?room=${encodeURIComponent(targetRoom)}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (chatRoomRef.current === targetRoom) {
        if (Array.isArray(data?.messages)) {
          forceScrollRef.current = true;
          setChatMessages(data.messages);
          setUnreadWhileScrolled(0);
        }
        setPinnedNotice(data?.pinned || null);
      }
    } catch {
      // Sessizce geç
    } finally {
      setChatLoading(false);
    }
  };

  const handleSwitchChatRoom = (nextRoom) => {
    if (nextRoom === chatRoom) return;
    setChatRoom(nextRoom);
    chatRoomRef.current = nextRoom;
    setReplyTo(null);
    setChatError('');
    setChatNotice('');
    setPinnedNotice(null);
    setUnreadWhileScrolled(0);
    setChatMessages([]);
    fetchChatMessages(nextRoom);
  };

  const handleSelectTheme = (id) => {
    setThemeKey(id);
    setThemeMenuOpen(false);
    try {
      localStorage.setItem('gta6takip_theme', id);
    } catch {
      // Yoksay
    }
  };

  const handleSelectLang = (nextLang) => {
    setLang(nextLang);
    handleSwitchChatRoom(nextLang);
    try {
      localStorage.setItem('gta6takip_lang', nextLang);
    } catch {
      // Yoksay
    }
  };

  const handleNickChange = (val) => {
    const trimmed = val.slice(0, 20);
    setChatNick(trimmed);
    try {
      localStorage.setItem('gta6takip_nick', trimmed);
    } catch {
      // Yoksay
    }
  };

  useEffect(() => {
    if (!themeMenuOpen && !onlineMenuOpen) return undefined;
    const onPointerDown = (e) => {
      if (!e.target.closest?.('[data-dropdown-root]')) {
        setThemeMenuOpen(false);
        setOnlineMenuOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setThemeMenuOpen(false);
        setOnlineMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [themeMenuOpen, onlineMenuOpen]);

  const handleJumpToChat = () => {
    forceScrollRef.current = true;
    setChatOpen(true);
    setUnreadWhileClosed(0);
    fetchChatMessages(chatRoomRef.current);
    setTimeout(() => {
      chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  useEffect(() => {
    fetchChatMessages(chatRoomRef.current);
  }, []);

  useEffect(() => {
    if (!supabaseClient) return undefined;
    let chatChannel;
    try {
      chatChannel = supabaseClient
        .channel('gta6takip-chat-realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          (payload) => {
            const incoming = payload?.new;
            if (!incoming?.id) return;
            const msgRoom = incoming.room === 'en' ? 'en' : 'tr';
            if (msgRoom !== chatRoomRef.current) return;

            const idStr = String(incoming.id);
            const isOwnMessage =
              ownMsgIdsRef.current.has(idStr) ||
              Date.now() - lastOwnSendAtRef.current < 2500;

            setChatMessages((prev) => {
              if (prev.some((m) => String(m.id) === idStr)) return prev;
              if (chatSoundOnRef.current && !isOwnMessage) {
                playChatChime();
              }
              if (!chatOpenRef.current && !isOwnMessage) {
                setUnreadWhileClosed((c) => c + 1);
              } else if (chatOpenRef.current && !isOwnMessage) {
                const el = chatListRef.current;
                const nearBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 120;
                if (!nearBottom) {
                  setUnreadWhileScrolled((c) => c + 1);
                }
              }
              return [...prev.slice(-49), incoming];
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
          (payload) => {
            const updated = payload?.new;
            if (!updated?.id) return;
            setChatMessages((prev) =>
              prev.map((m) => (String(m.id) === String(updated.id) ? { ...m, ...updated } : m))
            );
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'chat_messages' },
          (payload) => {
            const deletedId = payload?.old?.id;
            if (!deletedId) return;
            setChatMessages((prev) => prev.filter((m) => String(m.id) !== String(deletedId)));
          }
        )
        .subscribe();
    } catch {
      // Realtime bağlanamazsa manuel/polling akış devam eder
    }
    return () => {
      if (chatChannel) chatChannel.unsubscribe();
    };
  }, [supabaseClient]);

  useEffect(() => {
    if (!chatOpen || !chatEndRef.current) return;
    const el = chatListRef.current;
    const isNearBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (forceScrollRef.current || isNearBottom) {
      forceScrollRef.current = false;
      setUnreadWhileScrolled(0);
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [chatMessages, chatOpen]);

  const handleChatListScroll = () => {
    const el = chatListRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80 && unreadWhileScrolled > 0) {
      setUnreadWhileScrolled(0);
    }
  };

  const handleScrollChatBottom = () => {
    setUnreadWhileScrolled(0);
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleStartReply = (msg) => {
    setReplyTo({
      id: msg.id,
      nickname: msg.nickname,
      message: msg.message,
    });
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 0);
  };

  const handleMentionUser = (e, nick) => {
    if (e?.stopPropagation) e.stopPropagation();
    const clean = String(nick || '').trim();
    if (!clean) return;
    const tag = `@${clean} `;
    setChatInput((prev) => {
      const current = String(prev || '');
      if (current.toLowerCase().startsWith(tag.toLowerCase())) return current;
      return `${tag}${current}`.slice(0, 280);
    });
    setTimeout(() => {
      if (chatInputRef.current) {
        chatInputRef.current.focus();
        const len = chatInputRef.current.value.length;
        try {
          chatInputRef.current.setSelectionRange(len, len);
        } catch {
          // Yoksay
        }
      }
    }, 0);
  };

  const handleToggleReaction = async (msg, emoji) => {
    const key = `${msg.id}:${emoji}`;
    const already = Boolean(myReactions[key]);
    const delta = already ? -1 : 1;

    setMyReactions((prev) => {
      const next = { ...prev };
      if (already) delete next[key];
      else next[key] = true;
      try {
        const entries = Object.entries(next).slice(-120);
        localStorage.setItem(CHAT_REACTIONS_KEY, JSON.stringify(Object.fromEntries(entries)));
      } catch {
        // Yoksay
      }
      return next;
    });

    setChatMessages((prev) =>
      prev.map((m) => {
        if (String(m.id) !== String(msg.id)) return m;
        const curr = m.reactions && typeof m.reactions === 'object' ? { ...m.reactions } : {};
        const nextCnt = Math.max(0, (Number(curr[emoji]) || 0) + delta);
        if (nextCnt === 0) delete curr[emoji];
        else curr[emoji] = nextCnt;
        return { ...m, reactions: curr };
      })
    );

    try {
      const res = await fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'react',
          messageId: msg.id,
          emoji,
          delta,
        }),
      });
      if (res.status === 429) {
        setChatError(chatRoomRef.current === 'en' ? 'Slow down on reactions.' : 'Çok hızlı tepki veriyorsun, biraz bekle.');
      }
    } catch {
      // Sessizce geç
    }
  };

  const isTypingAdminNick = chatNick.trim().toLowerCase() === 'batmancodex';
  const staffModeActive = staffPin.trim().length >= 3;

  const handleSavePin = async (e) => {
    e.preventDefault();
    setChatError('');
    if (!staffPin.trim()) {
      setStaffPinOpen(true);
      setChatError('Duyuru sabitlemek için Yetkili PIN girmelisin.');
      return;
    }
    setPinSaving(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pin',
          room: chatRoom,
          staffPin: staffPin.trim(),
          message: pinDraft.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setChatError(data?.error || 'Duyuru güncellenemedi.');
        return;
      }
      setPinnedNotice(data?.pinned || null);
      setPinEditorOpen(false);
      setChatNotice(data?.pinned ? 'Duyuru sabitlendi.' : 'Sabit duyuru kaldırıldı.');
      setTimeout(() => setChatNotice(''), 3000);
    } catch {
      setChatError('Duyuru güncellenirken hata oluştu.');
    } finally {
      setPinSaving(false);
    }
  };

  const handleClearMessage = async (msg) => {
    setChatError('');
    setChatNotice('');
    if (!staffPin.trim()) {
      setStaffPinOpen(true);
      setChatError('Mesajı silmek için önce Yetkili PIN girmelisin.');
      return;
    }

    setClearingId(msg.id);
    try {
      const res = await fetch('/api/chat', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: msg.id,
          staffPin: staffPin.trim(),
          action: 'clear',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setChatError(data?.error || 'Mesaj silinemedi.');
        return;
      }
      setChatMessages((prev) => prev.filter((m) => String(m.id) !== String(msg.id)));
      setChatNotice(data?.result || 'Mesaj temizlendi.');
      setTimeout(() => setChatNotice(''), 3500);
    } catch {
      setChatError('Silme isteği sırasında bağlantı hatası oluştu.');
    } finally {
      setClearingId(null);
    }
  };

  const handleBanMessage = async (msg) => {
    setChatError('');
    setChatNotice('');
    if (!staffPin.trim()) {
      setStaffPinOpen(true);
      setChatError('Banlamak için önce Yetkili PIN girmelisin.');
      return;
    }

    setBanningId(msg.id);
    try {
      const res = await fetch('/api/chat', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: msg.id,
          staffPin: staffPin.trim(),
          action: 'ban',
          reason: 'Sohbet ihlali',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setChatError(data?.error || 'Ban işlemi başarısız.');
        return;
      }
      setChatMessages((prev) => prev.filter((m) => String(m.id) !== String(msg.id)));
      setChatNotice(data?.result || `${msg.nickname} banlandı ve mesajı silindi.`);
      setTimeout(() => setChatNotice(''), 4000);
      fetchChatMessages(chatRoomRef.current);
    } catch {
      setChatError('Ban isteği sırasında bağlantı hatası oluştu.');
    } finally {
      setBanningId(null);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    setChatError('');
    setChatNotice('');

    const isEnRoom = chatRoom === 'en';
    const hasPin = staffPin.trim().length > 0;

    if (!isTypingAdminNick && !hasPin && chatCooldown > 0) {
      setChatError(
        isEnRoom
          ? `1 message per 30 seconds. Please wait ${chatCooldown}s.`
          : `30 saniyede 1 mesaj gönderebilirsin. Lütfen ${chatCooldown} saniye bekle.`
      );
      return;
    }

    const nick = chatNick.trim();
    const msg = chatInput.trim();
    if (nick.length < 2) {
      setChatError(isEnRoom ? 'Enter a nickname (at least 2 chars).' : 'En az 2 karakterli bir isim (rumuz) yaz.');
      return;
    }
    if (!msg) return;

    setChatSending(true);
    lastOwnSendAtRef.current = Date.now();
    try {
      localStorage.setItem('gta6takip_nick', nick);
    } catch {
      // Yoksay
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nick,
          message: msg,
          room: chatRoom,
          replyToId: replyTo?.id ?? null,
          adminPin: hasPin ? staffPin.trim() : undefined,
          clientId: chatClientId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429 && data?.retryAfter) {
          startChatCooldown(data.retryAfter);
        }
        setChatError(data?.error || (isEnRoom ? 'Failed to send message.' : 'Mesaj gönderilemedi.'));
        return;
      }
      if (data?.message) {
        ownMsgIdsRef.current.add(String(data.message.id));
        forceScrollRef.current = true;
        setChatMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(data.message.id))) return prev;
          return [...prev.slice(-49), data.message];
        });
      }
      setChatInput('');
      setReplyTo(null);
      if (typeof data?.cooldownSeconds === 'number' && data.cooldownSeconds > 0) {
        startChatCooldown(data.cooldownSeconds);
      }
    } catch {
      setChatError(isEnRoom ? 'Connection error, please try again.' : 'Bağlantı hatası, tekrar dene.');
    } finally {
      setChatSending(false);
    }
  };

  const fetchSyncData = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();

      if (data?.updatedAt) {
        setLastSyncAt(data.updatedAt);
      }

      if (Array.isArray(data?.teams) && data.teams.length > 0) {
        const normalized = data.teams
          .map((item) => ({
            name: item.name || 'Unknown',
            progress: Number(item.progress) || 0,
            fps: item.fps || '—',
            gpu: item.gpu || '',
            type: item.type === 'private' ? 'private' : 'open',
            stage: item.stage || '',
            delta: item.delta || '',
            url: item.url || 'https://portwatch-vi.xyz/#race',
            updatedAt: item.updatedAt || data?.updatedAt || '',
            summaryTr: item.summaryTr || '',
            summaryEn: item.summaryEn || '',
            isZortos: Boolean(item.isZortos),
          }))
          .sort((a, b) => b.progress - a.progress);

        setTeams(normalized);
      }

      if (typeof data?.totalEfforts === 'number' && data.totalEfforts > 0) {
        setTotalEfforts(data.totalEfforts);
      }
      if (typeof data?.bootingCount === 'number' && data.bootingCount > 0) {
        setBootingCount(data.bootingCount);
      }
      if (typeof data?.top3Avg === 'number' && data.top3Avg > 0) {
        setTop3Avg(data.top3Avg);
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

  // Sekme arka plandayken gereksiz /api/sync fonksiyon çağrısını duraklat
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
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
    const localCountry = guessClientCountry();
    setCountryStats([{ code: localCountry, count: 1 }]);
    if (!supabaseClient) return undefined;

    let channel;
    let cancelled = false;

    const initPresence = async () => {
      let viewerCountry = localCountry;
      try {
        const geoRes = await fetch('/api/geo', { cache: 'no-store' });
        if (geoRes.ok) {
          const geoJson = await geoRes.json();
          if (geoJson?.country && /^[A-Z]{2}$/.test(geoJson.country)) {
            viewerCountry = geoJson.country;
          }
        }
      } catch {
        // Fallback olarak localCountry kullanılır
      }

      if (cancelled) return;

      try {
        const clientId = `v-${Math.random().toString(36).slice(2, 10)}`;
        channel = supabaseClient.channel('gta6takip-presence', {
          config: { presence: { key: clientId } },
        });
        channel
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            const entries = Object.values(state);
            const count = entries.length;
            if (count > 0) {
              setOnlineCount(count);
              const countsMap = {};
              for (const presList of entries) {
                const latest = Array.isArray(presList) ? presList[presList.length - 1] : null;
                const code = String(latest?.country || 'TR').toUpperCase();
                countsMap[code] = (countsMap[code] || 0) + 1;
              }
              const sortedStats = Object.entries(countsMap)
                .map(([code, cnt]) => ({ code, count: cnt }))
                .sort((a, b) => b.count - a.count);
              setCountryStats(sortedStats);
            }
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await channel.track({
                online_at: new Date().toISOString(),
                country: viewerCountry,
              });
            }
          });
      } catch {
        // Supabase presence hatasında varsayılan 1 korunur
      }
    };

    initPresence();

    return () => {
      cancelled = true;
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

  const leaderPct = Math.min(100, Math.max(0, Number(leader.progress) || 0));
  const remainingPct = Math.max(0, 100 - leaderPct).toFixed(1).replace(/\.0$/, '');
  const ringRadius = 26;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - leaderPct / 100);

  const rankedTeams = useMemo(
    () => teams.map((t, i) => ({ ...t, globalRank: i + 1 })),
    [teams]
  );

  const amdCount = useMemo(
    () => teams.filter((t) => String(t.gpu || '').toLowerCase().includes('amd')).length,
    [teams]
  );
  const nvidiaCount = useMemo(
    () => teams.filter((t) => String(t.gpu || '').toLowerCase().includes('nvidia')).length,
    [teams]
  );

  const filteredTeams = useMemo(() => {
    const q = teamSearch.trim().toLowerCase();
    return rankedTeams.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      const gpuLower = String(t.gpu || '').toLowerCase();
      if (gpuFilter === 'amd' && !gpuLower.includes('amd')) return false;
      if (gpuFilter === 'nvidia' && !gpuLower.includes('nvidia')) return false;
      if (q) {
        const hay = `${t.name || ''} ${t.gpu || ''} ${t.stage || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rankedTeams, typeFilter, gpuFilter, teamSearch]);

  const visibleTeams = useMemo(() => {
    if (showAllTeams || teamSearch.trim().length > 0) return filteredTeams;
    return filteredTeams.slice(0, INITIAL_TEAMS_LIMIT);
  }, [filteredTeams, showAllTeams, teamSearch]);

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

    const statusTr = `PortWatch üzerinden gelen son canlı verilere göre ${totalEfforts} girişimden ${bootingCount} proje oyunu başlatabiliyor ve ${playableCount} ekip "Oynanabilir" barajını geçmiş durumda. Zirvedeki #1 ${leader.name} (%${leader.progress}), ${localizeDynamicText(leader.fps, 'tr')} civarı akıcı görüntü alarak liderlikte. Hemen arkasında #2 ${secondTeam.name} (%${secondTeam.progress} · ${localizeDynamicText(secondTeam.fps, 'tr')}) ve #3 ${thirdTeam.name} (%${thirdTeam.progress} · ${localizeDynamicText(thirdTeam.fps, 'tr')}) takipte. Kodu herkese açık tarafta ise ${openLeader.name} (%${openLeader.progress} · ${localizeDynamicText(openLeader.fps, 'tr')}) önde. Kısacası oyun siyah ekrandan çıkıp görev oynanabilen seviyeye geldi; geriye optimizasyon ve herkesin indirebileceği kararlı bir sürüm kaldı.`;

    const statusEn = `According to live PortWatch data, ${bootingCount} out of ${totalEfforts} tracked efforts can boot GTA VI and ${playableCount} teams have crossed the "Playable" milestone. At the top, #1 ${leader.name} (${leader.progress}%) leads at ${localizeDynamicText(leader.fps, 'en')}. Right behind, #2 ${secondTeam.name} (${secondTeam.progress}% · ${localizeDynamicText(secondTeam.fps, 'en')}) and #3 ${thirdTeam.name} (${thirdTeam.progress}% · ${localizeDynamicText(thirdTeam.fps, 'en')}) are pushing ahead. On the open-source side, ${openLeader.name} (${openLeader.progress}% · ${localizeDynamicText(openLeader.fps, 'en')}) leads. In short, the game has moved past black screens into real mission gameplay—now it's about optimization and a stable public build.`;

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
      { x: 6, y: 50 - (0 / 100) * 40, label: lang === 'tr' ? '23 Kas' : 'Nov 23', val: '0%' },
      { x: 75, y: 50 - (40 / 100) * 40, label: lang === 'tr' ? '24 Kas' : 'Nov 24', val: '40%' },
      { x: 145, y: 50 - (61 / 100) * 40, label: lang === 'tr' ? '25 Kas' : 'Nov 25', val: '61%' },
      { x: 214, y: 50 - (endPct / 100) * 40, label: lang === 'tr' ? 'Bugün' : 'Today', val: `${endPct}%` },
    ];
    const line = pts.map((p) => `${p.x},${p.y.toFixed(1)}`).join(' ');
    const area = `6,52 ${line} 214,52`;
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

  const renderOnlinePopover = () =>
    onlineMenuOpen && (
      <div className={`absolute right-0 mt-1.5 w-52 rounded-xl border p-2 shadow-2xl z-50 space-y-1 ${theme.menuBg}`}>
        <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${theme.muted}`}>
          {lang === 'tr' ? 'Bağlı Ülkeler' : 'Connected Countries'}
        </div>
        {countryStats.map((c) => (
          <div
            key={c.code}
            className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold ${theme.subCard}`}
          >
            <span className="inline-flex items-center gap-2 min-w-0">
              <CountryFlag code={c.code} />
              <span className="truncate">{getCountryLabel(c.code, lang)}</span>
            </span>
            <span className={`font-black shrink-0 ${theme.accentText}`}>{c.count}</span>
          </div>
        ))}
      </div>
    );

  const isEnRoom = chatRoom === 'en';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
      <style>{`
        @keyframes feedbackNudge {
          0%, 76%, 100% { transform: translateY(0) rotate(0deg); }
          80% { transform: translateY(-7px) rotate(-2.5deg); }
          85% { transform: translateY(0) rotate(2.5deg); }
          90% { transform: translateY(-4px) rotate(-1.5deg); }
          95% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes slowPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.84); }
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        html, body, .gta-scroll {
          scrollbar-width: thin;
          scrollbar-color: ${theme.sbThumb} ${theme.sbTrack};
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar, .gta-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        html::-webkit-scrollbar-track, body::-webkit-scrollbar-track, .gta-scroll::-webkit-scrollbar-track {
          background: ${theme.sbTrack};
          border-radius: 9999px;
        }
        html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb, .gta-scroll::-webkit-scrollbar-thumb {
          background: ${theme.sbThumb};
          border-radius: 9999px;
        }
        html::-webkit-scrollbar-thumb:hover, body::-webkit-scrollbar-thumb:hover, .gta-scroll::-webkit-scrollbar-thumb:hover {
          background: ${theme.sbThumbHover};
        }
        html::-webkit-scrollbar-button, body::-webkit-scrollbar-button, .gta-scroll::-webkit-scrollbar-button {
          display: none;
        }
      `}</style>

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

            <div className="relative sm:hidden" data-dropdown-root="true">
              <button
                type="button"
                onClick={() => {
                  setThemeMenuOpen(false);
                  setOnlineMenuOpen((v) => !v);
                }}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition ${onlineBtnClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${onlineDotClass}`} />
                {onlineCount} {lang === 'tr' ? 'Çevrimiçi' : 'Online'}
                <ChevronDown className="w-3 h-3 opacity-80" />
              </button>
              {renderOnlinePopover()}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
            <div className="relative hidden sm:block" data-dropdown-root="true">
              <button
                type="button"
                onClick={() => {
                  setThemeMenuOpen(false);
                  setOnlineMenuOpen((v) => !v);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${onlineBtnClass}`}
              >
                <span className={`w-2 h-2 rounded-full animate-pulse ${onlineDotClass}`} />
                {onlineCount} {lang === 'tr' ? 'Çevrimiçi' : 'Online'}
                <ChevronDown className="w-3 h-3 opacity-80" />
              </button>
              {renderOnlinePopover()}
            </div>

            <div className={`inline-flex rounded-lg border p-0.5 ${theme.subCard}`}>
              <button
                type="button"
                onClick={() => handleSelectLang('tr')}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold transition ${
                  lang === 'tr' ? theme.btnPrimary : theme.muted
                }`}
              >
                <FlagTR />
                TR
              </button>
              <button
                type="button"
                onClick={() => handleSelectLang('en')}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold transition ${
                  lang === 'en' ? theme.btnPrimary : theme.muted
                }`}
              >
                <FlagUS />
                EN
              </button>
            </div>

            <div className="relative" data-dropdown-root="true">
              <button
                type="button"
                onClick={() => {
                  setOnlineMenuOpen(false);
                  setThemeMenuOpen((v) => !v);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${theme.subCard}`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.dot }} />
                <span>{lang === 'tr' ? 'Tema' : 'Theme'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
              {themeMenuOpen && (
                <div className={`absolute right-0 mt-1.5 w-40 rounded-xl border p-1 shadow-2xl z-50 ${theme.menuBg}`}>
                  {Object.values(THEMES).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTheme(t.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition hover:bg-black/10 ${
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

      <main className="max-w-4xl mx-auto px-3 sm:px-5 py-5 space-y-5">
        {/* ÜST ÖZET KARTI */}
        <section className={`rounded-2xl border p-4 sm:p-6 ${theme.card}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-3.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold tracking-wider ${theme.accentText}`}>
                  {lang === 'tr' ? 'GENEL İLERLEME' : 'OVERALL PROGRESS'}
                </span>
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${theme.softChip}`}>
                  {totalEfforts} {lang === 'tr' ? 'Girişim' : 'Tracked'} · {bootingCount} Boot
                </span>
              </div>

              {/* Yüzde + %100 İlerleme Dairesi + İstatistik Rozeti */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90" aria-label={`%${leaderPct}`}>
                    <circle
                      cx="32"
                      cy="32"
                      r={ringRadius}
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity="0.14"
                      strokeWidth="5.5"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={ringRadius}
                      fill="none"
                      stroke={theme.sparkStroke}
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black tabular-nums opacity-85">
                    /100
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums">
                      {lang === 'tr' ? `%${leader.progress}` : `${leader.progress}%`}
                    </span>
                    <span className={`text-xs font-semibold ${theme.muted}`}>
                      {lang === 'tr'
                        ? `%100'e ${remainingPct} puan kaldı`
                        : `${remainingPct}% left to 100%`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${theme.softChip}`}>
                      <BarChart3 className={`w-3.5 h-3.5 shrink-0 ${theme.accentText}`} />
                      <span>
                        {lang === 'tr' ? `İlk 3 Ort. %${top3Avg}` : `Top-3 Avg ${top3Avg}%`}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs ${theme.subCard}`}>
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

                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs ${theme.subCard}`}>
                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0 drop-shadow-[0_0_6px_rgba(251,191,36,0.75)]" />
                  <span className={theme.muted}>
                    {lang === 'tr' ? 'Zirve Lider:' : 'Top Leader:'}
                  </span>
                  <span className={leaderGlowClass}>{fastestTeam.name}</span>
                  <span className={isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'}>
                    {lang === 'tr' ? `%${fastestTeam.progress}` : `${fastestTeam.progress}%`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleJumpToChat}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition hover:scale-[1.02] ${onlineBtnClass}`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'tr' ? 'Canlı Sohbet' : 'Live Chat'}</span>
                  <span className="inline-flex items-center gap-1 opacity-90">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${onlineDotClass}`} />
                    {onlineCount} {lang === 'tr' ? 'Aktif' : 'Active'}
                  </span>
                </button>
              </div>
            </div>

            <div className={`rounded-xl border p-3.5 md:w-60 shrink-0 ${theme.subCard}`}>
              <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
                <span className={`inline-flex items-center gap-1 ${theme.muted}`}>
                  <TrendingUp className={`w-3.5 h-3.5 ${theme.accentText}`} />
                  {lang === 'tr' ? 'Günlük Yükseliş' : 'Daily Trend'}
                </span>
                <span className={theme.accentText}>0% → {leader.progress}%</span>
              </div>
              <div className="relative w-full h-12">
                <svg
                  viewBox="0 0 220 56"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                  aria-label="Progress Sparkline"
                >
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
                    vectorEffect="non-scaling-stroke"
                    points={sparkPoints.line}
                  />
                </svg>
                {sparkPoints.pts.map((p, idx) => (
                  <span
                    key={p.label}
                    className={`pointer-events-none absolute rounded-full -translate-x-1/2 -translate-y-1/2 ${
                      idx === sparkPoints.pts.length - 1 ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5'
                    }`}
                    style={{
                      left: `${(p.x / 220) * 100}%`,
                      top: `${(p.y / 56) * 100}%`,
                      backgroundColor: theme.sparkStroke,
                    }}
                  />
                ))}
              </div>
              <div className={`flex justify-between text-[10px] mt-1 ${theme.muted}`}>
                <span>{sparkPoints.pts[0].label}</span>
                <span>{sparkPoints.pts[1].label}</span>
                <span>{sparkPoints.pts[2].label}</span>
                <span className={`font-bold ${theme.accentText}`}>{sparkPoints.pts[3].label}</span>
              </div>
            </div>
          </div>
        </section>

        {/* SON GELİŞMELER — MOBİLDE YATAY KAYDIRILABİLİR (SWIPE), MASAÜSTÜNDE 3 SÜTUN */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold tracking-wider opacity-80">
              {lang === 'tr' ? 'SON GELİŞMELER' : 'LATEST UPDATES'}
            </h2>
            <span className={`md:hidden text-[11px] font-semibold ${theme.muted}`}>
              {lang === 'tr' ? 'Kaydır →' : 'Swipe →'}
            </span>
          </div>
          <div className="flex md:grid md:grid-cols-3 gap-2.5 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar -mx-3 px-3 md:mx-0 md:px-0 pb-1 md:pb-0">
            {news.slice(0, 3).map((item, idx) => {
              const badgeLabel = lang === 'tr' ? item.tagTr || 'GÜNCEL' : item.tagEn || 'LIVE';
              const rawMsg =
                lang === 'tr'
                  ? String(item.tr || item.text || '').replace(/(\d+)'si oyunu başlatabiliyor/g, '$1 proje oyunu başlatabiliyor')
                  : localizeDynamicText(item.en || item.tr || item.text, 'en');
              return (
                <div
                  key={idx}
                  className={`shrink-0 w-[84%] sm:w-[68%] md:w-auto snap-start rounded-xl border p-3 text-xs leading-relaxed ${theme.card}`}
                >
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-black text-[10px] mb-1.5 border ${getNewsBadgeStyle(
                      badgeLabel,
                      isLight
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
            <span className={`px-2 py-0.5 rounded-md font-medium ${theme.softChip}`}>RX 9070 XT: 22 FPS</span>
            <span className={`px-2 py-0.5 rounded-md font-medium ${theme.softChip}`}>
              {lang === 'tr' ? 'RTX 50 Serisi: 15-24 FPS' : 'RTX 50 Series: 15-24 FPS'}
            </span>
            <span className={`px-2 py-0.5 rounded-md font-medium ${theme.softChip}`}>RX 7900 XTX: 16 FPS</span>
            <span className={`px-2 py-0.5 rounded-md font-medium ${theme.softChip}`}>RTX 4070: 3-10 FPS</span>
            <span className={`px-2 py-0.5 rounded-md font-medium ${theme.softChip}`}>RTX 5060 Ti: 4 FPS</span>
          </div>
        </section>

        {/* AKTİF EKİPLER — MOBİLDE SIKI TEK ŞERİT FİLTRE, MASAÜSTÜNDE 2 SATIR */}
        <section className="space-y-3">
          <div className="space-y-2">
            {/* Satır 1: Başlık + (Mobilde Görünüm İkonu) + Arama Kutusu */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold tracking-wider opacity-85 whitespace-nowrap">
                  {lang === 'tr'
                    ? `AKTİF EKİPLER (${filteredTeams.length})`
                    : `ACTIVE EFFORTS (${filteredTeams.length})`}
                </h2>

                {/* Mobilde Başlık Yanında Kompakt Görünüm Geçişi */}
                <div className={`inline-flex sm:hidden rounded-lg border p-0.5 text-[11px] font-semibold ${theme.subCard}`}>
                  <button
                    type="button"
                    onClick={() => setCompactView(false)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition ${
                      !compactView ? theme.btnPrimary : theme.muted
                    }`}
                    aria-label={lang === 'tr' ? 'Detaylı Kart Görünümü' : 'Detailed Card View'}
                    title={lang === 'tr' ? 'Detaylı' : 'Cards'}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompactView(true)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition ${
                      compactView ? theme.btnPrimary : theme.muted
                    }`}
                    aria-label={lang === 'tr' ? 'Kompakt Liste Görünümü' : 'Compact List View'}
                    title={lang === 'tr' ? 'Kompakt' : 'Compact'}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs w-full sm:w-60 ${theme.subCard}`}>
                <Search className="w-3.5 h-3.5 opacity-65 shrink-0" />
                <input
                  type="text"
                  value={teamSearch}
                  onChange={(e) => {
                    setTeamSearch(e.target.value);
                  }}
                  placeholder={lang === 'tr' ? 'Ekip veya GPU ara...' : 'Search team or GPU...'}
                  className="w-full bg-transparent outline-none text-xs placeholder:opacity-60"
                />
                {teamSearch && (
                  <button
                    type="button"
                    onClick={() => setTeamSearch('')}
                    aria-label="Aramayı temizle"
                    className="opacity-70 hover:opacity-100 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Satır 2: Mobilde Tek Satır Kaydırılabilir Filtre Şeridi + Masaüstünde Görünüm Geçişi */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 py-0.5 sm:py-0 w-full sm:w-auto">
                <div className={`inline-flex shrink-0 rounded-lg border p-0.5 text-[11px] font-bold ${theme.subCard}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setGpuFilter('all');
                      setShowAllTeams(false);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md whitespace-nowrap transition ${
                      gpuFilter === 'all' ? theme.btnPrimary : theme.muted
                    }`}
                  >
                    <Cpu className="w-3 h-3 shrink-0" />
                    <span>{lang === 'tr' ? 'TÜMÜ' : 'ALL'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGpuFilter('amd');
                      setShowAllTeams(false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md whitespace-nowrap transition ${
                      gpuFilter === 'amd'
                        ? 'bg-[#ED1C24] text-white shadow-sm'
                        : isLight
                          ? 'text-[#c8102e] hover:bg-red-500/10'
                          : 'text-[#ff5c5c] hover:bg-red-500/10'
                    }`}
                  >
                    <IconAmd className="w-3 h-3" />
                    <span>AMD ({amdCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGpuFilter('nvidia');
                      setShowAllTeams(false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md whitespace-nowrap transition ${
                      gpuFilter === 'nvidia'
                        ? 'bg-[#76B900] text-zinc-950 shadow-sm'
                        : isLight
                          ? 'text-[#598c00] hover:bg-[#76B900]/10'
                          : 'text-[#8ce000] hover:bg-[#76B900]/15'
                    }`}
                  >
                    <IconNvidia className="w-3.5 h-3.5" />
                    <span>NVIDIA ({nvidiaCount})</span>
                  </button>
                </div>

                <div className={`inline-flex shrink-0 rounded-lg border p-0.5 text-[11px] font-semibold ${theme.subCard}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter('all');
                      setShowAllTeams(false);
                    }}
                    className={`px-2.5 py-1 rounded-md whitespace-nowrap transition ${
                      typeFilter === 'all' ? theme.btnPrimary : theme.muted
                    }`}
                  >
                    {lang === 'tr' ? `Tümü (${teams.length})` : `All (${teams.length})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter('open');
                      setShowAllTeams(false);
                    }}
                    className={`px-2.5 py-1 rounded-md whitespace-nowrap transition ${
                      typeFilter === 'open' ? theme.btnPrimary : theme.muted
                    }`}
                  >
                    {lang === 'tr' ? `Açık Kaynak (${openCount})` : `Open (${openCount})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter('private');
                      setShowAllTeams(false);
                    }}
                    className={`px-2.5 py-1 rounded-md whitespace-nowrap transition ${
                      typeFilter === 'private' ? theme.btnPrimary : theme.muted
                    }`}
                  >
                    {lang === 'tr' ? `Kapalı (${privateCount})` : `Private (${privateCount})`}
                  </button>
                </div>
              </div>

              <div className={`hidden sm:inline-flex shrink-0 rounded-lg border p-0.5 text-[11px] font-semibold ${theme.subCard}`}>
                <button
                  type="button"
                  onClick={() => setCompactView(false)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition ${
                    !compactView ? theme.btnPrimary : theme.muted
                  }`}
                  title={lang === 'tr' ? 'Detaylı Kart Görünümü' : 'Detailed Card View'}
                >
                  <LayoutGrid className="w-3 h-3" />
                  <span>{lang === 'tr' ? 'Detaylı' : 'Cards'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompactView(true)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition ${
                    compactView ? theme.btnPrimary : theme.muted
                  }`}
                  title={lang === 'tr' ? 'Kompakt Liste Görünümü' : 'Compact List View'}
                >
                  <List className="w-3 h-3" />
                  <span>{lang === 'tr' ? 'Kompakt' : 'Compact'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className={compactView ? 'space-y-1.5' : 'space-y-3'}>
            {visibleTeams.map((team) => {
              const rank = team.globalRank;
              const isHot = rank === 1;
              const barWidth = Math.min(100, Math.max(2, team.progress));
              const updatedText = formatTeamUpdated(team.updatedAt || lastSyncAt, lang);
              const leaderSummary = rank === 1 ? buildLeaderSummary(team, lang) : '';

              if (compactView) {
                return (
                  <article
                    key={team.name}
                    className={`rounded-xl border px-3 py-2.5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${theme.card} ${
                      rank === 1 ? 'ring-1 ring-orange-500/40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-black shrink-0 ${
                          rank === 1 ? theme.btnPrimary : theme.softChip
                        }`}
                      >
                        #{rank}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_6px_rgba(239,68,68,0.75)]"
                        style={{ animation: 'slowPulse 2.6s ease-in-out infinite' }}
                        title={lang === 'tr' ? 'Canlı takip' : 'Live tracked'}
                      />
                      <h3 className="text-sm font-extrabold tracking-tight truncate">{team.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${theme.softChip}`}>
                        <Monitor className="w-2.5 h-2.5 opacity-80 shrink-0" />
                        <span>{localizeDynamicText(team.fps, lang)}</span>
                      </span>
                      {team.gpu && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${theme.softChip}`}>
                          <GpuBadgeIcons gpu={team.gpu} isLight={isLight} />
                          <span>{localizeDynamicText(team.gpu, lang)}</span>
                        </span>
                      )}
                      <span className={`text-[10px] ${theme.muted}`}>
                        {team.type === 'private'
                          ? lang === 'tr'
                            ? 'Kapalı'
                            : 'Private'
                          : lang === 'tr'
                            ? 'Açık'
                            : 'Open'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto sm:shrink-0">
                      <div className="flex-1 sm:flex-none sm:w-28 h-2 rounded-full bg-zinc-700/35 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className={`text-sm font-black shrink-0 w-12 sm:w-14 text-right tabular-nums ${theme.accentText}`}>
                        {lang === 'tr' ? `%${team.progress}` : `${team.progress}%`}
                      </span>
                      <a
                        href={team.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold shrink-0 transition hover:opacity-80 ${theme.subCard}`}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={team.name}
                  className={`rounded-2xl border p-3.5 sm:p-4 transition ${theme.card} ${
                    rank === 1 ? 'ring-1 ring-orange-500/40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black shrink-0 ${
                          rank === 1 ? theme.btnPrimary : theme.softChip
                        }`}
                      >
                        #{rank}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                        style={{ animation: 'slowPulse 2.6s ease-in-out infinite' }}
                        title={lang === 'tr' ? 'Canlı takip' : 'Live tracked'}
                      />
                      <h3 className="text-base sm:text-lg font-extrabold tracking-tight truncate">
                        {team.name}
                      </h3>

                      {isHot && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider shrink-0 bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 text-zinc-950 shadow-[0_0_16px_rgba(249,115,22,0.75)] animate-pulse">
                          <Flame className="w-3 h-3 fill-current" />
                          HOT
                        </span>
                      )}

                      <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${theme.softChip}`}>
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
                        <span className={`hidden sm:inline text-[11px] font-bold shrink-0 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                          ▲ {team.delta}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <span className={`text-base sm:text-xl font-black tabular-nums ${theme.accentText}`}>
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

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mt-2 text-xs">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold ${theme.softChip}`}>
                      <Monitor className={`w-3.5 h-3.5 shrink-0 ${theme.accentText}`} />
                      <span>{localizeDynamicText(team.fps, lang)}</span>
                    </span>
                    {team.gpu && (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold ${theme.softChip}`}>
                        <GpuBadgeIcons gpu={team.gpu} isLight={isLight} />
                        <span>{localizeDynamicText(team.gpu, lang)}</span>
                      </span>
                    )}
                    <span className={`inline-flex sm:hidden items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${theme.softChip}`}>
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
                      <span className={`sm:hidden text-[11px] font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                        ▲ {team.delta}
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
                    <div className={`mt-3 rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed flex items-start gap-2 ${theme.subCard}`}>
                      <Info className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${theme.accentText}`} />
                      <p className={theme.muted}>
                        <strong className={theme.accentText}>
                          {lang === 'tr' ? 'Aşama Özeti: ' : 'Stage Summary: '}
                        </strong>
                        {leaderSummary}
                      </p>
                    </div>
                  )}

                  {updatedText && (
                    <div
                      className={`mt-2.5 pt-2 border-t flex items-center gap-1.5 text-[11px] ${
                        isLight ? 'border-zinc-200/80' : 'border-white/10'
                      } ${theme.muted}`}
                    >
                      <Clock className="w-3 h-3 opacity-75 shrink-0" />
                      <span>
                        {lang === 'tr' ? 'Son Güncelleme:' : 'Last Updated:'}{' '}
                        <strong className="opacity-90">{updatedText}</strong>
                      </span>
                    </div>
                  )}
                </article>
              );
            })}

            {filteredTeams.length === 0 && (
              <div className={`rounded-2xl border p-6 text-center text-xs ${theme.card} ${theme.muted}`}>
                {lang === 'tr' ? 'Aramana uyan ekip bulunamadı.' : 'No teams match your search.'}
              </div>
            )}
          </div>

          {filteredTeams.length > INITIAL_TEAMS_LIMIT && teamSearch.trim().length === 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAllTeams((v) => !v)}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition hover:brightness-110 ${theme.card} ${theme.accentText}`}
              >
                {showAllTeams ? (
                  <>
                    <span>{lang === 'tr' ? 'İlk 5 Ekibi Göster' : 'Show Top 5 Only'}</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>
                      {lang === 'tr'
                        ? `Tüm Ekipleri Göster (${filteredTeams.length - INITIAL_TEAMS_LIMIT} ekip daha)`
                        : `Show All Teams (${filteredTeams.length - INITIAL_TEAMS_LIMIT} more)`}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* MODERN CANLI SOHBET KUTUSU */}
        <section ref={chatSectionRef} id="canli-sohbet" className={`rounded-2xl border overflow-hidden shadow-xl ${theme.card}`}>
          {chatOpen && <div className={`h-0.5 w-full bg-gradient-to-r ${theme.accentGradient}`} />}

          <button
            type="button"
            onClick={() => {
              const next = !chatOpen;
              if (next) {
                forceScrollRef.current = true;
                setUnreadWhileClosed(0);
              }
              setChatOpen(next);
              if (next) fetchChatMessages(chatRoomRef.current);
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between gap-2 text-left hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl border shadow-sm ${theme.subCard}`}>
                <MessageCircle className={`w-4 h-4 ${theme.accentText}`} />
              </span>
              <span className="text-xs sm:text-sm font-black tracking-wider">
                {lang === 'tr' ? 'CANLI SOHBET' : 'LIVE CHAT'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${onlineBtnClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${onlineDotClass}`} />
                {onlineCount} {lang === 'tr' ? 'Aktif' : 'Active'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${theme.softChip}`}>
                {chatMessages.length} {isEnRoom ? 'Messages · 30s Limit' : 'Mesaj · 30sn Korumalı'}
              </span>
              {!chatOpen && unreadWhileClosed > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white animate-pulse shadow-sm">
                  +{unreadWhileClosed} {lang === 'tr' ? 'yeni' : 'new'}
                </span>
              )}
            </div>
            <span className={`p-1.5 rounded-xl border ${theme.subCard}`}>
              {chatOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
            </span>
          </button>

          {chatOpen && (
            <div className={`px-3.5 sm:px-4 pb-4 pt-3.5 border-t space-y-3 ${theme.subCard}`}>
              {/* Üst Kontrol Çubuğu: Oda Sekmeleri + Yetkili Kilidi + Bildirim Sesi */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className={`inline-flex rounded-xl border p-1 gap-1 ${theme.card}`}>
                  <button
                    type="button"
                    onClick={() => handleSwitchChatRoom('tr')}
                    className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      chatRoom === 'tr' ? `${theme.btnPrimary} shadow-sm` : `${theme.muted} hover:bg-white/5`
                    }`}
                  >
                    <FlagTR className="w-4 h-3 rounded-[2px] shrink-0 shadow-sm" />
                    <span>TR (Turkish)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchChatRoom('en')}
                    className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      chatRoom === 'en' ? `${theme.btnPrimary} shadow-sm` : `${theme.muted} hover:bg-white/5`
                    }`}
                  >
                    <FlagUS className="w-4 h-3 rounded-[2px] shrink-0 shadow-sm" />
                    <span>EN (Global English)</span>
                  </button>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
                  {chatCooldown > 0 && !isTypingAdminNick && !staffModeActive && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${theme.card} ${theme.accentText}`}>
                      <Clock className="w-3 h-3" />
                      {isEnRoom ? `${chatCooldown}s` : `${chatCooldown} sn`}
                    </span>
                  )}

                  {staffModeActive && (
                    <button
                      type="button"
                      onClick={() => {
                        setPinDraft(pinnedNotice?.message || '');
                        setPinEditorOpen((v) => !v);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition ${
                        pinEditorOpen
                          ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                          : `${theme.card} ${theme.muted} hover:opacity-100 opacity-85`
                      }`}
                      title="Duyuru sabitle veya kaldır"
                    >
                      <Pin className="w-3 h-3" />
                      <span>Duyuru</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setStaffPinOpen((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition ${
                      staffModeActive
                        ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                        : `${theme.card} ${theme.muted} hover:opacity-100 opacity-80`
                    }`}
                    title={lang === 'tr' ? 'Yetkili / Moderatör Girişi' : 'Staff / Moderator PIN'}
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>{staffModeActive ? 'Yetkili Açık' : 'Yetkili'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleChatSound}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition hover:opacity-90 ${
                      chatSoundOn ? theme.pill : `${theme.card} ${theme.muted} opacity-75`
                    }`}
                    title={
                      chatSoundOn
                        ? isEnRoom
                          ? 'Mute chat notification sound'
                          : 'Bildirim sesini kapat'
                        : isEnRoom
                          ? 'Unmute chat notification sound'
                          : 'Bildirim sesini aç'
                    }
                  >
                    {chatSoundOn ? (
                      <>
                        <Volume2 className={`w-3.5 h-3.5 ${theme.accentText}`} />
                        <span>{isEnRoom ? 'Sound On' : 'Ses Açık'}</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>{isEnRoom ? 'Muted' : 'Sessiz'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {(staffPinOpen || isTypingAdminNick) && (
                <div className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-amber-400/40 text-xs ${theme.card}`}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <input
                      type="password"
                      value={staffPin}
                      onChange={(e) => setStaffPin(e.target.value)}
                      placeholder={
                        isTypingAdminNick
                          ? 'Admin PIN girin...'
                          : 'Moderatör veya Admin PIN girin (Temizle & Ban yetkisi açılır)...'
                      }
                      className="w-full bg-transparent outline-none font-semibold text-xs min-w-0 placeholder:font-normal placeholder:opacity-65"
                    />
                  </div>
                  {staffPin && (
                    <button
                      type="button"
                      onClick={() => setStaffPin('')}
                      className="text-[11px] font-bold opacity-75 hover:opacity-100 shrink-0"
                    >
                      Temizle
                    </button>
                  )}
                </div>
              )}

              {staffModeActive && pinEditorOpen && (
                <form onSubmit={handleSavePin} className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-sky-400/40 text-xs ${theme.card}`}>
                  <Pin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <input
                    type="text"
                    maxLength={180}
                    value={pinDraft}
                    onChange={(e) => setPinDraft(e.target.value)}
                    placeholder="Sabitlenecek duyuruyu yaz (kaldırmak için boş bırakıp Kaydet'e bas)..."
                    className="flex-1 bg-transparent outline-none text-xs min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={pinSaving}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold shrink-0 ${theme.btnPrimary}`}
                  >
                    {pinSaving ? '...' : 'Kaydet'}
                  </button>
                </form>
              )}

              {/* Sabitlenmiş Duyuru Şeridi */}
              {pinnedNotice?.message && (
                <div
                  className={`flex items-start gap-2 px-3 py-2 rounded-xl border text-xs ${
                    isLight
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-amber-500/10 border-amber-400/40 text-amber-100'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5 mt-0.5 text-amber-400 shrink-0" />
                  <div className="min-w-0 flex-1 leading-relaxed">
                    <span className="font-black text-[10px] uppercase tracking-wider text-amber-400 mr-1.5">
                      {isEnRoom ? 'PINNED:' : 'SABİT DUYURU:'}
                    </span>
                    <span className="font-medium break-words">{pinnedNotice.message}</span>
                  </div>
                </div>
              )}

              <div className={`flex items-center gap-1.5 text-[11px] ${theme.muted}`}>
                <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${theme.accentText} opacity-80`} />
                <span>
                  {isEnRoom
                    ? 'Global English room · Profanity & link filter active · Click a name to @mention'
                    : 'Türkçe sohbet odası · Küfür ve link engeli aktif · İsime tıklayarak @etiketle'}
                </span>
              </div>

              {/* Mesaj Akışı */}
              <div className="relative">
                <div
                  ref={chatListRef}
                  onScroll={handleChatListScroll}
                  className={`gta-scroll rounded-2xl border p-3 max-h-80 overflow-y-auto space-y-2.5 ${theme.card}`}
                >
                  {chatLoading && chatMessages.length === 0 ? (
                    <p className={`text-xs text-center py-8 ${theme.muted}`}>
                      {isEnRoom ? 'Loading messages...' : 'Mesajlar yükleniyor...'}
                    </p>
                  ) : chatMessages.length === 0 ? (
                    <p className={`text-xs text-center py-8 ${theme.muted}`}>
                      {isEnRoom
                        ? 'No messages in Global English room yet. Be the first to say hi!'
                        : 'Henüz mesaj yok. İlk mesajı sen yaz!'}
                    </p>
                  ) : (
                    chatMessages.map((m) => {
                      const isAdminMsg =
                        String(m.nickname || '').trim().toLowerCase() === 'batmancodex' || m.role === 'admin';
                      const isModMsg = !isAdminMsg && m.role === 'mod';
                      const nickStyle = getNickStyle(m.nickname, isLight);
                      const initial = String(m.nickname || '?').trim().charAt(0).toUpperCase() || '?';
                      const isSelf =
                        chatNick.trim().length >= 2 &&
                        String(m.nickname || '').trim().toLowerCase() === chatNick.trim().toLowerCase();
                      const reactionsObj = m.reactions && typeof m.reactions === 'object' ? m.reactions : {};

                      return (
                        <div
                          key={m.id}
                          className={`rounded-2xl border px-3.5 py-2.5 text-xs transition ${theme.subCard} ${
                            isAdminMsg
                              ? isLight
                                ? 'ring-1 ring-amber-400/70 bg-amber-50/70'
                                : 'ring-1 ring-amber-400/45 shadow-[0_0_16px_rgba(251,191,36,0.12)]'
                              : isModMsg
                                ? isLight
                                  ? 'ring-1 ring-sky-400/70 bg-sky-50/70'
                                  : 'ring-1 ring-sky-400/40 shadow-[0_0_14px_rgba(56,189,248,0.12)]'
                                : isSelf
                                  ? isLight
                                    ? 'ring-1 ring-orange-400/50'
                                    : 'ring-1 ring-white/15'
                                  : 'hover:border-white/20'
                          }`}
                        >
                          {(m.reply_to_nick || m.reply_to_text) && (
                            <div
                              className={`mb-2 px-2.5 py-1.5 rounded-xl border-l-2 text-[11px] flex items-start gap-1.5 ${
                                isLight
                                  ? 'bg-zinc-200/75 border-orange-500 text-zinc-700'
                                  : 'bg-black/30 border-current/70 opacity-90'
                              }`}
                            >
                              <Reply className={`w-3 h-3 mt-0.5 shrink-0 ${theme.accentText}`} />
                              <div className="min-w-0 truncate">
                                <span className={`font-bold ${theme.accentText}`}>
                                  @{m.reply_to_nick || (isEnRoom ? 'User' : 'Kullanıcı')}
                                </span>
                                <span className="mx-1 opacity-50">·</span>
                                <span className="opacity-80">{m.reply_to_text}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                              {isAdminMsg ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleMentionUser(e, m.nickname)}
                                  className="cursor-pointer inline-flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full border text-[11px] font-black shadow-sm bg-gradient-to-r from-amber-500/25 via-pink-500/20 to-amber-400/25 border-amber-400/60 text-amber-200 hover:brightness-110 transition"
                                  title={isEnRoom ? 'Click to @mention' : 'Etiketlemek için tıkla'}
                                >
                                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-950 shrink-0">
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                  </span>
                                  <span className={isLight ? 'text-amber-950' : 'text-amber-100'}>
                                    {m.nickname}
                                  </span>
                                  <BadgeCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                  <span className="px-1.5 py-[1px] rounded-full text-[9px] font-black tracking-wider bg-amber-400 text-zinc-950">
                                    ADMIN
                                  </span>
                                </button>
                              ) : isModMsg ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleMentionUser(e, m.nickname)}
                                  className={`cursor-pointer inline-flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full border text-[11px] font-black shadow-sm hover:brightness-110 transition ${
                                    isLight
                                      ? 'bg-sky-100 border-sky-400 text-sky-950'
                                      : 'bg-gradient-to-r from-sky-500/25 via-cyan-500/20 to-emerald-500/20 border-sky-400/60 text-sky-100'
                                  }`}
                                  title={isEnRoom ? 'Click to @mention' : 'Etiketlemek için tıkla'}
                                >
                                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-zinc-950 shrink-0">
                                    <Shield className="w-2.5 h-2.5 fill-current" />
                                  </span>
                                  <span>{m.nickname}</span>
                                  <span className="px-1.5 py-[1px] rounded-full text-[9px] font-black tracking-wider bg-sky-400 text-zinc-950">
                                    {isEnRoom ? 'MOD' : 'MODERATÖR'}
                                  </span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => handleMentionUser(e, m.nickname)}
                                  className={`cursor-pointer inline-flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full border text-[11px] font-extrabold max-w-full hover:brightness-110 transition ${nickStyle.pill}`}
                                  title={isEnRoom ? 'Click to @mention' : 'Etiketlemek için tıkla'}
                                >
                                  <span
                                    className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black shrink-0 shadow-inner ${nickStyle.avatar}`}
                                  >
                                    {initial}
                                  </span>
                                  <span className="truncate">{m.nickname}</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                              <span className={`text-[10px] font-medium tabular-nums ${theme.muted}`}>
                                {formatChatTime(m.created_at)} {isEnRoom ? 'TRT' : 'TSİ'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleStartReply(m)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition opacity-80 hover:opacity-100 ${theme.softChip}`}
                                title={isEnRoom ? 'Reply to this message' : 'Bu mesajı yanıtla'}
                              >
                                <Reply className="w-2.5 h-2.5" />
                                <span>{isEnRoom ? 'Reply' : 'Yanıtla'}</span>
                              </button>

                              {staffModeActive && !isAdminMsg && (
                                <>
                                  <button
                                    type="button"
                                    disabled={clearingId === m.id || banningId === m.id}
                                    onClick={() => handleClearMessage(m)}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold transition disabled:opacity-50 ${
                                      isLight
                                        ? 'border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200'
                                        : 'border-amber-400/50 bg-amber-500/20 text-amber-200 hover:bg-amber-500/35'
                                    }`}
                                    title={
                                      isEnRoom
                                        ? 'Delete this message only'
                                        : 'Kullanıcıyı banlamadan sadece bu mesajı sil'
                                    }
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                    <span>{clearingId === m.id ? '...' : isEnRoom ? 'Clear' : 'Temizle'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={banningId === m.id || clearingId === m.id}
                                    onClick={() => handleBanMessage(m)}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold transition disabled:opacity-50 ${
                                      isLight
                                        ? 'border-red-400 bg-red-100 text-red-900 hover:bg-red-200'
                                        : 'border-red-500/50 bg-red-500/20 text-red-300 hover:bg-red-500/35'
                                    }`}
                                    title={
                                      isEnRoom
                                        ? 'Permanently ban user and delete messages'
                                        : 'Kullanıcıyı kalıcı banla ve mesajlarını sil'
                                    }
                                  >
                                    <Ban className="w-2.5 h-2.5" />
                                    <span>{banningId === m.id ? '...' : isEnRoom ? 'Ban' : 'Banla'}</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <p className="leading-relaxed break-words pl-1 text-[12.5px]">{m.message}</p>

                          {/* Mini Emoji Tepkileri */}
                          <div className="mt-1.5 pl-1 flex items-center gap-1 flex-wrap">
                            {CHAT_REACTION_EMOJIS.map((emoji) => {
                              const cnt = Number(reactionsObj[emoji]) || 0;
                              const reacted = Boolean(myReactions[`${m.id}:${emoji}`]);
                              return (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => handleToggleReaction(m, emoji)}
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                                    reacted
                                      ? `${theme.btnPrimary} shadow-sm`
                                      : cnt > 0
                                        ? `${theme.softChip} opacity-95 hover:opacity-100`
                                        : `${theme.softChip} opacity-45 hover:opacity-90`
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  {cnt > 0 && <span className="tabular-nums">{cnt}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {unreadWhileScrolled > 0 && (
                  <button
                    type="button"
                    onClick={handleScrollChatBottom}
                    className={`absolute bottom-3 right-4 z-10 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-black shadow-lg transition hover:scale-105 ${theme.btnPrimary}`}
                  >
                    <ArrowDown className="w-3 h-3" />
                    <span>
                      {unreadWhileScrolled} {isEnRoom ? 'New Messages' : 'Yeni Mesaj'}
                    </span>
                  </button>
                )}
              </div>

              {replyTo && (
                <div
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-l-2 text-xs ${theme.card}`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <Reply className={`w-3.5 h-3.5 shrink-0 ${theme.accentText}`} />
                    <span className={`font-bold shrink-0 ${theme.accentText}`}>
                      {isEnRoom
                        ? `Replying to @${replyTo.nickname}:`
                        : `@${replyTo.nickname} yanıtlanıyor:`}
                    </span>
                    <span className={`truncate ${theme.muted}`}>{replyTo.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className={`p-1 rounded-full border shrink-0 transition hover:opacity-80 ${theme.subCard}`}
                    aria-label={isEnRoom ? 'Cancel reply' : 'Yanıtı iptal et'}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Modern Giriş Barı */}
              <form onSubmit={handleSendChat} className="space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div
                    className={`sm:w-44 flex items-center gap-2 rounded-2xl border px-3 py-2 transition focus-within:ring-2 focus-within:ring-pink-500/35 ${theme.card}`}
                  >
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 border ${theme.pill}`}>
                      {isTypingAdminNick ? <ShieldCheck className="w-3 h-3 text-amber-400" /> : <User className="w-3 h-3" />}
                    </span>
                    <input
                      type="text"
                      maxLength={20}
                      value={chatNick}
                      onChange={(e) => handleNickChange(e.target.value)}
                      placeholder={isEnRoom ? 'Nickname...' : 'İsmin...'}
                      className="w-full bg-transparent outline-none font-bold text-xs min-w-0 placeholder:font-normal placeholder:opacity-60"
                    />
                  </div>

                  <div
                    className={`flex-1 flex items-center gap-1.5 rounded-2xl border p-1.5 pl-3 transition focus-within:ring-2 focus-within:ring-pink-500/35 ${theme.card}`}
                  >
                    <input
                      ref={chatInputRef}
                      type="text"
                      maxLength={280}
                      disabled={(!isTypingAdminNick && !staffModeActive && chatCooldown > 0) || chatSending}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={
                        !isTypingAdminNick && !staffModeActive && chatCooldown > 0
                          ? isEnRoom
                            ? `Wait ${chatCooldown}s before sending again...`
                            : `Yeni mesaj için ${chatCooldown} saniye bekle...`
                          : isEnRoom
                            ? 'Write a message (no links)...'
                            : 'Mesajını yaz (link ve küfür yasak)...'
                      }
                      className="flex-1 bg-transparent outline-none text-xs min-w-0 disabled:opacity-60 placeholder:opacity-60"
                    />

                    {chatInput.length > 0 && (isTypingAdminNick || staffModeActive || chatCooldown === 0) && (
                      <span className={`hidden sm:inline text-[10px] font-mono pr-1 ${theme.muted}`}>
                        {chatInput.length}/280
                      </span>
                    )}

                    <button
                      type="submit"
                      disabled={chatSending || (!isTypingAdminNick && !staffModeActive && chatCooldown > 0)}
                      className={`px-3.5 py-2 rounded-xl font-bold inline-flex items-center gap-1.5 shrink-0 shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed ${theme.btnPrimary}`}
                    >
                      {!isTypingAdminNick && !staffModeActive && chatCooldown > 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span className="tabular-nums">{chatCooldown}s</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>
                            {chatSending
                              ? isEnRoom
                                ? 'Sending'
                                : 'Gönderiliyor'
                              : isEnRoom
                                ? 'Send'
                                : 'Gönder'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {!isTypingAdminNick && !staffModeActive && chatCooldown > 0 && (
                  <div className="space-y-1 pt-0.5 px-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className={theme.accentText}>
                        {isEnRoom
                          ? `${chatCooldown} seconds left until your next message`
                          : `Yeni mesaj atabilmek için ${chatCooldown} saniye kaldı`}
                      </span>
                      <span className={`tabular-nums ${theme.muted}`}>
                        {chatCooldown}s / {CHAT_COOLDOWN_SEC}s
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-700/40 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient} transition-all duration-1000 ease-linear`}
                        style={{ width: `${(chatCooldown / CHAT_COOLDOWN_SEC) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {chatNotice && (
                  <p className="text-emerald-400 font-semibold text-[11px] px-1">{chatNotice}</p>
                )}

                {chatError && (
                  <p className="text-red-500 font-semibold text-[11px] px-1">{chatError}</p>
                )}
              </form>
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
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${faqLiveBadgeClass}`}>
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
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">
                {lang === 'tr' ? 'DMCA & Güvenlik Radarı' : 'DMCA & Security Radar'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${dmcaBadgeClass}`}>
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
                  <span className="font-bold text-red-500">Leonida (DMCA)</span>
                  <p className={`mt-0.5 ${theme.muted}`}>
                    {lang === 'tr'
                      ? '24 Kasım 2026 — Take-Two DMCA bildirimiyle GitHub ana deposu ve 3.007 fork devre dışı bırakıldı.'
                      : 'Nov 24, 2026 — Main GitHub repo and 3,007 forks disabled via Take-Two DMCA notice.'}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl border ${theme.card}`}>
                  <span className="font-bold text-red-500">
                    {lang === 'tr' ? 'ZETTROX (Kaldırıldı)' : 'ZETTROX (Removed)'}
                  </span>
                  <p className={`mt-0.5 ${theme.muted}`}>
                    {lang === 'tr'
                      ? '25 Kasım 2026 — Eski %64.2 lideri Zettrox/ztrx deposu GitHub üzerinden silindi.'
                      : 'Nov 25, 2026 — Former 64.2% leader Zettrox/ztrx repository was removed from GitHub.'}
                  </p>
                </div>
              </div>
              <p className={`${isLight ? 'text-amber-800' : 'text-amber-300/90'} leading-relaxed font-medium`}>
                {lang === 'tr'
                  ? 'Güvenlik Uyarısı: İnternette dolaşan "GTA 6 PC Kurulum / Crack .exe" dosyalarının tamamı sahtedir ve zararlı yazılım içerir. Hiçbir geliştirici ekip halka açık oynanabilir bir kurulum dosyası dağıtmamaktadır.'
                  : 'Security Warning: All "GTA 6 PC Installer / Crack .exe" files circulating online are fake and contain malware. No development team distributes a public playable installer.'}
              </p>
            </div>
          )}
        </section>

        <footer className={`pt-2 pb-24 sm:pb-16 space-y-4 text-center text-xs ${theme.muted}`}>
          <div className="flex items-center justify-center gap-2 flex-wrap">
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

      <button
        type="button"
        onClick={() => {
          setFeedbackStatus('idle');
          setFeedbackOpen(true);
        }}
        aria-label={lang === 'tr' ? 'Tavsiye / Fikir' : 'Feedback / Idea'}
        title={lang === 'tr' ? 'Tavsiye / Fikir' : 'Feedback / Idea'}
        style={{ animation: 'feedbackNudge 4s ease-in-out infinite' }}
        className={`fixed bottom-5 left-4 z-40 inline-flex items-center justify-center gap-1.5 w-11 h-11 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2.5 rounded-full shadow-lg text-xs font-extrabold transition hover:scale-105 ${theme.btnPrimary}`}
      >
        <MessageSquarePlus className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" />
        <span className="hidden sm:inline">{lang === 'tr' ? 'Tavsiye / Fikir' : 'Feedback / Idea'}</span>
      </button>

      {showBackTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={lang === 'tr' ? 'Yukarı çık' : 'Back to top'}
          className={`fixed bottom-5 right-4 z-40 w-11 h-11 inline-flex items-center justify-center rounded-full shadow-lg transition hover:scale-110 ${theme.btnPrimary}`}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {feedbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-5 space-y-4 ${theme.menuBg}`}>
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
                <p className="text-sm font-bold text-emerald-500">
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
                  <p className="text-red-500 font-semibold">
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
          <div className={`gta-scroll w-full max-w-lg rounded-2xl border p-5 space-y-4 max-h-[85vh] overflow-y-auto ${theme.menuBg}`}>
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
