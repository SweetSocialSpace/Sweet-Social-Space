'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

// TODO: We'll port these files later from Lovable
// import {
// listAllVerifiedSources,
// adminCreateVerifiedSource,
// adminReviewVerifiedSource,
// adminDeleteVerifiedSource,
// adminUpdateVerifiedSource,
// type VerifiedSourceAdminRow,
// } from '@/lib/verified-admin.functions'

// Stub types until we port the real files
type VerifiedSourceAdminRow = {
  id: string
  name: string
  slug: string
  kind: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  logo_emoji: string | null
  description: string | null
  website: string | null
  contact_email: string | null
  contact_name: string | null
  contact_phone: string | null
  city: string | null
  state_code: string | null
  country_code: string | null
  latitude: number | null
  longitude: number | null
  review_notes: string | null
}

// Stub functions - replace with real server actions when we port lib/verified-admin.functions.ts
async function listAllVerifiedSources({ data }: any): Promise<VerifiedSourceAdminRow[]> {
  const { data: rows, error } = await supabase
.from('verified_sources')
.select('*')
.order('created_at', { ascending: false })
  if (error) throw error
  return rows as VerifiedSourceAdminRow[]
}

async function adminCreateVerifiedSource({ data }: any) {
  const { error } = await supabase.from('verified_sources').insert(data)
  if (error) throw error
}

async function adminReviewVerifiedSource({ data }: any) {
  const { error } = await supabase
.from('verified_sources')
.update({ status: data.status, review_notes: data.review_notes })
.eq('id', data.id)
  if (error) throw error
}

async function adminDeleteVerifiedSource({ data }: any) {
  const { error } = await supabase.from('verified_sources').delete().eq('id', data.id)
  if (error) throw error
}

async function adminUpdateVerifiedSource({ data }: any) {
  const { id,...updates } = data
  const { error } = await supabase.from('verified_sources').update(updates).eq('id', id)
  if (error) throw error
}

const KIND_OPTIONS = [
  { value: 'gov', label: 'Government' },
  { value: 'police', label: 'Police' },
  { value: 'fire', label: 'Fire' },
  { value: 'school', label: 'School' },
  { value: 'news', label: 'News' },
  { value: 'assoc', label: 'Community group' },
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
] as const

type Kind = typeof KIND_OPTIONS[number]['value']
type StatusTab = 'pending' | 'approved' | 'rejected' | 'suspended' | 'all'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

