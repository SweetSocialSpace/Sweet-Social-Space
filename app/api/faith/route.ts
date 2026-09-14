export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lang = searchParams.get('lang') || 'en'

  // 1. Get random verse in English
  const bibleRes = await fetch('https://bible-api.com/?random=verse')
  const bible = await bibleRes.json()

  let text = bible.text
  let ref = bible.reference

  // 2. If Spanish, translate it
  if (lang === 'es') {
    try {
      // use RVR Spanish bible directly - no translation API needed
      const esRes = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=spa-rvr`)
      const esData = await esRes.json()
      if (esData.text) {
        text = esData.text
      } else {
        // fallback: call your translate API
        const tr = await fetch(`${process.env.NEXT_PUBLIC_URL || ''}/api/translate`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ text, target: 'es' })
        }).then(r=>r.json())
        if (tr.translated) text = tr.translated
      }
    } catch(e) {
      console.log("translation fallback")
    }
  }

  return Response.json({ text, reference: ref })
}
