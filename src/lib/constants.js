export const APP_VERSION = 'v4.3.1';
export const SCORE_SNAPSHOT_KEY = 'gta6takip_prev_scores_v2';
export const CHAT_CACHE_PREFIX = 'gta6takip_chat_cache_';
export const INITIAL_TEAMS_LIMIT = 8;
export const CHAT_COOLDOWN_SEC = 20;
export const CHAT_COOLDOWN_KEY = 'gta6takip_chat_cooldown_until';
export const CHAT_SOUND_KEY = 'gta6takip_chat_sound';
export const CHAT_CLIENT_KEY = 'gta6takip_client_id';
export const CHAT_REACTIONS_KEY = 'gta6takip_reactions';
export const CHAT_DOCK_KEY = 'gta6takip_chat_dock_open';
export const CHAT_REACTION_EMOJIS = ['🔥', '👍', '😂'];

export const THEMES = {
  leonida: {
    id: 'leonida',
    group: 'dark',
    label: { tr: 'Leonida Alacakaranlık', en: 'Leonida Twilight' },
    sub: { tr: 'Mat gün batımı', en: 'Matte sunset' },
    dot: '#E86A58',
    swatches: ['#121116', '#18171E', '#E86A58'],
    isLight: false,
  },
  graphite: {
    id: 'graphite',
    group: 'dark',
    label: { tr: 'Telemetri Grafit', en: 'Telemetry Graphite' },
    sub: { tr: 'Nötr teknik koyu', en: 'Neutral dark' },
    dot: '#E66435',
    swatches: ['#0E1012', '#14171A', '#E66435'],
    isLight: false,
  },
  kanagawa: {
    id: 'kanagawa',
    group: 'dark',
    label: { tr: 'Gece Okyanusu', en: 'Kanagawa Ocean' },
    sub: { tr: 'Dingin mavi-arduvaz', en: 'Calm indigo slate' },
    dot: '#6FA8DC',
    swatches: ['#141722', '#1B1F2D', '#6FA8DC'],
    isLight: false,
  },
  'eyecare-dark': {
    id: 'eyecare-dark',
    group: 'eyecare',
    label: { tr: 'Sıcak Mürekkep', en: 'Warm Ink' },
    sub: { tr: 'Gece · Göz yormaz', en: 'Night · Low glare' },
    dot: '#84A98C',
    swatches: ['#1B1A18', '#22201D', '#84A98C'],
    isLight: false,
  },
  'eyecare-sepia': {
    id: 'eyecare-sepia',
    group: 'eyecare',
    label: { tr: 'Sepya Kâğıt', en: 'Sepia Paper' },
    sub: { tr: 'E-Ink · Göz yormaz', en: 'E-Ink · Low glare' },
    dot: '#B84E32',
    swatches: ['#EFEADF', '#F7F3EA', '#B84E32'],
    isLight: true,
  },
  daylight: {
    id: 'daylight',
    group: 'light',
    label: { tr: 'Editoryal Gün Işığı', en: 'Editorial Daylight' },
    sub: { tr: 'Modern dergi açık', en: 'Crisp studio light' },
    dot: '#CC3D24',
    swatches: ['#F3F2EE', '#FFFFFF', '#CC3D24'],
    isLight: true,
  },
};

export const THEME_GROUPS = [
  { id: 'eyecare', tr: 'Göz Dostu', en: 'Eye Comfort' },
  { id: 'dark', tr: 'Koyu Temalar', en: 'Dark Themes' },
  { id: 'light', tr: 'Açık Tema', en: 'Light Theme' },
];

export function normalizeThemeKey(saved) {
  if (saved && THEMES[saved]) return saved;
  if (saved === 'light') return 'daylight';
  if (saved === 'slate' || saved === 'ocean') return 'kanagawa';
  if (saved === 'carbon' || saved === 'softdark' || saved === 'dark') return 'graphite';
  return 'leonida';
}

export const MILESTONES = [
  { key: 'groundwork', min: 1, tr: 'Altyapı', en: 'Groundwork' },
  { key: 'exe', min: 10, tr: 'Exe Çalışıyor', en: 'Exe runs' },
  { key: 'frame', min: 20, tr: 'İlk Kare', en: 'First frame' },
  { key: 'menu', min: 30, tr: 'Ana Menü', en: 'Main menu' },
  { key: 'world', min: 40, tr: 'Oyun Dünyası', en: 'In world' },
  { key: 'playable', min: 50, tr: 'Oynanabilir', en: 'Playable' },
];

