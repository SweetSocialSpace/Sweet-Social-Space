'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { t:"AI MAYOR", gm:"Good morning", ga:"Good afternoon", ge:"Good evening", gn:"Good night", mild:"Mild {T}°F - perfect", hot:"Hot {T}°F", first:"Be the first in {C}", watch:"Watching over {C}" },
  es: { t:"ALCALDE IA", gm:"Buenos días", ga:"Buenas tardes", ge:"Buenas noches", gn:"Buenas noches", mild:"Suave {T}°F", hot:"Calor {T}°F", first:"Sé el primero en {C}", watch:"Vigilando {C}" },
  fr: { t:"MAIRE IA", gm:"Bonjour", ga:"Bon après-midi", ge:"Bonsoir", gn:"Bonne nuit", mild:"Doux {T}°F", hot:"Chaud {T}°F", first:"Premier à {C}", watch:"Veille sur {C}" },
  de: { t:"KI BÜRGERMEISTER", gm:"Guten Morgen", ga:"Guten Tag", ge:"Guten Abend", gn:"Gute Nacht", mild:"Mild {T}°F", hot:"Heiß {T}°F", first:"Erster in {C}", watch:"Wacht über {C}" },
  zh: { t:"AI 市长", gm:"早上好", ga:"下午好", ge:"晚上好", gn:"晚安", mild:"{T}°F 温和", hot:"{T}°F 炎热", first:"第一个在 {C}", watch:"守护 {C}" },
  ja: { t:"AI 市長", gm:"おはよう", ga:"こんにちは", ge:"こんばんは", gn:"おやすみ", mild:"{T}°F 穏やか", hot:"{T}°F 猛暑", first:"{C}で最初に", watch:"{C}を見守り" },
  ko: { t:"AI 시장", gm:"좋은 아침", ga:"좋은 오후", ge:"좋은 저녁", gn:"안녕히 주무세요", mild:"{T}°F 온화", hot:"{T}°F 더움", first:"{C}에서 첫 번째", watch:"{C} 지키는 중" },
  pt: { t:"PREFEITO IA", gm:"Bom dia", ga:"Boa tarde", ge:"Boa noite", gn:"Boa noite", mild:"Ameno {T}°F", hot:"Quente {T}°F", first:"Primeiro em {C}", watch:"Vigiando {C}" },
  ru: { t:"ИИ МЭР", gm:"Доброе утро", ga:"Добрый день", ge:"Добрый вечер", gn:"Спокойной ночи", mild:"Мягко {T}°F", hot:"Жарко {T}°F", first:"Первый в {C}", watch:"Наблюдает за {C}" },
  ar: { t:"العمدة الذكي", gm:"صباح الخير", ga:"مساء الخير", ge:"مساء الخير", gn:"تصبح على خير", mild:"معتدل {T}°F", hot:"حار {T}°F", first:"أول في {C}", watch:"يراقب {C}" },
  hi: { t:"AI मेयर", gm:"सुप्रभात", ga:"नमस्ते", ge:"शुभ संध्या", gn:"शुभ रात्रि", mild:"हल्का {T}°F", hot:"गर्म {T}°F", first:"{C} में पहले", watch:"{C} पर नजर" },
  it: { t:"SINDACO IA", gm:"Buongiorno", ga:"Buon pomeriggio", ge:"Buonasera", gn:"Buonanotte", mild:"Mite {T}°F", hot:"Caldo {T}°F", first:"Primo a {C}", watch:"Veglia su {C}" },
  nl: { t:"AI BURGEMEESTER", gm:"Goedemorgen", ga:"Goedemiddag", ge:"Goedenavond", gn:"Goedenacht", mild:"Mild {T}°F", hot:"Heet {T}°F", first:"Eerste in {C}", watch:"Waakt over {C}" },
  tl: { t:"AI MAYOR", gm:"Magandang umaga", ga:"Magandang hapon", ge:"Magandang gabi", gn:"Magandang gabi", mild:"Mild {T}°F", hot:"Mainit {T}°F", first:"Una sa {C}", watch:"Binabantayan ang {C}" },
  bn: { t:"AI মেয়র", gm:"সুপ্রভাত", ga:"শুভ অপরাহ্ন", ge:"শুভ সন্ধ্যা", gn:"শুভ রাত্রি", mild:"মৃদু {T}°F", hot:"গরম {T}°F", first:"{C} এ প্রথম", watch:"{C} দেখছে" },
  id: { t:"WALIKOTA AI", gm:"Selamat pagi", ga:"Selamat siang", ge:"Selamat sore", gn:"Selamat malam", mild:"Sejuk {T}°F", hot:"Panas {T}°F", first:"Pertama di {C}", watch:"Menjaga {C}" },
  vi: { t:"THỊ TRƯỞNG AI", gm:"Chào buổi sáng", ga:"Chào buổi chiều", ge:"Chào buổi tối", gn:"Chúc ngủ ngon", mild:"Mát {T}°F", hot:"Nóng {T}°F", first:"Đầu tiên ở {C}", watch:"Canh {C}" },
  th: { t:"นายก AI", gm:"อรุณสวัสดิ์", ga:"สวัสดีตอนบ่าย", ge:"สวัสดีตอนเย็น", gn:"ราตรีสวัสดิ์", mild:"{T}°F ดี", hot:"{T}°F ร้อน", first:"คนแรกใน {C}", watch:"เฝ้าดู {C}" },
  sv: { t:"AI BORGMÄSTARE", gm:"God morgon", ga:"God eftermiddag", ge:"God kväll", gn:"God natt", mild:"Milt {T}°F", hot:"Varmt {T}°F", first:"Först i {C}", watch:"Vakar över {C}" },
  pl: { t:"BURMISTRZ AI", gm:"Dzień dobry", ga:"Dzień dobry", ge:"Dobry wieczór", gn:"Dobranoc", mild:"Łagodnie {T}°F", hot:"Gorąco {T}°F", first:"Pierwszy w {C}", watch:"Czuwa nad {C}" },
  tr: { t:"AI BAŞKAN", gm:"Günaydın", ga:"Tünaydın", ge:"İyi akşamlar", gn:"İyi geceler", mild:"Ilık {T}°F", hot:"Sıcak {T}°F", first:"{C}'de ilk", watch:"{C}'yi izliyor" },
  uk: { t:"ШІ МЕР", gm:"Доброго ранку", ga:"Добрий день", ge:"Добрий вечір", gn:"Надобраніч", mild:"М'яко {T}°F", hot:"Спекотно {T}°F", first:"Перший у {C}", watch:"Стежить за {C}" },
  el: { t:"ΔΗΜΑΡΧΟΣ AI", gm:"Καλημέρα", ga:"Καλό απόγευμα", ge:"Καλησπέρα", gn:"Καληνύχτα", mild:"Ήπιο {T}°F", hot:"Ζεστό {T}°F", first:"Πρώτος στο {C}", watch:"Φυλάει το {C}" },
  he: { t:"ראש עיר AI", gm:"בוקר טוב", ga:"צהריים טובים", ge:"ערב טוב", gn:"לילה טוב", mild:"נעים {T}°F", hot:"חם {T}°F", first:"ראשון ב{C}", watch:"שומר על {C}" },
  ur: { t:"AI میئر", gm:"صبح بخیر", ga:"دوپہر بخیر", ge:"شام بخیر", gn:"شب بخیر", mild:"معتدل {T}°F", hot:"گرم {T}°F", first:"{C} میں پہلا", watch:"{C} دیکھ رہا ہے" },
  fa: { t:"شهردار AI", gm:"صبح بخیر", ga:"عصر بخیر", ge:"عصر بخیر", gn:"شب بخیر", mild:"ملایم {T}°F", hot:"گرم {T}°F", first:"اولین در {C}", watch:"مراقب {C}" },
  ms: { t:"DATUK AI", gm:"Selamat pagi", ga:"Selamat petang", ge:"Selamat petang", gn:"Selamat malam", mild:"Mild {T}°F", hot:"Panas {T}°F", first:"Pertama di {C}", watch:"Menjaga {C}" },
  ro: { t:"PRIMAR AI", gm:"Bună dimineața", ga:"Bună ziua", ge:"Bună seara", gn:"Noapte bună", mild:"Blând {T}°F", hot:"Cald {T}°F", first:"Primul în {C}", watch:"Veghează {C}" },
  cs: { t:"STAROSTA AI", gm:"Dobré ráno", ga:"Dobré odpoledne", ge:"Dobrý večer", gn:"Dobrou noc", mild:"Mírně {T}°F", hot:"Horko {T}°F", first:"První v {C}", watch:"Hlídá {C}" },
  hu: { t:"AI POLGÁRMESTER", gm:"Jó reggelt", ga:"Jó napot", ge:"Jó estét", gn:"Jó éjt", mild:"Enyhe {T}°F", hot:"Forró {T}°F", first:"Első {C}-ben", watch:"Őrzi {C}" },
  fi: { t:"AI PORMESTARI", gm:"Hyvää huomenta", ga:"Hyvää iltapäivää", ge:"Hyvää iltaa", gn:"Hyvää yötä", mild:"Lauha {T}°F", hot:"Kuuma {T}°F", first:"Ensimmäinen {C}", watch:"Vartioi {C}" },
  no: { t:"AI ORDFØRER", gm:"God morgen", ga:"God ettermiddag", ge:"God kveld", gn:"God natt", mild:"Mild {T}°F", hot:"Varm {T}°F", first:"Først i {C}", watch:"Vokter {C}" },
  da: { t:"AI BORGMESTER", gm:"Godmorgen", ga:"Godeftermiddag", ge:"Godaften", gn:"Godnat", mild:"Mild {T}°F", hot:"Varm {T}°F", first:"Først i {C}", watch:"Vogter {C}" },
  bg: { t:"КМЕТ AI", gm:"Добро утро", ga:"Добър ден", ge:"Добър вечер", gn:"Лека нощ", mild:"Меко {T}°F", hot:"Горещо {T}°F", first:"Първи в {C}", watch:"Пази {C}" },
  hr: { t:"GRADONAČELNIK AI", gm:"Dobro jutro", ga:"Dobar dan", ge:"Dobra večer", gn:"Laku noć", mild:"Blago {T}°F", hot:"Vruće {T}°F", first:"Prvi u {C}", watch:"Čuva {C}" },
  sr: { t:"ГРАДОНАЧЕЛНИК AI", gm:"Добро јутро", ga:"Добар дан", ge:"Добро вече", gn:"Лаку ноћ", mild:"Благо {T}°F", hot:"Вруће {T}°F", first:"Први у {C}", watch:"Чува {C}" },
  sk: { t:"STAROSTA AI", gm:"Dobré ráno", ga:"Dobrý deň", ge:"Dobrý večer", gn:"Dobrú noc", mild:"Mierne {T}°F", hot:"Horúco {T}°F", first:"Prvý v {C}", watch:"Stráži {C}" },
  sl: { t:"ŽUPAN AI", gm:"Dobro jutro", ga:"Dober dan", ge:"Dober večer", gn:"Lahko noč", mild:"Milo {T}°F", hot:"Vroče {T}°F", first:"Prvi v {C}", watch:"Čuva {C}" },
  et: { t:"LINNAPEA AI", gm:"Tere hommikust", ga:"Tere päevast", ge:"Tere õhtust", gn:"Head ööd", mild:"Mahe {T}°F", hot:"Kuum {T}°F", first:"Esimene {C}", watch:"Valvab {C}" },
  lv: { t:"MĒRS AI", gm:"Labrīt", ga:"Labdien", ge:"Labvakar", gn:"Ar labu nakti", mild:"Maigs {T}°F", hot:"Karsts {T}°F", first:"Pirmais {C}", watch:"Sargā {C}" },
  lt: { t:"MERAS AI", gm:"Labas rytas", ga:"Laba diena", ge:"Labas vakaras", gn:"Labanakt", mild:"Švelnus {T}°F", hot:"Karšta {T}°F", first:"Pirmas {C}", watch:"Saugo {C}" },
  be: { t:"МЭР ШІ", gm:"Добрай раніцы", ga:"Добры дзень", ge:"Добры вечар", gn:"Дабранач", mild:"Мякка {T}°F", hot:"Гарача {T}°F", first:"Першы ў {C}", watch:"Сочиць за {C}" },
  ka: { t:"AI მერი", gm:"დილა მშვიდობისა", ga:"შუადღე მშვიდობისა", ge:"საღამო მშვიდობისა", gn:"ღამე მშვიდობისა", mild:"რბილი {T}°F", hot:"ცხელი {T}°F", first:"პირველი {C}-ში", watch:"იცავს {C}-ს" },
  hy: { t:"AI ՔԱՂԱՔԱՊԵՏ", gm:"Բարի լույս", ga:"Բարի օր", ge:"Բարի երեկո", gn:"Բարի գիշեր", mild:"Մեղմ {T}°F", hot:"Տաք {T}°F", first:"Առաջինը {C}-ում", watch:"Հսկում է {C}-ն" },
  az: { t:"AI BƏLƏDIYYƏ", gm:"Sabahınız xeyir", ga:"Günortanız xeyir", ge:"Axşamınız xeyir", gn:"Gecəniz xeyrə", mild:"Mülayim {T}°F", hot:"İsti {T}°F", first:"{C}-də birinci", watch:"{C}-ni qoruyur" },
  kk: { t:"AI ӘКІМ", gm:"Қайырлы таң", ga:"Қайырлы күн", ge:"Қайырлы кеш", gn:"Қайырлы түн", mild:"Жұмсақ {T}°F", hot:"Ыстық {T}°F", first:"{C}-да бірінші", watch:"{C}-ны бақылайды" },
  ky: { t:"AI АКИМ", gm:"Кутман таң", ga:"Кутман күн", ge:"Кутман кеч", gn:"Кутман түн", mild:"Жумшак {T}°F", hot:"Ысык {T}°F", first:"{C}-да биринчи", watch:"{C}-ны кайтарат" },
  uz: { t:"AI HOKIM", gm:"Xayrli tong", ga:"Xayrli kun", ge:"Xayrli kech", gn:"Xayrli tun", mild:"Yumshoq {T}°F", hot:"Issiq {T}°F", first:"{C}-da birinchi", watch:"{C}-ni kuzatmoqda" },
  tg: { t:"AI ШАҲРДОР", gm:"Субҳи хайр", ga:"Рӯзи хайр", ge:"Шоми хайр", gn:"Шаби хайр", mild:"Мулоим {T}°F", hot:"Гарм {T}°F", first:"Аввал дар {C}", watch:"{C}-ро муҳофизат мекунад" },
  mn: { t:"AI ДАРГА", gm:"Өглөөний мэнд", ga:"Өдрийн мэнд", ge:"Оройн мэнд", gn:"Шөнийн мэнд", mild:"Зөөлөн {T}°F", hot:"Халуун {T}°F", first:"{C}-д анхны", watch:"{C}-г харж байна" },
  km: { t:"អភិបាល AI", gm:"អរុណសួស្តី", ga:"ទិវាសួស្តី", ge:"សាយ័ណ្ហសួស្តី", gn:"រាត្រីសួស្តី", mild:"{T}°F ស្រាល", hot:"{T}°F ក្តៅ", first:"ដំបូងនៅ {C}", watch:"เฝ้า {C}" },
  lo: { t:"ເຈົ້າເມືອງ AI", gm:"ສະບາຍດີຕອນເຊົ້າ", ga:"ສະບາຍດີຕອນບ່າຍ", ge:"ສະບາຍດີຕອນແລງ", gn:"ຝັນດີ", mild:"{T}°F ອ່ອນ", hot:"{T}°F ຮ້ອນ", first:"ທຳອິດໃນ {C}", watch:"ເຝົ້າ {C}" },
  my: { t:"AI မြို့တော်ဝန်", gm:"မင်္ဂလာနံနက်ခင်း", ga:"မင်္ဂလာနေ့လည်ခင်း", ge:"မင်္ဂလာညချမ်း", gn:"မင်္ဂလာညချမ်း", mild:"{T}°F သာယာ", hot:"{T}°F ပူ", first:"{C} တွင် ပထမဆုံး", watch:"{C} ကို စောင့်ကြည့်" },
}

