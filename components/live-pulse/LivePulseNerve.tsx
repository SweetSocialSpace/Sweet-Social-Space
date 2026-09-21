'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from '@/lib/location-context';
import { useLanguage } from '@/lib/language-context';

type PulseData = {
  temp?: number;
  condition?: string;
  tacoLine?: string;
  yardSales?: number;
  onlineNow?: number;
}

const D: Record<string, any> = {
  en: { live:"LIVE {zip}", tacos:"Tacos • {line}", localOpen:"Local spot • Open", yardSales:"{count} yard sales", onlineNow:"{count} online now" },
  es: { live:"EN VIVO {zip}", tacos:"Tacos • {line}", localOpen:"Local abierto", yardSales:"{count} ventas de garaje", onlineNow:"{count} en línea" },
  fr: { live:"EN DIRECT {zip}", tacos:"Tacos • {line}", localOpen:"Spot local • Ouvert", yardSales:"{count} ventes de garage", onlineNow:"{count} en ligne" },
  de: { live:"LIVE {zip}", tacos:"Tacos • {line}", localOpen:"Lokaler Spot • Offen", yardSales:"{count} Garagenverkäufe", onlineNow:"{count} online" },
  zh: { live:"直播 {zip}", tacos:"塔可 • {line}", localOpen:"本地店 • 营业中", yardSales:"{count}个庭院销售", onlineNow:"{count}人在线" },
  ja: { live:"ライブ {zip}", tacos:"タコス • {line}", localOpen:"地元スポット • 営業中", yardSales:"{count}件のガレージセール", onlineNow:"{count}人がオンライン" },
  ko: { live:"라이브 {zip}", tacos:"타코 • {line}", localOpen:"로컬 스팟 • 영업 중", yardSales:"{count}개 차고 세일", onlineNow:"{count}명 온라인" },
  pt: { live:"AO VIVO {zip}", tacos:"Tacos • {line}", localOpen:"Local • Aberto", yardSales:"{count} vendas de garagem", onlineNow:"{count} online" },
  ru: { live:"ЛАЙВ {zip}", tacos:"Такос • {line}", localOpen:"Местное место • Открыто", yardSales:"{count} гаражных распродаж", onlineNow:"{count} онлайн" },
  ar: { live:"مباشر {zip}", tacos:"تاكو • {line}", localOpen:"مكان محلي • مفتوح", yardSales:"{count} بيع ساحة", onlineNow:"{count} متصل" },
  hi: { live:"लाइव {zip}", tacos:"टैकोस • {line}", localOpen:"लोकल स्पॉट • खुला", yardSales:"{count} यार्ड सेल", onlineNow:"{count} ऑनलाइन" },
  it: { live:"LIVE {zip}", tacos:"Tacos • {line}", localOpen:"Locale • Aperto", yardSales:"{count} vendite garage", onlineNow:"{count} online" },
  nl: { live:"LIVE {zip}", tacos:"Taco's • {line}", localOpen:"Lokale plek • Open", yardSales:"{count} garageverkopen", onlineNow:"{count} online" },
  tl: { live:"LIVE {zip}", tacos:"Tacos • {line}", localOpen:"Local spot • Open", yardSales:"{count} yard sales", onlineNow:"{count} online" },
  bn: { live:"লাইভ {zip}", tacos:"টাকোস • {line}", localOpen:"লোকাল স্পট • খোলা", yardSales:"{count} ইয়ার্ড সেল", onlineNow:"{count} অনলাইন" },
  id: { live:"LIVE {zip}", tacos:"Taco • {line}", localOpen:"Tempat lokal • Buka", yardSales:"{count} obral halaman", onlineNow:"{count} online" },
  vi: { live:"TRỰC TIẾP {zip}", tacos:"Tacos • {line}", localOpen:"Điểm địa phương • Mở", yardSales:"{count} bán sân", onlineNow:"{count} trực tuyến" },
  th: { live:"สด {zip}", tacos:"ทาโก้ • {line}", localOpen:"ร้านท้องถิ่น • เปิด", yardSales:"{count} ขายของหน้าบ้าน", onlineNow:"{count} ออนไลน์" },
  sv: { live:"LIVE {zip}", tacos:"Tacos • {line}", localOpen:"Lokalt ställe • Öppet", yardSales:"{count} loppisar", onlineNow:"{count} online" },
  pl: { live:"LIVE {zip}", tacos:"Tacos • {line}", localOpen:"Lokalne miejsce • Otwarte", yardSales:"{count} wyprzedaży garażowych", onlineNow:"{count} online" },
  tr: { live:"CANLI {zip}", tacos:"Taco • {line}", localOpen:"Yerel mekan • Açık", yardSales:"{count} garaj satışı", onlineNow:"{count} çevrimiçi" },
  uk: { live:"ЛАЙВ {zip}", tacos:"Такос • {line}", localOpen:"Місцеве місце • Відкрито", yardSales:"{count} гаражних розпродажів", onlineNow:"{count} онлайн" },
  el: { live:"ΖΩΝΤΑΝΑ {zip}", tacos:"Tacos • {line}", localOpen:"Τοπικό σημείο • Ανοιχτό", yardSales:"{count} πωλήσεις αυλής", onlineNow:"{count} συνδεδεμένοι" },
  he: { live:"חי {zip}", tacos:"טאקו • {line}", localOpen:"מקום מקומי • פתוח", yardSales:"{count} מכירות חצר", onlineNow:"{count} מחוברים" },
  ur: { live:"لائیو {zip}", tacos:"ٹاکو • {line}", localOpen:"مقامی جگہ • کھلا", yardSales:"{count} یارڈ سیل", onlineNow:"{count} آن لائن" },
  fa: { live:"زنده {zip}", tacos:"تاکو • {line}", localOpen:"مکان محلی • باز", yardSales:"{count} فروش حیاط", onlineNow:"{count} آنلاین" },
  ms: { live:"LIVE {zip}", tacos:"Taco • {line}", localOpen:"Tempatan • Buka", yardSales:"{count} jualan laman", onlineNow:"{count} dalam talian" },
  ro: { live:"LIVE {zip}", tacos:"Tacos • {line}", localOpen:"Loc local • Deschis", yardSales:"{count} vânzări curte", onlineNow:"{count} online" },
  cs: { live:"ŽIVĚ {zip}", tacos:"Tacos • {line}", localOpen:"Místní místo • Otevřeno", yardSales:"{count} garážových prodejů", onlineNow:"{count} online" },
  hu: { live:"ÉLŐ {zip}", tacos:"Tacos • {line}", localOpen:"Helyi hely • Nyitva", yardSales:"{count} garázsvásár", onlineNow:"{count} online" },
  fi: { live:"LIVE {zip}", tacos:"Tacos • {line}", localOpen:"Paikallinen paikka • Auki", yardSales:"{count} pihamyyntiä", onlineNow:"{count} paikalla" },
  no: { live:"LIVE {zip}", tacos:"Tacos • {line}", localOpen:"Lokalt sted • Åpent", yardSales:"{count} garasjesalg", onlineNow:"{count} online" },
  da: { live:"LIVE {zip}", tacos:"Tacos • {line}", localOpen:"Lokalt sted • Åbent", yardSales:"{count} garagesalg", onlineNow:"{count} online" },
  bg: { live:"НА ЖИВО {zip}", tacos:"Такос • {line}", localOpen:"Местно място • Отворено", yardSales:"{count} гаражни разпродажби", onlineNow:"{count} онлайн" },
  hr: { live:"UŽIVO {zip}", tacos:"Tacos • {line}", localOpen:"Lokalno mjesto • Otvoreno", yardSales:"{count} garažnih rasprodaja", onlineNow:"{count} online" },
  sr: { live:"УЖИВО {zip}", tacos:"Такос • {line}", localOpen:"Локално место • Отворено", yardSales:"{count} гаражних распродаја", onlineNow:"{count} онлајн" },
  sk: { live:"NAŽIVO {zip}", tacos:"Tacos • {line}", localOpen:"Miestne miesto • Otvorené", yardSales:"{count} garážových výpredajov", onlineNow:"{count} online" },
  sl: { live:"V ŽIVO {zip}", tacos:"Tacos • {line}", localOpen:"Lokalna točka • Odprto", yardSales:"{count} garažnih razprodaj", onlineNow:"{count} online" },
  et: { live:"OTSE {zip}", tacos:"Taco • {line}", localOpen:"Kohalik koht • Avatud", yardSales:"{count} õuemüüki", onlineNow:"{count} võrgus" },
  lv: { live:"TIEŠRAIDE {zip}", tacos:"Tako • {line}", localOpen:"Vietējā vieta • Atvērts", yardSales:"{count} pagalma izpārdošanas", onlineNow:"{count} tiešsaistē" },
  lt: { live:"GYVAI {zip}", tacos:"Tacos • {line}", localOpen:"Vietinė vieta • Atvira", yardSales:"{count} kiemo išpardavimų", onlineNow:"{count} prisijungę" },
  be: { live:"ЖЫЎЦОМ {zip}", tacos:"Такас • {line}", localOpen:"Мясцовае месца • Адчынена", yardSales:"{count} гаражных распродажаў", onlineNow:"{count} анлайн" },
  ka: { live:"ლაივი {zip}", tacos:"ტაკოს • {line}", localOpen:"ადგილობრივი ადგილი • ღიაა", yardSales:"{count} ეზოს გაყიდვა", onlineNow:"{count} ონლაინ" },
  hy: { live:"ՈՒՂԻՂ {zip}", tacos:"Տակո • {line}", localOpen:"Տեղական վայր • Բաց է", yardSales:"{count} բակի վաճառք", onlineNow:"{count} առցանց" },
  az: { live:"CANLI {zip}", tacos:"Tako • {line}", localOpen:"Yerli məkan • Açıqdır", yardSales:"{count} həyətyanı satış", onlineNow:"{count} onlayn" },
  kk: { live:"ТІКЕЛЕЙ {zip}", tacos:"Такос • {line}", localOpen:"Жергілікті орын • Ашық", yardSales:"{count} аула сатылымы", onlineNow:"{count} желіде" },
  ky: { live:"ТҮЗ {zip}", tacos:"Такос • {line}", localOpen:"Жергиликтүү жер • Ачык", yardSales:"{count} короо сатуу", onlineNow:"{count} тармакта" },
  uz: { live:"JONLI {zip}", tacos:"Tacos • {line}", localOpen:"Mahalliy joy • Ochiq", yardSales:"{count} hovli savdosi", onlineNow:"{count} onlayn" },
  tg: { live:"ЗИНДА {zip}", tacos:"Такос • {line}", localOpen:"Ҷои маҳаллӣ • Кушода", yardSales:"{count} фурӯши ҳавлӣ", onlineNow:"{count} онлайн" },
  mn: { live:"ШУУД {zip}", tacos:"Тако • {line}", localOpen:"Орон нутгийн газар • Нээлттэй", yardSales:"{count} хашааны худалдаа", onlineNow:"{count} онлайн" },
  km: { live:"ផ្ទាល់ {zip}", tacos:"តាកូ • {line}", localOpen:"កន្លែងក្នុងស្រុក • បើក", yardSales:"{count} លក់ទីធ្លា", onlineNow:"{count} អនឡាញ" },
  lo: { live:"ສົດ {zip}", tacos:"ທາໂກ້ • {line}", localOpen:"ສະຖານທີ່ທ້ອງຖິ່ນ • ເປີດ", yardSales:"{count} ຂາຍເດີ່ນບ້ານ", onlineNow:"{count} ອອນລາຍ" },
  my: { live:"တိုက်ရိုက် {zip}", tacos:"တာကို • {line}", localOpen:"ဒေသခံဆိုင် • ဖွင့်", yardSales:"{count} ခြံရောင်း", onlineNow:"{count} အွန်လိုင်း" },
}

