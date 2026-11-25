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
  ShieldAlert,
  Sparkles,
  Link as LinkIcon,
  User,
  Trophy,
  Users,
  Clock,
  Palette,
  Smile,
  Trash2,
  Ban,
  LogOut,
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
  if (clean && clean.toLowerCase() === mine.toLowerCase()) {
    return myAvatar;
  }
  let hash = 0;
  for (let i = 0; i < clean.length; i += 1) {
    hash = (hash * 31 + clean.charCodeAt(i)) % AVATARS.length;
  }
  return AVATARS[Math.abs(hash) % AVATARS.length].id;
}

const BAD_WORDS = [
  'amk', 'aq', 'mk', 'mq', 'amq', 'amcık', 'amcik', 'orospu', 'orspu', 'oç', 'oc',
  'piç', 'pic', 'siktir', 'sikim', 'sikeyim', 'sikerim', 'sikik', 'sikiş', 'sik',
  'yarrak', 'yarak', 'taşak', 'tasak', 'göt', 'gotveren', 'götveren', 'pezevenk',
  'kahpe', 'kaltak', 'puşt', 'pust', 'ibne', 'gavat', 'şerefsiz', 'serefsiz',
  'haysiyetsiz', 'gerizekalı', 'salak', 'aptal', 'ananı', 'anani', 'bacını', 'bacini',
  'fuck', 'fucking', 'fucker', 'motherfucker', 'mf', 'shit', 'bullshit', 'bitch',
  'asshole', 'dick', 'cock', 'pussy', 'cunt', 'bastard', 'slut', 'whore',
  'faggot', 'retard', 'nigger', 'nigga', 'stfu', 'wtf',
];

const BAD_WORD_PATTERN = `(^|[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9])(${BAD_WORDS.join('|')})(?=[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9]|$)`;
const BAD_WORD_TEST = new RegExp(BAD_WORD_PATTERN, 'i');
const BAD_WORD_REPLACE = new RegExp(BAD_WORD_PATTERN, 'gi');

function containsProfanity(text) {
  if (!text) return false;
  return BAD_WORD_TEST.test(String(text));
}

function censorText(text) {
  if (!text) return '';
  return String(text).replace(BAD_WORD_REPLACE, (match, prefix, word) => {
    const masked = word[0] + '*'.repeat(Math.max(2, word.length - 1));
    return `${prefix}${masked}`;
  });
}

