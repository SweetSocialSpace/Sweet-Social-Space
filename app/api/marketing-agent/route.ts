// app/api/marketing-agent/route.ts - AGENT THAT DOES THE WORK
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const zip = searchParams.get('zip') || 'YOUR BLOCK'
  const isGeneric = zip === 'YOUR BLOCK'

  const copy = {
    headline: isGeneric ? `Your Block Has A Feed. Own Your Code, Own Your Speech.` : `${zip}: Your Block Has A Feed`,
    body: isGeneric
      ? `Built for any zip on earth. Chronological neighborhood feed, BlockMap, LivePulse + AI Mayor, Speak Freely wall, Faith Corner. No algorithm. No corporate bans.`
      : `Neighbors near ${zip} are posting. Chronological feed by zip/radius. BlockMap live. AI Mayor weather + pulse for ${zip}.`,
    cta: isGeneric ? `Join at sweetsocialspace.com/feed — enter your zip` : `Join at sweetsocialspace.com/feed?zip=${zip}`,
    flyer: isGeneric
      ? `SWEET SOCIAL SPACE\nOwn your code. Own your speech.\nWorks for ANY zip.\nsweetsocialspace.com`
      : `SWEET SOCIAL SPACE - ${zip}\nYour neighbors, your rules.\nsweetsocialspace.com/block/${zip}`,
    seoTitle: isGeneric ? `Neighborhood Social Network - Open Alternative to Nextdoor` : `${zip} Neighborhood Feed - Alternative to Nextdoor`,
  }

  return NextResponse.json(copy)
}

// THIS is the agent part - POST does the work
export async function POST(req: Request) {
  const { zip } = await req.json().catch(()=> ({ zip: '95122' }))
  
  const marketingCopy = await fetch(`https://sweetsocialspace.com/api/marketing-agent?zip=${zip}`).then(r=>r.json())

  // 1. Log that we marketed this zip - you can see if it works
  await supabase.from('marketing_log').insert({
    zip,
    headline: marketingCopy.headline,
    ran_at: new Date().toISOString(),
  }).select()

  // 2. Actually create a post IN your feed - so people in that zip see it
  await supabase.from('posts').insert({
    zip_code: zip,
    category: 'general',
    content: `🚀 ${marketingCopy.headline}\n\n${marketingCopy.body}\n\n${marketingCopy.cta}`,
    is_marketing: true,
  })

  // 3. Return proof it worked
  return NextResponse.json({ 
    success: true, 
    zip,
    posted: marketingCopy.headline,
    proof: `Check sweetsocialspace.com/feed?zip=${zip} - your agent posted there`,
    money_step: `Add Stripe link to cta next: ${marketingCopy.cta} + ?plan=5`
  })
}
