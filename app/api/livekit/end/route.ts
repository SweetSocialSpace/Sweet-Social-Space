import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { postId } = body
    
    console.log('[endLive API] Received postId:', postId)
    
    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 })
    }

    const supabase = createClient()
    
    // Update ONLY the tag column (it's guaranteed to exist)
    const { data, error } = await supabase
      .from('posts')
      .update({ tag: 'live_ended' })
      .eq('id', postId)
      .select()
      .single()
    
    if (error) {
      console.error('[endLive API] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update post: ' + error.message },
        { status: 500 }
      )
    }

    console.log('[endLive API] Post updated successfully:', data?.id)
    return NextResponse.json({ ok: true, data })
  } catch (err: any) {
    console.error('[endLive API] Exception:', err)
    return NextResponse.json(
      { error: 'Server error: ' + (err?.message || String(err)) },
      { status: 500 }
    )
  }
}

