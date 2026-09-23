'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { title:"Faith of the Day", finding:"Finding your block...", live:"LIVE", thought:"TODAY'S THOUGHT:", see:"See Faith Posts →", share:"Share", loading:"Loading verse...", wholeBible:"Whole Bible • Random daily" },
  es: { title:"Fe del Día", finding:"Buscando tu bloque...", live:"EN VIVO", thought:"PENSAMIENTO DE HOY:", see:"Ver Posts de Fe →", share:"Compartir", loading:"Cargando versículo...", wholeBible:"Biblia completa • Aleatorio diario" },
  fr: { title:"Foi du Jour", finding:"Recherche de votre quartier...", live:"EN DIRECT", thought:"PENSÉE DU JOUR:", see:"Voir Posts Foi →", share:"Partager", loading:"Chargement du verset...", wholeBible:"Bible entière • Aléatoire quotidien" },
  de: { title:"Glaube des Tages", finding:"Deinen Block finden...", live:"LIVE", thought:"GEDANKE HEUTE:", see:"Glaubens-Posts ansehen →", share:"Teilen", loading:"Vers laden...", wholeBible:"Ganze Bibel • Zufällig täglich" },
  zh: { title:"今日信仰", finding:"正在寻找你的街区...", live:"直播", thought:"今日思考：", see:"查看信仰帖子 →", share:"分享", loading:"加载经文中...", wholeBible:"整本圣经 • 每日随机" },
  ja: { title:"今日の信仰", finding:"ブロックを探しています...", live:"ライブ", thought:"今日の考え：", see:"信仰投稿を見る →", share:"シェア", loading:"聖句を読み込み中...", wholeBible:"聖書全体 • 毎日ランダム" },
  ko: { title:"오늘의 믿음", finding:"블록 찾는 중...", live:"라이브", thought:"오늘의 생각:", see:"믿음 게시물 보기 →", share:"공유", loading:"구절 불러오는 중...", wholeBible:"전체 성경 • 매일 랜덤" },
  pt: { title:"Fé do Dia", finding:"Encontrando seu bloco...", live:"AO VIVO", thought:"PENSAMENTO DE HOJE:", see:"Ver Posts de Fé →", share:"Compartilhar", loading:"Carregando versículo...", wholeBible:"Bíblia completa • Aleatório diário" },
  ru: { title:"Вера Дня", finding:"Поиск вашего блока...", live:"LIVE", thought:"МЫСЛЬ ДНЯ:", see:"Смотреть посты о вере →", share:"Поделиться", loading:"Загрузка стиха...", wholeBible:"Вся Библия • Случайно ежедневно" },
  ar: { title:"إيمان اليوم", finding:"البحث عن منطقتك...", live:"مباشر", thought:"فكرة اليوم:", see:"عرض منشورات الإيمان →", share:"مشاركة", loading:"جاري تحميل الآية...", wholeBible:"الكتاب المقدس كامل • عشوائي يوميا" },
  hi: { title:"आज का विश्वास", finding:"आपका ब्लॉक ढूंढ रहे...", live:"लाइव", thought:"आज का विचार:", see:"विश्वास पोस्ट देखें →", share:"साझा करें", loading:"पद लोड हो रहा...", wholeBible:"पूरी बाइबिल • रोज़ यादृच्छिक" },
  it: { title:"Fede del Giorno", finding:"Trovando il tuo blocco...", live:"LIVE", thought:"PENSIERO DI OGGI:", see:"Vedi Post di Fede →", share:"Condividi", loading:"Caricamento versetto...", wholeBible:"Bibbia intera • Casuale giornaliero" },
  nl: { title:"Geloof van de Dag", finding:"Je blok zoeken...", live:"LIVE", thought:"GEDACHTE VANDAAG:", see:"Bekijk Geloofs Posts →", share:"Delen", loading:"Vers laden...", wholeBible:"Hele Bijbel • Willekeurig dagelijks" },
  tl: { title:"Pananampalataya ng Araw", finding:"Hinahanap ang block mo...", live:"LIVE", thought:"KAISIPAN NGAYON:", see:"Tingnan Faith Posts →", share:"I-share", loading:"Naglo-load ng verse...", wholeBible:"Buong Bibliya • Random araw-araw" },
  bn: { title:"আজকের বিশ্বাস", finding:"আপনার ব্লক খুঁজছি...", live:"লাইভ", thought:"আজকের চিন্তা:", see:"বিশ্বাস পোস্ট দেখুন →", share:"শেয়ার", loading:"পদ লোড হচ্ছে...", wholeBible:"পুরো বাইবেল • দৈনিক র‍্যান্ডম" },
  id: { title:"Iman Hari Ini", finding:"Mencari blok Anda...", live:"LIVE", thought:"PEMIKIRAN HARI INI:", see:"Lihat Postingan Iman →", share:"Bagikan", loading:"Memuat ayat...", wholeBible:"Seluruh Alkitab • Acak harian" },
  vi: { title:"Đức Tin Trong Ngày", finding:"Đang tìm khối của bạn...", live:"TRỰC TIẾP", thought:"SUY NGHĨ HÔM NAY:", see:"Xem Bài Đức Tin →", share:"Chia sẻ", loading:"Đang tải câu...", wholeBible:"Toàn bộ Kinh Thánh • Ngẫu nhiên hàng ngày" },
  th: { title:"ความเชื่อประจำวัน", finding:"กำลังหาบล็อกของคุณ...", live:"สด", thought:"ความคิดวันนี้:", see:"ดูโพสต์ความเชื่อ →", share:"แชร์", loading:"กำลังโหลดข้อ...", wholeBible:"พระคัมภีร์ทั้งเล่ม • สุ่มรายวัน" },
  sv: { title:"Dagens Tro", finding:"Hittar ditt kvarter...", live:"LIVE", thought:"DAGENS TANKE:", see:"Se Tro Inlägg →", share:"Dela", loading:"Laddar vers...", wholeBible:"Hela Bibeln • Slumpmässig dagligen" },
  pl: { title:"Wiara Dnia", finding:"Szukanie twojego bloku...", live:"NA ŻYWO", thought:"MYŚL DNIA:", see:"Zobacz Posty Wiary →", share:"Udostępnij", loading:"Ładowanie wersetu...", wholeBible:"Cała Biblia • Losowo codziennie" },
  tr: { title:"Günün İnancı", finding:"Bloğunuz aranıyor...", live:"CANLI", thought:"BUGÜNÜN DÜŞÜNCESİ:", see:"İnanç Gönderilerini Gör →", share:"Paylaş", loading:"Ayet yükleniyor...", wholeBible:"Tüm Kutsal Kitap • Günlük rastgele" },
  uk: { title:"Віра Дня", finding:"Пошук вашого блоку...", live:"LIVE", thought:"ДУМКА ДНЯ:", see:"Переглянути пости віри →", share:"Поділитися", loading:"Завантаження вірша...", wholeBible:"Вся Біблія • Випадково щодня" },
  el: { title:"Πίστη της Ημέρας", finding:"Εύρεση του μπλοκ σας...", live:"ΖΩΝΤΑΝΑ", thought:"ΣΚΕΨΗ ΣΗΜΕΡΑ:", see:"Δείτε Αναρτήσεις Πίστης →", share:"Κοινοποίηση", loading:"Φόρτωση εδαφίου...", wholeBible:"Ολόκληρη Βίβλος • Τυχαίο καθημερινά" },
  he: { title:"אמונת היום", finding:"מחפש את הבלוק שלך...", live:"חי", thought:"מחשבת היום:", see:"ראה פוסטים של אמונה →", share:"שתף", loading:"טוען פסוק...", wholeBible:"כל התנ״ך • אקראי יומי" },
  ur: { title:"آج کا ایمان", finding:"آپ کا بلاک تلاش کر رہے...", live:"لائیو", thought:"آج کا خیال:", see:"ایمان پوسٹس دیکھیں →", share:"شیئر", loading:"آیت لوڈ ہو رہی...", wholeBible:"مکمل بائبل • روزانہ بے ترتیب" },
  fa: { title:"ایمان روز", finding:"در حال یافتن بلوک شما...", live:"زنده", thought:"اندیشه امروز:", see:"دیدن پست های ایمان →", share:"اشتراک", loading:"در حال بارگذاری آیه...", wholeBible:"کل کتاب مقدس • تصادفی روزانه" },
  ms: { title:"Kepercayaan Hari Ini", finding:"Mencari blok anda...", live:"LANGSUNG", thought:"PEMIKIRAN HARI INI:", see:"Lihat Post Kepercayaan →", share:"Kongsi", loading:"Memuat ayat...", wholeBible:"Seluruh Bible • Rawak harian" },
  ro: { title:"Credința Zilei", finding:"Se caută blocul tău...", live:"LIVE", thought:"GÂNDUL ZILEI:", see:"Vezi Postări de Credință →", share:"Distribuie", loading:"Se încarcă versetul...", wholeBible:"Biblia întreagă • Aleator zilnic" },
  cs: { title:"Víra Dne", finding:"Hledání vašeho bloku...", live:"ŽIVĚ", thought:"MYŠLENKA DNE:", see:"Zobrazit příspěvky víry →", share:"Sdílet", loading:"Načítání verše...", wholeBible:"Celá Bible • Náhodně denně" },
  hu: { title:"A Nap Hite", finding:"Blokkod keresése...", live:"ÉLŐ", thought:"MAI GONDOLAT:", see:"Hit posztok megtekintése →", share:"Megosztás", loading:"Ige betöltése...", wholeBible:"Teljes Biblia • Véletlen napi" },
  fi: { title:"Päivän Usko", finding:"Etsitään lohkoasi...", live:"LIVE", thought:"PÄIVÄN AJATUS:", see:"Katso Uskon Julkaisut →", share:"Jaa", loading:"Ladataan jaetta...", wholeBible:"Koko Raamattu • Satunnainen päivittäin" },
  no: { title:"Dagens Tro", finding:"Finner blokken din...", live:"LIVE", thought:"DAGENS TANKE:", see:"Se Tro Innlegg →", share:"Del", loading:"Laster vers...", wholeBible:"Hele Bibelen • Tilfeldig daglig" },
  da: { title:"Dagens Tro", finding:"Finder din blok...", live:"LIVE", thought:"DAGENS TANKE:", see:"Se Tro Opslag →", share:"Del", loading:"Indlæser vers...", wholeBible:"Hele Bibelen • Tilfældig dagligt" },
  bg: { title:"Вяра на Деня", finding:"Търсене на вашия блок...", live:"НА ЖИВО", thought:"МИСЪЛ ДНЕС:", see:"Виж постове за вяра →", share:"Сподели", loading:"Зареждане на стих...", wholeBible:"Цялата Библия • Случайно ежедневно" },
  hr: { title:"Vjera Dana", finding:"Traženje vašeg bloka...", live:"UŽIVO", thought:"MISAO DANA:", see:"Vidi postove vjere →", share:"Podijeli", loading:"Učitavanje stiha...", wholeBible:"Cijela Biblija • Nasumično dnevno" },
  sr: { title:"Вера Дана", finding:"Тражење вашег блока...", live:"УЖИВО", thought:"МИСАО ДАНА:", see:"Види постове вере →", share:"Подели", loading:"Учитавање стиха...", wholeBible:"Цела Библија • Насумично дневно" },
  sk: { title:"Viera Dňa", finding:"Hľadanie vášho bloku...", live:"NAŽIVO", thought:"MYŠLIENKA DŇA:", see:"Zobraziť príspevky viery →", share:"Zdieľať", loading:"Načítanie verša...", wholeBible:"Celá Biblia • Náhodne denne" },
  sl: { title:"Vera Dneva", finding:"Iskanje vašega bloka...", live:"V ŽIVO", thought:"MISSEL DNEVA:", see:"Poglej objave vere →", share:"Deli", loading:"Nalaganje vrstice...", wholeBible:"Cela Biblija • Naključno dnevno" },
  et: { title:"Päeva Usk", finding:"Sinu bloki otsimine...", live:"OTSE", thought:"TÄNASE PÄEVA MÕTE:", see:"Vaata usu postitusi →", share:"Jaga", loading:"Salm laetakse...", wholeBible:"Terve Piibel • Juhuslik iga päev" },
  lv: { title:"Dienas Ticība", finding:"Meklē jūsu bloku...", live:"TIEŠRAIDE", thought:"DIENAS DOMA:", see:"Skatīt ticības ierakstus →", share:"Dalīties", loading:"Ielādē pantu...", wholeBible:"Visa Bībele • Nejauši katru dienu" },
  lt: { title:"Dienos Tikėjimas", finding:"Ieškoma jūsų bloko...", live:"GYVAI", thought:"DIENOS MINTIS:", see:"Žiūrėti tikėjimo įrašus →", share:"Dalintis", loading:"Įkeliama eilutė...", wholeBible:"Visa Biblija • Atsitiktinai kasdien" },
  be: { title:"Вера Дня", finding:"Пошук вашага блока...", live:"ЖЫВА", thought:"ДУМКА ДНЯ:", see:"Глядзець посты веры →", share:"Падзяліцца", loading:"Загрузка верша...", wholeBible:"Уся Біблія • Выпадкова штодня" },
  ka: { title:"დღის რწმენა", finding:"თქვენი ბლოკის ძებნა...", live:"LIVE", thought:"დღევანდელი აზრი:", see:"რწმენის პოსტების ნახვა →", share:"გაზიარება", loading:"მუხლის ჩატვირთვა...", wholeBible:"მთელი ბიბლია • შემთხვევით ყოველდღე" },
  hy: { title:"Օրվա Հավատքը", finding:"Ձեր բլոկի որոնում...", live:"ՈՒՂԻՂ", thought:"ՕՐՎԱ ՄԻՏՔԸ:", see:"Դիտել հավատքի գրառումները →", share:"Կիսվել", loading:"Բեռնում է համարը...", wholeBible:"Ամբողջ Աստվածաշունչ • Պատահական ամեն օր" },
  az: { title:"Günün İnamı", finding:"Blokunuz axtarılır...", live:"CANLI", thought:"BUGÜNKÜ DÜŞÜNCƏ:", see:"İnam Postlarına Bax →", share:"Paylaş", loading:"Ayə yüklənir...", wholeBible:"Bütün Müqəddəs Kitab • Gündəlik təsadüfi" },
  kk: { title:"Күннің Сенimi", finding:"Блогыңызды іздеу...", live:"ТІКЕЛЕЙ", thought:"БҮГІНГІ ОЙ:", see:"Сенім жазбаларын көру →", share:"Бөлісу", loading:"Аят жүктелуде...", wholeBible:"Толық Киелі кітап • Күнделікті кездейсоқ" },
  ky: { title:"Күндүн Ишеними", finding:"Блогуңузду издөө...", live:"ТҮЗ", thought:"БҮГҮНКҮ ОЙ:", see:"Ишеним постторун көрүү →", share:"Бөлүшүү", loading:"Аят жүктөлүүдө...", wholeBible:"Толук Ыйык Китеп • Күн сайын кокустан" },
  uz: { title:"Kunning E'tiqodi", finding:"Blokingizni qidirish...", live:"JONLI", thought:"BUGUNGI FIKR:", see:"E'tiqod Postlarini Ko'rish →", share:"Ulashish", loading:"Oyat yuklanmoqda...", wholeBible:"Butun Muqaddas Kitob • Har kuni tasodifiy" },
  tg: { title:"Эътиқоди Рӯз", finding:"Ҷустуҷӯи блоки шумо...", live:"ЗИНДА", thought:"АНДЕШАИ ИМРӮЗ:", see:"Дидани постҳои эътиқод →", share:"Мубодила", loading:"Оят боргири мешавад...", wholeBible:"Тамоми Китоби Муқаддас • Тасодуфӣ ҳар рӯз" },
  mn: { title:"Өдрийн Итгэл", finding:"Таны блок хайж байна...", live:"ШУУД", thought:"ӨНӨӨДРИЙН БОДОЛ:", see:"Итгэлийн пост үзэх →", share:"Хуваалцах", loading:"Ишлэл ачааллаж байна...", wholeBible:"Бүтэн Библи • Өдөр бүр санамсаргүй" },
  km: { title:"ជំនឿប្រចាំថ្ងៃ", finding:"កំពុងស្វែងរកប្លុករបស់អ្នក...", live:"ផ្ទាល់", thought:"គំនិតថ្ងៃនេះ:", see:"មើលប្រកាសជំនឿ →", share:"ចែករំលែក", loading:"កំពុងផ្ទុកខគម្ពីរ...", wholeBible:"គម្ពីរទាំងមូល • ចៃដន្យប្រចាំថ្ងៃ" },
  lo: { title:"ຄວາມເຊື່ອຂອງມື້", finding:"ກຳລັງຫາບລັອກຂອງທ່ານ...", live:"ສົດ", thought:"ຄວາມຄິດຂອງມື້ນີ້:", see:"ເບິ່ງໂພສຄວາມເຊື່ອ →", share:"ແບ່ງປັນ", loading:"ກຳລັງໂຫຼດຂໍ້...", wholeBible:"ຄຳພີທັງໝົດ • ສຸ່ມທຸກມື້" },
  my: { title:"နေ့၏ယုံကြည်မှု", finding:"သင့်ဘလောက်ကိုရှာနေသည်...", live:"တိုက်ရိုက်", thought:"ယနေ့အတွေးအခေါ်:", see:"ယုံကြည်မှုပို့စ်များကြည့်ရန် →", share:"မျှဝေရန်", loading:"ကျမ်းပိုဒ်တင်နေသည်...", wholeBible:"ကျမ်းစာတစ်အုပ်လုံး • နေ့စဉ်ကျပန်း" },
}

