'use client'

import * as React from 'react'
import { VoiceInputButton } from '@/components/VoiceInputButton'

// TODO: Replace with shadcn/ui when installed
// import {
// Dialog,
// DialogContent,
// DialogHeader,
// DialogTitle,
// DialogDescription,
// } from '@/components/ui/dialog'

// Stub Dialog components - replace with shadcn/ui when installed
function Dialog({ open, onOpenChange, children }: any) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => onOpenChange(false)}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}
function DialogContent({ children, className = '' }: any) {
  return <div className={`w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl ${className}`}>{children}</div>
}
function DialogHeader({ children }: any) {
  return <div className="mb-4">{children}</div>
}
function DialogTitle({ children }: any) {
  return <h2 className="font-display text-lg font-semibold">{children}</h2>
}
function DialogDescription({ children }: any) {
  return <p className="mt-1 text-sm text-muted-foreground">{children}</p>
}

interface CommentComposerDialogProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  maxLength?: number
  submitLabel?: string
  disabled?: boolean
  title?: string
  dialogRows?: number
  previewClassName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommentComposerDialog({
  value,
  onChange,
  onSubmit,
  placeholder = 'Write something…',
  maxLength = 2000,
  submitLabel = 'Post',
  disabled = false,
  title = 'Write a comment',
  dialogRows = 10,
  previewClassName,
  open: controlledOpen,
  onOpenChange,
}: CommentComposerDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen!== undefined
  const open = isControlled? controlledOpen : internalOpen
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const handleSubmit = () => {
    onSubmit()
    setOpen(false)
  }

  // Keep latest value/maxLength/onChange in refs so the mic's onTranscript
  // callback (captured by the Scribe hook) isn't stale across re-renders.
  const valueRef = React.useRef(value)
  const onChangeRef = React.useRef(onChange)
  const maxLenRef = React.useRef(maxLength)
  const voiceBaseRef = React.useRef<string | null>(null)
  React.useEffect(() => {
    valueRef.current = value
  }, [value])
  React.useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])
  React.useEffect(() => {
    maxLenRef.current = maxLength
  }, [maxLength])

  const appendVoiceText = React.useCallback((current: string, text: string) => {
    const next = current? `${current.replace(/\s+$/, '')} ${text}` : text
    return next.slice(0, maxLenRef.current)
  }, [])

  const handleVoice = React.useCallback(
    (text: string) => {
      const base = voiceBaseRef.current?? valueRef.current?? ''
      const trimmed = appendVoiceText(base, text)
      valueRef.current = trimmed
      voiceBaseRef.current = trimmed
      onChangeRef.current(trimmed)
    },
    [appendVoiceText],
  )

  const handleVoicePartial = React.useCallback(
    (text: string) => {
      if (voiceBaseRef.current === null) voiceBaseRef.current = valueRef.current?? ''
      const trimmed = appendVoiceText(voiceBaseRef.current, text)
      valueRef.current = trimmed
      onChangeRef.current(trimmed)
    },
    [appendVoiceText],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          previewClassName??
          'flex-1 cursor-text rounded-2xl border border-border bg-background px-3 py-2 text-left text-sm outline-none transition hover:bg-muted focus:ring-2 focus:ring-primary'
        }
      >
        {value? (
          <span className="block line-clamp-1 text-foreground">{value}</span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Review your full message before posting. Press Ctrl+Enter to submit.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={value}
            onChange={(e) => {
              voiceBaseRef.current = e.target.value
              onChange(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={dialogRows}
            autoFocus
            className="w-full resize-none rounded-md border border-border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <VoiceInputButton
                size="sm"
                onTranscript={handleVoice}
                onPartialTranscript={handleVoicePartial}
              />

              <span className="text-xs text-muted-foreground">
                {value.length}/{maxLength}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={disabled}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
