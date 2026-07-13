'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [copied, setCopied] = useState(false)
  const email = 'SweetSocialSpace@gmail.com'

  const copyEmail = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full space-y-8">
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-xl text-gray-600">
            Questions? Feedback? We read everything.
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Support</h2>
            <p className="text-gray-700 mb-3">
              For help with your account, technical issues, or general questions:
            </p>
            <div className="bg-gray-50 p-4 rounded-md flex items-center justify-between gap-4">
              <span className="text-lg font-medium text-gray-900 break-all">
                {email}
              </span>
              <button
                onClick={copyEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy Email'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Paste this address into your email app to contact us
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Response Time</h2>
            <p className="text-gray-700">
              We respond to all emails within 24-48 hours, Monday through Friday.
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              First, check our <Link href="/terms" className="text-blue-600 hover:underline">Terms</Link> and{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> — 
              your answer might be there.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Sweet Social Space
          </Link>
        </div>

      </div>
    </div>
  )
}
