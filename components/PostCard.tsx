'use client'

import { useState } from 'react'
import { ViralityBadge } from './ViralityBadge'
import type { ViralPost, Platform, TeardownRatings } from '@/lib/types'

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return String(n)
}

const PLATFORM_LABEL: Record<Platform, string> = {
  x: 'X',
  reddit: 'Reddit',
  linkedin: 'LinkedIn',
}

const PLATFORM_HOST: Record<Platform, string> = {
  x: 'x.com',
  reddit: 'reddit.com',
  linkedin: 'linkedin.com',
}

const RATING_LABELS: Array<{ key: keyof TeardownRatings; label: string }> = [
  { key: 'openingHook', label: 'Opening hook' },
  { key: 'contentFormat', label: 'Content format' },
  { key: 'emotionalTrigger', label: 'Emotional trigger' },
  { key: 'firstDistributor', label: 'First distributor' },
  { key: 'distributionMechanism', label: 'Distribution mechanism' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'conversionPotential', label: 'Conversion potential' },
]

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100
  const color =
    score >= 8
      ? 'bg-emerald-500'
      : score >= 6
      ? 'bg-indigo-500'
      : score >= 4
      ? 'bg-amber-500'
      : 'bg-red-500'
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 rounded-full bg-slate-700">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-300 w-5 text-right">{score}</span>
    </div>
  )
}

function RatingsGrid({ ratings }: { ratings: TeardownRatings }) {
  return (
    <div className="mt-3 rounded-lg bg-slate-800/60 border border-slate-700/60 px-3 py-3 space-y-2.5">
      <p className="text-xs font-semibold text-indigo-400 tracking-wide uppercase mb-1">
        AI teardown — 7 factors
      </p>
      {RATING_LABELS.map(({ key, label }) => {
        const r = ratings[key]
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-44 shrink-0">{label}</span>
            <ScoreBar score={r.score} />
            <span className="text-xs text-slate-500 w-32 truncate hidden sm:block">{r.note}</span>
          </div>
        )
      })}
      <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-slate-700/40 mt-1">
        {/* Show the teardown text summary */}
      </p>
    </div>
  )
}

interface PostCardProps {
  post: ViralPost
  rank: number
}

export function PostCard({ post, rank }: PostCardProps) {
  const [expanded, setExpanded] = useState(false)

  const hasRatings = !!post.teardownRatings
  const hasTeardown = !!(post.teardown || post.teardownRatings)

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-xs font-bold text-slate-600 w-5 text-right">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <ViralityBadge score={post.viralityScore} hitTarget={post.hitViralTarget} />
            <span className="text-xs text-slate-500">
              {post.author} · {post.handle}
            </span>
            <span className="text-xs text-slate-600">
              {new Date(post.postedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              aria-label={`View post on ${PLATFORM_HOST[post.platform]}`}
            >
              View post →
            </a>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{post.content}</p>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            {post.metrics.views > 0 && <span>{fmt(post.metrics.views)} views</span>}
            <span>{fmt(post.metrics.likes)} likes</span>
            <span>{fmt(post.metrics.comments)} comments</span>
            <span>{fmt(post.metrics.shares)} shares</span>
          </div>

          {hasTeardown && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded(o => !o)}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              >
                {expanded ? '▲ Hide teardown' : '▼ Why it went viral'}
              </button>
              {expanded && (
                <>
                  {hasRatings && <RatingsGrid ratings={post.teardownRatings!} />}
                  {post.teardown && (
                    <div className={`rounded-lg bg-slate-800/60 border border-slate-700/60 px-3 py-2.5 text-xs text-slate-300 leading-relaxed ${hasRatings ? 'mt-2' : 'mt-2'}`}>
                      <span className="text-indigo-400 font-semibold text-xs">Summary: </span>
                      {post.teardown}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
