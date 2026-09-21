'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react'
import { Track, RoomEvent } from 'livekit-client'

const D: Record<string, any> = {
  en: { waiting:"Waiting for stream to start...", isLive:"is LIVE", joining:"Joining stream...", watchOnly:"Watch only — your camera and microphone are not shared", failed:"Failed to join stream" },
  es: { waiting:"Esperando que inicie transmisión...", isLive:"está EN VIVO", joining:"Uniéndose a transmisión...", watchOnly:"Solo ver — tu cámara y micrófono no se comparten", failed:"Error al unirse a transmisión" },
  fr: { waiting:"En attente du début du flux...", isLive:"est EN DIRECT", joining:"Rejoindre le flux...", watchOnly:"Regarder seulement — votre caméra et micro ne sont pas partagés", failed:"Échec rejoindre flux" },
  de: { waiting:"Warten auf Stream-Start...", isLive:"ist LIVE", joining:"Stream beitreten...", watchOnly:"Nur ansehen — deine Kamera und Mikrofon werden nicht geteilt", failed:"Fehler beim Beitreten zum Stream" },
  zh: { waiting:"等待直播开始...", isLive:"正在直播", joining:"正在加入直播...", watchOnly:"仅观看 — 你的摄像头和麦克风不会共享", failed:"加入直播失败" },
  ja: { waiting:"ストリーム開始を待っています...", isLive:"がライブ配信中", joining:"ストリームに参加中...", watchOnly:"視聴のみ — カメラとマイクは共有されません", failed:"ストリームへの参加に失敗しました" },
  ko: { waiting:"스트림 시작 대기 중...", isLive:"라이브 중", joining:"스트림 참여 중...", watchOnly:"시청 전용 — 카메라와 마이크가 공유되지 않습니다", failed:"스트림 참여 실패" },
  pt: { waiting:"Aguardando início da transmissão...", isLive:"está AO VIVO", joining:"Entrando na transmissão...", watchOnly:"Apenas assistir — sua câmera e microfone não são compartilhados", failed:"Falha ao entrar na transmissão" },
  ru: { waiting:"Ожидание начала трансляции...", isLive:"в ЭФИРЕ", joining:"Подключение к трансляции...", watchOnly:"Только просмотр — ваша камера и микрофон не передаются", failed:"Не удалось подключиться к трансляции" },
  ar: { waiting:"في انتظار بدء البث...", isLive:"مباشر الآن", joining:"الانضمام للبث...", watchOnly:"مشاهدة فقط — الكاميرا والميكروفون لا يشاركان", failed:"فشل الانضمام للبث" },
  hi: { waiting:"स्ट्रीम शुरू होने का इंतजार...", isLive:"लाइव है", joining:"स्ट्रीम में जुड़ रहे...", watchOnly:"केवल देखें — आपका कैमरा और माइक साझा नहीं होता", failed:"स्ट्रीम में जुड़ना विफल" },
  it: { waiting:"In attesa inizio stream...", isLive:"è LIVE", joining:"Unendosi allo stream...", watchOnly:"Solo visione — la tua camera e microfono non sono condivisi", failed:"Impossibile unirsi allo stream" },
  nl: { waiting:"Wachten op start stream...", isLive:"is LIVE", joining:"Deelnemen aan stream...", watchOnly:"Alleen kijken — je camera en microfoon worden niet gedeeld", failed:"Deelnemen aan stream mislukt" },
  tl: { waiting:"Naghihintay magsimula stream...", isLive:"ay LIVE", joining:"Sumasali sa stream...", watchOnly:"Manood lang — hindi shinare camera at mic mo", failed:"Hindi makasali sa stream" },
  bn: { waiting:"স্ট্রিম শুরু হওয়ার অপেক্ষায়...", isLive:"লাইভে আছে", joining:"স্ট্রিমে যোগ দিচ্ছি...", watchOnly:"শুধু দেখুন — আপনার ক্যামেরা ও মাইক শেয়ার হয় না", failed:"স্ট্রিমে যোগ দিতে ব্যর্থ" },
  id: { waiting:"Menunggu stream dimulai...", isLive:"sedang LIVE", joining:"Bergabung ke stream...", watchOnly:"Hanya menonton — kamera dan mikrofon Anda tidak dibagikan", failed:"Gagal bergabung ke stream" },
  vi: { waiting:"Đang chờ stream bắt đầu...", isLive:"đang TRỰC TIẾP", joining:"Đang tham gia stream...", watchOnly:"Chỉ xem — camera và mic của bạn không được chia sẻ", failed:"Tham gia stream thất bại" },
  th: { waiting:"รอการเริ่มสตรีม...", isLive:"กำลังไลฟ์", joining:"กำลังเข้าร่วมสตรีม...", watchOnly:"ดูเท่านั้น — กล้องและไมค์ของคุณไม่ได้แชร์", failed:"เข้าร่วมสตรีมล้มเหลว" },
  sv: { waiting:"Väntar på att stream ska starta...", isLive:"är LIVE", joining:"Går med i stream...", watchOnly:"Endast titta — din kamera och mikrofon delas inte", failed:"Misslyckades gå med i stream" },
  pl: { waiting:"Oczekiwanie na start transmisji...", isLive:"jest NA ŻYWO", joining:"Dołączanie do transmisji...", watchOnly:"Tylko oglądanie — twoja kamera i mikrofon nie są udostępniane", failed:"Nie udało się dołączyć do transmisji" },
  tr: { waiting:"Yayının başlaması bekleniyor...", isLive:"CANLI yayında", joining:"Yayına katılıyor...", watchOnly:"Sadece izle — kameranız ve mikrofonunuz paylaşılmıyor", failed:"Yayına katılma başarısız" },
  uk: { waiting:"Очікування початку трансляції...", isLive:"в ЕФІРІ", joining:"Приєднання до трансляції...", watchOnly:"Тільки перегляд — ваша камера і мікрофон не передаються", failed:"Не вдалося приєднатися до трансляції" },
  el: { waiting:"Αναμονή έναρξης ροής...", isLive:"είναι LIVE", joining:"Συμμετοχή στη ροή...", watchOnly:"Μόνο προβολή — η κάμερα και το μικρόφωνό σας δεν κοινοποιούνται", failed:"Αποτυχία συμμετοχής στη ροή" },
  he: { waiting:"ממתין לתחילת השידור...", isLive:"בשידור חי", joining:"מצטרף לשידור...", watchOnly:"צפייה בלבד — המצלמה והמיקרופון שלך לא משותפים", failed:"נכשל בהצטרפות לשידור" },
  ur: { waiting:"اسٹریم شروع ہونے کا انتظار...", isLive:"لائیو ہے", joining:"اسٹریم میں شامل ہو رہے...", watchOnly:"صرف دیکھیں — آپ کا کیمرہ اور مائک شیئر نہیں ہوتا", failed:"اسٹریم میں شامل ہونا ناکام" },
  fa: { waiting:"در انتظار شروع استریم...", isLive:"زنده است", joining:"در حال پیوستن به استریم...", watchOnly:"فقط تماشا — دوربین و میکروفون شما به اشتراک گذاشته نمی شود", failed:"پیوستن به استریم ناموفق" },
  ms: { waiting:"Menunggu strim bermula...", isLive:"sedang LIVE", joining:"Menyertai strim...", watchOnly:"Tonton sahaja — kamera dan mikrofon anda tidak dikongsi", failed:"Gagal menyertai strim" },
  ro: { waiting:"Se așteaptă începerea stream-ului...", isLive:"este LIVE", joining:"Alăturare la stream...", watchOnly:"Doar vizionare — camera și microfonul nu sunt partajate", failed:"Eșec alăturare la stream" },
  cs: { waiting:"Čekání na zahájení přenosu...", isLive:"je ŽIVĚ", joining:"Připojování k přenosu...", watchOnly:"Pouze sledování — vaše kamera a mikrofon nejsou sdíleny", failed:"Nepodařilo se připojit k přenosu" },
  hu: { waiting:"Várakozás a stream kezdetére...", isLive:"ÉLŐ adásban", joining:"Csatlakozás a streamhez...", watchOnly:"Csak nézés — kamerád és mikrofonod nincs megosztva", failed:"Nem sikerült csatlakozni a streamhez" },
  fi: { waiting:"Odotetaan striimin alkua...", isLive:"on LIVE", joining:"Liitytään striimiin...", watchOnly:"Vain katselu — kameraasi ja mikrofonia ei jaeta", failed:"Striimiin liittyminen epäonnistui" },
  no: { waiting:"Venter på at stream skal starte...", isLive:"er LIVE", joining:"Blir med i stream...", watchOnly:"Kun se — kameraet og mikrofonen din deles ikke", failed:"Kunne ikke bli med i stream" },
  da: { waiting:"Venter på stream starter...", isLive:"er LIVE", joining:"Deltager i stream...", watchOnly:"Kun se — dit kamera og mikrofon deles ikke", failed:"Kunne ikke deltage i stream" },
  bg: { waiting:"Изчакване на началото на стрийма...", isLive:"е НА ЖИВО", joining:"Присъединяване към стрийм...", watchOnly:"Само гледане — вашата камера и микрофон не се споделят", failed:"Неуспешно присъединяване към стрийм" },
  hr: { waiting:"Čekanje početka streama...", isLive:"je UŽIVO", joining:"Pridruživanje streamu...", watchOnly:"Samo gledanje — vaša kamera i mikrofon se ne dijele", failed:"Neuspješno pridruživanje streamu" },
  sr: { waiting:"Чекање почетка стрима...", isLive:"је УЖИВО", joining:"Придруживање стриму...", watchOnly:"Само гледање — ваша камера и микрофон се не деле", failed:"Неуспешно придруживање стриму" },
  sk: { waiting:"Čakanie na začiatok prenosu...", isLive:"je NAŽIVO", joining:"Pripájanie k prenosu...", watchOnly:"Len sledovanie — vaša kamera a mikrofón nie sú zdieľané", failed:"Nepodarilo sa pripojiť k prenosu" },
  sl: { waiting:"Čakanje na začetek prenosa...", isLive:"je V ŽIVO", joining:"Pridruževanje prenosu...", watchOnly:"Samo gledanje — vaša kamera in mikrofon se ne delita", failed:"Neuspešno pridruževanje prenosu" },
  et: { waiting:"Ootame striimi algust...", isLive:"on OTSE", joining:"Liitumine striimiga...", watchOnly:"Ainult vaatamine — kaamera ja mikrofon ei jagata", failed:"Striimiga liitumine ebaõnnestus" },
  lv: { waiting:"Gaida straumes sākumu...", isLive:"ir TIEŠRAIDĒ", joining:"Pievienošanās straumei...", watchOnly:"Tikai skatīšanās — jūsu kamera un mikrofons netiek koplietots", failed:"Neizdevās pievienoties straumei" },
  lt: { waiting:"Laukiama transliacijos pradžios...", isLive:"yra TIESIOGIAI", joining:"Prisijungiama prie transliacijos...", watchOnly:"Tik žiūrėjimas — jūsų kamera ir mikrofonas nesidalijami", failed:"Nepavyko prisijungti prie transliacijos" },
  be: { waiting:"Чаканне пачатку трансляцыі...", isLive:"У ЭФІРЫ", joining:"Далучэнне да трансляцыі...", watchOnly:"Толькі прагляд — ваша камера і мікрафон не дзеляцца", failed:"Не атрымалася далучыцца да трансляцыі" },
  ka: { waiting:"სტრიმის დაწყების მოლოდინში...", isLive:"ლაივშია", joining:"სტრიმზე შეერთება...", watchOnly:"მხოლოდ ყურება — თქვენი კამერა და მიკროფონი არ ზიარდება", failed:"სტრიმზე შეერთება ვერ მოხერხდა" },
  hy: { waiting:"Սպասում ենք հեռարձակման սկսմանը...", isLive:"ՈՒՂԻՂ ԵԹԵՐՈՒՄ Է", joining:"Միանում ենք հեռարձակմանը...", watchOnly:"Միայն դիտում — ձեր տեսախցիկը և խոսափողը չեն կիսվում", failed:"Չհաջողվեց միանալ հեռարձակմանը" },
  az: { waiting:"Yayımın başlaması gözlənilir...", isLive:"CANLI-dadır", joining:"Yayına qoşulur...", watchOnly:"Yalnız izlə — kameranız və mikrofonunuz paylaşılmır", failed:"Yayıma qoşulmaq alınmadı" },
  kk: { waiting:"Трансляция басталуын күту...", isLive:"ТІКЕЛЕЙ ЭФИРДЕ", joining:"Трансляцияға қосылу...", watchOnly:"Тек көру — камераңыз бен микрофоныңыз бөлісілмейді", failed:"Трансляцияға қосылу сәтсіз" },
  ky: { waiting:"Трансляция башталышын күтүү...", isLive:"ТҮЗ ЭФИРДЕ", joining:"Трансляцияга кошулуу...", watchOnly:"Жалаң көрүү — камераңыз жана микрофонуңуз бөлүшүлбөйт", failed:"Трансляцияга кошулуу ишке ашкан жок" },
  uz: { waiting:"Translyatsiya boshlanishini kutish...", isLive:"JONLI EFIRDA", joining:"Translyatsiyaga qo'shilish...", watchOnly:"Faqat tomosha — kamerangiz va mikrofoningiz bo'lishilmaydi", failed:"Translyatsiyaga qo'shilish muvaffaqiyatsiz" },
  tg: { waiting:"Интизори оғози пахш...", isLive:"ЗИНДА аст", joining:"Пайвастшавӣ ба пахш...", watchOnly:"Танҳо тамошо — камера ва микрофони шумо мубодила намешавад", failed:"Пайвастшавӣ ба пахш ноком шуд" },
  mn: { waiting:"Дамжуулалт эхлэхийг хүлээж байна...", isLive:"ШУУД дамжуулж байна", joining:"Дамжуулалтад нэгдэж байна...", watchOnly:"Зөвхөн үзэх — таны камер болон микрофон хуваалцагдахгүй", failed:"Дамжуулалтад нэгдэх амжилтгүй" },
  km: { waiting:"រង់ចាំការចាប់ផ្តើមស្ទ្រីម...", isLive:"កំពុង LIVE", joining:"កំពុងចូលរួមស្ទ្រីម...", watchOnly:"មើលតែប៉ុណ្ណោះ — កាមេរ៉ានិងមីក្រូរបស់អ្នកមិនត្រូវបានចែករំលែក", failed:"ចូលរួមស្ទ្រីមបរាជ័យ" },
  lo: { waiting:"ລໍຖ້າການສະເຕີມເລີ່ມ...", isLive:"ກຳລັງ LIVE", joining:"ກຳລັງເຂົ້າຮ່ວມສະເຕີມ...", watchOnly:"ເບິ່ງເທົ່ານັ້ນ — ກ້ອງແລະໄມຂອງທ່ານບໍ່ໄດ້ແບ່ງປັນ", failed:"ເຂົ້າຮ່ວມສະເຕີມລົ້ມເຫຼວ" },
  my: { waiting:"ထုတ်လွှင့်မှုစတင်ရန်စောင့်ဆိုင်းနေသည်...", isLive:"LIVE လွှင့်နေသည်", joining:"ထုတ်လွှင့်မှုတွင်ပါဝင်နေသည်...", watchOnly:"ကြည့်ရှုရန်သာ — သင့်ကင်မရာနှင့်မိုက်ခရိုဖုန်းမျှဝေမည်မဟုတ်ပါ", failed:"ထုတ်လွှင့်မှုတွင်ပါဝင်ရန်မအောင်မြင်ပါ" },
}

