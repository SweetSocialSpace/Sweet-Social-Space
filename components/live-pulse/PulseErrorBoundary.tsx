'use client';
import React from 'react';

// 53 languages self-contained inside its own file — for fallback if you ever show error instead of silent null
const D: Record<string, string> = {
  en: "Pulse temporarily unavailable",
  es: "Pulso temporalmente no disponible",
  fr: "Pouls temporairement indisponible",
  de: "Puls vorübergehend nicht verfügbar",
  zh: "脉冲暂时不可用",
  ja: "パルスは一時的に利用不可",
  ko: "펄스를 일시적으로 사용할 수 없습니다",
  pt: "Pulso temporariamente indisponível",
  ru: "Пульс временно недоступен",
  ar: "النبض غير متاح مؤقتا",
  hi: "पल्स अस्थायी रूप से अनुपलब्ध",
  it: "Polso temporaneamente non disponibile",
  nl: "Puls tijdelijk niet beschikbaar",
  tl: "Pansamantalang hindi available ang Pulse",
  bn: "পালস সাময়িকভাবে অনুপলব্ধ",
  id: "Pulse sementara tidak tersedia",
  vi: "Pulse tạm thời không khả dụng",
  th: "Pulse ไม่พร้อมใช้งานชั่วคราว",
  sv: "Puls tillfälligt otillgänglig",
  pl: "Puls tymczasowo niedostępny",
  tr: "Nabız geçici olarak kullanılamıyor",
  uk: "Пульс тимчасово недоступний",
  el: "Ο παλμός προσωρινά μη διαθέσιμος",
  he: "דופק לא זמין זמנית",
  ur: "پلس عارضی طور پر دستیاب نہیں",
  fa: "پالس موقتا در دسترس نیست",
  ms: "Pulse sementara tidak tersedia",
  ro: "Puls temporar indisponibil",
  cs: "Puls dočasně nedostupný",
  hu: "Pulzus átmenetileg nem elérhető",
  fi: "Pulssi väliaikaisesti ei saatavilla",
  no: "Puls midlertidig utilgjengelig",
  da: "Puls midlertidigt utilgængelig",
  bg: "Пулсът временно недостъпен",
  hr: "Puls privremeno nedostupan",
  sr: "Пулс привремено недоступан",
  sk: "Pulz dočasne nedostupný",
  sl: "Pulz začasno nedosegljiv",
  et: "Pulss ajutiselt kättesaamatu",
  lv: "Pulss īslaicīgi nav pieejams",
  lt: "Pulsas laikinai nepasiekiamas",
  be: "Пульс часова недаступны",
  ka: "პულსი დროებით მიუწვდომელია",
  hy: "Զարկը ժամանակավորապես անհասանելի է",
  az: "Nəbz müvəqqəti əlçatan deyil",
  kk: "Пульс уақытша қолжетімсіз",
  ky: "Пульс убактылуу жеткиликсиз",
  uz: "Puls vaqtincha mavjud emas",
  tg: "Набз муваққатан дастнорас",
  mn: "Пульс түр хугацаанд боломжгүй",
  km: "Pulse មិនអាចប្រើបានបណ្តោះអាសន្ន",
  lo: "Pulse ບໍ່ສາມາດໃຊ້ໄດ້ຊົ່ວຄາວ",
  my: "Pulse ယာယီမရနိုင်ပါ",
}

type Props = {
  children: React.ReactNode
  showFallback?: boolean // set true if you want to show translated message instead of silent null
  language?: string
}

type State = { hasError: boolean }

export class PulseErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    try {
      console.log('Pulse nerve error, isolated:', error, info?.componentStack);
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      if (this.props.showFallback) {
        const lang = this.props.language || (typeof navigator!== 'undefined'? navigator.language.split('-')[0] : 'en')
        const msg = D[lang] || D.en
        return (
          <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-3 text-white/40 text-xs">
            {msg}
          </div>
        )
      }
      // Silent isolate — keeps feed alive if LivePulse crashes
      return null
    }
    return this.props.children;
  }
}

export default PulseErrorBoundary