export default function LivePulseNerve() {
  const { zip } = useLocation();
  const { language } = useLanguage();
  const d = D[language] || D.en;
  const [data, setData] = useState<PulseData | null>(null);
  const [time, setTime] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!zip) return;
    try {
      const res = await fetch(`/api/pulse?zip=${encodeURIComponent(zip)}`, {
        cache: 'no-store',
        signal
      });
      if (signal?.aborted) return;
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {}
  }, [zip]);

  useEffect(() => {
    if (!zip) return;
    const controller = new AbortController();
    abortRef.current = controller;
    load(controller.signal);
    const pulseInterval = setInterval(() => { load(controller.signal); }, 60000);
    const clockInterval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));
    }, 1000);
    setTime(new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));
    return () => {
      controller.abort();
      clearInterval(pulseInterval);
      clearInterval(clockInterval);
    };
  }, [zip, load]);

  if (!zip ||!data) return null;

  return (
    <div className="w-full bg-black/80 backdrop-blur border border-yellow-500/20 rounded-2xl p-3 flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2 shrink-0">
        <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-white font-black text-xs tracking-widest">{d.live.replace('{zip}', zip)}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">
          {data.temp}° • {data.condition}
        </span>
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">
          {data.tacoLine? d.tacos.replace('{line}', data.tacoLine) : d.localOpen}
        </span>
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">
          {d.yardSales.replace('{count}', String(data.yardSales?? 0))}
        </span>
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">
          {d.onlineNow.replace('{count}', String(data.onlineNow?? 0))}
        </span>
      </div>
      <div className="ml-auto text-zinc-400 text-xs shrink-0">{time}</div>
    </div>
  );
}
