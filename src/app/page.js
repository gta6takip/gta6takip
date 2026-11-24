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
    } else {
      const randomNick = 'ViceOyuncu_' + Math.floor(100 + Math.random() * 900);
      setUsername(randomNick);
      localStorage.setItem('gta6takip_nick', randomNick);
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
    const cleanNick = (username.trim() || 'Anonim').slice(0, 24);
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
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#090614]/80 border-b border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-pink-500 to-purple-700 flex items-center justify-center shadow-lg shadow-pink-500/25">
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
              <p className="text-xs text-slate-400">Leonida & Vice City PC Portlama İlerleme Takibi</p>
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

      <section className="max-w-7xl mx-auto px-4 pt-7 pb-5">
        <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-purple-950/60 via-[#160b2e]/80 to-pink-950/50 border border-pink-500/25 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/25 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Otomatik GitHub & Topluluk Güncellemeli
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                GTA VI PC Portunda{' '}
                <span className="bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
                  Şu An Hangi Aşamadayız?
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                Açık ve kapalı kaynaklı ekiplerin ilerleme yüzdelerini anlık takip et, sağdaki canlı sohbetten diğer Türk oyuncularla link ve gelişme paylaş.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
              <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
                <div className="text-xs text-slate-400">En Yüksek İlerleme</div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">%{topScore}</div>
              </div>
              <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
                <div className="text-xs text-slate-400">Aktif Grup</div>
                <div className="text-2xl sm:text-3xl font-black text-pink-400 mt-1">{projects.length || 8}</div>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-2xl bg-black/40 border border-white/10 p-4">
                <div className="text-xs text-slate-400">Hedef Eşik</div>
                <div className="text-2xl sm:text-3xl font-black text-cyan-300 mt-1">%100</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Cpu className="w-5 h-5 text-pink-400" />
              Portlama Ekipleri ve Başarı Oranları
            </h2>
            <span className="text-xs text-slate-400">Yüksekten düşüğe sıralı</span>
          </div>

          {loading ? (
            <div className="rounded-2xl p-8 text-center text-slate-400 bg-white/5 border border-white/10">
              Veriler yükleniyor...
            </div>
          ) : (
            <div className="space-y-3.5">
              {projects.map((proj, index) => (
                <div
                  key={proj.id}
                  className="rounded-2xl p-4 sm:p-5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-pink-500/40 transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-200">
                          #{index + 1}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white">{proj.name}</h3>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                            proj.is_open_source
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {proj.is_open_source ? 'Açık Kaynak' : 'Kapalı / Özel'}
                        </span>
                      </div>
                      <p className="text-xs text-pink-300/90 font-medium mt-1">
                        Aşama: {proj.stage || 'Geliştirme'} {proj.fps ? `• Performans: ${proj.fps}` : ''}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black bg-gradient-to-r from-amber-300 to-pink-400 bg-clip-text text-transparent">
                        %{proj.percentage}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden mb-3 border border-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, proj.percentage))}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                    <p className="leading-relaxed max-w-xl">{proj.description}</p>
                    {proj.repo_url && (
                      <a
                        href={proj.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-pink-300 hover:text-amber-300 font-semibold shrink-0"
                      >
                        Kaynağa Git <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:col-span-5 rounded-3xl bg-[#110924]/90 border border-pink-500/25 overflow-hidden shadow-2xl lg:sticky lg:top-20">
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-pink-600/20 to-purple-600/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-400" />
              <div>
                <h2 className="text-sm sm:text-base font-bold">GTA6takip Canlı Sohbet</h2>
                <p className="text-[11px] text-slate-300">Link paylaşabilirsin (https://...)</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Canlı
            </span>
          </div>

          <div className="px-4 py-2.5 bg-black/30 border-b border-white/10 flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Nickin:</span>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                localStorage.setItem('gta6takip_nick', e.target.value);
              }}
              maxLength={24}
              placeholder="Takma adın..."
              className="w-full bg-transparent text-xs font-semibold text-amber-300 focus:outline-none"
            />
          </div>

          <div className="h-[380px] sm:h-[430px] overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs space-y-1">
                <p>Henüz mesaj yok.</p>
                <p>İlk mesajı sen yaz ve GTA VI PC sohbetini başlat!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-2xl bg-white/[0.05] border border-white/10 p-3 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-pink-300">{msg.username}</span>
                    <span className="text-[10px] text-slate-500">
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

          <form onSubmit={handleSendMessage} className="p-3 bg-black/40 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={500}
              placeholder="Mesaj yaz veya link yapıştır (https://...)"
              className="flex-1 rounded-xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-pink-400"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 hover:opacity-95 disabled:opacity-40 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              Gönder
            </button>
          </form>
        </aside>
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
