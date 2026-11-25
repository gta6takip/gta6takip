import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Son 45 saniyede aktif olan kullanıcıları takip eder
const activeVisitors = new Map();

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sid = (searchParams.get('sid') || '').trim().slice(0, 40);
    const nick = (searchParams.get('nick') || 'ViceMisafir').trim().slice(0, 24) || 'ViceMisafir';

    const now = Date.now();
    if (sid) {
      activeVisitors.set(sid, { nick, lastSeen: now });
    }
    for (const [k, v] of activeVisitors.entries()) {
      if (now - v.lastSeen > 45000) activeVisitors.delete(k);
    }

    const onlineUsers = Array.from(activeVisitors.values()).map((v) => v.nick);

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({
        ok: false,
        error: 'Supabase env eksik',
        onlineUsers,
      }, { status: 500 });
    }

    const [msgRes, banRes] = await Promise.all([
      supabase.from('chat_messages').select('*').order('id', { ascending: true }).limit(100),
      supabase.from('banned_users').select('username'),
    ]);

    return NextResponse.json({
      ok: true,
      messages: Array.isArray(msgRes.data) ? msgRes.data : [],
      bannedUsers: Array.isArray(banRes.data)
        ? banRes.data.map((b) => String(b.username || '').toLowerCase())
        : [],
      onlineUsers: onlineUsers.length > 0 ? onlineUsers : [nick],
      error: msgRes.error ? msgRes.error.message : null,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err?.message || 'Okuma hatası' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'Supabase env eksik' }, { status: 500 });
    }

    const body = await req.json();
    const action = body?.action || 'send';

    if (action === 'delete') {
      if (body.adminPass !== '657210') {
        return NextResponse.json({ ok: false, error: 'Yetkisiz' }, { status: 403 });
      }
      const { error } = await supabase.from('chat_messages').delete().eq('id', body.id);
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    if (action === 'ban') {
      if (body.adminPass !== '657210') {
        return NextResponse.json({ ok: false, error: 'Yetkisiz' }, { status: 403 });
      }
      const cleanTarget = String(body.username || '').trim().toLowerCase();
      const { error: banErr } = await supabase
        .from('banned_users')
        .upsert([{ username: cleanTarget }], { onConflict: 'username' });
      if (banErr) return NextResponse.json({ ok: false, error: banErr.message }, { status: 400 });
      await supabase.from('chat_messages').delete().ilike('username', String(body.username || '').trim());
      return NextResponse.json({ ok: true });
    }

    if (action === 'unban') {
      if (body.adminPass !== '657210') {
        return NextResponse.json({ ok: false, error: 'Yetkisiz' }, { status: 403 });
      }
      const cleanTarget = String(body.username || '').trim().toLowerCase();
      const { error } = await supabase.from('banned_users').delete().eq('username', cleanTarget);
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    const username = String(body.username || 'ViceMisafir').trim().slice(0, 24);
    const message = String(body.message || '').trim().slice(0, 500);
    if (!message) {
      return NextResponse.json({ ok: false, error: 'Boş mesaj' }, { status: 400 });
    }

    const { data: banCheck } = await supabase
      .from('banned_users')
      .select('username')
      .eq('username', username.toLowerCase())
      .limit(1);

    if (Array.isArray(banCheck) && banCheck.length > 0) {
      return NextResponse.json({ ok: false, error: 'Banlı kullanıcı' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{ username, message }])
      .select();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: data?.[0] || null });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err?.message || 'Gönderme hatası' }, { status: 500 });
  }
}
