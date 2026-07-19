export function smartPunctuate(text: string): string {
  if (!text) return ''
  let t = text.replace(/\s+/g, ' ').trim()
  if (!t) return ''

  // Protect common abbreviations / decimals so we don't split them
  const protections: string[] = []
  const protect = (s: string) => {
    const token = `__PROT_${protections.length}__`
    protections.push(s)
    return token
  }

  t = t
    .replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc|e\.g|i\.e)\./gi, m => protect(m))
    .replace(/\b\d+\.\d+\b/g, m => protect(m))

  // Split into sentences without breaking on protected tokens
  const sentences = t.split(/(?<=[.!?])\s+(?=[A-Z0-9"'({\[])/)

  const fixed = sentences.map(s => {
    let str = s.trim()
    if (!str) return ''

    // 4. Casing: don't use charAt(0). Find first letter, even if it starts with " ' (
    // "i'm" -> "I'm" works, but "\"hello" -> "\"Hello" not "\"hello"
    str = str.replace(/^([^A-Za-z]*)([a-z])/, (_, pre, firstLetter) => {
      return pre + firstLetter.toUpperCase()
    })
    // Fix lone "i" pronoun: "i'm" -> "I'm"
    str = str.replace(/\bi\b/g, 'I')
    str = str.replace(/\bi'm\b/gi, "I'm")

    // Ensure ends with punctuation if it doesn't look like a question
    if (!/[.!?]$/.test(str)) {
      // don't over-flag questions: only add ? if it starts with who/what/why/how etc
      const isQuestion = /^(who|what|when|where|why|how|is|are|can|do|does|did|would|should)\b/i.test(str)
      str += isQuestion ? '?' : '.'
    }

    return str
  })

  let out = fixed.filter(Boolean).join(' ')

  // Restore protected tokens
  protections.forEach((original, i) => {
    out = out.replace(`__PROT_${i}__`, original)
  })

  return out
}
