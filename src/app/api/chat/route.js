import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const rateMap = new Map();
const COOLDOWN_MS = 10000;

const TR_MAP = {
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', I: 'i',
  ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
};

const LEET_MAP = {
  '0': 'o', '1': 'i', '!': 'i', '3': 'e', '4': 'a', '@': 'a',
  '5': 's', '$': 's', '7': 't', '8': 'b', '9': 'g', '+': 't',
};

const HARD_SUBSTRINGS = [
  'orospu', 'orosbu', 'orosp', 'siktir', 'sikeyim', 'sikerim', 'sikiyim',
  'sikis', 'siktigim', 'sikik', 'sikerler', 'sikeym', 'siktm', 'sikem',
  'amcik', 'amina', 'amini', 'aminakoy', 'amkoy', 'yarrak', 'yarak',
  'tasak', 'tassak', 'gotveren', 'gotunu', 'gotune', 'gotlek', 'ibne',
  'pezevenk', 'kahpe', 'kaltak', 'fahise', 'surtuk', 'ananisik', 'anani',
  'bacini', 'serefsiz', 'haysiyetsiz', 'gavat', 'pust', 'yavsak', 'dallama',
  'zibidi', 'hirsiz', 'dolandirici', 'motherfucker', 'asshole', 'bastard',
  'bitch', 'whore', 'slut', 'faggot', 'nigger', 'nigga', 'retard', 'cunt',
  'blowjob', 'porn', 'xxx',
];

const EXACT_BAD_WORDS = new Set([
  'amk', 'aq', 'amq', 'mk', 'mq', 'oc', 'sg', 'sktr', 'skm', 'skym',
  'pic', 'sik', 'got', 'am', 'bok', 'mal', 'salak', 'aptal', 'gerizekali',
  'embesil', 'ahmak', 'dangalak', 'okuz', 'kopek', 'it', 'fuck', 'shit',
  'dick', 'cock', 'pussy', 'ass', 'wtf', 'stfu', 'kys',
]);

function cleanRaw(str) {
  return String(str || '')
    .replace(/[\u200B-\u200D\uFEFF\u00AD\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeText(str) {
  let out = cleanRaw(str);
  out = out.replace(/[çÇğĞıİIöÖşŞüÜ]/g, (ch) => TR_MAP[ch] || ch).toLowerCase();
  out = out.replace(/[01!34@5$789+]/g, (ch) => LEET_MAP[ch] || ch);
  return out;
}

function collapseRepeats(str) {
  return str.replace(/(.)\1+/g, '$1');
}

function containsLink(raw) {
  const text = cleanRaw(raw).toLowerCase();
  const compact = text.replace(/\s+/g, '');

  if (/(https?:\/\/|ftp:\/\/|www\.)/i.test(text)) return true;
  if (/(https?:\/\/|www\.)/i.test(compact)) return true;
  if (/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(text)) return true;
  if (
    /[a-z0-9-]+\s*(\.|\[dot\]|\(dot\)|\[nokta\]|\(nokta\)|\s+nokta\s+|\s+dot\s+)\s*(com|net|org|xyz|io|gg|me|tr|co|ru|tk|ly|app|dev|site|online|info|tv|cc|to|pro|club|shop|vip)\b/i.test(
      text
    )
  ) {
    return true;
  }
  if (/(discord\.gg|t\.me\/|wa\.me\/|youtu\.be\/|bit\.ly|tinyurl|onlyfans)/i.test(compact)) {
    return true;
  }
  return false;
}

function containsProfanity(raw) {
  const norm = normalizeText(raw);
  const words = norm
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  for (const w of words) {
    const collapsed = collapseRepeats(w);
    if (EXACT_BAD_WORDS.has(w) || EXACT_BAD_WORDS.has(collapsed)) return true;
    for (const bad of HARD_SUBSTRINGS) {
      if (w.includes(bad) || collapsed.includes(bad)) return true;
    }
  }

  // "a.m.k", "o ç", "s i k t i r" gibi aralıklı yazımları yakala
  const lettersOnly = collapseRepeats(norm.replace(/[^a-z]/g, ''));
  for (const bad of HARD_SUBSTRINGS) {
    if (lettersOnly.includes(bad)) return true;
  }
  if (/^(amk|aq|amq|oc|sg|pic|sik|got|fuck|shit)$/.test(lettersOnly)) {
    return true;
  }
  if (/\ba\W*m\W*[kq]\b|\bo\W*c\b|\bs\W*i\W*k\b|\bp\W*i\W*c\b/i.test(norm)) {
    return true;
  }

  return false;
}

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET() {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ messages: [], configured: false });
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, nickname, message, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ messages: [], error: 'read_failed' }, { status: 500 });
  }

  return NextResponse.json(
    { messages: (data || []).reverse(), configured: true },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Sohbet sunucusu yapılandırılmamış.' },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  const nickname = cleanRaw(body?.nickname);
  const message = cleanRaw(body?.message);

  if (nickname.length < 2 || nickname.length > 20) {
    return NextResponse.json(
      { error: 'Rumuz 2 ile 20 karakter arasında olmalıdır.' },
      { status: 400 }
    );
  }

  if (!/^[a-zA-Z0-9çÇğĞıİöÖşŞüÜ _-]+$/.test(nickname)) {
    return NextResponse.json(
      { error: 'Rumuzda sadece harf, rakam ve boşluk kullanabilirsin.' },
      { status: 400 }
    );
  }

  if (message.length < 1 || message.length > 200) {
    return NextResponse.json(
      { error: 'Mesaj 1 ile 200 karakter arasında olmalıdır.' },
      { status: 400 }
    );
  }

  if (containsLink(nickname) || containsLink(message)) {
    return NextResponse.json(
      { error: 'Sohbette link veya site adresi paylaşımı yasaktır.' },
      { status: 400 }
    );
  }

  if (containsProfanity(nickname) || containsProfanity(message)) {
    return NextResponse.json(
      { error: 'Küfür, hakaret veya uygunsuz ifade tespit edildi.' },
      { status: 400 }
    );
  }

  const forwarded = request.headers.get('x-forwarded-for') || 'unknown';
  const ip = forwarded.split(',')[0].trim();
  const now = Date.now();
  const prev = rateMap.get(ip);

  if (prev && now - prev.time < COOLDOWN_MS) {
    const waitSec = Math.ceil((COOLDOWN_MS - (now - prev.time)) / 1000);
    return NextResponse.json(
      { error: `Spam koruması: Yeni mesaj için ${waitSec} saniye bekle.` },
      { status: 429 }
    );
  }

  if (prev && prev.lastMsg === message.toLowerCase()) {
    return NextResponse.json(
      { error: 'Aynı mesajı art arda gönderemezsin.' },
      { status: 429 }
    );
  }

  rateMap.set(ip, { time: now, lastMsg: message.toLowerCase() });
  if (rateMap.size > 500) {
    for (const [k, v] of rateMap.entries()) {
      if (now - v.time > 60000) rateMap.delete(k);
    }
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ nickname, message })
    .select('id, nickname, message, created_at')
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Mesaj kaydedilemedi, lütfen tekrar dene.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: data }, { status: 201 });
}
