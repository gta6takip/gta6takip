import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const TRACKER_URLS = [
  'https://portwatch-vi.xyz/data/tracker.json',
  'https://raw.githubusercontent.com/4lwayz/portwatch-vi/main/data/tracker.json',
];

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
  return `${effort.name} şu an %${progress} ile genel lider · ${fps} · ${gpu}${detailStr}. ${repoNote}`;
}

async function fetchTrackerJson() {
  const bust = Date.now();
  for (const baseUrl of TRACKER_URLS) {
    try {
      const res = await fetch(`${baseUrl}?t=${bust}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/1.1)',
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
  const tracker = await fetchTrackerJson();

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

  const mappedTeams = allEfforts
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
        summaryTr: buildTurkishSummary(effort, progress, fps, gpu),
        summaryEn: effort.summary || `${effort.name} leads at ${progress}% (${fps}, ${gpu}).`,
        isZortos: String(effort.name || '').toLowerCase() === 'zortos',
      };
    })
    .filter((t) => t.tier === 'tracked' || t.progress >= 2.5)
    .sort((a, b) => b.progress - a.progress);

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
      news,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
