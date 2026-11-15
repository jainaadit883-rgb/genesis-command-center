'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { HelpToggle } from '@/components/HelpToggle'
import { Tooltip } from '@/components/Tooltip'
import type { Experiment, Platform } from '@/lib/types'

const PLATFORM_LABEL: Record<Platform, string> = { x: 'X', reddit: 'Reddit', linkedin: 'LinkedIn' }

const VIRAL_THRESHOLDS = [
  {
    platform: 'X' as const,
    criteria: '1,000+ likes, or 500+ shares, or 100,000+ views',
    tip: 'A post that hits any one of these counts as "viral" on X.',
  },
  {
    platform: 'Reddit' as const,
    criteria: '5,000+ upvotes',
    tip: 'Reddit upvotes are the primary signal. High-comment/low-upvote posts don\'t count.',
  },
  {
    platform: 'LinkedIn' as const,
    criteria: '50,000+ impressions or 1,000+ reactions',
    tip: 'LinkedIn impressions are easier to hit than reactions — aim for both.',
  },
]

const SUCCESS_CHECKLIST = [
  { label: '500 sign-ups at genesis.superliving.ai', stateKey: 'signups' as const },
  { label: 'At least 1 viral post on each platform (X, Reddit, LinkedIn)', stateKey: 'viral' as const },
  { label: '3 platform pattern summaries generated', stateKey: 'patterns' as const },
  { label: '5 experiments logged with full metrics', stateKey: 'experiments' as const },
  { label: 'At least 10 leads contacted', stateKey: 'leads' as const },
]

const FUNNEL_STEPS = [
  { label: 'Impressions', value: '—', tip: 'Total views across all experiment posts.' },
  { label: 'Engagements', value: '—', tip: 'Likes + comments + shares across all experiments.' },
  { label: 'Link clicks', value: '—', tip: 'Clicks to genesis.superliving.ai.' },
  { label: 'Sign-ups', value: '—', tip: 'People who completed sign-up after clicking.' },
]

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return String(n)
}