export const FALLBACK_TEAMS = [
  {
    name: 'VIctory-NVIDIA',
    progress: 90.0,
    fps: '20 FPS',
    gpu: 'NVIDIA',
    type: 'open',
    stage: 'Oynanabilir • Hikâye %80',
    updatedAt: '2026-11-27T18:00:00Z',
    url: 'https://portwatch-vi.xyz/#race',
    stars: 1826,
    commits7d: 100,
  },
  {
    name: 'CGBJ',
    progress: 89.6,
    fps: '25 FPS',
    gpu: 'Compatibility layer',
    type: 'private',
    stage: 'Oynanabilir • Hikâye %80',
    updatedAt: '2026-11-26',
    url: 'https://portwatch-vi.xyz/#race',
  },
  {
    name: 'NotNozy',
    progress: 87.1,
    fps: '16 FPS',
    gpu: 'AMD',
    type: 'private',
    stage: 'Oynanabilir • Hikâye %80',
    updatedAt: '2026-11-26',
    url: 'https://portwatch-vi.xyz/#race',
  },
  {
    name: 'darkworldhm',
    progress: 84.8,
    fps: '15 FPS',
    gpu: 'NVIDIA',
    type: 'private',
    stage: 'Oynanabilir • Hikâye %80',
    updatedAt: '2026-11-26',
    url: 'https://portwatch-vi.xyz/#race',
  },
  {
    name: 'Doomsday',
    progress: 82.1,
    fps: '4 FPS',
    gpu: 'AMD / NVIDIA',
    type: 'private',
    stage: 'Oynanabilir • Hikâye %80',
    updatedAt: '2026-11-26',
    url: 'https://portwatch-vi.xyz/#race',
  },
  {
    name: 'DexNom',
    progress: 77.4,
    fps: '3 FPS',
    gpu: 'AMD',
    type: 'open',
    stage: 'Oynanabilir • İlk Perde',
    updatedAt: '2026-11-25',
    url: 'https://github.com/DexNom/VIctory',
  },
  {
    name: 'Kelvaroq',
    progress: 68.8,
    fps: '10 FPS',
    gpu: 'NVIDIA',
    type: 'open',
    stage: 'Oynanabilir',
    updatedAt: '2026-11-26',
    url: 'https://github.com/stellarr-studio/kelvaroq',
  },
  {
    name: 'Uilian',
    progress: 59.6,
    fps: '4 FPS',
    gpu: 'NVIDIA',
    type: 'open',
    stage: 'Oynanabilir',
    updatedAt: '2026-11-25',
    url: 'https://github.com/uiliannn/VItoriaBr',
  },
];

export const FALLBACK_FEATURED_PORT = {
  name: 'RAZDA4A XEN',
  progress: 75.6,
  fps: '15-18 FPS (30-36 FG)',
  gpu: 'AMD',
  type: 'open',
  stage: 'Oynanabilir • Hazır GUI Launcher',
  releaseTag: 'Wave 13',
  stars: 374,
  url: 'https://github.com/crossducking/RAZDA4A-XEN',
  repo: 'crossducking/RAZDA4A-XEN',
  isEstimated: true,
  hasLauncher: true,
  platformTag: 'AMD RDNA2+',
  highlightsTr: [
    'Hazır .NET 8 WPF grafik başlatıcısı (RAZDA4A XEN Launcher.exe) ve sıfır gereksinimli .bat sürümüyle gelir (Wave 13)',
    'Bildirilen performans: RX 9060 XT + Ryzen 5 5600 ile 15-18 FPS (30-36 FG); Ryzen 7 7800X3D sistemde ~31 native / 62-63 FG FPS',
    '8 GB VRAM Güvenli Modu (RX 7600: ~12.7 native / 24.8 FG), Shader ön-ısınma aracı, canlı shader derleme uyarısı ve Linux/Proton desteği sunar',
    'GPL-3.0 açık kaynak VIctory çatalı: tam Rust kaynak kodu dev dalında açık; .bat/.ps1 betikleri temiz ve SHA256SUMS.txt doğrulamalı',
  ],
  blockersTr: [
    'Yalnızca AMD RDNA2 / RDNA3 / RDNA4 (RX 6000 / 7000 / 9000) kartlarda çalışır — NVIDIA ve Intel Arc şu an desteklenmez',
    'Hazır .exe dosyaları dijital imzasızdır (Windows Defender uyarı verebilir); en yüksek güvenlik için SHA256SUMS.txt doğrulaması yapın veya dev dalından kendiniz derleyin',
    'Işın izleme (Ray Tracing) kapalıdır ve FPS verileri geliştirici bildirimidir (PortWatch tarafından henüz bağımsız doğrulanmadı)',
  ],
  summaryTr:
    'RAZDA4A XEN (Wave 13), AMD RDNA2+ (RX 6000/7000/9000) için optimize edilmiş hazır Windows GUI başlatıcılı açık kaynak VIctory çatalı. 6 çekirdekli sistemde 15-18 FPS (30-36 FG), X3D sistemde ~31 native (62-63 FG) FPS bildiriyor; 8 GB VRAM güvenli modu var. (Yalnızca AMD · İmzasız .exe · Bağımsız doğrulanmadı)',
  summaryEn:
    'RAZDA4A XEN (Wave 13) is an open-source VIctory fork tuned for AMD RDNA2+ with a prebuilt Windows GUI launcher and 8 GB VRAM Safe Mode (15-18 native / 30-36 FG; up to ~31 native on X3D). AMD-only, unsigned .exe, self-reported.',
};

