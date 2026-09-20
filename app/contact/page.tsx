'use client'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link href="/feed" className="text-white/60 hover:text-white text-sm">
            ← Back to Feed
          </Link>
        </div>
        <h1 className="text-3xl font-black mb-2">Contact Us</h1>
        <p className="text-white/60">Get in touch with the Sweet Social Space team</p>
      </div>

      <div className="space-y-6">
        {/* Main Contact */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">📧 Email Contacts</h2>
          <div className="space-y-4">
            <a 
              href="mailto:support@sweetsocialspace.com" 
              className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-bold text-white/90">General Support</p>
                  <p className="text-white/60 text-sm">support@sweetsocialspace.com</p>
                </div>
              </div>
            </a>
            
            <a 
              href="mailto:security@sweetsocialspace.com" 
              className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔐</span>
                <div>
                  <p className="font-bold text-white/90">Security Issues</p>
                  <p className="text-white/60 text-sm">security@sweetsocialspace.com</p>
                </div>
              </div>
            </a>
            
            <a 
              href="mailto:legal@sweetsocialspace.com" 
              className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚖️</span>
                <div>
                  <p className="font-bold text-white/90">Legal & DMCA</p>
                  <p className="text-white/60 text-sm">legal@sweetsocialspace.com</p>
                </div>
              </div>
            </a>
            
            <a 
              href="mailto:verification@sweetsocialspace.com" 
              className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold text-white/90">Verification</p>
                  <p className="text-white/60 text-sm">verification@sweetsocialspace.com</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">⏰ Response Time</h2>
          <div className="space-y-2 text-white/70 text-sm">
            <p><strong>General Inquiries:</strong> 24-48 hours</p>
            <p><strong>Security Issues:</strong> Within 4 hours</p>
            <p><strong>Legal Matters:</strong> 48-72 hours</p>
            <p><strong>Verification:</strong> 5-7 business days</p>
          </div>
        </div>

        {/* Before Contacting */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">📋 Before Contacting Us</h2>
          <div className="space-y-2 text-white/70 text-sm">
            <p>• Check our <Link href="/support" className="text-blue-400 hover:underline">Support Center</Link> for common issues</p>
            <p>• Review our <Link href="/legal/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link> for data questions</p>
            <p>• Read our <Link href="/legal/security" className="text-blue-400 hover:underline">Security Policy</Link> for security concerns</p>
            <p>• Look at our <Link href="/legal/guarantees" className="text-blue-400 hover:underline">Guarantees</Link> for platform commitments</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">🌐 Connect</h2>
          <div className="space-y-2 text-white/70 text-sm">
            <p>Follow us for updates and community highlights</p>
            <div className="flex gap-4 mt-3">
              <a href="https://sweetsocialspace.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                Website
              </a>
              <a href="/feed" className="text-blue-400 hover:underline">
                Join Community
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
