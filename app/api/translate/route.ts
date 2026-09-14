// app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const text = body.text
    const targetLang = body.targetLang || body.target // accept both
    const postId = body.postId

    if (!text ||!targetLang) {
      return NextResponse.json({ error: 'missing text or targetLang' }, { status: 400 })
    }

    // If English, don't translate
    if (targetLang === 'en') {
      return NextResponse.json({ translated: text })
    }

    const supabase = createClient()

    // Check cache if postId provided
    if (postId) {
      try {
        const { data } = await supabase.from('posts').select('translations').eq('id', postId).single()
        if (data?.translations?.[targetLang]) {
          return NextResponse.json({ translated: data.translations[targetLang], cached: true })
        }
      } catch {}
    }

    // MyMemory - free, works for all your 50 languages
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    const res = await fetch(url)
    const json = await res.json()
    const translated = json.responseData?.translatedText || text

    // Cache it if postId
    if (postId) {
      try {
        const { data: current } = await supabase.from('posts').select('translations').eq('id', postId).single()
        await supabase.from('posts').update({
          translations: {...(current?.translations || {}), [targetLang]: translated }
        }).eq('id', postId)
      } catch {}
    }

    return NextResponse.json({ translated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
