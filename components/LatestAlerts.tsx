'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { justNow:"Just now", mAgo:"m ago", hAgo:"h ago", dAgo:"d ago", latest:"⚠ Latest Alerts", loadingLoc:"Loading location...", loading:"Loading...", allClear:"✅ All clear — no active alerts", alert:"Alert" },
  es: { justNow:"Ahora", mAgo:"m atrás", hAgo:"h atrás", dAgo:"d atrás", latest:"⚠ Últimas Alertas", loadingLoc:"Cargando ubicación...", loading:"Cargando...", allClear:"✅ Todo claro — sin alertas activas", alert:"Alerta" },
  fr: { justNow:"À l'instant", mAgo:"m", hAgo:"h", dAgo:"j", latest:"⚠ Dernières Alertes", loadingLoc:"Chargement lieu...", loading:"Chargement...", allClear:"✅ Tout clair — pas d'alertes actives", alert:"Alerte" },
  de: { justNow:"Gerade eben", mAgo:"m her", hAgo:"h her", dAgo:"T her", latest:"⚠ Neueste Warnungen", loadingLoc:"Ort laden...", loading:"Laden...", allClear:"✅ Alles klar — keine aktiven Warnungen", alert:"Warnung" },
  zh: { justNow:"刚刚", mAgo:"分钟前", hAgo:"小时前", dAgo:"天前", latest:"⚠ 最新警报", loadingLoc:"加载位置...", loading:"加载中...", allClear:"✅ 一切正常 — 无活动警报", alert:"警报" },
  ja: { justNow:"たった今", mAgo:"分前", hAgo:"時間前", dAgo:"日前", latest:"⚠ 最新アラート", loadingLoc:"位置読み込み中...", loading:"読み込み中...", allClear:"✅ 問題なし — アクティブなアラートなし", alert:"アラート" },
  ko: { justNow:"방금", mAgo:"분 전", hAgo:"시간 전", dAgo:"일 전", latest:"⚠ 최신 알림", loadingLoc:"위치 로드 중...", loading:"로드 중...", allClear:"✅ 모두 정상 — 활성 알림 없음", alert:"알림" },
  pt: { justNow:"Agora mesmo", mAgo:"m atrás", hAgo:"h atrás", dAgo:"d atrás", latest:"⚠ Últimos Alertas", loadingLoc:"Carregando localização...", loading:"Carregando...", allClear:"✅ Tudo limpo — sem alertas ativos", alert:"Alerta" },
  ru: { justNow:"Только что", mAgo:"м назад", hAgo:"ч назад", dAgo:"д назад", latest:"⚠ Последние Тревоги", loadingLoc:"Загрузка местоположения...", loading:"Загрузка...", allClear:"✅ Все чисто — нет активных тревог", alert:"Тревога" },
  ar: { justNow:"الآن", mAgo:"د مضت", hAgo:"س مضت", dAgo:"ي مضت", latest:"⚠ أحدث التنبيهات", loadingLoc:"جاري تحميل الموقع...", loading:"جاري التحميل...", allClear:"✅ كل شيء واضح — لا تنبيهات نشطة", alert:"تنبيه" },
  hi: { justNow:"अभी", mAgo:"मि पहले", hAgo:"घं पहले", dAgo:"दि पहले", latest:"⚠ नवीनतम अलर्ट", loadingLoc:"स्थान लोड हो रहा...", loading:"लोड हो रहा...", allClear:"✅ सब साफ — कोई सक्रिय अलर्ट नहीं", alert:"अलर्ट" },
  it: { justNow:"Proprio ora", mAgo:"m fa", hAgo:"h fa", dAgo:"g fa", latest:"⚠ Ultimi Allarmi", loadingLoc:"Caricamento posizione...", loading:"Caricamento...", allClear:"✅ Tutto chiaro — nessun allarme attivo", alert:"Allarme" },
  nl: { justNow:"Zojuist", mAgo:"m geleden", hAgo:"u geleden", dAgo:"d geleden", latest:"⚠ Laatste Waarschuwingen", loadingLoc:"Locatie laden...", loading:"Laden...", allClear:"✅ Alles veilig — geen actieve waarschuwingen", alert:"Waarschuwing" },
  tl: { justNow:"Ngayon lang", mAgo:"m nakalipas", hAgo:"h nakalipas", dAgo:"d nakalipas", latest:"⚠ Pinakabagong Alerto", loadingLoc:"Naglo-load ng lokasyon...", loading:"Naglo-load...", allClear:"✅ All clear — walang aktibong alerto", alert:"Alerto" },
  bn: { justNow:"এইমাত্র", mAgo:"মি আগে", hAgo:"ঘ আগে", dAgo:"দি আগে", latest:"⚠ সর্বশেষ সতর্কতা", loadingLoc:"অবস্থান লোড হচ্ছে...", loading:"লোড হচ্ছে...", allClear:"✅ সব পরিষ্কার — কোন সক্রিয় সতর্কতা নেই", alert:"সতর্কতা" },
  id: { justNow:"Baru saja", mAgo:"m lalu", hAgo:"j lalu", dAgo:"h lalu", latest:"⚠ Peringatan Terbaru", loadingLoc:"Memuat lokasi...", loading:"Memuat...", allClear:"✅ Semua aman — tidak ada peringatan aktif", alert:"Peringatan" },
  vi: { justNow:"Vừa xong", mAgo:"p trước", hAgo:"g trước", dAgo:"n trước", latest:"⚠ Cảnh Báo Mới Nhất", loadingLoc:"Đang tải vị trí...", loading:"Đang tải...", allClear:"✅ Tất cả an toàn — không có cảnh báo hoạt động", alert:"Cảnh báo" },
  th: { justNow:"เมื่อสักครู่", mAgo:"นาทีที่แล้ว", hAgo:"ชั่วโมงที่แล้ว", dAgo:"วันที่แล้ว", latest:"⚠ การแจ้งเตือนล่าสุด", loadingLoc:"กำลังโหลดตำแหน่ง...", loading:"กำลังโหลด...", allClear:"✅ ทั้งหมดชัดเจน — ไม่มีการแจ้งเตือนที่ใช้งานอยู่", alert:"แจ้งเตือน" },
  sv: { justNow:"Just nu", mAgo:"m sedan", hAgo:"h sedan", dAgo:"d sedan", latest:"⚠ Senaste Larm", loadingLoc:"Laddar plats...", loading:"Laddar...", allClear:"✅ Allt klart — inga aktiva larm", alert:"Larm" },
  pl: { justNow:"Właśnie teraz", mAgo:"m temu", hAgo:"g temu", dAgo:"d temu", latest:"⚠ Najnowsze Alerty", loadingLoc:"Ładowanie lokalizacji...", loading:"Ładowanie...", allClear:"✅ Wszystko w porządku — brak aktywnych alertów", alert:"Alert" },
  tr: { justNow:"Şimdi", mAgo:"dk önce", hAgo:"sa önce", dAgo:"g önce", latest:"⚠ Son Uyarılar", loadingLoc:"Konum yükleniyor...", loading:"Yükleniyor...", allClear:"✅ Her şey temiz — aktif uyarı yok", alert:"Uyarı" },
  uk: { justNow:"Щойно", mAgo:"хв тому", hAgo:"год тому", dAgo:"дн тому", latest:"⚠ Останні Тривоги", loadingLoc:"Завантаження місцезнаходження...", loading:"Завантаження...", allClear:"✅ Все чисто — немає активних тривог", alert:"Тривога" },
  el: { justNow:"Μόλις τώρα", mAgo:"λ πριν", hAgo:"ώ πριν", dAgo:"μ πριν", latest:"⚠ Τελευταίες Ειδοποιήσεις", loadingLoc:"Φόρτωση τοποθεσίας...", loading:"Φόρτωση...", allClear:"✅ Όλα καθαρά — καμία ενεργή ειδοποίηση", alert:"Ειδοποίηση" },
  he: { justNow:"עכשיו", mAgo:"ד' לפני", hAgo:"ש' לפני", dAgo:"י' לפני", latest:"⚠ התראות אחרונות", loadingLoc:"טוען מיקום...", loading:"טוען...", allClear:"✅ הכל נקי — אין התראות פעילות", alert:"התראה" },
  ur: { justNow:"ابھی", mAgo:"م پہلے", hAgo:"گ پہلے", dAgo:"د پہلے", latest:"⚠ تازہ ترین الرٹس", loadingLoc:"مقام لوڈ ہو رہا...", loading:"لوڈ ہو رہا...", allClear:"✅ سب صاف — کوئی فعال الرٹ نہیں", alert:"الرٹ" },
  fa: { justNow:"همین الان", mAgo:"دقیقه پیش", hAgo:"ساعت پیش", dAgo:"روز پیش", latest:"⚠ آخرین هشدارها", loadingLoc:"در حال بارگذاری مکان...", loading:"در حال بارگذاری...", allClear:"✅ همه چیز پاک — هیچ هشدار فعالی نیست", alert:"هشدار" },
  ms: { justNow:"Baru sekarang", mAgo:"m lalu", hAgo:"j lalu", dAgo:"h lalu", latest:"⚠ Amaran Terkini", loadingLoc:"Memuatkan lokasi...", loading:"Memuatkan...", allClear:"✅ Semua jelas — tiada amaran aktif", alert:"Amaran" },
  ro: { justNow:"Chiar acum", mAgo:"m în urmă", hAgo:"h în urmă", dAgo:"z în urmă", latest:"⚠ Ultimele Alerte", loadingLoc:"Se încarcă locația...", loading:"Se încarcă...", allClear:"✅ Totul clar — nicio alertă activă", alert:"Alertă" },
  cs: { justNow:"Právě teď", mAgo:"m zpět", hAgo:"h zpět", dAgo:"d zpět", latest:"⚠ Nejnovější Upozornění", loadingLoc:"Načítání polohy...", loading:"Načítání...", allClear:"✅ Vše v pořádku — žádná aktivní upozornění", alert:"Upozornění" },
  hu: { justNow:"Épp most", mAgo:"p ezelőtt", hAgo:"ó ezelőtt", dAgo:"n ezelőtt", latest:"⚠ Legújabb Riasztások", loadingLoc:"Hely betöltése...", loading:"Betöltés...", allClear:"✅ Minden rendben — nincs aktív riasztás", alert:"Riasztás" },
  fi: { justNow:"Juuri nyt", mAgo:"m sitten", hAgo:"h sitten", dAgo:"pv sitten", latest:"⚠ Viimeisimmät Hälytykset", loadingLoc:"Ladataan sijaintia...", loading:"Ladataan...", allClear:"✅ Kaikki kunnossa — ei aktiivisia hälytyksiä", alert:"Hälytys" },
  no: { justNow:"Akkurat nå", mAgo:"m siden", hAgo:"t siden", dAgo:"d siden", latest:"⚠ Siste Varsler", loadingLoc:"Laster posisjon...", loading:"Laster...", allClear:"✅ Alt klart — ingen aktive varsler", alert:"Varsel" },
  da: { justNow:"Lige nu", mAgo:"m siden", hAgo:"t siden", dAgo:"d siden", latest:"⚠ Seneste Alarmer", loadingLoc:"Indlæser placering...", loading:"Indlæser...", allClear:"✅ Alt klart — ingen aktive alarmer", alert:"Alarm" },
  bg: { justNow:"Точно сега", mAgo:"м преди", hAgo:"ч преди", dAgo:"д преди", latest:"⚠ Последни Сигнали", loadingLoc:"Зареждане на местоположение...", loading:"Зареждане...", allClear:"✅ Всичко чисто — няма активни сигнали", alert:"Сигнал" },
  hr: { justNow:"Upravo sada", mAgo:"m prije", hAgo:"h prije", dAgo:"d prije", latest:"⚠ Najnovija Upozorenja", loadingLoc:"Učitavanje lokacije...", loading:"Učitavanje...", allClear:"✅ Sve čisto — nema aktivnih upozorenja", alert:"Upozorenje" },
  sr: { justNow:"Управо сада", mAgo:"м пре", hAgo:"ч пре", dAgo:"д пре", latest:"⚠ Најновија Упозорења", loadingLoc:"Учитавање локације...", loading:"Учитавање...", allClear:"✅ Све чисто — нема активних упозорења", alert:"Упозорење" },
  sk: { justNow:"Práve teraz", mAgo:"m dozadu", hAgo:"h dozadu", dAgo:"d dozadu", latest:"⚠ Najnovšie Upozornenia", loadingLoc:"Načítanie polohy...", loading:"Načítanie...", allClear:"✅ Všetko v poriadku — žiadne aktívne upozornenia", alert:"Upozornenie" },
  sl: { justNow:"Pravkar", mAgo:"m nazaj", hAgo:"h nazaj", dAgo:"d nazaj", latest:"⚠ Najnovejša Opozorila", loadingLoc:"Nalaganje lokacije...", loading:"Nalaganje...", allClear:"✅ Vse jasno — ni aktivnih opozoril", alert:"Opozorilo" },
  et: { justNow:"Just nüüd", mAgo:"m tagasi", hAgo:"h tagasi", dAgo:"p tagasi", latest:"⚠ Viimased Hoiatused", loadingLoc:"Asukoha laadimine...", loading:"Laadimine...", allClear:"✅ Kõik korras — aktiivseid hoiatusi pole", alert:"Hoiatus" },
  lv: { justNow:"Tikko tagad", mAgo:"m atpakaļ", hAgo:"h atpakaļ", dAgo:"d atpakaļ", latest:"⚠ Jaunākie Brīdinājumi", loadingLoc:"Ielādē atrašanās vietu...", loading:"Ielādē...", allClear:"✅ Viss tīrs — nav aktīvu brīdinājumu", alert:"Brīdinājums" },
  lt: { justNow:"Ką tik", mAgo:"m atgal", hAgo:"v atgal", dAgo:"d atgal", latest:"⚠ Naujausi Įspėjimai", loadingLoc:"Įkeliama vieta...", loading:"Įkeliama...", allClear:"✅ Viskas švaru — nėra aktyvių įspėjimų", alert:"Įspėjimas" },
  be: { justNow:"Толькі што", mAgo:"хв таму", hAgo:"г таму", dAgo:"дн таму", latest:"⚠ Апошнія Трывогі", loadingLoc:"Загрузка месцазнаходжання...", loading:"Загрузка...", allClear:"✅ Усё чыста — няма актыўных трывог", alert:"Трывога" },
  ka: { justNow:"ახლახანს", mAgo:"წთ წინ", hAgo:"სთ წინ", dAgo:"დღ წინ", latest:"⚠ უახლესი გაფრთხილებები", loadingLoc:"მდებარეობის ჩატვირთვა...", loading:"იტვირთება...", allClear:"✅ ყველაფერი სუფთაა — აქტიური გაფრთხილება არ არის", alert:"გაფრთხილება" },
  hy: { justNow:"Հենց հիմա", mAgo:"ր առաջ", hAgo:"ժ առաջ", dAgo:"օ առաջ", latest:"⚠ Վերջին Զգուշացումներ", loadingLoc:"Բեռնում է գտնվելու վայրը...", loading:"Բեռնում...", allClear:"✅ Ամեն ինչ մաքուր է — ակտիվ զգուշացումներ չկան", alert:"Զգուշացում" },
  az: { justNow:"İndicə", mAgo:"dəq əvvəl", hAgo:"saat əvvəl", dAgo:"gün əvvəl", latest:"⚠ Son Xəbərdarlıqlar", loadingLoc:"Məkan yüklənir...", loading:"Yüklənir...", allClear:"✅ Hər şey təmizdir — aktiv xəbərdarlıq yoxdur", alert:"Xəbərdarlıq" },
  kk: { justNow:"Қазір ғана", mAgo:"м бұрын", hAgo:"с бұрын", dAgo:"к бұрын", latest:"⚠ Соңғы Дабылдар", loadingLoc:"Орын жүктелуде...", loading:"Жүктелуде...", allClear:"✅ Бәрі таза — белсенді дабыл жоқ", alert:"Дабыл" },
  ky: { justNow:"Азыр гана", mAgo:"м мурда", hAgo:"с мурда", dAgo:"к мурда", latest:"⚠ Акыркы Эскертүүлөр", loadingLoc:"Жайгашкан жер жүктөлүүдө...", loading:"Жүктөлүүдө...", allClear:"✅ Баары таза — активдүү эскертүү жок", alert:"Эскертүү" },
  uz: { justNow:"Hozirgina", mAgo:"daq oldin", hAgo:"soat oldin", dAgo:"kun oldin", latest:"⚠ So'nggi Ogohlantirishlar", loadingLoc:"Joylashuv yuklanmoqda...", loading:"Yuklanmoqda...", allClear:"✅ Hammasi toza — faol ogohlantirish yo'q", alert:"Ogohlantirish" },
  tg: { justNow:"Ҳозир", mAgo:"дақ пеш", hAgo:"соат пеш", dAgo:"рӯз пеш", latest:"⚠ Огоҳиҳои охирин", loadingLoc:"Боркунии макон...", loading:"Боркунӣ...", allClear:"✅ Ҳама тоза — ҳеҷ огоҳии фаъол нест", alert:"Огоҳӣ" },
  mn: { justNow:"Дөнгөж сая", mAgo:"м өмнө", hAgo:"ц өмнө", dAgo:"ө өмнө", latest:"⚠ Сүүлийн Сэрэмжлүүлэг", loadingLoc:"Байршил ачаалж байна...", loading:"Ачаалж байна...", allClear:"✅ Бүх зүйл цэвэр — идэвхтэй сэрэмжлүүлэг байхгүй", alert:"Сэрэмжлүүлэг" },
  km: { justNow:"ឥឡូវនេះ", mAgo:"នាទីមុន", hAgo:"ម៉ោងមុន", dAgo:"ថ្ងៃមុន", latest:"⚠ ការជូនដំណឹងចុងក្រោយ", loadingLoc:"កំពុងផ្ទុកទីតាំង...", loading:"កំពុងផ្ទុក...", allClear:"✅ ទាំងអស់ច្បាស់ — គ្មានការជូនដំណឹងសកម្ម", alert:"ជូនដំណឹង" },
  lo: { justNow:"ດຽວນີ້", mAgo:"ນາທີກ່ອນ", hAgo:"ຊົ່ວໂມງກ່ອນ", dAgo:"ມື້ກ່ອນ", latest:"⚠ ການແຈ້ງເຕືອນຫຼ້າສຸດ", loadingLoc:"ກຳລັງໂຫຼດທີ່ຕັ້ງ...", loading:"ກຳລັງໂຫຼດ...", allClear:"✅ ທັງໝົດຈະແຈ້ງ — ບໍ່ມີການແຈ້ງເຕືອນທີ່ໃຊ້ງານ", alert:"ແຈ້ງເຕືອນ" },
  my: { justNow:"အခုလေးတင်", mAgo:"မိနစ်အကြာ", hAgo:"နာရီအကြာ", dAgo:"ရက်အကြာ", latest:"⚠ နောက်ဆုံးသတိပေးချက်များ", loadingLoc:"တည်နေရာတင်နေသည်...", loading:"တင်နေသည်...", allClear:"✅ အားလုံးရှင်းလင်းသည် — တက်ကြွသောသတိပေးချက်မရှိပါ", alert:"သတိပေးချက်" },
}

