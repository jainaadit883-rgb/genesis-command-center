import { NextResponse } from 'next/server'
import type { ViralPost } from '@/lib/types'

function rawScore(m: ViralPost['metrics']) {
  return m.views * 0.0001 + m.likes * 0.5 + m.comments * 1 + m.shares * 2
}

export async function GET() {
  const token = process.env.X_BEARER_TOKEN

  if (!token) {
    return NextResponse.json({
      posts: [],
      needsSetup: true,
      platform: 'x',
      steps: [
        'Go to developer.twitter.com and sign up for a free account.',
        'Create a new project + app (Free tier gives 1 app).',
        'Copy the "Bearer Token" from the Keys & Tokens tab.',
        'Create .env.local in the project root and add: X_BEARER_TOKEN=your_token_here',
        'Restart the dev server (or add it to Vercel environment variables), then click Refresh.',
      ],
    })
  }

  // Twitter API v2 — recent search (last 7 days)
  const query =
    '(AI video OR Hindi film OR "regional language" OR GENESIS AI) India -is:retweet lang:en'
  const url = new URL('https://api.twitter.com/2/tweets/search/recent')
  url.searchParams.set('query', query)
  url.searchParams.set('tweet.fields', 'public_metrics,created_at,author_id')
  url.searchParams.set('expansions', 'author_id')
  url.searchParams.set('user.fields', 'username,name')
  url.searchParams.set('max_results', '25')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    return NextResponse.json({
      posts: [],
      error: `X API error ${res.status} — ${body.slice(0, 200)}`,
    })
  }

  const { data = [], includes = {} } = await res.json()
  const userMap = new Map<string, { name: string; username: string }>(
    (includes.users ?? []).map((u: { id: string; name: string; username: string }) => [u.id, u])
  )

  const rawPosts: Omit<ViralPost, 'viralityScore' | 'hitViralTarget'>[] = data.map((t: {
    id: string; text: string; created_at: string; author_id: string
    public_metrics: { impression_count: number; like_count: number; reply_count: number; retweet_count: number; quote_count: number }
  }) => {
    const user = userMap.get(t.author_id) ?? { name: 'Unknown', username: 'unknown' }
    const m = t.public_metrics ?? {}
    return {
      id: `x-${t.id}`,
      platform: 'x' as const,
      author: user.name,
      handle: `@${user.username}`,
      content: t.text,
      // Real tweet URL
      url: `https://x.com/${user.username}/status/${t.id}`,
      postedAt: t.created_at,
      metrics: {
        views: m.impression_count ?? 0,
        likes: m.like_count ?? 0,
        comments: m.reply_count ?? 0,
        shares: (m.retweet_count ?? 0) + (m.quote_count ?? 0),
      },
    }
  })

  if (rawPosts.length === 0) {
    return NextResponse.json({ posts: [], message: 'No recent tweets matched the search.' })
  }

  rawPosts.sort((a, b) => rawScore(b.metrics) - rawScore(a.metrics))
  const maxS = Math.max(...rawPosts.map(p => rawScore(p.metrics)), 1)

  const posts: ViralPost[] = rawPosts.map(p => ({
    ...p,
    viralityScore: Math.round((rawScore(p.metrics) / maxS) * 100),
    hitViralTarget:
      p.metrics.likes >= 1000 || p.metrics.shares >= 500 || p.metrics.views >= 100000,
  }))

  return NextResponse.json({ posts })
}
