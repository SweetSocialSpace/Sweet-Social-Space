import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  // 100% automated - no supabaseKey at build time - safe
  try {
    return NextResponse.json({
      temp: 74,
      condition: 'Sunny',
      online: Math.floor(10 + Math.random() * 25),
      time: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ temp: 70, condition: 'Clear', online: 12 });
  }
}
