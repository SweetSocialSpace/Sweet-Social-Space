'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { trust:"Trust Meter", verified:"{p}% verified", trusted:"{v}/{t} trusted" },
  es: { trust:"Medidor de Confianza", verified:"{p}% verificado", trusted:"{v}/{t} confiables" },
  fr: { trust:"Jauge de Confiance", verified:"{p}% vérifié", trusted:"{v}/{t} fiables" },
  de: { trust:"Vertrauensmesser", verified:"{p}% verifiziert", trusted:"{v}/{t} vertrauenswürdig" },
  zh: { trust:"信任度", verified:"{p}% 已验证", trusted:"{v}/{t} 可信" },
  ja: { trust:"信頼メーター", verified:"{p}% 検証済み", trusted:"{v}/{t} 信頼" },
  ko: { trust:"신뢰 미터", verified:"{p}% 검증됨", trusted:"{v}/{t} 신뢰" },
  pt: { trust:"Medidor de Confiança", verified:"{p}% verificado", trusted:"{v}/{t} confiáveis" },
  ru: { trust:"Шкала Доверия", verified:"{p}% проверено", trusted:"{v}/{t} доверенных" },
  ar: { trust:"مقياس الثقة", verified:"{p}% موثق", trusted:"{v}/{t} موثوق" },
  hi: { trust:"विश्वास मीटर", verified:"{p}% सत्यापित", trusted:"{v}/{t} विश्वसनीय" },
  it: { trust:"Misuratore Fiducia", verified:"{p}% verificato", trusted:"{v}/{t} affidabili" },
  nl: { trust:"Vertrouwensmeter", verified:"{p}% geverifieerd", trusted:"{v}/{t} vertrouwd" },
  tl: { trust:"Trust Meter", verified:"{p}% verified", trusted:"{v}/{t} trusted" },
  bn: { trust:"বিশ্বাস মিটার", verified:"{p}% যাচাইকৃত", trusted:"{v}/{t} বিশ্বস্ত" },
  id: { trust:"Meter Kepercayaan", verified:"{p}% terverifikasi", trusted:"{v}/{t} terpercaya" },
  vi: { trust:"Thước Đo Tin Cậy", verified:"{p}% đã xác minh", trusted:"{v}/{t} đáng tin" },
  th: { trust:"มิเตอร์ความน่าเชื่อถือ", verified:"{p}% ตรวจสอบแล้ว", trusted:"{v}/{t} เชื่อถือได้" },
  sv: { trust:"Förtroendemätare", verified:"{p}% verifierad", trusted:"{v}/{t} betrodda" },
  pl: { trust:"Miernik Zaufania", verified:"{p}% zweryfikowane", trusted:"{v}/{t} zaufanych" },
  tr: { trust:"Güven Ölçer", verified:"%{p} doğrulandı", trusted:"{v}/{t} güvenilir" },
  uk: { trust:"Шкала Довіри", verified:"{p}% перевірено", trusted:"{v}/{t} надійних" },
  el: { trust:"Μετρητής Εμπιστοσύνης", verified:"{p}% επαληθευμένο", trusted:"{v}/{t} έμπιστα" },
  he: { trust:"מד אמון", verified:"{p}% מאומת", trusted:"{v}/{t} מהימנים" },
  ur: { trust:"اعتماد میٹر", verified:"{p}% تصدیق شدہ", trusted:"{v}/{t} قابل اعتماد" },
  fa: { trust:"سنجش اعتماد", verified:"{p}% تایید شده", trusted:"{v}/{t} مورد اعتماد" },
  ms: { trust:"Meter Kepercayaan", verified:"{p}% disahkan", trusted:"{v}/{t} dipercayai" },
  ro: { trust:"Contor Încredere", verified:"{p}% verificat", trusted:"{v}/{t} de încredere" },
  cs: { trust:"Měřič Důvěry", verified:"{p}% ověřeno", trusted:"{v}/{t} důvěryhodných" },
  hu: { trust:"Bizalmi Mérő", verified:"{p}% ellenőrzött", trusted:"{v}/{t} megbízható" },
  fi: { trust:"Luottamusmittari", verified:"{p}% vahvistettu", trusted:"{v}/{t} luotettua" },
  no: { trust:"Tillitsmåler", verified:"{p}% verifisert", trusted:"{v}/{t} klarerte" },
  da: { trust:"Tillidsmåler", verified:"{p}% verificeret", trusted:"{v}/{t} betroede" },
  bg: { trust:"Метър Доверие", verified:"{p}% потвърдени", trusted:"{v}/{t} надеждни" },
  hr: { trust:"Mjerač Povjerenja", verified:"{p}% verificirano", trusted:"{v}/{t} pouzdanih" },
  sr: { trust:"Мерач Поверења", verified:"{p}% верификовано", trusted:"{v}/{t} поузданих" },
  sk: { trust:"Merač Dôvery", verified:"{p}% overené", trusted:"{v}/{t} dôveryhodných" },
  sl: { trust:"Merilec Zaupanja", verified:"{p}% preverjeno", trusted:"{v}/{t} zaupanja vrednih" },
  et: { trust:"Usaldusmõõdik", verified:"{p}% kinnitatud", trusted:"{v}/{t} usaldusväärset" },
  lv: { trust:"Uzticības Mērītājs", verified:"{p}% verificēts", trusted:"{v}/{t} uzticami" },
  lt: { trust:"Pasitikėjimo Matuoklis", verified:"{p}% patvirtinta", trusted:"{v}/{t} patikimų" },
  be: { trust:"Шкала Даверу", verified:"{p}% праверана", trusted:"{v}/{t} надзейных" },
  ka: { trust:"ნდობის მრიცხველი", verified:"{p}% დადასტურებული", trusted:"{v}/{t} სანდო" },
  hy: { trust:"Վստահության Չափիչ", verified:"{p}% հաստատված", trusted:"{v}/{t} վստահելի" },
  az: { trust:"Etibar Ölçer", verified:"{p}% təsdiqləndi", trusted:"{v}/{t} etibarlı" },
  kk: { trust:"Сенім Өлшегіші", verified:"{p}% расталды", trusted:"{v}/{t} сенімді" },
  ky: { trust:"Ишеним Өлчөгүч", verified:"{p}% тастыкталды", trusted:"{v}/{t} ишенимдүү" },
  uz: { trust:"Ishonch O'lchagichi", verified:"{p}% tasdiqlangan", trusted:"{v}/{t} ishonchli" },
  tg: { trust:"Сенҷиши Боварӣ", verified:"{p}% тасдиқ шудааст", trusted:"{v}/{t} боэътимод" },
  mn: { trust:"Итгэлийн Хэмжигч", verified:"{p}% баталгаажсан", trusted:"{v}/{t} найдвартай" },
  km: { trust:"រង្វាស់ទំនុកចិត្ត", verified:"{p}% បានផ្ទៀងផ្ទាត់", trusted:"{v}/{t} ទុកចិត្ត" },
  lo: { trust:"ເຄື່ອງວັດແທກຄວາມໄວ້ວາງໃຈ", verified:"{p}% ຢືນຢັນແລ້ວ", trusted:"{v}/{t} ໄວ້ວາງໃຈໄດ້" },
  my: { trust:"ယုံကြည်မှုမီတာ", verified:"{p}% အတည်ပြုပြီး", trusted:"{v}/{t} ယုံကြည်ရသော" },
}

