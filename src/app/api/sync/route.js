import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_TEAMS = [
  {
    name: 'Belobug',
    repo: 'Belobug/VIctory-Belobug-AMD',
    url: 'https://github.com/Belobug/VIctory-Belobug-AMD',
    open_source: true,
    percentage: 77.4,
    stage_tr: 'Oynanabilir • İlk Bölüm',
    stage_en: 'Playable • First Act',
    fps_tr: '3 FPS (RX 9070 XT)',
    fps_en: '3 FPS (RX 9070 XT)',
    desc_tr: 'AMD Radeon için VIctory tabanlı sürüm; açık dünya dokuları ve görevler oynanabilir durumda.',
    desc_en: 'VIctory fork for AMD Radeon; open world textures and missions are playable.',
  },
  {
    name: 'ZETTROX',
    repo: 'Zettrox/ztrx',
    url: 'https://github.com/Zettrox/ztrx',
    open_source: true,
    percentage: 64.2,
    stage_tr: 'Oynanabilir • Giriş Bölümü Geçildi',
    stage_en: 'Playable • Prologue Cleared',
    fps_tr: '2 FPS (NVIDIA)',
    fps_en: '2 FPS (NVIDIA)',
    desc_tr: 'Lucia giriş bölümünü geçip Jason’ın ilk görevi "Gone Fishing" aşamasına ulaştı.',
    desc_en: 'Clears Lucia prologue and reaches Jason first mission "Gone Fishing".',
  },
  {
    name: 'suri',
    repo: null,
    url: 'https://portwatch-vi.xyz/#race',
    open_source: false,
    percentage: 61,
    stage_tr: 'Oynanabilir • Kapalı Derleme',
    stage_en: 'Playable • Private Build',
    fps_tr: '3 FPS',
    fps_en: '3 FPS',
    desc_tr: 'Kapalı ekip: victory-fork tabanlı özel derleme, perakende sürüme yakın ışıklandırma.',
    desc_en: 'Private build on victory-fork with lighting close to retail quality.',
  },
  {
    name: 'hyphennn',
    repo: 'fxceless/victory-fork',
    url: 'https://github.com/fxceless/victory-fork',
    open_source: true,
    percentage: 59.8,
    stage_tr: 'Oynanabilir • Açılış Sahnesi',
    stage_en: 'Playable • Opening Scene',
    fps_tr: '3 FPS (RTX 4070)',
    fps_en: '3 FPS (RTX 4070)',
    desc_tr: 'RTX 4070 üzerinde açılış sahnesi ve temel dünya renderı çalışıyor.',
    desc_en: 'Opening scene and core world rendering running on RTX 4070.',
  },
  {
    name: 'Uilian (VItoriaBr)',
    repo: 'uiliannn/VItoriaBr',
    url: 'https://github.com/uiliannn/VItoriaBr',
    open_source: true,
    percentage: 59.6,
    stage_tr: 'Oynanabilir • Giriş Bölümü Geçildi',
    stage_en: 'Playable • Prologue Cleared',
    fps_tr: '4 FPS (RTX 5060 Ti)',
    fps_en: '4 FPS (RTX 5060 Ti)',
    desc_tr: 'RTX 5060 Ti üzerinde giriş bölümü geçildi; oynanış testleri sürüyor.',
    desc_en: 'Prologue cleared on RTX 5060 Ti; gameplay testing continues.',
  },
  {
    name: 'omonkey',
    repo: null,
    url: 'https://portwatch-vi.xyz/#race',
    open_source: false,
    percentage: 57.9,
    stage_tr: 'Oynanabilir • Hapishane Sahnesi',
    stage_en: 'Playable • Prison Scene',
    fps_tr: '~5 FPS',
    fps_en: '~5 FPS',
    desc_tr: 'Kapalı ekip: hapishane sahnesi ve hikâye grafikleri yüklenmeye başladı.',
    desc_en: 'Closed team: prison scene and story graphics are becoming playable.',
  },
  {
    name: 'CGBJ',
    repo: null,
    url: 'https://portwatch-vi.xyz/#race',
    open_source: false,
    percentage: 54.5,
    stage_tr: 'Oynanabilir • Kapalı Derleme',
    stage_en: 'Playable • Private Build',
    fps_tr: '4 FPS',
    fps_en: '4 FPS',
    desc_tr: 'Kapalı ekip: oyun içi hareket ve temel sahne yüklemeleri doğrulandı.',
    desc_en: 'Closed team: in-game movement and core scene loading verified.',
  },
  {
    name: 'Zortos',
    repo: null,
    url: 'https://thecode.media/ii-agenty-perekompiliruyut-gta-vi-dlya-pk-v-pryamom-efire/',
    open_source: false,
    percentage: 45,
    stage_tr: 'Oyun Dünyası • X Bildirimi',
    stage_en: 'In the World • X Report',
    fps_tr: 'PC Başlatma Doğrulandı',
    fps_en: 'PC Boot Reported',
    desc_tr: 'Bağımsız geliştirici: oyunu PC üzerinde başlattığını ve oynanabilir derleme üzerinde çalıştığını duyurdu.',
    desc_en: 'Independent modder: reported booting GTA VI on PC and working on a playable build.',
  },
  {
    name: 'VIctory',
    repo: 'Marvisak/VIctory',
    url: 'https://github.com/Marvisak/VIctory',
    open_source: true,
    percentage: 40,
    stage_tr: 'Oyun Dünyası',
    stage_en: 'In the World',
    fps_tr: '30 FPS (Menü)',
    fps_en: '30 FPS (Menu)',
    desc_tr: 'Windows üzerinde oyunun kendi kodunu yerel olarak çalıştıran Rust tabanlı uyumluluk katmanı.',
    desc_en: 'Rust-based compatibility layer running game code natively on Windows.',
  },
  {
    name: 'XCL',
    repo: 'xcl-dev/xcl',
    url: 'https://github.com/xcl-dev/xcl',
    open_source: true,
    percentage: 35,
    stage_tr: 'Ana Menü',
    stage_en: 'Main Menu',
    fps_tr: '30 FPS (Menü)',
    fps_en: '30 FPS (Menu)',
    desc_tr: 'Ana menüde 30 FPS bildirildi; pencere başlığında canlı FPS sayacı eklendi.',
    desc_en: 'Reported 30 FPS in menus with live FPS counter in window title.',
  },
  {
    name: 'Xbox2Windows',
    repo: 'R0Y00/Xbox2Windows',
    url: 'https://github.com/R0Y00/Xbox2Windows',
    open_source: true,
    percentage: 25,
    stage_tr: 'İlk Kare',
    stage_en: 'First Frame',
    fps_tr: 'Tanılama Modu',
    fps_en: 'Diagnostic Mode',
    desc_tr: 'Xbox Series yürütülebilir dosyalarını Windows ortamına çeviren uyumluluk katmanı.',
    desc_en: 'Compatibility layer translating Xbox Series executables to Windows.',
  },
  {
    name: 'TuxBox',
    repo: 'brcly/TuxBox',
    url: 'https://github.com/brcly/TuxBox',
    open_source: true,
    percentage: 20,
    stage_tr: 'İlk Kare',
    stage_en: 'First Frame',
    fps_tr: 'Linux / Proton',
    fps_en: 'Linux / Proton',
    desc_tr: 'Linux ve Proton uyumluluk katmanı üzerinden ilk kare çıktısı hedefleniyor.',
    desc_en: 'Targeting first frame output via Linux and Proton compatibility.',
  },
  {
    name: 'vice-pc',
    repo: 'natedemoss/vice-pc',
    url: 'https://github.com/natedemoss/vice-pc',
    open_source: true,
    percentage: 12,
    stage_tr: 'Exe Çalışıyor',
    stage_en: 'Exe Runs',
    fps_tr: 'Açık Kaynak',
    fps_en: 'Open Source',
    desc_tr: 'PortWatch VI tarafından tespit edilen yeni açık kaynak GTA VI PC çalıştırma girişimi.',
    desc_en: 'New open-source GTA VI PC port effort spotted by PortWatch VI Scout.',
  },
  {
    name: 'XValkyrie',
    repo: 'sammwyy/xvalkyrie',
    url: 'https://github.com/sammwyy/xvalkyrie',
    open_source: true,
    percentage: 2.9,
    stage_tr: 'Temel Altyapı',
    stage_en: 'Groundwork',
    fps_tr: 'Açık Kaynak',
    fps_en: 'Open Source',
    desc_tr: 'PortWatch VI listesinde takip edilen yeni nesil Xbox-to-PC altyapı projesi.',
    desc_en: 'Xbox-to-PC groundwork project tracked on the PortWatch VI leaderboard.',
  },
  {
    name: 'AnyXboxX',
    repo: 'LooperSalty/AnyXboxX',
    url: 'https://github.com/LooperSalty/AnyXboxX',
    open_source: true,
    percentage: 2.5,
    stage_tr: 'Temel Altyapı',
    stage_en: 'Groundwork',
    fps_tr: 'GDK Örnekleri',
    fps_en: 'GDK Samples',
    desc_tr: 'GDK örnekleri ve temel Xbox sistem çağrıları üzerinde çalışıyor.',
    desc_en: 'Working on GDK samples and foundational Xbox system calls.',
  },
];

