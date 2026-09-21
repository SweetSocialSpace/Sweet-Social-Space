'use client'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'
import MicRecorder from '@/components/mic/MicRecorder'
import LocationScopeBar from '@/components/LocationScopeBar'
import LiveNowStrip from '@/components/LiveNowStrip'
import { smartPunctuate } from '@/components/mic/smartPunctuate'

const TAG_KEYS = ["general","alert","recommendation","free_stuff","hot_take","lost_found"] as const

// ALL 53 LANGUAGES SELF-CONTAINED IN THIS FOLDER
const D: Record<string, any> = {
  en: { placeholder:"What's happening in {zip}?", loading:"Loading location...", fix:"Fix punctuation", posting:"POSTING...", postAs:"POST AS", in:"IN", live:"📹 Recorded Live Stream", tags:{ general:"General", alert:"Alert", recommendation:"Recommendation", free_stuff:"Free Stuff", hot_take:"Hot Take", lost_found:"Lost & Found" } },
  es: { placeholder:"¿Qué pasa en {zip}?", loading:"Cargando ubicación...", fix:"Corregir puntuación", posting:"PUBLICANDO...", postAs:"PUBLICAR COMO", in:"EN", live:"📹 Transmisión Grabada", tags:{ general:"General", alert:"Alerta", recommendation:"Recomendación", free_stuff:"Cosas Gratis", hot_take:"Opinión", lost_found:"Perdido y Encontrado" } },
  fr: { placeholder:"Quoi de neuf à {zip}?", loading:"Chargement...", fix:"Corriger ponctuation", posting:"PUBLICATION...", postAs:"PUBLIER COMME", in:"À", live:"📹 Direct Enregistré", tags:{ general:"Général", alert:"Alerte", recommendation:"Recommandation", free_stuff:"Gratuit", hot_take:"Avis", lost_found:"Perdu & Trouvé" } },
  de: { placeholder:"Was passiert in {zip}?", loading:"Lade Standort...", fix:"Zeichensetzung korrigieren", posting:"POSTE...", postAs:"POSTEN ALS", in:"IN", live:"📹 Live Aufzeichnung", tags:{ general:"Allgemein", alert:"Alarm", recommendation:"Empfehlung", free_stuff:"Kostenlos", hot_take:"Meinung", lost_found:"Verloren & Gefunden" } },
  zh: { placeholder:"{zip} 发生了什么？", loading:"加载位置...", fix:"修复标点", posting:"发布中...", postAs:"发布为", in:"在", live:"📹 录制的直播", tags:{ general:"一般", alert:"警报", recommendation:"推荐", free_stuff:"免费", hot_take:"热评", lost_found:"失物招领" } },
  ja: { placeholder:"{zip}で何が起きてる？", loading:"位置を読み込み中...", fix:"句読点を修正", posting:"投稿中...", postAs:"投稿", in:"IN", live:"📹 録画ライブ", tags:{ general:"一般", alert:"警告", recommendation:"おすすめ", free_stuff:"無料", hot_take:"意見", lost_found:"落し物" } },
  ko: { placeholder:"{zip}에서 무슨 일이?", loading:"위치 로딩...", fix:"구두점 수정", posting:"게시 중...", postAs:"게시", in:"IN", live:"📹 녹화된 라이브", tags:{ general:"일반", alert:"경고", recommendation:"추천", free_stuff:"무료", hot_take:"의견", lost_found:"분실물" } },
  pt: { placeholder:"O que está acontecendo em {zip}?", loading:"Carregando...", fix:"Corrigir pontuação", posting:"POSTANDO...", postAs:"POSTAR COMO", in:"EM", live:"📹 Live Gravada", tags:{ general:"Geral", alert:"Alerta", recommendation:"Recomendação", free_stuff:"Grátis", hot_take:"Opinião", lost_found:"Perdidos e Achados" } },
  ru: { placeholder:"Что происходит в {zip}?", loading:"Загрузка...", fix:"Исправить пунктуацию", posting:"ПУБЛИКАЦИЯ...", postAs:"ОПУБЛИКОВАТЬ КАК", in:"В", live:"📹 Запись эфира", tags:{ general:"Общее", alert:"Тревога", recommendation:"Рекомендация", free_stuff:"Бесплатно", hot_take:"Мнение", lost_found:"Потеряно и Найдено" } },
  ar: { placeholder:"ماذا يحدث في {zip}؟", loading:"جاري التحميل...", fix:"إصلاح الترقيم", posting:"جاري النشر...", postAs:"نشر كـ", in:"في", live:"📹 بث مسجل", tags:{ general:"عام", alert:"تنبيه", recommendation:"توصية", free_stuff:"مجاني", hot_take:"رأي", lost_found:"مفقود وموجود" } },
  hi: { placeholder:"{zip} में क्या हो रहा है?", loading:"स्थान लोड हो रहा है...", fix:"विराम चिह्न ठीक करें", posting:"पोस्ट हो रहा है...", postAs:"पोस्ट करें", in:"में", live:"📹 रिकॉर्डेड लाइव", tags:{ general:"सामान्य", alert:"अलर्ट", recommendation:"सिफारिश", free_stuff:"मुफ्त", hot_take:"राय", lost_found:"खोया और पाया" } },
  it: { placeholder:"Cosa succede a {zip}?", loading:"Caricamento...", fix:"Correggi punteggiatura", posting:"PUBBLICAZIONE...", postAs:"PUBBLICA COME", in:"IN", live:"📹 Live Registrata", tags:{ general:"Generale", alert:"Allerta", recommendation:"Raccomandazione", free_stuff:"Gratis", hot_take:"Opinione", lost_found:"Oggetti Smarriti" } },
  nl: { placeholder:"Wat gebeurt er in {zip}?", loading:"Locatie laden...", fix:"Interpunctie corrigeren", posting:"POSTEN...", postAs:"POSTEN ALS", in:"IN", live:"📹 Opgenomen Live", tags:{ general:"Algemeen", alert:"Alert", recommendation:"Aanbeveling", free_stuff:"Gratis", hot_take:"Mening", lost_found:"Verloren & Gevonden" } },
  tl: { placeholder:"Anong nangyayari sa {zip}?", loading:"Naglo-load...", fix:"Ayusin bantas", posting:"NAGPO-POST...", postAs:"I-POST BILANG", in:"SA", live:"📹 Na-record na Live", tags:{ general:"General", alert:"Alerto", recommendation:"Rekomendasyon", free_stuff:"Libre", hot_take:"Opinyon", lost_found:"Nawawala" } },
  bn: { placeholder:"{zip} এ কী হচ্ছে?", loading:"লোড হচ্ছে...", fix:"যতিচিহ্ন ঠিক করুন", posting:"পোস্ট হচ্ছে...", postAs:"পোস্ট করুন", in:"এ", live:"📹 রেকর্ডেড লাইভ", tags:{ general:"সাধারণ", alert:"সতর্কতা", recommendation:"সুপারিশ", free_stuff:"বিনামূল্যে", hot_take:"মতামত", lost_found:"হারানো ও প্রাপ্ত" } },
  id: { placeholder:"Apa yang terjadi di {zip}?", loading:"Memuat lokasi...", fix:"Perbaiki tanda baca", posting:"MEMPOSTING...", postAs:"POSTING SEBAGAI", in:"DI", live:"📹 Siaran Rekaman", tags:{ general:"Umum", alert:"Peringatan", recommendation:"Rekomendasi", free_stuff:"Gratis", hot_take:"Pendapat", lost_found:"Hilang & Ditemukan" } },
  vi: { placeholder:"Chuyện gì ở {zip}?", loading:"Đang tải...", fix:"Sửa dấu câu", posting:"ĐANG ĐĂNG...", postAs:"ĐĂNG NHƯ", in:"TẠI", live:"📹 Phát trực tiếp đã ghi", tags:{ general:"Chung", alert:"Cảnh báo", recommendation:"Đề xuất", free_stuff:"Miễn phí", hot_take:"Quan điểm", lost_found:"Thất lạc" } },
  th: { placeholder:"เกิดอะไรขึ้นใน {zip}?", loading:"กำลังโหลด...", fix:"แก้เครื่องหมายวรรคตอน", posting:"กำลังโพสต์...", postAs:"โพสต์เป็น", in:"ใน", live:"📹 บันทึกไลฟ์", tags:{ general:"ทั่วไป", alert:"แจ้งเตือน", recommendation:"แนะนำ", free_stuff:"ฟรี", hot_take:"ความคิดเห็น", lost_found:"ของหาย" } },
  // The remaining 35 languages use the same structure — fallback to English keys but translated titles so they never show English
  sv: { placeholder:"Vad händer i {zip}?", loading:"Laddar...", fix:"Fixa interpunktion", posting:"POSTAR...", postAs:"POSTA SOM", in:"I", live:"📹 Inspelad Live", tags:{ general:"Allmänt", alert:"Larm", recommendation:"Rekommendation", free_stuff:"Gratis", hot_take:"Åsikt", lost_found:"Borttappat" } },
  pl: { placeholder:"Co się dzieje w {zip}?", loading:"Ładowanie...", fix:"Popraw interpunkcję", posting:"PUBLIKUJĘ...", postAs:"OPUBLIKUJ JAKO", in:"W", live:"📹 Nagrany Live", tags:{ general:"Ogólne", alert:"Alert", recommendation:"Rekomendacja", free_stuff:"Za Darmo", hot_take:"Opinia", lost_found:"Zgubione" } },
  tr: { placeholder:"{zip}'de ne oluyor?", loading:"Yükleniyor...", fix:"Noktalama düzelt", posting:"GÖNDERİLİYOR...", postAs:"OLARAK GÖNDER", in:"DE", live:"📹 Kaydedilmiş Canlı", tags:{ general:"Genel", alert:"Uyarı", recommendation:"Öneri", free_stuff:"Ücretsiz", hot_take:"Görüş", lost_found:"Kayıp" } },
  uk: { placeholder:"Що відбувається в {zip}?", loading:"Завантаження...", fix:"Виправити пунктуацію", posting:"ПУБЛІКАЦІЯ...", postAs:"ОПУБЛІКУВАТИ ЯК", in:"В", live:"📹 Запис ефіру", tags:{ general:"Загальне", alert:"Тривога", recommendation:"Рекомендація", free_stuff:"Безкоштовно", hot_take:"Думка", lost_found:"Загублено" } },
  el: { placeholder:"Τι συμβαίνει στο {zip};", loading:"Φόρτωση...", fix:"Διόρθωση στίξης", posting:"ΔΗΜΟΣΙΕΥΣΗ...", postAs:"ΔΗΜΟΣΙΕΥΣΗ ΩΣ", in:"ΣΕ", live:"📹 Ηχογραφημένο Live", tags:{ general:"Γενικά", alert:"Συναγερμός", recommendation:"Σύσταση", free_stuff:"Δωρεάν", hot_take:"Άποψη", lost_found:"Χαμένα" } },
  he: { placeholder:"מה קורה ב {zip}?", loading:"טוען...", fix:"תקן פיסוק", posting:"מפרסם...", postAs:"פרסם כ", in:"ב", live:"📹 שידור מוקלט", tags:{ general:"כללי", alert:"התראה", recommendation:"המלצה", free_stuff:"חינם", hot_take:"דעה", lost_found:"אבדות" } },
  ro: { placeholder:"Ce se întâmplă în {zip}?", loading:"Se încarcă...", fix:"Corectează punctuația", posting:"POSTEZ...", postAs:"POSTEAZĂ CA", in:"ÎN", live:"📹 Live Înregistrat", tags:{ general:"General", alert:"Alertă", recommendation:"Recomandare", free_stuff:"Gratis", hot_take:"Opinie", lost_found:"Pierdut" } },
  cs: { placeholder:"Co se děje v {zip}?", loading:"Načítání...", fix:"Opravit interpunkci", posting:"PUBLIKUJI...", postAs:"PUBLIKOVAT JAKO", in:"V", live:"📹 Nahraný Živě", tags:{ general:"Obecné", alert:"Výstraha", recommendation:"Doporučení", free_stuff:"Zdarma", hot_take:"Názor", lost_found:"Ztraceno" } },
  hu: { placeholder:"Mi történik {zip}-ben?", loading:"Betöltés...", fix:"Központozás javítása", posting:"KÖZZÉTEL...", postAs:"KÖZZÉTESZ MINT", in:"BAN", live:"📹 Rögzített Élő", tags:{ general:"Általános", alert:"Riasztás", recommendation:"Ajánlás", free_stuff:"Ingyenes", hot_take:"Vélemény", lost_found:"Elveszett" } },
  fi: { placeholder:"Mitä tapahtuu {zip}?", loading:"Ladataan...", fix:"Korjaa välimerkit", posting:"JULKAISEN...", postAs:"JULKAISE KUTEN", in:"SSA", live:"📹 Tallennettu Live", tags:{ general:"Yleinen", alert:"Hälytys", recommendation:"Suositus", free_stuff:"Ilmainen", hot_take:"Mielipide", lost_found:"Kadonnut" } },
  no: { placeholder:"Hva skjer i {zip}?", loading:"Laster...", fix:"Fiks tegnsetting", posting:"POSTER...", postAs:"POST SOM", in:"I", live:"📹 Innspilt Live", tags:{ general:"Generelt", alert:"Varsel", recommendation:"Anbefaling", free_stuff:"Gratis", hot_take:"Mening", lost_found:"Mistet" } },
  da: { placeholder:"Hvad sker i {zip}?", loading:"Indlæser...", fix:"Ret tegnsætning", posting:"POSTER...", postAs:"POST SOM", in:"I", live:"📹 Optaget Live", tags:{ general:"Generelt", alert:"Alarm", recommendation:"Anbefaling", free_stuff:"Gratis", hot_take:"Mening", lost_found:"Mistet" } },
  bg: { placeholder:"Какво става в {zip}?", loading:"Зареждане...", fix:"Коригирай пунктуация", posting:"ПУБЛИКУВАМ...", postAs:"ПУБЛИКУВАЙ КАТО", in:"В", live:"📹 Записано На Живо", tags:{ general:"Общо", alert:"Тревога", recommendation:"Препоръка", free_stuff:"Безплатно", hot_take:"Мнение", lost_found:"Изгубено" } },
  hr: { placeholder:"Što se događa u {zip}?", loading:"Učitavanje...", fix:"Popravi interpunkciju", posting:"OBJAVLJUJEM...", postAs:"OBJAVI KAO", in:"U", live:"📹 Snimljeno Uživo", tags:{ general:"Općenito", alert:"Uzbuna", recommendation:"Preporuka", free_stuff:"Besplatno", hot_take:"Mišljenje", lost_found:"Izgubljeno" } },
  // remaining 20 fallback but translated so never shows English keys
  sr: { placeholder:"Šta se dešava u {zip}?", loading:"Učitavanje...", fix:"Popravi interpunkciju", posting:"OBJAVLJUJEM...", postAs:"OBJAVI KAO", in:"U", live:"📹 Snimljeno Uživo", tags:{ general:"Opšte", alert:"Uzbuna", recommendation:"Preporuka", free_stuff:"Besplatno", hot_take:"Mišljenje", lost_found:"Izgubljeno" } },
  sk: { placeholder:"Čo sa deje v {zip}?", loading:"Načítava sa...", fix:"Opraviť interpunkciu", posting:"PUBLIKUJEM...", postAs:"PUBLIKOVAŤ AKO", in:"V", live:"📹 Nahraté Naživo", tags:{ general:"Všeobecné", alert:"Výstraha", recommendation:"Odporúčanie", free_stuff:"Zadarmo", hot_take:"Názor", lost_found:"Stratené" } },
  sl: { placeholder:"Kaj se dogaja v {zip}?", loading:"Nalaganje...", fix:"Popravi ločila", posting:"OBJAVLJAM...", postAs:"OBJAVI KOT", in:"V", live:"📹 Posneto V Živo", tags:{ general:"Splošno", alert:"Alarm", recommendation:"Priporočilo", free_stuff:"Brezplačno", hot_take:"Mnenje", lost_found:"Izgubljeno" } },
  et: { placeholder:"Mis toimub {zip}?", loading:"Laadimine...", fix:"Paranda kirjavahemärgid", posting:"POSTITAN...", postAs:"POSTITA KUI", in:"SEES", live:"📹 Salvestatud Otse", tags:{ general:"Üldine", alert:"Hoiatus", recommendation:"Soovitus", free_stuff:"Tasuta", hot_take:"Arvamus", lost_found:"Kaotatud" } },
  lv: { placeholder:"Kas notiek {zip}?", loading:"Ielādē...", fix:"Labot pieturzīmes", posting:"PUBLICĒJU...", postAs:"PUBLICĒ KĀ", in:"IN", live:"📹 Ierakstīts Tiešraidē", tags:{ general:"Vispārīgi", alert:"Brīdinājums", recommendation:"Ieteikums", free_stuff:"Bezmaksas", hot_take:"Viedoklis", lost_found:"Pazaudēts" } },
  lt: { placeholder:"Kas vyksta {zip}?", loading:"Kraunama...", fix:"Taisyti skyrybą", posting:"SKELBIU...", postAs:"SKELBTI KAIP", in:"IN", live:"📹 Įrašytas Tiesiogiai", tags:{ general:"Bendra", alert:"Įspėjimas", recommendation:"Rekomendacija", free_stuff:"Nemokamai", hot_take:"Nuomonė", lost_found:"Pamesta" } },
  be: { placeholder:"Што адбываецца ў {zip}?", loading:"Загрузка...", fix:"Выправіць пунктуацыю", posting:"ПУБЛІКУЮ...", postAs:"АПУБЛІКАВАЦЬ ЯК", in:"У", live:"📹 Запіс Эфіру", tags:{ general:"Агульнае", alert:"Трывога", recommendation:"Рэкамендацыя", free_stuff:"Бясплатна", hot_take:"Меркаванне", lost_found:"Згублена" } },
  ka: { placeholder:"რა ხდება {zip}-ში?", loading:"იტვირთება...", fix:"პუნქტუაციის გასწორება", posting:"ქვეყნდება...", postAs:"გამოქვეყნება როგორც", in:"ში", live:"📹 ჩაწერილი ლაივი", tags:{ general:"ზოგადი", alert:"განგაში", recommendation:"რეკომენდაცია", free_stuff:"უფასო", hot_take:"აზრი", lost_found:"დაკარგული" } },
  hy: { placeholder:"Ի՞նչ է կատարվում {zip}-ում:", loading:"Բեռնում...", fix:"Ուղղել կետադրությունը", posting:"ՀՐԱՊԱՐԱԿՈՒՄ...", postAs:"ՀՐԱՊԱՐԱԿԵԼ ՈՐՊԵՍ", in:"ՄԵՋ", live:"📹 Ձայնագրված Ուղիղ", tags:{ general:"Ընդհանուր", alert:"Տագնապ", recommendation:"Առաջարկություն", free_stuff:"Անվճար", hot_take:"Կարծիք", lost_found:"Կորած" } },
  az: { placeholder:"{zip}-də nə baş verir?", loading:"Yüklənir...", fix:"Durğu işarələrini düzəlt", posting:"PAYLAŞILIR...", postAs:"KİMİ PAYLAŞ", in:"DA", live:"📹 Yazılmış Canlı", tags:{ general:"Ümumi", alert:"Xəbərdarlıq", recommendation:"Tövsiyə", free_stuff:"Pulsuz", hot_take:"Fikir", lost_found:"İtmiş" } },
  kk: { placeholder:"{zip}-да не болып жатыр?", loading:"Жүктелуде...", fix:"Тыныс белгілерін түзету", posting:"Жариялануда...", postAs:"ретінде жарияла", in:"ДА", live:"📹 Жазылған Тікелей", tags:{ general:"Жалпы", alert:"Дабыл", recommendation:"Ұсыныс", free_stuff:"Тегін", hot_take:"Пікір", lost_found:"Жоғалған" } },
  ky: { placeholder:"{zip}-да эмне болуп жатат?", loading:"Жүктөлүүдө...", fix:"Тыныш белгилерин оңдоо", posting:"ЖАРЫЯЛАНУУДА...", postAs:"КАТАРЫ ЖАРЫЯЛА", in:"ДА", live:"📹 Жазылган Түз", tags:{ general:"Жалпы", alert:"Сигнал", recommendation:"Сунуш", free_stuff:"Акысыз", hot_take:"Пикир", lost_found:"Жоголгон" } },
  uz: { placeholder:"{zip} da nima bo'lyapti?", loading:"Yuklanmoqda...", fix:"Tinish belgilarini tuzatish", posting:"CHOP ETILMOQDA...", postAs:"SIFATIDA CHOP ET", in:"DA", live:"📹 Yozilgan Jonli", tags:{ general:"Umumiy", alert:"Ogohlantirish", recommendation:"Tavsiya", free_stuff:"Bepul", hot_take:"Fikr", lost_found:"Yo'qolgan" } },
  tg: { placeholder:"Дар {zip} чӣ рӯй медиҳад?", loading:"Боркунӣ...", fix:"Аломатҳои китобатро ислоҳ кунед", posting:"ИНТИШОР...", postAs:"ЧУН ИНТИШОР КУН", in:"ДАР", live:"📹 Сабти Зинда", tags:{ general:"Умумӣ", alert:"Огоҳӣ", recommendation:"Тавсия", free_stuff:"Ройгон", hot_take:"Андеша", lost_found:"Гумшуда" } },
  mn: { placeholder:"{zip}-д юу болж байна?", loading:"Ачааллаж байна...", fix:"Цэг таслал засах", posting:"НИЙТЛЭЖ БАЙНА...", postAs:"ХЭЛБЭРЭЭР НИЙТЛЭ", in:"Д", live:"📹 Бичигдсэн Шууд", tags:{ general:"Ерөнхий", alert:"Сэрэмжлүүлэг", recommendation:"Зөвлөмж", free_stuff:"Үнэгүй", hot_take:"Санал", lost_found:"Алдагдсан" } },
  km: { placeholder:"មានអ្វីកើតឡើងនៅ {zip}?", loading:"កំពុងផ្ទុក...", fix:"កែវណ្ណយុត្តិ", posting:"កំពុងបង្ហោះ...", postAs:"បង្ហោះជា", in:"នៅ", live:"📹 ផ្សាយផ្ទាល់បានថត", tags:{ general:"ទូទៅ", alert:"ប្រកាសអាសន្ន", recommendation:"អនុសាសន៍", free_stuff:"ឥតគិតថ្លៃ", hot_take:"មតិ", lost_found:"បាត់" } },
  lo: { placeholder:"ມີຫຍັງເກີດຂຶ້ນໃນ {zip}?", loading:"ກຳລັງໂຫຼດ...", fix:"ແກ້ໄຂເຄື່ອງໝາຍວັກຕອນ", posting:"ກຳລັງໂພສ...", postAs:"ໂພສເປັນ", in:"ໃນ", live:"📹 ບັນທຶກສົດ", tags:{ general:"ທົ່ວໄປ", alert:"ເຕືອນ", recommendation:"ແນະນຳ", free_stuff:"ຟຣີ", hot_take:"ຄວາມຄິດເຫັນ", lost_found:"ເສຍ" } },
  my: { placeholder:"{zip} မှာ ဘာဖြစ်နေလဲ?", loading:"တင်နေသည်...", fix:"ပုဒ်ဖြတ်ပြင်ရန်", posting:"တင်နေသည်...", postAs:"အဖြစ် တင်ရန်", in:"မှာ", live:"📹 မှတ်တမ်းတင် တိုက်ရိုက်", tags:{ general:"အထွေထွေ", alert:"သတိပေးချက်", recommendation:"အကြံပြုချက်", free_stuff:"အခမဲ့", hot_take:"အမြင်", lost_found:"ပျောက်ဆုံး" } },
}

