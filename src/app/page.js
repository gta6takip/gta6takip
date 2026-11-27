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
  Download,
  Smartphone,
  Sparkles,
  Star,
  Rocket,
  Maximize2,
  Minimize2,
  Trophy,
  Newspaper,
  CheckCircle2,
  AlertTriangle,
  SmilePlus,
  GitCommit,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const APP_VERSION = 'v2.1.0';
const SCORE_SNAPSHOT_KEY = 'gta6takip_prev_scores_v2';
const CHAT_CACHE_PREFIX = 'gta6takip_chat_cache_';
const INITIAL_TEAMS_LIMIT = 5;
const CHAT_COOLDOWN_SEC = 20;
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

const BrandLogoMark = ({ isLight }) => (
  <svg
    viewBox="0 0 36 36"
    className={`w-8 h-8 shrink-0 rounded-[9px] transition-transform duration-200 group-hover:scale-105 ${
      isLight
        ? 'shadow-[0_2px_10px_rgba(24,24,27,0.22)] ring-1 ring-zinc-900/15'
        : 'shadow-[0_0_14px_rgba(236,72,153,0.38)] ring-1 ring-white/15'
    }`}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="gta6BrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="52%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#fbbf24" />
      </linearGradient>
      <linearGradient id="gta6BgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={isLight ? '#18181b' : '#1b0f2b'} />
        <stop offset="100%" stopColor={isLight ? '#09090b' : '#0f081a'} />
      </linearGradient>
    </defs>
    <rect width="36" height="36" rx="9" fill="url(#gta6BgGrad)" />
    <path
      d="M7.5 10.5L14.2 25.5H17.4L24.1 10.5H20.6L15.8 21.6L11 10.5H7.5Z"
      fill="url(#gta6BrandGrad)"
    />
    <path
      d="M25.6 10.5H28.9V25.5H25.6V10.5Z"
      fill="url(#gta6BrandGrad)"
    />
  </svg>
);

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
    bg: 'bg-[#12091c] text-pink-50',
    backdropGlow: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(236,72,153,0.18), transparent 70%)',
    card: 'bg-[#1b0f2a]/90 backdrop-blur-xl border-pink-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_10px_32px_rgba(0,0,0,0.34)]',
    cardHover: 'hover:border-pink-400/60 hover:shadow-[0_0_24px_rgba(236,72,153,0.22)]',
    heroGlow: 'shadow-[0_0_44px_rgba(236,72,153,0.18)] bg-gradient-to-br from-[#231236] via-[#1b0f2a] to-[#160d24]',
    leaderGlow: 'ring-1 ring-pink-400/55 shadow-[0_0_26px_rgba(236,72,153,0.24)]',
    menuBg: 'bg-[#1b0f2a] border-pink-500/35',
    subCard: 'bg-[#150b21] border-pink-500/20',
    stickyBar: 'bg-[#12091c]/92 border-pink-500/20',
    selfMsgBg: 'bg-pink-500/10 border-l-2 border-pink-400',
    muted: 'text-pink-200/70',
    accentText: 'text-pink-400',
    accentBg: 'bg-pink-500',
    accentGradient: 'from-pink-500 via-purple-400 to-amber-400',
    btnPrimary: 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-amber-400 text-zinc-950 hover:brightness-110',
    pill: 'bg-pink-950/60 text-pink-200 border-pink-500/30',
    softChip: 'bg-pink-500/12 text-pink-200/90',
    sparkStroke: '#f472b6',
    sparkStop: 'rgba(244, 114, 182, 0.32)',
    sbTrack: '#150b21',
    sbThumb: 'rgba(236, 72, 153, 0.48)',
    sbThumbHover: 'rgba(244, 114, 182, 0.85)',
  },
  softdark: {
    id: 'softdark',
    label: { tr: 'Soft Dark', en: 'Soft Dark' },
    dot: '#3b82f6',
    bg: 'bg-[#060b17] text-slate-100',
    backdropGlow: 'radial-gradient(ellipse 52% 45% at 16% 18%, rgba(37,99,235,0.26), transparent 72%), radial-gradient(ellipse 46% 42% at 84% 34%, rgba(234,88,12,0.19), transparent 72%)',
    card: 'bg-[#0c1324]/78 backdrop-blur-xl border-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_36px_rgba(0,0,0,0.40)]',
    cardHover: 'hover:border-blue-400/45 hover:bg-[#111b32]/85 hover:shadow-[0_0_26px_rgba(59,130,246,0.18)]',
    heroGlow: 'shadow-[0_12px_44px_rgba(0,0,0,0.45)] bg-gradient-to-br from-[#0f1930]/85 via-[#0b1222]/80 to-[#111624]/75',
    leaderGlow: 'ring-1 ring-blue-400/45 shadow-[0_0_28px_rgba(59,130,246,0.22)]',
    menuBg: 'bg-[#0b1222]/95 backdrop-blur-xl border-white/12 shadow-2xl',
    subCard: 'bg-white/[0.045] border-white/[0.10] backdrop-blur-md',
    stickyBar: 'bg-[#091020]/82 backdrop-blur-xl border-white/[0.11] shadow-[0_10px_34px_rgba(0,0,0,0.52)]',
    selfMsgBg: 'bg-blue-500/12 border-l-2 border-blue-400',
    muted: 'text-slate-300/80',
    accentText: 'text-blue-400',
    accentBg: 'bg-blue-500',
    accentGradient: 'from-blue-500 via-sky-400 to-orange-400',
    btnPrimary: 'bg-gradient-to-b from-[#3b82f6] to-[#2563eb] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_20px_-4px_rgba(37,99,235,0.55)] hover:brightness-110',
    pill: 'bg-[#0f172a]/85 text-blue-200 border-white/12 shadow-sm',
    softChip: 'bg-white/[0.06] text-slate-200 border border-white/[0.08]',
    sparkStroke: '#3b82f6',
    sparkStop: 'rgba(59, 130, 246, 0.30)',
    sbTrack: '#0a101f',
    sbThumb: 'rgba(59, 130, 246, 0.48)',
    sbThumbHover: 'rgba(96, 165, 250, 0.85)',
  },
  light: {
    id: 'light',
    label: { tr: 'Açık', en: 'Light' },
    dot: '#ea580c',
    bg: 'bg-[#f8f9fb] text-zinc-900',
    backdropGlow: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(234,88,12,0.08), transparent 70%)',
    card: 'bg-white border-zinc-200/90 shadow-sm',
    cardHover: 'hover:border-orange-300 hover:shadow-md',
    heroGlow: 'shadow-md bg-gradient-to-br from-white via-orange-50/40 to-amber-50/40',
    leaderGlow: 'ring-1 ring-orange-400/60 shadow-md',
    menuBg: 'bg-white border-zinc-200',
    subCard: 'bg-zinc-100/80 border-zinc-200',
    stickyBar: 'bg-[#f8f9fb]/92 border-zinc-200',
    selfMsgBg: 'bg-orange-50 border-l-2 border-orange-500',
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

const FALLBACK_FEATURED_PORT = {
  name: 'ScarlettPort',
  progress: 48.0,
  fps: '3-4 FPS (RTX 3060)',
  gpu: 'AMD / NVIDIA',
  type: 'open',
  stage: 'Oyun Dünyası • Hazır Launcher',
  releaseTag: 'v0.5.3',
  stars: 772,
  url: 'https://github.com/ZigZagBoi1/ScarlettPort',
  repo: 'ZigZagBoi1/ScarlettPort',
  isEstimated: true,
  hasLauncher: true,
  summaryTr:
    'Kaynak kod derlemeye gerek kalmadan hazır Windows başlatıcısı (ScarlettPort.exe) sunan ilk açık kaynak GTA VI PC port katmanı. VIctory + XCL altyapısını birleştiriyor; RTX 3060\'ta 3–4 FPS, topluluk testlerinde RX 9060 XT ile 22 FPS\'e kadar ulaşıyor.',
  summaryEn:
    'First open-source GTA VI PC port layer shipping a prebuilt Windows launcher (ScarlettPort.exe) combining VIctory + XCL runtimes. Reaches lit open world at 3–4 FPS on RTX 3060 and up to 22 FPS in community RX 9060 XT tests.',
};

