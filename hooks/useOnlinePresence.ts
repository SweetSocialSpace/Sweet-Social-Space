// hooks/useOnlinePresence.ts
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useLocation } from '@/lib/location-context';

export function useOnlinePresence() {
  const { zip } = useLocation();
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!zip) return; // wait for real zip, don't default to 95122
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const channelName = `${zip}-presence`; // GLOBAL: per-zip presence, not hardcoded 95122
    const channel = supabase.channel(channelName, { config: { presence: { key: 'user' } } });
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      setCount(Object.keys(state).length);
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track({ online_at: new Date().toISOString() });
    });
    return () => { channel.unsubscribe(); };
  }, [zip]);
  return count;
}
