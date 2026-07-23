import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const { businessName, email, zip } = await req.json()

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Claim ${businessName}`,
          description: `Verified in ${zip} on Sweet Social Space`
        },
        unit_amount: 2900,
        recurring: { interval: 'month' }
      },
      quantity: 1
    }],
    mode: 'subscription',
    success_url: 'https://sweetsocialspace.com/feed?claimed=1',
    cancel_url: 'https://sweetsocialspace.com/business/claim',
    metadata: { businessName, zip }
  })

  return NextResponse.json({ url: session.url })
}