const CHANGELOG = [
  {
    version: 'v2.1.0',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'UI/UX tasarım sistemi revizyonu: Cam kartlara üst ışık yansıması (specular highlight), daha yüksek WCAG kontrastı ve erişilebilir odak halkaları eklendi.',
      'Hero kartı ve 3\'lü Podyum, net tipografi hiyerarşisi, parıltılı ilerleme halkası ve yükselen cam metrik kutularıyla yenilendi.',
      'Mobil ve masaüstü butonlara 44px+ dokunma ergonomisi ve dokunsal tıklama tepkisi eklendi; tüm canlı otomasyonlar ve 3 tema korundu.',
    ],
    itemsEn: [
      'UI/UX design system pass: added specular top-edge glass highlights, stronger WCAG text contrast, and accessible focus rings.',
      'Refined the Hero telemetry card and Top-3 Podium with stronger typographic hierarchy, luminous progress ring, and elevated glass metric tiles.',
      'Improved mobile/desktop touch ergonomics and tactile press feedback while keeping all live automations and 3 themes intact.',
    ],
  },
  {
    version: 'v2.0.3',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'Yüzen cam üst menü (Floating Glass Navbar), elektrik mavisi parıltılı birincil butonlar, füme cam ikincil butonlar ve mobilde yüzen cam alt bar eklendi.',
      'Soft Dark teması lacivert-gece + mavi/turuncu ambiyans ışıklı cam arayüze yükseltilip varsayılan tema yapıldı; Canlı Sohbet dahil tüm bileşenler uyumlu hale getirildi.',
      'Vice Sunset ve Açık temaları ile tüm canlı otomasyonlar eksiksiz korundu.',
    ],
    itemsEn: [
      'Introduced a Floating Glass Navbar, glowing electric-blue primary buttons, smoky glass secondary buttons, and a floating mobile glass dock.',
      'Upgraded Soft Dark to a midnight-navy glass theme with dual blue/amber ambient glow and set it as default across all sections including Live Chat.',
      'Preserved Vice Sunset, Light theme, and all live automations untouched.',
    ],
  },
  {
    version: 'v2.0.1',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'Haber & DMCA sekmesi tam otomasyona bağlandı: Seçili dile (TR/EN) göre Google News, PortWatch canlı sürüm/DMCA radarı ve Reddit (r/GTA6) tartışmaları 10 dk önbellekle otomatik akar.',
      'Eski tekrar eden Rekor / Açık Kaynak / Güncel şeridi kaldırıldı; mobil tek sütun, masaüstü 2 sütunlu kategori filtreli canlı haber akışı eklendi.',
      'Canlı Sohbet sekmesine (PC ve mobil alt bar) aralıklı mikro-zıplama + neon ışık geçişi (shimmer) eklendi; sohbete girince otomatik sakinleşir.',
      'Genel İlerleme dairesel halkasındaki yüzde değeri tam ortaya hizalandı.',
    ],
    itemsEn: [
      'Automated News & DMCA feed: dynamically pulls language-matched (TR/EN) press coverage, live PortWatch releases/DMCA radar, and Reddit (r/GTA6) threads with 10-min CDN caching.',
      'Removed the redundant Record / Open Source / Live cards and added a responsive mobile/desktop live feed with category filters.',
      'Added subtle intermittent micro-bounce + neon shimmer highlight to the Live Chat tab (calms automatically once visited).',
      'Centered the headline percentage inside the Hero circular progress ring.',
    ],
  },
  {
    version: 'v2.0.0',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'Yeni 4 Sekmeli Uygulama Mimarisi: Mobilde sabit alt navigasyon barı ile Yarış · Sohbet · Sistem Testi · Haber & DMCA sekmeleri.',
      'Üstte Kayan Canlı Haber Bandı, 3\'lü Podyum (#1/#2/#3) ve kartlara tıklayınca açılan Ekip Detay Çekmecesi (Neler Çalışıyor / Neler Hâlâ Bozuk) eklendi.',
      'Discord/Twitch tarzı sadeleştirilmiş Canlı Sohbet: Çerçeve yığını kaldırıldı, ardışık mesajlar gruplandı, boş tepkiler gizlendi ve kendi mesajların sol şeritle ayrıldı.',
      '3 imza tema (Vice Sunset, Soft Dark, Açık), son ziyarete göre otomatik +X% değişim rozeti ve canlı DMCA verisi eklendi.',
    ],
    itemsEn: [
      'New 4-Tab App Architecture with a mobile bottom navigation bar (Race · Live Chat · System Check · News & DMCA).',
      'Added a live scrolling News Ticker, Top-3 Podium cards, and a clickable Team Detail Drawer (What works / Blockers).',
      'Streamlined Discord/Twitch-style Live Chat: removed heavy nested borders, grouped consecutive messages, hid empty reaction buttons, and highlighted own messages.',
      'Focused on 3 handcrafted signature themes (Vice Sunset, Soft Dark, Light) plus automatic score delta badges and live DMCA feed.',
    ],
  },
  {
    version: 'v1.2.5',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'SlaktarnVI (Valhalla — Linux / Proton · AMD FSR 4) otomatik GitHub takibiyle aktif ekiplere eklendi.',
      'Canlı Sohbet mesaj gönderme aralığı 30 saniyeden 20 saniyeye düşürüldü.',
    ],
    itemsEn: [
      'Added SlaktarnVI (Valhalla — Linux / Proton · AMD FSR 4) to active efforts with automatic GitHub tracking.',
      'Reduced Live Chat message cooldown from 30 seconds to 20 seconds.',
    ],
  },
  {
    version: 'v1.2.4',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'Tam Ekran Sohbet üstündeki 20px boşluk (!mt-0) giderildi ve yeni mesaj geldikçe sohbetin en alta otomatik kayması düzeltildi.',
      'Sunucu ve CPU tasarrufu: /api/sync 60sn kenar önbelleğine alındı, otomatik yenileme 5 dakikaya (300s) çıkarıldı, /api/chat yalnızca sohbet açıldığında çekilecek ve /api/geo oturum bazlı önbelleklenecek şekilde optimize edildi.',
    ],
    itemsEn: [
      'Fixed the 20px top gap in Fullscreen Live Chat (!mt-0) and fixed reliable auto-scroll to newest messages.',
      'Server & CPU optimization: Added 60s edge caching to /api/sync, adjusted auto-refresh to 300s, lazy-loaded /api/chat on open, and cached /api/geo in sessionStorage.',
    ],
  },
  {
    version: 'v1.2.3',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'Tam Ekran Sohbet baştan cilalandı: Üstte eski header taşması (z-[100]) giderildi, kontroller tek ince satıra toplandı, sabit duyuru 1 satıra sıkıştırıldı ve mesaj akışı tam kenardan kenara (native uygulama hissi) genişletildi.',
    ],
    itemsEn: [
      'Polished Fullscreen Live Chat: Fixed top header bleed (z-[100]), consolidated controls into a single slim bar, compacted pinned notice, and made messages edge-to-edge.',
    ],
  },
  {
    version: 'v1.2.2',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'Canlı Sohbete isteğe bağlı belirgin "Tam Ekran" modu (100dvh klavye uyumlu, 16px zoom-engelleyici giriş ve akıllı rumuz çipi) eklendi; mobilde klavye açılınca yazı yazmak çok rahatladı.',
      'Mobil üst bar 3 satırdan 2 satıra sıkılaştırıldı, ScarlettPort yıldız rozeti hizalandı ve klavye/tam ekran açıkken yüzen butonlar gizlendi.',
      'Masaüstü (PC) iyileştirmeleri: Kompakt ekip listesinde sütunlar dikeyde hizalandı ve Canlı Sohbet mesaj alanı genişletildi.',
    ],
    itemsEn: [
      'Added an optional prominent Fullscreen Live Chat mode (100dvh keyboard-safe layout, 16px no-zoom input, compact nickname chip) for effortless mobile typing.',
      'Tightened mobile header from 3 rows to 2 rows, aligned ScarlettPort stars inline, and auto-hid floating buttons while typing.',
      'Desktop (PC) polish: Aligned Compact view columns vertically and expanded the Live Chat message viewport.',
    ],
  },
  {
    version: 'v1.2.1',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'Sol üst marka alanı yenilendi: Özel GTA6takip uygulama simgesi logo olarak eklendi, uyumlu tipografiyle yeniden tasarlandı ve tıklandığında sayfayı yenileyecek şekilde bağlandı.',
      'Tema menüsü sırası düzenlendi: Vice Sunset, Açık, Koyu ve devamı alfabetik (Leonida Neon, Neon Vice, Ocean Drive, Soft Dark).',
      'Zirve Lider kartının her zaman gerçek #1 lideri (Belobug) göstermesi sabitlendi.',
    ],
    itemsEn: [
      'Redesigned top-left brand lockup with the custom GTA6takip app icon, matching typography, and click-to-refresh behavior.',
      'Reordered theme menu: Vice Sunset, Light, Dark, followed alphabetically by Leonida Neon, Neon Vice, Ocean Drive, and Soft Dark.',
      'Fixed Top Leader badge to always reflect the true #1 overall leader.',
    ],
  },
  {
    version: 'v1.2.0',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'ScarlettPort otomatik GitHub takibi + "Öne Çıkan Yeni Port" vitrin kartı eklendi (sürüm, yıldız, aşama ve tahmini bar otomatik güncellenir).',
      'Mobilde "Uygulama Olarak Ekle" (PWA) butonu ve özel Vice Sunset GTA6takip ana ekran ikonu eklendi.',
      'Canlı Sohbette sitede çevrimiçi olanlar ile sohbeti açanlar ayrıldı; sabit "50 Mesaj" kaldırılıp "20 Saniye Koruması Aktif" rozeti eklendi ve "+X yeni" uyarısı tüm temalara uyumlu hale getirildi.',
      'Neon Vice ve Soft Dark temaları eklendi; ana kart ve #1 lider vurgusu, kart hover glow/scale, animasyonlu progress bar ve mobilde sticky filtre şeridi devreye alındı.',
    ],
    itemsEn: [
      'Added live automatic GitHub tracking for ScarlettPort plus a dedicated Featured New Port showcase card.',
      'Added mobile "Install App" (PWA) support with a custom Vice Sunset GTA6takip home-screen icon.',
      'Separated total site online users from active Live Chat users, replaced the static "50 Messages" chip with "20s Protection Active", and theme-matched the "+X new" badge.',
      'Added Neon Vice and Soft Dark themes, hero & leader glow, card hover glow/scale, animated progress bars, and a mobile sticky filter strip.',
    ],
  },
  {
    version: 'v1.1.4',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'Yeni "Sistemim GTA 6 Portunu Açar mı?" aracı eklendi: RTX 3050 Ti, RTX 4060, RX 6700 XT gibi popüler GPU, VRAM ve RAM seçimleriyle anlık port uyumluluk değerlendirmesi.',
      'Canlı Sohbette boşluklu ve rakamlı rumuz/küfür kaçakları kapatıldı, sunucu mesaj çekimi paralel hale getirildi.',
      'PortWatch veri senkronizasyonundaki sunucu önbelleği kaldırılarak anlık güncelleme hızlandırıldı.',
    ],
    itemsEn: [
      'Added interactive "Can My PC Run the GTA VI Port?" checker covering popular GPUs, VRAM, and RAM against live PortWatch hardware tests.',
      'Hardened Live Chat profanity filter against spaced/phonetic nickname bypasses and parallelized server message fetching.',
      'Eliminated server fetch caching in /api/sync so PortWatch updates reflect immediately.',
    ],
  },
  {
    version: 'v1.1.3',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'Canlı Sohbet koruması: 8 saniyelik zaman aşımı, otomatik 1 kez yeniden deneme, Tekrar Dene butonu ve tarayıcı önbelleği eklendi — anlık dalgalanmalarda artık "yükleniyor" ekranında takılı kalmıyor.',
      'Teknik SEO paketi: Ana sayfaya net H1 başlığı, iç bağlantılar, sitemap.xml, robots.txt ve odak bilgi sayfaları eklendi.',
    ],
    itemsEn: [
      'Live Chat resilience: Added 8s timeout, automatic retry, Try Again button, and local message cache so temporary hiccups never leave chat stuck loading.',
      'Technical SEO pack: Added semantic H1 heading, internal links, sitemap.xml, robots.txt, and dedicated info pages.',
    ],
  },
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

const GPU_PRESETS = [
  { id: 'rx9070xt', label: 'AMD RX 9070 XT / 9070', vendor: 'amd', tier: 4, defaultVram: 16 },
  { id: 'rx7900xtx', label: 'AMD RX 7900 XTX / 7900 XT', vendor: 'amd', tier: 4, defaultVram: 16 },
  { id: 'rx7800xt', label: 'AMD RX 7800 XT / 7700 XT', vendor: 'amd', tier: 3, defaultVram: 12 },
  { id: 'rx6700xt', label: 'AMD RX 6800 / 6700 XT', vendor: 'amd', tier: 3, defaultVram: 12 },
  { id: 'rx6600', label: 'AMD RX 6600 / 6600 XT', vendor: 'amd', tier: 2, defaultVram: 8 },
  { id: 'rtx5080', label: 'NVIDIA RTX 5090 / 5080 / 5070', vendor: 'nvidia', tier: 4, defaultVram: 16 },
  { id: 'rtx5060', label: 'NVIDIA RTX 5060 / 5060 Ti', vendor: 'nvidia', tier: 3, defaultVram: 12 },
  { id: 'rtx4080', label: 'NVIDIA RTX 4090 / 4080 / 4070 Ti', vendor: 'nvidia', tier: 4, defaultVram: 16 },
  { id: 'rtx4070', label: 'NVIDIA RTX 4070 / 4060 Ti', vendor: 'nvidia', tier: 3, defaultVram: 12 },
  { id: 'rtx4060', label: 'NVIDIA RTX 4060 / 4050', vendor: 'nvidia', tier: 2, defaultVram: 8 },
  { id: 'rtx3080', label: 'NVIDIA RTX 3080 / 3090', vendor: 'nvidia', tier: 3, defaultVram: 12 },
  { id: 'rtx3060', label: 'NVIDIA RTX 3060 / 3060 Ti', vendor: 'nvidia', tier: 2, defaultVram: 8 },
  { id: 'rtx3050', label: 'NVIDIA RTX 3050 / 3050 Ti', vendor: 'nvidia', tier: 1, defaultVram: 4 },
  { id: 'rtx2060', label: 'NVIDIA RTX 2070 / 2060', vendor: 'nvidia', tier: 1, defaultVram: 6 },
  { id: 'gtx1650', label: 'NVIDIA GTX 1660 / 1650 Ti / 1060', vendor: 'nvidia', tier: 1, defaultVram: 4 },
  { id: 'igpu', label: 'Dahili GPU (Intel HD / UHD / Iris / Vega)', vendor: 'igpu', tier: 0, defaultVram: 4 },
];

