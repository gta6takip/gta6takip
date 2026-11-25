import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PORTWATCH_TEAMS = [
  {
    id: 1,
    name: 'Belobug',
    pattern: 'Belobug\\s+Belobug\\/VIctory-Belobug-AMD',
    percentage: 77.4,
    fps: '3 FPS (RX 9070 XT)',
    stage: 'Playable • First act',
    description: 'AMD Radeon için VIctory fork\'u; açık dünya dokuları ve görevler oynanabilir durumda.',
    repo_url: 'https://github.com/Belobug/VIctory-Belobug-AMD',
    is_open_source: true,
    github_repo: 'Belobug/VIctory-Belobug-AMD',
  },
  {
    id: 2,
    name: 'ZETTROX',
    pattern: 'ZETTROX\\s+Zettrox\\/ztrx',
    percentage: 64.2,
    fps: '2 FPS (NVIDIA)',
    stage: 'Playable • Prologue cleared',
    description: 'Lucia prologue bölümünü geçip Jason\'ın ilk görevi "Gone Fishing" aşamasına ulaştı.',
    repo_url: 'https://github.com/Zettrox/ztrx',
    is_open_source: true,
    github_repo: 'Zettrox/ztrx',
  },
  {
    id: 3,
    name: 'suri',
    pattern: 'suri\\s+Working in private',
    percentage: 61,
    fps: '3 FPS',
    stage: 'Playable • Kapalı Derleme',
    description: 'Kapalı ekip: victory-fork tabanlı özel derleme, perakende sürüme yakın ışıklandırma.',
    repo_url: 'https://portwatch-vi.xyz/#race',
    is_open_source: false,
    github_repo: null,
  },
  {
    id: 4,
    name: 'hyphennn',
    pattern: 'hyphennn\\s+fxceless\\/victory-fork',
    percentage: 59.8,
    fps: '3 FPS (RTX 4070)',
    stage: 'Playable • Opening',
    description: 'VIctory fork\'u; ray-traced ışıklandırma, detaylı dokular ve HUD desteği.',
    repo_url: 'https://github.com/fxceless/victory-fork',
    is_open_source: true,
    github_repo: 'fxceless/victory-fork',
  },
  {
    id: 5,
    name: 'Uilian (VItoriaBr)',
    pattern: 'Uilian\\s+uiliannn\\/VItoriaBr',
    percentage: 59.6,
    fps: '4 FPS (RTX 5060 Ti)',
    stage: 'Playable • Prologue cleared',
    description: 'NVIDIA odaklı victory-fork uyarlaması; "Gone Fishing" görevine ulaşıyor.',
    repo_url: 'https://github.com/uiliannn/VItoriaBr',
    is_open_source: true,
    github_repo: 'uiliannn/VItoriaBr',
  },
  {
    id: 6,
    name: 'omonkey',
    pattern: 'omonkey\\s+Streamed on Rumble',
    percentage: 57.9,
    fps: '~5 FPS',
    stage: 'Playable • Hapishane',
    description: 'Kapalı ekip: Rumble yayınlarında açılış hapishane sahnesinde hareket sağlanıyor.',
    repo_url: 'https://portwatch-vi.xyz/#race',
    is_open_source: false,
    github_repo: null,
  },
  {
    id: 7,
    name: 'CGBJ',
    pattern: 'CGBJ\\s+Private code',
    percentage: 54.5,
    fps: '4 FPS',
    stage: 'Playable • Kapalı Derleme',
    description: 'Kapalı ekip: VIctory ve XCL tabanlı özel derleme ile oyun içi NPC etkileşimi.',
    repo_url: 'https://portwatch-vi.xyz/#race',
    is_open_source: false,
    github_repo: null,
  },
  {
    id: 8,
    name: 'VIctory',
    pattern: 'VIctory\\s+Marvisak\\/VIctory',
    percentage: 40,
    fps: '30 FPS (Menü)',
    stage: 'In the world',
    description: 'Rust tabanlı ana uyumluluk katmanı; menüler 30 FPS, oyun dünyasında ilk ışıklar.',
    repo_url: 'https://github.com/Marvisak/VIctory',
    is_open_source: true,
    github_repo: 'Marvisak/VIctory',
  },
  {
    id: 9,
    name: 'XCL',
    pattern: 'XCL\\s+xcl-dev\\/xcl',
    percentage: 35,
    fps: '30 FPS (Menü)',
    stage: 'Main menu',
    description: 'Wine benzeri katman; 26.698 RDNA2 shader\'ın tamamı HLSL\'e çevrildi.',
    repo_url: 'https://github.com/xcl-dev/xcl',
    is_open_source: true,
    github_repo: 'xcl-dev/xcl',
  },
  {
    id: 10,
    name: 'Xbox2Windows',
    pattern: 'Xbox2Windows\\s+R0Y00\\/Xbox2Windows',
    percentage: 25,
    fps: '-',
    stage: 'First frame',
    description: 'Statik yeniden derleme projesi; ilk kare ve menü testleri sürüyor.',
    repo_url: 'https://github.com/R0Y00/Xbox2Windows',
    is_open_source: true,
    github_repo: 'R0Y00/Xbox2Windows',
  },
  {
    id: 11,
    name: 'TuxBox',
    pattern: 'TuxBox\\s+brcly\\/TuxBox',
    percentage: 20,
    fps: 'Linux / Proton',
    stage: 'First frame',
    description: 'Linux Proton uyumluluk katmanı; hikaye giriş scriptine ulaşıldı.',
    repo_url: 'https://github.com/brcly/TuxBox',
    is_open_source: true,
    github_repo: 'brcly/TuxBox',
  },
  {
    id: 12,
    name: 'AnyXboxX',
    pattern: 'AnyXboxX\\s+LooperSalty\\/AnyXboxX',
    percentage: 2.5,
    fps: '-',
    stage: 'Groundwork',
    description: 'Unicorn tabanlı GDK emülasyonu; temel sistem kütüphaneleri başlatıldı.',
    repo_url: 'https://github.com/LooperSalty/AnyXboxX',
    is_open_source: true,
    github_repo: 'LooperSalty/AnyXboxX',
  },
];

