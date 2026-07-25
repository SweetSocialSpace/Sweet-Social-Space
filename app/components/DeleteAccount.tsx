'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteAccount() {
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const doDelete = async () => {
    if (!window.confirm('Delete your account and all your posts in this zip forever? Cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch('/api/delete-account', { method: 'POST' })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Failed')
      await supabase.auth.signOut()
      localStorage.clear()
      router.push('/')
    } catch (e:any) {
      alert('Delete failed: ' + e.message + ' — add SERVICE_ROLE_KEY in Vercel env')
      setDeleting(false)
    }
  }

  return (
    <div className="mt-8 border-t border-white/10 pt-6 flex gap-3">
      <button onClick={doDelete} disabled={deleting} className="text-xs text-white/40 hover:text-red-400 underline">
        {deleting ? 'Deleting...' : 'Delete account / Unsubscribe'}
      </button>
    </div>
  )
}
