import { NextRequest, NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { roomName, participantName, role = 'viewer' } = body

    if (!roomName || !participantName) {
      return NextResponse.json({ error: 'Missing roomName or participantName' }, { status: 400 })
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json({ error: 'LiveKit not configured' }, { status: 500 })
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    })

    const isHost = role === 'host'

    if (isHost) {
      // HOST = broadcaster only (can publish camera + mic)
      at.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      })
    } else {
      // VIEWER = watch only (NO camera, NO mic, NO publishing)
      at.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: false,
        canSubscribe: true,
        canPublishData: false,
        hidden: true, // viewers don't show up as broadcasters
      })
    }

    const token = await at.toJwt()

    return NextResponse.json({ token, url: livekitUrl })
  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}