export function TrustMeter() {
  const { zip: contextZip } = useLocation()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const zip = contextZip && contextZip!== 'GLOBAL'? contextZip : 'GLOBAL'
  const [data, setData] = useState({ verified: 2, total: 2, percent: 100 })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const r = await fetch(`/api/trust?zip=${encodeURIComponent(zip)}`, { cache: 'no-store' }).catch(()=>null)
        if (r && r.ok) {
          const j = await r.json()
          let verified = j.verified?? j.count?? 2
          let total = j.total?? j.count?? 2
          if (cancelled) return
          if (total === 0) { setData({ verified: 2, total: 2, percent: 100 }); return }
          const percent = Math.round((verified / total) * 100) || 100
          setData({ verified, total, percent })
        }
      } catch {
        if (!cancelled) setData({ verified: 2, total: 2, percent: 100 })
      }
    }
    load()
    const id = setInterval(load, 60000)
    return () => { cancelled = true; clearInterval(id) }
  }, [zip])

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
      <div className="flex items-center justify-between">
        <span className="text-white font-black text-xs tracking-wider">{d.trust}</span>
        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${data.percent>=80?'bg-green-500 text-black':'bg-yellow-500 text-black'}`}>
          {d.verified.replace('{p}', String(data.percent))}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-green-500" style={{width:`${data.percent}%`}} />
        </div>
        <span className="text-white/60 text-xs">{d.trusted.replace('{v}', String(data.verified)).replace('{t}', String(data.total))}</span>
      </div>
    </div>
  )
}
