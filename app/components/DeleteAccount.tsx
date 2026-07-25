'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteAccount() {
  const [show, setShow] = useState(false)
  const [confirm, setConfirm] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (confirm !== 'DELETE') return alert('Type DELETE to confirm')
    if (!confirm('Delete your account, all posts, and unsubscribe from everything? This cannot be undone.')) return

    const res = await fetch('/api/delete-account', { method: 'POST' })
    if (res.ok) {
      await supabase.auth.signOut()
      localStorage.clear()
      router.push('/')
    } else {
      alert('Failed — contact support@sweetsocialspace.com')
    }
  }

  const handleUnsubscribe = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ email_notifications: false, sms_notifications: false }).eq('user_id', user.id)
    alert('Unsubscribed — you will get no emails/SMS. Your account stays.')
  }

  return (
    <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-5 mt-6">
      <h3 className="font-black text-red-300 mb-3">Danger Zone • {typeof window!== 'undefined'? localStorage.getItem('user_zip') : ''}</h3>
      <div className="flex gap-2 flex-wrap">
        <button onClick={handleUnsubscribe} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-xs font-bold border">Unsubscribe — No Emails</button>
        <button onClick={()=>setShow(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-xs font-black">Delete Account Forever</button>
      </div>
      {show && (
        <div className="mt-4 bg-black/50 p-4 rounded-xl border border-red-500/50">
          <p className="text-white text-xs mb-2">Type DELETE to confirm — deletes posts, profile, login, all data in {typeof window!== 'undefined'? localStorage.getItem('user_zip') : 'your block'}:</p>
          <input value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Type DELETE" className="w-full bg-white text-black rounded-xl p-2 text-sm mb-3" />
          <div className="flex gap-2">
            <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-full text-xs font-black">Confirm Delete</button>
            <button onClick={()=>setShow(false)} className="bg-white/20 text-white px-4 py-2 rounded-full text-xs">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
