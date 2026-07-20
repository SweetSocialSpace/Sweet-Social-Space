'use client';
import { useEffect, useState } from 'react';

export default function StreetHeat() {
  const [heat, setHeat] = useState<any>(null);

  useEffect(() => {
    const fetchHeat = async () => {
      try {
        const r = await fetch('/api/heat', { cache: 'no-store' });
        if (r.status === 204) { setHeat(null); return; }
        if (r.ok) setHeat(await r.json());
      } catch {}
    };
    fetchHeat();
    const id = setInterval(fetchHeat, 300000); // auto-updates every 5 min
    return () => clearInterval(id);
  }, []);

  if (!heat) return null;

  return (
    <div className="w-full bg-zinc-900 rounded-full px-4 py-2 flex items-center gap-2 border border-white/10">
      <span className="text-xs">🔥</span>
      <span className="text-white text-xs font-bold">
        {heat.street} is hottest today • {heat.count} posts
      </span>
      <span className="text-white/40 text- ml-auto">{heat.total} total in 95122</span>
    </div>
  );
}
