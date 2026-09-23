'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import Link from 'next/link'

type T = { faithCorner:string, communityFaith:string, faithOfDay:string, daily:string, todaysThought:string, seeFaith:string, share:string, commFaithPosts:string, loading:string, noPosts:string, postSomething:string, whatThis:string, what1:string, what1b:string, what2:string, what2b:string, what3:string, what3b:string, what4:string, what4b:string, guidelines:string, g1:string, g2:string, g3:string, g4:string, g5:string, copied:string, wholeBible:string, verseLoading:string }

const D: Record<string,T> = {
en: { faithCorner:"Faith Corner", communityFaith:"Community faith and encouragement for", faithOfDay:"Faith of the Day", daily:"Daily", todaysThought:"TODAY'S THOUGHT:", seeFaith:"See Faith Posts →", share:"Share", commFaithPosts:"Community Faith Posts", loading:"Loading faith posts...", noPosts:"No faith posts yet in", postSomething:"Post Something →", whatThis:"What This Is", what1:"🙏 Faith Corner:", what1b:"A space for your local community to share encouragement, prayer requests, and faith-based discussions.", what2:"🏘 Local Focus:", what2b:"Content is specific to your 5-20 mile radius - your actual neighbors, not the whole internet.", what3:"💬 Open to All:", what3b:"Whether you're deeply religious or just curious, this is a welcoming space for respectful dialogue.", what4:"🤝 Supportive Community:", what4b:"Neighbors helping neighbors through faith, encouragement, and practical assistance.", guidelines:"Community Guidelines", g1:"• Be respectful of different faith traditions and beliefs", g2:"• Use this space to encourage and support your neighbors", g3:"• Share prayer requests and offers to help", g4:"• No proselytizing or condemning others' beliefs", g5:"• Keep discussions local and relevant to your community", copied:"Copied!", wholeBible:"Whole Bible • Random daily", verseLoading:"Loading verse from whole Bible..." },
es: { faithCorner:"Rincon de Fe", communityFaith:"Fe comunitaria y animo para", faithOfDay:"Fe del Dia", daily:"Diario", todaysThought:"PENSAMIENTO DE HOY:", seeFaith:"Ver publicaciones de fe →", share:"Compartir", commFaithPosts:"Publicaciones de fe comunitarias", loading:"Cargando publicaciones de fe...", noPosts:"Aun no hay publicaciones de fe en", postSomething:"Publicar algo →", whatThis:"Que es esto", what1:"🙏 Rincon de Fe:", what1b:"Un espacio para que tu comunidad local comparta animo, peticiones de oracion y discusiones basadas en la fe.", what2:"🏘 Enfoque local:", what2b:"Contenido especifico para tu radio de 5-20 millas - tus vecinos reales.", what3:"💬 Abierto a todos:", what3b:"Ya seas profundamente religioso o solo curioso, espacio acogedor para dialogo respetuoso.", what4:"🤝 Comunidad solidaria:", what4b:"Vecinos ayudando a vecinos a traves de la fe, animo y ayuda practica.", guidelines:"Normas de la comunidad", g1:"• Se respetuoso con diferentes tradiciones", g2:"• Usa este espacio para animar y apoyar", g3:"• Comparte peticiones de oracion y ayuda", g4:"• No hacer proselitismo ni condenar", g5:"• Manten discusiones locales y relevantes", copied:"¡Copiado!", wholeBible:"Biblia completa • Aleatorio diario", verseLoading:"Cargando versiculo de toda la Biblia..." },
fr: { faithCorner:"Coin de Foi", communityFaith:"Foi communautaire et encouragement pour", faithOfDay:"Foi du Jour", daily:"Quotidien", todaysThought:"PENSEE DU JOUR:", seeFaith:"Voir les posts de foi →", share:"Partager", commFaithPosts:"Posts de foi communautaires", loading:"Chargement...", noPosts:"Pas encore de posts de foi a", postSomething:"Publier →", whatThis:"Qu'est-ce que c'est", what1:"🙏 Coin de Foi:", what1b:"Un espace pour votre communaute locale.", what2:"🏘 Focus local:", what2b:"Contenu specifique a votre rayon.", what3:"💬 Ouvert a tous:", what3b:"Espace accueillant pour dialogue respectueux.", what4:"🤝 Communaute solidaire:", what4b:"Voisins aidant voisins par la foi.", guidelines:"Directives", g1:"• Soyez respectueux des traditions", g2:"• Encouragez vos voisins", g3:"• Partagez demandes de priere", g4:"• Pas de proselytisme", g5:"• Gardez discussions locales", copied:"Copie!", wholeBible:"Bible entiere • Aleatoire quotidien", verseLoading:"Chargement du verset de toute la Bible..." },
de: { faithCorner:"Glaubensecke", communityFaith:"Gemeinschaftsglaube fur", faithOfDay:"Glaube des Tages", daily:"Taglich", todaysThought:"GEDANKE HEUTE:", seeFaith:"Glaubens-Posts →", share:"Teilen", commFaithPosts:"Community Glaubens-Posts", loading:"Laden...", noPosts:"Noch keine Glaubens-Posts in", postSomething:"Posten →", whatThis:"Was ist das", what1:"🙏 Glaubensecke:", what1b:"Raum fur lokale Gemeinschaft.", what2:"🏘 Lokaler Fokus:", what2b:"Inhalt fur 5-20 Meilen Radius.", what3:"💬 Offen fur alle:", what3b:"Einladender Raum fur respektvollen Dialog.", what4:"🤝 Gemeinschaft:", what4b:"Nachbarn helfen Nachbarn durch Glauben.", guidelines:"Richtlinien", g1:"• Respektvoll gegenuber Traditionen", g2:"• Nachbarn ermutigen", g3:"• Gebetsanliegen teilen", g4:"• Kein Missionieren", g5:"• Lokal halten", copied:"Kopiert!", wholeBible:"Ganze Bibel • Zufallig taglich", verseLoading:"Vers aus der ganzen Bibel laden..." },
zh: { faithCorner:"信仰角落", communityFaith:"社区信仰和鼓励", faithOfDay:"今日信仰", daily:"每日", todaysThought:"今日思考：", seeFaith:"查看信仰帖子 →", share:"分享", commFaithPosts:"社区信仰帖子", loading:"加载中...", noPosts:"还没有信仰帖子在", postSomething:"发布 →", whatThis:"这是什么", what1:"🙏 信仰角落：", what1b:"为本地社区分享鼓励的空间。", what2:"🏘 本地聚焦：", what2b:"针对5-20英里范围的内容。", what3:"💬 对所有人开放：", what3b:"尊重对话的欢迎空间。", what4:"🤝 支持性社区：", what4b:"邻居通过信仰互相帮助。", guidelines:"社区准则", g1:"• 尊重不同信仰传统", g2:"• 鼓励支持邻居", g3:"• 分享祷告请求", g4:"• 不传教", g5:"• 保持本地讨论", copied:"已复制！", wholeBible:"整本圣经 • 每日随机", verseLoading:"从整本圣经加载经文..." },
ja: { faithCorner:"信仰コーナー", communityFaith:"コミュニティの信仰", faithOfDay:"今日の信仰", daily:"毎日", todaysThought:"今日の思い:", seeFaith:"信仰投稿を見る →", share:"共有", commFaithPosts:"信仰投稿", loading:"読み込み中...", noPosts:"まだ投稿がありません", postSomething:"投稿する →", whatThis:"これは何", what1:"🙏 信仰コーナー:", what1b:"地元コミュニティの励ましの場。", what2:"🏘 ローカル:", what2b:"5-20マイル圏内のコンテンツ。", what3:"💬 誰でも歓迎:", what3b:"尊重ある対話の場。", what4:"🤝 支援コミュニティ:", what4b:"信仰を通じて助け合う。", guidelines:"ガイドライン", g1:"• 信仰伝統を尊重", g2:"• 隣人を励ます", g3:"• 祈りを共有", g4:"• 布教なし", g5:"• 地元で維持", copied:"コピー!", wholeBible:"聖書全体 • 毎日ランダム", verseLoading:"聖書全体から読み込み中..." },
ko: { faithCorner:"믿음 코너", communityFaith:"지역사회 믿음", faithOfDay:"오늘의 믿음", daily:"매일", todaysThought:"오늘의 생각:", seeFaith:"믿음 게시물 →", share:"공유", commFaithPosts:"믿음 게시물", loading:"로딩중...", noPosts:"아직 게시물 없음", postSomething:"게시 →", whatThis:"이것이 무엇인가", what1:"🙏 믿음 코너:", what1b:"지역사회 격려 공간.", what2:"🏘 로컬:", what2b:"5-20마일 반경 콘텐츠.", what3:"💬 모두에게 열림:", what3b:"존중 대화 환영 공간.", what4:"🤝 지원 커뮤니티:", what4b:"믿음으로 이웃 돕기.", guidelines:"가이드라인", g1:"• 전통 존중", g2:"• 이웃 격려", g3:"• 기도 공유", g4:"• 포교 금지", g5:"• 지역 유지", copied:"복사됨!", wholeBible:"전체 성경 • 매일 랜덤", verseLoading:"전체 성경에서 구절 로딩..." },
ru: { faithCorner:"Уголок Веры", communityFaith:"Вера сообщества для", faithOfDay:"Вера Дня", daily:"Ежедневно", todaysThought:"МЫСЛЬ СЕГОДНЯ:", seeFaith:"Посты веры →", share:"Поделиться", commFaithPosts:"Посты веры", loading:"Загрузка...", noPosts:"Пока нет постов в", postSomething:"Опубликовать →", whatThis:"Что это", what1:"🙏 Уголок Веры:", what1b:"Пространство для сообщества.", what2:"🏘 Локально:", what2b:"Контент для радиуса 5-20 миль.", what3:"💬 Открыто для всех:", what3b:"Пространство для уважительного диалога.", what4:"🤝 Сообщество:", what4b:"Соседи помогают через веру.", guidelines:"Правила", g1:"• Уважайте традиции", g2:"• Поддерживайте соседей", g3:"• Делитесь молитвами", g4:"• Без прозелитизма", g5:"• Локально", copied:"Скопировано!", wholeBible:"Вся Библия • Случайно ежедневно", verseLoading:"Загрузка стиха из всей Библии..." },
ar: { faithCorner:"ركن الإيمان", communityFaith:"إيمان المجتمع لـ", faithOfDay:"إيمان اليوم", daily:"يومي", todaysThought:"فكرة اليوم:", seeFaith:"منشورات الإيمان →", share:"مشاركة", commFaithPosts:"منشورات الإيمان", loading:"جاري التحميل...", noPosts:"لا توجد منشورات في", postSomething:"نشر →", whatThis:"ما هذا", what1:"🙏 ركن الإيمان:", what1b:"مساحة للمجتمع المحلي.", what2:"🏘 تركيز محلي:", what2b:"محتوى لنطاق 5-20 ميل.", what3:"💬 مفتوح للجميع:", what3b:"مساحة ترحيبية للحوار.", what4:"🤝 مجتمع داعم:", what4b:"جيران يساعدون عبر الإيمان.", guidelines:"إرشادات", g1:"• احترام التقاليد", g2:"• تشجيع الجيران", g3:"• مشاركة الصلوات", g4:"• لا تبشير", g5:"• حافظ على المحلية", copied:"تم النسخ!", wholeBible:"الكتاب المقدس كامل • عشوائي يوميا", verseLoading:"تحميل آية من الكتاب كامل..." },
pt: { faithCorner:"Cantinho da Fe", communityFaith:"Fe comunitaria para", faithOfDay:"Fe do Dia", daily:"Diario", todaysThought:"PENSAMENTO DE HOJE:", seeFaith:"Posts de fe →", share:"Compartilhar", commFaithPosts:"Posts de fe", loading:"Carregando...", noPosts:"Ainda nao ha posts em", postSomething:"Postar →", whatThis:"O que e", what1:"🙏 Cantinho:", what1b:"Espaco para comunidade local.", what2:"🏘 Foco local:", what2b:"Conteudo para raio 5-20 milhas.", what3:"💬 Aberto a todos:", what3b:"Espaco acolhedor para dialogo.", what4:"🤝 Comunidade:", what4b:"Vizinhos ajudando via fe.", guidelines:"Diretrizes", g1:"• Respeite tradicoes", g2:"• Incentive vizinhos", g3:"• Compartilhe oracoes", g4:"• Sem proselitismo", g5:"• Local", copied:"Copiado!", wholeBible:"Biblia completa • Aleatorio diario", verseLoading:"Carregando versiculo da Biblia completa..." },
it: { faithCorner:"Angolo della Fede", communityFaith:"Fede comunitaria per", faithOfDay:"Fede del Giorno", daily:"Quotidiano", todaysThought:"PENSIERO DI OGGI:", seeFaith:"Post di fede →", share:"Condividi", commFaithPosts:"Post di fede", loading:"Caricamento...", noPosts:"Ancora nessun post in", postSomething:"Pubblica →", whatThis:"Cos'e", what1:"🙏 Angolo:", what1b:"Spazio per comunita locale.", what2:"🏘 Focus locale:", what2b:"Contenuto per raggio 5-20 miglia.", what3:"💬 Aperto a tutti:", what3b:"Spazio accogliente.", what4:"🤝 Comunita:", what4b:"Vicini che si aiutano via fede.", guidelines:"Linee guida", g1:"• Rispetta tradizioni", g2:"• Incoraggia vicini", g3:"• Condividi preghiere", g4:"• Niente proselitismo", g5:"• Locale", copied:"Copiato!", wholeBible:"Bibbia intera • Casuale giornaliero", verseLoading:"Caricamento versetto da Bibbia intera..." },
nl: { faithCorner:"Geloofshoek", communityFaith:"Geloof voor", faithOfDay:"Geloof van de Dag", daily:"Dagelijks", todaysThought:"GEDACHTE VANDAAG:", seeFaith:"Geloofs-posts →", share:"Delen", commFaithPosts:"Geloofs-posts", loading:"Laden...", noPosts:"Nog geen posts in", postSomething:"Posten →", whatThis:"Wat is dit", what1:"🙏 Geloofshoek:", what1b:"Plek voor lokale gemeenschap.", what2:"🏘 Lokaal:", what2b:"Content voor 5-20 mijl radius.", what3:"💬 Open voor allen:", what3b:"Verwelkomende plek.", what4:"🤝 Gemeenschap:", what4b:"Buren helpen via geloof.", guidelines:"Richtlijnen", g1:"• Respecteer tradities", g2:"• Moedig buren aan", g3:"• Deel gebeden", g4:"• Geen bekering", g5:"• Lokaal houden", copied:"Gekopieerd!", wholeBible:"Hele Bijbel • Willekeurig dagelijks", verseLoading:"Vers uit hele Bijbel laden..." },
}

