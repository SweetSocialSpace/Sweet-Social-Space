'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { localRec:"Local recommendations", ask:"Ask neighbors who they trust — plumber, pizza, mechanic, daycare. Real answers from real people on your block", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  es: { localRec:"Recomendaciones locales", ask:"Pregunta a vecinos de confianza — fontanero, pizza, mecanico, guarderia. Respuestas reales.", browse:"Ver recomendaciones", neighbor:"vecino recomienda", neighbors:"vecinos recomiendan", noRec:"Sin recomendaciones en", yet:"aun", thisArea:"esta zona" },
  fr: { localRec:"Recommandations locales", ask:"Demandez aux voisins — plombier, pizza, mecanicien, creche. Vraies reponses.", browse:"Parcourir recommandations", neighbor:"voisin recommande", neighbors:"voisins recommandent", noRec:"Pas de reco dans", yet:"encore", thisArea:"cette zone" },
  de: { localRec:"Lokale Empfehlungen", ask:"Frag Nachbarn — Klempner, Pizza, Mechaniker, Kita. Echte Antworten.", browse:"Empfehlungen ansehen", neighbor:"Nachbar empfiehlt", neighbors:"Nachbarn empfehlen", noRec:"Keine Empfehlungen in", yet:"bisher", thisArea:"diesem Bereich" },
  zh: { localRec:"本地推荐", ask:"问邻居信任谁 — 水管工、披萨、修车、托儿。真实回答。", browse:"浏览推荐", neighbor:"邻居推荐", neighbors:"邻居推荐", noRec:"暂无推荐在", yet:"", thisArea:"此区域" },
  ja: { localRec:"地域のおすすめ", ask:"近所の人に聞く — 水道、ピザ、整備、保育。リアルな声。", browse:"おすすめを見る", neighbor:"人がおすすめ", neighbors:"人がおすすめ", noRec:"おすすめなし", yet:"まだ", thisArea:"このエリア" },
  ko: { localRec:"지역 추천", ask:"이웃에게 물어보세요 — 배관、피자、정비、보육。진짜 답변。", browse:"추천 보기", neighbor:"명이 추천", neighbors:"명이 추천", noRec:"추천 없음", yet:"아직", thisArea:"이 지역" },
  pt: { localRec:"Recomendacoes locais", ask:"Pergunte aos vizinhos — encanador, pizza, mecanico, creche. Respostas reais.", browse:"Ver recomendacoes", neighbor:"vizinho recomenda", neighbors:"vizinhos recomendam", noRec:"Sem recomendacoes em", yet:"ainda", thisArea:"esta area" },
  ru: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  ar: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  hi: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  it: { localRec:"Raccomandazioni locali", ask:"Chiedi ai vicini — idraulico, pizza, meccanico, asilo. Risposte vere.", browse:"Sfoglia raccomandazioni", neighbor:"vicino consiglia", neighbors:"vicini consigliano", noRec:"Nessuna raccomandazione in", yet:"ancora", thisArea:"questa zona" },
  nl: { localRec:"Lokale aanbevelingen", ask:"Vraag buren — loodgieter, pizza, monteur, kinderopvang. Echte antwoorden.", browse:"Bekijk aanbevelingen", neighbor:"buur beveelt aan", neighbors:"buren bevelen aan", noRec:"Geen aanbevelingen in", yet:"nog", thisArea:"dit gebied" },
  tl: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  bn: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  id: { localRec:"Rekomendasi lokal", ask:"Tanya tetangga terpercaya — tukang ledeng, pizza, montir, daycare. Jawaban nyata.", browse:"Jelajahi rekomendasi", neighbor:"tetangga merekomendasikan", neighbors:"tetangga merekomendasikan", noRec:"Belum ada rekomendasi di", yet:"", thisArea:"area ini" },
  vi: { localRec:"Goi y dia phuong", ask:"Hoi hang xom tin ai — tho nuoc, pizza, tho may, nha tre. Cau tra loi that.", browse:"Duyet goi y", neighbor:"hang xom goi y", neighbors:"hang xom goi y", noRec:"Chua co goi y o", yet:"", thisArea:"khu vuc nay" },
  th: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  sv: { localRec:"Lokala rekommendationer", ask:"Fraga grannar — rormokare, pizza, mekaniker, dagis. Riktiga svar.", browse:"Bladdra rekommendationer", neighbor:"granne rekommenderar", neighbors:"grannar rekommenderar", noRec:"Inga rekommendationer i", yet:"an", thisArea:"detta omrade" },
  pl: { localRec:"Lokalne rekomendacje", ask:"Zapytaj sasiadow — hydraulik, pizza, mechanik, zlobek. Prawdziwe odpowiedzi.", browse:"Przegladaj rekomendacje", neighbor:"sasiad poleca", neighbors:"sasiadow poleca", noRec:"Brak rekomendacji w", yet:"jeszcze", thisArea:"tej okolicy" },
  tr: { localRec:"Yerel oneriler", ask:"Komusulara sor — tesisatci, pizza, tamirci, kreş. Gercek cevaplar.", browse:"Onerilere goz at", neighbor:"komsu oneriyor", neighbors:"komsu oneriyor", noRec:"Henuz oneri yok", yet:"", thisArea:"bu bolgede" },
  uk: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  el: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  he: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  ur: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  fa: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  ms: { localRec:"Cadangan tempatan", ask:"Tanya jiran dipercayai — tukang paip, pizza, mekanik, taska. Jawapan sebenar.", browse:"Lihat cadangan", neighbor:"jiran mengesyorkan", neighbors:"jiran mengesyorkan", noRec:"Tiada cadangan di", yet:"lagi", thisArea:"kawasan ini" },
  ro: { localRec:"Recomandari locale", ask:"Intreaba vecinii — instalator, pizza, mecanic, cresa. Raspunsuri reale.", browse:"Vezi recomandari", neighbor:"vecin recomanda", neighbors:"vecini recomanda", noRec:"Nicio recomandare in", yet:"inca", thisArea:"zona asta" },
  cs: { localRec:"Mistni doporuceni", ask:"Zeptejte se sousedu — instalater, pizza, mechanik, skolka. Skutecne odpovedi.", browse:"Prochazet doporuceni", neighbor:"soused doporucuje", neighbors:"sousedu doporucuje", noRec:"Zadne doporuceni v", yet:"zatim", thisArea:"teto oblasti" },
  hu: { localRec:"Helyi ajanlasok", ask:"Kerdezd meg szomszedokat — vizszerelo, pizza, szerelo, bolcsode. Valodi valaszok.", browse:"Ajanlasok bongeszese", neighbor:"szomszed ajanlja", neighbors:"szomszed ajanlja", noRec:"Nincs ajanlas", yet:"meg", thisArea:"ezen a teruleten" },
  fi: { localRec:"Paikalliset suositukset", ask:"Kysy naapureilta — putkimies, pizza, mekaanikko, paivakoti. Oikeita vastauksia.", browse:"Selaa suosituksia", neighbor:"naapuri suosittelee", neighbors:"naapuria suosittelee", noRec:"Ei suosituksia", yet:"viela", thisArea:"talla alueella" },
  no: { localRec:"Lokale anbefalinger", ask:"Spør naboer — rorlegger, pizza, mekaniker, barnehage. Ekte svar.", browse:"Bla gjennom anbefalinger", neighbor:"nabo anbefaler", neighbors:"naboer anbefaler", noRec:"Ingen anbefalinger i", yet:"enda", thisArea:"dette omradet" },
  da: { localRec:"Lokale anbefalinger", ask:"Sporg naboer — VVS, pizza, mekaniker, dagpleje. Egte svar.", browse:"Gennemse anbefalinger", neighbor:"nabo anbefaler", neighbors:"naboer anbefaler", noRec:"Ingen anbefalinger i", yet:"endnu", thisArea:"dette omrade" },
  bg: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  hr: { localRec:"Lokalne preporuke", ask:"Pitajte susjede — vodoinstalater, pizza, mehanicar, vrtic. Pravi odgovori.", browse:"Pregledaj preporuke", neighbor:"susjed preporucuje", neighbors:"susjeda preporucuje", noRec:"Nema preporuka u", yet:"jos", thisArea:"ovom podrucju" },
  sr: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  sk: { localRec:"Miestne odporucania", ask:"Opytajte sa susedov — instalater, pizza, mechanik, skolka. Skutocne odpovede.", browse:"Prechadzat odporucania", neighbor:"sused odporuca", neighbors:"susedov odporuca", noRec:"Ziadne odporucania v", yet:"zatial", thisArea:"tejto oblasti" },
  sl: { localRec:"Lokalna priporocila", ask:"Vprasaj sosede — vodovodar, pica, mehanik, vrtec. Pravi odgovori.", browse:"Brskaj priporocila", neighbor:"sosed priporoca", neighbors:"sosedov priporoca", noRec:"Ni priporocil v", yet:"se", thisArea:"tem obmocju" },
  et: { localRec:"Kohalikud soovitused", ask:"Kusi naabritelt — torumees, pizza, mehaanik, lastehoid. Toelised vastused.", browse:"Sirvi soovitusi", neighbor:"naaber soovitab", neighbors:"naabrit soovitab", noRec:"Soovitusi pole", yet:"veel", thisArea:"selles piirkonnas" },
  lv: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  lt: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  be: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  ka: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  hy: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  az: { localRec:"Yerli tovsiyeler", ask:"Qonsulardan sorus — santexnik, pizza, usta, bagca. Həqiqi cavablar.", browse:"Tovsiyelere bax", neighbor:"qonsu tovsiye edir", neighbors:"qonsu tovsiye edir", noRec:"Tovsiye yoxdur", yet:"hele", thisArea:"bu erazide" },
  kk: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  ky: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  uz: { localRec:"Mahalliy tavsiyalar", ask:"Qoshnilardan sorang — santexnik, pizza, mexanik, bogcha. Haqiqiy javoblar.", browse:"Tavsiyalarni korish", neighbor:"qoshni tavsiya qiladi", neighbors:"qoshni tavsiya qiladi", noRec:"Tavsiya yoq", yet:"hali", thisArea:"bu hududda" },
  tg: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  mn: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  km: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  lo: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
  my: { localRec:"Local recommendations", ask:"Ask neighbors who they trust", browse:"Browse recommendations", neighbor:"neighbor recommends", neighbors:"neighbors recommend", noRec:"No recommendations in", yet:"yet", thisArea:"this area" },
}

