'use client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { near:"NEAR:", locating:"Locating...", setLoc:"Set location", mi:"mi" },
  es: { near:"CERCA:", locating:"Ubicando...", setLoc:"Establecer ubicación", mi:"mi" },
  fr: { near:"PRÈS:", locating:"Localisation...", setLoc:"Définir lieu", mi:"mi" },
  de: { near:"NAHE:", locating:"Ortung...", setLoc:"Ort festlegen", mi:"mi" },
  zh: { near:"附近:", locating:"定位中...", setLoc:"设置位置", mi:"英里" },
  ja: { near:"付近:", locating:"測位中...", setLoc:"位置を設定", mi:"マイル" },
  ko: { near:"근처:", locating:"위치 찾는 중...", setLoc:"위치 설정", mi:"마일" },
  pt: { near:"PERTO:", locating:"Localizando...", setLoc:"Definir local", mi:"mi" },
  ru: { near:"РЯДОМ:", locating:"Определение...", setLoc:"Указать место", mi:"ми" },
  ar: { near:"بالقرب:", locating:"جاري تحديد...", setLoc:"حدد الموقع", mi:"ميل" },
  hi: { near:"निकट:", locating:"पता लगा रहा...", setLoc:"स्थान सेट करें", mi:"मील" },
  it: { near:"VICINO:", locating:"Localizzazione...", setLoc:"Imposta posizione", mi:"mi" },
  nl: { near:"DICHTBIJ:", locating:"Lokaliseren...", setLoc:"Locatie instellen", mi:"mi" },
  tl: { near:"MALAPIT:", locating:"Hinahanap...", setLoc:"Itakda lokasyon", mi:"mi" },
  bn: { near:"কাছে:", locating:"অবস্থান নির্ণয়...", setLoc:"অবস্থান সেট করুন", mi:"মাইল" },
  id: { near:"DEKAT:", locating:"Mencari...", setLoc:"Atur lokasi", mi:"mi" },
  vi: { near:"GẦN:", locating:"Đang định vị...", setLoc:"Đặt vị trí", mi:"dặm" },
  th: { near:"ใกล้:", locating:"กำลังระบุตำแหน่ง...", setLoc:"ตั้งค่าตำแหน่ง", mi:"ไมล์" },
  sv: { near:"NÄRA:", locating:"Lokaliserar...", setLoc:"Ställ in plats", mi:"mi" },
  pl: { near:"BLISKO:", locating:"Lokalizowanie...", setLoc:"Ustaw lokalizację", mi:"mi" },
  tr: { near:"YAKIN:", locating:"Konum bulunuyor...", setLoc:"Konum ayarla", mi:"mi" },
  uk: { near:"ПОРУЧ:", locating:"Визначення...", setLoc:"Вказати місце", mi:"ми" },
  el: { near:"ΚΟΝΤΑ:", locating:"Εντοπισμός...", setLoc:"Ορισμός τοποθεσίας", mi:"μίλι" },
  he: { near:"ליד:", locating:"מאתר...", setLoc:"הגדר מיקום", mi:"מייל" },
  ur: { near:"قریب:", locating:"تلاش جاری...", setLoc:"مقام سیٹ کریں", mi:"میل" },
  fa: { near:"نزدیک:", locating:"در حال یافتن...", setLoc:"تنظیم مکان", mi:"مایل" },
  ms: { near:"DEKAT:", locating:"Mengesan...", setLoc:"Tetapkan lokasi", mi:"bt" },
  ro: { near:"APROAPE:", locating:"Localizare...", setLoc:"Setează locația", mi:"mi" },
  cs: { near:"BLÍZKO:", locating:"Vyhledávání...", setLoc:"Nastavit polohu", mi:"mi" },
  hu: { near:"KÖZEL:", locating:"Helymeghatározás...", setLoc:"Hely beállítása", mi:"mi" },
  fi: { near:"LÄHELLÄ:", locating:"Paikannetaan...", setLoc:"Aseta sijainti", mi:"mi" },
  no: { near:"NÆR:", locating:"Lokaliserer...", setLoc:"Angi posisjon", mi:"mi" },
  da: { near:"NÆR:", locating:"Lokaliserer...", setLoc:"Angiv placering", mi:"mi" },
  bg: { near:"БЛИЗО:", locating:"Локализиране...", setLoc:"Задай местоположение", mi:"ми" },
  hr: { near:"BLIZU:", locating:"Lociranje...", setLoc:"Postavi lokaciju", mi:"mi" },
  sr: { near:"БЛИЗУ:", locating:"Лоцирање...", setLoc:"Постави локацију", mi:"ми" },
  sk: { near:"BLÍZKO:", locating:"Lokalizácia...", setLoc:"Nastaviť polohu", mi:"mi" },
  sl: { near:"BLIZU:", locating:"Lociranje...", setLoc:"Nastavi lokacijo", mi:"mi" },
  et: { near:"LÄHEDAL:", locating:"Asukoha määramine...", setLoc:"Määra asukoht", mi:"mi" },
  lv: { near:"TUVU:", locating:"Nosaka...", setLoc:"Iestatīt atrašanās vietu", mi:"jūdz" },
  lt: { near:"ŠALIA:", locating:"Nustatoma...", setLoc:"Nustatyti vietą", mi:"my" },
  be: { near:"ПОБАЧ:", locating:"Вызначэнне...", setLoc:"Пазначыць месца", mi:"мі" },
  ka: { near:"ახლოს:", locating:"მდებარეობის დადგენა...", setLoc:"მდებარეობის დაყენება", mi:"მი" },
  hy: { near:"ՄՈՏ:", locating:"Որոնում...", setLoc:"Սահմանել վայրը", mi:"մղ" },
  az: { near:"YAXIN:", locating:"Məkan tapılır...", setLoc:"Məkanı təyin et", mi:"mi" },
  kk: { near:"ЖАҚЫН:", locating:"Орын анықталуда...", setLoc:"Орынды орнату", mi:"ми" },
  ky: { near:"ЖАКЫН:", locating:"Жайгашкан жер аныкталууда...", setLoc:"Жайгашкан жерди орнотуу", mi:"ми" },
  uz: { near:"YAQIN:", locating:"Joy aniqlanmoqda...", setLoc:"Joyni o'rnatish", mi:"mi" },
  tg: { near:"НАЗДИК:", locating:"Ҷойгиршавӣ...", setLoc:"Маконро таъин кунед", mi:"ми" },
  mn: { near:"ОЙР:", locating:"Байршил тогтоож байна...", setLoc:"Байршил тогтоох", mi:"ми" },
  km: { near:"ជិត:", locating:"កំពុងកំណត់ទីតាំង...", setLoc:"កំណត់ទីតាំង", mi:"ម៉ាយ" },
  lo: { near:"ໃກ້:", locating:"ກຳລັງຫາທີ່ຕັ້ງ...", setLoc:"ຕັ້ງທີ່ຕັ້ງ", mi:"ໄມ" },
  my: { near:"အနီး:", locating:"တည်နေရာရှာနေသည်...", setLoc:"တည်နေရာသတ်မှတ်ရန်", mi:"မိုင်" },
}

export function LocationScopeBar(){
  const { zip, city, loading } = useLocation()
  const { requestGeolocation, setScope, scope } = useLocationScope()
  const { language } = useLanguage()
  const d = D[language] || D.en

  const radius = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[scope] || 10

  const handleRadiusChange = (r: number) => {
    setScope(`${r}mi` as any)
  }

  return (
    <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center gap-2">
        <span className="text-white text-xs font-bold">{d.near} {zip || '...'}</span>
        <select value={radius} onChange={(e)=>{ try { handleRadiusChange(Number(e.target.value)) } catch {} }} className="bg-white text-black text-xs font-bold rounded-full px-3 py-1">
          <option value={5}>5 {d.mi}</option><option value={10}>10 {d.mi}</option><option value={15}>15 {d.mi}</option><option value={20}>20 {d.mi}</option>
        </select>
      </div>
      <button onClick={()=>{ try { requestGeolocation() } catch {} }} className="bg-white text-black text-xs font-black rounded-full px-4 py-1.5">
        {loading? d.locating : zip? `${zip} • ${city}` : d.setLoc}
      </button>
    </div>
  )
}
export default LocationScopeBar
