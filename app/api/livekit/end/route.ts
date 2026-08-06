import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RoomServiceClient } from 'livekit-server-sdk'

export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json()
    console.log('[endLive] killing', postId)
    if (!postId) return NextResponse.json({ error: 'Missing postId' }, { status: 400 })

    const supabase = createClient()

    const { data: post } = await supabase.from('posts').select('livekit_room').eq('id', postId).single()

    // Kill LiveKit room first
    if (post?.livekit_room && process.env.LIVEKIT_API_KEY) {
      try {
        const svc = new RoomServiceClient(
          process.env.LIVEKIT_URL!,
          process.env.LIVEKIT_API_KEY!,
          process.env.LIVEKIT_API_SECRET!
        )
        await svc.deleteRoom(post.livekit_room)
        console.log('[endLive] room deleted', post.livekit_room)
      } catch (e) { console.log('[endLive] room delete skipped', e) }
    }

    // Mark as ended in DB - THIS is what makes feed say "Was Live"
    const { error } = await supabase.from('posts').update({
      tag: 'live_ended',
      // keep body but add ended note
    }).eq('id', postId)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[endLive] failed', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
