'use client'
import { useRef, useState } from 'react'
import { useLanguage } from '@/lib/language-context'

type Props = {
  onTranscript: (text: string) => void
  onFinalTranscript?: (text: string) => void
}

const D: Record<string, any> = {
  en: { stop:"Tap to stop", speak:"Tap to speak", blocked:"Mic blocked - check permissions" },
  es: { stop:"Toca para detener", speak:"Toca para hablar", blocked:"Mic bloqueado - verifica permisos" },
  fr: { stop:"Appuyez pour arrêter", speak:"Appuyez pour parler", blocked:"Micro bloqué - vérifiez permissions" },
  de: { stop:"Zum Stoppen tippen", speak:"Zum Sprechen tippen", blocked:"Mikro blockiert - Berechtigungen prüfen" },
  zh: { stop:"点击停止", speak:"点击说话", blocked:"麦克风被阻止 - 检查权限" },
  ja: { stop:"タップして停止", speak:"タップして話す", blocked:"マイクがブロックされています - 権限を確認" },
  ko: { stop:"탭하여 중지", speak:"탭하여 말하기", blocked:"마이크 차단됨 - 권한 확인" },
  pt: { stop:"Toque para parar", speak:"Toque para falar", blocked:"Micro bloqueado - verifique permissões" },
  ru: { stop:"Нажмите чтобы остановить", speak:"Нажмите чтобы говорить", blocked:"Микрофон заблокирован - проверьте разрешения" },
  ar: { stop:"اضغط للإيقاف", speak:"اضغط للتحدث", blocked:"الميكروفون محظور - تحقق من الأذونات" },
  hi: { stop:"रोकने के लिए टैप करें", speak:"बोलने के लिए टैप करें", blocked:"माइक ब्लॉक है - अनुमतियाँ जाँचें" },
  it: { stop:"Tocca per fermare", speak:"Tocca per parlare", blocked:"Micro bloccato - controlla permessi" },
  nl: { stop:"Tik om te stoppen", speak:"Tik om te spreken", blocked:"Micro geblokkeerd - controleer machtigingen" },
  tl: { stop:"I-tap para huminto", speak:"I-tap para magsalita", blocked:"Mic naka-block - check permissions" },
  bn: { stop:"থামাতে ট্যাপ করুন", speak:"কথা বলতে ট্যাপ করুন", blocked:"মাইক ব্লক - অনুমতি পরীক্ষা করুন" },
  id: { stop:"Ketuk untuk berhenti", speak:"Ketuk untuk bicara", blocked:"Mic diblokir - periksa izin" },
  vi: { stop:"Nhấn để dừng", speak:"Nhấn để nói", blocked:"Mic bị chặn - kiểm tra quyền" },
  th: { stop:"แตะเพื่อหยุด", speak:"แตะเพื่อพูด", blocked:"ไมค์ถูกบล็อก - ตรวจสอบสิทธิ์" },
  sv: { stop:"Tryck för att stoppa", speak:"Tryck för att tala", blocked:"Mikrofon blockerad - kontrollera behörigheter" },
  pl: { stop:"Dotknij aby zatrzymać", speak:"Dotknij aby mówić", blocked:"Mikrofon zablokowany - sprawdź uprawnienia" },
  tr: { stop:"Durdurmak için dokun", speak:"Konuşmak için dokun", blocked:"Mikro engellendi - izinleri kontrol et" },
  uk: { stop:"Натисніть щоб зупинити", speak:"Натисніть щоб говорити", blocked:"Мікрофон заблоковано - перевірте дозволи" },
  el: { stop:"Πατήστε για διακοπή", speak:"Πατήστε για ομιλία", blocked:"Μικρόφωνο μπλοκαρισμένο - ελέγξτε δικαιώματα" },
  he: { stop:"הקש כדי לעצור", speak:"הקש כדי לדבר", blocked:"מיקרופון חסום - בדוק הרשאות" },
  ur: { stop:"روکنے کے لیے ٹیپ کریں", speak:"بولنے کے لیے ٹیپ کریں", blocked:"مائک بلاک - اجازتیں چیک کریں" },
  fa: { stop:"برای توقف ضربه بزنید", speak:"برای صحبت ضربه بزنید", blocked:"میکروفون مسدود - مجوزها را بررسی کنید" },
  ms: { stop:"Ketik untuk berhenti", speak:"Ketik untuk bercakap", blocked:"Mik disekat - periksa kebenaran" },
  ro: { stop:"Atinge pentru a opri", speak:"Atinge pentru a vorbi", blocked:"Microfon blocat - verifică permisiuni" },
  cs: { stop:"Klepněte pro zastavení", speak:"Klepněte pro mluvení", blocked:"Mikrofon blokován - zkontrolujte oprávnění" },
  hu: { stop:"Koppints a leállításhoz", speak:"Koppints a beszédhez", blocked:"Mikrofon blokkolva - ellenőrizd jogosultságokat" },
  fi: { stop:"Napauta lopettaaksesi", speak:"Napauta puhuaksesi", blocked:"Mikki estetty - tarkista käyttöoikeudet" },
  no: { stop:"Trykk for å stoppe", speak:"Trykk for å snakke", blocked:"Mikrofon blokkert - sjekk tillatelser" },
  da: { stop:"Tryk for at stoppe", speak:"Tryk for at tale", blocked:"Mikrofon blokeret - tjek tilladelser" },
  bg: { stop:"Докоснете за спиране", speak:"Докоснете за говорене", blocked:"Микрофон блокиран - проверете разрешения" },
  hr: { stop:"Dodirnite za zaustavljanje", speak:"Dodirnite za govor", blocked:"Mikrofon blokiran - provjerite dozvole" },
  sr: { stop:"Додирните за заустављање", speak:"Додирните за говор", blocked:"Микрофон блокиран - проверите дозволе" },
  sk: { stop:"Klepnite pre zastavenie", speak:"Klepnite pre hovorenie", blocked:"Mikrofón blokovaný - skontrolujte oprávnenia" },
  sl: { stop:"Dotaknite za zaustavitev", speak:"Dotaknite za govor", blocked:"Mikrofon blokiran - preverite dovoljenja" },
  et: { stop:"Puuduta peatamiseks", speak:"Puuduta rääkimiseks", blocked:"Mikrofon blokeeritud - kontrolli õigusi" },
  lv: { stop:"Pieskarieties lai apturētu", speak:"Pieskarieties lai runātu", blocked:"Mikrofons bloķēts - pārbaudiet atļaujas" },
  lt: { stop:"Palieskite kad sustabdytumėte", speak:"Palieskite kad kalbėtumėte", blocked:"Mikrofonas užblokuotas - patikrinkite leidimus" },
  be: { stop:"Націсніце каб спыніць", speak:"Націсніце каб гаварыць", blocked:"Мікрафон заблакаваны - праверце дазволы" },
  ka: { stop:"შეეხე გასაჩერებლად", speak:"შეეხე სალაპარაკოდ", blocked:"მიკროფონი დაბლოკილია - შეამოწმე ნებართვები" },
  hy: { stop:"Հպեք կանգ առնելու համար", speak:"Հպեք խոսելու համար", blocked:"Խոսափողը արգելափակված է - ստուգեք թույլտվությունները" },
  az: { stop:"Dayandırmaq üçün toxunun", speak:"Danışmaq üçün toxunun", blocked:"Mikrofon bloklanıb - icazələri yoxlayın" },
  kk: { stop:"Тоқтату үшін түртіңіз", speak:"Сөйлеу үшін түртіңіз", blocked:"Микрофон бұғатталды - рұқсаттарды тексеріңіз" },
  ky: { stop:"Токтотуу үчүн таптап коюңуз", speak:"Сүйлөө үчүн таптап коюңуз", blocked:"Микрофон бөгөттөлдү - уруксаттарды текшериңиз" },
  uz: { stop:"To'xtatish uchun bosing", speak:"Gapirish uchun bosing", blocked:"Mikrofon bloklangan - ruxsatlarni tekshiring" },
  tg: { stop:"Барои боздоштан ламс кунед", speak:"Барои сухан гуфтан ламс кунед", blocked:"Микрофон баста шудааст - иҷозатҳоро санҷед" },
  mn: { stop:"Зогсоохын тулд дарна уу", speak:"Ярихын тулд дарна уу", blocked:"Микрофон блоклогдсон - зөвшөөрлийг шалгана уу" },
  km: { stop:"ប៉ះដើម្បីបញ្ឈប់", speak:"ប៉ះដើម្បីនិយាយ", blocked:"មីក្រូហ្វូនត្រូវបានប្លុក - ពិនិត្យការអនុញ្ញាត" },
  lo: { stop:"ແຕະເພື່ອຢຸດ", speak:"ແຕະເພື່ອເວົ້າ", blocked:"ໄມຖືກບລັອກ - ກວດສອບສິດ" },
  my: { stop:"ရပ်ရန် နှိပ်ပါ", speak:"ပြောရန် နှိပ်ပါ", blocked:"မိုက်ပိတ်ထားသည် - ခွင့်ပြုချက်များ စစ်ဆေးပါ" },
}

