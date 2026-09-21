'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { useLanguage } from '@/lib/language-context'
import { bboxForRadius } from '@/lib/location-scope'
import { applyScope } from '@/lib/location-scope'

const D: Record<string, any> = {
  en: { liveNow:"Live Now in {zip}", noOne:"No one live now in {zip}", beFirst:"Be first to go live!", goLive:"Go Live • $5/mo", subscribe:"Subscribe to Watch", watching:"{count} watching", claimLive:"Go Live Now", loading:"Finding live...", checkout:"Redirecting to checkout..." },
  es: { liveNow:"En Vivo Ahora en {zip}", noOne:"Nadie en vivo ahora en {zip}", beFirst:"¡Sé el primero en salir en vivo!", goLive:"Salir En Vivo • $5/mes", subscribe:"Suscribirse para Ver", watching:"{count} viendo", claimLive:"Salir En Vivo Ahora", loading:"Buscando en vivo...", checkout:"Redirigiendo al pago..." },
  fr: { liveNow:"En Direct à {zip}", noOne:"Personne en direct à {zip}", beFirst:"Soyez le premier à passer en direct!", goLive:"Passer en Direct • $5/mois", subscribe:"S'abonner pour Regarder", watching:"{count} regardent", claimLive:"Passer Live Maintenant", loading:"Recherche en direct...", checkout:"Redirection paiement..." },
  de: { liveNow:"Jetzt Live in {zip}", noOne:"Niemand live jetzt in {zip}", beFirst:"Sei der Erste, der live geht!", goLive:"Live Gehen • $5/Monat", subscribe:"Abonnieren zum Ansehen", watching:"{count} schauen zu", claimLive:"Jetzt Live Gehen", loading:"Suche Live...", checkout:"Weiterleitung zur Kasse..." },
  zh: { liveNow:"{zip} 正在直播", noOne:"{zip} 现在没有人直播", beFirst:"成为第一个直播的人！", goLive:"开始直播 • $5/月", subscribe:"订阅观看", watching:"{count} 人在看", claimLive:"现在开始直播", loading:"正在查找直播...", checkout:"正在跳转到结账..." },
  ja: { liveNow:"{zip}で現在ライブ", noOne:"{zip}では誰もライブしていません", beFirst:"最初にライブ配信しよう！", goLive:"ライブ配信 • $5/月", subscribe:"視聴するには購読", watching:"{count}人が視聴中", claimLive:"今すぐライブ配信", loading:"ライブを探しています...", checkout:"チェックアウトにリダイレクト中..." },
  ko: { liveNow:"{zip}에서 지금 라이브", noOne:"{zip}에 지금 라이브 중인 사람 없음", beFirst:"첫 번째로 라이브 시작!", goLive:"라이브 시작 • $5/월", subscribe:"시청하려면 구독", watching:"{count}명 시청 중", claimLive:"지금 라이브 시작", loading:"라이브 찾는 중...", checkout:"결제로 이동 중..." },
  pt: { liveNow:"Ao Vivo Agora em {zip}", noOne:"Ninguém ao vivo agora em {zip}", beFirst:"Seja o primeiro a entrar ao vivo!", goLive:"Entrar Ao Vivo • $5/mês", subscribe:"Assinar para Assistir", watching:"{count} assistindo", claimLive:"Entrar Ao Vivo Agora", loading:"Procurando ao vivo...", checkout:"Redirecionando para checkout..." },
  ru: { liveNow:"Сейчас в Эфире в {zip}", noOne:"Сейчас никто не в эфире в {zip}", beFirst:"Стань первым кто выйдет в эфир!", goLive:"Выйти в Эфир • $5/мес", subscribe:"Подписаться для Просмотра", watching:"{count} смотрят", claimLive:"Выйти в Эфир Сейчас", loading:"Поиск эфиров...", checkout:"Переход к оплате..." },
  ar: { liveNow:"مباشر الآن في {zip}", noOne:"لا أحد مباشر الآن في {zip}", beFirst:"كن أول من يبث مباشر!", goLive:"بث مباشر • $5/شهر", subscribe:"اشترك للمشاهدة", watching:"{count} يشاهدون", claimLive:"بث مباشر الآن", loading:"البحث عن مباشر...", checkout:"إعادة توجيه للدفع..." },
  hi: { liveNow:"{zip} में अभी लाइव", noOne:"{zip} में अभी कोई लाइव नहीं", beFirst:"लाइव जाने वाले पहले बनें!", goLive:"लाइव जाएं • $5/महीना", subscribe:"देखने के लिए सब्सक्राइब करें", watching:"{count} देख रहे हैं", claimLive:"अभी लाइव जाएं", loading:"लाइव खोज रहा है...", checkout:"चेकआउट पर जा रहे हैं..." },
  it: { liveNow:"Live Ora in {zip}", noOne:"Nessuno live ora in {zip}", beFirst:"Sii il primo ad andare live!", goLive:"Vai Live • $5/mese", subscribe:"Abbonati per Guardare", watching:"{count} stanno guardando", claimLive:"Vai Live Ora", loading:"Cerco live...", checkout:"Reindirizzamento al checkout..." },
  nl: { liveNow:"Nu Live in {zip}", noOne:"Niemand nu live in {zip}", beFirst:"Wees de eerste die live gaat!", goLive:"Ga Live • $5/maand", subscribe:"Abonneren om te Kijken", watching:"{count} kijken", claimLive:"Ga Nu Live", loading:"Live zoeken...", checkout:"Doorverwijzen naar checkout..." },
  tl: { liveNow:"Live Ngayon sa {zip}", noOne:"Walang live ngayon sa {zip}", beFirst:"Mauna ka mag-live!", goLive:"Mag-Live • $5/buwan", subscribe:"Mag-subscribe para Manood", watching:"{count} nanonood", claimLive:"Mag-Live Ngayon", loading:"Naghahanap ng live...", checkout:"Reredirect sa checkout..." },
  bn: { liveNow:"{zip} এ এখন লাইভ", noOne:"{zip} এ এখন কেউ লাইভ নেই", beFirst:"প্রথম লাইভে যান!", goLive:"লাইভ যান • $5/মাস", subscribe:"দেখতে সাবস্ক্রাইব করুন", watching:"{count} দেখছে", claimLive:"এখনই লাইভ যান", loading:"লাইভ খুঁজছে...", checkout:"চেকআউটে যাচ্ছে..." },
  id: { liveNow:"Live Sekarang di {zip}", noOne:"Tidak ada yang live di {zip}", beFirst:"Jadilah pertama yang live!", goLive:"Mulai Live • $5/bulan", subscribe:"Berlangganan untuk Menonton", watching:"{count} menonton", claimLive:"Mulai Live Sekarang", loading:"Mencari live...", checkout:"Mengalihkan ke checkout..." },
  vi: { liveNow:"Trực Tiếp Bây Giờ tại {zip}", noOne:"Không ai trực tiếp tại {zip}", beFirst:"Hãy là người đầu tiên lên sóng!", goLive:"Lên Sóng • $5/tháng", subscribe:"Đăng ký để Xem", watching:"{count} đang xem", claimLive:"Lên Sóng Ngay", loading:"Đang tìm trực tiếp...", checkout:"Chuyển hướng đến thanh toán..." },
  th: { liveNow:"ไลฟ์ตอนนี้ใน {zip}", noOne:"ไม่มีใครไลฟ์ตอนนี้ใน {zip}", beFirst:"เป็นคนแรกที่ไลฟ์!", goLive:"เริ่มไลฟ์ • $5/เดือน", subscribe:"สมัครเพื่อรับชม", watching:"{count} คนกำลังดู", claimLive:"ไลฟ์ตอนนี้เลย", loading:"กำลังหาคนไลฟ์...", checkout:"กำลังไปที่หน้าชำระเงิน..." },
  sv: { liveNow:"Live Nu i {zip}", noOne:"Ingen live nu i {zip}", beFirst:"Bli först att gå live!", goLive:"Gå Live • $5/mån", subscribe:"Prenumerera för att Titta", watching:"{count} tittar", claimLive:"Gå Live Nu", loading:"Letar live...", checkout:"Omdirigerar till kassan..." },
  pl: { liveNow:"Teraz Na Żywo w {zip}", noOne:"Nikt teraz na żywo w {zip}", beFirst:"Bądź pierwszy na żywo!", goLive:"Idź Na Żywo • $5/mies", subscribe:"Subskrybuj aby Oglądać", watching:"{count} ogląda", claimLive:"Idź Na Żywo Teraz", loading:"Szukam live...", checkout:"Przekierowanie do płatności..." },
  tr: { liveNow:"Şimdi Canlı {zip} içinde", noOne:"{zip} içinde şimdi canlı yok", beFirst:"İlk canlı yayına geçen ol!", goLive:"Canlıya Geç • $5/ay", subscribe:"İzlemek için Abone Ol", watching:"{count} izliyor", claimLive:"Şimdi Canlıya Geç", loading:"Canlı aranıyor...", checkout:"Ödemeye yönlendiriliyor..." },
  uk: { liveNow:"Зараз в Ефірі в {zip}", noOne:"Зараз нікого в ефірі в {zip}", beFirst:"Стань першим в ефірі!", goLive:"В Ефірі • $5/міс", subscribe:"Підписатись щоб Дивитись", watching:"{count} дивляться", claimLive:"В Ефір Зараз", loading:"Пошук ефірів...", checkout:"Перехід до оплати..." },
  el: { liveNow:"Ζωντανά Τώρα σε {zip}", noOne:"Κανείς ζωντανά τώρα σε {zip}", beFirst:"Γίνε ο πρώτος που θα βγει live!", goLive:"Βγες Live • $5/μήνα", subscribe:"Εγγραφή για Προβολή", watching:"{count} βλέπουν", claimLive:"Βγες Live Τώρα", loading:"Αναζήτηση live...", checkout:"Ανακατεύθυνση στο checkout..." },
  he: { liveNow:"לייב עכשיו ב {zip}", noOne:"אף אחד לא בלייב עכשיו ב {zip}", beFirst:"היה הראשון לעלות ללייב!", goLive:"עלה ללייב • $5/חודש", subscribe:"הירשם לצפייה", watching:"{count} צופים", claimLive:"עלה ללייב עכשיו", loading:"מחפש לייב...", checkout:"מפנה לתשלום..." },
  ro: { liveNow:"Live Acum în {zip}", noOne:"Nimeni live acum în {zip}", beFirst:"Fii primul care intră live!", goLive:"Intră Live • $5/lună", subscribe:"Abonează-te pentru a Vizionа", watching:"{count} se uită", claimLive:"Intră Live Acum", loading:"Caut live...", checkout:"Redirecționare către plată..." },
  cs: { liveNow:"Právě Živě v {zip}", noOne:"Nikdo právě živě v {zip}", beFirst:"Buď první živě!", goLive:"Jít Živě • $5/měs", subscribe:"Předplatit pro Sledování", watching:"{count} sleduje", claimLive:"Jít Živě Hned", loading:"Hledám živě...", checkout:"Přesměrování k platbě..." },
  hu: { liveNow:"Most Élő {zip} területén", noOne:"Senki sem élőben most {zip} területén", beFirst:"Légy az első élő!", goLive:"Menj Élőbe • $5/hó", subscribe:"Feliratkozás Nézéshez", watching:"{count} nézi", claimLive:"Menj Élőbe Most", loading:"Élő keresése...", checkout:"Átirányítás fizetéshez..." },
  fi: { liveNow:"Nyt Livenä {zip}", noOne:"Kukaan ei livenä nyt {zip}", beFirst:"Ole ensimmäinen livenä!", goLive:"Mene Liveen • $5/kk", subscribe:"Tilaa Katsomiseen", watching:"{count} katsoo", claimLive:"Mene Liveen Nyt", loading:"Etsitään liveä...", checkout:"Ohjataan kassalle..." },
  no: { liveNow:"Live Nå i {zip}", noOne:"Ingen live nå i {zip}", beFirst:"Bli første til å gå live!", goLive:"Gå Live • $5/mnd", subscribe:"Abonner for å Se", watching:"{count} ser på", claimLive:"Gå Live Nå", loading:"Leter etter live...", checkout:"Omdirigerer til betaling..." },
  da: { liveNow:"Live Nu i {zip}", noOne:"Ingen live nu i {zip}", beFirst:"Vær den første live!", goLive:"Gå Live • $5/md", subscribe:"Abonner for at Se", watching:"{count} ser", claimLive:"Gå Live Nu", loading:"Leder efter live...", checkout:"Omdirigerer til betaling..." },
  bg: { liveNow:"На Живо Сега в {zip}", noOne:"Никой на живо сега в {zip}", beFirst:"Бъди първи на живо!", goLive:"Влез На Живо • $5/месец", subscribe:"Абонирай се за Гледане", watching:"{count} гледат", claimLive:"Влез На Живо Сега", loading:"Търсене на живо...", checkout:"Пренасочване към плащане..." },
  hr: { liveNow:"Uživo Sada u {zip}", noOne:"Nitko uživo sada u {zip}", beFirst:"Budi prvi uživo!", goLive:"Idi Uživo • $5/mj", subscribe:"Pretplati se za Gledanje", watching:"{count} gleda", claimLive:"Idi Uživo Sada", loading:"Tražim uživo...", checkout:"Preusmjeravanje na naplatu..." },
  sr: { liveNow:"Уживо Сада у {zip}", noOne:"Нико уживо сада у {zip}", beFirst:"Буди први уживо!", goLive:"Иди Уживо • $5/мес", subscribe:"Претплати се за Гледање", watching:"{count} гледа", claimLive:"Иди Уживо Сада", loading:"Тражим уживо...", checkout:"Преусмеравање на наплату..." },
  sk: { liveNow:"Naživo Teraz v {zip}", noOne:"Nikto naživo teraz v {zip}", beFirst:"Buď prvý naživo!", goLive:"Ísť Naživo • $5/mes", subscribe:"Predplatiť na Sledovanie", watching:"{count} sleduje", claimLive:"Ísť Naživo Teraz", loading:"Hľadám naživo...", checkout:"Presmerovanie na platbu..." },
  sl: { liveNow:"V Živo Zdaj v {zip}", noOne:"Nihče v živo zdaj v {zip}", beFirst:"Bodi prvi v živo!", goLive:"Pojdi V Živo • $5/mes", subscribe:"Naroči se za Ogled", watching:"{count} gleda", claimLive:"Pojdi V Živo Zdaj", loading:"Iščem v živo...", checkout:"Preusmerjanje na plačilo..." },
  et: { liveNow:"Otse Nüüd {zip} piirkonnas", noOne:"Keegi pole otse nüüd {zip}", beFirst:"Ole esimene otse!", goLive:"Mine Otse • $5/kuu", subscribe:"Telli Vaatamiseks", watching:"{count} vaatab", claimLive:"Mine Otse Nüüd", loading:"Otsin otse...", checkout:"Suunamine kassasse..." },
  lv: { liveNow:"Tiešraidē Tagad {zip}", noOne:"Neviens nav tiešraidē tagad {zip}", beFirst:"Esi pirmais tiešraidē!", goLive:"Iet Tiešraidē • $5/mēn", subscribe:"Abonēt Skatīšanai", watching:"{count} skatās", claimLive:"Iet Tiešraidē Tagad", loading:"Meklē tiešraidi...", checkout:"Novirza uz maksājumu..." },
  lt: { liveNow:"Tiesiogiai Dabar {zip}", noOne:"Niekas tiesiogiai dabar {zip}", beFirst:"Būk pirmas tiesiogiai!", goLive:"Eiti Tiesiogiai • $5/mėn", subscribe:"Prenumeruoti Žiūrėjimui", watching:"{count} žiūri", claimLive:"Eiti Tiesiogiai Dabar", loading:"Ieškoma tiesiogiai...", checkout:"Peradresavimas į apmokėjimą..." },
  be: { liveNow:"Жыўцом Зараз у {zip}", noOne:"Нікога жыўцом зараз у {zip}", beFirst:"Будзь першым жыўцом!", goLive:"Ісці Жыўцом • $5/мес", subscribe:"Падпісацца для Прагляду", watching:"{count} глядзяць", claimLive:"Ісці Жыўцом Зараз", loading:"Пошук жыўцом...", checkout:"Перанакіраванне да аплаты..." },
  ka: { liveNow:"ლაივში ახლა {zip}-ში", noOne:"არავინ ლაივში {zip}-ში", beFirst:"იყავი პირველი ლაივში!", goLive:"ლაივში გადასვლა • $5/თვე", subscribe:"გამოწერა საყურებლად", watching:"{count} უყურებს", claimLive:"ლაივში ახლა", loading:"ლაივის ძიება...", checkout:"გადამისამართება გადახდაზე..." },
  hy: { liveNow:"Ուղիղ Հիմա {zip}-ում", noOne:"Ոչ ոք ուղիղ հիմա {zip}-ում", beFirst:"Եղիր առաջինը ուղիղ:", goLive:"Գնալ Ուղիղ • $5/ամիս", subscribe:"Բաժանորդագրվել Դիտելու համար", watching:"{count} դիտում են", claimLive:"Գնալ Ուղիղ Հիմա", loading:"Ուղիղ որոնում...", checkout:"Վերահղում վճարմանը..." },
  az: { liveNow:"İndi Canlı {zip} içində", noOne:"İndi heç kim canlı deyil {zip}", beFirst:"İlk canlı ol!", goLive:"Canlıya Keç • $5/ay", subscribe:"İzləmək üçün Abunə Ol", watching:"{count} izləyir", claimLive:"İndi Canlıya Keç", loading:"Canlı axtarılır...", checkout:"Ödənişə yönləndirilir..." },
  kk: { liveNow:"Қазір Тікелей {zip} ішінде", noOne:"Қазір ешкім тікелей емес {zip}", beFirst:"Алғашқы тікелей бол!", goLive:"Тікелейге Өт • $5/ай", subscribe:"Көру үшін Жазылу", watching:"{count} көруде", claimLive:"Қазір Тікелейге Өт", loading:"Тікелей іздеу...", checkout:"Төлемге бағытталуда..." },
  ky: { liveNow:"Азыр Түз {zip} ичинде", noOne:"Азыр эч ким түз эмес {zip}", beFirst:"Биринчи түз бол!", goLive:"Түзге Өт • $5/ай", subscribe:"Көрүү үчүн Жазылуу", watching:"{count} көрүүдө", claimLive:"Азыр Түзге Өт", loading:"Түз издөө...", checkout:"Төлөмгө багытталууда..." },
  uz: { liveNow:"Hozir Jonli {zip} da", noOne:"Hozir hech kim jonli emas {zip}", beFirst:"Birinchi jonli bo'l!", goLive:"Jonliga O't • $5/oy", subscribe:"Ko'rish uchun Obuna", watching:"{count} ko'rmoqda", claimLive:"Hozir Jonliga O't", loading:"Jonli qidirilmoqda...", checkout:"To'lovga yo'naltirilmoqda..." },
  tg: { liveNow:"Ҳоло Зинда дар {zip}", noOne:"Ҳоло ҳеҷ кас зинда нест дар {zip}", beFirst:"Аввалин зинда шав!", goLive:"Ба Зинда Гузаштан • $5/моҳ", subscribe:"Барои Тамошо Обуна", watching:"{count} тамошо мекунанд", claimLive:"Ҳоло ба Зинда Гузар", loading:"Ҷустуҷӯи зинда...", checkout:"Равона ба пардохт..." },
  mn: { liveNow:"Одоо Шууд {zip} дотор", noOne:"Одоо хэн ч шууд биш {zip}", beFirst:"Эхний шууд бол!", goLive:"Шууд Явах • $5/сар", subscribe:"Үзэхийн тулд Захиалах", watching:"{count} үзэж байна", claimLive:"Одоо Шууд Явах", loading:"Шууд хайж байна...", checkout:"Төлбөр рүү чиглүүлж байна..." },
  km: { liveNow:"ផ្ទាល់ឥឡូវនៅ {zip}", noOne:"គ្មាននរណាផ្ទាល់ឥឡូវនៅ {zip}", beFirst:"ក្លាយជាអ្នកផ្ទាល់ដំបូង!", goLive:"ចូលផ្ទាល់ • $5/ខែ", subscribe:"ជាវដើម្បីមើល", watching:"{count} កំពុងមើល", claimLive:"ចូលផ្ទាល់ឥឡូវ", loading:"កំពុងស្វែងរកផ្ទាល់...", checkout:"បញ្ជូនទៅការទូទាត់..." },
  lo: { liveNow:"ສົດຕອນນີ້ໃນ {zip}", noOne:"ບໍ່ມີໃຜສົດຕອນນີ້ໃນ {zip}", beFirst:"ເປັນຄົນທຳອິດທີ່ສົດ!", goLive:"ໄປສົດ • $5/ເດືອນ", subscribe:"ສະໝັກເພື່ອເບິ່ງ", watching:"{count} ກຳລັງເບິ່ງ", claimLive:"ໄປສົດຕອນນີ້", loading:"ກຳລັງຊອກຫາສົດ...", checkout:"ກຳລັງໄປໜ້າຊຳລະເງິນ..." },
  my: { liveNow:"{zip} တွင် ယခု တိုက်ရိုက်", noOne:"{zip} တွင် ယခု တိုက်ရိုက်မရှိ", beFirst:"ပထမဆုံး တိုက်ရိုက် လွှင့်ပါ!", goLive:"တိုက်ရိုက် သွားရန် • $5/လ", subscribe:"ကြည့်ရန် စာရင်းသွင်းပါ", watching:"{count} ကြည့်နေသည်", claimLive:"ယခု တိုက်ရိုက် သွားပါ", loading:"တိုက်ရိုက်ရှာနေသည်...", checkout:"ငွေချေရန် လွှဲပြောင်းနေသည်..." },
  ms: { liveNow:"Live Sekarang di {zip}", noOne:"Tiada siapa live sekarang di {zip}", beFirst:"Jadilah pertama live!", goLive:"Pergi Live • $5/bulan", subscribe:"Langgan untuk Menonton", watching:"{count} menonton", claimLive:"Pergi Live Sekarang", loading:"Mencari live...", checkout:"Mengalihkan ke pembayaran..." },
  fa: { liveNow:"زنده اکنون در {zip}", noOne:"هیچکس زنده اکنون در {zip} نیست", beFirst:"اولین کسی باش که زنده می‌رود!", goLive:"رفتن به زنده • $5/ماه", subscribe:"اشتراک برای تماشا", watching:"{count} در حال تماشا", claimLive:"اکنون زنده برو", loading:"جستجوی زنده...", checkout:"انتقال به پرداخت..." },
  ur: { liveNow:"ابھی لائیو {zip} میں", noOne:"{zip} میں ابھی کوئی لائیو نہیں", beFirst:"پہلے لائیو جائیں!", goLive:"لائیو جائیں • $5/مہینہ", subscribe:"دیکھنے کے لیے سبسکرائب کریں", watching:"{count} دیکھ رہے ہیں", claimLive:"ابھی لائیو جائیں", loading:"لائیو تلاش ہو رہا ہے...", checkout:"چیک آؤٹ پر جا رہے ہیں..." },
}

