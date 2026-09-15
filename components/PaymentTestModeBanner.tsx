'use client'
const clientToken = process.env.NEXT_PUBLIC_PAYMENTS_CLIENT_TOKEN
import { useTranslations } from '@/lib/translations'

export function PaymentTestModeBanner() {
  const t = useTranslations() as any
  try {
    if (!clientToken?.startsWith('pk_test_')) return null
    return (
      <div className="w-full bg-orange-100 border-b border-orange-300 px-4 py-2 text-center text-xs sm:text-sm text-orange-800">
        {t?.payments?.testModePrefix || 'Payments in the preview are in test mode. Use card'} <code className="font-mono font-semibold">4242 4242 4242 4242</code>, {t?.payments?.testModeSuffix || 'any future expiry, any CVC.'}{' '}
        <a href="https://docs.lovable.dev/features/payments#test-and-live-environments" target="_blank" rel="noopener noreferrer" className="underline font-medium">{t?.payments?.learnMore || 'Learn more'}</a>
      </div>
    )
  } catch { return null }
}
