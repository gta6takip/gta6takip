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
} from 'lucide-react';

const FALLBACK_PROJECTS = [
  {
    id: 1,
    name: 'omonkey',
    percentage: 79,
    fps: '~5 FPS',
    stage: 'Oyun İçi (Hapishane)',
    description: 'Lucia hapishane sahnesinde shader yüklemesi ve karakter hareketi sağlandı; Rumble üzerinde canlı yayınlanıyor.',
    repo_url: 'https://t.me/omonkey6',
    is_open_source: false,
  },
  {
    id: 2,
    name: 'Hyphen (fxceless)',
    percentage: 78,
    fps: '3 FPS (RTX 4090)',
    stage: 'Oyun İçi (3D Render)',
    description: 'VIctory + XCL birleşimiyle en gelişmiş 3D grafik renderı ve erken raytracing ışıklandırması elde edildi.',
    repo_url: 'https://github.com/fxceless/victory-gta6',
    is_open_source: true,
  },
  {
    id: 3,
    name: 'CGBJ',
    percentage: 72,
    fps: 'Bilinmiyor',
    stage: 'Oyun İçi (Prologue)',
    description: 'Açılış ara sahnesi ("Nine Months Ago") ve oyun içi telefon arayüzü çalıştırıldı; gizli kolektif olarak ilerliyor.',
    repo_url: 'https://gta6recomp.com/repo',
    is_open_source: false,
  },
  {
    id: 4,
    name: 'VIctory',
    percentage: 70,
    fps: '30 FPS (Menü)',
    stage: 'Oyun İçi (Siyah Ekran)',
    description: 'Açık kaynaklı ana uyumluluk katmanı; menülerde 30 FPS çalışıyor, 3D oyun içi shader desteği geliştiriliyor.',
    repo_url: 'https://github.com/Marvisak/VIctory',
    is_open_source: true,
  },
  {
    id: 5,
    name: 'AnyXboxX',
    percentage: 65,
    fps: '3.2 FPS (720p)',
    stage: 'Oyun İçi (Eğitim)',
    description: 'Kontrol edilebilir karakter ve hareket eğitim ekranı açıldı; kalan untranslated shader sayısı azaltılıyor.',
    repo_url: 'https://github.com/LooperSalty/AnyXboxX',
    is_open_source: true,
  },
  {
    id: 6,
    name: 'XCL',
    percentage: 63,
    fps: '30 FPS (Intro)',
    stage: 'Dünya Yükleme',
    description: 'Wine benzeri uyumluluk katmanı; binlerce shader işlendi, oyun dünyasında yayalar ve araçlar spawn oluyor.',
    repo_url: 'https://github.com/ivall/xcl',
    is_open_source: true,
  },
  {
    id: 7,
    name: 'Xbox2Windows',
    percentage: 48,
    fps: '-',
    stage: 'İlk Kare (First Frame)',
    description: 'Statik yeniden derleme ve shader çözümleme hattı ile ilk kare görüntüsüne ulaşıldı.',
    repo_url: 'https://github.com/R0Y00/Xbox2Windows',
    is_open_source: true,
  },
  {
    id: 8,
    name: 'Palmetto',
    percentage: 25,
    fps: '-',
    stage: 'Exe Başlatma (Boot)',
    description: 'Düşük seviyeli bellek eşleme ve .exe yükleme altyapısı geliştiriliyor.',
    repo_url: 'https://github.com/luizwidmer/palmetto',
    is_open_source: true,
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
          className="inline-flex items-center gap-1 text-pink-400 underline decoration-pink-500/50 hover:text-amber-300 break-all font-medium"
        >
          <LinkIcon className="w-3.5 h-3.5 shrink-0" />
          {part}
        </a>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function HomePage() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    const savedName = localStorage.getItem('gta6takip_nick');
    if (savedName) {
      setUsername(savedName);
    }

    fetchProjects();
    fetchMessages();

    const projectChannel = supabase
      .channel('projects-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    const chatChannel = supabase
      .channel('chat-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(chatChannel);
    };
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
    setSyncing(true);
    try {
      await fetch('/api/sync');
      await fetchProjects();
    } finally {
      setSyncing(false);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    const cleanMsg = newMessage.trim();
    const cleanNick = username.trim().slice(0, 24) || 'ViceMisafir';
    if (!cleanMsg || sending) return;

    setSending(true);
    localStorage.setItem('gta6takip_nick', cleanNick);

    const { error } = await supabase.from('chat_messages').insert([
      {
        username: cleanNick,
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

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#090614]/85 border-b border-pink-500/20">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-pink-500 to-purple-700 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  GTA6takip
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 font-semibold">
                  CANLI PC PORT
                </span>
              </div>
              <p className="text-xs text-slate-400">GTA VI PC Portlama Ekipleri İlerleme Takibi</p>
            </div>
          </div>

          <button
            onClick={handleAutoSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-600/30 to-amber-500/30 hover:from-pink-600/50 hover:to-amber-500/50 border border-pink-400/30 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'GitHub Taranıyor...' : 'Otomatik Veriyi Yenile'}
          </button>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 pt-7 pb-4">
        <div className="rounded-3xl p-6 md:p-7 bg-gradient-to-r from-purple-950/60 via-[#160b2e]/85 to-pink-950/50 border border-pink-500/25 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/25 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Otomatik GitHub & Topluluk Takibi
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                GTA VI PC Portunda{' '}
                <span className="bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
                  Ekipler Yüzde Kaçta?
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Ekiplerin güncel tamamlanma yüzdelerini, aşamalarını ve kısa özetlerini maddeler halinde 3D çubuklarla incele; alttan nickname yazıp sohbete katıl.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 shrink-0">
              <div className="rounded-2xl bg-black/45 border border-white/10 p-3.5 text-center">
                <div className="text-[11px] text-slate-400">Lider Oran</div>
                <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">%{topScore}</div>
              </div>
              <div className="rounded-2xl bg-black/45 border border-white/10 p-3.5 text-center">
                <div className="text-[11px] text-slate-400">Takip Edilen</div>
                <div className="text-xl sm:text-2xl font-black text-pink-400 mt-0.5">{projects.length} Ekip</div>
              </div>
              <div className="rounded-2xl bg-black/45 border border-white/10 p-3.5 text-center">
                <div className="text-[11px] text-slate-400">Hedef</div>
                <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-0.5">%100</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 pb-14 space-y-10">
        {/* Maddeler Halinde Sıralanan Tablo / Liste + 3D Barlar */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
              <Cpu className="w-5 h-5 text-pink-400" />
              Portlama Ekipleri Listesi ve Yüzdeleri
            </h2>
            <span className="text-xs text-slate-400">Madde madde sıralı</span>
          </div>

          <ul className="flex flex-col gap-4 list-none p-0 m-0">
            {projects.map((proj, index) => {
              const pct = Math.min(100, Math.max(0, Number(proj.percentage) || 0));
              return (
                <li
                  key={proj.id || index}
                  className="rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-pink-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition"
                >
                  {/* Madde Başlığı: Ekip Adı + Yüzde */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-400/30 text-pink-200">
                        • #{index + 1}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        {proj.name}
                      </h3>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                          proj.is_open_source
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {proj.is_open_source ? 'Açık Kaynak' : 'Kapalı / Özel'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-slate-400 font-medium">İlerleme:</span>
                      <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
                        %{pct}
                      </span>
                    </div>
                  </div>

                  {/* 3D Görünümlü İlerleme Çubuğu */}
                  <div className="relative w-full h-7 rounded-2xl bg-[#070410] p-1 border border-white/15 shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),0_2px_6px_rgba(236,72,153,0.15)] mb-3.5 overflow-hidden">
                    <div
                      className="relative h-full rounded-xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 shadow-[0_4px_15px_rgba(236,72,153,0.55),inset_0_2px_3px_rgba(255,255,255,0.55),inset_0_-3px_5px_rgba(88,28,135,0.75)] transition-all duration-700 flex items-center justify-end pr-2.5"
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    >
                      <div className="absolute inset-x-1 top-0.5 h-2 rounded-full bg-white/35 pointer-events-none" />
                      <span className="relative z-10 text-[11px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        %{pct}
                      </span>
                    </div>
                  </div>

                  {/* Aşama, Kısa Özet ve Kaynak Linki */}
                  <div className="flex flex-wrap items-start justify-between gap-3 text-xs sm:text-sm text-slate-300">
                    <div className="space-y-1 max-w-3xl">
                      <p className="text-xs font-bold text-amber-300">
                        Aşama: {proj.stage || 'Geliştirme'} {proj.fps && proj.fps !== '-' ? `(${proj.fps})` : ''}
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    {proj.repo_url && (
                      <a
                        href={proj.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-400/40 text-pink-300 hover:text-amber-300 text-xs font-semibold transition shrink-0"
                      >
                        Kaynağa Git <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Canlı Sohbet ve Nickname Alanı */}
        <section className="rounded-3xl bg-[#110924]/95 border border-pink-500/30 overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-pink-600/20 to-purple-600/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-pink-400" />
              <div>
                <h2 className="text-base sm:text-lg font-bold">GTA6takip Türkçe Canlı Sohbet</h2>
                <p className="text-xs text-slate-300">Kendi nickname'ini yaz, sohbete katıl ve link paylaş</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Canlı Akış
            </span>
          </div>

          <div className="p-3.5 sm:px-5 bg-black/40 border-b border-white/10 flex flex-col sm:flex-row sm:items-center gap-2.5">
            <label htmlFor="nickname-input" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 shrink-0">
              <User className="w-4 h-4 text-amber-300" />
              Takma Adın (Nickname):
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
              placeholder="Nickname yaz (örn: Kazarre13)"
              className="w-full sm:max-w-xs rounded-xl bg-white/10 border border-pink-400/35 px-3.5 py-2 text-xs sm:text-sm font-bold text-amber-300 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-amber-300"
            />
          </div>

          <div className="h-[360px] overflow-y-auto p-4 sm:p-5 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs sm:text-sm space-y-1">
                <p>Henüz sohbete mesaj yazılmamış.</p>
                <p>Yukarıya nickname'ini yazıp ilk mesajı veya linki paylaşabilirsin!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-2xl bg-white/[0.05] border border-white/10 p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-pink-300">{msg.username}</span>
                    <span className="text-[11px] text-slate-500">
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

          <form onSubmit={handleSendMessage} className="p-3.5 sm:p-4 bg-black/50 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={500}
              placeholder="Mesajını yaz veya link yapıştır (https://...)"
              className="flex-1 rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-pink-400"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 hover:opacity-95 disabled:opacity-40 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              Gönder
            </button>
          </form>
        </section>
      </main>

      <footer className="border-t border-white/10 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-pink-400 shrink-0" />
          <span>
            GTA6takip bağımsız bir topluluk takip sitesidir; Rockstar Games veya Take-Two ile resmi bağlantısı yoktur.
          </span>
        </div>
      </footer>
    </div>
  );
}
