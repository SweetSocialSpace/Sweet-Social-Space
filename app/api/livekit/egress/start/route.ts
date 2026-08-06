import { NextRequest, NextResponse } from 'next/server'
import { EgressClient, EncodedFileOutput, EncodedFileType } from 'livekit-server-sdk'

export async function POST(req: NextRequest) {
  try {
    const { roomName } = await req.json()
    if (!process.env.LIVEKIT_API_KEY ||!process.env.LIVEKIT_API_SECRET ||!process.env.LIVEKIT_URL) {
      return NextResponse.json({ egressId: null, message: 'LiveKit not configured' })
    }
    const egressClient = new EgressClient(process.env.LIVEKIT_URL, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET)

    const fileOutput = new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
     filepath: `videos/${roomName}.mp4`,
      output: {
        case: 's3',
        value: {
          accessKey: process.env.S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || '',
          secret: process.env.S3_SECRET || process.env.AWS_SECRET_ACCESS_KEY || '',
         bucket: process.env.S3_BUCKET || 'videos',
          region: process.env.S3_REGION || 'us-east-1',
          endpoint: process.env.S3_ENDPOINT || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/s3`,
          forcePathStyle: true,
        }
      } as any
    })

    const info = await egressClient.startRoomCompositeEgress(roomName, { fileOutputs: [fileOutput] } as any)
    return NextResponse.json({ egressId: info.egressId })
  } catch (err: any) {
    console.log('Egress start error', err.message)
    return NextResponse.json({ egressId: null, error: err.message })
  }
}