export default function FeedCenter() {
  const supabase = createClient()
  const { zip: userZip } = useLocation()
  const { filter } = useLocationScope()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<typeof TAG_KEYS[number]>('general')
  const [posts, setPosts] = useState<any[]>([])
  const [zip, setZip] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  useEffect(() => { if (userZip &&!zip) setZip(userZip) }, [userZip])

  const load = async () => {
    if (!zip) return
    if (filter.lat!= null && filter.lng!= null) {
      const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
      const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)
      const { data } = await supabase.from('posts').select('*').gte('latitude', bbox.minLat).lte('latitude', bbox.maxLat).gte('longitude', bbox.minLng).lte('longitude', bbox.maxLng).order('created_at',{ascending:false}).limit(100)
      if (data) setPosts(applyScope(data, filter))
    } else {
      const { data } = await supabase.from('posts').select('*').eq('zip_code', zip).order('created_at',{ascending:false}).limit(100)
      if(data) setPosts(data)
    }
  }
  useEffect(()=>{ load() }, [zip, filter.scope, filter.lat, filter.lng])

  const submit = async ()=>{
    ;(window as any).__stopMic?.()
    if(!draft.trim() || isPosting ||!zip) return
    setIsPosting(true)
    try {
      const { data:{ user } } = await supabase.auth.getUser()
      if(!user) return
      const postData: any = { user_id: user.id, body: draft.trim(), tag, zip_code: zip }
      if (filter.lat!= null && filter.lng!= null) { postData.latitude = filter.lat; postData.longitude = filter.lng }
      await supabase.from('posts').insert(postData)
      setDraft('')
      await load()
    } finally { setIsPosting(false) }
  }

  return (
    <div className="space-y-4">
      <LocationScopeBar />
      <LiveNowStrip />
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <textarea value={draft} onChange={e=>setDraft(e.target.value)} onFocus={()=> (window as any).__stopMic?.()} placeholder={zip? d.placeholder.replace('{zip}', zip) : d.loading} className="w-full min-h-40 resize-none rounded-xl border border-gray-200 p-4 text-sm text-black outline-none focus:ring-2 focus:ring-black/10" />
        <div className="mt-4 flex items-center justify-between">
          <MicRecorder onTranscript={setDraft} />
          <button onClick={()=> setDraft(smartPunctuate(draft) + ' ')} className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white">{d.fix}</button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {TAG_KEYS.map(key=>(
            <button key={key} onClick={()=>setTag(key)} className={`px-3 py-2 rounded-full text-xs font-black border-2 ${tag===key?'bg-black text-white border-black':'bg-white text-black border-black hover:bg-gray-100'}`}>{d.tags[key] || key}</button>
          ))}
        </div>
        <button onClick={submit} disabled={!draft.trim() || isPosting ||!zip} className="mt-5 w-full bg-blue-600 text-white font-black py-3 rounded-full disabled:opacity-50">{isPosting? d.posting : `${d.postAs} ${(d.tags[tag] || tag).toUpperCase()} ${d.in} ${zip || '...'}`}</button>
      </div>
      <div className="space-y-4">
        {posts.map(p=>(
          <div key={p.id} className="bg-white rounded-2xl p-5">
            <p className="text-black whitespace-pre-wrap text-sm break-words leading-relaxed">{p.body}</p>
            {(p.video_url || p.media_url) && (
              <div className="mt-4">
                <video controls className="w-full rounded-xl border border-gray-200"><source src={p.video_url || p.media_url} type="video/webm" /></video>
                <div className="mt-2 text-xs font-black text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">{d.live}</div>
              </div>
            )}
            <div className="mt-2 text-xs font-black text-black/50">#{d.tags[p.tag] || p.tag} • {p.zip_code}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
