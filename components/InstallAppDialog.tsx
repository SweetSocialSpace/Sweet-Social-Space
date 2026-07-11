'use client'

import { useEffect, useState } from 'react'

function detectPlatform(): 'ios' | 'android' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent || ''
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

export function InstallAppDialog({ onClose }: { onClose: () => void }) {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    setPlatform(detectPlatform())
    // Detect if already running as installed PWA
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setInstalled(Boolean(standalone))
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="install-dialog-title"
      >
        <h2 id="install-dialog-title" className="font-display text-lg font-semibold">
          Add Sweet Social Space to your home screen
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Install Sweet Social Space like a regular app — no app store required. It opens fullscreen and
          loads instantly.
        </p>

        {installed && (
          <p className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-xs text-green-800 dark:bg-green-950/40 dark:text-green-200">
            You're already running the installed app. 🎉
          </p>
        )}

        <div className="mt-4 flex gap-2 text-xs font-medium">
          <button
            onClick={() => setPlatform('ios')}
            className={`flex-1 rounded-full px-3 py-1.5 transition ${platform === 'ios'? 'bg-foreground text-background' : 'bg-secondary text-secondary-foreground'}`}
          >
            iPhone / iPad
          </button>
          <button
            onClick={() => setPlatform('android')}
            className={`flex-1 rounded-full px-3 py-1.5 transition ${platform === 'android'? 'bg-foreground text-background' : 'bg-secondary text-secondary-foreground'}`}
          >
            Android
          </button>
          <button
            onClick={() => setPlatform('desktop')}
            className={`flex-1 rounded-full px-3 py-1.5 transition ${platform === 'desktop'? 'bg-foreground text-background' : 'bg-secondary text-secondary-foreground'}`}
          >
            Desktop
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-background p-4 text-sm">
          {platform === 'ios' && (
            <ol className="list-decimal space-y-2 pl-5 text-foreground">
              <li>
                Open <strong>sweetsocial.live</strong> in <strong>Safari</strong> (not Chrome).
              </li>
              <li>
                Tap the <strong>Share</strong> button{' '}
                <span aria-hidden>(the square with an up arrow)</span> at the bottom of the screen.
              </li>
              <li>
                Scroll down and tap <strong>Add to Home Screen</strong>.
              </li>
              <li>
                Tap <strong>Add</strong> in the top right.
              </li>
            </ol>
          )}
          {platform === 'android' && (
            <ol className="list-decimal space-y-2 pl-5 text-foreground">
              <li>
                Open <strong>sweetsocial.live</strong> in <strong>Chrome</strong>.
              </li>
              <li>
                Tap the <strong>⋮ menu</strong> in the top-right corner.
              </li>
              <li>
                Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
              </li>
              <li>
                Tap <strong>Install</strong> to confirm.
              </li>
            </ol>
          )}
          {platform === 'desktop' && (
            <ol className="list-decimal space-y-2 pl-5 text-foreground">
              <li>
                Open <strong>sweetsocial.live</strong> in <strong>Chrome</strong>,{' '}
                <strong>Edge</strong>, or <strong>Brave</strong>.
              </li>
              <li>
                Look for the <strong>install icon</strong> on the right side of the address bar (a
                small monitor with a down arrow).
              </li>
              <li>
                Click it, then click <strong>Install</strong>.
              </li>
            </ol>
          )}
        </div>

        <p className="mt-3 text- text-muted-foreground">
          Once installed, Sweet Social Space launches like any other app — no browser bars in the way.
        </p>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
