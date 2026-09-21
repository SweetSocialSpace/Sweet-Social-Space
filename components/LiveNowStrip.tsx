'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { live:"LIVE", liveNow:"Live Now" },
  es: { live:"EN VIVO", liveNow:"En Vivo Ahora" },
  fr: { live:"DIRECT", liveNow:"En Direct Maintenant" },
  de: { live:"LIVE", liveNow:"Jetzt Live" },
  zh: { live:"直播", liveNow:"正在直播" },
  ja: { live:"ライブ", liveNow:"ライブ配信中" },
  ko: { live:"라이브", liveNow:"지금 라이브" },
  pt: { live:"AO VIVO", liveNow:"Ao Vivo Agora" },
  ru: { live:"ЭФИР", liveNow:"Сейчас в Эфире" },
  ar: { live:"مباشر", liveNow:"مباشر الآن" },
  hi: { live:"लाइव", liveNow:"अभी लाइव" },
  it: { live:"LIVE", liveNow:"Live Ora" },
  nl: { live:"LIVE", liveNow:"Nu Live" },
  tl: { live:"LIVE", liveNow:"Live Ngayon" },
  bn: { live:"লাইভ", liveNow:"এখন লাইভ" },
  id: { live:"LIVE", liveNow:"Live Sekarang" },
  vi: { live:"TRỰC TIẾP", liveNow:"Trực Tiếp Bây Giờ" },
  th: { live:"ไลฟ์", liveNow:"ไลฟ์ตอนนี้" },
  sv: { live:"LIVE", liveNow:"Live Nu" },
  pl: { live:"NA ŻYWO", liveNow:"Teraz Na Żywo" },
  tr: { live:"CANLI", liveNow:"Şimdi Canlı" },
  uk: { live:"ЕФІР", liveNow:"Зараз в Ефірі" },
  el: { live:"ΖΩΝΤΑΝΑ", liveNow:"Ζωντανά Τώρα" },
  he: { live:"חי", liveNow:"חי עכשיו" },
  ur: { live:"لائیو", liveNow:"ابھی لائیو" },
  fa: { live:"زنده", liveNow:"الان زنده" },
  ms: { live:"LIVE", liveNow:"Live Sekarang" },
  ro: { live:"LIVE", liveNow:"Live Acum" },
  cs: { live:"ŽIVĚ", liveNow:"Živě Nyní" },
  hu: { live:"ÉLŐ", liveNow:"Élő Most" },
  fi: { live:"LIVE", liveNow:"Live Nyt" },
  no: { live:"LIVE", liveNow:"Live Nå" },
  da: { live:"LIVE", liveNow:"Live Nu" },
  bg: { live:"НА ЖИВО", liveNow:"На Живо Сега" },
  hr: { live:"UŽIVO", liveNow:"Uživo Sada" },
  sr: { live:"УЖИВО", liveNow:"Уживо Сада" },
  sk: { live:"NAŽIVO", liveNow:"Naživo Teraz" },
  sl: { live:"V ŽIVO", liveNow:"V Živo Zdaj" },
  et: { live:"OTSE", liveNow:"Otse Praegu" },
  lv: { live:"TIEŠRAIDE", liveNow:"Tiešraidē Tagad" },
  lt: { live:"TIESIOGIAI", liveNow:"Tiesiogiai Dabar" },
  be: { live:"ЭФІР", liveNow:"Зараз у Эфіры" },
  ka: { live:"ლაივი", liveNow:"ლაივი ახლა" },
  hy: { live:"ՈՒՂԻՂ", liveNow:"Ուղիղ Հիմա" },
  az: { live:"CANLI", liveNow:"İndi Canlı" },
  kk: { live:"ТІКЕЛЕЙ", liveNow:"Қазір Тікелей" },
  ky: { live:"ТҮЗ", liveNow:"Азыр Түз" },
  uz: { live:"JONLI", liveNow:"Hozir Jonli" },
  tg: { live:"ЗИНДА", liveNow:"Ҳоло Зинда" },
  mn: { live:"ШУУД", liveNow:"Одоо Шууд" },
  km: { live:"ផ្ទាល់", liveNow:"ផ្ទាល់ឥឡូវនេះ" },
  lo: { live:"ສົດ", liveNow:"ສົດຕອນນີ້" },
  my: { live:"တိုက်ရိုက်", liveNow:"အခုတိုက်ရိုက်" },
}

export default function LiveNowStrip() {
  const [livePosts, setLivePosts] = useState<any[]>([])
  const { language } = useLanguage()
  const d = D[language] || D.en
  const supabase = createClient()

  useEffect(() => {
    const fetchLivePosts = async () => {
      const { data } = await (supabase as any)
       .from('posts')
       .select('*')
       .eq('tag', 'live')
       .order('created_at', { ascending: false })
       .limit(10)

      if (data) setLivePosts(data)
    }

    fetchLivePosts()

    const channel = (supabase as any)
     .channel('live-posts')
     .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: 'tag=eq.live'
        },
        (payload: any) => {
          setLivePosts(prev => [payload.new,...prev].slice(0, 10))
        }
      )
     .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        (payload: any) => {
          setLivePosts(prev => prev.filter(p => p.id!== payload.old.id))
        }
      )
     .subscribe()

    return () => {
      (supabase as any).removeChannel(channel)
    }
  }, [supabase])

  if (livePosts.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-white text-red-600 px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">{d.live}</span>
        <span className="text-white font-bold text-sm">{d.liveNow}</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {livePosts.map((post) => (
          <div key={post.id} className="bg-white/10 backdrop-blur rounded-lg p-3 min-w- flex-shrink-0">
            <p className="text-white text-xs line-clamp-2 mb-2">{post.body}</p>
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold animate-pulse">● {d.live}</span>
              <span className="text-white/70 text-xs">
                {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
