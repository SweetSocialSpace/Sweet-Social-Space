// scripts/generate-translations.js
const fs = require('fs');
const LANGUAGES = ["es","fr","de","zh","ja","ko","tl","hi","ar","pt","ru","it","nl","sv","pl","uk","el","tr","cs","hu","fi","no","da","bg","hr","sr","sk","sl","et","lv","lt","be","ro","he","ur","fa","id","vi","th","ms","km","lo","my","bn","ka","hy","az","kk","ky","uz","tg","mn"];

async function translateFile(lang) {
  const en = JSON.parse(fs.readFileSync('public/translations/en.json','utf8'));
  const flatTexts = [];
  const paths = [];
  function flatten(obj, prefix='') {
    for (const [k,v] of Object.entries(obj)) {
      const path = prefix? `${prefix}.${k}` : k;
      if (typeof v === 'object') flatten(v, path);
      else { paths.push(path); flatTexts.push(v); }
    }
  }
  flatten(en);

  console.log(`Translating ${flatTexts.length} keys to ${lang}...`);
  const res = await fetch('https://sweetsocialspace.com/api/translate', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ target: lang, texts: flatTexts })
  });
  const data = await res.json();
  const trans = data.translations?.map(x=> x.text || x.translatedText) || [];

  // rebuild nested
  const out = {};
  paths.forEach((p,i)=>{
    const parts = p.split('.');
    let cur = out;
    parts.forEach((part, idx)=>{
      if (idx===parts.length-1) cur[part] = trans[i] || flatTexts[i];
      else { cur[part] = cur[part] || {}; cur = cur[part]; }
    });
  });
  fs.writeFileSync(`public/translations/${lang}.json`, JSON.stringify(out, null, 2));
  console.log(`✓ ${lang}.json done`);
}

(async()=>{
  for (const l of LANGUAGES) {
    await translateFile(l);
    await new Promise(r=>setTimeout(r, 2000));
  }
})()
