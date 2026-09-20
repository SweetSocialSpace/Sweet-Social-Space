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
export const RTL_LANGUAGES: Language[] = ['ar','he','ur','fa']

type LanguageContextType = {
  lang: Language
  language: Language
  languageName: string
  setLang: (l: Language) => void
  setLanguage: (l: Language) => void
  LANGUAGE_NAMES: typeof LANGUAGE_NAMES
  LANGUAGES: string[]
  isRTL: boolean
  t?: any
  [key: string]: any
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  language: 'en',
  languageName: 'English',
  setLang: () => {},
  setLanguage: () => {},
  LANGUAGE_NAMES,
  LANGUAGES,
  isRTL: false,
})

function safeGetInitialLang(): Language {
  if (typeof window=== 'undefined') return 'en'
  try {
    const cookieLang = typeof document!== 'undefined'
   ? document.cookie.match(/NEXT_LOCALE=([^;]+)/)?.[1] as Language
      : null
    const saved = (() => {
      try {
        return localStorage.getItem('sss_lang') as Language
      } catch {
        return null
      }
    })()
    let browserLang: Language = 'en'
    if (typeof navigator!== 'undefined') {
      const raw = navigator.language || (navigator as any).userLanguage || 'en'
      const short = raw.slice(0, 2).toLowerCase() as Language
      if (LANGUAGE_NAMES[short]) {
        browserLang = short
      } else {
        const fullMap: Record<string, Language> = {
          'zh-cn': 'zh', 'zh-tw': 'zh', 'zh-hk': 'zh',
          'pt-br': 'pt', 'pt-pt': 'pt',
        }
        const lowerRaw = raw.toLowerCase()
        browserLang = fullMap[lowerRaw] || short
      }
    }
    let finalLang: Language = (cookieLang || saved || (LANGUAGE_NAMES[browserLang]? browserLang : 'en')) as Language
    if (!LANGUAGE_NAMES[finalLang]) {
      console.warn(` Unknown lang ${finalLang}, falling back to en`)
      finalLang = 'en'
    }
    return finalLang
  } catch {
    return 'en'
  }
}

export function LanguageProvider({ children }: any) {
  const [lang, setLang] = useState<Language>('en')
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const finalLang = safeGetInitialLang()
    setLang(finalLang)
    setLanguageState(finalLang)
    try {
      if (typeof document!== 'undefined') {
        document.documentElement.lang = finalLang
        document.documentElement.dir = RTL_LANGUAGES.includes(finalLang)? 'rtl' : 'ltr'
      }
    } catch {}
  }, [])

  const setLanguage = async (newLang: Language) => {
    if (!LANGUAGE_NAMES[newLang]) {
      console.warn(` Invalid lang ${newLang}`);
      newLang = 'en' as Language
    }
    setLang(newLang)
    setLanguageState(newLang)
    if (typeof window!== 'undefined') {
      try {
        localStorage.setItem('sss_lang', newLang)
      } catch(e){
        console.warn(' localStorage failed', e)
      }
      try {
        document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; SameSite=Lax`
      } catch(e){
        console.warn(' cookie failed', e)
      }
      try {
        if (typeof document!== 'undefined') {
          document.documentElement.lang = newLang
          document.documentElement.dir = RTL_LANGUAGES.includes(newLang)? 'rtl' : 'ltr'
        }
      } catch {}
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
  const isRTL = RTL_LANGUAGES.includes(language)

  return (
    <LanguageContext.Provider value={{
      lang,
      language,
      languageName,
      setLang: setLanguage,
      setLanguage,
      LANGUAGE_NAMES,
      LANGUAGES,
      isRTL,
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  try {
    const ctx = useContext(LanguageContext)
    if (!ctx?.language) throw new Error('no ctx')
    return ctx
  } catch {
    return {
      lang: 'en' as Language,
      language: 'en' as Language,
      languageName: 'English',
      setLang: () => {},
      setLanguage: () => {},
      LANGUAGE_NAMES,
      LANGUAGES,
      isRTL: false,
    } as LanguageContextType
  }
}

export default LanguageProvider
