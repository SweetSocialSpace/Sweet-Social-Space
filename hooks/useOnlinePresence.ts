'use client';
import { useEffect, useState } from 'react';
import { createClient as createSSRClient } from '@/lib/supabase/client';
import { useLocation } from '@/lib/location-context';

export function useOnlinePresence() {
  const { zip } = useLocation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!zip) return; // wait for real zip, don't default to 95122 - global
    let channel: any = null
    try {
      const supabase = createSSRClient() as any
      const channelName = `${String(zip).trim()}-presence`; // GLOBAL: per-zip presence, not hardcoded 95122, any zip 2-12 chars worldwide
      channel = supabase.channel(channelName, { config: { presence: { key: 'user' } } });
      channel.on('presence', { event: 'sync' }, () => {
        try {
          const state = channel.presenceState();
          setCount(Object.keys(state).length);
        } catch {}
      }).subscribe(async (status: string) => {
        try {
          if (status === 'SUBSCRIBED') await channel.track({ online_at: new Date().toISOString() });
        } catch {}
      });
    } catch {
      // house never dies - presence optional
    }
    return () => { try { channel?.unsubscribe(); } catch {} };
  }, [zip]);
  return count;
}
