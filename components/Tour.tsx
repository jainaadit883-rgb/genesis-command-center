'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STEPS = [
  {
    title: 'Welcome to GENESIS Command Center',
    body: "This is SuperLiving's growth hub for making GENESIS go viral on X, Reddit, and LinkedIn — and turning that attention into sign-ups at genesis.superliving.ai. Everything you need is in the left nav.",
  },
  {
    title: 'Start with real data',
    body: 'Head to the X, Reddit, or LinkedIn pages and hit "Refresh posts" to load the latest viral AI-video content. All posts are scored by virality automatically.',
  },
  {
    title: 'Learn what works',
    body: 'Once posts are loaded, click "Explain why top posts went viral" to get AI teardowns, then "Summarise what works on X" for a pattern you can apply to your own content.',
  },
  {
    title: 'Generate and log ideas',
    body: 'Visit the Ideas page to generate a batch of post ideas built from what\'s going viral. Save the best ones, get SuperLiving\'s approval, then log each experiment in Targets to track results.',
  },
]

const STORAGE_KEY = 'genesis_tour_dismissed'

export function Tour() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true)
      }
    } catch {}
  }, [])

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {}
  }

  function restart() {
    setStep(0)
    setVisible(true)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome tour"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-500 font-medium">
            Step {step + 1} of {STEPS.length}
          </span>
          <button
            onClick={dismiss}
            aria-label="Skip tour"
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            Skip tour
          </button>
        </div>

        <div className="mb-1 flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <h2 className="mt-5 text-lg font-semibold text-slate-100">{current.title}</h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">{current.body}</p>

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Back
            </button>
          )}
          {isLast ? (
            <button
              onClick={dismiss}
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Get started
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function TourTrigger() {
  function restart() {
    try {
      localStorage.removeItem(STORAGE_KEY)
      window.location.reload()
    } catch {}
  }
  return (
    <button
      onClick={restart}
      className="text-xs text-slate-500 hover:text-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
    >
      Take the tour
    </button>
  )
}
