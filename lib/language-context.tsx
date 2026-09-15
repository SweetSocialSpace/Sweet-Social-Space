'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', zh: '中文', ja: '日本語', ko: '한국어', tl: 'Tagalog', hi: 'हिन्दी', ar: 'العربية', pt: 'Português', ru: 'Русский',
  it: 'Italiano', nl: 'Nederlands', sv: 'Svenska', pl: 'Polski', uk: 'Українська', el: 'Ελληνικά', tr: 'Türkçe', cs: 'Čeština', hu: 'Magyar', fi: 'Suomi', no: 'Norsk', da: 'Dansk', bg: 'Български', hr: 'Hrvatski', sr: 'Српски', sk: 'Slovenčina', sl: 'Slovenščina', et: 'Eesti', lv: 'Latviešu', lt: 'Lietuvių', be: 'Беларуская', ro: 'Română',
  he: 'עברית', ur: 'اردو', fa: 'فارسی', id: 'Indonesia', vi: 'Tiếng Việt', th: 'ไทย', ms: 'Melayu', km: 'ខ្មែរ', lo: 'ລາວ', my: 'မြန်မာ', bn: 'বাংলা',
  ka: 'ქართული', hy: 'Հայերեն', az: 'Azərbaycanca', kk: 'Қазақша', ky: 'Кыргызча', uz: 'Oʻzbekcha', tg: 'Тоҷикӣ', mn: 'Монгол',
}

export const LANGUAGES = Object.keys(LANGUAGE_NAMES)
export type Language = keyof typeof LANGUAGE_NAMES

const LanguageContext = createContext<any>({
  lang: 'en',
  language: 'en',
  languageName: 'English',
  setLang: () => {},
  setLanguage: () => {},
})

export function LanguageProvider({ children }: any) {
  const [lang, setLang] = useState<Language>('en')
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const cookieLang = document.cookie.match(/NEXT_LOCALE=([^;]+)/)?.[1] as Language
    const saved = localStorage.getItem('sss_lang') as Language | null
    const browserLang = navigator.language.slice(0,2) as Language
    const finalLang: Language = (cookieLang || saved || (LANGUAGE_NAMES[browserLang]? browserLang : 'en')) as Language
    setLang(finalLang)
    setLanguageState(finalLang)
    document.documentElement.lang = finalLang
  }, [])

  const setLanguage = async (newLang: Language) => {
    setLang(newLang)
    setLanguageState(newLang)
    if (typeof window!== 'undefined') {
      localStorage.setItem('sss_lang', newLang)
      document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`
      document.documentElement.lang = newLang
    }
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ language: newLang }).eq('id', user.id)
      }
    } catch {}
  }

  const languageName = LANGUAGE_NAMES[language] || 'English'

  return (
    <LanguageContext.Provider value={{ lang, language, languageName, setLang: setLanguage, setLanguage, LANGUAGE_NAMES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    return {
      lang: 'en',
      language: 'en',
      languageName: 'English',
      setLang: () => {},
      setLanguage: () => {},
    }
  }
  return ctx
}