// Fallback 8 verses for offline / API fail - translated for top langs
const FALLBACK: Record<string, {verse:string, ref:string, prompt:string}[]> = {
  en: [
    { verse:"Love your neighbor as yourself.", ref:"Mark 12:31", prompt:"Who on your block can you show love to today?" },
    { verse:"Faith without works is dead.", ref:"James 2:17", prompt:"Is there a neighbor nearby who needs a hand?" },
    { verse:"Be still, and know that I am God.", ref:"Psalm 46:10", prompt:"Take 30 seconds before you scroll. Breathe." },
    { verse:"What you do to the least of these, you do to me.", ref:"Matthew 25:40", prompt:"That free couch? Someone's blessing." },
    { verse:"Let your light shine before others.", ref:"Matthew 5:16", prompt:"Post one encouragement to your block today." },
    { verse:"Bear one another's burdens.", ref:"Galatians 6:2", prompt:"Someone near you is carrying something heavy." },
    { verse:"The Lord is near to the brokenhearted.", ref:"Psalm 34:18", prompt:"Check on a neighbor today." },
    { verse:"Do unto others as you would have them do unto you.", ref:"Luke 6:31", prompt:"WWJD on your block today?" },
  ],
  es: [
    { verse:"Ama a tu projimo como a ti mismo.", ref:"Marcos 12:31", prompt:"¿A quien en tu cuadra puedes mostrar amor hoy?" },
    { verse:"La fe sin obras esta muerta.", ref:"Santiago 2:17", prompt:"¿Hay un vecino cerca que necesita ayuda?" },
    { verse:"Estad quietos y conoced que yo soy Dios.", ref:"Salmo 46:10", prompt:"Toma 30 segundos antes de desplazarte. Respira." },
    { verse:"Lo que hicisteis a uno de estos pequeños, a mi lo hicisteis.", ref:"Mateo 25:40", prompt:"¿Ese sofa gratis? La bendicion de alguien." },
    { verse:"Deja que tu luz brille ante los demas.", ref:"Mateo 5:16", prompt:"Publica un animo para tu cuadra hoy." },
    { verse:"Llevad las cargas los unos de los otros.", ref:"Galatas 6:2", prompt:"Alguien cerca de ti lleva algo pesado." },
    { verse:"El Señor esta cerca de los quebrantados de corazon.", ref:"Salmo 34:18", prompt:"Visita a un vecino hoy." },
    { verse:"Haz a otros como quieres que te hagan a ti.", ref:"Lucas 6:31", prompt:"¿Que haria Jesus en tu cuadra hoy?" },
  ],
}