export const FALLBACK_TEAM_BARS = [
  {
    id: 'whiplash',
    name: 'Whiplash',
    avatarUrl: 'https://portwatch-vi.xyz/assets/img/efforts/whiplash.jpg',
    progress: 60,
    fpsLabel: '17 / 30 FPS',
    updatedAt: '2026-11-28',
    summaryEn:
      'Whiplash is working towards a 1:1 match with the Xbox Series X version on medium-to-high-end PCs: rendered at 1440p native, like the Series X, then upscaled to 4K.',
    summaryTr:
      "Whiplash, orta-üst seviye PC'lerde Xbox Series X sürümüyle birebir (1:1) uyum hedefliyor: Series X gibi doğal 1440p çözünürlükte işlenip 4K'ya yükseltiliyor.",
    parts: [
      {
        label: 'Visual parity',
        labelTr: 'Görüntü Eşitliği',
        note: 'How close the picture is to the Series X version, including ray tracing on NVIDIA and AMD.',
        noteTr: "Görüntünün NVIDIA ve AMD'de ışın izleme (ray tracing) dahil Series X sürümüne ne kadar yakın olduğu.",
        pct: 90,
        weightPct: 47,
        current: null,
        target: null,
        unit: '',
      },
      {
        label: 'Memory usage',
        labelTr: 'Bellek (VRAM) Kullanımı',
        note: 'Video memory use is still too high for most graphics cards, which keeps the build out of reach for most PCs.',
        noteTr: "VRAM (video belleği) tüketimi çoğu ekran kartı için hâlâ çok yüksek; bu yüzden yapı şimdilik çoğu PC'de çalıştırılamıyor.",
        pct: 20,
        weightPct: 33,
        current: null,
        target: null,
        unit: '',
      },
      {
        label: 'Frame rate',
        labelTr: 'Kare Hızı (FPS)',
        note: 'Frames per second now, against the 30 fps goal.',
        noteTr: '30 FPS hedefine kıyasla mevcut kare hızı.',
        pct: 57,
        weightPct: 20,
        current: 17,
        target: 30,
        unit: 'fps',
      },
    ],
    goals: [
      'Windows, with possible Linux support (experimental)',
      '1440p native, upscaled to 4K',
      '1:1 visuals with the Series X',
      'Ray tracing on NVIDIA and AMD',
      'Video memory use most PCs can handle',
      '30 fps on medium-to-high-end PCs',
    ],
    goalsTr: [
      'Windows desteği (deneysel Linux desteği ihtimaliyle)',
      'Doğal 1440p işleme, 4K yükseltme (upscale)',
      'Xbox Series X ile birebir (1:1) görüntü kalitesi',
      'NVIDIA ve AMD ekran kartlarında ışın izleme (Ray Tracing)',
      "Çoğu PC'nin kaldırabileceği seviyede VRAM kullanımı",
      "Orta-üst seviye PC'lerde 30 FPS",
    ],
    later: 'The team might work on support for lower-end PCs.',
    laterTr: "Ekip ilerleyen aşamada daha düşük seviye PC'ler için de destek üzerinde çalışabilir.",
    access:
      "Private: builds are shared only inside the team's own server and aren't hosted or linked anywhere, so a download that claims to be Whiplash's is fake.",
    accessTr:
      'Özel Yapı: Derlemeler yalnızca ekibin kendi sunucusunda paylaşılır; hiçbir yerde barındırılmaz veya link verilmez. İnternette Whiplash adına paylaşılan tüm indirme dosyaları sahtedir.',
    isPrivate: true,
    url: 'https://portwatch-vi.xyz/',
  },
];

export const FALLBACK_DMCA = [
  {
    name: 'Leonida',
    date: '2026-11-24',
    noteTr: 'Take-Two DMCA bildirimiyle GitHub ana deposu ve 3.007 fork devre dışı bırakıldı.',
    noteEn: 'Main GitHub repo and 3,007 forks disabled via Take-Two DMCA notice.',
    url: '',
  },
  {
    name: 'ZETTROX',
    date: '2026-11-25',
    noteTr: 'Eski %64.2 lideri Zettrox/ztrx deposu GitHub üzerinden silindi.',
    noteEn: 'Former 64.2% leader Zettrox/ztrx repository was removed from GitHub.',
    url: '',
  },
];

