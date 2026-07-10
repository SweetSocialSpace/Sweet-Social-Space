import Link from 'next/link'

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="mb-4 text-gray-700">Last updated: July 9, 2026</p>
        
        <h2 className="text-xl font-semibold mt-8 mb-3">1. Speak Freely. Love Your Neighbor.</h2>
        <p className="mb-4">You own your content. By posting, you grant Sweet Social Space license to display it. No harassment, illegal content, or spam. We reserve the right to remove content that violates these terms.</p>
        
        <h2 className="text-xl font-semibold mt-8 mb-3">2. Account Security</h2>
        <p className="mb-4">You are responsible for your password. We use industry-standard encryption with HTTPS, HSTS, and hashed passwords via Supabase Auth.</p>
        
        <h2 className="text-xl font-semibold mt-8 mb-3">3. Data & Privacy</h2>
        <p className="mb-4">Your data is protected by Row Level Security. We never sell your information. See our Privacy Policy for details.</p>
        
        <Link href="/" className="mt-8 inline-block text-black hover:underline">
          ← Back to Sweet Social Space
        </Link>
      </div>
    </div>
  )
}
