import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  try {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      console.warn('STRIPE_SECRET_KEY missing - payments in safe mode')
      // Dummy key that won't crash house, just won't process
      return new Stripe('sk_test_placeholder_does_not_charge', { apiVersion: '2023-10-16' })
    }
    if (!_stripe) {
      _stripe = new Stripe(key, { apiVersion: '2023-10-16' })
    }
    return _stripe
  } catch (e) {
    console.error('Stripe init failed, safe mode:', e)
    return new Stripe('sk_test_placeholder_does_not_charge', { apiVersion: '2023-10-16' })
  }
}

// Backwards compatible export - but now safe
export const stripe = getStripe()
