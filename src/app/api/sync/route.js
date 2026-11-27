import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TRACKER_URLS = [
  'https://portwatch-vi.xyz/data/tracker.json',
  'https://raw.githubusercontent.com/4lwayz/portwatch-vi/main/data/tracker.json',
];

const SCARLETT_REPO = 'ZigZagBoi1/ScarlettPort';
const SLAKTARN_REPO = 'Slaktarn700/SlaktarnVI';
const GH_CACHE_TTL_MS = 5 * 60 * 1000;
let scarlettCache = { ts: 0, data: null };
let slaktarnCache = { ts: 0, data: null };

function computePortWatchScore(effort) {
  const g = effort?.gta || {};
  const base =
    (Number(g.loads) || 0) +
    (Number(g.boots) || 0) +
    (Number(g.menu) || 0) +
    (Number(g.world) || 0) +
    (Number(g.playable) || 0);

  if (base <= 0) {
    const gw = effort?.groundwork || {};
    const gwAvg =
      ((Number(gw.loader) || 0) +
        (Number(gw.shaders) || 0) +
        (Number(gw.graphics) || 0) +
        (Number(gw.proven) || 0)) /
      4;
    return Math.round(gwAvg * 10 * 10) / 10;
  }

  let score = base * 10;
  if ((Number(g.playable) || 0) >= 1) {
    const story = Math.min(1, Math.max(0, Number(g.story) || 0));
    const render = Math.min(1, Math.max(0, Number(g.render) || 0));
    const fpsNum = Math.max(0, Number(g.fps) || 0);
    const fpsNorm = Math.min(1, fpsNum / 30);
    const stab =
      typeof g.stability === 'number' && !Number.isNaN(g.stability)
        ? Math.min(1, Math.max(0, g.stability))
        : 0;
    score += story * 17.5 + render * 12.5 + fpsNorm * 10 + stab * 10;
  }

  return Math.min(100, Math.round(score * 10) / 10);
}

function buildStageTr(effort, pct) {
  const g = effort?.gta || {};
  const storyPct = Math.round((Number(g.story) || 0) * 100);
  if ((Number(g.playable) || 0) >= 1) {
    if (storyPct >= 75) return `Oynanabilir • Hikâye %${storyPct}`;
    if (storyPct >= 50) return 'Oynanabilir • Hikâye Yarısı';
    if (storyPct > 0) return 'Oynanabilir • İlk Perde';
    return 'Oynanabilir';
  }
  if (pct >= 40) return 'Oyun Dünyası';
  if (pct >= 30) return 'Ana Menü';
  if (pct >= 20) return 'İlk Kare';
  if (pct >= 10) return 'Exe Çalışıyor';
  return 'Altyapı';
}

function buildFpsLabel(effort) {
  const g = effort?.gta || {};
  const fpsNum = Number(g.fps) || 0;
  if (fpsNum > 0) return `${fpsNum} FPS`;
  if ((Number(g.menu) || 0) >= 1) return 'Ana Menü';
  if ((Number(g.boots) || 0) >= 1) return 'PC Boot';
  if ((Number(g.loads) || 0) >= 1) return 'Exe Boot';
  return 'Ön Aşama';
}

function buildTurkishSummary(effort, progress, fps, gpu) {
  const g = effort?.gta || {};
  const storyPct = Math.round((Number(g.story) || 0) * 100);
  const renderPct = Math.round((Number(g.render) || 0) * 100);
  const repoNote = effort.repo
    ? effort.stats?.missing
      ? 'GitHub deposu şu an erişilemiyor (404).'
      : `Açık kaynak (${effort.repo}).`
    : 'Kapalı/özel geliştirme yapısı.';
  const detailParts = [];
  if (storyPct > 0) detailParts.push(`hikâye ilerlemesi %${storyPct}`);
  if (renderPct > 0) detailParts.push(`görüntü kalitesi %${renderPct}`);
  const detailStr = detailParts.length > 0 ? ` (${detailParts.join(', ')})` : '';
  return `${effort.name} şu an %${progress} ile yarışta · ${fps} · ${gpu}${detailStr}. ${repoNote}`;
}

