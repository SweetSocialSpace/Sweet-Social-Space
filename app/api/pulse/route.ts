// app/api/pulse/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db' // your drizzle/prisma/supabase

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get('zip')
  const count = await db.post.count({ where: { zip, createdAt: { gte: new Date(Date.now() - 24*60*60*1000) } } })
  return NextResponse.json({ count })
}
