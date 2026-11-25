'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Send,
  ExternalLink,
  MessageSquare,
  Cpu,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Link as LinkIcon,
  User,
  Trophy,
  Users,
  Clock,
  Palette,
  Monitor,
  Smile,
} from 'lucide-react';

const THEMES = [
  { id: 'portwatch-dark', tr: 'PortWatch Koyu', en: 'PortWatch Dark' },
  { id: 'portwatch-light', tr: 'PortWatch Açık', en: 'PortWatch Light' },
];

const QUICK_EMOJIS = ['🔥', '🚗', '🌴', '🎮', '⚡', '😂', '❤️', '👀', '🚀', '👍', '🎉', '💀'];

const AVATARS = [
  { id: 'sunset', label: 'Sunset', bg: 'from-purple-600 to-pink-500' },
  { id: 'controller', label: 'Gamer', bg: 'from-pink-500 to-orange-500' },
  { id: 'bolt', label: 'Turbo', bg: 'from-amber-500 to-rose-500' },
  { id: 'shades', label: 'Vice', bg: 'from-indigo-500 to-purple-600' },
  { id: 'crown', label: 'VIP', bg: 'from-emerald-500 to-teal-500' },
  { id: 'rocket', label: 'Port', bg: 'from-fuchsia-600 to-orange-400' },
];

