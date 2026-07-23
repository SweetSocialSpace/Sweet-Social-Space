import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any })

export async function POST(req: Request) {
  const { businessName, email, zip } = await req.json()

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `Claim ${businessName} - ${zip}`, description: `Verified business on Sweet Social Space ${zip}` },
        unit_amount: 2900,
        recurring: { interval: 'month' }
      },
      quantity: 1
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sweetsocialspace.com'}/feed?claimed=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sweetsocialspace.com'}/business/claim?canceled=1`,
    metadata: { businessName, zip }
  })

  return NextResponse.json({ url: session.url })
}
