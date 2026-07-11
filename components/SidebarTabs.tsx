'use client'

import { useState, type ReactNode } from 'react'

export type SidebarTab = { id: string; label: string; icon?: string; content: ReactNode }

export function SidebarTabs({ tabs, initial }: { tabs: SidebarTab[]; initial?: string }) {
  const [active, setActive] = useState(initial?? tabs[0]?.id)
  const current = tabs.find((t) => t.id === active)?? tabs[0]

  return (
    <div className="space-y-3">
      <div
        role="tablist"
        className="grid w-full gap-1 rounded-2xl border border-border bg-card p-1 shadow-[var(--shadow-soft)]"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((t) => {
          const isActive = t.id === current?.id
          const showIcon = tabs.length <= 3
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.id)}
              title={t.label}
              className={`flex min-w-0 items-center justify-center rounded-xl px-1 py-1.5 text- font-semibold transition ${
                isActive
              ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {showIcon && t.icon && <span aria-hidden className="mr-1 shrink-0">{t.icon}</span>}
              <span className="truncate">{t.label}</span>
            </button>
          )
        })}
      </div>
      <div role="tabpanel" className="space-y-3">
        {current?.content}
      </div>
    </div>
  )
}
