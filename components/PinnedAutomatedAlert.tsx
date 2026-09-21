'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { weatherAlert:"Weather Alert", heat:"Heat Advisory", highHeat:"High heat", in:"in", hydrated:"stay hydrated", pinned:"📌 Pinned Alert", live:"LIVE", noEmerg:"No emergencies in", yourArea:"your area" },
  es: { weatherAlert:"Alerta Meteorológica", heat:"Aviso de Calor", highHeat:"Calor alto", in:"en", hydrated:"mantente hidratado", pinned:"📌 Alerta Fijada", live:"EN VIVO", noEmerg:"Sin emergencias en", yourArea:"tu área" },
  fr: { weatherAlert:"Alerte Météo", heat:"Avis Chaleur", highHeat:"Forte chaleur", in:"à", hydrated:"restez hydraté", pinned:"📌 Alerte Épinglée", live:"DIRECT", noEmerg:"Pas d'urgences à", yourArea:"votre zone" },
  de: { weatherAlert:"Wetterwarnung", heat:"Hitzewarnung", highHeat:"Hohe Hitze", in:"in", hydrated:"bleib hydriert", pinned:"📌 Angehefteter Alarm", live:"LIVE", noEmerg:"Keine Notfälle in", yourArea:"deinem Bereich" },
  zh: { weatherAlert:"天气警报", heat:"高温咨询", highHeat:"高温", in:"在", hydrated:"保持水分", pinned:"📌 置顶警报", live:"实时", noEmerg:"无紧急情况", yourArea:"你的地区" },
  ja: { weatherAlert:"気象警報", heat:"高温注意報", highHeat:"高温", in:"で", hydrated:"水分補給を", pinned:"📌 固定されたアラート", live:"ライブ", noEmerg:"緊急事態なし", yourArea:"あなたのエリア" },
  ko: { weatherAlert:"기상 경보", heat:"폭염 주의보", highHeat:"고온", in:"에서", hydrated:"수분 섭취 유지", pinned:"📌 고정된 알림", live:"라이브", noEmerg:"긴급 상황 없음", yourArea:"내 지역" },
  pt: { weatherAlert:"Alerta Meteorológico", heat:"Aviso de Calor", highHeat:"Calor alto", in:"em", hydrated:"mantenha-se hidratado", pinned:"📌 Alerta Fixado", live:"AO VIVO", noEmerg:"Sem emergências em", yourArea:"sua área" },
  ru: { weatherAlert:"Погодная Тревога", heat:"Предупр. о Жаре", highHeat:"Сильная жара", in:"в", hydrated:"пейте воду", pinned:"📌 Закрепл. Тревога", live:"ЭФИР", noEmerg:"Нет ЧС в", yourArea:"вашем районе" },
  ar: { weatherAlert:"تنبيه طقس", heat:"تحذير حرارة", highHeat:"حرارة عالية", in:"في", hydrated:"حافظ على الترطيب", pinned:"📌 تنبيه مثبت", live:"مباشر", noEmerg:"لا طوارئ في", yourArea:"منطقتك" },
  hi: { weatherAlert:"मौसम चेतावनी", heat:"गर्मी सलाह", highHeat:"तेज़ गर्मी", in:"में", hydrated:"हाइड्रेटेड रहें", pinned:"📌 पिन अलर्ट", live:"लाइव", noEmerg:"कोई आपात नहीं", yourArea:"आपके क्षेत्र में" },
  it: { weatherAlert:"Allerta Meteo", heat:"Avviso Caldo", highHeat:"Caldo intenso", in:"a", hydrated:"resta idratato", pinned:"📌 Avviso Fissato", live:"LIVE", noEmerg:"Nessuna emergenza a", yourArea:"tua zona" },
  nl: { weatherAlert:"Weeralarm", heat:"Hitteadvies", highHeat:"Hoge hitte", in:"in", hydrated:"blijf gehydrateerd", pinned:"📌 Vastgepinde Melding", live:"LIVE", noEmerg:"Geen noodgevallen in", yourArea:"jouw gebied" },
  tl: { weatherAlert:"Babala ng Panahon", heat:"Babala ng Init", highHeat:"Mataas na init", in:"sa", hydrated:"manatiling hydrated", pinned:"📌 Naka-pin na Alerto", live:"LIVE", noEmerg:"Walang emergency sa", yourArea:"iyong lugar" },
  bn: { weatherAlert:"আবহাওয়া সতর্কতা", heat:"তাপ পরামর্শ", highHeat:"উচ্চ তাপ", in:"তে", hydrated:"হাইড্রেটেড থাকুন", pinned:"📌 পিন করা সতর্কতা", live:"লাইভ", noEmerg:"কোনো জরুরি নেই", yourArea:"আপনার এলাকায়" },
  id: { weatherAlert:"Peringatan Cuaca", heat:"Peringatan Panas", highHeat:"Panas tinggi", in:"di", hydrated:"tetap terhidrasi", pinned:"📌 Peringatan Disematkan", live:"LIVE", noEmerg:"Tidak ada darurat di", yourArea:"area Anda" },
  vi: { weatherAlert:"Cảnh Báo Thời Tiết", heat:"Cảnh Báo Nắng Nóng", highHeat:"Nhiệt độ cao", in:"tại", hydrated:"giữ đủ nước", pinned:"📌 Cảnh Báo Ghim", live:"TRỰC TIẾP", noEmerg:"Không có khẩn cấp tại", yourArea:"khu vực bạn" },
  th: { weatherAlert:"แจ้งเตือนอากาศ", heat:"คำแนะนำความร้อน", highHeat:"ความร้อนสูง", in:"ใน", hydrated:"ดื่มน้ำให้เพียงพอ", pinned:"📌 แจ้งเตือนปักหมุด", live:"ไลฟ์", noEmerg:"ไม่มีเหตุฉุกเฉินใน", yourArea:"พื้นที่ของคุณ" },
  sv: { weatherAlert:"Vädervarning", heat:"Värmeråd", highHeat:"Hög värme", in:"i", hydrated:"håll dig hydrerad", pinned:"📌 Fäst Larm", live:"LIVE", noEmerg:"Inga nödlägen i", yourArea:"ditt område" },
  pl: { weatherAlert:"Alert Pogodowy", heat:"Ostrzeżenie o Upałach", highHeat:"Wysoka temperatura", in:"w", hydrated:"nawadniaj się", pinned:"📌 Przypięty Alert", live:"LIVE", noEmerg:"Brak zagrożeń w", yourArea:"twojej okolicy" },
  tr: { weatherAlert:"Hava Durumu Uyarısı", heat:"Sıcaklık Uyarısı", highHeat:"Yüksek sıcaklık", in:"içinde", hydrated:"susuz kalma", pinned:"📌 Sabitlenmiş Uyarı", live:"CANLI", noEmerg:"Acil durum yok", yourArea:"bölgenizde" },
  uk: { weatherAlert:"Погодна Тривога", heat:"Попередження про Спеку", highHeat:"Сильна спека", in:"в", hydrated:"пийте воду", pinned:"📌 Закріплена Тривога", live:"ЕФІР", noEmerg:"Немає НС в", yourArea:"вашому районі" },
  el: { weatherAlert:"Προειδοποίηση Καιρού", heat:"Συμβουλή Καύσωνα", highHeat:"Υψηλή ζέστη", in:"σε", hydrated:"μείνετε ενυδατωμένοι", pinned:"📌 Καρφιτσωμένη Ειδοποίηση", live:"ΖΩΝΤΑΝΑ", noEmerg:"Καμία έκτακτη ανάγκη σε", yourArea:"περιοχή σας" },
  he: { weatherAlert:"התראת מזג אוויר", heat:"אזהרת חום", highHeat:"חום גבוה", in:"ב", hydrated:"הישארו רוויים", pinned:"📌 התראה נעוצה", live:"חי", noEmerg:"אין חירום ב", yourArea:"אזור שלך" },
  ur: { weatherAlert:"موسم انتباہ", heat:"گرمی مشورہ", highHeat:"شدید گرمی", in:"میں", hydrated:"ہائیڈریٹ رہیں", pinned:"📌 پن الرٹ", live:"لائیو", noEmerg:"کوئی ایمرجنسی نہیں", yourArea:"آپ کے علاقے میں" },
  fa: { weatherAlert:"هشدار آب و هوا", heat:"هشدار گرما", highHeat:"گرمای زیاد", in:"در", hydrated:"هیدراته بمانید", pinned:"📌 هشدار سنجاق شده", live:"زنده", noEmerg:"هیچ اضطراری در", yourArea:"منطقه شما" },
  ms: { weatherAlert:"Amaran Cuaca", heat:"Nasihat Panas", highHeat:"Panas tinggi", in:"di", hydrated:"kekal terhidrat", pinned:"📌 Amaran Disemat", live:"LIVE", noEmerg:"Tiada kecemasan di", yourArea:"kawasan anda" },
  ro: { weatherAlert:"Alertă Meteo", heat:"Avertizare Caniculă", highHeat:"Căldură mare", in:"în", hydrated:"hidratați-vă", pinned:"📌 Alertă Fixată", live:"LIVE", noEmerg:"Nicio urgență în", yourArea:"zona ta" },
  cs: { weatherAlert:"Výstraha Počasí", heat:"Varování před Horkem", highHeat:"Vysoké horko", in:"v", hydrated:"zůstaňte hydratovaní", pinned:"📌 Připnuté Upozornění", live:"ŽIVĚ", noEmerg:"Žádné nouze v", yourArea:"vaší oblasti" },
  hu: { weatherAlert:"Időjárási Riasztás", heat:"Hőség Figyelmeztetés", highHeat:"Magas hőség", in:"itt:", hydrated:"maradj hidratált", pinned:"📌 Kitűzött Riasztás", live:"ÉLŐ", noEmerg:"Nincs vészhelyzet", yourArea:"területeden" },
  fi: { weatherAlert:"Säävaroitus", heat:"Hellev varoitus", highHeat:"Kova helle", in:"alueella", hydrated:"pysy nesteytettynä", pinned:"📌 Kiinnitetty Hälytys", live:"LIVE", noEmerg:"Ei hätätilaa", yourArea:"alueellasi" },
  no: { weatherAlert:"Værvarsel", heat:"Hetevarsel", highHeat:"Høy varme", in:"i", hydrated:"hold deg hydrert", pinned:"📌 Festet Varsel", live:"LIVE", noEmerg:"Ingen nødsituasjoner i", yourArea:"ditt område" },
  da: { weatherAlert:"Vejradvarsel", heat:"Hedebølgeadvarsel", highHeat:"Høj varme", in:"i", hydrated:"forbliv hydreret", pinned:"📌 Fastgjort Alarm", live:"LIVE", noEmerg:"Ingen nødsituationer i", yourArea:"dit område" },
  bg: { weatherAlert:"Метео Тревога", heat:"Предупреждение за Жега", highHeat:"Висока жега", in:"в", hydrated:"хидратирайте се", pinned:"📌 Закачена Тревога", live:"НА ЖИВО", noEmerg:"Няма спешни случаи в", yourArea:"вашия район" },
  hr: { weatherAlert:"Vremensko Upozorenje", heat:"Upozorenje na Vrućinu", highHeat:"Visoka vrućina", in:"u", hydrated:"ostani hidriran", pinned:"📌 Prikvačeno Upozorenje", live:"UŽIVO", noEmerg:"Nema hitnih slučajeva u", yourArea:"vašem području" },
  sr: { weatherAlert:"Временско Упозорење", heat:"Упозорење на Врућину", highHeat:"Висока врућина", in:"у", hydrated:"остани хидриран", pinned:"📌 Закачено Упозорење", live:"УЖИВО", noEmerg:"Нема хитних случајева у", yourArea:"вашем подручју" },
  sk: { weatherAlert:"Výstraha Počasia", heat:"Varovanie pred Horúčavou", highHeat:"Vysoká horúčava", in:"v", hydrated:"zostaňte hydratovaní", pinned:"📌 Pripnuté Upozornenie", live:"NAŽIVO", noEmerg:"Žiadne núdze v", yourArea:"vašej oblasti" },
  sl: { weatherAlert:"Vremensko Opozorilo", heat:"Opozorilo pred Vročino", highHeat:"Visoka vročina", in:"v", hydrated:"ostani hidriran", pinned:"📌 Pripeto Opozorilo", live:"V ŽIVO", noEmerg:"Ni nujnih primerov v", yourArea:"vašem območju" },
  et: { weatherAlert:"Ilmahoiatus", heat:"Kuumahoiatus", highHeat:"Kõrge kuumus", in:"piirkonnas", hydrated:"püsi hüdreeritud", pinned:"📌 Kinnitatud Hoiatus", live:"OTSE", noEmerg:"Hädaolukordi pole", yourArea:"sinu piirkonnas" },
  lv: { weatherAlert:"Laika Brīdinājums", heat:"Karstuma Brīdinājums", highHeat:"Augsts karstums", in:"", hydrated:"uzturiet hidratāciju", pinned:"📌 Piesprausts Brīdinājums", live:"TIEŠRAIDE", noEmerg:"Nav ārkārtas situāciju", yourArea:"jūsu rajonā" },
  lt: { weatherAlert:"Oro Įspėjimas", heat:"Karščio Įspėjimas", highHeat:"Didelis karštis", in:"", hydrated:"būkite hidratuoti", pinned:"📌 Prisegtas Įspėjimas", live:"TIESIOGIAI", noEmerg:"Nėra ekstremalių situacijų", yourArea:"jūsų rajone" },
  be: { weatherAlert:"Папярэджанне Надвор'я", heat:"Папярэджанне Спёкі", highHeat:"Высокая спёка", in:"ў", hydrated:"заставайцеся гідратаванымі", pinned:"📌 Замацаваная Трывога", live:"ЭФІР", noEmerg:"Няма НС у", yourArea:"вашым раёне" },
  ka: { weatherAlert:"ამინდის გაფრთხილება", heat:"სიცხის გაფრთხილება", highHeat:"მაღალი სიცხე", in:"ში", hydrated:"იყავით დატენიანებული", pinned:"📌 ჩამაგრებული გაფრთხილება", live:"ლაივი", noEmerg:"საგანგებო მდგომარეობა არ არის", yourArea:"თქვენს არეში" },
  hy: { weatherAlert:"Եղանակի Նախազգուշացում", heat:"Շոգի Նախազգուշացում", highHeat:"Բարձր շոգ", in:"ում", hydrated:"մնացեք հիդրատացված", pinned:"📌 Ամրացված Զգուշացում", live:"ՈՒՂԻՂ", noEmerg:"Արտակարգ իրավիճակ չկա", yourArea:"ձեր տարածքում" },
  az: { weatherAlert:"Hava Xəbərdarlığı", heat:"İsti Xəbərdarlığı", highHeat:"Yüksək istilik", in:"", hydrated:"nəmli qalın", pinned:"📌 Sabitlənmiş Xəbərdarlıq", live:"CANLI", noEmerg:"Fövqəladə hal yoxdur", yourArea:"ərazinizdə" },
  kk: { weatherAlert:"Ауа Райы Ескертуі", heat:"Ыстық Ескертуі", highHeat:"Жоғары ыстық", in:"", hydrated:"су ішіп тұрыңыз", pinned:"📌 Бекітілген Ескерту", live:"ТІКЕЛЕЙ", noEmerg:"Төтенше жағдай жоқ", yourArea:"аймағыңызда" },
  ky: { weatherAlert:"Аба Ырайы Эскертүүсү", heat:"Ысык Эскертүүсү", highHeat:"Жогорку ысык", in:"", hydrated:"суу ичиңиз", pinned:"📌 Бекитилген Эскертүү", live:"ТҮЗ", noEmerg:"Өзгөчө кырдаал жок", yourArea:"аймагыңызда" },
  uz: { weatherAlert:"Ob-havo Ogohlantirishi", heat:"Issiqlik Ogohlantirishi", highHeat:"Yuqori issiqlik", in:"", hydrated:"suv iching", pinned:"📌 Mahkamlangan Ogohlantirish", live:"JONLI", noEmerg:"Favqulodda holat yo'q", yourArea:"hududingizda" },
  tg: { weatherAlert:"Огоҳии обуҳаво", heat:"Огоҳии гармӣ", highHeat:"Гармии баланд", in:"дар", hydrated:"об бинӯшед", pinned:"📌 Огоҳии маҳкамшуда", live:"ЗИНДА", noEmerg:"Ҳолати фавқулодда нест", yourArea:"минтақаи шумо" },
  mn: { weatherAlert:"Цаг Агаарын Сэрэмжлүүлэг", heat:"Халуун Сэрэмжлүүлэг", highHeat:"Өндөр халуун", in:"д", hydrated:"ус уух", pinned:"📌 Бэхлэгдсэн Сэрэмжлүүлэг", live:"ШУУД", noEmerg:"Онцгой байдал байхгүй", yourArea:"таны бүсэд" },
  km: { weatherAlert:"ការព្រមានអាកាសធាតុ", heat:"ការព្រមានកំដៅ", highHeat:"កំដៅខ្ពស់", in:"នៅ", hydrated:"រក្សាជាតិទឹក", pinned:"📌 ការព្រមានបានខ្ទាស់", live:"ផ្ទាល់", noEmerg:"គ្មានអាសន្ននៅ", yourArea:"តំបន់របស់អ្នក" },
  lo: { weatherAlert:"ເຕືອນໄພສະພາບອາກາດ", heat:"ເຕືອນໄພຄວາມຮ້ອນ", highHeat:"ຄວາມຮ້ອນສູງ", in:"ໃນ", hydrated:"ຮັກສາຄວາມຊຸ່ມຊື່ນ", pinned:"📌 ການເຕືອນທີ່ປັກໝຸດໄວ້", live:"ສົດ", noEmerg:"ບໍ່ມີເຫດສຸກເສີນໃນ", yourArea:"ເຂດຂອງທ່ານ" },
  my: { weatherAlert:"ရာသီဥတုသတိပေးချက်", heat:"အပူရှိန်သတိပေးချက်", highHeat:"အပူချိန်မြင့်", in:"တွင်", hydrated:"ရေဓာတ်ပြည့်ဝနေပါစေ", pinned:"📌 ချိတ်ထားသောသတိပေးချက်", live:"တိုက်ရိုက်", noEmerg:"အရေးပေါ်မရှိပါ", yourArea:"သင့်ဧရိယာတွင်" },
}