export default function AIMayor() {
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const dict = D[language] || D.en
  const effCity = city || zip || 'LOCAL'
  const [brief, setBrief] = useState('...')

  useEffect(() => {
    const run = async () => {
      const h = new Date().getHours()
      let g = dict.gm
      if (h >= 12 && h < 17) g = dict.ga
      else if (h >= 17 && h < 21) g = dict.ge
      else if (h >= 21) g = dict.gn
      const w = await fetch(`/api/weather?zip=${effCity}`).then(r=>r.json()).catch(()=>({temp:65}))
      const tt = w?.temp? Math.round(w.temp) : 65
      const tempStr = tt >= 85? dict.hot.replace('{T}', String(tt)) : dict.mild.replace('{T}', String(tt))
      const date = new Date().toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'short' })
      setBrief(`${g} ${effCity} • ${tempStr} • ${dict.first.replace('{C}', effCity)} • 📅 ${date} • ${dict.watch.replace('{C}', effCity)}`)
    }
    run()
  }, [effCity, language, dict])

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-4 border border-white/10">
      <div className="text-purple-300 font-black text-xs">{dict.t} • LIVE • {effCity.toUpperCase()}</div>
      <div className="text-white text-sm mt-1 leading-relaxed">{brief}</div>
    </div>
  )
}
