import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      {/* Background stays - this makes it transparent */}
      <div className="w-full max-w-3xl bg-white/75 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-8 md:p-10 space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-900 drop-shadow-sm">Privacy Policy</h1>
        <p className="text-sm font-semibold text-gray-700">Last updated: July 9, 2026</p>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Information We Collect</h2>
          <p className="text-gray-800 font-medium">Email address for account creation. Content you choose to post publicly on Sweet Social Space.</p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">How We Protect Your Data</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-800 font-medium">
            <li>All traffic encrypted via HTTPS with HTTP Strict Transport Security</li>
            <li>Passwords hashed using Supabase Auth with bcrypt</li>
            <li>Database protected by Row Level Security - you control your own data</li>
            <li>We never sell, rent, or share your personal information</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Your Rights</h2>
          <p className="text-gray-800 font-medium">Delete your account and all associated data anytime from profile settings. Request data export: support@sweetsocialspace.com</p>
        </div>

        <a href="/" className="inline-block pt-4 text-sm font-bold text-blue-700 hover:underline">← Back to Sweet Social Space</a>
      </div>
    </div>
  )
}
