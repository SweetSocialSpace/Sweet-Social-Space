'use client'
import { useLanguage } from '@/lib/language-context'

export default function LanguageSelector() {
  const { language, setLanguage, languageName } = useLanguage()

  const languageGroups = [
    {
      name: 'Popular',
      languages: [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
        { code: 'zh', name: '中文' },
        { code: 'ja', name: '日本語' },
        { code: 'ko', name: '한국어' },
        { code: 'tl', name: 'Filipino' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'ar', name: 'العربية' },
        { code: 'pt', name: 'Português' },
        { code: 'ru', name: 'Русский' }
      ]
    },
    {
      name: 'Europe',
      languages: [
        { code: 'it', name: 'Italiano' },
        { code: 'nl', name: 'Nederlands' },
        { code: 'sv', name: 'Svenska' },
        { code: 'pl', name: 'Polski' },
        { code: 'uk', name: 'Українська' },
        { code: 'el', name: 'Ελληνικά' },
        { code: 'tr', name: 'Türkçe' },
        { code: 'cs', name: 'Čeština' },
        { code: 'hu', name: 'Magyar' },
        { code: 'fi', name: 'Suomi' },
        { code: 'no', name: 'Norsk' },
        { code: 'da', name: 'Dansk' },
        { code: 'bg', name: 'Български' },
        { code: 'hr', name: 'Hrvatski' },
        { code: 'sr', name: 'Српски' },
        { code: 'sk', name: 'Slovenčina' },
        { code: 'sl', name: 'Slovenščina' },
        { code: 'et', name: 'Eesti' },
        code: 'lv', name: 'Latviešu' },
        { code: 'lt', name: 'Lietuvių' },
        { code: 'be', name: 'Беларуская' },
        { code: 'ro', name: 'Română' }
      ]
    },
    {
      name: 'Middle East & Asia',
      languages: [
        { code: 'he', name: 'עברית' },
        { code: 'ur', name: 'اردو' },
        { code: 'fa', name: 'فارسی' },
        { code: 'id', name: 'Bahasa Indonesia' },
        { code: 'vi', name: 'Tiếng Việt' },
        { code: 'th', name: 'ไทย' },
        { code: 'ms', name: 'Bahasa Melayu' },
        { code: 'km', name: 'ខ្មែរ' },
        { code: 'lo', name: 'ລາວ' },
        { code: 'my', name: 'မြနမာ' },
        { code: 'bn', name: 'বাংলা' }
      ]
    },
    {
      name: 'Central Asia',
      languages: [
        { code: 'ka', name: 'ქართუული' },
        { code: 'hy', name: 'Հաեներեն' },
        { code: 'az', name: 'Azərbaycan' },
        { code: 'kk', name: 'Қазақша' },
        { code: 'ky', name: 'Кыргызча' },
        { code: 'uz', name: 'O\'zbek' },
        { code: 'tg', name: 'Тоҷикӣ' },
        { code: 'mn', name: 'Монгол' }
      ]
    }
  ]

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-white text-xs font-black transition">
        <span className="text-lg">🌐</span>
        <span>{languageName}</span>
      </button>
      <div className="absolute top-full right-0 mt-2 bg-black border border-white/20 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50 w-56 max-h-96 overflow-y-auto">
        {languageGroups.map((group) => (
          <div key={group.name}>
            <div className="px-4 py-2 text-xs font-bold text-white/50 uppercase tracking-wider sticky top-0 bg-black">
              {group.name}
            </div>
            {group.languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code as any)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition ${
                  language === lang.code ? 'bg-white/20 text-white' : 'text-white/70'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
