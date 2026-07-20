// app/api/pulse/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PulseData = {
  temp: number;
  condition: string;
  onlineCount: number;
  yardSales: number;
  tacoLine: string;
  traffic: string;
  giantsVibe: string;
  timestamp: string;
};

export async function GET() {
  try {
    // In production, replace these with real calls
    // 1. Weather: OpenWeatherMap for 95122
    // 2. Online: Supabase presence count
    // 3. Yard Sales: count from your posts table where type='yard_sale' and is_active=true
    // 4. Taco line, traffic = crowd-sourced from last 5 posts + AI
    
    const data: PulseData = {
      temp: 73,
      condition: 'Sunny',
      onlineCount: Math.floor(12 + Math.random() * 18), // Replace with real presence
      yardSales: 2, // Replace with: await supabase.from('posts').count()
      tacoLine: '5 min',
      traffic: 'Story Rd moving',
      giantsVibe: 'Loud at Story & King',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('[PULSE_API_ERROR]', error);
    return NextResponse.json({ error: 'Pulse offline' }, { status: 500 });
  }
}