async function forwardGeocode(city: string, state: string) {
  if (!city) return { lat: null as number | null, lng: null as number | null }
  const q = encodeURIComponent([city, state].filter(Boolean).join(', '))
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`)
    if (!r.ok) return { lat: null, lng: null }
    const j: any = await r.json()
    if (!Array.isArray(j) || j.length === 0) return { lat: null, lng: null }
    return { lat: Number(j[0].lat), lng: Number(j[0].lon) }
  } catch {
    return { lat: null, lng: null }
  }
}

export function AdminVerifiedSources() {
  const [tab, setTab] = useState<StatusTab>('pending')
  const [kindFilter, setKindFilter] = useState<'' | Kind>('')
  const [cityFilter, setCityFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [rows, setRows] = useState<VerifiedSourceAdminRow[] | null>(null)
  const [err, setErr] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [editing, setEditing] = useState<VerifiedSourceAdminRow | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    let cancelled = false
    setRows(null)
    listAllVerifiedSources({
      data: {
        status: tab,
        kind: kindFilter || undefined,
        city: cityFilter.trim() || undefined,
        state_code: stateFilter.trim() || undefined,
        q: debouncedSearch || undefined,
      } as any,
    })
  .then((r) => { if (!cancelled) setRows(r) })
  .catch((e) => { if (!cancelled) setErr(e?.message?? 'Failed to load') })
    return () => { cancelled = true }
  }, [tab, kindFilter, cityFilter, stateFilter, debouncedSearch, reloadKey])

  const reload = () => setReloadKey((n) => n + 1)

  async function setStatus(id: string, status: 'approved' | 'rejected' | 'suspended' | 'pending', notes?: string | null) {
    try {
      await adminReviewVerifiedSource({ data: { id, status, review_notes: notes?? null } })
      reload()
    } catch (e: any) {
      alert(e?.message?? 'Failed')
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this organization and all its updates? This cannot be undone.')) return
    try {
      await adminDeleteVerifiedSource({ data: { id } })
      reload()
    } catch (e: any) {
      alert(e?.message?? 'Failed')
    }
  }

  return (
    <div className="space-y-6">
      <CreateForm onCreated={reload} />

      <div className="flex flex-wrap gap-2">
        {(['pending', 'approved', 'rejected', 'suspended', 'all'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize ${
              tab === t? 'border-transparent bg-foreground text-background' : 'border-border bg-background text-muted-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-2 rounded-2xl border border-border bg-card p-3 sm:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name / slug / description"
          className={cls}
        />
        <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value as any)} className={cls}>
          <option value="">All types</option>
          {KIND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} placeholder="City" className={cls} />
        <input
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value.toUpperCase().slice(0, 4))}
          placeholder="State (CA)"
          className={cls}
        />
      </div>

      {err && <p className="text-sm text-destructive">{err}</p>}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {(rows?? []).map((r) => (
            <li key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {r.logo_emoji && <span aria-hidden>{r.logo_emoji}</span>}
                    <span className="font-semibold">{r.name}</span>
                    <StatusBadge status={r.status} />
                    <span className="rounded-full bg-secondary px-2 py-0.5 text- font-semibold capitalize text-muted-foreground">{r.kind}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {[r.city, r.state_code].filter(Boolean).join(', ') || 'No location'}
                    {r.latitude!= null && r.longitude!= null && (
                      <> · {r.latitude.toFixed(3)}, {r.longitude.toFixed(3)}</>
                    )}
                    {r.website && <> · <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">website</a></>}
                    {r.contact_email && <> · {r.contact_email}</>}
                    {r.contact_phone && <> · {r.contact_phone}</>}
                  </div>
                  {r.contact_name && <p className="mt-0.5 text-xs text-muted-foreground">Contact: {r.contact_name}</p>}
                  {r.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>}
                  {r.review_notes && <p className="mt-1 text-xs italic text-muted-foreground">Notes: {r.review_notes}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.status!== 'approved' && (
                    <button onClick={() => setStatus(r.id, 'approved')} className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Approve</button>
                  )}
                  {r.status!== 'rejected' && (
                    <button onClick={() => {
                      const notes = prompt('Reason for rejection (optional):')?? null
                      setStatus(r.id, 'rejected', notes)
                    }} className="rounded-full border border-border px-3 py-1 text-xs font-semibold">Reject</button>
                  )}
                  {r.status!== 'suspended' && (
                    <button onClick={() => {
                      const notes = prompt('Reason for suspension (optional):')?? null
                      setStatus(r.id, 'suspended', notes)
                    }} className="rounded-full border border-yellow-600 px-3 py-1 text-xs font-semibold text-yellow-700">Suspend</button>
                  )}
                  <button onClick={() => setEditing(r)} className="rounded-full border border-border px-3 py-1 text-xs font-semibold">Edit</button>
                  <button onClick={() => remove(r.id)} className="rounded-full border border-destructive px-3 py-1 text-xs font-semibold text-destructive">Delete</button>
                </div>
              </div>
            </li>
          ))}
          {rows!== null && rows.length === 0 && (
            <li className="p-6 text-center text-sm text-muted-foreground">No organizations match these filters.</li>
          )}
          {rows === null && <li className="p-6 text-center text-sm text-muted-foreground">Loading…</li>}
        </ul>
      </div>

      {editing && (
        <EditModal
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload() }}
        />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'approved'? 'bg-primary/10 text-primary'
    : status === 'pending'? 'bg-yellow-500/15 text-yellow-700'
    : status === 'suspended'? 'bg-orange-500/15 text-orange-700'
    : 'bg-destructive/15 text-destructive'
  return <span className={`rounded-full px-2 py-0.5 text- font-semibold capitalize ${tone}`}>{status}</span>
}

function CreateForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [kind, setKind] = useState<Kind>('gov')
  const [emoji, setEmoji] = useState('')
  const [city, setCity] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => { if (!slugTouched) setSlug(slugify(name)) }, [name, slugTouched])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (!name.trim() ||!city.trim() ||!stateCode.trim()) {
      setErr('Name, city, and state are required.')
      return
    }
    setSubmitting(true)
    try {
      const geo = await forwardGeocode(city, stateCode)
      await adminCreateVerifiedSource({
        data: {
          name: name.trim(),
          slug: slug.trim() || slugify(name),
          kind,
          logo_emoji: emoji.trim() || null,
          description: description.trim() || null,
          website: website.trim() || null,
          contact_email: null,
          city: city.trim(),
          state_code: stateCode.trim().toUpperCase(),
          country_code: 'US',
          latitude: geo.lat,
          longitude: geo.lng,
          status: 'approved',
        } as any,
      })
      setName(''); setSlug(''); setSlugTouched(false); setEmoji('')
      setCity(''); setStateCode(''); setWebsite(''); setDescription('')
      setOpen(false)
      onCreated()
    } catch (e: any) {
      setErr(e?.message?? 'Failed to create')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background">
        + Create verified source
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">New verified source</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name *" required className={cls} />
        <input value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')) }} placeholder="slug" className={cls} />
        <select value={kind} onChange={(e) => setKind(e.target.value as Kind)} className={cls}>
          {KIND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} placeholder="Emoji (🏛)" className={cls} />
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City *" required className={cls} />
        <input value={stateCode} onChange={(e) => setStateCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="State (CA) *" required className={cls} />
        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://website" className={`${cls} sm:col-span-2`} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} className={`${cls} sm:col-span-2`} />
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {submitting? 'Creating…' : 'Create (approved)'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
      </div>
    </form>
  )
}

function EditModal({ row, onClose, onSaved }: { row: VerifiedSourceAdminRow; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(row.name)
  const [kind, setKind] = useState<Kind>(row.kind as Kind)
  const [emoji, setEmoji] = useState(row.logo_emoji?? '')
  const [description, setDescription] = useState(row.description?? '')
  const [website, setWebsite] = useState(row.website?? '')
  const [contactEmail, setContactEmail] = useState(row.contact_email?? '')
  const [contactName, setContactName] = useState(row.contact_name?? '')
  const [contactPhone, setContactPhone] = useState(row.contact_phone?? '')
  const [city, setCity] = useState(row.city?? '')
  const [stateCode, setStateCode] = useState(row.state_code?? '')
  const [latitude, setLatitude] = useState<string>(row.latitude?.toString()?? '')
  const [longitude, setLongitude] = useState<string>(row.longitude?.toString()?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function save() {
    setErr(null)
    setSaving(true)
    try {
      const lat = latitude.trim() === ''? null : Number(latitude)
      const lng = longitude.trim() === ''? null : Number(longitude)
      if ((lat!== null && Number.isNaN(lat)) || (lng!== null && Number.isNaN(lng))) {
        throw new Error('Latitude and longitude must be numeric.')
      }
      await adminUpdateVerifiedSource({
        data: {
          id: row.id,
          name: name.trim(),
          kind,
          logo_emoji: emoji.trim() || null,
          description: description.trim() || null,
          website: website.trim() || null,
          contact_email: contactEmail.trim() || null,
          contact_name: contactName.trim() || null,
          contact_phone: contactPhone.trim() || null,
          city: city.trim() || null,
          state_code: stateCode.trim().toUpperCase() || null,
          latitude: lat,
          longitude: lng,
        } as any,
      })
      onSaved()
    } catch (e: any) {
      setErr(e?.message?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function regeocode() {
    const geo = await forwardGeocode(city, stateCode)
    if (geo.lat!= null) setLatitude(String(geo.lat))
    if (geo.lng!= null) setLongitude(String(geo.lng))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Edit verified source</h3>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={cls} />
          <select value={kind} onChange={(e) => setKind(e.target.value as Kind)} className={cls}>
            {KIND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} placeholder="Emoji" className={cls} />
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://website" className={cls} />
          <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Contact name" className={cls} />
          <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Contact email" className={cls} />
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Contact phone" className={cls} />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={cls} />
          <input value={stateCode} onChange={(e) => setStateCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="State (CA)" className={cls} />
          <div className="flex gap-2 sm:col-span-2">
            <input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Latitude" className={cls} />
            <input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Longitude" className={cls} />
            <button type="button" onClick={regeocode} className="whitespace-nowrap rounded-xl border border-border px-3 text-sm">Re-geocode</button>
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Description" className={`${cls} sm:col-span-2`} />
        </div>
        {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {saving? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

const cls = 'rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary'
