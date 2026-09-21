'use client';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { one:"{count} new post near {street} in last 60m", many:"{count} new posts near {street} in last 60m" },
  es: { one:"{count} nueva publicación cerca de {street} en últimos 60m", many:"{count} nuevas publicaciones cerca de {street} en últimos 60m" },
  fr: { one:"{count} nouveau post près de {street} dans les dernières 60m", many:"{count} nouveaux posts près de {street} dans les dernières 60m" },
  de: { one:"{count} neuer Post in der Nähe von {street} in letzten 60 Min", many:"{count} neue Posts in der Nähe von {street} in letzten 60 Min" },
  zh: { one:"{street} 附近过去60分钟内 {count} 条新帖子", many:"{street} 附近过去60分钟内 {count} 条新帖子" },
  ja: { one:"過去60分間に {street} 付近で {count} 件の新しい投稿", many:"過去60分間に {street} 付近で {count} 件の新しい投稿" },
  ko: { one:"지난 60분 동안 {street} 근처 새 게시물 {count}개", many:"지난 60분 동안 {street} 근처 새 게시물 {count}개" },
  pt: { one:"{count} novo post perto de {street} nos últimos 60m", many:"{count} novos posts perto de {street} nos últimos 60m" },
  ru: { one:"{count} новый пост около {street} за последние 60м", many:"{count} новых постов около {street} за последние 60м" },
  ar: { one:"{count} منشور جديد قرب {street} في آخر 60د", many:"{count} منشورات جديدة قرب {street} في آخر 60د" },
  hi: { one:"पिछले 60मि में {street} के पास {count} नई पोस्ट", many:"पिछले 60मि में {street} के पास {count} नई पोस्ट" },
  it: { one:"{count} nuovo post vicino a {street} negli ultimi 60m", many:"{count} nuovi post vicino a {street} negli ultimi 60m" },
  nl: { one:"{count} nieuwe post nabij {street} in laatste 60m", many:"{count} nieuwe posts nabij {street} in laatste 60m" },
  tl: { one:"{count} bagong post malapit sa {street} sa huling 60m", many:"{count} bagong posts malapit sa {street} sa huling 60m" },
  bn: { one:"শেষ 60মি এ {street} এর কাছে {count} নতুন পোস্ট", many:"শেষ 60মি এ {street} এর কাছে {count} নতুন পোস্ট" },
  id: { one:"{count} post baru dekat {street} dalam 60m terakhir", many:"{count} post baru dekat {street} dalam 60m terakhir" },
  vi: { one:"{count} bài đăng mới gần {street} trong 60p qua", many:"{count} bài đăng mới gần {street} trong 60p qua" },
  th: { one:"{count} โพสต์ใหม่ใกล้ {street} ใน 60นาทีที่ผ่านมา", many:"{count} โพสต์ใหม่ใกล้ {street} ใน 60นาทีที่ผ่านมา" },
  sv: { one:"{count} nytt inlägg nära {street} senaste 60m", many:"{count} nya inlägg nära {street} senaste 60m" },
  pl: { one:"{count} nowy post w pobliżu {street} w ostatnie 60m", many:"{count} nowych postów w pobliżu {street} w ostatnie 60m" },
  tr: { one:"Son 60dk içinde {street} yakınında {count} yeni gönderi", many:"Son 60dk içinde {street} yakınında {count} yeni gönderi" },
  uk: { one:"{count} новий пост біля {street} за останні 60хв", many:"{count} нових постів біля {street} за останні 60хв" },
  el: { one:"{count} νέα ανάρτηση κοντά σε {street} στα τελευταία 60λ", many:"{count} νέες αναρτήσεις κοντά σε {street} στα τελευταία 60λ" },
  he: { one:"{count} פוסט חדש ליד {street} ב-60ד האחרונות", many:"{count} פוסטים חדשים ליד {street} ב-60ד האחרונות" },
  ur: { one:"پچھلے 60منٹ میں {street} کے قریب {count} نئی پوسٹ", many:"پچھلے 60منٹ میں {street} کے قریب {count} نئی پوسٹس" },
  fa: { one:"{count} پست جدید نزدیک {street} در 60د گذشته", many:"{count} پست جدید نزدیک {street} در 60د گذشته" },
  ms: { one:"{count} post baru berhampiran {street} dalam 60m terakhir", many:"{count} post baru berhampiran {street} dalam 60m terakhir" },
  ro: { one:"{count} postare nouă lângă {street} în ultimele 60m", many:"{count} postări noi lângă {street} în ultimele 60m" },
  cs: { one:"{count} nový příspěvek poblíž {street} za posledních 60m", many:"{count} nových příspěvků poblíž {street} za posledních 60m" },
  hu: { one:"{count} új bejegyzés {street} közelében az elmúlt 60p-ben", many:"{count} új bejegyzés {street} közelében az elmúlt 60p-ben" },
  fi: { one:"{count} uusi postaus lähellä {street} viimeisen 60min aikana", many:"{count} uutta postausta lähellä {street} viimeisen 60min aikana" },
  no: { one:"{count} ny post nær {street} siste 60m", many:"{count} nye poster nær {street} siste 60m" },
  da: { one:"{count} nyt opslag nær {street} sidste 60m", many:"{count} nye opslag nær {street} sidste 60m" },
  bg: { one:"{count} нова публикация близо до {street} за последните 60м", many:"{count} нови публикации близо до {street} за последните 60м" },
  hr: { one:"{count} nova objava blizu {street} u zadnjih 60m", many:"{count} novih objava blizu {street} u zadnjih 60m" },
  sr: { one:"{count} нова објава близу {street} у задњих 60м", many:"{count} нових објава близу {street} у задњих 60м" },
  sk: { one:"{count} nový príspevok blízko {street} za posledných 60m", many:"{count} nových príspevkov blízko {street} za posledných 60m" },
  sl: { one:"{count} nova objava blizu {street} v zadnjih 60m", many:"{count} novih objav blizu {street} v zadnjih 60m" },
  et: { one:"{count} uus postitus {street} lähedal viimase 60m jooksul", many:"{count} uut postitust {street} lähedal viimase 60m jooksul" },
  lv: { one:"{count} jauns ieraksts netālu no {street} pēdējo 60m laikā", many:"{count} jauni ieraksti netālu no {street} pēdējo 60m laikā" },
  lt: { one:"{count} naujas įrašas netoli {street} per paskutines 60m", many:"{count} nauji įrašai netoli {street} per paskutines 60m" },
  be: { one:"{count} новы пост каля {street} за апошнія 60хв", many:"{count} новых пастоў каля {street} за апошнія 60хв" },
  ka: { one:"{count} ახალი პოსტი {street}-თან ახლოს ბოლო 60წთ-ში", many:"{count} ახალი პოსტი {street}-თან ახლოს ბოლო 60წთ-ში" },
  hy: { one:"{count} նոր գրառում {street}-ի մոտ վերջին 60ր-ում", many:"{count} նոր գրառումներ {street}-ի մոտ վերջին 60ր-ում" },
  az: { one:"Son 60d ərzində {street} yaxınlığında {count} yeni post", many:"Son 60d ərzində {street} yaxınlığında {count} yeni post" },
  kk: { one:"Соңғы 60м ішінде {street} жанында {count} жаңа пост", many:"Соңғы 60м ішінде {street} жанында {count} жаңа пост" },
  ky: { one:"Акыркы 60м ичинде {street} жанында {count} жаңы пост", many:"Акыркы 60м ичинде {street} жанында {count} жаңы пост" },
  uz: { one:"So'nggi 60m ichida {street} yaqinida {count} yangi post", many:"So'nggi 60m ichida {street} yaqinida {count} yangi post" },
  tg: { one:"Дар 60д охир назди {street} {count} пости нав", many:"Дар 60д охир назди {street} {count} пости нав" },
  mn: { one:"Сүүлийн 60м-д {street} ойролцоо {count} шинэ пост", many:"Сүүлийн 60м-д {street} ойролцоо {count} шинэ пост" },
  km: { one:"{count} ការបង្ហោះថ្មីនៅជិត {street} ក្នុង 60នាទីចុងក្រោយ", many:"{count} ការបង្ហោះថ្មីនៅជិត {street} ក្នុង 60នាទីចុងក្រោយ" },
  lo: { one:"{count} ໂພສໃໝ່ໃກ້ {street} ໃນ 60ນາທີທີ່ຜ່ານມາ", many:"{count} ໂພສໃໝ່ໃກ້ {street} ໃນ 60ນາທີທີ່ຜ່ານມາ" },
  my: { one:"နောက်ဆုံး 60မအတွင်း {street} အနီး {count} ပို့စ်အသစ်", many:"နောက်ဆုံး 60မအတွင်း {street} အနီး {count} ပို့စ်အသစ်" },
}

export default function ProximityPing() {
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [ping, setPing] = useState<any>(null);

  useEffect(() => {
    const fetchPing = async () => {
      try {
        const r = await fetch('/api/ping', { cache: 'no-store' });
        if (r.status === 204) { setPing(null); return; }
        if (r.ok) setPing(await r.json());
      } catch {}
    };
    fetchPing();
    const interval = setInterval(fetchPing, 60000);
    return () => { try { clearInterval(interval) } catch {} }
  }, []);

  if (!ping) return null;

  const template = ping.count === 1? d.one : d.many
  const text = template.replace('{count}', String(ping.count)).replace('{street}', ping.street || 'nearby')

  return (
    <div className="w-full bg-blue-600/90 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2 border border-white/20 animate-pulse">
      <span className="text-xs">🔵</span>
      <span className="text-white text-xs font-black">{text}</span>
    </div>
  );
}
