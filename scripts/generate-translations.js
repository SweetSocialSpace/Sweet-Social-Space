// scripts/generate-translations.js - THIS ONE ACTUALLY TRANSLATES
const fs = require('fs');
const path = require('path');

const LANGUAGES = ["es","fr","tl","vi","pt","de","zh","ja","ko","hi","ar","ru","it"];

const EN_PATH = 'public/translations/en.json';
const en = JSON.parse(fs.readFileSync(EN_PATH,'utf8'));

function flatten(obj, prefix='') {
  const out = [];
  for (const [k,v] of Object.entries(obj)) {
    const p = prefix? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v!== null) out.push(...flatten(v, p));
    else out.push({ path: p, text: v });
  }
  return out;
}
function unflatten(items) {
  const out = {};
  items.forEach(({path, text})=>{
    const parts = path.split('.');
    let cur = out;
    parts.forEach((part, i)=>{
      if (i===parts.length-1) cur[part]=text;
      else { cur[part]=cur[part]||{}; cur=cur[part]; }
    });
  });
  return out;
}

async function translate(text, target) {
  // MyMemory - free, no key needed for small batches
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${target}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data?.responseData?.translatedText || text;
  } catch { return text; }
}

async function doLang(lang) {
  console.log(`\n--- ${lang} ---`);
  const flat = flatten(en);
  const result = [];
  for (let i=0;i<flat.length;i++) {
    const item = flat[i];
    // don't translate vars like {radius} - translate around them
    if (item.text.length < 2 || item.text.match(/^\d+/) ) {
      result.push(item);
      continue;
    }
    const t = await translate(item.text, lang);
    console.log(`${i+1}/${flat.length} ${lang}: ${item.text.slice(0,30)} -> ${t.slice(0,30)}`);
    result.push({ path: item.path, text: t });
    await new Promise(r=>setTimeout(r, 800)); // rate limit
  }
  const nested = unflatten(result);
  fs.writeFileSync(`public/translations/${lang}.json`, JSON.stringify(nested, null, 2));
  console.log(`✓ Wrote ${lang}.json`);
}

(async()=>{
  for (const l of LANGUAGES) {
    await doLang(l);
  }
  console.log('DONE');
})();
