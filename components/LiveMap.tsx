'use client'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { liveMap:"Live Map •", yourArea:"your area", pins:"3 live pins • Full view", view:"View Map" },
  es: { liveMap:"Mapa en Vivo •", yourArea:"tu área", pins:"3 pines en vivo • Vista completa", view:"Ver Mapa" },
  fr: { liveMap:"Carte Live •", yourArea:"votre zone", pins:"3 épingles live • Vue complète", view:"Voir Carte" },
  de: { liveMap:"Live-Karte •", yourArea:"dein Bereich", pins:"3 Live-Pins • Vollansicht", view:"Karte Ansehen" },
  zh: { liveMap:"实时地图 •", yourArea:"你的地区", pins:"3 个实时图钉 • 完整视图", view:"查看地图" },
  ja: { liveMap:"ライブマップ •", yourArea:"あなたのエリア", pins:"3つのライブピン • 全体表示", view:"マップを見る" },
  ko: { liveMap:"라이브 맵 •", yourArea:"내 지역", pins:"라이브 핀 3개 • 전체 보기", view:"지도 보기" },
  pt: { liveMap:"Mapa ao Vivo •", yourArea:"sua área", pins:"3 pins ao vivo • Visão completa", view:"Ver Mapa" },
  ru: { liveMap:"Карта Live •", yourArea:"ваш район", pins:"3 live метки • Полный вид", view:"Смотреть Карту" },
  ar: { liveMap:"خريطة مباشرة •", yourArea:"منطقتك", pins:"3 دبابيس مباشرة • عرض كامل", view:"عرض الخريطة" },
  hi: { liveMap:"लाइव मैप •", yourArea:"आपका क्षेत्र", pins:"3 लाइव पिन • पूरा दृश्य", view:"मैप देखें" },
  it: { liveMap:"Mappa Live •", yourArea:"tua zona", pins:"3 pin live • Vista completa", view:"Vedi Mappa" },
  nl: { liveMap:"Live Kaart •", yourArea:"jouw gebied", pins:"3 live pins • Volledig overzicht", view:"Bekijk Kaart" },
  tl: { liveMap:"Live Map •", yourArea:"iyong lugar", pins:"3 live pins • Buong view", view:"Tingnan Mapa" },
  bn: { liveMap:"লাইভ ম্যাপ •", yourArea:"আপনার এলাকা", pins:"৩টি লাইভ পিন • সম্পূর্ণ ভিউ", view:"ম্যাপ দেখুন" },
  id: { liveMap:"Peta Live •", yourArea:"area Anda", pins:"3 pin live • Tampilan penuh", view:"Lihat Peta" },
  vi: { liveMap:"Bản Đồ Trực Tiếp •", yourArea:"khu vực bạn", pins:"3 ghim trực tiếp • Xem đầy đủ", view:"Xem Bản Đồ" },
  th: { liveMap:"แผนที่สด •", yourArea:"พื้นที่ของคุณ", pins:"3 หมุดสด • มุมมองเต็ม", view:"ดูแผนที่" },
  sv: { liveMap:"Live Karta •", yourArea:"ditt område", pins:"3 live pins • Full vy", view:"Visa Karta" },
  pl: { liveMap:"Mapa Live •", yourArea:"twoja okolica", pins:"3 pinezki live • Pełny widok", view:"Zobacz Mapę" },
  tr: { liveMap:"Canlı Harita •", yourArea:"bölgeniz", pins:"3 canlı pin • Tam görünüm", view:"Haritayı Gör" },
  uk: { liveMap:"Карта Live •", yourArea:"ваш район", pins:"3 live мітки • Повний вигляд", view:"Переглянути Карту" },
  el: { liveMap:"Ζωντανός Χάρτης •", yourArea:"η περιοχή σου", pins:"3 ζωντανές καρφίτσες • Πλήρης προβολή", view:"Προβολή Χάρτη" },
  he: { liveMap:"מפה חיה •", yourArea:"האזור שלך", pins:"3 סיכות חיות • תצוגה מלאה", view:"הצג מפה" },
  ur: { liveMap:"لائیو نقشہ •", yourArea:"آپ کا علاقہ", pins:"3 لائیو پن • مکمل منظر", view:"نقشہ دیکھیں" },
  fa: { liveMap:"نقشه زنده •", yourArea:"منطقه شما", pins:"3 پین زنده • نمای کامل", view:"مشاهده نقشه" },
  ms: { liveMap:"Peta Live •", yourArea:"kawasan anda", pins:"3 pin live • Paparan penuh", view:"Lihat Peta" },
  ro: { liveMap:"Hartă Live •", yourArea:"zona ta", pins:"3 pin-uri live • Vedere completă", view:"Vezi Harta" },
  cs: { liveMap:"Live Mapa •", yourArea:"vaše oblast", pins:"3 live špendlíky • Plný pohled", view:"Zobrazit Mapu" },
  hu: { liveMap:"Élő Térkép •", yourArea:"területed", pins:"3 élő pin • Teljes nézet", view:"Térkép Megtekintése" },
  fi: { liveMap:"Live Kartta •", yourArea:"alueesi", pins:"3 live pinniä • Täysi näkymä", view:"Näytä Kartta" },
  no: { liveMap:"Live Kart •", yourArea:"ditt område", pins:"3 live pins • Full visning", view:"Vis Kart" },
  da: { liveMap:"Live Kort •", yourArea:"dit område", pins:"3 live pins • Fuld visning", view:"Vis Kort" },
  bg: { liveMap:"Карта На Живо •", yourArea:"вашият район", pins:"3 живи пина • Пълен изглед", view:"Виж Картата" },
  hr: { liveMap:"Karta Uživo •", yourArea:"vaše područje", pins:"3 uživo pina • Puni prikaz", view:"Pogledaj Kartu" },
  sr: { liveMap:"Мапа Уживо •", yourArea:"ваше подручје", pins:"3 уживо чиоде • Пун приказ", view:"Погледај Мапу" },
  sk: { liveMap:"Live Mapa •", yourArea:"vaša oblasť", pins:"3 live špendlíky • Plný pohľad", view:"Zobraziť Mapu" },
  sl: { liveMap:"Zemljevid V Živo •", yourArea:"vaše območje", pins:"3 žive bucike • Celoten pogled", view:"Poglej Zemljevid" },
  et: { liveMap:"Live Kaart •", yourArea:"sinu piirkond", pins:"3 live nööpnõela • Täisvaade", view:"Vaata Kaarti" },
  lv: { liveMap:"Tiešraides Karte •", yourArea:"jūsu rajons", pins:"3 tiešraides piespraudes • Pilns skats", view:"Skatīt Karti" },
  lt: { liveMap:"Live Žemėlapis •", yourArea:"jūsų rajonas", pins:"3 gyvi smeigtukai • Pilnas vaizdas", view:"Žiūrėti Žemėlapį" },
  be: { liveMap:"Карта Live •", yourArea:"ваш раён", pins:"3 live шпількі • Поўны выгляд", view:"Глядзець Карту" },
  ka: { liveMap:"ლაივ რუკა •", yourArea:"თქვენი არე", pins:"3 ლაივ პინი • სრული ხედი", view:"რუკის ნახვა" },
  hy: { liveMap:"Ուղիղ Քարտեզ •", yourArea:"ձեր տարածքը", pins:"3 ուղիղ քորոց • Ամբողջական տեսք", view:"Դիտել Քարտեզը" },
  az: { liveMap:"Canlı Xəritə •", yourArea:"sizin ərazi", pins:"3 canlı pin • Tam görünüş", view:"Xəritəyə Bax" },
  kk: { liveMap:"Live Карта •", yourArea:"сіздің аймақ", pins:"3 live түйреуіш • Толық көрініс", view:"Картаны Көру" },
  ky: { liveMap:"Live Карта •", yourArea:"сиздин аймак", pins:"3 live төөнөгич • Толук көрүнүш", view:"Картаны Көрүү" },
  uz: { liveMap:"Jonli Xarita •", yourArea:"sizning hudud", pins:"3 jonli pin • To'liq ko'rinish", view:"Xaritani Ko'rish" },
  tg: { liveMap:"Харитаи Зинда •", yourArea:"минтақаи шумо", pins:"3 пини зинда • Намоиши пурра", view:"Дидани Харита" },
  mn: { liveMap:"Шууд Газрын Зураг •", yourArea:"таны бүс", pins:"3 шууд зүү • Бүрэн харагдац", view:"Газрын Зураг Харах" },
  km: { liveMap:"ផែនទីផ្ទាល់ •", yourArea:"តំបន់របស់អ្នក", pins:"3 ម្ជុលផ្ទាល់ • ទិដ្ឋភាពពេញ", view:"មើលផែនទី" },
  lo: { liveMap:"ແຜນທີ່ສົດ •", yourArea:"ເຂດຂອງທ່ານ", pins:"3 ໝຸດສົດ • ມຸມເຕັມ", view:"ເບິ່ງແຜນທີ່" },
  my: { liveMap:"တိုက်ရိုက်မြေပုံ •", yourArea:"သင့်ဧရိယာ", pins:"တိုက်ရိုက်ပင် ၃ ခု • အပြည့်အဝမြင်ကွင်း", view:"မြေပုံကြည့်ရန်" },
}

export default function LiveMap() {
  const { city, zip } = useLocation()
  const { language } = useLanguage()
  const d = D[language] || D.en
  return (
    <Link href="/block-map" className="block bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3 hover:bg-black/60 transition-colors">
      <div className="text-white font-black text-xs mb-2">{d.liveMap} {city || zip || d.yourArea}</div>
      <div className="text-white/40 text-xs">{d.pins}</div>
      <div className="mt-2 bg-white text-black rounded-full px-3 py-1 text-xs font-bold inline-block">{d.view}</div>
    </Link>
  )
}
