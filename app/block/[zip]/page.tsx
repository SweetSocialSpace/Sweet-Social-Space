// app/block/[zip]/page.tsx
export async function generateMetadata({ params }: { params: { zip: string } }) {
  return {
    title: `${params.zip} Neighborhood Feed - Own Your Block | Sweet Social Space`,
    description: `Join neighbors in ${params.zip}. No Nextdoor bans. Chronological feed, BlockMap, Faith Corner. Own your code, own your speech.`
  }
}

export default function BlockPage({ params }: { params: { zip: string } }) {
  const zip = params.zip
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold">Your Block: {zip}</h1>
      <p className="mt-2">The feed your neighbors actually control.</p>
      <div className="mt-6 p-4 border rounded-xl">
        <p>✓ Chronological — no algorithm</p>
        <p>✓ BlockMap live for {zip}</p>
        <p>✓ Faith Corner + Vent Wall</p>
        <p>✓ You own your data</p>
      </div>
      <a href={`/feed?zip=${zip}`} className="mt-6 inline-block bg-black text-white px-6 py-3 rounded-full">
        Join {zip} Feed →
      </a>
      <p className="mt-4 text-sm text-gray-500">Built for global - any zip on earth. Your code: github.com/SweetSocialSpace/Sweet-Social-Space</p>
    </div>
  )
}