function AvatarSvg({ avatarId, size = 'sm' }) {
  const av = AVATARS.find((a) => a.id === avatarId) || AVATARS[0];
  const dim = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
  const iconDim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <span
      className={`${dim} rounded-lg bg-gradient-to-br ${av.bg} inline-flex items-center justify-center text-white shrink-0 shadow-sm`}
    >
      {av.id === 'sunset' && (
        <svg className={iconDim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="5" />
          <path d="M3 17h18M5 20h14" strokeLinecap="round" />
        </svg>
      )}
      {av.id === 'controller' && (
        <svg className={iconDim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="2" y="6" width="20" height="12" rx="4" />
          <path d="M6 12h4M8 10v4" strokeLinecap="round" />
          <circle cx="16" cy="11" r="1" fill="currentColor" />
          <circle cx="18" cy="13" r="1" fill="currentColor" />
        </svg>
      )}
      {av.id === 'bolt' && (
        <svg className={iconDim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeLinejoin="round" />
        </svg>
      )}
      {av.id === 'shades' && (
        <svg className={iconDim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M2 10h20M4 10l1.5 5a2 2 0 0 0 2 1.5h2a2 2 0 0 0 2-1.5L12 10l.5 5a2 2 0 0 0 2 1.5h2a2 2 0 0 0 2-1.5L20 10" strokeLinecap="round" />
        </svg>
      )}
      {av.id === 'crown' && (
        <svg className={iconDim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M3 18h18L19 7l-4 4-3-6-3 6-4-4-2 11z" strokeLinejoin="round" />
        </svg>
      )}
      {av.id === 'rocket' && (
        <svg className={iconDim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        </svg>
      )}
    </span>
  );
}

function getAvatarForUser(name, myNick, myAvatar) {
  const clean = (name || '').trim();
  const mine = (myNick || '').trim() || 'ViceMisafir';
  if (clean && clean.toLowerCase() === mine.toLowerCase()) return myAvatar;
  let hash = 0;
  for (let i = 0; i < clean.length; i += 1) {
    hash = (hash * 31 + clean.charCodeAt(i)) % AVATARS.length;
  }
  return AVATARS[Math.abs(hash) % AVATARS.length].id;
}

const BAD_ROOTS = [
  'amk', 'aq', 'mk', 'mq', 'amq', 'amcik', 'orospu', 'orspu', 'oc', 'pic',
  'siktir', 'sikim', 'sikeyim', 'sikerim', 'sikik', 'sikis', 'yarrak', 'yarak',
  'tasak', 'gotveren', 'pezevenk', 'kahpe', 'kaltak', 'pust', 'ibne', 'gavat',
  'serefsiz', 'haysiyetsiz', 'gerizekali', 'salak', 'aptal', 'anani', 'bacini',
  'fuck', 'fck', 'fucker', 'motherfucker', 'shit', 'bullshit', 'bitch', 'asshole',
  'dick', 'cock', 'pussy', 'cunt', 'bastard', 'slut', 'whore', 'faggot', 'retard',
  'nigger', 'nigga', 'stfu', 'wtf', 'kys',
];

function normalizeForCheck(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's');
}

const WORD_BOUNDARY_TEST = new RegExp(
  `(^|[^a-z0-9])(${BAD_ROOTS.join('|')})(?=[^a-z0-9]|$)`,
  'i'
);
const WORD_BOUNDARY_REPLACE = new RegExp(
  `(^|[^a-zçğıöşü0-9])(${BAD_ROOTS.join('|')})(?=[^a-zçğıöşü0-9]|$)`,
  'gi'
);

function containsProfanity(text) {
  if (!text) return false;
  const norm = normalizeForCheck(text);
  if (WORD_BOUNDARY_TEST.test(norm)) return true;
  const squashed = norm.replace(/[^a-z0-9]/g, '');
  const strictRoots = [
    'amk', 'orospu', 'siktir', 'sikim', 'sikeyim', 'sikerim', 'yarrak',
    'pezevenk', 'gotveren', 'fuck', 'motherfucker', 'bitch', 'asshole', 'nigger', 'cunt',
  ];
  return strictRoots.some((r) => squashed.includes(r));
}

function censorText(text) {
  if (!text) return '';
  let out = String(text).replace(WORD_BOUNDARY_REPLACE, (m, prefix, word) => {
    const masked = word[0] + '*'.repeat(Math.max(2, word.length - 1));
    return `${prefix}${masked}`;
  });
  if (containsProfanity(out)) {
    out = out.replace(/[a-zA-ZçğıöşüÇĞİÖŞÜ0-9]{2,}/g, (w) =>
      containsProfanity(w) ? w[0] + '*'.repeat(w.length - 1) : w
    );
  }
  return out;
}

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
    commitPrefix: 'Son GitHub güncellemesi:',
    chatTitle: 'Vice City Canlı Sohbet',
    chatSubtitle: 'Kanallar: #tr-genel ve #en-general',
    live: 'Canlı',
    channelTr: '#tr-genel',
    channelEn: '#en-general',
    nicknameLabel: 'Nickname:',
    nicknamePlaceholder: 'Takma adını yaz...',
    chatEmptyTitle: 'Kanal aktif!',
    chatEmptyDesc: 'İlk mesajı yazıp toplulukla sohbet edebilirsin.',
    messagePlaceholder: 'Mesaj yaz veya https:// link yapıştır...',
    send: 'Gönder',
    sending: 'Atılıyor...',
    errEmptyMsg: 'Lütfen önce bir mesaj veya link yaz.',
    errMuted: 'Küfür tespit edildi! 60sn ban yediniz. Kalan süre:',
    errSend: 'Gönderilemedi:',
    footerText:
      'GTA6takip, PortWatch projesinin kâr gütmeyen, hobi amaçlı alternatifidir. Rockstar Games veya Take-Two Interactive ile resmi bir bağlantısı yoktur.',
    stageLevel1: 'Temel Altyapı',
    stageLevel2: 'İlk Kare / Menü',
    stageLevel3: 'Oyun Dünyası',
    stageLevel4: 'Oynanabilir',
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
    commitPrefix: 'Latest GitHub commit:',
    chatTitle: 'Vice City Live Chat',
    chatSubtitle: 'Channels: #tr-genel & #en-general',
    live: 'Live',
    channelTr: '#tr-genel',
    channelEn: '#en-general',
    nicknameLabel: 'Nickname:',
    nicknamePlaceholder: 'Enter your nickname...',
    chatEmptyTitle: 'Channel is live!',
    chatEmptyDesc: 'Be the first to send a message in this channel.',
    messagePlaceholder: 'Type a message or paste an https:// link...',
    send: 'Send',
    sending: 'Sending...',
    errEmptyMsg: 'Please enter a message or link first.',
    errMuted: 'Profanity detected! You are banned for 60s. Remaining:',
    errSend: 'Failed to send:',
    footerText:
      'GTA6takip is a non-profit, hobbyist alternative to the PortWatch project. Not affiliated with Rockstar Games or Take-Two Interactive.',
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
    fps_tr: '3 FPS (RX 9070 XT)',
    fps_en: '3 FPS (RX 9070 XT)',
    stage_tr: 'Oynanabilir • İlk Bölüm',
    stage_en: 'Playable • First Act',
    desc_tr: "AMD Radeon için VIctory fork'u; açık dünya dokuları ve görevler oynanabilir durumda.",
    desc_en: 'VIctory fork for AMD Radeon; open world textures and missions are playable.',
    commit_msg: '',
    repo_url: 'https://github.com/Belobug/VIctory-Belobug-AMD',
    is_open_source: true,
    updated_at: null,
  },
  {
    id: 2,
    name: 'ZETTROX',
    percentage: 64.2,
    fps_tr: '2 FPS (NVIDIA)',
    fps_en: '2 FPS (NVIDIA)',
    stage_tr: 'Oynanabilir • Prologue Geçildi',
    stage_en: 'Playable • Prologue Cleared',
    desc_tr: 'Lucia prologue bölümünü geçip Jason\'ın ilk görevi "Gone Fishing" aşamasına ulaştı.',
    desc_en: 'Clears Lucia\'s prologue and reaches Jason\'s first mission "Gone Fishing".',
    commit_msg: '',
    repo_url: 'https://github.com/Zettrox/ztrx',
    is_open_source: true,
    updated_at: null,
  },
  {
    id: 3,
    name: 'suri',
    percentage: 61,
    fps_tr: '3 FPS',
    fps_en: '3 FPS',
    stage_tr: 'Oynanabilir • Kapalı Derleme',
    stage_en: 'Playable • Private Build',
    desc_tr: 'Kapalı ekip: victory-fork tabanlı özel derleme, perakende sürüme yakın ışıklandırma.',
    desc_en: 'Private build on victory-fork with lighting close to retail quality.',
    commit_msg: '',
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

  if (pct >= 50 || s.includes('playable') || s.includes('oynanabilir')) {
    level = 4;
    label = t.stageLevel4;
    boxClass = 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
    stepFill = 'bg-emerald-500';
  } else if (pct >= 40 || s.includes('world') || s.includes('dünya')) {
    level = 3;
    label = t.stageLevel3;
    boxClass = 'bg-amber-500/15 text-amber-500 border-amber-500/30';
    stepFill = 'bg-amber-500';
  } else if (pct >= 20 || s.includes('menu') || s.includes('menü') || s.includes('kare') || s.includes('frame')) {
    level = 2;
    label = t.stageLevel2;
    boxClass = 'bg-sky-500/15 text-sky-500 border-sky-500/30';
    stepFill = 'bg-sky-500';
  }

  return (
    <div
      title={`${t.stageTooltip} ${level}/4: ${stage || label}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold shrink-0 ${boxClass}`}
    >
      {level === 4 && (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="2" y="6" width="20" height="12" rx="4" />
          <path d="M6 12h4M8 10v4" strokeLinecap="round" />
          <circle cx="16" cy="11" r="1" fill="currentColor" />
          <circle cx="18" cy="13" r="1" fill="currentColor" />
        </svg>
      )}
      {level === 3 && (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      )}
      {level === 2 && (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" strokeLinecap="round" />
        </svg>
      )}
      {level === 1 && (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )}
      <span>{label}</span>
      <span className="hidden sm:inline-flex items-center gap-0.5 ml-0.5" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={`w-1.5 h-2.5 rounded-sm ${step <= level ? stepFill : 'bg-slate-400/30'}`}
          />
        ))}
      </span>
    </div>
  );
}

