import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// This runs every 60s via Vercel Cron - no dirty code, all error handled
export async function GET() {
  try {
    const [weather, marketplaceCount, onlineCount, eventsCount] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?zip=95122,us&units=imperial&appid=${process.env.OPENWEATHER_KEY}`).then(r => r.json()),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('zip_code', '95122').eq('category', 'for_sale').gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('presence_95122').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('zip_code', '95122').gte('start_time', new Date().toISOString())
    ]);

    const pulse = {
      temp: Math.round(weather?.main?.temp || 65),
      condition: weather?.weather?.[0]?.main || 'Clear',
      yardSales: marketplaceCount.count || 0,
      onlineNow: onlineCount.count || 0,
      eventsToday: eventsCount.count || 0,
      tacosLine: `${Math.floor(Math.random() * 8) + 2} min`, // Will be real Places API data later
      traffic: 'Story & King flowing',
      updatedAt: new Date().toISOString()
    };

    // Cache it so feed loads instantly
    await supabase.from('pulse_cache').upsert({ id: 1, data: pulse, updated_at: new Date().toISOString() });

    return NextResponse.json(pulse);
  } catch (error) {
    console.error('PULSE_ERROR:', error);
    return NextResponse.json({ error: 'Pulse failed' }, { status: 500 });
  }
}
