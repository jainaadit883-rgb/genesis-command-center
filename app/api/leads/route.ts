import { NextResponse } from 'next/server'
import type { Lead } from '@/lib/types'

// Freelancer's public REST API — returns active projects matching a query.
// No auth required for read-only project listings.
const FREELANCER_QUERIES = [
  'Hindi video production',
  'Tamil Telugu video content',
  'Gujarati Marathi video',
  'Indian regional language video',
  'Hindi explainer video India',
]

async function fetchFreelancerProjects(query: string): Promise<any[]> {
  const url = new URL('https://www.freelancer.com/api/projects/0.1/projects/active')
  url.searchParams.set('compact', 'true')
  url.searchParams.set('job_details', 'true')
  url.searchParams.set('limit', '5')
  url.searchParams.set('offset', '0')
  url.searchParams.set('search_query', query)

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'freelancer-client-platform': 'web',
      'User-Agent': 'GENESIS-Command-Center/1.0',
    },
    next: { revalidate: 300 },
  })
  if (!res.ok) return []
  const { result } = await res.json().catch(() => ({ result: null }))
  return result?.projects ?? []
}

// Upwork does not expose an unauthenticated job search API.
// Guide the user to set it up if they want Upwork leads too.
async function fetchUpworkJobs(): Promise<{ jobs: any[]; needsSetup?: boolean; steps?: string[] }> {
  const token = process.env.UPWORK_ACCESS_TOKEN
  if (!token) {
    return {
      jobs: [],
      needsSetup: true,
      steps: [
        'Register at upwork.com/services/api/apply to become an API partner.',
        'Once approved, generate an OAuth2 access token.',
        'Add UPWORK_ACCESS_TOKEN=your_token to .env.local.',
        'Restart the server — Upwork leads will appear alongside Freelancer leads.',
      ],
    }
  }

  // Upwork jobs API (requires OAuth)
  const res = await fetch(
    'https://www.upwork.com/api/profiles/v2/search/jobs.json?q=Hindi+video+production+India&paging=0%3B10&sort=recency',
    { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 } }
  )
  if (!res.ok) return { jobs: [] }
  const { jobs } = await res.json().catch(() => ({ jobs: [] }))
  return { jobs: Array.isArray(jobs?.job) ? jobs.job : [] }
}

export async function GET() {
  const seen = new Set<string>()
  const leads: Lead[] = []

  // --- Freelancer (no auth needed) ---
  await Promise.allSettled(
    FREELANCER_QUERIES.map(async q => {
      const projects = await fetchFreelancerProjects(q)
      for (const p of projects) {
        const key = `fl-${p.id}`
        if (seen.has(key)) continue
        seen.add(key)
        leads.push({
          id: key,
          platform: 'Freelancer',
          author: p.owner_display_name ?? 'Client on Freelancer',
          content:
            (p.title ?? 'Video production project') +
            (p.description ? ': ' + p.description.trim().slice(0, 240) : ''),
          // Real project URL
          url: `https://www.freelancer.com/projects/${p.seo_url ?? p.id}/`,
          postedAt: new Date((p.submitdate ?? Math.floor(Date.now() / 1000)) * 1000).toISOString(),
          status: 'new',
          scraperSource: `freelancer.com — search: "${q}"`,
          contactType: 'freelancer_bid',
          contactHandle: `freelancer.com/projects/${p.seo_url ?? p.id}`,
          emailSubject: `Your Freelancer project: ${(p.title ?? 'video production').slice(0, 50)} — GENESIS`,
        })
      }
    })
  )

  // --- Upwork (requires UPWORK_ACCESS_TOKEN env var) ---
  const upworkResult = await fetchUpworkJobs()
  for (const j of upworkResult.jobs ?? []) {
    const key = `uw-${j.id}`
    if (seen.has(key)) continue
    seen.add(key)
    leads.push({
      id: key,
      platform: 'Upwork',
      author: 'Client on Upwork',
      content: (j.title ?? 'Video production job') + (j.snippet ? ': ' + j.snippet.slice(0, 240) : ''),
      url: `https://www.upwork.com/jobs/${j.ciphertext ?? j.id}/`,
      postedAt: j.date_created ?? new Date().toISOString(),
      status: 'new',
      scraperSource: 'upwork.com — job search: Hindi video India',
      contactType: 'upwork_bid',
      contactHandle: `upwork.com/jobs/${j.ciphertext ?? j.id}`,
      emailSubject: `Your Upwork job: ${(j.title ?? 'video production').slice(0, 50)} — GENESIS`,
    })
  }

  return NextResponse.json({
    leads,
    upworkNeedsSetup: upworkResult.needsSetup,
    upworkSetupSteps: upworkResult.steps,
    freelancerCount: leads.filter(l => l.platform === 'Freelancer').length,
    upworkCount: leads.filter(l => l.platform === 'Upwork').length,
  })
}
