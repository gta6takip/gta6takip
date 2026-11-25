'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Sun,
  Moon,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Send,
  Shield,
  Trash2,
  Ban,
  Reply,
  X,
  Maximize2,
  Minimize2,
  Pin,
  PinOff,
  BarChart3,
  Eraser,
  Monitor,
  Gamepad2,
  Globe,
  Wrench,
  Check,
  Smile,
  Clock,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// --- SIKI KÜFÜR FİLTRESİ ---
function normalizeProfanityText(input) {
  return String(input || '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[@4]/g, 'a')
    .replace(/3/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/0/g, 'o')
    .replace(/[5$]/g, 's')
    .replace(/7/g, 't')
    .replace(/(.)\1{2,}/g, '$1$1');
}

const EXACT_BAD_WORDS = [
  'amk', 'aq', 'mk', 'oc', 'sg', 'am', 'sik', 'pic', 'piç', 'yarak', 'yarrak',
  'orospu', 'orspu', 'ibne', 'pust', 'puşt', 'kahpe', 'gavat', 'pezevenk',
  'amcik', 'amcık', 'tasak', 'taşak', 'dassak', 'daşşak', 'got', 'göt',
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 'whore', 'slut',
  'asshole', 'bastard', 'motherfucker', 'nigger', 'faggot', 'retard', 'stfu',
];

const STEM_BAD_WORDS = [
  'siktir', 'siksin', 'sikeyim', 'sikerim', 'sikim', 'sikis', 'sikiy', 'siken',
  'sikem', 'sikti', 'sikec', 'amina', 'amini', 'amına', 'amını', 'amcik',
  'ananiz', 'anani', 'anasin', 'ananı', 'ananız', 'anasın', 'orospu', 'orspu',
  'orosbu', 'yarrak', 'yarak', 'pezevenk', 'pzvnk', 'gotun', 'gotune', 'gotunu',
  'gotver', 'götün', 'götver', 'soksun', 'sokayim', 'koyayim', 'koyim',
  'gerizekali', 'kahpe', 'ibne', 'gavat', 'motherfuck', 'fucked', 'fucking',
  'bullshit', 'asshole', 'bitch',
];

function containsProfanity(raw) {
  if (!raw) return false;
  const lowerTr = String(raw).toLocaleLowerCase('tr-TR');
  if (/\bgöt(ü|ün|üne|ünü|ver)?\b/i.test(lowerTr)) return true;

  const normalized = normalizeProfanityText(raw);
  const spaced = normalized.replace(/[^a-z0-9]+/g, ' ').trim();
  const compact = normalized.replace(/[^a-z0-9]/g, '');

  for (const w of EXACT_BAD_WORDS) {
    const cleanW = normalizeProfanityText(w);
    if (new RegExp(`\\b${cleanW}\\b`, 'i').test(spaced)) return true;
  }
  for (const stem of STEM_BAD_WORDS) {
    if (compact.includes(normalizeProfanityText(stem))) return true;
  }
  return false;
}

function censorProfanity(raw) {
  let out = String(raw || '');
  for (const w of [...EXACT_BAD_WORDS, ...STEM_BAD_WORDS]) {
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escaped, 'gi'), '***');
  }
  return out;
}

// --- INLINE BAYRAK SVG'LERİ (Windows TR/US yazı hatası önlenir) ---
const FlagTR = () => (
  <svg viewBox="0 0 36 24" className="w-4 h-3 rounded-[2px] shrink-0" aria-hidden="true">
    <rect width="36" height="24" fill="#E30A17" />
    <circle cx="13.5" cy="12" r="6" fill="#FFFFFF" />
    <circle cx="15" cy="12" r="4.8" fill="#E30A17" />
    <polygon
      fill="#FFFFFF"
      points="19.5,12 21.8,12.75 20.38,10.8 20.38,13.2 21.8,11.25"
    />
  </svg>
);

const FlagEN = () => (
  <svg viewBox="0 0 36 24" className="w-4 h-3 rounded-[2px] shrink-0" aria-hidden="true">
    <rect width="36" height="24" fill="#B22234" />
    <path d="M0,3.7h36M0,7.4h36M0,11.1h36M0,14.8h36M0,18.5h36M0,22.2h36" stroke="#FFFFFF" strokeWidth="1.85" />
    <rect width="15.5" height="13" fill="#3C3B6E" />
  </svg>
);

const VerifiedBadge = () => (
  <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0 text-sky-400" fill="currentColor" aria-label="Verified">
    <path
      fillRule="evenodd"
      d="M10 1.5l2.12 1.54 2.6-.16 1.13 2.36 2.36 1.13-.16 2.6L19.5 10l-1.54 2.12.16 2.6-2.36 1.13-1.13 2.36-2.6-.16L10 18.5l-2.12-1.54-2.6.16-1.13-2.36-2.36-1.13.16-2.6L.5 10l1.54-2.12-.16-2.6 2.36-1.13 1.13-2.36 2.6.16L10 1.5zm3.7 6.8a.75.75 0 00-1.06-1.06L9 10.88 7.36 9.24a.75.75 0 00-1.06 1.06l2.17 2.17a.75.75 0 001.06 0l4.17-4.17z"
      clipRule="evenodd"
    />
  </svg>
);