export const CHANGELOG = [
  {
    version: 'v4.3.1',
    dateTr: '28 Kasım 2026',
    dateEn: 'November 28, 2026',
    itemsTr: [
      'gta6takip.blog yeni alan adı karşılama kutusu ("Bir Daha Gösterme" seçeneği ve tek tıkla link kopyalama ile) eklendi.',
      'Öne Çıkan Proje kartı canlı GitHub takibiyle RAZDA4A XEN (Wave 13 · %75.6 tahmini bar · AMD RDNA2+ · hazır GUI Launcher) olarak güncellendi; ScarlettPort aktif ekipler listesinde takip edilmeye devam ediyor.',
    ],
    itemsEn: [
      'Added the gta6takip.blog domain welcome modal with a persistent "Don\'t show again" option and one-click URL copy.',
      'Updated Spotlight project to RAZDA4A XEN (Wave 13 · 75.6% estimated progress bar · AMD RDNA2+ · prebuilt GUI Launcher) with live GitHub sync while keeping ScarlettPort tracked in the leaderboard.',
    ],
  },
  {
    version: 'v4.3.0',
    dateTr: '28 Kasım 2026',
    dateEn: 'November 28, 2026',
    itemsTr: [
      "PortWatch'un yeni Özel Ekip Hedef Takibi (teamBars — Whiplash ve gelecekte eklenecek diğer ekipler) veri akışı otomasyona bağlandı; görüntü eşitliği, VRAM ve FPS alt metrikleriyle %100 Türkçe ve canlı güncellenir.",
    ],
    itemsEn: [
      'Connected PortWatch teamBars live telemetry (Whiplash and any future teams) with weighted sub-metrics, goals, and automatic Turkish localization.',
    ],
  },
  {
    version: 'v4.2.2',
    dateTr: '28 Kasım 2026',
    dateEn: 'November 28, 2026',
    itemsTr: [
      'Özel alan adına geçiş tamamlandı: SEO canonical, sitemap.xml, robots.txt, OpenGraph ve WhatsApp/X paylaşım linkleri https://gta6takip.blog adresine güncellendi.',
      'Netlify reklam rozeti kaldırıldığı için masaüstü, mobil ve tam ekran Canlı Sohbet paneli tam boya genişletilerek ferahlatıldı.',
    ],
    itemsEn: [
      'Completed custom domain migration: updated SEO canonical, sitemap.xml, robots.txt, OpenGraph, and WhatsApp/X share links to https://gta6takip.blog.',
      'Reclaimed bottom viewport space on desktop, mobile, and fullscreen Live Chat panels.',
    ],
  },
  {
    version: 'v4.2.1',
    dateTr: '28 Kasım 2026',
    dateEn: 'November 28, 2026',
    itemsTr: [
      'Ekip detay penceresindeki maddeler için çok kaynaklı %100 Türkçe otomatik çeviri motoru, anlık önbellek koruması ve pencere içi kendi kendini onaran çeviri yedeği eklendi.',
      'Netlify sunucularında soğuk başlangıçta çevirinin geçici İngilizce kalma sorunu kalıcı olarak giderildi.',
    ],
    itemsEn: [
      'Upgraded automatic Turkish translation engine for team detail modals with multi-provider fallback, pre-warmed cache, CDN cache protection, and on-demand self-healing translation.',
      'Resolved intermittent English fallback in team detail modals during Netlify cold starts.',
    ],
  },
  {
    version: 'v4.2.0',
    dateTr: '28 Kasım 2026',
    dateEn: 'November 28, 2026',
    itemsTr: [
      'Netlify altyapısı tam uyumu: Ülke tespiti (x-nf-geo), gerçek ziyaretçi IP koruması, CDN önbellek başlıkları ve çalışma zamanı Supabase Realtime/Çevrimiçi sayacı yedeği eklendi.',
      'Mobil navigasyon üst sabit bara taşındı ve masaüstü/mobil sohbet kutusuna alt-sağ güvenlik boşluğu eklendi — Netlify rozeti artık hiçbir butonu kapatmıyor.',
      'Site paylaşım linkleri, SEO canonical/sitemap ve PWA tema renkleri gta6takip.netlify.app alan adına güncellendi.',
    ],
    itemsEn: [
      'Full Netlify compatibility: added x-nf-geo country detection, client IP headers, Netlify CDN cache headers, and runtime Supabase Realtime/Presence fallback.',
      'Moved mobile 4-tab navigation into the sticky top header and added bottom clearance to desktop/mobile Live Chat so the Netlify badge never blocks controls.',
      'Updated canonical URLs, sitemap, share links, and PWA manifest colors for gta6takip.netlify.app.',
    ],
  },
  {
    version: 'v4.1.0',
    dateTr: '28 Kasım 2026',
    dateEn: 'November 28, 2026',
    itemsTr: [
      'OKLCH & APCA renk bilimiyle kalibre edilmiş 6 yeni tema eklendi: Varsayılan Leonida Alacakaranlık, Telemetri Grafit, Gece Okyanusu, Editoryal Gün Işığı ve özel Göz Dostu temalar (Sıcak Mürekkep & Sepya Kâğıt).',
      'Tema menüsü Göz Dostu / Koyu / Açık kategorileri ve canlı 3 renkli önizleme çipleriyle yenilendi.',
      'Üst menü geniş ekranlarda ve 1280px dizüstülerde sıfır çakışma verecek şekilde optimize edildi; 1/2/3 sıralamalarına minimal geometrik simgeler eklendi.',
    ],
    itemsEn: [
      'Added 6 OKLCH/APCA calibrated themes: Leonida Twilight (default), Telemetry Graphite, Kanagawa Ocean, Editorial Daylight, plus dedicated Eye-Comfort Warm Ink and Sepia Paper modes.',
      'Upgraded the theme menu with Eye Comfort / Dark / Light grouping and 3-chip live swatches.',
      'Refined responsive header spacing across 1024px–1536px viewports and added minimal geometric rank emblems.',
    ],
  },
  {
    version: 'v4.0.0',
    dateTr: '28 Kasım 2026',
    dateEn: 'November 28, 2026',
    itemsTr: [
      'Sıfırdan Modern Teknik Editoryal tasarım: SteamDB / Digital Foundry kalitesinde tutarlı koyu (Karbon, Arduvaz) ve Stüdyo Açık temaları; neon parıltılar, çakışan eski rozetler ve sahte grafik kaldırıldı.',
      'Masaüstünde Yarış Tablosu + sağda açılıp kapanabilen Canlı Sohbet paneli eklendi; ayrıca tam ekran ferah Sohbet sekmesi yenilendi.',
      'Yeni nesil Canlı Sohbet: Tek sade başlık, ekranı zıplatmayan yüzen tepki/yanıt menüsü, düz kenarlı temiz yetkili vurguları, otomatik daralan rumuz rozeti ve @etiket vurgusu.',
      'Şeffaf kalan üst bar / mobil alt bar hatası, klavye Esc kapatma desteği, canlı DMCA verisi ve tüm SEO alt sayfalarının tema uyumu düzeltildi.',
    ],
    itemsEn: [
      'Complete Modern Technical Editorial redesign across Carbon Dark, Slate Dark, and Studio Light themes — removed neon relics, visual clutter, and hardcoded fake trendlines.',
      'Added a collapsible Live Chat side dock alongside the desktop Leaderboard plus a spacious full-height Live Chat view.',
      'Rebuilt Live Chat UX: single clean header, zero layout-shift floating reaction/reply bar, crisp flat role indicators, compact nickname chip, and @mention highlights.',
      'Fixed transparent sticky header & mobile bottom bar bleed-through, Escape modal dismissal, live DMCA feed rendering, and unified SEO subpages.',
    ],
  },
  {
    version: 'v3.1.0',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'Katmanlı koyu yüzey basamakları ve haber/DMCA kategorilerine anlamlı simgeler eklendi.',
    ],
    itemsEn: [
      'Introduced layered dark surface stepping and semantic icons across News & DMCA.',
    ],
  },
  {
    version: 'v2.0.0',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      '4 sekmeli yapı (Yarış, Sohbet, Sistem Testi, Haber & DMCA), otomatik haber akışı ve Ekip Detay çekmecesi eklendi.',
    ],
    itemsEn: [
      'Added 4-tab layout, automated News & DMCA feed, and Team Detail Drawer.',
    ],
  },
  {
    version: 'v1.2.0',
    dateTr: '27 Kasım 2026',
    dateEn: 'November 27, 2026',
    itemsTr: [
      'ScarlettPort ve SlaktarnVI otomatik GitHub takibi, PWA desteği ve Sistem Testi aracı yayınlandı.',
    ],
    itemsEn: [
      'Launched automatic GitHub tracking for ScarlettPort & SlaktarnVI, PWA support, and System Check.',
    ],
  },
];

