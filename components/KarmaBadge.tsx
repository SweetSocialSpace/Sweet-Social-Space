'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function KarmaBadge({ userId }: { userId: string }) {
  const [karma, setKarma] = useState(0)

  useEffect(() => {
    if (!userId) return
    let mounted = true
    const load = async () => {
      try {
        const supabase = createClient() as any
        const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId)
        if (mounted) setKarma((count||0) * 10)
      } catch {}
    }
    load()
  }, [userId])

  return <span className="text- font-black bg-yellow-500 text-black px-2 py-1 rounded-full">🔥 {karma} KARMA</span>
}