function getPromptForRef(ref: string, lang: string): string {
  const prompts: Record<string, Record<string,string>> = {
    en: { "Mark 12:31":"Who on your block can you show love to today?", "James 2:17":"Is there a neighbor nearby who needs a hand?", "Psalm 46:10":"Take 30 seconds before you scroll. Breathe.", "Matthew 25:40":"That free couch? Someone's blessing.", "Matthew 5:16":"Post one encouragement to your block today.", "Galatians 6:2":"Someone near you is carrying something heavy.", "Psalm 34:18":"Check on a neighbor today.", "Luke 6:31":"WWJD on your block today?" },
    es: { "Mark 12:31":"¿A quien puedes mostrar amor hoy?", "James 2:17":"¿Alguien cerca necesita ayuda?", "Psalm 46:10":"Respira 30 segundos.", "Matthew 25:40":"Ese mueble gratis es bendicion.", "Matthew 5:16":"Publica animo hoy.", "Galatians 6:2":"Alguien lleva carga pesada.", "Psalm 34:18":"Visita a un vecino.", "Luke 6:31":"¿Que haria Jesus hoy?" },
  }
  return (prompts[lang] && prompts[lang][ref]) || (prompts.en[ref]) || "Encourage a neighbor today."
}

type VerseData = { verse:string, ref:string, prompt:string, fromBible:boolean }

