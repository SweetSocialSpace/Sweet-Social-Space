'use client'

import { useEffect } from 'react'
import { useLanguage, LANGUAGE_NAMES, type Language } from '@/lib/language-context'

// CORE DICTIONARY - Add more as you go, this makes it write in their language
const DICTIONARY: Record<string, Partial<Record<Language, string>>> = {
  'Any zip on earth. Chronological. No algorithm.': {
    en: 'Any zip on earth. Chronological. No algorithm.',
    es: 'Cualquier código postal del mundo. Cronológico. Sin algoritmo.',
    fr: 'N’importe quel code postal sur terre. Chronologique. Sans algorithme.',
    de: 'Jede Postleitzahl der Welt. Chronologisch. Kein Algorithmus.',
    pt: 'Qualquer CEP do mundo. Cronológico. Sem algoritmo.',
    hi: 'पृथ्वी पर कोई भी ज़िप. कालानुक्रमिक. कोई एल्गोरिदम नहीं.',
    ar: 'أي رمز بريدي على وجه الأرض. زمني. بلا خوارزمية.',
    zh: '地球上任何邮编。按时间排序。无算法。',
    ja: '地球上のどの郵便番号でも。時系列。アルゴリズムなし。',
    it: 'Qualsiasi CAP al mondo. Cronologico. Nessun algoritmo.',
  },
  'No posts yet for': {
    en: 'No posts yet for',
    es: 'Aún no hay publicaciones para',
    fr: 'Pas encore de publications pour',
    de: 'Noch keine Beiträge für',
    pt: 'Ainda não há postagens para',
    hi: 'के लिए अभी तक कोई पोस्ट नहीं',
    ar: 'لا توجد منشورات بعد لـ',
    zh: '还没有关于以下内容的帖子',
    ja: 'まだ投稿がありません',
  },
  'Be first. Own your block.': {
    en: 'Be first. Own your block.',
    es: 'Sé el primero. Sé dueño de tu cuadra.',
    fr: 'Soyez le premier. Possédez votre quartier.',
    de: 'Sei der Erste. Besitze deinen Block.',
    pt: 'Seja o primeiro. Seja dono do seu quarteirão.',
    hi: 'पहले बनें। अपने ब्लॉक के मालिक बनें।',
    ar: 'كن الأول. امتلك منطقتك.',
    zh: '抢先发帖。拥有你的街区。',
    ja: '最初になりましょう。あなたのブロックを所有しましょう。',
  },
  'Post in': {
    en: 'Post in',
    es: 'Publicar en',
    fr: 'Publier dans',
    de: 'Posten in',
    pt: 'Postar em',
    hi: 'में पोस्ट करें',
    ar: 'انشر في',
    zh: '发布于',
    ja: '投稿する',
  },
  'Enter': { en: 'Enter', es: 'Entrar a', fr: 'Entrer dans', de: 'Betreten', pt: 'Entrar em', hi: 'प्रवेश करें', ar: 'ادخل', zh: '进入', ja: '入る' },
  'Feed': { en: 'Feed', es: 'Muro', fr: 'Fil', de: 'Feed', pt: 'Feed', hi: 'फीड', ar: 'الخلاصة', zh: '动态', ja: 'フィード' },
  'Change Zip': { en: 'Change Zip', es: 'Cambiar Código', fr: 'Changer Code Postal', de: 'PLZ ändern', pt: 'Mudar CEP', hi: 'ज़िप बदलें', ar: 'تغيير الرمز البريدي', zh: '更改邮编', ja: '郵便番号を変更' },
  'Block:': { en: 'Block:', es: 'Cuadra:', fr: 'Quartier:', de: 'Block:', pt: 'Quarteirão:', hi: 'ब्लॉक:', ar: 'المنطقة:', zh: '街区:', ja: 'ブロック:' },
}

function translateText(text: string, lang: Language): string {
  const trimmed = text.trim()
  if (!trimmed) return text
  // Exact match
  if (DICTIONARY[trimmed]?.[lang]) return text.replace(trimmed, DICTIONARY[trimmed][lang])
  // Starts with
  for (const key of Object.keys(DICTIONARY)) {
    if (trimmed.startsWith(key) && DICTIONARY[key][lang]) {
      return text.replace(key, DICTIONARY[key][lang])
    }
  }
  return text
}

export default function GlobalLanguageTranslator() {
  const { language } = useLanguage()

  useEffect(() => {
    if (language === 'en') return // no need to translate

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const nodes: Text[] = []
    let node: Text | null
    while ((node = walker.nextNode() as Text | null)) {
      if (node.parentElement?.tagName === 'SCRIPT' || node.parentElement?.tagName === 'STYLE') continue
      if (node.textContent?.trim()) nodes.push(node)
    }

    nodes.forEach(n => {
      const original = n.textContent || ''
      const translated = translateText(original, language)
      if (translated!== original) n.textContent = translated
    })

    // Also update title
    document.title = translateText(document.title, language)
  }, [language])

  return null
}
