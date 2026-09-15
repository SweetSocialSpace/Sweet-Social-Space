'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from '@/lib/translations'

type AdminPostDTO = { id: string; body: string; tag: string | null; zip_code: string | null; visibility: 'published' | 'draft' | 'unpublished'; author_is_bot: boolean; author_name: string | null; user_id: string; created_at: string }
type PostVisibility = 'published' | 'draft' | 'unpublished'

async function listAdminPosts(filter: any): Promise<AdminPostDTO[]> {
  try {
    const supabase = createClient() as any
    let query = supabase.from('posts').select('*, profiles(full_name, is_bot)').order('created_at', { ascending: false }).limit(50)
    if (filter.user_id) query = query.eq('user_id', filter.user_id)
    if (filter.user_ids) query = query.in('user_id', filter.user_ids)
    if (filter.zip_code) query = query.eq('zip_code', filter.zip_code)
    if (filter.search) { const safe = String(filter.search).slice(0,80).replace(/[%_]/g,''); if (safe) query = query.ilike('body', `%${safe}%`) }
    const { data, error } = await query
    if (error) throw error
    return (data || []).map((p: any) => ({ ...p, author_name: p.profiles?.full_name, author_is_bot: p.profiles?.is_bot || false }))
  } catch { return [] }
}
async function updateAdminPost({ id, body, tag }: any) { const supabase = createClient() as any; const { error } = await supabase.from('posts').update({ body, tag }).eq('id', id); if (error) throw error }
async function deleteAdminPost({ id }: any) { const supabase = createClient() as any; const { error } = await supabase.from('posts').delete().eq('id', id); if (error) throw error }
async function setAdminPostVisibility({ id, visibility }: any) { const supabase = createClient() as any; const { error } = await supabase.from('posts').update({ visibility }).eq('id', id); if (error) throw error }
async function listPostAuditLog(filter: any): Promise<any[]> {
  try {
    const supabase = createClient() as any
    let q = supabase.from('post_audit_log').select('*').order('created_at', { ascending: false }).limit(filter.limit || 200)
    const { data, error } = await q
    if (error) throw error
    return data || []
  } catch { return [] }
}

function Button({ size, variant, onClick, disabled, children,...props }: any) {
  const base = 'rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50'
  const variants: any = { default: 'bg-primary text-primary-foreground hover:bg-primary/90', outline: 'border border-border bg-background hover:bg-secondary', secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80', ghost: 'hover:bg-secondary', destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' }
  return <button onClick={(e)=>{ try { onClick?.(e) } catch {} }} disabled={disabled} className={`${base} ${variants[variant] || variants.default}`} {...props}>{children}</button>
}
function Input(props: any) { return <input {...props} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" /> }
function Textarea(props: any) { return <textarea {...props} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" /> }
function Badge({ className, variant, children }: any) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold'
  const variants: any = { default: 'bg-primary/10 text-primary', secondary: 'bg-secondary text-secondary-foreground', outline: 'border border-border' }
  return <span className={`${base} ${variants[variant] || variants.default} ${className || ''}`}>{children}</span>
}
function AlertDialog({ children }: any) { return <>{children}</> }
function AlertDialogTrigger({ children }: any) { return children }
function AlertDialogContent({ children }: any) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="rounded-2xl bg-card p-6 max-w-md">{children}</div></div> }
function AlertDialogHeader({ children }: any) { return <div className="mb-4">{children}</div> }
function AlertDialogTitle({ children }: any) { return <h3 className="text-lg font-semibold">{children}</h3> }
function AlertDialogDescription({ children }: any) { return <p className="text-sm text-muted-foreground">{children}</p> }
function AlertDialogFooter({ children }: any) { return <div className="mt-4 flex justify-end gap-2">{children}</div> }
function AlertDialogCancel({ children }: any) { return <Button variant="ghost">{children}</Button> }
function AlertDialogAction({ onClick, children }: any) { return <Button variant="destructive" onClick={onClick}>{children}</Button> }
const toast = { success: (msg: string) => { try { console.log(`✓ ${msg}`) } catch {} }, error: (msg: string) => { try { console.log(`✗ ${msg}`) } catch {} } }

type Props = { title?: string; description?: string; userId?: string; userIds?: string[]; scope: string; zip_code?: string; showSearch?: boolean }

