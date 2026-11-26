import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const COOLDOWN_SECONDS = 60;
const COOLDOWN_MS = COOLDOWN_SECONDS * 1000;
const MAX_MESSAGE_LENGTH = 280;
const MIN_NICK_LENGTH = 2;
const MAX_NICK_LENGTH = 20;

// Sunucu tarafı IP bazlı 60 saniye hız sınırı (warm instance hafızası)
const ipCooldownMap = new Map();

function cleanupCooldownMap(now) {
  if (ipCooldownMap.size > 500) {
    for (const [key, ts] of ipCooldownMap.entries()) {
      if (now - ts > COOLDOWN_MS * 2) {
        ipCooldownMap.delete(key);
      }
    }
  }
}

function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    return xff.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return null;
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Görünmez karakterleri ve hileli boşlukları temizle
function stripInvisible(str) {
  return str
    .replace(/[\u200B-\u200D\uFEFF\u00AD\u2060]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Türkçe + leetspeak normalizasyonu
function normalizeText(str) {
  const lower = stripInvisible(str)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

  // Leetspeak dönüşümü
  const leet = lower
    .replace(/0/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/[4@]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/9/g, 'g');

  return leet;
}

// Tekrarlı harfleri sıkıştır (siiiktir -> siktir)
function collapseRepeats(str) {
  return str.replace(/(.)\1{2,}/g, '$1$1').replace(/(.)\1+/g, '$1');
}

// Gelişmiş link / domain / davet kodu engelleyici
function containsLink(raw) {
  const cleaned = stripInvisible(raw).toLowerCase();
  const compact = cleaned.replace(/\s+/g, '');

  // 1. Protokoller ve www
  if (/(https?:\/\/|ftp:\/\/|www\.|mailto:|javascript:|data:)/i.test(compact)) {
    return true;
  }

  // 2. Popüler platform davet/kısa linkleri
  if (
    /(discord\.gg|discord\.com\/invite|t\.me\/|telegram\.me|wa\.me\/|bit\.ly|tinyurl\.|youtu\.be|linktr\.ee|shorturl|cutt\.ly|rb\.gy|is\.gd|goo\.gl)/i.test(
      compact
    )
  ) {
    return true;
  }

  // 3. Obfuscated link denemeleri (site [dot] com, site(nokta)com vb.)
  if (
    /[a-z0-9-]+\s*[\[\(\{]?\s*(dot|nokta)\s*[\]\)\}]?\s*(com|net|org|xyz|io|gg|tv|me|tr|ru|co|app|dev|site|online|info|biz|shop|link|live|pro|vip)/i.test(
      cleaned
    )
  ) {
    return true;
  }

  // 4. Standart domain uzantıları (örnek.com, oyun.xyz, site.com.tr)
  if (
    /(?:^|[\s([{"'])([a-z0-9-]{2,}\.(?:com|net|org|xyz|io|gg|tv|me|tr|ru|co|app|dev|site|online|info|biz|shop|link|live|pro|vip|club|top|cc|pw|tk|ml|ga|cf|gq|edu|gov)(?:\/[^\s]*)?)(?:$|[\s)\]}"',!?])/i.test(
      cleaned
    )
  ) {
    return true;
  }

  // 5. Boşlukla ayrılmış domain hilesi (ör: "site . com")
  if (
    /[a-z0-9-]{2,}\s*\.\s*(com|net|org|xyz|io|gg|tv|me|tr|ru|co|app|dev|site|online|info|biz|link|vip)\b/i.test(
      cleaned
    )
  ) {
    return true;
  }

  // 6. IPv4 adresi
  if (/\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(cleaned)) {
    return true;
  }

  return false;
}

// Kök / kesin küfür listesi (kelime içi yakalama - yüksek kesinlikli)
const STRICT_SUBSTRING_ROOTS = [
  'siktir',
  'sikim',
  'sikeyim',
  'sikerim',
  'sikis',
  'siken',
  'sikik',
  'siktig',
  'orospu',
  'orosbu',
  'oç',
  'ocu',
  'piclik',
  'kahpe',
  'kaltak',
  'yavsak',
  'yarrak',
  'yarak',
  'amcik',
  'amina',
  'amini',
  'aminakoy',
  'amk',
  'aq',
  'mk',
  'sg',
  'gotveren',
  'gotune',
  'gotunu',
  'gavat',
  'pezevenk',
  'ibne',
  'ipne',
  'pust',
  'tasak',
  'tassak',
  'dalyarak',
  'serefsiz',
  'haysiyetsiz',
  'ananisik',
  'ananiskm',
  'anani',
  'bacini',
  'sülaleni',
  'sulaleni',
  'fuck',
  'fck',
  'fuk',
  'bitch',
  'asshole',
  'motherfucker',
  'bastard',
  'cunt',
  'whore',
  'slut',
  'dickhead',
  'nigger',
  'nigga',
  'faggot',
  'retard',
];

// Sadece tam kelime olarak yakalanacak kısa/çakışabilecek ifadeler
const EXACT_WORD_BAD = new Set([
  'sik',
  'am',
  'amq',
  'amk',
  'aq',
  'mk',
  'oc',
  'oç',
  'pic',
  'got',
  'mal',
  'salak',
  'aptal',
  'gerizekali',
  'dangalak',
  'ahmak',
  'embesil',
  'it',
  'kopek',
  'bok',
  'sictim',
  'sicarim',
  'shit',
  'dick',
  'cock',
  'pussy',
  'porn',
  'porno',
  'sex',
  'seks',
  'nude',
]);

// Taklit / yetkili adı engelleme listesi
const RESERVED_NICKS = [
  'admin',
  'administrator',
  'mod',
  'moderator',
  'yonetici',
  'sistem',
  'system',
  'kurucu',
  'owner',
  'root',
  'staff',
  'yetkili',
  'destek',
  'support',
  'gta6takip',
  'official',
  'resmi',
];

function containsProfanity(raw) {
  const norm = normalizeText(raw);
  const words = norm.split(/[^a-z]+/).filter(Boolean);

  // 1. Kelime bazlı kontrol (normal ve tekrar sıkıştırılmış)
  for (const w of words) {
    const collapsed = collapseRepeats(w);
    if (EXACT_WORD_BAD.has(w) || EXACT_WORD_BAD.has(collapsed)) {
      return true;
    }
    for (const root of STRICT_SUBSTRING_ROOTS) {
      const cleanRoot = normalizeText(root);
      if (cleanRoot.length >= 4 && (w.includes(cleanRoot) || collapsed.includes(cleanRoot))) {
        return true;
      }
    }
  }

  // 2. Noktalama/boşluk ile bölünmüş küfür hilesi (s.i.k.t.i.r, o r o s p u, a.m.k)
  const squashed = norm.replace(/[^a-z]/g, '');
  const squashedCollapsed = collapseRepeats(squashed);

  for (const root of STRICT_SUBSTRING_ROOTS) {
    const cleanRoot = normalizeText(root);
    if (cleanRoot.length >= 4) {
      if (squashed.includes(cleanRoot) || squashedCollapsed.includes(cleanRoot)) {
        return true;
      }
    }
  }

  // Kısa ama sık bölünen 2-3 harfli kısaltmalar (a.m.k, o.ç, a.q)
  if (/(?:^|\s)[a4]\s*[\.\-\*_]\s*m\s*[\.\-\*_]?\s*k(?:\s|$)/i.test(norm)) return true;
  if (/(?:^|\s)o\s*[\.\-\*_]\s*c(?:\s|$)/i.test(norm)) return true;
  if (/(?:^|\s)a\s*[\.\-\*_]\s*q(?:\s|$)/i.test(norm)) return true;

  return false;
}

function isReservedNickname(rawNick) {
  const squashed = normalizeText(rawNick).replace(/[^a-z0-9]/g, '');
  return RESERVED_NICKS.some((r) => squashed === r || squashed.includes('admin') || squashed.includes('yonetici'));
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Sohbet servisi yapılandırılmadı.', messages: [] },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, nickname, message, created_at, reply_to_id, reply_to_nick, reply_to_text')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { error: 'Mesajlar yüklenemedi.', messages: [] },
        { status: 500 }
      );
    }

    const ordered = (data || []).reverse();
    return NextResponse.json({ messages: ordered }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Beklenmeyen bir sunucu hatası oluştu.', messages: [] },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Sohbet servisi yapılandırılmadı.' },
        { status: 500 }
      );
    }

    const now = Date.now();
    cleanupCooldownMap(now);

    const ip = getClientIp(request);
    const lastSentAt = ipCooldownMap.get(ip);
    if (lastSentAt && now - lastSentAt < COOLDOWN_MS) {
      const retryAfter = Math.max(1, Math.ceil((COOLDOWN_MS - (now - lastSentAt)) / 1000));
      return NextResponse.json(
        {
          error: `60 saniyede en fazla 1 mesaj gönderebilirsin. Lütfen ${retryAfter} saniye bekle.`,
          retryAfter,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
    }

    const rawNick = typeof body.nickname === 'string' ? stripInvisible(body.nickname) : '';
    const rawMsg = typeof body.message === 'string' ? stripInvisible(body.message) : '';
    const rawReplyToId = body.replyToId != null ? String(body.replyToId).trim() : null;

    // İsim kontrolleri
    if (rawNick.length < MIN_NICK_LENGTH || rawNick.length > MAX_NICK_LENGTH) {
      return NextResponse.json(
        { error: `Takma adın ${MIN_NICK_LENGTH} ile ${MAX_NICK_LENGTH} karakter arasında olmalı.` },
        { status: 400 }
      );
    }

    if (isReservedNickname(rawNick)) {
      return NextResponse.json(
        { error: 'Bu takma ad kullanılamaz. Lütfen başka bir isim seç.' },
        { status: 400 }
      );
    }

    if (containsLink(rawNick) || containsProfanity(rawNick)) {
      return NextResponse.json(
        { error: 'Takma adında uygunsuz ifade veya link bulunamaz.' },
        { status: 400 }
      );
    }

    // Mesaj kontrolleri
    if (rawMsg.length < 1) {
      return NextResponse.json({ error: 'Boş mesaj gönderemezsin.' }, { status: 400 });
    }

    if (rawMsg.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Mesajın en fazla ${MAX_MESSAGE_LENGTH} karakter olabilir.` },
        { status: 400 }
      );
    }

    if (containsLink(rawMsg)) {
      return NextResponse.json(
        { error: 'Sohbette link, davet bağlantısı veya web adresi paylaşmak yasaktır.' },
        { status: 400 }
      );
    }

    if (containsProfanity(rawMsg)) {
      return NextResponse.json(
        { error: 'Mesajın küfür/hakaret filtresine takıldı. Lütfen saygılı bir dil kullan.' },
        { status: 400 }
      );
    }

    // Yanıt (Reply) doğrulaması: Sahte alıntıyı engellemek için veritabanından doğrula
    let replyToId = null;
    let replyToNick = null;
    let replyToText = null;

    if (rawReplyToId) {
      const { data: parentMsg } = await supabase
        .from('chat_messages')
        .select('id, nickname, message')
        .eq('id', rawReplyToId)
        .maybeSingle();

      if (parentMsg) {
        replyToId = String(parentMsg.id);
        replyToNick = parentMsg.nickname;
        replyToText =
          parentMsg.message.length > 100
            ? parentMsg.message.slice(0, 100) + '…'
            : parentMsg.message;
      }
    }

    const insertPayload = {
      nickname: rawNick,
      message: rawMsg,
      reply_to_id: replyToId,
      reply_to_nick: replyToNick,
      reply_to_text: replyToText,
    };

    const { data: inserted, error: insertError } = await supabase
      .from('chat_messages')
      .insert(insertPayload)
      .select('id, nickname, message, created_at, reply_to_id, reply_to_nick, reply_to_text')
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Mesaj kaydedilemedi. Supabase sütunlarını kontrol edin.' },
        { status: 500 }
      );
    }

    ipCooldownMap.set(ip, now);

    return NextResponse.json(
      {
        message: inserted,
        cooldownSeconds: COOLDOWN_SECONDS,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
