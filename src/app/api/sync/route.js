import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_TEAMS = [
  {
    name: 'CGBJ',
    progress: 91.5,
    fps: '25 FPS (30 FPS Ara Sahne)',
    gpu: 'NVIDIA (8GB RAM)',
    type: 'open',
    stage: 'Oynanabilir • Hikâye Yarısı',
    delta: '+37.0%',
    url: 'https://github.com/codec-d/cool_fox',
    repo: 'codec-d/cool_fox',
    summaryTr: 'Ara sahnelerde 30 FPS, oyun içinde ortalama 25 FPS (8 GB RAM / 16 GB VRAM). Hikâyenin yarısı oynanabilir ve kodlar GitHub üzerinde açık kaynak yayınlandı.',
    summaryEn: '30 FPS in cutscenes, 25 FPS average in gameplay (8 GB RAM / 16 GB VRAM). Half the story playable and now open source on GitHub.',
  },
  { name: 'NotNozy', progress: 87.8, fps: '16 FPS', gpu: 'AMD (Rumble)', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+26.8%', url: 'https://portwatch-vi.xyz/#race', isNew: true },
  { name: 'darkworldhm', progress: 84.8, fps: '15-24 FPS', gpu: 'RTX 50 Serisi', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+23.8%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'Doomsday', progress: 84.0, fps: '4 FPS', gpu: 'AMD / NVIDIA', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+19.5%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'AvatarManz', progress: 83.1, fps: '16 FPS (13-22 FPS)', gpu: 'RX 7900 XTX', type: 'open', stage: 'Oynanabilir • İlk Perde (Sesli)', delta: '+23.1%', url: 'https://github.com/avatarmanz/VIctory-7900XTX' },
  { name: 'Belobug', progress: 79.0, fps: '8 FPS', gpu: 'RX 9070 XT', type: 'open', stage: 'Oynanabilir • İlk Perde (RT)', delta: '+10.7%', url: 'https://github.com/Belobug/VIctory-Belobug-AMD' },
  { name: 'DexNom', progress: 78.0, fps: '3 FPS', gpu: 'RX 7900 XTX', type: 'open', stage: 'Oynanabilir • İlk Perde', delta: '+12.0%', url: 'https://github.com/DexNom/VIctory' },
  { name: 'suri', progress: 75.0, fps: '3 FPS', gpu: 'Özel Yapı', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+14.0%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'hyphennn', progress: 59.8, fps: '3 FPS', gpu: 'RTX 4070', type: 'open', stage: 'Oynanabilir • Açılış Sahnesi', delta: '+4.0%', url: 'https://github.com/fxceless/victory-fork' },
  { name: 'Uilian (VItoriaBr)', progress: 59.6, fps: '4 FPS', gpu: 'RTX 5060 Ti', type: 'open', stage: 'Oynanabilir • Önsöz Geçildi', delta: '+5.2%', url: 'https://github.com/uiliannn/VItoriaBr' },
  { name: 'omonkey', progress: 57.9, fps: '~5 FPS', gpu: 'Rumble Yayını', type: 'private', stage: 'Oynanabilir • Hapishane Sahnesi', delta: '+2.4%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'VIctory', progress: 50.3, fps: '1 FPS (30 FPS Menü)', gpu: 'RX 6700 XT', type: 'open', stage: 'Oynanabilir • İlk Sahne', delta: '+10.3%', url: 'https://github.com/Marvisak/VIctory' },
  { name: 'Zortos', progress: 45.0, fps: 'PC Boot', gpu: 'Bağımsız', type: 'private', stage: 'Oyun Dünyası • PC Boot', url: 'https://x.com/Zortosdev', isZortos: true },
  { name: 'XCL', progress: 35.0, fps: '30 FPS (Menü)', gpu: 'AMD / NVIDIA', type: 'open', stage: 'Ana Menü', url: 'https://github.com/xcl-dev/xcl' },
  { name: 'Five Star Recomp', progress: 30.0, fps: '30 FPS (Ara Sahne)', gpu: 'C# Katmanı', type: 'open', stage: 'Ana Menü', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'keylime', progress: 30.0, fps: '30 FPS (Vulkan)', gpu: 'C++20 / Vulkan', type: 'open', stage: 'Ana Menü', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'Xbox2Windows', progress: 25.0, fps: 'Tanılama', gpu: 'Statik Recomp', type: 'open', stage: 'İlk Kare', url: 'https://github.com/R0Y00/Xbox2Windows' },
  { name: 'Port of the Americas', progress: 25.0, fps: 'Linux / Proton', gpu: 'AMD (vkd3d)', type: 'open', stage: 'İlk Kare', url: 'https://portwatch-vi.xyz/#race', isNew: true },
  { name: 'TuxBox', progress: 20.0, fps: '4K İstem', gpu: 'Linux / Proton', type: 'open', stage: 'İlk Kare', url: 'https://github.com/brcly/TuxBox' },
  { name: 'vice-pc', progress: 12.0, fps: 'Exe Boot', gpu: 'Açık Kaynak', type: 'open', stage: 'Exe Çalışıyor', url: 'https://github.com/natedemoss/vice-pc' },
  { name: 'ScarlettCompat', progress: 10.0, fps: '113 Boot', gpu: 'AMD (C++)', type: 'open', stage: 'Exe Çalışıyor', url: 'https://portwatch-vi.xyz/#race', isNew: true },
  { name: 'XValkyrie', progress: 2.9, fps: 'Ön Aşama', gpu: 'C++ / HLSL', type: 'open', stage: 'Altyapı', url: 'https://github.com/sammwyy/xvalkyrie' },
  { name: 'AnyXboxX', progress: 2.5, fps: 'GDK Örnekleri', gpu: 'HLE Emülatör', type: 'open', stage: 'Altyapı', url: 'https://github.com/LooperSalty/AnyXboxX' },
];

const FALLBACK_BUZZ = [
  {
    source: 'Reddit',
    tag: 'r/pcmasterrace',
    titleTr: 'Lider ekip CGBJ (cool_fox) kodlarını GitHub’da açtıktan kısa süre sonra telif nedeniyle kaldırıldı; topluluk yedekleri konuşuyor.',
    titleEn: 'Leading group CGBJ (cool_fox) had its GitHub repo taken down shortly after going public.',
    url: 'https://www.reddit.com/r/pcmasterrace/comments/1y5vslq/cgbj_the_leading_gta_6_pc_modding_group_had_its/',
    alreadyTr: true,
  },
  {
    source: 'Reddit',
    tag: 'r/GTA',
    titleTr: 'GTA VI PC port oynanış klipleri ve 25-30 FPS eşiği toplulukta gündem oldu.',
    titleEn: 'GTA 6 PC port playable clips and the 25-30 FPS milestone spark discussion.',
    url: 'https://www.reddit.com/r/GTA/comments/1y5lg5r/gta_6_pc_port_already_playable/',
    alreadyTr: true,
  },
  {
    source: 'PortWatch',
    tag: 'X / Rapor',
    titleTr: 'PortWatch VI canlı yarışı: 39 girişim takip ediliyor, 17 proje oyunu başlatabiliyor.',
    titleEn: 'PortWatch VI live race: 39 efforts tracked with 17 booting GTA VI.',
    url: 'https://portwatch-vi.xyz/#news',
    alreadyTr: true,
  },
  {
    source: 'Reddit',
    tag: 'r/Piracy',
    titleTr: 'PortWatch VI takipçisi ile tüm Xbox Series recomp projeleri tek ölçekte izleniyor.',
    titleEn: 'PortWatch VI live tracker monitors all GTA VI PC recomp projects on one scale.',
    url: 'https://www.reddit.com/r/Piracy/comments/1y3wlm8/portwatchvi_a_live_tracker_of_gta_6_recomps/',
    alreadyTr: true,
  },
];

const IGNORE_NAMES = new Set([
  'overall', 'top-3', 'top3', 'watchlist', 'groundwork', 'exe', 'first', 'main',
  'in the', 'playable', 'complete', 'story', 'rendering', 'performance', 'stability',
  'loader', 'shader', 'graphics', 'proven', 'private', 'public', 'all', 'amd', 'nvidia',
]);

function decodeEntities(str) {
  return String(str || '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/·|·|•/gi, '·')
    .replace(/&/gi, '&')
    .replace(/'|'/gi, "'")
    .replace(/"/gi, '"')
    .replace(/ /gi, ' ')
    .replace(/</gi, '<')
    .replace(/>/gi, '>');
}

function stripHtml(html) {
  return decodeEntities(String(html || '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function stageFromProgress(pct) {
  if (pct >= 80) return 'Oynanabilir • Hikâye Yarısı';
  if (pct >= 50) return 'Oynanabilir';
  if (pct >= 40) return 'Oyun Dünyası';
  if (pct >= 30) return 'Ana Menü';
  if (pct >= 20) return 'İlk Kare';
  if (pct >= 10) return 'Exe Çalışıyor';
  return 'Altyapı';
}

async function translateToTr(text) {
  const clean = String(text || '').trim();
  if (!clean) return { text: '', ok: false };

  try {
    const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(clean)}`;
    const gRes = await fetch(gUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(2200),
      cache: 'no-store',
    });
    if (gRes.ok) {
      const gData = await gRes.json();
      if (Array.isArray(gData?.[0])) {
        const translated = gData[0].map((seg) => seg?.[0] || '').join('').trim();
        if (translated && translated.toLowerCase() !== clean.toLowerCase()) {
          return { text: translated, ok: true };
        }
      }
    }
  } catch {
    // Yedek çeviri servisine geç
  }

  try {
    const mUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|tr`;
    const mRes = await fetch(mUrl, {
      signal: AbortSignal.timeout(2500),
      cache: 'no-store',
    });
    if (mRes.ok) {
      const mData = await mRes.json();
      const translated = String(mData?.responseData?.translatedText || '').trim();
      if (translated && translated.toLowerCase() !== clean.toLowerCase()) {
        return { text: translated, ok: true };
      }
    }
  } catch {
    // Çeviri başarısız
  }

  return { text: clean, ok: false };
}

async function fetchRedditBuzz() {
  try {
    const res = await fetch(
      'https://www.reddit.com/search.json?q=%22GTA+VI%22+OR+%22GTA+6%22+port+PC+OR+PortWatch+OR+CGBJ&sort=new&t=week&limit=6',
      {
        headers: { 'User-Agent': 'gta6takip-bot/1.0 (+https://gta6takip.vercel.app)' },
        signal: AbortSignal.timeout(3500),
        cache: 'no-store',
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const children = json?.data?.children || [];
    const items = [];
    for (const c of children) {
      const d = c?.data;
      if (!d || d.over_18 || !d.title || !d.permalink) continue;
      const orig = String(d.title).trim();
      items.push({
        source: 'Reddit',
        tag: d.subreddit ? `r/${d.subreddit}` : 'Reddit',
        titleTr: orig,
        titleEn: orig,
        url: `https://www.reddit.com${d.permalink}`,
        alreadyTr: false,
      });
      if (items.length >= 2) break;
    }
    return items;
  } catch {
    return [];
  }
}

async function fetchRssBuzz(rssUrl, alreadyTr) {
  try {
    const res = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/1.0)' },
      signal: AbortSignal.timeout(3500),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/i);
      const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
      if (titleMatch && linkMatch) {
        const cleanTitle = decodeEntities(titleMatch[1]).replace(/\s+-\s+[^-]+$/, '').trim();
        const srcName = sourceMatch ? decodeEntities(sourceMatch[1]).trim() : 'Haber';
        items.push({
          source: 'Haber',
          tag: srcName,
          titleTr: cleanTitle,
          titleEn: cleanTitle,
          url: linkMatch[1].trim(),
          alreadyTr,
        });
      }
      if (items.length >= 3) break;
    }
    return items;
  } catch {
    return [];
  }
}

export async function GET() {
  const teams = BASE_TEAMS.map((t) => ({ ...t }));
  let totalEfforts = 39;
  let bootingCount = 17;
  let top3Avg = 88.0;

  const [pwResult, trRssBuzz, redditBuzz, enRssBuzz] = await Promise.all([
    (async () => {
      try {
        const res = await fetch('https://portwatch-vi.xyz/', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'text/html,application/xhtml+xml',
          },
          signal: AbortSignal.timeout(5000),
          cache: 'no-store',
        });
        if (!res.ok) return null;
        return await res.text();
      } catch {
        return null;
      }
    })(),
    fetchRssBuzz(
      'https://news.google.com/rss/search?q=GTA+6+PC+port+OR+PortWatch+when:7d&hl=tr&gl=TR&ceid=TR:tr',
      true
    ),
    fetchRedditBuzz(),
    fetchRssBuzz(
      'https://news.google.com/rss/search?q=GTA+6+PC+port+OR+PortWatch+OR+CGBJ+when:7d&hl=en-US&gl=US&ceid=US:en',
      false
    ),
  ]);

  if (pwResult) {
    const cleanText = stripHtml(pwResult);
    const searchable = `${cleanText} ${decodeEntities(pwResult)}`;

    const bootMatch = cleanText.match(/(\d+)\s*\/\s*(\d+)\s*Boot\s*GTA\s*VI/i);
    if (bootMatch) {
      bootingCount = Math.max(17, Number(bootMatch[1]));
      totalEfforts = Math.max(39, Number(bootMatch[2]));
    } else {
      const effMatch = cleanText.match(/(\d+)\s*Efforts\s*tracked/i);
      if (effMatch) totalEfforts = Math.max(39, Number(effMatch[1]));
    }

    const avgMatch = cleanText.match(/(\d+(?:\.\d+)?)%\s*Top-3\s*average/i);
    if (avgMatch) {
      top3Avg = Math.max(88.0, Number(avgMatch[1]));
    }

    for (const team of teams) {
      const escaped = team.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const tickerRe = new RegExp(`${escaped}\\s*[·•]\\s*(\\d+(?:\\.\\d+)?)%`, 'i');
      const cardRe = new RegExp(`${escaped}[\\s\\S]{0,180}?(\\d+(?:\\.\\d+)?)%\\s*(?:Playable|In the world|Main menu|First frame|Exe runs)`, 'i');
      const m = searchable.match(tickerRe) || cleanText.match(cardRe);
      if (m) {
        const pct = Number(m[1]);
        if (!Number.isNaN(pct) && pct > 0 && pct <= 100 && pct >= team.progress) {
          team.progress = pct;
          team.stage = stageFromProgress(pct);
        }
      }
    }

    const autoTickerRe = /\b([A-Za-z][A-Za-z0-9_.-]{2,24})\s*[·•]\s*(\d+(?:\.\d+)?)%/g;
    let m;
    while ((m = autoTickerRe.exec(cleanText)) !== null) {
      const candidateName = m[1].trim();
      const pct = Number(m[2]);
      if (Number.isNaN(pct) || pct < 10 || pct > 100) continue;
      if (IGNORE_NAMES.has(candidateName.toLowerCase())) continue;
      if (!teams.some((t) => t.name.toLowerCase() === candidateName.toLowerCase())) {
        teams.push({
          name: candidateName,
          progress: pct,
          fps: 'PortWatch Canlı',
          gpu: 'Yeni Ekip',
          type: 'open',
          stage: stageFromProgress(pct),
          url: 'https://portwatch-vi.xyz/#race',
          isNew: true,
        });
      }
    }
  }

  teams.sort((a, b) => b.progress - a.progress);

  const leader = teams[0] || BASE_TEAMS[0];
  const openLeader = teams.find((t) => t.type === 'open') || leader;
  const leaderFpsClean = String(leader.fps || '').replace(/\s*\(([^)]+)\)/g, ' · $1');

  const news = [
    {
      tagTr: 'REKOR',
      tagEn: 'RECORD',
      tr: `${leader.name} %${leader.progress} ile lider (${leaderFpsClean}) ve kodlarını GitHub'da açtı!`,
      en: `${leader.name} leads at ${leader.progress}% (${leaderFpsClean}) and went open source on GitHub!`,
    },
    {
      tagTr: 'AÇIK KAYNAK',
      tagEn: 'OPEN SOURCE',
      tr: `Açık kaynak lideri ${openLeader.name} (%${openLeader.progress}); AvatarManz (%83.1) ve Belobug (%79) takipte.`,
      en: `${openLeader.name} (${openLeader.progress}%) leads open source; AvatarManz (83.1%) & Belobug (79%) follow.`,
    },
    {
      tagTr: 'GÜNCEL',
      tagEn: 'LIVE',
      tr: `PortWatch üzerinde ${totalEfforts} girişim takip ediliyor; ${bootingCount}'si oyunu başlatabiliyor (İlk 3 ort. %${top3Avg}).`,
      en: `${totalEfforts} total efforts tracked on PortWatch, with ${bootingCount} booting GTA VI (Top-3 avg ${top3Avg}%).`,
    },
  ];

  const foreignCandidates = [...redditBuzz, ...enRssBuzz].slice(0, 4);
  const translatedForeign = await Promise.all(
    foreignCandidates.map(async (item) => {
      const res = await translateToTr(item.titleEn);
      if (!res.ok) return null;
      return {
        source: item.source,
        tag: item.tag,
        titleTr: res.text,
        titleEn: item.titleEn,
        url: item.url,
        alreadyTr: true,
      };
    })
  );

  const validTranslated = translatedForeign.filter(Boolean);
  const combinedBuzz = [...trRssBuzz, ...validTranslated, ...FALLBACK_BUZZ];
  const seenUrls = new Set();
  const buzz = [];
  for (const item of combinedBuzz) {
    if (!item?.url || seenUrls.has(item.url)) continue;
    seenUrls.add(item.url);
    buzz.push({
      source: item.source,
      tag: item.tag,
      titleTr: item.titleTr,
      titleEn: item.titleEn,
      url: item.url,
    });
    if (buzz.length >= 4) break;
  }

  return NextResponse.json(
    {
      updatedAt: new Date().toISOString(),
      totalEfforts,
      bootingCount,
      top3Avg,
      teams,
      news,
      buzz,
    },
    {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}
