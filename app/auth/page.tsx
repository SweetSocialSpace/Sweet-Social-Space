import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AuthForm from './auth-form'

export default async function AuthPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/') // Already logged in, send to home
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-4 text-center">Sweet Social Space</h1>
        <p className="text-gray-400 text-center mb-8">Create an account to see what your neighbors are talking about.</p>
        
        <AuthForm />
        
        <div className="mt-6 text-center text-xs text-gray-500">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-300">Terms of Service</Link> and{' '}
          <Link href="/privacy" className="underline hover:text-gray-300">Privacy Policy</Link>. 
          <br />
          We never sell your data.
        </div>
      </div>
    </div>
  )
}
