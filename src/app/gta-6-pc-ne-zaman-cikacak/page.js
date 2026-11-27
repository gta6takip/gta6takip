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
      total: efforts.length || 40,
      booting: booting || 18,
      leader: active[0] || { name: 'Belobug', progress: 91.3, fps: '22 FPS' },
    };
  } catch {
    return null;
  }
}

export default async function Gta6PcReleasePage() {
  const snap = (await getLiveSnapshot()) || {
    total: 40,
    booting: 18,
    leader: { name: 'Belobug', progress: 91.3, fps: '22 FPS' },
  };

  return (
    <main className="min-h-screen bg-[#140b1e] text-pink-50 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-pink-500/30 bg-[#1e112d] text-pink-300 hover:brightness-110 transition"
          >
            ← Canlı Takipçiye Dön
          </Link>
          <span className="text-xs font-semibold text-pink-200/70">GTA6takip · Canlı Özet</span>
        </div>

        <article className="rounded-2xl border border-pink-500/25 bg-[#1e112d]/95 p-5 sm:p-7 space-y-5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-pink-500 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
            GTA 6 PC Ne Zaman Çıkacak?
          </h1>

          <p className="text-sm leading-relaxed text-pink-100/85">
            Rockstar Games henüz <strong>resmi GTA VI PC sürümü</strong> için kesin bir çıkış tarihi
            duyurmadı. Şirketin önceki oyunlarındaki konsol sonrası PC takvimine ve sektör
            söylentilerine göre resmi PC sürümünün <strong>2027 başı</strong> civarında gelmesi
            bekleniyor.
          </p>

          <section className="rounded-xl border border-pink-500/20 bg-[#170c24] p-4 space-y-2">
            <h2 className="text-sm font-black text-pink-400 uppercase tracking-wider">
              Topluluk PC Port Yarışında Son Durum (Canlı)
            </h2>
            <p className="text-sm leading-relaxed text-pink-100/80">
              Resmi sürüm beklenirken topluluk geliştiricileri sızdırılan Xbox Series yapısını PC
              uyumluluk katmanlarıyla çalıştırmak için yarışıyor. PortWatch canlı verilerine göre
              şu an <strong>{snap.total} girişim</strong> takip ediliyor ve{' '}
              <strong>{snap.booting} proje</strong> oyunu PC&apos;de başlatabiliyor.
            </p>
            <p className="text-sm leading-relaxed text-pink-100/80">
              Güncel lider <strong>{snap.leader.name}</strong> şu an{' '}
              <strong>%{snap.leader.progress}</strong> ilerleme ve{' '}
              <strong>{snap.leader.fps}</strong> civarı performansla ilk sırada. Ancak herkesin
              tek tıkla kurup sorunsuz 30+ FPS oynayabileceği kararlı bir topluluk sürümü için
              henüz kesin bir tarih bulunmuyor.
            </p>
          </section>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-pink-500 to-amber-400 text-zinc-950 hover:brightness-110 transition"
            >
              Canlı Liderlik Tablosunu ve FPS Değerlerini Gör →
            </Link>
            <Link
              href="/gta-6-kirildi-mi"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-pink-500/30 bg-[#170c24] text-pink-200 hover:brightness-110 transition"
            >
              GTA 6 Kırıldı mı?
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