function ViewerOnlyEnforcer() {
  const room = useRoomContext()
  useEffect(() => {
    if (!room?.localParticipant) return
    const disablePublishing = async () => {
      await room.localParticipant.setMicrophoneEnabled(false)
      await room.localParticipant.setCameraEnabled(false)
      room.localParticipant.trackPublications.forEach((pub) => {
        if (pub.track) {
          room.localParticipant.unpublishTrack(pub.track)
        }
      })
    }
    disablePublishing()
    room.on('connected', disablePublishing)
    return () => { room.off('connected', disablePublishing) }
  }, [room])
  return null
}

function HostStreamView({ waitingText }: { waitingText: string }) {
  const room = useRoomContext()
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [hasVideo, setHasVideo] = useState(false)

  useEffect(() => {
    const videoEl = videoRef.current
    const audioEl = audioRef.current
    if (!room) return

    const attachTracks = () => {
      for (const participant of Array.from(room.remoteParticipants.values())) {
        const videoPub = participant.getTrackPublication(Track.Source.Camera)
        if (videoPub?.track && videoEl) {
          videoPub.track.attach(videoEl)
          setHasVideo(true)
        }
        const audioPub = participant.getTrackPublication(Track.Source.Microphone)
        if (audioPub?.track && audioEl) {
          audioPub.track.attach(audioEl)
        }
      }
    }

    attachTracks()
    room.on(RoomEvent.TrackSubscribed, attachTracks)
    room.on(RoomEvent.TrackPublished, attachTracks)

    return () => {
      room.off(RoomEvent.TrackSubscribed, attachTracks)
      room.off(RoomEvent.TrackPublished, attachTracks)
      for (const participant of Array.from(room.remoteParticipants.values())) {
        participant.getTrackPublication(Track.Source.Camera)?.track?.detach(videoEl!)
        participant.getTrackPublication(Track.Source.Microphone)?.track?.detach(audioEl!)
      }
    }
  }, [room])

  return (
    <div className="relative w-full h-full bg-black">
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white">{waitingText}</p>
        </div>
      )}
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <audio ref={audioRef} autoPlay playsInline />
    </div>
  )
}

