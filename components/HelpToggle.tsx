'use client'

import { useState } from 'react'

interface HelpToggleProps {
  lines: string[]
}

export function HelpToggle({ lines }: HelpToggleProps) {
  const [open, setOpen] = useState(false)
  return (
    <span className="inline-flex items-center">
      <button
        aria-label={open ? 'Hide help' : 'Show help'}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        ?
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-72 rounded-xl border border-slate-700 bg-slate-800 p-3 shadow-xl text-xs text-slate-300 leading-relaxed">
          {lines.map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
              {line}
            </p>
          ))}
        </div>
      )}
    </span>
  )
}
