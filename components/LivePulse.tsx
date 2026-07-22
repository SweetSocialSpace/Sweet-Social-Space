'use client';
import { useEffect, useState } from 'react';
import { useLocation } from '@/lib/location-context';

type Pulse = {
  temp: number; condition: string; onlineCount: number;
  yardSales: number; tacoLine: string; traffic: string; giantsVibe: string;
};

export default function LivePulse() {
  const { zip, city } = useLocation();
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [time, setTime] = useState(new Date());
  const displayZip = zip || 'YOUR BLOCK';

  useEffect(() => {
    const fetchPulse = async () => {
      if (!zip) return;
      const res = await fetch(`/api/pulse?zip=${zip}`);
      if (res.ok) setPulse(await res.json());
    };
    fetchPulse();
    const pulseInterval = setInterval(fetchPulse, 60000);
    const timeInterval = setInterval(() => setTime(new Date()), 1000);
    return () => { clearInterval(pulseInterval); clearInterval(timeInterval); };
  }, [zip]);

  if (!pulse) return (
    <div className="w-full bg-black border border-yellow-500/20 rounded-2xl p-3 flex items-center gap-3">
      <span className="text-white font-black text-xs tracking-widest">LIVE IN {displayZip}</span>
      <span className="text-zinc-400 text-xs animate-pulse">Loading your block...</span>
    </div>
  );

  const items = [
    `${pulse.temp}° • ${pulse.condition}`,
    `Tacos El Jefe • ${pulse.tacoLine} line`,
    `${pulse.yardSales} yard sales happening`,
    `Giants ${pulse.giantsVibe}`,
    `${pulse.onlineCount} neighbors online`,
    `Traffic: ${pulse.traffic}`,
  ];

  return (
    <div className="w-full bg-black border border-yellow-500/20 rounded-2xl p-3 flex items-center gap-3 overflow-hidden">
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="text-white font-black text-xs tracking-widest">LIVE IN {displayZip}{city ? ` • ${city}` : ''}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {items.map((t, i) => (
          <span key={i} className="shrink-0 bg-zinc-800 text-zinc-200 text-xs px-3 py-1.5 rounded-full border border-zinc-700">
            {t}
          </span>
        ))}
      </div>
      <div className="ml-auto text-zinc-400 text-xs shrink-0">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ALIVE
      </div>
    </div>
  );
}
