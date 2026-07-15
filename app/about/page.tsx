import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-8">
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              About Sweet Social Space
            </h1>
            <p className="text-xl text-gray-600">
              Speak Freely. Love your neighbor. Ask yourself, what would Jesus Christ do?
            </p>
          </div>

          <div className="prose prose-lg mx-auto text-gray-700 space-y-6">
            <p>
              <strong>Sweet Social Space was founded in 2026 with one belief: You should be able to speak your mind without fear of censorship, shadowbans, or corporate agendas. We should always keep our Creator in our hearts and in our mind. So seek advice from God or his son Jesus Christ.</strong>
            </p>

            <h2 className="text-2xl font-bold text-gray-900">What we stand for</h2>
            <ul className="space-y-2">
              <li><strong>Free Speech:</strong> Say what you think. The First Amendment matters here.</li>
              <li><strong>Real Community:</strong> No bots, no engagement farming. Just real people.</li>
              <li><strong>Your Data is Yours:</strong> We never sell it. We never will.</li>
              <li><strong>No Algorithms:</strong> You see posts from people you follow, in order. That's it.</li>
              <li><strong>Faith:</strong> Ask God for advice, remember we are only human and Jesus Christ died on that cross for a reason.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900">Why we exist</h2>
            <p>
              Big Tech platforms decide what you can say and who gets to see it. We don't. 
              Sweet Social Space is built for people who are tired of being silenced, 
              manipulated, or treated like a product. We also believe religion can't be held against you here. Jesus Christ died for a reason.
            </p>
            
            <p>
              This is your space. Post freely. Support your friends and family. Build something real. Please keep God in mind.
            </p>
          </div>

          <div className="text-center pt-8">
            <Link 
              href="/signup"
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md text-lg"
            >
              Join Sweet Social Space
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
