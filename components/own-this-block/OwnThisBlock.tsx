'use client'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { own:"OWN THIS BLOCK? 💰", pin:"Pin your business in {zip} for $29/mo", claim:"CLAIM {zip} →" },
  es: { own:"¿POSEE ESTE BLOQUE? 💰", pin:"Fija tu negocio en {zip} por $29/mes", claim:"RECLAMAR {zip} →" },
  fr: { own:"POSSÉDEZ CE BLOC? 💰", pin:"Épinglez votre entreprise à {zip} pour $29/mois", claim:"RÉCLAMER {zip} →" },
  de: { own:"DIESEN BLOCK BESITZEN? 💰", pin:"Fixiere dein Business in {zip} für $29/Monat", claim:"{zip} BEANSPRUCHEN →" },
  zh: { own:"拥有这个街区？💰", pin:"在 {zip} 置顶你的商家，每月 $29", claim:"认领 {zip} →" },
  ja: { own:"このブロックを所有？💰", pin:"{zip}でビジネスを固定 $29/月", claim:"{zip} を取得 →" },
  ko: { own:"이 블록을 소유? 💰", pin:"{zip}에 비즈니스 고정 $29/월", claim:"{zip} 청구 →" },
  pt: { own:"POSSUI ESTE BLOCO? 💰", pin:"Fixe seu negócio em {zip} por $29/mês", claim:"REIVINDICAR {zip} →" },
  ru: { own:"ВЛАДЕЙ ЭТИМ БЛОКОМ? 💰", pin:"Закрепи бизнес в {zip} за $29/мес", claim:"ЗАБРАТЬ {zip} →" },
  ar: { own:"تملك هذه المنطقة؟ 💰", pin:"ثبت عملك في {zip} مقابل $29/شهر", claim:"استحوذ على {zip} →" },
  hi: { own:"इस ब्लॉक के मालिक? 💰", pin:"{zip} में अपना बिजनेस पिन करें $29/महीना", claim:"{zip} क्लेम करें →" },
  it: { own:"POSSIEDI QUESTO BLOCCO? 💰", pin:"Fissa la tua attività a {zip} per $29/mese", claim:"RICHIEDI {zip} →" },
  nl: { own:"BEZIT DIT BLOK? 💰", pin:"Pin je bedrijf in {zip} voor $29/maand", claim:"CLAIM {zip} →" },
  tl: { own:"IKAW BA MAY-ARI NG BLOCK NA ITO? 💰", pin:"I-pin negosyo mo sa {zip} $29/buwan", claim:"I-CLAIM {zip} →" },
  bn: { own:"এই ব্লকের মালিক? 💰", pin:"{zip} এ আপনার ব্যবসা পিন করুন $29/মাস", claim:"{zip} দাবি করুন →" },
  id: { own:"MILIKI BLOK INI? 💰", pin:"Sematkan bisnismu di {zip} $29/bln", claim:"KLAIM {zip} →" },
  vi: { own:"SỞ HỮU KHỐI NÀY? 💰", pin:"Ghim doanh nghiệp của bạn tại {zip} $29/tháng", claim:"NHẬN {zip} →" },
  th: { own:"เป็นเจ้าของบล็อกนี้? 💰", pin:"ปักหมุดธุรกิจของคุณใน {zip} $29/เดือน", claim:"เคลม {zip} →" },
  sv: { own:"ÄG DETTA BLOCK? 💰", pin:"Fäst ditt företag i {zip} för $29/mån", claim:"CLAIMA {zip} →" },
  pl: { own:"POSIADASZ TEN BLOK? 💰", pin:"Przypnij biznes w {zip} za $29/mies", claim:"ZGARNIJ {zip} →" },
  tr: { own:"BU BLOĞA SAHİP OL? 💰", pin:"İşletmeni {zip} içinde sabitle $29/ay", claim:"{zip} AL →" },
  uk: { own:"ВОЛОДІЄШ ЦИМ БЛОКОМ? 💰", pin:"Закріпи бізнес у {zip} за $29/міс", claim:"ЗАБРАТИ {zip} →" },
  el: { own:"ΚΑΤΕΧΕΙΣ ΑΥΤΟ ΤΟ BLOCK? 💰", pin:"Καρφίτσωσε την επιχείρησή σου σε {zip} για $29/μήνα", claim:"ΔΙΕΚΔΙΚΗΣΕ {zip} →" },
  he: { own:"בבעלותך הבלוק הזה? 💰", pin:"הצמד את העסק שלך ב-{zip} ב-$29/חודש", claim:"תבע את {zip} →" },
  ur: { own:"اس بلاک کے مالک؟ 💰", pin:"{zip} میں اپنا کاروبار پن کریں $29/ماہ", claim:"{zip} کلیم کریں →" },
  fa: { own:"صاحب این بلوک هستید؟ 💰", pin:"کسب و کار خود را در {zip} برای $29/ماه پین کنید", claim:"{zip} را بگیرید →" },
  ms: { own:"MILIKI BLOK INI? 💰", pin:"Pin perniagaan anda di {zip} $29/bln", claim:"TUNTUT {zip} →" },
  ro: { own:"DEȚII ACEST BLOC? 💰", pin:"Fixează-ți afacerea în {zip} pentru $29/lună", claim:"REVENDICĂ {zip} →" },
  cs: { own:"VLASTNÍŠ TENTO BLOK? 💰", pin:"Připni firmu v {zip} za $29/měs", claim:"ZÍSKAT {zip} →" },
  hu: { own:"TIÉD EZ A BLOKK? 💰", pin:"Rögzítsd vállalkozásod {zip}-ben $29/hó", claim:"IGÉNYELD {zip} →" },
  fi: { own:"OMISTATKO TÄMÄN BLOKIN? 💰", pin:"Kiinnitä yrityksesi {zip} alueelle $29/kk", claim:"LUNASTA {zip} →" },
  no: { own:"EIER DENNE BLOKKEN? 💰", pin:"Fest bedriften din i {zip} for $29/mnd", claim:"KREV {zip} →" },
  da: { own:"EJER DU DENNE BLOK? 💰", pin:"Fastgør din virksomhed i {zip} for $29/md", claim:"KRÆV {zip} →" },
  bg: { own:"ПРИТЕЖАВАШ ТОЗИ БЛОК? 💰", pin:"Закачи бизнеса си в {zip} за $29/месец", claim:"ВЗЕМИ {zip} →" },
  hr: { own:"POSJEDUJEŠ OVAJ BLOK? 💰", pin:"Prikvači posao u {zip} za $29/mj", claim:"PREUZMI {zip} →" },
  sr: { own:"ПОСЕДУЈЕШ ОВАЈ БЛОК? 💰", pin:"Закачи посао у {zip} за $29/мес", claim:"ПРЕУЗМИ {zip} →" },
  sk: { own:"VLASTNÍŠ TENTO BLOK? 💰", pin:"Pripni biznis v {zip} za $29/mes", claim:"ZÍSKAJ {zip} →" },
  sl: { own:"LASTIŠ TA BLOK? 💰", pin:"Pripni podjetje v {zip} za $29/mes", claim:"ZAHTEVAJ {zip} →" },
  et: { own:"OMAD SEDA BLOKKI? 💰", pin:"Kinnita äri {zip} piirkonnas $29/kuu", claim:"NÕUA {zip} →" },
  lv: { own:"TEV PIEDER ŠIS BLOKS? 💰", pin:"Piespraud biznesu {zip} par $29/mēn", claim:"PIEPRASI {zip} →" },
  lt: { own:"VALDAI ŠĮ BLOKĄ? 💰", pin:"Prisek verslą {zip} už $29/mėn", claim:"GAUTI {zip} →" },
  be: { own:"ВАЛОДАЕШ ГЭТЫМ БЛОКАМ? 💰", pin:"Замацуй бізнес у {zip} за $29/мес", claim:"ЗАБРАЦЬ {zip} →" },
  ka: { own:"ფლობ ამ ბლოკს? 💰", pin:"დააფიქსირე ბიზნესი {zip}-ში $29/თვეში", claim:"მოითხოვე {zip} →" },
  hy: { own:"ՏԻՐՈՒՄ ԵՍ ԱՅՍ ԲԼՈԿԻՆ? 💰", pin:"Ամրացրու բիզնեսդ {zip}-ում $29/ամիս", claim:"ՊԱՀԱՆՋԻՐ {zip} →" },
  az: { own:"BU BLOKA SAHİBSƏN? 💰", pin:"Biznesini {zip}-də $29/ay üçün sabitl", claim:"{zip} TƏLƏB ET →" },
  kk: { own:"ОСЫ БЛОКҚА ИЕЛІК ЕТЕСІЗ БЕ? 💰", pin:"Бизнесіңді {zip} ішінде $29/айға бекіт", claim:"{zip} АЛУ →" },
  ky: { own:"БУЛ БЛОКТУН ЭЭСИСИҢБИ? 💰", pin:"Бизнесиңди {zip} ичинде $29/айга бекит", claim:"{zip} АЛУУ →" },
  uz: { own:"BU BLOKKA EGALIK QILASIZMI? 💰", pin:"Biznesingizni {zip} da $29/oyga mahkamlang", claim:"{zip} OLISH →" },
  tg: { own:"СОҲИБИ ИН БЛОК ҲАСТЕД? 💰", pin:"Тиҷорати худро дар {zip} барои $29/моҳ маҳкам кунед", claim:"{zip} ГИРИФТАН →" },
  mn: { own:"ЭНЭ БЛОКИЙГ ЭЗЭМШДЭГ ҮҮ? 💰", pin:"Бизнесээ {zip} дотор $29/сараар бэхлээрэй", claim:"{zip} АВАХ →" },
  km: { own:"អ្នកជាម្ចាស់ប្លុកនេះ? 💰", pin:"ខ្ទាស់អាជីវកម្មរបស់អ្នកនៅ {zip} $29/ខែ", claim:"ទាមទារ {zip} →" },
  lo: { own:"ເປັນເຈົ້າຂອງບລັອກນີ້? 💰", pin:"ປັກຫມຸດ​ທຸ​ລະ​ກິດ​ຂອງ​ທ່ານ​ໃນ {zip} $29/ເດືອນ", claim:"ຮຽກຮ້ອງ {zip} →" },
  my: { own:"ဒီဘလောက်ကို ပိုင်ဆိုင်ပါသလား? 💰", pin:"{zip} တွင် သင့်လုပ်ငန်းကို $29/လဖြင့် ပင်ထိုးပါ", claim:"{zip} တောင်းဆိုပါ →" },
}

export function OwnThisBlock() {
  const { zip } = useLocation()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const safeZip = zip || 'your block'

  return (
    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 border-2 border-black">
      <div className="text-black font-black text-sm">{d.own}</div>
      <div className="text-black/80 text-xs mt-1">{d.pin.replace('{zip}', safeZip)}</div>
      <a href="/business/claim" className="mt-3 block bg-black text-white text-xs font-black px-4 py-2 rounded-full text-center hover:bg-black/80">
        {d.claim.replace('{zip}', safeZip)}
      </a>
    </div>
  )
}
export default OwnThisBlock
