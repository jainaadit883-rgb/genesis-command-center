'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { HelpToggle } from '@/components/HelpToggle'

const MOCK_PITCHES: Record<string, string> = {
  lead1:
    "Hi, saw your post about a Hindi explainer video for your ed-tech startup! GENESIS can generate broadcast-quality Hindi videos from a brief — no studio, no crew, no actors. For a 2-minute explainer your budget of ₹20k would be very comfortable, with capacity for revisions. I can send you a demo reel from similar ed-tech launches this week — want to take a look?",
  lead2:
    "Hi! Saw your Reddit post about short reels in Hindi and Marathi for your restaurant chain. GENESIS handles both languages natively — the AI understands cultural food context in Indian regional languages, so the scripts land authentically. For 5 short reels I can get you a quote under ₹15,000 total. Want to see an example from an F&B brand first?",
  lead4:
    "Hi, saw your post about Tamil and Telugu explainer videos. GENESIS was specifically built for South Indian regional languages — the dialogue sounds natural, not translated. For 10 explainer videos across both languages I can send you a full cost and timeline breakdown. Would a quick call this week work?",
  lead5:
    "Hi! Saw your Reddit post about Gujarati content for your YouTube channel. GENESIS generates natural-sounding Gujarati video content from text — consistent quality every week without a studio setup. Happy to share examples from similar YouTube creators before you commit. Want me to send them over?",
}

const STATUS_LABEL: Record<string, string> = {
  new: 'New lead',
  drafted: 'Pitch ready',
  sent: 'Pitch sent',
}

const STATUS_COLOR: Record<string, string> = {
  new: 'border-slate-700 text-slate-400',
  drafted: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
  sent: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
}

export default function LeadsPage() {
  const { state, dispatch } = useStore()
  const [drafting, setDrafting] = useState<string | null>(null)
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ type: 'success' | 'info'; msg: string } | null>(null)

  function showToast(type: 'success' | 'info', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleDraftPitch(leadId: string) {
    setDrafting(leadId)
    await new Promise(r => setTimeout(r, 1200))
    const pitch = MOCK_PITCHES[leadId] ?? "Hi! I saw your post about video production. GENESIS generates broadcast-quality Hindi and regional language video content from a brief — no studio or crew needed. Happy to send examples that match your use case. What language(s) do you need?"
    dispatch({ type: 'UPDATE_LEAD', id: leadId, updates: { status: 'drafted', pitch } })
    setDrafting(null)
    showToast('info', 'Pitch drafted. Review it below, edit if needed, then mark it sent.')
  }

  function handleEditPitch(leadId: string, text: string) {
    setEditing(e => ({ ...e, [leadId]: text }))
  }

  function handleSavePitch(leadId: string) {
    const text = editing[leadId]
    if (text !== undefined) {
      dispatch({ type: 'UPDATE_LEAD', id: leadId, updates: { pitch: text } })
    }
    setEditing(e => { const n = { ...e }; delete n[leadId]; return n })
    showToast('info', 'Pitch updated.')
  }

  function handleMarkSent(leadId: string) {
    dispatch({ type: 'UPDATE_LEAD', id: leadId, updates: { status: 'sent' } })
    showToast('success', 'Lead marked as contacted. Great — keep track of replies!')
  }

  const newCount = state.leads.filter(l => l.status === 'new').length
  const draftedCount = state.leads.filter(l => l.status === 'drafted').length
  const sentCount = state.leads.filter(l => l.status === 'sent').length

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
          <span className="text-2xl" aria-hidden="true">◈</span>
          <h1 className="text-2xl font-bold text-slate-100">Freelance Leads</h1>
          <div className="relative">
            <HelpToggle
              lines={[
                'People who posted publicly asking for video production work — your warmest inbound leads.',
                'Click "Draft pitch with AI" to get a tailored pitch for each lead based on what they asked for.',
                'Review the pitch, edit it if needed, then click "Mark as sent" once you\'ve reached out.',
                'Only contact people who shared their details publicly. Do not use scraped private info.',
              ]}
            />
          </div>
        </div>
        <p className="text-sm text-slate-400">
          People asking for video work. Draft a tailored pitch with AI, review it, then send.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'New leads', value: newCount },
          { label: 'Pitches ready', value: draftedCount },
          { label: 'Contacted', value: sentCount },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-center min-w-20"
          >
            <p className="text-xl font-bold text-slate-100">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Leads list */}
      {state.leads.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-slate-400 mb-1">No leads found yet.</p>
          <p className="text-xs text-slate-500">
            Leads are people who posted publicly asking for video production work. Check back after
            the scrapers run.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {state.leads.map(lead => {
            const pitchText = editing[lead.id] ?? lead.pitch ?? ''
            const isEditing = lead.id in editing

            return (
              <article
                key={lead.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3"
              >
                {/* Lead info */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                    {lead.platform}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_COLOR[lead.status]}`}
                  >
                    {STATUS_LABEL[lead.status]}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{lead.author}</span>
                  <span className="text-xs text-slate-600">
                    {new Date(lead.postedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{lead.content}</p>

                {/* Actions */}
                {lead.status === 'new' && (
                  <button
                    onClick={() => handleDraftPitch(lead.id)}
                    disabled={drafting === lead.id}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    {drafting === lead.id ? 'Drafting pitch…' : 'Draft pitch with AI'}
                  </button>
                )}

                {lead.status !== 'new' && lead.pitch && (
                  <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Pitch
                    </p>
                    {isEditing ? (
                      <>
                        <textarea
                          rows={5}
                          value={pitchText}
                          onChange={e => handleEditPitch(lead.id, e.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSavePitch(lead.id)}
                            className="rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          >
                            Save edits
                          </button>
                          <button
                            onClick={() => setEditing(e => { const n = { ...e }; delete n[lead.id]; return n })}
                            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-slate-300 leading-relaxed">{lead.pitch}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPitch(lead.id, lead.pitch!)}
                            className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          >
                            Edit pitch
                          </button>
                          {lead.status === 'drafted' && (
                            <button
                              onClick={() => handleMarkSent(lead.id)}
                              className="rounded-lg bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                              Mark as sent ✓
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
