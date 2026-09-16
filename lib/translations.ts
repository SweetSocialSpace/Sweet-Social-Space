'use client'
import { useEffect, useState, useMemo } from 'react'
import { useLanguage } from './language-context'
type Dict = Record<string, any>
let cache: Dict = {}
let enFallback: Dict | null = null
const PATHS = [(l:string)=>`/translations/${l}.json`, (l:string)=>`/locales/${l}.json`, (l:string)=>`/${l}.json`]
function deepMerge(target: Dict, fallback: Dict): Dict {
  if (!fallback) return target; if (!target) return fallback
  const out: Dict = { ...fallback, ...target }
  for (const k of Object.keys(fallback)) {
    if (typeof fallback[k] === 'object' && fallback[k] !== null && !Array.isArray(fallback[k])) {
      if (typeof target[k] === 'object' && target[k] !== null) out[k] = deepMerge(target[k], fallback[k])
    }
  }
  return out
}
async function safeLoad(lang: string) {
  if (cache[lang]) return cache[lang]
  for (const getPath of PATHS) {
    try {
      const res = await fetch(getPath(lang), { cache: 'no-store' }).catch(()=>null)
      if (res && res.ok) { const j = await res.json(); cache[lang]=j; return j }
    } catch {}
  }
  return null
}
export function useTranslations() {
  const { language } = useLanguage()
  const [dict, setDict] = useState<Dict>(()=> enFallback || cache[language] || {})
  useEffect(()=>{ let m=true; (async()=>{
    if (!enFallback) { const en=await safeLoad('en'); if(en) enFallback=en }
    if (language==='en' && enFallback) { if(m) setDict(enFallback); return }
    const d=await safeLoad(language); if(!m) return
    if(d && enFallback) setDict(deepMerge(d, enFallback)); else if(d) setDict(d); else if(enFallback) setDict(enFallback)
  })(); return ()=>{ m=false } }, [language])
  return useMemo(()=>dict, [dict])
}
export function tFormat(str:string|undefined, vars:Record<string,string|number>){ if(!str) return ''; let s=str; try{ for(const [k,v] of Object.entries(vars)) s=s.replaceAll(`{${k}}`, String(v)) }catch{} return s }
export default useTranslations
