export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const langRaw = (searchParams.get('lang') || 'en').toLowerCase()
  const isEs = langRaw.startsWith('es')

  // Guaranteed Spanish fallbacks — so it's NEVER English in Español mode
  const FALLBACK_ES = {
    text: "Tú, Salomón hijo mío, reconoce al Dios de tu padre, y sírvele con corazón perfecto y con ánimo voluntario; porque Yahweh escudriña los corazones de todos, y entiende todo intento de los pensamientos. Si tú le buscares, lo hallarás; mas si lo dejares, él te desechará para siempre.",
    reference: "1 Crónicas 28:9"
  }
  const FALLBACK_EN = {
    text: "You, Solomon my son, know the God of your father, and serve him with a perfect heart and with a willing mind; for Yahweh searches all hearts, and understands all the imaginations of the thoughts. If you seek him, he will be found by you; but if you forsake him, he will cast you off forever.",
    reference: "1 Chronicles 28:9"
  }

  try {
    // 1. Get random verse in English
    const bibleRes = await fetch('https://bible-api.com/?random=verse', { cache: 'no-store' })
    if (!bibleRes.ok) throw new Error('bible api fail')
    const bible = await bibleRes.json()

    let text = (bible.text || '').trim()
    let ref = (bible.reference || '').trim()

    if (!text || !ref) throw new Error('empty bible')

    // 2. If Spanish requested, get Spanish RVR version of SAME verse
    if (isEs) {
      try {
        const esRes = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=spa-rvr`, { cache: 'no-store' })
        if (esRes.ok) {
          const esData = await esRes.json()
          if (esData.text && esData.text.trim().length > 10) {
            return Response.json({ text: esData.text.trim(), reference: esData.reference || ref }, { headers: { 'Cache-Control': 'no-store' } })
          }
        }
      } catch {}
      // If RVR not found for this verse, return FALLBACK_ES — still Spanish, never English
      return Response.json(FALLBACK_ES, { headers: { 'Cache-Control': 'no-store' } })
    }

    // English mode
    return Response.json({ text, reference: ref }, { headers: { 'Cache-Control': 'no-store' } })

  } catch {
    // Any error — return fallback in user's language, not English when Español
    return Response.json(isEs ? FALLBACK_ES : FALLBACK_EN, { headers: { 'Cache-Control': 'no-store' } })
  }
}
