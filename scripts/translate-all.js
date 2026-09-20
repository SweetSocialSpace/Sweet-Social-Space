const fs = require('fs')
const en = require('../translations/en.json')

async function translate(text, target) {
  const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${target}`)
  const data = await res.json()
  return data.responseData.translatedText || text
}

// This will translate your entire en.json to es.json, ar.json, etc ONCE
// Then you commit them and never need an API again
