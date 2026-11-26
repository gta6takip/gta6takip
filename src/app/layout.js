import './globals.css';

export const metadata = {
  metadataBase: new URL('https://gta6takip.vercel.app'),
  title: 'GTA6takip | GTA 6 Takip, GTA VI PC Port İlerleme & Çıkış Durumu',
  description:
    'GTA 6 takip ve canlı GTA VI PC port tracker. GTA 6 kırıldı mı, GTA VI ne zaman bilgisayara çıkacak? PortWatch verileriyle anlık FPS, ilerleme yüzdeleri ve son durum.',
  keywords: [
    'GTA 6 takip',
    'GTA VI takip',
    'GTA VI tracker',
    'GTA VI port',
    'GTA 6 port',
    'GTA 6 PC port',
    'GTA 6 kırıldı mı',
    'GTA VI ne zaman PC için çıkacak',
    'GTA 6 ne zaman bilgisayara çıkacak',
    'GTA 6 PC çıkış tarihi',
    'PortWatch Türkçe',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://gta6takip.vercel.app/',
    siteName: 'GTA6takip',
    title: 'GTA6takip | GTA 6 Takip & GTA VI PC Port İlerleme',
    description:
      'GTA 6 PC port ekipleri yüzde kaçta? Canlı FPS verileri, açık kaynak projeler ve son durum takibi.',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@batmancodex',
    title: 'GTA6takip | GTA 6 Takip & GTA VI PC Port İlerleme',
    description:
      'GTA VI PC port takibi, canlı FPS verileri ve PortWatch Türkçe özeti.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'GTA6takip',
      alternateName: ['GTA 6 Takip', 'GTA VI Tracker'],
      url: 'https://gta6takip.vercel.app/',
      inLanguage: 'tr',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'GTA 6 kırıldı mı ve şimdi son durum tam olarak nedir?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'GTA VI resmi PC sürümü henüz çıkmadı ve internetteki kurulum/crack .exe dosyaları sahtedir. Ancak sızdırılan Xbox Series yapısını PC uyumluluk katmanlarıyla çalıştıran PortWatch ekiplerinin en yakın yapıları ilk yarı görevlerini geçip 25 FPS civarı oynanabilir seviyeye ulaştı.',
          },
        },
        {
          '@type': 'Question',
          name: 'GTA VI ne zaman PC için çıkacak ve portlar ne zaman tamamlanacak?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Topluluk portlarının hatasız ve 30+ FPS seviyesinde tamamen bitirilmesi için kesin bir tarih bulunmuyor; resmi GTA VI PC sürümünün ise söylentilere göre 2027 başını hedeflediği konuşuluyor.',
          },
        },
        {
          '@type': 'Question',
          name: 'AMD ve NVIDIA neden fark ediyor?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PS5 ve Xbox Series X|S konsolları AMD RDNA2 mimarisi kullandığı için sızdırılan konsol shader kodları AMD kartlarda daha doğrudan çalışıyor; NVIDIA kartlarda ekstra DXIL/HLSL dönüşümü gerekiyor.',
          },
        },
        {
          '@type': 'Question',
          name: 'Port ekipleri tam olarak ne için çalışıyor?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Resmi PC sürümü çıkana kadar sızdırılan Xbox Series çalıştırılabilir dosyasını (.exe) Windows veya Linux/Proton üzerinde çalıştırabilmek için uyumluluk katmanları ve shader çeviricileri geliştiriyorlar.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-[#090614] text-white antialiased selection:bg-pink-500 selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
