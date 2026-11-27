const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 1200;

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

function polishGamingTurkish(text) {
  let out = String(text || '')
    .replace(/(?:Liman\s*İzleme|Port\s*İzleme|Liman\s*Saati|Port\s*Saati)/gi, 'PortWatch')
    .replace(/(?:BENİ\s*OKU|Beni\s*oku|OKU\s*BENİ)/g, 'README')
    .replace(/readme(?:'si|'sinde|'sindeki|'nde|'sında|'deki)?/gi, (m) => m.replace(/readme/i, 'README'))
    .replace(/(?:[çÇ]erçeve|[kK]are)\s+(?:üretimi|oluşturma|oluşturucu|nesli)/g, 'Frame Generation')
    .replace(/[tT]ilki\s*köpeği(?:nin|'nin)?/g, "foxhound'un")
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
    .replace(/\s+/g, ' ')
    .trim();

  if (out.length > 0 && /^[a-zçğıöşü]/.test(out)) {
    out = out[0].toLocaleUpperCase('tr-TR') + out.slice(1);
  }
  return out;
}

async function callGoogleTranslateChunk(lines) {
  const joined = lines.join('\n');
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=' +
    encodeURIComponent(joined);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/4.1)',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(4500),
    cache: 'no-store',
  });

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

async function callGoogleTranslateSingle(text) {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=' +
    encodeURIComponent(text);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/4.1)',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(3500),
    cache: 'no-store',
  });

  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null;

  const fullText = data[0]
    .map((seg) => (Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : ''))
    .join('');
  return fullText ? polishGamingTurkish(fullText) : null;
}

/**
 * Batch translates an array of English strings to Turkish with 24h in-memory caching.
 * Returns a Map<originalString, translatedTurkishString>.
 */
export async function translateBatchToTurkish(rawStrings) {
  const now = Date.now();
  cleanupCache(now);

  const resultMap = new Map();
  const pending = [];
  const seenPending = new Set();

  for (const item of rawStrings) {
    const clean = String(item || '').replace(/\s+/g, ' ').trim();
    if (!clean) continue;

    if (looksTurkish(clean)) {
      resultMap.set(item, clean);
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

  if (pending.length === 0) {
    return resultMap;
  }

  // Group into chunks under ~1800 chars so Google Translate keeps 1:1 line count reliably
  const chunks = [];
  let curr = [];
  let currLen = 0;
  for (const line of pending) {
    if (curr.length > 0 && (currLen + line.length + 1 > 1800 || curr.length >= 18)) {
      chunks.push(curr);
      curr = [];
      currLen = 0;
    }
    curr.push(line);
    currLen += line.length + 1;
  }
  if (curr.length > 0) chunks.push(curr);

  await Promise.allSettled(
    chunks.map(async (chunk) => {
      try {
        const translated = await callGoogleTranslateChunk(chunk);
        if (translated && translated.length === chunk.length) {
          for (let i = 0; i < chunk.length; i += 1) {
            const val = translated[i] || chunk[i];
            trCache.set(chunk[i], { ts: now, val });
          }
          return;
        }
      } catch {
        // Fallback to single-line translation for this chunk
      }

      await Promise.allSettled(
        chunk.map(async (line) => {
          try {
            const single = await callGoogleTranslateSingle(line);
            if (single) {
              trCache.set(line, { ts: now, val: single });
            }
          } catch {
            // Keep English fallback gracefully
          }
        })
      );
    })
  );

  for (const item of rawStrings) {
    if (resultMap.has(item)) continue;
    const clean = String(item || '').replace(/\s+/g, ' ').trim();
    const cached = trCache.get(clean);
    resultMap.set(item, cached?.val || item);
  }

  return resultMap;
}
