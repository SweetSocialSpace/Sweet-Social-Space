import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl bg-white/65 backdrop-blur-md rounded-xl shadow-xl border border-white/30 p-8 md:p-10 space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Terms of Service</h1>
        <p className="text-sm font-bold text-gray-700">Last updated: July 9, 2026</p>
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. Speak Freely. Love Your Neighbor.</h2>
          <p className="text-gray-900 font-medium">You own your content. By posting, you grant Sweet Social Space license to display it. No harassment, illegal content, or spam. We reserve the right to remove content that violates these terms.</p>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. Account Security</h2>
          <p className="text-gray-900 font-medium">You are responsible for your password. We use industry-standard encryption with HTTPS, HSTS, and hashed passwords via Supabase Auth.</p>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. Data & Privacy</h2>
          <p className="text-gray-900 font-medium">Your data is protected by Row Level Security. We never sell your information. See our Privacy Policy for details.</p>
        </div>
        <a href="/" className="inline-block pt-4 text-sm font-bold text-blue-700 hover:underline">← Back to Sweet Social Space</a>
      </div>
    </div>
  )
}
