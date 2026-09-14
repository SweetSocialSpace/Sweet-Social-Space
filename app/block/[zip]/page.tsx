// app/block/[zip]/page.tsx - NO CREATOR FOCUS
export default function BlockPage({ params }: { params: { zip: string } }) {
  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold">Block: {params.zip}</h1>
      <p className="mt-2 text-gray-600">Built for global - any zip on earth. Enter your zip, see your block.</p>
      
      <div className="mt-8 grid gap-3 text-left p-5 border rounded-2xl">
        <p>✓ Chronological feed by zip/radius — no algorithm</p>
        <p>✓ BlockMap (Leaflet + Overpass) auto-loads your area</p>
        <p>✓ LivePulse + AI Mayor — automated by zip</p>
        <p>✓ Speak Freely / Vent Wall — anonymous-optional</p>
        <p>✓ Faith Corner — prayer requests & encouragement</p>
        <p>✓ OwnThisBlock — own your block with Stripe</p>
      </div>

      <a href={`/feed?zip=${params.zip}`} className="mt-8 inline-block bg-black text-white px-8 py-3 rounded-full">
        Enter {params.zip} Feed →
      </a>

      <p className="mt-6 text-xs text-gray-400">
        Open source. Supabase Auth. Next.js 14 + Tailwind. Fully yours.
      </p>
    </div>
  )
}
