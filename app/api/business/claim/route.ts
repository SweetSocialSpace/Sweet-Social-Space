import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const { businessName, email, zip } = await req.json()

    if (!businessName || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Sweet Social Space - ${businessName}`,
              description: `Claim in ${zip} - Verified badge`,
            },
            unit_amount: 2900, // $29.00
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/claim/success?business=${encodeURIComponent(businessName)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/claim`,
      metadata: { businessName, zip },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
