'use client';
import { useEffect, useState } from 'react';

function ErrorCage({ children }: { children: React.ReactNode }) {
  const [crashed, setCrashed] = useState(false);
  useEffect(() => {
    const handler = () => setCrashed(true);
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);
  if (crashed) return null;
  return <>{children}</>;
}

export default function LivePulse() {
  const [pulse, setPulse] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/pulse', { cache: 'no-store' });
        if (r.ok) setPulse(await r.json());
      } catch {}
    };
    load();
    const id = setInterval(load, 300000); // 5 min auto
    return () => clearInterval(id);
  }, []);

  if (!pulse) return null;

  return (
    <ErrorCage>
      <div className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
        <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-white font-black text-">LIVE 95122</span>
        <div className="flex gap-2 overflow-x-auto text-xs text-white/80">
          <span className="bg-white/10 px-3 py-1 rounded-full">{pulse.temp}° {pulse.condition}</span>
          <span className="bg-white/10 px-3 py-1 rounded-full">{pulse.online} online</span>
        </div>
      </div>
    </ErrorCage>
  );
}
