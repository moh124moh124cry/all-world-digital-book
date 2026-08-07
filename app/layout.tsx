import './globals.css'
import Script from 'next/script'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'All World Digital Book',
  description: 'Read your books as if you held them in your hands',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
