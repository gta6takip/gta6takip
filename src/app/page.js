'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowUp,
  Share2,
  MessageSquarePlus,
  Check,
  MessageSquare,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import {
  SCORE_SNAPSHOT_KEY,
  CHAT_CACHE_PREFIX,
  INITIAL_TEAMS_LIMIT,
  CHAT_COOLDOWN_SEC,
  CHAT_COOLDOWN_KEY,
  CHAT_SOUND_KEY,
  CHAT_CLIENT_KEY,
  CHAT_REACTIONS_KEY,
  CHAT_DOCK_KEY,
  THEMES,
  FALLBACK_TEAMS,
  FALLBACK_FEATURED_PORT,
  normalizeThemeKey,
  playChatChime,
  guessClientCountry,
  localizeDynamicText,
  extractPeakFps,
} from '../lib/constants';
import { IconX, IconWhatsApp } from '../components/Icons';
import { Header, MobileBottomNav } from '../components/Header';
import { HeroTelemetry } from '../components/HeroTelemetry';
import { Leaderboard } from '../components/Leaderboard';
import { LiveChat } from '../components/LiveChat';
import { SystemCheck } from '../components/SystemCheck';
import { NewsSection } from '../components/NewsSection';
import {
  TeamDetailModal,
  ChangelogModal,
  FeedbackModal,
  PwaInstallModal,
} from '../components/Modals';

