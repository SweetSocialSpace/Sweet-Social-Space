'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Onboarding() {
  const [username, setUsername] = useState('')
  const [age, setAge] = useState('')
  const [zip, setZip] = useState('95122') // Default to your ZIP
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (parseInt(age) < 18) {
      setError('Sweet Social Space is 18+ only.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        username, 
        age: parseInt(age), 
        zip_code: zip 
      })

    if (error) {
      setError(error.message)
    } else {
      router.push('/feed') // Send them to local feed
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Welcome to Sweet Social Space</h1>
        <p className="text-gray-600 mb-6">Let’s get you set up with your neighbors.</p>
        
        <input 
          className="w-full p-3 border rounded mb-4" 
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required 
        />
        <input 
          className="w-full p-3 border rounded mb-4" 
          placeholder="Age" 
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required 
        />
        <input 
          className="w-full p-3 border rounded mb-6" 
          placeholder="ZIP Code" 
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          required 
        />
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded font-semibold disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Join Your Neighborhood'}
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  )
}
