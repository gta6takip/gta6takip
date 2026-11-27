import Link from 'next/link';

export const revalidate = 300;

export const metadata = {
  title: 'GTA 6 Kırıldı mı? Sahte .EXE Uyarısı ve Gerçek PC Port Durumu',
  description:
    'GTA 6 kırıldı mı? İnternette dolaşan sahte GTA 6 PC crack .exe dosyalarına karşı güvenlik uyarısı ve canlı PortWatch PC port ilerleme durumu.',
  alternates: {
    canonical: '/gta-6-kirildi-mi',
  },
};

export default function Gta6KirildiMiPage() {
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
            GTA6takip · Güvenlik & Durum
          </span>
        </div>

        <article className="rounded-lg border border-subtle bg-surface p-5 sm:p-8 space-y-6">
          <header className="space-y-2 border-b border-subtle pb-5">
            <div className="font-tech text-[11px] uppercase tracking-wider text-accent font-semibold">
              Doğrulanmış Durum Özeti
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              GTA 6 Kırıldı mı?
            </h1>
          </header>

          <p className="text-sm leading-relaxed text-ink-2">
            <strong className="text-ink">Kısa cevap: Hayır.</strong> GTA VI&apos;nın resmi bir PC
            sürümü henüz yayınlanmadığı için kırılmış (crack) bir PC oyunu bulunmamaktadır. Şu an
            gündemde olan projeler, sızdırılan Xbox Series dosyalarını Windows/Linux üzerinde
            çalıştırmaya çalışan topluluk kaynaklı{' '}
            <strong className="text-ink">uyumluluk katmanı (PC port)</strong> girişimleridir.
          </p>

          <section className="rounded-md border border-amber-500/25 bg-amber-500/10 p-4 space-y-2">
            <h2 className="font-tech text-xs font-bold text-amber-500 uppercase tracking-wider">
              Sahte Kurulum ve Crack .EXE Uyarısı
            </h2>
            <p className="text-sm leading-relaxed text-ink-2">
              İnternette, YouTube açıklamalarında veya Telegram/Discord kanallarında paylaşılan{' '}
              <strong className="text-ink">&quot;GTA 6 PC Full İndir / Setup.exe / Crack&quot;</strong>{' '}
              dosyalarının tamamı sahtedir ve yüksek oranda bilgi hırsızı (stealer) veya zararlı
              yazılım içerir. Hiçbir topluluk ekibi herkese açık tek tıkla kurulan bir oyun paketi
              dağıtmamaktadır.
            </p>
          </section>

          <section className="rounded-md border border-subtle bg-panel-tint p-4 space-y-2">
            <h2 className="text-xs font-bold text-ink uppercase tracking-wider font-tech">
              Gerçek PC Port Gelişmelerini Nereden Takip Edebilirsin?
            </h2>
            <p className="text-sm leading-relaxed text-ink-2">
              Açık kaynaklı GitHub port projelerinin anlık ilerleme yüzdelerini, AMD/NVIDIA FPS
              testlerini ve kaldırılan (DMCA) depoları canlı takipçimizden güvenle izleyebilirsin.
            </p>
          </section>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold bg-accent ui-tactile"
            >
              Canlı GTA 6 PC Port Takipçisine Git →
            </Link>
            <Link
              href="/gta-6-pc-ne-zaman-cikacak"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold border border-default bg-elevated text-ink-2 hover:text-ink ui-tactile"
            >
              GTA 6 PC Ne Zaman Çıkacak?
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
