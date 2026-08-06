import { NextRequest, NextResponse } from 'next/server'
import { EgressClient, EncodedFileOutput } from 'livekit-server-sdk'

export async function POST(req: NextRequest) {
  const { roomName, postId } = await req.json()
  const egress = new EgressClient(process.env.LIVEKIT_URL!, process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!)

  const output = new EncodedFileOutput({
    fileType: 2, // MP4
    filepath: `replays/${roomName}.mp4`,
    s3: {
      accessKey: process.env.S3_ACCESS_KEY!,
      secret: process.env.S3_SECRET!,
      bucket: process.env.S3_BUCKET!,
      region: 'us-west-2'
    }
  })

  const info = await egress.startRoomCompositeEgress(roomName, { fileOutputs: [output] })
  return NextResponse.json({ egressId: info.egressId })
}
