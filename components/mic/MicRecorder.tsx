'use client'
import { useRef, useState } from 'react'
import { smartPunctuate } from './smartPunctuate'

export default function MicRecorder({ value, onChange }: { value: string, onChange: (v: string)=>void }) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const baseTextRef = useRef('')

  const stopMic = () => {
    const rec = recognitionRef.current
    if (rec) {
      try { rec.stop() } catch {}
    }
    setIsListening(false)
  }

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Use Chrome - mic needs it"); return }

    if (isListening) {
      stopMic()
      // Apply SMART when you stop talking
      const fixed = smartPunctuate(value)
      onChange(fixed + ' ')
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
        const transcript = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += transcript + ' '
        else interimText += transcript + ' '
      }
      const combined = (baseTextRef.current + ' ' + finalText + interimText).trim()
      onChange(combined)
    }

    recog.start()
  }

  return (
    <div className="w-full">
      <textarea
        value={value}
        onFocus={stopMic}
        onChange={e => onChange(e.target.value)}
        placeholder="Tap mic and talk — I keep everything, even when you pause..."
        className="w-full min-h- text-black p-3 border border-black/10 rounded-xl outline-none resize-none"
      />
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={toggleMic}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-xl shadow border ${isListening? 'bg-red-600 border-red-700 animate-pulse text-white' : 'bg-black border-black text-white'}`}
        >
          {isListening? '■' : '🎤'}
        </button>
        <button
          type="button"
          onClick={()=> onChange(smartPunctuate(value) + ' ')}
          className="text-xs bg-black text-white rounded-full px-4 py-1.5 font-bold"
        >
          ✨ Fix punctuation
        </button>
      </div>
    </div>
  )
}
