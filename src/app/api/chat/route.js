import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

if (!globalThis.__gta6ChatStore) {
  globalThis.__gta6ChatStore = { tr: [], en: [] };
}
if (!globalThis.__gta6BannedUsers) {
  globalThis.__gta6BannedUsers = [];
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
      const [msgRes, banRes] = await Promise.all([
        Promise.race([
          supabase.from('chat_messages').select('*').order('id', { ascending: true }).limit(100),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3500)),
        ]),
        Promise.race([
          supabase.from('banned_users').select('username'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
        ]).catch(() => null),
      ]);

      if (banRes && !banRes.error && Array.isArray(banRes.data)) {
        const dbBans = banRes.data.map((b) => String(b.username || '').toLowerCase()).filter(Boolean);
        globalThis.__gta6BannedUsers = Array.from(new Set([...globalThis.__gta6BannedUsers, ...dbBans]));
      }

      if (msgRes && !msgRes.error && Array.isArray(msgRes.data)) {
        dbMessages = msgRes.data
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

  for (const m of mem) {
    const exists = merged.some(
      (d) =>
        String(d.id) === String(m.id) ||
        (d.username === m.username && d.message === m.message)
    );
    if (!exists) merged.push(m);
  }

  const bans = globalThis.__gta6BannedUsers || [];
  const cleanMerged = merged
    .filter((m) => !bans.includes(String(m.username || '').trim().toLowerCase()))
    .slice(-100);

  globalThis.__gta6ChatStore[channel] = cleanMerged;

  return NextResponse.json({
    ok: true,
    channel,
    messages: cleanMerged,
    bannedUsers: bans,
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const action = body?.action || 'send';
    const supabase = getSupabase();

    if (action === 'delete') {
      if (body.adminPass !== '657210') {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
      }
      const ch = body.channel === 'en' ? 'en' : 'tr';
      globalThis.__gta6ChatStore[ch] = (globalThis.__gta6ChatStore[ch] || []).filter(
        (m) => String(m.id) !== String(body.id)
      );
      if (supabase) {
        await Promise.race([
          supabase.from('chat_messages').delete().eq('id', body.id),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
        ]).catch(() => {});
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'ban') {
      if (body.adminPass !== '657210') {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
      }
      const cleanTarget = String(body.username || '').trim().toLowerCase();
      if (cleanTarget && !globalThis.__gta6BannedUsers.includes(cleanTarget)) {
        globalThis.__gta6BannedUsers.push(cleanTarget);
      }
      for (const ch of ['tr', 'en']) {
        globalThis.__gta6ChatStore[ch] = (globalThis.__gta6ChatStore[ch] || []).filter(
          (m) => String(m.username || '').trim().toLowerCase() !== cleanTarget
        );
      }
      if (supabase && cleanTarget) {
        await Promise.race([
          supabase.from('banned_users').upsert([{ username: cleanTarget }], { onConflict: 'username' }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
        ]).catch(() => {});
        await Promise.race([
          supabase.from('chat_messages').delete().ilike('username', String(body.username || '').trim()),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
        ]).catch(() => {});
      }
      return NextResponse.json({ ok: true, bannedUsers: globalThis.__gta6BannedUsers });
    }

    if (action === 'unban') {
      if (body.adminPass !== '657210') {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
      }
      const cleanTarget = String(body.username || '').trim().toLowerCase();
      globalThis.__gta6BannedUsers = globalThis.__gta6BannedUsers.filter((u) => u !== cleanTarget);
      if (supabase && cleanTarget) {
        await Promise.race([
          supabase.from('banned_users').delete().eq('username', cleanTarget),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
        ]).catch(() => {});
      }
      return NextResponse.json({ ok: true, bannedUsers: globalThis.__gta6BannedUsers });
    }

    const channel = body?.channel === 'en' ? 'en' : 'tr';
    const username = String(body?.username || 'ViceMisafir').trim().slice(0, 24) || 'ViceMisafir';
    const message = String(body?.message || '').trim().slice(0, 500);

    if (!message) {
      return NextResponse.json({ ok: false, error: 'Empty message' }, { status: 400 });
    }

    if (globalThis.__gta6BannedUsers.includes(username.toLowerCase())) {
      return NextResponse.json({ ok: false, error: 'Banned user' }, { status: 403 });
    }

    let savedMsg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      channel,
      username,
      message,
      created_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        const taggedMsg = `[${channel.toUpperCase()}] ${message}`;
        const res = await Promise.race([
          supabase.from('chat_messages').insert([{ username, message: taggedMsg }]).select(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
        ]);
        if (res && !res.error && Array.isArray(res.data) && res.data[0]) {
          savedMsg = { ...res.data[0], channel, message };
        }
      }
    } catch {
      // ignore
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