const TRANSLATIONS = {
  tr: {
    headerSubtitle: '120sn Otomatik İlerleme Takibi & Türkçe Canlı Sohbet',
    themeLabel: 'Tema Seç',
    online: 'Çevrimiçi',
    activeConnections: 'Aktif Bağlantılar',
    close: 'Kapat',
    leader: 'Lider:',
    syncing: 'Güncelleniyor...',
    autoRefresh: 'Oto Yenile',
    secShort: 'sn',
    heroBadge: 'Her 120 Saniyede Otomatik Tarama',
    heroTitle: 'Ekiplerin Tamamlanma Yüzdeleri',
    heroSubtitle:
      'Portlama ekiplerinin güncel ilerleme oranları, aşamaları ve anlık topluluk sohbeti.',
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
    notSynced: 'Henüz senkronize edilmedi',
    unknownTime: 'Bilinmiyor',
    source: 'Kaynak',
    chatTitle: 'Vice City Canlı Sohbet',
    chatSubtitle: 'Avatar seç, sohbet et ve link paylaş',
    live: 'Canlı',
    nicknameLabel: 'Nickname:',
    nicknamePlaceholder: 'Takma adını yaz...',
    chatEmptyTitle: 'Sohbet odası aktif!',
    chatEmptyDesc: "Nickname'ini yazıp ilk mesajı veya GTA VI port linkini paylaşabilirsin.",
    messagePlaceholder: 'Mesaj yaz veya https:// link yapıştır...',
    send: 'Gönder',
    sending: 'Atılıyor...',
    errEmptyMsg: 'Lütfen önce bir mesaj veya link yaz.',
    errMuted: 'Küfür/uygunsuz ifade tespit edildi. Kalan engel süresi:',
    errBanned: 'Bu kullanıcı adı yönetici tarafından banlandı.',
    errSend: 'Gönderilemedi:',
    errUnexpected: 'Beklenmeyen hata:',
    errRead: 'Sohbet okuma hatası:',
    footerText:
      'GTA6takip bağımsız bir topluluk takip sitesidir; Rockstar Games veya Take-Two ile resmi bağlantısı yoktur.',
    stageLevel1: 'Boot / Exe',
    stageLevel2: 'İlk Kare',
    stageLevel3: 'Oyun İçi',
    stageLevel4: 'Akıcı FPS',
    stageTooltip: 'Aşama Seviyesi',
    adminTitle: 'Admin Paneli',
    adminUser: 'Kullanıcı',
    adminPass: 'Şifre',
    adminLogin: 'Giriş',
    adminWrong: 'Kullanıcı adı veya şifre hatalı.',
    adminLogout: 'Çıkış',
    banBtn: 'Banla',
    delBtn: 'Sil',
    bannedListTitle: 'Banlı Kullanıcılar',
    unbanBtn: 'Kaldır',
  },
  en: {
    headerSubtitle: '120s Auto Progress Tracker & Live Community Chat',
    themeLabel: 'Select Theme',
    online: 'Online',
    activeConnections: 'Active Connections',
    close: 'Close',
    leader: 'Leader:',
    syncing: 'Syncing...',
    autoRefresh: 'Auto Refresh',
    secShort: 's',
    heroBadge: 'Auto Scan Every 120 Seconds',
    heroTitle: 'Team Completion Progress',
    heroSubtitle:
      'Live completion percentages, milestones, and community chat for PC port teams.',
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
    notSynced: 'Not synced yet',
    unknownTime: 'Unknown',
    source: 'Source',
    chatTitle: 'Vice City Live Chat',
    chatSubtitle: 'Pick an avatar, chat & share links',
    live: 'Live',
    nicknameLabel: 'Nickname:',
    nicknamePlaceholder: 'Enter your nickname...',
    chatEmptyTitle: 'Chat room is live!',
    chatEmptyDesc: 'Enter a nickname to send the first message or share a GTA VI port link.',
    messagePlaceholder: 'Type a message or paste an https:// link...',
    send: 'Send',
    sending: 'Sending...',
    errEmptyMsg: 'Please enter a message or link first.',
    errMuted: 'Profanity detected. You are muted for:',
    errBanned: 'This nickname has been banned by an admin.',
    errSend: 'Failed to send:',
    errUnexpected: 'Unexpected error:',
    errRead: 'Chat read error:',
    footerText:
      'GTA6takip is an independent community tracker; not affiliated with Rockstar Games or Take-Two.',
    stageLevel1: 'Boot / Exe',
    stageLevel2: 'First Frame',
    stageLevel3: 'In-Game',
    stageLevel4: 'Smooth FPS',
    stageTooltip: 'Stage Level',
    adminTitle: 'Admin Panel',
    adminUser: 'Username',
    adminPass: 'Password',
    adminLogin: 'Login',
    adminWrong: 'Invalid username or password.',
    adminLogout: 'Logout',
    banBtn: 'Ban',
    delBtn: 'Delete',
    bannedListTitle: 'Banned Users',
    unbanBtn: 'Unban',
  },
};

