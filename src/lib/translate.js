import { TR_SEED_CACHE } from './trSeedCache';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 1600;

const trCache = globalThis.__gta6TrCache || new Map();
globalThis.__gta6TrCache = trCache;

function cleanupCache(now) {
  if (trCache.size <= MAX_CACHE_ENTRIES) return;
  for (const [k, entry] of trCache.entries()) {
    if (now - entry.ts > CACHE_TTL_MS) {
      trCache.delete(k);
    }
  }
  if (trCache.size > MAX_CACHE_ENTRIES) {
    const excess = trCache.size - MAX_CACHE_ENTRIES;
    let i = 0;
    for (const k of trCache.keys()) {
      trCache.delete(k);
      i += 1;
      if (i >= excess) break;
    }
  }
}

export function looksTurkish(text) {
  return /[çğıİöşüâÇĞÖŞÜ]/.test(String(text || ''));
}

export function normalizeTranslatable(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

export function polishGamingTurkish(text) {
  let out = String(text || '')
    .replace(/(?:Liman\s*İzleme|Port\s*İzleme|Liman\s*Saati|Port\s*Saati)/gi, 'PortWatch')
    .replace(/(?:BENİ\s*OKU|Beni\s*oku|OKU\s*BENİ)/g, 'README')
    .replace(/readme(?:'si|'sinde|'sindeki|'nde|'sında|'deki)?/gi, (m) => m.replace(/readme/i, 'README'))
    .replace(/(?:[çÇ]erçeve|[kK]are)\s+(?:üretimi|oluşturma|oluşturucu|nesli)/g, 'Frame Generation')
    .replace(/[tT]ilki\s*köpeği(?:nin|'nin)?/g, "foxhound'un")
    .replace(/(?:^|[\s(])[kK]artımızdaki(?=[\s.,;:!?)]|$)/g, (m) => m.replace(/[kK]artımızdaki/, 'listemizdeki'))
    .replace(/(?:^|[\s(])[pP]anomuzdaki(?=[\s.,;:!?)]|$)/g, (m) => m.replace(/[pP]anomuzdaki/, 'listemizdeki'))
    .replace(/(?:^|[\s(])[pP]anomuzun(?=[\s.,;:!?)]|$)/g, (m) => m.replace(/[pP]anomuzun/, 'listemizin'))
    .replace(/(?:^|[\s(])[tT]ahtamızdaki(?=[\s.,;:!?)]|$)/g, (m) => m.replace(/[tT]ahtamızdaki/, 'listemizdeki'))
    .replace(/(?:^|[\s(])[tT]ahtamızda(?=[\s.,;:!?)]|$)/g, (m) => m.replace(/[tT]ahtamızda/, 'listemizde'))
    .replace(/(?:^|[\s(])[pP]anomuzda(?=[\s.,;:!?)]|$)/g, (m) => m.replace(/[pP]anomuzda/, 'listemizde'))
    .replace(/(?:^|[\s(])[kK]artımızda(?=[\s.,;:!?)]|$)/g, (m) => m.replace(/[kK]artımızda/, 'listemizde'))
    .replace(/[gG]ölgelendiriciler(?:i|in|de|den)?/g, (m) => {
      const cap = m[0] === 'G';
      const base = cap ? 'Shader' : 'shader';
      if (/leri$/i.test(m)) return `${base}ları`;
      if (/lerin$/i.test(m)) return `${base}ların`;
      if (/lerde$/i.test(m)) return `${base}larda`;
      if (/lerden$/i.test(m)) return `${base}lardan`;
      return `${base}lar`;
    })
    .replace(/[gG]ölgelendirici(?:si|yi|nin|de)?/g, (m) => (m[0] === 'G' ? 'Shader' : 'shader'))
    .replace(/(?:doğrulanmış|tarafından doğrulandı)\s+PortWatch/gi, 'PortWatch tarafından doğrulandı')
    .replace(/^Platform:\s*/i, 'Test Sistemi: ')
    .replace(/\s+/g, ' ')
    .trim();

  if (out.length > 0 && /^[a-zçğıöşü]/.test(out)) {
    out = out[0].toLocaleUpperCase('tr-TR') + out.slice(1);
  }
  return out;
}

// Provider 1: Google clients5 batch array API (exact 1:1 JSON array, never breaks newline counts)
async function callGoogleClients5Batch(lines) {
  const params = new URLSearchParams();
  for (const line of lines) params.append('q', line);

  const res = await fetch(
    'https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=tr',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
      body: params.toString(),
      signal: AbortSignal.timeout(5500),
      cache: 'no-store',
    }
  );

  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!Array.isArray(data) || data.length !== lines.length) return null;

  return data.map((item) => {
    const raw = typeof item === 'string' ? item : Array.isArray(item) ? String(item[0] || '') : '';
    return raw ? polishGamingTurkish(raw) : '';
  });
}

// Provider 2: Google gtx POST endpoint (supports larger payloads in a single request)
async function callGoogleGtxPostBatch(lines) {
  const body = new URLSearchParams({ q: lines.join('\n') });

  const res = await fetch(
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
      body: body.toString(),
      signal: AbortSignal.timeout(5500),
      cache: 'no-store',
    }
  );

  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null;

  const fullText = data[0]
    .map((seg) => (Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : ''))
    .join('');

  const outLines = fullText.split('\n').map((s) => polishGamingTurkish(s));
  if (outLines.length !== lines.length) return null;
  return outLines;
}

