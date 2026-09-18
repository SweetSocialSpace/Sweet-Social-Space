'use client'
import { useLanguage } from './language-context'
import { useEffect, useState } from 'react'

const cache = new Map<string,string>()
let enData: any = null

export function useTranslations() {
  const { language } = useLanguage()
  const lang = (language || 'en').toLowerCase()
  const isEn = lang.startsWith('en')
  const [t, setT] = useState<any>(enData || {})

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        // 1. Load English base
        if (!enData) {
          const res = await fetch('/locales/en.json').catch(()=>null)
          if (res?.ok) enData = await res.json()
        }
        if (isEn) { if(mounted) setT(enData||{}); return }

        // 2. Try to load that language file if you have it (es.json, fr.json etc)
        const resLang = await fetch(`/locales/${lang.split('-')[0]}.json`).catch(()=>null)
        if (resLang?.ok) {
          const data = await resLang.json()
          if(mounted) setT(data)
          return
        }

        // 3. No file? Auto-translate ALL English keys via your /api/translate — this makes all 52 work even without 52 json files
        const flatKeys: string[] = []
        const flatValues: string[] = []
        const collect = (obj:any, prefix='') => {
          for (const k in obj) {
            const v = obj[k]
            if (typeof v === 'string') { flatKeys.push(prefix+k); flatValues.push(v) }
            else if (typeof v === 'object') collect(v, prefix+k+'.')
          }
        }
        if (enData) collect(enData)

        // Translate in chunks of 20 to avoid API limit
        const translatedValues: string[] = []
        for (let i=0;i<flatValues.length;i+=20) {
          const chunk = flatValues.slice(i,i+20)
          const key = `${lang}:${chunk.join('|')}`
          if (cache.has(key)) { translatedValues.push(...cache.get(key)!.split('|')); continue }
          const tr = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: lang, texts: chunk })
          }).then(r=>r.json()).catch(()=>null)
          const list = tr?.translations?.map((x:any)=> x.text || x.translatedText || x) || chunk
          cache.set(key, list.join('|'))
          translatedValues.push(...list)
        }

        // Rebuild nested object
        const rebuilt: any = {}
        flatKeys.forEach((k,i)=>{
          const parts = k.split('.')
          let cur = rebuilt
          for(let j=0;j<parts.length-1;j++){ cur[parts[j]] = cur[parts[j]]||{}; cur = cur[parts[j]] }
          cur[parts[parts.length-1]] = translatedValues[i]
        })
        if(mounted) setT(rebuilt)
      } catch {}
    }
    load()
    return ()=>{ mounted = false }
  }, [lang, isEn])

  return t
}

export function tFormat(str: string, params: any) {
  if (!str) return ''
  let out = str
  for (const k in params) out = out.replace(`{${k}}`, params[k])
  return out
}
