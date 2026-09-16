'use client'
import { useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
const RTL = ['ar','he','ur','fa']
export default function LanguageHtml({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage()
  useEffect(()=>{ if(typeof window==='undefined') return; try{ document.documentElement.lang=language; document.documentElement.dir=RTL.includes(language)?'rtl':'ltr' }catch{} }, [language])
  return <>{children}</>
}
