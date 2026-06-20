import type { Metadata } from 'next'
import { EB_Garamond, DM_Sans } from 'next/font/google'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'
import './globals.css'

const ebGaramond = EB_Garamond({
  variable: '--font-eb-garamond',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  description: SITE_TAGLINE,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${ebGaramond.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-surface text-on-surface antialiased">
        {children}
      </body>
    </html>
  )
}
