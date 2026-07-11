'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// TODO: Port lib/admin-posts.functions.ts and replace these stubs
type AdminPostDTO = {
  id: string
  body: string
  tag: string | null
  zip_code: string | null
  visibility: 'published' | 'draft' | 'unpublished'
  author_is_bot: boolean
  author_name: string | null
  user_id: string
  created_at: string
}

type PostVisibility = 'published' | 'draft' | 'unpublished'

// Stub server functions - replace with real API routes when you port admin-posts.functions
async function listAdminPosts(filter: any): Promise<AdminPostDTO[]> {
  const supabase = createClient()
  let query = supabase.from('posts').select('*, profiles(full_name, is_bot)').order('created_at', { ascending: false })

  if (filter.user_id) query = query.eq('user_id', filter.user_id)
  if (filter.user_ids) query = query.in('user_id', filter.user_ids)
  if (filter.search) query = query.ilike('body', `%${filter.search}%`)

  const { data, error } = await query
  if (error) throw error

  return (data || []).map((p: any) => ({
   ...p,
    author_name: p.profiles?.full_name,
    author_is_bot: p.profiles?.is_bot || false,
  }))
}

async function updateAdminPost({ id, body, tag }: any) {
  const supabase = createClient()
  const { error } = await supabase.from('posts').update({ body, tag }).eq('id', id)
  if (error) throw error
}

async function deleteAdminPost({ id }: any) {
  const supabase = createClient()
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}

async function setAdminPostVisibility({ id, visibility }: any) {
  const supabase = createClient()
  const { error } = await supabase.from('posts').update({ visibility }).eq('id', id)
  if (error) throw error
}

async function listPostAuditLog(filter: any): Promise<any[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('post_audit_log').select('*').order('created_at', { ascending: false }).limit(filter.limit || 200)
  if (error) throw error
  return data || []
}

