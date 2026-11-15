'use client'

import { useState } from 'react'
import { ViralityBadge } from './ViralityBadge'
import type { ViralPost, Platform } from '@/lib/types'

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

interface PostCardProps {
  post: ViralPost
  rank: number
}

export function PostCard({ post, rank }: PostCardProps) {
  const [expanded, setExpanded] = useState(false)

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
          </div>

          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{post.content}</p>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            {post.metrics.views > 0 && <span>{fmt(post.metrics.views)} views</span>}
            <span>{fmt(post.metrics.likes)} likes</span>
            <span>{fmt(post.metrics.comments)} comments</span>
            <span>{fmt(post.metrics.shares)} shares</span>
          </div>

          {post.teardown && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded(o => !o)}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              >
                {expanded ? '▲ Hide teardown' : '▼ Why it went viral'}
              </button>
              {expanded && (
                <div className="mt-2 rounded-lg bg-slate-800/60 border border-slate-700/60 px-3 py-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="text-indigo-400 font-semibold text-xs">AI teardown: </span>
                  {post.teardown}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
