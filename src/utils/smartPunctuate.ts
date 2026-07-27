export function smartPunctuate(text: string): string {
  try {
    if (!text || typeof text !== 'string') return ''
    let t = text.replace(/\s+/g, ' ').trim()
    if (!t) return ''

    const protections: string[] = []
    const protect = (s: string) => {
      const token = `__SSS_PROT_${protections.length}_${Date.now()}__`
      protections.push(s)
      return token
    }

    t = t
      .replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc|e\.g|i\.e)\./gi, m => protect(m))
      .replace(/\b\d+\.\d+\b/g, m => protect(m))

    const sentences = t.split(/(?<=[.!?])\s+(?=[A-Z0-9"'({\[])/)

    const fixed = sentences.map(s => {
      let str = s.trim()
      if (!str) return ''

      // Global fix - find first letter even if starts with " ' (
      str = str.replace(/^([^A-Za-z]*)([a-z])/, (_, pre, firstLetter) => {
        return pre + firstLetter.toUpperCase()
      })
      // Automated casing - independent
      str = str.replace(/\bi\b/g, 'I')
      str = str.replace(/\bi'm\b/gi, "I'm")

      if (!/[.!?]$/.test(str)) {
        const isQuestion = /^(who|what|when|where|why|how|is|are|can|do|does|did|would|should|will|have|has)\b/i.test(str)
        str += isQuestion ? '?' : '.'
      }

      return str
    })

    let out = fixed.filter(Boolean).join(' ')

    protections.forEach((original, i) => {
      // Use exact token that was generated
      const tokenPrefix = `__SSS_PROT_${i}_`
      // Find and replace the token with timestamp
      const regex = new RegExp(tokenPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\d+__')
      out = out.replace(regex, original)
    })

    return out
  } catch {
    // House never dies - if punctuation fails, return original text, don't kill post
    return text || ''
  }
}
