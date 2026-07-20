import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    temp: 74,
    condition: 'Sunny 95122',
    online: Math.floor(12 + Math.random() * 20),
    time: new Date().toISOString(),
  });
}
