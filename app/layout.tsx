import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import 'katex/dist/katex.min.css'
import './globals.css'

const plexSans = localFont({ src: './fonts/IBM-Plex-Sans-Variable.woff2', variable: '--font-plex-sans', weight: '100 700', display: 'swap' })

const deploymentHost = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
const metadataBase = deploymentHost
  ? new URL(deploymentHost.startsWith('http') ? deploymentHost : 'https://' + deploymentHost)
  : undefined
const shareImage = metadataBase ? new URL('/opengraph-image', metadataBase) : undefined

export const metadata: Metadata = {
  ...(metadataBase ? { metadataBase } : {}),
  title: { default: '11 October — An Open Engineering Collective', template: '%s — 11 October' },
  description: 'We investigate real engineering problems, build practical solutions, test them, and share what we learn.',
  applicationName: '11 October',
  openGraph: {
    type: 'website',
    siteName: '11 October',
    title: '11 October — An Open Engineering Collective',
    description: 'Real problems. Open engineering.',
    ...(shareImage ? { images: [{ url: shareImage, width: 1200, height: 630, alt: '11 October eclipse mark' }] } : {}),
  },
  twitter: {
    card: 'summary_large_image',
    title: '11 October — An Open Engineering Collective',
    description: 'Real problems. Open engineering.',
    ...(shareImage ? { images: [shareImage] } : {}),
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={plexSans.variable}><body>{children}</body></html>
}