export const COUNTRY_FALLBACK_NAMES = {
  TR: { tr: 'Türkiye', en: 'Turkey' },
  DE: { tr: 'Almanya', en: 'Germany' },
  IE: { tr: 'İrlanda', en: 'Ireland' },
  US: { tr: 'ABD', en: 'United States' },
  GB: { tr: 'Birleşik Krallık', en: 'United Kingdom' },
  NL: { tr: 'Hollanda', en: 'Netherlands' },
  FR: { tr: 'Fransa', en: 'France' },
  AZ: { tr: 'Azerbaycan', en: 'Azerbaijan' },
  PL: { tr: 'Polonya', en: 'Poland' },
  RU: { tr: 'Rusya', en: 'Russia' },
  BR: { tr: 'Brezilya', en: 'Brazil' },
  CA: { tr: 'Kanada', en: 'Canada' },
};

export const GPU_BENCHMARKS = [
  { name: 'AMD RX 9070 XT', arch: 'RDNA 4', fps: '22 FPS', vendor: 'amd' },
  { name: 'NVIDIA RTX 50 Serisi', arch: 'Blackwell', fps: '15–24 FPS', vendor: 'nvidia' },
  { name: 'AMD RX 7900 XTX', arch: 'RDNA 3', fps: '16 FPS', vendor: 'amd' },
  { name: 'NVIDIA RTX 4070', arch: 'Ada', fps: '3–10 FPS', vendor: 'nvidia' },
  { name: 'NVIDIA RTX 5060 Ti', arch: 'Blackwell', fps: '4 FPS', vendor: 'nvidia' },
];

export const GPU_PRESETS = [
  { id: 'rx9070xt', label: 'AMD RX 9070 XT / 9070', vendor: 'amd', tier: 4, defaultVram: 16 },
  { id: 'rx7900xtx', label: 'AMD RX 7900 XTX / 7900 XT', vendor: 'amd', tier: 4, defaultVram: 16 },
  { id: 'rx7800xt', label: 'AMD RX 7800 XT / 7700 XT', vendor: 'amd', tier: 3, defaultVram: 12 },
  { id: 'rx6700xt', label: 'AMD RX 6800 / 6700 XT', vendor: 'amd', tier: 3, defaultVram: 12 },
  { id: 'rx6600', label: 'AMD RX 6600 / 6600 XT', vendor: 'amd', tier: 2, defaultVram: 8 },
  { id: 'rtx5080', label: 'NVIDIA RTX 5090 / 5080 / 5070', vendor: 'nvidia', tier: 4, defaultVram: 16 },
  { id: 'rtx5060', label: 'NVIDIA RTX 5060 / 5060 Ti', vendor: 'nvidia', tier: 3, defaultVram: 12 },
  { id: 'rtx4080', label: 'NVIDIA RTX 4090 / 4080 / 4070 Ti', vendor: 'nvidia', tier: 4, defaultVram: 16 },
  { id: 'rtx4070', label: 'NVIDIA RTX 4070 / 4060 Ti', vendor: 'nvidia', tier: 3, defaultVram: 12 },
  { id: 'rtx4060', label: 'NVIDIA RTX 4060 / 4050', vendor: 'nvidia', tier: 2, defaultVram: 8 },
  { id: 'rtx3080', label: 'NVIDIA RTX 3080 / 3090', vendor: 'nvidia', tier: 3, defaultVram: 12 },
  { id: 'rtx3060', label: 'NVIDIA RTX 3060 / 3060 Ti', vendor: 'nvidia', tier: 2, defaultVram: 8 },
  { id: 'rtx3050', label: 'NVIDIA RTX 3050 / 3050 Ti', vendor: 'nvidia', tier: 1, defaultVram: 4 },
  { id: 'rtx2060', label: 'NVIDIA RTX 2070 / 2060', vendor: 'nvidia', tier: 1, defaultVram: 6 },
  { id: 'gtx1650', label: 'NVIDIA GTX 1660 / 1650 Ti / 1060', vendor: 'nvidia', tier: 1, defaultVram: 4 },
  { id: 'igpu', label: 'Dahili GPU (Intel HD / UHD / Iris / Vega)', vendor: 'igpu', tier: 0, defaultVram: 4 },
];

