import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ethan Trang',
  description: `I'm the CEO and founder of Fetchr, an AI assistant that shops for you, starting with apparel.

  I've previously built companies in e-commerce software for businesses and consumers, scaling to $1.5M ARR and exiting for $9M while in high-school.

  I'm based in SF and like to run, play poker, and eat all kinds of food. Reach out if you want to chat, you can usually find me on Twitter.`
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

