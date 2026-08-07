import './globals.css'

export const metadata = {
  title: 'All World Digital Book',
  description: 'منصتك الرقمية لقراءة الكتب',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  )
}