export default function TargetsPage() {
  const { state, dispatch } = useStore()

  const totalImpressions = state.experiments.reduce((s, e) => s + e.impressions, 0)
  const totalEngagements = state.experiments.reduce((s, e) => s + e.engagements, 0)
  const totalClicks = state.experiments.reduce((s, e) => s + e.clicks, 0)
  const totalSignups = state.signups

  const viralCount =
    state.xPosts.filter(p => p.hitViralTarget).length +
    state.redditPosts.filter(p => p.hitViralTarget).length +
    state.linkedinPosts.filter(p => p.hitViralTarget).length

  const patternCount = [
    state.patternSummary.x,
    state.patternSummary.reddit,
    state.patternSummary.linkedin,
  ].filter(Boolean).length

  const checkState: Record<string, boolean> = {
    signups: state.signups >= 500,
    viral: viralCount >= 3,
    patterns: patternCount >= 3,
    experiments: state.experiments.length >= 5,
    leads: state.leads.filter(l => l.status === 'sent').length >= 10,
  }

  const funnelData = [
    { label: 'Impressions', value: totalImpressions, tip: 'Total views across all published experiments.' },
    { label: 'Engagements', value: totalEngagements, tip: 'Likes + comments + shares across all experiments.' },
    { label: 'Link clicks', value: totalClicks, tip: 'Clicks through to genesis.superliving.ai.' },
    { label: 'Sign-ups', value: totalSignups, tip: 'People who completed sign-up.' },
  ]

  // Add experiment form
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    platform: 'x' as Platform,
    content: '',
    impressions: '',
    engagements: '',
    clicks: '',
    signups: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToastMsg(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  async function handleAddExperiment(e: React.FormEvent) {
    e.preventDefault()
    if (!form.content.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    dispatch({
      type: 'ADD_EXPERIMENT',
      experiment: {
        id: `exp_${Date.now()}`,
        platform: form.platform,
        content: form.content,
        postedAt: new Date().toISOString(),
        impressions: Number(form.impressions) || 0,
        engagements: Number(form.engagements) || 0,
        clicks: Number(form.clicks) || 0,
        signups: Number(form.signups) || 0,
        status: 'done',
        notes: form.notes,
      },
    })
    setForm({ platform: 'x', content: '', impressions: '', engagements: '', clicks: '', signups: '', notes: '' })
    setShowForm(false)
    setSaving(false)
    showToastMsg('Experiment logged.')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-emerald-500/40 bg-emerald-900/80 px-4 py-3 text-sm text-emerald-200 shadow-xl"
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl" aria-hidden="true">◎</span>
          <h1 className="text-2xl font-bold text-slate-100">Targets & Success</h1>
          <div className="relative">
            <HelpToggle
              lines={[
                'This page tracks the project goal: 500 sign-ups at genesis.superliving.ai within the ₹50,000 budget.',
                'Log each experiment (published post) here with its real metrics — impressions, engagements, clicks, sign-ups.',
                'The success checklist shows what it takes to call this campaign a win across all criteria.',
                'The funnel totals all experiment metrics to show your conversion rate from impression to sign-up.',
              ]}
            />
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Project goal, viral thresholds, success checklist, funnel metrics, and experiment log.
        </p>
      </div>

      {/* Goal progress */}
      <section className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5">
        <h2 className="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-4">
          Project goal
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <Tooltip text="Target: 500 people who sign up at genesis.superliving.ai after seeing GENESIS content." position="right">
                <span className="text-sm font-medium text-slate-300 cursor-help">
                  Sign-ups <span className="underline decoration-dotted">(?)</span>
                </span>
              </Tooltip>
              <span className="text-sm font-bold text-slate-100">
                {state.signups} <span className="text-slate-500 font-normal">/ 500</span>
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{ width: `${Math.min(100, (state.signups / 500) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {((state.signups / 500) * 100).toFixed(0)}% to goal
            </p>
          </div>
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <Tooltip text="Total approved budget for this campaign." position="right">
                <span className="text-sm font-medium text-slate-300 cursor-help">
                  Budget used <span className="underline decoration-dotted">(?)</span>
                </span>
              </Tooltip>
              <span className="text-sm font-bold text-slate-100">
                ₹{state.budgetUsed.toLocaleString('en-IN')}{' '}
                <span className="text-slate-500 font-normal">/ ₹50,000</span>
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${Math.min(100, (state.budgetUsed / 50000) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Viral thresholds */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-3">
          Viral thresholds
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {VIRAL_THRESHOLDS.map(t => (
            <Tooltip key={t.platform} text={t.tip} position="bottom">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 cursor-help w-full">
                <p className="text-sm font-semibold text-slate-200 mb-1">{t.platform}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{t.criteria}</p>
              </div>
            </Tooltip>
          ))}
        </div>
      </section>

      {/* Success checklist */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-3">
          Success checklist
        </h2>
        <ul className="space-y-2">
          {SUCCESS_CHECKLIST.map(item => {
            const done = checkState[item.stateKey]
            return (
              <li
                key={item.stateKey}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
              >
                <span
                  className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    done
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800 border border-slate-700 text-slate-600'
                  }`}
                  aria-label={done ? 'Complete' : 'Incomplete'}
                >
                  {done ? '✓' : '·'}
                </span>
                <span className={`text-sm ${done ? 'text-emerald-300' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Funnel */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-3">
          Funnel (all experiments)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {funnelData.map(step => (
            <Tooltip key={step.label} text={step.tip} position="bottom">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 cursor-help w-full">
                <p className="text-2xl font-bold text-slate-100">{fmt(step.value)}</p>
                <p className="text-xs text-slate-500 mt-0.5">{step.label}</p>
              </div>
            </Tooltip>
          ))}
        </div>
        {totalImpressions > 0 && totalClicks > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            Impression → sign-up rate:{' '}
            <span className="text-slate-300 font-medium">
              {((totalSignups / totalImpressions) * 100).toFixed(2)}%
            </span>
          </p>
        )}
      </section>

      {/* Experiment log */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            Experiment log
          </h2>
          <button
            onClick={() => setShowForm(o => !o)}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            + Log experiment
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAddExperiment}
            className="mb-4 rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-4"
          >
            <h3 className="text-sm font-semibold text-slate-200">New experiment</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Platform</label>
                <select
                  value={form.platform}
                  onChange={e => setForm(f => ({ ...f, platform: e.target.value as Platform }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <option value="x">X (Twitter)</option>
                  <option value="reddit">Reddit</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>
              {(['impressions', 'engagements', 'clicks', 'signups'] as const).map(field => (
                <div key={field}>
                  <label className="block text-xs text-slate-400 mb-1 capitalize">{field}</label>
                  <input
                    type="number"
                    min="0"
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Post content (brief)</label>
              <textarea
                rows={2}
                required
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Paste the post text or a summary…"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Notes (optional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="What worked, what to try next time…"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {saving ? 'Saving…' : 'Save experiment'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {state.experiments.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-slate-400 mb-1">No experiments logged yet.</p>
            <p className="text-xs text-slate-500">
              Publish a post, then click &ldquo;+ Log experiment&rdquo; to record its metrics.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.experiments.map(exp => (
              <div
                key={exp.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                    {PLATFORM_LABEL[exp.platform]}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${
                      exp.status === 'done'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : exp.status === 'live'
                        ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
                        : 'border-slate-700 text-slate-500'
                    }`}
                  >
                    {exp.status}
                  </span>
                  <span className="text-xs text-slate-600">
                    {new Date(exp.postedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-3 line-clamp-2">{exp.content}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>
                    <span className="text-slate-200 font-medium">{fmt(exp.impressions)}</span> impr
                  </span>
                  <span>
                    <span className="text-slate-200 font-medium">{fmt(exp.engagements)}</span> eng
                  </span>
                  <span>
                    <span className="text-slate-200 font-medium">{fmt(exp.clicks)}</span> clicks
                  </span>
                  <span>
                    <span className="text-indigo-300 font-medium">{exp.signups}</span> sign-ups
                  </span>
                </div>
                {exp.notes && (
                  <p className="mt-2 text-xs text-slate-500 italic">{exp.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
