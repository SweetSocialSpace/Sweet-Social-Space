'use client';
import { useEffect, useState } from 'react';
import { useLocation } from '@/lib/location-context';

export default function TheDrop() {
  const { zip } = useLocation();
  const [drop, setDrop] = useState<any>(null);
  
  useEffect(() => {
    (async () => {
      try {
        // Try nationwide drop for this zip first, then fallback to general
        let r = await fetch(`/api/drop?zip=${zip}`, { cache: 'no-store' });
        if (r.status === 204 || !r.ok) {
          r = await fetch('/api/drop', { cache: 'no-store' });
        }
        if (r.status === 204) return;
        if (r.ok) setDrop(await r.json());
      } catch {}
    })();
  }, [zip]);

  if (!drop) return (
    <div className="w-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 border border-white/20 flex justify-between items-center">
      <div>
        <div className="text- font-black text-black/70 tracking-widest">
          THE DROP • TODAY 10AM • {zip}
        </div>
        <div className="text-white font-black text-sm mt-1">Loading today's drop...</div>
        <div className="text-white/80 text-xs">Live in {zip} • Auto-refresh</div>
      </div>
      <div className="bg-black text-white rounded-full px-4 py-2 text-xs font-black">LIVE</div>
    </div>
  );

  return (
    <div className="w-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 border border-white/20 flex justify-between items-center">
      <div>
        <div className="text- font-black text-black/70 tracking-widest">
          {drop.isSpotlight ? `SPOTLIGHT • TODAY • ${zip}` : `THE DROP • TODAY 10AM • ${zip}`}
        </div>
        <div className="text-white font-black text-sm mt-1">{drop.business}</div>
        <div className="text-white/80 text-xs">{drop.deal} • {drop.address || zip}</div>
      </div>
      <div className="bg-black text-white rounded-full px-4 py-2 text-xs font-black">VIEW</div>
    </div>
  );
}
