'use client'

import * as React from 'react'
import MicRecorder from '@/components/mic/MicRecorder'

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
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={dialogRows}
            autoFocus
            className="w-full resize-none rounded-md border border-border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
             <MicRecorder onTranscript={(t:string) => onChange(t)} />
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
