'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'

export default function SignUp() {
  const supabase = createClient()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Join Sweet Social Space</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/feed`}
          view="sign_up"
        />
        <p className="text-xs text-gray-500 mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy. We never sell your data.
        </p>
      </div>
    </div>
  )
}
