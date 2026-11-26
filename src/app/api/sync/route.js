import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_TEAMS = [
  { name: 'AvatarManz', progress: 83.1, fps: '16 FPS (13-22 FPS)', gpu: 'RX 7900 XTX', type: 'open', stage: 'Oynanabilir • İlk Perde (Sesli)', delta: '+23.1%', url: 'https://github.com/avatarmanz/VIctory-7900XTX', repo: 'avatarmanz/VIctory-7900XTX', isNew: true },
  { name: 'NotNozy', progress: 82.6, fps: '16 FPS', gpu: 'AMD (Rumble)', type: 'private', stage: 'Oynanabilir • İlk Perde', delta: '+21.6%', url: 'https://portwatch-vi.xyz/#race', isNew: true },
  { name: 'darkworldhm', progress: 79.5, fps: '15-24 FPS', gpu: 'RTX 50 Serisi', type: 'private', stage: 'Oynanabilir • Serbest Dolaşım', delta: '+18.5%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'Doomsday', progress: 78.7, fps: '4 FPS', gpu: 'AMD / NVIDIA', type: 'private', stage: 'Oynanabilir • İlk Perde', delta: '+14.2%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'DexNom', progress: 78.0, fps: '3 FPS', gpu: 'RX 7900 XTX', type: 'open', stage: 'Oynanabilir • İlk Perde', delta: '+12.0%', url: 'https://github.com/DexNom/VIctory', repo: 'DexNom/VIctory' },
  { name: 'Belobug', progress: 77.7, fps: '4 FPS', gpu: 'RX 9070 XT', type: 'open', stage: 'Oynanabilir • İlk Perde', delta: '+9.4%', url: 'https://github.com/Belobug/VIctory-Belobug-AMD', repo: 'Belobug/VIctory-Belobug-AMD' },
  { name: 'suri', progress: 61.0, fps: '3 FPS', gpu: 'Özel Yapı', type: 'private', stage: 'Oynanabilir • Özel Yapı', delta: '+3.1%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'hyphennn', progress: 59.8, fps: '3 FPS', gpu: 'RTX 4070', type: 'open', stage: 'Oynanabilir • Açılış Sahnesi', delta: '+4.0%', url: 'https://github.com/fxceless/victory-fork', repo: 'fxceless/victory-fork' },
  { name: 'Uilian (VItoriaBr)', progress: 59.6, fps: '4 FPS', gpu: 'RTX 5060 Ti', type: 'open', stage: 'Oynanabilir • Önsöz Geçildi', delta: '+5.2%', url: 'https://github.com/uiliannn/VItoriaBr', repo: 'uiliannn/VItoriaBr' },
  { name: 'omonkey', progress: 57.9, fps: '~5 FPS', gpu: 'Rumble Yayını', type: 'private', stage: 'Oynanabilir • Hapishane Sahnesi', delta: '+2.4%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'CGBJ', progress: 54.5, fps: '4 FPS', gpu: 'Özel Yapı', type: 'private', stage: 'Oynanabilir • Özel Yapı', delta: '+1.8%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'Zortos', progress: 45.0, fps: 'PC Boot', gpu: 'Bağımsız', type: 'private', stage: 'Oyun Dünyası • PC Boot', url: 'https://x.com/Zortosdev', isZortos: true },
  { name: 'VIctory', progress: 40.0, fps: '1-30 FPS', gpu: 'RX 6700 XT', type: 'open', stage: 'Oyun Dünyası', url: 'https://github.com/Marvisak/VIctory', repo: 'Marvisak/VIctory' },
  { name: 'XCL', progress: 35.0, fps: '30 FPS (Menü)', gpu: 'AMD / NVIDIA', type: 'open', stage: 'Ana Menü', url: 'https://github.com/xcl-dev/xcl', repo: 'xcl-dev/xcl' },
  { name: 'Five Star Recomp', progress: 30.0, fps: '30 FPS (Ara Sahne)', gpu: 'C# Katmanı', type: 'open', stage: 'Ana Menü', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'keylime', progress: 30.0, fps: '30 FPS (Vulkan)', gpu: 'C++20 / Vulkan', type: 'open', stage: 'Ana Menü', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'Xbox2Windows', progress: 25.0, fps: 'Tanılama', gpu: 'Statik Recomp', type: 'open', stage: 'İlk Kare', url: 'https://github.com/R0Y00/Xbox2Windows', repo: 'R0Y00/Xbox2Windows' },
  { name: 'TuxBox', progress: 20.0, fps: '4K İstem', gpu: 'Linux / Proton', type: 'open', stage: 'İlk Kare', url: 'https://github.com/brcly/TuxBox', repo: 'brcly/TuxBox' },
  { name: 'vice-pc', progress: 12.0, fps: 'Exe Boot', gpu: 'Açık Kaynak', type: 'open', stage: 'Exe Çalışıyor', url: 'https://github.com/natedemoss/vice-pc', repo: 'natedemoss/vice-pc' },
  { name: 'XValkyrie', progress: 2.9, fps: 'Ön Aşama', gpu: 'C++ / HLSL', type: 'open', stage: 'Altyapı', url: 'https://github.com/sammwyy/xvalkyrie', repo: 'sammwyy/xvalkyrie' },
  { name: 'AnyXboxX', progress: 2.5, fps: 'GDK Örnekleri', gpu: 'HLE Emülatör', type: 'open', stage: 'Altyapı', url: 'https://github.com/LooperSalty/AnyXboxX', repo: 'LooperSalty/AnyXboxX' },
];

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/ /g, ' ')
    .replace(/&/g, '&')
    .replace(/·|·|�*b7;|•|•/gi, '·')
    .replace(/\s+/g, ' ')
    .trim();
}

