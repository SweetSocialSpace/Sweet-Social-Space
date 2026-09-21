'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { title:"The Drop • 10AM", live:"LIVE", loading:"Loading today's drop...", from:"From:", claim:"Claim →", noDrop:"No drop yet today - Be first to sponsor tomorrow's drop!", sponsor:"Sponsor Tomorrow — $25" },
  es: { title:"El Drop • 10AM", live:"EN VIVO", loading:"Cargando el drop de hoy...", from:"De:", claim:"Reclamar →", noDrop:"Aún no hay drop hoy - ¡Sé el primero en patrocinar el de mañana!", sponsor:"Patrocinar Mañana — $25" },
  fr: { title:"Le Drop • 10H", live:"EN DIRECT", loading:"Chargement du drop du jour...", from:"De:", claim:"Réclamer →", noDrop:"Pas encore de drop aujourd'hui - Soyez le premier à sponsoriser celui de demain!", sponsor:"Sponsoriser Demain — $25" },
  de: { title:"Der Drop • 10Uhr", live:"LIVE", loading:"Heutiger Drop wird geladen...", from:"Von:", claim:"Einlösen →", noDrop:"Heute noch kein Drop - Sei der Erste, der den morgigen sponsert!", sponsor:"Morgen sponsern — $25" },
  zh: { title:"投放 • 上午10点", live:"直播", loading:"正在加载今日投放...", from:"来自:", claim:"领取 →", noDrop:"今天还没有投放 - 成为第一个赞助明天投放的人！", sponsor:"赞助明天 — $25" },
  ja: { title:"ドロップ • 午前10時", live:"ライブ", loading:"今日のドロップを読み込み中...", from:"提供:", claim:"請求 →", noDrop:"今日のドロップはまだありません - 明日のドロップを最初にスポンサーしよう！", sponsor:"明日をスポンサー — $25" },
  ko: { title:"드롭 • 오전 10시", live:"라이브", loading:"오늘의 드롭 로딩 중...", from:"제공:", claim:"받기 →", noDrop:"오늘 드롭이 아직 없습니다 - 내일 드롭을 첫 번째로 후원하세요!", sponsor:"내일 후원 — $25" },
  pt: { title:"O Drop • 10H", live:"AO VIVO", loading:"Carregando drop de hoje...", from:"De:", claim:"Resgatar →", noDrop:"Ainda sem drop hoje - Seja o primeiro a patrocinar o de amanhã!", sponsor:"Patrocinar Amanhã — $25" },
  ru: { title:"Дроп • 10:00", live:"ЛАЙВ", loading:"Загрузка сегодняшнего дропа...", from:"От:", claim:"Получить →", noDrop:"Сегодня пока нет дропа - Стань первым спонсором завтрашнего!", sponsor:"Спонсировать Завтра — $25" },
  ar: { title:"الإسقاط • 10ص", live:"مباشر", loading:"جاري تحميل إسقاط اليوم...", from:"من:", claim:"استلام →", noDrop:"لا يوجد إسقاط اليوم بعد - كن أول من يرعى إسقاط الغد!", sponsor:"رعاية الغد — $25" },
  hi: { title:"द ड्रॉप • सुबह 10 बजे", live:"लाइव", loading:"आज का ड्रॉप लोड हो रहा है...", from:"से:", claim:"क्लेम करें →", noDrop:"आज अभी तक कोई ड्रॉप नहीं - कल के ड्रॉप को स्पॉन्सर करने वाले पहले बनें!", sponsor:"कल स्पॉन्सर करें — $25" },
  it: { title:"Il Drop • 10AM", live:"LIVE", loading:"Caricamento drop di oggi...", from:"Da:", claim:"Riscatta →", noDrop:"Nessun drop oggi - Sii il primo a sponsorizzare quello di domani!", sponsor:"Sponsorizza Domani — $25" },
  nl: { title:"De Drop • 10U", live:"LIVE", loading:"Drop van vandaag laden...", from:"Van:", claim:"Claimen →", noDrop:"Nog geen drop vandaag - Wees de eerste om die van morgen te sponsoren!", sponsor:"Sponsor Morgen — $25" },
  tl: { title:"The Drop • 10AM", live:"LIVE", loading:"Naglo-load ng drop ngayon...", from:"Mula sa:", claim:"I-claim →", noDrop:"Wala pang drop ngayon - Mauna ka mag-sponsor bukas!", sponsor:"I-sponsor Bukas — $25" },
  bn: { title:"দ্য ড্রপ • সকাল ১০টা", live:"লাইভ", loading:"আজকের ড্রপ লোড হচ্ছে...", from:"থেকে:", claim:"দাবি করুন →", noDrop:"আজ এখনো কোনো ড্রপ নেই - কালকের ড্রপ স্পনসর করতে প্রথম হন!", sponsor:"কাল স্পনসর করুন — $25" },
  id: { title:"The Drop • 10AM", live:"LIVE", loading:"Memuat drop hari ini...", from:"Dari:", claim:"Klaim →", noDrop:"Belum ada drop hari ini - Jadilah yang pertama mensponsori besok!", sponsor:"Sponsori Besok — $25" },
  vi: { title:"The Drop • 10AM", live:"TRỰC TIẾP", loading:"Đang tải drop hôm nay...", from:"Từ:", claim:"Nhận →", noDrop:"Chưa có drop hôm nay - Hãy là người đầu tiên tài trợ ngày mai!", sponsor:"Tài trợ Ngày Mai — $25" },
  th: { title:"เดอะดรอป • 10โมง", live:"สด", loading:"กำลังโหลดดรอปวันนี้...", from:"จาก:", claim:"รับ →", noDrop:"ยังไม่มีดรอปวันนี้ - เป็นคนแรกที่สปอนเซอร์ดรอปพรุ่งนี้!", sponsor:"สปอนเซอร์พรุ่งนี้ — $25" },
  sv: { title:"The Drop • 10AM", live:"LIVE", loading:"Laddar dagens drop...", from:"Från:", claim:"Hämta →", noDrop:"Ingen drop idag än - Bli först att sponsra morgondagens!", sponsor:"Sponsra Imorgon — $25" },
  pl: { title:"The Drop • 10:00", live:"LIVE", loading:"Ładowanie dzisiejszego dropu...", from:"Od:", claim:"Odbierz →", noDrop:"Dziś jeszcze brak dropu - Bądź pierwszy, sponsoruj jutrzejszy!", sponsor:"Sponsoruj Jutro — $25" },
  tr: { title:"The Drop • 10AM", live:"CANLI", loading:"Bugünkü drop yükleniyor...", from:"Kimden:", claim:"Al →", noDrop:"Bugün henüz drop yok - Yarınki dropa ilk sponsor ol!", sponsor:"Yarını Sponsor Ol — $25" },
  uk: { title:"Дроп • 10:00", live:"ЛАЙВ", loading:"Завантаження сьогоднішнього дропу...", from:"Від:", claim:"Отримати →", noDrop:"Сьогодні ще немає дропу - Стань першим спонсором завтрашнього!", sponsor:"Спонсорувати Завтра — $25" },
  el: { title:"The Drop • 10ΠΜ", live:"ΖΩΝΤΑΝΑ", loading:"Φόρτωση σημερινού drop...", from:"Από:", claim:"Διεκδίκηση →", noDrop:"Κανένα drop σήμερα ακόμα - Γίνε ο πρώτος που θα χορηγήσει το αυριανό!", sponsor:"Χορήγησε Αύριο — $25" },
  he: { title:"הדרופ • 10AM", live:"חי", loading:"טוען את הדרופ של היום...", from:"מאת:", claim:"ממש →", noDrop:"אין דרופ היום עדיין - היה הראשון לממן את של מחר!", sponsor:"ממן את המחר — $25" },
  ur: { title:"دی ڈراپ • صبح 10 بجے", live:"لائیو", loading:"آج کا ڈراپ لوڈ ہو رہا ہے...", from:"منجانب:", claim:"کلیم کریں →", noDrop:"آج ابھی تک کوئی ڈراپ نہیں - کل کے ڈراپ کو اسپانسر کرنے والے پہلے بنیں!", sponsor:"کل اسپانسر کریں — $25" },
  fa: { title:"دراپ • ۱۰ صبح", live:"زنده", loading:"در حال بارگذاری دراپ امروز...", from:"از:", claim:"دریافت →", noDrop:"هنوز دراپی امروز نیست - اولین حامی دراپ فردا باشید!", sponsor:"حمایت از فردا — $25" },
  ms: { title:"The Drop • 10AM", live:"LIVE", loading:"Memuatkan drop hari ini...", from:"Dari:", claim:"Tuntut →", noDrop:"Belum ada drop hari ini - Jadilah yang pertama menaja esok!", sponsor:"Taja Esok — $25" },
  ro: { title:"The Drop • 10AM", live:"LIVE", loading:"Se încarcă drop-ul de azi...", from:"De la:", claim:"Revendică →", noDrop:"Niciun drop azi încă - Fii primul care sponsorizează drop-ul de mâine!", sponsor:"Sponsorizează Mâine — $25" },
  cs: { title:"The Drop • 10:00", live:"ŽIVĚ", loading:"Načítání dnešního dropu...", from:"Od:", claim:"Uplatnit →", noDrop:"Dnes zatím žádný drop - Buď první, kdo zasponzoruje zítřejší!", sponsor:"Sponzorovat Zítra — $25" },
  hu: { title:"The Drop • 10:00", live:"ÉLŐ", loading:"Mai drop betöltése...", from:"Tőle:", claim:"Beváltás →", noDrop:"Ma még nincs drop - Légy az első, aki szponzorálja a holnapit!", sponsor:"Holnap szponzorálása — $25" },
  fi: { title:"The Drop • 10AM", live:"LIVE", loading:"Ladataan päivän droppia...", from:"Lähde:", claim:"Lunasta →", noDrop:"Ei droppia vielä tänään - Ole ensimmäinen, joka sponsoroi huomisen!", sponsor:"Sponsoroi Huomenna — $25" },
  no: { title:"The Drop • 10AM", live:"LIVE", loading:"Laster dagens drop...", from:"Fra:", claim:"Krev →", noDrop:"Ingen drop i dag ennå - Bli den første til å sponse morgendagens!", sponsor:"Spons morgendagen — $25" },
  da: { title:"The Drop • 10AM", live:"LIVE", loading:"Indlæser dagens drop...", from:"Fra:", claim:"Gør krav →", noDrop:"Ingen drop endnu i dag - Vær den første til at sponsorere morgendagens!", sponsor:"Sponsorér I Morgen — $25" },
  bg: { title:"The Drop • 10:00", live:"НА ЖИВО", loading:"Зареждане на днешния drop...", from:"От:", claim:"Вземи →", noDrop:"Днес още няма drop - Бъди първият спонсор на утрешния!", sponsor:"Спонсорирай Утре — $25" },
  hr: { title:"The Drop • 10AM", live:"UŽIVO", loading:"Učitavanje današnjeg dropa...", from:"Od:", claim:"Preuzmi →", noDrop:"Još nema dropa danas - Budi prvi koji će sponzorirati sutrašnji!", sponsor:"Sponzoriraj Sutra — $25" },
  sr: { title:"The Drop • 10AM", live:"УЖИВО", loading:"Учитавање данашњег дропа...", from:"Од:", claim:"Преузми →", noDrop:"Још нема дропа данас - Буди први који ће спонзорисати сутрашњи!", sponsor:"Спонзориши Сутра — $25" },
  sk: { title:"The Drop • 10:00", live:"NAŽIVO", loading:"Načítanie dnešného dropu...", from:"Od:", claim:"Uplatniť →", noDrop:"Dnes zatiaľ žiadny drop - Buď prvý, kto zasponzoruje zajtrajší!", sponsor:"Sponzorovať Zajtra — $25" },
  sl: { title:"The Drop • 10AM", live:"V ŽIVO", loading:"Nalaganje današnjega dropa...", from:"Od:", claim:"Uveljavi →", noDrop:"Danes še ni dropa - Bodi prvi, ki bo sponzoriral jutrišnjega!", sponsor:"Sponzoriraj Jutri — $25" },
  et: { title:"The Drop • 10AM", live:"OTSE", loading:"Tänase dropi laadimine...", from:"Kellelt:", claim:"Nõua →", noDrop:"Täna veel pole dropi - Ole esimene, kes sponsoreerib homset!", sponsor:"Sponsoreeri Homme — $25" },
  lv: { title:"The Drop • 10AM", live:"TIEŠRAIDE", loading:"Ielādē šodienas dropu...", from:"No:", claim:"Pieprasīt →", noDrop:"Šodien vēl nav dropa - Kļūsti par pirmo, kas sponsorē rītdienas!", sponsor:"Sponsorēt Rītdienu — $25" },
  lt: { title:"The Drop • 10AM", live:"GYVAI", loading:"Įkeliamas šiandienos dropas...", from:"Nuo:", claim:"Pasiimti →", noDrop:"Šiandien dar nėra drop - Būk pirmas, kuris rems rytojaus!", sponsor:"Remti Rytojų — $25" },
  be: { title:"The Drop • 10:00", live:"ЖЫЎЦОМ", loading:"Загрузка сённяшняга дропа...", from:"Ад:", claim:"Атрымаць →", noDrop:"Сёння яшчэ няма дропа - Стань першым спонсарам заўтрашняга!", sponsor:"Спансаваць Заўтра — $25" },
  ka: { title:"The Drop • 10AM", live:"ლაივი", loading:"დღევანდელი დროპის ჩატვირთვა...", from:"-დან:", claim:"მოთხოვნა →", noDrop:"დღეს ჯერ არ არის დროპი - იყავი პირველი, ვინც ხვალინდელს დააფინანსებს!", sponsor:"ხვალინდელის დაფინანსება — $25" },
  hy: { title:"The Drop • 10AM", live:"ՈՒՂԻՂ", loading:"Այսօրվա դրոպի բեռնում...", from:"-ից:", claim:"Ստանալ →", noDrop:"Այսօր դեռ դրոպ չկա - Եղիր առաջինը, ով կհովանավորի վաղվանը:", sponsor:"Հովանավորել Վաղը — $25" },
  az: { title:"The Drop • 10AM", live:"CANLI", loading:"Bugünkü drop yüklənir...", from:"Kimdən:", claim:"Al →", noDrop:"Bu gün hələ drop yoxdur - Sabahki dropun ilk sponsoru ol!", sponsor:"Sabahı Sponsor Et — $25" },
  kk: { title:"The Drop • 10AM", live:"ТІКЕЛЕЙ", loading:"Бүгінгі дроп жүктелуде...", from:"Кімнен:", claim:"Алу →", noDrop:"Бүгін әлі дроп жоқ - Ертеңгі дроптың алғашқы демеушісі бол!", sponsor:"Ертеңді Демеу — $25" },
  ky: { title:"The Drop • 10AM", live:"ТҮЗ", loading:"Бүгүнкү дроп жүктөлүүдө...", from:"Кимден:", claim:"Алуу →", noDrop:"Бүгүн азырынча дроп жок - Эртеңки дроптун биринчи демөөрчүсү бол!", sponsor:"Эртеңкини Демөөр — $25" },
  uz: { title:"The Drop • 10AM", live:"JONLI", loading:"Bugungi drop yuklanmoqda...", from:"Kimdan:", claim:"Olish →", noDrop:"Bugun hali drop yo'q - Ertangi dropning birinchi homiysi bo'l!", sponsor:"Ertangi Homiy — $25" },
  tg: { title:"The Drop • 10AM", live:"ЗИНДА", loading:"Дропи имрӯза бор карда мешавад...", from:"Аз:", claim:"Гирифтан →", noDrop:"Имрӯз ҳанӯз дроп нест - Аввалин сарпарасти дропи фардо шавед!", sponsor:"Фардо Сарпарастӣ — $25" },
  mn: { title:"The Drop • 10AM", live:"ШУУД", loading:"Өнөөдрийн дроп ачааллаж байна...", from:"-с:", claim:"Авах →", noDrop:"Өнөөдөр дроп алга - Маргаашийн дропыг анх удаа ивээн тэтгэ!", sponsor:"Маргаашийг Ивээн Тэтгэ — $25" },
  km: { title:"The Drop • 10ព្រឹក", live:"ផ្ទាល់", loading:"កំពុងផ្ទុក drop ថ្ងៃនេះ...", from:"ពី:", claim:"ទាមទារ →", noDrop:"ថ្ងៃនេះមិនទាន់មាន drop - ក្លាយជាអ្នកឧបត្ថម្ភដំបូងសម្រាប់ថ្ងៃស្អែក!", sponsor:"ឧបត្ថម្ភថ្ងៃស្អែក — $25" },
  lo: { title:"The Drop • 10AM", live:"ສົດ", loading:"ກຳລັງໂຫຼດ drop ມື້ນີ້...", from:"ຈາກ:", claim:"ຮັບ →", noDrop:"ມື້ນີ້ຍັງບໍ່ມີ drop - ເປັນຄົນທໍາອິດທີ່ສະໜັບສະໜູນ drop ມື້ອື່ນ!", sponsor:"ສະໜັບສະໜູນມື້ອື່ນ — $25" },
  my: { title:"The Drop • မနက် ၁၀ နာရီ", live:"တိုက်ရိုက်", loading:"ယနေ့၏ drop တင်နေသည်...", from:"မှ:", claim:"တောင်းရန် →", noDrop:"ယနေ့ drop မရှိသေး - မနက်ဖြန်၏ drop ကို ပထမဆုံး စပွန်ဆာလုပ်ပါ!", sponsor:"မနက်ဖြန် စပွန်ဆာ — $25" },
}

