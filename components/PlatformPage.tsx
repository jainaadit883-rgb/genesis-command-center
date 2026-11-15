'use client'

import { useState } from 'react'
import { PostCard } from './PostCard'
import { HelpToggle } from './HelpToggle'
import { Tooltip } from './Tooltip'
import { useStore } from '@/lib/store'
import type { Platform, ViralPost } from '@/lib/types'

const MOCK_PATTERNS: Record<Platform, string> = {
  x: 'Three patterns dominate viral AI-video content on X: (1) Demo + cost/time comparison — showing the output AND the savings in one post outperforms either alone. (2) Specificity of language/region — posts naming a specific Indian language (Tamil, Marathi, Gujarati) outperform generic "Indian content" posts by ~3×. (3) Thread format with promised value — "Here\'s how I did it in 7 steps" drives sustained engagement past the first 24 hours. The ideal posting window is 8–10am IST for Indian audiences, 9–11am EST for global AI-interest reach.',
  reddit:
    'Reddit viral AI-video posts share three traits: (1) Replicable value — posts that share prompts, workflows, or exact steps consistently hit 5k+ upvotes; pure demos top out at ~2k. (2) Honest limitations — posts that say "here\'s what it can\'t do yet" alongside the demos get 2× the comments and are saved more often. (3) Subreddit-specific framing — the same content rewritten for r/india vs r/AIVideoProduction vs r/tamil performs very differently; regional-language subreddits have higher engagement rates because the topic is novel to them.',
  linkedin:
    'LinkedIn AI-video virality is driven by: (1) Business ROI data — cost comparisons with specific ₹ figures consistently outperform feature showcases and reach senior decision-makers who share to their networks. (2) Founder voice with intellectual honesty — posts that admit limitations alongside wins get 3× the saves vs pure-positive posts. (3) DM-based access mechanics — asking people to comment a keyword to receive access turns every interested viewer into a comment, boosting algorithmic reach significantly. Post at 8–9am IST on Tuesday–Thursday for maximum professional audience reach.',
}

const MOCK_TEARDOWNS: Record<Platform, Record<string, string>> = {
  x: {},
  reddit: {},
  linkedin: {},
}

interface PlatformPageProps {
  platform: Platform
  label: string
  icon: string
  helpLines: string[]
}

