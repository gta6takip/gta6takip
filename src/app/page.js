'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const APP_VERSION = 'v1.0.37';
const CHAT_COOLDOWN_SEC = 60;
const CHAT_COOLDOWN_KEY = 'gta6takip_chat_cooldown_until';
const CHAT_NICK_KEY = 'gta6takip_nick';

// Supabase (sadece okuma + Realtime presence/chat için anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// 5 Tema — Sıra: Vice Sunset (varsayılan) -> Açık -> Koyu -> Leonida Neon -> Ocean Drive
const THEMES = [
  {
    id: 'vice',
    labelTr: 'Vice Sunset',
    labelEn: 'Vice Sunset',
    dot: 'bg-gradient-to-r from-pink-500 to-amber-400',
    bg: 'bg-[#12091c] text-slate-100',
    header: 'bg-[#180d26]/95 border-pink-500/25',
    card: 'bg-[#1e1030]/90 border-pink-500/20',
    cardSoft: 'bg-[#26143d]/85 border-pink-400/20',
    dropdown: 'bg-[#1c0f2e] border-pink-500/35 text-slate-100 shadow-2xl',
    input: 'bg-[#130920] border-pink-500/30 text-slate-100 placeholder-slate-400',
    accentText: 'text-pink-400',
    accentBg: 'bg-gradient-to-r from-pink-500 to-amber-500 text-white',
    badgeOpen: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35',
    badgeClosed: 'bg-amber-500/20 text-amber-300 border-amber-400/35',
    badgeVerified: 'bg-sky-500/20 text-sky-300 border-sky-400/35',
    muted: 'text-slate-300/80',
    pill: 'bg-[#2a1742] border-pink-500/30 text-slate-100 hover:bg-[#351d52]',
    progressTrack: 'bg-white/10',
    progressBar: 'bg-gradient-to-r from-pink-500 via-fuchsia-400 to-amber-400',
    chatBubble: 'bg-[#26143d] border-pink-500/20',
    replyBox: 'bg-[#160b26] border-l-2 border-pink-400',
  },
  {
    id: 'light',
    labelTr: 'Açık',
    labelEn: 'Light',
    dot: 'bg-gradient-to-r from-sky-500 to-indigo-500',
    bg: 'bg-slate-50 text-slate-900',
    header: 'bg-white/95 border-slate-200',
    card: 'bg-white border-slate-200 shadow-sm',
    cardSoft: 'bg-slate-100/90 border-slate-200',
    dropdown: 'bg-white border-slate-300 text-slate-900 shadow-2xl',
    input: 'bg-white border-slate-300 text-slate-900 placeholder-slate-500',
    accentText: 'text-indigo-600',
    accentBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    badgeOpen: 'bg-emerald-100 text-emerald-900 border-emerald-400',
    badgeClosed: 'bg-amber-100 text-amber-900 border-amber-400',
    badgeVerified: 'bg-sky-100 text-sky-900 border-sky-400',
    muted: 'text-slate-600',
    pill: 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200',
    progressTrack: 'bg-slate-200',
    progressBar: 'bg-gradient-to-r from-indigo-600 to-sky-500',
    chatBubble: 'bg-slate-100 border-slate-200',
    replyBox: 'bg-white border-l-2 border-indigo-500',
  },
  {
    id: 'dark',
    labelTr: 'Koyu',
    labelEn: 'Dark',
    dot: 'bg-gradient-to-r from-zinc-500 to-slate-300',
    bg: 'bg-[#0b0d12] text-slate-100',
    header: 'bg-[#11141c]/95 border-slate-800',
    card: 'bg-[#141822] border-slate-800',
    cardSoft: 'bg-[#1a202e] border-slate-700/70',
    dropdown: 'bg-[#141822] border-slate-700 text-slate-100 shadow-2xl',
    input: 'bg-[#0e1118] border-slate-700 text-slate-100 placeholder-slate-400',
    accentText: 'text-sky-400',
    accentBg: 'bg-sky-600 hover:bg-sky-500 text-white',
    badgeOpen: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
    badgeClosed: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
    badgeVerified: 'bg-sky-500/20 text-sky-300 border-sky-500/35',
    muted: 'text-slate-400',
    pill: 'bg-[#1b2130] border-slate-700 text-slate-100 hover:bg-[#232b3e]',
    progressTrack: 'bg-slate-800',
    progressBar: 'bg-gradient-to-r from-sky-500 to-cyan-400',
    chatBubble: 'bg-[#1a202e] border-slate-700/70',
    replyBox: 'bg-[#10141e] border-l-2 border-sky-400',
  },
  {
    id: 'neon',
    labelTr: 'Leonida Neon',
    labelEn: 'Leonida Neon',
    dot: 'bg-gradient-to-r from-fuchsia-500 to-cyan-400',
    bg: 'bg-[#090614] text-fuchsia-50',
    header: 'bg-[#100a21]/95 border-fuchsia-500/30',
    card: 'bg-[#140d29] border-fuchsia-500/25',
    cardSoft: 'bg-[#1c1238] border-cyan-400/25',
    dropdown: 'bg-[#140d29] border-fuchsia-500/40 text-fuchsia-50 shadow-2xl',
    input: 'bg-[#0d081c] border-fuchsia-500/35 text-fuchsia-50 placeholder-fuchsia-300/50',
    accentText: 'text-cyan-400',
    accentBg: 'bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white',
    badgeOpen: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    badgeClosed: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    badgeVerified: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    muted: 'text-fuchsia-200/75',
    pill: 'bg-[#1e133b] border-fuchsia-500/35 text-fuchsia-50 hover:bg-[#291a4f]',
    progressTrack: 'bg-white/10',
    progressBar: 'bg-gradient-to-r from-fuchsia-500 to-cyan-400',
    chatBubble: 'bg-[#1c1238] border-fuchsia-500/25',
    replyBox: 'bg-[#100924] border-l-2 border-cyan-400',
  },
  {
    id: 'ocean',
    labelTr: 'Ocean Drive',
    labelEn: 'Ocean Drive',
    dot: 'bg-gradient-to-r from-teal-400 to-blue-500',
    bg: 'bg-[#06151c] text-teal-50',
    header: 'bg-[#091e28]/95 border-teal-500/25',
    card: 'bg-[#0c2530] border-teal-500/20',
    cardSoft: 'bg-[#113140] border-teal-400/20',
    dropdown: 'bg-[#0c2530] border-teal-500/40 text-teal-50 shadow-2xl',
    input: 'bg-[#071921] border-teal-500/30 text-teal-50 placeholder-teal-200/50',
    accentText: 'text-teal-300',
    accentBg: 'bg-gradient-to-r from-teal-500 to-sky-500 text-white',
    badgeOpen: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35',
    badgeClosed: 'bg-amber-500/20 text-amber-300 border-amber-400/35',
    badgeVerified: 'bg-sky-500/20 text-sky-300 border-sky-400/35',
    muted: 'text-teal-100/75',
    pill: 'bg-[#123342] border-teal-500/30 text-teal-50 hover:bg-[#174154]',
    progressTrack: 'bg-white/10',
    progressBar: 'bg-gradient-to-r from-teal-400 to-sky-400',
    chatBubble: 'bg-[#113140] border-teal-500/20',
    replyBox: 'bg-[#081b24] border-l-2 border-teal-300',
  },
];