async function fetchPortWatchPercentages() {
  const map = new Map();
  try {
    const res = await fetch('https://portwatch-vi.xyz/', {
      headers: { 'User-Agent': 'GTA6takip-Sync/1.0' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return map;
    const html = await res.text();
    for (const t of BASE_TEAMS) {
      const escaped = t.name.split(' ')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`${escaped}[\\s\\S]{0,400}?(\\d{1,3}(?:\\.\\d)?)%`, 'i');
      const m = html.match(re);
      if (m && m[1]) {
        const val = parseFloat(m[1]);
        if (val > 0 && val <= 100) map.set(t.name, val);
      }
    }
  } catch {
    // PortWatch erişilemezse yerel değerler korunur
  }
  return map;
}

async function fetchRepoLastPush(repo) {
  if (!repo) return null;
  try {
    const headers = { 'User-Agent': 'GTA6takip-Sync/1.0' };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`, {
      headers,
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : null;
    return first?.commit?.author?.date || null;
  } catch {
    return null;
  }
}

export async function GET() {
  const pwMap = await fetchPortWatchPercentages();

  const enriched = await Promise.all(
    BASE_TEAMS.map(async (team) => {
      const livePct = pwMap.get(team.name);
      const lastPush = await fetchRepoLastPush(team.repo);
      return {
        ...team,
        percentage: livePct ?? team.percentage,
        last_push: lastPush,
      };
    })
  );

  enriched.sort((a, b) => b.percentage - a.percentage);

  return NextResponse.json(
    {
      ok: true,
      updatedAt: new Date().toISOString(),
      teams: enriched,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
      },
    }
  );
}
