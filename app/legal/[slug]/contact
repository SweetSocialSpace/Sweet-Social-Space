import Link from 'next/link'

export default function ContactPage() {
  const email = 'SweetSocialSpace@gmail.com'
  const subject = 'Sweet Social Space Support'
  const body = 'Hi, I need help with...'
  
  // This builds a Gmail compose link
  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Support</h2>
            <p className="text-gray-700 mb-4">
              Click below to email us directly through Gmail:
            </p>
            
            {/* This is the Gmail popup button */}
            <a
              href={gmailLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center font-medium"
            >
              Email SweetSocialSpace@gmail.com
            </a>
            
            <p className="text-xs text-gray-500 mt-3">
              Opens Gmail in a new tab. Don’t use Gmail?{' '}
              <span className="text-gray-700 font-medium">SweetSocialSpace@gmail.com</span>
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
