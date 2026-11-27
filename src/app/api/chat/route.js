import crypto from 'crypto';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const COOLDOWN_SECONDS = 30;
const COOLDOWN_MS = COOLDOWN_SECONDS * 1000;
const MAX_MESSAGE_LENGTH = 280;
const MIN_NICK_LENGTH = 2;
const MAX_NICK_LENGTH = 20;

const PIN_MAX_FAILS = 5;
const PIN_LOCK_MS = 15 * 60 * 1000;
const ALLOWED_REACTIONS = ['🔥', '👍', '😂'];
const REACT_WINDOW_MS = 60 * 1000;
const REACT_MAX_PER_WINDOW = 20;

const ipCooldownMap = new Map();
const pinFailMap = new Map();
const reactionRateMap = new Map();

function cleanupMaps(now) {
  if (ipCooldownMap.size > 500) {
    for (const [key, ts] of ipCooldownMap.entries()) {
      if (now - ts > COOLDOWN_MS * 2) {
        ipCooldownMap.delete(key);
      }
    }
  }
  if (pinFailMap.size > 500) {
    for (const [key, entry] of pinFailMap.entries()) {
      if (now > (entry.blockedUntil || 0) && now - (entry.lastFailAt || 0) > PIN_LOCK_MS) {
        pinFailMap.delete(key);
      }
    }
  }
  if (reactionRateMap.size > 500) {
    for (const [key, entry] of reactionRateMap.entries()) {
      if (now - (entry.windowStart || 0) > REACT_WINDOW_MS * 2) {
        reactionRateMap.delete(key);
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

function safePinEqual(input, secret) {
  if (!input || !secret) return false;
  const a = crypto.createHash('sha256').update(String(input)).digest();
  const b = crypto.createHash('sha256').update(String(secret)).digest();
  return crypto.timingSafeEqual(a, b);
}

function checkPinRateLimit(ipHash, now) {
  const entry = pinFailMap.get(ipHash);
  if (!entry) return { blocked: false, retryMinutes: 0 };
  if (entry.blockedUntil && now < entry.blockedUntil) {
    const retryMinutes = Math.max(1, Math.ceil((entry.blockedUntil - now) / 60000));
    return { blocked: true, retryMinutes };
  }
  return { blocked: false, retryMinutes: 0 };
}

function recordPinFailure(ipHash, now) {
  const prev = pinFailMap.get(ipHash);
  const reset = !prev || now - (prev.lastFailAt || 0) > PIN_LOCK_MS;
  const count = reset ? 1 : (prev.count || 0) + 1;
  const blockedUntil = count >= PIN_MAX_FAILS ? now + PIN_LOCK_MS : 0;
  pinFailMap.set(ipHash, { count, lastFailAt: now, blockedUntil });
}

function clearPinFailure(ipHash) {
  pinFailMap.delete(ipHash);
}

function checkReactionRateLimit(ipHash, now) {
  const prev = reactionRateMap.get(ipHash);
  if (!prev || now - prev.windowStart > REACT_WINDOW_MS) {
    reactionRateMap.set(ipHash, { windowStart: now, count: 1 });
    return true;
  }
  if (prev.count >= REACT_MAX_PER_WINDOW) {
    return false;
  }
  prev.count += 1;
  return true;
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

function getStaffRole(pin) {
  const clean = typeof pin === 'string' ? pin.trim() : '';
  if (!clean) return null;
  const adminPin = (process.env.ADMIN_CHAT_PIN || '').trim();
  const modPin = (process.env.MOD_CHAT_PIN || '').trim();
  if (adminPin && safePinEqual(clean, adminPin)) return 'admin';
  if (modPin && safePinEqual(clean, modPin)) return 'mod';
  return null;
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
  'siktir', 'sikim', 'sikeyim', 'sikerim', 'sikis', 'siken', 'sikik', 'siktig', 'sikici',
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
  const cleanedRaw = stripInvisible(raw)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

  // Boşluk veya noktalama ile bölünmüş ya da fonetik rakamlı kaçak küfürler (örn. "P iç", "S2ci", "s 2 k", "a m k")
  if (/(?:^|[\s._-])p[\s._-]*[i1!|][\s._-]*c(?:$|[\s._-]|ler|lik|i|in|e)/i.test(cleanedRaw)) return true;
  if (/(?:^|[\s._-])s[\s._-]*2[\s._-]*(?:ci|cu|k|m|s|y|tir)/i.test(cleanedRaw)) return true;
  if (/(?:^|[\s._-])g[\s._-]*[o0][\s._-]*t(?:$|[\s._-]|u|un|ler|veren)/i.test(cleanedRaw)) return true;
  if (/(?:^|[\s._-])s[\s._-]*[i1!|][\s._-]*k(?:$|[\s._-]|er|im|is|ik|tir|en|ici)/i.test(cleanedRaw)) return true;
  if (/(?:^|[\s._-])[a4@][\s._-]*m[\s._-]*k(?:$|[\s._-])/i.test(cleanedRaw)) return true;
  if (/(?:^|[\s._-])[o0][\s._-]*c(?:$|[\s._-])/i.test(cleanedRaw)) return true;
  if (/(?:^|[\s._-])[a4@][\s._-]*q(?:$|[\s._-])/i.test(cleanedRaw)) return true;

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

async function verifyTurnstileIfConfigured(token, ip) {
  const secret = (process.env.TURNSTILE_SECRET_KEY || '').trim();
  if (!secret) return true;
  if (!token || typeof token !== 'string') return false;
  try {
    const form = new URLSearchParams();
    form.append('secret', secret);
    form.append('response', token);
    if (ip && ip !== 'unknown') form.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json().catch(() => null);
    return Boolean(data?.success);
  } catch {
    return false;
  }
}

export async function GET(request) {
  try {
    const cfg = getSupabaseConfig();
    if (!cfg) {
      return NextResponse.json({ error: 'Sohbet servisi yapılandırılmadı.', messages: [] }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const room = normalizeRoom(searchParams.get('room'));

    const fetchMessages = async () => {
      let res = await fetch(
        `${cfg.url}/rest/v1/chat_messages?select=id,nickname,message,created_at,reply_to_id,reply_to_nick,reply_to_text,room,role,reactions&room=eq.${room}&order=created_at.desc&limit=50`,
        { headers: cfg.headers, cache: 'no-store', signal: AbortSignal.timeout(6500) }
      );
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        if (errText.includes('reactions') || errText.includes('role')) {
          res = await fetch(
            `${cfg.url}/rest/v1/chat_messages?select=id,nickname,message,created_at,reply_to_id,reply_to_nick,reply_to_text,room&room=eq.${room}&order=created_at.desc&limit=50`,
            { headers: cfg.headers, cache: 'no-store', signal: AbortSignal.timeout(6500) }
          );
        } else {
          return { ok: false, errText };
        }
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        return { ok: false, errText };
      }
      const data = await res.json().catch(() => []);
      return { ok: true, data: Array.isArray(data) ? data.reverse() : [] };
    };

    const fetchPinned = async () => {
      try {
        const pinRes = await fetch(
          `${cfg.url}/rest/v1/chat_pins?select=message,updated_by,updated_at&room=eq.${room}&limit=1`,
          { headers: cfg.headers, cache: 'no-store', signal: AbortSignal.timeout(4500) }
        );
        if (pinRes.ok) {
          const pinArr = await pinRes.json().catch(() => []);
          if (Array.isArray(pinArr) && pinArr[0]?.message) {
            return pinArr[0];
          }
        }
      } catch {
        // chat_pins yavaşlasa veya yoksa sohbeti engelleme
      }
      return null;
    };

    const [msgResult, pinned] = await Promise.all([fetchMessages(), fetchPinned()]);

    if (!msgResult.ok) {
      return NextResponse.json(
        { error: `Mesajlar yüklenemedi: ${String(msgResult.errText || '').slice(0, 120)}`, messages: [] },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { messages: msgResult.data, room, pinned },
      { status: 200 }
    );
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

    const now = Date.now();
    cleanupMaps(now);

    const room = normalizeRoom(body.room);
    const isEn = room === 'en';
    const ip = getClientIp(request);
    const ipHash = hashIp(ip, cfg.salt);
    const clientId = sanitizeClientId(body.clientId);
    const rawPin = typeof body.adminPin === 'string' ? body.adminPin.trim() : '';

    let staffRole = null;
    if (rawPin) {
      const lock = checkPinRateLimit(ipHash, now);
      if (lock.blocked) {
        return NextResponse.json(
          {
            error: isEn
              ? `Too many failed PIN attempts. Try again in ${lock.retryMinutes} min.`
              : `Çok fazla hatalı yetkili PIN denemesi. ${lock.retryMinutes} dakika sonra tekrar dene.`,
          },
          { status: 429 }
        );
      }
      staffRole = getStaffRole(rawPin);
      if (!staffRole) {
        recordPinFailure(ipHash, now);
        return NextResponse.json(
          {
            error: isEn ? 'Invalid Staff PIN!' : 'Yetkili PIN hatalı!',
          },
          { status: 403 }
        );
      }
      clearPinFailure(ipHash);
    }

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
      if (staffRole !== 'admin') {
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

    const isStaff = isVerifiedAdmin || staffRole === 'mod';

    if (!isStaff) {
      const turnstileOk = await verifyTurnstileIfConfigured(body.turnstileToken, ip);
      if (!turnstileOk) {
        return NextResponse.json(
          {
            error: isEn
              ? 'Bot verification failed. Please refresh and try again.'
              : 'Bot doğrulaması başarısız. Sayfayı yenileyip tekrar dene.',
          },
          { status: 403 }
        );
      }
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

    if (!isStaff) {
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

      const cutoffIso = new Date(now - COOLDOWN_MS).toISOString();
      const cdFilter = clientId
        ? `or=(ip_hash.eq.${encodeURIComponent(ipHash)},client_id.eq.${encodeURIComponent(clientId)})`
        : `ip_hash=eq.${encodeURIComponent(ipHash)}`;
      const cdRes = await fetch(
        `${cfg.url}/rest/v1/chat_messages?select=created_at&${cdFilter}&created_at=gte.${encodeURIComponent(cutoffIso)}&order=created_at.desc&limit=1`,
        { headers: cfg.headers, cache: 'no-store' }
      );
      if (cdRes.ok) {
        const recent = await cdRes.json().catch(() => []);
        if (Array.isArray(recent) && recent[0]?.created_at) {
          const ts = new Date(recent[0].created_at).getTime();
          if (!Number.isNaN(ts) && now - ts < COOLDOWN_MS) {
            ipCooldownMap.set(ip, ts);
            const retryAfter = Math.max(1, Math.ceil((COOLDOWN_MS - (now - ts)) / 1000));
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

    const msgRole = isVerifiedAdmin ? 'admin' : staffRole === 'mod' ? 'mod' : 'user';

    const insertPayload = {
      nickname: isVerifiedAdmin ? 'batmancodex' : rawNick,
      message: rawMsg,
      room,
      ip_hash: ipHash,
      client_id: clientId,
      role: msgRole,
      reactions: {},
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

    let insertRes = await fetch(
      `${cfg.url}/rest/v1/chat_messages?select=id,nickname,message,created_at,reply_to_id,reply_to_nick,reply_to_text,room,role,reactions`,
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
      if (String(detail).includes('reactions') || String(detail).includes('role')) {
        const fallbackPayload = { ...insertPayload };
        delete fallbackPayload.reactions;
        if (String(detail).includes('role')) delete fallbackPayload.role;
        insertRes = await fetch(
          `${cfg.url}/rest/v1/chat_messages?select=id,nickname,message,created_at,reply_to_id,reply_to_nick,reply_to_text,room`,
          {
            method: 'POST',
            headers: {
              ...cfg.headers,
              Prefer: 'return=representation',
            },
            body: JSON.stringify(fallbackPayload),
          }
        );
      } else {
        return NextResponse.json(
          { error: `Mesaj kaydedilemedi (${detail})` },
          { status: 500 }
        );
      }
    }

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
    if (inserted) {
      if (!inserted.role) inserted.role = msgRole;
      if (!inserted.reactions) inserted.reactions = {};
    }

    if (!isStaff) {
      ipCooldownMap.set(ip, now);
    }

    return NextResponse.json(
      {
        message: inserted,
        cooldownSeconds: isStaff ? 0 : COOLDOWN_SECONDS,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Mesaj gönderilirken bir hata oluştu.' }, { status: 500 });
  }
}

// Sabitlenmiş duyuru (action='pin') ve hız sınırlı mini emoji tepkisi (action='react')
export async function PATCH(request) {
  try {
    const cfg = getSupabaseConfig();
    if (!cfg) {
      return NextResponse.json({ error: 'Sohbet servisi yapılandırılmadı.' }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
    }

    const now = Date.now();
    cleanupMaps(now);
    const ip = getClientIp(request);
    const ipHash = hashIp(ip, cfg.salt);

    if (body.action === 'pin') {
      const lock = checkPinRateLimit(ipHash, now);
      if (lock.blocked) {
        return NextResponse.json(
          { error: `Çok fazla hatalı yetkili PIN denemesi. ${lock.retryMinutes} dakika sonra tekrar dene.` },
          { status: 429 }
        );
      }

      const role = getStaffRole(body.staffPin);
      if (!role) {
        recordPinFailure(ipHash, now);
        return NextResponse.json({ error: 'Yetkili PIN hatalı!' }, { status: 403 });
      }
      clearPinFailure(ipHash);

      const room = normalizeRoom(body.room);
      const cleanMsg = stripInvisible(typeof body.message === 'string' ? body.message : '').slice(0, 180);

      if (!cleanMsg) {
        await fetch(`${cfg.url}/rest/v1/chat_pins?room=eq.${room}`, {
          method: 'DELETE',
          headers: cfg.headers,
        });
        return NextResponse.json({ ok: true, pinned: null }, { status: 200 });
      }

      const upsertRes = await fetch(`${cfg.url}/rest/v1/chat_pins?on_conflict=room`, {
        method: 'POST',
        headers: {
          ...cfg.headers,
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({
          room,
          message: cleanMsg,
          updated_by: role === 'admin' ? 'batmancodex' : 'Moderatör',
          updated_at: new Date().toISOString(),
        }),
      });

      if (!upsertRes.ok) {
        return NextResponse.json(
          { error: 'Duyuru kaydedilemedi (chat_pins tablosunu kontrol edin).' },
          { status: 500 }
        );
      }

      const arr = await upsertRes.json().catch(() => []);
      return NextResponse.json({ ok: true, pinned: arr[0] || { message: cleanMsg } }, { status: 200 });
    }

    if (body.action === 'react') {
      if (!checkReactionRateLimit(ipHash, now)) {
        return NextResponse.json(
          { error: 'Çok hızlı tepki veriyorsun, biraz bekle.' },
          { status: 429 }
        );
      }

      const messageId = Number(body.messageId);
      const emoji = typeof body.emoji === 'string' ? body.emoji.trim() : '';
      const delta = body.delta === -1 ? -1 : 1;

      if (!Number.isInteger(messageId) || messageId <= 0 || !ALLOWED_REACTIONS.includes(emoji)) {
        return NextResponse.json({ error: 'Geçersiz tepki.' }, { status: 400 });
      }

      const msgRes = await fetch(
        `${cfg.url}/rest/v1/chat_messages?select=id,reactions&id=eq.${encodeURIComponent(messageId)}&limit=1`,
        { headers: cfg.headers, cache: 'no-store' }
      );
      if (!msgRes.ok) {
        return NextResponse.json({ error: 'Tepki özelliği henüz DB sütununda aktif değil.' }, { status: 400 });
      }
      const msgArr = await msgRes.json().catch(() => []);
      const row = Array.isArray(msgArr) ? msgArr[0] : null;
      if (!row) {
        return NextResponse.json({ error: 'Mesaj bulunamadı.' }, { status: 404 });
      }

      const current = row.reactions && typeof row.reactions === 'object' ? { ...row.reactions } : {};
      const nextCount = Math.max(0, (Number(current[emoji]) || 0) + delta);
      if (nextCount === 0) {
        delete current[emoji];
      } else {
        current[emoji] = nextCount;
      }

      const patchRes = await fetch(
        `${cfg.url}/rest/v1/chat_messages?id=eq.${encodeURIComponent(messageId)}`,
        {
          method: 'PATCH',
          headers: cfg.headers,
          body: JSON.stringify({ reactions: current }),
        }
      );

      if (!patchRes.ok) {
        return NextResponse.json({ error: 'Tepki güncellenemedi.' }, { status: 500 });
      }

      return NextResponse.json({ ok: true, messageId, reactions: current }, { status: 200 });
    }

    return NextResponse.json({ error: 'Bilinmeyen işlem.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'İşlem sırasında hata oluştu.' }, { status: 500 });
  }
}

// Admin veya Moderatör için: action='clear' (sadece mesaj sil) veya action='ban' (kalıcı ban + mesaj sil)
export async function DELETE(request) {
  try {
    const cfg = getSupabaseConfig();
    if (!cfg) {
      return NextResponse.json({ error: 'Sohbet servisi yapılandırılmadı.' }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
    }

    const now = Date.now();
    cleanupMaps(now);
    const ipHash = hashIp(getClientIp(request), cfg.salt);

    const lock = checkPinRateLimit(ipHash, now);
    if (lock.blocked) {
      return NextResponse.json(
        {
          error: `Çok fazla hatalı yetkili PIN denemesi. ${lock.retryMinutes} dakika sonra tekrar dene.`,
        },
        { status: 429 }
      );
    }

    const role = getStaffRole(body.staffPin);
    if (!role) {
      recordPinFailure(ipHash, now);
      return NextResponse.json(
        { error: 'Yetkili PIN hatalı! İşlem reddedildi.' },
        { status: 403 }
      );
    }
    clearPinFailure(ipHash);

    const messageId = Number(body.messageId);
    if (!Number.isInteger(messageId) || messageId <= 0) {
      return NextResponse.json({ error: 'Geçersiz mesaj ID.' }, { status: 400 });
    }

    const action = body.action === 'clear' ? 'clear' : 'ban';

    if (action === 'clear') {
      if (role === 'mod') {
        const checkRes = await fetch(
          `${cfg.url}/rest/v1/chat_messages?select=id,nickname&id=eq.${encodeURIComponent(messageId)}&limit=1`,
          { headers: cfg.headers, cache: 'no-store' }
        );
        if (checkRes.ok) {
          const checkArr = await checkRes.json().catch(() => []);
          const target = Array.isArray(checkArr) ? checkArr[0] : null;
          if (target && String(target.nickname || '').trim().toLowerCase() === 'batmancodex') {
            return NextResponse.json(
              { error: 'Kurucu mesajı silinemez.' },
              { status: 403 }
            );
          }
        }
      }

      const delRes = await fetch(
        `${cfg.url}/rest/v1/chat_messages?id=eq.${encodeURIComponent(messageId)}`,
        {
          method: 'DELETE',
          headers: cfg.headers,
        }
      );

      if (!delRes.ok) {
        const errText = await delRes.text().catch(() => '');
        return NextResponse.json(
          { error: `Mesaj silinemedi: ${errText.slice(0, 120)}` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          ok: true,
          action: 'clear',
          result: 'Mesaj temizlendi (kullanıcı banlanmadı).',
          deletedId: messageId,
        },
        { status: 200 }
      );
    }

    const reason =
      typeof body.reason === 'string' && body.reason.trim()
        ? body.reason.trim().slice(0, 80)
        : role === 'admin'
          ? 'Admin ban'
          : 'Moderatör ban';

    const rpcRes = await fetch(`${cfg.url}/rest/v1/rpc/ban_by_message_id`, {
      method: 'POST',
      headers: cfg.headers,
      body: JSON.stringify({
        target_msg_id: messageId,
        ban_reason: reason,
      }),
    });

    if (!rpcRes.ok) {
      const errText = await rpcRes.text().catch(() => '');
      return NextResponse.json(
        { error: `Ban işlemi başarısız: ${errText.slice(0, 120)}` },
        { status: 500 }
      );
    }

    const resultText = await rpcRes.json().catch(() => 'İşlem tamamlandı.');
    return NextResponse.json(
      { ok: true, action: 'ban', result: resultText, deletedId: messageId },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: 'İşlem sırasında hata oluştu.' }, { status: 500 });
  }
}