export function evaluateSystemForPort(gpuId, vramGb, ramGb, lang, teams = []) {
  const gpu = GPU_PRESETS.find((g) => g.id === gpuId) || GPU_PRESETS[12];
  const isTr = lang === 'tr';

  const topAmd = teams
    .filter((t) => String(t.gpu || '').toLowerCase().includes('amd'))
    .slice(0, 2)
    .map((t) => t.name);
  const topNvidia = teams
    .filter((t) => String(t.gpu || '').toLowerCase().includes('nvidia'))
    .slice(0, 2)
    .map((t) => t.name);

  const amdWatch = topAmd.length > 0 ? topAmd.join(' / ') : 'NotNozy / DexNom';
  const nvidiaWatch = topNvidia.length > 0 ? topNvidia.join(' / ') : 'VIctory-NVIDIA / Kelvaroq';

  if (gpu.tier === 0 || vramGb <= 6) {
    return {
      level: 'low',
      badge: isTr ? 'Mevcut Portlarda Yetersiz' : 'Insufficient for Current Ports',
      fps: isTr ? 'Açılmaz / Çökme Riski' : 'Won’t Boot / Crash Likely',
      text: isTr
        ? `Resmi olmayan uyumluluk katmanları henüz optimize olmadığı için 12+ GB VRAM ve 30+ GB RAM tüketiyor. ${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM) ile oyun dünyasında bellek taşması ve çökme yaşanır. Resmi PC sürümü çok daha düşük gereksinimlerle optimize edilecektir.`
        : `Unofficial compatibility layers are currently unoptimized and require 12+ GB VRAM and 30+ GB RAM. With ${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM), out-of-memory crashes are expected in-world. The official PC version will be far better optimized.`,
      watchTeam: gpu.vendor === 'amd' ? amdWatch : nvidiaWatch,
    };
  }

  if (vramGb <= 8 || ramGb <= 16) {
    return {
      level: 'mid',
      badge: isTr ? 'Sınırda · Menü / İlk Sahne' : 'Borderline · Menu / Early Scene',
      fps: isTr ? 'Tahmini 3–10 FPS' : 'Est. 3–10 FPS',
      text: isTr
        ? `${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM) ile ana menü ve ilk iç mekân sahneleri denenebilir; ancak 8 GB VRAM ve 16 GB RAM şu an açık dünyada ciddi bellek darboğazı oluşturuyor. Bellek optimizasyon yamalarını beklemek en sağlıklısı.`
        : `${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM) may reach menus or early indoor scenes, but 8 GB VRAM / 16 GB RAM hits severe memory limits in open world right now. Wait for memory optimization patches.`,
      watchTeam: gpu.vendor === 'amd' ? `${amdWatch} (AMD)` : `${nvidiaWatch} (NVIDIA)`,
    };
  }

  if (gpu.vendor === 'amd') {
    return {
      level: 'high',
      badge: isTr ? 'En Uyumlu Profil (AMD)' : 'Best Match (AMD)',
      fps:
        gpu.tier >= 4
          ? isTr
            ? 'Tahmini 16–22+ FPS'
            : 'Est. 16–22+ FPS'
          : isTr
            ? 'Tahmini 10–16 FPS'
            : 'Est. 10–16 FPS',
      text: isTr
        ? `Konsollar AMD RDNA2 mimarisi kullandığı için ${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM) shader uyumluluğu açısından en avantajlı donanım sınıfında. Açık kaynak ve topluluk testlerinin önemli kısmı bu mimaride ilerliyor.`
        : `Because consoles use AMD RDNA2 graphics, ${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM) maps most directly to leaked console shaders and sits in the strongest compatibility tier.`,
      watchTeam: `${amdWatch} (AMD)`,
    };
  }

  return {
    level: 'good',
    badge: isTr ? 'Oynanabilir Seviye (NVIDIA)' : 'Playable Tier (NVIDIA)',
    fps:
      gpu.tier >= 4
        ? isTr
          ? 'Tahmini 15–24 FPS'
          : 'Est. 15–24 FPS'
        : isTr
          ? 'Tahmini 8–15 FPS'
          : 'Est. 8–15 FPS',
    text: isTr
      ? `${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM) bellek eşiğini rahatça karşılıyor. NVIDIA kartlarda ekstra RDNA2→DXIL shader dönüşümü gerekse de son NVIDIA odaklı çatallar 20+ FPS seviyesine ulaştı.`
      : `${gpu.label} (${vramGb} GB VRAM, ${ramGb} GB RAM) clears current memory demands. Even with extra RDNA2-to-DXIL shader translation, dedicated NVIDIA forks have recently crossed 20 FPS.`,
    watchTeam: `${nvidiaWatch} (NVIDIA)`,
  };
}

