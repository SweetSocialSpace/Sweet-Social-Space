'use client'
import { useRef, useState } from 'react'

type Props = {
  onTranscript: (text: string) => void
  onFinalTranscript?: (text: string) => void
}

function makeLegible(text: string){
  if(!text) return text
  let t = text.trim().replace(/\s+/g,' ')
  if(!t) return t
  const questionStarters = /^(who|what|where|when|why|how|is|are|can|could|would|should|do|does|did|will|have|has|are we|is this)/i
  let sentences = t.split(/(?<=[.!?])\s+/)
  sentences = sentences.map(s=>{
    s = s.trim()
    if(!s) return s
    s = s.charAt(0).toUpperCase() + s.slice(1)
    if(questionStarters.test(s) && !/[?.!]$/.test(s)) s += '?'
    else if(!/[?.!]$/.test(s)) s += '.'
    return s
  })
  return sentences.join(' ').replace(/\s+([?.!])/g,'$1')
}

export default function MicRecorder({ onTranscript, onFinalTranscript }: Props) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const finalTextRef = useRef('')

  const toggleMic = async () => {
    if (listening) {
      recognitionRef.current?.stop?.()
      mediaRef.current?.stop?.()
      setListening(false)
      return
    }

    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) {
      try {
        const rec = new SR()
        recognitionRef.current = rec
        rec.continuous = true
        rec.interimResults = true
        rec.lang = 'en-US'
        rec.onstart = () => { setListening(true); finalTextRef.current = '' }
        rec.onend = () => {
          setListening(false)
          if (finalTextRef.current && onFinalTranscript) onFinalTranscript(makeLegible(finalTextRef.current))
        }
        rec.onresult = (e: any) => {
          let interim = ''
          let final = ''
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const transcript = e.results[i][0].transcript
            if (e.results[i].isFinal) final += transcript + ' '
            else interim += transcript
          }
          if (final) finalTextRef.current += final
          const combined = (finalTextRef.current + interim).trim()
          onTranscript(makeLegible(combined))
        }
        rec.onerror = () => startRecordingFallback()
        rec.start()
        return
      } catch {}
    }
    startRecordingFallback()
  }

  const startRecordingFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      const chunks: BlobPart[] = []
      mr.ondataavailable = e=> chunks.push(e.data)
      mr.onstop = async ()=>{
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setListening(false)
        try{
          const fd = new FormData()
          fd.append('audio', blob)
          const res = await fetch('/api/transcribe-elevenlabs', { method: 'POST', body: fd })
          const data = await res.json()
          if(data.text){
            const legible = makeLegible(data.text)
            onTranscript(legible)
            onFinalTranscript?.(legible)
          }
        }catch{}
      }
      mr.start()
      setListening(true)
      finalTextRef.current = ''
    } catch {
      alert('Mic blocked - check browser permissions')
    }
  }

  return (
    <button
      type="button"
      onClick={toggleMic}
      className={`h-12 w-12 rounded-full flex items-center justify-center border-2 border-black shrink-0 ${
        listening? 'bg-red-600 text-white animate-pulse' : 'bg-black text-white'
      }`}
      title={listening? 'Tap to stop' : 'Tap to speak - works on any device'}
    >
      🎤
    </button>
  )
}
