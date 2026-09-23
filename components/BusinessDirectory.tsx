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
  tl: { title:"Lokal na Negosyo", near:"Malapit sa {area}", loadingArea:"Naglo-load ng {area}...", loading:"Naglo-load...", noBiz:"Wala pang negosyo", police:"Pulisya ng {city}", fire:"Bumbero ng {city}", library:"Aklatan ng {city}", community:"Community Center ng {city}", catPolice:"Pulis", catFire:"Bumbero", catLib:"Aklatan", catComm:"Komunidad" },
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

// TRUE 53 explicit category translator for inner DB values that come in English
const CAT_T: Record<string, Record<string,string>> = {
  en: { police:"Police", fire:"Fire Station", library:"Library", community:"Community", restaurant:"Restaurant", cafe:"Cafe", grocery:"Grocery", pharmacy:"Pharmacy", bank:"Bank", gas:"Gas Station", gym:"Gym", salon:"Salon" },
  es: { police:"Policía", fire:"Estación Bomberos", library:"Biblioteca", community:"Comunidad", restaurant:"Restaurante", cafe:"Café", grocery:"Supermercado", pharmacy:"Farmacia", bank:"Banco", gas:"Gasolinera", gym:"Gimnasio", salon:"Salón" },
  fr: { police:"Police", fire:"Pompiers", library:"Bibliothèque", community:"Communauté", restaurant:"Restaurant", cafe:"Café", grocery:"Épicerie", pharmacy:"Pharmacie", bank:"Banque", gas:"Station essence", gym:"Salle de sport", salon:"Salon" },
  de: { police:"Polizei", fire:"Feuerwache", library:"Bibliothek", community:"Gemeinschaft", restaurant:"Restaurant", cafe:"Café", grocery:"Lebensmittel", pharmacy:"Apotheke", bank:"Bank", gas:"Tankstelle", gym:"Fitnessstudio", salon:"Salon" },
  zh: { police:"警察", fire:"消防站", library:"图书馆", community:"社区", restaurant:"餐厅", cafe:"咖啡馆", grocery:"杂货店", pharmacy:"药店", bank:"银行", gas:"加油站", gym:"健身房", salon:"理发店" },
  ja: { police:"警察", fire:"消防署", library:"図書館", community:"コミュニティ", restaurant:"レストラン", cafe:"カフェ", grocery:"食料品店", pharmacy:"薬局", bank:"銀行", gas:"ガソリンスタンド", gym:"ジム", salon:"サロン" },
  ko: { police:"경찰", fire:"소방서", library:"도서관", community:"커뮤니티", restaurant:"식당", cafe:"카페", grocery:"식료품점", pharmacy:"약국", bank:"은행", gas:"주유소", gym:"헬스장", salon:"미용실" },
  pt: { police:"Polícia", fire:"Bombeiros", library:"Biblioteca", community:"Comunidade", restaurant:"Restaurante", cafe:"Café", grocery:"Mercado", pharmacy:"Farmácia", bank:"Banco", gas:"Posto gasolina", gym:"Academia", salon:"Salão" },
  ru: { police:"Полиция", fire:"Пожарная", library:"Библиотека", community:"Сообщество", restaurant:"Ресторан", cafe:"Кафе", grocery:"Продукты", pharmacy:"Аптека", bank:"Банк", gas:"АЗС", gym:"Спортзал", salon:"Салон" },
  ar: { police:"شرطة", fire:"إطفاء", library:"مكتبة", community:"مجتمع", restaurant:"مطعم", cafe:"مقهى", grocery:"بقالة", pharmacy:"صيدلية", bank:"بنك", gas:"محطة وقود", gym:"صالة رياضية", salon:"صالون" },
  hi: { police:"पुलिस", fire:"फायर स्टेशन", library:"पुस्तकालय", community:"समुदाय", restaurant:"रेस्तरां", cafe:"कैफे", grocery:"किराना", pharmacy:"फार्मेसी", bank:"बैंक", gas:"पेट्रोल पंप", gym:"जिम", salon:"सैलून" },
  it: { police:"Polizia", fire:"Vigili del Fuoco", library:"Biblioteca", community:"Comunità", restaurant:"Ristorante", cafe:"Bar", grocery:"Alimentari", pharmacy:"Farmacia", bank:"Banca", gas:"Benzinaio", gym:"Palestra", salon:"Salone" },
  nl: { police:"Politie", fire:"Brandweer", library:"Bibliotheek", community:"Gemeenschap", restaurant:"Restaurant", cafe:"Café", grocery:"Supermarkt", pharmacy:"Apotheek", bank:"Bank", gas:"Tankstation", gym:"Sportschool", salon:"Salon" },
  tl: { police:"Pulis", fire:"Bumbero", library:"Aklatan", community:"Komunidad", restaurant:"Restaurant", cafe:"Cafe", grocery:"Grocery", pharmacy:"Botika", bank:"Bangko", gas:"Gasolinahan", gym:"Gym", salon:"Salon" },
  bn: { police:"পুলিশ", fire:"ফায়ার স্টেশন", library:"লাইব্রেরি", community:"সম্প্রদায়", restaurant:"রেস্তোরাঁ", cafe:"ক্যাফে", grocery:"মুদি", pharmacy:"ফার্মেসি", bank:"ব্যাংক", gas:"পেট্রোল পাম্প", gym:"জিম", salon:"সেলুন" },
  id: { police:"Polisi", fire:"Damkar", library:"Perpustakaan", community:"Komunitas", restaurant:"Restoran", cafe:"Kafe", grocery:"Toko kelontong", pharmacy:"Apotek", bank:"Bank", gas:"SPBU", gym:"Gym", salon:"Salon" },
  vi: { police:"Công an", fire:"Cứu hỏa", library:"Thư viện", community:"Cộng đồng", restaurant:"Nhà hàng", cafe:"Quán cà phê", grocery:"Tạp hóa", pharmacy:"Nhà thuốc", bank:"Ngân hàng", gas:"Cây xăng", gym:"Phòng gym", salon:"Salon" },
  th: { police:"ตำรวจ", fire:"ดับเพลิง", library:"ห้องสมุด", community:"ชุมชน", restaurant:"ร้านอาหาร", cafe:"ร้านกาแฟ", grocery:"ร้านขายของชำ", pharmacy:"ร้านขายยา", bank:"ธนาคาร", gas:"ปั๊มน้ำมัน", gym:"ยิม", salon:"ร้านเสริมสวย" },
  sv: { police:"Polis", fire:"Brandstation", library:"Bibliotek", community:"Gemenskap", restaurant:"Restaurang", cafe:"Café", grocery:"Livsmedel", pharmacy:"Apotek", bank:"Bank", gas:"Bensinstation", gym:"Gym", salon:"Salong" },
  pl: { police:"Policja", fire:"Straż", library:"Biblioteka", community:"Społeczność", restaurant:"Restauracja", cafe:"Kawiarnia", grocery:"Spożywczy", pharmacy:"Apteka", bank:"Bank", gas:"Stacja paliw", gym:"Siłownia", salon:"Salon" },
  tr: { police:"Polis", fire:"İtfaiye", library:"Kütüphane", community:"Topluluk", restaurant:"Restoran", cafe:"Kafe", grocery:"Market", pharmacy:"Eczane", bank:"Banka", gas:"Benzinlik", gym:"Spor salonu", salon:"Kuaför" },
  uk: { police:"Поліція", fire:"Пожежна", library:"Бібліотека", community:"Громада", restaurant:"Ресторан", cafe:"Кафе", grocery:"Продукти", pharmacy:"Аптека", bank:"Банк", gas:"АЗС", gym:"Спортзал", salon:"Салон" },
  el: { police:"Αστυνομία", fire:"Πυροσβεστική", library:"Βιβλιοθήκη", community:"Κοινότητα", restaurant:"Εστιατόριο", cafe:"Καφετέρια", grocery:"Παντοπωλείο", pharmacy:"Φαρμακείο", bank:"Τράπεζα", gas:"Βενζινάδικο", gym:"Γυμναστήριο", salon:"Κομμωτήριο" },
  he: { police:"משטרה", fire:"כבאות", library:"ספרייה", community:"קהילה", restaurant:"מסעדה", cafe:"בית קפה", grocery:"מכולת", pharmacy:"בית מרקחת", bank:"בנק", gas:"תחנת דלק", gym:"חדר כושר", salon:"מספרה" },
  ur: { police:"پولیس", fire:"فائر", library:"لائبریری", community:"کمیونٹی", restaurant:"ریستوراں", cafe:"کیفے", grocery:"کریانہ", pharmacy:"فارمیسی", bank:"بینک", gas:"پٹرول پمپ", gym:"جم", salon:"سیلون" },
  fa: { police:"پلیس", fire:"آتش نشانی", library:"کتابخانه", community:"جامعه", restaurant:"رستوران", cafe:"کافه", grocery:"خواربار", pharmacy:"داروخانه", bank:"بانک", gas:"پمپ بنزین", gym:"باشگاه", salon:"آرایشگاه" },
  ms: { police:"Polis", fire:"Bomba", library:"Perpustakaan", community:"Komuniti", restaurant:"Restoran", cafe:"Kafe", grocery:"Kedai runcit", pharmacy:"Farmasi", bank:"Bank", gas:"Stesen minyak", gym:"Gim", salon:"Salon" },
  ro: { police:"Poliție", fire:"Pompieri", library:"Bibliotecă", community:"Comunitate", restaurant:"Restaurant", cafe:"Cafenea", grocery:"Alimentară", pharmacy:"Farmacie", bank:"Bancă", gas:"Benzinărie", gym:"Sală", salon:"Salon" },
  cs: { police:"Policie", fire:"Hasiči", library:"Knihovna", community:"Komunita", restaurant:"Restaurace", cafe:"Kavárna", grocery:"Potraviny", pharmacy:"Lékárna", bank:"Banka", gas:"Benzínka", gym:"Posilovna", salon:"Salon" },
  hu: { police:"Rendőrség", fire:"Tűzoltóság", library:"Könyvtár", community:"Közösség", restaurant:"Étterem", cafe:"Kávézó", grocery:"Élelmiszer", pharmacy:"Gyógyszertár", bank:"Bank", gas:"Benzinkút", gym:"Edzőterem", salon:"Szalon" },
  fi: { police:"Poliisi", fire:"Palokunta", library:"Kirjasto", community:"Yhteisö", restaurant:"Ravintola", cafe:"Kahvila", grocery:"Ruokakauppa", pharmacy:"Apteekki", bank:"Pankki", gas:"Huoltoasema", gym:"Kuntosali", salon:"Parturi" },
  no: { police:"Politi", fire:"Brann", library:"Bibliotek", community:"Samfunn", restaurant:"Restaurant", cafe:"Kafé", grocery:"Dagligvare", pharmacy:"Apotek", bank:"Bank", gas:"Bensinstasjon", gym:"Treningssenter", salon:"Salong" },
  da: { police:"Politi", fire:"Brand", library:"Bibliotek", community:"Fællesskab", restaurant:"Restaurant", cafe:"Café", grocery:"Købmand", pharmacy:"Apotek", bank:"Bank", gas:"Tankstation", gym:"Fitness", salon:"Salon" },
  bg: { police:"Полиция", fire:"Пожарна", library:"Библиотека", community:"Общност", restaurant:"Ресторант", cafe:"Кафене", grocery:"Хранителни", pharmacy:"Аптека", bank:"Банка", gas:"Бензиностанция", gym:"Фитнес", salon:"Салон" },
  hr: { police:"Policija", fire:"Vatrogasci", library:"Knjižnica", community:"Zajednica", restaurant:"Restoran", cafe:"Kafić", grocery:"Trgovina", pharmacy:"Ljekarna", bank:"Banka", gas:"Benzinska", gym:"Teretana", salon:"Salon" },
  sr: { police:"Полиција", fire:"Ватрогасци", library:"Библиотека", community:"Заједница", restaurant:"Ресторан", cafe:"Кафић", grocery:"Продавница", pharmacy:"Апотека", bank:"Банка", gas:"Бензинска", gym:"Теретана", salon:"Салон" },
  sk: { police:"Polícia", fire:"Hasiči", library:"Knižnica", community:"Komunita", restaurant:"Reštaurácia", cafe:"Kaviareň", grocery:"Potraviny", pharmacy:"Lekáreň", bank:"Banka", gas:"Benzínka", gym:"Posilňovňa", salon:"Salón" },
  sl: { police:"Policija", fire:"Gasilci", library:"Knjižnica", community:"Skupnost", restaurant:"Restavracija", cafe:"Kavarna", grocery:"Trgovina", pharmacy:"Lekarna", bank:"Banka", gas:"Bencinska", gym:"Fitnes", salon:"Salon" },
  et: { police:"Politsei", fire:"Pääste", library:"Raamatukogu", community:"Kogukond", restaurant:"Restoran", cafe:"Kohvik", grocery:"Toidupood", pharmacy:"Apteek", bank:"Pank", gas:"Tankla", gym:"Jõusaal", salon:"Salong" },
  lv: { police:"Policija", fire:"Ugunsdzēsēji", library:"Bibliotēka", community:"Kopiena", restaurant:"Restorāns", cafe:"Kafejnīca", grocery:"Pārtikas veikals", pharmacy:"Aptieka", bank:"Banka", gas:"Degvielas uzpilde", gym:"Sporta zāle", salon:"Salons" },
  lt: { police:"Policija", fire:"Priešgaisrinė", library:"Biblioteka", community:"Bendruomenė", restaurant:"Restoranas", cafe:"Kavinė", grocery:"Maisto prekės", pharmacy:"Vaistinė", bank:"Bankas", gas:"Degalinė", gym:"Sporto salė", salon:"Salonas" },
  be: { police:"Паліцыя", fire:"Пажарная", library:"Бібліятэка", community:"Супольнасць", restaurant:"Рэстаран", cafe:"Кафэ", grocery:"Прадукты", pharmacy:"Аптэка", bank:"Банк", gas:"Запраўка", gym:"Спартзала", salon:"Салон" },
  ka: { police:"პოლიცია", fire:"სახანძრო", library:"ბიბლიოთეკა", community:"საზოგადოება", restaurant:"რესტორანი", cafe:"კაფე", grocery:"სასურსათო", pharmacy:"აფთიაქი", bank:"ბანკი", gas:"ბენზინგასამართი", gym:"სპორტდარბაზი", salon:"სალონი" },
  hy: { police:"Ոստիկանություն", fire:"Հրշեջ", library:"Գրադարան", community:"Համայնք", restaurant:"Ռեստորան", cafe:"Սրճարան", grocery:"Մթերային", pharmacy:"Դեղատուն", bank:"Բանկ", gas:"Բենզալցակայան", gym:"Մարզասրահ", salon:"Սրահ" },
  az: { police:"Polis", fire:"Yanğın", library:"Kitabxana", community:"İcma", restaurant:"Restoran", cafe:"Kafe", grocery:"Ərzaq", pharmacy:"Aptek", bank:"Bank", gas:"Yanacaqdoldurma", gym:"İdman zalı", salon:"Salon" },
  kk: { police:"Полиция", fire:"Өрт", library:"Кітапхана", community:"Қоғам", restaurant:"Мейрамхана", cafe:"Кафе", grocery:"Азық-түлік", pharmacy:"Дәріхана", bank:"Банк", gas:"Жанармай", gym:"Спортзал", salon:"Салон" },
  ky: { police:"Полиция", fire:"Өрт", library:"Китепкана", community:"Коом", restaurant:"Ресторан", cafe:"Кафе", grocery:"Азык-түлүк", pharmacy:"Дарыкана", bank:"Банк", gas:"Май куюуучу", gym:"Спортзал", salon:"Салон" },
  uz: { police:"Politsiya", fire:"Yong'in", library:"Kutubxona", community:"Jamiyat", restaurant:"Restoran", cafe:"Kafe", grocery:"Oziq-ovqat", pharmacy:"Dorixona", bank:"Bank", gas:"Yoqilg'i", gym:"Sport zal", salon:"Salon" },
  tg: { police:"Полис", fire:"Оташнишонӣ", library:"Китобхона", community:"Ҷомеа", restaurant:"Тарабхона", cafe:"Қаҳвахона", grocery:"Хӯрокворӣ", pharmacy:"Дорухона", bank:"Бонк", gas:"Сӯзишворӣ", gym:"Толори варзиш", salon:"Салон" },
  mn: { police:"Цагдаа", fire:"Гал", library:"Номын сан", community:"Олон нийт", restaurant:"Ресторан", cafe:"Кафе", grocery:"Хүнсний дэлгүүр", pharmacy:"Эмийн сан", bank:"Банк", gas:"Шатахуун", gym:"Фитнес", salon:"Салон" },
  km: { police:"ប៉ូលីស", fire:"ពន្លត់អគ្គីភ័យ", library:"បណ្ណាល័យ", community:"សហគមន៍", restaurant:"ភោជនីយដ្ឋាន", cafe:"ហាងកាហ្វេ", grocery:"ហាងលក់គ្រឿងទេស", pharmacy:"ឱសថស្ថាន", bank:"ធនាគារ", gas:"ស្ថានីយប្រេង", gym:"កន្លែងហាត់ប្រាណ", salon:"ហាងកាត់សក់" },
  lo: { police:"ຕຳຫຼວດ", fire:"ດັບເພີງ", library:"ຫໍສະໝຸດ", community:"ຊຸມຊົນ", restaurant:"ຮ້ານອາຫານ", cafe:"ຮ້ານກາເຟ", grocery:"ຮ້ານຂາຍເຄື່ອງຍ່ອຍ", pharmacy:"ຮ້ານຂາຍຢາ", bank:"ທະນາຄານ", gas:"ປ້ຳນ້ຳມັນ", gym:"ຫ້ອງອອກກຳລັງກາຍ", salon:"ຮ້ານເສີມສວຍ" },
  my: { police:"ရဲ", fire:"မီးသတ်", library:"စာကြည့်တိုက်", community:"ရပ်ရွာ", restaurant:"စားသောက်ဆိုင်", cafe:"ကော်ဖီဆိုင်", grocery:"ကုန်စုံဆိုင်", pharmacy:"ဆေးဆိုင်", bank:"ဘဏ်", gas:"ဆီဆိုင်", gym:"အားကစားရုံ", salon:"အလှပြင်ဆိုင်" },
}

function tCat(raw: string | null, lang: string): string {
  if (!raw) return ''
  const lower = raw.toLowerCase().trim()
  const dict = CAT_T[lang] || CAT_T.en
  // direct key match
  for (const k of Object.keys(CAT_T.en)) if (lower.includes(k) || lower === k) return (dict as any)[k] || raw
  return raw // keep original name if not a known category
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
      (<div className="mt-3 space-y-2">{display.map(b=>(
        <div key={b.id} className="bg-white/5 rounded-xl p-2.5 text-xs flex justify-between">
          <span className="truncate">{b.name}</span>
          <span className="text-white/40">{tCat(b.category, language) || b.category || ''}</span>
        </div>
      ))}</div>)}
    </div>
  )
}
export default BusinessDirectory
