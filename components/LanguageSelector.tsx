'use client'

import { useState } from 'react'
import { useLanguage, LANGUAGE_NAMES, type Language } from '@/lib/language-context'

export default function LanguageSelector() {
  const { language, setLanguage, languageName } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languageGroups = [
    { name: 'Popular', languages: ['en','es','fr','de','zh','ja','ko','tl','hi','ar','pt','ru'] },
    { name: 'Europe', languages: ['it','nl','sv','pl','uk','el','tr','cs','hu','fi','no','da','bg','hr','sr','sk','sl','et','lv','lt','be','ro'] },
    { name: 'Middle East & Asia', languages: ['he','ur','fa','id','vi','th','ms','km','lo','my','bn'] },
    { name: 'Central Asia', languages: ['ka','hy','az','kk','ky','uz','tg','mn'] }
  ] as const

  return (
    <div className="relative" data-sss-no-translate>
      <button
        type="button"
        onClick={() => setIsOpen(value => !value)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-white text-xs font-black transition"
        aria-label="Language"
      >
        <span className="text-lg">🌐</span>
        <span>{languageName}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-black border border-white/20 rounded-xl shadow-xl overflow-hidden z-50 w-56 max-h-96 overflow-y-auto">
          <button
            type="button"
           onClick={() => {
  setLanguage(lang)
  setIsOpen(false)

  // Tell the translation system immediately.
  window.dispatchEvent(
    new CustomEvent(
      'sss-language-changed',
      {
        detail: {
          language: lang
        }
      }
    )
  )
}}
            className="absolute top-2 right-2 text-white/50 hover:text-white text-xs"
            aria-label="Close language menu"
          >
            ✕
          </button>

          {languageGroups.map(group => (
            <div key={group.name}>
              <div className="px-4 py-2 text-xs font-bold text-white/50 uppercase tracking-wider sticky top-0 bg-black">
                {group.name}
              </div>

              {group.languages.map(code => {
                const lang = code as Language
                return (
                  <button
                    type="button"
                    key={lang}
                    onClick={() => {
                      setLanguage(lang)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition ${
                      language === lang
                        ? 'bg-white/20 text-white'
                        : 'text-white/70'
                    }`}
                  >
                    {LANGUAGE_NAMES[lang]}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
