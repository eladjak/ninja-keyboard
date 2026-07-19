import type { Metadata, Viewport } from 'next'
import { heebo, inter, assistant } from '@/lib/fonts'
import { AppProviders } from '@/components/providers/app-providers'
import './globals.css'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ninja-keyboard-nine.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'נינג\'ה מקלדת | לימוד הקלדה בעברית',
  description:
    'אפליקציית לימוד הקלדה בעברית לילדים ונוער. למדו להקליד מהר ובדיוק עם משחקים, אתגרים ותרגולים מותאמים אישית.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      {
        url: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "נינג'ה מקלדת",
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: '#6C5CE7',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      data-theme="geza"
      data-scheme="default"
      suppressHydrationWarning
    >
      <body
        className={`${heebo.variable} ${inter.variable} ${assistant.variable} antialiased`}
      >
        <a href="#main-content" className="skip-nav">
          דלג לתוכן הראשי
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
