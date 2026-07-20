// hooks/useOnlinePresence.ts
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export function useOnlinePresence() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const channel = supabase.channel('95122-presence', { config: { presence: { key: 'user' } } });
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      setCount(Object.keys(state).length);
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track({ online_at: new Date().toISOString() });
    });
    return () => { channel.unsubscribe(); };
  }, []);
  return count;
}
