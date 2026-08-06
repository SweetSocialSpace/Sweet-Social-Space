import { NextRequest, NextResponse } from 'next/server'
import { EgressClient } from 'livekit-server-sdk'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { egressId, postId, roomName } = await req.json()
    
    // Stop LiveKit egress if configured
    if (process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET && process.env.LIVEKIT_URL && egressId) {
      try {
        const egressClient = new EgressClient(process.env.LIVEKIT_URL, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET)
        await egressClient.stopEgress(egressId)
        console.log('LiveKit egress stopped:', egressId)
      } catch (error) {
        console.error('Error stopping LiveKit egress:', error)
      }
    }
    
    // Update post to mark as ended - video URL will be set by client-side recording
    if (postId) {
      const supabase = createClient()
      try {
        // Mark as ended - client will upload video and update with URL
        await supabase.from('posts').update({ 
          tag: 'live_ended',
          // The video URL will be updated by the client after upload
        }).eq('id', postId)
        console.log('Post marked as ended:', postId)
      } catch (error) {
        console.error('Error updating post:', error)
      }
    }
    
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Error in egress stop:', err)
    return NextResponse.json({ ok: true, error: err.message })
  }
}
