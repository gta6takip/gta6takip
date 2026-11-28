import { NextResponse } from 'next/server';
import { translateBatchToTurkish } from '../../../lib/translate';

const TRACKER_URL = 'https://portwatch-vi.xyz/data/tracker.json';
const SCARLETT_REPO = 'ZigZagBoi1/ScarlettPort';
const SLAKTARN_REPO = 'Slaktarn700/SlaktarnVI';

const DMCA_KEYWORDS = /dmca|takedown|telif|kaldırıl|nuked|take-two|take two|hukuki|dava|cease/i;

function decodeHtmlEntities(str = '') {
  return String(str)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTag(block, tag) {
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = block.match(regex);
  return match ? decodeHtmlEntities(match[1]) : '';
}

function parseRssItems(xml, defaultSource = 'Google News', category = 'press') {
  if (!xml || typeof xml !== 'string') return [];
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const rawTitle = extractTag(block, 'title');
    const link = extractTag(block, 'link');
    const pubDateStr = extractTag(block, 'pubDate');
    const source = extractTag(block, 'source') || defaultSource;
    if (!rawTitle || !link) continue;

    // Strip trailing " - Source Name" from Google News titles
    let title = rawTitle;
    if (source && rawTitle.endsWith(` - ${source}`)) {
      title = rawTitle.slice(0, -(` - ${source}`.length)).trim();
    } else {
      const dashIdx = rawTitle.lastIndexOf(' - ');
      if (dashIdx > 24 && rawTitle.length - dashIdx < 42) {
        title = rawTitle.slice(0, dashIdx).trim();
      }
    }

    const parsedDate = pubDateStr ? new Date(pubDateStr) : new Date();
    const publishedAt = Number.isNaN(parsedDate.getTime())
      ? new Date().toISOString()
      : parsedDate.toISOString();

    const finalCategory = DMCA_KEYWORDS.test(title) ? 'dmca' : category;

    items.push({
      id: `${finalCategory}-${Buffer.from(link).toString('base64').slice(0, 18)}`,
      category: finalCategory,
      title,
      summary: '',
      source,
      url: link,
      publishedAt,
    });
  }
  return items;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 4500, revalidateSec = 300) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      next: { revalidate: revalidateSec },
    });
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchGoogleNews(lang) {
  const isTr = lang === 'tr';
  const query = isTr
    ? '"GTA 6" (PC OR port OR kırıldı OR DMCA OR ScarlettPort OR çıkış)'
    : '"GTA 6" OR "GTA VI" ("PC port" OR ScarlettPort OR PortWatch OR "Take-Two" DMCA OR SlaktarnVI)';
  const locale = isTr ? 'hl=tr&gl=TR&ceid=TR:tr' : 'hl=en-US&gl=US&ceid=US:en';
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&${locale}`;

  const res = await fetchWithTimeout(
    url,
    { headers: { 'User-Agent': 'GTA6TakipNewsBot/2.0' } },
    4500
  );
  if (!res) return [];
  const xml = await res.text();
  return parseRssItems(xml, isTr ? 'Oyun Basını' : 'Gaming Press', 'press').slice(0, 10);
}

async function fetchRedditCommunityNews(lang) {
  const query = 'site:reddit.com/r/GTA6 OR site:reddit.com/r/pcgaming ("GTA 6" OR "GTA VI") (port OR ScarlettPort OR PortWatch OR DMCA)';
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;

  const res = await fetchWithTimeout(
    url,
    { headers: { 'User-Agent': 'GTA6TakipNewsBot/4.1' } },
    4000,
    600
  );
  if (!res) return [];
  const xml = await res.text();
  const items = parseRssItems(xml, 'Reddit (r/GTA6)', 'community').slice(0, 5);
  if (lang === 'tr' && items.length > 0) {
    const titles = items.map((i) => i.title);
    const trMap = await translateBatchToTurkish(titles).catch(() => new Map());
    return items.map((i) => ({ ...i, title: trMap.get(i.title) || i.title }));
  }
  return items;
}

async function fetchLivePortAndGitHubEvents(lang) {
  const isTr = lang === 'tr';
  const ghHeaders = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'GTA6TakipNewsBot/4.1',
  };
  const ghToken = (process.env.GITHUB_TOKEN || '').trim();
  if (ghToken) ghHeaders.Authorization = `Bearer ${ghToken}`;

  const [trackerRes, scarlettRelRes, slaktarnRepoRes] = await Promise.allSettled([
    fetchWithTimeout(TRACKER_URL, { headers: { 'User-Agent': 'GTA6TakipNewsBot/4.1' } }, 4500, 120),
    fetchWithTimeout(`https://api.github.com/repos/${SCARLETT_REPO}/releases/latest`, { headers: ghHeaders }, 4000, 300),
    fetchWithTimeout(`https://api.github.com/repos/${SLAKTARN_REPO}`, { headers: ghHeaders }, 4000, 300),
  ]);

  const items = [];

  if (scarlettRelRes.status === 'fulfilled' && scarlettRelRes.value) {
    try {
      const rel = await scarlettRelRes.value.json();
      if (rel?.tag_name) {
        items.push({
          id: `rel-scarlett-${rel.tag_name}`,
          category: 'release',
          title: isTr
            ? `ScarlettPort ${rel.tag_name} yeni sürümü yayınlandı`
            : `ScarlettPort ${rel.tag_name} released on GitHub`,
          summary: isTr
            ? 'Windows hazır launcher (ScarlettPort.exe) için yeni derleme ve uyumluluk güncellemesi.'
            : 'New build and compatibility update for the prebuilt Windows launcher (ScarlettPort.exe).',
          source: 'GitHub Releases',
          url: rel.html_url || `https://github.com/${SCARLETT_REPO}/releases`,
          publishedAt: rel.published_at || new Date().toISOString(),
        });
      }
    } catch {
      // ignore parse errors
    }
  }

  if (slaktarnRepoRes.status === 'fulfilled' && slaktarnRepoRes.value) {
    try {
      const repo = await slaktarnRepoRes.value.json();
      if (repo?.pushed_at) {
        const stars = Number(repo.stargazers_count || 0);
        items.push({
          id: `rel-slaktarn-${repo.pushed_at.slice(0, 10)}`,
          category: 'release',
          title: isTr
            ? `SlaktarnVI (Linux/Proton · FSR 4) güncellendi${stars > 0 ? ` · ★ ${stars}` : ''}`
            : `SlaktarnVI (Linux/Proton · FSR 4) updated${stars > 0 ? ` · ★ ${stars}` : ''}`,
          summary: isTr
            ? 'AMD ekran kartları ve Linux/Steam Proton için optimize edilen açık kaynak VIctory çatalı aktif geliştiriliyor.'
            : 'Open-source VIctory fork tuned for Linux/Steam Proton and AMD FSR 4 received new commits.',
          source: 'GitHub',
          url: repo.html_url || `https://github.com/${SLAKTARN_REPO}`,
          publishedAt: repo.pushed_at,
        });
      }
    } catch {
      // ignore parse errors
    }
  }

  if (trackerRes.status === 'fulfilled' && trackerRes.value) {
    try {
      const tracker = await trackerRes.value.json();
      const efforts = Array.isArray(tracker?.efforts) ? tracker.efforts : [];
      const trackerUpdated = tracker?.updated || new Date().toISOString();

      // Active high-velocity open-source updates
      const hotTeams = efforts
        .filter((e) => !e.nuked && !e.stats?.missing && Number(e.stats?.commits7d || 0) >= 8)
        .sort((a, b) => Number(b.stats?.commits7d || 0) - Number(a.stats?.commits7d || 0))
        .slice(0, 3);

      const rawHighlights = hotTeams
        .map((t) => (Array.isArray(t.highlights) && t.highlights[0] ? String(t.highlights[0]) : ''))
        .filter(Boolean);
      const trHighlightsMap =
        isTr && rawHighlights.length > 0
          ? await translateBatchToTurkish(rawHighlights).catch(() => new Map())
          : new Map();

      for (const team of hotTeams) {
        const commits7d = Number(team.stats?.commits7d || 0);
        const stars = Number(team.stats?.stars || 0);
        const rawHighlight = Array.isArray(team.highlights) && team.highlights[0] ? String(team.highlights[0]) : '';
        const topHighlight = isTr && rawHighlight ? trHighlightsMap.get(rawHighlight) || rawHighlight : rawHighlight;
        items.push({
          id: `pw-hot-${String(team.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          category: 'release',
          title: isTr
            ? `${team.name}: Son 7 günde ${commits7d} yeni commit${stars > 0 ? ` (★ ${stars})` : ''}`
            : `${team.name}: ${commits7d} commits in the last 7 days${stars > 0 ? ` (★ ${stars})` : ''}`,
          summary: topHighlight
            ? topHighlight.slice(0, 140)
            : isTr
              ? 'PortWatch canlı takibinde yüksek kod aktivitesi tespit edildi.'
              : 'High development velocity detected on PortWatch live tracker.',
          source: 'PortWatch',
          url: team.repo ? `https://github.com/${team.repo}` : 'https://portwatch-vi.xyz/',
          publishedAt: trackerUpdated,
        });
      }

      // Live DMCA / nuked repos from PortWatch (matches /api/sync filter)
      const nukedTeams = efforts.filter((e) => Boolean(e?.nuked || e?.stats?.dmca)).slice(0, 6);
      const rawDmcaNotes = nukedTeams.map((n) => String(n?.nuked?.note || '')).filter(Boolean);
      const trDmcaNotesMap =
        isTr && rawDmcaNotes.length > 0
          ? await translateBatchToTurkish(rawDmcaNotes).catch(() => new Map())
          : new Map();

      for (const nuked of nukedTeams) {
        const rawNote = String(nuked?.nuked?.note || '');
        const localizedNote = isTr && rawNote ? trDmcaNotesMap.get(rawNote) || rawNote : rawNote;
        items.push({
          id: `pw-dmca-${String(nuked.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          category: 'dmca',
          title: isTr
            ? `DMCA / Kaldırıldı: ${nuked.name} deposu artık erişilemiyor`
            : `DMCA / Removed: ${nuked.name} repository is no longer available`,
          summary:
            localizedNote
              ? localizedNote.slice(0, 160)
              : isTr
                ? 'PortWatch radarı bu projenin telif (DMCA) veya geliştirici kararıyla kaldırıldığını doğruladı.'
                : 'PortWatch radar confirmed this repository was taken down or removed.',
          source: 'PortWatch DMCA',
          url: nuked?.stats?.dmca?.url || 'https://portwatch-vi.xyz/',
          publishedAt: trackerUpdated,
        });
      }
    } catch {
      // ignore parse errors
    }
  }

  return items;
}

function buildFallbackItems(lang) {
  const isTr = lang === 'tr';
  const now = new Date().toISOString();
  return [
    {
      id: 'fb-scarlett',
      category: 'release',
      title: isTr
        ? 'ScarlettPort hazır Windows launcher ile canlı takipte'
        : 'ScarlettPort prebuilt Windows launcher tracked live',
      summary: isTr
        ? 'Açık kaynak VIctory + XCL tabanlı ilk tek tıkla çalışan PC port denemesi.'
        : 'First open-source one-click Windows launcher attempt built on VIctory + XCL.',
      source: 'GitHub',
      url: `https://github.com/${SCARLETT_REPO}`,
      publishedAt: now,
    },
    {
      id: 'fb-portwatch',
      category: 'release',
      title: isTr
        ? 'PortWatch topluluk port yarışı canlı güncelleniyor'
        : 'PortWatch community PC port race updating live',
      summary: isTr
        ? 'Tüm aktif açık kaynak ve kapalı kaynak ekiplerin FPS, boot ve stabilite skorları anlık işleniyor.'
        : 'FPS, boot status, and stability scores across active teams are synced automatically.',
      source: 'PortWatch',
      url: 'https://portwatch-vi.xyz/',
      publishedAt: now,
    },
  ];
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'tr';

  const [pressRes, redditRes, liveRes] = await Promise.allSettled([
    fetchGoogleNews(lang),
    fetchRedditCommunityNews(lang),
    fetchLivePortAndGitHubEvents(lang),
  ]);

  const combined = [
    ...(liveRes.status === 'fulfilled' ? liveRes.value : []),
    ...(pressRes.status === 'fulfilled' ? pressRes.value : []),
    ...(redditRes.status === 'fulfilled' ? redditRes.value : []),
  ];

  // Deduplicate by normalized title
  const seen = new Set();
  const deduped = [];
  for (const item of combined) {
    const key = String(item.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9çğıöşü]+/g, '')
      .slice(0, 48);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  // Sort newest first
  deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const finalItems = deduped.length > 0 ? deduped.slice(0, 24) : buildFallbackItems(lang);

  const counts = {
    all: finalItems.length,
    press: finalItems.filter((i) => i.category === 'press').length,
    release: finalItems.filter((i) => i.category === 'release').length,
    community: finalItems.filter((i) => i.category === 'community').length,
    dmca: finalItems.filter((i) => i.category === 'dmca').length,
  };

  return NextResponse.json(
    {
      lang,
      updatedAt: new Date().toISOString(),
      counts,
      items: finalItems,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
        'Netlify-CDN-Cache-Control': 'public, max-age=600, stale-while-revalidate=1800',
      },
    }
  );
}