function renderMessageWithLinks(text) {
  if (!text) return null;
  const cleanText = censorText(text);
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = String(cleanText).split(urlRegex);

  return parts.map((part, idx) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-pink-500 underline decoration-pink-500/50 hover:text-orange-500 break-all font-medium"
        >
          <LinkIcon className="w-3.5 h-3.5 shrink-0" />
          {part}
        </a>
      );
    }
    return <span key={idx}>{part}</span>;
  });
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

function mergeChannelMessages(prevList, incomingList) {
  const merged = [...incomingList];
  for (const m of prevList) {
    const exists = merged.some(
      (d) =>
        String(d.id) === String(m.id) ||
        (d.username === m.username && d.message === m.message)
    );
    if (!exists) merged.push(m);
  }
  return merged.slice(-100);
}

export default function HomePage() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [syncing, setSyncing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showOnlinePanel, setShowOnlinePanel] = useState(false);
  const [theme, setTheme] = useState('portwatch-dark');
  const [lang, setLang] = useState('tr');

  const [chatChannel, setChatChannel] = useState('tr');
  const [messagesByChannel, setMessagesByChannel] = useState({ tr: [], en: [] });
  const [username, setUsername] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [chatError, setChatError] = useState('');
  const [sending, setSending] = useState(false);
  const [avatar, setAvatar] = useState('sunset');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [muteSeconds, setMuteSeconds] = useState(0);

  const chatChannelRef = useRef('tr');
  const chatBottomRef = useRef(null);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const currentMessages = messagesByChannel[chatChannel] || [];

  useEffect(() => {
    try {
      const savedName = localStorage.getItem('gta6takip_nick');
      if (savedName) setUsername(savedName);

      const savedTheme = localStorage.getItem('gta6takip_theme');
      if (savedTheme && THEMES.some((th) => th.id === savedTheme)) {
        setTheme(savedTheme);
      }

      const savedLang = localStorage.getItem('gta6takip_lang');
      if (savedLang === 'tr' || savedLang === 'en') {
        setLang(savedLang);
        setChatChannel(savedLang);
        chatChannelRef.current = savedLang;
      }

      const savedAvatar = localStorage.getItem('gta6takip_avatar');
      if (savedAvatar && AVATARS.some((a) => a.id === savedAvatar)) {
        setAvatar(savedAvatar);
      }

      const muteUntil = Number(localStorage.getItem('gta6takip_mute_until') || 0);
      if (muteUntil > Date.now()) {
        setMuteSeconds(Math.ceil((muteUntil - Date.now()) / 1000));
      }
    } catch {
      // ignore
    }

    handleAutoSync();
    fetchChatMessages(chatChannelRef.current);

    const chatPoll = setInterval(() => {
      fetchChatMessages(chatChannelRef.current);
    }, 4500);

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
      clearInterval(chatPoll);
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
    try {
      localStorage.setItem('gta6takip_avatar', avatar);
    } catch {
      // ignore
    }
  }, [avatar]);

  useEffect(() => {
    if (muteSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setMuteSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [muteSeconds]);

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

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, chatChannel]);

  function handleLanguageSwitch(nextLang) {
    setLang(nextLang);
    setChatChannel(nextLang);
    chatChannelRef.current = nextLang;
    fetchChatMessages(nextLang);
  }

  function handleChannelSwitch(nextChannel) {
    setChatChannel(nextChannel);
    chatChannelRef.current = nextChannel;
    fetchChatMessages(nextChannel);
  }

  async function fetchChatMessages(ch) {
    try {
      const res = await fetch(`/api/chat?channel=${ch}`, { cache: 'no-store' });
      const json = await res.json();
      if (json?.ok && Array.isArray(json.messages)) {
        setMessagesByChannel((prev) => ({
          ...prev,
          [ch]: mergeChannelMessages(prev[ch] || [], json.messages),
        }));
      }
    } catch {
      // ignore
    }
  }

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

  async function handleSendMessage(e) {
    if (e && e.preventDefault) e.preventDefault();
    setChatError('');

    if (muteSeconds > 0) {
      setChatError(`${t.errMuted} ${muteSeconds}${t.secShort}`);
      return;
    }

    const cleanMsg = newMessage.trim();
    const rawNick = username.trim().slice(0, 24) || 'ViceMisafir';

    if (!cleanMsg) {
      setChatError(t.errEmptyMsg);
      return;
    }

    if (containsProfanity(cleanMsg) || containsProfanity(rawNick)) {
      const muteDurationSec = 60;
      const until = Date.now() + muteDurationSec * 1000;
      setMuteSeconds(muteDurationSec);
      try {
        localStorage.setItem('gta6takip_mute_until', String(until));
      } catch {
        // ignore
      }
      setNewMessage('');
      setChatError(`${t.errMuted} ${muteDurationSec}${t.secShort}`);
      return;
    }

    if (sending) return;

    const targetCh = chatChannel;
    setSending(true);
    setNewMessage('');
    setShowEmojiPicker(false);

    try {
      localStorage.setItem('gta6takip_nick', rawNick);
    } catch {
      // ignore
    }

    const safeNick = censorText(rawNick);
    const safeMsg = censorText(cleanMsg.slice(0, 500));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: targetCh,
          username: safeNick,
          message: safeMsg,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setChatError(`${t.errSend} ${json.error || '?'}`);
        setNewMessage(cleanMsg);
      } else if (json.message) {
        setMessagesByChannel((prev) => ({
          ...prev,
          [targetCh]: mergeChannelMessages(prev[targetCh] || [], [json.message]),
        }));
      }
    } catch (err) {
      setChatError(`${t.errSend} ${err?.message || '?'}`);
      setNewMessage(cleanMsg);
    } finally {
      setSending(false);
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
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
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
                onClick={() => handleLanguageSwitch('tr')}
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
                onClick={() => handleLanguageSwitch('en')}
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
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs"
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

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 sm:py-6 relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

      {/* Ana İçerik: Sol Bar Çubukları + Sağ Discord Tarzı Çift Kanallı Chat */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-pink-500" />
              {t.leaderboardTitle} ({projects.length} {t.teamWord})
            </h2>
            <span style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
              {t.highToLow}
            </span>
          </div>

          <div className="lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto vice-scroll lg:pr-1.5">
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {projects.map((proj, index) => {
                const pct = Math.min(100, Math.max(0, Number(proj.percentage) || 0));
                const stageText = lang === 'en' ? (proj.stage_en || proj.stage) : (proj.stage_tr || proj.stage);
                const fpsText = lang === 'en' ? (proj.fps_en || proj.fps) : (proj.fps_tr || proj.fps);
                const descText = proj.commit_msg
                  ? `${t.commitPrefix} "${proj.commit_msg}"`
                  : (lang === 'en' ? (proj.desc_en || proj.description) : (proj.desc_tr || proj.description));

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
                      <StageVisualBadge percentage={pct} stage={stageText} t={t} />
                    </div>

                    <div
                      style={{ backgroundColor: 'var(--card-inner)', borderColor: 'var(--card-border)' }}
                      className="rounded-xl px-3 py-2 border mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <span className="font-semibold">
                        {t.stagePrefix} {stageText || t.developing}
                      </span>
                      <span
                        style={{ color: 'var(--text-secondary)' }}
                        className="inline-flex items-center gap-1.5 font-medium"
                      >
                        <Monitor className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                        <span>{fpsText && fpsText !== '-' ? fpsText : t.noFps}</span>
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 text-xs">
                      <div className="space-y-1">
                        <p style={{ color: 'var(--text-secondary)' }} className="leading-relaxed">
                          {descText}
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
          </div>
        </section>

        {/* Sağ: Discord Tarzı Çift Kanallı Sohbet */}
        <aside
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          className="lg:col-span-5 xl:col-span-4 rounded-2xl border overflow-hidden shadow-sm flex flex-col h-[580px] lg:sticky lg:top-[76px] lg:h-[calc(100vh-98px)]"
        >
          <div
            style={{ backgroundColor: 'var(--card-inner)', borderColor: 'var(--card-border)' }}
            className="p-3.5 border-b flex items-center justify-between gap-2 shrink-0"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl gta-bar-fill flex items-center justify-center text-white">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold">{t.chatTitle}</h2>
                <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
                  {t.chatSubtitle}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t.live}
            </span>
          </div>

          {/* Discord Tarzı Ayrı Dil Kanalları (#tr-genel | #en-general) */}
          <div
            style={{ borderColor: 'var(--card-border)' }}
            className="px-3 py-2 border-b grid grid-cols-2 gap-1.5 shrink-0"
          >
            <button
              type="button"
              onClick={() => handleChannelSwitch('tr')}
              className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                chatChannel === 'tr'
                  ? 'gta-bar-fill text-white shadow-sm'
                  : 'opacity-70 hover:opacity-100 border border-slate-500/20'
              }`}
            >
              <svg className="w-4 h-3 rounded-[2px] shrink-0" viewBox="0 0 30 20" aria-hidden="true">
                <rect width="30" height="20" fill="#E30A17" />
                <circle cx="11.5" cy="10" r="5" fill="#fff" />
                <circle cx="12.8" cy="10" r="4" fill="#E30A17" />
                <polygon points="16.5,10 19.2,9.1 17.5,11.4 17.5,8.6 19.2,10.9" fill="#fff" />
              </svg>
              <span>{t.channelTr}</span>
            </button>
            <button
              type="button"
              onClick={() => handleChannelSwitch('en')}
              className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                chatChannel === 'en'
                  ? 'gta-bar-fill text-white shadow-sm'
                  : 'opacity-70 hover:opacity-100 border border-slate-500/20'
              }`}
            >
              <svg className="w-4 h-3 rounded-[2px] shrink-0" viewBox="0 0 30 20" aria-hidden="true">
                <rect width="30" height="20" fill="#fff" />
                <rect y="0" width="30" height="2.8" fill="#B22234" />
                <rect y="5.7" width="30" height="2.8" fill="#B22234" />
                <rect y="11.4" width="30" height="2.8" fill="#B22234" />
                <rect y="17.1" width="30" height="2.9" fill="#B22234" />
                <rect width="13" height="11.4" fill="#3C3B6E" />
              </svg>
              <span>{t.channelEn}</span>
            </button>
          </div>

          {/* Nickname + SVG Avatar Seçici */}
          <div
            style={{ borderColor: 'var(--card-border)' }}
            className="px-4 py-2.5 border-b flex items-center gap-2 shrink-0 relative"
          >
            <button
              type="button"
              onClick={() => setShowAvatarPicker((prev) => !prev)}
              title="Avatar"
              className="rounded-lg hover:scale-105 transition cursor-pointer shrink-0"
            >
              <AvatarSvg avatarId={avatar} size="md" />
            </button>

            <label
              htmlFor="nickname-input"
              style={{ color: 'var(--text-secondary)' }}
              className="inline-flex items-center gap-1 text-xs font-semibold shrink-0"
            >
              <User className="w-3.5 h-3.5 text-pink-500" />
              {t.nicknameLabel}
            </label>
            <input
              id="nickname-input"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                try {
                  localStorage.setItem('gta6takip_nick', e.target.value);
                } catch {
                  // ignore
                }
              }}
              maxLength={24}
              placeholder={t.nicknamePlaceholder}
              style={{ backgroundColor: 'var(--card-inner)', borderColor: 'var(--card-border)' }}
              className="w-full rounded-xl border px-3 py-1.5 text-xs font-bold text-pink-500 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
            />

            {showAvatarPicker && (
              <div
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                className="absolute left-4 top-12 z-30 p-2 rounded-xl border shadow-xl flex items-center gap-1.5"
              >
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setAvatar(av.id);
                      setShowAvatarPicker(false);
                    }}
                    title={av.label}
                    className={`p-1 rounded-lg transition cursor-pointer ${
                      avatar === av.id ? 'ring-2 ring-pink-500' : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    <AvatarSvg avatarId={av.id} size="md" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto vice-scroll p-4 space-y-2.5">
            {currentMessages.length === 0 ? (
              <div
                style={{ color: 'var(--text-secondary)' }}
                className="h-full flex flex-col items-center justify-center text-center text-xs space-y-1.5 px-4"
              >
                <p className="font-semibold">{t.chatEmptyTitle}</p>
                <p>{t.chatEmptyDesc}</p>
              </div>
            ) : (
              currentMessages.map((msg, idx) => {
                const msgAvatar = getAvatarForUser(msg.username, username, avatar);
                return (
                  <div
                    key={msg.id || idx}
                    style={{ backgroundColor: 'var(--card-inner)', borderColor: 'var(--card-border)' }}
                    className="rounded-xl border p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <AvatarSvg avatarId={msgAvatar} size="sm" />
                        <span className="text-xs font-extrabold text-pink-500 truncate">
                          {censorText(msg.username)}
                        </span>
                      </div>
                      <span style={{ color: 'var(--text-secondary)' }} className="text-[10px] shrink-0">
                        {msg.created_at
                          ? new Date(msg.created_at).toLocaleTimeString(
                              lang === 'en' ? 'en-US' : 'tr-TR',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )
                          : ''}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed break-words pl-8">
                      {renderMessageWithLinks(msg.message)}
                    </p>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {(chatError || muteSeconds > 0) && (
            <div className="px-4 py-2 bg-rose-500/15 border-t border-rose-500/30 text-xs text-rose-500 font-semibold">
              {muteSeconds > 0 ? `${t.errMuted} ${muteSeconds}${t.secShort}` : chatError}
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            style={{ backgroundColor: 'var(--card-inner)', borderColor: 'var(--card-border)' }}
            className="p-3 border-t flex items-center gap-2 shrink-0 relative"
          >
            {showEmojiPicker && (
              <div
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                className="absolute bottom-14 left-3 z-30 p-2 rounded-xl border shadow-xl flex flex-wrap gap-1 max-w-[230px]"
              >
                {QUICK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      setNewMessage((prev) => `${prev}${em}`);
                      setShowEmojiPicker(false);
                    }}
                    className="w-8 h-8 rounded-lg hover:bg-pink-500/15 flex items-center justify-center text-base cursor-pointer transition"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              disabled={muteSeconds > 0}
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
              className="p-2 rounded-xl border hover:text-pink-500 transition cursor-pointer shrink-0 disabled:opacity-40"
              title="Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={newMessage}
              disabled={muteSeconds > 0}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={500}
              placeholder={
                muteSeconds > 0 ? `${t.errMuted} ${muteSeconds}${t.secShort}` : t.messagePlaceholder
              }
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-primary)',
              }}
              className="flex-1 min-w-0 rounded-xl border px-3 py-2 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || muteSeconds > 0}
              className="gta-bar-fill px-4 py-2 rounded-xl hover:brightness-110 disabled:opacity-40 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? t.sending : t.send}</span>
            </button>
          </form>
        </aside>
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
