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
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    const savedName = localStorage.getItem('gta6takip_nick');
    if (savedName) {
      setUsername(savedName);
    }

    fetchInitialData();

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
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('percentage', { ascending: false });
    if (data) setProjects(data);
  }

  async function fetchMessages() {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('id', { ascending: true })
      .limit(100);
    if (data) setMessages(data);
  }

  async function fetchInitialData() {
    setLoading(true);
    await Promise.all([fetchProjects(), fetchMessages()]);
    setLoading(false);
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

  const topScore = projects.length > 0 ? projects[0].percentage : 79;

  return (
    <div className="min-h-screen text-white">
      {/* Üst Bar */}
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

      {/* Üst Özet Kartı */}
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
                Aşağıda tüm grupların güncel tamamlanma oranlarını 3D ilerleme çubuklarıyla görebilir, alttaki sohbet alanından kendi takma adınla link ve yorum paylaşabilirsin.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 shrink-0">
              <div className="rounded-2xl bg-black/45 border border-white/10 p-3.5 text-center">
                <div className="text-[11px] text-slate-400">Lider Oran</div>
                <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">%{topScore}</div>
              </div>
              <div className="rounded-2xl bg-black/45 border border-white/10 p-3.5 text-center">
                <div className="text-[11px] text-slate-400">Takip Edilen</div>
                <div className="text-xl sm:text-2xl font-black text-pink-400 mt-0.5">{projects.length || 8} Ekip</div>
              </div>
              <div className="rounded-2xl bg-black/45 border border-white/10 p-3.5 text-center">
                <div className="text-[11px] text-slate-400">Hedef</div>
                <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-0.5">%100</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ana İçerik: Alt Alta 3D Barlı Ekipler + Altında Canlı Sohbet */}
      <main className="max-w-5xl mx-auto px-4 pb-14 space-y-10">
        {/* Bölüm 1: Alt Alta Sıralı Ekipler ve 3D Yüzde Barları */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
              <Cpu className="w-5 h-5 text-pink-400" />
              Portlama Ekipleri ve Başarı Yüzdeleri
            </h2>
            <span className="text-xs text-slate-400">En yüksekten düşüğe</span>
          </div>

          {loading ? (
            <div className="rounded-2xl p-8 text-center text-slate-400 bg-white/5 border border-white/10">
              Ekip verileri yükleniyor...
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {projects.map((proj, index) => {
                const pct = Math.min(100, Math.max(0, Number(proj.percentage) || 0));
                return (
                  <article
                    key={proj.id}
                    className="rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-pink-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition"
                  >
                    {/* Ekip Başlığı ve Yüzde */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-400/30 text-pink-200">
                          #{index + 1}
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
                        <span className="text-xs text-slate-400 font-medium">Tamamlanma:</span>
                        <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
                          %{pct}
                        </span>
                      </div>
                    </div>

                    {/* 3D Görünümlü İlerleme Çubuğu (Bar) */}
                    <div className="relative w-full h-7 rounded-2xl bg-[#070410] p-1 border border-white/15 shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),0_2px_6px_rgba(236,72,153,0.15)] mb-3.5 overflow-hidden">
                      <div
                        className="relative h-full rounded-xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 shadow-[0_4px_15px_rgba(236,72,153,0.55),inset_0_2px_3px_rgba(255,255,255,0.55),inset_0_-3px_5px_rgba(88,28,135,0.75)] transition-all duration-700 flex items-center justify-end pr-2.5"
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      >
                        {/* 3D Üst Parlama Şeridi */}
                        <div className="absolute inset-x-1 top-0.5 h-2 rounded-full bg-white/35 pointer-events-none" />
                        <span className="relative z-10 text-[11px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          %{pct}
                        </span>
                      </div>
                    </div>

                    {/* Aşama, FPS ve Açıklama */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-300">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-amber-300/95">
                          Aşama: {proj.stage || 'Geliştirme'} {proj.fps ? `• Performans: ${proj.fps}` : ''}
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
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
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Bölüm 2: Alt Tarafta Geniş Canlı Sohbet ve Nickname Girişi */}
        <section className="rounded-3xl bg-[#110924]/95 border border-pink-500/30 overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-pink-600/20 to-purple-600/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-pink-400" />
              <div>
                <h2 className="text-base sm:text-lg font-bold">GTA6takip Türkçe Canlı Sohbet</h2>
                <p className="text-xs text-slate-300">Takma adını yaz, diğer oyuncularla sohbet et ve link paylaş</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Canlı Akış
            </span>
          </div>

          {/* Belirgin Nickname Belirleme Kutusu */}
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
              placeholder="Buraya kendi nickname'ini yaz (örn: TommyVercetti)"
              className="w-full sm:max-w-xs rounded-xl bg-white/10 border border-pink-400/35 px-3.5 py-2 text-xs sm:text-sm font-bold text-amber-300 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-amber-300"
            />
          </div>

          {/* Mesaj Listesi */}
          <div className="h-[360px] overflow-y-auto p-4 sm:p-5 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs sm:text-sm space-y-1">
                <p>Henüz sohbete mesaj yazılmamış.</p>
                <p>Yukarıya takma adını yazıp ilk mesajı veya linki paylaşabilirsin!</p>
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

          {/* Mesaj ve Link Gönderme Alanı */}
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

      {/* Alt Bilgi */}
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
