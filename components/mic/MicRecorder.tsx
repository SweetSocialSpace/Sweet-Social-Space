'use client'
import { useRef, useState, useEffect } from 'react'

export default function MicRecorder({ value, onChange }: { value: string, onChange: (v: string)=>void }) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const baseRef = useRef('')
  const finalAccumRef = useRef('')

  const stopMic = () => {
    const rec = recognitionRef.current
    if (rec) { try { rec.stop() } catch {} }
  }

  useEffect(()=>{
    ;(window as any).__stopMic = stopMic
    return ()=>{ delete (window as any).__stopMic }
  }, [])

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Use Chrome"); return }

    if (isListening) {
      stopMic()
      setIsListening(false)
      return
    }

    baseRef.current = value.trim()
    finalAccumRef.current = ''
    const recog = new SR()
    recognitionRef.current = recog
    recog.continuous = true
    recog.interimResults = true
    recog.lang = 'en-US'

    recog.onstart = () => setIsListening(true)
    recog.onend = () => setIsListening(false)

    recog.onresult = (e: any) => {
      let allFinal = ''
      let interim = ''
      // Loop through ALL results, not just from resultIndex - this prevents deletion on pause
      for (let i = 0; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript
        if (e.results[i].isFinal) allFinal += transcript + ' '
        else interim += transcript
      }
      finalAccumRef.current = allFinal.trim()
      const base = baseRef.current
      const combined = [base, finalAccumRef.current, interim].filter(Boolean).join(' ').replace(/\s+/g,' ').trim()
      onChange(combined)
    }

    recog.start()
  }

  return (
    <button
      type="button"
      onClick={toggleMic}
      className={`h-10 w-10 rounded-full flex items-center justify-center text-lg border-2 shadow ${isListening? 'bg-red-600 border-red-700 animate-pulse text-white' : 'bg-white border-black text-black hover:bg-gray-100'}`}
    >
      {isListening? '■' : '🎤'}
    </button>
  )
}