// TODO: Replace with shadcn/ui components
function Button({ size, variant, onClick, disabled, children,...props }: any) {
  const base = 'rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50'
  const variants: any = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-border bg-background hover:bg-secondary',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-secondary',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  }
  return <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant] || variants.default}`} {...props}>{children}</button>
}

function Input(props: any) {
  return <input {...props} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
}

function Textarea(props: any) {
  return <textarea {...props} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
}

function Badge({ className, variant, children }: any) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold'
  const variants: any = {
    default: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border',
  }
  return <span className={`${base} ${variants[variant] || variants.default} ${className || ''}`}>{children}</span>
}

// Stub AlertDialog - replace with shadcn/ui
function AlertDialog({ children }: any) { return <>{children}</> }
function AlertDialogTrigger({ asChild, children }: any) { return children }
function AlertDialogContent({ children }: any) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="rounded-2xl bg-card p-6 max-w-md">{children}</div></div>
}
function AlertDialogHeader({ children }: any) { return <div className="mb-4">{children}</div> }
function AlertDialogTitle({ children }: any) { return <h3 className="text-lg font-semibold">{children}</h3> }
function AlertDialogDescription({ children }: any) { return <p className="text-sm text-muted-foreground">{children}</p> }
function AlertDialogFooter({ children }: any) { return <div className="mt-4 flex justify-end gap-2">{children}</div> }
function AlertDialogCancel({ children }: any) { return <Button variant="ghost">{children}</Button> }
function AlertDialogAction({ onClick, children }: any) { return <Button variant="destructive" onClick={onClick}>{children}</Button> }

// Stub toast
const toast = {
  success: (msg: string) => alert(`✓ ${msg}`),
  error: (msg: string) => alert(`✗ ${msg}`),
}

type Props = {
  title?: string
  description?: string
  userId?: string
  userIds?: string[]
  scope: string
  showSearch?: boolean
}

function visibilityBadge(v: PostVisibility) {
  if (v === 'published') return <Badge className="bg-green-600">Published</Badge>
  if (v === 'draft') return <Badge variant="secondary">Draft</Badge>
  return <Badge variant="outline">Unpublished</Badge>
}

export function PostsCmsPanel({
  title = 'Posts CMS',
  description,
  userId,
  userIds,
  scope,
  showSearch = true,
}: Props) {
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [editTag, setEditTag] = useState('')
  const [busy, setBusy] = useState(false)
  const [posts, setPosts] = useState<AdminPostDTO[]>([])
  const [audit, setAudit] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Simple fetch instead of TanStack Query
  const refresh = async () => {
    setIsLoading(true)
    try {
      const filter = { user_id: userId, user_ids: userIds, search: search || undefined }
      const [p, a] = await Promise.all([
        listAdminPosts(filter),
        listPostAuditLog({ user_id: userId, user_ids: userIds, limit: 200 }),
      ])
      setPosts(p)
      setAudit(a)
    } catch (err: any) {
      toast.error(err?.message?? 'Failed to load')
    } finally {
      setIsLoading(false)
    }
  }

  useState(() => { refresh() }) // Initial load

  const invalidate = () => refresh()

  const beginEdit = (p: AdminPostDTO) => {
    setEditingId(p.id)
    setEditBody(p.body)
    setEditTag(p.tag?? '')
  }

  const saveEdit = async () => {
    if (!editingId) return
    if (!editBody.trim()) {
      toast.error('Body cannot be empty')
      return
    }
    setBusy(true)
    try {
      await updateAdminPost({
        id: editingId,
        body: editBody.trim(),
        tag: editTag.trim(),
      })
      toast.success('Post updated')
      setEditingId(null)
      invalidate()
    } catch (err: any) {
      toast.error(err?.message?? 'Failed to update')
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async (id: string) => {
    try {
      await deleteAdminPost({ id })
      toast.success('Post deleted')
      if (editingId === id) setEditingId(null)
      invalidate()
    } catch (err: any) {
      toast.error(err?.message?? 'Failed to delete')
    }
  }

  const onSetVis = async (id: string, visibility: PostVisibility) => {
    try {
      await setAdminPostVisibility({ id, visibility })
      toast.success(`Marked ${visibility}`)
      invalidate()
    } catch (err: any) {
      toast.error(err?.message?? 'Failed')
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </header>

      {showSearch && (
        <Input
          placeholder="Search post body…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxLength={120}
        />
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Posts ({posts.length})</h3>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && posts.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            No posts match this filter.
          </p>
        )}

        {posts.map((p) => {
          const isEditing = editingId === p.id
          return (
            <article
              key={p.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                {visibilityBadge(p.visibility)}
                {p.author_is_bot && <Badge variant="outline">🤖 Bot</Badge>}
                {p.tag && <Badge variant="outline">{p.tag}</Badge>}
                {p.zip_code && (
                  <Badge variant="outline">ZIP {p.zip_code}</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {p.author_name?? p.user_id.slice(0, 8)}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleString()}
                </span>
              </div>

              {isEditing? (
                <div className="mt-3 space-y-3">
                  <label className="block text-sm">
                    <span className="text-muted-foreground">Tag</span>
                    <Input
                      value={editTag}
                      onChange={(e) => setEditTag(e.target.value)}
                      maxLength={40}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-muted-foreground">
                      Body ({editBody.length}/2000)
                    </span>
                    <Textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      maxLength={2000}
                      rows={6}
                    />
                  </label>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit} disabled={busy}>
                      💾 Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <pre className="mt-2 whitespace-pre-wrap text-sm">{p.body}</pre>
              )}

              {!isEditing && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => beginEdit(p)}>
                    ✏ Edit
                  </Button>
                  {p.visibility!== 'published' && (
                    <Button size="sm" onClick={() => onSetVis(p.id, 'published')}>
                      📢 Publish
                    </Button>
                  )}
                  {p.visibility === 'published' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onSetVis(p.id, 'unpublished')}
                    >
                      🙈 Unpublish
                    </Button>
                  )}
                  {p.visibility!== 'draft' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSetVis(p.id, 'draft')}
                    >
                      📝 Mark as draft
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        🗑 Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes the post from the feed. The audit
                          log entry remains.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(p.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </article>
          )
        })}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Audit log ({audit.length})</h3>
        <div className="rounded-xl border border-border bg-card">
          {audit.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No actions yet.</p>
          )}
          {audit.map((row) => (
            <div
              key={row.id}
              className="border-b border-border p-3 text-sm last:border-b-0"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text- uppercase">
                  {row.action}
                </Badge>
                <span className="font-medium">
                  {row.actor_is_bot? '🤖 ' : ''}
                  {row.actor_name?? row.actor_id?.slice(0, 8)?? 'system'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleString()}
                </span>
                {row.post_id && (
                  <span className="ml-auto font-mono text- text-muted-foreground">
                    {row.post_id.slice(0, 8)}
                  </span>
                )}
              </div>
              {row.snapshot?.body && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  "{String(row.snapshot.body).slice(0, 160)}"
                </p>
              )}
              {row.snapshot?.after?.body && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  → "{String(row.snapshot.after.body).slice(0, 160)}"
                </p>
              )}
              {row.snapshot?.from && row.snapshot?.to && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.snapshot.from} → {row.snapshot.to}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
