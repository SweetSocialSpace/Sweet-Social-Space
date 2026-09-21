'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { marketplace:"🛒 Marketplace", loading:"Loading...", near:"Near", live:"Live", highway:"Information Highway: Local + External Sources", scanningData:"Scanning marketplace data...", scanningLocal:"Scanning local deals...", dealsIn:"Local Deals in", local:"Local", available:"Available" },
  es: { marketplace:"🛒 Mercado", loading:"Cargando...", near:"Cerca", live:"En Vivo", highway:"Autopista Información: Fuentes Locales + Externas", scanningData:"Escaneando datos del mercado...", scanningLocal:"Escaneando ofertas locales...", dealsIn:"Ofertas Locales en", local:"Local", available:"Disponible" },
  fr: { marketplace:"🛒 Marché", loading:"Chargement...", near:"Près", live:"Direct", highway:"Autoroute Info: Sources Locales + Externes", scanningData:"Analyse données marché...", scanningLocal:"Analyse offres locales...", dealsIn:"Offres Locales à", local:"Local", available:"Disponible" },
  de: { marketplace:"🛒 Marktplatz", loading:"Laden...", near:"Nahe", live:"Live", highway:"Infobahn: Lokale + Externe Quellen", scanningData:"Marktplatzdaten scannen...", scanningLocal:"Lokale Angebote scannen...", dealsIn:"Lokale Angebote in", local:"Lokal", available:"Verfügbar" },
  zh: { marketplace:"🛒 市场", loading:"加载中...", near:"附近", live:"实时", highway:"信息高速公路：本地+外部来源", scanningData:"扫描市场数据...", scanningLocal:"扫描本地优惠...", dealsIn:"本地优惠", local:"本地", available:"可用" },
  ja: { marketplace:"🛒 マーケットプレイス", loading:"読み込み中...", near:"付近", live:"ライブ", highway:"情報ハイウェイ：ローカル+外部ソース", scanningData:"マーケットデータをスキャン中...", scanningLocal:"ローカルお得情報をスキャン中...", dealsIn:"ローカルお得情報", local:"ローカル", available:"利用可能" },
  ko: { marketplace:"🛒 마켓플레이스", loading:"로드 중...", near:"근처", live:"라이브", highway:"정보 고속도로: 로컬 + 외부 소스", scanningData:"마켓 데이터 스캔 중...", scanningLocal:"로컬 특가 스캔 중...", dealsIn:"로컬 특가", local:"로컬", available:"이용 가능" },
  pt: { marketplace:"🛒 Mercado", loading:"Carregando...", near:"Perto", live:"Ao Vivo", highway:"Rodovia Informação: Fontes Locais + Externas", scanningData:"Escaneando dados do mercado...", scanningLocal:"Escaneando ofertas locais...", dealsIn:"Ofertas Locais em", local:"Local", available:"Disponível" },
  ru: { marketplace:"🛒 Маркетплейс", loading:"Загрузка...", near:"Рядом", live:"Эфир", highway:"Инфо-магистраль: Локальные + Внешние Источники", scanningData:"Сканирование данных маркетплейса...", scanningLocal:"Сканирование локальных сделок...", dealsIn:"Локальные Сделки в", local:"Локально", available:"Доступно" },
  ar: { marketplace:"🛒 السوق", loading:"جاري التحميل...", near:"بالقرب", live:"مباشر", highway:"طريق المعلومات: مصادر محلية + خارجية", scanningData:"مسح بيانات السوق...", scanningLocal:"مسح العروض المحلية...", dealsIn:"عروض محلية في", local:"محلي", available:"متاح" },
  hi: { marketplace:"🛒 मार्केटप्लेस", loading:"लोड हो रहा...", near:"निकट", live:"लाइव", highway:"सूचना हाईवे: स्थानीय + बाहरी स्रोत", scanningData:"मार्केटप्लेस डेटा स्कैन...", scanningLocal:"स्थानीय डील स्कैन...", dealsIn:"स्थानीय डील", local:"स्थानीय", available:"उपलब्ध" },
  it: { marketplace:"🛒 Marketplace", loading:"Caricamento...", near:"Vicino", live:"Live", highway:"Autostrada Info: Fonti Locali + Esterne", scanningData:"Scansione dati marketplace...", scanningLocal:"Scansione offerte locali...", dealsIn:"Offerte Locali a", local:"Locale", available:"Disponibile" },
  nl: { marketplace:"🛒 Marktplaats", loading:"Laden...", near:"Dichtbij", live:"Live", highway:"Informatiesnelweg: Lokale + Externe Bronnen", scanningData:"Marktplaatsdata scannen...", scanningLocal:"Lokale deals scannen...", dealsIn:"Lokale Deals in", local:"Lokaal", available:"Beschikbaar" },
  tl: { marketplace:"🛒 Marketplace", loading:"Naglo-load...", near:"Malapit", live:"Live", highway:"Information Highway: Local + External Sources", scanningData:"Ini-scan marketplace data...", scanningLocal:"Ini-scan local deals...", dealsIn:"Local Deals sa", local:"Local", available:"Available" },
  bn: { marketplace:"🛒 মার্কেটপ্লেস", loading:"লোড হচ্ছে...", near:"কাছে", live:"লাইভ", highway:"তথ্য মহাসড়ক: স্থানীয় + বাহ্যিক উৎস", scanningData:"মার্কেটপ্লেস ডেটা স্ক্যান হচ্ছে...", scanningLocal:"স্থানীয় ডিল স্ক্যান...", dealsIn:"স্থানীয় ডিল", local:"স্থানীয়", available:"উপলব্ধ" },
  id: { marketplace:"🛒 Pasar", loading:"Memuat...", near:"Dekat", live:"Live", highway:"Jalan Tol Informasi: Sumber Lokal + Eksternal", scanningData:"Memindai data marketplace...", scanningLocal:"Memindai penawaran lokal...", dealsIn:"Penawaran Lokal di", local:"Lokal", available:"Tersedia" },
  vi: { marketplace:"🛒 Chợ", loading:"Đang tải...", near:"Gần", live:"Trực tiếp", highway:"Cao tốc Thông tin: Nguồn Địa phương + Bên ngoài", scanningData:"Quét dữ liệu chợ...", scanningLocal:"Quét ưu đãi địa phương...", dealsIn:"Ưu Đãi Địa Phương tại", local:"Địa phương", available:"Có sẵn" },
  th: { marketplace:"🛒 ตลาด", loading:"กำลังโหลด...", near:"ใกล้", live:"ไลฟ์", highway:"ทางด่วนข้อมูล: แหล่งท้องถิ่น + ภายนอก", scanningData:"กำลังสแกนข้อมูลตลาด...", scanningLocal:"กำลังสแกนดีลท้องถิ่น...", dealsIn:"ดีลท้องถิ่นใน", local:"ท้องถิ่น", available:"มีจำหน่าย" },
  sv: { marketplace:"🛒 Marknadsplats", loading:"Laddar...", near:"Nära", live:"Live", highway:"Informationsmotorväg: Lokala + Externa Källor", scanningData:"Skannar marknadsdata...", scanningLocal:"Skannar lokala erbjudanden...", dealsIn:"Lokala Erbjudanden i", local:"Lokal", available:"Tillgänglig" },
  pl: { marketplace:"🛒 Rynek", loading:"Ładowanie...", near:"Blisko", live:"Live", highway:"Autostrada Informacji: Źródła Lokalne + Zewnętrzne", scanningData:"Skanowanie danych rynku...", scanningLocal:"Skanowanie lokalnych okazji...", dealsIn:"Lokalne Okazje w", local:"Lokalnie", available:"Dostępne" },
  tr: { marketplace:"🛒 Pazaryeri", loading:"Yükleniyor...", near:"Yakın", live:"Canlı", highway:"Bilgi Otoyolu: Yerel + Harici Kaynaklar", scanningData:"Pazaryeri verileri taranıyor...", scanningLocal:"Yerel fırsatlar taranıyor...", dealsIn:"Yerel Fırsatlar", local:"Yerel", available:"Mevcut" },
  uk: { marketplace:"🛒 Маркетплейс", loading:"Завантаження...", near:"Поруч", live:"Ефір", highway:"Інфо-магістраль: Локальні + Зовнішні Джерела", scanningData:"Сканування даних маркетплейсу...", scanningLocal:"Сканування локальних угод...", dealsIn:"Локальні Угоди в", local:"Локально", available:"Доступно" },
  el: { marketplace:"🛒 Αγορά", loading:"Φόρτωση...", near:"Κοντά", live:"Ζωντανά", highway:"Λεωφόρος Πληροφοριών: Τοπικές + Εξωτερικές Πηγές", scanningData:"Σάρωση δεδομένων αγοράς...", scanningLocal:"Σάρωση τοπικών προσφορών...", dealsIn:"Τοπικές Προσφορές σε", local:"Τοπικό", available:"Διαθέσιμο" },
  he: { marketplace:"🛒 שוק", loading:"טוען...", near:"ליד", live:"חי", highway:"כביש מידע: מקורות מקומיים + חיצוניים", scanningData:"סורק נתוני שוק...", scanningLocal:"סורק עסקאות מקומיות...", dealsIn:"עסקאות מקומיות ב", local:"מקומי", available:"זמין" },
  ur: { marketplace:"🛒 مارکیٹ پلیس", loading:"لوڈ ہو رہا...", near:"قریب", live:"لائیو", highway:"انفارمیشن ہائی وے: مقامی + بیرونی ذرائع", scanningData:"مارکیٹ پلیس ڈیٹا اسکین...", scanningLocal:"مقامی ڈیلز اسکین...", dealsIn:"مقامی ڈیلز", local:"مقامی", available:"دستیاب" },
  fa: { marketplace:"🛒 بازار", loading:"در حال بارگذاری...", near:"نزدیک", live:"زنده", highway:"بزرگراه اطلاعات: منابع محلی + خارجی", scanningData:"اسکن داده‌های بازار...", scanningLocal:"اسکن معاملات محلی...", dealsIn:"معاملات محلی در", local:"محلی", available:"موجود" },
  ms: { marketplace:"🛒 Pasaran", loading:"Memuatkan...", near:"Dekat", live:"Live", highway:"Lebuh Raya Maklumat: Sumber Tempatan + Luaran", scanningData:"Mengimbas data pasaran...", scanningLocal:"Mengimbas tawaran tempatan...", dealsIn:"Tawaran Tempatan di", local:"Tempatan", available:"Tersedia" },
  ro: { marketplace:"🛒 Piață", loading:"Se încarcă...", near:"Aproape", live:"Live", highway:"Autostradă Info: Surse Locale + Externe", scanningData:"Scanare date piață...", scanningLocal:"Scanare oferte locale...", dealsIn:"Oferte Locale în", local:"Local", available:"Disponibil" },
  cs: { marketplace:"🛒 Tržiště", loading:"Načítání...", near:"Blízko", live:"Živě", highway:"Informační Dálnice: Místní + Externí Zdroje", scanningData:"Skenování dat tržiště...", scanningLocal:"Skenování místních nabídek...", dealsIn:"Místní Nabídky v", local:"Místní", available:"Dostupné" },
  hu: { marketplace:"🛒 Piactér", loading:"Betöltés...", near:"Közel", live:"Élő", highway:"Információs Autópálya: Helyi + Külső Források", scanningData:"Piactér adatok szkennelése...", scanningLocal:"Helyi ajánlatok szkennelése...", dealsIn:"Helyi Ajánlatok", local:"Helyi", available:"Elérhető" },
  fi: { marketplace:"🛒 Markkinapaikka", loading:"Ladataan...", near:"Lähellä", live:"Live", highway:"Tiedon Valtatie: Paikalliset + Ulkoiset Lähteet", scanningData:"Markkinapaikkadatan skannaus...", scanningLocal:"Paikallisten tarjousten skannaus...", dealsIn:"Paikalliset Tarjoukset", local:"Paikallinen", available:"Saatavilla" },
  no: { marketplace:"🛒 Markedsplass", loading:"Laster...", near:"Nær", live:"Live", highway:"Informasjonsmotorvei: Lokale + Eksterne Kilder", scanningData:"Skanner markedsdata...", scanningLocal:"Skanner lokale tilbud...", dealsIn:"Lokale Tilbud i", local:"Lokalt", available:"Tilgjengelig" },
  da: { marketplace:"🛒 Markedsplads", loading:"Indlæser...", near:"Nær", live:"Live", highway:"Informationsmotorvej: Lokale + Eksterne Kilder", scanningData:"Scanner markedsdata...", scanningLocal:"Scanner lokale tilbud...", dealsIn:"Lokale Tilbud i", local:"Lokalt", available:"Tilgængelig" },
  bg: { marketplace:"🛒 Пазар", loading:"Зареждане...", near:"Близо", live:"На Живо", highway:"Информационна Магистрала: Местни + Външни Източници", scanningData:"Сканиране данни пазар...", scanningLocal:"Сканиране местни оферти...", dealsIn:"Местни Оферти в", local:"Местно", available:"Налично" },
  hr: { marketplace:"🛒 Tržnica", loading:"Učitavanje...", near:"Blizu", live:"Uživo", highway:"Informacijska Autocesta: Lokalni + Vanjski Izvori", scanningData:"Skeniranje podataka tržnice...", scanningLocal:"Skeniranje lokalnih ponuda...", dealsIn:"Lokalne Ponude u", local:"Lokalno", available:"Dostupno" },
  sr: { marketplace:"🛒 Пијаца", loading:"Учитавање...", near:"Близу", live:"Уживо", highway:"Информациони Аутопут: Локални + Спољни Извори", scanningData:"Скенирање података пијаце...", scanningLocal:"Скенирање локалних понуда...", dealsIn:"Локалне Понуде у", local:"Локално", available:"Доступно" },
  sk: { marketplace:"🛒 Trhovisko", loading:"Načítanie...", near:"Blízko", live:"Naživo", highway:"Informačná Diaľnica: Miestne + Externé Zdroje", scanningData:"Skenovanie údajov trhoviska...", scanningLocal:"Skenovanie miestnych ponúk...", dealsIn:"Miestne Ponuky v", local:"Miestne", available:"Dostupné" },
  sl: { marketplace:"🛒 Tržnica", loading:"Nalaganje...", near:"Blizu", live:"V Živo", highway:"Informacijska Avtocesta: Lokalni + Zunanji Viri", scanningData:"Skeniranje podatkov tržnice...", scanningLocal:"Skeniranje lokalnih ponudb...", dealsIn:"Lokalne Ponudbe v", local:"Lokalno", available:"Na voljo" },
  et: { marketplace:"🛒 Turg", loading:"Laadimine...", near:"Lähedal", live:"Otse", highway:"Infokiirtee: Kohalikud + Välised Allikad", scanningData:"Turup Andmete skaneerimine...", scanningLocal:"Kohalike pakkumiste skaneerimine...", dealsIn:"Kohalikud Pakkumised", local:"Kohalik", available:"Saadaval" },
  lv: { marketplace:"🛒 Tirgus", loading:"Ielādē...", near:"Tuvu", live:"Tiešraide", highway:"Informācijas Lielceļš: Vietējie + Ārējie Avoti", scanningData:"Tirgus datu skenēšana...", scanningLocal:"Vietējo piedāvājumu skenēšana...", dealsIn:"Vietējie Piedāvājumi", local:"Vietējais", available:"Pieejams" },
  lt: { marketplace:"🛒 Turgus", loading:"Įkeliama...", near:"Šalia", live:"Tiesiogiai", highway:"Informacijos Greitkelis: Vietiniai + Išoriniai Šaltiniai", scanningData:"Turgavietės duomenų nuskaitymas...", scanningLocal:"Vietinių pasiūlymų nuskaitymas...", dealsIn:"Vietiniai Pasiūlymai", local:"Vietinis", available:"Prieinama" },
  be: { marketplace:"🛒 Маркетплейс", loading:"Загрузка...", near:"Побач", live:"Эфір", highway:"Інфамагістраль: Лакальныя + Знешнія Крыніцы", scanningData:"Сканаванне даных маркетплейса...", scanningLocal:"Сканаванне лакальных прапаноў...", dealsIn:"Лакальныя Прапановы ў", local:"Лакальна", available:"Даступна" },
  ka: { marketplace:"🛒 მარკეტპლეისი", loading:"იტვირთება...", near:"ახლოს", live:"ლაივი", highway:"ინფორმაციის მაგისტრალი: ლოკალური + გარე წყაროები", scanningData:"მარკეტპლეისის მონაცემების სკანირება...", scanningLocal:"ლოკალური შეთავაზებების სკანირება...", dealsIn:"ლოკალური შეთავაზებები", local:"ლოკალური", available:"ხელმისაწვდომი" },
  hy: { marketplace:"🛒 Շուկա", loading:"Բեռնում...", near:"Մոտ", live:"Ուղիղ", highway:"Տեղեկատվական Մայրուղի: Տեղական + Արտաքին Աղբյուրներ", scanningData:"Շուկայի տվյալների սկանավորում...", scanningLocal:"Տեղական գործարքների սկանավորում...", dealsIn:"Տեղական Գործարքներ", local:"Տեղական", available:"Հասանելի" },
  az: { marketplace:"🛒 Bazar", loading:"Yüklənir...", near:"Yaxın", live:"Canlı", highway:"Məlumat Magistralı: Yerli + Xarici Mənbələr", scanningData:"Bazar məlumatları skan edilir...", scanningLocal:"Yerli təkliflər skan edilir...", dealsIn:"Yerli Təkliflər", local:"Yerli", available:"Mövcuddur" },
  kk: { marketplace:"🛒 Маркетплейс", loading:"Жүктелуде...", near:"Жақын", live:"Тікелей", highway:"Ақпарат Магистралі: Жергілікті + Сыртқы Көздер", scanningData:"Маркетплейс деректерін сканерлеу...", scanningLocal:"Жергілікті ұсыныстарды сканерлеу...", dealsIn:"Жергілікті Ұсыныстар", local:"Жергілікті", available:"Қолжетімді" },
  ky: { marketplace:"🛒 Базар", loading:"Жүктөлүүдө...", near:"Жакын", live:"Түз", highway:"Маалымат Магистралы: Жергиликтүү + Тышкы Булактар", scanningData:"Базар маалыматтарын сканерлөө...", scanningLocal:"Жергиликтүү сунуштарды сканерлөө...", dealsIn:"Жергиликтүү Сунуштар", local:"Жергиликтүү", available:"Жеткиликтүү" },
  uz: { marketplace:"🛒 Bozor", loading:"Yuklanmoqda...", near:"Yaqin", live:"Jonli", highway:"Axborot Magistrali: Mahalliy + Tashqi Manbalar", scanningData:"Bozor ma'lumotlarini skanerlash...", scanningLocal:"Mahalliy takliflarni skanerlash...", dealsIn:"Mahalliy Takliflar", local:"Mahalliy", available:"Mavjud" },
  tg: { marketplace:"🛒 Бозор", loading:"Боркунӣ...", near:"Наздик", live:"Зинда", highway:"Шоҳроҳи Иттилоот: Манбаъҳои Маҳаллӣ + Берунӣ", scanningData:"Сканкунии маълумоти бозор...", scanningLocal:"Сканкунии пешниҳодҳои маҳаллӣ...", dealsIn:"Пешниҳодҳои Маҳаллӣ дар", local:"Маҳаллӣ", available:"Дастрас" },
  mn: { marketplace:"🛒 Зах зээл", loading:"Ачаалж байна...", near:"Ойр", live:"Шууд", highway:"Мэдээллийн Хурдны Зам: Орон Нутгийн + Гадаад Эх Сурвалж", scanningData:"Зах зээлийн өгөгдөл сканнердаж байна...", scanningLocal:"Орон нутгийн саналыг сканнердаж байна...", dealsIn:"Орон Нутгийн Санал", local:"Орон нутгийн", available:"Боломжтой" },
  km: { marketplace:"🛒 ទីផ្សារ", loading:"កំពុងផ្ទុក...", near:"ជិត", live:"ផ្ទាល់", highway:"ផ្លូវហាយវេព័ត៌មាន: ប្រភពក្នុងស្រុក + ខាងក្រៅ", scanningData:"ស្កេនទិន្នន័យទីផ្សារ...", scanningLocal:"ស្កេនកិច្ចព្រមព្រៀងក្នុងស្រុក...", dealsIn:"កិច្ចព្រមព្រៀងក្នុងស្រុកនៅ", local:"ក្នុងស្រុក", available:"មាន" },
  lo: { marketplace:"🛒 ຕະຫຼາດ", loading:"ກຳລັງໂຫຼດ...", near:"ໃກ້", live:"ສົດ", highway:"ທາງດ່ວນຂໍ້ມູນ: ແຫຼ່ງທ້ອງຖິ່ນ + ພາຍນອກ", scanningData:"ກຳລັງສະແກນຂໍ້ມູນຕະຫຼາດ...", scanningLocal:"ກຳລັງສະແກນດີລທ້ອງຖິ່ນ...", dealsIn:"ດີລທ້ອງຖິ່ນໃນ", local:"ທ້ອງຖິ່ນ", available:"ມີ" },
  my: { marketplace:"🛒 ဈေးကွက်", loading:"တင်နေသည်...", near:"အနီး", live:"တိုက်ရိုက်", highway:"သတင်းအချက်အလက်အမြန်လမ်း: ဒေသခံ + ပြင်ပရင်းမြစ်များ", scanningData:"ဈေးကွက်ဒေတာစကင်န်ဖတ်နေသည်...", scanningLocal:"ဒေသခံအပေးအယူများစကင်န်ဖတ်နေသည်...", dealsIn:"ဒေသခံအပေးအယူများ", local:"ဒေသခံ", available:"ရနိုင်သည်" },
}

