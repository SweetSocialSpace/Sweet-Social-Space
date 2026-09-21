'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { leaders:"🏆 KARMA LEADERS • {zip}", neighbor:"Neighbor", beFirst:"Be first in {zip} - post, get hearts" },
  es: { leaders:"🏆 LÍDERES KARMA • {zip}", neighbor:"Vecino", beFirst:"Sé primero en {zip} - publica, gana corazones" },
  fr: { leaders:"🏆 LEADERS KARMA • {zip}", neighbor:"Voisin", beFirst:"Soyez premier en {zip} - postez, gagnez des cœurs" },
  de: { leaders:"🏆 KARMA LEADER • {zip}", neighbor:"Nachbar", beFirst:"Sei Erster in {zip} - poste, bekomme Herzen" },
  zh: { leaders:"🏆 业力领袖 • {zip}", neighbor:"邻居", beFirst:"在 {zip} 成为第一 - 发帖，获得爱心" },
  ja: { leaders:"🏆 カルマリーダー • {zip}", neighbor:"隣人", beFirst:"{zip}で最初になろう - 投稿してハートをゲット" },
  ko: { leaders:"🏆 카르마 리더 • {zip}", neighbor:"이웃", beFirst:"{zip}에서 첫 번째가 되세요 - 게시하고 하트 받기" },
  pt: { leaders:"🏆 LÍDERES KARMA • {zip}", neighbor:"Vizinho", beFirst:"Seja primeiro em {zip} - poste, ganhe corações" },
  ru: { leaders:"🏆 ЛИДЕРЫ КАРМЫ • {zip}", neighbor:"Сосед", beFirst:"Будь первым в {zip} - публикуй, получай сердца" },
  ar: { leaders:"🏆 قادة كارما • {zip}", neighbor:"جار", beFirst:"كن الأول في {zip} - انشر، احصل على قلوب" },
  hi: { leaders:"🏆 कर्म लीडर्स • {zip}", neighbor:"पड़ोसी", beFirst:"{zip} में पहले बनें - पोस्ट करें, दिल पाएं" },
  it: { leaders:"🏆 LEADER KARMA • {zip}", neighbor:"Vicino", beFirst:"Sii primo in {zip} - posta, ottieni cuori" },
  nl: { leaders:"🏆 KARMA LEIDERS • {zip}", neighbor:"Buur", beFirst:"Wees eerste in {zip} - post, krijg harten" },
  tl: { leaders:"🏆 KARMA LEADERS • {zip}", neighbor:"Kapitbahay", beFirst:"Maging una sa {zip} - mag-post, kumuha ng hearts" },
  bn: { leaders:"🏆 কর্ম লিডার • {zip}", neighbor:"প্রতিবেশী", beFirst:"{zip} এ প্রথম হোন - পোস্ট করুন, হার্ট পান" },
  id: { leaders:"🏆 PEMIMPIN KARMA • {zip}", neighbor:"Tetangga", beFirst:"Jadi pertama di {zip} - posting, dapatkan hati" },
  vi: { leaders:"🏆 LÃNH ĐẠO KARMA • {zip}", neighbor:"Hàng xóm", beFirst:"Hãy là người đầu tiên ở {zip} - đăng bài, nhận tim" },
  th: { leaders:"🏆 ผู้นำกรรม • {zip}", neighbor:"เพื่อนบ้าน", beFirst:"เป็นที่แรกใน {zip} - โพสต์ รับหัวใจ" },
  sv: { leaders:"🏆 KARMA LEDARE • {zip}", neighbor:"Granne", beFirst:"Bli först i {zip} - posta, få hjärtan" },
  pl: { leaders:"🏆 LIDERZY KARMY • {zip}", neighbor:"Sąsiad", beFirst:"Bądź pierwszy w {zip} - postuj, zdobywaj serca" },
  tr: { leaders:"🏆 KARMA LİDERLERİ • {zip}", neighbor:"Komşu", beFirst:"{zip} içinde ilk ol - gönder, kalp kazan" },
  uk: { leaders:"🏆 ЛІДЕРИ КАРМИ • {zip}", neighbor:"Сусід", beFirst:"Будь першим у {zip} - публікуй, отримуй серця" },
  el: { leaders:"🏆 ΗΓΕΤΕΣ KARMA • {zip}", neighbor:"Γείτονας", beFirst:"Γίνε πρώτος στο {zip} - δημοσίευσε, πάρε καρδιές" },
  he: { leaders:"🏆 מובילי קארמה • {zip}", neighbor:"שכן", beFirst:"היה ראשון ב {zip} - פרסם, קבל לבבות" },
  ur: { leaders:"🏆 کرما لیڈرز • {zip}", neighbor:"پڑوسی", beFirst:"{zip} میں پہلے بنیں - پوسٹ کریں، دل حاصل کریں" },
  fa: { leaders:"🏆 رهبران کارما • {zip}", neighbor:"همسایه", beFirst:"اولین در {zip} باش - پست کن، قلب بگیر" },
  ms: { leaders:"🏆 PEMIMPIN KARMA • {zip}", neighbor:"Jiran", beFirst:"Jadi pertama di {zip} - posting, dapatkan hati" },
  ro: { leaders:"🏆 LIDERI KARMA • {zip}", neighbor:"Vecin", beFirst:"Fii primul în {zip} - postează, primește inimi" },
  cs: { leaders:"🏆 LÍDŘI KARMY • {zip}", neighbor:"Soused", beFirst:"Buď první v {zip} - postuj, získej srdce" },
  hu: { leaders:"🏆 KARMA VEZETŐK • {zip}", neighbor:"Szomszéd", beFirst:"Légy első {zip}-ben - posztolj, szerezz szíveket" },
  fi: { leaders:"🏆 KARMA JOHTAJAT • {zip}", neighbor:"Naapuri", beFirst:"Ole ensimmäinen {zip} - postaa, saa sydämiä" },
  no: { leaders:"🏆 KARMA LEDERE • {zip}", neighbor:"Nabo", beFirst:"Bli første i {zip} - post, få hjerter" },
  da: { leaders:"🏆 KARMA LEDERE • {zip}", neighbor:"Nabo", beFirst:"Bliv første i {zip} - post, få hjerter" },
  bg: { leaders:"🏆 ЛИДЕРИ КАРМА • {zip}", neighbor:"Съсед", beFirst:"Бъди първи в {zip} - публикувай, получавай сърца" },
  hr: { leaders:"🏆 KARMA LIDERI • {zip}", neighbor:"Susjed", beFirst:"Budi prvi u {zip} - objavi, osvoji srca" },
  sr: { leaders:"🏆 ЛИДЕРИ КАРМЕ • {zip}", neighbor:"Комшија", beFirst:"Буди први у {zip} - објави, освајај срца" },
  sk: { leaders:"🏆 LÍDRI KARMY • {zip}", neighbor:"Sused", beFirst:"Buď prvý v {zip} - postuj, získaj srdcia" },
  sl: { leaders:"🏆 VODITELJI KARME • {zip}", neighbor:"Sosed", beFirst:"Bodi prvi v {zip} - objavi, dobi srca" },
  et: { leaders:"🏆 KARMA LIIDRIT • {zip}", neighbor:"Naaber", beFirst:"Ole esimene {zip} - postita, saa südameid" },
  lv: { leaders:"🏆 KARMAS LĪDERI • {zip}", neighbor:"Kaimiņš", beFirst:"Esi pirmais {zip} - publicē, saņem sirdis" },
  lt: { leaders:"🏆 KARMOS LYDERIAI • {zip}", neighbor:"Kaimynas", beFirst:"Būk pirmas {zip} - skelbk, gauk širdis" },
  be: { leaders:"🏆 ЛІДЭРЫ КАРМЫ • {zip}", neighbor:"Сусед", beFirst:"Будзь першым у {zip} - публікуй, атрымлівай сэрцы" },
  ka: { leaders:"🏆 კარმის ლიდერები • {zip}", neighbor:"მეზობელი", beFirst:"იყავი პირველი {zip}-ში - გამოაქვეყნე, მიიღე გულები" },
  hy: { leaders:"🏆 ԿԱՐՄԱՅԻ ԱՌԱՋՆՈՐԴՆԵՐ • {zip}", neighbor:"Հարևան", beFirst:"Եղիր առաջինը {zip}-ում - հրապարակիր, ստացիր սրտեր" },
  az: { leaders:"🏆 KARMA LİDERLƏRİ • {zip}", neighbor:"Qonşu", beFirst:"{zip}-də birinci ol - post et, ürək qazan" },
  kk: { leaders:"🏆 КАРМА КӨШБАСШЫЛАРЫ • {zip}", neighbor:"Көрші", beFirst:"{zip}-да бірінші бол - жарияла, жүрек ал" },
  ky: { leaders:"🏆 КАРМА ЛИДЕРЛЕРИ • {zip}", neighbor:"Кошуна", beFirst:"{zip}-да биринчи бол - жарыяла, жүрөк ал" },
  uz: { leaders:"🏆 KARMA YETAKCHILARI • {zip}", neighbor:"Qo'shni", beFirst:"{zip} da birinchi bo'l - joyla, yurak ol" },
  tg: { leaders:"🏆 ПЕШВОЁНИ КАРМА • {zip}", neighbor:"Ҳамсоя", beFirst:"Аввал дар {zip} бош - интишор кун, дил гир" },
  mn: { leaders:"🏆 КАРМА ТЭРГҮҮЛЭГЧИД • {zip}", neighbor:"Хөрш", beFirst:"{zip}-д эхний бол - нийтэл, зүрх ав" },
  km: { leaders:"🏆 អ្នកដឹកនាំការ៉ម៉ា • {zip}", neighbor:"អ្នកជិតខាង", beFirst:"ក្លាយជាអ្នកទីមួយនៅ {zip} - បង្ហោះ, ទទួលបានបេះដូង" },
  lo: { leaders:"🏆 ຜູ້ນຳ KARMA • {zip}", neighbor:"ເພື່ອນບ້ານ", beFirst:"ເປັນຄົນທຳອິດໃນ {zip} - ໂພສ, ຮັບຫົວໃຈ" },
  my: { leaders:"🏆 ကံခေါင်းဆောင်များ • {zip}", neighbor:"အိမ်နီးချင်း", beFirst:"{zip} တွင်ပထမဆုံးဖြစ်ပါ - တင်ပါ၊ နှလုံးသားများရယူပါ" },
}

