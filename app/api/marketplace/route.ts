import { NextResponse } from 'next/server'

const T: Record<string, { garage: string, estate: string, thrift: string, flea: string, thisWeekend: string, thisWeek: string, daily: string, weekends: string, area: string, region: string, near: string, in: string }> = {
  en: { garage:"Weekend Garage Sales in", estate:"Estate Sales in", thrift:"Thrift Stores near", flea:"Flea Markets in", thisWeekend:"This Weekend", thisWeek:"This Week", daily:"Daily", weekends:"Weekends", area:"area", region:"region", near:"near", in:"in" },
  es: { garage:"Ventas de garaje de fin de semana en", estate:"Ventas de patrimonio en", thrift:"Tiendas de segunda mano cerca de", flea:"Mercados de pulgas en", thisWeekend:"Este fin de semana", thisWeek:"Esta semana", daily:"Diario", weekends:"Fines de semana", area:"zona", region:"region", near:"cerca de", in:"en" },
  fr: { garage:"Ventes de garage week-end a", estate:"Ventes de succession a", thrift:"Friperies pres de", flea:"Marches aux puces a", thisWeekend:"Ce week-end", thisWeek:"Cette semaine", daily:"Quotidien", weekends:"Week-ends", area:"zone", region:"region", near:"pres de", in:"a" },
  de: { garage:"Wochenend-Garagenverkaufe in", estate:"Nachlassverkaufe in", thrift:"Second-Hand-Laden nahe", flea:"Flohmärkte in", thisWeekend:"Dieses Wochenende", thisWeek:"Diese Woche", daily:"Taglich", weekends:"Wochenenden", area:"Bereich", region:"Region", near:"nahe", in:"in" },
  zh: { garage:"周末车库甩卖在", estate:"遗产甩卖在", thrift:"旧货店靠近", flea:"跳蚤市场在", thisWeekend:"本周末", thisWeek:"本周", daily:"每日", weekends:"周末", area:"地区", region:"区域", near:"靠近", in:"在" },
  ja: { garage:"週末ガレージセール", estate:"エステートセール", thrift:"古着屋 近く", flea:"フリーマーケット", thisWeekend:"今週末", thisWeek:"今週", daily:"毎日", weekends:"週末", area:"エリア", region:"地域", near:"近く", in:"の" },
  ko: { garage:"주말 차고 세일", estate:"유산 세일", thrift:"중고 상점 근처", flea:"벼룩시장", thisWeekend:"이번 주말", thisWeek:"이번 주", daily:"매일", weekends:"주말", area:"지역", region:"지역", near:"근처", in:"에" },
  pt: { garage:"Vendas de garagem de fim de semana em", estate:"Vendas de patrimonio em", thrift:"Brechos perto de", flea:"Feiras de pulga em", thisWeekend:"Este fim de semana", thisWeek:"Esta semana", daily:"Diario", weekends:"Fins de semana", area:"area", region:"regiao", near:"perto de", in:"em" },
  ru: { garage:"Гаражные распродажи выходного дня в", estate:"Распродажи имущества в", thrift:"Комиссионки рядом с", flea:"Блошиные рынки в", thisWeekend:"Эти выходные", thisWeek:"На этой неделе", daily:"Ежедневно", weekends:"Выходные", area:"район", region:"регион", near:"рядом", in:"в" },
  ar: { garage:"مبيعات المرآب في عطلة نهاية الأسبوع في", estate:"مبيعات العقارات في", thrift:"متاجر التوفير بالقرب من", flea:"أسواق السلع المستعملة في", thisWeekend:"نهاية هذا الأسبوع", thisWeek:"هذا الأسبوع", daily:"يومي", weekends:"عطلات نهاية الأسبوع", area:"منطقة", region:"منطقة", near:"بالقرب من", in:"في" },
  hi: { garage:"इस सप्ताहांत गैरेज सेल में", estate:"एस्टेट सेल में", thrift:"थ्रिफ्ट स्टोर पास", flea:"फ्ली मार्केट में", thisWeekend:"इस सप्ताहांत", thisWeek:"इस सप्ताह", daily:"रोज़", weekends:"सप्ताहांत", area:"क्षेत्र", region:"क्षेत्र", near:"पास", in:"में" },
  it: { garage:"Vendite in garage weekend a", estate:"Vendite immobiliari a", thrift:"Negozi dell'usato vicino", flea:"Mercatini delle pulci a", thisWeekend:"Questo weekend", thisWeek:"Questa settimana", daily:"Quotidiano", weekends:"Weekend", area:"zona", region:"regione", near:"vicino a", in:"a" },
  nl: { garage:"Garageverkopen weekend in", estate:"Boedelverkopen in", thrift:"Kringloopwinkels bij", flea:"Vlooienmarkten in", thisWeekend:"Dit weekend", thisWeek:"Deze week", daily:"Dagelijks", weekends:"Weekends", area:"gebied", region:"regio", near:"bij", in:"in" },
  tl: { garage:"Weekend Garage Sales sa", estate:"Estate Sales sa", thrift:"Thrift Stores malapit sa", flea:"Flea Markets sa", thisWeekend:"Ngayong Weekend", thisWeek:"Ngayong Linggo", daily:"Araw-araw", weekends:"Weekends", area:"lugar", region:"rehiyon", near:"malapit sa", in:"sa" },
  bn: { garage:"উইকএন্ড গ্যারেজ সেল", estate:"এস্টেট সেল", thrift:"থ্রিফট স্টোর কাছে", flea:"ফ্লি মার্কেট", thisWeekend:"এই উইকএন্ড", thisWeek:"এই সপ্তাহ", daily:"দৈনিক", weekends:"উইকএন্ড", area:"এলাকা", region:"অঞ্চল", near:"কাছে", in:"এ" },
  id: { garage:"Obrolan Garasi Akhir Pekan di", estate:"Obrolan Estate di", thrift:"Toko Barang Bekas dekat", flea:"Pasar Loak di", thisWeekend:"Akhir Pekan Ini", thisWeek:"Minggu Ini", daily:"Harian", weekends:"Akhir Pekan", area:"area", region:"wilayah", near:"dekat", in:"di" },
  vi: { garage:"Bán garage cuối tuần tại", estate:"Bán tài sản tại", thrift:"Cửa hàng đồ cũ gần", flea:"Chợ trời tại", thisWeekend:"Cuối tuần này", thisWeek:"Tuần này", daily:"Hàng ngày", weekends:"Cuối tuần", area:"khu vực", region:"vùng", near:"gần", in:"tại" },
  th: { garage:"ขายของโรงรถวันหยุดใน", estate:"ขายทรัพย์สินใน", thrift:"ร้านขายของมือสองใกล้", flea:"ตลาดนัดใน", thisWeekend:"สุดสัปดาห์นี้", thisWeek:"สัปดาห์นี้", daily:"ทุกวัน", weekends:"สุดสัปดาห์", area:"พื้นที่", region:"ภูมิภาค", near:"ใกล้", in:"ใน" },
  sv: { garage:"Garageloppis helg i", estate:"Dödsbon i", thrift:"Second hand nära", flea:"Loppmarknader i", thisWeekend:"Denna helg", thisWeek:"Denna vecka", daily:"Dagligen", weekends:"Helger", area:"område", region:"region", near:"nära", in:"i" },
  pl: { garage:"Wyprzedaże garażowe weekend w", estate:"Wyprzedaże majątku w", thrift:"Sklepy z używaną odzieżą blisko", flea:"Pchle targi w", thisWeekend:"Ten weekend", thisWeek:"Ten tydzień", daily:"Codziennie", weekends:"Weekendy", area:"okolica", region:"region", near:"blisko", in:"w" },
  tr: { garage:"Hafta sonu garaj satışları", estate:"Mülk satışları", thrift:"İkinci el mağazalar yakın", flea:"Bit pazarları", thisWeekend:"Bu hafta sonu", thisWeek:"Bu hafta", daily:"Günlük", weekends:"Hafta sonları", area:"bölgesi", region:"bölgesi", near:"yakın", in:"içinde" },
}

