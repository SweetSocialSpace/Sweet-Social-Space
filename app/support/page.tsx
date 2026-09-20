'use client'
import Link from 'next/link'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Support Center</h1>
        <p className="text-white/60">We're here to help with your Sweet Social Space experience</p>
      </div>

      <div className="grid gap-6">
        {/* Contact Options */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">Contact Us</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="font-bold">General Support</p>
                <p className="text-white/60 text-sm">support@sweetsocialspace.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔐</span>
              <div>
                <p className="font-bold">Security Issues</p>
                <p className="text-white/60 text-sm">security@sweetsocialspace.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚖️</span>
              <div>
                <p className="font-bold">Legal & DMCA</p>
                <p className="text-white/60 text-sm">legal@sweetsocialspace.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold">Verification</p>
                <p className="text-white/60 text-sm">verification@sweetsocialspace.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">Common Issues</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-white/90">Can't see posts in my area</h3>
              <p className="text-white/60 text-sm mt-1">Make sure your zip code is set correctly in your profile. Check the radius selector (5-20 miles) to adjust your viewing area.</p>
            </div>
            <div>
              <h3 className="font-bold text-white/90">Location not detected</h3>
              <p className="text-white/60 text-sm mt-1">Click "Use my location" or manually enter your zip code in your profile settings.</p>
            </div>
            <div>
              <h3 className="font-bold text-white/90">Trouble with live streaming</h3>
              <p className="text-white/60 text-sm mt-1">Make sure you've granted microphone permissions. Check your browser settings and try again.</p>
            </div>
            <div>
              <h3 className="font-bold text-white/90">Account access issues</h3>
              <p className="text-white/60 text-sm mt-1">Use the "Forgot Password" link on the login page. Check your email for the magic link.</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">Quick Links</h2>
          <div className="grid gap-2">
            <Link href="/legal/terms" className="text-white/60 hover:text-white hover:underline">Terms of Service</Link>
            <Link href="/legal/privacy" className="text-white/60 hover:text-white hover:underline">Privacy Policy</Link>
            <Link href="/legal/security" className="text-white/60 hover:text-white hover:underline">Security Policy</Link>
            <Link href="/legal/guarantees" className="text-white/60 hover:text-white hover:underline">Our Guarantees</Link>
            <Link href="/legal/legal" className="text-white/60 hover:text-white hover:underline">Legal & DMCA</Link>
            <Link href="/profile" className="text-white/60 hover:text-white hover:underline">Profile Settings</Link>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-2">Response Time</h2>
          <p className="text-white/70">We typically respond to support inquiries within 24-48 hours. For urgent security issues, please email security@sweetsocialspace.com directly.</p>
        </div>
      </div>
    </div>
  )
}