type Alert = { id: string; title?: string; body?: string; severity?: string; created_at: string; latitude?: number | null; longitude?: number | null }

function timeAgo(iso:string, d:any){ try { const s = Math.floor((Date.now()-new Date(iso).getTime())/1000); if(s<60) return d.justNow; const m=Math.floor(s/60); if(m<60) return `${m}${d.mAgo}`; const h=Math.floor(m/60); if(h<24) return `${h}${d.hAgo}`; return `${Math.floor(h/24)}${d.dAgo}` } catch { return '' } }

export function LatestAlerts(){
  const { zip, lat, lng } = useLocation()
  const { filter } = useLocationScope()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [alerts, setAlerts]=useState<Alert[]>([])
  const [loading, setLoading]=useState(true)

  useEffect(()=>{
    if (!zip) return
    let mounted = true; let ch: any = null; let intervalId: any = null
    const load = async()=>{
      try {
        const supabase = createClient() as any
        let data: any[] = []

        if (filter.lat!= null && filter.lng!= null) {
          const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
          const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)

          const { data: alertData } = await supabase
          .from('alerts')
          .select('*')
          .eq('is_active', true)
          .gte('latitude', bbox.minLat)
          .lte('latitude', bbox.maxLat)
          .gte('longitude', bbox.minLng)
          .lte('longitude', bbox.maxLng)
          .order('created_at',{ascending:false})
          .limit(10)

          if (alertData) {
            data = applyScope(alertData, filter)
          }
        } else {
          const { data: alertData } = await supabase.from('alerts').select('*').eq('is_active', true).eq('zip_code', zip).order('created_at',{ascending:false}).limit(5)
          data = alertData || []
        }

        if(mounted && data.length > 0){ setAlerts(data); setLoading(false); return }

        if(mounted) setLoading(false)
      } catch { if(mounted) setLoading(false) }
    }
    const setup = async()=>{
      try {
        const supabase = createClient() as any
        ch = supabase.channel(`latest-alerts-${zip}`).on('postgres_changes',{event:'*',schema:'public',table:'alerts'}, load).subscribe()
      } catch {}
    }
    load(); setup()
    intervalId = setInterval(()=>{ try { load() } catch {} }, 15*60*1000)
    return ()=>{ mounted = false; try { if (ch) { const supabase = createClient() as any; supabase.removeChannel(ch) } } catch {}; try { clearInterval(intervalId) } catch {} }
  },[zip, lat, lng, filter])

  if (!zip) return (<div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">{d.latest}</p><p className="text-sm mt-2 text-white/60">{d.loadingLoc}</p></div>)
  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">{d.latest} • {zip}</p>
      {loading? <p className="text-sm mt-2 text-white/60">{d.loading}</p> : alerts.length===0? (<p className="text-sm mt-2 text-white/80">{d.allClear}</p>) : (<div className="mt-3 space-y-3">{alerts.map(a=>(<div key={a.id} className="border-b border-white/10 pb-2 last:border-0 last:pb-0"><p className="text-sm font-semibold truncate">{a.title || d.alert}</p>{a.body && <p className="text-xs text-white/70 line-clamp-2 mt-1">{a.body}</p>}<p className="text-xs text-white/40 mt-1">🕒 {timeAgo(a.created_at, d)} {a.severity? `• ${a.severity}`:''}</p></div>))}</div>)}
    </div>
  )
}
export default LatestAlerts
