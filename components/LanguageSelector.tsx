'use client'

import { useState } from 'react'
import { useLanguage, LANGUAGE_NAMES, type Language } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { popular:"Popular", europe:"Europe", mea:"Middle East & Asia", central:"Central Asia", langLabel:"Language", close:"Close language menu" },
  es: { popular:"Popular", europe:"Europa", mea:"Medio Oriente y Asia", central:"Asia Central", langLabel:"Idioma", close:"Cerrar menú idioma" },
  fr: { popular:"Populaire", europe:"Europe", mea:"Moyen-Orient et Asie", central:"Asie Centrale", langLabel:"Langue", close:"Fermer menu langue" },
  de: { popular:"Beliebt", europe:"Europa", mea:"Naher Osten & Asien", central:"Zentralasien", langLabel:"Sprache", close:"Sprachmenü schließen" },
  zh: { popular:"热门", europe:"欧洲", mea:"中东与亚洲", central:"中亚", langLabel:"语言", close:"关闭语言菜单" },
  ja: { popular:"人気", europe:"ヨーロッパ", mea:"中東・アジア", central:"中央アジア", langLabel:"言語", close:"言語メニューを閉じる" },
  ko: { popular:"인기", europe:"유럽", mea:"중동 및 아시아", central:"중앙아시아", langLabel:"언어", close:"언어 메뉴 닫기" },
  pt: { popular:"Popular", europe:"Europa", mea:"Oriente Médio e Ásia", central:"Ásia Central", langLabel:"Idioma", close:"Fechar menu idioma" },
  ru: { popular:"Популярные", europe:"Европа", mea:"Ближний Восток и Азия", central:"Центральная Азия", langLabel:"Язык", close:"Закрыть меню языка" },
  ar: { popular:"شائع", europe:"أوروبا", mea:"الشرق الأوسط وآسيا", central:"آسيا الوسطى", langLabel:"لغة", close:"إغلاق قائمة اللغة" },
  hi: { popular:"लोकप्रिय", europe:"यूरोप", mea:"मध्य पूर्व और एशिया", central:"मध्य एशिया", langLabel:"भाषा", close:"भाषा मेनू बंद करें" },
  it: { popular:"Popolare", europe:"Europa", mea:"Medio Oriente e Asia", central:"Asia Centrale", langLabel:"Lingua", close:"Chiudi menu lingua" },
  nl: { popular:"Populair", europe:"Europa", mea:"Midden-Oosten & Azië", central:"Centraal-Azië", langLabel:"Taal", close:"Taalmenu sluiten" },
  tl: { popular:"Sikat", europe:"Europa", mea:"Gitnang Silangan at Asya", central:"Gitnang Asya", langLabel:"Wika", close:"Isara menu ng wika" },
  bn: { popular:"জনপ্রিয়", europe:"ইউরোপ", mea:"মধ্যপ্রাচ্য ও এশিয়া", central:"মধ্য এশিয়া", langLabel:"ভাষা", close:"ভাষা মেনু বন্ধ করুন" },
  id: { popular:"Populer", europe:"Eropa", mea:"Timur Tengah & Asia", central:"Asia Tengah", langLabel:"Bahasa", close:"Tutup menu bahasa" },
  vi: { popular:"Phổ biến", europe:"Châu Âu", mea:"Trung Đông & Châu Á", central:"Trung Á", langLabel:"Ngôn ngữ", close:"Đóng menu ngôn ngữ" },
  th: { popular:"ยอดนิยม", europe:"ยุโรป", mea:"ตะวันออกกลางและเอเชีย", central:"เอเชียกลาง", langLabel:"ภาษา", close:"ปิดเมนูภาษา" },
  sv: { popular:"Populär", europe:"Europa", mea:"Mellanöstern och Asien", central:"Centralasien", langLabel:"Språk", close:"Stäng språkmeny" },
  pl: { popular:"Popularne", europe:"Europa", mea:"Bliski Wschód i Azja", central:"Azja Środkowa", langLabel:"Język", close:"Zamknij menu języka" },
  tr: { popular:"Popüler", europe:"Avrupa", mea:"Orta Doğu ve Asya", central:"Orta Asya", langLabel:"Dil", close:"Dil menüsünü kapat" },
  uk: { popular:"Популярні", europe:"Європа", mea:"Близький Схід і Азія", central:"Центральна Азія", langLabel:"Мова", close:"Закрити меню мови" },
  el: { popular:"Δημοφιλή", europe:"Ευρώπη", mea:"Μέση Ανατολή και Ασία", central:"Κεντρική Ασία", langLabel:"Γλώσσα", close:"Κλείσιμο μενού γλώσσας" },
  he: { popular:"פופולרי", europe:"אירופה", mea:"מזרח תיכון ואסיה", central:"מרכז אסיה", langLabel:"שפה", close:"סגור תפריט שפה" },
  ur: { popular:"مقبول", europe:"یورپ", mea:"مشرق وسطی اور ایشیا", central:"وسطی ایشیا", langLabel:"زبان", close:"زبان مینو بند کریں" },
  fa: { popular:"محبوب", europe:"اروپا", mea:"خاورمیانه و آسیا", central:"آسیای مرکزی", langLabel:"زبان", close:"بستن منوی زبان" },
  ms: { popular:"Popular", europe:"Eropah", mea:"Timur Tengah & Asia", central:"Asia Tengah", langLabel:"Bahasa", close:"Tutup menu bahasa" },
  ro: { popular:"Popular", europe:"Europa", mea:"Orientul Mijlociu și Asia", central:"Asia Centrală", langLabel:"Limbă", close:"Închide meniu limbă" },
  cs: { popular:"Populární", europe:"Evropa", mea:"Blízký východ a Asie", central:"Střední Asie", langLabel:"Jazyk", close:"Zavřít jazykové menu" },
  hu: { popular:"Népszerű", europe:"Európa", mea:"Közel-Kelet és Ázsia", central:"Közép-Ázsia", langLabel:"Nyelv", close:"Nyelvi menü bezárása" },
  fi: { popular:"Suosittu", europe:"Eurooppa", mea:"Lähi-itä ja Aasia", central:"Keski-Aasia", langLabel:"Kieli", close:"Sulje kielivalikko" },
  no: { popular:"Populær", europe:"Europa", mea:"Midtøsten og Asia", central:"Sentral-Asia", langLabel:"Språk", close:"Lukk språkmeny" },
  da: { popular:"Populær", europe:"Europa", mea:"Mellemøsten og Asien", central:"Centralasien", langLabel:"Sprog", close:"Luk sprogmenu" },
  bg: { popular:"Популярни", europe:"Европа", mea:"Близък Изток и Азия", central:"Централна Азия", langLabel:"Език", close:"Затвори езиково меню" },
  hr: { popular:"Popularno", europe:"Europa", mea:"Bliski Istok i Azija", central:"Središnja Azija", langLabel:"Jezik", close:"Zatvori jezični izbornik" },
  sr: { popular:"Популарно", europe:"Европа", mea:"Блиски Исток и Азија", central:"Централна Азија", langLabel:"Језик", close:"Затвори језички мени" },
  sk: { popular:"Populárne", europe:"Európa", mea:"Blízky východ a Ázia", central:"Stredná Ázia", langLabel:"Jazyk", close:"Zavrieť jazykové menu" },
  sl: { popular:"Priljubljeno", europe:"Evropa", mea:"Bližnji vzhod in Azija", central:"Srednja Azija", langLabel:"Jezik", close:"Zapri jezikovni meni" },
  et: { popular:"Populaarne", europe:"Euroopa", mea:"Lähis-Ida ja Aasia", central:"Kesk-Aasia", langLabel:"Keel", close:"Sulge keelemenüü" },
  lv: { popular:"Populārs", europe:"Eiropa", mea:"Tuvie Austrumi un Āzija", central:"Centrālāzija", langLabel:"Valoda", close:"Aizvērt valodas izvēlni" },
  lt: { popular:"Populiaru", europe:"Europa", mea:"Artimieji Rytai ir Azija", central:"Centrinė Azija", langLabel:"Kalba", close:"Uždaryti kalbos meniu" },
  be: { popular:"Папулярныя", europe:"Еўропа", mea:"Блізкі Усход і Азія", central:"Цэнтральная Азія", langLabel:"Мова", close:"Закрыць моўнае меню" },
  ka: { popular:"პოპულარული", europe:"ევროპა", mea:"ახლო აღმოსავლეთი და აზია", central:"ცენტრალური აზია", langLabel:"ენა", close:"ენის მენიუს დახურვა" },
  hy: { popular:"Հանրաճանաչ", europe:"Եվրոպա", mea:"Մերձավոր Արևելք և Ասիա", central:"Կենտրոնական Ասիա", langLabel:"Լեզու", close:"Փակել լեզվի մենյուն" },
  az: { popular:"Populyar", europe:"Avropa", mea:"Yaxın Şərq və Asiya", central:"Mərkəzi Asiya", langLabel:"Dil", close:"Dil menyusunu bağla" },
  kk: { popular:"Танымал", europe:"Еуропа", mea:"Таяу Шығыс және Азия", central:"Орталық Азия", langLabel:"Тіл", close:"Тіл мәзірін жабу" },
  ky: { popular:"Популярдуу", europe:"Европа", mea:"Жакынкы Чыгыш жана Азия", central:"Борбордук Азия", langLabel:"Тил", close:"Тил менюсун жабуу" },
  uz: { popular:"Mashhur", europe:"Yevropa", mea:"Yaqin Sharq va Osiyo", central:"Markaziy Osiyo", langLabel:"Til", close:"Til menyusini yopish" },
  tg: { popular:"Машҳур", europe:"Аврупо", mea:"Ховари Миёна ва Осиё", central:"Осиёи Марказӣ", langLabel:"Забон", close:"Менюи забонро пӯшидан" },
  mn: { popular:"Алдартай", europe:"Европ", mea:"Ойрхи Дорнод ба Ази", central:"Төв Ази", langLabel:"Хэл", close:"Хэлний цэсийг хаах" },
  km: { popular:"ពេញនិយម", europe:"អឺរ៉ុប", mea:"មជ្ឈិមបូព៌ានិងអាស៊ី", central:"អាស៊ីកណ្តាល", langLabel:"ភាសា", close:"បិទម៉ឺនុយភាសា" },
  lo: { popular:"ນິຍົມ", europe:"ເອີຣົບ", mea:"ຕາເວັນອອກກາງແລະອາຊີ", central:"ອາຊີກາງ", langLabel:"ພາສາ", close:"ປິດເມນູພາສາ" },
  my: { popular:"ရေပန်းစားသော", europe:"ဥရောပ", mea:"အရှေ့အလယ်ပိုင်းနှင့် အာရှ", central:"အလယ်အာရှ", langLabel:"ဘာသာစကား", close:"ဘာသာစကားမီနူးပိတ်ရန်" },
}

