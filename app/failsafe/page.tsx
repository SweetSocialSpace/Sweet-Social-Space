'use client'
import { useLocation } from '@/lib/location-context'
import Link from 'next/link'

export default function FailsafePage() {
  const { zip, city } = useLocation()
  const displayArea = city || zip || 'your area'

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Failsafe & Emergency</h1>
        <p className="text-white/60">Emergency resources and platform reliability for {displayArea}</p>
      </div>

      <div className="space-y-6">
        {/* Platform Failsafe */}
        <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">🛡️ Platform Failsafe</h2>
          <div className="space-y-3 text-white/70 text-sm">
            <p><strong>✅ Always Available:</strong> Sweet Social Space is designed to never go down. Our infrastructure is built with redundancy and automatic failover.</p>
            <p><strong>🔒 Data Protection:</strong> Your data is encrypted at rest and in transit. We use Supabase Row Level Security to protect your information.</p>
            <p><strong>🌐 SSL Secured:</strong> Full TLS 1.3 encryption via Vercel, ensuring all communications are secure.</p>
            <p><strong>🔄 Automatic Backups:</strong> Your posts and profile data are automatically backed up and protected.</p>
            <p><strong>⚡ 99.9% Uptime:</strong> We guarantee near-perfect availability for your local community needs.</p>
          </div>
        </div>

        {/* Local Emergency Contacts */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">🚨 Local Emergency Contacts</h2>
          <div className="space-y-3 text-white/70 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👮</span>
              <div>
                <p className="font-bold text-white/90">Police</p>
                <p className="text-xs">Call 911 for emergencies, or find your local non-emergency number</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚒</span>
              <div>
                <p className="font-bold text-white/90">Fire Department</p>
                <p className="text-xs">Your local fire station - {displayArea}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏥</span>
              <div>
                <p className="font-bold text-white/90">Hospital / Medical</p>
                <p className="text-xs">Nearest medical facilities in {displayArea}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-bold text-white/90">Utility Outages</p>
                <p className="text-xs">Report power, water, or gas outages to your local utility company</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Emergency Features */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">📱 Platform Emergency Features</h2>
          <div className="space-y-3 text-white/70 text-sm">
            <p><strong>🚨 Emergency Alerts:</strong> Real-time weather alerts, safety notifications, and community emergencies within your 5-20 mile radius.</p>
            <p><strong>📌 Pinned Alerts:</strong> Critical information stays at the top of your feed when it matters most.</p>
            <p><strong>🔴 Live Streaming:</strong> Broadcast real-time information during emergencies to help your neighbors stay informed.</p>
            <p><strong>📍 Verified Sources:</strong> Official information from local fire departments, police, and other verified organizations.</p>
          </div>
        </div>

        {/* Personal Emergency Preparedness */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">📋 Personal Emergency Preparedness</h2>
          <div className="space-y-2 text-white/70 text-sm">
            <p>• Keep emergency contacts saved in your phone</p>
            <p>• Know your local evacuation routes</p>
            <p>• Have a 72-hour emergency kit ready</p>
            <p>• Stay informed through Sweet Social Space emergency alerts</p>
            <p>• Check on elderly or vulnerable neighbors during emergencies</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">⚡ Quick Actions</h2>
          <div className="grid gap-2">
            <Link href="/feed" className="text-white/60 hover:text-white hover:underline">Check Local Alerts</Link>
            <Link href="/legal/security" className="text-white/60 hover:text-white hover:underline">Report Security Issue</Link>
            <Link href="/support" className="text-white/60 hover:text-white hover:underline">Contact Support</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
