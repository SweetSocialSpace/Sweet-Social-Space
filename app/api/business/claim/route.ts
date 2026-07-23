import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  try {
    const { businessName, email, zip } = await req.json()

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe key missing in Vercel' }, { status: 500 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20' as any,
    })

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Claim ${businessName} - ${zip}`,
              description: `Verified business on Sweet Social Space ${zip}`,
            },
            unit_amount: 2900,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'https://sweetsocialspace.com/feed?claimed=1',
      cancel_url: 'https://sweetsocialspace.com/business/claim?canceled=1',
      metadata: { businessName, zip },
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
