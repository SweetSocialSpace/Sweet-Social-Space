'use client'
import { useTranslations } from '@/lib/translations'
import { useEffect, useState } from 'react'

function detectPlatform(): 'ios' | 'android' | 'desktop' {
  try { if (typeof navigator === 'undefined') return 'desktop'; const ua = navigator.userAgent || ''; if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'; if (/Android/i.test(ua)) return 'android'; return 'desktop' } catch { return 'desktop' }
}

export function InstallAppDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations() as any
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    try { setPlatform(detectPlatform()); const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (window.navigator as any).standalone === true; setInstalled(Boolean(standalone)) } catch {}
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={()=>{ try { onClose() } catch {} }}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="install-dialog-title">
        <h2 id="install-dialog-title" className="font-display text-lg font-semibold">{t?.install?.title || 'Add Sweet Social Space to your home screen'}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t?.install?.subtitle || 'Install Sweet Social Space like a regular app — no app store required. It opens fullscreen and loads instantly.'}</p>
        {installed && (<p className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-xs text-green-800 dark:bg-green-950/40 dark:text-green-200">{t?.install?.alreadyInstalled || "You're already running the installed app. 🎉"}</p>)}
        <div className="mt-4 flex gap-2 text-xs font-medium"><button onClick={() => setPlatform('ios')} className={`flex-1 rounded-full px-3 py-1.5 transition ${platform === 'ios'? 'bg-foreground text-background' : 'bg-secondary text-secondary-foreground'}`}>{t?.install?.ios || 'iPhone / iPad'}</button><button onClick={() => setPlatform('android')} className={`flex-1 rounded-full px-3 py-1.5 transition ${platform === 'android'? 'bg-foreground text-background' : 'bg-secondary text-secondary-foreground'}`}>{t?.install?.android || 'Android'}</button><button onClick={() => setPlatform('desktop')} className={`flex-1 rounded-full px-3 py-1.5 transition ${platform === 'desktop'? 'bg-foreground text-background' : 'bg-secondary text-secondary-foreground'}`}>{t?.install?.desktop || 'Desktop'}</button></div>
        <div className="mt-4 rounded-xl border border-border bg-background p-4 text-sm">
          {platform === 'ios' && (<ol className="list-decimal space-y-2 pl-5 text-foreground"><li>{t?.install?.ios1a || 'Open'} <strong>sweetsocial.live</strong> {t?.install?.ios1b || 'in'} <strong>Safari</strong> {t?.install?.ios1c || '(not Chrome).'}</li><li>{t?.install?.ios2a || 'Tap the'} <strong>{t?.install?.share || 'Share'}</strong> {t?.install?.ios2b || 'button (the square with an up arrow) at the bottom of the screen.'}</li><li>{t?.install?.ios3a || 'Scroll down and tap'} <strong>{t?.install?.addToHome || 'Add to Home Screen'}</strong>.</li><li>{t?.install?.ios4a || 'Tap'} <strong>{t?.install?.add || 'Add'}</strong> {t?.install?.ios4b || 'in the top right.'}</li></ol>)}
          {platform === 'android' && (<ol className="list-decimal space-y-2 pl-5 text-foreground"><li>{t?.install?.android1a || 'Open'} <strong>sweetsocial.live</strong> {t?.install?.android1b || 'in'} <strong>Chrome</strong>.</li><li>{t?.install?.android2a || 'Tap the'} <strong>{t?.install?.menu || '⋮ menu'}</strong> {t?.install?.android2b || 'in the top-right corner.'}</li><li>{t?.install?.android3a || 'Tap'} <strong>{t?.install?.installApp || 'Install app'}</strong> {t?.install?.or || 'or'} <strong>{t?.install?.addToHome || 'Add to Home screen'}</strong>.</li><li>{t?.install?.android4a || 'Tap'} <strong>{t?.install?.install || 'Install'}</strong> {t?.install?.toConfirm || 'to confirm.'}</li></ol>)}
          {platform === 'desktop' && (<ol className="list-decimal space-y-2 pl-5 text-foreground"><li>{t?.install?.desktop1a || 'Open'} <strong>sweetsocial.live</strong> {t?.install?.desktop1b || 'in'} <strong>Chrome</strong>, <strong>Edge</strong>, {t?.install?.or || 'or'} <strong>Brave</strong>.</li><li>{t?.install?.desktop2a || 'Look for the'} <strong>{t?.install?.installIcon || 'install icon'}</strong> {t?.install?.desktop2b || 'on the right side of the address bar (a small monitor with a down arrow).'}</li><li>{t?.install?.desktop3a || 'Click it, then click'} <strong>{t?.install?.install || 'Install'}</strong>.</li></ol>)}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t?.install?.onceInstalled || 'Once installed, Sweet Social Space launches like any other app — no browser bars in the way.'}</p>
        <div className="mt-5 flex justify-end"><button onClick={()=>{ try { onClose() } catch {} }} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">{t?.common?.gotIt || t?.install?.gotIt || 'Got it'}</button></div>
      </div>
    </div>
  )
}
