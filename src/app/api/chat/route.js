import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '657210';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const VALID_CHANNELS = new Set(['tr-genel', 'en-general']);
const MAX_MESSAGES = 100;

// Sunucu belleği (Supabase PostgREST kesintilerinde bile anlık senkronizasyon için)
const globalStore = globalThis.__gta6takipChatStore || {
  messages: { 'tr-genel': [], 'en-general': [] },
  bannedUsers: [],
  clearedAt: { 'tr-genel': 0, 'en-general': 0 },
  pinnedMessage: { 'tr-genel': null, 'en-general': null },
  activePoll: { 'tr-genel': null, 'en-general': null },
};
globalThis.__gta6takipChatStore = globalStore;

function normalizeText(input) {
  return String(input || '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[@4]/g, 'a')
    .replace(/3/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/0/g, 'o')
    .replace(/[5$]/g, 's')
    .replace(/7/g, 't')
    .replace(/(.)\1{2,}/g, '$1$1');
}

const EXACT_BAD_WORDS = [
  'amk', 'aq', 'mk', 'oc', 'sg', 'am', 'sik', 'pic', 'piç', 'yarak', 'yarrak',
  'orospu', 'orspu', 'ibne', 'pust', 'puşt', 'kahpe', 'gavat', 'pezevenk',
  'amcik', 'amcık', 'tasak', 'taşak', 'dassak', 'daşşak', 'got', 'göt',
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 'whore', 'slut',
  'asshole', 'bastard', 'motherfucker', 'nigger', 'faggot', 'retard', 'stfu',
];

const STEM_BAD_WORDS = [
  'siktir', 'siksin', 'sikeyim', 'sikerim', 'sikim', 'sikis', 'sikiy', 'siken',
  'sikem', 'sikti', 'sikec', 'amina', 'amini', 'amına', 'amını', 'amcik',
  'ananiz', 'anani', 'anasin', 'ananı', 'ananız', 'anasın', 'orospu', 'orspu',
  'orosbu', 'yarrak', 'yarak', 'pezevenk', 'pzvnk', 'gotun', 'gotune', 'gotunu',
  'gotver', 'götün', 'götver', 'soksun', 'sokayim', 'koyayim', 'koyim',
  'gerizekali', 'kahpe', 'ibne', 'gavat', 'motherfuck', 'fucked', 'fucking',
  'bullshit', 'asshole', 'bitch',
];

export function checkProfanity(raw) {
  if (!raw) return false;
  const lowerTr = String(raw).toLocaleLowerCase('tr-TR');
  if (/\bgöt(ü|ün|üne|ünü|ver)?\b/i.test(lowerTr)) return true;

  const normalized = normalizeText(raw);
  const spaced = normalized.replace(/[^a-z0-9]+/g, ' ').trim();
  const compact = normalized.replace(/[^a-z0-9]/g, '');

  for (const w of EXACT_BAD_WORDS) {
    const cleanW = normalizeText(w);
    const re = new RegExp(`\\b${cleanW}\\b`, 'i');
    if (re.test(spaced)) return true;
  }

  for (const stem of STEM_BAD_WORDS) {
    const cleanStem = normalizeText(stem);
    if (compact.includes(cleanStem)) return true;
  }

  return false;
}

export function censorProfanity(raw) {
  let out = String(raw || '');
  const all = [...EXACT_BAD_WORDS, ...STEM_BAD_WORDS];
  for (const w of all) {
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escaped, 'gi'), '***');
  }
  return out;
}

