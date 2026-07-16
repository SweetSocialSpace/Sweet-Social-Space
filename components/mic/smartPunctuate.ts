export function smartPunctuate(text: string) {
  if (!text) return ''
  let t = text.replace(/\s+/g,' ').trim()
  if (!t) return ''
  const breaks = [
    "so can we see if this is","i wish you all","from the get-go","like it should be done",
    "so can we see","i'm hoping that","i'm hoping","i wish you","from the","like it should",
    "what's going on","what is going on","what time","how many","does anybody","does anyone",
    "can anybody","can anyone","are you able","now we're","now we are","so i can","so we can",
    "in other words","so then","after that","before that","and everything","hopefully",
    "actually","anyway","meanwhile","finally","now","then","so","and"
  ].sort((a,b)=>b.length - a.length)
  for (const b of breaks) {
    const escaped = b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`\\s+${escaped}\\s+`, 'gi')
    t = t.replace(re, `. ${b} `)
  }
  let parts = t.split('.').map(s=>s.trim()).filter(Boolean)
  const finalParts: string[] = []
  for (const p of parts) {
    const w = p.split(' ')
    if (w.length > 22) {
      for (let i=0; i<w.length; i+=14) finalParts.push(w.slice(i, i+14).join(' '))
    } else finalParts.push(p)
  }
  return finalParts.map(p=>{
    if (!p) return ''
    p = p.charAt(0).toUpperCase() + p.slice(1)
    if (/[.!?]$/.test(p)) return p
    const isQ = /^(how many|what time|how are|where|when|why|who|does anybody|does anyone|do you|are you|can anybody|can you|will it|is it|what's|are you able|so can we)/i.test(p)
    return p + (isQ? '?' : '.')
  }).join(' ').trim()
}
