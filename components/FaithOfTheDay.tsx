'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'

const VERSES = [
  { verse: "Love your neighbor as yourself.", ref: "Mark 12:31", prompt: "Who on your block can you show love to today?" },
  { verse: "Faith without works is dead.", ref: "James 2:17", prompt: "Is there a neighbor nearby who needs a hand?" },
  { verse: "Be still, and know that I am God.", ref: "Psalm 46:10", prompt: "Take 30 seconds before you scroll. Breathe." },
  { verse: "What you do to the least of these, you do to me.", ref: "Matthew 25:40", prompt: "That free couch? Someone's blessing." },
  { verse: "Let your light shine before others.", ref: "Matthew 5:16", prompt: "Post one encouragement to your block today." },
  { verse: "Bear one another's burdens.", ref: "Galatians 6:2", prompt: "Someone near you is carrying something heavy." },
  { verse: "The Lord is near to the brokenhearted.", ref: "Psalm 34:18", prompt: "Check on a neighbor today." },
  { verse: "Do unto others as you would have them do unto you.", ref: "Luke 6:31", prompt: "WWJD on your block today?" },
]

const D: Record<string, any> = {
  en: { title:"Faith of the Day", finding:"Finding your block...", live:"LIVE", thought:"TODAY'S THOUGHT:", see:"See Faith Posts →", share:"Share" },
  es: { title:"Fe del Día", finding:"Buscando tu bloque...", live:"EN VIVO", thought:"PENSAMIENTO DE HOY:", see:"Ver Posts de Fe →", share:"Compartir" },
  fr: { title:"Foi du Jour", finding:"Recherche de votre quartier...", live:"EN DIRECT", thought:"PENSÉE DU JOUR:", see:"Voir Posts Foi →", share:"Partager" },
  de: { title:"Glaube des Tages", finding:"Deinen Block finden...", live:"LIVE", thought:"GEDANKE HEUTE:", see:"Glaubens-Posts ansehen →", share:"Teilen" },
  zh: { title:"今日信仰", finding:"正在寻找你的街区...", live:"直播", thought:"今日思考：", see:"查看信仰帖子 →", share:"分享" },
  ja: { title:"今日の信仰", finding:"ブロックを探しています...", live:"ライブ", thought:"今日の考え：", see:"信仰投稿を見る →", share:"シェア" },
  ko: { title:"오늘의 믿음", finding:"블록 찾는 중...", live:"라이브", thought:"오늘의 생각:", see:"믿음 게시물 보기 →", share:"공유" },
  pt: { title:"Fé do Dia", finding:"Encontrando seu bloco...", live:"AO VIVO", thought:"PENSAMENTO DE HOJE:", see:"Ver Posts de Fé →", share:"Compartilhar" },
  ru: { title:"Вера Дня", finding:"Поиск вашего блока...", live:"LIVE", thought:"МЫСЛЬ ДНЯ:", see:"Смотреть посты о вере →", share:"Поделиться" },
  ar: { title:"إيمان اليوم", finding:"البحث عن منطقتك...", live:"مباشر", thought:"فكرة اليوم:", see:"عرض منشورات الإيمان →", share:"مشاركة" },
  hi: { title:"आज का विश्वास", finding:"आपका ब्लॉक ढूंढ रहे...", live:"लाइव", thought:"आज का विचार:", see:"विश्वास पोस्ट देखें →", share:"साझा करें" },
  it: { title:"Fede del Giorno", finding:"Trovando il tuo blocco...", live:"LIVE", thought:"PENSIERO DI OGGI:", see:"Vedi Post di Fede →", share:"Condividi" },
  nl: { title:"Geloof van de Dag", finding:"Je blok zoeken...", live:"LIVE", thought:"GEDACHTE VANDAAG:", see:"Bekijk Geloofs Posts →", share:"Delen" },
  tl: { title:"Pananampalataya ng Araw", finding:"Hinahanap ang block mo...", live:"LIVE", thought:"KAISIPAN NGAYON:", see:"Tingnan Faith Posts →", share:"I-share" },
  bn: { title:"আজকের বিশ্বাস", finding:"আপনার ব্লক খুঁজছি...", live:"লাইভ", thought:"আজকের চিন্তা:", see:"বিশ্বাস পোস্ট দেখুন →", share:"শেয়ার" },
  id: { title:"Iman Hari Ini", finding:"Mencari blok Anda...", live:"LIVE", thought:"PEMIKIRAN HARI INI:", see:"Lihat Postingan Iman →", share:"Bagikan" },
  vi: { title:"Đức Tin Trong Ngày", finding:"Đang tìm khối của bạn...", live:"TRỰC TIẾP", thought:"SUY NGHĨ HÔM NAY:", see:"Xem Bài Đức Tin →", share:"Chia sẻ" },
  th: { title:"ความเชื่อประจำวัน", finding:"กำลังหาบล็อกของคุณ...", live:"สด", thought:"ความคิดวันนี้:", see:"ดูโพสต์ความเชื่อ →", share:"แชร์" },
  sv: { title:"Dagens Tro", finding:"Hittar ditt kvarter...", live:"LIVE", thought:"DAGENS TANKE:", see:"Se Tro Inlägg →", share:"Dela" },
  pl: { title:"Wiara Dnia", finding:"Szukanie twojego bloku...", live:"NA ŻYWO", thought:"MYŚL DNIA:", see:"Zobacz Posty Wiary →", share:"Udostępnij" },
  tr: { title:"Günün İnancı", finding:"Bloğunuz aranıyor...", live:"CANLI", thought:"BUGÜNÜN DÜŞÜNCESİ:", see:"İnanç Gönderilerini Gör →", share:"Paylaş" },
  uk: { title:"Віра Дня", finding:"Пошук вашого блоку...", live:"LIVE", thought:"ДУМКА ДНЯ:", see:"Переглянути пости віри →", share:"Поділитися" },
  el: { title:"Πίστη της Ημέρας", finding:"Εύρεση του μπλοκ σας...", live:"ΖΩΝΤΑΝΑ", thought:"ΣΚΕΨΗ ΣΗΜΕΡΑ:", see:"Δείτε Αναρτήσεις Πίστης →", share:"Κοινοποίηση" },
  he: { title:"אמונת היום", finding:"מחפש את הבלוק שלך...", live:"חי", thought:"מחשבת היום:", see:"ראה פוסטים של אמונה →", share:"שתף" },
  ur: { title:"آج کا ایمان", finding:"آپ کا بلاک تلاش کر رہے...", live:"لائیو", thought:"آج کا خیال:", see:"ایمان پوسٹس دیکھیں →", share:"شیئر" },
  fa: { title:"ایمان روز", finding:"در حال یافتن بلوک شما...", live:"زنده", thought:"اندیشه امروز:", see:"دیدن پست های ایمان →", share:"اشتراک" },
  ms: { title:"Kepercayaan Hari Ini", finding:"Mencari blok anda...", live:"LANGSUNG", thought:"PEMIKIRAN HARI INI:", see:"Lihat Post Kepercayaan →", share:"Kongsi" },
  ro: { title:"Credința Zilei", finding:"Se caută blocul tău...", live:"LIVE", thought:"GÂNDUL ZILEI:", see:"Vezi Postări de Credință →", share:"Distribuie" },
  cs: { title:"Víra Dne", finding:"Hledání vašeho bloku...", live:"ŽIVĚ", thought:"MYŠLENKA DNE:", see:"Zobrazit příspěvky víry →", share:"Sdílet" },
  hu: { title:"A Nap Hite", finding:"Blokkod keresése...", live:"ÉLŐ", thought:"MAI GONDOLAT:", see:"Hit posztok megtekintése →", share:"Megosztás" },
  fi: { title:"Päivän Usko", finding:"Etsitään lohkoasi...", live:"LIVE", thought:"PÄIVÄN AJATUS:", see:"Katso Uskon Julkaisut →", share:"Jaa" },
  no: { title:"Dagens Tro", finding:"Finner blokken din...", live:"LIVE", thought:"DAGENS TANKE:", see:"Se Tro Innlegg →", share:"Del" },
  da: { title:"Dagens Tro", finding:"Finder din blok...", live:"LIVE", thought:"DAGENS TANKE:", see:"Se Tro Opslag →", share:"Del" },
  bg: { title:"Вяра на Деня", finding:"Търсене на вашия блок...", live:"НА ЖИВО", thought:"МИСЪЛ ДНЕС:", see:"Виж постове за вяра →", share:"Сподели" },
  hr: { title:"Vjera Dana", finding:"Traženje vašeg bloka...", live:"UŽIVO", thought:"MISAO DANA:", see:"Vidi postove vjere →", share:"Podijeli" },
  sr: { title:"Вера Дана", finding:"Тражење вашег блока...", live:"УЖИВО", thought:"МИСАО ДАНА:", see:"Види постове вере →", share:"Подели" },
  sk: { title:"Viera Dňa", finding:"Hľadanie vášho bloku...", live:"NAŽIVO", thought:"MYŠLIENKA DŇA:", see:"Zobraziť príspevky viery →", share:"Zdieľať" },
  sl: { title:"Vera Dneva", finding:"Iskanje vašega bloka...", live:"V ŽIVO", thought:"MISSEL DNEVA:", see:"Poglej objave vere →", share:"Deli" },
  et: { title:"Päeva Usk", finding:"Sinu bloki otsimine...", live:"OTSE", thought:"TÄNASE PÄEVA MÕTE:", see:"Vaata usu postitusi →", share:"Jaga" },
  lv: { title:"Dienas Ticība", finding:"Meklē jūsu bloku...", live:"TIEŠRAIDE", thought:"DIENAS DOMA:", see:"Skatīt ticības ierakstus →", share:"Dalīties" },
  lt: { title:"Dienos Tikėjimas", finding:"Ieškoma jūsų bloko...", live:"GYVAI", thought:"DIENOS MINTIS:", see:"Žiūrėti tikėjimo įrašus →", share:"Dalintis" },
  be: { title:"Вера Дня", finding:"Пошук вашага блока...", live:"ЖЫВА", thought:"ДУМКА ДНЯ:", see:"Глядзець посты веры →", share:"Падзяліцца" },
  ka: { title:"დღის რწმენა", finding:"თქვენი ბლოკის ძებნა...", live:"LIVE", thought:"დღევანდელი აზრი:", see:"რწმენის პოსტების ნახვა →", share:"გაზიარება" },
  hy: { title:"Օրվա Հավատքը", finding:"Ձեր բլոկի որոնում...", live:"ՈՒՂԻՂ", thought:"ՕՐՎԱ ՄԻՏՔԸ:", see:"Դիտել հավատքի գրառումները →", share:"Կիսվել" },
  az: { title:"Günün İnamı", finding:"Blokunuz axtarılır...", live:"CANLI", thought:"BUGÜNKÜ DÜŞÜNCƏ:", see:"İnam Postlarına Bax →", share:"Paylaş" },
  kk: { title:"Күннің Сенimi", finding:"Блогыңызды іздеу...", live:"ТІКЕЛЕЙ", thought:"БҮГІНГІ ОЙ:", see:"Сенім жазбаларын көру →", share:"Бөлісу" },
  ky: { title:"Күндүн Ишеними", finding:"Блогуңузду издөө...", live:"ТҮЗ", thought:"БҮГҮНКҮ ОЙ:", see:"Ишеним постторун көрүү →", share:"Бөлүшүү" },
  uz: { title:"Kunning E'tiqodi", finding:"Blokingizni qidirish...", live:"JONLI", thought:"BUGUNGI FIKR:", see:"E'tiqod Postlarini Ko'rish →", share:"Ulashish" },
  tg: { title:"Эътиқоди Рӯз", finding:"Ҷустуҷӯи блоки шумо...", live:"ЗИНДА", thought:"АНДЕШАИ ИМРӮЗ:", see:"Дидани постҳои эътиқод →", share:"Мубодила" },
  mn: { title:"Өдрийн Итгэл", finding:"Таны блок хайж байна...", live:"ШУУД", thought:"ӨНӨӨДРИЙН БОДОЛ:", see:"Итгэлийн пост үзэх →", share:"Хуваалцах" },
  km: { title:"ជំនឿប្រចាំថ្ងៃ", finding:"កំពុងស្វែងរកប្លុករបស់អ្នក...", live:"ផ្ទាល់", thought:"គំនិតថ្ងៃនេះ:", see:"មើលប្រកាសជំនឿ →", share:"ចែករំលែក" },
  lo: { title:"ຄວາມເຊື່ອຂອງມື້", finding:"ກຳລັງຫາບລັອກຂອງທ່ານ...", live:"ສົດ", thought:"ຄວາມຄິດຂອງມື້ນີ້:", see:"ເບິ່ງໂພສຄວາມເຊື່ອ →", share:"ແບ່ງປັນ" },
  my: { title:"နေ့၏ယုံကြည်မှု", finding:"သင့်ဘလောက်ကိုရှာနေသည်...", live:"တိုက်ရိုက်", thought:"ယနေ့အတွေးအခေါ်:", see:"ယုံကြည်မှုပို့စ်များကြည့်ရန် →", share:"မျှဝေရန်" },
}