export default function TheDrop() {
  const { zip } = useLocation()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [drop, setDrop] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!zip || zip === 'GLOBAL') { setLoading(false); return }
    const fetchDrop = async () => {
      try {
        const res = await fetch(`/api/drop?zip=${encodeURIComponent(zip)}`)
        const json = await res.json()
        setDrop(json.drop)
      } finally { setLoading(false) }
    }
    fetchDrop()
    const id = setInterval(fetchDrop, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [zip])

  if (!zip || zip === 'GLOBAL') return null

  return (
    <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-black text-sm tracking-wider">{d.title}</h3>
        <span className="bg-white text-black text-xs font-black px-2 py-1 rounded-full">{d.live}</span>
      </div>
      {loading? (
        <p className="text-white/50 text-sm">{d.loading}</p>
      ) : drop? (
        <>
          <p className="text-white font-bold text-base leading-tight">{drop.title}</p>
          <p className="text-white/70 text-sm">{drop.description}</p>
          {drop.business_name && <p className="text-white/40 text-xs">{d.from} {drop.business_name}</p>}
          {drop.claim_url && (
            <a href={drop.claim_url} target="_blank" className="block w-full bg-white text-black text-center py-3 rounded-xl font-black text-sm hover:bg-white/90">{d.claim}</a>
          )}
        </>
      ) : (
        <>
          <p className="text-white/60 text-sm">{d.noDrop}</p>
          <button className="w-full bg-white/10 border border-white/10 text-white py-3 rounded-xl font-bold text-sm">{d.sponsor}</button>
        </>
      )}
    </div>
  )
}