async function supabaseFetch(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : [];
  } catch {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawChannel = searchParams.get('channel') || 'tr-genel';
  const channel = VALID_CHANNELS.has(rawChannel) ? rawChannel : 'tr-genel';
  const clearedAt = globalStore.clearedAt[channel] || 0;

  let messages = globalStore.messages[channel] || [];
  let source = 'memory';

  const dbRows = await supabaseFetch(
    `chat_messages?channel=eq.${encodeURIComponent(channel)}&order=created_at.asc&limit=${MAX_MESSAGES}`
  );

  if (Array.isArray(dbRows)) {
    source = 'supabase';
    const merged = new Map();
    for (const m of [...dbRows, ...messages]) {
      const ts = new Date(m.created_at || 0).getTime();
      if (ts > clearedAt && m.id) {
        merged.set(m.id, m);
      }
    }
    messages = Array.from(merged.values())
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-MAX_MESSAGES);
    globalStore.messages[channel] = messages;
  } else {
    messages = messages.filter((m) => new Date(m.created_at || 0).getTime() > clearedAt);
  }

  const dbBans = await supabaseFetch('banned_users?select=nickname');
  if (Array.isArray(dbBans)) {
    const set = new Set([...globalStore.bannedUsers, ...dbBans.map((b) => String(b.nickname).toLowerCase())]);
    globalStore.bannedUsers = Array.from(set);
  }

  return NextResponse.json({
    ok: true,
    channel,
    messages,
    bannedUsers: globalStore.bannedUsers,
    clearedAt,
    pinnedMessage: globalStore.pinnedMessage[channel] || null,
    activePoll: globalStore.activePoll[channel] || null,
    source,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const action = body.action || 'send_message';
    const channel = VALID_CHANNELS.has(body.channel) ? body.channel : 'tr-genel';

    if (action === 'verify_admin') {
      const ok = body.password === ADMIN_PASSWORD;
      return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
    }

    if (action === 'clear_chat') {
      if (body.adminPassword !== ADMIN_PASSWORD) {
        return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
      }
      const now = Date.now();
      globalStore.clearedAt[channel] = now;
      globalStore.messages[channel] = [];
      globalStore.pinnedMessage[channel] = null;
      await supabaseFetch(`chat_messages?channel=eq.${encodeURIComponent(channel)}`, {
        method: 'DELETE',
      });
      return NextResponse.json({ ok: true, clearedAt: now });
    }

    if (action === 'pin_message') {
      if (body.adminPassword !== ADMIN_PASSWORD) {
        return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
      }
      globalStore.pinnedMessage[channel] = body.message || null;
      return NextResponse.json({ ok: true, pinnedMessage: globalStore.pinnedMessage[channel] });
    }

    if (action === 'unpin_message') {
      if (body.adminPassword !== ADMIN_PASSWORD) {
        return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
      }
      globalStore.pinnedMessage[channel] = null;
      return NextResponse.json({ ok: true, pinnedMessage: null });
    }

    if (action === 'create_poll') {
      if (body.adminPassword !== ADMIN_PASSWORD) {
        return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
      }
      const question = String(body.question || '').trim().slice(0, 140);
      const rawOptions = Array.isArray(body.options) ? body.options : [];
      const cleanOptions = rawOptions
        .map((o) => String(o || '').trim().slice(0, 60))
        .filter(Boolean)
        .slice(0, 4);

      if (!question || cleanOptions.length < 2) {
        return NextResponse.json({ ok: false, error: 'invalid_poll' }, { status: 400 });
      }

      const durationMin = Math.min(5, Math.max(1, Number(body.durationMinutes) || 5));
      const now = Date.now();
      const poll = {
        id: `poll_${now}`,
        channel,
        question,
        options: cleanOptions.map((text, idx) => ({
          id: `opt_${idx}`,
          text,
          votes: 0,
        })),
        voters: {},
        createdAt: now,
        expiresAt: now + durationMin * 60 * 1000,
      };
      globalStore.activePoll[channel] = poll;
      return NextResponse.json({ ok: true, activePoll: poll });
    }

    if (action === 'vote_poll') {
      const poll = globalStore.activePoll[channel];
      if (!poll || poll.id !== body.pollId) {
        return NextResponse.json({ ok: false, error: 'poll_not_found' }, { status: 404 });
      }
      if (Date.now() > poll.expiresAt) {
        return NextResponse.json({ ok: false, error: 'poll_ended', activePoll: poll }, { status: 400 });
      }
      const voterId = String(body.voterId || '').trim();
      const optionId = String(body.optionId || '').trim();
      if (!voterId || !optionId) {
        return NextResponse.json({ ok: false, error: 'invalid_vote' }, { status: 400 });
      }

      const prevOptionId = poll.voters[voterId];
      if (prevOptionId === optionId) {
        return NextResponse.json({ ok: true, activePoll: poll });
      }
      if (prevOptionId) {
        const prevOpt = poll.options.find((o) => o.id === prevOptionId);
        if (prevOpt && prevOpt.votes > 0) prevOpt.votes -= 1;
      }
      const targetOpt = poll.options.find((o) => o.id === optionId);
      if (!targetOpt) {
        return NextResponse.json({ ok: false, error: 'option_not_found' }, { status: 404 });
      }
      targetOpt.votes += 1;
      poll.voters[voterId] = optionId;

      return NextResponse.json({ ok: true, activePoll: poll });
    }

    if (action === 'close_poll') {
      if (body.adminPassword !== ADMIN_PASSWORD) {
        return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
      }
      globalStore.activePoll[channel] = null;
      return NextResponse.json({ ok: true, activePoll: null });
    }

    if (action === 'ban_user') {
      if (body.adminPassword !== ADMIN_PASSWORD) {
        return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
      }
      const target = String(body.nickname || '').trim().toLowerCase();
      if (target && !globalStore.bannedUsers.includes(target)) {
        globalStore.bannedUsers.push(target);
      }
      await supabaseFetch('banned_users', {
        method: 'POST',
        headers: { Prefer: 'resolution=ignore-duplicates' },
        body: JSON.stringify({ nickname: target }),
      });
      return NextResponse.json({ ok: true, bannedUsers: globalStore.bannedUsers });
    }

    if (action === 'unban_user') {
      if (body.adminPassword !== ADMIN_PASSWORD) {
        return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
      }
      const target = String(body.nickname || '').trim().toLowerCase();
      globalStore.bannedUsers = globalStore.bannedUsers.filter((u) => u !== target);
      await supabaseFetch(`banned_users?nickname=eq.${encodeURIComponent(target)}`, {
        method: 'DELETE',
      });
      return NextResponse.json({ ok: true, bannedUsers: globalStore.bannedUsers });
    }

    if (action === 'delete_message') {
      if (body.adminPassword !== ADMIN_PASSWORD) {
        return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
      }
      const id = String(body.id || '');
      globalStore.messages[channel] = (globalStore.messages[channel] || []).filter((m) => m.id !== id);
      if (globalStore.pinnedMessage[channel]?.id === id) {
        globalStore.pinnedMessage[channel] = null;
      }
      await supabaseFetch(`chat_messages?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return NextResponse.json({ ok: true });
    }

    // Mesaj gönderme
    const isAdmin = body.adminPassword === ADMIN_PASSWORD;
    const nickname = String(body.nickname || 'ViceMisafir').trim().slice(0, 24) || 'ViceMisafir';
    const lowerNick = nickname.toLowerCase();

    if (!isAdmin && (lowerNick.includes('admin') || lowerNick.includes('yönetici') || lowerNick.includes('yonetici'))) {
      return NextResponse.json({ ok: false, error: 'reserved_nickname' }, { status: 403 });
    }

    if (!isAdmin && globalStore.bannedUsers.includes(lowerNick)) {
      return NextResponse.json({ ok: false, error: 'banned' }, { status: 403 });
    }

    const rawText = String(body.text || '').trim().slice(0, 350);
    if (!rawText) {
      return NextResponse.json({ ok: false, error: 'empty' }, { status: 400 });
    }

    if (!isAdmin && (checkProfanity(rawText) || checkProfanity(nickname))) {
      return NextResponse.json(
        { ok: false, error: 'profanity', censoredText: censorProfanity(rawText), muteSeconds: 60 },
        { status: 400 }
      );
    }

    const newMsg = {
      id: body.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      channel,
      nickname: isAdmin ? 'ADMIN' : nickname,
      text: rawText,
      avatar: Number.isFinite(body.avatar) ? body.avatar : 0,
      is_admin: isAdmin,
      reply_to: body.reply_to || null,
      created_at: new Date().toISOString(),
    };

    const current = globalStore.messages[channel] || [];
    globalStore.messages[channel] = [...current, newMsg].slice(-MAX_MESSAGES);

    await supabaseFetch('chat_messages', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(newMsg),
    });

    return NextResponse.json({ ok: true, message: newMsg });
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
