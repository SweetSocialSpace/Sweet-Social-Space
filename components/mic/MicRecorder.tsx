'use client'
import { useRef, useState } from 'react'

type Props = {
  onTranscript: (text: string) => void
  onFinalTranscript?: (text: string) => void
}

export default function MicRecorder({ onTranscript, onFinalTranscript }: Props) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const finalTextRef = useRef('')

  const toggleMic = () => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) {
      alert('Mic not supported in this browser. Use Chrome on desktop / Android.')
      return
    }

    // If already listening, stop it
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
      return
    }

    const rec = new SR()
    recognitionRef.current = rec
    rec.continuous = true // THIS is the fix - keeps listening through pauses
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onstart = () => {
      setListening(true)
      finalTextRef.current = ''
    }

    rec.onend = () => {
      setListening(false)
      if (finalTextRef.current && onFinalTranscript) {
        onFinalTranscript(finalTextRef.current)
      }
    }

    rec.onresult = (e: any) => {
      let interim = ''
      let final = ''

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript
        if (e.results[i].isFinal) {
          final += transcript + ' '
        } else {
          interim += transcript
        }
      }

      if (final) {
        finalTextRef.current += final
      }

      // Send the live combined text back to Create Post
      const combined = (finalTextRef.current + interim).trim()
      onTranscript(combined)
    }

    rec.onerror = (err: any) => {
      console.error('Mic error', err)
      setListening(false)
    }

    rec.start()
  }

  return (
    <button
      type="button"
      onClick={toggleMic}
      className={`h-12 w-12 rounded-full flex items-center justify-center border-2 border-black shrink-0 ${
        listening? 'bg-red-600 text-white animate-pulse' : 'bg-black text-white'
      }`}
      title={listening? 'Tap to stop' : 'Tap to speak'}
    >
      🎤
    </button>
  )
}
