import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EdgeForce - AI Sports Betting Predictions',
  description: 'Beat Vegas with data-driven sports betting predictions. NFL, NBA, MLB picks powered by advanced machine learning.',
  icons: {
    icon: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
