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
    summaryTr: 'Ara sahnelerde 30 FPS, oyun içinde ortalama 25 FPS (10 GB RAM / 16 GB VRAM). Hikâyenin yarısı oynanabilir (GitHub deposu şu an 404 / kaldırılmış durumda).',
    summaryEn: '30 FPS in cutscenes, 25 FPS average in gameplay (10 GB RAM / 16 GB VRAM). Half the story playable (GitHub repo currently returns 404).',
  },
  { name: 'NotNozy', progress: 87.8, fps: '16 FPS', gpu: 'AMD (Rumble)', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+26.8%', url: 'https://portwatch-vi.xyz/#race', isNew: true },
  { name: 'darkworldhm', progress: 84.8, fps: '15-24 FPS', gpu: 'RTX 50 Serisi', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+23.8%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'Doomsday', progress: 84.0, fps: '4 FPS', gpu: 'AMD / NVIDIA', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+19.5%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'AvatarManz', progress: 83.1, fps: '16 FPS (13-22 FPS)', gpu: 'RX 7900 XTX', type: 'open', stage: 'Oynanabilir • İlk Perde (Sesli)', delta: '+23.1%', url: 'https://github.com/avatarmanz/VIctory-7900XTX' },
  { name: 'Belobug', progress: 79.0, fps: '8 FPS', gpu: 'RX 9070 XT', type: 'open', stage: 'Oynanabilir • İlk Perde (RT)', delta: '+10.7%', url: 'https://github.com/Belobug/VIctory-Belobug-AMD' },
  { name: 'DexNom', progress: 78.0, fps: '3 FPS', gpu: 'RX 7900 XTX', type: 'open', stage: 'Oynanabilir • İlk Perde', delta: '+12.0%', url: 'https://github.com/DexNom/VIctory' },
  { name: 'suri', progress: 75.0, fps: '3 FPS', gpu: 'Özel Yapı', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+14.0%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'Kelvaroq', progress: 68.8, fps: '10 FPS', gpu: 'NVIDIA', type: 'open', stage: 'Oynanabilir', url: 'https://github.com/fablinoo/kelvaroq', repo: 'fablinoo/kelvaroq', isNew: true },
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

const IGNORE_NAMES = new Set([
  'overall', 'top-3', 'top3', 'watchlist', 'groundwork', 'exe', 'first', 'main',
  'in the', 'playable', 'complete', 'story', 'rendering', 'performance', 'stability',
  'loader', 'shader', 'graphics', 'proven', 'private', 'public', 'all', 'amd', 'nvidia',
  'the race', 'leaderboard', 'progress', 'stars', 'recently active',
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

function upsertTeam(teams, candidate) {
  const cleanName = String(candidate.name || '').trim();
  const pct = Number(candidate.progress);
  if (!cleanName || cleanName.length < 2 || cleanName.length > 32) return;
  if (Number.isNaN(pct) || pct < 10 || pct > 100) return;
  if (IGNORE_NAMES.has(cleanName.toLowerCase())) return;

  const existing = teams.find(
    (t) =>
      t.name.toLowerCase() === cleanName.toLowerCase() ||
      (candidate.repo && t.repo && t.repo.toLowerCase() === candidate.repo.toLowerCase())
  );

  if (existing) {
    if (pct > existing.progress) {
      existing.progress = pct;
      existing.stage = stageFromProgress(pct);
    }
    if (candidate.url && existing.url === 'https://portwatch-vi.xyz/#race') {
      existing.url = candidate.url;
    }
    return;
  }

  teams.push({
    name: cleanName,
    progress: pct,
    fps: candidate.fps || 'PortWatch Canlı',
    gpu: candidate.gpu || (candidate.type === 'private' ? 'Özel Yapı' : 'Açık Kaynak'),
    type: candidate.type === 'private' ? 'private' : 'open',
    stage: stageFromProgress(pct),
    url: candidate.url || 'https://portwatch-vi.xyz/#race',
    repo: candidate.repo || undefined,
    isNew: true,
  });
}

export async function GET() {
  const teams = BASE_TEAMS.map((t) => ({ ...t }));
  let totalEfforts = 40;
  let bootingCount = 18;
  let top3Avg = 88.0;

  try {
    const res = await fetch('https://portwatch-vi.xyz/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(5500),
      cache: 'no-store',
    });

    if (res.ok) {
      const rawHtml = await res.text();
      const cleanText = stripHtml(rawHtml);
      const decodedRaw = decodeEntities(rawHtml);

      const bootMatch =
        cleanText.match(/(\d+)\s*\/\s*(\d+)\s*Boot\s*GTA\s*VI/i) ||
        cleanText.match(/Boot\s*GTA\s*VI\s*[:·-]?\s*(\d+)\s*\/\s*(\d+)/i);
      if (bootMatch) {
        bootingCount = Math.max(18, Number(bootMatch[1]));
        totalEfforts = Math.max(40, Number(bootMatch[2]));
      } else {
        const effMatch =
          cleanText.match(/(\d+)\s*Efforts?\s*tracked/i) ||
          cleanText.match(/Efforts?\s*tracked\s*[:·-]?\s*(\d+)/i);
        if (effMatch) totalEfforts = Math.max(40, Number(effMatch[1]));
      }

      const avgMatch = cleanText.match(/(\d+(?:\.\d+)?)%\s*Top-3\s*average/i);
      if (avgMatch) {
        top3Avg = Math.max(88.0, Number(avgMatch[1]));
      }

      for (const team of teams) {
        const escaped = team.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const tickerRe = new RegExp(`${escaped}\\s*[·•]\\s*(\\d+(?:\\.\\d+)?)%`, 'i');
        const cardRe = new RegExp(
          `${escaped}[\\s\\S]{0,180}?(\\d+(?:\\.\\d+)?)%\\s*(?:Playable|In the world|Main menu|First frame|Exe runs)`,
          'i'
        );
        const m = decodedRaw.match(tickerRe) || cleanText.match(cardRe);
        if (m) {
          const pct = Number(m[1]);
          if (!Number.isNaN(pct) && pct > 0 && pct <= 100 && pct >= team.progress) {
            team.progress = pct;
            team.stage = stageFromProgress(pct);
          }
        }
      }

      const repoCardRe =
        /\b\d{1,2}\s+([A-Za-z][A-Za-z0-9_.\- ]{1,24}?)\s+([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\s+(\d+(?:\.\d+)?)%\s*(?:Playable|In the world|Main menu|First frame|Exe runs)/gi;
      let rm;
      while ((rm = repoCardRe.exec(cleanText)) !== null) {
        upsertTeam(teams, {
          name: rm[1],
          repo: rm[2],
          url: `https://github.com/${rm[2]}`,
          progress: rm[3],
          type: 'open',
        });
      }

      const autoTickerRe = /\b([A-Za-z][A-Za-z0-9_.-]{2,24})\s*[·•]\s*(\d+(?:\.\d+)?)%/g;
      let tm;
      while ((tm = autoTickerRe.exec(cleanText)) !== null) {
        upsertTeam(teams, {
          name: tm[1],
          progress: tm[2],
          type: 'open',
        });
      }

      const scriptJsonRe =
        /"name"\s*:\s*"([A-Za-z][A-Za-z0-9_.\- ]{1,26})"[^}]{0,220}?"(?:progress|score|pct)"\s*:\s*(\d+(?:\.\d+)?)/g;
      let sm;
      while ((sm = scriptJsonRe.exec(decodedRaw)) !== null) {
        upsertTeam(teams, {
          name: sm[1],
          progress: sm[2],
          type: 'open',
        });
      }
    }
  } catch {
    // Bağlantı zaman aşımında mevcut BASE_TEAMS korunur
  }

  teams.sort((a, b) => b.progress - a.progress);

  const leader = teams[0] || BASE_TEAMS[0];
  const openLeader = teams.find((t) => t.type === 'open') || leader;
  const leaderFpsTr = String(leader.fps || '').replace(/\s*\(([^)]+)\)/g, ' · $1');
  const leaderFpsEn = leaderFpsTr
    .replace(/Ara Sahne/gi, 'Cutscenes')
    .replace(/Menü/gi, 'Menu');

  const news = [
    {
      tagTr: 'REKOR',
      tagEn: 'RECORD',
      tr: `${leader.name} %${leader.progress} ile lider (${leaderFpsTr}) ve kodlarını GitHub'da açtı!`,
      en: `${leader.name} leads at ${leader.progress}% (${leaderFpsEn}) and went open source on GitHub!`,
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
      tr: `PortWatch üzerinde ${totalEfforts} girişim takip ediliyor; ${bootingCount} proje oyunu başlatabiliyor (İlk 3 ort. %${top3Avg}).`,
      en: `${totalEfforts} total efforts tracked on PortWatch, with ${bootingCount} booting GTA VI (Top-3 avg ${top3Avg}%).`,
    },
  ];

  return NextResponse.json(
    {
      updatedAt: new Date().toISOString(),
      totalEfforts,
      bootingCount,
      top3Avg,
      teams,
      news,
    },
    {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}
