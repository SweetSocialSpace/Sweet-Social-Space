'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { title:"Local Businesses", near:"Near {area}", loadingArea:"Loading {area}...", loading:"Loading...", noBiz:"No businesses yet", police:"{city} Police Department", fire:"{city} Fire Department", library:"{city} Library", community:"{city} Community Center", catPolice:"Police", catFire:"Fire Station", catLib:"Library", catComm:"Community" },
  es: { title:"Negocios Locales", near:"Cerca de {area}", loadingArea:"Cargando {area}...", loading:"Cargando...", noBiz:"Aún no hay negocios", police:"Departamento de Policía de {city}", fire:"Departamento de Bomberos de {city}", library:"Biblioteca de {city}", community:"Centro Comunitario de {city}", catPolice:"Policía", catFire:"Estación Bomberos", catLib:"Biblioteca", catComm:"Comunidad" },
  fr: { title:"Commerces Locaux", near:"Près de {area}", loadingArea:"Chargement {area}...", loading:"Chargement...", noBiz:"Pas encore d'entreprises", police:"Département Police de {city}", fire:"Pompiers de {city}", library:"Bibliothèque de {city}", community:"Centre Communautaire de {city}", catPolice:"Police", catFire:"Pompiers", catLib:"Bibliothèque", catComm:"Communauté" },
  de: { title:"Lokale Unternehmen", near:"Nahe {area}", loadingArea:"Lade {area}...", loading:"Laden...", noBiz:"Noch keine Unternehmen", police:"{city} Polizei", fire:"{city} Feuerwehr", library:"{city} Bibliothek", community:"{city} Gemeindezentrum", catPolice:"Polizei", catFire:"Feuerwache", catLib:"Bibliothek", catComm:"Gemeinschaft" },
  zh: { title:"本地商家", near:"{area} 附近", loadingArea:"正在加载 {area}...", loading:"加载中...", noBiz:"暂无商家", police:"{city} 警察局", fire:"{city} 消防局", library:"{city} 图书馆", community:"{city} 社区中心", catPolice:"警察", catFire:"消防站", catLib:"图书馆", catComm:"社区" },
  ja: { title:"地元企業", near:"{area} 付近", loadingArea:"{area} を読み込み中...", loading:"読み込み中...", noBiz:"まだビジネスがありません", police:"{city} 警察署", fire:"{city} 消防署", library:"{city} 図書館", community:"{city} コミュニティセンター", catPolice:"警察", catFire:"消防署", catLib:"図書館", catComm:"コミュニティ" },
  ko: { title:"지역 비즈니스", near:"{area} 근처", loadingArea:"{area} 로딩 중...", loading:"로딩 중...", noBiz:"아직 비즈니스가 없습니다", police:"{city} 경찰서", fire:"{city} 소방서", library:"{city} 도서관", community:"{city} 커뮤니티 센터", catPolice:"경찰", catFire:"소방서", catLib:"도서관", catComm:"커뮤니티" },
  pt: { title:"Negócios Locais", near:"Perto de {area}", loadingArea:"Carregando {area}...", loading:"Carregando...", noBiz:"Ainda não há negócios", police:"Departamento de Polícia de {city}", fire:"Corpo de Bombeiros de {city}", library:"Biblioteca de {city}", community:"Centro Comunitário de {city}", catPolice:"Polícia", catFire:"Bombeiros", catLib:"Biblioteca", catComm:"Comunidade" },
  ru: { title:"Местные бизнесы", near:"Рядом с {area}", loadingArea:"Загрузка {area}...", loading:"Загрузка...", noBiz:"Пока нет бизнесов", police:"Полиция {city}", fire:"Пожарная {city}", library:"Библиотека {city}", community:"Общественный центр {city}", catPolice:"Полиция", catFire:"Пожарная", catLib:"Библиотека", catComm:"Сообщество" },
  ar: { title:"الأعمال المحلية", near:"بالقرب من {area}", loadingArea:"جار تحميل {area}...", loading:"جار التحميل...", noBiz:"لا توجد أعمال بعد", police:"قسم شرطة {city}", fire:"إدارة إطفاء {city}", library:"مكتبة {city}", community:"مركز مجتمع {city}", catPolice:"شرطة", catFire:"إطفاء", catLib:"مكتبة", catComm:"مجتمع" },
  hi: { title:"स्थानीय व्यवसाय", near:"{area} के पास", loadingArea:"{area} लोड हो रहा...", loading:"लोड हो रहा...", noBiz:"अभी कोई व्यवसाय नहीं", police:"{city} पुलिस विभाग", fire:"{city} फायर विभाग", library:"{city} पुस्तकालय", community:"{city} सामुदायिक केंद्र", catPolice:"पुलिस", catFire:"फायर स्टेशन", catLib:"पुस्तकालय", catComm:"समुदाय" },
  it: { title:"Attività Locali", near:"Vicino a {area}", loadingArea:"Caricamento {area}...", loading:"Caricamento...", noBiz:"Ancora nessuna attività", police:"Polizia di {city}", fire:"Vigili del Fuoco di {city}", library:"Biblioteca di {city}", community:"Centro Comunitario di {city}", catPolice:"Polizia", catFire:"Vigili del Fuoco", catLib:"Biblioteca", catComm:"Comunità" },
  nl: { title:"Lokale Bedrijven", near:"Dicht bij {area}", loadingArea:"{area} laden...", loading:"Laden...", noBiz:"Nog geen bedrijven", police:"{city} Politie", fire:"{city} Brandweer", library:"{city} Bibliotheek", community:"{city} Buurthuis", catPolice:"Politie", catFire:"Brandweer", catLib:"Bibliotheek", catComm:"Gemeenschap" },
  tl: { title:"Lokal na Negosyo", near:"Malapit sa {area}", loadingArea:"Naglo-load ng {area}...", loading:"Naglo-load...", noBiz:"Wala pang negosyo", police:"Pulisya ng {city}", fire:"Bumbero ng {city}", library:"Aklatan ng {city}", community:"Community Center ng {city}", catPolice:"Pulis", catFire:"Bumbero", catLib:"Library", catComm:"Komunidad" },
  bn: { title:"স্থানীয় ব্যবসা", near:"{area} এর কাছে", loadingArea:"{area} লোড হচ্ছে...", loading:"লোড হচ্ছে...", noBiz:"এখনো কোনো ব্যবসা নেই", police:"{city} পুলিশ বিভাগ", fire:"{city} ফায়ার বিভাগ", library:"{city} লাইব্রেরি", community:"{city} কমিউনিটি সেন্টার", catPolice:"পুলিশ", catFire:"ফায়ার স্টেশন", catLib:"লাইব্রেরি", catComm:"সম্প্রদায়" },
  id: { title:"Bisnis Lokal", near:"Dekat {area}", loadingArea:"Memuat {area}...", loading:"Memuat...", noBiz:"Belum ada bisnis", police:"Kepolisian {city}", fire:"Pemadam Kebakaran {city}", library:"Perpustakaan {city}", community:"Pusat Komunitas {city}", catPolice:"Polisi", catFire:"Damkar", catLib:"Perpustakaan", catComm:"Komunitas" },
  vi: { title:"Doanh Nghiệp Địa Phương", near:"Gần {area}", loadingArea:"Đang tải {area}...", loading:"Đang tải...", noBiz:"Chưa có doanh nghiệp", police:"Công An {city}", fire:"Cứu Hỏa {city}", library:"Thư Viện {city}", community:"Trung Tâm Cộng Đồng {city}", catPolice:"Công an", catFire:"Cứu hỏa", catLib:"Thư viện", catComm:"Cộng đồng" },
  th: { title:"ธุรกิจท้องถิ่น", near:"ใกล้ {area}", loadingArea:"กำลังโหลด {area}...", loading:"กำลังโหลด...", noBiz:"ยังไม่มีธุรกิจ", police:"กรมตำรวจ {city}", fire:"ดับเพลิง {city}", library:"ห้องสมุด {city}", community:"ศูนย์ชุมชน {city}", catPolice:"ตำรวจ", catFire:"ดับเพลิง", catLib:"ห้องสมุด", catComm:"ชุมชน" },
  sv: { title:"Lokala Företag", near:"Nära {area}", loadingArea:"Laddar {area}...", loading:"Laddar...", noBiz:"Inga företag än", police:"{city} Polis", fire:"{city} Brandkår", library:"{city} Bibliotek", community:"{city} Fritidsgård", catPolice:"Polis", catFire:"Brandstation", catLib:"Bibliotek", catComm:"Gemenskap" },
  pl: { title:"Lokalne Firmy", near:"Blisko {area}", loadingArea:"Ładowanie {area}...", loading:"Ładowanie...", noBiz:"Brak firm", police:"Policja {city}", fire:"Straż Pożarna {city}", library:"Biblioteka {city}", community:"Centrum Społeczne {city}", catPolice:"Policja", catFire:"Straż", catLib:"Biblioteka", catComm:"Społeczność" },
  tr: { title:"Yerel İşletmeler", near:"{area} yakınında", loadingArea:"{area} yükleniyor...", loading:"Yükleniyor...", noBiz:"Henüz işletme yok", police:"{city} Polis", fire:"{city} İtfaiye", library:"{city} Kütüphane", community:"{city} Toplum Merkezi", catPolice:"Polis", catFire:"İtfaiye", catLib:"Kütüphane", catComm:"Topluluk" },
  uk: { title:"Місцеві Бізнеси", near:"Біля {area}", loadingArea:"Завантаження {area}...", loading:"Завантаження...", noBiz:"Ще немає бізнесів", police:"Поліція {city}", fire:"Пожежна {city}", library:"Бібліотека {city}", community:"Громадський центр {city}", catPolice:"Поліція", catFire:"Пожежна", catLib:"Бібліотека", catComm:"Громада" },
  el: { title:"Τοπικές Επιχειρήσεις", near:"Κοντά σε {area}", loadingArea:"Φόρτωση {area}...", loading:"Φόρτωση...", noBiz:"Καμία επιχείρηση ακόμα", police:"Αστυνομία {city}", fire:"Πυροσβεστική {city}", library:"Βιβλιοθήκη {city}", community:"Κοινοτικό Κέντρο {city}", catPolice:"Αστυνομία", catFire:"Πυροσβεστική", catLib:"Βιβλιοθήκη", catComm:"Κοινότητα" },
  he: { title:"עסקים מקומיים", near:"ליד {area}", loadingArea:"טוען {area}...", loading:"טוען...", noBiz:"אין עסקים עדיין", police:"משטרת {city}", fire:"כבאות {city}", library:"ספריית {city}", community:"מרכז קהילתי {city}", catPolice:"משטרה", catFire:"כבאות", catLib:"ספרייה", catComm:"קהילה" },
  ur: { title:"مقامی کاروبار", near:"{area} کے قریب", loadingArea:"{area} لوڈ ہو رہا...", loading:"لوڈ ہو رہا...", noBiz:"ابھی کوئی کاروبار نہیں", police:"{city} پولیس", fire:"{city} فائر", library:"{city} لائبریری", community:"{city} کمیونٹی سینٹر", catPolice:"پولیس", catFire:"فائر", catLib:"لائبریری", catComm:"کمیونٹی" },
  fa: { title:"کسب و کارهای محلی", near:"نزدیک {area}", loadingArea:"در حال بارگذاری {area}...", loading:"در حال بارگذاری...", noBiz:"هنوز کسب و کاری نیست", police:"پلیس {city}", fire:"آتش نشانی {city}", library:"کتابخانه {city}", community:"مرکز اجتماع {city}", catPolice:"پلیس", catFire:"آتش نشانی", catLib:"کتابخانه", catComm:"جامعه" },
  ms: { title:"Perniagaan Tempatan", near:"Berhampiran {area}", loadingArea:"Memuat {area}...", loading:"Memuat...", noBiz:"Tiada perniagaan lagi", police:"Polis {city}", fire:"Bomba {city}", library:"Perpustakaan {city}", community:"Pusat Komuniti {city}", catPolice:"Polis", catFire:"Bomba", catLib:"Perpustakaan", catComm:"Komuniti" },
  ro: { title:"Afaceri Locale", near:"Lângă {area}", loadingArea:"Se încarcă {area}...", loading:"Se încarcă...", noBiz:"Nicio afacere încă", police:"Poliția {city}", fire:"Pompierii {city}", library:"Biblioteca {city}", community:"Centru Comunitar {city}", catPolice:"Poliție", catFire:"Pompieri", catLib:"Bibliotecă", catComm:"Comunitate" },
  cs: { title:"Místní Firmy", near:"Blízko {area}", loadingArea:"Načítání {area}...", loading:"Načítání...", noBiz:"Zatím žádné firmy", police:"Policie {city}", fire:"Hasiči {city}", library:"Knihovna {city}", community:"Komunitní centrum {city}", catPolice:"Policie", catFire:"Hasiči", catLib:"Knihovna", catComm:"Komunita" },
  hu: { title:"Helyi Vállalkozások", near:"{area} közelében", loadingArea:"{area} betöltése...", loading:"Betöltés...", noBiz:"Még nincs vállalkozás", police:"{city} Rendőrség", fire:"{city} Tűzoltóság", library:"{city} Könyvtár", community:"{city} Közösségi Központ", catPolice:"Rendőrség", catFire:"Tűzoltóság", catLib:"Könyvtár", catComm:"Közösség" },
  fi: { title:"Paikalliset Yritykset", near:"Lähellä {area}", loadingArea:"Ladataan {area}...", loading:"Ladataan...", noBiz:"Ei yrityksiä vielä", police:"{city} Poliisi", fire:"{city} Palokunta", library:"{city} Kirjasto", community:"{city} Yhteisökeskus", catPolice:"Poliisi", catFire:"Palokunta", catLib:"Kirjasto", catComm:"Yhteisö" },
  no: { title:"Lokale Bedrifter", near:"Nær {area}", loadingArea:"Laster {area}...", loading:"Laster...", noBiz:"Ingen bedrifter ennå", police:"{city} Politi", fire:"{city} Brannvesen", library:"{city} Bibliotek", community:"{city} Samfunnshus", catPolice:"Politi", catFire:"Brann", catLib:"Bibliotek", catComm:"Samfunn" },
  da: { title:"Lokale Virksomheder", near:"Nær {area}", loadingArea:"Indlæser {area}...", loading:"Indlæser...", noBiz:"Ingen virksomheder endnu", police:"{city} Politi", fire:"{city} Brandvæsen", library:"{city} Bibliotek", community:"{city} Medborgerhus", catPolice:"Politi", catFire:"Brand", catLib:"Bibliotek", catComm:"Fællesskab" },
  bg: { title:"Местни Бизнеси", near:"Близо до {area}", loadingArea:"Зареждане {area}...", loading:"Зареждане...", noBiz:"Все още няма бизнеси", police:"Полиция {city}", fire:"Пожарна {city}", library:"Библиотека {city}", community:"Общностен център {city}", catPolice:"Полиция", catFire:"Пожарна", catLib:"Библиотека", catComm:"Общност" },
  hr: { title:"Lokalna Poduzeća", near:"Blizu {area}", loadingArea:"Učitavanje {area}...", loading:"Učitavanje...", noBiz:"Još nema poduzeća", police:"Policija {city}", fire:"Vatrogasci {city}", library:"Knjižnica {city}", community:"Društveni centar {city}", catPolice:"Policija", catFire:"Vatrogasci", catLib:"Knjižnica", catComm:"Zajednica" },
  sr: { title:"Локална Предузећа", near:"Близу {area}", loadingArea:"Учитавање {area}...", loading:"Учитавање...", noBiz:"Још нема предузећа", police:"Полиција {city}", fire:"Ватрогасци {city}", library:"Библиотека {city}", community:"Друштвени центар {city}", catPolice:"Полиција", catFire:"Ватрогасци", catLib:"Библиотека", catComm:"Заједница" },
  sk: { title:"Miestne Firmy", near:"Blízko {area}", loadingArea:"Načítava sa {area}...", loading:"Načítava sa...", noBiz:"Zatiaľ žiadne firmy", police:"Polícia {city}", fire:"Hasiči {city}", library:"Knižnica {city}", community:"Komunitné centrum {city}", catPolice:"Polícia", catFire:"Hasiči", catLib:"Knižnica", catComm:"Komunita" },
  sl: { title:"Lokalna Podjetja", near:"Blizu {area}", loadingArea:"Nalaganje {area}...", loading:"Nalaganje...", noBiz:"Ni še podjetij", police:"Policija {city}", fire:"Gasilci {city}", library:"Knjižnica {city}", community:"Skupnostni center {city}", catPolice:"Policija", catFire:"Gasilci", catLib:"Knjižnica", catComm:"Skupnost" },
  et: { title:"Kohalikud Ettevõtted", near:"Lähedal {area}", loadingArea:"Laadimine {area}...", loading:"Laadimine...", noBiz:"Ettevõtteid veel pole", police:"{city} Politsei", fire:"{city} Pääste", library:"{city} Raamatukogu", community:"{city} Kogukonnakeskus", catPolice:"Politsei", catFire:"Pääste", catLib:"Raamatukogu", catComm:"Kogukond" },
  lv: { title:"Vietējie Uzņēmumi", near:"Netālu no {area}", loadingArea:"Ielādē {area}...", loading:"Ielādē...", noBiz:"Vēl nav uzņēmumu", police:"{city} Policija", fire:"{city} Ugunsdzēsēji", library:"{city} Bibliotēka", community:"{city} Kopienas centrs", catPolice:"Policija", catFire:"Ugunsdzēsēji", catLib:"Bibliotēka", catComm:"Kopiena" },
  lt: { title:"Vietiniai Verslai", near:"Netoli {area}", loadingArea:"Įkeliama {area}...", loading:"Įkeliama...", noBiz:"Kol kas nėra verslų", police:"{city} Policija", fire:"{city} Priešgaisrinė", library:"{city} Biblioteka", community:"{city} Bendruomenės centras", catPolice:"Policija", catFire:"Priešgaisrinė", catLib:"Biblioteka", catComm:"Bendruomenė" },
  be: { title:"Мясцовыя Бізнесы", near:"Каля {area}", loadingArea:"Загрузка {area}...", loading:"Загрузка...", noBiz:"Пакуль няма бізнесаў", police:"Паліцыя {city}", fire:"Пажарная {city}", library:"Бібліятэка {city}", community:"Грамадскі цэнтр {city}", catPolice:"Паліцыя", catFire:"Пажарная", catLib:"Бібліятэка", catComm:"Супольнасць" },
  ka: { title:"ადგილობრივი ბიზნესები", near:"{area}-თან ახლოს", loadingArea:"იტვირთება {area}...", loading:"იტვირთება...", noBiz:"ბიზნესი ჯერ არ არის", police:"{city} პოლიცია", fire:"{city} სახანძრო", library:"{city} ბიბლიოთეკა", community:"{city} საზოგადოებრივი ცენტრი", catPolice:"პოლიცია", catFire:"სახანძრო", catLib:"ბიბლიოთეკა", catComm:"საზოგადოება" },
  hy: { title:"Տեղական Բիզնեսներ", near:"{area}-ի մոտ", loadingArea:"Բեռնում {area}...", loading:"Բեռնում...", noBiz:"Դեռ բիզնես չկա", police:"{city} Ոստիկանություն", fire:"{city} Հրշեջ", library:"{city} Գրադարան", community:"{city} Համայնքային կենտրոն", catPolice:"Ոստիկանություն", catFire:"Հրշեջ", catLib:"Գրադարան", catComm:"Համայնք" },
  az: { title:"Yerli Bizneslər", near:"{area} yaxınında", loadingArea:"{area} yüklənir...", loading:"Yüklənir...", noBiz:"Hələ biznes yoxdur", police:"{city} Polis", fire:"{city} Yanğınsöndürmə", library:"{city} Kitabxana", community:"{city} İcma Mərkəzi", catPolice:"Polis", catFire:"Yanğın", catLib:"Kitabxana", catComm:"İcma" },
  kk: { title:"Жергілікті Бизнестер", near:"{area} жанында", loadingArea:"{area} жүктелуде...", loading:"Жүктелуде...", noBiz:"Әлі бизнес жоқ", police:"{city} Полиция", fire:"{city} Өрт сөндіру", library:"{city} Кітапхана", community:"{city} Қоғамдық орталық", catPolice:"Полиция", catFire:"Өрт", catLib:"Кітапхана", catComm:"Қоғам" },
  ky: { title:"Жергиликтүү Бизнестер", near:"{area} жанында", loadingArea:"{area} жүктөлүүдө...", loading:"Жүктөлүүдө...", noBiz:"Азырынча бизнес жок", police:"{city} Полиция", fire:"{city} Өрт өчүрүү", library:"{city} Китепкана", community:"{city} Коомдук борбор", catPolice:"Полиция", catFire:"Өрт", catLib:"Китепкана", catComm:"Коом" },
  uz: { title:"Mahalliy Bizneslar", near:"{area} yaqinida", loadingArea:"{area} yuklanmoqda...", loading:"Yuklanmoqda...", noBiz:"Hali biznes yo'q", police:"{city} Politsiya", fire:"{city} O't o'chirish", library:"{city} Kutubxona", community:"{city} Jamiyat markazi", catPolice:"Politsiya", catFire:"Yong'in", catLib:"Kutubxona", catComm:"Jamiyat" },
  tg: { title:"Тиҷоратҳои маҳаллӣ", near:"Назди {area}", loadingArea:"Боркунии {area}...", loading:"Боркунӣ...", noBiz:"Ҳоло тиҷорат нест", police:"Полиси {city}", fire:"Оташнишонии {city}", library:"Китобхонаи {city}", community:"Маркази ҷомеаи {city}", catPolice:"Полис", catFire:"Оташнишонӣ", catLib:"Китобхона", catComm:"Ҷомеа" },
  mn: { title:"Орон Нутгийн Бизнес", near:"{area} ойролцоо", loadingArea:"{area} ачааллаж байна...", loading:"Ачааллаж байна...", noBiz:"Одоогоор бизнес алга", police:"{city} Цагдаа", fire:"{city} Гал түймэр", library:"{city} Номын сан", community:"{city} Олон нийтийн төв", catPolice:"Цагдаа", catFire:"Гал", catLib:"Номын сан", catComm:"Олон нийт" },
  km: { title:"អាជីវកម្មក្នុងស្រុក", near:"ជិត {area}", loadingArea:"កំពុងផ្ទុក {area}...", loading:"កំពុងផ្ទុក...", noBiz:"មិនទាន់មានអាជីវកម្ម", police:"ប៉ូលីស {city}", fire:"ពន្លត់អគ្គីភ័យ {city}", library:"បណ្ណាល័យ {city}", community:"មជ្ឈមណ្ឌលសហគមន៍ {city}", catPolice:"ប៉ូលីស", catFire:"ពន្លត់អគ្គីភ័យ", catLib:"បណ្ណាល័យ", catComm:"សហគមន៍" },
  lo: { title:"ທຸລະກິດທ້ອງຖິ່ນ", near:"ໃກ້ {area}", loadingArea:"ກຳລັງໂຫຼດ {area}...", loading:"ກຳລັງໂຫຼດ...", noBiz:"ຍັງບໍ່ມີທຸລະກິດ", police:"ຕຳຫຼວດ {city}", fire:"ດັບເພີງ {city}", library:"ຫໍສະໝຸດ {city}", community:"ສູນຊຸມຊົນ {city}", catPolice:"ຕຳຫຼວດ", catFire:"ດັບເພີງ", catLib:"ຫໍສະໝຸດ", catComm:"ຊຸມຊົນ" },
  my: { title:"ဒေသခံလုပ်ငန်းများ", near:"{area} အနီး", loadingArea:"{area} ကို တင်နေသည်...", loading:"တင်နေသည်...", noBiz:"လုပ်ငန်းမရှိသေးပါ", police:"{city} ရဲဌာန", fire:"{city} မီးသတ်", library:"{city} စာကြည့်တိုက်", community:"{city} ရပ်ရွာစင်တာ", catPolice:"ရဲ", catFire:"မီးသတ်", catLib:"စာကြည့်တိုက်", catComm:"ရပ်ရွာ" },
}

