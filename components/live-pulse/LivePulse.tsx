'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { live:"LIVE", loading:"Loading...", online:"online", noEmerg:"✓ No emergencies", clear:"clear sky" },
  es: { live:"EN VIVO", loading:"Cargando...", online:"en línea", noEmerg:"✓ Sin emergencias", clear:"cielo despejado" },
  fr: { live:"EN DIRECT", loading:"Chargement...", online:"en ligne", noEmerg:"✓ Pas d'urgence", clear:"ciel dégagé" },
  de: { live:"LIVE", loading:"Laden...", online:"online", noEmerg:"✓ Keine Notfälle", clear:"klarer Himmel" },
  zh: { live:"直播", loading:"加载中...", online:"在线", noEmerg:"✓ 无紧急情况", clear:"晴朗" },
  ja: { live:"ライブ", loading:"読み込み中...", online:"オンライン", noEmerg:"✓ 緊急事態なし", clear:"快晴" },
  ko: { live:"라이브", loading:"로딩 중...", online:"온라인", noEmerg:"✓ 긴급 상황 없음", clear:"맑은 하늘" },
  pt: { live:"AO VIVO", loading:"Carregando...", online:"online", noEmerg:"✓ Sem emergências", clear:"céu limpo" },
  ru: { live:"ЛАЙВ", loading:"Загрузка...", online:"онлайн", noEmerg:"✓ Нет ЧС", clear:"ясное небо" },
  ar: { live:"مباشر", loading:"جاري التحميل...", online:"متصل", noEmerg:"✓ لا طوارئ", clear:"سماء صافية" },
  hi: { live:"लाइव", loading:"लोड हो रहा है...", online:"ऑनलाइन", noEmerg:"✓ कोई आपातकाल नहीं", clear:"साफ आसमान" },
  it: { live:"LIVE", loading:"Caricamento...", online:"online", noEmerg:"✓ Nessuna emergenza", clear:"cielo sereno" },
  nl: { live:"LIVE", loading:"Laden...", online:"online", noEmerg:"✓ Geen noodgevallen", clear:"heldere hemel" },
  tl: { live:"LIVE", loading:"Naglo-load...", online:"online", noEmerg:"✓ Walang emergency", clear:"maaliwalas" },
  bn: { live:"লাইভ", loading:"লোড হচ্ছে...", online:"অনলাইন", noEmerg:"✓ কোনো জরুরি অবস্থা নেই", clear:"পরিষ্কার আকাশ" },
  id: { live:"LIVE", loading:"Memuat...", online:"online", noEmerg:"✓ Tidak ada darurat", clear:"langit cerah" },
  vi: { live:"TRỰC TIẾP", loading:"Đang tải...", online:"trực tuyến", noEmerg:"✓ Không có khẩn cấp", clear:"trời quang" },
  th: { live:"สด", loading:"กำลังโหลด...", online:"ออนไลน์", noEmerg:"✓ ไม่มีเหตุฉุกเฉิน", clear:"ท้องฟ้าแจ่มใส" },
  sv: { live:"LIVE", loading:"Laddar...", online:"online", noEmerg:"✓ Inga nödsituationer", clear:"klar himmel" },
  pl: { live:"LIVE", loading:"Ładowanie...", online:"online", noEmerg:"✓ Brak nagłych wypadków", clear:"czyste niebo" },
  tr: { live:"CANLI", loading:"Yükleniyor...", online:"çevrimiçi", noEmerg:"✓ Acil durum yok", clear:"açık gökyüzü" },
  uk: { live:"ЛАЙВ", loading:"Завантаження...", online:"онлайн", noEmerg:"✓ Немає НС", clear:"ясне небо" },
  el: { live:"ΖΩΝΤΑΝΑ", loading:"Φόρτωση...", online:"συνδεδεμένοι", noEmerg:"✓ Καμία έκτακτη ανάγκη", clear:"καθαρός ουρανός" },
  he: { live:"חי", loading:"טוען...", online:"מחוברים", noEmerg:"✓ אין חירום", clear:"שמיים בהירים" },
  ur: { live:"لائیو", loading:"لوڈ ہو رہا ہے...", online:"آن لائن", noEmerg:"✓ کوئی ایمرجنسی نہیں", clear:"صاف آسمان" },
  fa: { live:"زنده", loading:"در حال بارگذاری...", online:"آنلاین", noEmerg:"✓ بدون اضطرار", clear:"آسمان صاف" },
  ms: { live:"LIVE", loading:"Memuatkan...", online:"dalam talian", noEmerg:"✓ Tiada kecemasan", clear:"langit cerah" },
  ro: { live:"LIVE", loading:"Se încarcă...", online:"online", noEmerg:"✓ Nicio urgență", clear:"cer senin" },
  cs: { live:"ŽIVĚ", loading:"Načítání...", online:"online", noEmerg:"✓ Žádné nouzové situace", clear:"jasná obloha" },
  hu: { live:"ÉLŐ", loading:"Betöltés...", online:"online", noEmerg:"✓ Nincs vészhelyzet", clear:"tiszta égbolt" },
  fi: { live:"LIVE", loading:"Ladataan...", online:"paikalla", noEmerg:"✓ Ei hätätilanteita", clear:"kirkas taivas" },
  no: { live:"LIVE", loading:"Laster...", online:"online", noEmerg:"✓ Ingen nødsituasjoner", clear:"klar himmel" },
  da: { live:"LIVE", loading:"Indlæser...", online:"online", noEmerg:"✓ Ingen nødsituationer", clear:"klar himmel" },
  bg: { live:"НА ЖИВО", loading:"Зареждане...", online:"онлайн", noEmerg:"✓ Няма спешни случаи", clear:"ясно небе" },
  hr: { live:"UŽIVO", loading:"Učitavanje...", online:"online", noEmerg:"✓ Nema hitnih slučajeva", clear:"vedro nebo" },
  sr: { live:"УЖИВО", loading:"Учитавање...", online:"онлајн", noEmerg:"✓ Нема хитних случајева", clear:"ведро небо" },
  sk: { live:"NAŽIVO", loading:"Načítanie...", online:"online", noEmerg:"✓ Žiadne núdzové situácie", clear:"jasná obloha" },
  sl: { live:"V ŽIVO", loading:"Nalaganje...", online:"online", noEmerg:"✓ Ni nujnih primerov", clear:"jasno nebo" },
  et: { live:"OTSE", loading:"Laadimine...", online:"võrgus", noEmerg:"✓ Hädaolukordi pole", clear:"selge taevas" },
  lv: { live:"TIEŠRAIDE", loading:"Ielāde...", online:"tiešsaistē", noEmerg:"✓ Nav ārkārtas situāciju", clear:"skaidras debesis" },
  lt: { live:"GYVAI", loading:"Įkeliama...", online:"prisijungę", noEmerg:"✓ Nėra ekstremalių situacijų", clear:"giedras dangus" },
  be: { live:"ЖЫЎЦОМ", loading:"Загрузка...", online:"анлайн", noEmerg:"✓ Няма НС", clear:"яснае неба" },
  ka: { live:"ლაივი", loading:"იტვირთება...", online:"ონლაინ", noEmerg:"✓ საგანგებო სიტუაცია არ არის", clear:"წმინდა ცა" },
  hy: { live:"ՈՒՂԻՂ", loading:"Բեռնում...", online:"առցանց", noEmerg:"✓ Արտակարգ իրավիճակ չկա", clear:"պարզ երկինք" },
  az: { live:"CANLI", loading:"Yüklənir...", online:"onlayn", noEmerg:"✓ Fövqəladə hal yoxdur", clear:"açıq səma" },
  kk: { live:"ТІКЕЛЕЙ", loading:"Жүктелуде...", online:"желіде", noEmerg:"✓ Төтенше жағдай жоқ", clear:"ашық аспан" },
  ky: { live:"ТҮЗ", loading:"Жүктөлүүдө...", online:"тармакта", noEmerg:"✓ Өзгөчө кырдаал жок", clear:"ачык асман" },
  uz: { live:"JONLI", loading:"Yuklanmoqda...", online:"onlayn", noEmerg:"✓ Favqulodda holat yo'q", clear:"ochiq osmon" },
  tg: { live:"ЗИНДА", loading:"Бор карда мешавад...", online:"онлайн", noEmerg:"✓ Ҳолати фавқулодда нест", clear:"осмони соф" },
  mn: { live:"ШУУД", loading:"Ачааллаж байна...", online:"онлайн", noEmerg:"✓ Яаралтай байдал байхгүй", clear:"цэлмэг тэнгэр" },
  km: { live:"ផ្ទាល់", loading:"កំពុងផ្ទុក...", online:"អនឡាញ", noEmerg:"✓ គ្មានអាសន្ន", clear:"មេឃស្រឡះ" },
  lo: { live:"ສົດ", loading:"ກຳລັງໂຫຼດ...", online:"ອອນລາຍ", noEmerg:"✓ ບໍ່ມີສຸກເສີນ", clear:"ທ້ອງຟ້າແຈ່ມໃສ" },
  my: { live:"တိုက်ရိုက်", loading:"တင်နေသည်...", online:"အွန်လိုင်း", noEmerg:"✓ အရေးပေါ် မရှိ", clear:"ကြည်လင်သောကောင်းကင်" },
}

