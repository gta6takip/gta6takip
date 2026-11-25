import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PORTWATCH_TEAMS = [
  {
    id: 1,
    name: 'Belobug',
    pattern: 'Belobug\\s+Belobug\\/VIctory-Belobug-AMD',
    percentage: 77.4,
    fps_tr: '3 FPS (RX 9070 XT)',
    fps_en: '3 FPS (RX 9070 XT)',
    stage_tr: 'Oynanabilir • İlk Bölüm',
    stage_en: 'Playable • First Act',
    desc_tr: "AMD Radeon için VIctory fork'u; açık dünya dokuları ve görevler oynanabilir durumda.",
    desc_en: 'VIctory fork for AMD Radeon; open world textures and missions are playable.',
    repo_url: 'https://github.com/Belobug/VIctory-Belobug-AMD',
    is_open_source: true,
    github_repo: 'Belobug/VIctory-Belobug-AMD',
  },
  {
    id: 2,
    name: 'ZETTROX',
    pattern: 'ZETTROX\\s+Zettrox\\/ztrx',
    percentage: 64.2,
    fps_tr: '2 FPS (NVIDIA)',
    fps_en: '2 FPS (NVIDIA)',
    stage_tr: 'Oynanabilir • Prologue Geçildi',
    stage_en: 'Playable • Prologue Cleared',
    desc_tr: 'Lucia prologue bölümünü geçip Jason\'ın ilk görevi "Gone Fishing" aşamasına ulaştı.',
    desc_en: 'Clears Lucia\'s prologue and reaches Jason\'s first mission "Gone Fishing".',
    repo_url: 'https://github.com/Zettrox/ztrx',
    is_open_source: true,
    github_repo: 'Zettrox/ztrx',
  },
  {
    id: 3,
    name: 'suri',
    pattern: 'suri\\s+Working in private',
    percentage: 61,
    fps_tr: '3 FPS',
    fps_en: '3 FPS',
    stage_tr: 'Oynanabilir • Kapalı Derleme',
    stage_en: 'Playable • Private Build',
    desc_tr: 'Kapalı ekip: victory-fork tabanlı özel derleme, perakende sürüme yakın ışıklandırma.',
    desc_en: 'Private build on victory-fork with lighting close to retail quality.',
    repo_url: 'https://portwatch-vi.xyz/#race',
    is_open_source: false,
    github_repo: null,
  },
  {
    id: 4,
    name: 'hyphennn',
    pattern: 'hyphennn\\s+fxceless\\/victory-fork',
    percentage: 59.8,
    fps_tr: '3 FPS (RTX 4070)',
    fps_en: '3 FPS (RTX 4070)',
    stage_tr: 'Oynanabilir • Açılış Sahnesi',
    stage_en: 'Playable • Opening Scene',
    desc_tr: "VIctory fork'u; ray-traced ışıklandırma, detaylı dokular ve HUD desteği.",
    desc_en: 'VIctory fork with ray-traced lighting, detailed textures, and HUD support.',
    repo_url: 'https://github.com/fxceless/victory-fork',
    is_open_source: true,
    github_repo: 'fxceless/victory-fork',
  },
  {
    id: 5,
    name: 'Uilian (VItoriaBr)',
    pattern: 'Uilian\\s+uiliannn\\/VItoriaBr',
    percentage: 59.6,
    fps_tr: '4 FPS (RTX 5060 Ti)',
    fps_en: '4 FPS (RTX 5060 Ti)',
    stage_tr: 'Oynanabilir • Prologue Geçildi',
    stage_en: 'Playable • Prologue Cleared',
    desc_tr: 'NVIDIA odaklı victory-fork uyarlaması; "Gone Fishing" görevine ulaşıyor.',
    desc_en: 'NVIDIA-focused victory-fork adaptation reaching the "Gone Fishing" mission.',
    repo_url: 'https://github.com/uiliannn/VItoriaBr',
    is_open_source: true,
    github_repo: 'uiliannn/VItoriaBr',
  },
  {
    id: 6,
    name: 'omonkey',
    pattern: 'omonkey\\s+Streamed on Rumble',
    percentage: 57.9,
    fps_tr: '~5 FPS',
    fps_en: '~5 FPS',
    stage_tr: 'Oynanabilir • Hapishane Sahnesi',
    stage_en: 'Playable • Prison Scene',
    desc_tr: 'Kapalı ekip: Rumble yayınlarında açılış hapishane sahnesinde hareket sağlanıyor.',
    desc_en: 'Private build streamed on Rumble; character moves around the opening prison scene.',
    repo_url: 'https://portwatch-vi.xyz/#race',
    is_open_source: false,
    github_repo: null,
  },
  {
    id: 7,
    name: 'CGBJ',
    pattern: 'CGBJ\\s+Private code',
    percentage: 54.5,
    fps_tr: '4 FPS',
    fps_en: '4 FPS',
    stage_tr: 'Oynanabilir • Kapalı Derleme',
    stage_en: 'Playable • Private Build',
    desc_tr: 'Kapalı ekip: VIctory ve XCL tabanlı özel derleme ile oyun içi NPC etkileşimi.',
    desc_en: 'Private build based on VIctory and XCL with in-game NPC interaction.',
    repo_url: 'https://portwatch-vi.xyz/#race',
    is_open_source: false,
    github_repo: null,
  },
  {
    id: 8,
    name: 'VIctory',
    pattern: 'VIctory\\s+Marvisak\\/VIctory',
    percentage: 40,
    fps_tr: '30 FPS (Menü)',
    fps_en: '30 FPS (Menu)',
    stage_tr: 'Oyun Dünyası',
    stage_en: 'In the World',
    desc_tr: 'Rust tabanlı ana uyumluluk katmanı; menüler 30 FPS, oyun dünyasında ilk ışıklar.',
    desc_en: 'Rust-based compatibility layer; menus at 30 FPS and early world lighting.',
    repo_url: 'https://github.com/Marvisak/VIctory',
    is_open_source: true,
    github_repo: 'Marvisak/VIctory',
  },
  {
    id: 9,
    name: 'XCL',
    pattern: 'XCL\\s+xcl-dev\\/xcl',
    percentage: 35,
    fps_tr: '30 FPS (Menü)',
    fps_en: '30 FPS (Menu)',
    stage_tr: 'Ana Menü',
    stage_en: 'Main Menu',
    desc_tr: "Wine benzeri katman; 26.698 RDNA2 shader'ın tamamı HLSL'e çevrildi.",
    desc_en: 'Wine-style layer; all 26,698 RDNA2 shaders translated to HLSL.',
    repo_url: 'https://github.com/xcl-dev/xcl',
    is_open_source: true,
    github_repo: 'xcl-dev/xcl',
  },
  {
    id: 10,
    name: 'Xbox2Windows',
    pattern: 'Xbox2Windows\\s+R0Y00\\/Xbox2Windows',
    percentage: 25,
    fps_tr: 'Tanılama Modu',
    fps_en: 'Diagnostic Mode',
    stage_tr: 'İlk Kare',
    stage_en: 'First Frame',
    desc_tr: 'Statik yeniden derleme projesi; ilk kare ve menü testleri sürüyor.',
    desc_en: 'Static recompilation project; first frame and menu bring-up in progress.',
    repo_url: 'https://github.com/R0Y00/Xbox2Windows',
    is_open_source: true,
    github_repo: 'R0Y00/Xbox2Windows',
  },
  {
    id: 11,
    name: 'TuxBox',
    pattern: 'TuxBox\\s+brcly\\/TuxBox',
    percentage: 20,
    fps_tr: 'Linux / Proton',
    fps_en: 'Linux / Proton',
    stage_tr: 'İlk Kare',
    stage_en: 'First Frame',
    desc_tr: 'Linux Proton uyumluluk katmanı; hikaye giriş scriptine ulaşıldı.',
    desc_en: 'Linux Proton compatibility layer; reached story intro script.',
    repo_url: 'https://github.com/brcly/TuxBox',
    is_open_source: true,
    github_repo: 'brcly/TuxBox',
  },
  {
    id: 12,
    name: 'AnyXboxX',
    pattern: 'AnyXboxX\\s+LooperSalty\\/AnyXboxX',
    percentage: 2.5,
    fps_tr: 'GDK Örnekleri',
    fps_en: 'GDK Samples',
    stage_tr: 'Temel Altyapı',
    stage_en: 'Groundwork',
    desc_tr: 'Unicorn tabanlı GDK emülasyonu; temel sistem kütüphaneleri başlatıldı.',
    desc_en: 'Unicorn-based GDK emulation; core system libraries initialized.',
    repo_url: 'https://github.com/LooperSalty/AnyXboxX',
    is_open_source: true,
    github_repo: 'LooperSalty/AnyXboxX',
  },
];

export async function GET() {
  const nowIso = new Date().toISOString();

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
    // ignore
  }

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

      let commit_msg = '';
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
              commit_msg = latestMsg.slice(0, 140);
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
        fps_tr: team.fps_tr,
        fps_en: team.fps_en,
        stage_tr: team.stage_tr,
        stage_en: team.stage_en,
        desc_tr: team.desc_tr,
        desc_en: team.desc_en,
        commit_msg,
        repo_url: team.repo_url,
        is_open_source: team.is_open_source,
        updated_at: nowIso,
      };
    })
  );

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