// Provider 3: Independent non-Google fallback (MyMemory) for small remaining batches
async function callMyMemorySingle(text) {
  const url =
    'https://api.mymemory.translated.net/get?langpair=en|tr&q=' + encodeURIComponent(text.slice(0, 480));
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/4.2)',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(4000),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const translated = data?.responseData?.translatedText;
  if (
    typeof translated !== 'string' ||
    !translated.trim() ||
    translated.toUpperCase().includes('MYMEMORY WARNING')
  ) {
    return null;
  }
  return polishGamingTurkish(translated);
}

async function runWithConcurrency(items, concurrency, worker) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const next = queue.shift();
      if (next !== undefined) {
        await worker(next);
      }
    }
  });
  await Promise.allSettled(workers);
}

async function translateChunkReliable(chunk, now) {
  // 1. Primary: Google clients5 JSON array POST
  try {
    const res1 = await callGoogleClients5Batch(chunk);
    if (res1 && res1.length === chunk.length) {
      let ok = 0;
      for (let i = 0; i < chunk.length; i += 1) {
        if (res1[i]) {
          trCache.set(chunk[i], { ts: now, val: res1[i] });
          ok += 1;
        }
      }
      if (ok === chunk.length) return;
    }
  } catch {
    // Fall through to Provider 2
  }

  // 2. Fallback: Google gtx POST
  const remaining1 = chunk.filter((line) => !trCache.has(line));
  if (remaining1.length === 0) return;

  try {
    const res2 = await callGoogleGtxPostBatch(remaining1);
    if (res2 && res2.length === remaining1.length) {
      let ok = 0;
      for (let i = 0; i < remaining1.length; i += 1) {
        if (res2[i]) {
          trCache.set(remaining1[i], { ts: now, val: res2[i] });
          ok += 1;
        }
      }
      if (ok === remaining1.length) return;
    }
  } catch {
    // Fall through to Provider 3
  }

  // 3. Independent non-Google fallback (MyMemory) — limited to small batches so we never stall
  const remaining2 = chunk.filter((line) => !trCache.has(line)).slice(0, 12);
  if (remaining2.length === 0) return;

  await runWithConcurrency(remaining2, 3, async (line) => {
    try {
      const single = await callMyMemorySingle(line);
      if (single && single.toLowerCase() !== line.toLowerCase()) {
        trCache.set(line, { ts: now, val: single });
      }
    } catch {
      // Keep English gracefully if all 3 providers fail
    }
  });
}

/**
 * Batch translates an array of English strings to Turkish with:
 * - Instant pre-warmed PortWatch seed cache (0ms cold start)
 * - 24h in-memory cache for newly translated live entries
 * - Multi-provider automatic translation (Google clients5 POST -> Google gtx POST -> MyMemory)
 * Returns a Map<originalString, translatedTurkishString>.
 */
export async function translateBatchToTurkish(rawStrings) {
  const now = Date.now();
  cleanupCache(now);

  const resultMap = new Map();
  const pending = [];
  const seenPending = new Set();

  for (const item of rawStrings) {
    const clean = normalizeTranslatable(item);
    if (!clean) continue;

    if (looksTurkish(clean)) {
      resultMap.set(item, clean);
      continue;
    }

    const seeded = TR_SEED_CACHE[clean];
    if (seeded) {
      resultMap.set(item, seeded);
      continue;
    }

    const cached = trCache.get(clean);
    if (cached && now - cached.ts < CACHE_TTL_MS) {
      resultMap.set(item, cached.val);
      continue;
    }

    if (!seenPending.has(clean)) {
      seenPending.add(clean);
      pending.push(clean);
    }
  }

  if (pending.length > 0) {
    // Group into safe batches (~20 strings / ~2400 chars max) and process with low concurrency (2)
    // so Netlify/AWS Lambda IPs never trigger burst rate limits.
    const chunks = [];
    let curr = [];
    let currLen = 0;
    for (const line of pending) {
      if (curr.length > 0 && (currLen + line.length + 1 > 2400 || curr.length >= 20)) {
        chunks.push(curr);
        curr = [];
        currLen = 0;
      }
      curr.push(line);
      currLen += line.length + 1;
    }
    if (curr.length > 0) chunks.push(curr);

    await runWithConcurrency(chunks, 2, (chunk) => translateChunkReliable(chunk, now));
  }

  for (const item of rawStrings) {
    if (resultMap.has(item)) continue;
    const clean = normalizeTranslatable(item);
    const cached = trCache.get(clean);
    resultMap.set(item, cached?.val || item);
  }

  return resultMap;
}

export function countUntranslatedStrings(rawStrings, trMap) {
  let untranslated = 0;
  for (const item of rawStrings) {
    const clean = normalizeTranslatable(item);
    if (!clean || looksTurkish(clean) || TR_SEED_CACHE[clean]) continue;
    const out = trMap.get(item);
    if (!out || normalizeTranslatable(out).toLowerCase() === clean.toLowerCase()) {
      untranslated += 1;
    }
  }
  return untranslated;
}
