import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8 md:p-10">
        <h1 className="text-3xl font-bold text-white mb-1">Privacy Policy</h1>
        <p className="text-sm text-white/70 mb-8">Last updated: July 9, 2026</p>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">Information We Collect</h2>
            <p className="text-white/90 leading-relaxed">
              Email address for account creation. Content you choose to post publicly on Sweet Social Space.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">How We Protect Your Data</h2>
            <ul className="list-disc pl-5 space-y-2 text-white/90">
              <li>All traffic encrypted via HTTPS with HTTP Strict Transport Security</li>
              <li>Passwords hashed using Supabase Auth with bcrypt</li>
              <li>Database protected by Row Level Security - you control your own data</li>
              <li className="font-bold text-amber-200">We never sell, rent, or share your personal information</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">Your Rights</h2>
            <p className="text-white/90 leading-relaxed">
              Delete your account and all associated data anytime from profile settings. Request data export: support@sweetsocialspace.com
            </p>
          </div>
        </div>

        <a href="/" className="inline-block mt-8 text-sm text-blue-300 hover:text-blue-200 hover:underline">
          ← Back to Sweet Social Space
        </a>
      </div>
    </div>
  )
}
