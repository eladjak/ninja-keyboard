import type { Metadata, Viewport } from 'next'
import { heebo, inter, assistant } from '@/lib/fonts'
import { AppProviders } from '@/components/providers/app-providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'נינג\'ה מקלדת | לימוד הקלדה בעברית',
  description:
    'אפליקציית לימוד הקלדה בעברית לילדים ונוער. למדו להקליד מהר ובדיוק עם משחקים, אתגרים ותרגולים מותאמים אישית.',
  manifest: '/manifest.json',
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