const AVATARS = [
  { bg: 'from-purple-500 to-pink-500', label: 'V' },
  { bg: 'from-pink-500 to-orange-500', label: 'G' },
  { bg: 'from-cyan-500 to-blue-600', label: 'P' },
  { bg: 'from-emerald-500 to-teal-600', label: 'X' },
  { bg: 'from-amber-500 to-red-500', label: '6' },
  { bg: 'from-indigo-500 to-purple-600', label: 'S' },
];

const QUICK_EMOJIS = ['🔥', '🎮', '🚗', '🌴', '⚡', '👀', '👏', '😂'];

const TEXT = {
  tr: {
    badge: 'CANLI PORT TAKİBİ',
    title: 'GTA VI PC Port Takibi',
    subtitle: 'PortWatch VI verileri ve açık kaynak GitHub depoları her 120 saniyede bir otomatik güncellenir.',
    lastSync: 'Son Güncelleme',
    refresh: 'Yenile',
    openSource: 'AÇIK KAYNAK',
    closedTeam: 'KAPALI EKİP',
    latestCommit: 'Son Commit',
    chatTitle: 'Vice City Canlı Sohbet',
    channelsLabel: 'Kanallar: #tr-genel ve #en-general',
    live: 'Canlı',
    online: 'Çevrimiçi',
    nickname: 'Takma Ad:',
    placeholder: 'Mesaj yaz...',
    send: 'Gönder',
    replyingTo: 'Yanıtlanıyor:',
    reply: 'Yanıtla',
    pin: 'Sabitle',
    unpin: 'Sabitlemeyi Kaldır',
    pinnedLabel: 'Sabitlenen Mesaj',
    delete: 'Sil',
    ban: 'Banla',
    clearChat: 'Sohbeti Temizle',
    clearConfirm: 'Emin misin?',
    createPoll: 'Anket Aç',
    pollTitle: 'Mini Anket Oluştur (Maks. 5 dk)',
    pollQuestionPlaceholder: 'Anket sorusunu yaz...',
    pollOptionPlaceholder: 'Seçenek',
    addOption: '+ Seçenek Ekle',
    pollDuration: 'Süre:',
    minuteShort: 'dk',
    startPoll: 'Anketi Başlat',
    cancel: 'İptal',
    pollEnded: 'Anket Sonuçlandı',
    pollRemaining: 'Kalan:',
    votesLabel: 'oy',
    closePoll: 'Anketi Kapat',
    profanityWarn: 'Küfür/argo tespit edildi! Mesajın engellendi ve 60 saniye susturuldun.',
    mutedWarn: 'Susturuldun! Kalan süre:',
    slowmodeWarn: 'Yavaş mod aktif! Tekrar mesaj için:',
    bannedWarn: 'Sohbetten kalıcı olarak engellendin.',
    reservedNick: 'Bu takma ad sadece yönetici içindir.',
    adminLoginTitle: 'Yönetici Girişi',
    adminPassPlaceholder: 'Yönetici şifresi...',
    login: 'Giriş Yap',
    logout: 'Çıkış',
    shareWa: "WhatsApp'ta Paylaş",
    shareX: "X'te Paylaş",
    disclaimer:
      'GTA6takip, PortWatch projesinin kâr gütmeyen, hobi amaçlı alternatifidir. Veriler otomatik olarak portwatch-vi.xyz/#race ve açık GitHub depolarından alınır.',
    emptyChat: 'Henüz mesaj yok. İlk mesajı sen yaz!',
  },
  en: {
    badge: 'LIVE PORT TRACKER',
    title: 'GTA VI PC Port Tracker',
    subtitle: 'PortWatch VI race data and open-source GitHub repositories sync automatically every 120 seconds.',
    lastSync: 'Last Sync',
    refresh: 'Refresh',
    openSource: 'OPEN SOURCE',
    closedTeam: 'CLOSED TEAM',
    latestCommit: 'Latest Commit',
    chatTitle: 'Vice City Live Chat',
    channelsLabel: 'Channels: #tr-genel & #en-general',
    live: 'Live',
    online: 'Online',
    nickname: 'Nickname:',
    placeholder: 'Type a message...',
    send: 'Send',
    replyingTo: 'Replying to:',
    reply: 'Reply',
    pin: 'Pin',
    unpin: 'Unpin',
    pinnedLabel: 'Pinned Message',
    delete: 'Delete',
    ban: 'Ban',
    clearChat: 'Clear Chat',
    clearConfirm: 'Confirm?',
    createPoll: 'New Poll',
    pollTitle: 'Create Mini Poll (Max 5 min)',
    pollQuestionPlaceholder: 'Enter poll question...',
    pollOptionPlaceholder: 'Option',
    addOption: '+ Add Option',
    pollDuration: 'Duration:',
    minuteShort: 'm',
    startPoll: 'Start Poll',
    cancel: 'Cancel',
    pollEnded: 'Poll Ended',
    pollRemaining: 'Left:',
    votesLabel: 'votes',
    closePoll: 'Close Poll',
    profanityWarn: 'Profanity detected! Your message was blocked and you are muted for 60s.',
    mutedWarn: 'You are muted! Remaining:',
    slowmodeWarn: 'Slowmode active! Wait:',
    bannedWarn: 'You are permanently banned from chat.',
    reservedNick: 'This nickname is reserved for Admin.',
    adminLoginTitle: 'Admin Login',
    adminPassPlaceholder: 'Admin password...',
    login: 'Login',
    logout: 'Logout',
    shareWa: 'Share on WhatsApp',
    shareX: 'Share on X',
    disclaimer:
      'GTA6takip is a non-profit, hobbyist alternative to PortWatch. Data syncs automatically from portwatch-vi.xyz/#race and public GitHub repositories.',
    emptyChat: 'No messages yet. Be the first to say hello!',
  },
};

