import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8 md:p-10">
        <h1 className="text-3xl font-bold text-white mb-1">Terms of Service</h1>
        <p className="text-sm text-white/70 mb-8">Last updated: July 9, 2026</p>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">1. Speak Freely. Love Your Neighbor.</h2>
            <p className="text-white/90 leading-relaxed">
              You own your content. By posting, you grant Sweet Social Space license to display it. No harassment, illegal content, or spam. We reserve the right to remove content that violates these terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">2. Account Security</h2>
            <p className="text-white/90 leading-relaxed">
              You are responsible for your password. We use industry-standard encryption with HTTPS, HSTS, and hashed passwords via Supabase Auth.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">3. Data & Privacy</h2>
            <p className="text-white/90 leading-relaxed">
              Your data is protected by Row Level Security. We never sell your information. See our Privacy Policy for details.
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
