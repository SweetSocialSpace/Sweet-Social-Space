// app/api/marketing-agent/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const zip = searchParams.get('zip') || '95122' // your 95122 default
  
  // 1. Pull LivePulse for this ZIP (your existing logic)
  const weather = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_KEY}&units=imperial`).then(r=>r.json())
  
  // 2. Generate neighbor invite copy
  const inviteCopy = {
    headline: `${zip}: Your block has a feed. No Nextdoor censorship.`,
    body: `Neighbors in ${zip} are posting on Sweet Social Space. Chronological feed. Own your speech. BlockMap live. AI Mayor update: ${weather?.weather?.[0]?.description || 'clear'} and ${Math.round(weather?.main?.temp)}°F in ${zip}.`,
    cta: `Join your neighbors at sweetsocialspace.com/feed?zip=${zip}`,
    flyer: `SWEET SOCIAL SPACE - ${zip}\nOwn your code. Own your speech.\nScan to join your block:\n sweetsocialspace.com/block/${zip}\n\nNo algorithm. No bans. Just neighbors.`,
    seoTitle: `${zip} Neighborhood Feed - Open Alternative to Nextdoor | Sweet Social Space`,
    seoDesc: `Join neighbors in ${zip}. Chronological feed by zip, BlockMap, LivePulse, Faith Corner. The open-source community platform that works for any zip on earth.`
  }

  // 3. Log it so you can see what worked
  await supabase.from('marketing_logs').insert({
    zip,
    copy: inviteCopy,
    created_at: new Date().toISOString()
  })

  return NextResponse.json(inviteCopy)
}
