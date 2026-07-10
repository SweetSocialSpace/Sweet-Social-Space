import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="mb-4 text-gray-700">Last updated: July 9, 2026</p>
        
        <h2 className="text-xl font-semibold mt-8 mb-3">Information We Collect</h2>
        <p className="mb-4">Email address for account creation. Content you choose to post publicly on Sweet Social Space.</p>
        
        <h2 className="text-xl font-semibold mt-8 mb-3">How We Protect Your Data</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>All traffic encrypted via HTTPS with HTTP Strict Transport Security</li>
          <li>Passwords hashed using Supabase Auth with bcrypt</li>
          <li>Database protected by Row Level Security - you control your own data</li>
          <li>We never sell, rent, or share your personal information</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">Your Rights</h2>
        <p className="mb-4">Delete your account and all associated data anytime from profile settings. Request data export: support@sweetsocialspace.com</p>
        
        <Link href="/" className="mt-8 inline-block text-black hover:underline">
          ← Back to Sweet Social Space
        </Link>
      </div>
    </div>
  )
}
