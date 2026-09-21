export function smartPunctuate(text: string, lang: string = 'en'): string {
  if (!text) return ''
  let t = text.replace(/\s+/g, ' ').trim()
  if (!t) return ''

  // Split on all sentence terminators across 53 langs
  const terminators = /([.!?。？！।۔؟]+)\s*/g
  const raw = t.split(terminators).filter(Boolean)

  let sentences: string[] = []
  let buffer = ''
  for (let i = 0; i < raw.length; i++) {
    const part = raw[i].trim()
    if (/[.!?。？！।۔؟]+/.test(part)) {
      buffer += part + ' '
      sentences.push(buffer.trim())
      buffer = ''
    } else {
      buffer += part + ' '
    }
  }
  if (buffer.trim()) sentences.push(buffer.trim())
  if (sentences.length === 0) sentences = [t]

  // Question starters in 53 languages
  const questionPatterns: Record<string, RegExp> = {
    en: /^(who|what|when|where|why|how|is|are|can|do|does|did|will|would|are you|can you|how are|what's|so can we|does anybody|do you)/i,
    es: /^(quién|qué|cuándo|dónde|por qué|cómo|es|está|puedes|puede|hay|cuál|cuáles)/i,
    fr: /^(qui|quoi|quand|où|pourquoi|comment|est|êtes|peux|peut|y a-t-il|quel|quelle)/i,
    de: /^(wer|was|wann|wo|warum|wie|ist|sind|kannst|kann|gibt|welche)/i,
    zh: /^(谁|什么|什么时候|哪里|为什么|怎么|是|吗|能不能|有没有)/,
    ja: /^(誰|何|いつ|どこ|なぜ|どう|ですか|ますか|できる|ありますか)/,
    ko: /^(누구|무엇|언제|어디|왜|어떻게|인가요|있나요|할 수 있나요)/,
    pt: /^(quem|o que|quando|onde|por que|como|é|está|pode|há|qual)/i,
    ru: /^(кто|что|когда|где|почему|как|есть|можно|какой)/i,
    ar: /^(من|ماذا|متى|أين|لماذا|كيف|هل|أين)/,
    hi: /^(कौन|क्या|कब|कहाँ|क्यों|कैसे|है|क्या)/,
    it: /^(chi|cosa|quando|dove|perché|come|è|puoi|può|c'è|quale)/i,
    nl: /^(wie|wat|wanneer|waar|waarom|hoe|is|zijn|kan|kun je)/i,
    tl: /^(sino|ano|kailan|saan|bakit|paano|may|puwede)/i,
    bn: /^(কে|কি|কখন|কোথায়|কেন|কিভাবে|আছে|পারি)/,
    id: /^(siapa|apa|kapan|dimana|mengapa|bagaimana|apakah|bisa|ada)/i,
    vi: /^(ai|gì|khi nào|ở đâu|tại sao|làm sao|có|không|ai là)/i,
    th: /^(ใคร|อะไร|เมื่อไหร่|ที่ไหน|ทำไม|อย่างไร|ไหม|ได้ไหม|มีไหม)/,
    tr: /^(kim|ne zaman|nerede|neden|nasıl|var mı|yapabilir misin)/i,
    pl: /^(kto|co|kiedy|gdzie|dlaczego|jak|czy|możesz|jest)/i,
  }

  const final = sentences.map(s => {
    s = s.trim()
    if (!s) return ''
    s = s.charAt(0).toUpperCase() + s.slice(1)

    // Already punctuated with any terminator -> keep
    if (/[.!?。？！।۔؟]$/.test(s)) return s

    // Check if question in current lang or English fallback
    const langKey = lang.split('-')[0]
    const pattern = questionPatterns[langKey] || questionPatterns['en']
    const isQuestion = pattern.test(s)

    // Use correct question mark for lang
    if (isQuestion) {
      if (['zh','ja','ko'].includes(langKey)) return s + '？'
      if (['ar','ur','fa'].includes(langKey)) return s + '؟'
      return s + '?'
    } else {
      if (['zh','ja'].includes(langKey)) return s + '。'
      if (['hi','bn'].includes(langKey)) return s + '।'
      if (['ar','ur','fa'].includes(langKey)) return s + '۔'
      return s + '.'
    }
  }).filter(Boolean)

  return final.join(' ').trim()
}

// Backwards compatible default export
export default smartPunctuate
