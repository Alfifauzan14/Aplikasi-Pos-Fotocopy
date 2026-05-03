import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fotocopy & ATK SMAKZIE - Layanan Print & Fotocopy Online',
  description: 'Layanan print, fotocopy, dan penjualan alat tulis kantor. Pesan online, bayar QRIS, ambil di toko.',
  keywords: 'fotocopy, print, atk, alat tulis, cetak, layanan print online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
