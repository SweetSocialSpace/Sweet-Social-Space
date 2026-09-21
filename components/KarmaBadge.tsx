'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { karma:"KARMA" },
  es: { karma:"KARMA" },
  fr: { karma:"KARMA" },
  de: { karma:"KARMA" },
  zh: { karma:"业力" },
  ja: { karma:"カルマ" },
  ko: { karma:"카르마" },
  pt: { karma:"KARMA" },
  ru: { karma:"КАРМА" },
  ar: { karma:"كارما" },
  hi: { karma:"कर्म" },
  it: { karma:"KARMA" },
  nl: { karma:"KARMA" },
  tl: { karma:"KARMA" },
  bn: { karma:"কর্ম" },
  id: { karma:"KARMA" },
  vi: { karma:"KARMA" },
  th: { karma:"กรรม" },
  sv: { karma:"KARMA" },
  pl: { karma:"KARMA" },
  tr: { karma:"KARMA" },
  uk: { karma:"КАРМА" },
  el: { karma:"KARMA" },
  he: { karma:"קארמה" },
  ur: { karma:"کرما" },
  fa: { karma:"کارما" },
  ms: { karma:"KARMA" },
  ro: { karma:"KARMA" },
  cs: { karma:"KARMA" },
  hu: { karma:"KARMA" },
  fi: { karma:"KARMA" },
  no: { karma:"KARMA" },
  da: { karma:"KARMA" },
  bg: { karma:"КАРМА" },
  hr: { karma:"KARMA" },
  sr: { karma:"КАРМА" },
  sk: { karma:"KARMA" },
  sl: { karma:"KARMA" },
  et: { karma:"KARMA" },
  lv: { karma:"KARMA" },
  lt: { karma:"KARMA" },
  be: { karma:"КАРМА" },
  ka: { karma:"კარმა" },
  hy: { karma:"ԿԱՐՄԱ" },
  az: { karma:"KARMA" },
  kk: { karma:"КАРМА" },
  ky: { karma:"КАРМА" },
  uz: { karma:"KARMA" },
  tg: { karma:"КАРМА" },
  mn: { karma:"KARMA" },
  km: { karma:"ការ៉ម៉ា" },
  lo: { karma:"KARMA" },
  my: { karma:"ကံ" },
}

export default function KarmaBadge({ userId }: { userId: string }) {
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [karma, setKarma] = useState(0)

  useEffect(() => {
    if (!userId) return
    let mounted = true
    const load = async () => {
      try {
        const supabase = createClient() as any
        const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId)
        if (mounted) setKarma((count||0) * 10)
      } catch {}
    }
    load()
  }, [userId])

  return <span className="text- font-black bg-yellow-500 text-black px-2 py-1 rounded-full">🔥 {karma} {d.karma}</span>
}
