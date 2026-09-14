import { NextRequest } from 'next/server'

const EXPLANATIONS: Record<string, { creator: string, heaven: string, deeper: string }> = {
  "John 3:16": { creator: "God loved us so much He gave His Son. That's who our Creator is - love.", heaven: "Believe in Jesus = eternal life. That's the way to heaven - John 14:6", deeper: "God's love is not earned, it's given." },
  "Psalm 23:1": { creator: "The Creator is a Shepherd who knows you by name and provides.", heaven: "A shepherd leads you home. Follow Him.", deeper: "You are not alone on your block." },
  "Genesis 1:1": { creator: "In the beginning God created. He made you on purpose.", heaven: "The Creator made a way back to Him through Jesus.", deeper: "Your life has a Designer." },
}

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref') || 'John 3:16'
  try {
    // Server can fetch bible-api.com - browser CSP doesn't block server
    const res = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}`, { next: { revalidate: 3600 } })
    const data = await res.json()
    const extra = EXPLANATIONS[data.reference] || EXPLANATIONS[ref] || { creator: "This verse shows the Creator's heart for you.", heaven: "Jesus said: I am the way, truth, life. No one comes to Father except through me - John 14:6", deeper: "Tap 'Full Chapter' to read context." }
    return Response.json({...data,...extra })
  } catch {
    return Response.json({ text: "For God so loved the world...", reference: ref, creator: "God is love", heaven: "Believe on the Lord Jesus Christ and you will be saved - Acts 16:31", deeper: "The Bible is a love letter from Creator to you." })
  }
}
