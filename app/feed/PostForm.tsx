'use client'
import { useRef } from 'react'

export default function PostForm({ createPost }: { createPost: (formData: FormData) => Promise<void> }) {
  const formRef = useRef<HTMLFormElement>(null)

  async function handleAction(formData: FormData) {
    await createPost(formData)
    formRef.current?.reset() // THIS CLEARS THE BOX
  }

  return (
    <form ref={formRef} action={handleAction} className="mb-6">
      <textarea
        name="body"
        placeholder="What's happening?"
        className="w-full p-2 border rounded"
        rows={3}
        required
      />
      <button 
        type="submit" 
        className="mt-2 bg-black text-white px-4 py-2 rounded"
      >
        Post
      </button>
    </form>
  )
}
