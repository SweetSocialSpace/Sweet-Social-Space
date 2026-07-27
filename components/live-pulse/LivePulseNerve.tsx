'use client';
import { useEffect, useState } from 'react';
import { useLocation } from '@/lib/location-context';

export default function LivePulseNerve() {
  const { zip } = useLocation();
  const [data, setData] = useState<any>(null);
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    if (!zip) return;
    const load = async () => {
      try { const res = await fetch(`/api/pulse?zip=${zip}`, { cache: 'no-store' }); if (res.ok) setData(await res.json()); } catch (e) { try { console.log('Pulse sleeping'); } catch {} }
    };
    load();
    const interval = setInterval(load, 60000);
    const clock = setInterval(() => { try { setTime(new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})) } catch {} }, 1000);
    return () => { try { clearInterval(interval); clearInterval(clock); } catch {} };
  }, [zip]);

  if (!zip || !data) return null;

  return (
    <div className="w-full bg-black/80 backdrop-blur border border-yellow-500/20 rounded-2xl p-3 flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2 shrink-0"><span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" /><span className="text-white font-black text-xs tracking-widest">LIVE {zip}</span></div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">{data.temp}° • {data.condition}</span>
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">{data.tacoLine ? `Tacos • ${data.tacoLine}` : `Local spot • Open`}</span>
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">{data.yardSales} yard sales</span>
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">{data.onlineNow} online now</span>
      </div>
      <div className="ml-auto text-zinc-400 text-xs shrink-0">{time}</div>
    </div>
  );
}
