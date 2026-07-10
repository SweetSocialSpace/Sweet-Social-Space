import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const audioFile = formData.get('audio') as File
  
  if (!audioFile) {
    return NextResponse.json({ error: 'No audio' }, { status: 400 })
  }

  // ElevenLabs Scribe v2 - same as Lovable uses
  const elevenLabsFormData = new FormData()
  elevenLabsFormData.append('file', audioFile)
  elevenLabsFormData.append('model_id', 'scribe_v1')
  elevenLabsFormData.append('tag_audio_events', 'true')
  elevenLabsFormData.append('language_code', 'eng')
  elevenLabsFormData.append('diarize', 'false')

  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
    },
    body: elevenLabsFormData,
  })

  const data = await response.json()
  return NextResponse.json({ text: data.text || '' })
}