function stageFromProgress(pct) {
  if (pct >= 50) return 'Oynanabilir';
  if (pct >= 40) return 'Oyun Dünyası';
  if (pct >= 30) return 'Ana Menü';
  if (pct >= 20) return 'İlk Kare';
  if (pct >= 10) return 'Exe Çalışıyor';
  return 'Altyapı';
}

export async function GET() {
  const teams = BASE_TEAMS.map((t) => ({ ...t }));
  let totalEfforts = 39;
  let bootingCount = 17;
  let top3Avg = 81.7;

  try {
    const pwRes = await fetch('https://portwatch-vi.xyz/', {
      headers: { 'User-Agent': 'GTA6takip-Sync/1.0' },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 60 },
    });

    if (pwRes.ok) {
      const html = await pwRes.text();
      const text = stripHtml(html);

      const trackedMatch = text.match(/(\d+)\s*Efforts tracked/i);
      if (trackedMatch) totalEfforts = Math.max(totalEfforts, Number(trackedMatch[1]));

      const bootMatch = text.match(/(\d+)\s*\/\s*(\d+)\s*Boot GTA VI/i);
      if (bootMatch) {
        bootingCount = Math.max(bootingCount, Number(bootMatch[1]));
        totalEfforts = Math.max(totalEfforts, Number(bootMatch[2]));
      }

      const avgMatch = text.match(/(\d+(?:\.\d+)?)%\s*Top-3 average/i);
      if (avgMatch) top3Avg = Math.max(top3Avg, Number(avgMatch[1]));

      for (const team of teams) {
        const shortName = team.name.split(' ')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const tickerRe = new RegExp(`${shortName}\\s*[·•]\\s*(\\d+(?:\\.\\d+)?)%`, 'i');
        const cardRe = new RegExp(`${shortName}[\\s\\S]{0,120}?(\\d+(?:\\.\\d+)?)%\\s*(?:Playable|In the world|Main menu|First frame|Exe runs|Groundwork)`, 'i');
        const m = text.match(tickerRe) || text.match(cardRe);
        if (m) {
          const val = Number(m[1]);
          if (!Number.isNaN(val) && val > 0 && val <= 100) {
            team.progress = val;
          }
        }
      }

      const autoTickerRe = /([A-Za-z0-9_-]{3,24})\s*[·•]\s*(\d+(?:\.\d+)?)%/g;
      let match;
      while ((match = autoTickerRe.exec(text)) !== null) {
        const foundName = match[1].trim();
        const foundPct = Number(match[2]);
        if (Number.isNaN(foundPct) || foundPct < 10 || foundPct > 100) continue;

        const exists = teams.some(
          (t) =>
            t.name.toLowerCase() === foundName.toLowerCase() ||
            t.name.toLowerCase().startsWith(foundName.toLowerCase())
        );

        if (!exists) {
          teams.push({
            name: foundName,
            progress: foundPct,
            fps: 'Yeni Yapı',
            gpu: 'PortWatch',
            type: 'open',
            stage: stageFromProgress(foundPct),
            delta: 'Yeni',
            url: 'https://portwatch-vi.xyz/#race',
            isNew: true,
          });
        }
      }
    }
  } catch {
    // PortWatch geçici erişilemezse mevcut veriler korunur
  }

  teams.sort((a, b) => b.progress - a.progress);

  const leader = teams[0] || BASE_TEAMS[0];
  const openLeader = teams.find((t) => t.type === 'open') || leader;

  const news = [
    {
      tagTr: 'REKOR',
      tagEn: 'RECORD',
      tr: `${leader.name} %${leader.progress} ile genel lider (${leader.fps}); NotNozy (%82.6) #2 sıraya yerleşti.`,
      en: `${leader.name} leads overall at ${leader.progress}% (${leader.fps}); NotNozy (82.6%) takes #2.`,
    },
    {
      tagTr: 'AÇIK KAYNAK',
      tagEn: 'OPEN SOURCE',
      tr: `Açık kaynak lideri ${openLeader.name} (%${openLeader.progress}); toplam ${teams.length} ana ekip izleniyor.`,
      en: `${openLeader.name} (${openLeader.progress}%) leads open source; ${teams.length} main teams tracked.`,
    },
    {
      tagTr: 'GÜNCEL',
      tagEn: 'LIVE',
      tr: `PortWatch üzerinde ${totalEfforts} girişim takip ediliyor; ${bootingCount}'si oyunu başlatabiliyor (İlk 3 ort. %${top3Avg}).`,
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
