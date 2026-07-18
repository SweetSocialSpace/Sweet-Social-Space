'use client'
import { useRef, useState } from 'react'
import { smartPunctuate } from './smartPunctuate'

export default function MicRecorder({ value, onChange }: { value: string, onChange: (v: string)=>void }) {
  const [isListening, setIsListening] = useState(false)
  const savedRef = useRef('')
  const finalRef = useRef('')

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
    <div className="w-full bg-white rounded-2xl p-5">
      <textarea
        value={value}
        onFocus={stopMic}
        onChange={e=>{ savedRef.current=e.target.value; onChange(e.target.value) }}
        placeholder="Tap mic and talk — I keep everything, even when you pause..."
        className="w-full min-h- text-black p-3 border border-black/10 rounded-xl outline-none resize-none"
      />
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={toggleMic}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-xl shadow border ${isListening?'bg-red-600 border-red-700 animate-pulse text-white':'bg-black border-black text-white'}`}
        >
          {isListening?'■':'🎤'}
        </button>
        <button type="button" onClick={()=>onChange(smartPunctuate(value)+' ')} className="text-xs bg-black text-white rounded-full px-4 py-1.5 font-bold">
          ✨ Fix punctuation
        </button>
      </div>
    </div>
  )
}