export default function LivePulse() {
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!zip || zip === 'GLOBAL') return
    const load = async () => {
      try{
        const p = await fetch(`/api/pulse?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        const w = await fetch(`/api/weather?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        const e = await fetch(`/api/emergency?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        setData({ pulse: p, weather: w, emergency: e })
      }catch{}
    }
    load()
    const i = setInterval(load, 60000)
    return () => clearInterval(i)
  }, [zip])

  const displayCity = city || data?.weather?.city || data?.weather?.name || data?.pulse?.city || 'your area'
  const tempRaw = data?.weather?.temp?? data?.weather?.main?.temp?? null
  let temp = tempRaw
  if (temp!== null && temp > 150) temp = Math.round((temp - 273.15) * 9/5 + 32)
  const online = data?.pulse?.online?? 2
  const weatherDescRaw = data?.weather?.description || data?.weather?.weather?.[0]?.main || d.clear

  return (
    <div className="bg-black/40 rounded-xl p-3 border border-white/10">
      <div className="flex justify-between items-center">
        <span className="text-purple-300 font-black text-sm tracking-widest">{displayCity}</span>
        <span className="text- bg-white/10 text-white/60 px-2 py-0.5 rounded-full font-black">{d.live}</span>
      </div>
      <div className="text-white text-sm mt-1">
        {temp!== null? `${Math.round(temp)}° ${weatherDescRaw}` : d.loading} • {online} {d.online}
      </div>
      <div className="text-white/60 text-xs mt-1">
        {data?.emergency?.alert? `⚠ ${data.emergency.alert}` : d.noEmerg}
      </div>
    </div>
  )
}
