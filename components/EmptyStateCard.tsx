import Link from 'next/link'
import type { ReactNode } from 'react'
import type { UrlObject } from 'url'

type Action =
  | { kind: 'button'; label: string; onClick: () => void; primary?: boolean }
  | { kind: 'link'; label: string; href: string | UrlObject; primary?: boolean }

export function EmptyStateCard({
  icon = '✨',
  title,
  body,
  actions = [],
  children,
}: {
  icon?: ReactNode
  title: string
  body?: string
  actions?: Action[]
  children?: ReactNode
}) {
  return (
    <div className="my-10 rounded-3xl border border-dashed border-border bg-card p-8 text-center shadow-[var(--shadow-soft)]">
      <div className="mx-auto mb-3 text-4xl" aria-hidden>{icon}</div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {body && <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>}
      {actions.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {actions.map((a, i) => {
            const cls = a.primary
          ? 'rounded-full px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-sweet)]'
              : 'rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary'
            const style = a.primary? { background: 'var(--gradient-warm)' } : undefined
            if (a.kind === 'link') {
              return (
                <Link key={i} href={a.href} className={cls} style={style}>
                  {a.label}
                </Link>
              )
            }
            return (
              <button key={i} onClick={a.onClick} className={cls} style={style}>
                {a.label}
              </button>
            )
          })}
        </div>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
