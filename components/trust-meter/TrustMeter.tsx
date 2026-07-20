'use client';
import { useEffect, useState } from 'react';

export default function TrustMeter() {
  const [trust, setTrust] = useState<any>(null);

  useEffect(() => {
    const fetchTrust = async () => {
      try {
        const r = await fetch('/api/trust', { cache: 'no-store' });
        if (r.status === 204) { setTrust(null); return; }
        if (r.ok) setTrust(await r.json());
      } catch {}
    };
    fetchTrust();
    const id = setInterval(fetchTrust, 300000); // auto-updates every 5 min
    return () => clearInterval(id);
  }, []);

  if (!trust) return null;

  return (
    <div className="w-full bg-zinc-900 rounded-2xl p-3 border border-white/10 flex items-center gap-3">
      <div className="text-xs">🛡️</div>
      <div className="flex-1">
        <div className="text-white text-xs font-black">{trust.percent}% Verified • 95122</div>
        <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${trust.percent}%` }} />
        </div>
      </div>
      <div className="text-white/50 text-">{trust.verified}/{trust.total}</div>
    </div>
  );
}
