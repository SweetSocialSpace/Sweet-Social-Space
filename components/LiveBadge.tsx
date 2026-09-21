'use client'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { yourArea:"YOUR AREA", live:"LIVE" },
  es: { yourArea:"TU ÁREA", live:"EN VIVO" },
  fr: { yourArea:"VOTRE ZONE", live:"DIRECT" },
  de: { yourArea:"DEIN BEREICH", live:"LIVE" },
  zh: { yourArea:"你的地区", live:"直播" },
  ja: { yourArea:"あなたのエリア", live:"ライブ" },
  ko: { yourArea:"내 지역", live:"라이브" },
  pt: { yourArea:"SUA ÁREA", live:"AO VIVO" },
  ru: { yourArea:"ВАШ РАЙОН", live:"ЭФИР" },
  ar: { yourArea:"منطقتك", live:"مباشر" },
  hi: { yourArea:"आपका क्षेत्र", live:"लाइव" },
  it: { yourArea:"TUA ZONA", live:"LIVE" },
  nl: { yourArea:"JOUW GEBIED", live:"LIVE" },
  tl: { yourArea:"IYONG LUGAR", live:"LIVE" },
  bn: { yourArea:"আপনার এলাকা", live:"লাইভ" },
  id: { yourArea:"AREA ANDA", live:"LIVE" },
  vi: { yourArea:"KHU VỰC BẠN", live:"TRỰC TIẾP" },
  th: { yourArea:"พื้นที่ของคุณ", live:"ไลฟ์" },
  sv: { yourArea:"DITT OMRÅDE", live:"LIVE" },
  pl: { yourArea:"TWOJA OKOLICA", live:"NA ŻYWO" },
  tr: { yourArea:"BÖLGENİZ", live:"CANLI" },
  uk: { yourArea:"ВАШ РАЙОН", live:"ЕФІР" },
  el: { yourArea:"Η ΠΕΡΙΟΧΗ ΣΟΥ", live:"ΖΩΝΤΑΝΑ" },
  he: { yourArea:"האזור שלך", live:"חי" },
  ur: { yourArea:"آپ کا علاقہ", live:"لائیو" },
  fa: { yourArea:"منطقه شما", live:"زنده" },
  ms: { yourArea:"KAWASAN ANDA", live:"LIVE" },
  ro: { yourArea:"ZONA TA", live:"LIVE" },
  cs: { yourArea:"VAŠE OBLAST", live:"ŽIVĚ" },
  hu: { yourArea:"TERÜLETED", live:"ÉLŐ" },
  fi: { yourArea:"ALUEESI", live:"LIVE" },
  no: { yourArea:"DITT OMRÅDE", live:"LIVE" },
  da: { yourArea:"DIT OMRÅDE", live:"LIVE" },
  bg: { yourArea:"ВАШИЯТ РАЙОН", live:"НА ЖИВО" },
  hr: { yourArea:"VAŠE PODRUČJE", live:"UŽIVO" },
  sr: { yourArea:"ВАШЕ ПОДРУЧЈЕ", live:"УЖИВО" },
  sk: { yourArea:"VAŠA OBLASŤ", live:"NAŽIVO" },
  sl: { yourArea:"VAŠE OBMOČJE", live:"V ŽIVO" },
  et: { yourArea:"SINDA PIIRKOND", live:"OTSE" },
  lv: { yourArea:"JŪSU RAJONS", live:"TIEŠRAIDE" },
  lt: { yourArea:"JŪSŲ RAJONAS", live:"TIESIOGIAI" },
  be: { yourArea:"ВАШ РАЁН", live:"ЭФІР" },
  ka: { yourArea:"თქვენი არე", live:"ლაივი" },
  hy: { yourArea:"ՁԵՐ ՏԱՐԱԾՔԸ", live:"ՈՒՂԻՂ" },
  az: { yourArea:"SİZİN ƏRAZİ", live:"CANLI" },
  kk: { yourArea:"СІЗДІҢ АЙМАҚ", live:"ТІКЕЛЕЙ" },
  ky: { yourArea:"СИЗДИН АЙМАК", live:"ТҮЗ" },
  uz: { yourArea:"SIZNING HUDUD", live:"JONLI" },
  tg: { yourArea:"МИНТАҚАИ ШУМО", live:"ЗИНДА" },
  mn: { yourArea:"ТАНЫ БҮС", live:"ШУУД" },
  km: { yourArea:"តំបន់របស់អ្នក", live:"ផ្ទាល់" },
  lo: { yourArea:"ເຂດຂອງທ່ານ", live:"ສົດ" },
  my: { yourArea:"သင့်ဧရိယာ", live:"တိုက်ရိုက်" },
}

export default function LiveBadge(){
  const { zip } = useLocation()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const label = zip && zip!== 'LOCAL'? zip : d.yourArea
  return <div className="text-white/60 text-xs font-black">{label} • {d.live}</div>
}