export default function FaithOfTheDay() {
  const { zip } = useLocation()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const router = useRouter()
  const [today, setToday] = useState<VerseData>({ verse:"", ref:"", prompt:"", fromBible:false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const loadWholeBible = async () => {
      setLoading(true)
      try {
        // Whole Bible random via your API route - now with lang
        const res = await fetch(`/api/faith?lang=${language}`, { next: { revalidate: 3600 } } as any)
        if (res.ok) {
          const data = await res.json()
          const text = data.text || data.verse?.text || data.details?.text || data.original_text
          const ref = data.reference || data.verse?.reference || data.details?.reference || "Psalm 34:18"
          if (text && !cancelled) {
            setToday({
              verse: text,
              ref,
              prompt: getPromptForRef(ref, language),
              fromBible: true
            })
            setLoading(false)
            return
          }
        }
        throw new Error("API fail")
      } catch {
        // Fallback to 8-verse rotation if API down - still translated for major langs
        const fbList = FALLBACK[language] || FALLBACK.en
        const dayIndex = new Date().getDate() % fbList.length
        if (!cancelled) {
          setToday({ ...fbList[dayIndex], fromBible: false })
          setLoading(false)
        }
      }
    }
    loadWholeBible()
    return () => { cancelled = true }
  }, [language])

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
        <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded-full">{today.fromBible ? d.wholeBible : d.live}</span>
      </div>
      {loading ? (
        <div className="text-white/60 text-sm">{d.loading}</div>
      ) : (
        <>
          <div className="text-white font-black text-lg leading-tight">"{today.verse}"</div>
          <div className="text-yellow-400 font-black text-xs mt-2 tracking-widest">{today.ref}</div>
          <div className="mt-4 bg-white/10 rounded-xl p-3 border border-white/10">
            <div className="text-white/60 text-xs font-black tracking-widest mb-1">{d.thought}</div>
            <div className="text-white text-sm font-bold leading-snug">{today.prompt}</div>
          </div>
        </>
      )}
      <div className="mt-4 flex gap-2">
        <button onClick={()=> router.push(`/feed?filter=faith`)} className="flex-1 bg-white text-black text-xs font-black px-3 py-2 rounded-full text-center hover:bg-yellow-400 transition">{d.see}</button>
        <button onClick={()=> { if(typeof navigator!== 'undefined' && navigator.clipboard) { navigator.clipboard.writeText(`"${today.verse}" - ${today.ref} - from Sweet Social Space`) } }} className="bg-white/10 text-white text-xs font-black px-3 py-2 rounded-full border border-white/20">{d.share}</button>
      </div>
    </div>
  )
}
