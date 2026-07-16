'use client'
import { useRef, useState } from 'react'
import { smartPunctuate } from './smartPunctuate'

export default function MicRecorder({ value, onChange }: { value: string, onChange: (v: string)=>void }) {
  const [isListening, setIsListening] = useState(false)
  const savedRef = useRef('')
  const finalRef = useRef('')

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Use Chrome"); return }
    if (isListening) {
      ;(window as any)._keepListening = false
      ;(window as any)._recog?.stop()
      setIsListening(false)
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
    <div className="relative">
      <textarea
        value={value}
        onChange={e=>{ onChange(e.target.value); savedRef.current=e.target.value }}
        placeholder="Tap mic and talk — I keep everything..."
        rows={5}
        className="w-full rounded-xl border-2 border-gray-300 p-4 pr-14 text-black text- outline-none"
      />
      <button type="button" onClick={toggleMic} className={`absolute right-2 top-2 w-12 h-12 rounded-full text-xl font-black shadow border-2 ${isListening?'bg-red-600 border-red-700 animate-pulse text-white':'bg-black border-black text-white'}`}>{isListening?'■':'🎤'}</button>
      <div className="flex items-center gap-2 mt-2">
        <p className={`text-sm font-bold ${isListening?'text-red-600':'text-gray-700'}`}>{isListening?'🔴 Listening — tap ■ to stop':'🎤 Mic keeps your words'}</p>
        <button type="button" onClick={()=>onChange(smartPunctuate(value)+' ')} className="ml-auto text-xs bg-black text-white rounded-full px-3 py-1 font-black">✨ Fix. and?</button>
      </div>
    </div>
  )
}
