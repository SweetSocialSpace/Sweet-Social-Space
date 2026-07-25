'use client'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [displayName, setDisplayName] = useState<string>('')
  const supabase = createClient()
  const router = useRouter()
  const { zip } = useLocation()

  const loadProfile = async (u: User | null) => {
    setUser(u)
    if (u) {
      const { data: profile } = await supabase.from('profiles').select('username, display_name').eq('user_id', u.id).maybeSingle()
      if (profile) {
        setDisplayName(profile.display_name || (profile.username? `@${profile.username}` : ''))
      } else {
        setDisplayName(u.email || '')
      }
    } else {
      setDisplayName('')
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      loadProfile(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      loadProfile(session?.user?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    if (typeof window!== 'undefined') {
      localStorage.clear() // FIX — clears 95122 so it doesn't bleed into 12828
    }
    router.push('/login')
  }

  const displayZip = zip || (typeof window!== 'undefined'? localStorage.getItem('user_zip') || '' : '')

  return (
    <header className="bg-black/60 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w- mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/feed" className="text-xl font-bold text-white tracking-tight drop-shadow">
            Sweet Social Space
          </Link>
          {displayZip && (
            <span className="text- font-black bg-white text-black px-2 py-1 rounded-full">
              • {displayZip} • LIVE
            </span>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="text-sm text-white/80 hidden sm:block font-medium hover:text-white hover:underline cursor-pointer"
            >
              {displayName || user.email}
            </Link>
            <Link
              href="/profile"
              className="text- text-white/40 hover:text-white/80 hidden md:block"
            >
              Settings / Delete
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm bg-white/10 hover:bg-white/20 border border-white/10 text-white px-3 py-1.5 rounded-full font-bold backdrop-blur"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
