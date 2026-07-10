'use client'

import { useState, useRef, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function PostForm({ userId }: { userId: string }) {
  const [body, setBody] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [micStatus, setMicStatus] = useState('Click mic to speak')
  const router = useRouter()
  const recognitionRef = useRef<any>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMicStatus('Voice typing: Use Chrome or Edge')
      return
    }
    
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true // KEY FIX: Show text while you speak
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      setMicStatus('Listening... Speak now')
    }

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }
      
      // Show interim results so you see it typing LIVE
      if (interimTranscript) {
        setBody(prev => {
          // Remove old interim text and add new
          const parts = prev.split('🎤')
          return parts[0] + interimTranscript + '🎤'
        })
      }
      
      if (finalTranscript) {
        setBody(prev => {
          let newText = prev.replace('🎤', '').trim() + ' ' + finalTranscript
          newText = newText.replace(/\s+question mark\s*/gi, '? ')
          newText = newText.replace(/\s+question\s*/gi, '? ')
          newText = newText.replace(/\s+exclamation point\s*/gi, '! ')
          newText = newText.replace(/\s+exclamation\s*/gi, '! ')
          newText = newText.replace(/\s+comma\s*/gi, ', ')
          newText = newText.replace(/\s+period\s*/gi, '. ')
          newText = newText.replace(/\s+new line\s*/gi, '\n')
          newText = newText.replace(/([.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
          return newText.trimStart()
        })
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      setIsListening(false)
      if (event.error === 'not-allowed') {
        setMicStatus('Mic blocked. Click the 🔒 icon in address bar to allow')
        alert('Chrome blocked your microphone. Click the lock icon next to the URL and allow Microphone, then try again.')
      } else {
        setMicStatus('Mic error. Try again')
      }
    }
    
    recognitionRef.current.onend = () => {
      setIsListening(false)
      setMicStatus('Click mic to speak')
      setBody(prev => prev.replace('🎤', '').trim()) // Clean up interim marker
    }
  }, [])

  const toggleMic = async () => {
    if (!recognitionRef.current) {
      alert('Voice typing not supported. Use Chrome or Edge on desktop.')
      return
    }
    
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        // Force permission request
        await navigator.mediaDevices.getUserMedia({ audio: true })
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        alert('Microphone permission denied. Click the 🔒 lock icon in your address bar and allow Microphone.')
        setMicStatus('Mic blocked by browser')
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!body.trim()) return
    
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
    
    setIsPosting(true)
    
    const { error } = await supabase.from('posts').insert({
      body: body.replace('🎤', '').trim(),
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
            onClick={toggleMic}
            disabled={isPosting}
            className={`absolute right-3 top-3 p-2 rounded-full border-2 ${
              isListening 
        ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            title={isListening? 'Stop recording' : 'Start voice typing'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20">
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
            disabled={!body.replace('🎤', '').trim() || isPosting}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            {isPosting? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  )
}
