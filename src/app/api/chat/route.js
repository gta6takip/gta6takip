import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

if (!globalThis.__gta6ChatStore) {
  globalThis.__gta6ChatStore = {
    tr: [],
    en: [],
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
  let dbMessages = null;

  try {
    const supabase = getSupabase();
    if (supabase) {
      const res = await Promise.race([
        supabase.from('chat_messages').select('*').order('id', { ascending: true }).limit(100),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000)),
      ]);
      if (res && !res.error && Array.isArray(res.data)) {
        dbMessages = res.data
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
      }
    }
  } catch {
    // ignore
  }

  const mem = globalThis.__gta6ChatStore[channel] || [];
  const merged = dbMessages !== null ? [...dbMessages] : [...mem];

  // Bellek içi son mesajları ID/içerik çakışması olmadan koru
  for (const m of mem) {
    const exists = merged.some(
      (d) =>
        String(d.id) === String(m.id) ||
        (d.username === m.username && d.message === m.message)
    );
    if (!exists) merged.push(m);
  }

  globalThis.__gta6ChatStore[channel] = merged.slice(-100);

  return NextResponse.json({
    ok: true,
    channel,
    messages: globalThis.__gta6ChatStore[channel],
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

    let savedMsg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      channel,
      username,
      message,
      created_at: new Date().toISOString(),
    };

    try {
      const supabase = getSupabase();
      if (supabase) {
        const taggedMsg = `[${channel.toUpperCase()}] ${message}`;
        const res = await Promise.race([
          supabase.from('chat_messages').insert([{ username, message: taggedMsg }]).select(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000)),
        ]);
        if (res && !res.error && Array.isArray(res.data) && res.data[0]) {
          savedMsg = {
            ...res.data[0],
            channel,
            message,
          };
        }
      }
    } catch {
      // Supabase erişilemezse bellek içi kaydı kullan
    }

    const list = globalThis.__gta6ChatStore[channel] || [];
    list.push(savedMsg);
    if (list.length > 100) list.shift();
    globalThis.__gta6ChatStore[channel] = list;

    return NextResponse.json({ ok: true, message: savedMsg });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err?.message || 'Error' }, { status: 500 });
  }
}
