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
} from 'lucide-react';

const THEMES = [
  { id: 'portwatch-dark', label: 'PortWatch Koyu' },
  { id: 'portwatch-light', label: 'PortWatch Açık' },
];

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

function StageVisualBadge({ percentage, stage = '' }) {
  const pct = Number(percentage) || 0;
  const s = stage.toLowerCase();

  let level = 1;
  let label = 'Boot / Exe';
  let boxClass = 'bg-purple-500/15 text-purple-400 border-purple-500/30';
  let stepFill = 'bg-purple-400';

  if (pct >= 85 || s.includes('60 fps') || s.includes('akıcı')) {
    level = 4;
    label = 'Akıcı FPS';
    boxClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    stepFill = 'bg-amber-400';
  } else if (pct >= 60 || s.includes('oyun içi') || s.includes('dünya')) {
    level = 3;
    label = 'Oyun İçi';
    boxClass = 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
    stepFill = 'bg-emerald-400';
  } else if (pct >= 40 || s.includes('ilk kare') || s.includes('menü')) {
    level = 2;
    label = 'İlk Kare';
    boxClass = 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    stepFill = 'bg-sky-400';
  }

  return (
    <div
      title={`Aşama Seviyesi ${level}/4: ${stage || label}`}
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs font-bold shrink-0 ${boxClass}`}
    >
      <span>{label}</span>
      <span className="hidden sm:inline-flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={`w-1.5 h-2.5 rounded-sm ${
              step <= level ? stepFill : 'bg-slate-500/25'
            }`}
          />
        ))}
      </span>
    </div>
  );
}

function renderMessageWithLinks(text) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = String(text).split(urlRegex);

  return parts.map((part, idx) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-pink-500 underline decoration-pink-500/50 hover:text-orange-400 break-all font-medium"
        >
          <LinkIcon className="w-3.5 h-3.5 shrink-0" />
          {part}
        </a>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function formatUpdateTime(dateStr) {
  if (!dateStr) return 'Henüz senkronize edilmedi';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Bilinmiyor';
  return d.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function HomePage() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [chatError, setChatError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showOnlinePanel, setShowOnlinePanel] = useState(false);
  const [theme, setTheme] = useState('portwatch-dark');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    try {
      const savedName = localStorage.getItem('gta6takip_nick');
      if (savedName) setUsername(savedName);

      const savedTheme = localStorage.getItem('gta6takip_theme');
      if (savedTheme && THEMES.some((t) => t.id === savedTheme)) {
        setTheme(savedTheme);
      }
    } catch {
      // ignore
    }

    fetchProjects();
    fetchMessages();

    const projectChannel = supabase
      .channel('projects-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => fetchProjects()
      )
      .subscribe();

    const chatChannel = supabase
      .channel('chat-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          if (payload?.new) {
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === payload.new.id);
              return exists ? prev : [...prev, payload.new];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(chatChannel);
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
    const currentNick = username.trim().slice(0, 24) || 'ViceMisafir';
    const presenceChannel = supabase.channel('gta6takip-online-room', {
      config: {
        presence: { key: currentNick },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const names = Object.keys(state);
        setOnlineUsers(names.length > 0 ? names : [currentNick]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user: currentNick,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [username]);

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
  }, [messages]);

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

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('id', { ascending: true })
        .limit(100);
      if (!error && Array.isArray(data)) {
        setMessages(data);
      } else if (error) {
        setChatError(`Sohbet okuma hatası: ${error.message}`);
      }
    } catch (err) {
      setChatError(`Bağlantı hatası: ${err?.message || 'Bilinmiyor'}`);
    }
  }

  async function handleAutoSync() {
    if (syncing) return;
    setSyncing(true);
    const nowIso = new Date().toISOString();

    try {
      await fetch('/api/sync').catch(() => {});

      const { error } = await supabase
        .from('projects')
        .update({ updated_at: nowIso })
        .not('name', 'is', null);

      if (!error) {
        await fetchProjects();
      } else {
        setProjects((prev) =>
          prev.map((item) => ({ ...item, updated_at: nowIso }))
        );
      }

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

  async function handleSendMessage(e) {
    if (e && e.preventDefault) e.preventDefault();
    setChatError('');

    const cleanMsg = newMessage.trim();
    const cleanNick = username.trim().slice(0, 24) || 'ViceMisafir';

    if (!cleanMsg) {
      setChatError('Lütfen önce bir mesaj veya link yaz.');
      return;
    }
    if (sending) return;

    setSending(true);
    try {
      localStorage.setItem('gta6takip_nick', cleanNick);
    } catch {
      // ignore
    }

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            username: cleanNick,
            message: cleanMsg.slice(0, 500),
          },
        ])
        .select();

      if (error) {
        setChatError(`Gönderilemedi: ${error.message}`);
      } else {
        setNewMessage('');
        if (Array.isArray(data) && data.length > 0) {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === data[0].id);
            return exists ? prev : [...prev, data[0]];
          });
        } else {
          await fetchMessages();
        }
      }
    } catch (err) {
      setChatError(`Beklenmeyen hata: ${err?.message || 'İstek başarısız'}`);
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

  return (
    <div className="min-h-screen flex flex-col">
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
                120sn Otomatik İlerleme Takibi & Türkçe Canlı Sohbet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border"
            >
              <Palette style={{ color: 'var(--text-secondary)' }} className="w-3.5 h-3.5 hidden sm:block" />
              <select
                aria-label="Tema Seç"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowOnlinePanel((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 transition cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Users className="w-3.5 h-3.5" />
                <span>{onlineCount} Çevrimiçi</span>
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
                      Aktif Bağlantılar ({onlineCount})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOnlinePanel(false)}
                      style={{ color: 'var(--text-secondary)' }}
                      className="text-[11px] hover:underline cursor-pointer"
                    >
                      Kapat
                    </button>
                  </div>
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto vice-scroll list-none p-0 m-0">
                    {onlineUsers.map((nick, i) => (
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
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span style={{ color: 'var(--text-secondary)' }}>Lider:</span>
              <span className="font-bold">{leaderName}</span>
              <span className="font-black pw-text-gradient">%{topScore}</span>
            </div>

            <button
              type="button"
              onClick={handleAutoSync}
              disabled={syncing}
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border hover:opacity-90 transition cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-pink-500 ${syncing ? 'animate-spin' : ''}`}
              />
              <span>{syncing ? 'Güncelleniyor...' : `Oto Yenile (${secondsLeft}sn)`}</span>
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
              Her 120 Saniyede Otomatik Tarama
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Ekiplerin Tamamlanma Yüzdeleri
            </h1>
            <p className="text-xs text-purple-100/85">
              Portlama ekiplerinin güncel ilerleme oranları, aşamaları ve anlık topluluk sohbeti.
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-950/45 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-white shrink-0">
            <div className="px-2.5 text-center">
              <div className="text-[10px] uppercase tracking-wider text-purple-200/75">Zirve</div>
              <div className="text-lg sm:text-xl font-extrabold text-amber-300">%{topScore}</div>
            </div>
            <div className="px-2.5 border-l border-white/15 text-center">
              <div className="text-[10px] uppercase tracking-wider text-purple-200/75">Sonraki</div>
              <div className="text-lg sm:text-xl font-extrabold text-pink-300 tabular-nums">{secondsLeft}s</div>
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
              Portlama Ekipleri Sıralaması ({projects.length} Ekip)
            </h2>
            <span style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
              Yüksekten düşüğe
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
                              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25'
                              : 'bg-pink-500/15 text-pink-500 border-pink-500/25'
                          }`}
                        >
                          {proj.is_open_source ? 'Açık Kaynak' : 'Kapalı Ekip'}
                        </span>
                      </div>

                      <span className="text-xl sm:text-2xl font-extrabold tabular-nums pw-text-gradient shrink-0">
                        %{pct}
                      </span>
                    </div>

                    {/* İlerleme Barı + Aşama Rozeti */}
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
                      <StageVisualBadge percentage={pct} stage={proj.stage} />
                    </div>

                    <div
                      style={{ backgroundColor: 'var(--card-inner)', borderColor: 'var(--card-border)' }}
                      className="rounded-xl px-3 py-2 border mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <span className="font-semibold">Aşama: {proj.stage || 'Geliştirme'}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {proj.fps && proj.fps !== '-' ? proj.fps : 'FPS bilgisi yok'}
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
                          <span>Son Güncelleme Saati: {formatUpdateTime(proj.updated_at)}</span>
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
                          Kaynak <ExternalLink className="w-3.5 h-3.5" />
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
          className="lg:col-span-5 xl:col-span-4 rounded-2xl border overflow-hidden shadow-sm flex flex-col lg:sticky lg:top-[76px] lg:h-[calc(100vh-98px)] min-h-[520px]"
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
                <h2 className="text-sm font-extrabold">Vice City Canlı Sohbet</h2>
                <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
                  Nickname yaz, sohbet et ve link paylaş
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Canlı
            </span>
          </div>

          <div
            style={{ borderColor: 'var(--card-border)' }}
            className="px-4 py-2.5 border-b flex items-center gap-2.5 shrink-0"
          >
            <label
              htmlFor="nickname-input"
              style={{ color: 'var(--text-secondary)' }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold shrink-0"
            >
              <User className="w-3.5 h-3.5 text-pink-500" />
              Nickname:
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
              placeholder="Takma adını yaz..."
              style={{ backgroundColor: 'var(--card-inner)', borderColor: 'var(--card-border)' }}
              className="w-full rounded-xl border px-3 py-1.5 text-xs font-bold text-pink-500 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto vice-scroll p-4 space-y-2.5">
            {messages.length === 0 ? (
              <div
                style={{ color: 'var(--text-secondary)' }}
                className="h-full flex flex-col items-center justify-center text-center text-xs space-y-1.5 px-4"
              >
                <p className="font-semibold">Sohbet odası aktif!</p>
                <p>Nickname'ini yazıp ilk mesajı veya GTA VI port linkini paylaşabilirsin.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  style={{ backgroundColor: 'var(--card-inner)', borderColor: 'var(--card-border)' }}
                  className="rounded-xl border p-3 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-pink-500">{msg.username}</span>
                    <span style={{ color: 'var(--text-secondary)' }} className="text-[10px]">
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed break-words">
                    {renderMessageWithLinks(msg.message)}
                  </p>
                </div>
              ))
            )}
            <div ref={chatBottomRef} />
          </div>

          {chatError && (
            <div className="px-4 py-2 bg-rose-500/15 border-t border-rose-500/30 text-xs text-rose-400">
              {chatError}
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            style={{ backgroundColor: 'var(--card-inner)', borderColor: 'var(--card-border)' }}
            className="p-3 border-t flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSendMessage(e);
                }
              }}
              maxLength={500}
              placeholder="Mesaj yaz veya https:// link yapıştır..."
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              className="flex-1 min-w-0 rounded-xl border px-3 py-2 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending}
              className="gta-bar-fill px-4 py-2 rounded-xl hover:brightness-110 disabled:opacity-40 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'Atılıyor...' : 'Gönder'}</span>
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
          <span>
            GTA6takip bağımsız bir topluluk takip sitesidir; Rockstar Games veya Take-Two ile resmi bağlantısı yoktur.
          </span>
        </div>
      </footer>
    </div>
  );
}