const ALL = ["en","es","fr","de","zh","ja","ko","ru","ar","pt","it","nl","tl","hi","bn","id","vi","th","sv","pl","tr","uk","el","he","ur","fa","ms","ro","cs","hu","fi","no","da","bg","hr","sr","sk","sl","et","lv","lt","be","ka","hy","az","kk","ky","uz","tg","mn","km","lo","my"]
function getT(lang:string){
  return (T as any)[lang] || (T as any).en
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const zip = searchParams.get('zip') || 'GLOBAL'
  const city = searchParams.get('city') || 'Local'
  const lang = (searchParams.get('lang') || 'en').toLowerCase().split('-')[0]
  const t = getT(lang)

  try {
    // Ensure city still shows but title is translated
    const items = [
      { id: 'garage-1', title: `${t.garage} ${city}`, source: city, sale_date: t.thisWeekend, orig: `Weekend Garage Sales in ${city}` },
      { id: 'estate-1', title: `${t.estate} ${city} ${t.area}`, source: city, sale_date: t.thisWeek, orig: `Estate Sales in ${city} area` },
      { id: 'thrift-1', title: `${t.thrift} ${city}`, source: city, sale_date: t.daily, orig: `Thrift Stores near ${city}` },
      { id: 'flea-1', title: `${t.flea} ${city} ${t.region}`, source: city, sale_date: t.weekends, orig: `Flea Markets in ${city} region` },
    ]

    return NextResponse.json({ items, zip, city, lang, translated: lang !== 'en' })
  } catch (error) {
    return NextResponse.json({ items: [], zip, city, lang })
  }
}
