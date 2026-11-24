import './globals.css';

export const metadata = {
  title: 'GTA6takip | GTA VI PC Port İlerleme ve Canlı Sohbet',
  description: 'GTA VI PC portlama gruplarının güncel başarı yüzdeleri, FPS verileri ve Türkçe canlı topluluk sohbeti.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-[#090614] text-white antialiased selection:bg-pink-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
