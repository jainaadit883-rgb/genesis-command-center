'use client'

import Link from 'next/link'
import { useStore } from '@/lib/store'
import { Tooltip } from '@/components/Tooltip'

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return String(n)
}

const FEATURES = [
  {
    id: 'targets',
    href: '/targets',
    icon: '◎',
    title: 'Targets & Success',
    what: 'Tracks the project goal (500 sign-ups, ₹50k budget), viral thresholds per platform, a live success checklist, the sign-up funnel, and an experiment log.',
    when: 'Use it to log each post you publish, check how close you are to the viral target, and review which experiments drove the most sign-ups.',
    cta: 'View targets',
    color: 'border-indigo-500/30 bg-indigo-500/5',
  },
  {
    id: 'platforms',
    href: '/x',
    icon: '𝕏',
    title: 'X / Reddit / LinkedIn',
    what: 'Shows the top AI-video posts from each platform, ranked by virality score, with AI teardowns of why each one spread and a pattern summary per platform.',
    when: 'Use it after refreshing data to understand what works, before writing any new post.',
    cta: 'Open X posts',
    color: 'border-violet-500/30 bg-violet-500/5',
  },
  {
    id: 'leads',
    href: '/leads',
    icon: '◈',
    title: 'Freelance Leads',
    what: 'Surfaces people who posted publicly asking for video production work. For each lead you can draft a tailored pitch with AI, review and edit it, then mark it sent.',
    when: 'Use it daily to find warm inbound leads who already need exactly what GENESIS does.',
    cta: 'View leads',
    color: 'border-emerald-500/30 bg-emerald-500/5',
  },
  {
    id: 'ideas',
    href: '/ideas',
    icon: '✦',
    title: 'Idea Generator',
    what: 'Generates batches of post ideas built from what\'s going viral, with the angle (e.g. "cost comparison", "founder story") called out for each idea. You can save the best ones.',
    when: 'Use it when you\'re ready to write new content — after studying the top posts and their teardowns.',
    cta: 'Generate ideas',
    color: 'border-amber-500/30 bg-amber-500/5',
  },
]

const WALKTHROUGH_STEPS = [
  {
    n: 1,
    action: 'Refresh or import data',
    description: 'Load the latest viral AI-video posts from X, Reddit, and LinkedIn.',
    href: '/x',
    cta: 'Refresh X posts',
    statKey: 'posts' as const,
  },
  {
    n: 2,
    action: 'Explain why top posts went viral',
    description: 'Get an AI teardown of each post — the hook, format, and why it spread.',
    href: '/x',
    cta: 'Go to X posts',
    statKey: 'teardowns' as const,
  },
  {
    n: 3,
    action: 'Find the pattern per platform',
    description: 'Summarise what works on X, Reddit, and LinkedIn separately.',
    href: '/x',
    cta: 'View platforms',
    statKey: 'patterns' as const,
  },
  {
    n: 4,
    action: 'Generate and save post ideas',
    description: 'Create a batch of ideas built from the viral patterns. Save the best ones.',
    href: '/ideas',
    cta: 'Go to Ideas',
    statKey: 'ideas' as const,
  },
  {
    n: 5,
    action: 'Post (after SuperLiving approves)',
    description: 'Get approval, post the content, then log the experiment here with the numbers.',
    href: '/targets',
    cta: 'Log experiment',
    statKey: 'experiments' as const,
  },
  {
    n: 6,
    action: 'Review experiment results',
    description: 'Check impressions, engagements, clicks, and sign-ups per post.',
    href: '/targets',
    cta: 'View targets',
    statKey: 'experiments' as const,
  },
  {
    n: 7,
    action: 'Work through leads',
    description: 'Find people asking for video work, draft a pitch with AI, and send it.',
    href: '/leads',
    cta: 'View leads',
    statKey: 'leads' as const,
  },
]

const FUNNEL_TOOLTIPS: Record<string, string> = {
  'Sign-up goal': 'Target: 500 sign-ups at genesis.superliving.ai. Each sign-up counts one person who opted in after seeing GENESIS content.',
  'Budget total': 'Total approved budget for GENESIS growth campaigns across all platforms.',
  'Budget used': 'Amount spent so far on paid promotion, tools, and freelancer costs.',
  'Teardowns done': 'Number of posts that have been AI-analysed to explain why they went viral.',
  'Experiments': 'Each post published counts as one experiment. Log the numbers after each one.',
}

