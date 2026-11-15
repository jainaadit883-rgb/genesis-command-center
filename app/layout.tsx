import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { DesktopNav, MobileHeader } from '@/components/Nav'
import { Tour } from '@/components/Tour'
import { StoreProvider } from '@/lib/store'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'GENESIS Command Center',
  description:
    "SuperLiving's growth command center for making GENESIS go viral and driving sign-ups.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-slate-950 text-slate-100 antialiased">
        <StoreProvider>
          <Tour />
          <MobileHeader />
          <div className="flex min-h-screen">
            <DesktopNav />
            <main className="flex-1 min-w-0 pt-14 lg:pt-0">{children}</main>
          </div>
        </StoreProvider>
      </body>
    </html>
  )
}
