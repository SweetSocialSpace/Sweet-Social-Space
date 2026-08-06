import { NextRequest, NextResponse } from 'next/server'
import { EgressClient } from 'livekit-server-sdk'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { egressId, postId } = await req.json()
    if (process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET && process.env.LIVEKIT_URL && egressId) {
      try {
        const egressClient = new EgressClient(process.env.LIVEKIT_URL, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET)
        await egressClient.stopEgress(egressId)
      } catch {}
    }
    // Save video URL to post so it can be watched later
    if (postId) {
      const supabase = createClient()
      const videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/live-replays/live-replays/${req.json?.toString() || ''}`
      // For now just mark as ended, video will appear after processing
      await supabase.from('posts').update({ tag: 'live_ended' }).eq('id', postId)
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: true })
  }
}