export function playChatChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!window.__gta6AudioCtx) {
      window.__gta6AudioCtx = new AudioCtx();
    }
    const ctx = window.__gta6AudioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.06, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.065);
    gain2.gain.setValueAtTime(0.001, now + 0.065);
    gain2.gain.linearRampToValueAtTime(0.055, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.065);
    osc2.stop(now + 0.23);
  } catch {
    // Ignore audio permission errors
  }
}

const AVATAR_TONES_DARK = [
  { bg: 'bg-[#2C2024]', text: 'text-[#F490A4]', ring: 'border-[#4D303A]' },
  { bg: 'bg-[#2B241A]', text: 'text-[#F2B86B]', ring: 'border-[#4B3B25]' },
  { bg: 'bg-[#19282E]', text: 'text-[#6CCFF6]', ring: 'border-[#294754]' },
  { bg: 'bg-[#252031]', text: 'text-[#B89DF5]', ring: 'border-[#3E3356]' },
  { bg: 'bg-[#1A2B24]', text: 'text-[#6CD9A6]', ring: 'border-[#2A4B3D]' },
  { bg: 'bg-[#1E2533]', text: 'text-[#89B4FA]', ring: 'border-[#303E59]' },
];

const AVATAR_TONES_LIGHT = [
  { bg: 'bg-[#FCE8EC]', text: 'text-[#A62846]', ring: 'border-[#F3C5CF]' },
  { bg: 'bg-[#FBF0DE]', text: 'text-[#9A5B0A]', ring: 'border-[#EED5AD]' },
  { bg: 'bg-[#E3F3FA]', text: 'text-[#0E6385]', ring: 'border-[#B9E0F0]' },
  { bg: 'bg-[#EFEAFC]', text: 'text-[#5B35A6]', ring: 'border-[#D7C9F6]' },
  { bg: 'bg-[#E3F6ED]', text: 'text-[#146E47]', ring: 'border-[#B8E6D0]' },
  { bg: 'bg-[#E7EEFA]', text: 'text-[#244E9C]', ring: 'border-[#C2D4F4]' },
];

export function getNickTone(name, isLight) {
  const str = String(name || 'U');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  const list = isLight ? AVATAR_TONES_LIGHT : AVATAR_TONES_DARK;
  return list[hash % list.length];
}

export function getCountryLabel(code, lang) {
  const cc = String(code || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return lang === 'tr' ? 'Diğer' : 'Other';
  try {
    if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
      const dn = new Intl.DisplayNames([lang === 'tr' ? 'tr' : 'en'], { type: 'region' });
      const name = dn.of(cc);
      if (name) return name;
    }
  } catch {
    // Fallback
  }
  return COUNTRY_FALLBACK_NAMES[cc]?.[lang] || cc;
}

export function guessClientCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Istanbul')) return 'TR';
    const navLang = (typeof navigator !== 'undefined' && navigator.language) || '';
    const parts = navLang.split('-');
    if (parts[1] && /^[A-Za-z]{2}$/.test(parts[1])) return parts[1].toUpperCase();
    if (parts[0]?.toLowerCase() === 'tr') return 'TR';
  } catch {
    // Default TR
  }
  return 'TR';
}

