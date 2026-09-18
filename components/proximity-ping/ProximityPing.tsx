'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from '@/lib/translations'

export default function ProximityPing() {
  const [ping, setPing] = useState<any>(null);
  const t = useTranslations() as any

  useEffect(() => {
    const fetchPing = async () => {
      try {
        const r = await fetch('/api/ping', { cache: 'no-store' });
        if (r.status === 204) { setPing(null); return; }
        if (r.ok) setPing(await r.json());
      } catch {}
    };
    fetchPing();
    const interval = setInterval(fetchPing, 60000);
    return () => { try { clearInterval(interval) } catch {} }
  }, []);

  if (!ping) return null;

  return (
    <div className="w-full bg-blue-600/90 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2 border border-white/20 animate-pulse">
      <span className="text-xs">🔵</span>
      <span className="text-white text-xs font-black">{ping.count} {ping.count > 1 ? t?.ping?.newPosts : t?.ping?.newPost} {t?.ping?.near} {ping.street} {t?.ping?.last60}</span>
    </div>
  );
}
