'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, ShoppingBag, MessageCircle, Bell } from 'lucide-react'
import { useTranslations } from '@/lib/translations'

export function MobileBottomNav() {
  const pathname = usePathname() || '/'
  const t = useTranslations() as any
  const ITEMS = [
    { href: '/', label: t?.nav?.feed, Icon: Home },
    { href: '/news-events', label: t?.nav?.events, Icon: Calendar },
    { href: '/marketplace', label: t?.nav?.market, Icon: ShoppingBag },
    { href: '/messages', label: t?.nav?.chat, Icon: MessageCircle },
    { href: '/notifications', label: t?.nav?.alerts, Icon: Bell },
  ]
  return (
    <nav aria-label={t?.nav?.primary} className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname=== href || (href!== '/' && pathname.startsWith(href))
          return (<li key={href}><Link href={href} className={`flex flex-col items-center justify-center gap-1 py-2 text- font-medium hover:text-foreground ${isActive? 'text-primary' : 'text-muted-foreground'}`}><Icon className="h-5 w-5" aria-hidden /><span>{label}</span></Link></li>)
        })}
      </ul>
    </nav>
  )
}
export function MobileBottomNavSpacer() { return <div aria-hidden className="md:hidden h-16" /> }
