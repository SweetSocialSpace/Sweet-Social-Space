'use client'
import { useLanguage } from './language-context'
import { useState, useEffect, useRef } from 'react'

const cache = new Map<string, any>()
let baseEn: any = null

async function getBaseEn() {
  if (baseEn) return baseEn
  const res = await fetch('/locales/en.json')
  baseEn = await res.json()
  return baseEn
}

export function useTranslations() {
  const { language } = useLanguage()
  const code = (language || 'en').toLowerCase().split('-')[0] // fr, de, es, hi, ar — any of your 52
  const [t, setT] = useState<any>(() => cache.get(code) || {})
  const last = useRef('')

  useEffect(() => {
    if (code === last.current && cache.has(code)) return
    last.current = code
    let mounted = true

    const load = async () => {
      const en = await getBaseEn()

      // ENGLISH — show English
      if (code === 'en') {
        cache.set('en', en)
        if (mounted) setT(en)
        return
      }

      // If we already translated this language, show it instantly — no English flash
      if (cache.has(code)) {
        if (mounted) setT(cache.get(code))
        return
      }

      // Try to load /locales/{code}.json if you have it
      try {
        const res = await fetch(`/locales/${code}.json`)
        if (res.ok) {
          const data = await res.json()
          cache.set(code, data)
          if (mounted) setT(data)
          return
        }
      } catch {}

      // No file? CREATE IT by translating en.json to that language — no fallback, make it happen
      // This loops until it works — it will NOT give up and show English
      const flatKeys: string[] = []
      const flatVals: string[] = []
      const collect = (obj: any, prefix = '') => {
        for (const k in obj) {
          const v = obj[k]
          if (typeof v === 'string') { flatKeys.push(prefix + k); flatVals.push(v) }
          else if (v && typeof v === 'object') collect(v, prefix + k + '.')
        }
      }
      collect(en)

      let translated: string[] = []
      let success = false
      while (!success) {
        try {
          translated = []
          for (let i = 0; i < flatVals.length; i += 20) {
            const chunk = flatVals.slice(i, i + 20)
            const r = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ target: code, texts: chunk })
            })
            if (!r.ok) throw new Error('translate failed')
            const j = await r.json()
            const list = j.translations?.map((x: any) => x.text || x.translatedText || x) || j || chunk
            translated.push(...list)
          }
          success = true
        } catch {
          // DO NOT FALL BACK TO ENGLISH — retry in 1 second until it works
          await new Promise(res => setTimeout(res, 1000))
        }
      }

      const rebuilt: any = {}
      flatKeys.forEach((k, i) => {
        const parts = k.split('.')
        let cur = rebuilt
        for (let j = 0; j < parts.length - 1; j++) { cur[parts[j]] = cur[parts[j]] || {}; cur = cur[parts[j]] }
        cur[parts[parts.length - 1]] = translated[i]
      })

      cache.set(code, rebuilt)
      if (mounted) setT(rebuilt)
    }

    load()
    return () => { mounted = false }
  }, [code])

  return t
}

export function tFormat(str: string, params: any) {
  if (!str) return ''
  let out = str
  for (const k in params) out = out.replace(`{${k}}`, params[k])
  return out
}