function mergeChannelMessages(existing, incoming, clearedAt = 0) {
  const map = new Map();
  for (const m of [...existing, ...incoming]) {
    if (!m || !m.id) continue;
    const ts = new Date(m.created_at || 0).getTime();
    if (clearedAt && ts <= clearedAt) continue;
    map.set(m.id, m);
  }
  return Array.from(map.values())
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-100);
}

export default function Home() {
  const [lang, setLang] = useState('tr');
  const [theme, setTheme] = useState('light');
  const [teams, setTeams] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('--:--:--');
  const [syncing, setSyncing] = useState(false);

  // Sohbet durumları
  const [channel, setChannel] = useState('tr-genel');
  const [messagesByChannel, setMessagesByChannel] = useState({ 'tr-genel': [], 'en-general': [] });
  const [clearedAtByChannel, setClearedAtByChannel] = useState({ 'tr-genel': 0, 'en-general': 0 });
  const [pinnedByChannel, setPinnedByChannel] = useState({ 'tr-genel': null, 'en-general': null });
  const [pollByChannel, setPollByChannel] = useState({ 'tr-genel': null, 'en-general': null });
  const [bannedUsers, setBannedUsers] = useState([]);

  const [nickname, setNickname] = useState('ViceMisafir');
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);

  // Moderasyon & Zamanlayıcılar
  const [slowmodeLeft, setSlowmodeLeft] = useState(0);
  const [muteLeft, setMuteLeft] = useState(0);
  const [chatAlert, setChatAlert] = useState('');
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);

  // Admin durumları
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  // Anket oluşturma durumları
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState(5);
  const [voterId, setVoterId] = useState('');
  const [nowTick, setNowTick] = useState(Date.now());

  const chatEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  const t = TEXT[lang];

  // İlk yükleme: localStorage ayarları
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('gta6takip_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);
      const savedLang = localStorage.getItem('gta6takip_lang');
      if (savedLang === 'tr' || savedLang === 'en') {
        setLang(savedLang);
        setChannel(savedLang === 'tr' ? 'tr-genel' : 'en-general');
      }
      const savedNick = localStorage.getItem('gta6takip_nick');
      if (savedNick) setNickname(savedNick);
      const savedAvatar = localStorage.getItem('gta6takip_avatar');
      if (savedAvatar) setAvatarIdx(Number(savedAvatar) || 0);

      let vId = localStorage.getItem('gta6takip_voter_id');
      if (!vId) {
        vId = `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem('gta6takip_voter_id', vId);
      }
      setVoterId(vId);

      const savedAdmin = localStorage.getItem('gta6takip_admin_pass');
      if (savedAdmin === '657210') {
        setIsAdmin(true);
        setAdminPassword(savedAdmin);
      }

      const cachedTr = JSON.parse(localStorage.getItem('gta6takip_msgs_tr-genel') || '[]');
      const cachedEn = JSON.parse(localStorage.getItem('gta6takip_msgs_en-general') || '[]');
      setMessagesByChannel({ 'tr-genel': cachedTr, 'en-general': cachedEn });
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

  // Sayaçlar (Slowmode, Mute, Anket geri sayımı)
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
      setSlowmodeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setMuteLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Takım verilerini çek (120sn)
  const fetchSync = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.teams)) setTeams(data.teams);
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

  // Sohbet verilerini çek (4.5sn)
  const fetchChat = useCallback(async (targetChannel) => {
    try {
      const res = await fetch(`/api/chat?channel=${encodeURIComponent(targetChannel)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!data.ok) return;

      const serverClearedAt = Number(data.clearedAt || 0);
      setClearedAtByChannel((prev) => ({ ...prev, [targetChannel]: serverClearedAt }));
      setPinnedByChannel((prev) => ({ ...prev, [targetChannel]: data.pinnedMessage || null }));
      setPollByChannel((prev) => ({ ...prev, [targetChannel]: data.activePoll || null }));
      if (Array.isArray(data.bannedUsers)) setBannedUsers(data.bannedUsers);

      setMessagesByChannel((prev) => {
        const existing = serverClearedAt > (clearedAtByChannel[targetChannel] || 0)
          ? []
          : prev[targetChannel] || [];
        const merged = mergeChannelMessages(existing, data.messages || [], serverClearedAt);
        try {
          localStorage.setItem(`gta6takip_msgs_${targetChannel}`, JSON.stringify(merged));
        } catch {
          // ignore
        }
        return { ...prev, [targetChannel]: merged };
      });
    } catch {
      // ignore
    }
  }, [clearedAtByChannel]);

  useEffect(() => {
    fetchChat(channel);
    const id = setInterval(() => fetchChat(channel), 4500);
    return () => clearInterval(id);
  }, [channel, fetchChat]);

  // Supabase Realtime online sayacı
  useEffect(() => {
    if (!supabase) return;
    const room = supabase.channel('gta6takip_presence', {
      config: { presence: { key: voterId || `u_${Math.random().toString(36).slice(2, 7)}` } },
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
  }, [voterId]);

  const currentMessages = messagesByChannel[channel] || [];
  const lastMsgId = currentMessages.length ? currentMessages[currentMessages.length - 1].id : '';
  const pinnedMessage = pinnedByChannel[channel] || null;
  const activePoll = pollByChannel[channel] || null;

  // Brave & Tüm tarayıcılarda otomatik aşağı kaydırma
  const scrollToBottom = useCallback(() => {
    const el = chatScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollToBottom();
      setTimeout(scrollToBottom, 60);
    });
  }, [lastMsgId, channel, isMobileFullscreen, scrollToBottom]);

  const activeNick = isAdmin ? 'ADMIN' : nickname.trim() || 'ViceMisafir';
  const isUserBanned = !isAdmin && bannedUsers.includes(activeNick.toLowerCase());

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    setChatAlert('');

    if (isUserBanned) {
      setChatAlert(t.bannedWarn);
      return;
    }
    if (!isAdmin && muteLeft > 0) {
      setChatAlert(`${t.mutedWarn} ${muteLeft}s`);
      return;
    }
    if (!isAdmin && slowmodeLeft > 0) {
      setChatAlert(`${t.slowmodeWarn} ${slowmodeLeft}s`);
      return;
    }

    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const lowerNick = activeNick.toLowerCase();
    if (!isAdmin && (lowerNick.includes('admin') || lowerNick.includes('yönetici') || lowerNick.includes('yonetici'))) {
      setChatAlert(t.reservedNick);
      return;
    }

    if (!isAdmin && (containsProfanity(trimmed) || containsProfanity(activeNick))) {
      setMuteLeft(60);
      setChatInput(censorProfanity(trimmed));
      setChatAlert(t.profanityWarn);
      return;
    }

    const tempId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const optimistic = {
      id: tempId,
      channel,
      nickname: activeNick,
      text: trimmed,
      avatar: avatarIdx,
      is_admin: isAdmin,
      reply_to: replyTo,
      created_at: new Date().toISOString(),
    };

    setMessagesByChannel((prev) => {
      const next = mergeChannelMessages(prev[channel] || [], [optimistic], clearedAtByChannel[channel] || 0);
      return { ...prev, [channel]: next };
    });
    setChatInput('');
    setReplyTo(null);
    setShowEmoji(false);
    if (!isAdmin) setSlowmodeLeft(60);
    requestAnimationFrame(scrollToBottom);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          id: tempId,
          channel,
          nickname: activeNick,
          text: trimmed,
          avatar: avatarIdx,
          adminPassword: isAdmin ? adminPassword : '',
          reply_to: replyTo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessagesByChannel((prev) => ({
          ...prev,
          [channel]: (prev[channel] || []).filter((m) => m.id !== tempId),
        }));
        if (data.error === 'profanity') {
          setMuteLeft(60);
          setChatAlert(t.profanityWarn);
        } else if (data.error === 'banned') {
          setChatAlert(t.bannedWarn);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_admin', password: adminPassInput }),
      });
      const data = await res.json();
      if (data.ok) {
        setIsAdmin(true);
        setAdminPassword(adminPassInput);
        localStorage.setItem('gta6takip_admin_pass', adminPassInput);
        setShowAdminModal(false);
        setAdminPassInput('');
      }
    } catch {
      // ignore
    }
  };

  const handleClearChat = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    setConfirmClear(false);
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_chat', channel, adminPassword }),
    });
    setMessagesByChannel((prev) => ({ ...prev, [channel]: [] }));
    setPinnedByChannel((prev) => ({ ...prev, [channel]: null }));
    try {
      localStorage.removeItem(`gta6takip_msgs_${channel}`);
    } catch {
      // ignore
    }
  };

  const handleDeleteMessage = async (id) => {
    setMessagesByChannel((prev) => ({
      ...prev,
      [channel]: (prev[channel] || []).filter((m) => m.id !== id),
    }));
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_message', channel, id, adminPassword }),
    });
  };

  const handleBanUser = async (targetNick) => {
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ban_user', nickname: targetNick, adminPassword }),
    });
    fetchChat(channel);
  };

  const handlePinMessage = async (msg) => {
    const isSame = pinnedMessage?.id === msg.id;
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: isSame ? 'unpin_message' : 'pin_message',
        channel,
        message: isSame ? null : msg,
        adminPassword,
      }),
    });
    setPinnedByChannel((prev) => ({ ...prev, [channel]: isSame ? null : msg }));
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const cleanOpts = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (!pollQuestion.trim() || cleanOpts.length < 2) return;

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_poll',
        channel,
        question: pollQuestion,
        options: cleanOpts,
        durationMinutes: Math.min(5, Math.max(1, pollDuration)),
        adminPassword,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      setPollByChannel((prev) => ({ ...prev, [channel]: data.activePoll }));
      setShowPollModal(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      setPollDuration(5);
    }
  };

  const handleVotePoll = async (optionId) => {
    if (!activePoll) return;
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'vote_poll',
        channel,
        pollId: activePoll.id,
        optionId,
        voterId,
      }),
    });
    const data = await res.json();
    if (data.activePoll) {
      setPollByChannel((prev) => ({ ...prev, [channel]: data.activePoll }));
    }
  };

  const handleClosePoll = async () => {
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close_poll', channel, adminPassword }),
    });
    setPollByChannel((prev) => ({ ...prev, [channel]: null }));
  };

  const renderStageIcon = (stageText = '') => {
    const s = stageText.toLowerCase();
    if (s.includes('oynan') || s.includes('play') || s.includes('menü') || s.includes('menu')) {
      return <Gamepad2 className="w-3.5 h-3.5 text-pink-500 shrink-0" />;
    }
    if (s.includes('harita') || s.includes('world') || s.includes('map')) {
      return <Globe className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
    }
    return <Wrench className="w-3.5 h-3.5 text-orange-500 shrink-0" />;
  };

  const shareText =
    lang === 'tr'
      ? 'GTA VI PC Port geliştirme sürecini canlı takip ediyorum! 🚀'
      : 'Tracking GTA VI PC Port progress live! 🚀';
  const shareUrl = 'https://gta6takip.vercel.app/';

  const pollRemainingSec = activePoll
    ? Math.max(0, Math.floor((activePoll.expiresAt - nowTick) / 1000))
    : 0;
  const pollEnded = activePoll ? pollRemainingSec === 0 : false;
  const totalVotes = activePoll
    ? activePoll.options.reduce((acc, o) => acc + (o.votes || 0), 0)
    : 0;

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* ÜST HERO */}
      <header className="pw-hero-bg border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-pink-500/15 text-pink-500 mb-2">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              {t.badge}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold pw-text-gradient">{t.title}</h1>
            <p className="text-xs sm:text-sm mt-1 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dil Seçici */}
            <div
              className="flex items-center rounded-xl p-1 border"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <button
                onClick={() => {
                  setLang('tr');
                  setChannel('tr-genel');
                  localStorage.setItem('gta6takip_lang', 'tr');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  lang === 'tr' ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' : ''
                }`}
              >
                <FlagTR /> TR
              </button>
              <button
                onClick={() => {
                  setLang('en');
                  setChannel('en-general');
                  localStorage.setItem('gta6takip_lang', 'en');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  lang === 'en' ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' : ''
                }`}
              >
                <FlagEN /> EN
              </button>
            </div>

            {/* Tema */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border transition"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Yenile */}
            <button
              onClick={fetchSync}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{t.refresh}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ANA İÇERİK */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SOL SÜTUN: TAKIMLAR */}
        <section className="lg:col-span-7 xl:col-span-8 space-y-3">
          <div className="flex items-center justify-between text-xs px-1" style={{ color: 'var(--text-secondary)' }}>
            <span>
              {t.lastSync}: <strong>{lastUpdated}</strong>
            </span>
            <span>PortWatch VI (#race)</span>
          </div>

          {teams.map((team, idx) => {
            const pct = Number(team.percentage ?? team.progress ?? 0);
            const pctLabel = lang === 'tr' ? `%${pct}` : `${pct}%`;
            const stage = lang === 'tr' ? team.stage_tr || team.stage : team.stage_en || team.stage;
            const fps = lang === 'tr' ? team.fps_tr || team.fps : team.fps_en || team.fps;
            const desc = lang === 'tr' ? team.desc_tr || team.description : team.desc_en || team.description;

            return (
              <article
                key={team.name || idx}
                className="rounded-2xl p-4 border shadow-sm transition hover:border-pink-500/50"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-500">
                      #{idx + 1}
                    </span>
                    <h2 className="font-bold text-base">{team.name}</h2>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        team.open_source
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-slate-500/15 text-slate-400'
                      }`}
                    >
                      {team.open_source ? t.openSource : t.closedTeam}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black pw-text-gradient">{pctLabel}</span>
                    {team.url && (
                      <a
                        href={team.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border hover:opacity-80"
                        style={{ borderColor: 'var(--border-color)' }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-500/20 mb-2.5">
                  <div className="h-full gta-bar-fill rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {stage && (
                    <span className="inline-flex items-center gap-1">
                      {renderStageIcon(stage)}
                      {stage}
                    </span>
                  )}
                  {fps && (
                    <span className="inline-flex items-center gap-1">
                      <Monitor className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      {fps}
                    </span>
                  )}
                </div>

                {(desc || team.commit_msg) && (
                  <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {team.commit_msg ? `${t.latestCommit}: ${team.commit_msg}` : desc}
                  </p>
                )}
              </article>
            );
          })}
        </section>

        {/* SAĞ SÜTUN: SOHBET KUTUSU */}
        <aside
          className={`${
            isMobileFullscreen
              ? 'fixed inset-0 z-50 flex flex-col p-3'
              : 'lg:col-span-5 xl:col-span-4 flex flex-col gap-3'
          }`}
          style={isMobileFullscreen ? { backgroundColor: 'var(--bg-base)' } : undefined}
        >
          <div
            className={`rounded-2xl border shadow-sm flex flex-col overflow-hidden ${
              isMobileFullscreen ? 'flex-1 h-full' : 'h-[640px] lg:sticky lg:top-4'
            }`}
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            {/* Chat Başlık */}
            <div className="p-3.5 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center text-white shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-sm truncate">{t.chatTitle}</h2>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                    {t.channelsLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => (isAdmin ? setShowAdminModal(true) : setShowAdminModal(true))}
                  className={`p-1.5 rounded-lg border transition ${
                    isAdmin
                      ? 'bg-purple-500/20 border-purple-500 text-purple-500'
                      : 'border-amber-500/40 text-amber-500 hover:bg-amber-500/10'
                  }`}
                  title="Admin"
                >
                  <Shield className="w-4 h-4" />
                </button>

                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {onlineCount} {t.live}
                </span>

                <button
                  onClick={() => setIsMobileFullscreen((v) => !v)}
                  className="lg:hidden p-1.5 rounded-lg border"
                  style={{ borderColor: 'var(--border-color)' }}
                  aria-label="Toggle fullscreen chat"
                >
                  {isMobileFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Admin Araç Çubuğu */}
            {isAdmin && (
              <div
                className="px-3 py-2 border-b flex flex-wrap items-center justify-between gap-2 bg-purple-500/10"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <span className="text-[11px] font-bold text-purple-500 flex items-center gap-1">
                  ADMIN <VerifiedBadge />
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowPollModal((v) => !v)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-pink-500 text-white hover:opacity-90"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    {t.createPoll}
                  </button>
                  <button
                    onClick={handleClearChat}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white transition ${
                      confirmClear ? 'bg-red-600' : 'bg-slate-700 hover:bg-red-600'
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    {confirmClear ? t.clearConfirm : t.clearChat}
                  </button>
                </div>
              </div>
            )}

            {/* Kanal Seçici */}
            <div className="p-2 border-b grid grid-cols-2 gap-2" style={{ borderColor: 'var(--border-color)' }}>
              <button
                onClick={() => setChannel('tr-genel')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  channel === 'tr-genel'
                    ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-sm'
                    : 'border'
                }`}
                style={channel !== 'tr-genel' ? { borderColor: 'var(--border-color)' } : undefined}
              >
                <FlagTR /> #tr-genel
              </button>
              <button
                onClick={() => setChannel('en-general')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  channel === 'en-general'
                    ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-sm'
                    : 'border'
                }`}
                style={channel !== 'en-general' ? { borderColor: 'var(--border-color)' } : undefined}
              >
                <FlagEN /> #en-general
              </button>
            </div>

            {/* Takma Ad & Avatar */}
            <div className="px-3 py-2 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-color)' }}>
              <button
                onClick={() => {
                  const next = (avatarIdx + 1) % AVATARS.length;
                  setAvatarIdx(next);
                  localStorage.setItem('gta6takip_avatar', String(next));
                }}
                className={`w-7 h-7 rounded-lg bg-gradient-to-br ${AVATARS[avatarIdx].bg} text-white text-xs font-bold flex items-center justify-center shrink-0`}
                title="Avatar"
              >
                {AVATARS[avatarIdx].label}
              </button>
              <span className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
                {t.nickname}
              </span>
              <input
                type="text"
                value={isAdmin ? 'ADMIN' : nickname}
                disabled={isAdmin}
                maxLength={24}
                onChange={(e) => {
                  setNickname(e.target.value);
                  localStorage.setItem('gta6takip_nick', e.target.value);
                }}
                className="flex-1 min-w-0 text-xs font-bold px-2.5 py-1 rounded-lg border outline-none"
                style={{
                  backgroundColor: 'var(--bg-base)',
                  color: isAdmin ? '#ec4899' : 'var(--text-primary)',
                  borderColor: 'var(--border-color)',
                }}
              />
            </div>

            {/* Sabitlenen Mesaj */}
            {pinnedMessage && (
              <div
                className="px-3 py-2 border-b flex items-start justify-between gap-2 bg-amber-500/10"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                    <Pin className="w-3 h-3" /> {t.pinnedLabel} · {pinnedMessage.nickname}
                  </div>
                  <p className="text-xs truncate">{pinnedMessage.text}</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handlePinMessage(pinnedMessage)}
                    className="p-1 text-amber-500 hover:opacity-75 shrink-0"
                    title={t.unpin}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Mini Anket Kartı */}
            {activePoll && (
              <div
                className="px-3 py-2.5 border-b bg-purple-500/10 space-y-2"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-500">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>{activePoll.question}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-500">
                      {pollEnded
                        ? t.pollEnded
                        : `${t.pollRemaining} ${Math.floor(pollRemainingSec / 60)}:${String(
                            pollRemainingSec % 60
                          ).padStart(2, '0')}`}
                    </span>
                    {isAdmin && (
                      <button onClick={handleClosePoll} className="text-slate-400 hover:text-red-500" title={t.closePoll}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {activePoll.options.map((opt) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                    const myVote = activePoll.voters?.[voterId] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        disabled={pollEnded}
                        onClick={() => handleVotePoll(opt.id)}
                        className={`w-full text-left relative overflow-hidden rounded-lg border px-2.5 py-1.5 text-xs transition ${
                          myVote ? 'border-pink-500 font-bold' : ''
                        }`}
                        style={{ borderColor: myVote ? '#ec4899' : 'var(--border-color)' }}
                      >
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                        <div className="relative flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1 truncate">
                            {myVote && <Check className="w-3 h-3 text-pink-500 shrink-0" />}
                            {opt.text}
                          </span>
                          <span className="text-[11px] shrink-0" style={{ color: 'var(--text-secondary)' }}>
                            {pct}% · {opt.votes} {t.votesLabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Anket Oluşturma Formu (Admin) */}
            {showPollModal && isAdmin && (
              <form
                onSubmit={handleCreatePoll}
                className="p-3 border-b space-y-2"
                style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{t.pollTitle}</span>
                  <button type="button" onClick={() => setShowPollModal(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder={t.pollQuestionPlaceholder}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                />
                {pollOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    required={idx < 2}
                    value={opt}
                    onChange={(e) => {
                      const copy = [...pollOptions];
                      copy[idx] = e.target.value;
                      setPollOptions(copy);
                    }}
                    placeholder={`${t.pollOptionPlaceholder} ${idx + 1}`}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border outline-none"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                    }}
                  />
                ))}
                <div className="flex items-center justify-between gap-2 pt-1">
                  {pollOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, ''])}
                      className="text-[11px] font-semibold text-pink-500"
                    >
                      {t.addOption}
                    </button>
                  )}
                  <div className="flex items-center gap-1.5 text-xs ml-auto">
                    <span>{t.pollDuration}</span>
                    <select
                      value={pollDuration}
                      onChange={(e) => setPollDuration(Number(e.target.value))}
                      className="px-2 py-1 rounded-lg border text-xs"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)',
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((m) => (
                        <option key={m} value={m}>
                          {m} {t.minuteShort}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500"
                >
                  {t.startPoll}
                </button>
              </form>
            )}

            {/* Mesaj Listesi */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 vice-scroll">
              {currentMessages.length === 0 ? (
                <p className="text-xs text-center py-10" style={{ color: 'var(--text-secondary)' }}>
                  {t.emptyChat}
                </p>
              ) : (
                currentMessages.map((msg) => {
                  const av = AVATARS[msg.avatar % AVATARS.length] || AVATARS[0];
                  const timeStr = msg.created_at
                    ? new Date(msg.created_at).toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';

                  return (
                    <div
                      key={msg.id}
                      className={`rounded-xl p-2.5 border transition ${
                        msg.is_admin
                          ? 'bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-amber-500/15 border-pink-500/40'
                          : ''
                      }`}
                      style={!msg.is_admin ? { backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)' } : undefined}
                    >
                      {msg.reply_to && (
                        <div
                          className="text-[11px] px-2 py-1 mb-1.5 rounded-lg border-l-2 border-pink-500 bg-pink-500/5 truncate"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <strong>@{msg.reply_to.nickname}:</strong> {msg.reply_to.text}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-md bg-gradient-to-br ${av.bg} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}
                          >
                            {av.label}
                          </span>
                          <span className={`text-xs font-bold truncate ${msg.is_admin ? 'text-pink-500' : ''}`}>
                            {msg.nickname}
                          </span>
                          {msg.is_admin && (
                            <span className="inline-flex items-center gap-1">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                                ADMIN
                              </span>
                              <VerifiedBadge />
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                            {timeStr}
                          </span>
                          <button
                            onClick={() => setReplyTo({ id: msg.id, nickname: msg.nickname, text: msg.text })}
                            className="p-0.5 opacity-60 hover:opacity-100"
                            title={t.reply}
                          >
                            <Reply className="w-3 h-3" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handlePinMessage(msg)}
                                className="p-0.5 text-amber-500 hover:opacity-80"
                                title={pinnedMessage?.id === msg.id ? t.unpin : t.pin}
                              >
                                {pinnedMessage?.id === msg.id ? (
                                  <PinOff className="w-3 h-3" />
                                ) : (
                                  <Pin className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-0.5 text-red-500 hover:opacity-80"
                                title={t.delete}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              {!msg.is_admin && (
                                <button
                                  onClick={() => handleBanUser(msg.nickname)}
                                  className="p-0.5 text-red-600 hover:opacity-80"
                                  title={t.ban}
                                >
                                  <Ban className="w-3 h-3" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed break-words">{msg.text}</p>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Uyarı / Yanıt / Emoji Alanı */}
            {chatAlert && (
              <div className="px-3 py-1.5 bg-red-500/15 text-red-500 text-[11px] font-semibold text-center">
                {chatAlert}
              </div>
            )}
            {replyTo && (
              <div
                className="px-3 py-1.5 border-t flex items-center justify-between text-[11px]"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <span className="truncate">
                  {t.replyingTo} <strong>@{replyTo.nickname}</strong> — {replyTo.text}
                </span>
                <button onClick={() => setReplyTo(null)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {showEmoji && (
              <div
                className="px-3 py-1.5 border-t flex items-center gap-2 flex-wrap"
                style={{ borderColor: 'var(--border-color)' }}
              >
                {QUICK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setChatInput((prev) => prev + em)}
                    className="text-base hover:scale-125 transition"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}

            {/* Mesaj Girişi */}
            <form
              onSubmit={handleSendMessage}
              className="p-2.5 border-t flex items-center gap-2"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                className="p-2 rounded-xl border shrink-0"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <Smile className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={chatInput}
                disabled={isUserBanned}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isUserBanned ? t.bannedWarn : t.placeholder}
                className="flex-1 min-w-0 text-xs px-3 py-2 rounded-xl border outline-none"
                style={{
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)',
                }}
              />
              <button
                type="submit"
                disabled={isUserBanned || (!isAdmin && (slowmodeLeft > 0 || muteLeft > 0))}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 disabled:opacity-50 shrink-0"
              >
                {!isAdmin && (muteLeft > 0 || slowmodeLeft > 0) ? (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    {muteLeft > 0 ? muteLeft : slowmodeLeft}s
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    {t.send}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Alt Sosyal & Paylaşım Butonları */}
          {!isMobileFullscreen && (
            <div className="grid grid-cols-3 gap-2">
              <a
                href="https://x.com/batmancodex"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-bold hover:border-pink-500 transition truncate"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <span>𝕏 | batmancodex</span>
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-bold text-emerald-500 hover:border-emerald-500 transition truncate"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <span>{t.shareWa}</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-bold hover:border-sky-500 transition truncate"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <span>{t.shareX}</span>
              </a>
            </div>
          )}
        </aside>
      </main>

      {/* ALT BİLGİ */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
        <p>{t.disclaimer}</p>
      </footer>

      {/* ADMIN GİRİŞ MODALI */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div
            className="w-full max-w-xs rounded-2xl p-5 border shadow-xl space-y-3"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">{t.adminLoginTitle}</h3>
              <button onClick={() => setShowAdminModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {isAdmin ? (
              <button
                onClick={() => {
                  setIsAdmin(false);
                  setAdminPassword('');
                  localStorage.removeItem('gta6takip_admin_pass');
                  setShowAdminModal(false);
                }}
                className="w-full py-2 rounded-xl text-xs font-bold bg-red-500 text-white"
              >
                {t.logout}
              </button>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-3">
                <input
                  type="password"
                  value={adminPassInput}
                  onChange={(e) => setAdminPassInput(e.target.value)}
                  placeholder={t.adminPassPlaceholder}
                  className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  style={{
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500"
                >
                  {t.login}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
