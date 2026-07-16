'use client'
import { useRef, useState, useEffect } from 'react'
import { smartPunctuate } from './smartPunctuate'

export default function MicRecorder({ value, onChange }: { value: string, onChange: (v: string)=>void }) {
  const [isListening, setIsListening] = useState(false)
  const savedRef = useRef('')
  const finalRef = useRef('')

  // STOP mic if user starts typing — this fixes your "still recording while texting"
  useEffect(()=>{
    if(isListening && value!== savedRef.current + finalRef.current){
      // user typed
    }
  },[value])

  const stopMic = () => {
    ;(window as any)._keepListening = false
    try{ ;(window as any)._recog?.stop() }catch{}
    setIsListening(false)
  }

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Use Chrome — mic needs it"); return }
    if (isListening) {
      stopMic()
      const f = smartPunctuate(value)
      savedRef.current = f
      onChange(f + ' ')
      finalRef.current = ''
      return
    }
    savedRef.current = value
    finalRef.current = ''
    ;(window as any)._keepListening = true
    const recog = new SR()
    ;(window as any)._recog = recog
    recog.continuous = true
    recog.interimResults = true
    recog.lang = 'en-US'
    recog.onstart = () => setIsListening(true)
    recog.onend = () => { if ((window as any)._keepListening) { try{recog.start()}catch{} } }
    recog.onresult = (e:any) => {
      let interim = ''
      for (let i=e.resultIndex; i<e.results.length; i++) {
        const txt = e.results[i][0].transcript
        if (e.results[i].isFinal) finalRef.current += txt + ' '
        else interim += txt + ' '
      }
      onChange(savedRef.current + (savedRef.current?' ':'') + finalRef.current + interim)
    }
    recog.start()
  }

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          value={value}
          onFocus={stopMic} // <-- FIX: stops mic when you tap to type
          onChange={e=>{ savedRef.current=e.target.value; onChange(e.target.value) }}
          placeholder="Tap mic and talk — I keep everything, even when you pause..."
          rows={6}
          className="w-full rounded- border-2 border-black/10 bg-[#fefefe] p-5 pr-16 text- leading-6 text-black placeholder:text-black/40 outline-none focus:border-black/20 resize-none shadow-inner"
        />
        <button
          type="button"
          onClick={toggleMic}
          className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text- shadow-lg border transition-all ${isListening?'bg-red-600 border-red-700 animate-pulse text-white':'bg-black border-black text-white hover:scale-105'}`}
        >
          {isListening?'■':'🎤'}
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className={`text- font-semibold ${isListening?'text-red-600 animate-pulse':'text-black/60'}`}>
          {isListening?'🔴 Listening — tap to stop':'🎤 Tap mic to talk'}
        </p>
        <button type="button" onClick={()=>onChange(smartPunctuate(value)+' ')} className="text-xs bg-black text-white rounded-full px-4 py-1.5 font-bold">
          ✨ Fix punctuation
        </button>
      </div>
    </div>
  )
}
