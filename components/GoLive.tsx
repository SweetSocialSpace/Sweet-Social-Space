'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GoLive(props: any) {
  const [open, setOpen] = useState(false)
  const [recording, setRecording] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState('')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const supabase = createClient()
  const zip = props.zipCode
  const city = props.city

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: true 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.muted = true
      }
      setError('')
    } catch (err: any) {
      setError('Camera access denied. Please allow camera and microphone access.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const startRecording = () => {
    if (!stream) return
    
    chunksRef.current = []
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
    mediaRecorderRef.current = mediaRecorder
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }
    
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      await uploadVideo(blob)
    }
    
    mediaRecorder.start()
    setRecording(true)
    setRecordingTime(0)
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const uploadVideo = async (blob: Blob) => {
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || props.userId
      if (!uid) { alert('Login first'); setUploading(false); return }

      const fileName = `live-${uid}-${Date.now()}.webm`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('livestreams')
        .upload(fileName, blob)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        await createPostWithoutVideo(uid)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('livestreams')
        .getPublicUrl(fileName)

      const { data, error } = await supabase.from('posts').insert({
        user_id: uid,
        zip_code: zip,
        body: 'LIVE NOW from ' + city + ' - ' + new Date().toLocaleString(),
        tag: 'live',
        category: 'general',
        video_url: publicUrl,
        media_url: publicUrl
      }).select().single()

      if (error) { alert(error.message); setUploading(false); return }
      
      setUploading(false)
      setOpen(false)
      stopCamera()
      
      if (props.onLivePosted && data) props.onLivePosted(data)
      
    } catch (err: any) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try again.')
      setUploading(false)
    }
  }

  const createPostWithoutVideo = async (uid: string) => {
    const { data, error } = await supabase.from('posts').insert({
      user_id: uid,
      zip_code: zip,
      body: 'LIVE NOW from ' + city + ' - ' + new Date().toLocaleString(),
      tag: 'live',
      category: 'general'
    }).select().single()

    if (error) { alert(error.message); return }
    
    setOpen(false)
    stopCamera()
    
    if (props.onLivePosted && data) props.onLivePosted(data)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins + ':' + secs.toString().padStart(2, '0')
  }

  useEffect(() => {
    if (open) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [open])

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">Go Live</button>
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-5">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-md p-5 border border-neutral-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-bold text-lg">
            {recording ? 'LIVE' : 'Go Live in ' + city}
          </span>
          <button onClick={() => { setOpen(false); if (recording) stopRecording(); }} className="bg-neutral-700 text-white rounded-full w-8 h-8 border-none cursor-pointer text-base">X</button>
        </div>
        
        <div className="relative bg-black rounded-xl overflow-hidden mb-4 aspect-video">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            className="w-full h-full object-cover"
          />
          {recording && (
            <div className="absolute top-3 left-3 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE {formatTime(recordingTime)}
            </div>
          )}
          {!stream && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500">
              <div className="text-3xl mb-2">Camera</div>
              <span>Starting camera...</span>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        {!recording ? (
          <button 
            onClick={startRecording} 
            disabled={!stream || uploading}
            className="w-full bg-red-600 text-white p-3.5 rounded-full font-bold text-base border-none disabled:bg-neutral-600 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading ? 'Uploading...' : 'Start Recording'}
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            disabled={uploading}
            className="w-full bg-neutral-700 text-white p-3.5 rounded-full font-bold text-base border-none disabled:bg-neutral-600 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading ? 'Uploading...' : 'Stop & Post'}
          </button>
        )}
        
        <div className="mt-3 text-center text-neutral-500 text-xs">
          Only visible to subscribers in {zip}
        </div>
      </div>
    </div>
  )
}