const FALLBACK_PROJECTS = [
  {
    id: 1,
    name: 'omonkey',
    percentage: 79,
    fps: '~5 FPS',
    stage: 'Oyun İçi (Hapishane)',
    description:
      'Lucia hapishane sahnesinde shader yüklemesi ve karakter hareketi sağlandı; Rumble üzerinde canlı yayınlanıyor.',
    repo_url: 'https://t.me/omonkey6',
    is_open_source: false,
    updated_at: null,
  },
  {
    id: 2,
    name: 'Hyphen (fxceless)',
    percentage: 78,
    fps: '3 FPS (RTX 4090)',
    stage: 'Oyun İçi (3D Render)',
    description:
      'VIctory + XCL birleşimiyle en gelişmiş 3D grafik renderı ve erken raytracing ışıklandırması elde edildi.',
    repo_url: 'https://github.com/fxceless/victory-gta6',
    is_open_source: true,
    updated_at: null,
  },
  {
    id: 3,
    name: 'CGBJ',
    percentage: 72,
    fps: 'Bilinmiyor',
    stage: 'Oyun İçi (Prologue)',
    description:
      'Açılış ara sahnesi ("Nine Months Ago") ve oyun içi telefon arayüzü çalıştırıldı; gizli kolektif olarak ilerliyor.',
    repo_url: 'https://gta6recomp.com/repo',
    is_open_source: false,
    updated_at: null,
  },
  {
    id: 4,
    name: 'VIctory',
    percentage: 70,
    fps: '30 FPS (Menü)',
    stage: 'Oyun İçi (Siyah Ekran)',
    description:
      'Açık kaynaklı ana uyumluluk katmanı; menülerde 30 FPS çalışıyor, 3D oyun içi shader desteği geliştiriliyor.',
    repo_url: 'https://github.com/Marvisak/VIctory',
    is_open_source: true,
    updated_at: null,
  },
  {
    id: 5,
    name: 'JoshuuDev (victory-amd)',
    percentage: 68,
    fps: 'Ara Sahne / DX12',
    stage: 'Oyun İçi (3D Ara Sahneler)',
    description:
      'AMD GPU uyumluluğu, DX12 ve shader cache ısıtma iyileştirmeleriyle temiz renkli 3D oyun içi ara sahneler ve neon ışıklandırma elde edildi.',
    repo_url: 'https://github.com/JoshuuDev/victory-amd',
    is_open_source: true,
    updated_at: null,
  },
  {
    id: 6,
    name: 'AnyXboxX',
    percentage: 65,
    fps: '3.2 FPS (720p)',
    stage: 'Oyun İçi (Eğitim)',
    description:
      'Kontrol edilebilir karakter ve hareket eğitim ekranı açıldı; kalan untranslated shader sayısı azaltılıyor.',
    repo_url: 'https://github.com/LooperSalty/AnyXboxX',
    is_open_source: true,
    updated_at: null,
  },
  {
    id: 7,
    name: 'XCL',
    percentage: 63,
    fps: '30 FPS (Intro)',
    stage: 'Dünya Yükleme',
    description:
      'Wine benzeri uyumluluk katmanı; binlerce shader işlendi, oyun dünyasında yayalar ve araçlar spawn oluyor.',
    repo_url: 'https://github.com/ivall/xcl',
    is_open_source: true,
    updated_at: null,
  },
  {
    id: 8,
    name: 'Xbox2Windows',
    percentage: 48,
    fps: '-',
    stage: 'İlk Kare (First Frame)',
    description:
      'Statik yeniden derleme ve shader çözümleme hattı ile ilk kare görüntüsüne ulaşıldı.',
    repo_url: 'https://github.com/R0Y00/Xbox2Windows',
    is_open_source: true,
    updated_at: null,
  },
  {
    id: 9,
    name: 'Palmetto',
    percentage: 25,
    fps: '-',
    stage: 'Exe Başlatma (Boot)',
    description:
      'Düşük seviyeli bellek eşleme ve .exe yükleme altyapısı geliştiriliyor.',
    repo_url: 'https://github.com/luizwidmer/palmetto',
    is_open_source: true,
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

  if (pct >= 85 || s.includes('60 fps') || s.includes('akıcı')) {
    level = 4;
    label = t.stageLevel4;
    boxClass = 'bg-amber-500/15 text-amber-500 border-amber-500/30';
    stepFill = 'bg-amber-500';
  } else if (pct >= 60 || s.includes('oyun içi') || s.includes('dünya')) {
    level = 3;
    label = t.stageLevel3;
    boxClass = 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
    stepFill = 'bg-emerald-500';
  } else if (pct >= 40 || s.includes('ilk kare') || s.includes('menü')) {
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

export default function HomePage() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [messages, setMessages] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [chatError, setChatError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showOnlinePanel, setShowOnlinePanel] = useState(false);
  const [theme, setTheme] = useState('portwatch-dark');
  const [lang, setLang] = useState('tr');
  const [avatar, setAvatar] = useState('sunset');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [muteSeconds, setMuteSeconds] = useState(0);

  const [showAdminBox, setShowAdminBox] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUserInput, setAdminUserInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminError, setAdminError] = useState('');

  const sessionIdRef = useRef('');
  const nickRef = useRef('ViceMisafir');
  const chatBottomRef = useRef(null);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;

  useEffect(() => {
    try {
      let sid = sessionStorage.getItem('gta6takip_sid');
      if (!sid) {
        sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('gta6takip_sid', sid);
      }
      sessionIdRef.current = sid;

      const savedName = localStorage.getItem('gta6takip_nick');
      if (savedName) {
        setUsername(savedName);
        nickRef.current = savedName;
      }

      const savedTheme = localStorage.getItem('gta6takip_theme');
      if (savedTheme && THEMES.some((th) => th.id === savedTheme)) {
        setTheme(savedTheme);
      }

      const savedLang = localStorage.getItem('gta6takip_lang');
      if (savedLang === 'tr' || savedLang === 'en') {
        setLang(savedLang);
      }

      const savedAvatar = localStorage.getItem('gta6takip_avatar');
      if (savedAvatar && AVATARS.some((a) => a.id === savedAvatar)) {
        setAvatar(savedAvatar);
      }

      const savedAdmin = localStorage.getItem('gta6takip_is_admin');
      if (savedAdmin === '1') setIsAdmin(true);

      const muteUntil = Number(localStorage.getItem('gta6takip_mute_until') || 0);
      if (muteUntil > Date.now()) {
        setMuteSeconds(Math.ceil((muteUntil - Date.now()) / 1000));
      }
    } catch {
      sessionIdRef.current = Math.random().toString(36).slice(2);
    }

    fetchProjects();
    fetchChatState();

    const chatPoll = setInterval(fetchChatState, 5000);
    return () => clearInterval(chatPoll);
  }, []);

  useEffect(() => {
    nickRef.current = username.trim().slice(0, 24) || 'ViceMisafir';
  }, [username]);

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
  }, [messages.length]);

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('percentage', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const cleaned = data.map((item, idx) => ({
          ...item,
          id: item.id || idx + 1,
          name: item.name || FALLBACK_PROJECTS[idx]?.name || `Ekip ${idx + 1}`,
          percentage:
            typeof item.percentage === 'number'
              ? item.percentage
              : FALLBACK_PROJECTS[idx]?.percentage || 0,
        }));
        setProjects(cleaned);
      }
    } catch {
      setProjects(FALLBACK_PROJECTS);
    }
  }

  async function fetchChatState() {
    try {
      const sid = encodeURIComponent(sessionIdRef.current || '');
      const nick = encodeURIComponent(nickRef.current || 'ViceMisafir');
      const res = await fetch(`/api/chat?sid=${sid}&nick=${nick}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.ok) {
        setMessages(Array.isArray(json.messages) ? json.messages : []);
        setBannedUsers(Array.isArray(json.bannedUsers) ? json.bannedUsers : []);
        if (Array.isArray(json.onlineUsers) && json.onlineUsers.length > 0) {
          setOnlineUsers(json.onlineUsers);
        }
        if (json.error) setChatError(`${t.errRead} ${json.error}`);
      } else if (json.error) {
        setChatError(`${t.errRead} ${json.error}`);
      }
    } catch {
      // sessiz geç
    }
  }

  function handleAdminLogin(e) {
    e.preventDefault();
    setAdminError('');
    if (adminUserInput.trim() === 'admin' && adminPassInput.trim() === '657210') {
      setIsAdmin(true);
      setAdminUserInput('');
      setAdminPassInput('');
      try {
        localStorage.setItem('gta6takip_is_admin', '1');
      } catch {
        // ignore
      }
    } else {
      setAdminError(t.adminWrong);
    }
  }

  function handleAdminLogout() {
    setIsAdmin(false);
    setAdminError('');
    setShowAdminBox(false);
    try {
      localStorage.removeItem('gta6takip_is_admin');
    } catch {
      // ignore
    }
  }

  async function handleDeleteMessage(msgId) {
    if (!isAdmin || !msgId) return;
    setAdminError('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: msgId, adminPass: '657210' }),
      });
      const json = await res.json();
      if (!json.ok) {
        setAdminError(json.error || 'Silinemedi');
        setShowAdminBox(true);
        return;
      }
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err) {
      setAdminError(err?.message || 'Silme hatası');
    }
  }

  async function handleBanUser(targetName) {
    if (!isAdmin || !targetName) return;
    setAdminError('');
    const cleanTarget = targetName.trim().toLowerCase();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban', username: targetName, adminPass: '657210' }),
      });
      const json = await res.json();
      if (!json.ok) {
        setAdminError(json.error || 'Banlanamadı');
        setShowAdminBox(true);
        return;
      }
      setBannedUsers((prev) => (prev.includes(cleanTarget) ? prev : [...prev, cleanTarget]));
      setMessages((prev) =>
        prev.filter((m) => String(m.username || '').trim().toLowerCase() !== cleanTarget)
      );
    } catch (err) {
      setAdminError(err?.message || 'Banlama hatası');
    }
  }

  async function handleUnbanUser(targetName) {
    if (!isAdmin || !targetName) return;
    setAdminError('');
    const cleanTarget = targetName.trim().toLowerCase();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unban', username: targetName, adminPass: '657210' }),
      });
      const json = await res.json();
      if (!json.ok) {
        setAdminError(json.error || 'Kaldırılamadı');
        return;
      }
      setBannedUsers((prev) => prev.filter((u) => u !== cleanTarget));
    } catch (err) {
      setAdminError(err?.message || 'Ban kaldırma hatası');
    }
  }

  async function handleAutoSync() {
    if (syncing) return;
    setSyncing(true);
    const nowIso = new Date().toISOString();

    try {
      await fetch('/api/sync').catch(() => {});
      await fetchProjects();
      setSecondsLeft(120);
    } catch {
      setProjects((prev) =>
        prev.map((item) => ({ ...item, updated_at: nowIso }))
      );
      setSecondsLeft(120);
    } finally {
      setSyncing(false);
    }
  }

  const rawCurrentNick = username.trim().slice(0, 24) || 'ViceMisafir';
  const isCurrentUserBanned = bannedUsers.includes(rawCurrentNick.toLowerCase());

  async function handleSendMessage(e) {
    if (e && e.preventDefault) e.preventDefault();
    setChatError('');

    if (isCurrentUserBanned) {
      setChatError(t.errBanned);
      return;
    }

    if (muteSeconds > 0) {
      setChatError(`${t.errMuted} ${muteSeconds}${t.secShort}`);
      return;
    }

    const cleanMsg = newMessage.trim();
    if (!cleanMsg) {
      setChatError(t.errEmptyMsg);
      return;
    }

    if (containsProfanity(cleanMsg) || containsProfanity(rawCurrentNick)) {
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

    setSending(true);
    setNewMessage('');
    setShowEmojiPicker(false);

    try {
      localStorage.setItem('gta6takip_nick', rawCurrentNick);
    } catch {
      // ignore
    }

    const safeNick = censorText(rawCurrentNick);
    const safeMsg = censorText(cleanMsg.slice(0, 500));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', username: safeNick, message: safeMsg }),
      });
      const json = await res.json();

      if (!json.ok) {
        setChatError(`${t.errSend} ${json.error || '?'}`);
        setNewMessage(cleanMsg);
      } else if (json.message) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === json.message.id);
          return exists ? prev : [...prev, json.message];
        });
      } else {
        await fetchChatState();
      }
    } catch (err) {
      setChatError(`${t.errUnexpected} ${err?.message || '?'}`);
      setNewMessage(cleanMsg);
    } finally {
      setSending(false);
    }
  }

  const topScore =
    projects.length > 0
      ? Math.max(...projects.map((p) => Number(p.percentage) || 0))
      : 79;

  const leaderName = projects[0]?.name || 'omonkey';
  const onlineCount = Math.max(1, onlineUsers.length);
  const visibleMessages = messages.filter(
    (m) => !bannedUsers.includes(String(m.username || '').trim().toLowerCase())
  );

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
                    {(onlineUsers.length > 0 ? onlineUsers : [rawCurrentNick]).map((nick, i) => (
                      <li
                        key={`${nick}-${i}`}
                        style={{ backgroundColor: 'var(--card-inner)' }}
                        className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate font-semibold">{censorText(nick)}</span>
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

      {/* Ana İçerik: Sol Bar Çubukları + Sağ Sohbet */}
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
          </div>
        </section>

        {/* Sağ: Vice City Canlı Sohbet */}
        <aside
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          className="lg:col-span-5 xl:col-span-4 rounded-2xl border overflow-hidden shadow-sm flex flex-col h-[560px] lg:sticky lg:top-[76px] lg:h-[calc(100vh-98px)]"
        >
          <div
            style={{ backgroundColor: 'var(--card-inner)', borderColor: 'var(--card-border)' }}
            className="p-4 border-b flex items-center justify-between gap-2 shrink-0"
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
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowAdminBox((prev) => !prev)}
                title={t.adminTitle}
                className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                  isAdmin
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                    : 'bg-slate-500/10 border-slate-500/20 opacity-70 hover:opacity-100'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t.live}
              </span>
            </div>
          </div>

          {showAdminBox && (
            <div
              style={{ backgroundColor: 'var(--card-inner)', borderColor: 'var(--card-border)' }}
              className="px-4 py-3 border-b space-y-2 shrink-0"
            >
              {!isAdmin ? (
                <form onSubmit={handleAdminLogin} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{t.adminTitle}</span>
                    {adminError && <span className="text-rose-500 text-[11px]">{adminError}</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={adminUserInput}
                      onChange={(e) => setAdminUserInput(e.target.value)}
                      placeholder={t.adminUser}
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                      className="w-1/3 rounded-lg border px-2.5 py-1 text-xs focus:outline-none"
                    />
                    <input
                      type="password"
                      value={adminPassInput}
                      onChange={(e) => setAdminPassInput(e.target.value)}
                      placeholder={t.adminPass}
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                      className="w-1/3 rounded-lg border px-2.5 py-1 text-xs focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="w-1/3 gta-bar-fill text-white rounded-lg py-1 text-xs font-bold cursor-pointer"
                    >
                      {t.adminLogin}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-500">
                      ✓ {t.adminTitle} ({t.bannedListTitle}: {bannedUsers.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAdminLogout}
                      className="inline-flex items-center gap-1 text-[11px] text-rose-500 font-bold hover:underline cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      {t.adminLogout}
                    </button>
                  </div>
                  {adminError && <p className="text-[11px] text-rose-500 font-medium">{adminError}</p>}
                  {bannedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {bannedUsers.map((bu) => (
                        <span
                          key={bu}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-rose-500/15 text-rose-500 border border-rose-500/25"
                        >
                          <span>{bu}</span>
                          <button
                            type="button"
                            onClick={() => handleUnbanUser(bu)}
                            className="font-bold hover:underline cursor-pointer"
                            title={t.unbanBtn}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
            {visibleMessages.length === 0 ? (
              <div
                style={{ color: 'var(--text-secondary)' }}
                className="h-full flex flex-col items-center justify-center text-center text-xs space-y-1.5 px-4"
              >
                <p className="font-semibold">{t.chatEmptyTitle}</p>
                <p>{t.chatEmptyDesc}</p>
              </div>
            ) : (
              visibleMessages.map((msg, idx) => {
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
                      <div className="flex items-center gap-2 shrink-0">
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg.id)}
                              title={t.delBtn}
                              className="p-1 rounded hover:bg-rose-500/15 text-rose-500 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBanUser(msg.username)}
                              title={t.banBtn}
                              className="p-1 rounded hover:bg-rose-500/15 text-rose-500 cursor-pointer"
                            >
                              <Ban className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <span style={{ color: 'var(--text-secondary)' }} className="text-[10px]">
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

          {(chatError || muteSeconds > 0 || isCurrentUserBanned) && (
            <div className="px-4 py-2 bg-rose-500/15 border-t border-rose-500/30 text-xs text-rose-500 font-semibold">
              {isCurrentUserBanned
                ? t.errBanned
                : muteSeconds > 0
                  ? `${t.errMuted} ${muteSeconds}${t.secShort}`
                  : chatError}
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
              disabled={muteSeconds > 0 || isCurrentUserBanned}
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
              className="p-2 rounded-xl border hover:text-pink-500 transition cursor-pointer shrink-0 disabled:opacity-40"
              title="Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={newMessage}
              disabled={muteSeconds > 0 || isCurrentUserBanned}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={500}
              placeholder={
                isCurrentUserBanned
                  ? t.errBanned
                  : muteSeconds > 0
                    ? `${t.errMuted} ${muteSeconds}${t.secShort}`
                    : t.messagePlaceholder
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
              disabled={sending || muteSeconds > 0 || isCurrentUserBanned}
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
