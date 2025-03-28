import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ethan Trang',
  description: `AI product builder and technologist based in Sydney, with experience at Series A startups and unicorns. Exploring the intersection of artificial intelligence and business innovation.`
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

