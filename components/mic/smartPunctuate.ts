export function smartPunctuate(text: string) {
  if (!text) return ''
  let t = text.replace(/\s+/g, ' ').trim()
  if (!t) return ''

  // Capitalize first letter of each sentence
  // Split by existing.!? then rebuild
  const rawSentences = t.split(/([.!?]+)\s*/).filter(Boolean)
  let sentences: string[] = []
  let buffer = ''

  for (let i = 0; i < rawSentences.length; i++) {
    const part = rawSentences[i].trim()
    if (/[.!?]+/.test(part)) {
      buffer += part + ' '
      sentences.push(buffer.trim())
      buffer = ''
    } else {
      buffer += part + ' '
    }
  }
  if (buffer.trim()) sentences.push(buffer.trim())

  // If no punctuation at all, treat whole thing as one block and split long blocks
  if (sentences.length === 0) sentences = [t]

  const final = sentences.map(s => {
    s = s.trim()
    if (!s) return ''
    s = s.charAt(0).toUpperCase() + s.slice(1)
    if (/[.!?]$/.test(s)) return s

    const isQuestion = /^(who|what|when|where|why|how|is|are|can|do|does|did|will|would|are you|can you|how are|what's|so can we|does anybody|do you)/i.test(s)
    return s + (isQuestion? '?' : '.')
  }).filter(Boolean)

  return final.join(' ').trim()
}
