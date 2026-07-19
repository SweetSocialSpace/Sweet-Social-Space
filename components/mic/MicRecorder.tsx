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
  t = t.charAt(0).toUpperCase() + t.slice(1)
  if(/^(who|what|where|when|why|how|is|are|can|could|would|should|do|does|did|will|have|has|are we|is this)/i.test(t) &&!/[?.!]$/.test(t)) t += '?'
  else if(!/[?.!]$/.test(t)) t += '.'
  return t
}

export default function MicRecorder({ onTranscript, onFinalTranscript }: Props) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const lastFinalRef = useRef('')

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
        lastFinalRef.current = ''

        rec.onstart = () => setListening(true)

        rec.onend = () => {
          setListening(false)
          if (lastFinalRef.current && onFinalTranscript) {
            onFinalTranscript(makeLegible(lastFinalRef.current))
          }
        }

        rec.onresult = (e: any) => {
          let finalTranscript = ''
          let interimTranscript = ''
          // Rebuild from scratch every time - NO stacking
          for (let i = 0; i < e.results.length; i++) {
            const transcript = e.results[i][0].transcript
            if (e.results[i].isFinal) {
              finalTranscript += transcript + ' '
            } else {
              interimTranscript += transcript
            }
          }
          finalTranscript = finalTranscript.trim()
          lastFinalRef.current = finalTranscript
          const combined = finalTranscript + (interimTranscript? ' ' + interimTranscript : '')
          onTranscript(combined.trim())
        }

        rec.onerror = () => {
          // fallback to recording
          try{ rec.stop() }catch{}
          startRecordingFallback()
        }
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
        stream.getTracks().forEach(t=>t.stop())
        try{
          const fd = new FormData()
          fd.append('audio', blob)
          const res = await fetch('/api/transcribe-elevenlabs', { method: 'POST', body: fd })
          const data = await res.json()
          if(data.text){
            onTranscript(makeLegible(data.text))
            onFinalTranscript?.(makeLegible(data.text))
          }
        }catch{}
      }
      mr.start()
      setListening(true)
    } catch {
      alert('Mic blocked - check permissions')
    }
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
