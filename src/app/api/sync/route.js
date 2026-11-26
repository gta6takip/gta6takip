import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_TEAMS = [
  { name: 'CGBJ', progress: 89.8, fps: '20 FPS (30 FPS Ara Sahne)', gpu: 'NVIDIA (10GB RAM)', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+35.3%', url: 'https://portwatch-vi.xyz/#race', summaryTr: 'Ara sahnelerde 30 FPS, oyun içinde sabit ~20 FPS (10 GB RAM / 16 GB VRAM). Hikâyenin yarısı oynanabilir, nadiren çöküyor; kod henüz halka açık değil.', summaryEn: '30 FPS in cutscenes, ~20 FPS stable in gameplay (10 GB RAM / 16 GB VRAM). Half the story playable, rarely crashes; private build.' },
  { name: 'NotNozy', progress: 87.8, fps: '16 FPS', gpu: 'AMD (Rumble)', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+26.8%', url: 'https://portwatch-vi.xyz/#race', isNew: true },
  { name: 'darkworldhm', progress: 84.8, fps: '15-24 FPS', gpu: 'RTX 50 Serisi', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+23.8%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'Doomsday', progress: 84.0, fps: '4 FPS', gpu: 'AMD / NVIDIA', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+19.5%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'AvatarManz', progress: 83.1, fps: '16 FPS (13-22 FPS)', gpu: 'RX 7900 XTX', type: 'open', stage: 'Oynanabilir • İlk Perde (Sesli)', delta: '+23.1%', url: 'https://github.com/avatarmanz/VIctory-7900XTX', repo: 'avatarmanz/VIctory-7900XTX' },
  { name: 'Belobug', progress: 79.0, fps: '8 FPS', gpu: 'RX 9070 XT', type: 'open', stage: 'Oynanabilir • İlk Perde (RT)', delta: '+10.7%', url: 'https://github.com/Belobug/VIctory-Belobug-AMD', repo: 'Belobug/VIctory-Belobug-AMD' },
  { name: 'DexNom', progress: 78.0, fps: '3 FPS', gpu: 'RX 7900 XTX', type: 'open', stage: 'Oynanabilir • İlk Perde', delta: '+12.0%', url: 'https://github.com/DexNom/VIctory', repo: 'DexNom/VIctory' },
  { name: 'suri', progress: 75.0, fps: '3 FPS', gpu: 'Özel Yapı', type: 'private', stage: 'Oynanabilir • Hikâye Yarısı', delta: '+14.0%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'hyphennn', progress: 59.8, fps: '3 FPS', gpu: 'RTX 4070', type: 'open', stage: 'Oynanabilir • Açılış Sahnesi', delta: '+4.0%', url: 'https://github.com/fxceless/victory-fork', repo: 'fxceless/victory-fork' },
  { name: 'Uilian (VItoriaBr)', progress: 59.6, fps: '4 FPS', gpu: 'RTX 5060 Ti', type: 'open', stage: 'Oynanabilir • Önsöz Geçildi', delta: '+5.2%', url: 'https://github.com/uiliannn/VItoriaBr', repo: 'uiliannn/VItoriaBr' },
  { name: 'omonkey', progress: 57.9, fps: '~5 FPS', gpu: 'Rumble Yayını', type: 'private', stage: 'Oynanabilir • Hapishane Sahnesi', delta: '+2.4%', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'VIctory', progress: 50.3, fps: '1 FPS (30 FPS Menü)', gpu: 'RX 6700 XT', type: 'open', stage: 'Oynanabilir • İlk Sahne', delta: '+10.3%', url: 'https://github.com/Marvisak/VIctory', repo: 'Marvisak/VIctory' },
  { name: 'Zortos', progress: 45.0, fps: 'PC Boot', gpu: 'Bağımsız', type: 'private', stage: 'Oyun Dünyası • PC Boot', url: 'https://x.com/Zortosdev', isZortos: true },
  { name: 'XCL', progress: 35.0, fps: '30 FPS (Menü)', gpu: 'AMD / NVIDIA', type: 'open', stage: 'Ana Menü', url: 'https://github.com/xcl-dev/xcl', repo: 'xcl-dev/xcl' },
  { name: 'Five Star Recomp', progress: 30.0, fps: '30 FPS (Ara Sahne)', gpu: 'C# Katmanı', type: 'open', stage: 'Ana Menü', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'keylime', progress: 30.0, fps: '30 FPS (Vulkan)', gpu: 'C++20 / Vulkan', type: 'open', stage: 'Ana Menü', url: 'https://portwatch-vi.xyz/#race' },
  { name: 'Xbox2Windows', progress: 25.0, fps: 'Tanılama', gpu: 'Statik Recomp', type: 'open', stage: 'İlk Kare', url: 'https://github.com/R0Y00/Xbox2Windows', repo: 'R0Y00/Xbox2Windows' },
  { name: 'Port of the Americas', progress: 25.0, fps: 'Linux / Proton', gpu: 'AMD (vkd3d)', type: 'open', stage: 'İlk Kare', url: 'https://portwatch-vi.xyz/#race', isNew: true },
  { name: 'TuxBox', progress: 20.0, fps: '4K İstem', gpu: 'Linux / Proton', type: 'open', stage: 'İlk Kare', url: 'https://github.com/brcly/TuxBox', repo: 'brcly/TuxBox' },
  { name: 'vice-pc', progress: 12.0, fps: 'Exe Boot', gpu: 'Açık Kaynak', type: 'open', stage: 'Exe Çalışıyor', url: 'https://github.com/natedemoss/vice-pc', repo: 'natedemoss/vice-pc' },
  { name: 'ScarlettCompat', progress: 10.0, fps: '113 Boot', gpu: 'AMD (C++)', type: 'open', stage: 'Exe Çalışıyor', url: 'https://portwatch-vi.xyz/#race', isNew: true },
  { name: 'XValkyrie', progress: 2.9, fps: 'Ön Aşama', gpu: 'C++ / HLSL', type: 'open', stage: 'Altyapı', url: 'https://github.com/sammwyy/xvalkyrie', repo: 'sammwyy/xvalkyrie' },
  { name: 'AnyXboxX', progress: 2.5, fps: 'GDK Örnekleri', gpu: 'HLE Emülatör', type: 'open', stage: 'Altyapı', url: 'https://github.com/LooperSalty/AnyXboxX', repo: 'LooperSalty/AnyXboxX' },
];

function stripHtml(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
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
  let top3Avg = 87.5;

  try {
    const pwRes = await fetch('https://portwatch-vi.xyz/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
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

      const avgMatch = text.match(/(\d+(?:\.\d+)?)\s*%\s*Top-3 average/i);
      if (avgMatch) top3Avg = Math.max(top3Avg, Number(avgMatch[1]));

      for (const team of teams) {
        const shortName = team.name.split(' ')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const tickerRe = new RegExp(`${shortName}\\s*[·•]\\s*(\\d+(?:\\.\\d+)?)\\s*%`, 'i');
        const cardRe = new RegExp(`${shortName}[\\s\\S]{0,140}?(\\d+(?:\\.\\d+)?)\\s*%\\s*(?:Playable|In the world|Main menu|First frame|Exe runs|Groundwork)`, 'i');
        const m = text.match(tickerRe) || text.match(cardRe);
        if (m) {
          const val = Number(m[1]);
          if (!Number.isNaN(val) && val > 0 && val <= 100) {
            team.progress = val;
          }
        }
      }

      const addIfMissing = (foundName, foundPct, isPriv = false) => {
        if (!foundName || Number.isNaN(foundPct) || foundPct < 10 || foundPct > 100) return;
        const skip = ['avg', 'top', 'boot', 'now', 'ago', 'the', 'and', 'for', 'gta'];
        if (skip.includes(foundName.toLowerCase())) return;
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
            type: isPriv ? 'private' : 'open',
            stage: stageFromProgress(foundPct),
            delta: 'Yeni',
            url: 'https://portwatch-vi.xyz/#race',
            isNew: true,
          });
        }
      };

      const autoTickerRe = /([A-Za-z0-9_-]{3,24})\s*[·•]\s*(\d+(?:\.\d+)?)\s*%/g;
      let match;
      while ((match = autoTickerRe.exec(text)) !== null) {
        addIfMissing(match[1].trim(), Number(match[2]), false);
      }

      const cardAutoRe = /([A-Za-z0-9_-]{3,24})\s+(?:\S+\s+){0,5}(\d+(?:\.\d+)?)\s*%\s*(Playable|In the world|Main menu|First frame|Exe runs|private\.notRanked)/g;
      while ((match = cardAutoRe.exec(text)) !== null) {
        addIfMissing(match[1].trim(), Number(match[2]), match[3] === 'private.notRanked');
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
      tr: `${leader.name} %${leader.progress} ile yeni genel lider (${leader.fps}); NotNozy (%87.8) #2 sırada.`,
      en: `${leader.name} takes #1 overall at ${leader.progress}% (${leader.fps}); NotNozy (87.8%) is #2.`,
    },
    {
      tagTr: 'AÇIK KAYNAK',
      tagEn: 'OPEN SOURCE',
      tr: `Açık kaynak lideri ${openLeader.name} (%${openLeader.progress}); Belobug (%79 · 8 FPS) ve VIctory (%50.3) yükseldi.`,
      en: `${openLeader.name} (${openLeader.progress}%) leads open source; Belobug (79% · 8 FPS) & VIctory (50.3%) climbed.`,
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
