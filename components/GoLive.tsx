'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GoLive(props: any) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const supabase = createClient()
  const zip = props.zipCode
  const city = props.city

  const goLive = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || props.userId
      if (!uid) { 
        setError('Please login first')
        setLoading(false)
        return 
      }

      const { data, error } = await supabase.from('posts').insert({
        user_id: uid,
        zip_code: zip,
        city: city,
        body: 'LIVE NOW from ' + city + ' - ' + new Date().toLocaleString(),
        content: 'Someone is live in ' + city + '!',
        category: 'general',
        type: 'live',
        is_live: true,
        live_started_at: new Date().toISOString()
      }).select().single()

      if (error) { 
        setError(error.message)
        setLoading(false)
        return 
      }
      
      setLoading(false)
      setOpen(false)
      
      if (props.onLivePosted && data) props.onLivePosted(data)
      
    } catch (err: any) {
      console.error('Go live error:', err)
      setError('Failed to start live stream')
      setLoading(false)
    }
  }

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">Go Live</button>
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-5">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-md p-5 border border-neutral-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-bold text-lg">
            Go Live in {city}
          </span>
          <button onClick={() => setOpen(false)} className="bg-neutral-700 text-white rounded-full w-8 h-8 border-none cursor-pointer text-base">X</button>
        </div>
        
        <div className="bg-black rounded-xl overflow-hidden mb-4 aspect-video flex items-center justify-center text-neutral-500">
          <div className="text-center">
            <div className="text-3xl mb-2">Camera</div>
            <span>Live streaming feature</span>
            <div className="mt-2 text-xs">Zip: {zip}</div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        <button 
          onClick={goLive} 
          disabled={loading}
          className="w-full bg-red-600 text-white p-3.5 rounded-full font-bold text-base border-none disabled:bg-neutral-600 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Starting...' : 'Go Live Now'}
        </button>
        
        <div className="mt-3 text-center text-neutral-500 text-xs">
          Only visible to subscribers in {zip}
        </div>
      </div>
    </div>
  )
}
