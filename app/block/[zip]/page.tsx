'use client'
import { useLanguage } from '@/lib/language-context'
import { useEffect, useState } from 'react'

function AutoTranslatedPost({ post }: { post: any }) {
  const { language } = useLanguage()
  const [displayBody, setDisplayBody] = useState(post.body)
  const [isTranslated, setIsTranslated] = useState(false)

  useEffect(() => {
    if (post.original_lang === language) {
      setDisplayBody(post.body)
      setIsTranslated(false)
      return
    }
    // If we have cached translation
    if (post.translations?.[language]) {
      setDisplayBody(post.translations[language])
      setIsTranslated(true)
      return
    }
    // Otherwise translate live
    fetch('/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text: post.body, targetLang: language, postId: post.id })
    }).then(r => r.json()).then(data => {
      if (data.translated && data.translated!== post.body) {
        setDisplayBody(data.translated)
        setIsTranslated(true)
      }
    })
  }, [language, post])

  return (
    <div className="p-4 bg-white rounded-xl text-black">
      <p>{displayBody}</p>
      {isTranslated && (
        <p className="text-xs text-black/40 mt-2">
          Translated from {post.original_lang} → {language} • <span className="underline cursor-pointer" onClick={() => setDisplayBody(post.body)}>Show original</span>
        </p>
      )}
    </div>
  )
}
