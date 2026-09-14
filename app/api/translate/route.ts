// app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { text, targetLang, postId } = await req.json()
  if (!text ||!targetLang) return NextResponse.json({ error: 'missing' }, { status: 400 })

  const supabase = createClient()

  // Check cache first - don't re-translate
  if (postId) {
    const { data } = await supabase.from('posts').select('translations').eq('id', postId).single()
    if (data?.translations?.[targetLang]) {
      return NextResponse.json({ translated: data.translations[targetLang], cached: true })
    }
  }

  // Use free MyMemory API for now (replace with Google Translate later for production)
  // This works for any language on earth, no API key
  const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`)
  const json = await res.json()
  const translated = json.responseData?.translatedText || text

  // Cache it
  if (postId) {
    await supabase.rpc('append_translation', {
      p_id: postId,
      p_lang: targetLang,
      p_text: translated
    })
    // Or simple:
    // const { data: current } = await supabase.from('posts').select('translations').eq('id', postId).single()
    // await supabase.from('posts').update({
    // translations: {...current?.translations, [targetLang]: translated }
    // }).eq('id', postId)
  }

  return NextResponse.json({ translated })
}