type AlertRow = { title: string; body: string } | null

export function PinnedAutomatedAlert() {
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [alert, setAlert] = useState<AlertRow>(null)

  useEffect(() => {
    if (!zip || zip=== 'GLOBAL') {
      setAlert(null)
      return
    }
    let mounted = true
    const loadRealWorld = async () => {
      try {
        const r = await fetch(`/api/weather?zip=${encodeURIComponent(zip)}`, { cache: 'no-store' })
        if (!r.ok) { if (mounted) setAlert(null); return }
        const data = await r.json()
        const nwsAlerts = data.alerts || data?.weather?.alerts || []
        if (nwsAlerts && nwsAlerts[0]) {
          if (mounted) setAlert({
            title: nwsAlerts[0].event || d.weatherAlert,
            body: nwsAlerts[0].description || nwsAlerts[0].event
          })
          return
        }
        let temp = data?.temp?? data?.main?.temp?? null
        if (temp && temp > 150) { try { temp = (temp - 273.15) * 9/5 + 32 } catch {} }
        if (temp && temp >= 90) {
          if (mounted) setAlert({
            title: d.heat,
            body: `${d.highHeat} ${Math.round(temp)}°F ${d.in} ${city || zip} - ${d.hydrated}`
          })
          return
        }
        if (mounted) setAlert(null)
      } catch {
        if (mounted) setAlert(null)
      }
    }
    loadRealWorld()
    const id = setInterval(loadRealWorld, 60000)
    return () => { mounted = false; clearInterval(id) }
  }, [zip, city, d])

  const displayArea = zip && zip!== 'GLOBAL'? zip : d.yourArea

  if (!alert) {
    return (
      <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
        <div className="flex items-center gap-2 text-white font-black text-sm">{d.pinned} <span className="ml-auto text- bg-green-500 text-black px-2 py-0.5 rounded-full">{d.live}</span></div>
        <div className="text-white/80 text-sm mt-2">{d.noEmerg} {displayArea}</div>
      </div>
    )
  }
  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="flex items-center gap-2 text-white font-black text-sm">{d.pinned} <span className="ml-auto text- bg-orange-500 text-black px-2 py-0.5 rounded-full">{d.live}</span></div>
      <div className="text-orange-300 font-bold text-sm mt-2">{alert.title}</div>
      <div className="text-white/70 text-xs mt-1">{alert.body}</div>
    </div>
  )
}