function estimateScarlettFromReadme(readmeText) {
  const text = String(readmeText || '');
  const lower = text.toLowerCase();

  let score = 40;
  const litWorld = /lit world[^\n]*✅/i.test(text) || lower.includes('lit world renders');
  const playableVerified = /playable[^\n]*✅/i.test(text) && !lower.includes('not yet verified playable');
  const shadowedDone = /shadowed areas[^\n]*✅/i.test(text);

  let fpsVal = 4;
  let fpsLabel = '4 FPS (RTX 3060)';
  const worldFpsMatch =
    text.match(/lit world[^.\n]*?(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\s*fps/i) ||
    text.match(/speed:\s*about\s*(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\s*fps/i);

  if (worldFpsMatch) {
    const low = Number(worldFpsMatch[1]) || 3;
    const high = Number(worldFpsMatch[2]) || low;
    fpsVal = high;
    fpsLabel = low === high ? `${high} FPS` : `${low}-${high} FPS`;
  }

  if (playableVerified) {
    score = 50 + Math.min(1, fpsVal / 30) * 10 + (shadowedDone ? 12 : 8) + 6;
  } else {
    if (litWorld) score += 6;
    if (shadowedDone) score += 4;
    score += Math.min(6, (fpsVal / 30) * 6);
  }

  const progress = Math.min(95, Math.round(score * 10) / 10);
  const stage = playableVerified
    ? 'Oynanabilir • Hazır Launcher'
    : 'Oyun Dünyası • Hazır Launcher';

  return { progress, fps: fpsLabel, stage };
}

async function fetchScarlettPortLive() {
  const now = Date.now();
  if (scarlettCache.data && now - scarlettCache.ts < GH_CACHE_TTL_MS) {
    return scarlettCache.data;
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/2.0)',
    Accept: 'application/vnd.github+json',
  };

  let repoInfo = null;
  let releaseInfo = null;
  let readmeText = '';

  const [repoRes, relRes, readmeRes] = await Promise.allSettled([
    fetch(`https://api.github.com/repos/${SCARLETT_REPO}`, {
      headers,
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    }),
    fetch(`https://api.github.com/repos/${SCARLETT_REPO}/releases/latest`, {
      headers,
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    }),
    fetch(`https://raw.githubusercontent.com/${SCARLETT_REPO}/main/README.md?t=${now}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/2.0)' },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    }),
  ]);

  if (repoRes.status === 'fulfilled' && repoRes.value.ok) {
    repoInfo = await repoRes.value.json().catch(() => null);
  }
  if (relRes.status === 'fulfilled' && relRes.value.ok) {
    releaseInfo = await relRes.value.json().catch(() => null);
  }
  if (readmeRes.status === 'fulfilled' && readmeRes.value.ok) {
    readmeText = await readmeRes.value.text().catch(() => '');
  }

  const est = estimateScarlettFromReadme(readmeText);
  const releaseTag = releaseInfo?.tag_name || 'v0.5.3';
  const stars = Number(repoInfo?.stargazers_count) || 1007;
  const updatedAt =
    releaseInfo?.published_at || repoInfo?.pushed_at || new Date().toISOString();

  const result = {
    name: 'ScarlettPort',
    progress: est.progress,
    fps: est.fps,
    gpu: 'AMD / NVIDIA',
    type: 'open',
    stage: est.stage,
    delta: '',
    url: `https://github.com/${SCARLETT_REPO}`,
    repo: SCARLETT_REPO,
    tier: 'tracked',
    updatedAt,
    releaseTag,
    stars,
    commits7d: 0,
    verification: 'self-reported',
    approach: 'Compatibility layer (VIctory + XCL)',
    isEstimated: true,
    hasLauncher: true,
    platformTag: '',
    highlights: [
      'Derleme gerektirmeyen hazır Windows başlatıcısı (ScarlettPort.exe) ve runtime paketi',
      'VIctory + XCL çalışma zamanlarını tek yapıda birleştiriyor; klavye/fare ve DualSense desteği var',
      'RTX 3060 (Series S profili) ile 3–4 FPS ışıklı dünya, topluluk RX 9060 XT testlerinde 22 FPS medyan',
    ],
    blockers: [
      'Gölgeli alanlar henüz karanlık ve ışın izleme (ray tracing) aktif değil',
      'Uzun süreli kararlılık ve tam hikâye oynanışı henüz bağımsız doğrulanmadı',
    ],
    summaryTr: `ScarlettPort (${releaseTag}), kaynak kod derlemeye gerek kalmadan hazır Windows başlatıcısı (ScarlettPort.exe) sunan ilk açık kaynak GTA VI PC port katmanı. VIctory + XCL altyapısını birleştiriyor; RTX 3060'ta 3–4 FPS, topluluk testlerinde RX 9060 XT ile 22 FPS'e kadar ulaşıyor.`,
    summaryEn: `ScarlettPort (${releaseTag}) is the first open-source GTA VI PC port layer shipping a prebuilt Windows launcher (ScarlettPort.exe) combining VIctory + XCL runtimes.`,
    isZortos: false,
  };

  scarlettCache = { ts: now, data: result };
  return result;
}

function estimateSlaktarnFromReadme(readmeText) {
  const text = String(readmeText || '');
  const lower = text.toLowerCase();

  let fpsLow = 19;
  let fpsHigh = 25;
  const fpsRangeMatch = text.match(/(\d{2})\s*[-–]\s*(\d{2})\s*fps/i);
  if (fpsRangeMatch) {
    fpsLow = Number(fpsRangeMatch[1]) || 19;
    fpsHigh = Number(fpsRangeMatch[2]) || 25;
  }

  const has30Steady = /steady\s*30\s*(?:real\s*)?fps[^.\n]*fixed/i.test(lower);
  const hasRt =
    lower.includes('ray tracing') &&
    !lower.includes('no ray tracing') &&
    !lower.includes('off until 30');

  let score = 50 + 0.5 * 17.5 + 0.7 * 12.5 + Math.min(1, fpsHigh / 30) * 10 + 0.45 * 10;
  if (has30Steady) score += 4;
  if (hasRt) score += 2.5;

  const progress = Math.min(84, Math.round(score * 10) / 10);
  const fps = fpsLow === fpsHigh ? `${fpsHigh} FPS` : `${fpsLow}-${fpsHigh} FPS`;
  const stage = 'Oynanabilir • Linux / Proton';
  return { progress, fps, stage };
}

async function fetchSlaktarnLive() {
  const now = Date.now();
  if (slaktarnCache.data && now - slaktarnCache.ts < GH_CACHE_TTL_MS) {
    return slaktarnCache.data;
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/2.0)',
    Accept: 'application/vnd.github+json',
  };

  let repoInfo = null;
  let readmeText = '';

  const [repoRes, readmeRes] = await Promise.allSettled([
    fetch(`https://api.github.com/repos/${SLAKTARN_REPO}`, {
      headers,
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    }),
    fetch(`https://raw.githubusercontent.com/${SLAKTARN_REPO}/main/README.md?t=${now}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/2.0)' },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    }),
  ]);

  if (repoRes.status === 'fulfilled' && repoRes.value.ok) {
    repoInfo = await repoRes.value.json().catch(() => null);
  }
  if (readmeRes.status === 'fulfilled' && readmeRes.value.ok) {
    readmeText = await readmeRes.value.text().catch(() => '');
  }

  const est = estimateSlaktarnFromReadme(readmeText);
  const stars = Number(repoInfo?.stargazers_count) || 92;
  const updatedAt = repoInfo?.pushed_at || new Date().toISOString();

  const result = {
    name: 'SlaktarnVI',
    progress: est.progress,
    fps: est.fps,
    gpu: 'AMD',
    type: 'open',
    stage: est.stage,
    delta: '',
    url: `https://github.com/${SLAKTARN_REPO}`,
    repo: SLAKTARN_REPO,
    tier: 'tracked',
    updatedAt,
    releaseTag: '',
    stars,
    commits7d: 0,
    verification: 'self-reported',
    approach: 'Compatibility layer (VIctory / Proton)',
    isEstimated: true,
    hasLauncher: false,
    platformTag: 'Linux / Proton',
    highlights: [
      'Linux / Steam Proton üzerinde AMD Radeon RX 9070 XT (1440p, FSR 4 Quality + Frame Generation)',
      'Soygun görevindeki 3 FPS düşüşü, karakter uzama hatası ve yüz/kıyafet doku bozulmaları giderildi',
      'GPL-3.0 açık kaynak; Belobug, AvatarManz, DexNom ve fxceless değişikliklerini birleştiriyor',
    ],
    blockers: [
      'Yalnızca tek bir Linux makinesinde test edildi; Windows üzerinde henüz doğrulanmadı',
      'Hedef sabit 30 gerçek FPS ve ray tracing henüz kapalı',
    ],
    summaryTr: `SlaktarnVI (Valhalla), Linux / Steam Proton üzerinde AMD RX 9070 XT için optimize edilen açık kaynak VIctory forku (FSR 4 + Frame Generation, 19–25 FPS).`,
    summaryEn: `SlaktarnVI (Valhalla) is an open-source VIctory fork tuned for Linux/Steam Proton on AMD RX 9070 XT (FSR 4 + Frame Generation, 19–25 FPS).`,
    isZortos: false,
  };

  slaktarnCache = { ts: now, data: result };
  return result;
}

async function fetchTrackerJson() {
  const bust = Date.now();
  for (const baseUrl of TRACKER_URLS) {
    try {
      const res = await fetch(`${baseUrl}?t=${bust}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/2.0)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(7000),
        cache: 'no-store',
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data?.efforts) && data.efforts.length > 0) {
        return data;
      }
    } catch {
      // Yedek kaynağa geç
    }
  }
  return null;
}

export async function GET() {
  const [tracker, scarlettLive, slaktarnLive] = await Promise.all([
    fetchTrackerJson(),
    fetchScarlettPortLive().catch(() => null),
    fetchSlaktarnLive().catch(() => null),
  ]);

  if (!tracker) {
    return NextResponse.json(
      { error: 'PortWatch tracker.json unreachable', liveSource: 'fallback' },
      { status: 503 }
    );
  }

  const allEfforts = tracker.efforts;
  const totalEfforts = allEfforts.length;
  const bootingCount = allEfforts.filter(
    (e) => (Number(e?.gta?.boots) || 0) >= 1
  ).length;

  // Canlı DMCA / kaldırılan repo kayıtları (otomatik)
  const dmcaItems = allEfforts
    .filter((e) => Boolean(e?.nuked || e?.stats?.dmca))
    .map((e) => ({
      name: e.name,
      date: e?.stats?.dmca?.date || e?.nuked?.at || '',
      note: e?.nuked?.note || (e?.stats?.dmca ? 'Take-Two DMCA bildirimiyle GitHub üzerinden devre dışı bırakıldı.' : 'GitHub deposu kaldırıldı (404).'),
      url: e?.stats?.dmca?.url || '',
    }))
    .slice(0, 6);

  let mappedTeams = allEfforts
    .filter((effort) => !effort?.nuked && !effort?.stats?.missing)
    .map((effort) => {
      const progress = computePortWatchScore(effort);
      const isOpen = Boolean(effort.repo);
      const gpu =
        Array.isArray(effort.gpu) && effort.gpu.length > 0
          ? effort.gpu.join(' / ')
          : effort.approach || (isOpen ? 'Açık Kaynak' : 'Özel Yapı');
      const fps = buildFpsLabel(effort);
      const url = isOpen
        ? `https://github.com/${effort.repo}`
        : effort.proof?.url || 'https://portwatch-vi.xyz/#race';

      return {
        name: effort.name,
        progress,
        fps,
        gpu,
        type: isOpen ? 'open' : 'private',
        stage: buildStageTr(effort, progress),
        delta: '',
        url,
        repo: effort.repo || undefined,
        tier: effort.tier || 'watchlist',
        updatedAt: effort.stats?.pushedAt || effort.assessedAt || tracker.updated || '',
        stars: Number(effort.stats?.stars) || 0,
        commits7d: Number(effort.stats?.commits7d) || 0,
        verification: effort.verification || '',
        approach: effort.approach || '',
        highlights: Array.isArray(effort.highlights) ? effort.highlights.slice(0, 6) : [],
        blockers: Array.isArray(effort.blockers) ? effort.blockers.slice(0, 5) : [],
        summaryTr: buildTurkishSummary(effort, progress, fps, gpu),
        summaryEn: effort.summary || `${effort.name} leads at ${progress}% (${fps}, ${gpu}).`,
        isZortos: String(effort.name || '').toLowerCase() === 'zortos',
        isEstimated: false,
        hasLauncher: String(effort.repo || '').toLowerCase() === SCARLETT_REPO.toLowerCase(),
        platformTag: String(effort.repo || '').toLowerCase() === SLAKTARN_REPO.toLowerCase() ? 'Linux / Proton' : '',
      };
    })
    .filter((t) => t.tier === 'tracked' || t.progress >= 2.5);

  let featuredPort = scarlettLive;
  const existingScarlettIdx = mappedTeams.findIndex(
    (t) =>
      String(t.repo || '').toLowerCase() === SCARLETT_REPO.toLowerCase() ||
      String(t.name || '').toLowerCase() === 'scarlettport'
  );

  if (existingScarlettIdx >= 0) {
    const official = mappedTeams[existingScarlettIdx];
    featuredPort = {
      ...official,
      releaseTag: scarlettLive?.releaseTag || 'v0.5.3',
      stars: scarlettLive?.stars || official.stars || 1007,
      isEstimated: false,
      hasLauncher: true,
      summaryTr: scarlettLive?.summaryTr || official.summaryTr,
      summaryEn: scarlettLive?.summaryEn || official.summaryEn,
    };
    mappedTeams[existingScarlettIdx] = {
      ...official,
      releaseTag: featuredPort.releaseTag,
      hasLauncher: true,
    };
  } else if (scarlettLive) {
    mappedTeams.push(scarlettLive);
  }

  if (slaktarnLive) {
    const existingSlaktarnIdx = mappedTeams.findIndex(
      (t) =>
        String(t.repo || '').toLowerCase() === SLAKTARN_REPO.toLowerCase() ||
        String(t.name || '').toLowerCase() === 'slaktarnvi'
    );
    if (existingSlaktarnIdx >= 0) {
      mappedTeams[existingSlaktarnIdx] = {
        ...mappedTeams[existingSlaktarnIdx],
        platformTag: 'Linux / Proton',
      };
    } else {
      mappedTeams.push(slaktarnLive);
    }
  }

  mappedTeams = mappedTeams.sort((a, b) => b.progress - a.progress);

  const top3 = mappedTeams.slice(0, 3);
  const top3Avg =
    top3.length > 0
      ? Math.round((top3.reduce((acc, t) => acc + t.progress, 0) / top3.length) * 10) / 10
      : 0;

  const leader = mappedTeams[0];
  const openTeams = mappedTeams.filter((t) => t.type === 'open');
  const openLeader = openTeams[0] || leader;
  const openRunner1 = openTeams[1];
  const openRunner2 = openTeams[2];

  const runnerTr =
    openRunner1 && openRunner2
      ? `${openRunner1.name} (%${openRunner1.progress}) ve ${openRunner2.name} (%${openRunner2.progress}) takipte.`
      : 'Açık kaynak yarışında ekipler hızla ilerliyor.';
  const runnerEn =
    openRunner1 && openRunner2
      ? `${openRunner1.name} (${openRunner1.progress}%) & ${openRunner2.name} (${openRunner2.progress}%) follow.`
      : 'Open-source teams are rapidly advancing.';

  const news = leader
    ? [
        {
          tagTr: 'REKOR',
          tagEn: 'RECORD',
          tr: `${leader.name} %${leader.progress} ile yeni genel lider (${leader.fps} · ${leader.gpu})!`,
          en: `${leader.name} leads overall at ${leader.progress}% (${leader.fps} · ${leader.gpu})!`,
        },
        {
          tagTr: 'AÇIK KAYNAK',
          tagEn: 'OPEN SOURCE',
          tr: `Açık kaynak lideri ${openLeader.name} (%${openLeader.progress}); ${runnerTr}`,
          en: `${openLeader.name} (${openLeader.progress}%) leads open source; ${runnerEn}`,
        },
        {
          tagTr: 'GÜNCEL',
          tagEn: 'LIVE',
          tr: `PortWatch üzerinde ${totalEfforts} girişim takip ediliyor; ${bootingCount} proje oyunu başlatabiliyor (İlk 3 ort. %${top3Avg}).`,
          en: `${totalEfforts} total efforts tracked on PortWatch, with ${bootingCount} booting GTA VI (Top-3 avg ${top3Avg}%).`,
        },
      ]
    : [];

  return NextResponse.json(
    {
      liveSource: 'portwatch-tracker-json',
      updatedAt: tracker.updated || new Date().toISOString(),
      totalEfforts,
      bootingCount,
      top3Avg,
      teams: mappedTeams,
      featuredPort,
      dmcaItems,
      news,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=180',
      },
    }
  );
}