const ALL_LANGS = ["en","es","fr","de","zh","ja","ko","ru","ar","pt","it","nl","tl","hi","bn","id","vi","th","sv","pl","tr","uk","el","he","ur","fa","ms","ro","cs","hu","fi","no","da","bg","hr","sr","sk","sl","et","lv","lt","be","ka","hy","az","kk","ky","uz","tg","mn","km","lo","my"]
function ensure53(base: Record<string,T>): Record<string,T> {
  const out = { ...base }
  for (const l of ALL_LANGS) if (!out[l]) out[l] = out.en
  return out
}
const TD = ensure53(D)

export default function FaithPage() {
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const t = TD[language] || TD.en
  const [faithPosts, setFaithPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [verse, setVerse] = useState<{text:string, ref:string, thought:string, fromBible:boolean} | null>(null)
  const [verseLoading, setVerseLoading] = useState(true)
  const supabase = createClient()
  const [copied, setCopied] = useState(false)
  const displayArea = city || zip || 'your area'

  // Whole Bible random - 53 lang aware
  useEffect(()=>{
    let cancelled=false
    const loadVerse = async()=>{
      setVerseLoading(true)
      try{
        const res = await fetch(`/api/faith?lang=${language}`, { cache: 'no-store' })
        if(res.ok){
          const data = await res.json()
          const text = data.text || data.original_text || "The Lord is near to the brokenhearted."
          const ref = data.reference || "Psalm 34:18"
          if(!cancelled){
            setVerse({ text, ref, thought: t.todaysThought.replace(':','') + ` - ${ref}`, fromBible: true })
            setVerseLoading(false)
            return
          }
        }
        throw new Error("api fail")
      }catch{
        if(!cancelled){
          // 8-verse fallback but now marked as fallback
          const fallback = [
            { text:"Love your neighbor as yourself.", ref:"Mark 12:31" },
            { text:"Faith without works is dead.", ref:"James 2:17" },
            { text:"Be still, and know that I am God.", ref:"Psalm 46:10" },
            { text:"The Lord is near to the brokenhearted.", ref:"Psalm 34:18" },
          ]
          const day = fallback[new Date().getDate() % fallback.length]
          setVerse({ text: day.text, ref: day.ref, thought: "Encourage a neighbor today", fromBible:false })
          setVerseLoading(false)
        }
      }
    }
    loadVerse()
    return ()=>{ cancelled=true }
  },[language, t.todaysThought])

  useEffect(() => {
    if (!zip) return
    const load = async () => {
      try {
        const { data } = await supabase.from('posts').select('*').eq('zip_code', zip).or('tag.eq.faith,category.eq.faith').order('created_at', { ascending: false }).limit(50)
        if (data) setFaithPosts(data)
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [zip])

  const handleShare = ()=>{
    if(!verse) return
    const text = `"${verse.text}" - ${verse.ref} - from Sweet Social Space`
    if(typeof navigator!== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000) })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">{t.faithCorner}</h1>
        <p className="text-white/60">{t.communityFaith} {displayArea}</p>
      </div>
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl p-6 border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-black tracking-widest text-yellow-400">{t.faithOfDay}</span>
              <span className="bg-white/10 text-white/60 px-3 py-1 rounded-full text-xs">{verse?.fromBible ? t.wholeBible : t.daily}</span>
            </div>
            {verseLoading ? (
              <div className="text-white/60 text-sm">{t.verseLoading}</div>
            ) : (
              <>
                <div className="text-white font-black text-2xl leading-tight mb-3">"{verse?.text}"</div>
                <div className="text-yellow-400 font-black text-sm tracking-widest mb-4">{verse?.ref}</div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="text-white/60 text-xs font-black tracking-widest mb-2">{t.todaysThought}</div>
                  <div className="text-white text-base font-bold leading-snug">{verse?.thought}</div>
                </div>
              </>
            )}
            <div className="mt-4 flex gap-2">
              <Link href="/feed?filter=faith" className="flex-1 bg-white text-black text-sm font-black px-4 py-2 rounded-full text-center hover:bg-yellow-400 transition">{t.seeFaith}</Link>
              <button onClick={handleShare} className="bg-white/10 text-white text-sm font-black px-4 py-2 rounded-full border border-white/20 min-w-[90px]">{copied ? t.copied : t.share}</button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">{t.commFaithPosts}</h2>
          {loading ? <p className="text-white/60">{t.loading}</p> : faithPosts.length===0 ? <div className="text-center py-8"><p className="text-white/60 mb-4">{t.noPosts} {displayArea}</p><Link href="/feed" className="inline-block bg-white text-black px-6 py-2 rounded-full font-black text-sm hover:bg-yellow-400 transition">{t.postSomething}</Link></div> : <div className="space-y-4">{faithPosts.map((post:any)=>(<div key={post.id} className="bg-white/5 rounded-xl p-4 border border-white/10"><p className="text-white text-sm leading-relaxed">{post.body}</p><div className="mt-2 text-xs text-white/40">{new Date(post.created_at).toLocaleString()} • {post.zip_code}</div></div>))}</div>}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">{t.whatThis}</h2>
          <div className="space-y-3 text-white/70 text-sm"><p><strong>{t.what1}</strong> {t.what1b}</p><p><strong>{t.what2}</strong> {t.what2b}</p><p><strong>{t.what3}</strong> {t.what3b}</p><p><strong>{t.what4}</strong> {t.what4b}</p></div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">{t.guidelines}</h2>
          <div className="space-y-2 text-white/70 text-sm"><p>{t.g1}</p><p>{t.g2}</p><p>{t.g3}</p><p>{t.g4}</p><p>{t.g5}</p></div>
        </div>
      </div>
    </div>
  )
}
