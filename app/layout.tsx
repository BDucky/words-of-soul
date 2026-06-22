import type { Metadata } from 'next'
import { Cormorant_Garamond, Be_Vietnam_Pro } from 'next/font/google'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'
import './globals.css'

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-be-vietnam-pro',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  description: SITE_TAGLINE,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${cormorantGaramond.variable} ${beVietnamPro.variable}`}>
      <body className="min-h-screen flex flex-col bg-surface text-on-surface antialiased">
        {children}
      </body>
    </html>
  )
}