export default function FaithOfTheDay() {
  const { zip } = useLocation()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const router = useRouter()
  const [today, setToday] = useState(VERSES[0])

  useEffect(() => { const dayIndex = new Date().getDate() % VERSES.length; setToday(VERSES[dayIndex]) }, [])

  if (!zip) {
    return (
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl p-5 border border-white/10">
        <div className="text-xs font-black tracking-widest text-yellow-400">{d.title}</div>
        <div className="text-white/60 text-xs mt-2">{d.finding}</div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl p-5 border border-white/10 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl" />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black tracking-widest text-yellow-400">{d.title}</span>
        <span className="text- bg-white/10 text-white/60 px-2 py-1 rounded-full">{d.live}</span>
      </div>
      <div className="text-white font-black text-lg leading-tight">&quot;{today.verse}&quot;</div>
      <div className="text-yellow-400 font-black text-xs mt-2 tracking-widest">{today.ref}</div>
      <div className="mt-4 bg-white/10 rounded-xl p-3 border border-white/10">
        <div className="text-white/60 text- font-black tracking-widest mb-1">{d.thought}</div>
        <div className="text-white text-sm font-bold leading-snug">{today.prompt}</div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={()=> router.push(`/feed?filter=faith`)} className="flex-1 bg-white text-black text-xs font-black px-3 py-2 rounded-full text-center hover:bg-yellow-400 transition">{d.see}</button>
        <button onClick={()=> { if(typeof navigator!== 'undefined' && navigator.clipboard) { navigator.clipboard.writeText(`"${today.verse}" - ${today.ref} - from Sweet Social Space`) } }} className="bg-white/10 text-white text-xs font-black px-3 py-2 rounded-full border border-white/20">{d.share}</button>
      </div>
    </div>
  )
}