function makeLegible(text: string, lang: string){
  if(!text) return text
  let t = text.trim().replace(/\s+/g,' ')
  if(!t) return t
  t = t.charAt(0).toUpperCase() + t.slice(1)
  // Only apply English question logic for English-like langs
  if(lang.startsWith('en')){
    if(/^(who|what|where|when|why|how|is|are|can|could|would|should|do|does|did|will|have|has|are we|is this)/i.test(t) &&!/[?.!]$/.test(t)) t += '?'
    else if(!/[?.!]$/.test(t)) t += '.'
  } else {
    if(!/[?.!。？！।۔؟]$/.test(t)) t += '.'
  }
  return t
}

export default function MicRecorder({ onTranscript, onFinalTranscript }: Props) {
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const lastFinalRef = useRef('')

  const toggleMic = async () => {
    if (listening) {
      recognitionRef.current?.stop?.()
      mediaRef.current?.stop?.()
      setListening(false)
      return
    }

    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) {
      try {
        const rec = new SR()
        recognitionRef.current = rec
        rec.continuous = true
        rec.interimResults = true
        const userLang = navigator.language || 'en-US'
        rec.lang = userLang
        lastFinalRef.current = ''

        rec.onstart = () => setListening(true)
        rec.onend = () => {
          setListening(false)
          if (lastFinalRef.current && onFinalTranscript) {
            onFinalTranscript(makeLegible(lastFinalRef.current, language))
          }
        }
        rec.onresult = (e: any) => {
          let finalTranscript = ''
          let interimTranscript = ''
          for (let i = 0; i < e.results.length; i++) {
            const transcript = e.results[i][0].transcript
            if (e.results[i].isFinal) finalTranscript += transcript + ' '
            else interimTranscript += transcript
          }
          finalTranscript = finalTranscript.trim()
          lastFinalRef.current = finalTranscript
          const combined = finalTranscript + (interimTranscript? ' ' + interimTranscript : '')
          onTranscript(combined.trim())
        }
        rec.onerror = () => { try{ rec.stop() }catch{}; startRecordingFallback() }
        rec.start()
        return
      } catch {}
    }
    startRecordingFallback()
  }

  const startRecordingFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      const chunks: BlobPart[] = []
      mr.ondataavailable = e=> chunks.push(e.data)
      mr.onstop = async ()=>{
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setListening(false)
        stream.getTracks().forEach(t=>t.stop())
        try{
          const fd = new FormData()
          fd.append('audio', blob)
          const res = await fetch('/api/transcribe-elevenlabs', { method: 'POST', body: fd })
          const data = await res.json()
          if(data.text){
            onTranscript(makeLegible(data.text, language))
            onFinalTranscript?.(makeLegible(data.text, language))
          }
        }catch{}
      }
      mr.start()
      setListening(true)
    } catch {
      alert(d.blocked)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleMic}
      className={`h-12 w-12 rounded-full flex items-center justify-center border-2 border-black shrink-0 ${
        listening? 'bg-red-600 text-white animate-pulse' : 'bg-black text-white'
      }`}
      title={listening? d.stop : d.speak}
      aria-label={listening? d.stop : d.speak}
    >
      🎤
    </button>
  )
}
