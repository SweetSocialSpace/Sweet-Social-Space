'use server'

import { z } from 'zod'

export type MarketplaceListingDTO = {
  id: string
  title: string
  description: string | null
  price_cents: number | null
  currency: string | null
  category: string | null
  condition: string | null
  location_label: string | null
  city: string | null
  state_code: string | null
  latitude: number | null
  longitude: number | null
  seller_id: string
  created_at: string
  images: string[] | null
  is_sold: boolean
  lang?: string
  original_title?: string
}

const T: Record<string, { garage:string, estate:string, thrift:string, flea:string, localDeals:string, free:string, furniture:string, tools:string, in:string, near:string, area:string, region:string }> = {
en: { garage:"Weekend Garage Sales", estate:"Estate Sales", thrift:"Thrift Stores", flea:"Flea Markets", localDeals:"Local Deals", free:"Free Items", furniture:"Furniture", tools:"Tools", in:"in", near:"near", area:"area", region:"region" },
es: { garage:"Ventas de garaje fin de semana", estate:"Ventas de patrimonio", thrift:"Tiendas segunda mano", flea:"Mercados de pulgas", localDeals:"Ofertas Locales", free:"Articulos Gratis", furniture:"Muebles", tools:"Herramientas", in:"en", near:"cerca de", area:"zona", region:"region" },
fr: { garage:"Ventes garage week-end", estate:"Ventes succession", thrift:"Friperies", flea:"Marches aux puces", localDeals:"Offres Locales", free:"Articles Gratuits", furniture:"Meubles", tools:"Outils", in:"a", near:"pres de", area:"zone", region:"region" },
de: { garage:"Garagenverkaufe Wochenende", estate:"Nachlassverkaufe", thrift:"Second-Hand-Laden", flea:"Flohmärkte", localDeals:"Lokale Angebote", free:"Kostenlose Artikel", furniture:"Mobel", tools:"Werkzeuge", in:"in", near:"nahe", area:"Bereich", region:"Region" },
zh: { garage:"周末车库甩卖", estate:"遗产甩卖", thrift:"旧货店", flea:"跳蚤市场", localDeals:"本地优惠", free:"免费物品", furniture:"家具", tools:"工具", in:"在", near:"靠近", area:"地区", region:"区域" },
ja: { garage:"週末ガレージセール", estate:"エステートセール", thrift:"古着屋", flea:"フリーマーケット", localDeals:"ローカルお得", free:"無料アイテム", furniture:"家具", tools:"工具", in:"の", near:"近く", area:"エリア", region:"地域" },
ko: { garage:"주말 차고 세일", estate:"유산 세일", thrift:"중고 상점", flea:"벼룩시장", localDeals:"로컬 특가", free:"무료 아이템", furniture:"가구", tools:"공구", in:"에", near:"근처", area:"지역", region:"지역" },
pt: { garage:"Vendas garagem fim semana", estate:"Vendas patrimonio", thrift:"Brechos", flea:"Feiras de pulga", localDeals:"Ofertas Locais", free:"Itens Gratis", furniture:"Moveis", tools:"Ferramentas", in:"em", near:"perto de", area:"area", region:"regiao" },
ru: { garage:"Гаражные распродажи", estate:"Распродажи имущества", thrift:"Комиссионки", flea:"Блошиные рынки", localDeals:"Местные сделки", free:"Бесплатные вещи", furniture:"Мебель", tools:"Инструменты", in:"в", near:"рядом", area:"район", region:"регион" },
ar: { garage:"مبيعات المرآب", estate:"مبيعات العقارات", thrift:"متاجر التوفير", flea:"أسواق السلع المستعملة", localDeals:"عروض محلية", free:"عناصر مجانية", furniture:"أثاث", tools:"أدوات", in:"في", near:"بالقرب من", area:"منطقة", region:"منطقة" },
hi: { garage:"वीकेंड गैरेज सेल", estate:"एस्टेट सेल", thrift:"थ्रिफ्ट स्टोर", flea:"फ्ली मार्केट", localDeals:"स्थानीय डील", free:"मुफ्त आइटम", furniture:"फर्नीचर", tools:"उपकरण", in:"में", near:"पास", area:"क्षेत्र", region:"क्षेत्र" },
it: { garage:"Vendite garage weekend", estate:"Vendite immobiliari", thrift:"Negozi usato", flea:"Mercatini pulci", localDeals:"Offerte Locali", free:"Articoli Gratis", furniture:"Mobili", tools:"Attrezzi", in:"a", near:"vicino a", area:"zona", region:"regione" },
nl: { garage:"Garageverkopen weekend", estate:"Boedelverkopen", thrift:"Kringloopwinkels", flea:"Vlooienmarkten", localDeals:"Lokale Deals", free:"Gratis Items", furniture:"Meubels", tools:"Gereedschap", in:"in", near:"bij", area:"gebied", region:"regio" },
tl: { garage:"Weekend Garage Sales", estate:"Estate Sales", thrift:"Thrift Stores", flea:"Flea Markets", localDeals:"Local Deals", free:"Libreng Items", furniture:"Muwebles", tools:"Kagamitan", in:"sa", near:"malapit sa", area:"lugar", region:"rehiyon" },
bn: { garage:"উইকএন্ড গ্যারেজ সেল", estate:"এস্টেট সেল", thrift:"থ্রিফট স্টোর", flea:"ফ্লি মার্কেট", localDeals:"স্থানীয় ডিল", free:"বিনামূল্যে আইটেম", furniture:"আসবাবপত্র", tools:"সরঞ্জাম", in:"এ", near:"কাছে", area:"এলাকা", region:"অঞ্চল" },
id: { garage:"Obrol Garage Akhir Pekan", estate:"Obrol Estate", thrift:"Toko Barang Bekas", flea:"Pasar Loak", localDeals:"Penawaran Lokal", free:"Barang Gratis", furniture:"Furnitur", tools:"Alat", in:"di", near:"dekat", area:"area", region:"wilayah" },
vi: { garage:"Bán garage cuối tuần", estate:"Bán tài sản", thrift:"Cửa hàng đồ cũ", flea:"Chợ trời", localDeals:"Ưu Đãi Địa Phương", free:"Vật phẩm Miễn phí", furniture:"Nội thất", tools:"Dụng cụ", in:"tại", near:"gần", area:"khu vực", region:"vùng" },
th: { garage:"ขายโรงรถวันหยุด", estate:"ขายทรัพย์สิน", thrift:"ร้านมือสอง", flea:"ตลาดนัด", localDeals:"ดีลท้องถิ่น", free:"ของฟรี", furniture:"เฟอร์นิเจอร์", tools:"เครื่องมือ", in:"ใน", near:"ใกล้", area:"พื้นที่", region:"ภูมิภาค" },
sv: { garage:"Garageloppis helg", estate:"Dödsbon", thrift:"Second hand", flea:"Loppmarknader", localDeals:"Lokala Erbjudanden", free:"Gratis Artiklar", furniture:"Möbler", tools:"Verktyg", in:"i", near:"nära", area:"område", region:"region" },
pl: { garage:"Wyprzedaże garażowe weekend", estate:"Wyprzedaże majątku", thrift:"Sklepy używane", flea:"Pchle targi", localDeals:"Lokalne Okazje", free:"Darmowe Przedmioty", furniture:"Meble", tools:"Narzędzia", in:"w", near:"blisko", area:"okolica", region:"region" },
tr: { garage:"Hafta sonu garaj satışları", estate:"Mülk satışları", thrift:"İkinci el mağazalar", flea:"Bit pazarları", localDeals:"Yerel Fırsatlar", free:"Ücretsiz Ürünler", furniture:"Mobilya", tools:"Aletler", in:"içinde", near:"yakın", area:"bölgesi", region:"bölgesi" },
uk: { garage:"Гаражні розпродажі вихідні", estate:"Розпродажі майна", thrift:"Комісійки", flea:"Блошині ринки", localDeals:"Місцеві угоди", free:"Безкоштовні речі", furniture:"Меблі", tools:"Інструменти", in:"в", near:"поруч", area:"район", region:"регіон" },
el: { garage:"Εκποιήσεις γκαράζ Σαββατοκύριακο", estate:"Εκποιήσεις περιουσίας", thrift:"Καταστήματα μεταχειρισμένων", flea:"Υπαίθριες αγορές", localDeals:"Τοπικές Προσφορές", free:"Δωρεάν Αντικείμενα", furniture:"Έπιπλα", tools:"Εργαλεία", in:"σε", near:"κοντά", area:"περιοχή", region:"περιοχή" },
he: { garage:"מכירות מוסך סופ\"ש", estate:"מכירות עיזבון", thrift:"חנויות יד שנייה", flea:"שוקי פשפשים", localDeals:"עסקאות מקומיות", free:"פריטים חינם", furniture:"רהיטים", tools:"כלים", in:"ב", near:"ליד", area:"אזור", region:"אזור" },
ur: { garage:"ویک اینڈ گیراج سیل", estate:"اسٹیٹ سیل", thrift:"تھرفٹ اسٹور", flea:"فلی مارکیٹ", localDeals:"مقامی ڈیلز", free:"مفت اشیاء", furniture:"فرنیچر", tools:"اوزار", in:"میں", near:"قریب", area:"علاقہ", region:"علاقہ" },
fa: { garage:"فروش گاراژی آخر هفته", estate:"فروش املاک", thrift:"فروشگاه دست دوم", flea:"بازار کهنه", localDeals:"معاملات محلی", free:"اقلام رایگان", furniture:"مبلمان", tools:"ابزار", in:"در", near:"نزدیک", area:"منطقه", region:"منطقه" },
ms: { garage:"Jualan garaj hujung minggu", estate:"Jualan harta", thrift:"Kedai barangan terpakai", flea:"Pasar karat", localDeals:"Tawaran Tempatan", free:"Barangan Percuma", furniture:"Perabot", tools:"Alatan", in:"di", near:"dekat", area:"kawasan", region:"wilayah" },
ro: { garage:"Vanzari garaj weekend", estate:"Vanzari patrimoniu", thrift:"Magazine second-hand", flea:"Targuri vechituri", localDeals:"Oferte Locale", free:"Articole Gratuite", furniture:"Mobilier", tools:"Unelte", in:"in", near:"aproape", area:"zona", region:"regiune" },
cs: { garage:"Garážové výprodeje víkend", estate:"Výprodeje majetku", thrift:"Sekáče", flea:"Bleší trhy", localDeals:"Místní Nabídky", free:"Zdarma Předměty", furniture:"Nábytek", tools:"Nářadí", in:"v", near:"blízko", area:"oblast", region:"region" },
hu: { garage:"Garázsvásár hétvége", estate:"Hagyatéki vásár", thrift:"Használt ruha bolt", flea:"Bolhapiac", localDeals:"Helyi Ajánlatok", free:"Ingyenes Tárgyak", furniture:"Bútor", tools:"Szerszámok", in:"ban", near:"közel", area:"környék", region:"régió" },
fi: { garage:"Autotallimyynnit viikonloppu", estate:"Kuolinpesämyynnit", thrift:"Kirpputorit", flea:"Kirppismarkkinat", localDeals:"Paikalliset Tarjoukset", free:"Ilmaiset Tavarat", furniture:"Huonekalut", tools:"Työkalut", in:"ssa", near:"lähellä", area:"alue", region:"alue" },
no: { garage:"Garasjesalg helg", estate:"Dødsbosalg", thrift:"Bruktbutikker", flea:"Loppemarkeder", localDeals:"Lokale Tilbud", free:"Gratis Ting", furniture:"Møbler", tools:"Verktøy", in:"i", near:"nær", area:"område", region:"region" },
da: { garage:"Garagesalg weekend", estate:"Dødsbosalg", thrift:"Genbrugsbutikker", flea:"Loppemarkeder", localDeals:"Lokale Tilbud", free:"Gratis Ting", furniture:"Møbler", tools:"Værktøj", in:"i", near:"nær", area:"område", region:"region" },
bg: { garage:"Гаражни разпродажби уикенд", estate:"Разпродажби имоти", thrift:"Магазини втора употреба", flea:"Битпазари", localDeals:"Местни Оферти", free:"Безплатни Артикули", furniture:"Мебели", tools:"Инструменти", in:"в", near:"близо", area:"район", region:"регион" },
hr: { garage:"Garažne rasprodaje vikend", estate:"Rasprodaje ostavštine", thrift:"Second hand trgovine", flea:"Buvljaci", localDeals:"Lokalne Ponude", free:"Besplatni Artikli", furniture:"Namještaj", tools:"Alati", in:"u", near:"blizu", area:"područje", region:"regija" },
sr: { garage:"Гаражне распродаје викенд", estate:"Распродаје заоставштине", thrift:"Second hand продавнице", flea:"Бувљаци", localDeals:"Локалне Понуде", free:"Бесплатни Артикли", furniture:"Намештај", tools:"Алати", in:"у", near:"близу", area:"подручје", region:"регија" },
sk: { garage:"Garážové výpredaje víkend", estate:"Výpredaje majetku", thrift:"Sekáče", flea:"Blšie trhy", localDeals:"Miestne Ponuky", free:"Zadarmo Predmety", furniture:"Nábytok", tools:"Náradie", in:"v", near:"blízko", area:"oblasť", region:"región" },
sl: { garage:"Garažne razprodaje vikend", estate:"Razprodaje zapuščine", thrift:"Trgovine rabljeno", flea:"Bolšjaki", localDeals:"Lokalne Ponudbe", free:"Brezplačni Artikli", furniture:"Pohištvo", tools:"Orodja", in:"v", near:"blizu", area:"območje", region:"regija" },
et: { garage:"Garaažimüügid nädalavahetus", estate:"Pärandimüügid", thrift:"Taaskasutuspoed", flea:"Kirbuturud", localDeals:"Kohalikud Pakkumised", free:"Tasuta Esemed", furniture:"Mööbel", tools:"Tööriistad", in:"s", near:"lähedal", area:"piirkond", region:"piirkond" },
lv: { garage:"Garāžas izpārdošanas nedēļas nogale", estate:"Īpašumu izpārdošanas", thrift:"Lietotu apģērbu veikali", flea:"Blusu tirgi", localDeals:"Vietējie Piedāvājumi", free:"Bezmaksas Priekšmeti", furniture:"Mēbeles", tools:"Instrumenti", in:"iekš", near:"tuvu", area:"rajons", region:"reģions" },
lt: { garage:"Garažų išpardavimai savaitgalis", estate:"Turto išpardavimai", thrift:"Dėvėtų drabužių parduotuvės", flea:"Blusturgiai", localDeals:"Vietiniai Pasiūlymai", free:"Nemokami Daiktai", furniture:"Baldai", tools:"Įrankiai", in:"į", near:"šalia", area:"rajonas", region:"regionas" },
be: { garage:"Гаражныя распродажы выхадныя", estate:"Распродажы маёмасці", thrift:"Камісіёнкі", flea:"Блышыныя рынкі", localDeals:"Мясцовыя Прапановы", free:"Бясплатныя Рэчы", furniture:"Мэбля", tools:"Інструменты", in:"ў", near:"побач", area:"раён", region:"рэгіён" },
ka: { garage:"ავტოფარეხის გაყიდვები შაბათ-კვირა", estate:"ქონების გაყიდვები", thrift:"მეორადი მაღაზიები", flea:"რწყილების ბაზარი", localDeals:"ლოკალური შეთავაზებები", free:"უფასო ნივთები", furniture:"ავეჯი", tools:"ინსტრუმენტები", in:"ში", near:"ახლოს", area:"უბანი", region:"რეგიონი" },
hy: { garage:"Ավտոտնակի վաճառքներ հանգստյան օրեր", estate:"Գույքի վաճառքներ", thrift:"Երկրորդ ձեռքի խանութներ", flea:"Լու շուկաներ", localDeals:"Տեղական Գործարքներ", free:"Անվճար Ապրանքներ", furniture:"Կահույք", tools:"Գործիքներ", in:"ում", near:"մոտ", area:"տարածք", region:"շրջան" },
az: { garage:"Qaraj satışları həftəsonu", estate:"Əmlak satışları", thrift:"İkinci əl mağazalar", flea:"Bit bazarları", localDeals:"Yerli Təkliflər", free:"Pulsuz Əşyalar", furniture:"Mebel", tools:"Alətlər", in:"da", near:"yaxın", area:"ərazi", region:"bölgə" },
kk: { garage:"Гараж сатылымдары демалыс", estate:"Мүлік сатылымдары", thrift:"Екінші қол дүкендер", flea:"Бүрге базарлар", localDeals:"Жергілікті Ұсыныстар", free:"Тегін Заттар", furniture:"Жиһаз", tools:"Құралдар", in:"да", near:"жақын", area:"аудан", region:"аймақ" },
ky: { garage:"Гараж сатуулар дем алыш", estate:"Мүлк сатуулар", thrift:"Экинчи кол дүкөндөр", flea:"Бүргө базарлар", localDeals:"Жергиликтүү Сунуштар", free:"Акысыз Буюмдар", furniture:"Эмерек", tools:"Куралдар", in:"да", near:"жакын", area:"аймак", region:"аймак" },
uz: { garage:"Garaj savdolari dam olish", estate:"Mulk savdolari", thrift:"Ikkinchi qo'l do'konlar", flea:"Bit bozorlar", localDeals:"Mahalliy Takliflar", free:"Bepul Buyumlar", furniture:"Mebel", tools:"Asboblar", in:"da", near:"yaqin", area:"hudud", region:"mintaqa" },
tg: { garage:"Фурӯши гаражҳо истироҳат", estate:"Фурӯши амвол", thrift:"Мағозаҳои дасти дуюм", flea:"Бозори кӯҳна", localDeals:"Пешниҳодҳои Маҳаллӣ", free:"Ашёи Ройгон", furniture:"Мебел", tools:"Асбобҳо", in:"дар", near:"наздик", area:"ноҳия", region:"минтақа" },
mn: { garage:"Гараж худалдаа амралт", estate:"Хөрөнгө худалдаа", thrift:"Хуучин хувцас дэлгүүр", flea:"Бүүргийн зах", localDeals:"Орон Нутгийн Санал", free:"Үнэгүй Зүйлс", furniture:"Тавилга", tools:"Багаж хэрэгсэл", in:"д", near:"ойр", area:"дүүрэг", region:"бүс" },
km: { garage:"លក់យានដ្ឋានចុងសប្តាហ៍", estate:"លក់អចលនទ្រព្យ", thrift:"ហាងសម្លៀកបំពាក់ជជុះ", flea:"ផ្សារចៃ", localDeals:"កិច្ចព្រមព្រៀងក្នុងស្រុក", free:"របស់ឥតគិតថ្លៃ", furniture:"គ្រឿងសង្ហារិម", tools:"ឧបករណ៍", in:"ក្នុង", near:"ជិត", area:"តំបន់", region:"តំបន់" },
lo: { garage:"ຂາຍບ່ອນຈອດລົດສຸດທ້າຍອາທິດ", estate:"ຂາຍຊັບສິນ", thrift:"ຮ້ານເຄື່ອງມືສອງ", flea:"ຕະຫຼາດນັດ", localDeals:"ດີລທ້ອງຖິ່ນ", free:"ຂອງຟຣີ", furniture:"ເຟີນິເຈີ", tools:"ເຄື່ອງມື", in:"ໃນ", near:"ໃກ້", area:"ເຂດ", region:"ພາກພື້ນ" },
my: { garage:"ဂိုဒေါင်ရောင်းပွဲ စနေ", estate:"အိမ်ခြံမြေရောင်းပွဲ", thrift:"အဟောင်းဆိုင်များ", flea:"လှေးဈေး", localDeals:"ဒေသခံအပေးအယူများ", free:"အခမဲ့ပစ္စည်းများ", furniture:"ပရိဘောဂ", tools:"ကိရိယာများ", in:"တွင်", near:"အနီး", area:"နယ်မြေ", region:"ဒေသ" },
}

