'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'

const DICT: any = {
  en: { title: "AI MAYOR", gm: "Good morning", ga: "Good afternoon", ge: "Good evening", gn: "Good night", mild: "Mild {t}°F - perfect", hot: "Hot {t}°F - stay hydrated", first: "Be the first to share in {c}", watch: "Your AI Mayor is watching over {c}" },
  es: { title: "ALCALDE IA", gm: "Buenos días", ga: "Buenas tardes", ge: "Buenas noches", gn: "Buenas noches", mild: "Suave {t}°F - perfecto", hot: "Calor {t}°F - hidrátate", first: "Sé el primero en compartir en {c}", watch: "Tu Alcalde IA vigila {c}" },
  fr: { title: "MAIRE IA", gm: "Bonjour", ga: "Bon après-midi", ge: "Bonsoir", gn: "Bonne nuit", mild: "Doux {t}°F", hot: "Chaud {t}°F", first: "Premier à {c}", watch: "Votre Maire IA veille sur {c}" },
}

export default function AIMayor() {
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const loc = (DICT[language] || DICT.en)
  const effZip = zip && zip!== 'LOCAL'? zip : 'LOCAL'
  const effCity = city || effZip
  const [brief, setBrief] = useState('...')

  useEffect(() => {
    const run = async () => {
      const hour = new Date().getHours()
      let g = loc.gm
      if (hour >= 12 && hour < 17) g = loc.ga
      if (hour >= 17 && hour < 21) g = loc.ge
      if (hour >= 21) g = loc.gn

      const w = await fetch(`/api/weather?zip=${effZip}`).then(r=>r.json()).catch(()=>({temp:65}))
      const t = w?.temp? Math.round(w.temp) : 65
      const tempStr = t >= 85? loc.hot.replace('{t}', t) : loc.mild.replace('{t}', t)
      const date = new Date().toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'short' })

      setBrief(`${g} ${effCity} • ${tempStr} • ${loc.first.replace('{c}', effCity)} • 📅 ${date} • ${loc.watch.replace('{c}', effCity)}`)
    }
    run()
  }, [effZip, effCity, language, loc])

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-purple-300 font-black text-xs">{loc.title} • LIVE • {effCity.toUpperCase()}</span>
      </div>
      <div className="text-white text-sm mt-1 leading-relaxed">{brief}</div>
    </div>
  )
}