export default function LanguageSelector() {
  const { language, setLanguage, languageName } = useLanguage()
  const d = D[language] || D.en
  const [isOpen, setIsOpen] = useState(false)

  const languageGroups = [
    { name: d.popular, languages: ['en','es','fr','de','zh','ja','ko','tl','hi','ar','pt','ru'] },
    { name: d.europe, languages: ['it','nl','sv','pl','uk','el','tr','cs','hu','fi','no','da','bg','hr','sr','sk','sl','et','lv','lt','be','ro'] },
    { name: d.mea, languages: ['he','ur','fa','id','vi','th','ms','km','lo','my','bn'] },
    { name: d.central, languages: ['ka','hy','az','kk','ky','uz','tg','mn'] }
  ] as const

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(value =>!value)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-white text-xs font-black transition"
        aria-label={d.langLabel}
      >
        <span className="text-lg">🌐</span>
        <span>{languageName}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-black border border-white/20 rounded-xl shadow-xl overflow-hidden z-50 w-56 max-h-96 overflow-y-auto">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-white/50 hover:text-white text-xs"
            aria-label={d.close}
          >
            ✕
          </button>

          {languageGroups.map(group => (
            <div key={group.name}>
              <div className="px-4 py-2 text-xs font-bold text-white/50 uppercase tracking-wider sticky top-0 bg-black">
                {group.name}
              </div>

              {group.languages.map(code => {
                const lang = code as Language
                return (
                  <button
                    type="button"
                    key={lang}
                    onClick={() => {
                      console.log('[BRAIN] Switching to:', lang)
                      setLanguage(lang)
                      localStorage.setItem('sss_language', lang)
                      window.dispatchEvent(new Event('languageChanged'))
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition ${
                      language === lang
                      ? 'bg-white/20 text-white'
                        : 'text-white/70'
                    }`}
                  >
                    {LANGUAGE_NAMES[lang]}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