export async function listMarketplaceItems(input?: { limit?: number; scope?: any; category?: string | null; min_price?: number | null; max_price?: number | null; lang?: string; }): Promise<MarketplaceListingDTO[]> {
  try {
    const lang = (input?.lang || 'en').toLowerCase().split('-')[0]
    const t = T[lang] || T.en
    const city = input?.scope?.city || 'Local'
    const now = new Date().toISOString()
    const base: MarketplaceListingDTO[] = [
      { id:'garage-1', title:`${t.garage} ${t.in} ${city}`, description:`${t.localDeals}`, price_cents:null, currency:'USD', category:'garage', condition:'used', location_label:city, city, state_code:null, latitude:null, longitude:null, seller_id:'system', created_at:now, images:null, is_sold:false, lang, original_title:`Weekend Garage Sales in ${city}` },
      { id:'estate-1', title:`${t.estate} ${t.in} ${city} ${t.area}`, description:`${t.localDeals}`, price_cents:null, currency:'USD', category:'estate', condition:'used', location_label:city, city, state_code:null, latitude:null, longitude:null, seller_id:'system', created_at:now, images:null, is_sold:false, lang, original_title:`Estate Sales in ${city} area` },
      { id:'thrift-1', title:`${t.thrift} ${t.near} ${city}`, description:null, price_cents:null, currency:'USD', category:'thrift', condition:'used', location_label:city, city, state_code:null, latitude:null, longitude:null, seller_id:'system', created_at:now, images:null, is_sold:false, lang, original_title:`Thrift Stores near ${city}` },
      { id:'flea-1', title:`${t.flea} ${t.in} ${city} ${t.region}`, description:null, price_cents:null, currency:'USD', category:'flea', condition:'used', location_label:city, city, state_code:null, latitude:null, longitude:null, seller_id:'system', created_at:now, images:null, is_sold:false, lang, original_title:`Flea Markets in ${city} region` },
    ]
    return base.slice(0, input?.limit || 20)
  } catch { return [] }
}
export async function getMarketplaceItem(input: { id: string, lang?: string }): Promise<MarketplaceListingDTO | null> {
  try { const items = await listMarketplaceItems({ lang: input.lang } as any); return items.find(i=>i.id===input.id) || null } catch { return null }
}
export async function createMarketplaceItem(input: { title: string; description?: string | null; price_cents?: number | null; currency?: string | null; category?: string | null; condition?: string | null; location_label?: string | null; city?: string | null; state_code?: string | null; latitude?: number | null; longitude?: number | null; images?: string[] | null; }): Promise<{ id: string }> { return { id: "stubbed-for-phase-1" } }
export async function updateMarketplaceItem(input: { id: string; title?: string; description?: string | null; price_cents?: number | null; is_sold?: boolean; }): Promise<{ ok: true }> { return { ok: true } }
export async function deleteMarketplaceItem(input: { id: string }): Promise<{ ok: true }> { return { ok: true } }
