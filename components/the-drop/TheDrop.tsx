'use client';
import { useEffect, useState } from 'react';

export default function TheDrop() {
  const [drop, setDrop] = useState<any>(null);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/drop', { cache: 'no-store' });
        if (r.status === 204) return;
        if (r.ok) setDrop(await r.json());
      } catch {}
    })();
  }, []);
  if (!drop) return null;
  return (
    <div className="w-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 border border-white/20 flex justify-between items-center">
      <div>
        <div className="text- font-black text-black/70 tracking-widest">
          {drop.isSpotlight? 'SPOTLIGHT • TODAY • 95122' : 'THE DROP • TODAY 10AM • 95122'}
        </div>
        <div className="text-white font-black text-sm mt-1">{drop.business}</div>
        <div className="text-white/80 text-xs">{drop.deal} • {drop.address}</div>
      </div>
      <div className="bg-black text-white rounded-full px-4 py-2 text-xs font-black">VIEW</div>
    </div>
  );
}
