'use client';
import { useEffect, useState } from 'react';

// This component can NEVER crash your feed. If it fails, it shows nothing.
export default function LivePulseNerve() {
  const [data, setData] = useState<any>(null);
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/pulse', { cache: 'no-store' });
        if (res.ok) setData(await res.json());
      } catch (e) {
        // Fail silently - never break vertebrae
        console.log('Pulse sleeping');
      }
    };
    load();
    const interval = setInterval(load, 60000); // auto every 60s
    const clock = setInterval(() => setTime(new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})), 1000);
    return () => { clearInterval(interval); clearInterval(clock); };
  }, []);

  if (!data) return null; // If no data, show nothing - don't break feed

  return (
    <div className="w-full bg-black/80 backdrop-blur border border-yellow-500/20 rounded-2xl p-3 flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2 shrink-0">
        <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-white font-black text- tracking-widest">LIVE 95122</span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">{data.temp}° • {data.condition}</span>
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">Tacos El Jefe • {data.tacoLine}</span>
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">{data.yardSales} yard sales</span>
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">{data.onlineNow} online now</span>
      </div>
      <div className="ml-auto text-zinc-400 text- shrink-0">{time}</div>
    </div>
  );
}