function evaluateSystemForPort(gpuId, vramGb, ramGb, lang) {
  const gpu = GPU_PRESETS.find((g) => g.id === gpuId) || GPU_PRESETS[12];
  const isTr = lang === 'tr';

  if (gpu.tier === 0 || vramGb <= 6) {
    return {
      level: 'low',
      badge: isTr ? 'Şu An Portlarda Yetersiz' : 'Not Enough for Current Ports',
      fps: isTr ? 'Açılmaz / Çökme Riski' : 'Won’t Boot / Crash Likely',
      text: isTr
        ? `Mevcut resmi olmayan portlar henüz optimize olmadığı için 12+ GB VRAM ve 30+ GB RAM tüketiyor. ${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM) ile oyun dünyasına girerken bellek taşması/çökme yaşanır. Resmi PC sürümü çıktığında çok daha düşük gereksinimlerle optimize edilecektir.`
        : `Current unofficial ports are unoptimized and consume 12+ GB VRAM and 30+ GB RAM. With ${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM), crashes or out-of-memory errors are expected in-world. The official PC release will be far better optimized.`,
      watchTeam: gpu.vendor === 'amd' ? 'Belobug / AvatarManz' : 'Kelvaroq / hyphennn',
    };
  }

  if (vramGb <= 8 || ramGb <= 16) {
    return {
      level: 'mid',
      badge: isTr ? 'Sınırda · Menü / İlk Sahne' : 'Borderline · Menu / First Scene',
      fps: isTr ? 'Tahmini 3–10 FPS' : 'Est. 3–10 FPS',
      text: isTr
        ? `${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM) ile ana menü ve ilk iç mekân sahneleri denenebilir; ancak 16 GB RAM ve 8 GB VRAM şu an açık dünyada ciddi takılma ve bellek sınırı yaratıyor. Bellek optimizasyonu güncellemelerini beklemek en sağlıklısı.`
        : `${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM) may reach menus or early indoor scenes, but 8 GB VRAM / 16 GB RAM hits heavy memory limits in open world right now. Wait for memory optimization updates.`,
      watchTeam: gpu.vendor === 'amd' ? 'Belobug / AvatarManz (AMD)' : 'Kelvaroq / hyphennn (NVIDIA)',
    };
  }

  if (gpu.vendor === 'amd') {
    return {
      level: 'high',
      badge: isTr ? 'En Uyumlu Profil (AMD)' : 'Best Match (AMD)',
      fps: gpu.tier >= 4 ? (isTr ? 'Tahmini 16–22+ FPS' : 'Est. 16–22+ FPS') : (isTr ? 'Tahmini 10–16 FPS' : 'Est. 10–16 FPS'),
      text: isTr
        ? `Konsollar AMD RDNA2 mimarisi kullandığı için ${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM) şu an port yarışında en avantajlı yapı. Açık kaynak lideri Belobug (22 FPS) ve AvatarManz (16 FPS) doğrudan bu donanım sınıfında test ediliyor.`
        : `Because consoles use AMD RDNA2 graphics, ${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM) is currently the strongest hardware match. Open-source leaders Belobug (22 FPS) and AvatarManz (16 FPS) target this exact tier.`,
      watchTeam: 'Belobug / AvatarManz (AMD)',
    };
  }

  return {
    level: 'good',
    badge: isTr ? 'Oynanabilir Seviye (NVIDIA)' : 'Playable Tier (NVIDIA)',
    fps: gpu.tier >= 4 ? (isTr ? 'Tahmini 12–24 FPS' : 'Est. 12–24 FPS') : (isTr ? 'Tahmini 8–15 FPS' : 'Est. 8–15 FPS'),
    text: isTr
      ? `${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM) bellek eşiğini rahatça karşılıyor. NVIDIA kartlarda ekstra RDNA2→DXIL shader dönüşümü gerektiği için AMD'ye kıyasla biraz daha değişken FPS görülse de Kelvaroq ve RTX 50 serisi testleri hızla ilerliyor.`
      : `${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM) comfortably clears current memory demands. NVIDIA requires extra RDNA2-to-DXIL shader translation, so FPS varies more than AMD, though Kelvaroq and RTX 50-series builds are advancing quickly.`,
    watchTeam: 'Kelvaroq / darkworldhm (NVIDIA)',
  };
}

