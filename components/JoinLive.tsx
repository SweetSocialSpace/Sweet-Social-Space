'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react'

export default function JoinLive({ roomName, userName, onClose }: { roomName: string, userName: string, onClose: () => void }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const joinStream = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || 'viewer'
      
      const tokenRes = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: roomName,
          participantName: uid
        })
      })

      if (!tokenRes.ok) {
        const errorData = await tokenRes.json()
        setError(errorData.error || 'Failed to join stream')
        setLoading(false)
        return
      }

      const tokenData = await tokenRes.json()
      setToken(tokenData.token)
      setLoading(false)
    } catch (err: any) {
      console.error('Join live error:', err)
      setError('Failed to join stream: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-5">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-4xl p-5 border border-neutral-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-bold text-lg">
            🔴 {userName} is LIVE
          </span>
          <button onClick={onClose} className="bg-neutral-700 text-white rounded-full w-8 h-8 border-none cursor-pointer text-base">X</button>
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        {!token ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">🔴</div>
            <p className="text-neutral-400 mb-6">{userName} is streaming live</p>
            <button 
              onClick={joinStream} 
              disabled={loading}
              className="bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg border-none cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Live Stream'}
            </button>
          </div>
        ) : (
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            <LiveKitRoom
              token={token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              connect={true}
              onDisconnected={onClose}
              video={true}
              audio={true}
            >
              <VideoConference />
              <RoomAudioRenderer />
            </LiveKitRoom>
          </div>
        )}
      </div>
    </div>
  )
}