export default function KarmaLeaderboard() {
  const { zip: contextZip } = useLocation()
  const { filter } = useLocationScope()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const zip = contextZip && contextZip!== 'GLOBAL'? contextZip : 'GLOBAL'
  const [leaders, setLeaders] = useState<any[]>([])

  useEffect(() => {
    if (!zip || zip === 'GLOBAL') return
    let mounted = true
    const load = async () => {
      try {
        const supabase = createClient() as any
        let data: any[] = []

        if (filter.lat!= null && filter.lng!= null) {
          const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
          const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)

          const { data: profileData } = await supabase
           .from('profiles')
           .select('id, display_name, latitude, longitude')
           .gte('latitude', bbox.minLat)
           .lte('latitude', bbox.maxLat)
           .gte('longitude', bbox.minLng)
           .lte('longitude', bbox.maxLng)
           .limit(20)

          if (profileData) {
            data = applyScope(profileData, filter)
          }
        } else {
          const { data: profileData, error } = await supabase
         .from('profiles')
         .select('id, display_name')
         .eq('zip_code', zip)
         .limit(5)

          if (error) {
            console.log('Karma leaderboard error:', error.message)
            return
          }
          data = profileData || []
        }

        if (mounted && data) setLeaders(data)
      } catch (e) {
        console.log('Karma error', e)
      }
    }
    load()
    return () => { mounted = false }
  }, [zip, filter])

  if (zip === 'GLOBAL') return null

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
      <div className="text-yellow-400 font-black text-xs mb-2">{d.leaders.replace('{zip}', zip)}</div>
      {leaders.map((u, i) => (
        <div key={u.id} className="flex justify-between text-xs text-white py-1 border-b border-white/5 last:border-0">
          <span>{i+1}. {u.display_name || d.neighbor}</span>
          <span className="font-black text-yellow-400">★</span>
        </div>
      ))}
      {leaders.length===0 && <div className="text-xs text-white/40">{d.beFirst.replace('{zip}', zip)}</div>}
    </div>
  )
}