export default function HomePage() {
  const [lang, setLang] = useState('tr');
  const [themeKey, setThemeKey] = useState('softdark');
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
  const [activeTab, setActiveTab] = useState('race');
  const [hasVisitedChat, setHasVisitedChat] = useState(false);
  const [newsFeedCache, setNewsFeedCache] = useState({ tr: null, en: null });
  const [newsFeedLoading, setNewsFeedLoading] = useState(false);
  const [newsFeedCategory, setNewsFeedCategory] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeMsgActionId, setActiveMsgActionId] = useState(null);
  const [prevScores, setPrevScores] = useState({});
  const [dmcaItems, setDmcaItems] = useState([]);
  const [compactView, setCompactView] = useState(false);
  const [sysCheckOpen, setSysCheckOpen] = useState(false);
  const [sysGpu, setSysGpu] = useState('rtx3050');
  const [sysVram, setSysVram] = useState(4);
  const [sysRam, setSysRam] = useState(16);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatFullscreen, setChatFullscreen] = useState(false);
  const [chatInputFocused, setChatInputFocused] = useState(false);
  const [nickEditing, setNickEditing] = useState(false);
  const [pinExpanded, setPinExpanded] = useState(false);
  const chatOpenRef = useRef(false);
  const [chatRoom, setChatRoom] = useState('tr');
  const chatRoomRef = useRef('tr');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatLoadFailed, setChatLoadFailed] = useState(false);
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
  const isAtBottomRef = useRef(true);
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
  const [chatActiveCount, setChatActiveCount] = useState(0);
  const [featuredPort, setFeaturedPort] = useState(FALLBACK_FEATURED_PORT);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [iosGuideOpen, setIosGuideOpen] = useState(false);
  const presenceChannelRef = useRef(null);
  const viewerCountryRef = useRef('TR');
  const [countryStats, setCountryStats] = useState([{ code: 'TR', count: 1 }]);
  const [countdown, setCountdown] = useState(300);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);

  const theme = THEMES[themeKey] || THEMES.softdark;
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
    if (presenceChannelRef.current) {
      presenceChannelRef.current
        .track({
          online_at: new Date().toISOString(),
          country: viewerCountryRef.current || 'TR',
          in_chat: chatOpen,
        })
        .catch(() => {});
    }
  }, [chatOpen]);

  useEffect(() => {
    if (!chatFullscreen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e) => {
      if (e.key === 'Escape') setChatFullscreen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onEsc);
    };
  }, [chatFullscreen]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const standalone =
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.navigator?.standalone === true;
    setIsStandalone(Boolean(standalone));
    const ua = window.navigator?.userAgent || '';
    setIsIosDevice(/iphone|ipad|ipod/i.test(ua));

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const onAppInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (installPrompt) {
      try {
        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice?.outcome === 'accepted') {
          setInstallPrompt(null);
          setIsStandalone(true);
        }
      } catch {
        // Yoksay
      }
      return;
    }
    setIosGuideOpen(true);
  };

  useEffect(() => {
    chatRoomRef.current = chatRoom;
  }, [chatRoom]);

  useEffect(() => {
    chatSoundOnRef.current = chatSoundOn;
  }, [chatSoundOn]);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('gta6takip_theme');
      if (savedTheme && THEMES[savedTheme]) {
        setThemeKey(savedTheme);
      } else if (savedTheme === 'dark' || savedTheme === 'ocean' || savedTheme === 'leonida') {
        setThemeKey('softdark');
      } else if (savedTheme === 'neonvice') {
        setThemeKey('vice');
      }
      const prevSnapRaw = localStorage.getItem(SCORE_SNAPSHOT_KEY);
      if (prevSnapRaw) {
        const parsedSnap = JSON.parse(prevSnapRaw);
        if (parsedSnap && parsedSnap.scores && typeof parsedSnap.scores === 'object') {
          setPrevScores(parsedSnap.scores);
        }
      }
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
    setChatLoadFailed(false);

    // Sunucu yanıt verirken boş ekran yerine son önbellekteki mesajları anında göster
    try {
      const cachedRaw = localStorage.getItem(`${CHAT_CACHE_PREFIX}${targetRoom}`);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (Array.isArray(cached) && cached.length > 0 && chatRoomRef.current === targetRoom) {
          setChatMessages((prev) => (prev.length === 0 ? cached : prev));
        }
      }
    } catch {
      // Depolama erişilemezse devam et
    }

    const loadOnce = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(`/api/chat?room=${encodeURIComponent(targetRoom)}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } finally {
        clearTimeout(timeoutId);
      }
    };

    try {
      let data = null;
      try {
        data = await loadOnce();
      } catch {
        // Anlık bağlantı dalgalanmasında 1 kez otomatik tekrar dene
        await new Promise((r) => setTimeout(r, 900));
        data = await loadOnce();
      }

      if (chatRoomRef.current === targetRoom && data) {
        if (Array.isArray(data?.messages)) {
          forceScrollRef.current = true;
          setChatMessages(data.messages);
          setUnreadWhileScrolled(0);
          try {
            localStorage.setItem(
              `${CHAT_CACHE_PREFIX}${targetRoom}`,
              JSON.stringify(data.messages.slice(-30))
            );
          } catch {
            // Yoksay
          }
        }
        setPinnedNotice(data?.pinned || null);
        setChatLoadFailed(false);
      }
    } catch {
      if (chatRoomRef.current === targetRoom) {
        setChatLoadFailed(true);
      }
    } finally {
      if (chatRoomRef.current === targetRoom) {
        setChatLoading(false);
      }
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

  const fetchLiveNewsFeed = async (targetLang, force = false) => {
    const safeLang = targetLang === 'en' ? 'en' : 'tr';
    if (!force && newsFeedCache[safeLang]) return;
    setNewsFeedLoading(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(`/api/news?lang=${safeLang}`, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error('News fetch failed');
      const data = await res.json();
      if (Array.isArray(data?.items)) {
        setNewsFeedCache((prev) => ({ ...prev, [safeLang]: data }));
      }
    } catch {
      // Keep existing cache or fallback gracefully
    } finally {
      setNewsFeedLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'news') {
      fetchLiveNewsFeed(lang, false);
    }
  }, [activeTab, lang]);

  const formatNewsRelativeTime = (isoString, currentLang) => {
    if (!isoString) return '';
    const diffMs = Date.now() - new Date(isoString).getTime();
    if (Number.isNaN(diffMs) || diffMs < 0) return currentLang === 'tr' ? 'Az önce' : 'Just now';
    const mins = Math.floor(diffMs / 60000);
    if (mins < 2) return currentLang === 'tr' ? 'Az önce' : 'Just now';
    if (mins < 60) return currentLang === 'tr' ? `${mins} dk önce` : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return currentLang === 'tr' ? `${hours} sa önce` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return currentLang === 'tr' ? `${days} gün önce` : `${days}d ago`;
    return new Date(isoString).toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'chat') {
      setHasVisitedChat(true);
      forceScrollRef.current = true;
      isAtBottomRef.current = true;
      setChatOpen(true);
      setUnreadWhileClosed(0);
      fetchChatMessages(chatRoomRef.current);
    } else {
      setChatFullscreen(false);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToChat = () => {
    handleSelectTab('chat');
  };

  // /api/chat yalnızca kullanıcı sohbeti açtığında çekilir (CPU/kota tasarrufu)

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
    if (!chatOpen) return;
    if (forceScrollRef.current || isAtBottomRef.current) {
      forceScrollRef.current = false;
      isAtBottomRef.current = true;
      setUnreadWhileScrolled(0);
      requestAnimationFrame(() => {
        const el = chatListRef.current;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      });
    }
  }, [chatMessages, chatOpen, chatFullscreen]);

  const handleChatListScroll = () => {
    const el = chatListRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
    isAtBottomRef.current = nearBottom;
    if (nearBottom && unreadWhileScrolled > 0) {
      setUnreadWhileScrolled(0);
    }
  };

  const handleScrollChatBottom = () => {
    isAtBottomRef.current = true;
    setUnreadWhileScrolled(0);
    const el = chatListRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
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
          ? `1 message per 20 seconds. Please wait ${chatCooldown}s.`
          : `20 saniyede 1 mesaj gönderebilirsin. Lütfen ${chatCooldown} saniye bekle.`
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
            isEstimated: Boolean(item.isEstimated),
            hasLauncher: Boolean(item.hasLauncher),
            releaseTag: item.releaseTag || '',
            platformTag: item.platformTag || '',
            stars: Number(item.stars) || 0,
            commits7d: Number(item.commits7d) || 0,
            verification: item.verification || '',
            approach: item.approach || '',
            highlights: Array.isArray(item.highlights) ? item.highlights : [],
            blockers: Array.isArray(item.blockers) ? item.blockers : [],
          }))
          .sort((a, b) => b.progress - a.progress);

        setTeams(normalized);
        try {
          const existingRaw = localStorage.getItem(SCORE_SNAPSHOT_KEY);
          const existing = existingRaw ? JSON.parse(existingRaw) : null;
          const ageMs = existing?.ts ? Date.now() - Number(existing.ts) : Infinity;
          if (!existing || ageMs > 6 * 60 * 60 * 1000) {
            const scoreMap = {};
            for (const tm of normalized) {
              scoreMap[tm.name] = tm.progress;
            }
            if (existing?.scores) {
              setPrevScores(existing.scores);
            }
            localStorage.setItem(
              SCORE_SNAPSHOT_KEY,
              JSON.stringify({ ts: Date.now(), scores: scoreMap })
            );
          }
        } catch {
          // Depolama erişilemezse geç
        }
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
      if (data?.featuredPort && data.featuredPort.name) {
        setFeaturedPort(data.featuredPort);
      }
      if (Array.isArray(data?.dmcaItems) && data.dmcaItems.length > 0) {
        setDmcaItems(data.dmcaItems);
      }
    } catch {
      // Mevcut veya yedek veri korunur
    } finally {
      setSyncing(false);
      setCountdown(300);
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
          return 300;
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
        const cachedGeo = sessionStorage.getItem('gta6takip_geo_country');
        if (cachedGeo && /^[A-Z]{2}$/.test(cachedGeo)) {
          viewerCountry = cachedGeo;
        } else {
          const geoRes = await fetch('/api/geo', { cache: 'no-store' });
          if (geoRes.ok) {
            const geoJson = await geoRes.json();
            if (geoJson?.country && /^[A-Z]{2}$/.test(geoJson.country)) {
              viewerCountry = geoJson.country;
              sessionStorage.setItem('gta6takip_geo_country', geoJson.country);
            }
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
              let inChatCnt = 0;
              const countsMap = {};
              for (const presList of entries) {
                const latest = Array.isArray(presList) ? presList[presList.length - 1] : null;
                const code = String(latest?.country || 'TR').toUpperCase();
                countsMap[code] = (countsMap[code] || 0) + 1;
                if (latest?.in_chat) inChatCnt += 1;
              }
              setChatActiveCount(inChatCnt);
              const sortedStats = Object.entries(countsMap)
                .map(([code, cnt]) => ({ code, count: cnt }))
                .sort((a, b) => b.count - a.count);
              setCountryStats(sortedStats);
            }
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              presenceChannelRef.current = channel;
              viewerCountryRef.current = viewerCountry;
              await channel.track({
                online_at: new Date().toISOString(),
                country: viewerCountry,
                in_chat: chatOpenRef.current,
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
      if (presenceChannelRef.current === channel) presenceChannelRef.current = null;
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
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`} style={{ backgroundImage: theme.backdropGlow }}>
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
        @keyframes barShimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(260%); }
        }
        .progress-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          width: 45%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: barShimmer 2.8s ease-in-out infinite;
        }
        @keyframes chatTabNudge {
          0%, 72%, 100% { transform: translateY(0); }
          77% { transform: translateY(-4px); }
          82% { transform: translateY(0); }
          87% { transform: translateY(-2.5px); }
          92% { transform: translateY(0); }
        }
        @keyframes chatTabShimmer {
          0%, 52% { transform: translateX(-140%) skewX(-18deg); }
          100% { transform: translateX(260%) skewX(-18deg); }
        }
        .chat-tab-attention {
          animation: chatTabNudge 7.5s ease-in-out infinite;
        }
        .chat-tab-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 48%;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.34), rgba(56, 189, 248, 0.30), transparent);
          animation: chatTabShimmer 4.8s ease-in-out infinite;
        }
        button:focus-visible,
        a:focus-visible,
        input:focus-visible,
        select:focus-visible {
          outline: 2px solid rgba(59, 130, 246, 0.75);
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .chat-tab-attention,
          .chat-tab-shimmer::after {
            animation: none !important;
          }
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

      <div className="sticky top-0 z-40 px-2.5 sm:px-5 pt-2 sm:pt-3 pb-1 pointer-events-none">
      <header className={`pointer-events-auto max-w-4xl mx-auto rounded-2xl border backdrop-blur-xl transition-all duration-300 ${theme.stickyBar}`}>
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => window.location.reload()}
                title={lang === 'tr' ? 'Ana sayfayı yenile' : 'Refresh homepage'}
                className="group inline-flex items-center gap-2.5 text-left transition hover:opacity-95 active:scale-[0.98] cursor-pointer"
              >
                <BrandLogoMark isLight={isLight} />
                <span
                  style={{ fontFamily: 'var(--font-brand), ui-sans-serif, system-ui, sans-serif' }}
                  className="inline-flex items-baseline leading-none select-none"
                >
                  <span
                    className={`font-bold tracking-[-0.03em] text-[19px] sm:text-[21px] bg-clip-text text-transparent bg-gradient-to-r ${
                      isLight
                        ? 'from-pink-600 via-fuchsia-600 to-orange-500'
                        : 'from-cyan-300 via-pink-400 to-amber-300'
                    }`}
                  >
                    GTA6
                  </span>
                  <span
                    className={`font-semibold tracking-[0.11em] text-[15px] sm:text-[16px] ml-0.5 ${
                      isLight ? 'text-zinc-900' : 'text-white/95'
                    }`}
                  >
                    TAKIP
                  </span>
                </span>
              </button>
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

          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 flex-nowrap">
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
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap ${theme.subCard}`}
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

            {!isStandalone && (
              <button
                type="button"
                onClick={handleInstallPwa}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold shadow-sm transition hover:scale-[1.03] ${theme.btnPrimary}`}
                title={lang === 'tr' ? 'Telefonuna uygulama olarak ekle' : 'Install as App'}
              >
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">{lang === 'tr' ? 'Yükle' : 'App'}</span>
                <span className="hidden sm:inline">{lang === 'tr' ? 'Uygulama Ekle' : 'Install App'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchSyncData}
              disabled={syncing}
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition ${theme.subCard}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{countdown}s</span>
            </button>
          </div>
        </div>
      </header>
      </div>

      {/* MASAÜSTÜ 4 SEKMELİ UYGULAMA NAVİGASYONU */}
      <nav className="hidden sm:block max-w-4xl mx-auto px-5 pt-2.5">
        <div className={`grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl border backdrop-blur-xl ${theme.stickyBar}`}>
          {[
            { id: 'race', icon: Trophy, tr: 'Yarış Tablosu', en: 'Leaderboard' },
            { id: 'chat', icon: MessageCircle, tr: 'Canlı Sohbet', en: 'Live Chat' },
            { id: 'system', icon: Cpu, tr: 'Sistem Testi', en: 'System Check' },
            { id: 'news', icon: Newspaper, tr: 'Haber & DMCA', en: 'News & DMCA' },
          ].map((tab) => {
            const IconComp = tab.icon;
            const active = activeTab === tab.id;
            const isChatAttention = tab.id === 'chat' && !active && !hasVisitedChat;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`relative flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs font-extrabold transition-all duration-200 active:scale-[0.97] ${
                  active
                    ? `${theme.btnPrimary} shadow-sm`
                    : isChatAttention
                      ? `overflow-hidden chat-tab-attention chat-tab-shimmer border ${
                          isLight
                            ? 'border-blue-300/80 bg-blue-50/80 text-blue-800 hover:bg-blue-100/80'
                            : themeKey === 'vice'
                              ? 'border-fuchsia-400/45 bg-fuchsia-500/12 text-fuchsia-200 hover:bg-fuchsia-500/18'
                              : 'border-blue-400/45 bg-blue-500/12 text-blue-200 hover:bg-blue-500/18'
                        }`
                      : `${theme.muted} hover:bg-white/5`
                }`}
              >
                {tab.id === 'chat' && !active && (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
                <IconComp className="w-3.5 h-3.5 shrink-0" />
                <span>{lang === 'tr' ? tab.tr : tab.en}</span>
                {tab.id === 'chat' && unreadWhileClosed > 0 && activeTab !== 'chat' && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${theme.btnPrimary}`}>
                    +{unreadWhileClosed}
                  </span>
                )}
                {tab.id === 'chat' && unreadWhileClosed === 0 && (
                  <span className={`text-[10px] font-bold ${active ? 'opacity-90' : theme.accentText}`}>
                    ({Math.max(chatActiveCount, chatOpen ? 1 : 0)})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-3 sm:px-5 py-5 space-y-5">
        {/* ÜST ÖZET KARTI — YARIŞ SEKMESİ */}
        {activeTab === 'race' && (<section className={`rounded-2xl border p-4 sm:p-6 transition-all duration-300 ${theme.card} ${theme.heroGlow || ''}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-3.5 flex-1">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold tracking-wider ${theme.accentText}`}>
                    {lang === 'tr' ? 'GENEL İLERLEME' : 'OVERALL PROGRESS'}
                  </span>
                  <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${theme.softChip}`}>
                    {totalEfforts} {lang === 'tr' ? 'Girişim' : 'Tracked'} · {bootingCount} Boot
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-black tracking-tight opacity-95">
                  {lang === 'tr'
                    ? 'GTA 6 PC Port Takip & Canlı İlerleme'
                    : 'GTA VI PC Port Tracker & Live Progress'}
                </h1>
              </div>

              {/* Yüzde + %100 İlerleme Dairesi + İstatistik Rozeti */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 64 64" className={`w-16 h-16 -rotate-90 ${!isLight ? 'drop-shadow-[0_0_10px_rgba(59,130,246,0.35)]' : ''}`} aria-label={`%${leaderPct}`}>
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-[13px] font-black tabular-nums tracking-tight">
                      {lang === 'tr' ? `%${Math.round(leader.progress)}` : `${Math.round(leader.progress)}%`}
                    </span>
                    <span className="text-[8px] font-bold opacity-60 mt-0.5">/100</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className={`text-3xl sm:text-4xl font-black tracking-tight tabular-nums ${!isLight ? `bg-clip-text text-transparent bg-gradient-to-r ${theme.accentGradient}` : ''}`}>
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
                  <span className={leaderGlowClass}>{leader.name}</span>
                  <span className={isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'}>
                    {lang === 'tr' ? `%${leader.progress}` : `${leader.progress}%`}
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
                    {Math.max(chatActiveCount, chatOpen ? 1 : 0)} {lang === 'tr' ? 'Sohbette' : 'In Chat'}
                  </span>
                </button>
              </div>

              {/* 3'LÜ PODYUM (#1 / #2 / #3) — CAM METRİK KARTLARI */}
              <div className="grid grid-cols-3 gap-2.5 pt-1.5">
                {[leader, secondTeam, thirdTeam].filter(Boolean).map((pTeam, pIdx) => {
                  const rankBadge =
                    pIdx === 0
                      ? isLight
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-amber-500/15 text-amber-300 border-amber-400/35'
                      : pIdx === 1
                        ? isLight
                          ? 'bg-sky-100 text-sky-800 border-sky-300'
                          : 'bg-sky-500/15 text-sky-300 border-sky-400/30'
                        : isLight
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : 'bg-orange-500/15 text-orange-300 border-orange-400/30';
                  return (
                    <button
                      key={pTeam.name}
                      type="button"
                      onClick={() => setSelectedTeam({ ...pTeam, globalRank: pIdx + 1 })}
                      className={`group text-left rounded-2xl border p-2.5 sm:p-3 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${theme.subCard} ${
                        pIdx === 0
                          ? !isLight
                            ? 'ring-1 ring-blue-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                            : 'ring-1 ring-amber-400/50'
                          : !isLight
                            ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]'
                            : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black border ${rankBadge}`}>
                          #{pIdx + 1}
                        </span>
                        <span className={`text-sm sm:text-base font-black tabular-nums tracking-tight ${theme.accentText}`}>
                          {lang === 'tr' ? `%${pTeam.progress}` : `${pTeam.progress}%`}
                        </span>
                      </div>
                      <div className="text-xs sm:text-[13px] font-extrabold truncate mt-1.5 group-hover:underline">
                        {pTeam.name}
                      </div>
                      <div className={`text-[10px] sm:text-[11px] truncate mt-0.5 ${theme.muted}`}>
                        {localizeDynamicText(pTeam.fps, lang)}
                      </div>
                    </button>
                  );
                })}
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

        )}

        {/* SON GELİŞMELER — HABER & DMCA SEKMESİ */}
        {activeTab === 'news' && (() => {
          const activeFeed = newsFeedCache[lang === 'en' ? 'en' : 'tr'];
          const allFeedItems = Array.isArray(activeFeed?.items) ? activeFeed.items : [];
          const filteredFeedItems =
            newsFeedCategory === 'all'
              ? allFeedItems
              : allFeedItems.filter((item) => item.category === newsFeedCategory);
          const feedCounts = activeFeed?.counts || {
            all: allFeedItems.length,
            press: allFeedItems.filter((i) => i.category === 'press').length,
            release: allFeedItems.filter((i) => i.category === 'release').length,
            community: allFeedItems.filter((i) => i.category === 'community').length,
            dmca: allFeedItems.filter((i) => i.category === 'dmca').length,
          };
          const categoryMeta = (cat) => {
            if (cat === 'dmca') {
              return {
                label: lang === 'tr' ? 'DMCA Radarı' : 'DMCA Radar',
                cls: isLight
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : 'bg-red-500/15 text-red-300 border-red-500/35',
              };
            }
            if (cat === 'release') {
              return {
                label: lang === 'tr' ? 'Sürüm & Kod' : 'Release & Code',
                cls: isLight
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
              };
            }
            if (cat === 'community') {
              return {
                label: 'Reddit',
                cls: isLight
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : 'bg-orange-500/15 text-orange-300 border-orange-500/35',
              };
            }
            return {
              label: lang === 'tr' ? 'Basın' : 'Press',
              cls: isLight
                ? 'bg-sky-100 text-sky-800 border-sky-300'
                : 'bg-sky-500/15 text-sky-300 border-sky-500/35',
            };
          };

          return (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <h2 className="text-sm sm:text-base font-black tracking-wide">
                    {lang === 'tr' ? 'CANLI SON GELİŞMELER & DMCA AKIŞI' : 'LIVE NEWS & DMCA FEED'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${theme.pill}`}>
                    {lang === 'tr' ? 'TR Otomatik Akış' : 'EN Live Feed'}
                  </span>
                  <button
                    type="button"
                    onClick={() => fetchLiveNewsFeed(lang, true)}
                    disabled={newsFeedLoading}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${theme.pill} hover:opacity-85 disabled:opacity-50`}
                  >
                    <RefreshCw className={`w-3 h-3 ${newsFeedLoading ? 'animate-spin' : ''}`} />
                    <span>{lang === 'tr' ? 'Yenile' : 'Refresh'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 pb-0.5">
                {[
                  { id: 'all', tr: 'Tümü', en: 'All', count: feedCounts.all },
                  { id: 'press', tr: 'Basın', en: 'Press', count: feedCounts.press },
                  { id: 'release', tr: 'Sürüm & Kod', en: 'Releases', count: feedCounts.release },
                  { id: 'community', tr: 'Reddit', en: 'Reddit', count: feedCounts.community },
                  { id: 'dmca', tr: 'DMCA Radarı', en: 'DMCA Radar', count: feedCounts.dmca },
                ].map((cat) => {
                  const isCatActive = newsFeedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewsFeedCategory(cat.id)}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition ${
                        isCatActive ? `${theme.btnPrimary} border-transparent` : `${theme.card} ${theme.muted} hover:opacity-90`
                      }`}
                    >
                      <span>{lang === 'tr' ? cat.tr : cat.en}</span>
                      <span className={`text-[10px] font-black tabular-nums ${isCatActive ? 'opacity-90' : 'opacity-65'}`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {newsFeedLoading && allFeedItems.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {[0, 1, 2, 3].map((sk) => (
                    <div key={sk} className={`rounded-2xl border p-3.5 space-y-2 animate-pulse ${theme.card}`}>
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-20 rounded-full bg-current opacity-15" />
                        <div className="h-3 w-14 rounded bg-current opacity-10" />
                      </div>
                      <div className="h-4 w-11/12 rounded bg-current opacity-15" />
                      <div className="h-3 w-3/4 rounded bg-current opacity-10" />
                    </div>
                  ))}
                </div>
              ) : filteredFeedItems.length === 0 ? (
                <div className={`rounded-2xl border p-5 text-center text-xs ${theme.card} ${theme.muted}`}>
                  {lang === 'tr'
                    ? 'Bu kategoride şimdilik yeni kayıt görünmüyor. Diğer sekmelere bakabilir veya akışı yenileyebilirsin.'
                    : 'No items in this category right now. Try switching categories or refreshing the feed.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {filteredFeedItems.map((item) => {
                    const meta = categoryMeta(item.category);
                    return (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex flex-col justify-between gap-2 rounded-2xl border p-3.5 transition hover:-translate-y-0.5 ${theme.card}`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${meta.cls}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {meta.label}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${theme.muted}`}>
                              <Clock className="w-3 h-3 shrink-0" />
                              {formatNewsRelativeTime(item.publishedAt, lang)}
                            </span>
                          </div>
                          <h3 className="text-xs sm:text-[13px] font-bold leading-snug line-clamp-2 group-hover:underline">
                            {item.title}
                          </h3>
                          {item.summary && (
                            <p className={`text-[11px] leading-relaxed line-clamp-2 ${theme.muted}`}>
                              {item.summary}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5 text-[10px] font-bold">
                          <span className={`truncate ${theme.accentText}`}>{item.source}</span>
                          <span className={`inline-flex items-center gap-1 shrink-0 ${theme.muted} group-hover:opacity-100`}>
                            {lang === 'tr' ? 'Kaynağa git' : 'Read source'}
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })()}

        {/* ÖNE ÇIKAN YENİ PORT VİTRİNİ — YARIŞ SEKMESİ */}
        {activeTab === 'race' && featuredPort && (
          <section className={`rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${theme.card} ${theme.heroGlow || ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider ${theme.btnPrimary}`}>
                    <Rocket className="w-3 h-3 shrink-0" />
                    {lang === 'tr' ? 'ÖNE ÇIKAN YENİ PORT' : 'FEATURED NEW PORT'}
                  </span>
                  {featuredPort.releaseTag && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${theme.pill}`}>
                      {featuredPort.releaseTag}
                    </span>
                  )}
                  {featuredPort.stars > 0 && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${theme.softChip} ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                      <Star className="w-2.5 h-2.5 fill-current shrink-0" />
                      {featuredPort.stars}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isLight ? 'bg-violet-100 text-violet-900' : 'bg-purple-500/20 text-purple-200 border border-purple-400/35'
                  }`}>
                    <Download className="w-3 h-3 shrink-0" />
                    {lang === 'tr' ? 'Hazır Launcher' : 'Prebuilt Launcher'}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${theme.softChip}`}>
                    <Sparkles className="w-3 h-3 shrink-0" />
                    {featuredPort.isEstimated
                      ? lang === 'tr'
                        ? 'GitHub Canlı · Tahmini'
                        : 'Live GitHub · Estimated'
                      : lang === 'tr'
                        ? 'PortWatch Onaylı'
                        : 'PortWatch Verified'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
                  <h2 className="text-base sm:text-lg font-black tracking-tight">{featuredPort.name}</h2>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${theme.softChip}`}>
                    <Monitor className={`w-3 h-3 shrink-0 ${theme.accentText}`} />
                    <span>{localizeDynamicText(featuredPort.fps, lang)}</span>
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${theme.softChip}`}>
                    <GpuBadgeIcons gpu={featuredPort.gpu} isLight={isLight} />
                    <span>{featuredPort.gpu}</span>
                  </span>

                </div>

                <p className={`text-xs leading-relaxed ${theme.muted}`}>
                  {lang === 'tr' ? featuredPort.summaryTr : featuredPort.summaryEn}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 sm:w-44">
                <div className="text-left sm:text-right">
                  <div className={`text-2xl font-black tabular-nums ${theme.accentText}`}>
                    {lang === 'tr' ? `%${featuredPort.progress}` : `${featuredPort.progress}%`}
                  </div>
                  <div className={`text-[10px] font-semibold ${theme.muted}`}>
                    {featuredPort.isEstimated
                      ? lang === 'tr'
                        ? 'Tahmini İlerleme'
                        : 'Est. Progress'
                      : lang === 'tr'
                        ? 'PortWatch Puanı'
                        : 'PortWatch Score'}
                  </div>
                </div>
                <div className="w-28 sm:w-full relative h-2 rounded-full bg-zinc-700/35 overflow-hidden">
                  <div
                    className={`relative progress-shimmer h-full rounded-full bg-gradient-to-r ${theme.accentGradient} transition-all duration-700`}
                    style={{ width: `${Math.min(100, Math.max(5, Number(featuredPort.progress) || 48))}%` }}
                  />
                </div>
                <a
                  href={featuredPort.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition hover:scale-[1.03] ${theme.subCard}`}
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'system' && (
        <div className="space-y-4">
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

        {/* SİSTEMİM GTA 6 PORTUNU AÇAR MI? (CANLI UYUMLULUK TESTİ) */}
        <section className={`rounded-2xl border overflow-hidden ${theme.card}`}>
          <button
            type="button"
            onClick={() => setSysCheckOpen((v) => !v)}
            className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2.5 flex-wrap">
              <Cpu className={`w-4 h-4 ${theme.accentText} shrink-0`} />
              <span className="text-xs sm:text-sm font-black tracking-tight">
                {lang === 'tr' ? 'Sistemim GTA 6 Portunu Açar mı?' : 'Can My PC Run the GTA VI Port?'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${theme.softChip}`}>
                {lang === 'tr' ? 'GPU · VRAM · RAM Testi' : 'GPU · VRAM · RAM Check'}
              </span>
            </div>
            {sysCheckOpen ? (
              <ChevronUp className="w-4 h-4 shrink-0 opacity-80" />
            ) : (
              <ChevronDown className="w-4 h-4 shrink-0 opacity-80" />
            )}
          </button>

          {(sysCheckOpen || activeTab === 'system') && (() => {
            const evalRes = evaluateSystemForPort(sysGpu, sysVram, sysRam, lang);
            const badgeTone =
              evalRes.level === 'high' || evalRes.level === 'good'
                ? isLight
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : evalRes.level === 'mid'
                  ? isLight
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  : isLight
                    ? 'bg-red-100 text-red-900 border-red-300'
                    : 'bg-red-500/20 text-red-300 border-red-400/40';

            return (
              <div className={`px-4 pb-4 pt-3 border-t space-y-3 text-xs ${theme.subCard}`}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className={`block text-[11px] font-bold ${theme.muted}`}>
                      {lang === 'tr' ? 'Ekran Kartı (GPU)' : 'Graphics Card (GPU)'}
                    </label>
                    <select
                      value={sysGpu}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        setSysGpu(nextId);
                        const preset = GPU_PRESETS.find((g) => g.id === nextId);
                        if (preset) setSysVram(preset.defaultVram);
                      }}
                      className={`w-full rounded-xl border px-2.5 py-2 text-xs font-semibold outline-none ${theme.menuBg}`}
                    >
                      {GPU_PRESETS.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[11px] font-bold ${theme.muted}`}>VRAM</label>
                    <select
                      value={sysVram}
                      onChange={(e) => setSysVram(Number(e.target.value))}
                      className={`w-full rounded-xl border px-2.5 py-2 text-xs font-semibold outline-none ${theme.menuBg}`}
                    >
                      {[4, 6, 8, 12, 16].map((v) => (
                        <option key={v} value={v}>
                          {v === 16 ? '16 GB+' : `${v} GB`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[11px] font-bold ${theme.muted}`}>
                      {lang === 'tr' ? 'Sistem RAM' : 'System RAM'}
                    </label>
                    <select
                      value={sysRam}
                      onChange={(e) => setSysRam(Number(e.target.value))}
                      className={`w-full rounded-xl border px-2.5 py-2 text-xs font-semibold outline-none ${theme.menuBg}`}
                    >
                      {[8, 16, 32, 64].map((r) => (
                        <option key={r} value={r}>
                          {r === 64 ? '64 GB+' : `${r} GB`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`rounded-xl border p-3.5 space-y-2 ${theme.card}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${badgeTone}`}>
                      {evalRes.badge}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-black ${theme.accentText}`}>
                      <Monitor className="w-3.5 h-3.5" />
                      {evalRes.fps}
                    </span>
                  </div>
                  <p className={`leading-relaxed ${theme.muted}`}>{evalRes.text}</p>
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-1 text-[11px]">
                    <span>
                      <strong className={theme.accentText}>
                        {lang === 'tr' ? 'Takip Edilecek Hat: ' : 'Recommended Track: '}
                      </strong>
                      <span className="font-semibold">{evalRes.watchTeam}</span>
                    </span>
                    <span className={`opacity-75 ${theme.muted}`}>
                      {lang === 'tr'
                        ? '*Resmi olmayan PortWatch testlerine dayalı tahmindir.'
                        : '*Estimate based on unofficial PortWatch tests.'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        </div>
        )}

        {/* AKTİF EKİPLER — YARIŞ SEKMESİ */}
        {activeTab === 'race' && (
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

            {/* Satır 2: Mobilde Sticky Tek Satır Kaydırılabilir Filtre Şeridi + Masaüstünde Görünüm Geçişi */}
            <div className={`sticky top-[86px] sm:static z-30 -mx-3 px-3 py-1.5 sm:mx-0 sm:px-0 sm:py-0 backdrop-blur-md sm:backdrop-blur-none border-b sm:border-b-0 flex items-center justify-between gap-2 ${theme.stickyBar || ''}`}>
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
              const prevVal = prevScores[team.name];
              const diffVal =
                typeof prevVal === 'number' && team.progress > prevVal
                  ? Number((team.progress - prevVal).toFixed(1))
                  : 0;
              const deltaText = team.delta || (diffVal > 0 ? `+${diffVal}%` : '');

              if (compactView) {
                return (
                  <article
                    key={team.name}
                    className={`rounded-xl border px-3 py-2.5 transition-all duration-200 hover:scale-[1.008] flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${theme.card} ${theme.cardHover || ''} ${
                      rank === 1 ? (theme.leaderGlow || 'ring-1 ring-orange-500/40') : ''
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
                      <h3 className="text-sm font-extrabold tracking-tight truncate sm:w-32 sm:shrink-0">{team.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold sm:w-20 sm:justify-center sm:shrink-0 ${theme.softChip}`}>
                        <Monitor className="w-2.5 h-2.5 opacity-80 shrink-0" />
                        <span className="truncate">{localizeDynamicText(team.fps, lang)}</span>
                      </span>
                      {team.gpu && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium sm:w-28 sm:shrink-0 ${theme.softChip}`}>
                          <GpuBadgeIcons gpu={team.gpu} isLight={isLight} />
                          <span className="truncate">{localizeDynamicText(team.gpu, lang)}</span>
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
                          className={`relative progress-shimmer h-full rounded-full bg-gradient-to-r ${theme.accentGradient} transition-all duration-700`}
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
                  className={`rounded-2xl border p-3.5 sm:p-4 transition-all duration-200 hover:scale-[1.008] ${theme.card} ${theme.cardHover || ''} ${
                    rank === 1 ? (theme.leaderGlow || 'ring-1 ring-orange-500/40') : ''
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
                      <button
                        type="button"
                        onClick={() => setSelectedTeam(team)}
                        className="text-base sm:text-lg font-extrabold tracking-tight truncate hover:underline underline-offset-2 text-left cursor-pointer"
                        title={lang === 'tr' ? 'Ekip detaylarını gör' : 'View team details'}
                      >
                        {team.name}
                      </button>

                      {isHot && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider shrink-0 bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 text-zinc-950 shadow-[0_0_16px_rgba(249,115,22,0.75)] animate-pulse">
                          <Flame className="w-3 h-3 fill-current" />
                          HOT
                        </span>
                      )}

                      <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 border ${
                        team.type === 'private'
                          ? isLight
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-amber-500/15 text-amber-300 border-amber-400/35'
                          : isLight
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-400/35'
                      }`}>
                        {team.type === 'private' ? (
                          <Lock className="w-3 h-3 shrink-0" />
                        ) : (
                          <Code2 className="w-3 h-3 shrink-0" />
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
                      {team.hasLauncher && (
                        <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 border ${
                          isLight
                            ? 'bg-violet-100 text-violet-900 border-violet-300'
                            : 'bg-purple-500/20 text-purple-200 border-purple-400/40'
                        }`}>
                          <Download className="w-2.5 h-2.5 shrink-0" />
                          <span>Launcher</span>
                        </span>
                      )}
                      {team.platformTag && (
                        <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 border ${
                          isLight
                            ? 'bg-sky-100 text-sky-900 border-sky-300'
                            : 'bg-sky-500/20 text-sky-200 border-sky-400/40'
                        }`}>
                          <span>{team.platformTag}</span>
                        </span>
                      )}
                      {team.isEstimated && (
                        <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${theme.softChip}`}>
                          <span>{lang === 'tr' ? 'Tahmini' : 'Est.'}</span>
                        </span>
                      )}

                      {deltaText && (
                        <span className={`hidden sm:inline text-[11px] font-bold shrink-0 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                          ▲ {deltaText}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <span className={`text-base sm:text-xl font-black tabular-nums ${theme.accentText}`}>
                        {lang === 'tr' ? `%${team.progress}` : `${team.progress}%`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedTeam(team)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold transition hover:brightness-110 ${theme.pill}`}
                      >
                        <Info className="w-3 h-3" />
                        <span className="hidden sm:inline">{lang === 'tr' ? 'Detay' : 'Details'}</span>
                      </button>
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
                    {deltaText && (
                      <span className={`sm:hidden text-[11px] font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                        ▲ {deltaText}
                      </span>
                    )}
                    {team.stage && (
                      <span className={
                        team.progress >= 50
                          ? `inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                              isLight
                                ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                                : 'bg-cyan-500/15 text-cyan-300 border-cyan-400/35'
                            }`
                          : theme.muted
                      }>
                        {team.progress >= 50 && <Sparkles className="w-3 h-3 shrink-0" />}
                        <span>{localizeDynamicText(team.stage, lang)}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="relative h-2.5 w-full rounded-full bg-zinc-700/35 overflow-hidden">
                      <div
                        className={`relative progress-shimmer h-full rounded-full bg-gradient-to-r ${theme.accentGradient} transition-all duration-700`}
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

        )}

        {/* MODERN CANLI SOHBET KUTUSU — SOHBET SEKMESİ */}
        {activeTab === 'chat' && (
        <section
          ref={chatSectionRef}
          id="canli-sohbet"
          className={
            chatFullscreen
              ? `fixed inset-0 !mt-0 z-[100] h-[100dvh] flex flex-col overflow-hidden ${theme.bg}`
              : `rounded-2xl border overflow-hidden shadow-xl ${theme.card}`
          }
        >
          {chatOpen && <div className={`h-0.5 w-full bg-gradient-to-r ${theme.accentGradient}`} />}

          <div className={`w-full px-3.5 sm:px-4 ${chatFullscreen ? 'py-2.5 border-b shrink-0' : 'py-3.5'} flex items-center justify-between gap-2 ${chatFullscreen ? theme.card : ''}`}>
          <button
            type="button"
            onClick={() => {
              if (chatFullscreen) {
                setChatFullscreen(false);
                return;
              }
              const next = !chatOpen;
              if (next) {
                forceScrollRef.current = true;
                setUnreadWhileClosed(0);
              }
              setChatOpen(next);
              if (next) fetchChatMessages(chatRoomRef.current);
            }}
            className="flex-1 flex items-center justify-between gap-2 text-left hover:opacity-95 transition min-w-0"
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
                {Math.max(chatActiveCount, chatOpen ? 1 : 0)} {lang === 'tr' ? 'Sohbette' : 'In Chat'}
              </span>
              {!chatFullscreen && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${theme.pill}`}>
                  <ShieldCheck className={`w-3 h-3 shrink-0 ${theme.accentText}`} />
                  <span>{isEnRoom ? '20s Protection Active' : '20 Saniye Koruması Aktif'}</span>
                </span>
              )}
              {!chatOpen && unreadWhileClosed > 0 && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-sm animate-pulse ${theme.btnPrimary}`}>
                  +{unreadWhileClosed} {lang === 'tr' ? 'yeni' : 'new'}
                </span>
              )}
            </div>
            {!chatFullscreen && (
              <span className={`p-1.5 rounded-xl border shrink-0 ${theme.subCard}`}>
                {chatOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
              </span>
            )}
          </button>
          {chatOpen && (
            <button
              type="button"
              onClick={() => {
                forceScrollRef.current = true;
                isAtBottomRef.current = true;
                setChatFullscreen((v) => !v);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-black shrink-0 shadow-sm transition hover:scale-[1.03] ${theme.btnPrimary}`}
              title={chatFullscreen ? (lang === 'tr' ? 'Tam ekrandan çık' : 'Exit fullscreen') : (lang === 'tr' ? 'Rahat yazmak için tam ekran aç' : 'Open fullscreen chat')}
            >
              {chatFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'tr' ? 'Küçült' : 'Exit'}</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'tr' ? 'Tam Ekran' : 'Fullscreen'}</span>
                </>
              )}
            </button>
          )}
          </div>

          {chatOpen && (
            <div
              className={
                chatFullscreen
                  ? `flex-1 min-h-0 flex flex-col ${theme.bg}`
                  : `px-3.5 sm:px-4 pb-4 pt-3.5 border-t space-y-3 ${theme.subCard}`
              }
            >
              {/* Üst Kontrol Çubuğu: Oda Sekmeleri + Yetkili Kilidi + Bildirim Sesi */}
              <div className={
                chatFullscreen
                  ? `flex items-center justify-between gap-1.5 px-3 py-2 border-b shrink-0 ${theme.subCard}`
                  : 'flex flex-col sm:flex-row sm:items-center justify-between gap-2'
              }>
                <div className={`inline-flex rounded-xl border p-0.5 sm:p-1 gap-1 ${theme.card}`}>
                  <button
                    type="button"
                    onClick={() => handleSwitchChatRoom('tr')}
                    className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 ${chatFullscreen ? 'px-2.5 py-1' : 'px-3 py-1.5'} rounded-lg text-xs font-bold transition ${
                      chatRoom === 'tr' ? `${theme.btnPrimary} shadow-sm` : `${theme.muted} hover:bg-white/5`
                    }`}
                  >
                    <FlagTR className="w-4 h-3 rounded-[2px] shrink-0 shadow-sm" />
                    <span>{chatFullscreen ? 'TR' : 'TR (Turkish)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchChatRoom('en')}
                    className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 ${chatFullscreen ? 'px-2.5 py-1' : 'px-3 py-1.5'} rounded-lg text-xs font-bold transition ${
                      chatRoom === 'en' ? `${theme.btnPrimary} shadow-sm` : `${theme.muted} hover:bg-white/5`
                    }`}
                  >
                    <FlagUS className="w-4 h-3 rounded-[2px] shrink-0 shadow-sm" />
                    <span>{chatFullscreen ? 'EN' : 'EN (Global English)'}</span>
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
                <button
                  type="button"
                  onClick={() => setPinExpanded((v) => !v)}
                  className={`w-full text-left flex items-start gap-2 text-xs transition ${
                    chatFullscreen
                      ? `px-3 py-1.5 border-b shrink-0 ${
                          isLight
                            ? 'bg-amber-50 border-amber-200 text-amber-950'
                            : 'bg-amber-500/10 border-amber-400/25 text-amber-100'
                        }`
                      : `px-3 py-2 rounded-xl border ${
                          isLight
                            ? 'bg-amber-50 border-amber-300 text-amber-950'
                            : 'bg-amber-500/10 border-amber-400/40 text-amber-100'
                        }`
                  }`}
                >
                  <Pin className="w-3.5 h-3.5 mt-0.5 text-amber-400 shrink-0" />
                  <div className={`min-w-0 flex-1 leading-relaxed ${chatFullscreen && !pinExpanded ? 'truncate' : ''}`}>
                    <span className="font-black text-[10px] uppercase tracking-wider text-amber-400 mr-1.5">
                      {isEnRoom ? 'PINNED:' : 'DUYURU:'}
                    </span>
                    <span className="font-medium break-words">{pinnedNotice.message}</span>
                  </div>
                </button>
              )}

              <div className={`${chatFullscreen ? 'hidden sm:flex' : 'flex'} items-center gap-1.5 text-[11px] ${theme.muted}`}>
                <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${theme.accentText} opacity-80`} />
                <span>
                  {isEnRoom
                    ? 'Global English room · Profanity & link filter active · Click a name to @mention'
                    : 'Türkçe sohbet odası · Küfür ve link engeli aktif · İsime tıklayarak @etiketle'}
                </span>
              </div>

              {/* Mesaj Akışı */}
              <div className={`relative ${chatFullscreen ? 'flex-1 min-h-0 flex flex-col' : ''}`}>
                <div
                  ref={chatListRef}
                  onScroll={handleChatListScroll}
                  className={`gta-scroll overflow-y-auto space-y-2 ${
                    chatFullscreen
                      ? 'flex-1 min-h-0 px-3 py-2.5'
                      : `rounded-2xl border p-3 max-h-80 sm:max-h-[420px] ${theme.card}`
                  }`}
                >
                  {chatLoadFailed && chatMessages.length > 0 && (
                    <div className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-[11px] ${theme.subCard}`}>
                      <span className={theme.muted}>
                        {isEnRoom
                          ? 'Live refresh timed out (showing cached messages).'
                          : 'Canlı yenileme gecikti (önbellekteki mesajlar gösteriliyor).'}
                      </span>
                      <button
                        type="button"
                        onClick={() => fetchChatMessages(chatRoomRef.current)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold shrink-0 ${theme.btnPrimary}`}
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{isEnRoom ? 'Retry' : 'Tekrar Dene'}</span>
                      </button>
                    </div>
                  )}

                  {chatLoading && chatMessages.length === 0 ? (
                    <p className={`text-xs text-center py-8 ${theme.muted}`}>
                      {isEnRoom ? 'Loading messages...' : 'Mesajlar yükleniyor...'}
                    </p>
                  ) : chatLoadFailed && chatMessages.length === 0 ? (
                    <div className="py-6 text-center space-y-2.5">
                      <p className={`text-xs ${theme.muted}`}>
                        {isEnRoom
                          ? 'Connection timed out while loading messages.'
                          : 'Bağlantı gecikti, mesajlar şu an alınamadı.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => fetchChatMessages(chatRoomRef.current)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition hover:brightness-110 ${theme.btnPrimary}`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{isEnRoom ? 'Try Again' : 'Tekrar Dene'}</span>
                      </button>
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <p className={`text-xs text-center py-8 ${theme.muted}`}>
                      {isEnRoom
                        ? 'No messages in Global English room yet. Be the first to say hi!'
                        : 'Henüz mesaj yok. İlk mesajı sen yaz!'}
                    </p>
                  ) : (
                    chatMessages.map((m, msgIdx) => {
                      const prevMsg = msgIdx > 0 ? chatMessages[msgIdx - 1] : null;
                      const prevTime = prevMsg?.created_at ? new Date(prevMsg.created_at).getTime() : 0;
                      const currTime = m.created_at ? new Date(m.created_at).getTime() : 0;
                      const isGrouped =
                        Boolean(prevMsg) &&
                        !m.reply_to_nick &&
                        !m.reply_to_text &&
                        String(prevMsg.nickname || '').trim().toLowerCase() ===
                          String(m.nickname || '').trim().toLowerCase() &&
                        Math.abs(currTime - prevTime) < 5 * 60 * 1000;

                      const isAdminMsg =
                        String(m.nickname || '').trim().toLowerCase() === 'batmancodex' || m.role === 'admin';
                      const isModMsg = !isAdminMsg && m.role === 'mod';
                      const nickStyle = getNickStyle(m.nickname, isLight);
                      const initial = String(m.nickname || '?').trim().charAt(0).toUpperCase() || '?';
                      const isSelf =
                        chatNick.trim().length >= 2 &&
                        String(m.nickname || '').trim().toLowerCase() === chatNick.trim().toLowerCase();
                      const reactionsObj = m.reactions && typeof m.reactions === 'object' ? m.reactions : {};
                      const activeReactions = CHAT_REACTION_EMOJIS.filter((em) => (Number(reactionsObj[em]) || 0) > 0);
                      const actionsOpen = activeMsgActionId === m.id;

                      return (
                        <div
                          key={m.id}
                          onClick={() => setActiveMsgActionId((prev) => (prev === m.id ? null : m.id))}
                          className={`group relative rounded-xl px-2.5 ${isGrouped ? 'py-0.5 mt-0' : 'pt-2 pb-1.5 mt-1.5'} text-xs transition ${
                            isSelf
                              ? theme.selfMsgBg || 'bg-pink-500/10 border-l-2 border-pink-400'
                              : isAdminMsg
                                ? isLight
                                  ? 'bg-amber-50/70 border-l-2 border-amber-400'
                                  : 'bg-amber-500/8 border-l-2 border-amber-400'
                                : isModMsg
                                  ? isLight
                                    ? 'bg-sky-50/70 border-l-2 border-sky-400'
                                    : 'bg-sky-500/8 border-l-2 border-sky-400'
                                  : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          {(m.reply_to_nick || m.reply_to_text) && (
                            <div
                              className={`mb-1 px-2 py-1 rounded-lg border-l-2 text-[11px] flex items-center gap-1.5 ${
                                isLight
                                  ? 'bg-zinc-200/70 border-orange-500 text-zinc-700'
                                  : 'bg-black/25 border-current/60 opacity-85'
                              }`}
                            >
                              <Reply className={`w-3 h-3 shrink-0 ${theme.accentText}`} />
                              <span className={`font-bold shrink-0 ${theme.accentText}`}>
                                @{m.reply_to_nick || (isEnRoom ? 'User' : 'Kullanıcı')}
                              </span>
                              <span className="truncate opacity-80">{m.reply_to_text}</span>
                            </div>
                          )}

                          {!isGrouped && (
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                {isAdminMsg ? (
                                  <button
                                    type="button"
                                    onClick={(e) => handleMentionUser(e, m.nickname)}
                                    className="cursor-pointer inline-flex items-center gap-1 font-black text-[12px] hover:underline"
                                    title={isEnRoom ? 'Click to @mention' : 'Etiketlemek için tıkla'}
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span className={isLight ? 'text-amber-800' : 'text-amber-200'}>{m.nickname}</span>
                                    <BadgeCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                    <span className="px-1.5 py-[1px] rounded text-[9px] font-black bg-amber-400 text-zinc-950">
                                      ADMIN
                                    </span>
                                  </button>
                                ) : isModMsg ? (
                                  <button
                                    type="button"
                                    onClick={(e) => handleMentionUser(e, m.nickname)}
                                    className="cursor-pointer inline-flex items-center gap-1 font-black text-[12px] hover:underline"
                                    title={isEnRoom ? 'Click to @mention' : 'Etiketlemek için tıkla'}
                                  >
                                    <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                    <span className={isLight ? 'text-sky-800' : 'text-sky-200'}>{m.nickname}</span>
                                    <span className="px-1.5 py-[1px] rounded text-[9px] font-black bg-sky-400 text-zinc-950">
                                      {isEnRoom ? 'MOD' : 'MODERATÖR'}
                                    </span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => handleMentionUser(e, m.nickname)}
                                    className="cursor-pointer inline-flex items-center gap-1.5 font-extrabold text-[12px] max-w-full hover:underline"
                                    title={isEnRoom ? 'Click to @mention' : 'Etiketlemek için tıkla'}
                                  >
                                    <span
                                      className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black shrink-0 ${nickStyle.avatar}`}
                                    >
                                      {initial}
                                    </span>
                                    <span className="truncate">{m.nickname}</span>
                                  </button>
                                )}
                                <span className={`text-[10px] font-medium tabular-nums opacity-65 ${theme.muted}`}>
                                  {formatChatTime(m.created_at)}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMsgActionId((prev) => (prev === m.id ? null : m.id));
                                }}
                                className={`p-1 rounded-md opacity-55 hover:opacity-100 transition ${theme.muted}`}
                                aria-label="Mesaj işlemleri"
                                title={isEnRoom ? 'React / Reply' : 'Tepki / Yanıtla'}
                              >
                                <SmilePlus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          <p className={`leading-snug break-words text-[13px] ${isGrouped ? 'pl-5' : 'pl-0.5'}`}>
                            {m.message}
                          </p>

                          {/* Sadece en az 1 oy alan tepkiler görünür (sıfır kalabalık!) */}
                          {activeReactions.length > 0 && (
                            <div className={`mt-1 flex items-center gap-1 flex-wrap ${isGrouped ? 'pl-5' : ''}`}>
                              {activeReactions.map((emoji) => {
                                const cnt = Number(reactionsObj[emoji]) || 0;
                                const reacted = Boolean(myReactions[`${m.id}:${emoji}`]);
                                return (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleReaction(m, emoji);
                                    }}
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                                      reacted ? `${theme.btnPrimary} shadow-sm` : `${theme.softChip} hover:opacity-100`
                                    }`}
                                  >
                                    <span>{emoji}</span>
                                    <span className="tabular-nums">{cnt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Kompakt Aksiyon Barı (Hover veya Dokununca Açılır) */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={`mt-1.5 items-center gap-1 flex-wrap ${
                              actionsOpen ? 'flex' : 'hidden group-hover:flex'
                            } ${isGrouped ? 'pl-5' : ''}`}
                          >
                            {CHAT_REACTION_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  handleToggleReaction(m, emoji);
                                  setActiveMsgActionId(null);
                                }}
                                className={`px-1.5 py-0.5 rounded-full text-[11px] transition hover:scale-110 ${theme.softChip}`}
                              >
                                {emoji}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                handleStartReply(m);
                                setActiveMsgActionId(null);
                              }}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition ${theme.softChip}`}
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
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-400/50 bg-amber-500/20 text-amber-300 text-[10px] font-bold"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                  <span>{clearingId === m.id ? '...' : isEnRoom ? 'Clear' : 'Temizle'}</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={banningId === m.id || clearingId === m.id}
                                  onClick={() => handleBanMessage(m)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-red-500/50 bg-red-500/20 text-red-300 text-[10px] font-bold"
                                >
                                  <Ban className="w-2.5 h-2.5" />
                                  <span>{banningId === m.id ? '...' : isEnRoom ? 'Ban' : 'Banla'}</span>
                                </button>
                              </>
                            )}
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
              <form
                onSubmit={handleSendChat}
                className={`space-y-1.5 text-xs ${
                  chatFullscreen
                    ? `shrink-0 px-3 pt-2 pb-3 border-t ${theme.card}`
                    : ''
                }`}
              >
                {chatNick.trim().length >= 2 && !nickEditing && (
                  <div className="flex sm:hidden items-center justify-between px-1 text-[11px]">
                    <span className={`inline-flex items-center gap-1.5 font-bold ${theme.muted}`}>
                      <User className={`w-3 h-3 ${theme.accentText}`} />
                      <span>{chatNick}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setNickEditing(true)}
                      className={`text-[10px] font-bold underline underline-offset-2 ${theme.accentText}`}
                    >
                      {isEnRoom ? 'Change name' : 'İsmi değiştir'}
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div
                    className={`${
                      chatNick.trim().length >= 2 && !nickEditing ? 'hidden sm:flex' : 'flex'
                    } sm:w-44 items-center gap-2 rounded-2xl border px-3 py-2 transition focus-within:ring-2 focus-within:ring-pink-500/35 ${theme.card}`}
                  >
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 border ${theme.pill}`}>
                      {isTypingAdminNick ? <ShieldCheck className="w-3 h-3 text-amber-400" /> : <User className="w-3 h-3" />}
                    </span>
                    <input
                      type="text"
                      maxLength={20}
                      value={chatNick}
                      onFocus={() => setChatInputFocused(true)}
                      onBlur={() => {
                        setChatInputFocused(false);
                        if (chatNick.trim().length >= 2) setNickEditing(false);
                      }}
                      onChange={(e) => handleNickChange(e.target.value)}
                      placeholder={isEnRoom ? 'Nickname...' : 'İsmin...'}
                      className="w-full bg-transparent outline-none font-bold text-[16px] sm:text-xs min-w-0 placeholder:font-normal placeholder:opacity-60"
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
                      onFocus={() => setChatInputFocused(true)}
                      onBlur={() => setChatInputFocused(false)}
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
                      className="flex-1 bg-transparent outline-none text-[16px] sm:text-xs min-w-0 disabled:opacity-60 placeholder:opacity-60"
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

        )}

        {activeTab === 'news' && (
        <div className="space-y-4">
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

        </div>
        )}

        <footer className={`pt-4 pb-28 sm:pb-14 space-y-4 text-center text-xs ${theme.muted}`}>
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
          <div className="flex items-center justify-center gap-3 flex-wrap text-[11px] font-semibold">
            <a href="/gta-6-pc-ne-zaman-cikacak" className={`underline underline-offset-2 hover:opacity-100 opacity-80 ${theme.accentText}`}>
              {lang === 'tr' ? 'GTA 6 PC Ne Zaman Çıkacak?' : 'When is GTA VI Coming to PC?'}
            </a>
            <span className="opacity-40">·</span>
            <a href="/gta-6-kirildi-mi" className={`underline underline-offset-2 hover:opacity-100 opacity-80 ${theme.accentText}`}>
              {lang === 'tr' ? 'GTA 6 Kırıldı mı?' : 'Is GTA VI Cracked?'}
            </a>
          </div>
          <p className="max-w-2xl mx-auto leading-relaxed opacity-80">
            {lang === 'tr'
              ? 'GTA6takip, PortWatch projesinin kâr gütmeyen, hobi amaçlı Türkçe alternatifidir. Veriler halka açık kaynaklardan derlenir; hiçbir korsan veya telifli dosya barındırılmaz.'
              : 'GTA6takip is a non-profit, hobbyist tracker inspired by PortWatch. Data is aggregated from public sources; no pirated or copyrighted files are hosted.'}
          </p>
        </footer>
      </main>

      {!chatFullscreen && !chatInputFocused && (
        <button
          type="button"
          onClick={() => {
            setFeedbackStatus('idle');
            setFeedbackOpen(true);
          }}
          aria-label={lang === 'tr' ? 'Tavsiye / Fikir' : 'Feedback / Idea'}
          title={lang === 'tr' ? 'Tavsiye / Fikir' : 'Feedback / Idea'}
          style={{ animation: 'feedbackNudge 4s ease-in-out infinite' }}
          className={`fixed bottom-20 left-3 sm:bottom-5 sm:left-4 z-40 inline-flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2.5 rounded-full shadow-lg text-xs font-extrabold transition hover:scale-105 ${theme.btnPrimary}`}
        >
          <MessageSquarePlus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{lang === 'tr' ? 'Tavsiye / Fikir' : 'Feedback / Idea'}</span>
        </button>
      )}

      {showBackTop && !chatFullscreen && !chatInputFocused && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={lang === 'tr' ? 'Yukarı çık' : 'Back to top'}
          className={`fixed bottom-20 right-3 sm:bottom-5 sm:right-4 z-40 w-10 h-10 sm:w-11 sm:h-11 inline-flex items-center justify-center rounded-full shadow-lg transition hover:scale-110 ${theme.btnPrimary}`}
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
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
      {iosGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl border p-5 space-y-4 ${theme.menuBg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className={`w-4 h-4 ${theme.accentText}`} />
                <h3 className="text-base font-black">
                  {lang === 'tr' ? 'Uygulama Olarak Ekle' : 'Install as App'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIosGuideOpen(false)}
                className={`p-1 rounded-lg border ${theme.subCard}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className={`rounded-xl border p-3.5 space-y-2 text-xs leading-relaxed ${theme.subCard}`}>
              {isIosDevice ? (
                <>
                  <p className="font-bold">
                    {lang === 'tr' ? 'iPhone / iPad (Safari):' : 'iPhone / iPad (Safari):'}
                  </p>
                  <ol className={`list-decimal pl-4 space-y-1 ${theme.muted}`}>
                    <li>{lang === 'tr' ? 'Alttaki Paylaş (kare + yukarı ok) simgesine dokun.' : 'Tap the Share icon at the bottom.'}</li>
                    <li>{lang === 'tr' ? 'Açılan menüden "Ana Ekrana Ekle" seçeneğine bas.' : 'Select "Add to Home Screen".'}</li>
                    <li>{lang === 'tr' ? 'Sağ üstten "Ekle" dediğinde GTA6takip logosu ana ekranına gelir.' : 'Tap "Add" to place the GTA6takip icon on your home screen.'}</li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-bold">
                    {lang === 'tr' ? 'Android Chrome / Masaüstü:' : 'Android Chrome / Desktop:'}
                  </p>
                  <ol className={`list-decimal pl-4 space-y-1 ${theme.muted}`}>
                    <li>{lang === 'tr' ? 'Tarayıcının sağ üstündeki menü (⋮) simgesine dokun.' : 'Open the browser menu (⋮).'}</li>
                    <li>{lang === 'tr' ? '"Ana ekrana ekle" veya "Uygulamayı yükle" seçeneğine bas.' : 'Tap "Add to Home screen" or "Install app".'}</li>
                  </ol>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIosGuideOpen(false)}
              className={`w-full py-2 rounded-xl text-xs font-black ${theme.btnPrimary}`}
            >
              {lang === 'tr' ? 'Anladım' : 'Got it'}
            </button>
          </div>
        </div>
      )}
      {/* MOBİL SABİT ALT UYGULAMA NAVİGASYON BARI */}
      {!chatFullscreen && !chatInputFocused && (
        <nav
          className={`fixed bottom-2.5 inset-x-2.5 z-40 sm:hidden rounded-2xl border backdrop-blur-xl px-1.5 py-1.5 ${theme.stickyBar}`}
          aria-label="Mobil Menü"
        >
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'race', icon: Trophy, tr: 'Yarış', en: 'Race' },
              { id: 'chat', icon: MessageCircle, tr: 'Sohbet', en: 'Chat' },
              { id: 'system', icon: Cpu, tr: 'Sistem', en: 'System' },
              { id: 'news', icon: Newspaper, tr: 'Haber', en: 'News' },
            ].map((tab) => {
              const IconComp = tab.icon;
              const active = activeTab === tab.id;
              const isChatAttention = tab.id === 'chat' && !active && !hasVisitedChat;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 py-2 min-h-[46px] rounded-xl text-[10px] font-extrabold transition-all duration-200 active:scale-[0.96] ${
                    active
                      ? theme.btnPrimary
                      : isChatAttention
                        ? `overflow-hidden chat-tab-attention chat-tab-shimmer border ${
                            isLight
                              ? 'border-blue-300/80 bg-blue-50/80 text-blue-800'
                              : themeKey === 'vice'
                                ? 'border-fuchsia-400/45 bg-fuchsia-500/15 text-fuchsia-200'
                                : 'border-blue-400/45 bg-blue-500/15 text-blue-200'
                          }`
                        : theme.muted
                  }`}
                >
                  {tab.id === 'chat' && !active && unreadWhileClosed === 0 && (
                    <span className="absolute top-1 right-4 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  )}
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{lang === 'tr' ? tab.tr : tab.en}</span>
                  {tab.id === 'chat' && unreadWhileClosed > 0 && activeTab !== 'chat' && (
                    <span className="absolute top-0.5 right-3 px-1 rounded-full text-[8px] font-black bg-red-500 text-white">
                      +{unreadWhileClosed}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* EKİP DETAY ÇEKMECESİ (TEAM DETAIL DRAWER) */}
      {selectedTeam && (
        <div
          onClick={() => setSelectedTeam(null)}
          className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`gta-scroll w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border p-5 space-y-4 max-h-[85dvh] overflow-y-auto ${theme.menuBg}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedTeam.globalRank && (
                    <span className={`px-2 py-0.5 rounded-md text-xs font-black ${theme.btnPrimary}`}>
                      #{selectedTeam.globalRank}
                    </span>
                  )}
                  <h3 className="text-lg font-black truncate">{selectedTeam.name}</h3>
                  <span className={`text-base font-black tabular-nums ${theme.accentText}`}>
                    {lang === 'tr' ? `%${selectedTeam.progress}` : `${selectedTeam.progress}%`}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${theme.softChip}`}>
                    <Monitor className="w-3 h-3" />
                    {localizeDynamicText(selectedTeam.fps, lang)}
                  </span>
                  {selectedTeam.gpu && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${theme.softChip}`}>
                      <GpuBadgeIcons gpu={selectedTeam.gpu} isLight={isLight} />
                      {localizeDynamicText(selectedTeam.gpu, lang)}
                    </span>
                  )}
                  {selectedTeam.stars > 0 && (
                    <span className={`inline-flex items-center gap-1 font-bold ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                      <Star className="w-3 h-3 fill-current" />
                      {selectedTeam.stars}
                    </span>
                  )}
                  {selectedTeam.commits7d > 0 && (
                    <span className={`inline-flex items-center gap-1 font-semibold ${theme.muted}`}>
                      <GitCommit className="w-3 h-3" />
                      {selectedTeam.commits7d} (7g)
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className={`p-1.5 rounded-xl border shrink-0 ${theme.subCard}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative h-2.5 w-full rounded-full bg-zinc-700/35 overflow-hidden">
              <div
                className={`relative progress-shimmer h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`}
                style={{ width: `${Math.min(100, Math.max(2, selectedTeam.progress))}%` }}
              />
            </div>

            {selectedTeam.highlights && selectedTeam.highlights.length > 0 && (
              <div className={`rounded-xl border p-3.5 space-y-2 ${theme.subCard}`}>
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'tr' ? 'Neler Çalışıyor?' : 'What Works'}</span>
                </div>
                <ul className={`space-y-1.5 text-xs leading-relaxed ${theme.muted}`}>
                  {selectedTeam.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedTeam.blockers && selectedTeam.blockers.length > 0 && (
              <div className={`rounded-xl border p-3.5 space-y-2 ${theme.subCard}`}>
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'tr' ? 'Neler Hâlâ Eksik / Sorunlu?' : 'Current Blockers'}</span>
                </div>
                <ul className={`space-y-1.5 text-xs leading-relaxed ${theme.muted}`}>
                  {selectedTeam.blockers.map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <a
                href={selectedTeam.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black inline-flex items-center justify-center gap-1.5 transition hover:brightness-110 ${theme.btnPrimary}`}
              >
                <span>{lang === 'tr' ? 'GitHub / Kaynağa Git' : 'Open GitHub / Source'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold ${theme.subCard}`}
              >
                {lang === 'tr' ? 'Kapat' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
