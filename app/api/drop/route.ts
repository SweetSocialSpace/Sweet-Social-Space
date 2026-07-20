import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const DROPS = [
  { business: 'Tacos El Jefe 95122', deal: '$2 Tacos Today', address: 'Near King Rd' },
  { business: 'Joys Auto Repair', deal: 'Free Brake Check', address: 'Story Rd' },
  { business: 'La Esperanza Market', deal: '$5 Aguas Frescas', address: '95122' },
];

export async function GET() {
  try {
    const day = new Date().getDate();
    const todays = DROPS[day % DROPS.length];
    return NextResponse.json({...todays, time: new Date().toISOString() });
  } catch {
    return NextResponse.json(DROPS[0]);
  }
}