const CATEGORY_LABELS: Record<string, { emoji: string; label: string }> = {
  plumbers: { emoji: '🔧', label: 'Best plumber' },
  restaurants: { emoji: '🍕', label: 'Best restaurants' },
  mechanics: { emoji: '🚗', label: 'Best mechanic' },
  daycares: { emoji: '👶', label: 'Best daycare' },
  'home-services': { emoji: '🛠', label: 'Home services' },
  'vets-pet-care': { emoji: '🐾', label: 'Vets & pet care' },
  tutors: { emoji: '📚', label: 'Tutors' },
  'hair-barber': { emoji: '💇', label: 'Hair & barber' },
}

type RecommendationCategoryCount = { category: string; count: number }

export default function RecommendationCategories({ compact = false }: { compact?: boolean }) {
  const { zip } = useLocation()
  const { filter } = useLocationScope()
  const { language } = useLanguage()
  const t = D[language] || D.en
  const [cats, setCats] = useState<RecommendationCategoryCount[] | null>(null)

  useEffect(() => {
    if (!zip) return
    let cancelled = false
    setCats(null)
    const load = async () => {
      try {
        const supabase = createClient() as any
        let data: any[] = []
        if (filter.lat != null && filter.lng != null) {
          const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
          const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)
          const { data: recData } = await supabase.from('recommendations').select('category,latitude,longitude').eq('status', 'active').gte('latitude', bbox.minLat).lte('latitude', bbox.maxLat).gte('longitude', bbox.minLng).lte('longitude', bbox.maxLng).limit(100)
          if (recData) { data = applyScope(recData, filter) }
        } else {
          const { data: recData, error } = await supabase.from('recommendations').select('category').eq('status', 'active').eq('zip_code', zip).limit(100)
          if (error) throw error
          data = recData || []
        }
        if (cancelled) return
        const counts: Record<string, number> = {}
        data?.forEach((r:any) => { counts[r.category] = (counts[r.category] || 0) + 1 })
        const rows = Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count).slice(0, 4)
        if (!cancelled) setCats(rows)
      } catch { if (!cancelled) try { setCats([]) } catch {} }
    }
    load()
    return () => { cancelled = true }
  }, [zip, filter])

  return (
    <section className={compact? 'rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]' : 'mt-8 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-[var(--shadow-soft)]'}>
      <div className={compact? 'grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2' : 'flex flex-col gap-3 md:flex-row md:items-end md:justify-between'}>
        <div>
          <h3 className={compact? 'font-display text-sm font-semibold leading-tight' : 'font-display text-2xl font-bold md:text-3xl'}>⭐ {t.localRec}</h3>
          <p className={compact? 'mt-1 line-clamp-2 text-xs text-muted-foreground' : 'mt-1 text-sm text-muted-foreground'}>{t.ask} {zip? `• ${zip}`:''}.</p>
        </div>
        <Link href="/recommendations" className="text-sm font-medium text-primary hover:underline">{t.browse} →</Link>
      </div>
      <ul className={compact? 'mt-3 grid gap-2' : 'mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'}>
        {(cats?? Array.from({ length: 4 })).map((c:any, i:number) => {
          if (!c) return <li key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-background/60" aria-hidden />
          const meta = CATEGORY_LABELS[c.category]?? { emoji: '⭐', label: c.category }
          return (
            <li key={c.category}>
              <Link href={`/recommendations/${c.category}`} className="block h-full rounded-2xl border border-border bg-background/60 p-4 transition hover:bg-secondary">
                <div className="text-2xl">{meta.emoji}</div>
                <div className="mt-2 text-sm font-semibold">{meta.label}</div>
                <div className="text-xs text-muted-foreground">{c.count} {c.count === 1? t.neighbor : t.neighbors}</div>
              </Link>
            </li>
          )
        })}
        {cats && cats.length === 0 && (<li className="col-span-full text-center text-xs text-muted-foreground py-6">{t.noRec} {zip||t.thisArea} {t.yet}.</li>)}
      </ul>
    </section>
  )
}