export default function LiveNowStrip() {
  const { zip } = useLocation()
  const { filter } = useLocationScope()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const supabase = createClient()
  const [lives, setLives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  const fetchLive = async () => {
    if (!zip || zip === 'GLOBAL') { setLoading(false); return }
    try {
      let query = supabase.from('posts').select('*').not('video_url', 'is', null).order('created_at', { ascending: false }).limit(20)
      if (filter.lat!= null && filter.lng!= null) {
        const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
        const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)
        query = query.gte('latitude', bbox.minLat).lte('latitude', bbox.maxLat).gte('longitude', bbox.minLng).lte('longitude', bbox.maxLng)
      } else {
        query = query.eq('zip_code', zip)
      }
      const { data } = await query
      if (data) {
        const recent = data.filter((p:any) => Date.now() - new Date(p.created_at).getTime() < 24*60*60*1000)
        setLives(applyScope(recent, filter))
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchLive(); const id = setInterval(fetchLive, 30000); return () => clearInterval(id) }, [zip, filter.scope, filter.lat, filter.lng])

  const handleCheckout = async () => {
    setCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'live_now', zip, scope: filter.scope, language })
      })
      const j = await res.json()
      if (j.url) window.location.href = j.url
      else throw new Error(j.error || 'No checkout url')
    } catch (e:any) {
      alert('Checkout failed: ' + e.message + ' — create /api/checkout that returns { url } from Stripe')
    } finally { setCheckingOut(false) }
  }

  if (!zip || zip === 'GLOBAL') return null

  return (
    <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-black text-xs tracking-wider">{d.liveNow.replace('{zip}', zip)}</h3>
        <button onClick={handleCheckout} disabled={checkingOut} className="bg-white text-black text- font-black px-3 py-1.5 rounded-full hover:bg-white/90 disabled:opacity-50">
          {checkingOut? d.checkout : d.goLive}
        </button>
      </div>
      {loading? (
        <p className="text-white/50 text-xs">{d.loading}</p>
      ) : lives.length>0? (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {lives.map((p:any)=>(
            <div key={p.id} className="flex-shrink-0 w-20 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 mx-auto flex items-center justify-center font-black text-white text-xs border-2 border-red-500/50">
                  {(p.profiles?.username || p.zip_code || 'LIVE').slice(0,3).toUpperCase()}
                </div>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white text- font-black px-1.5 py-0.5 rounded-full">LIVE</span>
              </div>
              <p className="text-white/70 text- mt-2 truncate font-bold">@{p.profiles?.username || p.zip_code}</p>
              <p className="text-white/40 text-">{d.watching.replace('{count}', String(Math.floor(Math.random()*20+1)))}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-white/60 text-xs">{d.noOne.replace('{zip}', zip)} — {d.beFirst}</p>
          <button onClick={handleCheckout} className="bg-white/10 border border-white/10 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-white/20">{d.claimLive}</button>
        </div>
      )}
    </div>
  )
}
