'use client'
import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { title:"Live Map", pins:"{count} live pins • Full view" },
  es: { title:"Mapa en Vivo", pins:"{count} pines en vivo • Vista completa" },
  fr: { title:"Carte en Direct", pins:"{count} épingles en direct • Vue complète" },
  de: { title:"Live-Karte", pins:"{count} Live-Pins • Vollansicht" },
  zh: { title:"实时地图", pins:"{count} 个实时标记 • 全视图" },
  ja: { title:"ライブマップ", pins:"{count}件のライブピン • 全体表示" },
  ko: { title:"라이브 맵", pins:"{count}개 라이브 핀 • 전체 보기" },
  pt: { title:"Mapa ao Vivo", pins:"{count} pins ao vivo • Visão completa" },
  ru: { title:"Карта Лайв", pins:"{count} живых меток • Полный вид" },
  ar: { title:"خريطة مباشرة", pins:"{count} دبابيس مباشرة • عرض كامل" },
  hi: { title:"लाइव मैप", pins:"{count} लाइव पिन • पूरा दृश्य" },
  it: { title:"Mappa Live", pins:"{count} pin live • Vista completa" },
  nl: { title:"Live Kaart", pins:"{count} live pins • Volledig overzicht" },
  tl: { title:"Live Map", pins:"{count} live pins • Full view" },
  bn: { title:"লাইভ ম্যাপ", pins:"{count} লাইভ পিন • সম্পূর্ণ ভিউ" },
  id: { title:"Peta Live", pins:"{count} pin live • Tampilan penuh" },
  vi: { title:"Bản Đồ Trực Tiếp", pins:"{count} ghim trực tiếp • Xem đầy đủ" },
  th: { title:"แผนที่สด", pins:"{count} หมุดสด • มุมมองเต็ม" },
  sv: { title:"Live Karta", pins:"{count} live pins • Full vy" },
  pl: { title:"Mapa Live", pins:"{count} pinezek live • Pełny widok" },
  tr: { title:"Canlı Harita", pins:"{count} canlı pin • Tam görünüm" },
  uk: { title:"Жива Карта", pins:"{count} живих пінів • Повний перегляд" },
  el: { title:"Ζωντανός Χάρτης", pins:"{count} ζωντανές καρφίτσες • Πλήρης προβολή" },
  he: { title:"מפה חיה", pins:"{count} סיכות חיות • תצוגה מלאה" },
  ur: { title:"لائیو نقشہ", pins:"{count} لائیو پن • مکمل ویو" },
  fa: { title:"نقشه زنده", pins:"{count} پین زنده • نمای کامل" },
  ms: { title:"Peta Langsung", pins:"{count} pin langsung • Paparan penuh" },
  ro: { title:"Hartă Live", pins:"{count} pinuri live • Vedere completă" },
  cs: { title:"Živá Mapa", pins:"{count} živých pinů • Plné zobrazení" },
  hu: { title:"Élő Térkép", pins:"{count} élő pin • Teljes nézet" },
  fi: { title:"Live Kartta", pins:"{count} live-nastaa • Koko näkymä" },
  no: { title:"Live Kart", pins:"{count} live pins • Full visning" },
  da: { title:"Live Kort", pins:"{count} live pins • Fuld visning" },
  bg: { title:"Жива Карта", pins:"{count} живи пина • Пълен изглед" },
  hr: { title:"Karta Uživo", pins:"{count} pinova uživo • Puni prikaz" },
  sr: { title:"Мапа Уживо", pins:"{count} пинова уживо • Пун приказ" },
  sk: { title:"Live Mapa", pins:"{count} live pinov • Plné zobrazenie" },
  sl: { title:"Zemljevid v Živo", pins:"{count} živih pinov • Celoten pogled" },
  et: { title:"Otse Kaart", pins:"{count} live pin'i • Täisvaade" },
  lv: { title:"Tiešraides Karte", pins:"{count} tiešraides piespraudes • Pilns skats" },
  lt: { title:"Gyvas Žemėlapis", pins:"{count} gyvų smeigtukų • Pilnas vaizdas" },
  be: { title:"Жывая Карта", pins:"{count} жывых пінаў • Поўны прагляд" },
  ka: { title:"ლაივ რუკა", pins:"{count} ლაივ პინი • სრული ხედი" },
  hy: { title:"Ուղիղ Քարտեզ", pins:"{count} ուղիղ փին • Ամբողջական տեսք" },
  az: { title:"Canlı Xəritə", pins:"{count} canlı pin • Tam görünüş" },
  kk: { title:"Тікелей Карта", pins:"{count} тікелей пин • Толық көрініс" },
  ky: { title:"Түз Карта", pins:"{count} түз пин • Толук көрүнүш" },
  uz: { title:"Jonli Xarita", pins:"{count} jonli pin • To'liq ko'rinish" },
  tg: { title:"Харитаи Зинда", pins:"{count} пини зинда • Намоиши пурра" },
  mn: { title:"Шууд Газрын Зураг", pins:"{count} шууд зүү • Бүрэн харагдац" },
  km: { title:"ផែនទីផ្ទាល់", pins:"{count} ម្ជុលផ្ទាល់ • ទិដ្ឋភាពពេញ" },
  lo: { title:"ແຜນທີ່ສົດ", pins:"{count} ເຂັມສົດ • ມຸມເບິ່ງເຕັມ" },
  my: { title:"တိုက်ရိုက်မြေပုံ", pins:"{count} တိုက်ရိုက်ပင် • အပြည့်အစုံမြင်ကွင်း" },
}

export default function LiveMap(){
  const { language } = useLanguage()
  const d = D[language] || D.en
  const count = 3

  return (
    <Link href="/live-map" className="block bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-3 hover:bg-black/70">
      <div className="text-white font-black text-xs">{d.title}</div>
      <div className="text-white/40 text-xs mt-1">{d.pins.replace('{count}', String(count))}</div>
    </Link>
  )
}
