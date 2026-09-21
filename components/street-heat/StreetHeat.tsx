'use client';
import { useEffect, useState } from 'react';
import { useLocation } from '@/lib/location-context';
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { hottest:"{street} is hottest today • {count} posts", total:"{total} total in {zip}" },
  es: { hottest:"{street} es lo más caliente hoy • {count} posts", total:"{total} total en {zip}" },
  fr: { hottest:"{street} est le plus chaud aujourd'hui • {count} posts", total:"{total} total à {zip}" },
  de: { hottest:"{street} ist heute am heißesten • {count} Posts", total:"{total} gesamt in {zip}" },
  zh: { hottest:"{street} 今天最热 • {count} 条帖子", total:"{zip} 共有 {total} 条" },
  ja: { hottest:"{street} は今日最も熱い • {count}件の投稿", total:"{zip} で合計 {total}件" },
  ko: { hottest:"{street} 오늘 가장 뜨거움 • {count}개 게시물", total:"{zip}에 총 {total}개" },
  pt: { hottest:"{street} é o mais quente hoje • {count} posts", total:"{total} total em {zip}" },
  ru: { hottest:"{street} самая горячая сегодня • {count} постов", total:"{total} всего в {zip}" },
  ar: { hottest:"{street} الأكثر سخونة اليوم • {count} منشور", total:"{total} إجمالي في {zip}" },
  hi: { hottest:"{street} आज सबसे हॉट है • {count} पोस्ट", total:"{zip} में कुल {total}" },
  it: { hottest:"{street} è il più caldo oggi • {count} post", total:"{total} totali in {zip}" },
  nl: { hottest:"{street} is het heetst vandaag • {count} posts", total:"{total} totaal in {zip}" },
  tl: { hottest:"{street} ang pinakamainit ngayon • {count} posts", total:"{total} total sa {zip}" },
  bn: { hottest:"{street} আজ সবচেয়ে গরম • {count} পোস্ট", total:"{zip} এ মোট {total}" },
  id: { hottest:"{street} terpanas hari ini • {count} post", total:"{total} total di {zip}" },
  vi: { hottest:"{street} nóng nhất hôm nay • {count} bài", total:"{total} tổng trong {zip}" },
  th: { hottest:"{street} ร้อนแรงที่สุดวันนี้ • {count} โพสต์", total:"{total} ทั้งหมดใน {zip}" },
  sv: { hottest:"{street} är hetast idag • {count} inlägg", total:"{total} totalt i {zip}" },
  pl: { hottest:"{street} najgorętsza dziś • {count} postów", total:"{total} łącznie w {zip}" },
  tr: { hottest:"{street} bugün en sıcak • {count} gönderi", total:"{zip} içinde toplam {total}" },
  uk: { hottest:"{street} найгарячіша сьогодні • {count} постів", total:"{total} всього в {zip}" },
  el: { hottest:"{street} είναι το πιο καυτό σήμερα • {count} αναρτήσεις", total:"{total} σύνολο σε {zip}" },
  he: { hottest:"{street} הכי חם היום • {count} פוסטים", total:"{total} סה״כ ב-{zip}" },
  ur: { hottest:"{street} آج سب سے زیادہ گرم • {count} پوسٹس", total:"{zip} میں کل {total}" },
  fa: { hottest:"{street} امروز داغ ترین است • {count} پست", total:"{total} کل در {zip}" },
  ms: { hottest:"{street} paling hangat hari ini • {count} post", total:"{total} jumlah di {zip}" },
  ro: { hottest:"{street} e cel mai fierbinte azi • {count} postări", total:"{total} total în {zip}" },
  cs: { hottest:"{street} je dnes nejžhavější • {count} příspěvků", total:"{total} celkem v {zip}" },
  hu: { hottest:"{street} ma a legforróbb • {count} bejegyzés", total:"{total} összesen {zip}-ben" },
  fi: { hottest:"{street} kuumin tänään • {count} postausta", total:"{total} yhteensä {zip}" },
  no: { hottest:"{street} er hetest i dag • {count} poster", total:"{total} totalt i {zip}" },
  da: { hottest:"{street} er hotteste i dag • {count} opslag", total:"{total} i alt i {zip}" },
  bg: { hottest:"{street} е най-гореща днес • {count} публикации", total:"{total} общо в {zip}" },
  hr: { hottest:"{street} je najvruća danas • {count} objava", total:"{total} ukupno u {zip}" },
  sr: { hottest:"{street} је најврелија данас • {count} објава", total:"{total} укупно у {zip}" },
  sk: { hottest:"{street} je dnes najhorúcejšia • {count} príspevkov", total:"{total} celkom v {zip}" },
  sl: { hottest:"{street} je danes najbolj vroča • {count} objav", total:"{total} skupno v {zip}" },
  et: { hottest:"{street} on täna kuumim • {count} postitust", total:"{total} kokku {zip}" },
  lv: { hottest:"{street} šodien karstākā • {count} ieraksti", total:"{total} kopā {zip}" },
  lt: { hottest:"{street} šiandien karščiausia • {count} įrašų", total:"{total} iš viso {zip}" },
  be: { hottest:"{street} самая гарачая сёння • {count} пастоў", total:"{total} усяго ў {zip}" },
  ka: { hottest:"{street} დღეს ყველაზე ცხელია • {count} პოსტი", total:"{total} სულ {zip}-ში" },
  hy: { hottest:"{street} այսօր ամենաթեժն է • {count} գրառում", total:"{total} ընդամենը {zip}-ում" },
  az: { hottest:"{street} bu gün ən istidir • {count} post", total:"{zip} içində cəmi {total}" },
  kk: { hottest:"{street} бүгін ең ыстық • {count} пост", total:"{zip} ішінде барлығы {total}" },
  ky: { hottest:"{street} бүгүн эң ысык • {count} пост", total:"{zip} ичинде бардыгы {total}" },
  uz: { hottest:"{street} bugun eng issiq • {count} post", total:"{zip} da jami {total}" },
  tg: { hottest:"{street} имрӯз гармтарин аст • {count} пост", total:"{total} ҷамъ дар {zip}" },
  mn: { hottest:"{street} өнөөдөр хамгийн халуун • {count} пост", total:"{zip} дотор нийт {total}" },
  km: { hottest:"{street} ក្តៅបំផុតថ្ងៃនេះ • {count} ការបង្ហោះ", total:"{total} សរុបក្នុង {zip}" },
  lo: { hottest:"{street} ຮ້ອນທີ່ສຸດມື້ນີ້ • {count} ໂພສ", total:"{total} ທັງໝົດໃນ {zip}" },
  my: { hottest:"{street} ယနေ့အပူဆုံးဖြစ်သည် • {count} ပို့စ်", total:"{zip} တွင် စုစုပေါင်း {total}" },
}

export default function StreetHeat() {
  const { zip } = useLocation();
  const { language } = useLanguage();
  const d = D[language] || D.en;
  const [heat, setHeat] = useState<any>(null);

  useEffect(() => {
    if (!zip) return;
    const fetchHeat = async () => {
      try {
        const r = await fetch(`/api/heat?zip=${zip}`, { cache: 'no-store' });
        if (r.status === 204) { setHeat(null); return; }
        if (r.ok) setHeat(await r.json());
      } catch {}
    };
    fetchHeat();
    const id = setInterval(fetchHeat, 300000);
    return () => { try { clearInterval(id) } catch {} }
  }, [zip]);

  if (!zip ||!heat) return null;

  return (
    <div className="w-full bg-zinc-900 rounded-full px-4 py-2 flex items-center gap-2 border border-white/10">
      <span className="text-xs">🔥</span>
      <span className="text-white text-xs font-bold">
        {d.hottest.replace('{street}', heat.street).replace('{count}', String(heat.count))}
      </span>
      <span className="text-white/40 text-xs ml-auto">
        {d.total.replace('{total}', String(heat.total)).replace('{zip}', zip)}
      </span>
    </div>
  );
}
