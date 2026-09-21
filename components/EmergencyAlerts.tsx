'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'
import { useLanguage } from '@/lib/language-context'

type Alert = { id: string; message?: string; event?: string; title?: string; body?: string; type?: string; icon?: string; latitude?: number | null; longitude?: number | null }

const D: Record<string, any> = {
  en: { loading:"Emergency • Loading location...", near:"Emergency • Near {zip}", scanning:"Scanning NOAA, OpenWeather, USGS...", allClear:"All clear in {zip} • No active alerts", refresh:"Auto-refresh 5m • Weather & Safety APIs" },
  es: { loading:"Emergencia • Cargando ubicación...", near:"Emergencia • Cerca de {zip}", scanning:"Escaneando NOAA, OpenWeather, USGS...", allClear:"Todo despejado en {zip} • Sin alertas activas", refresh:"Actualización automática 5m • APIs de clima y seguridad" },
  fr: { loading:"Urgence • Chargement localisation...", near:"Urgence • Près de {zip}", scanning:"Analyse NOAA, OpenWeather, USGS...", allClear:"Tout est clair à {zip} • Aucune alerte active", refresh:"Actualisation auto 5m • APIs météo & sécurité" },
  de: { loading:"Notfall • Standort wird geladen...", near:"Notfall • Nahe {zip}", scanning:"Scanne NOAA, OpenWeather, USGS...", allClear:"Alles klar in {zip} • Keine aktiven Warnungen", refresh:"Auto-Refresh 5m • Wetter & Sicherheit APIs" },
  zh: { loading:"紧急 • 正在加载位置...", near:"紧急 • 靠近 {zip}", scanning:"正在扫描 NOAA, OpenWeather, USGS...", allClear:"{zip} 一切正常 • 无活跃警报", refresh:"自动刷新 5分钟 • 天气与安全API" },
  ja: { loading:"緊急 • 位置読み込み中...", near:"緊急 • {zip}付近", scanning:"NOAA, OpenWeather, USGSをスキャン中...", allClear:"{zip} は異常なし • アクティブな警告なし", refresh:"自動更新 5分 • 天気＆安全API" },
  ko: { loading:"긴급 • 위치 로딩 중...", near:"긴급 • {zip} 근처", scanning:"NOAA, OpenWeather, USGS 스캔 중...", allClear:"{zip} 모두 정상 • 활성 경보 없음", refresh:"자동 새로고침 5분 • 날씨 및 안전 API" },
  pt: { loading:"Emergência • Carregando localização...", near:"Emergência • Perto de {zip}", scanning:"Varrendo NOAA, OpenWeather, USGS...", allClear:"Tudo limpo em {zip} • Sem alertas ativos", refresh:"Atualização auto 5m • APIs de clima e segurança" },
  ru: { loading:"Экстренно • Загрузка местоположения...", near:"Экстренно • Рядом {zip}", scanning:"Сканирование NOAA, OpenWeather, USGS...", allClear:"Все чисто в {zip} • Нет активных тревог", refresh:"Автообновление 5м • Погода и безопасность API" },
  ar: { loading:"طوارئ • تحميل الموقع...", near:"طوارئ • بالقرب من {zip}", scanning:"فحص NOAA, OpenWeather, USGS...", allClear:"الوضع آمن في {zip} • لا تنبيهات نشطة", refresh:"تحديث تلقائي 5د • واجهات الطقس والسلامة" },
  hi: { loading:"आपातकाल • स्थान लोड हो रहा...", near:"आपातकाल • {zip} के पास", scanning:"NOAA, OpenWeather, USGS स्कैन हो रहा...", allClear:"{zip} में सब साफ • कोई सक्रिय अलर्ट नहीं", refresh:"ऑटो-रिफ्रेश 5मि • मौसम और सुरक्षा API" },
  it: { loading:"Emergenza • Caricamento posizione...", near:"Emergenza • Vicino a {zip}", scanning:"Scansione NOAA, OpenWeather, USGS...", allClear:"Tutto libero a {zip} • Nessun allerta attivo", refresh:"Aggiornamento auto 5m • API meteo e sicurezza" },
  nl: { loading:"Noodgeval • Locatie laden...", near:"Noodgeval • Nabij {zip}", scanning:"Scannen NOAA, OpenWeather, USGS...", allClear:"Alles veilig in {zip} • Geen actieve waarschuwingen", refresh:"Auto-verversing 5m • Weer & Veiligheid APIs" },
  tl: { loading:"Emergency • Naglo-load ng lokasyon...", near:"Emergency • Malapit sa {zip}", scanning:"Ini-scan NOAA, OpenWeather, USGS...", allClear:"Ligtas lahat sa {zip} • Walang aktibong alerto", refresh:"Auto-refresh 5m • Weather & Safety APIs" },
  bn: { loading:"জরুরি • অবস্থান লোড হচ্ছে...", near:"জরুরি • {zip} এর কাছে", scanning:"NOAA, OpenWeather, USGS স্ক্যান হচ্ছে...", allClear:"{zip} এ সব পরিষ্কার • কোনো সক্রিয় সতর্কতা নেই", refresh:"অটো-রিফ্রেশ 5মি • আবহাওয়া ও নিরাপত্তা API" },
  id: { loading:"Darurat • Memuat lokasi...", near:"Darurat • Dekat {zip}", scanning:"Memindai NOAA, OpenWeather, USGS...", allClear:"Aman di {zip} • Tidak ada peringatan aktif", refresh:"Refresh otomatis 5m • API Cuaca & Keamanan" },
  vi: { loading:"Khẩn cấp • Đang tải vị trí...", near:"Khẩn cấp • Gần {zip}", scanning:"Đang quét NOAA, OpenWeather, USGS...", allClear:"An toàn ở {zip} • Không có cảnh báo", refresh:"Tự động làm mới 5p • API Thời tiết & An toàn" },
  th: { loading:"ฉุกเฉิน • กำลังโหลดตำแหน่ง...", near:"ฉุกเฉิน • ใกล้ {zip}", scanning:"สแกน NOAA, OpenWeather, USGS...", allClear:"ปลอดภัยใน {zip} • ไม่มีแจ้งเตือนที่ใช้งานอยู่", refresh:"รีเฟรชอัตโนมัติ 5น • API สภาพอากาศและความปลอดภัย" },
  sv: { loading:"Nödläge • Laddar plats...", near:"Nödläge • Nära {zip}", scanning:"Skannar NOAA, OpenWeather, USGS...", allClear:"Allt klart i {zip} • Inga aktiva larm", refresh:"Auto-uppdatering 5m • Väder & Säkerhet API" },
  pl: { loading:"Alarm • Ładowanie lokalizacji...", near:"Alarm • Blisko {zip}", scanning:"Skanowanie NOAA, OpenWeather, USGS...", allClear:"Wszystko czyste w {zip} • Brak aktywnych alertów", refresh:"Auto-odświeżanie 5m • Pogoda i Bezpieczeństwo API" },
  tr: { loading:"Acil • Konum yükleniyor...", near:"Acil • {zip} yakınında", scanning:"NOAA, OpenWeather, USGS taranıyor...", allClear:"{zip} bölgesinde her şey temiz • Aktif uyarı yok", refresh:"Otomatik yenileme 5dk • Hava ve Güvenlik API'leri" },
  uk: { loading:"Надзвичайно • Завантаження місцезнаходження...", near:"Надзвичайно • Біля {zip}", scanning:"Сканування NOAA, OpenWeather, USGS...", allClear:"Все чисто в {zip} • Немає активних сповіщень", refresh:"Автооновлення 5хв • Погода та безпека API" },
  el: { loading:"Έκτακτο • Φόρτωση τοποθεσίας...", near:"Έκτακτο • Κοντά στο {zip}", scanning:"Σάρωση NOAA, OpenWeather, USGS...", allClear:"Όλα καθαρά στο {zip} • Καμία ενεργή ειδοποίηση", refresh:"Αυτόματη ανανέωση 5λ • API Καιρού & Ασφάλειας" },
  he: { loading:"חירום • טוען מיקום...", near:"חירום • ליד {zip}", scanning:"סורק NOAA, OpenWeather, USGS...", allClear:"הכל נקי ב {zip} • אין התראות פעילות", refresh:"רענון אוטומטי 5ד • API מזג אוויר ובטיחות" },
  ur: { loading:"ایمرجنسی • لوکیشن لوڈ ہو رہا...", near:"ایمرجنسی • {zip} کے قریب", scanning:"NOAA, OpenWeather, USGS اسکین ہو رہا...", allClear:"{zip} میں سب کلیئر • کوئی فعال الرٹ نہیں", refresh:"آٹو ریفریش 5م • موسم اور حفاظت API" },
  fa: { loading:"اضطراری • بارگذاری مکان...", near:"اضطراری • نزدیک {zip}", scanning:"اسکن NOAA, OpenWeather, USGS...", allClear:"همه چیز آرام در {zip} • هیچ هشدار فعالی نیست", refresh:"بروزرسانی خودکار 5د • API هوا و ایمنی" },
  ms: { loading:"Kecemasan • Memuatkan lokasi...", near:"Kecemasan • Berhampiran {zip}", scanning:"Mengimbas NOAA, OpenWeather, USGS...", allClear:"Semua selamat di {zip} • Tiada amaran aktif", refresh:"Segar semula auto 5m • API Cuaca & Keselamatan" },
  ro: { loading:"Urgență • Se încarcă locația...", near:"Urgență • Lângă {zip}", scanning:"Scanare NOAA, OpenWeather, USGS...", allClear:"Totul curat în {zip} • Nicio alertă activă", refresh:"Reîmprospătare auto 5m • API Vreme și Siguranță" },
  cs: { loading:"Nouzový stav • Načítání polohy...", near:"Nouzový stav • Blízko {zip}", scanning:"Skenování NOAA, OpenWeather, USGS...", allClear:"Vše čisté v {zip} • Žádné aktivní výstrahy", refresh:"Auto-obnovení 5m • API Počasí a Bezpečnosti" },
  hu: { loading:"Vészhelyzet • Hely betöltése...", near:"Vészhelyzet • Közel {zip}", scanning:"NOAA, OpenWeather, USGS szkennelése...", allClear:"Minden tiszta {zip} • Nincs aktív riasztás", refresh:"Automatikus frissítés 5p • Időjárás és Biztonság API" },
  fi: { loading:"Hätä • Ladataan sijaintia...", near:"Hätä • Lähellä {zip}", scanning:"Skannataan NOAA, OpenWeather, USGS...", allClear:"Kaikki kunnossa {zip} • Ei aktiivisia hälytyksiä", refresh:"Automaattinen päivitys 5m • Sää & Turvallisuus API" },
  no: { loading:"Nødsituasjon • Laster posisjon...", near:"Nødsituasjon • Nær {zip}", scanning:"Skanner NOAA, OpenWeather, USGS...", allClear:"Alt klart i {zip} • Ingen aktive varsler", refresh:"Auto-oppdatering 5m • Vær & Sikkerhet API" },
  da: { loading:"Nødsituation • Indlæser placering...", near:"Nødsituation • Nær {zip}", scanning:"Scanner NOAA, OpenWeather, USGS...", allClear:"Alt klart i {zip} • Ingen aktive alarmer", refresh:"Auto-opdatering 5m • Vejr & Sikkerhed API" },
  bg: { loading:"Спешно • Зареждане на местоположение...", near:"Спешно • Близо до {zip}", scanning:"Сканиране NOAA, OpenWeather, USGS...", allClear:"Всичко чисто в {zip} • Няма активни сигнали", refresh:"Автообновяване 5м • Време и Безопасност API" },
  hr: { loading:"Hitno • Učitavanje lokacije...", near:"Hitno • Blizu {zip}", scanning:"Skeniranje NOAA, OpenWeather, USGS...", allClear:"Sve čisto u {zip} • Nema aktivnih upozorenja", refresh:"Auto-osvježavanje 5m • Vrijeme i Sigurnost API" },
  sr: { loading:"Хитно • Учитавање локације...", near:"Хитно • Близу {zip}", scanning:"Скенирање NOAA, OpenWeather, USGS...", allClear:"Све чисто у {zip} • Нема активних упозорења", refresh:"Ауто-освежавање 5м • Време и Безбедност API" },
  sk: { loading:"Núdzový stav • Načítanie polohy...", near:"Núdzový stav • Blízko {zip}", scanning:"Skenovanie NOAA, OpenWeather, USGS...", allClear:"Všetko čisté v {zip} • Žiadne aktívne výstrahy", refresh:"Auto-obnovenie 5m • Počasie a Bezpečnosť API" },
  sl: { loading:"Nujno • Nalaganje lokacije...", near:"Nujno • Blizu {zip}", scanning:"Skeniranje NOAA, OpenWeather, USGS...", allClear:"Vse čisto v {zip} • Ni aktivnih opozoril", refresh:"Samodejno osveževanje 5m • Vreme in Varnost API" },
  et: { loading:"Hädaolukord • Asukoha laadimine...", near:"Hädaolukord • Lähedal {zip}", scanning:"Skannime NOAA, OpenWeather, USGS...", allClear:"Kõik selge {zip} • Aktiivseid hoiatusi pole", refresh:"Automaatne värskendus 5m • Ilm ja Turvalisus API" },
  lv: { loading:"Ārkārtas • Ielādē atrašanās vietu...", near:"Ārkārtas • Netālu no {zip}", scanning:"Skenē NOAA, OpenWeather, USGS...", allClear:"Viss tīrs {zip} • Nav aktīvu brīdinājumu", refresh:"Automātiska atsvaidzināšana 5m • Laika un Drošības API" },
  lt: { loading:"Skubi • Įkeliama vieta...", near:"Skubi • Netoli {zip}", scanning:"Skenuojama NOAA, OpenWeather, USGS...", allClear:"Viskas švaru {zip} • Nėra aktyvių įspėjimų", refresh:"Automatinis atnaujinimas 5m • Orų ir Saugumo API" },
  be: { loading:"Надзвичайна • Загрузка месцазнаходжання...", near:"Надзвичайна • Побач {zip}", scanning:"Сканаванне NOAA, OpenWeather, USGS...", allClear:"Усё чыста ў {zip} • Няма актыўных папярэджанняў", refresh:"Аўтаабнаўленне 5хв • Надвор'е і Бяспека API" },
  ka: { loading:"საგანგებო • მდებარეობის ჩატვირთვა...", near:"საგანგებო • ახლოს {zip}", scanning:"სკანირება NOAA, OpenWeather, USGS...", allClear:"ყველაფერი სუფთაა {zip}-ში • აქტიური გაფრთხილება არ არის", refresh:"ავტო განახლება 5წთ • ამინდი და უსაფრთხოება API" },
  hy: { loading:"Արտակարգ • Բեռնում ենք գտնվելու վայրը...", near:"Արտակարգ • Մոտ {zip}", scanning:"Սկանավորում NOAA, OpenWeather, USGS...", allClear:"Ամեն ինչ մաքուր է {zip}-ում • Ակտիվ ահազանգեր չկան", refresh:"Ավտո թարմացում 5ր • Եղանակ և Անվտանգություն API" },
  az: { loading:"Təcili • Məkan yüklənir...", near:"Təcili • {zip} yaxınlığında", scanning:"NOAA, OpenWeather, USGS skan edilir...", allClear:"{zip}-də hər şey təmizdir • Aktiv xəbərdarlıq yoxdur", refresh:"Avto-yeniləmə 5d • Hava və Təhlükəsizlik API" },
  kk: { loading:"Төтенше • Орналасқан жер жүктелуде...", near:"Төтенше • {zip} жанында", scanning:"NOAA, OpenWeather, USGS сканерлеу...", allClear:"{zip}-да бәрі таза • Белсенді ескерту жоқ", refresh:"Авто-жаңарту 5м • Ауа райы және Қауіпсіздік API" },
  ky: { loading:"Өзгөчө кырдаал • Жайгашкан жер жүктөлүүдө...", near:"Өзгөчө кырдаал • {zip} жанында", scanning:"NOAA, OpenWeather, USGS сканерленүүдө...", allClear:"{zip}-да баары таза • Активдүү эскертүү жок", refresh:"Авто-жаңыртуу 5м • Аба ырайы жана Коопсуздук API" },
  uz: { loading:"Favqulodda • Joylashuv yuklanmoqda...", near:"Favqulodda • {zip} yaqinida", scanning:"NOAA, OpenWeather, USGS skanerlanmoqda...", allClear:"{zip} da hammasi toza • Faol ogohlantirish yo'q", refresh:"Avto-yangilash 5d • Ob-havo va Xavfsizlik API" },
  tg: { loading:"Фавқулодда • Боркунии макон...", near:"Фавқулодда • Дар наздикии {zip}", scanning:"Сканкунии NOAA, OpenWeather, USGS...", allClear:"Ҳама тоза дар {zip} • Ҳеҷ огоҳии фаъол нест", refresh:"Навсозии худкор 5д • API Обу ҳаво ва Амният" },
  mn: { loading:"Яаралтай • Байршил ачааллаж байна...", near:"Яаралтай • {zip} ойролцоо", scanning:"NOAA, OpenWeather, USGS сканнердаж байна...", allClear:"{zip} дотор бүх зүйл цэвэр • Идэвхтэй сэрэмжлүүлэг байхгүй", refresh:"Авто-шинэчлэл 5м • Цаг агаар & Аюулгүй байдал API" },
  km: { loading:"សង្គ្រោះបន្ទាន់ • កំពុងផ្ទុកទីតាំង...", near:"សង្គ្រោះបន្ទាន់ • ជិត {zip}", scanning:"កំពុងស្កេន NOAA, OpenWeather, USGS...", allClear:"ស្អាតទាំងអស់នៅ {zip} • គ្មានការជូនដំណឹងសកម្ម", refresh:"ធ្វើបច្ចុប្បន្នភាពស្វ័យប្រវត្តិ 5ន • API អាកាសធាតុ & សុវត្ថិភាព" },
  lo: { loading:"ສຸກເສີນ • ກຳລັງໂຫຼດທີ່ຕັ້ງ...", near:"ສຸກເສີນ • ໃກ້ {zip}", scanning:"ສະແກນ NOAA, OpenWeather, USGS...", allClear:"ທຸກຢ່າງປອດໄພໃນ {zip} • ບໍ່ມີແຈ້ງເຕືອນ", refresh:"ຣີເຟຣສອັດຕະໂນມັດ 5ນ • API ສະພາບອາກາດ & ຄວາມປອດໄພ" },
  my: { loading:"အရေးပေါ် • တည်နေရာတင်နေသည်...", near:"အရေးပေါ် • {zip} အနီး", scanning:"NOAA, OpenWeather, USGS စကင်ဖတ်နေသည်...", allClear:"{zip} တွင် အားလုံးရှင်းလင်းသည် • တက်ကြွသောသတိပေးချက်မရှိပါ", refresh:"အလိုအလျောက်ပြန်လည်ဆန်းသစ်မှု 5မိ • ရာသီဥတုနှင့် လုံခြုံရေး API" },
}

