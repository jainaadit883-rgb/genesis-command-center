'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { HelpToggle } from '@/components/HelpToggle'
import { IDEA_TEMPLATES } from '@/lib/data'
import type { Platform, SavedIdea } from '@/lib/types'

const PLATFORM_LABEL: Record<Platform, string> = { x: 'X', reddit: 'Reddit', linkedin: 'LinkedIn' }
const PLATFORM_COLOR: Record<Platform, string> = {
  x: 'border-slate-700 text-slate-400',
  reddit: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  linkedin: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
}

function shuffleTemplate(templates: typeof IDEA_TEMPLATES): typeof IDEA_TEMPLATES {
  const shuffled = [...templates]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, 5)
}

export default function IdeasPage() {
  const { state, dispatch } = useStore()
  const [filter, setFilter] = useState<Platform | 'all'>('all')
  const [generated, setGenerated] = useState<typeof IDEA_TEMPLATES>([])
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'info'; msg: string } | null>(null)

  function showToast(type: 'success' | 'info', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleGenerate() {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1400))
    setGenerated(shuffleTemplate(IDEA_TEMPLATES))
    setGenerating(false)
    showToast('info', '5 ideas generated from viral patterns. Save the ones you want to use.')
  }

  function handleSave(idea: (typeof IDEA_TEMPLATES)[0]) {
    const saved: SavedIdea = {
      id: `idea_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      platform: idea.platform,
      content: idea.content,
      angle: idea.angle,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'SAVE_IDEA', idea: saved })
    showToast('success', 'Idea saved. Find it in your saved ideas below.')
  }

  function handleRemove(id: string) {
    dispatch({ type: 'REMOVE_IDEA', id })
  }

  const savedFiltered =
    filter === 'all'
      ? state.savedIdeas
      : state.savedIdeas.filter(i => i.platform === filter)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-xl ${
            toast.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-900/80 text-emerald-200'
              : 'border-indigo-500/40 bg-indigo-900/80 text-indigo-200'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl" aria-hidden="true">✦</span>
          <h1 className="text-2xl font-bold text-slate-100">Idea Generator</h1>
          <div className="relative">
            <HelpToggle
              lines={[
                'Generates post ideas built from what\'s going viral on X, Reddit, and LinkedIn — with the angle (hook strategy) called out for each one.',
                'Click "Generate idea batch" to get 5 ideas. Each idea shows the angle — the reason it\'s likely to spread.',
                'Save ideas you want to use. Get SuperLiving\'s approval before posting. Log each experiment in Targets after it goes live.',
                'Generate as many batches as you want — each batch is a new shuffle from the viral patterns.',
              ]}
            />
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Post ideas built from what&apos;s going viral. Save the best ones, get approval, then post
          and log the results.
        </p>
      </div>

      {/* Generate button */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-200">Generate a new batch</p>
          <p className="text-xs text-slate-500 mt-0.5">
            5 ideas built from viral patterns on X, Reddit, and LinkedIn.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {generating ? 'Generating…' : 'Generate idea batch'}
        </button>
      </div>

      {/* Generated ideas */}
      {generated.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            Generated ideas — save the ones you want to use
          </h2>
          {generated.map((idea, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs ${PLATFORM_COLOR[idea.platform]}`}
                >
                  {PLATFORM_LABEL[idea.platform]}
                </span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
                  {idea.angle}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{idea.content}</p>
              <button
                onClick={() => handleSave(idea)}
                className="rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 px-3 py-1.5 text-xs font-medium text-indigo-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Save this idea
              </button>
            </div>
          ))}
        </section>
      )}

      {/* Saved ideas */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            Saved ideas ({state.savedIdeas.length})
          </h2>
          <div className="flex gap-2">
            {(['all', 'x', 'reddit', 'linkedin'] as const).map(p => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  filter === p
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                {p === 'all' ? 'All' : PLATFORM_LABEL[p as Platform]}
              </button>
            ))}
          </div>
        </div>

        {savedFiltered.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-slate-400 mb-1">No saved ideas yet.</p>
            <p className="text-xs text-slate-500">
              {state.savedIdeas.length === 0
                ? 'Generate a batch above and save the ones you want to use.'
                : `No saved ideas for ${filter}. Switch the filter to see others.`}
            </p>
            {state.savedIdeas.length === 0 && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Generate idea batch
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {savedFiltered.map(idea => (
              <div
                key={idea.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${PLATFORM_COLOR[idea.platform]}`}
                  >
                    {PLATFORM_LABEL[idea.platform]}
                  </span>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
                    {idea.angle}
                  </span>
                  <span className="text-xs text-slate-600">
                    {new Date(idea.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{idea.content}</p>
                <button
                  onClick={() => handleRemove(idea.id)}
                  className="text-xs text-slate-600 hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reminder */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-3 text-xs text-amber-300/80">
        <span className="font-semibold text-amber-300">Reminder: </span>
        SuperLiving must approve all posts before they go live. All AI-generated content must be
        clearly labelled as AI-generated.
      </div>
    </div>
  )
}