// Inline SVG Bayraklar (TR / EN)
function TrFlagSvg({ className = 'w-4 h-3 rounded-[2px]' }) {
  return (
    <svg viewBox="0 0 36 24" className={className} aria-hidden="true">
      <rect width="36" height="24" fill="#E30A17" />
      <circle cx="14" cy="12" r="6" fill="#fff" />
      <circle cx="15.5" cy="12" r="4.8" fill="#E30A17" />
      <polygon
        fill="#fff"
        points="21.5,12 23.2,12.6 22.1,11.1 22.1,12.9 23.2,11.4"
        transform="translate(-1.5,0) scale(1.1)"
      />
    </svg>
  );
}

function EnFlagSvg({ className = 'w-4 h-3 rounded-[2px]' }) {
  return (
    <svg viewBox="0 0 36 24" className={className} aria-hidden="true">
      <rect width="36" height="24" fill="#012169" />
      <path d="M0,0 L36,24 M36,0 L0,24" stroke="#fff" strokeWidth="4" />
      <path d="M0,0 L36,24 M36,0 L0,24" stroke="#C8102E" strokeWidth="2" />
      <path d="M18,0 V24 M0,12 H36" stroke="#fff" strokeWidth="6" />
      <path d="M18,0 V24 M0,12 H36" stroke="#C8102E" strokeWidth="3.5" />
    </svg>
  );
}

// Ülke adları (TR / EN)
const COUNTRY_NAMES = {
  TR: { tr: 'Türkiye', en: 'Turkey' },
  US: { tr: 'ABD', en: 'USA' },
  DE: { tr: 'Almanya', en: 'Germany' },
  GB: { tr: 'Birleşik Krallık', en: 'United Kingdom' },
  FR: { tr: 'Fransa', en: 'France' },
  NL: { tr: 'Hollanda', en: 'Netherlands' },
  AZ: { tr: 'Azerbaycan', en: 'Azerbaijan' },
  BR: { tr: 'Brezilya', en: 'Brazil' },
  RU: { tr: 'Rusya', en: 'Russia' },
  CA: { tr: 'Kanada', en: 'Canada' },
  PL: { tr: 'Polonya', en: 'Poland' },
  ES: { tr: 'İspanya', en: 'Spain' },
  IT: { tr: 'İtalya', en: 'Italy' },
  XX: { tr: 'Diğer', en: 'Other' },
};