export function EmergencyAlerts() {
  const { zip: globalZip } = useLocation()
  const { filter } = useLocationScope()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [status, setStatus] = useState<'checking'|'clear'|'alert'>('checking')
  const [zip, setZip] = useState('')

  useEffect(()=>{
    if (!globalZip) return
    setZip(globalZip)
    let mounted = true
    const load = async()=>{
      try{
        const currentZip = globalZip
        const supabase = createClient() as any
        let data: any[] = []
        if (filter.lat!= null && filter.lng!= null) {
          const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
          const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)
          const { data: alertData } = await supabase.from('alerts').select('id,message,event,title,body,latitude,longitude').eq('is_active', true).gte('latitude', bbox.minLat).lte('latitude', bbox.maxLat).gte('longitude', bbox.minLng).lte('longitude', bbox.maxLng).limit(10)
          if (alertData) data = applyScope(alertData, filter)
        } else {
          const { data: alertData, count } = await supabase.from('alerts').select('id,message,event,title,body', {count:'exact'}).eq('is_active', true).eq('zip_code', currentZip).limit(3)
          if (count && count > 0) data = alertData || []
        }
        if(mounted && data.length > 0){ setAlerts(data); setStatus('alert'); return }
        const res = await fetch(`/api/emergency?zip=${currentZip}`)
        const json = await res.json()
        if(mounted && json.alerts && json.alerts.length > 0){ if(json.alerts.length === 1 && json.alerts[0].type === 'Status'){ setAlerts(json.alerts); setStatus('clear') } else { setAlerts(json.alerts); setStatus('alert') } } else { if(mounted) setStatus('clear') }
      }catch(e){ try { console.log(e) } catch {}; if(mounted) setStatus('clear') }
    }
    load()
    const id = setInterval(()=>{ try { load() } catch {} }, 5*60*1000)
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[globalZip, filter])

  if (!globalZip) return (<div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">🚨 {d.loading}</p></div>)

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold flex items-center gap-2">🚨 {d.near.replace('{zip}', zip)}</p>
      {status === 'checking' && <p className="text-sm mt-2 text-white/60 animate-pulse">{d.scanning}</p>}
      {status === 'clear' && (<div className="mt-2">{alerts.map(a=> (<p key={a.id} className="text-sm text-white/80 bg-white/5 rounded-lg p-2.5">{(a as any).icon} {a.title} - {a.message}</p>))}{alerts.length===0 && <p className="text-sm mt-1 text-white/80">{d.allClear.replace('{zip}', zip)}</p>}</div>)}
      {status === 'alert' && (<div className="mt-3 space-y-2">{alerts.map(a=> (<div key={a.id} className="text-sm bg-red-500/15 border border-red-500/30 rounded-lg p-2.5"><div className="font-black text-red-200 text-xs">{(a as any).icon || '🚨'} {a.title || a.event} {a.type? `• ${a.type}` : ''}</div><div className="text-white/80 mt-1 text-xs leading-snug">{a.message || a.body}</div></div>))}<p className="text-xs text-white/30 mt-2">{d.refresh}</p></div>)}
    </div>
  )
}
export default EmergencyAlerts
