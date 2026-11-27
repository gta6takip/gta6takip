import './globals.css';
import {
  Barlow_Condensed,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from 'next/font/google';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const displayFont = Barlow_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const brandFont = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700'],
  variable: '--font-brand',
  display: 'swap',
});

export const viewport = {
  themeColor: '#09090B',
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL('https://gta6takip.vercel.app'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GTA6takip',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  title: {
    default: 'GTA6takip | GTA 6 PC Port Takip, Tracker & Çıkış Durumu',
    template: '%s | GTA6takip',
  },
  description:
    'GTA 6 PC port takip ve canlı GTA VI tracker. GTA 6 kırıldı mı, GTA 6 PC ne zaman çıkacak? PortWatch verileriyle anlık FPS, ilerleme yüzdeleri, AMD/NVIDIA performansı ve son durum.',
  keywords: [
    'GTA 6 takip',
    'GTA VI takip',
    'GTA 6 tracker',
    'GTA VI tracker',
    'GTA 6 port PC',
    'GTA 6 PC port',
    'GTA 6 PC',
    'GTA VI port',
    'GTA 6 kırıldı mı',
    'GTA 6 PC ne zaman çıkacak',
    'GTA VI ne zaman PC için çıkacak',
    'GTA 6 ne zaman bilgisayara çıkacak',
    'GTA 6 PC çıkış tarihi',
    'PortWatch Türkçe',
  ],
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'wkaSc9ts0jUTOahQ5EkRQa-3fsdK78LrqSXdMtitTkg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://gta6takip.vercel.app/',
    siteName: 'GTA6takip',
    title: 'GTA6takip | GTA 6 PC Port Takip, Tracker & Canlı İlerleme',
    description:
      'GTA 6 PC port ekipleri yüzde kaçta? Canlı FPS verileri, açık kaynak projeler, GTA 6 kırıldı mı ve PC çıkış durumu.',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@batmancodex',
    title: 'GTA6takip | GTA 6 PC Port Takip & Canlı İlerleme',
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
      alternateName: ['GTA 6 Takip', 'GTA VI Tracker', 'GTA 6 PC Port Tracker'],
      url: 'https://gta6takip.vercel.app/',
      inLanguage: ['tr', 'en'],
    },
    {
      '@type': 'WebPage',
      name: 'GTA 6 PC Port Takip & Canlı İlerleme',
      url: 'https://gta6takip.vercel.app/',
      dateModified: '2026-11-27T23:45:00+03:00',
      inLanguage: 'tr',
      isPartOf: {
        '@type': 'WebSite',
        url: 'https://gta6takip.vercel.app/',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'GTA 6 kırıldı mı ve şimdi son durum tam olarak nedir?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'GTA VI resmi PC sürümü henüz çıkmadı ve internetteki kurulum/crack .exe dosyaları sahtedir. Ancak sızdırılan Xbox Series yapısını PC uyumluluk katmanlarıyla çalıştıran PortWatch ekiplerinin en yakın yapıları hikâyenin %80 seviyesine ulaşıp 22–25 FPS civarında oynanabilir hale geldi.',
          },
        },
        {
          '@type': 'Question',
          name: 'GTA 6 PC ne zaman çıkacak ve portlar ne zaman tamamlanacak?',
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
            text: 'PS5 ve Xbox Series X|S konsolları AMD RDNA2 grafik mimarisi kullandığı için sızdırılan konsol shader kodları AMD kartlarda daha doğrudan çalışıyor; NVIDIA kartlarda ekstra DXIL/HLSL dönüşümü gerekiyor.',
          },
        },
        {
          '@type': 'Question',
          name: 'Port ekipleri tam olarak ne için çalışıyor?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Resmi PC sürümü çıkana kadar sızdırılan Xbox Series çalıştırılabilir dosyasını (.exe) Windows veya Linux/Proton üzerinde çalıştırabilmek için uyumluluk katmanları ve GPU shader çeviricileri geliştiriyorlar.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="tr"
      className={`${sansFont.variable} ${displayFont.variable} ${monoFont.variable} ${brandFont.variable}`}
    >
      <body
        style={{ fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif' }}
        className="min-h-screen bg-[#09090B] text-zinc-100 antialiased selection:bg-[#FF4D2E] selection:text-white"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
