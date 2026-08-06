import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json(
        { error: 'Missing postId' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from('posts')
      .update({
        tag: 'live_ended',
        ended_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .select()
      .single()

    if (error) {
      console.error('End live update error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, data })
  } catch (err: any) {
    console.error('End live exception:', err)
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    )
  }
}
