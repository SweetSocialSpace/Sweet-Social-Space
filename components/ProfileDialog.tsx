'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ProfileDialog({ onClose }: { onClose: () => void }) {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [block, setBlock] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return
      setUserId(u.user.id)
      const { data } = await supabase
       .from('profiles')
       .select('display_name, bio, block, avatar_url')
       .eq('user_id', u.user.id)
       .maybeSingle()
      if (data) {
        setDisplayName(data.display_name?? '')
        setBio(data.bio?? '')
        setBlock(data.block?? '')
        setAvatarUrl((data as any).avatar_url?? null)
      }
    })()
  }, [])

  useEffect(() => {
    if (!avatarUrl) return
    // If avatarUrl is a storage path (not http), resolve to signed URL for preview
    if (avatarUrl.startsWith('http')) return
    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase.storage.from('avatars').createSignedUrl(avatarUrl, 60 * 60)
      if (!cancelled && data?.signedUrl) setPreviewUrl(data.signedUrl)
    })()
    return () => { cancelled = true }
  }, [avatarUrl])

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file ||!userId) return
    setErr('')
    setMsg('')

    if (!file.type.startsWith('image/')) {
      setErr('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr('Image must be 5 MB or smaller.')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
      const path = `${userId}/avatar-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
       .from('avatars')
       .upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type })
      if (upErr) {
        setErr(upErr.message)
        return
      }
      const { error: updErr } = await supabase
       .from('profiles')
       .update({ avatar_url: path })
       .eq('user_id', userId)
      if (updErr) {
        setErr(updErr.message)
        return
      }
      setAvatarUrl(path)
      const { data: signed } = await supabase.storage.from('avatars').createSignedUrl(path, 60 * 60)
      setPreviewUrl(signed?.signedUrl?? null)
      setMsg('Profile picture updated.')
    } finally {
      setUploading(false)
    }
  }

  const removeAvatar = async () => {
    if (!userId) return
    setErr('')
    setMsg('')
    setUploading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
       .from('profiles')
       .update({ avatar_url: null })
       .eq('user_id', userId)
      if (error) {
        setErr(error.message)
        return
      }
      setAvatarUrl(null)
      setPreviewUrl(null)
      setMsg('Profile picture removed.')
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    setErr('')
    setMsg('')
    const name = displayName.trim()
    if (name.length < 2 || name.length > 40) {
      setErr('Display name must be 2–40 characters.')
      return
    }
    setBusy(true)
    try {
      const supabase = createClient()
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return
      const { error } = await supabase
       .from('profiles')
       .update({ display_name: name, bio: bio.trim() || null, block: block.trim() || null })
       .eq('user_id', u.user.id)
      if (error) {
        setErr(error.message)
        return
      }
      setMsg('Profile saved.')
    } finally {
      setBusy(false)
    }
  }

  const initials = (displayName.trim() || 'N').slice(0, 1).toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="profile-dialog-title"
      >
        <h2 id="profile-dialog-title" className="font-display text-lg font-semibold">
          Edit profile
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          This is how neighbors see you across Sweet Social Space.
        </p>

        {/* Avatar */}
        <div className="mt-4 flex items-center gap-4">
          <div
            className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-border"
            style={{ background: 'var(--gradient-warm)' }}
          >
            {(previewUrl || (avatarUrl && avatarUrl.startsWith('http')))? (
              <img src={previewUrl || avatarUrl!} alt="Your profile picture" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary-foreground">{initials}</span>
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Profile picture</div>
            <p className="text- text-muted-foreground">JPG or PNG, up to 5 MB.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50"
              >
                {uploading? 'Uploading…' : avatarUrl? 'Change photo' : 'Upload photo'}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  disabled={uploading}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickFile}
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-xs font-medium text-muted-foreground">
            Display name
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="block text-xs font-medium text-muted-foreground">
            Block or neighborhood (optional)
            <input
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              maxLength={80}
              placeholder="e.g. Elm St."
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="block text-xs font-medium text-muted-foreground">
            Bio (optional)
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="mt-1 block text- text-muted-foreground">{bio.length}/200</span>
          </label>
        </div>

        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        {msg && <p className="mt-3 text-sm text-green-700">{msg}</p>}

        <div className="mt-5 flex items-center justify-between gap-3">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">
            Close
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            style={{ background: 'var(--gradient-warm)', boxShadow: 'var(--shadow-sweet)' }}
          >
            {busy? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
