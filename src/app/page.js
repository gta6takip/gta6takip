'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Flame,
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
} from 'lucide-react';

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
    id: 6,
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
    id: 7,
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
    id: 8,
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

function renderMessageWithLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, idx) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-pink-300 underline decoration-pink-400/60 hover:text-amber-300 break-all font-medium"
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
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showOnlinePanel, setShowOnlinePanel] = useState(false);
  const chatBottomRef = useRef(null);

  const activeNick = username.trim().slice(0, 24) || 'ViceMisafir';

  useEffect(() => {
    const savedName = localStorage.getItem('gta6takip_nick');
    if (savedName) {
      setUsername(savedName);
    }

    fetchProjects();
    fetchMessages();

    const projectChannel = supabase
      .channel('projects-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    const chatChannel = supabase
      .channel('chat-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(chatChannel);
    };
  }, []);

  // Çevrimiçi kullanıcı takibi (Supabase Presence)
  useEffect(() => {
    const presenceChannel = supabase.channel('gta6takip-online-room', {
      config: {
        presence: {
          key: activeNick,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const names = Object.keys(state);
        setOnlineUsers(names.length > 0 ? names : [activeNick]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user: activeNick,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [activeNick]);

  // Her 120 saniyede bir otomatik güncelleme ve geri sayım
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
      }
    } catch {
      // Bağlantı kurulana kadar boş bırak
    }
  }

  async function handleAutoSync() {
    if (syncing) return;
    setSyncing(true);
    try {
      await fetch('/api/sync');
      await fetchProjects();
      setSecondsLeft(120);
    } finally {
      setSyncing(false);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    const cleanMsg = newMessage.trim();
    if (!cleanMsg || sending) return;

    setSending(true);
    localStorage.setItem('gta6takip_nick', activeNick);

    const { error } = await supabase.from('chat_messages').insert([
      {
        username: activeNick,
        message: cleanMsg.slice(0, 500),
      },
    ]);

    if (!error) {
      setNewMessage('');
    }
    setSending(false);
  }

  const topScore =
    projects.length > 0
      ? Math.max(...projects.map((p) => Number(p.percentage) || 0))
      : 79;

  const leaderName = projects[0]?.name || 'omonkey';
  const onlineCount = Math.max(1, onlineUsers.length);

  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* GTA VI Vice City Üst Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-2xl bg-[#090517]/85 border-b border-pink-500/25 shadow-[0_4px_30px_rgba(236,72,153,0.12)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-pink-500 to-violet-700 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.45)] ring-1 ring-white/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
                  GTA6takip
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 to-amber-500/20 border border-pink-400/35 text-amber-200 font-bold">
                  LEONIDA • PC PORT
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                120sn Otomatik İlerleme Takibi & Türkçe Canlı Sohbet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Çevrimiçi Kişi Butonu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowOnlinePanel((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.2)] transition cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Users className="w-3.5 h-3.5 text-emerald-300" />
                <span>{onlineCount} Çevrimiçi</span>
              </button>

              {showOnlinePanel && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#130929]/95 border border-pink-500/35 shadow-2xl p-3.5 z-40">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <span className="text-xs font-extrabold text-amber-300">
                      Aktif Bağlantılar ({onlineCount})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOnlinePanel(false)}
                      className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      Kapat
                    </button>
                  </div>
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto vice-scroll list-none p-0 m-0">
                    {onlineUsers.map((nick, i) => (
                      <li
                        key={`${nick}-${i}`}
                        className="flex items-center gap-2 text-xs text-slate-200 bg-white/[0.04] px-2.5 py-1.5 rounded-lg"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate font-semibold">{nick}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-slate-400">Lider:</span>
              <span className="font-bold text-white">{leaderName}</span>
              <span className="font-black text-pink-400">%{topScore}</span>
            </div>

            <button
              type="button"
              onClick={handleAutoSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/25 via-pink-600/30 to-purple-600/30 hover:from-amber-500/40 hover:to-pink-600/50 border border-pink-400/40 shadow-[0_0_15px_rgba(236,72,153,0.2)] transition cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-amber-300 ${syncing ? 'animate-spin' : ''}`}
              />
              <span>
                {syncing ? 'Güncelleniyor...' : `Oto Yenile (${secondsLeft}sn)`}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Ana Alan: PC'de Sol % İlerleme + Sağ Canlı Sohbet */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SOL SÜTUN: % İlerleme Çubukları ve Ekipler (Kaydırmalı Alan) */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          {/* Üst Neon Özet Bandı */}
          <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-[#1b0b36]/90 via-[#240b38]/85 to-[#2c112b]/90 border border-pink-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/25 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Her 120 Saniyede Otomatik Tarama
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Ekiplerin{' '}
                  <span className="bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
                    Tamamlanma Yüzdeleri
                  </span>
                </h1>
                <p className="text-xs text-slate-300">
                  Çubuklar her 120 saniyede bir otomatik kontrol edilir. Kartların altında son güncelleme saatini görebilirsin.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="rounded-2xl bg-black/45 border border-pink-500/20 px-3.5 py-2 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Zirve</div>
                  <div className="text-lg sm:text-xl font-black text-amber-300">%{topScore}</div>
                </div>
                <div className="rounded-2xl bg-black/45 border border-pink-500/20 px-3.5 py-2 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Sonraki</div>
                  <div className="text-lg sm:text-xl font-black text-cyan-300">{secondsLeft}s</div>
                </div>
              </div>
            </div>
          </div>

          {/* Başlık Satırı */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2 text-pink-200">
              <Cpu className="w-4 h-4 text-amber-300" />
              Portlama Ekipleri Sıralaması
            </h2>
            <span className="text-[11px] text-slate-400">Kaydırmalı liste • Yüksekten düşüğe</span>
          </div>

          {/* Kaydırmalı 3D Bar Listesi */}
          <div className="lg:max-h-[calc(100vh-235px)] lg:overflow-y-auto vice-scroll lg:pr-2">
            <ul className="flex flex-col gap-3.5 list-none p-0 m-0">
              {projects.map((proj, index) => {
                const pct = Math.min(100, Math.max(0, Number(proj.percentage) || 0));
                return (
                  <li
                    key={proj.id || index}
                    className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#160b2c]/90 via-[#120824]/90 to-[#1f0b2d]/85 border border-white/10 hover:border-pink-400/45 shadow-[0_10px_28px_rgba(0,0,0,0.45)] transition"
                  >
                    {/* Ekip Başlığı ve Yüzde */}
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-pink-400/35 text-amber-200 shrink-0">
                          #{index + 1}
                        </span>
                        <h3 className="text-lg sm:text-xl font-black tracking-tight text-white truncate">
                          {proj.name}
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0 ${
                            proj.is_open_source
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
                          }`}
                        >
                          {proj.is_open_source ? 'Açık Kaynak' : 'Kapalı Ekip'}
                        </span>
                      </div>

                      <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent shrink-0">
                        %{pct}
                      </span>
                    </div>

                    {/* 3D Neon İlerleme Çubuğu */}
                    <div className="relative w-full h-6 sm:h-7 rounded-2xl bg-[#06030f] p-1 border border-white/15 shadow-[inset_0_4px_10px_rgba(0,0,0,0.95),0_2px_8px_rgba(236,72,153,0.18)] mb-3 overflow-hidden">
                      <div
                        className="relative h-full rounded-xl bg-gradient-to-r from-amber-400 via-pink-500 to-violet-600 shadow-[0_0_16px_rgba(236,72,153,0.55),inset_0_2px_3px_rgba(255,255,255,0.6),inset_0_-3px_5px_rgba(76,29,149,0.85)] transition-all duration-700 flex items-center justify-end pr-2.5"
                        style={{ width: `${Math.max(pct, 9)}%` }}
                      >
                        <div className="absolute inset-x-1 top-0.5 h-2 rounded-full bg-white/35 pointer-events-none" />
                        <span className="relative z-10 text-[11px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                          %{pct}
                        </span>
                      </div>
                    </div>

                    {/* Aşama, Kısa Özet, Son Güncelleme Saati ve Kaynak Linki */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 text-xs text-slate-300">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-300">
                          Aşama: {proj.stage || 'Geliştirme'}{' '}
                          {proj.fps && proj.fps !== '-' ? `• ${proj.fps}` : ''}
                        </p>
                        <p className="text-xs text-slate-300/95 leading-relaxed">
                          {proj.description}
                        </p>
                        <p className="inline-flex items-center gap-1.5 text-[11px] text-cyan-300/90 font-medium pt-0.5">
                          <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>Son Güncelleme Saati: {formatUpdateTime(proj.updated_at)}</span>
                        </p>
                      </div>

                      {proj.repo_url && (
                        <a
                          href={proj.repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-pink-500/25 border border-white/10 hover:border-pink-400/50 text-pink-200 hover:text-amber-300 text-xs font-semibold transition shrink-0 self-start sm:self-end"
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

        {/* SAĞ SÜTUN: GTA VI Canlı Sohbet ve Link Paylaşımı */}
        <aside className="lg:col-span-5 xl:col-span-4 rounded-3xl bg-gradient-to-b from-[#160a2e]/95 to-[#0d061c]/95 border border-pink-500/30 overflow-hidden shadow-[0_14px_45px_rgba(0,0,0,0.6)] flex flex-col lg:sticky lg:top-[76px] lg:h-[calc(100vh-98px)] min-h-[520px]">
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-amber-500/15 via-pink-600/25 to-purple-700/25 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-400/35 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-pink-300" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  Vice City Canlı Sohbet
                </h2>
                <p className="text-[11px] text-slate-300">
                  Nickname yaz, sohbet et ve link paylaş
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-1 rounded-full shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Canlı
            </span>
          </div>

          <div className="px-4 py-3 bg-black/40 border-b border-white/10 flex items-center gap-2.5 shrink-0">
            <label
              htmlFor="nickname-input"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-200 shrink-0"
            >
              <User className="w-3.5 h-3.5 text-amber-300" />
              Nickname:
            </label>
            <input
              id="nickname-input"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                localStorage.setItem('gta6takip_nick', e.target.value);
              }}
              maxLength={24}
              placeholder="Takma adını yaz..."
              className="w-full rounded-xl bg-white/[0.08] border border-pink-400/35 px-3 py-1.5 text-xs sm:text-sm font-bold text-amber-300 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-amber-300"
            />
          </div>

          <div className="flex-1 overflow-y-auto vice-scroll p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs space-y-1.5 px-4">
                <p className="font-semibold text-pink-200/80">Sohbet odası aktif!</p>
                <p>Nickname'ini yazıp ilk mesajı veya GTA VI port linkini paylaşabilirsin.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-2xl bg-white/[0.05] hover:bg-white/[0.07] border border-white/10 p-3 space-y-1 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-amber-300">{msg.username}</span>
                    <span className="text-[10px] text-slate-400">
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed break-words">
                    {renderMessageWithLinks(msg.message)}
                  </p>
                </div>
              ))
            )}
            <div ref={chatBottomRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-3.5 bg-black/55 border-t border-white/10 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={500}
              placeholder="Mesaj yaz veya https:// link yapıştır..."
              className="flex-1 min-w-0 rounded-xl bg-white/[0.06] border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-pink-400"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:brightness-110 disabled:opacity-40 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.35)] transition cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Gönder</span>
            </button>
          </form>
        </aside>
      </main>

      <footer className="border-t border-white/10 py-4 px-4 text-center text-[11px] text-slate-400 bg-black/30">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-pink-400 shrink-0" />
          <span>
            GTA6takip bağımsız bir topluluk takip sitesidir; Rockstar Games veya Take-Two ile resmi bağlantısı yoktur.
          </span>
        </div>
      </footer>
    </div>
  );
}
