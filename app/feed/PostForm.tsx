'use client'

import { useState, useRef, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function PostForm({ userId }: { userId: string }) {
  const [body, setBody] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const router = useRouter()
  const recognitionRef = useRef<any>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          }
        }
        if (finalTranscript) {
          setBody(prev => {
            let newText = prev + finalTranscript
            newText = newText.replace(/\s+question\s*$/i, '? ')
            newText = newText.replace(/\s+exclamation\s*$/i, '! ')
            newText = newText.replace(/\s+comma\s*$/i, ', ')
            newText = newText.replace(/\s+period\s*$/i, '. ')
            newText = newText.replace(/([.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
            return newText.trimStart()
          })
        }
      }

      recognitionRef.current.onerror = () => setIsListening(false)
      recognitionRef.current.onend = () => setIsListening(false)
    }
  }, [])

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Voice typing not supported. Use Chrome or Edge.')
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
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
            className="w-full p-2 pr-12 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isPosting}
          />
          <button
            type="button"
            onClick={toggleMic}
            disabled={isPosting}
            className={`absolute right-2 top-2 p-2 rounded-full ${
              isListening 
          ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            title={isListening? 'Stop recording' : 'Start voice typing'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-500">
            {isListening && 'Listening... Say "period", "question", "comma" for punctuation'}
          </div>
          <button
            type="submit"
            disabled={!body.trim() || isPosting}
            className="bg-blue-500 text-white px-4 py-2 rounded font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isPosting? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  )
}
