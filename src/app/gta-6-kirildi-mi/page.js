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
    <main className="min-h-screen bg-[#140b1e] text-pink-50 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-pink-500/30 bg-[#1e112d] text-pink-300 hover:brightness-110 transition"
          >
            ← Canlı Takipçiye Dön
          </Link>
          <span className="text-xs font-semibold text-pink-200/70">GTA6takip · Güvenlik & Durum</span>
        </div>

        <article className="rounded-2xl border border-pink-500/25 bg-[#1e112d]/95 p-5 sm:p-7 space-y-5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-pink-500 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
            GTA 6 Kırıldı mı?
          </h1>

          <p className="text-sm leading-relaxed text-pink-100/85">
            <strong>Kısa cevap: Hayır.</strong> GTA VI&apos;nın resmi bir PC sürümü henüz
            yayınlanmadığı için kırılmış (crack) bir PC oyunu bulunmamaktadır. Şu an gündemde olan
            projeler, sızdırılan Xbox Series dosyalarını Windows/Linux üzerinde çalıştırmaya çalışan
            topluluk kaynaklı <strong>uyumluluk katmanı (PC port)</strong> girişimleridir.
          </p>

          <section className="rounded-xl border border-amber-400/35 bg-amber-500/10 p-4 space-y-2">
            <h2 className="text-sm font-black text-amber-300 uppercase tracking-wider">
              Sahte Kurulum ve Crack .EXE Uyarısı
            </h2>
            <p className="text-sm leading-relaxed text-amber-100/90">
              İnternette, YouTube açıklamalarında veya Telegram/Discord kanallarında paylaşılan
              <strong> &quot;GTA 6 PC Full İndir / Setup.exe / Crack&quot;</strong> dosyalarının
              tamamı sahtedir ve yüksek oranda bilgi hırsızı (stealer) veya zararlı yazılım içerir.
              Hiçbir topluluk ekibi herkese açık tek tıkla kurulan bir oyun paketi dağıtmamaktadır.
            </p>
          </section>

          <section className="rounded-xl border border-pink-500/20 bg-[#170c24] p-4 space-y-2">
            <h2 className="text-sm font-black text-pink-400 uppercase tracking-wider">
              Gerçek PC Port Gelişmelerini Nereden Takip Edebilirsin?
            </h2>
            <p className="text-sm leading-relaxed text-pink-100/80">
              Açık kaynaklı GitHub port projelerinin anlık ilerleme yüzdelerini, AMD/NVIDIA FPS
              testlerini ve kaldırılan (DMCA) repoları canlı takipçimizden güvenle izleyebilirsin.
            </p>
          </section>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-pink-500 to-amber-400 text-zinc-950 hover:brightness-110 transition"
            >
              Canlı GTA 6 PC Port Takipçisine Git →
            </Link>
            <Link
              href="/gta-6-pc-ne-zaman-cikacak"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-pink-500/30 bg-[#170c24] text-pink-200 hover:brightness-110 transition"
            >
              GTA 6 PC Ne Zaman Çıkacak?
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
