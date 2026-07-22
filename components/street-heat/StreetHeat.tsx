'use client';
import { useEffect, useState } from 'react';
import { useLocation } from '@/lib/location-context';

export default function StreetHeat() {
  const { zip } = useLocation();
  const [heat, setHeat] = useState<any>(null);

  useEffect(() => {
    if (!zip) return;
    const fetchHeat = async () => {
      try {
        // GLOBAL FIX: pass real zip
        const r = await fetch(`/api/heat?zip=${zip}`, { cache: 'no-store' });
        if (r.status === 204) { setHeat(null); return; }
        if (r.ok) setHeat(await r.json());
      } catch {}
    };
    fetchHeat();
    const id = setInterval(fetchHeat, 300000);
    return () => clearInterval(id);
  }, [zip]);

  if (!zip ||!heat) return null;

  return (
    <div className="w-full bg-zinc-900 rounded-full px-4 py-2 flex items-center gap-2 border border-white/10">
      <span className="text-xs">🔥</span>
      <span className="text-white text-xs font-bold">
        {heat.street} is hottest today • {heat.count} posts
      </span>
      <span className="text-white/40 text-xs ml-auto">{heat.total} total in {zip}</span>
    </div>
  );
}
