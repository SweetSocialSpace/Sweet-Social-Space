'use client'
import { useRef, useState, useEffect } from 'react'

export default function MicRecorder({ value, onChange }: { value: string, onChange: (v: string)=>void }) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const baseTextRef = useRef('')

  const stopMic = () => {
    const rec = recognitionRef.current
    if (rec) { try { rec.stop() } catch {} }
    setIsListening(false)
  }

  // Let FeedCenter stop us when POST is clicked
  useEffect(()=>{
    ;(window as any).__stopMic = stopMic
    return ()=>{ delete (window as any).__stopMic }
  }, [])

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Use Chrome - mic needs it"); return }

    if (isListening) {
      stopMic()
      return
    }

    baseTextRef.current = value
    const recog = new SR()
    recognitionRef.current = recog
    recog.continuous = true
    recog.interimResults = true
    recog.lang = 'en-US'
    recog.onstart = () => setIsListening(true)
    recog.onend = () => setIsListening(false)
    recog.onresult = (e: any) => {
      let finalText = ''
      let interimText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += t + ' '
        else interimText += t + ' '
      }
      const combined = (baseTextRef.current + ' ' + finalText + interimText).trim()
      onChange(combined)
    }
    recog.start()
  }

  return (
    <button
      type="button"
      onClick={toggleMic}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-lg shadow border-2 ${isListening? 'bg-red-600 border-red-700 animate-pulse text-white' : 'bg-white border-black text-black hover:bg-gray-100'}`}
      title={isListening? 'Stop' : 'Tap to talk'}
    >
      {isListening? '■' : '🎤'}
    </button>
  )
}