// Her zaman Türkiye Saati (Europe/Istanbul — TSİ / TRT) formatlayıcı
function formatIstanbulTime(isoString, lang = 'tr', includeDate = true) {
  if (!isoString) return lang === 'tr' ? 'Bilinmiyor' : 'Unknown';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return lang === 'tr' ? 'Bilinmiyor' : 'Unknown';

  const locale = lang === 'tr' ? 'tr-TR' : 'en-GB';
  const options = includeDate
    ? {
        timeZone: 'Europe/Istanbul',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    : {
        timeZone: 'Europe/Istanbul',
        hour: '2-digit',
        minute: '2-digit',
      };

  const formatted = new Intl.DateTimeFormat(locale, options).format(date);
  return `${formatted} ${lang === 'tr' ? 'TSİ' : 'TRT'}`;
}

export default function HomePage() {
  const [themeId, setThemeId] = useState('vice');
  const [lang, setLang] = useState('tr');

  // Dropdown state (tek seferde sadece biri açık)
  const [openDropdown, setOpenDropdown] = useState(null); // 'theme' | 'online' | null
  const headerRef = useRef(null);

  // Tracker verileri
  const [syncData, setSyncData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCat, setFilterCat] = useState('all'); // 'all' | 'open' | 'closed'
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllMobile, setShowAllMobile] = useState(false);

  // Online ziyaretçiler & ülke dağılımı
  const [onlineCount, setOnlineCount] = useState(1);
  const [countryBreakdown, setCountryBreakdown] = useState({});

  // Canlı Sohbet state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatNick, setChatNick] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const [replyTo, setReplyTo] = useState(null); // { id, nickname, message }
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const chatScrollRef = useRef(null);
  const chatInputRef = useRef(null);

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  // Tavsiye / Fikir Modal state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('idle'); // idle | sending | sent | error

  // Yukarı çık butonu
  const [showScrollTop, setShowScrollTop] = useState(false);

  const theme = useMemo(
    () => THEMES.find((t) => t.id === themeId) || THEMES[0],
    [themeId]
  );

  // localStorage tercihlerini yükle
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('gta6takip_theme');
      if (savedTheme && THEMES.some((t) => t.id === savedTheme)) {
        setThemeId(savedTheme);
      }
      const savedLang = localStorage.getItem('gta6takip_lang');
      if (savedLang === 'tr' || savedLang === 'en') {
        setLang(savedLang);
      }
      const savedNick = localStorage.getItem(CHAT_NICK_KEY);
      if (savedNick) {
        setChatNick(savedNick);
      }
      const savedUntil = Number(localStorage.getItem(CHAT_COOLDOWN_KEY) || '0');
      if (savedUntil > Date.now()) {
        setCooldownLeft(Math.ceil((savedUntil - Date.now()) / 1000));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // 60 saniyelik geri sayım sayacı
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const timer = setInterval(() => {
      try {
        const until = Number(localStorage.getItem(CHAT_COOLDOWN_KEY) || '0');
        const remain = Math.ceil((until - Date.now()) / 1000);
        if (remain <= 0) {
          setCooldownLeft(0);
          localStorage.removeItem(CHAT_COOLDOWN_KEY);
        } else {
          setCooldownLeft(remain);
        }
      } catch {
        setCooldownLeft((prev) => (prev > 1 ? prev - 1 : 0));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownLeft > 0]);

  const startCooldown = useCallback((seconds = CHAT_COOLDOWN_SEC) => {
    const sec = Math.max(1, Math.min(CHAT_COOLDOWN_SEC, Math.ceil(seconds)));
    const until = Date.now() + sec * 1000;
    try {
      localStorage.setItem(CHAT_COOLDOWN_KEY, String(until));
    } catch {
      // ignore
    }
    setCooldownLeft(sec);
  }, []);

  const handleThemeChange = (id) => {
    setThemeId(id);
    setOpenDropdown(null);
    try {
      localStorage.setItem('gta6takip_theme', id);
    } catch {}
  };

  const handleLangChange = (nextLang) => {
    setLang(nextLang);
    try {
      localStorage.setItem('gta6takip_lang', nextLang);
    } catch {}
  };

  const handleNickChange = (val) => {
    const trimmed = val.slice(0, 20);
    setChatNick(trimmed);
    try {
      localStorage.setItem(CHAT_NICK_KEY, trimmed);
    } catch {}
  };

  // Dropdown dışına tıklama veya ESC ile kapatma
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setFeedbackOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Scroll-to-top görünürlüğü
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 360);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // /api/sync veri çekme (120sn otomatik yenileme)
  const fetchTracker = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSyncData(data);
      }
    } catch {
      // ignore network error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTracker(false);
    const interval = setInterval(() => fetchTracker(false), 120_000);
    return () => clearInterval(interval);
  }, [fetchTracker]);

  // Supabase Presence (Çevrimiçi & Ülke bayrakları)
  useEffect(() => {
    if (!supabase) return;
    let channel;
    let active = true;

    async function setupPresence() {
      let cc = 'TR';
      try {
        const res = await fetch('/api/geo');
        if (res.ok) {
          const json = await res.json();
          if (json?.country) cc = String(json.country).toUpperCase();
        }
      } catch {}

      if (!active) return;

      const userKey = `u_${Math.random().toString(36).slice(2, 10)}`;
      channel = supabase.channel('gta6takip_online', {
        config: { presence: { key: userKey } },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const counts = {};
          let total = 0;
          Object.values(state).forEach((entries) => {
            entries.forEach((entry) => {
              total += 1;
              const code = (entry.country || 'XX').toUpperCase();
              counts[code] = (counts[code] || 0) + 1;
            });
          });
          setOnlineCount(Math.max(1, total));
          setCountryBreakdown(counts);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ country: cc, online_at: new Date().toISOString() });
          }
        });
    }

    setupPresence();
    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Canlı Sohbet mesajlarını yükle + Realtime dinle
  const fetchChatMessages = useCallback(async () => {
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(Array.isArray(data.messages) ? data.messages : []);
      }
    } catch {
      // ignore
    } finally {
      setChatLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChatMessages();
  }, [fetchChatMessages]);

  useEffect(() => {
    if (!supabase) return;
    const chatChannel = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new;
          if (!newMsg) return;
          setChatMessages((prev) => {
            if (prev.some((m) => String(m.id) === String(newMsg.id))) return prev;
            return [...prev, newMsg].slice(-60);
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const deletedId = payload.old?.id;
          if (!deletedId) return;
          setChatMessages((prev) => prev.filter((m) => String(m.id) !== String(deletedId)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, []);

  // Yeni mesaj gelince veya sohbet açılınca aşağı kaydır
  useEffect(() => {
    if (chatOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatOpen]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    setChatError('');

    if (cooldownLeft > 0) {
      setChatError(
        lang === 'tr'
          ? `Yeni mesaj göndermek için ${cooldownLeft} saniye beklemelisin.`
          : `Please wait ${cooldownLeft}s before sending another message.`
      );
      return;
    }

    const nick = chatNick.trim();
    const msg = chatInput.trim();

    if (nick.length < 2 || nick.length > 20) {
      setChatError(
        lang === 'tr'
          ? 'Lütfen 2-20 karakter arası bir isim (takma ad) yaz.'
          : 'Please enter a nickname between 2 and 20 characters.'
      );
      return;
    }

    if (!msg) return;

    setChatSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nick,
          message: msg,
          replyToId: replyTo?.id ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 429 && data.retryAfter) {
          startCooldown(data.retryAfter);
        }
        setChatError(
          data.error ||
            (lang === 'tr' ? 'Mesaj gönderilemedi.' : 'Could not send message.')
        );
        return;
      }

      if (data.message) {
        setChatMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(data.message.id))) return prev;
          return [...prev, data.message].slice(-60);
        });
      }

      setChatInput('');
      setReplyTo(null);
      startCooldown(data.cooldownSeconds || CHAT_COOLDOWN_SEC);
    } catch {
      setChatError(
        lang === 'tr' ? 'Bağlantı hatası oluştu.' : 'Network error occurred.'
      );
    } finally {
      setChatSending(false);
    }
  };

  const handleStartReply = (msg) => {
    setReplyTo({
      id: msg.id,
      nickname: msg.nickname,
      message: msg.message,
    });
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  };

  // Tavsiye / Fikir gönderimi
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
          message: feedbackMsg.trim(),
          _subject: 'GTA6Takip — Yeni Tavsiye / Fikir',
        }),
      });
      if (res.ok) {
        setFeedbackStatus('sent');
        setFeedbackName('');
        setFeedbackMsg('');
      } else {
        setFeedbackStatus('error');
      }
    } catch {
      setFeedbackStatus('error');
    }
  };

  // Ekipleri normalize et
  const teams = useMemo(() => {
    if (!syncData) return [];
    const list = syncData.teams || syncData.efforts || [];
    return Array.isArray(list) ? list : [];
  }, [syncData]);

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const isOpen = Boolean(t.isOpenSource ?? t.repo ?? t.sourceUrl);
      if (filterCat === 'open' && !isOpen) return false;
      if (filterCat === 'closed' && isOpen) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${t.name || ''} ${t.repo || ''} ${t.gpu || ''} ${t.status || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [teams, filterCat, searchQuery]);

  const leader = teams[0] || null;

  const summaryStats = useMemo(() => {
    const total = syncData?.stats?.totalEfforts ?? teams.length;
    const booting =
      syncData?.stats?.bootingCount ??
      teams.filter((t) => (t.milestones?.boots ?? t.gta?.boots ?? 0) >= 1).length;
    const top3 = teams.slice(0, 3);
    const top3Avg =
      syncData?.stats?.top3Avg ??
      (top3.length
        ? (
            top3.reduce((acc, cur) => acc + Number(cur.progress ?? cur.score ?? 0), 0) /
            top3.length
          ).toFixed(1)
        : '0.0');
    return { total, booting, top3Avg };
  }, [syncData, teams]);

  const faqItems = useMemo(() => {
    const lName = leader?.name || 'Belobug';
    const lPct = leader?.progress ?? leader?.score ?? '91.3';
    const lFps = leader?.fps ?? leader?.gta?.fps ?? 22;

    if (lang === 'tr') {
      return [
        {
          q: 'GTA VI PC portu ne aşamada, şu an kim önde?',
          a: `Canlı PortWatch VI verilerine göre lider ekip ${lName} (%${lPct}) ve ortalama ${lFps} FPS ile oynanabilir seviyeye ulaşmış durumda. Toplam ${summaryStats.total} girişimin ${summaryStats.booting} tanesi oyunu başlatabiliyor.`,
        },
        {
          q: 'Veriler nereden ve ne sıklıkla güncelleniyor?',
          a: 'Tüm ilerleme yüzdeleri, FPS değerleri ve son güncelleme saatleri doğrudan PortWatch VI JSON kaynağından otomatik çekilir; sayfa her 2 dakikada bir kendini yeniler ve tüm saatler Türkiye Saati (TSİ) olarak gösterilir.',
        },
        {
          q: 'Açık Kaynak ile Kapalı projeler arasındaki fark nedir?',
          a: 'Açık kaynak projelerin GitHub deposu herkese açıktır ve topluluk tarafından doğrulanabilir. Kapalı projeler ise özel derlemeler veya yayın/video kanıtlarıyla takip edilen girişimlerdir.',
        },
        {
          q: 'Bu sitede korsan oyun veya indirme linki var mı?',
          a: 'Hayır. GTA6Takip tamamen bilgilendirme amaçlı bir ilerleme takip panosudur; herhangi bir oyun dosyası, kırık sürüm veya telif ihlali içeren indirme bağlantısı barındırmaz.',
        },
      ];
    }

    return [
      {
        q: 'What is the current status of the GTA VI PC port?',
        a: `According to live PortWatch VI data, ${lName} leads at ${lPct}% with around ${lFps} FPS. Out of ${summaryStats.total} tracked efforts, ${summaryStats.booting} can boot GTA VI.`,
      },
      {
        q: 'Where does the data come from and how often does it sync?',
        a: 'All progress scores, FPS figures, and update timestamps sync directly from PortWatch VI JSON data every 2 minutes, with all times displayed in Turkey Time (TRT).',
      },
      {
        q: 'What is the difference between Open Source and Closed projects?',
        a: 'Open source efforts publish verifiable code on GitHub, whereas closed efforts are private builds tracked through streams, videos, or verified reports.',
      },
      {
        q: 'Does this site host game files or pirated downloads?',
        a: 'No. GTA6Takip is strictly an informational progress tracker and never hosts copyrighted files or download links.',
      },
    ];
  }, [lang, leader, summaryStats]);

  const sortedCountries = useMemo(() => {
    return Object.entries(countryBreakdown).sort((a, b) => b[1] - a[1]);
  }, [countryBreakdown]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme.bg}`}>
      <style jsx global>{`
        @keyframes feedbackNudge {
          0%, 78%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          82% {
            transform: translateY(-6px) rotate(-2deg);
          }
          86% {
            transform: translateY(0) rotate(2deg);
          }
          90% {
            transform: translateY(-4px) rotate(-1deg);
          }
          94% {
            transform: translateY(0) rotate(0deg);
          }
        }
        .animate-feedback-nudge {
          animation: feedbackNudge 4s ease-in-out infinite;
        }
      `}</style>

      {/* ÜST BAR (HEADER) */}
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 border-b backdrop-blur-md ${theme.header}`}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-lg sm:text-xl font-black tracking-tight">
              GTA<span className={theme.accentText}>6</span>TAKİP
            </span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${theme.pill}`}>
              {APP_VERSION}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Çevrimiçi + Ülke Dağılımı */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((prev) => (prev === 'online' ? null : 'online'))
                }
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition ${theme.pill}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {onlineCount} {lang === 'tr' ? 'Çevrimiçi' : 'Online'}
                </span>
              </button>

              {openDropdown === 'online' && (
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-xl border p-3 z-50 ${theme.dropdown}`}
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-2 opacity-80">
                    {lang === 'tr' ? 'BAĞLI ÜLKELER' : 'CONNECTED COUNTRIES'}
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {sortedCountries.length === 0 ? (
                      <div className="text-xs opacity-75">
                        {lang === 'tr' ? 'Veri alınıyor…' : 'Loading…'}
                      </div>
                    ) : (
                      sortedCountries.map(([cc, count]) => {
                        const lower = cc.toLowerCase();
                        const name = COUNTRY_NAMES[cc]?.[lang] || cc;
                        return (
                          <div
                            key={cc}
                            className="flex items-center justify-between text-xs py-1"
                          >
                            <div className="flex items-center gap-2">
                              {cc !== 'XX' ? (
                                <img
                                  src={`https://flagcdn.com/w40/${lower}.png`}
                                  alt={cc}
                                  className="w-5 h-3.5 object-cover rounded-[2px] border border-white/15"
                                />
                              ) : (
                                <span className="w-5 text-center">🌐</span>
                              )}
                              <span className="font-medium">{name}</span>
                            </div>
                            <span className="font-bold">{count}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tema Seçici */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((prev) => (prev === 'theme' ? null : 'theme'))
                }
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition ${theme.pill}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${theme.dot}`} />
                <span className="hidden sm:inline">
                  {lang === 'tr' ? theme.labelTr : theme.labelEn}
                </span>
              </button>

              {openDropdown === 'theme' && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-xl border p-1.5 z-50 ${theme.dropdown}`}
                >
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleThemeChange(t.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                        t.id === themeId
                          ? 'bg-pink-500/20 font-bold'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${t.dot}`} />
                        {lang === 'tr' ? t.labelTr : t.labelEn}
                      </span>
                      {t.id === themeId && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dil Seçici (TR | EN SVG) */}
            <div className={`flex items-center rounded-full border p-0.5 ${theme.pill}`}>
              <button
                type="button"
                onClick={() => handleLangChange('tr')}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold transition ${
                  lang === 'tr' ? theme.accentBg : 'opacity-70 hover:opacity-100'
                }`}
              >
                <TrFlagSvg />
                <span>TR</span>
              </button>
              <button
                type="button"
                onClick={() => handleLangChange('en')}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold transition ${
                  lang === 'en' ? theme.accentBg : 'opacity-70 hover:opacity-100'
                }`}
              >
                <EnFlagSvg />
                <span>EN</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ANA İÇERİK */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Özet Kartları */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`rounded-2xl border p-4 ${theme.card}`}>
            <div className={`text-xs font-semibold uppercase tracking-wider ${theme.muted}`}>
              {lang === 'tr' ? 'Takip Edilen Girişim' : 'Tracked Efforts'}
            </div>
            <div className="mt-1 text-2xl font-black">{summaryStats.total}</div>
            <div className={`text-xs mt-1 ${theme.muted}`}>
              {lang === 'tr'
                ? `${summaryStats.booting} / ${summaryStats.total} GTA VI Başlatabiliyor`
                : `${summaryStats.booting} / ${summaryStats.total} Boot GTA VI`}
            </div>
          </div>

          <div className={`rounded-2xl border p-4 ${theme.card}`}>
            <div className={`text-xs font-semibold uppercase tracking-wider ${theme.muted}`}>
              {lang === 'tr' ? 'İlk 3 Ortalama' : 'Top 3 Average'}
            </div>
            <div className={`mt-1 text-2xl font-black ${theme.accentText}`}>
              %{summaryStats.top3Avg}
            </div>
            <div className={`text-xs mt-1 ${theme.muted}`}>
              {lang === 'tr' ? 'Canlı PortWatch VI Skoru' : 'Live PortWatch VI Score'}
            </div>
          </div>

          <div className={`rounded-2xl border p-4 ${theme.card} flex flex-col justify-between`}>
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider ${theme.muted}`}>
                {lang === 'tr' ? 'Son Senkronizasyon' : 'Last Sync'}
              </div>
              <div className="mt-1 text-sm font-bold">
                {formatIstanbulTime(syncData?.updatedAt || syncData?.updated, lang)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchTracker(true)}
              disabled={refreshing}
              className={`mt-2 self-start text-xs font-semibold px-3 py-1 rounded-lg border transition ${theme.pill}`}
            >
              {refreshing
                ? lang === 'tr'
                  ? 'Yenileniyor…'
                  : 'Refreshing…'
                : lang === 'tr'
                ? '↻ Şimdi Yenile'
                : '↻ Refresh Now'}
            </button>
          </div>
        </section>

        {/* #1 Lider Aşama Özeti */}
        {leader && (
          <section className={`rounded-2xl border p-4 sm:p-5 ${theme.card}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${theme.accentBg}`}>
                  #1 {lang === 'tr' ? 'LİDER' : 'LEADER'}
                </span>
                <h2 className="text-base sm:text-lg font-extrabold">{leader.name}</h2>
                {leader.verified && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${theme.badgeVerified}`}>
                    ✓ {lang === 'tr' ? 'Doğrulandı' : 'Verified'}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className={`text-xl font-black ${theme.accentText}`}>
                  %{leader.progress ?? leader.score ?? 0}
                </span>
                {leader.fps != null && (
                  <span className={`ml-2 text-xs font-bold ${theme.muted}`}>
                    • {leader.fps} FPS
                  </span>
                )}
              </div>
            </div>

            <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${theme.muted}`}>
              {lang === 'tr' ? 'Aşama Özeti' : 'Stage Summary'}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              {[
                { k: 'loads', tr: 'Yükleme', en: 'Loads' },
                { k: 'boots', tr: 'Başlatma', en: 'Boots' },
                { k: 'menu', tr: 'Menü', en: 'Menu' },
                { k: 'world', tr: 'Dünya', en: 'World' },
                { k: 'playable', tr: 'Oynanabilir', en: 'Playable' },
                { k: 'story', tr: 'Hikaye', en: 'Story' },
              ].map((m) => {
                const val = Number(leader.milestones?.[m.k] ?? leader.gta?.[m.k] ?? 0);
                const done = val >= 1;
                const partial = val > 0 && val < 1;
                return (
                  <div
                    key={m.k}
                    className={`rounded-xl border px-2 py-2 text-xs font-semibold ${theme.cardSoft}`}
                  >
                    <div className="truncate">{lang === 'tr' ? m.tr : m.en}</div>
                    <div
                      className={`mt-1 font-bold ${
                        done
                          ? 'text-emerald-400'
                          : partial
                          ? 'text-amber-400'
                          : 'opacity-50'
                      }`}
                    >
                      {done ? '✓ %100' : partial ? `%${Math.round(val * 100)}` : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* FİLTRE VE ARAMA */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', tr: 'Tümü', en: 'All' },
              { id: 'open', tr: 'Açık Kaynak', en: 'Open Source' },
              { id: 'closed', tr: 'Kapalı', en: 'Closed' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterCat(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                  filterCat === tab.id ? theme.accentBg : theme.pill
                }`}
              >
                {lang === 'tr' ? tab.tr : tab.en}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'tr' ? 'Ekip veya GPU ara…' : 'Search team or GPU…'}
            className={`w-full sm:w-64 px-3.5 py-2 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-pink-500/40 ${theme.input}`}
          />
        </section>

        {/* LİDERLİK TABLOSU */}
        <section className="space-y-3">
          {loading ? (
            <div className={`rounded-2xl border p-8 text-center text-sm ${theme.card}`}>
              {lang === 'tr' ? 'Canlı veriler yükleniyor…' : 'Loading live data…'}
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className={`rounded-2xl border p-8 text-center text-sm ${theme.card}`}>
              {lang === 'tr' ? 'Eşleşen ekip bulunamadı.' : 'No matching teams found.'}
            </div>
          ) : (
            <>
              {filteredTeams.map((team, idx) => {
                const isOpen = Boolean(team.isOpenSource ?? team.repo ?? team.sourceUrl);
                const pct = Number(team.progress ?? team.score ?? 0);
                const sourceUrl =
                  team.sourceUrl ||
                  (team.repo ? `https://github.com/${team.repo}` : null);
                const hideOnMobile = !showAllMobile && idx >= 10;

                return (
                  <article
                    key={team.id || team.name || idx}
                    className={`rounded-2xl border p-4 transition ${theme.card} ${
                      hideOnMobile ? 'hidden sm:block' : 'block'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-black px-2 py-0.5 rounded-md ${theme.cardSoft}`}>
                            #{idx + 1}
                          </span>
                          <h3 className="text-sm sm:text-base font-extrabold truncate">
                            {team.name}
                          </h3>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                              isOpen ? theme.badgeOpen : theme.badgeClosed
                            }`}
                          >
                            {isOpen
                              ? lang === 'tr'
                                ? 'Açık Kaynak'
                                : 'Open Source'
                              : lang === 'tr'
                              ? 'Kapalı'
                              : 'Closed'}
                          </span>
                          {team.gpu && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${theme.pill}`}>
                              {team.gpu}
                            </span>
                          )}
                        </div>

                        {team.status && (
                          <p className={`text-xs mt-1.5 ${theme.muted}`}>{team.status}</p>
                        )}
                      </div>

                      {/* Sağ Üst: Yüzde + Kaynak */}
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <div className={`text-lg sm:text-xl font-black ${theme.accentText}`}>
                          %{pct.toFixed(1).replace(/\.0$/, '')}
                        </div>
                        {sourceUrl && (
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[11px] font-semibold underline underline-offset-2 ${theme.accentText}`}
                          >
                            {lang === 'tr' ? 'Kaynak ↗' : 'Source ↗'}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* İlerleme Çubuğu */}
                    <div className={`mt-3 h-2 w-full rounded-full overflow-hidden ${theme.progressTrack}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${theme.progressBar}`}
                        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                      />
                    </div>

                    {/* 6 Aşama Etiketi */}
                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[11px]">
                      {[
                        { k: 'loads', tr: 'Yükleme', en: 'Loads' },
                        { k: 'boots', tr: 'Başlatma', en: 'Boots' },
                        { k: 'menu', tr: 'Menü', en: 'Menu' },
                        { k: 'world', tr: 'Dünya', en: 'World' },
                        { k: 'playable', tr: 'Oynanabilir', en: 'Playable' },
                        { k: 'render', tr: 'Görüntü', en: 'Render' },
                      ].map((m) => {
                        const val = Number(team.milestones?.[m.k] ?? team.gta?.[m.k] ?? 0);
                        return (
                          <div
                            key={m.k}
                            className={`px-2 py-1 rounded-lg border text-center truncate ${theme.cardSoft} ${
                              val >= 1
                                ? 'border-emerald-500/40 text-emerald-400 font-bold'
                                : val > 0
                                ? 'border-amber-500/40 text-amber-400 font-semibold'
                                : 'opacity-50'
                            }`}
                          >
                            {lang === 'tr' ? m.tr : m.en}
                          </div>
                        );
                      })}
                    </div>

                    {/* Alt Bilgi: FPS + Son Güncelleme Saati (TSİ) */}
                    <div className={`mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] ${theme.muted}`}>
                      <div className="flex items-center gap-3">
                        {team.fps != null && (
                          <span className="font-semibold">🎮 {team.fps} FPS</span>
                        )}
                        {team.stability && <span>• {team.stability}</span>}
                      </div>
                      <div>
                        <span className="font-semibold">
                          {lang === 'tr' ? 'Son Güncelleme:' : 'Last Update:'}
                        </span>{' '}
                        {formatIstanbulTime(team.updatedAt || team.pushedAt || syncData?.updatedAt, lang)}
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Mobilde Tümünü Göster */}
              {filteredTeams.length > 10 && (
                <div className="sm:hidden text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAllMobile((prev) => !prev)}
                    className={`px-4 py-2 rounded-xl border text-xs font-bold ${theme.pill}`}
                  >
                    {showAllMobile
                      ? lang === 'tr'
                        ? 'Daha Az Göster'
                        : 'Show Less'
                      : lang === 'tr'
                      ? `Tümünü Göster (${filteredTeams.length})`
                      : `Show All (${filteredTeams.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* CANLI SOHBET (AÇILIR KAPANIR AKORDİYON — SSS ÜSTÜNDE) */}
        <section className={`rounded-2xl border overflow-hidden ${theme.card}`}>
          <button
            type="button"
            onClick={() => setChatOpen((prev) => !prev)}
            className="w-full px-4 sm:px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm sm:text-base font-black tracking-wide">
                {lang === 'tr' ? 'CANLI SOHBET' : 'LIVE CHAT'}
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${theme.pill}`}>
                {chatMessages.length}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold opacity-80">
              <span>
                {chatOpen
                  ? lang === 'tr'
                    ? 'Gizle'
                    : 'Hide'
                  : lang === 'tr'
                  ? 'Sohbeti Aç'
                  : 'Open Chat'}
              </span>
              <span>{chatOpen ? '▲' : '▼'}</span>
            </div>
          </button>

          {chatOpen && (
            <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-white/10 space-y-3">
              {/* Kurallar & 60sn Bilgi Çubuğu */}
              <div className={`text-[11px] flex flex-wrap items-center justify-between gap-2 ${theme.muted}`}>
                <span>
                  {lang === 'tr'
                    ? '🛡️ Küfür filtresi ve link engeli aktiftir • 60 saniyede 1 mesaj sınırı'
                    : '🛡️ Profanity filter & link blocker active • 1 message per 60 seconds'}
                </span>
                {cooldownLeft > 0 && (
                  <span className="font-bold text-amber-400">
                    ⏱ {lang === 'tr' ? `Bekleme: ${cooldownLeft} sn` : `Cooldown: ${cooldownLeft}s`}
                  </span>
                )}
              </div>

              {/* Mesaj Listesi */}
              <div
                ref={chatScrollRef}
                className={`h-72 overflow-y-auto rounded-xl border p-3 space-y-2.5 ${theme.cardSoft}`}
              >
                {chatLoading && chatMessages.length === 0 ? (
                  <div className={`text-xs text-center py-8 ${theme.muted}`}>
                    {lang === 'tr' ? 'Sohbet yükleniyor…' : 'Loading chat…'}
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className={`text-xs text-center py-8 ${theme.muted}`}>
                    {lang === 'tr'
                      ? 'Henüz mesaj yok. İlk mesajı sen yaz!'
                      : 'No messages yet. Be the first to say hi!'}
                  </div>
                ) : (
                  chatMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-xl border px-3 py-2 text-xs ${theme.chatBubble}`}
                    >
                      {/* Yanıtlanan Mesaj Önizlemesi */}
                      {(m.reply_to_nick || m.reply_to_text) && (
                        <div className={`mb-1.5 px-2.5 py-1 rounded-md text-[11px] ${theme.replyBox}`}>
                          <span className="font-bold opacity-90">
                            ↩ @{m.reply_to_nick || 'Kullanıcı'}:
                          </span>{' '}
                          <span className="opacity-75 break-words">{m.reply_to_text}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-extrabold ${theme.accentText}`}>
                          {m.nickname}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] ${theme.muted}`}>
                            {formatIstanbulTime(m.created_at, lang, false)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartReply(m)}
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border transition hover:opacity-100 opacity-75 ${theme.pill}`}
                            title={lang === 'tr' ? 'Bu mesajı yanıtla' : 'Reply to this message'}
                          >
                            ↩ {lang === 'tr' ? 'Yanıtla' : 'Reply'}
                          </button>
                        </div>
                      </div>

                      <p className="mt-1 break-words leading-relaxed">{m.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Yanıt Önizleme Çubuğu */}
              {replyTo && (
                <div
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs ${theme.replyBox}`}
                >
                  <div className="min-w-0 truncate">
                    <span className="font-bold">
                      ↩ {lang === 'tr' ? `@${replyTo.nickname} yanıtlanıyor:` : `Replying to @${replyTo.nickname}:`}
                    </span>{' '}
                    <span className="opacity-80">{replyTo.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="shrink-0 text-xs font-bold px-2 py-0.5 rounded hover:bg-white/10"
                    aria-label="Yanıtı iptal et"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Hata Mesajı */}
              {chatError && (
                <div className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                  {chatError}
                </div>
              )}

              {/* Mesaj Gönderme Formu */}
              <form onSubmit={handleSendChat} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Kullanıcı İsim Alma Alanı */}
                  <input
                    type="text"
                    value={chatNick}
                    onChange={(e) => handleNickChange(e.target.value)}
                    maxLength={20}
                    placeholder={lang === 'tr' ? 'İsmin (2-20 karakter)' : 'Your name (2-20 chars)'}
                    className={`w-full sm:w-44 px-3 py-2.5 rounded-xl border text-xs font-semibold outline-none focus:ring-2 focus:ring-pink-500/40 ${theme.input}`}
                  />

                  {/* Mesaj Kutusu */}
                  <div className="flex-1 flex gap-2">
                    <input
                      ref={chatInputRef}
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      maxLength={280}
                      disabled={cooldownLeft > 0 || chatSending}
                      placeholder={
                        cooldownLeft > 0
                          ? lang === 'tr'
                            ? `Yeni mesaj için ${cooldownLeft} saniye bekle…`
                            : `Wait ${cooldownLeft}s to send again…`
                          : lang === 'tr'
                          ? 'Mesajını yaz (link yasak)…'
                          : 'Write a message (no links)…'
                      }
                      className={`flex-1 px-3 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-pink-500/40 disabled:opacity-60 ${theme.input}`}
                    />
                    <button
                      type="submit"
                      disabled={chatSending || cooldownLeft > 0 || !chatInput.trim()}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${theme.accentBg}`}
                    >
                      {chatSending
                        ? '…'
                        : cooldownLeft > 0
                        ? `⏱ ${cooldownLeft}s`
                        : lang === 'tr'
                        ? 'Gönder'
                        : 'Send'}
                    </button>
                  </div>
                </div>

                {/* 60 Saniye Görsel Geri Sayım Çubuğu */}
                {cooldownLeft > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400">
                      <span>
                        {lang === 'tr'
                          ? `Yeni mesaj atabilmek için ${cooldownLeft} saniye kaldı`
                          : `${cooldownLeft} seconds remaining until your next message`}
                      </span>
                      <span>{cooldownLeft}s / {CHAT_COOLDOWN_SEC}s</span>
                    </div>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme.progressTrack}`}>
                      <div
                        className="h-full bg-amber-400 transition-all duration-1000 ease-linear"
                        style={{ width: `${(cooldownLeft / CHAT_COOLDOWN_SEC) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </section>

        {/* MERAK EDİLEN SORULAR (4 Dinamik SSS) */}
        <section className={`rounded-2xl border p-4 sm:p-5 ${theme.card}`}>
          <h2 className="text-sm sm:text-base font-black tracking-wide mb-3">
            {lang === 'tr' ? 'MERAK EDİLEN SORULAR' : 'FREQUENTLY ASKED QUESTIONS'}
          </h2>
          <div className="space-y-2">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border overflow-hidden ${theme.cardSoft}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between gap-2 text-xs sm:text-sm font-bold"
                  >
                    <span>{item.q}</span>
                    <span className="shrink-0 opacity-70">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className={`px-4 pb-3.5 text-xs leading-relaxed ${theme.muted}`}>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* DMCA & GÜVENLİK RADARI */}
        <section className={`rounded-2xl border p-4 sm:p-5 ${theme.card}`}>
          <h2 className="text-sm font-black tracking-wide mb-1.5">
            {lang === 'tr' ? '🛡️ DMCA & Güvenlik Radarı' : '🛡️ DMCA & Safety Radar'}
          </h2>
          <p className={`text-xs leading-relaxed ${theme.muted}`}>
            {lang === 'tr'
              ? 'GTA6Takip bağımsız bir bilgilendirme ve topluluk takip panosudur. Telif hakkı ihlali içeren dosya, indirme linki veya kırık sürüm barındırmaz. Resmi kaynaklar dışındaki bilinmeyen çalıştırılabilir (.exe) dosyalara karşı dikkatli olun.'
              : 'GTA6Takip is an independent informational progress tracker. It does not host copyrighted files, builds, or download links. Always stay cautious against unverified executable files.'}
          </p>
        </section>
      </main>

      {/* ALT BİLGİ (FOOTER) */}
      <footer className="max-w-6xl mx-auto px-3 sm:px-6 pb-20 pt-4 text-center space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <a
            href="https://portwatch-vi.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${theme.pill}`}
          >
            PortWatch VI ↗
          </a>
          <a
            href="https://github.com/gta6takip/gta6takip"
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${theme.pill}`}
          >
            GitHub ↗
          </a>
          <a
            href="https://x.com/batmancodex"
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${theme.pill}`}
          >
            X / @batmancodex ↗
          </a>
        </div>
        <div className={`text-[11px] ${theme.muted}`}>
          GTA6Takip {APP_VERSION} • {lang === 'tr' ? 'Tüm saatler TSİ (Europe/Istanbul)' : 'All times in TRT (Europe/Istanbul)'}
        </div>
      </footer>

      {/* SOL ALT: TAVSİYE / FİKİR BUTONU */}
      <button
        type="button"
        onClick={() => {
          setFeedbackStatus('idle');
          setFeedbackOpen(true);
        }}
        className={`fixed bottom-4 left-4 z-40 px-3.5 py-2.5 rounded-full text-xs font-extrabold shadow-xl animate-feedback-nudge ${theme.accentBg}`}
      >
        💡 {lang === 'tr' ? 'Tavsiye / Fikir' : 'Feedback'}
      </button>

      {/* SAĞ ALT: YUKARI ÇIK BUTONU */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-4 right-4 z-40 w-10 h-10 rounded-full border shadow-xl flex items-center justify-center font-black ${theme.pill}`}
          aria-label="Yukarı çık"
        >
          ↑
        </button>
      )}

      {/* TAVSİYE / FİKİR MODALI */}
      {feedbackOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setFeedbackOpen(false)}
        >
          <div
            className={`w-full max-w-md rounded-2xl border p-5 space-y-3 ${theme.dropdown}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">
                💡 {lang === 'tr' ? 'Tavsiye / Fikir Gönder' : 'Send Feedback'}
              </h3>
              <button
                type="button"
                onClick={() => setFeedbackOpen(false)}
                className="text-sm font-bold px-2 py-0.5 rounded hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {feedbackStatus === 'sent' ? (
              <div className="py-4 text-center space-y-2">
                <div className="text-emerald-400 font-bold text-sm">
                  {lang === 'tr' ? '✓ Mesajın ulaştı, teşekkürler!' : '✓ Feedback received, thank you!'}
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(false)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold ${theme.accentBg}`}
                >
                  {lang === 'tr' ? 'Kapat' : 'Close'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-3">
                <input
                  type="text"
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                  placeholder={lang === 'tr' ? 'Adın (isteğe bağlı)' : 'Your name (optional)'}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${theme.input}`}
                />
                <textarea
                  rows={4}
                  required
                  value={feedbackMsg}
                  onChange={(e) => setFeedbackMsg(e.target.value)}
                  placeholder={
                    lang === 'tr'
                      ? 'Önerini veya fark ettiğin bir hatayı yazabilirsin…'
                      : 'Share your suggestion or report a bug…'
                  }
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${theme.input}`}
                />
                {feedbackStatus === 'error' && (
                  <div className="text-xs text-rose-400 font-semibold">
                    {lang === 'tr' ? 'Gönderilemedi, tekrar dene.' : 'Failed to send, please retry.'}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={feedbackStatus === 'sending'}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold ${theme.accentBg}`}
                >
                  {feedbackStatus === 'sending'
                    ? lang === 'tr'
                      ? 'Gönderiliyor…'
                      : 'Sending…'
                    : lang === 'tr'
                    ? 'Gönder'
                    : 'Submit'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
