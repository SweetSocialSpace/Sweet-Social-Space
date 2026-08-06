import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RoomServiceClient } from 'livekit-server-sdk'

export async function POST(req: NextRequest) {
  try {
    const { postId, roomName } = await req.json()
    console.log('[endLive] ending stream', postId, roomName)
    if (!postId) return NextResponse.json({ error: 'Missing postId' }, { status: 400 })

    const supabase = createClient()

    const { data: post } = await supabase.from('posts').select('livekit_room, zip_code, city').eq('id', postId).single()

    // Kill LiveKit room first
    const roomToDelete = post?.livekit_room || roomName
    if (roomToDelete && process.env.LIVEKIT_API_KEY) {
      try {
        const svc = new RoomServiceClient(
          process.env.LIVEKIT_URL!,
          process.env.LIVEKIT_API_KEY!,
          process.env.LIVEKIT_API_SECRET!
        )
        await svc.deleteRoom(roomToDelete)
        console.log('[endLive] room deleted', roomToDelete)
      } catch (e) { console.log('[endLive] room delete skipped', e) }
    }

    // Mark as ended in DB - client will upload video and update with URL
    const { error } = await supabase.from('posts').update({
      tag: 'live_ended',
      // The video URL will be set by the client after upload
      // Keep existing body but it will be updated by client to show "Was Live"
    }).eq('id', postId)

    if (error) {
      console.error('[endLive] DB update failed', error)
      throw error
    }

    console.log('[endLive] stream ended successfully', postId)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[endLive] failed', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
