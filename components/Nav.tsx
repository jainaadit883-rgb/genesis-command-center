'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { TourTrigger } from './Tour'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/targets', label: 'Targets & Success', icon: '◎' },
  { href: '/x', label: 'X (Twitter)', icon: '𝕏' },
  { href: '/reddit', label: 'Reddit', icon: '◉' },
  { href: '/linkedin', label: 'LinkedIn', icon: '🔗' },
  { href: '/leads', label: 'Freelance Leads', icon: '◈' },
  { href: '/ideas', label: 'Idea Generator', icon: '✦' },
]

export function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden lg:flex flex-col w-56 shrink-0 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-slate-800">
          <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
            SuperLiving
          </span>
          <h1 className="mt-0.5 text-sm font-bold text-slate-100 leading-tight">
            GENESIS Command Center
          </h1>
        </div>

        <ul className="flex-1 py-3 space-y-0.5 px-2" role="list">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    active
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="text-base w-5 text-center" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="px-5 py-4 border-t border-slate-800 flex flex-col gap-2">
          <TourTrigger />
          <p className="text-xs text-slate-600">
            SuperLiving approves all public posts
          </p>
        </div>
      </nav>
  )
}

export function MobileHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div>
          <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
            SuperLiving
          </span>
          <span className="ml-2 text-sm font-bold text-slate-100">GENESIS</span>
        </div>
        <button
          onClick={() => setMobileOpen(o => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          className="rounded-lg p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {mobileOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 pt-14">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav className="relative bg-slate-900 border-r border-slate-800 w-64 h-full flex flex-col">
            <ul className="flex-1 py-3 space-y-0.5 px-2" role="list">
              {NAV_ITEMS.map(item => {
                const active = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        active
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className="text-base w-5 text-center" aria-hidden="true">
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <div className="px-5 py-4 border-t border-slate-800">
              <TourTrigger />
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
