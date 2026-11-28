import { NextResponse } from 'next/server';
import { translateBatchToTurkish, countUntranslatedStrings } from '../../../lib/translate';

export const dynamic = 'force-dynamic';

const TRACKER_URLS = [
  'https://portwatch-vi.xyz/data/tracker.json',
  'https://raw.githubusercontent.com/4lwayz/portwatch-vi/main/data/tracker.json',
];

const RAZDA4A_REPO = 'crossducking/RAZDA4A-XEN';
const SCARLETT_REPO = 'ZigZagBoi1/ScarlettPort';
const SLAKTARN_REPO = 'Slaktarn700/SlaktarnVI';
const GH_CACHE_TTL_MS = 10 * 60 * 1000;
let razda4aCache = { ts: 0, data: null };
let scarlettCache = { ts: 0, data: null };
let slaktarnCache = { ts: 0, data: null };

function buildGitHubHeaders() {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/4.1)',
    Accept: 'application/vnd.github+json',
  };
  const token = (process.env.GITHUB_TOKEN || '').trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

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

function estimateRazda4aFromReadme(readmeText, waveInfo) {
  const text = String(readmeText || '');
  const lower = text.toLowerCase();

  let nativeLow = 15;
  let nativeHigh = 18;
  let fgLow = 30;
  let fgHigh = 36;

  const dualMatch = text.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s*native\s*\/\s*(\d{1,2})\s*[-–]\s*(\d{1,2})\s*fg/i);
  if (dualMatch) {
    nativeLow = Number(dualMatch[1]) || 15;
    nativeHigh = Number(dualMatch[2]) || 18;
    fgLow = Number(dualMatch[3]) || 30;
    fgHigh = Number(dualMatch[4]) || 36;
  }

  let refNative = 31;
  let refFg = '62-63';
  const refMatch = text.match(/~?(\d{2})\s*native\s*\/\s*(\d{2}(?:\s*[-–]\s*\d{2})?)\s*fg/i);
  if (refMatch) {
    refNative = Number(refMatch[1]) || 31;
    refFg = String(refMatch[2] || '62-63').replace(/\s+/g, '');
  }

  const hasRt =
    lower.includes('ray tracing') &&
    !lower.includes('off in wave') &&
    !lower.includes('does not run');

  // PortWatch-aligned conservative estimate (uses native 6-core FPS, not FG):
  // base playable (50) + story est 0.40 (7.0) + render est 0.65 (8.125) + native FPS norm + stability est 0.45 (4.5)
  let score =
    50 +
    0.4 * 17.5 +
    0.65 * 12.5 +
    Math.min(1, nativeHigh / 30) * 10 +
    0.45 * 10;
  if (hasRt) score += 2.0;

  const progress = Math.min(84, Math.round(score * 10) / 10);
  const fps = `${nativeLow}-${nativeHigh} FPS (${fgLow}-${fgHigh} FG)`;
  const waveTag = waveInfo?.wave ? `Wave ${waveInfo.wave}` : 'Wave 13';
  const stage = 'Oynanabilir • Hazır GUI Launcher';

  return { progress, fps, waveTag, refNative, refFg, stage };
}

