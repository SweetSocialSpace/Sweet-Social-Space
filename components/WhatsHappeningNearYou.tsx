'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'

type EventItem = { id: string; title: string; venue?: string; icon?: string; source?: string }

const D: Record<string, any> = {
  en: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  es: { what:"Que pasa cerca de ti", near:"Cerca de", locating:"Localizando...", loading:"Cargando...", checking:"Revisando", eventsIn:"Eventos en", infoHighway:"Autopista de informacion", live:"En vivo: SeatGeek + APIs externas • radio 15mi" },
  fr: { what:"Que se passe-t-il pres de vous", near:"Pres de", locating:"Localisation...", loading:"Chargement...", checking:"Verification de", eventsIn:"Evenements a", infoHighway:"Autoroute d'information", live:"Live: SeatGeek + APIs externes • rayon 15mi" },
  de: { what:"Was passiert in deiner Nahe", near:"Nahe", locating:"Orte...", loading:"Laden...", checking:"Prufe", eventsIn:"Events in", infoHighway:"Informations-Highway", live:"Live: SeatGeek + Externe APIs • 15mi Radius" },
  zh: { what:"你附近发生了什么", near:"靠近", locating:"定位中...", loading:"加载中...", checking:"正在检查", eventsIn:"活动在", infoHighway:"信息高速", live:"实时：SeatGeek + 外部API • 15英里半径" },
  ja: { what:"あなたの近くで何が起きているか", near:"付近", locating:"特定中...", loading:"読み込み中...", checking:"確認中", eventsIn:"イベント", infoHighway:"情報ハイウェイ", live:"ライブ: SeatGeek + 外部API • 15マイル圏内" },
  ko: { what:"근처에서 무슨 일이", near:"근처", locating:"위치 확인중...", loading:"로딩중...", checking:"확인중", eventsIn:"이벤트", infoHighway:"정보 고속도로", live:"라이브: SeatGeek + 외부 API • 15마일 반경" },
  ru: { what:"Что происходит рядом с вами", near:"Рядом с", locating:"Определение...", loading:"Загрузка...", checking:"Проверка", eventsIn:"События в", infoHighway:"Информационное шоссе", live:"Live: SeatGeek + Внешние API • радиус 15 миль" },
  ar: { what:"ما الذي يحدث بالقرب منك", near:"بالقرب من", locating:"جاري التحديد...", loading:"جاري التحميل...", checking:"جاري التحقق", eventsIn:"فعاليات في", infoHighway:"طريق المعلومات السريع", live:"مباشر: SeatGeek + واجهات خارجية • نصف قطر 15 ميل" },
  pt: { what:"O que esta acontecendo perto de voce", near:"Perto de", locating:"Localizando...", loading:"Carregando...", checking:"Verificando", eventsIn:"Eventos em", infoHighway:"Rodovia da informacao", live:"Ao vivo: SeatGeek + APIs externas • raio 15mi" },
  it: { what:"Cosa succede vicino a te", near:"Vicino a", locating:"Localizzazione...", loading:"Caricamento...", checking:"Controllo", eventsIn:"Eventi a", infoHighway:"Autostrada informazione", live:"Live: SeatGeek + API esterne • raggio 15mi" },
  nl: { what:"Wat gebeurt er bij jou in de buurt", near:"Bij", locating:"Lokaliseren...", loading:"Laden...", checking:"Controleren", eventsIn:"Evenementen in", infoHighway:"Informatiesnelweg", live:"Live: SeatGeek + Externe APIs • 15mi straal" },
  tl: { what:"Anong nangyayari malapit sa iyo", near:"Malapit sa", locating:"Hinahanap...", loading:"Naglo-load...", checking:"Tinitingnan", eventsIn:"Mga event sa", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  hi: { what:"आपके पास क्या हो रहा है", near:"के पास", locating:"पता लगाया जा रहा...", loading:"लोड हो रहा...", checking:"जाँच हो रही", eventsIn:"आयोजन", infoHighway:"सूचना राजमार्ग", live:"लाइव: SeatGeek + बाहरी APIs • 15mi दायरा" },
  bn: { what:"আপনার কাছে কি ঘটছে", near:"কাছে", locating:"অবস্থান নির্ণয়...", loading:"লোড হচ্ছে...", checking:"পরীক্ষা করা হচ্ছে", eventsIn:"ইভেন্ট", infoHighway:"তথ্য মহাসড়ক", live:"লাইভ: SeatGeek + বাহ্যিক API • 15mi ব্যাসার্ধ" },
  id: { what:"Apa yang terjadi di dekatmu", near:"Dekat", locating:"Mencari lokasi...", loading:"Memuat...", checking:"Memeriksa", eventsIn:"Acara di", infoHighway:"Jalan Tol Informasi", live:"Live: SeatGeek + API Eksternal • radius 15mi" },
  vi: { what:"Dieu gi dang dien ra gan ban", near:"Gan", locating:"Dang dinh vi...", loading:"Dang tai...", checking:"Dang kiem tra", eventsIn:"Su kien tai", infoHighway:"Duong cao toc thong tin", live:"Truc tiep: SeatGeek + API ngoai • ban kinh 15mi" },
  th: { what:"เกิดอะไรขึ้นใกล้คุณ", near:"ใกล้", locating:"กำลังระบุตำแหน่ง...", loading:"กำลังโหลด...", checking:"กำลังตรวจสอบ", eventsIn:"กิจกรรมใน", infoHighway:"ทางด่วนข้อมูล", live:"สด: SeatGeek + API ภายนอก • รัศมี 15ไมล์" },
  sv: { what:"Vad hander nara dig", near:"Nara", locating:"Lokaliserar...", loading:"Laddar...", checking:"Kollar", eventsIn:"Evenemang i", infoHighway:"Informationsmotorvag", live:"Live: SeatGeek + Externa API:er • 15mi radie" },
  pl: { what:"Co dzieje sie w poblizu", near:"Blisko", locating:"Lokalizowanie...", loading:"Ladowanie...", checking:"Sprawdzanie", eventsIn:"Wydarzenia w", infoHighway:"Autostrada informacji", live:"Na zywo: SeatGeek + Zewnetrzne API • promien 15mi" },
  tr: { what:"Yakininda neler oluyor", near:"Yakininda", locating:"Konum bulunuyor...", loading:"Yukleniyor...", checking:"Kontrol ediliyor", eventsIn:"Etkinlikler", infoHighway:"Bilgi Otoyolu", live:"Canli: SeatGeek + Harici APIler • 15mi yariçap" },
  uk: { what:"Що відбувається поруч з вами", near:"Поруч з", locating:"Визначення...", loading:"Завантаження...", checking:"Перевірка", eventsIn:"Події в", infoHighway:"Інформаційна магістраль", live:"Live: SeatGeek + Зовнішні API • радіус 15 миль" },
  el: { what:"Τι συμβαίνει κοντά σας", near:"Κοντά σε", locating:"Εντοπισμός...", loading:"Φόρτωση...", checking:"Έλεγχος", eventsIn:"Εκδηλώσεις σε", infoHighway:"Λεωφόρος πληροφοριών", live:"Ζωντανά: SeatGeek + Εξωτερικά API • ακτίνα 15mi" },
  he: { what:"מה קורה לידך", near:"ליד", locating:"מאתר...", loading:"טוען...", checking:"בודק", eventsIn:"אירועים ב", infoHighway:"כביש המידע", live:"לייב: SeatGeek + API חיצוניים • רדיוס 15mi" },
  ur: { what:"آپ کے قریب کیا ہو رہا ہے", near:"قریب", locating:"مقام تلاش...", loading:"لوڈ ہو رہا...", checking:"چیک ہو رہا", eventsIn:"تقریبات", infoHighway:"انفارمیشن ہائی وے", live:"لائیو: SeatGeek + بیرونی APIs • 15mi رداس" },
  fa: { what:"در نزدیکی شما چه می‌گذرد", near:"نزدیک", locating:"در حال مکان‌یابی...", loading:"در حال بارگذاری...", checking:"در حال بررسی", eventsIn:"رویدادها در", infoHighway:"بزرگراه اطلاعات", live:"زنده: SeatGeek + API خارجی • شعاع 15 مایل" },
  ms: { what:"Apa berlaku berhampiran anda", near:"Dekat", locating:"Mengesan...", loading:"Memuat...", checking:"Memeriksa", eventsIn:"Acara di", infoHighway:"Lebuhraya Maklumat", live:"Live: SeatGeek + API Luaran • jejari 15mi" },
  ro: { what:"Ce se intampla langa tine", near:"Langa", locating:"Localizare...", loading:"Se incarca...", checking:"Se verifica", eventsIn:"Evenimente in", infoHighway:"Autostrada informatiei", live:"Live: SeatGeek + API externe • raza 15mi" },
  cs: { what:"Co se deje ve vasem okoli", near:"Blizko", locating:"Lokalizace...", loading:"Nacitani...", checking:"Kontrola", eventsIn:"Udalosti v", infoHighway:"Informacni dalnice", live:"Live: SeatGeek + Externi API • polomer 15mi" },
  hu: { what:"Mi tortenik a kozelben", near:"Kozeleben", locating:"Helymeghatarozas...", loading:"Betoltes...", checking:"Ellenorzes", eventsIn:"Esemenyek", infoHighway:"Informacios sztrada", live:"Elo: SeatGeek + Kulso API-k • 15mi sugar" },
  fi: { what:"Mita lahellasi tapahtuu", near:"Lahella", locating:"Paikannetaan...", loading:"Ladataan...", checking:"Tarkistetaan", eventsIn:"Tapahtumat kohteessa", infoHighway:"Tietovayla", live:"Live: SeatGeek + Ulkoiset API:t • 15mi sade" },
  no: { what:"Hva skjer i naerheten av deg", near:"Naer", locating:"Lokaliserer...", loading:"Laster...", checking:"Sjekker", eventsIn:"Arrangementer i", infoHighway:"Informasjonshoyvei", live:"Live: SeatGeek + Eksterne APIer • 15mi radius" },
  da: { what:"Hvad sker der i naerheden af dig", near:"Naer", locating:"Lokaliserer...", loading:"Indlaeser...", checking:"Tjekker", eventsIn:"Begivenheder i", infoHighway:"Informationsmotorvej", live:"Live: SeatGeek + Eksterne APIer • 15mi radius" },
  bg: { what:"Какво се случва близо до вас", near:"Близо до", locating:"Локализиране...", loading:"Зареждане...", checking:"Проверка", eventsIn:"Събития в", infoHighway:"Информационна магистрала", live:"На живо: SeatGeek + Външни API • радиус 15mi" },
  hr: { what:"Sto se dogada u vasoj blizini", near:"Blizu", locating:"Lociranje...", loading:"Ucitavanje...", checking:"Provjera", eventsIn:"Dogadaji u", infoHighway:"Informacijska autocesta", live:"Uzivo: SeatGeek + Vanjski API-ji • 15mi radijus" },
  sr: { what:"Sta se desava u vasoj blizini", near:"Blizu", locating:"Lociranje...", loading:"Ucitavanje...", checking:"Provera", eventsIn:"Dogadjaji u", infoHighway:"Informacioni autoput", live:"Uzivo: SeatGeek + Spoljni API-ji • 15mi radijus" },
  sk: { what:"Co sa deje vo vasom okoli", near:"Blizko", locating:"Lokalizacia...", loading:"Nacitanie...", checking:"Kontrola", eventsIn:"Udalosti v", infoHighway:"Informacna dialnica", live:"Live: SeatGeek + Externe API • polomer 15mi" },
  sl: { what:"Kaj se dogaja v blizini", near:"Blizu", locating:"Lociranje...", loading:"Nalaganje...", checking:"Preverjanje", eventsIn:"Dogodki v", infoHighway:"Informacijska avtocesta", live:"V zivo: SeatGeek + Zunanji API-ji • 15mi radij" },
  et: { what:"Mis sinu lahedal toimub", near:"Lahedal", locating:"Asukoha maaramine...", loading:"Laadimine...", checking:"Kontrollimine", eventsIn:"Sundmused asukohas", infoHighway:"Infokiirtee", live:"Live: SeatGeek + Valised API-d • 15mi raadius" },
  lv: { what:"Kas notiek netalu no jums", near:"Netalu no", locating:"Noteiksana...", loading:"Ielade...", checking:"Parbaude", eventsIn:"Pasakumi", infoHighway:"Informacijas lielcelsh", live:"Tiesraide: SeatGeek + Arejas API • 15mi radiuss" },
  lt: { what:"Kas vyksta salia jusu", near:"Salia", locating:"Nustatoma...", loading:"Ikeliama...", checking:"Tikrinama", eventsIn:"Renginiai", infoHighway:"Informacijos greitkelis", live:"Tiesiogiai: SeatGeek + Isorines API • 15mi spindulys" },
  be: { what:"Што адбываецца побач з вамі", near:"Побач з", locating:"Вызначэнне...", loading:"Загрузка...", checking:"Праверка", eventsIn:"Падзеі ў", infoHighway:"Інфармацыйная магістраль", live:"Live: SeatGeek + Знешнія API • радыус 15mi" },
  ka: { what:"რა ხდება თქვენს მახლობლად", near:"ახლოს", locating:"დადგენა...", loading:"იტვირთება...", checking:"შემოწმება", eventsIn:"ღონისძიებები", infoHighway:"ინფორმაციის მაგისტრალი", live:"Live: SeatGeek + გარე API • 15mi რადიუსი" },
  hy: { what:"Ինչ է կատարվում ձեր մոտակայքում", near:"Մոտ", locating:"Որոնում...", loading:"Բեռնում...", checking:"Ստուգում", eventsIn:"Իրադարձություններ", infoHighway:"Տեղեկատվական մայրուղի", live:"Live: SeatGeek + Արտաքին API • 15mi շառավիղ" },
  az: { what:"Yaxinliqda neler bas verir", near:"Yaxininda", locating:"Yerlesir...", loading:"Yuklenir...", checking:"Yoxlanir", eventsIn:"Tedbirler", infoHighway:"Melumat magistrali", live:"Canli: SeatGeek + Xarici API • 15mi radius" },
  kk: { what:"Жаныңызда не болып жатыр", near:"Жанында", locating:"Анықталуда...", loading:"Жүктелуде...", checking:"Тексерілуде", eventsIn:"Оқиғалар", infoHighway:"Ақпарат магистралі", live:"Live: SeatGeek + Сыртқы API • 15mi радиус" },
  ky: { what:"Жанынызда эмне болуп жатат", near:"Жанында", locating:"Аныкталууда...", loading:"Жүктөлүүдө...", checking:"Текшерилүүдө", eventsIn:"Иш-чаралар", infoHighway:"Маалымат магистралы", live:"Live: SeatGeek + Тышкы API • 15mi радиус" },
  uz: { what:"Yaqiningizda nima sodir bolmoqda", near:"Yaqinida", locating:"Joylashuv...", loading:"Yuklanmoqda...", checking:"Tekshirilmoqda", eventsIn:"Tadbirlar", infoHighway:"Axborot magistrali", live:"Jonli: SeatGeek + Tashqi API • 15mi radius" },
  tg: { what:"Дар наздикии шумо чи мегузарад", near:"Наздики", locating:"Муайян...", loading:"Боргири...", checking:"Санҷиш", eventsIn:"Чорабиниҳо", infoHighway:"Шоҳроҳи иттилоот", live:"Live: SeatGeek + API беруна • радиус 15mi" },
  mn: { what:"Таны ойролцоо юу болж байна", near:"Ойролцоо", locating:"Тодорхойлж...", loading:"Ачааллаж...", checking:"Шалгаж...", eventsIn:"Арга хэмжээ", infoHighway:"Мэдээллийн хурдны зам", live:"Live: SeatGeek + Гадаад API • 15mi радиус" },
  km: { what:"មានអ្វីកើតឡើងនៅជិតអ្នក", near:"នៅជិត", locating:"កំពុងកំណត់...", loading:"កំពុងផ្ទុក...", checking:"កំពុងពិនិត្យ", eventsIn:"ព្រឹត្តិការណ៍នៅ", infoHighway:"ផ្លូវល្បឿនលឿនព័ត៌មាន", live:"ផ្ទាល់: SeatGeek + API ខាងក្រៅ • រង្វង់ 15mi" },
  lo: { what:"ມີຫຍັງເກີດຂຶ້ນໃກ້ທ່ານ", near:"ໃກ້", locating:"ກຳລັງກວດຫາ...", loading:"ກຳລັງໂຫຼດ...", checking:"ກຳລັງກວດ", eventsIn:"ເຫດການໃນ", infoHighway:"ທາງດ່ວນຂໍ້ມູນ", live:"ສົດ: SeatGeek + API ພາຍນອກ • ລັດສະໝີ 15mi" },
  my: { what:"သင့်အနီးမှာ ဘာတွေဖြစ်နေလဲ", near:"အနီး", locating:"ရှာဖွေနေ...", loading:"တင်နေသည်...", checking:"စစ်ဆေးနေ", eventsIn:"ပွဲများ", infoHighway:"သတင်းအချက်အလက် အမြန်လမ်း", live:"တိုက်ရိုက်: SeatGeek + ပြင်ပ API • 15mi အချင်းဝက်" },
}

// Inner event titles from APIs - translate patterns
const EVENT_T: Record<string, Record<string,string>> = {
  es: {"Live Music near":"Musica en vivo cerca de","Local Market near":"Mercado local cerca de","Community Event":"Evento comunitario","Community Events in":"Eventos comunitarios en","Local Sports in":"Deportes locales en","Local Live":"En vivo local","Local Market":"Mercado local","Community Center":"Centro comunitario","Area Fields":"Campos del area","Local":"Local"},
  fr: {"Live Music near":"Musique live pres de","Local Market near":"Marche local pres de","Community Event":"Evenement communautaire","Community Events in":"Evenements a","Local Sports in":"Sports locaux a","Local Live":"Live local","Local Market":"Marche local","Community Center":"Centre communautaire","Area Fields":"Terrains locaux","Local":"Local"},
  de: {"Live Music near":"Live-Musik nahe","Local Market near":"Lokaler Markt nahe","Community Event":"Gemeinschaftsveranstaltung","Community Events in":"Community-Events in","Local Sports in":"Lokaler Sport in","Local Live":"Lokal Live","Local Market":"Lokaler Markt","Community Center":"Gemeindezentrum","Area Fields":"Sportplatze","Local":"Lokal"},
  zh: {"Live Music near":"靠近的现场音乐","Local Market near":"靠近的本地市场","Community Event":"社区活动","Community Events in":"社区活动在","Local Sports in":"本地体育在","Local Live":"本地现场","Local Market":"本地市场","Community Center":"社区中心","Area Fields":"区域场地","Local":"本地"},
  ja: {"Live Music near":"近くのライブ音楽","Local Market near":"近くのローカルマーケット","Community Event":"コミュニティイベント","Community Events in":"コミュニティイベント in","Local Sports in":"地元スポーツ in","Local Live":"ローカルライブ","Local Market":"ローカルマーケット","Community Center":"コミュニティセンター","Area Fields":"エリアフィールド","Local":"ローカル"},
  ko: {"Live Music near":"근처 라이브 음악","Local Market near":"근처 로컬 마켓","Community Event":"커뮤니티 이벤트","Community Events in":"커뮤니티 이벤트","Local Sports in":"로컬 스포츠","Local Live":"로컬 라이브","Local Market":"로컬 마켓","Community Center":"커뮤니티 센터","Area Fields":"지역 필드","Local":"로컬"},
  ru: {"Live Music near":"Живая музыка рядом","Local Market near":"Местный рынок рядом","Community Event":"Общественное мероприятие","Community Events in":"Мероприятия в","Local Sports in":"Местный спорт в","Local Live":"Местный лайв","Local Market":"Местный рынок","Community Center":"Общественный центр","Area Fields":"Местные поля","Local":"Местный"},
  ar: {"Live Music near":"موسيقى حية بالقرب من","Local Market near":"سوق محلي بالقرب من","Community Event":"حدث مجتمعي","Community Events in":"فعاليات مجتمعية في","Local Sports in":"رياضة محلية في","Local Live":"مباشر محلي","Local Market":"سوق محلي","Community Center":"مركز مجتمعي","Area Fields":"ملاعب المنطقة","Local":"محلي"},
  pt: {"Live Music near":"Musica ao vivo perto de","Local Market near":"Mercado local perto de","Community Event":"Evento comunitario","Community Events in":"Eventos comunitarios em","Local Sports in":"Esportes locais em","Local Live":"Ao vivo local","Local Market":"Mercado local","Community Center":"Centro comunitario","Area Fields":"Campos locais","Local":"Local"},
  it: {"Live Music near":"Musica live vicino a","Local Market near":"Mercato locale vicino a","Community Event":"Evento comunitario","Community Events in":"Eventi comunitari a","Local Sports in":"Sport locali a","Local Live":"Live locale","Local Market":"Mercato locale","Community Center":"Centro comunitario","Area Fields":"Campi locali","Local":"Locale"},
  nl: {"Live Music near":"Live muziek bij","Local Market near":"Lokale markt bij","Community Event":"Buurtevenement","Community Events in":"Buurtevenementen in","Local Sports in":"Lokale sport in","Local Live":"Lokaal Live","Local Market":"Lokale markt","Community Center":"Buurthuis","Area Fields":"Sportvelden","Local":"Lokaal"},
  tl: {"Live Music near":"Live Music malapit sa","Local Market near":"Local Market malapit sa","Community Event":"Community Event","Community Events in":"Community Events sa","Local Sports in":"Local Sports sa","Local Live":"Local Live","Local Market":"Local Market","Community Center":"Community Center","Area Fields":"Area Fields","Local":"Local"},
  hi: {"Live Music near":"के पास लाइव संगीत","Local Market near":"के पास स्थानीय बाजार","Community Event":"सामुदायिक कार्यक्रम","Community Events in":"में सामुदायिक कार्यक्रम","Local Sports in":"में स्थानीय खेल","Local Live":"स्थानीय लाइव","Local Market":"स्थानीय बाजार","Community Center":"सामुदायिक केंद्र","Area Fields":"क्षेत्रीय मैदान","Local":"स्थानीय"},
  bn: {"Live Music near":"কাছে লাইভ মিউজিক","Local Market near":"কাছে স্থানীয় বাজার","Community Event":"কমিউনিটি ইভেন্ট","Community Events in":"তে কমিউনিটি ইভেন্ট","Local Sports in":"তে স্থানীয় খেলা","Local Live":"স্থানীয় লাইভ","Local Market":"স্থানীয় বাজার","Community Center":"কমিউনিটি সেন্টার","Area Fields":"এলাকার মাঠ","Local":"স্থানীয়"},
  id: {"Live Music near":"Musik live dekat","Local Market near":"Pasar lokal dekat","Community Event":"Acara komunitas","Community Events in":"Acara komunitas di","Local Sports in":"Olahraga lokal di","Local Live":"Live lokal","Local Market":"Pasar lokal","Community Center":"Pusat komunitas","Area Fields":"Lapangan area","Local":"Lokal"},
  vi: {"Live Music near":"Nhac truc tiep gan","Local Market near":"Cho dia phuong gan","Community Event":"Su kien cong dong","Community Events in":"Su kien cong dong tai","Local Sports in":"The thao dia phuong tai","Local Live":"Truc tiep dia phuong","Local Market":"Cho dia phuong","Community Center":"Trung tam cong dong","Area Fields":"San bai khu vuc","Local":"Dia phuong"},
  th: {"Live Music near":"ดนตรีสดใกล้","Local Market near":"ตลาดท้องถิ่นใกล้","Community Event":"กิจกรรมชุมชน","Community Events in":"กิจกรรมชุมชนใน","Local Sports in":"กีฬาท้องถิ่นใน","Local Live":"ไลฟ์ท้องถิ่น","Local Market":"ตลาดท้องถิ่น","Community Center":"ศูนย์ชุมชน","Area Fields":"สนามในพื้นที่","Local":"ท้องถิ่น"},
  sv: {"Live Music near":"Livemusik nara","Local Market near":"Lokal marknad nara","Community Event":"Gemenskapsevenemang","Community Events in":"Gemenskapsevenemang i","Local Sports in":"Lokal sport i","Local Live":"Lokal Live","Local Market":"Lokal marknad","Community Center":"Medborgarhus","Area Fields":"Idrottsplatser","Local":"Lokal"},
  pl: {"Live Music near":"Muzyka na zywo blisko","Local Market near":"Lokalny targ blisko","Community Event":"Wydarzenie spoleczne","Community Events in":"Wydarzenia spoleczne w","Local Sports in":"Sport lokalny w","Local Live":"Lokalnie na zywo","Local Market":"Lokalny targ","Community Center":"Dom kultury","Area Fields":"Boiska","Local":"Lokalny"},
  tr: {"Live Music near":"Yakininda canli muzik","Local Market near":"Yakininda yerel pazar","Community Event":"Topluluk etkinligi","Community Events in":"Topluluk etkinlikleri","Local Sports in":"Yerel spor","Local Live":"Yerel canli","Local Market":"Yerel pazar","Community Center":"Toplum merkezi","Area Fields":"Saha alanlari","Local":"Yerel"},
  uk: {"Live Music near":"Жива музика біля","Local Market near":"Місцевий ринок біля","Community Event":"Громадська подія","Community Events in":"Громадські події в","Local Sports in":"Місцевий спорт в","Local Live":"Місцевий лайв","Local Market":"Місцевий ринок","Community Center":"Громадський центр","Area Fields":"Місцеві поля","Local":"Місцевий"},
  el: {"Live Music near":"Ζωντανή μουσική κοντά σε","Local Market near":"Τοπική αγορά κοντά σε","Community Event":"Κοινοτική εκδήλωση","Community Events in":"Κοινοτικές εκδηλώσεις σε","Local Sports in":"Τοπικά σπορ σε","Local Live":"Τοπικό Live","Local Market":"Τοπική αγορά","Community Center":"Κοινοτικό κέντρο","Area Fields":"Τοπικά γήπεδα","Local":"Τοπικό"},
  he: {"Live Music near":"מוזיקה חיה ליד","Local Market near":"שוק מקומי ליד","Community Event":"אירוע קהילתי","Community Events in":"אירועים קהילתיים ב","Local Sports in":"ספורט מקומי ב","Local Live":"לייב מקומי","Local Market":"שוק מקומי","Community Center":"מרכז קהילתי","Area Fields":"מגרשים אזוריים","Local":"מקומי"},
  ur: {"Live Music near":"کے قریب لائیو موسیقی","Local Market near":"کے قریب مقامی مارکیٹ","Community Event":"کمیونٹی ایونٹ","Community Events in":"میں کمیونٹی ایونٹس","Local Sports in":"میں مقامی کھیل","Local Live":"مقامی لائیو","Local Market":"مقامی مارکیٹ","Community Center":"کمیونٹی سینٹر","Area Fields":"علاقائی میدان","Local":"مقامی"},
  fa: {"Live Music near":"موسیقی زنده نزدیک","Local Market near":"بازار محلی نزدیک","Community Event":"رویداد اجتماعی","Community Events in":"رویدادهای اجتماعی در","Local Sports in":"ورزش محلی در","Local Live":"زنده محلی","Local Market":"بازار محلی","Community Center":"مرکز اجتماعی","Area Fields":"زمین‌های منطقه","Local":"محلی"},
  ms: {"Live Music near":"Muzik live dekat","Local Market near":"Pasar tempatan dekat","Community Event":"Acara komuniti","Community Events in":"Acara komuniti di","Local Sports in":"Sukan tempatan di","Local Live":"Live tempatan","Local Market":"Pasar tempatan","Community Center":"Pusat komuniti","Area Fields":"Padang kawasan","Local":"Tempatan"},
  ro: {"Live Music near":"Muzica live langa","Local Market near":"Piata locala langa","Community Event":"Eveniment comunitar","Community Events in":"Evenimente comunitare in","Local Sports in":"Sport local in","Local Live":"Live local","Local Market":"Piata locala","Community Center":"Centru comunitar","Area Fields":"Terenuri locale","Local":"Local"},
  cs: {"Live Music near":"Ziva hudba blizko","Local Market near":"Mistni trh blizko","Community Event":"Komunitni akce","Community Events in":"Komunitni akce v","Local Sports in":"Mistni sport v","Local Live":"Mistne live","Local Market":"Mistni trh","Community Center":"Komunitni centrum","Area Fields":"Mistni hriste","Local":"Mistni"},
  hu: {"Live Music near":"Elozene kozelben","Local Market near":"Helyi piac kozelben","Community Event":"Kozossegi esemeny","Community Events in":"Kozossegi esemenyek","Local Sports in":"Helyi sport","Local Live":"Helyi elo","Local Market":"Helyi piac","Community Center":"Kozossegi kozpont","Area Fields":"Palyak","Local":"Helyi"},
  fi: {"Live Music near":"Live-musiikkia lahella","Local Market near":"Paikallismarkkinat lahella","Community Event":"Yhteisotapahtuma","Community Events in":"Yhteisotapahtumat","Local Sports in":"Paikallinen urheilu","Local Live":"Paikallinen live","Local Market":"Paikallismarkkinat","Community Center":"Yhteisokeskus","Area Fields":"Kentat","Local":"Paikallinen"},
  no: {"Live Music near":"Livemusikk naer","Local Market near":"Lokalt marked naer","Community Event":"Fellesskapsarrangement","Community Events in":"Fellesskapsarrangementer i","Local Sports in":"Lokal sport i","Local Live":"Lokal Live","Local Market":"Lokalt marked","Community Center":"Samfunnshus","Area Fields":"Idrettsbaner","Local":"Lokal"},
  da: {"Live Music near":"Livemusik naer","Local Market near":"Lokalt marked naer","Community Event":"Faellesskabsbegivenhed","Community Events in":"Faellesskabsbegivenheder i","Local Sports in":"Lokal sport i","Local Live":"Lokal Live","Local Market":"Lokalt marked","Community Center":"Medborgerhus","Area Fields":"Idraetspladser","Local":"Lokal"},
  bg: {"Live Music near":"Жива музика близо до","Local Market near":"Местен пазар близо до","Community Event":"Общностно събитие","Community Events in":"Общностни събития в","Local Sports in":"Местен спорт в","Local Live":"Местно на живо","Local Market":"Местен пазар","Community Center":"Общностен център","Area Fields":"Местни игрища","Local":"Местен"},
  hr: {"Live Music near":"Glazba uzivo blizu","Local Market near":"Lokalna trznica blizu","Community Event":"Dogadaj zajednice","Community Events in":"Dogadaji zajednice u","Local Sports in":"Lokalni sport u","Local Live":"Lokalno uzivo","Local Market":"Lokalna trznica","Community Center":"Drustveni centar","Area Fields":"Lokalna igralista","Local":"Lokalno"},
  sr: {"Live Music near":"Ziva muzika blizu","Local Market near":"Lokalna pijaca blizu","Community Event":"Dogadjaj zajednice","Community Events in":"Dogadjaji zajednice u","Local Sports in":"Lokalni sport u","Local Live":"Lokalno uzivo","Local Market":"Lokalna pijaca","Community Center":"Drustveni centar","Area Fields":"Lokalni tereni","Local":"Lokalno"},
  sk: {"Live Music near":"Ziva hudba blizko","Local Market near":"Miestny trh blizko","Community Event":"Komunitne podujatie","Community Events in":"Komunitne podujatia v","Local Sports in":"Miestny sport v","Local Live":"Miestne live","Local Market":"Miestny trh","Community Center":"Komunitne centrum","Area Fields":"Miestne ihriska","Local":"Miestne"},
  sl: {"Live Music near":"Glasba v zivo blizu","Local Market near":"Lokalna trznica blizu","Community Event":"Dogodek skupnosti","Community Events in":"Dogodki skupnosti v","Local Sports in":"Lokalni sport v","Local Live":"Lokalno v zivo","Local Market":"Lokalna trznica","Community Center":"Skupnostni center","Area Fields":"Lokalna igrisca","Local":"Lokalno"},
  et: {"Live Music near":"Elav muusika lahedal","Local Market near":"Kohalik turg lahedal","Community Event":"Kogukonna sündmus","Community Events in":"Kogukonna sündmused","Local Sports in":"Kohalik sport","Local Live":"Kohalik live","Local Market":"Kohalik turg","Community Center":"Kogukonnakeskus","Area Fields":"Valjakud","Local":"Kohalik"},
  lv: {"Live Music near":"Dziva muzika netalu","Local Market near":"Vietejais tirgus netalu","Community Event":"Kopienas pasakums","Community Events in":"Kopienas pasakumi","Local Sports in":"Vietejais sports","Local Live":"Vietejais live","Local Market":"Vietejais tirgus","Community Center":"Kopienas centrs","Area Fields":"Laukumi","Local":"Vietejais"},
  lt: {"Live Music near":"Gyva muzika salia","Local Market near":"Vietinis turgus salia","Community Event":"Bendruomenes renginys","Community Events in":"Bendruomenes renginiai","Local Sports in":"Vietinis sportas","Local Live":"Vietinis gyvai","Local Market":"Vietinis turgus","Community Center":"Bendruomenes centras","Area Fields":"Aiksteles","Local":"Vietinis"},
  be: {"Live Music near":"Жывая музыка побач","Local Market near":"Мясцовы рынак побач","Community Event":"Падзея супольнасці","Community Events in":"Падзеі супольнасці ў","Local Sports in":"Мясцовы спорт у","Local Live":"Мясцовы лайв","Local Market":"Мясцовы рынак","Community Center":"Грамадскі цэнтр","Area Fields":"Мясцовыя пляцоўкі","Local":"Мясцовы"},
  ka: {"Live Music near":"ცოცხალი მუსიკა ახლოს","Local Market near":"ადგილობრივი ბაზარი ახლოს","Community Event":"საზოგადოების ღონისძიება","Community Events in":"საზოგადოების ღონისძიებები","Local Sports in":"ადგილობრივი სპორტი","Local Live":"ადგილობრივი ლაივი","Local Market":"ადგილობრივი ბაზარი","Community Center":"საზოგადოების ცენტრი","Area Fields":"მოედნები","Local":"ადგილობრივი"},
  hy: {"Live Music near":"Կենդանի երաժշտություն մոտակայքում","Local Market near":"Տեղական շուկա մոտակայքում","Community Event":"Համայնքային միջոցառում","Community Events in":"Համայնքային միջոցառումներ","Local Sports in":"Տեղական սպորտ","Local Live":"Տեղական ուղիղ","Local Market":"Տեղական շուկա","Community Center":"Համայնքային կենտրոն","Area Fields":"Դաշտեր","Local":"Տեղական"},
  az: {"Live Music near":"Yaxinliqda canli musiqi","Local Market near":"Yaxinliqda yerli bazar","Community Event":"Icma tedbiri","Community Events in":"Icma tedbirleri","Local Sports in":"Yerli idman","Local Live":"Yerli canli","Local Market":"Yerli bazar","Community Center":"Icma merkezi","Area Fields":"Sahələr","Local":"Yerli"},
  kk: {"Live Music near":"Жанында жанды музыка","Local Market near":"Жанында жергілікті базар","Community Event":"Қауымдастық шарасы","Community Events in":"Қауымдастық шаралары","Local Sports in":"Жергілікті спорт","Local Live":"Жергілікті лайв","Local Market":"Жергілікті базар","Community Center":"Қауымдастық орталығы","Area Fields":"Алаңдар","Local":"Жергілікті"},
  ky: {"Live Music near":"Жанында жандуу музыка","Local Market near":"Жанында жергиликтүү базар","Community Event":"Коомчулук иш-чарасы","Community Events in":"Коомчулук иш-чаралары","Local Sports in":"Жергиликтүү спорт","Local Live":"Жергиликтүү лайв","Local Market":"Жергиликтүү базар","Community Center":"Коомчулук борбору","Area Fields":"Аянттар","Local":"Жергиликтүү"},
  uz: {"Live Music near":"Yaqinida jonli musiqa","Local Market near":"Yaqinida mahalliy bozor","Community Event":"Jamiyat tadbiri","Community Events in":"Jamiyat tadbirlari","Local Sports in":"Mahalliy sport","Local Live":"Mahalliy jonli","Local Market":"Mahalliy bozor","Community Center":"Jamiyat markazi","Area Fields":"Maydonlar","Local":"Mahalliy"},
  tg: {"Live Music near":"Дар наздики мусиқии зинда","Local Market near":"Дар наздики бозори маҳаллӣ","Community Event":"Чорабинии ҷомеа","Community Events in":"Чорабиниҳои ҷомеа","Local Sports in":"Варзиши маҳаллӣ","Local Live":"Зиндаи маҳаллӣ","Local Market":"Бозори маҳаллӣ","Community Center":"Маркази ҷомеа","Area Fields":"Майдонҳо","Local":"Маҳаллӣ"},
  mn: {"Live Music near":"Ойролцоо амьд хөгжим","Local Market near":"Ойролцоо орон нутгийн зах","Community Event":"Олон нийтийн арга хэмжээ","Community Events in":"Олон нийтийн арга хэмжээнүүд","Local Sports in":"Орон нутгийн спорт","Local Live":"Орон нутгийн шууд","Local Market":"Орон нутгийн зах","Community Center":"Олон нийтийн төв","Area Fields":"Талбайнууд","Local":"Орон нутгийн"},
  km: {"Live Music near":"តន្ត្រីផ្ទាល់នៅជិត","Local Market near":"ផ្សារក្នុងស្រុកនៅជិត","Community Event":"ព្រឹត្តិការណ៍សហគមន៍","Community Events in":"ព្រឹត្តិការណ៍សហគមន៍នៅ","Local Sports in":"កីឡាក្នុងស្រុកនៅ","Local Live":"ផ្សាយផ្ទាល់ក្នុងស្រុក","Local Market":"ផ្សារក្នុងស្រុក","Community Center":"មជ្ឈមណ្ឌលសហគមន៍","Area Fields":"ទីលាន","Local":"ក្នុងស្រុក"},
  lo: {"Live Music near":"ດົນຕີສົດໃກ້","Local Market near":"ຕະຫຼາດທ້ອງຖິ່ນໃກ້","Community Event":"ກິດຈະກຳຊຸມຊົນ","Community Events in":"ກິດຈະກຳຊຸມຊົນໃນ","Local Sports in":"ກິລາທ້ອງຖິ່ນໃນ","Local Live":"ສົດທ້ອງຖິ່ນ","Local Market":"ຕະຫຼາດທ້ອງຖິ່ນ","Community Center":"ສູນຊຸມຊົນ","Area Fields":"ເດີ່ນກິລາ","Local":"ທ້ອງຖິ່ນ"},
  my: {"Live Music near":"အနီးတွင် တိုက်ရိုက်ဂီတ","Local Market near":"အနီးတွင် ဒေသတွင်းဈေး","Community Event":"အသိုင်းအဝိုင်းပွဲ","Community Events in":"အသိုင်းအဝိုင်းပွဲများ","Local Sports in":"ဒေသတွင်းအားကစား","Local Live":"ဒေသတွင်းတိုက်ရိုက်","Local Market":"ဒေသတွင်းဈေး","Community Center":"အသိုင်းအဝိုင်းစင်တာ","Area Fields":"ကွင်းများ","Local":"ဒေသတွင်း"},
}

function tTitle(title: string, lang: string): string {
  if (lang === 'en' || !title) return title
  const dict = EVENT_T[lang] || EVENT_T['es']
  if (!dict) return title
  let out = title
  const keys = Object.keys(dict).sort((a,b)=>b.length-a.length)
  for (const k of keys) {
    if (out.includes(k)) out = out.replaceAll(k, dict[k])
  }
  return out
}

export function WhatsHappeningNearYou(){
  const { zip, city, lat, lng } = useLocation()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (!zip) return
    let mounted = true
    const load = async()=>{
      try{
        setLoading(true)
        const res = await fetch(`/api/events?zip=${encodeURIComponent(zip)}&lat=${lat}&lon=${lng}`)
        if (res.ok) {
          const json = await res.json()
          if(mounted) { setEvents((json.events || []).slice(0,5)); setLoading(false) }
        }
        const extRes = await fetch(`/api/external-events?zip=${encodeURIComponent(zip)}&city=${encodeURIComponent(city || '')}&lat=${lat}&lon=${lng}`)
        if (extRes.ok) {
          const json = await extRes.json()
          if(mounted && json.events && json.events.length > 0) {
            setEvents((prev: EventItem[]) => [...prev, ...json.events].slice(0,5))
          }
        }
        if(mounted) setLoading(false)
      }catch{ 
        if(mounted) {
          setEvents([{ id: 'fallback-1', title: `${d.eventsIn} ${city || zip}`, icon: '🎉', source: 'Local' }])
          setLoading(false)
        }
      }
    }
    load()
    const id = setInterval(load, 30*60*1000)
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[zip, city, lat, lng, d.eventsIn])

  if (!zip) return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📍 {d.what}</p>
      <p className="text-xs text-white/50 mt-1">{d.locating}</p>
    </div>
  )

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📍 {d.what}</p>
      <p className="text-xs text-white/50 mt-1">{d.near} {zip} {city? `• ${city}`:''} • {d.infoHighway}</p>
      {loading? <p className="text-sm mt-3 text-white/60">{d.loading}</p> : events.length===0? (
        <p className="text-sm mt-3 text-white/70">{d.checking} {city || zip} events...</p>
      ):(
        <div className="mt-3 space-y-2.5">
          {events.map(ev=>(
            <div key={ev.id} className="bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/5 transition">
              <p className="text-sm font-bold text-white/90 line-clamp-2">{ev.icon || '🎉'} {tTitle(ev.title, language)}</p>
              <div className="flex gap-2 mt-1.5">
                {ev.venue && <p className="text-xs text-white/50">{tTitle(ev.venue, language)}</p>}
                {ev.source && <p className="text-xs text-white/30">• {tTitle(ev.source, language)}</p>}
              </div>
            </div>
          ))}
          <p className="text-xs text-white/25 mt-1">{d.live}</p>
        </div>
      )}
    </div>
  )
}

export default WhatsHappeningNearYou