export default function JoinLive({
  roomName,
  userName,
  onClose,
}: {
  roomName: string
  userName: string
  onClose: () => void
}) {
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const joinStream = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || 'viewer-' + Date.now()
        const tokenRes = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: roomName,
            participantName: uid,
            role: 'viewer',
          }),
        })
        if (!tokenRes.ok) {
          const errorData = await tokenRes.json()
          setError(errorData.error || d.failed)
          setLoading(false)
          return
        }
        const tokenData = await tokenRes.json()
        setToken(tokenData.token)
        setLoading(false)
      } catch (err: any) {
        setError(d.failed + ': ' + err.message)
        setLoading(false)
      }
    }
    joinStream()
  }, [roomName, supabase, d.failed])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-5">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-4xl p-5 border border-neutral-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-bold text-lg">🔴 {userName} {d.isLive}</span>
          <button onClick={onClose} className="bg-neutral-700 text-white rounded-full w-8 h-8 border-none cursor-pointer text-base">X</button>
        </div>
        {error && <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {loading? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4 animate-pulse">🔴</div>
            <p className="text-neutral-400">{d.joining}</p>
          </div>
        ) : token? (
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            <LiveKitRoom
              token={token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              connect={true}
              onDisconnected={onClose}
              audio={true}
              video={true}
            >
              <ViewerOnlyEnforcer />
              <HostStreamView waitingText={d.waiting} />
              <RoomAudioRenderer />
            </LiveKitRoom>
          </div>
        ) : null}
        <div className="mt-3 text-center text-neutral-500 text-xs">{d.watchOnly}</div>
      </div>
    </div>
  )
}
