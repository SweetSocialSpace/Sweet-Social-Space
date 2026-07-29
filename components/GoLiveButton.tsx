'use client'
import { useState, useRef } from 'react'

export default function GoLiveButton({ zip, onDone }: { zip: string, onDone?: () => void }) {
  const [recording, setRecording] = useState(false)
  const [uploading, setUploading] = useState(false)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: true })
      chunks.current = []
      const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' } as any)
      mediaRef.current = rec
      rec.ondataavailable = e => e.data.size && chunks.current.push(e.data)
      rec.onstop = async () => {
        const blob = new Blob(chunks.current, { type: 'video/webm' })
        stream.getTracks().forEach(t=>t.stop())
        setUploading(true)
        const fd = new FormData()
        fd.append('file', blob, `live-${Date.now()}.webm`)
        fd.append('zip', zip || 'GLOBAL')
        await fetch('/api/live/upload', { method: 'POST', body: fd })
        setUploading(false)
        onDone?.()
        // reload feed to show new live post
        window.location.reload()
      }
      rec.start()
      setRecording(true)
      setTimeout(()=> rec.state==='recording' && rec.stop(), 60000)
    } catch { alert('Allow camera - phone settings - browser - camera - allow') }
  }

  const stop = () => { mediaRef.current?.stop(); setRecording(false) }

  if (recording) return <button onClick={stop} className="bg-red-600 text-white font-black px-3 py-1.5 rounded-full text-xs animate-pulse">● STOP - 60s max</button>
  return <button onClick={start} disabled={uploading} className="bg-red-500 text-white font-black px-3 py-1.5 rounded-full text-xs shadow">{uploading? 'Uploading...' : '🔴 Go LIVE'}</button>
}