type Biz = { id: string; name: string; category: string | null; latitude?: number | null; longitude?: number | null }

export function BusinessDirectory(){
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const { filter } = useLocationScope()
  const [biz, setBiz] = useState<Biz[]>([])
  const [liveBiz, setLiveBiz] = useState<Biz[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if (!zip) return
    let mounted = true
    const CACHE_KEY = `biz_${zip}_v1`
    const CACHE_TIME_KEY = `biz_${zip}_v1_time`

    const fetchLiveBusinesses = async () => {
      if (!mounted) return
      setLoading(true)
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
        if (cached && cachedTime && Date.now() - parseInt(cachedTime) < 15*60*1000) {
          if(mounted){ setLiveBiz(JSON.parse(cached)); setLoading(false) }
          return
        }
        const displayCity = city || zip
        const fallback: Biz[] = [
          { id: 'fb-1', name: d.police.replace('{city}', displayCity), category: d.catPolice },
          { id: 'fb-2', name: d.fire.replace('{city}', displayCity), category: d.catFire },
          { id: 'fb-3', name: d.library.replace('{city}', displayCity), category: d.catLib },
          { id: 'fb-4', name: d.community.replace('{city}', displayCity), category: d.catComm },
        ]
        if(mounted){
          setLiveBiz(fallback)
          localStorage.setItem(CACHE_KEY, JSON.stringify(fallback))
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
        }
      } catch {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached && mounted) setLiveBiz(JSON.parse(cached))
      } finally { if(mounted) setLoading(false) }
    }

    const load = async () => {
      try {
        const supabase = createClient() as any
        let data: any[] = []
        if (filter.lat!= null && filter.lng!= null) {
          const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
          const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)
          const { data: bizData } = await supabase.from('businesses').select('id,name,category,latitude,longitude').gte('latitude', bbox.minLat).lte('latitude', bbox.maxLat).gte('longitude', bbox.minLng).lte('longitude', bbox.maxLng).order('verified',{ascending:false}).limit(10)
          if (bizData) data = applyScope(bizData, filter)
        } else {
          const { data: bizData } = await supabase.from('businesses').select('id,name,category').eq('zip_code', zip).order('verified',{ascending:false}).limit(4)
          data = bizData || []
        }
        if(mounted && data.length > 0){ setBiz(data) } else { fetchLiveBusinesses() }
      } catch { if(mounted) fetchLiveBusinesses() }
    }
    load()
    const id = setInterval(()=>{ if(mounted) { try { load() } catch {} } }, 20*60*1000)
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[zip, city, filter, d])

  const display = biz.length > 0? biz : liveBiz
  const displayArea = zip === 'GLOBAL' ||!zip? (city || 'your area') : zip

  if (!zip) return (<div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">{d.title}</p><p className="text-xs text-white/50">{d.loadingArea.replace('{area}', displayArea)}</p></div>)

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">{d.title}</p>
      <p className="text-xs text-white/50 mt-1">{d.near.replace('{area}', displayArea)}</p>
      {loading? <p className="text-sm mt-3 text-white/60">{d.loading}</p> :
      display.length===0? <p className="text-sm mt-3 text-white/60">{d.noBiz}</p> :
      (<div className="mt-3 space-y-2">{display.map(b=>(<div key={b.id} className="bg-white/5 rounded-xl p-2.5 text-xs flex justify-between"><span className="truncate">{b.name}</span><span className="text-white/40">{b.category||''}</span></div>))}</div>)}
    </div>
  )
}
export default BusinessDirectory
