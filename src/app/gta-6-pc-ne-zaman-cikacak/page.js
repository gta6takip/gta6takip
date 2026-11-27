import Link from 'next/link';

export const revalidate = 300;

export const metadata = {
  title: 'GTA 6 PC Ne Zaman Çıkacak? Resmi Tarih ve Canlı PC Port Durumu',
  description:
    'GTA 6 PC ne zaman çıkacak? Rockstar resmi PC sürümü beklentileri, PortWatch canlı PC port ilerleme yüzdeleri ve güncel FPS durumu.',
  alternates: {
    canonical: '/gta-6-pc-ne-zaman-cikacak',
  },
};

function computeScore(effort) {
  const g = effort?.gta || {};
  const base =
    (Number(g.loads) || 0) +
    (Number(g.boots) || 0) +
    (Number(g.menu) || 0) +
    (Number(g.world) || 0) +
    (Number(g.playable) || 0);
  if (base <= 0) return 0;
  let score = base * 10;
  if ((Number(g.playable) || 0) >= 1) {
    const story = Math.min(1, Math.max(0, Number(g.story) || 0));
    const render = Math.min(1, Math.max(0, Number(g.render) || 0));
    const fpsNorm = Math.min(1, Math.max(0, Number(g.fps) || 0) / 30);
    const stab = typeof g.stability === 'number' ? Math.min(1, Math.max(0, g.stability)) : 0;
    score += story * 17.5 + render * 12.5 + fpsNorm * 10 + stab * 10;
  }
  return Math.min(100, Math.round(score * 10) / 10);
}

async function getLiveSnapshot() {
  try {
    const res = await fetch('https://portwatch-vi.xyz/data/tracker.json', {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const efforts = Array.isArray(data?.efforts) ? data.efforts : [];
    const active = efforts
      .filter((e) => !e?.nuked && !e?.stats?.missing)
      .map((e) => ({
        name: e.name,
        progress: computeScore(e),
        fps: Number(e?.gta?.fps) > 0 ? `${e.gta.fps} FPS` : 'Boot',
      }))
      .sort((a, b) => b.progress - a.progress);
    const booting = efforts.filter((e) => (Number(e?.gta?.boots) || 0) >= 1).length;
    return {
      total: efforts.length || 45,
      booting: booting || 21,
      leader: active[0] || { name: 'VIctory-NVIDIA', progress: 90.0, fps: '20 FPS' },
    };
  } catch {
    return null;
  }
}

export default async function Gta6PcReleasePage() {
  const snap = (await getLiveSnapshot()) || {
    total: 45,
    booting: 21,
    leader: { name: 'VIctory-NVIDIA', progress: 90.0, fps: '20 FPS' },
  };

  return (
    <main className="min-h-screen bg-canvas text-ink px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-subtle bg-surface text-ink-2 hover:text-ink hover:border-default ui-tactile"
          >
            ← Canlı Takipçiye Dön
          </Link>
          <span className="font-tech text-[11px] uppercase tracking-wider text-ink-3">
            GTA6takip · Canlı Özet
          </span>
        </div>

        <article className="rounded-lg border border-subtle bg-surface p-5 sm:p-8 space-y-6">
          <header className="space-y-2 border-b border-subtle pb-5">
            <div className="font-tech text-[11px] uppercase tracking-wider text-accent font-semibold">
              Çıkış Takvimi & Port Durumu
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              GTA 6 PC Ne Zaman Çıkacak?
            </h1>
          </header>

          <p className="text-sm leading-relaxed text-ink-2">
            Rockstar Games henüz <strong className="text-ink">resmi GTA VI PC sürümü</strong> için
            kesin bir çıkış tarihi duyurmadı. Şirketin önceki oyunlarındaki konsol sonrası PC
            takvimine ve sektör beklentilerine göre resmi PC sürümünün{' '}
            <strong className="text-ink">2027 başı</strong> civarında gelmesi bekleniyor.
          </p>

          <section className="rounded-md border border-subtle bg-panel-tint p-4 space-y-3">
            <h2 className="font-tech text-xs font-bold text-ink uppercase tracking-wider">
              Topluluk PC Port Yarışında Son Durum (Canlı)
            </h2>
            <p className="text-sm leading-relaxed text-ink-2">
              Resmi sürüm beklenirken topluluk geliştiricileri sızdırılan Xbox Series yapısını PC
              uyumluluk katmanlarıyla çalıştırmak için yarışıyor. PortWatch canlı verilerine göre şu
              an <strong className="text-ink">{snap.total} girişim</strong> takip ediliyor ve{' '}
              <strong className="text-ink">{snap.booting} proje</strong> oyunu PC&apos;de
              başlatabiliyor.
            </p>
            <p className="text-sm leading-relaxed text-ink-2">
              Güncel lider <strong className="text-ink">{snap.leader.name}</strong> şu an{' '}
              <strong className="font-tech text-accent">%{snap.leader.progress}</strong> ilerleme ve{' '}
              <strong className="font-tech text-ink">{snap.leader.fps}</strong> civarı performansla
              ilk sırada. Ancak herkesin tek tıkla kurup sorunsuz 30+ FPS oynayabileceği kararlı bir
              topluluk sürümü için henüz kesin bir tarih bulunmuyor.
            </p>
          </section>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold bg-accent ui-tactile"
            >
              Canlı Liderlik Tablosunu ve FPS Değerlerini Gör →
            </Link>
            <Link
              href="/gta-6-kirildi-mi"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold border border-default bg-elevated text-ink-2 hover:text-ink ui-tactile"
            >
              GTA 6 Kırıldı mı?
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
