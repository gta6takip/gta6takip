import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_PROJECTS = [
  {
    id: 1,
    name: 'omonkey',
    percentage: 79,
    fps: '~5 FPS',
    stage: 'Oyun İçi (Hapishane)',
    description:
      'Lucia hapishane sahnesinde shader yüklemesi ve karakter hareketi sağlandı; Rumble üzerinde canlı yayınlanıyor.',
    repo_url: 'https://t.me/omonkey6',
    is_open_source: false,
    github_repo: null,
  },
  {
    id: 2,
    name: 'Hyphen (fxceless)',
    percentage: 78,
    fps: '3 FPS (RTX 4090)',
    stage: 'Oyun İçi (3D Render)',
    description:
      'VIctory + XCL birleşimiyle en gelişmiş 3D grafik renderı ve erken raytracing ışıklandırması elde edildi.',
    repo_url: 'https://github.com/fxceless/victory-gta6',
    is_open_source: true,
    github_repo: 'fxceless/victory-gta6',
  },
  {
    id: 3,
    name: 'CGBJ',
    percentage: 72,
    fps: 'Bilinmiyor',
    stage: 'Oyun İçi (Prologue)',
    description:
      'Açılış ara sahnesi ("Nine Months Ago") ve oyun içi telefon arayüzü çalıştırıldı; gizli kolektif olarak ilerliyor.',
    repo_url: 'https://gta6recomp.com/repo',
    is_open_source: false,
    github_repo: null,
  },
  {
    id: 4,
    name: 'VIctory',
    percentage: 70,
    fps: '30 FPS (Menü)',
    stage: 'Oyun İçi (Siyah Ekran)',
    description:
      'Açık kaynaklı ana uyumluluk katmanı; menülerde 30 FPS çalışıyor, 3D oyun içi shader desteği geliştiriliyor.',
    repo_url: 'https://github.com/Marvisak/VIctory',
    is_open_source: true,
    github_repo: 'Marvisak/VIctory',
  },
  {
    id: 5,
    name: 'JoshuuDev (victory-amd)',
    percentage: 68,
    fps: 'Ara Sahne / DX12',
    stage: 'Oyun İçi (3D Ara Sahneler)',
    description:
      'AMD GPU uyumluluğu, DX12 ve shader cache ısıtma iyileştirmeleriyle temiz renkli 3D oyun içi ara sahneler ve neon ışıklandırma elde edildi.',
    repo_url: 'https://github.com/JoshuuDev/victory-amd',
    is_open_source: true,
    github_repo: 'JoshuuDev/victory-amd',
  },
  {
    id: 6,
    name: 'AnyXboxX',
    percentage: 65,
    fps: '3.2 FPS (720p)',
    stage: 'Oyun İçi (Eğitim)',
    description:
      'Kontrol edilebilir karakter ve hareket eğitim ekranı açıldı; kalan untranslated shader sayısı azaltılıyor.',
    repo_url: 'https://github.com/LooperSalty/AnyXboxX',
    is_open_source: true,
    github_repo: 'LooperSalty/AnyXboxX',
  },
  {
    id: 7,
    name: 'XCL',
    percentage: 63,
    fps: '30 FPS (Intro)',
    stage: 'Dünya Yükleme',
    description:
      'Wine benzeri uyumluluk katmanı; binlerce shader işlendi, oyun dünyasında yayalar ve araçlar spawn oluyor.',
    repo_url: 'https://github.com/ivall/xcl',
    is_open_source: true,
    github_repo: 'ivall/xcl',
  },
  {
    id: 8,
    name: 'Xbox2Windows',
    percentage: 48,
    fps: '-',
    stage: 'İlk Kare (First Frame)',
    description:
      'Statik yeniden derleme ve shader çözümleme hattı ile ilk kare görüntüsüne ulaşıldı.',
    repo_url: 'https://github.com/R0Y00/Xbox2Windows',
    is_open_source: true,
    github_repo: 'R0Y00/Xbox2Windows',
  },
  {
    id: 9,
    name: 'Palmetto',
    percentage: 25,
    fps: '-',
    stage: 'Exe Başlatma (Boot)',
    description:
      'Düşük seviyeli bellek eşleme ve .exe yükleme altyapısı geliştiriliyor.',
    repo_url: 'https://github.com/luizwidmer/palmetto',
    is_open_source: true,
    github_repo: 'luizwidmer/palmetto',
  },
];

export async function GET() {
  const nowIso = new Date().toISOString();
  const headers = { 'User-Agent': 'GTA6takip-Bot' };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const projects = await Promise.all(
    BASE_PROJECTS.map(async (proj) => {
      let description = proj.description;
      if (proj.github_repo) {
        try {
          const res = await fetch(
            `https://api.github.com/repos/${proj.github_repo}/commits?per_page=1`,
            {
              headers,
              cache: 'no-store',
              signal: AbortSignal.timeout(4000),
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
          // GitHub geçici yanıt vermezse varsayılan açıklamayı koru
        }
      }

      return {
        id: proj.id,
        name: proj.name,
        percentage: proj.percentage,
        fps: proj.fps,
        stage: proj.stage,
        description,
        repo_url: proj.repo_url,
        is_open_source: proj.is_open_source,
        updated_at: nowIso,
      };
    })
  );

  return NextResponse.json(
    { ok: true, synced_at: nowIso, projects },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
      },
    }
  );
}
