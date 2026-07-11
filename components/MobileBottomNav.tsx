'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, ShoppingBag, MessageCircle, Bell } from 'lucide-react'

const ITEMS = [
  { href: '/', label: 'Feed', Icon: Home },
  { href: '/news-events', label: 'Events', Icon: Calendar },
  { href: '/marketplace', label: 'Market', Icon: ShoppingBag },
  { href: '/messages', label: 'Chat', Icon: MessageCircle },
  { href: '/notifications', label: 'Alerts', Icon: Bell },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-1 py-2 text- font-medium hover:text-foreground ${
                  isActive? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// Spacer so fixed nav doesn't cover page content on mobile.
export function MobileBottomNavSpacer() {
  return <div aria-hidden className="md:hidden h-16" />
}
