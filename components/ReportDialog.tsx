'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { VoiceInputButton } from '@/components/VoiceInputButton'
import { supabase } from '@/lib/supabase'

// TODO: Port lib/moderation.functions.ts from Lovable
// import {
// submitReport,
// REPORT_CATEGORIES,
// REPORT_CATEGORY_LABEL,
// type ReportCategory,
// type ReportTargetType,
// } from '@/lib/moderation.functions'

// Stub types and constants - replace with real imports when we port moderation.functions.ts
type ReportTargetType = 'post' | 'comment' | 'user' | 'business' | 'message'
type ReportCategory = 'harassment' | 'spam' | 'hate_speech' | 'violence' | 'misinformation' | 'illegal' | 'other'

const REPORT_CATEGORIES: ReportCategory[] = ['harassment', 'spam', 'hate_speech', 'violence', 'misinformation', 'illegal', 'other']

const REPORT_CATEGORY_LABEL: Record<ReportCategory, string> = {
  harassment: 'Harassment or bullying',
  spam: 'Spam or misleading',
  hate_speech: 'Hate speech',
  violence: 'Violence or dangerous acts',
  misinformation: 'Misinformation',
  illegal: 'Illegal activity',
  other: 'Other',
}

// Stub submitReport - replace with real server action
async function submitReport(data: {
  target_type: ReportTargetType
  target_id: string
  category: ReportCategory
  details?: string
  turnstile_token?: string
}) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Not authenticated')

  const { error } = await supabase.from('reports').insert({
    target_type: data.target_type,
    target_id: data.target_id,
    category: data.category,
    details: data.details || null,
    reporter_id: user.user.id,
  })
  if (error) throw error
}

type Props = {
  targetType: ReportTargetType
  targetId: string
  /** Human label for what's being reported, e.g. "post", "comment", "user". */
  label?: string
  onClose: () => void
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export function ReportDialog({ targetType, targetId, label, onClose }: Props) {
  const [category, setCategory] = useState<ReportCategory>('harassment')
  const [details, setDetails] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const noun = label?? targetType.replace(/_/g, ' ')

  async function onSubmit() {
    setBusy(true)
    setError('')
    try {
      await submitReport({
        target_type: targetType,
        target_id: targetId,
        category,
        details: details.trim() || undefined,
        turnstile_token: turnstileToken?? undefined,
      })
      setDone(true)
      toast.success('Report submitted')
    } catch (e) {
      const msg = e instanceof Error? e.message : 'Failed to submit report'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {done? (
          <>
            <h2 className="font-display text-lg font-semibold">Thanks for reporting</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A moderator will review this {noun}. Reports are confidential.
            </p>
            <div className="mt-4 flex justify-end">
              <button onClick={onClose} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-lg font-semibold">Report this {noun}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Reports go to our moderation queue. False reporting can affect your account standing.
            </p>

            <label className="mt-4 block text-sm font-medium">Reason</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ReportCategory)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              {REPORT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {REPORT_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>

            <label className="mt-3 block text-sm font-medium">Details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={1000}
              rows={3}
              className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Anything that will help us review."
            />
            <div className="mt-1 flex justify-end">
              <VoiceInputButton size="sm" onTranscript={(t) => setDetails((p) => (p? p.trimEnd() + ' ' + t : t))} />
            </div>

            {TURNSTILE_SITE_KEY && (
              <TurnstileWidget siteKey={TURNSTILE_SITE_KEY} onToken={setTurnstileToken} />
            )}

            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={busy || (!!TURNSTILE_SITE_KEY &&!turnstileToken)}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {busy? 'Sending…' : 'Submit report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Minimal Cloudflare Turnstile widget loader. No-op when no site key.
function TurnstileWidget({ siteKey, onToken }: { siteKey: string; onToken: (t: string) => void }) {
  const containerId = `ts-${siteKey.slice(0, 8)}`
  if (typeof window!== 'undefined') {
    const w = window as Window & { turnstile?: { render: (sel: string, cfg: Record<string, unknown>) => void } }
    if (!document.querySelector('script[data-turnstile]')) {
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      s.async = true
      s.defer = true
      s.setAttribute('data-turnstile', '1')
      document.head.appendChild(s)
    }
    setTimeout(() => {
      const el = document.getElementById(containerId)
      if (el && w.turnstile &&!el.hasChildNodes()) {
        w.turnstile.render(`#${containerId}`, { sitekey: siteKey, callback: (tok: string) => onToken(tok) })
      }
    }, 300)
  }
  return <div id={containerId} className="mt-3" />
}
