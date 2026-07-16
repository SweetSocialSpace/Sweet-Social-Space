'use client'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-black/60 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/feed" className="text-xl font-bold text-white tracking-tight drop-shadow">
          Sweet Social Space
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/80 hidden sm:block font-medium">
              {user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm bg-white/10 hover:bg-white/20 border border-white/10 text-white px-3 py-1.5 rounded-md font-medium backdrop-blur"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
