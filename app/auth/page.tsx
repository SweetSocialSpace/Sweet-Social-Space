import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AuthForm from './auth-form' // we'll make this dumb simple

export default async function AuthPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/') // Already logged in, send to home
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Sweet Social Space</h1>
        <p className="text-gray-400 text-center mb-8">Create an account to see what your neighbors are talking about.</p>
        <AuthForm />
      </div>
    </div>
  )
}
