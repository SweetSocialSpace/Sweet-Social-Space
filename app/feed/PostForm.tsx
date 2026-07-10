'use client'

import { useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function PostForm({ userId }: { userId: string }) {
  const [body, setBody] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [micStatus, setMicStatus] = useState('Click mic to speak')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicStatus('Recording... Click again to stop')
      setIsRecording(true)
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        setIsRecording(false)
        setMicStatus('Transcribing with ElevenLabs...')
        
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('audio', audioBlob)

        try {
          const res = await fetch('/api/transcribe-elevenlabs', {
            method: 'POST',
            body: formData,
          })
          const data = await res.json()
          if (data.text) {
            setBody(prev => prev + data.text + ' ')
          }
          setMicStatus('Click mic to speak')
        } catch (err) {
          setMicStatus('Failed. Check API key. Try again.')
        }
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
    } catch (err) {
      alert('Microphone blocked. Click the lock icon in your address bar and allow Microphone.')
      setMicStatus('Mic blocked by browser')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!body.trim()) return
    
    if (isRecording) stopRecording()
    setIsPosting(true)
    
    const { error } = await supabase.from('posts').insert({
      body: body.trim(),
      user_id: userId,
      post_type: 'text',
      is_anonymous: false,
      city: 'San Jose',
      zip_code: '95122'
    })

    setIsPosting(false)
    if (error) {
      alert('Error posting: ' + error.message)
      return
    }

    setBody('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="border rounded-lg p-4 bg-white shadow">
        <div className="relative">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's happening in San Jose?"
            className="w-full p-3 pr-14 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            disabled={isPosting}
          />
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isPosting}
            className={`absolute right-3 top-3 p-2 rounded-full border-2 ${
              isRecording 
        ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            title={isRecording? 'Stop recording' : 'Start voice recording'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-gray-500">
            {micStatus}
          </div>
          <button
            type="submit"
            disabled={!body.trim() || isPosting}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            {isPosting? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  )
}
