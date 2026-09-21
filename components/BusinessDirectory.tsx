'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { title:"Local Businesses", near:"Near {area}", loadingArea:"Loading {area}...", loading:"Loading...", noBiz:"No businesses yet", police:"{city} Police Department", fire:"{city} Fire Department", library:"{city} Library", community:"{city} Community Center", catPolice:"Police", catFire:"Fire Station", catLib:"Library", catComm:"Community" },
  es: { title:"Negocios Locales", near:"Cerca de {area}", loadingArea:"Cargando {area}...", loading:"Cargando...", noBiz:"Aún no hay negocios", police:"Departamento de Policía de {city}", fire:"Departamento de Bomberos de {city}", library:"Biblioteca de {city}", community:"Centro Comunitario de {city}", catPolice:"Policía", catFire:"Estación Bomberos", catLib:"Biblioteca", catComm:"Comunidad" },
  fr: { title:"Commerces Locaux", near:"Près de {area}", loadingArea:"Chargement {area}...", loading:"Chargement...", noBiz:"Pas encore d'entreprises", police:"Département de Police de {city}", fire:"Caserne de Pompiers de {city}", library:"Bibliothèque de {city}", community:"Centre Communautaire de {city}", catPolice:"Police", catFire:"Pompiers", catLib:"Bibliothèque", catComm:"Communauté" },
  de: { title:"Lokale Unternehmen", near:"Nahe {area}", loadingArea:"Lade {area}...", loading:"Laden...", noBiz:"Noch keine Unternehmen", police:"{city} Polizei", fire:"{city} Feuerwehr", library:"{city} Bibliothek", community:"{city} Gemeindezentrum", catPolice:"Polizei", catFire:"Feuerwache", catLib:"Bibliothek", catComm:"Gemeinschaft" },
  zh: { title:"本地商家", near:"{area} 附近", loadingArea:"正在加载 {area}...", loading:"加载中...", noBiz:"暂无商家", police:"{city} 警察局", fire:"{city} 消防局", library:"{city} 图书馆", community:"{city} 社区中心", catPolice:"警察", catFire:"消防站", catLib:"图书馆", catComm:"社区" },
  ja: { title:"地元企業", near:"{area} 付近", loadingArea:"{area} を読み込み中...", loading:"読み込み中...", noBiz:"まだビジネスがありません", police:"{city} 警察署", fire:"{city} 消防署", library:"{city} 図書館", community:"{city} コミュニティセンター", catPolice:"警察", catFire:"消防署", catLib:"図書館", catComm:"コミュニティ" },
}

function getDict(lang: string){ return D[lang.split('-')[0]] || D.en }

type Biz = { id: string; name: string; category: string | null; latitude?: number | null; longitude?: number | null }

export function BusinessDirectory(){
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const d = getDict(language)
  const { filter } = useLocationScope()
  const [biz, setBiz] = useState<Biz[]>([])
  const [liveBiz, setLiveBiz] = useState<Biz[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if (!zip) return
    let mounted = true
    const CACHE_KEY = `biz_${zip}_v1`
    const CACHE_TIME_KEY = `biz_${zip}_v1_time`

    const fetchLiveBusinesses = async () => {
      if (!mounted) return
      setLoading(true)
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
        if (cached && cachedTime && Date.now() - parseInt(cachedTime) < 15*60*1000) {
          if(mounted){ setLiveBiz(JSON.parse(cached)); setLoading(false) }
          return
        }
        const displayCity = city || zip
        const fallback: Biz[] = [
          { id: 'fb-1', name: d.police.replace('{city}', displayCity), category: d.catPolice },
          { id: 'fb-2', name: d.fire.replace('{city}', displayCity), category: d.catFire },
          { id: 'fb-3', name: d.library.replace('{city}', displayCity), category: d.catLib },
          { id: 'fb-4', name: d.community.replace('{city}', displayCity), category: d.catComm },
        ]
        if(mounted){
          setLiveBiz(fallback)
          localStorage.setItem(CACHE_KEY, JSON.stringify(fallback))
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
        }
      } catch (e){
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached && mounted) setLiveBiz(JSON.parse(cached))
      } finally { if(mounted) setLoading(false) }
    }

    const load = async () => {
      try {
        const supabase = createClient() as any
        let data: any[] = []
        if (filter.lat!= null && filter.lng!= null) {
          const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
          const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)
          const { data: bizData } = await supabase.from('businesses').select('id,name,category,latitude,longitude').gte('latitude', bbox.minLat).lte('latitude', bbox.maxLat).gte('longitude', bbox.minLng).lte('longitude', bbox.maxLng).order('verified',{ascending:false}).limit(10)
          if (bizData) data = applyScope(bizData, filter)
        } else {
          const { data: bizData } = await supabase.from('businesses').select('id,name,category').eq('zip_code', zip).order('verified',{ascending:false}).limit(4)
          data = bizData || []
        }
        if(mounted && data.length > 0){ setBiz(data) } else { fetchLiveBusinesses() }
      } catch { if(mounted) fetchLiveBusinesses() }
    }

    load()
    const id = setInterval(()=>{ if(mounted) { try { load() } catch {} } }, 20*60*1000)
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[zip, city, filter, d])

  const display = biz.length > 0? biz : liveBiz
  const displayArea = zip === 'GLOBAL' ||!zip? (city || 'your area') : zip

  if (!zip) return (<div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">{D[language]?.title || D.en.title}</p><p className="text-xs text-white/50">{(D[language]?.loadingArea || D.en.loadingArea).replace('{area}', displayArea)}</p></div>)

  const t = D[language] || D.en
  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">{t.title}</p>
      <p className="text-xs text-white/50 mt-1">{t.near.replace('{area}', displayArea)}</p>
      {loading? <p className="text-sm mt-3 text-white/60">{t.loading}</p> :
      display.length===0? <p className="text-sm mt-3 text-white/60">{t.noBiz}</p> :
      (<div className="mt-3 space-y-2">{display.map(b=>(<div key={b.id} className="bg-white/5 rounded-xl p-2.5 text-xs flex justify-between"><span className="truncate">{b.name}</span><span className="text-white/40">{b.category||''}</span></div>))}</div>)}
    </div>
  )
}
export default BusinessDirectory
