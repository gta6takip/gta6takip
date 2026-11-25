import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

if (!globalThis.__gta6ChatStore) {
  globalThis.__gta6ChatStore = {
    tr: [
      {
        id: 'init-tr-1',
        channel: 'tr',
        username: 'ViceMod',
        message: 'GTA6takip Türkçe sohbet kanalına hoş geldiniz!',
        created_at: new Date().toISOString(),
      },
    ],
    en: [
      {
        id: 'init-en-1',
        channel: 'en',
        username: 'ViceMod',
        message: 'Welcome to the GTA6takip English chat channel!',
        created_at: new Date().toISOString(),
      },
    ],
  };
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get('channel') === 'en' ? 'en' : 'tr';
  const store = globalThis.__gta6ChatStore[channel] || [];

  try {
    const supabase = getSupabase();
    if (supabase) {
      const res = await Promise.race([
        supabase.from('chat_messages').select('*').order('id', { ascending: true }).limit(80),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2200)),
      ]);
      if (res && !res.error && Array.isArray(res.data)) {
        const filtered = res.data
          .filter((m) => {
            const msg = String(m.message || '');
            if (channel === 'en') return msg.startsWith('[EN] ');
            return !msg.startsWith('[EN] ');
          })
          .map((m) => ({
            ...m,
            channel,
            message: String(m.message || '').replace(/^\[(TR|EN)\]\s*/, ''),
          }));
        if (filtered.length > 0) {
          globalThis.__gta6ChatStore[channel] = filtered;
        }
      }
    }
  } catch {
    // Supabase yavaş/unhealthy ise bellek içi hızlı kanalla devam et
  }

  return NextResponse.json({
    ok: true,
    channel,
    messages: globalThis.__gta6ChatStore[channel] || store,
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const channel = body?.channel === 'en' ? 'en' : 'tr';
    const username = String(body?.username || 'ViceMisafir').trim().slice(0, 24) || 'ViceMisafir';
    const message = String(body?.message || '').trim().slice(0, 500);

    if (!message) {
      return NextResponse.json({ ok: false, error: 'Empty message' }, { status: 400 });
    }

    const newMsg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      channel,
      username,
      message,
      created_at: new Date().toISOString(),
    };

    const list = globalThis.__gta6ChatStore[channel] || [];
    list.push(newMsg);
    if (list.length > 100) list.shift();
    globalThis.__gta6ChatStore[channel] = list;

    try {
      const supabase = getSupabase();
      if (supabase) {
        const taggedMsg = `[${channel.toUpperCase()}] ${message}`;
        await Promise.race([
          supabase.from('chat_messages').insert([{ username, message: taggedMsg }]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2200)),
        ]);
      }
    } catch {
      // Supabase erişilemese bile bellek içi akış anında çalışır
    }

    return NextResponse.json({ ok: true, message: newMsg });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err?.message || 'Error' }, { status: 500 });
  }
}