export default function Home() {
  const { state } = useStore()

  const totalPosts = state.xPosts.length + state.redditPosts.length + state.linkedinPosts.length
  const teardownCount =
    state.xPosts.filter(p => p.teardown).length +
    state.redditPosts.filter(p => p.teardown).length +
    state.linkedinPosts.filter(p => p.teardown).length
  const patternCount = [state.patternSummary.x, state.patternSummary.reddit, state.patternSummary.linkedin].filter(Boolean).length

  const statLookup: Record<string, string> = {
    posts: `${totalPosts} posts loaded`,
    teardowns: `${teardownCount} torn down`,
    patterns: `${patternCount} of 3 patterns found`,
    ideas: `${state.savedIdeas.length} ideas saved`,
    experiments: `${state.experiments.length} experiments logged`,
    leads: `${state.leads.length} leads found`,
  }

  const GLANCE = [
    { label: 'X posts', value: state.xPosts.length, tip: 'Posts scraped from X about AI video.' },
    { label: 'Reddit posts', value: state.redditPosts.length, tip: 'Posts scraped from Reddit.' },
    { label: 'LinkedIn posts', value: state.linkedinPosts.length, tip: 'Posts scraped from LinkedIn.' },
    { label: 'Teardowns', value: teardownCount, tip: 'Posts that have an AI explanation of why they went viral.' },
    { label: 'Saved ideas', value: state.savedIdeas.length, tip: 'Post ideas you have saved from the Idea Generator.' },
    { label: 'Leads', value: state.leads.length, tip: 'People publicly asking for video production work.' },
    { label: 'Experiments', value: state.experiments.length, tip: 'Posts published and logged in the experiment tracker.' },
    { label: 'Sign-ups', value: state.signups, tip: 'People who signed up at genesis.superliving.ai after seeing GENESIS content.' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-16">
      {/* Hero */}
      <section>
        <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-2">
          GENESIS Command Center
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 leading-tight">
          Make GENESIS go viral.<br />
          Turn attention into sign-ups.
        </h1>
        <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-2xl">
          This is SuperLiving&apos;s growth hub for GENESIS — an AI film studio that turns a text
          prompt into a finished film in Hindi and regional Indian languages. Use this tool to study
          what AI-video content goes viral on X, Reddit, and LinkedIn, generate posts built from
          those patterns, and track every experiment until you hit 500 sign-ups at{' '}
          <span className="text-indigo-400">genesis.superliving.ai</span>.
        </p>
      </section>

      {/* At a glance */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-4">
          At a glance
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {GLANCE.map(item => (
            <Tooltip key={item.label} text={item.tip} position="bottom">
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 cursor-help w-full">
                <p className="text-2xl font-bold text-slate-100">{item.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
              </div>
            </Tooltip>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 flex flex-wrap gap-6 items-center">
          <div>
            <p className="text-xs text-slate-500">Budget used</p>
            <p className="text-lg font-bold text-slate-100">
              ₹{state.budgetUsed.toLocaleString('en-IN')}
              <span className="text-sm text-slate-500 font-normal"> / ₹50,000</span>
            </p>
          </div>
          <div className="flex-1 min-w-32">
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{ width: `${Math.min(100, (state.budgetUsed / 50000) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-slate-500">
            {((state.budgetUsed / 50000) * 100).toFixed(0)}% used
          </span>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-4">
          What&apos;s in this tool
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map(f => (
            <div
              key={f.id}
              className={`rounded-xl border p-5 flex flex-col gap-3 ${f.color}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">{f.icon}</span>
                <h3 className="text-base font-semibold text-slate-100">{f.title}</h3>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-300">What it does: </span>
                  {f.what}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-300">When to use it: </span>
                  {f.when}
                </p>
              </div>
              <Link
                href={f.href}
                className="mt-auto inline-flex items-center gap-1.5 self-start rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {f.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Walkthrough */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-4">
          How to use it — in order
        </h2>
        <ol className="space-y-3">
          {WALKTHROUGH_STEPS.map(step => {
            const stat = statLookup[step.statKey]
            return (
              <li
                key={step.n}
                className="flex items-start gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4"
              >
                <span className="shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600/20 border border-indigo-500/30 text-xs font-bold text-indigo-300">
                  {step.n}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-slate-200">{step.action}</p>
                    <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                      {stat}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                </div>
                <Link
                  href={step.href}
                  className="shrink-0 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 whitespace-nowrap"
                >
                  {step.cta}
                </Link>
              </li>
            )
          })}
        </ol>
      </section>

      {/* Guardrails */}
      <section>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h2 className="text-sm font-semibold text-amber-300 mb-2">Guardrails</h2>
          <ul className="space-y-1.5 text-xs text-slate-400 leading-relaxed list-none">
            {[
              'SuperLiving must approve all public posts before they go live.',
              'All AI-generated content must be clearly labelled as AI-generated.',
              'No fake reviews or fabricated testimonials.',
              'No real people\'s faces or voices used without written consent.',
              'Only email people who shared their address publicly.',
            ].map(rule => (
              <li key={rule} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