export default function HomePage() {
  const [lang, setLang] = useState('tr');
  const [themeKey, setThemeKey] = useState('leonida');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [onlineMenuOpen, setOnlineMenuOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [radarOpen, setRadarOpen] = useState(true);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [showBackTop, setShowBackTop] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Navigation & Desktop Split Chat Dock
  const [activeTab, setActiveTab] = useState('race');
  const [chatDockOpen, setChatDockOpen] = useState(true);

  // Leaderboard filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [gpuFilter, setGpuFilter] = useState('all');
  const [teamSearch, setTeamSearch] = useState('');
  const [showAllTeams, setShowAllTeams] = useState(false);
  const [compactView, setCompactView] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [prevScores, setPrevScores] = useState({});

  // News & DMCA
  const [newsFeedCache, setNewsFeedCache] = useState({ tr: null, en: null });
  const [newsFeedLoading, setNewsFeedLoading] = useState(false);
  const [newsFeedCategory, setNewsFeedCategory] = useState('all');
  const [dmcaItems, setDmcaItems] = useState([]);

  // System Check
  const [sysGpu, setSysGpu] = useState('rtx3050');
  const [sysVram, setSysVram] = useState(4);
  const [sysRam, setSysRam] = useState(16);

  // Live Chat state
  const [chatFullscreen, setChatFullscreen] = useState(false);
  const [chatInputFocused, setChatInputFocused] = useState(false);
  const [nickEditing, setNickEditing] = useState(false);
  const [pinExpanded, setPinExpanded] = useState(false);
  const [chatRoom, setChatRoom] = useState('tr');
  const chatRoomRef = useRef('tr');
  const chatVisibleRef = useRef(false);
  const chatFetchedRef = useRef(false);
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
  const [activeMsgActionId, setActiveMsgActionId] = useState(null);
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
  const chatListRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Feedback modal
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('idle');

  // Telemetry & Presence
  const [teams, setTeams] = useState(FALLBACK_TEAMS);
  const [totalEfforts, setTotalEfforts] = useState(45);
  const [bootingCount, setBootingCount] = useState(21);
  const [top3Avg, setTop3Avg] = useState(88.9);
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

  const isLight = Boolean(THEMES[themeKey]?.isLight);
  const showDesktopDock = isDesktop && activeTab === 'race' && chatDockOpen;
  const chatVisible = activeTab === 'chat' || showDesktopDock;

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

  // Track desktop breakpoint (>= 1024px) for Split View
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(min-width: 1024px)');
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Sync data-theme attribute on <html> cleanly without desynced transition lag
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const root = document.documentElement;
    root.classList.add('theme-switching');
    root.setAttribute('data-theme', themeKey);
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('theme-switching');
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      root.classList.remove('theme-switching');
    };
  }, [themeKey]);

  // Restore saved preferences
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('gta6takip_theme');
      if (savedTheme) {
        setThemeKey(normalizeThemeKey(savedTheme));
      }

      const savedDock = localStorage.getItem(CHAT_DOCK_KEY);
      if (savedDock === '0') {
        setChatDockOpen(false);
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
      // Storage unavailable
    }
  }, []);

  // PWA listeners
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
        // Ignore
      }
      return;
    }
    setIosGuideOpen(true);
  };

  // Fullscreen scroll lock + Esc
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

  // Dropdown outside-click & Esc close
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

  // Cooldown timer
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
      // Ignore
    }
    setChatCooldown(sec);
  };

  useEffect(() => {
    chatRoomRef.current = chatRoom;
  }, [chatRoom]);

  useEffect(() => {
    chatSoundOnRef.current = chatSoundOn;
  }, [chatSoundOn]);

  // Fetch chat messages
  const fetchChatMessages = async (targetRoom = chatRoomRef.current) => {
    setChatLoading(true);
    setChatLoadFailed(false);

    try {
      const cachedRaw = localStorage.getItem(`${CHAT_CACHE_PREFIX}${targetRoom}`);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (Array.isArray(cached) && cached.length > 0 && chatRoomRef.current === targetRoom) {
          setChatMessages((prev) => (prev.length === 0 ? cached : prev));
        }
      }
    } catch {
      // Ignore
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
            // Ignore
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

  // Track chat visibility for presence, unread clearing, and initial fetch
  useEffect(() => {
    chatVisibleRef.current = chatVisible;
    if (chatVisible) {
      setUnreadWhileClosed(0);
      if (!chatFetchedRef.current) {
        chatFetchedRef.current = true;
        fetchChatMessages(chatRoomRef.current);
      }
    }
    if (presenceChannelRef.current) {
      presenceChannelRef.current
        .track({
          online_at: new Date().toISOString(),
          country: viewerCountryRef.current || 'TR',
          in_chat: chatVisible,
        })
        .catch(() => {});
    }
  }, [chatVisible]);

  // Auto-scroll when messages arrive
  useEffect(() => {
    if (!chatVisible) return;
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
  }, [chatMessages, chatVisible, chatFullscreen]);

  // Supabase Realtime chat listener
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
              if (!chatVisibleRef.current && !isOwnMessage) {
                setUnreadWhileClosed((c) => c + 1);
              } else if (chatVisibleRef.current && !isOwnMessage) {
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
      // Realtime fallback
    }
    return () => {
      if (chatChannel) chatChannel.unsubscribe();
    };
  }, [supabaseClient]);

  // Supabase Online Presence + Geo
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
        // Use local fallback
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
                in_chat: chatVisibleRef.current,
              });
            }
          });
      } catch {
        // Keep default 1
      }
    };

    initPresence();

    return () => {
      cancelled = true;
      if (presenceChannelRef.current === channel) presenceChannelRef.current = null;
      if (channel) channel.unsubscribe();
    };
  }, [supabaseClient]);

  // PortWatch Sync
  const fetchSyncData = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();

      if (data?.updatedAt) setLastSyncAt(data.updatedAt);

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
            highlightsTr: Array.isArray(item.highlightsTr) ? item.highlightsTr : [],
            blockers: Array.isArray(item.blockers) ? item.blockers : [],
            blockersTr: Array.isArray(item.blockersTr) ? item.blockersTr : [],
          }))
          .sort((a, b) => b.progress - a.progress);

        setTeams(normalized);
        try {
          const existingRaw = localStorage.getItem(SCORE_SNAPSHOT_KEY);
          const existing = existingRaw ? JSON.parse(existingRaw) : null;
          const ageMs = existing?.ts ? Date.now() - Number(existing.ts) : Infinity;
          if (!existing || ageMs > 6 * 60 * 60 * 1000) {
            const scoreMap = {};
            for (const tm of normalized) scoreMap[tm.name] = tm.progress;
            if (existing?.scores) setPrevScores(existing.scores);
            localStorage.setItem(
              SCORE_SNAPSHOT_KEY,
              JSON.stringify({ ts: Date.now(), scores: scoreMap })
            );
          }
        } catch {
          // Ignore
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
      if (data?.featuredPort && data.featuredPort.name) {
        setFeaturedPort(data.featuredPort);
      }
      if (Array.isArray(data?.dmcaItems) && data.dmcaItems.length > 0) {
        setDmcaItems(data.dmcaItems);
      }
    } catch {
      // Preserve fallback or current data
    } finally {
      setSyncing(false);
      setCountdown(300);
    }
  };

  useEffect(() => {
    fetchSyncData();
  }, []);

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
    const onScroll = () => setShowBackTop(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // News fetch on demand
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
      // Keep cache
    } finally {
      setNewsFeedLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'news') {
      fetchLiveNewsFeed(lang, false);
    }
  }, [activeTab, lang]);

  // Handlers
  const handleSelectTheme = (id) => {
    setThemeKey(id);
    setThemeMenuOpen(false);
    try {
      localStorage.setItem('gta6takip_theme', id);
    } catch {
      // Ignore
    }
  };

  const handleToggleChatDock = () => {
    setChatDockOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(CHAT_DOCK_KEY, next ? '1' : '0');
      } catch {
        // Ignore
      }
      if (next) {
        forceScrollRef.current = true;
        isAtBottomRef.current = true;
        setUnreadWhileClosed(0);
      }
      return next;
    });
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

  const handleSelectLang = (nextLang) => {
    setLang(nextLang);
    handleSwitchChatRoom(nextLang);
    try {
      localStorage.setItem('gta6takip_lang', nextLang);
    } catch {
      // Ignore
    }
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'chat') {
      forceScrollRef.current = true;
      isAtBottomRef.current = true;
      setUnreadWhileClosed(0);
      fetchChatMessages(chatRoomRef.current);
    } else {
      setChatFullscreen(false);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNickChange = (val) => {
    const trimmed = val.slice(0, 20);
    setChatNick(trimmed);
    try {
      localStorage.setItem('gta6takip_nick', trimmed);
    } catch {
      // Ignore
    }
  };

  const handleToggleChatSound = () => {
    const next = !chatSoundOn;
    setChatSoundOn(next);
    chatSoundOnRef.current = next;
    try {
      localStorage.setItem(CHAT_SOUND_KEY, next ? '1' : '0');
    } catch {
      // Ignore
    }
    if (next) playChatChime();
  };

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
    setTimeout(() => chatInputRef.current?.focus(), 0);
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
          // Ignore
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
        // Ignore
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
        setChatError(
          chatRoomRef.current === 'en'
            ? 'Slow down on reactions.'
            : 'Çok hızlı tepki veriyorsun, biraz bekle.'
        );
      }
    } catch {
      // Ignore
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
          ? `1 message per 20 seconds. Wait ${chatCooldown}s.`
          : `20 saniyede 1 mesaj gönderebilirsin. ${chatCooldown} sn bekle.`
      );
      return;
    }

    const nick = chatNick.trim();
    const msg = chatInput.trim();
    if (nick.length < 2) {
      setNickEditing(true);
      setChatError(
        isEnRoom ? 'Enter a nickname (at least 2 chars).' : 'Önce en az 2 karakterli bir rumuz yaz.'
      );
      return;
    }
    if (!msg) return;

    setChatSending(true);
    lastOwnSendAtRef.current = Date.now();
    try {
      localStorage.setItem('gta6takip_nick', nick);
    } catch {
      // Ignore
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
      setNickEditing(false);
      if (typeof data?.cooldownSeconds === 'number' && data.cooldownSeconds > 0) {
        startChatCooldown(data.cooldownSeconds);
      }
    } catch {
      setChatError(isEnRoom ? 'Connection error, try again.' : 'Bağlantı hatası, tekrar dene.');
    } finally {
      setChatSending(false);
    }
  };

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

  // Derived leaderboard values
  const leader = teams[0] || FALLBACK_TEAMS[0];
  const secondTeam = teams[1] || FALLBACK_TEAMS[1];
  const thirdTeam = teams[2] || FALLBACK_TEAMS[2];
  const openLeader = teams.find((t) => t.type === 'open') || leader;
  const playableCount = useMemo(
    () => teams.filter((t) => Number(t.progress) >= 50).length,
    [teams]
  );
  const peakFps = useMemo(() => extractPeakFps(teams), [teams]);
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
  const openCount = useMemo(
    () => teams.filter((t) => t.type === 'open').length,
    [teams]
  );
  const privateCount = teams.length - openCount;

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

  const faqItems = useMemo(() => {
    const etaTr =
      leader.progress >= 95 && peakFps >= 30
        ? `En yakın yapı (${leader.name} · %${leader.progress}) sona çok yaklaştı; ancak tüm oyunun hatasız bitirilmesi ve stabil optimizasyon için net bir çıkış tarihi yok.`
        : `Şu an en yakın yapı (${leader.name} · %${leader.progress}, tepe ${peakFps} FPS) hızla ilerliyor; ancak tüm oyunun 30+ FPS ve hatasız tamamlanması için net bir tarih yok. Resmi PC sürümü ise söylentilere göre 2027 başını hedefliyor.`;

    const etaEn =
      leader.progress >= 95 && peakFps >= 30
        ? `The closest build (${leader.name} · ${leader.progress}%) is nearing completion, though there is no fixed ETA for a bug-free full playthrough.`
        : `The closest build (${leader.name} · ${leader.progress}%, peak ${peakFps} FPS) is progressing fast, but there is no firm ETA for a full 30+ FPS release. Rockstar's official PC version is rumored for early 2027.`;

    const statusTr = `PortWatch canlı verilerine göre ${totalEfforts} girişimden ${bootingCount} proje oyunu başlatabiliyor ve ${playableCount} ekip "Oynanabilir" barajını geçmiş durumda. Zirvedeki #1 ${leader.name} (%${leader.progress}), ${localizeDynamicText(leader.fps, 'tr')} civarı performansla önde. Arkasında #2 ${secondTeam.name} (%${secondTeam.progress}) ve #3 ${thirdTeam.name} (%${thirdTeam.progress}) yer alıyor. Açık kaynak tarafında ${openLeader.name} (%${openLeader.progress}) lider.`;

    const statusEn = `Per live PortWatch data, ${bootingCount} of ${totalEfforts} tracked efforts boot GTA VI and ${playableCount} have reached the "Playable" threshold. #1 ${leader.name} (${leader.progress}%) leads at ${localizeDynamicText(leader.fps, 'en')}, followed by #2 ${secondTeam.name} (${secondTeam.progress}%) and #3 ${thirdTeam.name} (${thirdTeam.progress}%). ${openLeader.name} (${openLeader.progress}%) leads open-source projects.`;

    return [
      {
        qTr: 'AMD ve NVIDIA neden fark ediyor?',
        qEn: 'Why do AMD and NVIDIA perform differently?',
        aTr: 'PS5 ve Xbox Series X|S konsolları AMD RDNA2 grafik mimarisi kullandığı için sızdırılan konsol shader kodları AMD kartlarda daha doğrudan çalışıyor. NVIDIA kartlarda ekstra RDNA2→DXIL/HLSL dönüşümü gerektiği için aynı ekipte bile FPS ve kararlılık fark edebiliyor.',
        aEn: 'PS5 and Xbox Series X|S use AMD RDNA2 graphics, so leaked console shaders map more directly to AMD GPUs. NVIDIA requires extra RDNA2-to-DXIL/HLSL translation, affecting FPS and rendering stability.',
        live: false,
      },
      {
        qTr: 'Port ekipleri tam olarak ne için çalışıyor?',
        qEn: 'What are the port teams building?',
        aTr: 'Resmi PC sürümü çıkana kadar, sızdırılan Xbox Series çalıştırılabilir dosyasını (.exe) Windows veya Linux/Proton üzerinde açabilmek için uyumluluk katmanları (sistem DLL yönlendirmeleri, bellek yönetimi ve GPU shader çeviricileri) geliştiriyorlar.',
        aEn: 'Until the official PC release, teams are building compatibility layers (console DLL shims, memory managers, and GPU shader translators) to run the leaked Xbox Series build on Windows or Linux/Proton.',
        live: false,
      },
      {
        qTr: 'GTA VI, tahmini ne zaman tamamen portlanacak?',
        qEn: 'When will GTA VI be fully ported?',
        aTr: etaTr,
        aEn: etaEn,
        live: true,
      },
      {
        qTr: 'Şimdi son durum tam olarak nedir?',
        qEn: 'What is the current status right now?',
        aTr: statusTr,
        aEn: statusEn,
        live: true,
      },
    ];
  }, [leader, secondTeam, thirdTeam, openLeader, playableCount, peakFps, totalEfforts, bootingCount]);

  const sharedChatProps = {
    lang,
    isLight,
    chatRoom,
    onSwitchRoom: handleSwitchChatRoom,
    chatMessages,
    chatLoading,
    chatLoadFailed,
    onRetryFetch: () => fetchChatMessages(chatRoomRef.current),
    chatActiveCount,
    chatFullscreen,
    setChatFullscreen,
    chatSoundOn,
    onToggleSound: handleToggleChatSound,
    staffPinOpen,
    setStaffPinOpen,
    staffPin,
    setStaffPin,
    staffModeActive,
    isTypingAdminNick,
    pinnedNotice,
    pinExpanded,
    setPinExpanded,
    pinEditorOpen,
    setPinEditorOpen,
    pinDraft,
    setPinDraft,
    pinSaving,
    onSavePin: handleSavePin,
    chatNick,
    onNickChange: handleNickChange,
    nickEditing,
    setNickEditing,
    chatInput,
    setChatInput,
    chatSending,
    chatCooldown,
    chatNotice,
    chatError,
    replyTo,
    setReplyTo,
    onStartReply: handleStartReply,
    onMentionUser: handleMentionUser,
    myReactions,
    onToggleReaction: handleToggleReaction,
    activeMsgActionId,
    setActiveMsgActionId,
    clearingId,
    banningId,
    onClearMessage: handleClearMessage,
    onBanMessage: handleBanMessage,
    onSendChat: handleSendChat,
    chatListRef,
    chatEndRef,
    chatInputRef,
    onListScroll: handleChatListScroll,
    unreadWhileScrolled,
    onScrollBottom: handleScrollChatBottom,
    setChatInputFocused,
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <Header
        lang={lang}
        themeKey={themeKey}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onlineCount={onlineCount}
        chatActiveCount={chatActiveCount}
        unreadWhileClosed={unreadWhileClosed}
        countryStats={countryStats}
        onlineMenuOpen={onlineMenuOpen}
        setOnlineMenuOpen={setOnlineMenuOpen}
        themeMenuOpen={themeMenuOpen}
        setThemeMenuOpen={setThemeMenuOpen}
        onSelectTheme={handleSelectTheme}
        onSelectLang={handleSelectLang}
        onOpenChangelog={() => setChangelogOpen(true)}
        isStandalone={isStandalone}
        onInstallPwa={handleInstallPwa}
        countdown={countdown}
        syncing={syncing}
        onRefresh={fetchSyncData}
        chatDockOpen={chatDockOpen}
        onToggleChatDock={handleToggleChatDock}
      />

      <main className="flex-1 w-full max-w-[1380px] mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-5">
        {/* TAB 1: RACE LEADERBOARD (+ DESKTOP SPLIT LIVE CHAT DOCK) */}
        {activeTab === 'race' && (
          <div
            className={
              showDesktopDock
                ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px] gap-5 items-start'
                : 'max-w-5xl mx-auto'
            }
          >
            <div className="min-w-0 space-y-5">
              <HeroTelemetry
                lang={lang}
                isLight={isLight}
                leader={leader}
                secondTeam={secondTeam}
                thirdTeam={thirdTeam}
                totalEfforts={totalEfforts}
                bootingCount={bootingCount}
                playableCount={playableCount}
                top3Avg={top3Avg}
                peakFps={peakFps}
                amdCount={amdCount}
                nvidiaCount={nvidiaCount}
                lastSyncAt={lastSyncAt}
                featuredPort={featuredPort}
                onSelectTeam={setSelectedTeam}
              />

              {/* Mobile quick chat strip (clean inline entry, no floating overlap) */}
              <button
                type="button"
                onClick={() => handleSelectTab('chat')}
                className="lg:hidden w-full rounded-lg border border-subtle bg-surface px-4 py-3 flex items-center justify-between gap-3 hover-surface ui-tactile"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-xs font-semibold text-ink truncate">
                    {lang === 'tr' ? 'Canlı Sohbete Katıl (TR / EN)' : 'Join Live Chat (TR / EN)'}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 font-tech text-xs text-ink-2 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {Math.max(chatActiveCount, 1)} {lang === 'tr' ? 'sohbette' : 'active'}
                </span>
              </button>

              <Leaderboard
                lang={lang}
                isLight={isLight}
                teams={teams}
                filteredTeams={filteredTeams}
                visibleTeams={visibleTeams}
                amdCount={amdCount}
                nvidiaCount={nvidiaCount}
                openCount={openCount}
                privateCount={privateCount}
                gpuFilter={gpuFilter}
                setGpuFilter={setGpuFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                teamSearch={teamSearch}
                setTeamSearch={setTeamSearch}
                showAllTeams={showAllTeams}
                setShowAllTeams={setShowAllTeams}
                compactView={compactView}
                setCompactView={setCompactView}
                prevScores={prevScores}
                lastSyncAt={lastSyncAt}
                onSelectTeam={setSelectedTeam}
              />
            </div>

            {showDesktopDock && (
              <aside className="hidden lg:block lg:sticky lg:top-[72px]">
                <LiveChat
                  {...sharedChatProps}
                  mode="dock"
                  onExpandFromDock={() => handleSelectTab('chat')}
                  onCloseDock={handleToggleChatDock}
                />
              </aside>
            )}
          </div>
        )}

        {/* TAB 2: DEDICATED FULL-HEIGHT LIVE CHAT WORKSPACE */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <LiveChat {...sharedChatProps} mode="page" />
          </div>
        )}

        {/* TAB 3: SYSTEM COMPATIBILITY CHECK */}
        {activeTab === 'system' && (
          <SystemCheck
            lang={lang}
            isLight={isLight}
            teams={teams}
            sysGpu={sysGpu}
            setSysGpu={setSysGpu}
            sysVram={sysVram}
            setSysVram={setSysVram}
            sysRam={sysRam}
            setSysRam={setSysRam}
          />
        )}

        {/* TAB 4: NEWS, DMCA & FAQ */}
        {activeTab === 'news' && (
          <NewsSection
            lang={lang}
            isLight={isLight}
            newsFeedCache={newsFeedCache}
            newsFeedLoading={newsFeedLoading}
            newsFeedCategory={newsFeedCategory}
            setNewsFeedCategory={setNewsFeedCategory}
            onRefreshNews={() => fetchLiveNewsFeed(lang, true)}
            faqItems={faqItems}
            openFaqIdx={openFaqIdx}
            setOpenFaqIdx={setOpenFaqIdx}
            dmcaItems={dmcaItems}
            radarOpen={radarOpen}
            setRadarOpen={setRadarOpen}
          />
        )}
      </main>

      {/* CLEAN EDITORIAL FOOTER (No bouncing floating overlays) */}
      {activeTab !== 'chat' && (
        <footer className="border-t border-subtle mt-8 pb-24 sm:pb-10 pt-6 px-4">
          <div className="max-w-[1380px] mx-auto flex flex-col items-center gap-4 text-center text-xs text-ink-3">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setFeedbackStatus('idle');
                  setFeedbackOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-default bg-surface text-ink font-medium hover:border-strong hover-surface ui-tactile"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-accent" />
                <span>{lang === 'tr' ? 'Tavsiye / Fikir Gönder' : 'Send Feedback'}</span>
              </button>

              <a
                href="https://x.com/batmancodex"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-subtle bg-surface text-ink-2 hover:text-ink hover:border-default ui-tactile"
              >
                <IconX />
                <span>@batmancodex</span>
              </a>

              <a
                href="https://wa.me/?text=GTA%20VI%20PC%20Port%20Takip%3A%20https%3A%2F%2Fgta6takip.vercel.app%2F"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-subtle bg-surface text-ink-2 hover:text-ink hover:border-default ui-tactile"
              >
                <IconWhatsApp className="w-3.5 h-3.5 fill-current text-emerald-500" />
                <span>WhatsApp</span>
              </a>

              <a
                href="https://x.com/intent/tweet?text=GTA%20VI%20PC%20Port%20Takip&url=https%3A%2F%2Fgta6takip.vercel.app%2F"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-subtle bg-surface text-ink-2 hover:text-ink hover:border-default ui-tactile"
              >
                <IconX />
                <span>{lang === 'tr' ? "X'te Paylaş" : 'Share on X'}</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-subtle bg-surface text-ink-2 hover:text-ink hover:border-default ui-tactile"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-ink-3" />
                )}
                <span>
                  {copied
                    ? lang === 'tr'
                      ? 'Kopyalandı'
                      : 'Copied'
                    : lang === 'tr'
                      ? 'Linki Kopyala'
                      : 'Copy Link'}
                </span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap text-[11px] font-medium">
              <Link
                href="/gta-6-pc-ne-zaman-cikacak"
                className="text-ink-2 hover:text-ink underline underline-offset-4 decoration-[var(--border-strong)]"
              >
                {lang === 'tr' ? 'GTA 6 PC Ne Zaman Çıkacak?' : 'When is GTA VI Coming to PC?'}
              </Link>
              <span className="opacity-40">·</span>
              <Link
                href="/gta-6-kirildi-mi"
                className="text-ink-2 hover:text-ink underline underline-offset-4 decoration-[var(--border-strong)]"
              >
                {lang === 'tr' ? 'GTA 6 Kırıldı mı?' : 'Is GTA VI Cracked?'}
              </Link>
            </div>

            <p className="max-w-2xl leading-relaxed text-[11px] text-ink-3">
              {lang === 'tr'
                ? 'GTA6takip, PortWatch projesinin kâr gütmeyen, hobi amaçlı Türkçe takipçisidir. Veriler halka açık kaynaklardan derlenir; hiçbir korsan veya telifli dosya barındırılmaz.'
                : 'GTA6takip is a non-profit, community tracker inspired by PortWatch. All data is aggregated from public sources; no pirated or copyrighted files are hosted.'}
            </p>
          </div>
        </footer>
      )}

      {/* Subtle Back-to-top button (non-intrusive, never overlaps chat) */}
      {showBackTop && activeTab !== 'chat' && !chatFullscreen && !chatInputFocused && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={lang === 'tr' ? 'Yukarı çık' : 'Back to top'}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 w-9 h-9 inline-flex items-center justify-center rounded-md border border-default bg-surface text-ink-2 hover:text-ink hover:border-strong shadow-popover ui-tactile"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        lang={lang}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        unreadWhileClosed={unreadWhileClosed}
        chatActiveCount={chatActiveCount}
        hidden={chatFullscreen || chatInputFocused}
      />

      {/* Modals */}
      <TeamDetailModal
        team={selectedTeam}
        lang={lang}
        isLight={isLight}
        onClose={() => setSelectedTeam(null)}
      />
      <ChangelogModal
        open={changelogOpen}
        lang={lang}
        onClose={() => setChangelogOpen(false)}
      />
      <FeedbackModal
        open={feedbackOpen}
        lang={lang}
        onClose={() => setFeedbackOpen(false)}
        feedbackName={feedbackName}
        setFeedbackName={setFeedbackName}
        feedbackEmail={feedbackEmail}
        setFeedbackEmail={setFeedbackEmail}
        feedbackMsg={feedbackMsg}
        setFeedbackMsg={setFeedbackMsg}
        feedbackStatus={feedbackStatus}
        onSubmit={handleSendFeedback}
      />
      <PwaInstallModal
        open={iosGuideOpen}
        lang={lang}
        isIosDevice={isIosDevice}
        onClose={() => setIosGuideOpen(false)}
      />
    </div>
  );
}
