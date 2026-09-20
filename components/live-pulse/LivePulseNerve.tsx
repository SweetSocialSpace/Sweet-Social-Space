'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from '@/lib/location-context';

type PulseData = {
  temp?: number;
  condition?: string;
  tacoLine?: string;
  yardSales?: number;
  onlineNow?: number;
}

export default function LivePulseNerve() {
  const { zip } = useLocation();
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
    } catch {
      // fail silently in production - no console.log
    }
  }, [zip]);

  useEffect(() => {
    if (!zip) return;
    
    const controller = new AbortController();
    abortRef.current = controller;

    load(controller.signal);
    
    const pulseInterval = setInterval(() => {
      load(controller.signal);
    }, 60000);
    
    const clockInterval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));
    }, 1000);
    
    // Set initial time
    setTime(new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));

    return () => {
      controller.abort();
      clearInterval(pulseInterval);
      clearInterval(clockInterval);
    };
  }, [zip, load]);

  if (!zip || !data) return null;

  return (
    <div className="w-full bg-black/80 backdrop-blur border border-yellow-500/20 rounded-2xl p-3 flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2 shrink-0">
        <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-white font-black text-xs tracking-widest">LIVE {zip}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">
          {data.temp}° • {data.condition}
        </span>
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">
          {data.tacoLine ? `Tacos • ${data.tacoLine}` : `Local spot • Open`}
        </span>
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">
          {data.yardSales} yard sales
        </span>
        <span className="shrink-0 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full">
          {data.onlineNow} online now
        </span>
      </div>
      <div className="ml-auto text-zinc-400 text-xs shrink-0">{time}</div>
    </div>
  );
}
