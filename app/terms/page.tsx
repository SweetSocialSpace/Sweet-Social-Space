import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6f2] px-4 py-12">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border p-8 md:p-10 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="text-sm text-gray-500">Last updated: July 9, 2026</p>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. Speak Freely. Love Your Neighbor.</h2>
          <p className="text-gray-700">You own your content. By posting, you grant Sweet Social Space license to display it. No harassment, illegal content, or spam. We reserve the right to remove content that violates these terms.</p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. Account Security</h2>
          <p className="text-gray-700">You are responsible for your password. We use industry-standard encryption with HTTPS, HSTS, and hashed passwords via Supabase Auth.</p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. Data & Privacy</h2>
          <p className="text-gray-700">Your data is protected by Row Level Security. We never sell your information. See our Privacy Policy for details.</p>
        </div>

        <a href="/" className="inline-block pt-4 text-sm font-semibold text-blue-600 hover:underline">← Back to Sweet Social Space</a>
      </div>
    </div>
  )
}