type Item = { id: string; title: string; source?: string; sale_date?: string }

export function MarketplacePreview(){
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (!zip) return
    let mounted = true

    const load = async()=>{
      try {
        setLoading(true)
        const res = await fetch(`/api/marketplace?zip=${encodeURIComponent(zip)}&city=${encodeURIComponent(city || '')}`)
        if (res.ok) {
          const data = await res.json()
          if(mounted) {
            setItems(data.items || [])
            setLoading(false)
          }
        }
      } catch (e) {
        console.log('Marketplace error:', e)
        if(mounted) {
          setItems([
            { id: 'fallback-1', title: `${d.dealsIn} ${city || zip}`, source: d.local, sale_date: d.available },
          ])
          setLoading(false)
        }
      }
    }

    load()
    const id = setInterval(()=>{ try { load() } catch {} }, 10*60*1000)
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[zip, city])

  if (!zip) return (<div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">{d.marketplace} • {d.loading}</p></div>)

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">{d.marketplace} • {d.near} {zip} • {d.live}</p>
      <p className="text-xs text-white/50 mt-1">{d.highway}</p>
      {loading? <p className="text-sm mt-3 text-white/60">{d.scanningData}</p> :
      items.length===0? <p className="text-sm mt-3 text-white/60">{d.scanningLocal}</p> :
      (<div className="mt-3 space-y-3">{items.map(i=>(<div key={i.id} className="bg-white/5 rounded-xl p-3"><div className="font-semibold truncate pr-2 text-xs">{i.title}</div><div className="flex gap-2 mt-1"><p className="text-xs text-white/50">{i.source}</p>{i.sale_date && <p className="text-xs text-white/40">• {i.sale_date}</p>}</div></div>))}</div>)}
    </div>
  )
}
export default MarketplacePreview
