'use client'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link href="/feed" className="text-white/60 hover:text-white text-sm">
            ← Back to Feed
          </Link>
        </div>
        <h1 className="text-3xl font-black mb-2">About Sweet Social Space</h1>
        <p className="text-white/60">Your neighborhood, not the world</p>
      </div>

      <div className="space-y-6">
        {/* Mission */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">🏘️ Our Mission</h2>
          <p className="text-white/80 leading-relaxed">
            Sweet Social Space is a hyperlocal private network that connects you with neighbors within 5-20 miles of where you are. We believe real community happens on your block, not on a global algorithm. Your porch talk stays on your porch - private, local, and authentic.
          </p>
        </div>

        {/* What We Offer */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">✨ What We Offer</h2>
          <div className="grid gap-3 text-white/70 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl">📱</span>
              <div>
                <p className="font-bold text-white/90">Neighborhood Feed</p>
                <p className="text-xs">Chronological posts from your 5-20 mile radius</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔴</span>
              <div>
                <p className="font-bold text-white/90">Live Streaming</p>
                <p className="text-xs">Broadcast live to your neighbors in real-time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎙️</span>
              <div>
                <p className="font-bold text-white/90">Voice Posts</p>
                <p className="text-xs">Speak freely with AI-powered voice transcription</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🚨</span>
              <div>
                <p className="font-bold text-white/90">Emergency Alerts</p>
                <p className="text-xs">Real-time weather, safety, and community alerts</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🗺️</span>
              <div>
                <p className="font-bold text-white/90">Block Map</p>
                <p className="text-xs">Interactive map of your neighborhood</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🏪</span>
              <div>
                <p className="font-bold text-white/90">Local Business Directory</p>
                <p className="text-xs">Discover and support businesses near you</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📅</span>
              <div>
                <p className="font-bold text-white/90">Local Events</p>
                <p className="text-xs">What's happening in your area</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">⭐</span>
              <div>
                <p className="font-bold text-white/90">Recommendations</p>
                <p className="text-xs">Trustworthy recommendations from neighbors</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🙏</span>
              <div>
                <p className="font-bold text-white/90">Faith Corner</p>
                <p className="text-xs">Daily encouragement and prayer requests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">💚 Our Values</h2>
          <div className="space-y-3 text-white/70 text-sm">
            <p><strong>🔒 Privacy First:</strong> No IP tracking, no data selling, no algorithms. Your data stays yours.</p>
            <p><strong>🏘️ Local Focus:</strong> Everything within 5-20 miles. Your actual neighbors, not the whole internet.</p>
            <p><strong>🗣️ Speak Freely:</strong> No shadowbans for faith or controversial topics. Open dialogue welcome.</p>
            <p><strong>❤️ Love Neighbor:</strong> Build real connections, support each other, strengthen community.</p>
            <p><strong>🚫 No Big Tech:</strong> Independent platform. No Facebook, no Google, no algorithm manipulation.</p>
            <p><strong>✅ Verified Sources:</strong> Official information from local fire departments, police, and verified businesses.</p>
          </div>
        </div>

        {/* Technology */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">⚙️ Built With</h2>
          <div className="grid grid-cols-2 gap-2 text-white/60 text-xs">
            <p>• Next.js 14</p>
            <p>• Supabase (Auth + Database)</p>
            <p>• LiveKit (Live Streaming)</p>
            <p>• ElevenLabs (Voice AI)</p>
            <p>• Stripe (Payments)</p>
            <p>• Leaflet (Maps)</p>
            <p>• Tailwind CSS</p>
            <p>• Vercel (Hosting)</p>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">🔐 Security & Privacy</h2>
          <div className="space-y-2 text-white/70 text-sm">
            <p>• SSL/TLS 1.3 encryption via Vercel</p>
            <p>• Supabase Row Level Security</p>
            <p>• Email magic link authentication</p>
            <p>• Data encrypted at rest and in transit</p>
            <p>• No third-party tracking pixels</p>
            <p>• ZIP code-based location (no IP tracking)</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">🚀 Join Your Community</h2>
          <p className="text-white/70 mb-4">Ready to connect with your neighbors? Join Sweet Social Space today.</p>
          <Link
            href="/signup"
            className="inline-block bg-white text-black px-6 py-3 rounded-full font-black text-sm hover:bg-yellow-400 transition"
          >
            Get Started →
          </Link>
        </div>

        {/* Contact */}
        <div className="text-center text-white/40 text-sm">
          <p>sweetsocialspace.com</p>
          <p className="mt-2">Questions? <Link href="/contact" className="text-white/60 hover:underline">Contact Us</Link></p>
        </div>
      </div>
    </div>
  )
}