async function fetchRazda4aXenLive() {
  const now = Date.now();
  if (razda4aCache.data && now - razda4aCache.ts < GH_CACHE_TTL_MS) {
    return razda4aCache.data;
  }

  const headers = buildGitHubHeaders();

  let repoInfo = null;
  let waveInfo = null;
  let readmeText = '';

  const [repoRes, waveRes, readmeRes] = await Promise.allSettled([
    fetch(`https://api.github.com/repos/${RAZDA4A_REPO}`, {
      headers,
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    }),
    fetch(`https://raw.githubusercontent.com/${RAZDA4A_REPO}/main/WAVE.json?t=${now}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/4.3)' },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    }),
    fetch(`https://raw.githubusercontent.com/${RAZDA4A_REPO}/main/README.md?t=${now}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/4.3)' },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    }),
  ]);

  if (repoRes.status === 'fulfilled' && repoRes.value.ok) {
    repoInfo = await repoRes.value.json().catch(() => null);
  }
  if (waveRes.status === 'fulfilled' && waveRes.value.ok) {
    waveInfo = await waveRes.value.json().catch(() => null);
  }
  if (readmeRes.status === 'fulfilled' && readmeRes.value.ok) {
    readmeText = await readmeRes.value.text().catch(() => '');
  }

  if (!repoInfo && !waveInfo && !readmeText && razda4aCache.data) {
    return razda4aCache.data;
  }

  const prev = razda4aCache.data;
  const est =
    readmeText || waveInfo
      ? estimateRazda4aFromReadme(readmeText, waveInfo)
      : prev || estimateRazda4aFromReadme('', null);
  const releaseTag = est.waveTag || prev?.releaseTag || 'Wave 13';
  const stars = Number(repoInfo?.stargazers_count) || prev?.stars || 374;
  const updatedAt =
    repoInfo?.pushed_at || waveInfo?.date || prev?.updatedAt || new Date().toISOString();

  const result = {
    name: 'RAZDA4A XEN',
    progress: est.progress,
    fps: est.fps,
    gpu: 'AMD',
    type: 'open',
    stage: est.stage,
    delta: '',
    url: `https://github.com/${RAZDA4A_REPO}`,
    repo: RAZDA4A_REPO,
    tier: 'tracked',
    updatedAt,
    releaseTag,
    stars,
    commits7d: 0,
    verification: 'self-reported',
    approach: 'Compatibility layer (VIctory RDNA2+)',
    isEstimated: true,
    hasLauncher: true,
    platformTag: 'AMD RDNA2+',
    highlights: [
      `Ships a prebuilt .NET 8 WPF GUI launcher (RAZDA4A XEN Launcher.exe) + zero-dependency .bat mode (${releaseTag})`,
      `Reported performance: ${est.fps} on RX 9060 XT + Ryzen 5 5600; up to ~${est.refNative} native / ${est.refFg} FG on Ryzen 7 7800X3D`,
      'Includes 8 GB VRAM Safe Mode (RX 7600: ~12.7 native / 24.8 FG), Warm Shaders runner, live shader compilation banner, and Linux/Proton script',
      'GPL-3.0 open-source VIctory fork: full Rust source code is published on the dev branch; .bat/.ps1 scripts audited clean with SHA-256 checksums',
    ],
    highlightsTr: [
      `Hazır .NET 8 WPF grafik başlatıcısı (RAZDA4A XEN Launcher.exe) ve sıfır gereksinimli .bat sürümüyle gelir (${releaseTag})`,
      `Bildirilen performans: RX 9060 XT + Ryzen 5 5600 ile ${est.fps}; Ryzen 7 7800X3D sistemde ~${est.refNative} native / ${est.refFg} FG FPS`,
      '8 GB VRAM Güvenli Modu (RX 7600: ~12.7 native / 24.8 FG), Shader ön-ısınma aracı, canlı shader derleme uyarısı ve Linux/Proton desteği sunar',
      'GPL-3.0 açık kaynak VIctory çatalı: tam Rust kaynak kodu dev dalında açık; .bat/.ps1 betikleri temiz ve SHA256SUMS.txt doğrulamalı',
    ],
    blockers: [
      'AMD RDNA2 / RDNA3 / RDNA4 (RX 6000 / 7000 / 9000) GPUs only — NVIDIA and Intel Arc are not supported yet',
      'Prebuilt .exe binaries are unsigned (may trigger Windows Defender false positives); verify SHA256SUMS.txt or build from the dev branch for maximum safety',
      'Ray tracing is disabled and benchmarks are self-reported (not yet independently verified by PortWatch)',
    ],
    blockersTr: [
      'Yalnızca AMD RDNA2 / RDNA3 / RDNA4 (RX 6000 / 7000 / 9000) kartlarda çalışır — NVIDIA ve Intel Arc şu an desteklenmez',
      'Hazır .exe dosyaları dijital imzasızdır (Windows Defender uyarı verebilir); en yüksek güvenlik için SHA256SUMS.txt doğrulaması yapın veya dev dalından kendiniz derleyin',
      'Işın izleme (Ray Tracing) kapalıdır ve FPS verileri geliştirici bildirimidir (PortWatch tarafından henüz bağımsız doğrulanmadı)',
    ],
    summaryTr: `RAZDA4A XEN (${releaseTag}), AMD RDNA2+ (RX 6000/7000/9000) için optimize edilmiş hazır Windows GUI başlatıcılı açık kaynak VIctory çatalı. 6 çekirdekli sistemde ${est.fps}, X3D sistemde ~${est.refNative} native (${est.refFg} FG) FPS bildiriyor; 8 GB VRAM güvenli modu var. (Yalnızca AMD · İmzasız .exe · Bağımsız doğrulanmadı)`,
    summaryEn: `RAZDA4A XEN (${releaseTag}) is an open-source VIctory fork tuned for AMD RDNA2+ with a prebuilt Windows GUI launcher and 8 GB VRAM Safe Mode (${est.fps}; up to ~${est.refNative} native on X3D). AMD-only, unsigned .exe, self-reported.`,
    isZortos: false,
  };

  razda4aCache = { ts: now, data: result };
  return result;
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

  const headers = buildGitHubHeaders();

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
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/4.1)' },
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

  // If GitHub API rate-limited and we already have a real cached snapshot, keep it fresh
  if (!repoInfo && !releaseInfo && !readmeText && scarlettCache.data) {
    return scarlettCache.data;
  }

  const prev = scarlettCache.data;
  const est = readmeText ? estimateScarlettFromReadme(readmeText) : prev || estimateScarlettFromReadme('');
  const releaseTag = releaseInfo?.tag_name || prev?.releaseTag || 'v0.5.5';
  const stars = Number(repoInfo?.stargazers_count) || prev?.stars || 1258;
  const updatedAt =
    releaseInfo?.published_at || repoInfo?.pushed_at || prev?.updatedAt || new Date().toISOString();

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
      'Prebuilt Windows launcher (ScarlettPort.exe) and runtime bundle requiring no compilation',
      'Combines VIctory + XCL runtimes into one build with keyboard/mouse and DualSense support',
      `Current README benchmark: ${est.fps} (Series S profile); community RX 9060 XT tests reach up to 22 FPS median`,
    ],
    highlightsTr: [
      'Derleme gerektirmeyen hazır Windows başlatıcısı (ScarlettPort.exe) ve runtime paketi',
      'VIctory + XCL çalışma zamanlarını tek yapıda birleştiriyor; klavye/fare ve DualSense desteği var',
      `Güncel README ölçümü: ${est.fps} (Series S profili); topluluk RX 9060 XT testlerinde 22 FPS medyan`,
    ],
    blockers: [
      'Shadowed areas are still dark and ray tracing is not enabled yet',
      'Long-term stability and full story progression are not yet independently verified',
    ],
    blockersTr: [
      'Gölgeli alanlar henüz karanlık ve ışın izleme (ray tracing) aktif değil',
      'Uzun süreli kararlılık ve tam hikâye oynanışı henüz bağımsız doğrulanmadı',
    ],
    summaryTr: `ScarlettPort (${releaseTag}), kaynak kod derlemeye gerek kalmadan hazır Windows başlatıcısı (ScarlettPort.exe) sunan ilk açık kaynak GTA VI PC port katmanı. VIctory + XCL altyapısını birleştiriyor; güncel README verisinde ${est.fps}, topluluk RX 9060 XT testlerinde 22 FPS'e kadar ulaşıyor.`,
    summaryEn: `ScarlettPort (${releaseTag}) is the first open-source GTA VI PC port layer shipping a prebuilt Windows launcher (ScarlettPort.exe) combining VIctory + XCL runtimes (${est.fps}).`,
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

  const headers = buildGitHubHeaders();

  let repoInfo = null;
  let readmeText = '';

  const [repoRes, readmeRes] = await Promise.allSettled([
    fetch(`https://api.github.com/repos/${SLAKTARN_REPO}`, {
      headers,
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    }),
    fetch(`https://raw.githubusercontent.com/${SLAKTARN_REPO}/main/README.md?t=${now}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; gta6takip/4.1)' },
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

  if (!repoInfo && !readmeText && slaktarnCache.data) {
    return slaktarnCache.data;
  }

  const prev = slaktarnCache.data;
  const est = readmeText ? estimateSlaktarnFromReadme(readmeText) : prev || estimateSlaktarnFromReadme('');
  const stars = Number(repoInfo?.stargazers_count) || prev?.stars || 157;
  const updatedAt = repoInfo?.pushed_at || prev?.updatedAt || new Date().toISOString();

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
      'AMD Radeon RX 9070 XT on Linux / Steam Proton (1440p, FSR 4 Quality + Frame Generation)',
      'Fixed 3 FPS drop during heist mission, stretched character bug, and face/clothing texture corruption',
      'GPL-3.0 open source combining changes from Belobug, AvatarManz, DexNom, and fxceless',
    ],
    highlightsTr: [
      'Linux / Steam Proton üzerinde AMD Radeon RX 9070 XT (1440p, FSR 4 Quality + Frame Generation)',
      'Soygun görevindeki 3 FPS düşüşü, karakter uzama hatası ve yüz/kıyafet doku bozulmaları giderildi',
      'GPL-3.0 açık kaynak; Belobug, AvatarManz, DexNom ve fxceless değişikliklerini birleştiriyor',
    ],
    blockers: [
      'Only tested on a single Linux machine; not yet verified on Windows',
      'Steady 30 real FPS target and ray tracing are still disabled',
    ],
    blockersTr: [
      'Yalnızca tek bir Linux makinesinde test edildi; Windows üzerinde henüz doğrulanmadı',
      'Hedef sabit 30 gerçek FPS ve ray tracing henüz kapalı',
    ],
    summaryTr: `SlaktarnVI (Valhalla), Linux / Steam Proton üzerinde AMD RX 9070 XT için optimize edilen açık kaynak VIctory forku (FSR 4 + Frame Generation, ${est.fps}).`,
    summaryEn: `SlaktarnVI (Valhalla) is an open-source VIctory fork tuned for Linux/Steam Proton on AMD RX 9070 XT (FSR 4 + Frame Generation, ${est.fps}).`,
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
  const [tracker, razda4aLive, scarlettLive, slaktarnLive] = await Promise.all([
    fetchTrackerJson(),
    fetchRazda4aXenLive().catch(() => null),
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

  let featuredPort = razda4aLive || scarlettLive;

  if (razda4aLive) {
    const existingRazda4aIdx = mappedTeams.findIndex(
      (t) =>
        String(t.repo || '').toLowerCase() === RAZDA4A_REPO.toLowerCase() ||
        String(t.name || '').toLowerCase().includes('razda4a')
    );
    if (existingRazda4aIdx >= 0) {
      const official = mappedTeams[existingRazda4aIdx];
      featuredPort = {
        ...official,
        releaseTag: razda4aLive.releaseTag,
        stars: razda4aLive.stars || official.stars,
        isEstimated: false,
        hasLauncher: true,
        platformTag: 'AMD RDNA2+',
        summaryTr: razda4aLive.summaryTr || official.summaryTr,
        summaryEn: razda4aLive.summaryEn || official.summaryEn,
      };
      mappedTeams[existingRazda4aIdx] = {
        ...official,
        releaseTag: featuredPort.releaseTag,
        hasLauncher: true,
        platformTag: 'AMD RDNA2+',
      };
    } else {
      mappedTeams.push(razda4aLive);
    }
  }

  const existingScarlettIdx = mappedTeams.findIndex(
    (t) =>
      String(t.repo || '').toLowerCase() === SCARLETT_REPO.toLowerCase() ||
      String(t.name || '').toLowerCase() === 'scarlettport'
  );

  if (existingScarlettIdx >= 0) {
    const official = mappedTeams[existingScarlettIdx];
    mappedTeams[existingScarlettIdx] = {
      ...official,
      releaseTag: scarlettLive?.releaseTag || 'v0.5.7',
      stars: scarlettLive?.stars || official.stars || 1430,
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

  // Live PortWatch featured team progress bars (e.g., Whiplash and any future teamBars entries)
  const rawTeamBars = Array.isArray(tracker.teamBars) ? tracker.teamBars : [];
  const mappedTeamBars = rawTeamBars
    .filter((tb) => tb && tb.name)
    .map((tb) => {
      const rawParts = Array.isArray(tb.parts) ? tb.parts : [];
      const totalWeight = rawParts.reduce((acc, p) => acc + (Number(p?.weight) || 1), 0) || 1;
      let weightedSum = 0;
      let fpsLabel = '';

      const parts = rawParts.map((p) => {
        const w = Number(p?.weight) || 1;
        let ratio = 0;
        if (typeof p?.value === 'number' && !Number.isNaN(p.value)) {
          ratio = Math.min(1, Math.max(0, p.value));
        } else if (Number(p?.target) > 0) {
          ratio = Math.min(1, Math.max(0, (Number(p?.current) || 0) / Number(p.target)));
        }
        weightedSum += ratio * w;

        const isFps = String(p?.unit || '').toLowerCase() === 'fps';
        if (isFps && Number(p?.target) > 0) {
          fpsLabel = `${Number(p?.current) || 0} / ${Number(p.target)} FPS`;
        }

        return {
          label: String(p?.label || ''),
          note: String(p?.note || ''),
          pct: Math.round(ratio * 100),
          weightPct: Math.round((w / totalWeight) * 100),
          current: typeof p?.current === 'number' ? p.current : null,
          target: typeof p?.target === 'number' ? p.target : null,
          unit: String(p?.unit || ''),
        };
      });

      const progress = Math.min(100, Math.round((weightedSum / totalWeight) * 1000) / 10);
      const avatarRaw = String(tb.avatar || '').trim();
      const avatarUrl = avatarRaw
        ? avatarRaw.startsWith('http')
          ? avatarRaw
          : `https://portwatch-vi.xyz/${avatarRaw.replace(/^\/+/, '')}`
        : '';

      return {
        id: String(tb.id || tb.name).toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
        name: String(tb.name),
        avatarUrl,
        progress,
        fpsLabel,
        updatedAt: String(tb.updatedAt || tracker.updated || ''),
        summaryEn: String(tb.summary || ''),
        parts,
        goals: Array.isArray(tb.goals) ? tb.goals.map((g) => String(g || '')).filter(Boolean) : [],
        later: String(tb.later || ''),
        access: String(tb.access || ''),
        isPrivate: /private/i.test(String(tb.access || '')),
        url: 'https://portwatch-vi.xyz/',
      };
    });

  // Translate PortWatch English highlights, blockers, DMCA notes, and teamBars to Turkish automatically
  const stringsToTranslate = [];
  for (const tm of mappedTeams) {
    if (!Array.isArray(tm.highlightsTr) && Array.isArray(tm.highlights)) {
      for (const h of tm.highlights) stringsToTranslate.push(h);
    }
    if (!Array.isArray(tm.blockersTr) && Array.isArray(tm.blockers)) {
      for (const b of tm.blockers) stringsToTranslate.push(b);
    }
  }
  for (const d of dmcaItems) {
    if (d.note) stringsToTranslate.push(d.note);
  }
  for (const tb of mappedTeamBars) {
    if (tb.summaryEn) stringsToTranslate.push(tb.summaryEn);
    for (const p of tb.parts) {
      if (p.label) stringsToTranslate.push(p.label);
      if (p.note) stringsToTranslate.push(p.note);
    }
    for (const g of tb.goals) stringsToTranslate.push(g);
    if (tb.later) stringsToTranslate.push(tb.later);
    if (tb.access) stringsToTranslate.push(tb.access);
  }

  const trMap = await translateBatchToTurkish(stringsToTranslate).catch(() => new Map());
  const untranslatedCount = countUntranslatedStrings(stringsToTranslate, trMap);

  const localizedTeamBars = mappedTeamBars.map((tb) => ({
    ...tb,
    summaryTr: tb.summaryEn ? trMap.get(tb.summaryEn) || tb.summaryEn : '',
    parts: tb.parts.map((p) => ({
      ...p,
      labelTr: p.label ? trMap.get(p.label) || p.label : '',
      noteTr: p.note ? trMap.get(p.note) || p.note : '',
    })),
    goalsTr: tb.goals.map((g) => trMap.get(g) || g),
    laterTr: tb.later ? trMap.get(tb.later) || tb.later : '',
    accessTr: tb.access ? trMap.get(tb.access) || tb.access : '',
  }));

  mappedTeams = mappedTeams.map((tm) => ({
    ...tm,
    highlightsTr: Array.isArray(tm.highlightsTr)
      ? tm.highlightsTr
      : Array.isArray(tm.highlights)
        ? tm.highlights.map((h) => trMap.get(h) || h)
        : [],
    blockersTr: Array.isArray(tm.blockersTr)
      ? tm.blockersTr
      : Array.isArray(tm.blockers)
        ? tm.blockers.map((b) => trMap.get(b) || b)
        : [],
  }));

  const localizedDmcaItems = dmcaItems.map((d) => ({
    ...d,
    note: trMap.get(d.note) || d.note,
  }));

  if (featuredPort) {
    const matched = mappedTeams.find(
      (t) => String(t.name || '').toLowerCase() === String(featuredPort.name || '').toLowerCase()
    );
    if (matched) {
      featuredPort = {
        ...featuredPort,
        highlightsTr: featuredPort.highlightsTr || matched.highlightsTr,
        blockersTr: featuredPort.blockersTr || matched.blockersTr,
      };
    }
  }

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

  const translationComplete = untranslatedCount === 0;
  const cacheHeaders = translationComplete
    ? {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=180',
        'Netlify-CDN-Cache-Control': 'public, max-age=60, stale-while-revalidate=180',
      }
    : {
        'Cache-Control': 'no-store',
        'Netlify-CDN-Cache-Control': 'no-store',
      };

  return NextResponse.json(
    {
      liveSource: 'portwatch-tracker-json',
      updatedAt: tracker.updated || new Date().toISOString(),
      translationComplete,
      totalEfforts,
      bootingCount,
      top3Avg,
      teams: mappedTeams,
      teamBars: localizedTeamBars,
      featuredPort,
      dmcaItems: localizedDmcaItems,
      news,
    },
    {
      headers: cacheHeaders,
    }
  );
}
