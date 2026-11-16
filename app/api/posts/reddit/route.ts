import { NextResponse } from 'next/server'
import type { ViralPost } from '@/lib/types'

// Real subreddits + search queries for AI video / Indian language content
const SEARCHES = [
  { sub: 'india',                 q: 'AI video Hindi regional language film production' },
  { sub: 'artificial',            q: 'Indian language AI video generation Hindi Tamil' },
  { sub: 'filmmaking',            q: 'AI India Hindi film regional language production' },
  { sub: 'marketing',             q: 'Hindi video AI India regional content' },
  { sub: 'learnmachinelearning',  q: 'Indian language AI video multilingual generation' },
  { sub: 'videoproduction',       q: 'India Hindi Tamil Telugu Kannada AI video' },
]

function rawScore(m: ViralPost['metrics']) {
  return m.views * 0.0001 + m.likes * 0.5 + m.comments * 1 + m.shares * 2
}

export async function GET() {
  const seen = new Set<string>()
  const raw: Omit<ViralPost, 'viralityScore' | 'hitViralTarget'>[] = []

  await Promise.allSettled(
    SEARCHES.map(async ({ sub, q }) => {
      try {
        const url =
          `https://www.reddit.com/r/${sub}/search.json` +
          `?q=${encodeURIComponent(q)}&sort=top&t=month&restrict_sr=true&limit=8`
        const res = await fetch(url, {
          headers: { 'User-Agent': 'GENESIS-Command-Center/1.0 (contact: genesis@superliving.ai)' },
          next: { revalidate: 300 },
        })
        if (!res.ok) return
        const json = await res.json()
        for (const { data: d } of json.data?.children ?? []) {
          if (seen.has(d.id) || d.score < 5 || d.author === '[deleted]') continue
          seen.add(d.id)
          raw.push({
            id: `r-${d.id}`,
            platform: 'reddit',
            author: `u/${d.author}`,
            handle: `r/${d.subreddit}`,
            content: d.title + (d.selftext?.trim() ? '\n\n' + d.selftext.trim().slice(0, 300) : ''),
            // Real permalink — links directly to the Reddit thread
            url: `https://www.reddit.com${d.permalink}`,
            postedAt: new Date(d.created_utc * 1000).toISOString(),
            metrics: {
              views: 0,
              likes: d.score,
              comments: d.num_comments,
              shares: d.num_crossposts ?? 0,
            },
          })
        }
      } catch {}
    })
  )

  raw.sort((a, b) => rawScore(b.metrics) - rawScore(a.metrics))
  const top10 = raw.slice(0, 10)
  const maxS = Math.max(...top10.map(p => rawScore(p.metrics)), 1)

  const posts: ViralPost[] = top10.map(p => ({
    ...p,
    viralityScore: Math.round((rawScore(p.metrics) / maxS) * 100),
    hitViralTarget: p.metrics.likes >= 5000,
  }))

  if (posts.length === 0) {
    return NextResponse.json({ posts: [], message: 'Reddit returned no results for these queries. Try again shortly.' })
  }

  return NextResponse.json({ posts })
}