export async function GET() {
  const nowIso = new Date().toISOString();

  // 1. PortWatch VI sayfasından canlı yüzdeleri çek
  let portwatchText = '';
  let liveMatched = 0;
  try {
    const pwRes = await fetch('https://portwatch-vi.xyz/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GTA6takip/1.0)' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (pwRes.ok) {
      const html = await pwRes.text();
      portwatchText = html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ');
    }
  } catch {
    // PortWatch geçici yanıt vermezse yedek değerlerle devam et
  }

  // 2. GitHub commit mesajlarını paralel çek
  const ghHeaders = { 'User-Agent': 'GTA6takip-Bot' };
  if (process.env.GITHUB_TOKEN) {
    ghHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const projects = await Promise.all(
    PORTWATCH_TEAMS.map(async (team) => {
      let pct = team.percentage;

      if (portwatchText) {
        try {
          const rx = new RegExp(`${team.pattern}.{0,260}?(\\d+(?:\\.\\d+)?)%`, 'i');
          const match = portwatchText.match(rx);
          if (match && match[1]) {
            const parsed = parseFloat(match[1]);
            if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) {
              pct = parsed;
              liveMatched += 1;
            }
          }
        } catch {
          // ignore
        }
      }

      let description = team.description;
      if (team.github_repo) {
        try {
          const res = await fetch(
            `https://api.github.com/repos/${team.github_repo}/commits?per_page=1`,
            {
              headers: ghHeaders,
              cache: 'no-store',
              signal: AbortSignal.timeout(3500),
            }
          );
          if (res.ok) {
            const commits = await res.json();
            const latestMsg = commits?.[0]?.commit?.message?.split('\n')?.[0];
            if (latestMsg && latestMsg.length > 4) {
              description = `Son GitHub güncellemesi: "${latestMsg.slice(0, 140)}"`;
            }
          }
        } catch {
          // ignore
        }
      }

      return {
        id: team.id,
        name: team.name,
        percentage: pct,
        fps: team.fps,
        stage: team.stage,
        description,
        repo_url: team.repo_url,
        is_open_source: team.is_open_source,
        updated_at: nowIso,
      };
    })
  );

  // En yüksek yüzdenin en üstte görünmesi için sırala
  projects.sort((a, b) => b.percentage - a.percentage);

  return NextResponse.json(
    {
      ok: true,
      source: liveMatched > 0 ? 'portwatch-live' : 'portwatch-fallback',
      liveMatched,
      synced_at: nowIso,
      projects,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
      },
    }
  );
}
