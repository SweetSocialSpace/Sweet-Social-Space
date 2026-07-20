'use client';
import { useEffect, useState } from 'react';

export default function ProximityPing() {
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
    const interval = setInterval(fetchPing, 60000); // checks every minute - automated
    return () => clearInterval(interval);
  }, []);

  if (!ping) return null;

  return (
    <div className="w-full bg-blue-600/90 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2 border border-white/20 animate-pulse">
      <span className="text-xs">🔵</span>
      <span className="text-white text-xs font-black">
        {ping.count} new post{ping.count > 1? 's' : ''} near {ping.street} in last 60m
      </span>
    </div>
  );
}
