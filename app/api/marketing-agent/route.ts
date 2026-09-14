// app/api/marketing-agent/route.ts - GLOBAL VERSION
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  // zip comes from the USER'S profile, not the creator
  const zip = searchParams.get('zip') || 'YOUR BLOCK'
  const isGeneric = zip === 'YOUR BLOCK'

  const inviteCopy = {
    headline: isGeneric 
      ? `Your Block Has A Feed. Own Your Code, Own Your Speech.`
      : `${zip}: Your Block Has A Feed`,
    
    body: isGeneric
      ? `Built for any zip on earth. Chronological neighborhood feed, BlockMap, LivePulse + AI Mayor, Speak Freely wall, Faith Corner. No algorithm. No corporate bans. Works wherever you live.`
      : `Neighbors near ${zip} are posting. Chronological feed by zip/radius. BlockMap live. AI Mayor weather + pulse for ${zip}.`,

    cta: isGeneric
      ? `Join at sweetsocialspace.com/feed — enter your zip and see your block`
      : `Join at sweetsocialspace.com/feed?zip=${zip}`,

    flyer: isGeneric
      ? `SWEET SOCIAL SPACE\nOwn your code. Own your speech.\nWorks for ANY zip on earth.\n sweetsocialspace.com\nEnter your zip → See your block`
      : `SWEET SOCIAL SPACE - ${zip}\nYour neighbors, your rules.\n sweetsocialspace.com/block/${zip}`,

    seoTitle: isGeneric
      ? `Neighborhood Social Network - Open Alternative to Nextdoor | Sweet Social Space`
      : `${zip} Neighborhood Feed - Open Alternative to Nextdoor`,
  }

  return NextResponse.json(inviteCopy)
}
