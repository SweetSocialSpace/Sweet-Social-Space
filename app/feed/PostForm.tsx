'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function PostForm({ userId }: { userId: string }) {
  const [body, setBody] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!body.trim()) return
    
    setIsPosting(true)
    
    const { error } = await supabase.from('posts').insert({
      body: body.trim(),
      user_id: userId,
      post_type: 'text',
      is_anonymous: false,
      city: 'San Jose',
      zip_code: '95122'
    })

    setIsPosting(false)

    if (error) {
      alert('Error posting: ' + error.message)
      return
    }

    setBody('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="border rounded-lg p-4 bg-white shadow">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's happening in San Jose?"
          className="w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={isPosting}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={!body.trim() || isPosting}
            className="bg-blue-500 text-white px-4 py-2 rounded font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  )
}