export function PostsCmsPanel({ title = 'Posts CMS', description, userId, userIds, scope, zip_code, showSearch = true }: Props) {
  const t = useTranslations() as any
  function visibilityBadge(v: PostVisibility) { if (v === 'published') return <Badge className="bg-green-600">{t?.cms?.published || 'Published'}</Badge>; if (v === 'draft') return <Badge variant="secondary">{t?.cms?.draft || 'Draft'}</Badge>; return <Badge variant="outline">{t?.cms?.unpublished || 'Unpublished'}</Badge> }

  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [editTag, setEditTag] = useState('')
  const [busy, setBusy] = useState(false)
  const [posts, setPosts] = useState<AdminPostDTO[]>([])
  const [audit, setAudit] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = async () => {
    try { setIsLoading(true); const filter = { user_id: userId, user_ids: userIds, zip_code: zip_code, search: search || undefined }; const [p, a] = await Promise.all([listAdminPosts(filter), listPostAuditLog({ user_id: userId, user_ids: userIds, limit: 200 })]); setPosts(p); setAudit(a) } catch (err: any) { toast.error(err?.message?? (t?.cms?.failedToLoad || 'Failed to load')) } finally { try { setIsLoading(false) } catch {} }
  }

  useEffect(() => { refresh() }, [search, userId, zip_code])
  const invalidate = () => { try { refresh() } catch {} }
  const beginEdit = (p: AdminPostDTO) => { setEditingId(p.id); setEditBody(p.body); setEditTag(p.tag?? '') }
  const saveEdit = async () => {
    if (!editingId) return; if (!editBody.trim()) { toast.error(t?.cms?.bodyCannotBeEmpty || 'Body cannot be empty'); return }
    setBusy(true)
    try { await updateAdminPost({ id: editingId, body: editBody.trim(), tag: editTag.trim() }); toast.success(t?.cms?.postUpdated || 'Post updated'); setEditingId(null); invalidate() } catch (err: any) { toast.error(err?.message?? (t?.cms?.failedToUpdate || 'Failed to update')) } finally { try { setBusy(false) } catch {} }
  }
  const onDelete = async (id: string) => { try { await deleteAdminPost({ id }); toast.success(t?.cms?.postDeleted || 'Post deleted'); if (editingId === id) setEditingId(null); invalidate() } catch (err: any) { toast.error(err?.message?? (t?.cms?.failedToDelete || 'Failed to delete')) } }
  const onSetVis = async (id: string, visibility: PostVisibility) => { try { await setAdminPostVisibility({ id, visibility }); toast.success(`${t?.cms?.marked || 'Marked'} ${visibility}`); invalidate() } catch (err: any) { toast.error(err?.message?? (t?.cms?.failed || 'Failed')) } }

  return (
    <section className="space-y-6">
      <header><h2 className="font-display text-xl font-semibold">{title || (t?.cms?.title || 'Posts CMS')}</h2>{description && (<p className="mt-1 text-sm text-muted-foreground">{description}</p>)}</header>
      {showSearch && (<Input placeholder={t?.cms?.searchPlaceholder || 'Search post body…'} value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} maxLength={120} />)}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">{t?.cms?.posts || 'Posts'} ({posts.length}) {zip_code? `• ${zip_code}`:''}</h3>
        {isLoading && <p className="text-sm text-muted-foreground">{t?.common?.loading || 'Loading…'} </p>}
        {!isLoading && posts.length === 0 && (<p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">{t?.cms?.noPostsMatch || 'No posts match this filter.'}</p>)}
        {posts.map((p) => {
          const isEditing = editingId === p.id
          return (
            <article key={p.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">{visibilityBadge(p.visibility)}{p.author_is_bot && <Badge variant="outline">🤖 {t?.cms?.bot || 'Bot'}</Badge>}{p.tag && <Badge variant="outline">{p.tag}</Badge>}{p.zip_code && (<Badge variant="outline">ZIP {p.zip_code}</Badge>)}<span className="text-xs text-muted-foreground">{p.author_name?? p.user_id.slice(0, 8)}</span><span className="ml-auto text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</span></div>
              {isEditing? (
                <div className="mt-3 space-y-3"><label className="block text-sm"><span className="text-muted-foreground">{t?.cms?.tag || 'Tag'}</span><Input value={editTag} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTag(e.target.value)} maxLength={40} /></label><label className="block text-sm"><span className="text-muted-foreground">{t?.cms?.body || 'Body'} ({editBody.length}/2000)</span><Textarea value={editBody} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditBody(e.target.value)} maxLength={2000} rows={6} /></label><div className="flex gap-2"><Button size="sm" onClick={saveEdit} disabled={busy}>💾 {t?.cms?.save || 'Save'}</Button><Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>{t?.common?.cancel || 'Cancel'}</Button></div></div>
              ) : (<pre className="mt-2 whitespace-pre-wrap text-sm">{p.body}</pre>)}
              {!isEditing && (<div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => beginEdit(p)}>✏ {t?.cms?.edit || 'Edit'}</Button>{p.visibility!== 'published' && (<Button size="sm" onClick={() => onSetVis(p.id, 'published')}>📢 {t?.cms?.publish || 'Publish'}</Button>)}{p.visibility === 'published' && (<Button size="sm" variant="secondary" onClick={() => onSetVis(p.id, 'unpublished')}>🙈 {t?.cms?.unpublish || 'Unpublish'}</Button>)}{p.visibility!== 'draft' && (<Button size="sm" variant="ghost" onClick={() => onSetVis(p.id, 'draft')}>📝 {t?.cms?.markAsDraft || 'Mark as draft'}</Button>)}<AlertDialog><AlertDialogTrigger><Button size="sm" variant="destructive">🗑 {t?.cms?.delete || 'Delete'}</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t?.cms?.deleteThisPost || 'Delete this post?'}</AlertDialogTitle><AlertDialogDescription>{t?.cms?.deleteDesc || 'This permanently removes the post from the feed. The audit log entry remains.'}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t?.common?.cancel || 'Cancel'}</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(p.id)}>{t?.cms?.delete || 'Delete'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>)}
            </article>
          )
        })}
      </div>
      <div className="space-y-3"><h3 className="text-sm font-semibold">{t?.cms?.auditLog || 'Audit log'} ({audit.length})</h3><div className="rounded-xl border border-border bg-card">{audit.length === 0 && (<p className="p-4 text-sm text-muted-foreground">{t?.cms?.noActionsYet || 'No actions yet.'}</p>)}{audit.map((row) => (<div key={row.id} className="border-b border-border p-3 text-sm last:border-b-0"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className="text-xs uppercase">{row.action}</Badge><span className="font-medium">{row.actor_is_bot? '🤖 ' : ''}{row.actor_name?? row.actor_id?.slice(0, 8)?? 'system'}</span><span className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</span>{row.post_id && (<span className="ml-auto font-mono text-xs text-muted-foreground">{row.post_id.slice(0, 8)}</span>)}</div>{row.snapshot?.body && (<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">"{String(row.snapshot.body).slice(0, 160)}"</p>)}</div>))}</div></div>
    </section>
  )
}