export function formatTeamUpdated(rawDate, lang) {
  if (!rawDate) return '';
  const str = String(rawDate).trim();
  const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(`${str}T12:00:00Z`);
    if (Number.isNaN(d.getTime())) return str;
    return d.toLocaleDateString(locale, {
      timeZone: 'Europe/Istanbul',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str;
  const datePart = d.toLocaleDateString(locale, {
    timeZone: 'Europe/Istanbul',
    day: 'numeric',
    month: 'short',
  });
  const timePart = d.toLocaleTimeString(locale, {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${datePart} · ${timePart}`;
}

export function formatChatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatNewsRelativeTime(isoString, currentLang) {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return currentLang === 'tr' ? 'Az önce' : 'Just now';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 2) return currentLang === 'tr' ? 'Az önce' : 'Just now';
  if (mins < 60) return currentLang === 'tr' ? `${mins} dk önce` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return currentLang === 'tr' ? `${hours} sa önce` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return currentLang === 'tr' ? `${days} gün önce` : `${days}d ago`;
  return new Date(isoString).toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
}

export function localizeDynamicText(text, lang) {
  if (!text) return '';
  if (lang === 'tr') {
    return String(text)
      .replace(/Playable/gi, 'Oynanabilir')
      .replace(/Free Roam/gi, 'Serbest Dolaşım')
      .replace(/First Act/gi, 'İlk Perde')
      .replace(/Private Build/gi, 'Özel Yapı')
      .replace(/Opening Scene/gi, 'Açılış Sahnesi')
      .replace(/Prologue Cleared/gi, 'Önsöz Geçildi')
      .replace(/Prison Scene/gi, 'Hapishane Sahnesi')
      .replace(/In the World/gi, 'Oyun Dünyası')
      .replace(/Main Menu/gi, 'Ana Menü')
      .replace(/First Frame/gi, 'İlk Kare')
      .replace(/Exe Runs/gi, 'Exe Çalışıyor')
      .replace(/Groundwork/gi, 'Altyapı')
      .replace(/Compatibility layer/gi, 'Uyumluluk Katmanı')
      .replace(/Static recompilation/gi, 'Statik Recomp')
      .replace(/HLE emulator/gi, 'HLE Emülatör')
      .replace(/Direct translation/gi, 'Doğrudan Çeviri')
      .replace(/RTX 50 Series/gi, 'RTX 50 Serisi');
  }
  return String(text)
    .replace(/Oynanabilir/gi, 'Playable')
    .replace(/Serbest Dolaşım/gi, 'Free Roam')
    .replace(/Hikâye Yarısı/gi, 'Half the Story')
    .replace(/Hikâye/gi, 'Story')
    .replace(/İlk Perde/gi, 'First Act')
    .replace(/İlk Sahne/gi, 'First Scene')
    .replace(/\(Sesli\)/gi, '(With Sound)')
    .replace(/Ara Sahne/gi, 'Cutscenes')
    .replace(/Menü/gi, 'Menu')
    .replace(/Özel Yapı/gi, 'Private Build')
    .replace(/Açılış Sahnesi/gi, 'Opening Scene')
    .replace(/Önsöz Geçildi/gi, 'Prologue Cleared')
    .replace(/Hapishane Sahnesi/gi, 'Prison Scene')
    .replace(/Oyun Dünyası/gi, 'In the World')
    .replace(/Ana Menü/gi, 'Main Menu')
    .replace(/İlk Kare/gi, 'First Frame')
    .replace(/Exe Çalışıyor/gi, 'Exe Runs')
    .replace(/Altyapı/gi, 'Groundwork')
    .replace(/RTX 50 Serisi/gi, 'RTX 50 Series')
    .replace(/Bağımsız/gi, 'Independent')
    .replace(/Ön Aşama/gi, 'Early Stage')
    .replace(/GDK Örnekleri/gi, 'GDK Samples')
    .replace(/HLE Emülatör/gi, 'HLE Emulator')
    .replace(/Statik Recomp/gi, 'Static Recomp')
    .replace(/Tanılama/gi, 'Diagnostics')
    .replace(/C# Katmanı/gi, 'C# Layer')
    .replace(/Rumble Yayını/gi, 'Rumble Stream')
    .replace(/Açık Kaynak/gi, 'Open Source')
    .replace(/PortWatch Canlı/gi, 'PortWatch Live')
    .replace(/4K İstem/gi, '4K Prompt')
    .replace(/%(\d+(?:[.,]\d+)?)/g, '$1%');
}

export function buildLeaderSummary(team, lang) {
  const fpsStr = localizeDynamicText(team.fps || '—', lang);
  const gpuStr = team.gpu ? localizeDynamicText(team.gpu, lang) : '';
  const stageStr = team.stage ? localizeDynamicText(team.stage, lang) : '';
  const isOpen = team.type !== 'private';

  if (lang === 'tr') {
    const gpuPhrase = gpuStr ? `${gpuStr} kartlarda ` : '';
    const openPhrase = isOpen
      ? 'Kaynak kodu GitHub üzerinden herkese açık geliştiriliyor.'
      : 'Şu an kapalı (özel) bir geliştirme yapısı olarak ilerliyor.';
    const stagePhrase = stageStr ? ` (${stageStr})` : '';
    return `${team.name}, %${team.progress} skorla yarışta 1. sırada. Oyun ${gpuPhrase}ortalama ${fpsStr} civarında oynanabiliyor${stagePhrase}. ${openPhrase} Stabil 30+ FPS herkese açık sürüm için optimizasyon sürüyor.`;
  }

  const gpuPhraseEn = gpuStr ? `on ${gpuStr} GPUs ` : '';
  const openPhraseEn = isOpen
    ? 'Source code is developed openly on GitHub.'
    : 'Currently developed as a private build.';
  const stagePhraseEn = stageStr ? ` (${stageStr})` : '';
  return `${team.name} leads at ${team.progress}%. GTA VI runs ${gpuPhraseEn}around ${fpsStr}${stagePhraseEn}. ${openPhraseEn} Optimization toward a stable public 30+ FPS build is ongoing.`;
}

export function extractPeakFps(teams) {
  let max = 0;
  for (const t of teams) {
    if (Number(t.progress) < 50) continue;
    const cleaned = String(t.fps || '')
      .toLowerCase()
      .replace(/\(\s*\d+[^)]*\)/g, ' ');
    if (cleaned.includes('men') || cleaned.includes('ara sahne') || cleaned.includes('cutscene')) continue;
    const matches = cleaned.match(/\d+/g);
    if (matches) {
      for (const m of matches) {
        const val = Number(m);
        if (val > max && val <= 60) max = val;
      }
    }
  }
  return max > 0 ? max : 25;
}