export function PlatformPage({ platform, label, icon, helpLines }: PlatformPageProps) {
  const { state, dispatch } = useStore()
  const posts: ViralPost[] =
    platform === 'x'
      ? state.xPosts
      : platform === 'reddit'
      ? state.redditPosts
      : state.linkedinPosts

  const pattern = state.patternSummary[platform]
  const teardownCount = posts.filter(p => p.teardown).length
  const canTeardown = posts.length >= 3
  const canPattern = teardownCount >= 3

  const [refreshing, setRefreshing] = useState(false)
  const [tearing, setTearing] = useState(false)
  const [patterning, setPatterning] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleRefresh() {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 1200))
    dispatch({
      type: 'REFRESH_POSTS',
      platform,
      posts: posts.map(p => ({ ...p })),
    })
    setRefreshing(false)
    showToast('success', `${posts.length} posts refreshed. Scores updated.`)
  }

  async function handleTeardowns() {
    if (!canTeardown) return
    setTearing(true)
    const topPosts = [...posts].sort((a, b) => b.viralityScore - a.viralityScore).slice(0, 8)
    for (const post of topPosts) {
      if (!post.teardown) {
        await new Promise(r => setTimeout(r, 300))
        const mockTeardown =
          MOCK_PATTERNS[platform].split('.')[0] +
          '. This specific post amplified that pattern through its opening hook and the specificity of its claim.'
        dispatch({ type: 'ADD_TEARDOWN', platform, postId: post.id, teardown: mockTeardown })
      }
    }
    setTearing(false)
    showToast('success', `Top ${topPosts.length} posts have AI teardowns. Click "Why it went viral" on any post to read them.`)
  }

  async function handlePattern() {
    if (!canPattern) return
    setPatterning(true)
    await new Promise(r => setTimeout(r, 1500))
    dispatch({ type: 'SET_PATTERN', platform, summary: MOCK_PATTERNS[platform] })
    setPatterning(false)
    showToast('success', 'Pattern summary generated.')
  }

  const sorted = [...posts].sort((a, b) => b.viralityScore - a.viralityScore)
  const viralCount = posts.filter(p => p.hitViralTarget).length

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-xl ${
            toast.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-900/80 text-emerald-200'
              : 'border-red-500/40 bg-red-900/80 text-red-200'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-2xl" aria-hidden="true">{icon}</span>
          <h1 className="text-2xl font-bold text-slate-100">{label}</h1>
          <div className="relative">
            <HelpToggle lines={helpLines} />
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Top AI-video posts ranked by virality score. Study the teardowns, find the pattern, then
          generate ideas.
        </p>
      </div>

      {/* Stats strip */}
      <div className="flex flex-wrap gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-center min-w-20">
          <p className="text-xl font-bold text-slate-100">{posts.length}</p>
          <p className="text-xs text-slate-500">posts loaded</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-center min-w-20">
          <p className="text-xl font-bold text-slate-100">{teardownCount}</p>
          <p className="text-xs text-slate-500">torn down</p>
        </div>
        <Tooltip text="Posts that crossed the viral threshold for this platform." position="bottom">
          <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-center min-w-20 cursor-help">
            <p className="text-xl font-bold text-indigo-300">{viralCount}</p>
            <p className="text-xs text-slate-500">hit viral target</p>
          </div>
        </Tooltip>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-center min-w-20">
          <p className="text-xl font-bold text-slate-100">{pattern ? '✓' : '—'}</p>
          <p className="text-xs text-slate-500">pattern found</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {refreshing ? 'Refreshing…' : 'Refresh posts'}
        </button>

        <Tooltip
          text={
            !canTeardown
              ? 'Load at least 3 posts first by clicking "Refresh posts".'
              : 'Analyses the top 8 posts by virality score and generates an AI explanation for why each one spread.'
          }
          position="bottom"
        >
          <button
            onClick={handleTeardowns}
            disabled={!canTeardown || tearing}
            className="rounded-xl bg-indigo-700 hover:bg-indigo-600 disabled:bg-slate-800 disabled:border-slate-700 disabled:text-slate-500 border border-indigo-600 disabled:border-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {tearing ? 'Analysing…' : 'Explain why top posts went viral'}
          </button>
        </Tooltip>

        <Tooltip
          text={
            !canPattern
              ? `Explain at least 3 posts first. Currently ${teardownCount} done.`
              : 'Reads all teardowns and generates a single pattern summary — the hook, format, and timing that work on this platform.'
          }
          position="bottom"
        >
          <button
            onClick={handlePattern}
            disabled={!canPattern || patterning}
            className="rounded-xl bg-violet-700 hover:bg-violet-600 disabled:bg-slate-800 border border-violet-600 disabled:border-slate-700 px-4 py-2 text-sm font-medium text-white disabled:text-slate-500 transition-colors disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {patterning ? 'Summarising…' : `Summarise what works on ${label}`}
          </button>
        </Tooltip>
      </div>

      {/* Pattern summary */}
      {pattern && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase">
              Pattern summary
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{pattern}</p>
        </div>
      )}

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-slate-400 mb-1">No posts loaded yet.</p>
          <p className="text-sm text-slate-500 mb-4">
            Click &ldquo;Refresh posts&rdquo; to load the latest viral AI-video content from {label}.
          </p>
          <button
            onClick={handleRefresh}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Refresh from scrapers
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            Posts — sorted by virality score
          </h2>
          {sorted.map((post, i) => (
            <PostCard key={post.id} post={post} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
