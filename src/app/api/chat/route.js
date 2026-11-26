import crypto from 'crypto';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const COOLDOWN_SECONDS = 30;
const COOLDOWN_MS = COOLDOWN_SECONDS * 1000;
const MAX_MESSAGE_LENGTH = 280;
const MIN_NICK_LENGTH = 2;
const MAX_NICK_LENGTH = 20;

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
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function hashIp(ip, salt) {
  return crypto
    .createHash('sha256')
    .update(`${ip}:${salt}`)
    .digest('hex')
    .slice(0, 32);
}

function getSupabaseConfig() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceKey) return null;
  const headers = {
    apikey: serviceKey,
    'Content-Type': 'application/json',
  };
  if (serviceKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${serviceKey}`;
  }
  return { url, headers, salt: serviceKey.slice(0, 16) };
}

function normalizeRoom(raw) {
  return String(raw || '').toLowerCase() === 'en' ? 'en' : 'tr';
}

function sanitizeClientId(raw) {
  if (typeof raw !== 'string') return null;
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  return clean.length >= 8 ? clean : null;
}

function stripInvisible(str) {
  return str
    .replace(/[\u200B-\u200D\uFEFF\u00AD\u2060]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

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

  return lower
    .replace(/0/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/[4@]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/9/g, 'g');
}

function collapseRepeats(str) {
  return str.replace(/(.)\1{2,}/g, '$1$1').replace(/(.)\1+/g, '$1');
}

function containsLink(raw) {
  const cleaned = stripInvisible(raw).toLowerCase();
  const compact = cleaned.replace(/\s+/g, '');

  if (/(https?:\/\/|ftp:\/\/|www\.|mailto:|javascript:|data:)/i.test(compact)) return true;
  if (
    /(discord\.gg|discord\.com\/invite|t\.me\/|telegram\.me|wa\.me\/|bit\.ly|tinyurl\.|youtu\.be|linktr\.ee|shorturl|cutt\.ly|rb\.gy|is\.gd|goo\.gl)/i.test(
      compact
    )
  ) {
    return true;
  }
  if (
    /[a-z0-9-]+\s*[\[\(\{]?\s*(dot|nokta)\s*[\]\)\}]?\s*(com|net|org|xyz|io|gg|tv|me|tr|ru|co|app|dev|site|online|info|biz|shop|link|live|pro|vip)/i.test(
      cleaned
    )
  ) {
    return true;
  }
  if (
    /(?:^|[\s([{"'])([a-z0-9-]{2,}\.(?:com|net|org|xyz|io|gg|tv|me|tr|ru|co|app|dev|site|online|info|biz|shop|link|live|pro|vip|club|top|cc|pw|tk|ml|ga|cf|gq|edu|gov)(?:\/[^\s]*)?)(?:$|[\s)\]}"',!?])/i.test(
      cleaned
    )
  ) {
    return true;
  }
  if (
    /[a-z0-9-]{2,}\s*\.\s*(com|net|org|xyz|io|gg|tv|me|tr|ru|co|app|dev|site|online|info|biz|link|vip)\b/i.test(
      cleaned
    )
  ) {
    return true;
  }
  if (/\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(cleaned)) return true;

  return false;
}

const STRICT_SUBSTRING_ROOTS = [
  'siktir', 'sikim', 'sikeyim', 'sikerim', 'sikis', 'siken', 'sikik', 'siktig',
  'orospu', 'orosbu', 'ocu', 'piclik', 'kahpe', 'kaltak', 'yavsak',
  'yarrak', 'yarak', 'amcik', 'amina', 'amini', 'aminakoy',
  'gotveren', 'gotune', 'gotunu', 'gavat', 'pezevenk', 'ibne', 'ipne', 'pust',
  'tasak', 'tassak', 'dalyarak', 'serefsiz', 'haysiyetsiz',
  'ananisik', 'ananiskm', 'anani', 'bacini', 'sulaleni',
  'fuck', 'bitch', 'asshole', 'motherfucker', 'bastard', 'cunt', 'whore', 'slut',
  'dickhead', 'nigger', 'nigga', 'faggot', 'retard',
];

const EXACT_WORD_BAD = new Set([
  'sik', 'am', 'amq', 'amk', 'aq', 'mk', 'sg', 'oc', 'pic', 'got',
  'mal', 'salak', 'aptal', 'gerizekali', 'dangalak', 'ahmak', 'embesil',
  'it', 'kopek', 'bok', 'sictim', 'sicarim',
  'shit', 'dick', 'cock', 'pussy', 'porn', 'porno', 'sex', 'seks', 'nude', 'fck', 'fuk',
]);

const RESERVED_EXACT_NICKS = new Set([
  'admin', 'administrator', 'administratör', 'mod', 'moderator', 'moderatör',
  'yonetici', 'yönetici', 'sistem', 'system', 'kurucu', 'owner', 'root',
  'staff', 'yetkili', 'destek', 'support', 'gta6takip', 'official', 'resmi',
]);

const RESERVED_SUBSTRINGS = [
  'admin', 'administrator', 'moderator', 'yonetici', 'yetkili',
  'kurucu', 'gta6takip', 'official', 'resmi', 'staff', 'sistem', 'system',
];

function containsProfanity(raw) {
  const norm = normalizeText(raw);
  const words = norm.split(/[^a-z]+/).filter(Boolean);

  for (const w of words) {
    const collapsed = collapseRepeats(w);
    if (EXACT_WORD_BAD.has(w) || EXACT_WORD_BAD.has(collapsed)) return true;
    for (const root of STRICT_SUBSTRING_ROOTS) {
      if (w.includes(root) || collapsed.includes(root)) return true;
    }
  }

  const squashed = norm.replace(/[^a-z]/g, '');
  const squashedCollapsed = collapseRepeats(squashed);
  for (const root of STRICT_SUBSTRING_ROOTS) {
    if (squashed.includes(root) || squashedCollapsed.includes(root)) return true;
  }

  if (/(?:^|\s)[a4]\s*[\.\-\*_]\s*m\s*[\.\-\*_]?\s*k(?:\s|$)/i.test(norm)) return true;
  if (/(?:^|\s)o\s*[\.\-\*_]\s*c(?:\s|$)/i.test(norm)) return true;
  if (/(?:^|\s)a\s*[\.\-\*_]\s*q(?:\s|$)/i.test(norm)) return true;

  return false;
}

function isReservedNickname(rawNick) {
  const squashed = normalizeText(rawNick).replace(/[^a-z0-9]/g, '');
  const collapsed = collapseRepeats(squashed);
  if (RESERVED_EXACT_NICKS.has(squashed) || RESERVED_EXACT_NICKS.has(collapsed)) return true;
  return RESERVED_SUBSTRINGS.some((sub) => squashed.includes(sub) || collapsed.includes(sub));
}

function isBatmanCodexImpersonation(rawNick) {
  const squashed = normalizeText(rawNick).replace(/[^a-z0-9]/g, '');
  const collapsed = collapseRepeats(squashed);
  const looksLikeBatman =
    squashed.includes('batmancodex') ||
    collapsed.includes('batmancodex') ||
    squashed.includes('batmancode') ||
    collapsed.includes('batmancode');
  const isExactAdmin = rawNick.trim().toLowerCase() === 'batmancodex';
  return { isExactAdmin, isImpersonation: looksLikeBatman && !isExactAdmin };
}

export async function GET(request) {
  try {
    const cfg = getSupabaseConfig();
    if (!cfg) {
      return NextResponse.json({ error: 'Sohbet servisi yapılandırılmadı.', messages: [] }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const room = normalizeRoom(searchParams.get('room'));

    const res = await fetch(
      `${cfg.url}/rest/v1/chat_messages?select=id,nickname,message,created_at,reply_to_id,reply_to_nick,reply_to_text,room&room=eq.${room}&order=created_at.desc&limit=50`,
      { headers: cfg.headers, cache: 'no-store' }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return NextResponse.json(
        { error: `Mesajlar yüklenemedi: ${errText.slice(0, 120)}`, messages: [] },
        { status: 500 }
      );
    }

    const data = await res.json().catch(() => []);
    return NextResponse.json({ messages: Array.isArray(data) ? data.reverse() : [], room }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Beklenmeyen sunucu hatası.', messages: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cfg = getSupabaseConfig();
    if (!cfg) {
      return NextResponse.json({ error: 'Sohbet servisi yapılandırılmadı (Vercel env eksik).' }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
    }

    const room = normalizeRoom(body.room);
    const isEn = room === 'en';
    const ip = getClientIp(request);
    const ipHash = hashIp(ip, cfg.salt);
    const clientId = sanitizeClientId(body.clientId);

    const rawNick = typeof body.nickname === 'string' ? stripInvisible(body.nickname) : '';
    const rawMsg = typeof body.message === 'string' ? stripInvisible(body.message) : '';
    const rawReplyToId = body.replyToId != null ? String(body.replyToId).trim() : null;

    if (rawNick.length < MIN_NICK_LENGTH || rawNick.length > MAX_NICK_LENGTH) {
      return NextResponse.json(
        {
          error: isEn
            ? `Nickname must be between ${MIN_NICK_LENGTH} and ${MAX_NICK_LENGTH} characters.`
            : `Takma adın ${MIN_NICK_LENGTH} ile ${MAX_NICK_LENGTH} karakter arasında olmalı.`,
        },
        { status: 400 }
      );
    }

    // Admin / batmancodex koruma ve taklit engeli
    const batmanCheck = isBatmanCodexImpersonation(rawNick);
    if (batmanCheck.isImpersonation) {
      return NextResponse.json(
        {
          error: isEn
            ? 'Impersonating the site admin nickname is not allowed.'
            : 'Kurucu kullanıcı adını taklit eden isimler kullanılamaz.',
        },
        { status: 403 }
      );
    }

    let isVerifiedAdmin = false;
    if (batmanCheck.isExactAdmin) {
      const configuredPin = (process.env.ADMIN_CHAT_PIN || '').trim();
      const providedPin = typeof body.adminPin === 'string' ? body.adminPin.trim() : '';
      if (!configuredPin) {
        return NextResponse.json(
          {
            error: isEn
              ? 'Admin verification PIN is not configured on the server.'
              : 'batmancodex koruması aktif. Vercel Environment Variables içine ADMIN_CHAT_PIN eklemelisin.',
          },
          { status: 403 }
        );
      }
      if (!providedPin || providedPin !== configuredPin) {
        return NextResponse.json(
          {
            error: isEn
              ? 'The nickname "batmancodex" is reserved for the site admin.'
              : 'batmancodex kullanıcı adı kurucuya özeldir. Doğru Admin PIN olmadan kullanılamaz.',
          },
          { status: 403 }
        );
      }
      isVerifiedAdmin = true;
    }

    if (!isVerifiedAdmin && isReservedNickname(rawNick)) {
      return NextResponse.json(
        {
          error: isEn
            ? 'This nickname is reserved and cannot be used.'
            : 'ADMIN, mod veya yönetici benzeri isimler kesinlikle kullanılamaz.',
        },
        { status: 400 }
      );
    }

    if (containsLink(rawNick) || containsProfanity(rawNick)) {
      return NextResponse.json(
        {
          error: isEn
            ? 'Nickname cannot contain profanity or links.'
            : 'Takma adında uygunsuz ifade veya link bulunamaz.',
        },
        { status: 400 }
      );
    }

    // Kalıcı ban kontrolü (admin hariç)
    if (!isVerifiedAdmin) {
      const banFilter = clientId
        ? `or=(ip_hash.eq.${encodeURIComponent(ipHash)},client_id.eq.${encodeURIComponent(clientId)})`
        : `ip_hash=eq.${encodeURIComponent(ipHash)}`;

      const banRes = await fetch(
        `${cfg.url}/rest/v1/chat_bans?select=id&${banFilter}&limit=1`,
        { headers: cfg.headers, cache: 'no-store' }
      );
      if (banRes.ok) {
        const banList = await banRes.json().catch(() => []);
        if (Array.isArray(banList) && banList.length > 0) {
          return NextResponse.json(
            {
              error: isEn
                ? 'You have been permanently banned from chat for violating the rules.'
                : 'Sohbet kurallarını ihlal ettiğin için mesaj gönderme yetkin kalıcı olarak kapatıldı.',
            },
            { status: 403 }
          );
        }
      }
    }

    // 30 saniyelik hız sınırı (doğrulanmış admin muaf)
    const now = Date.now();
    cleanupCooldownMap(now);

    if (!isVerifiedAdmin) {
      const lastSentAt = ipCooldownMap.get(ip);
      if (lastSentAt && now - lastSentAt < COOLDOWN_MS) {
        const retryAfter = Math.max(1, Math.ceil((COOLDOWN_MS - (now - lastSentAt)) / 1000));
        return NextResponse.json(
          {
            error: isEn
              ? `1 message per 30 seconds. Please wait ${retryAfter}s.`
              : `30 saniyede en fazla 1 mesaj gönderebilirsin. Lütfen ${retryAfter} saniye bekle.`,
            retryAfter,
          },
          { status: 429 }
        );
      }
    }

    if (rawMsg.length < 1) {
      return NextResponse.json(
        { error: isEn ? 'Message cannot be empty.' : 'Boş mesaj gönderemezsin.' },
        { status: 400 }
      );
    }

    if (rawMsg.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: isEn
            ? `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`
            : `Mesajın en fazla ${MAX_MESSAGE_LENGTH} karakter olabilir.`,
        },
        { status: 400 }
      );
    }

    if (containsLink(rawMsg)) {
      return NextResponse.json(
        {
          error: isEn
            ? 'Sharing links, invites, or URLs is not allowed in chat.'
            : 'Sohbette link, davet bağlantısı veya web adresi paylaşmak yasaktır.',
        },
        { status: 400 }
      );
    }

    if (containsProfanity(rawMsg)) {
      return NextResponse.json(
        {
          error: isEn
            ? 'Your message was blocked by the profanity filter. Please keep it respectful.'
            : 'Mesajın küfür/hakaret filtresine takıldı. Lütfen saygılı bir dil kullan.',
        },
        { status: 400 }
      );
    }

    const insertPayload = {
      nickname: isVerifiedAdmin ? 'batmancodex' : rawNick,
      message: rawMsg,
      room,
      ip_hash: ipHash,
      client_id: clientId,
    };

    if (rawReplyToId) {
      const parentRes = await fetch(
        `${cfg.url}/rest/v1/chat_messages?select=id,nickname,message&id=eq.${encodeURIComponent(rawReplyToId)}&room=eq.${room}&limit=1`,
        { headers: cfg.headers, cache: 'no-store' }
      );
      if (parentRes.ok) {
        const parentArr = await parentRes.json().catch(() => []);
        const parentMsg = Array.isArray(parentArr) ? parentArr[0] : null;
        if (parentMsg) {
          insertPayload.reply_to_id = String(parentMsg.id);
          insertPayload.reply_to_nick = parentMsg.nickname;
          insertPayload.reply_to_text =
            parentMsg.message.length > 100
              ? parentMsg.message.slice(0, 100) + '…'
              : parentMsg.message;
        }
      }
    }

    const insertRes = await fetch(
      `${cfg.url}/rest/v1/chat_messages?select=id,nickname,message,created_at,reply_to_id,reply_to_nick,reply_to_text,room`,
      {
        method: 'POST',
        headers: {
          ...cfg.headers,
          Prefer: 'return=representation',
        },
        body: JSON.stringify(insertPayload),
      }
    );

    if (!insertRes.ok) {
      const errJson = await insertRes.json().catch(() => null);
      const detail = errJson?.message || errJson?.hint || `HTTP ${insertRes.status}`;
      return NextResponse.json(
        { error: `Mesaj kaydedilemedi (${detail})` },
        { status: 500 }
      );
    }

    const insertedArr = await insertRes.json().catch(() => []);
    const inserted = Array.isArray(insertedArr) ? insertedArr[0] : insertedArr;

    if (!isVerifiedAdmin) {
      ipCooldownMap.set(ip, now);
    }

    return NextResponse.json(
      {
        message: inserted,
        cooldownSeconds: isVerifiedAdmin ? 0 : COOLDOWN_SECONDS,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Mesaj gönderilirken bir hata oluştu.' }, { status: 500 });
  }
}
