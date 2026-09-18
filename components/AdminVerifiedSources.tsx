'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from '@/lib/translations'

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

async function listAllVerifiedSources({ data }: any): Promise<VerifiedSourceAdminRow[]> {
  const supabase = createClient()
  const { data: rows, error } = await supabase
.from('verified_sources')
.select('*')
.order('created_at', { ascending: false })
  if (error) throw error
  return rows as VerifiedSourceAdminRow[]
}

async function adminCreateVerifiedSource({ data }: any) {
  const supabase = createClient()
  const { error } = await supabase.from('verified_sources').insert(data)
  if (error) throw error
}

async function adminReviewVerifiedSource({ data }: any) {
  const supabase = createClient()
  const { error } = await supabase
.from('verified_sources')
.update({ status: data.status, review_notes: data.review_notes })
.eq('id', data.id)
  if (error) throw error
}

async function adminDeleteVerifiedSource({ data }: any) {
  const supabase = createClient()
  const { error } = await supabase.from('verified_sources').delete().eq('id', data.id)
  if (error) throw error
}

async function adminUpdateVerifiedSource({ data }: any) {
  const supabase = createClient()
  const { id,...updates } = data
  const { error } = await supabase.from('verified_sources').update(updates).eq('id', id)
  if (error) throw error
}

const KIND_OPTIONS = [
  { value: 'gov' },
  { value: 'police' },
  { value: 'fire' },
  { value: 'school' },
  { value: 'news' },
  { value: 'assoc' },
  { value: 'nonprofit' },
  { value: 'business' },
  { value: 'other' },
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
  const t = useTranslations() as any
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
    const tmr = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(tmr)
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
.catch((e) => { if (!cancelled) setErr(e?.message?? t?.admin?.failedLoad) })
    return () => { cancelled = true }
  }, [tab, kindFilter, cityFilter, stateFilter, debouncedSearch, reloadKey, t])

  const reload = () => setReloadKey((n) => n + 1)

  async function setStatus(id: string, status: 'approved' | 'rejected' | 'suspended' | 'pending', notes?: string | null) {
    try {
      await adminReviewVerifiedSource({ data: { id, status, review_notes: notes?? null } })
      reload()
    } catch (e: any) {
      alert(e?.message?? t?.common?.failed)
    }
  }

  async function remove(id: string) {
    if (!confirm(t?.admin?.deleteConfirm)) return
    try {
      await adminDeleteVerifiedSource({ data: { id } })
      reload()
    } catch (e: any) {
      alert(e?.message?? t?.common?.failed)
    }
  }

  return (
    <div className="space-y-6">
      <CreateForm onCreated={reload} />

      <div className="flex flex-wrap gap-2">
        {(['pending', 'approved', 'rejected', 'suspended', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize ${
              tab === s? 'border-transparent bg-foreground text-background' : 'border-border bg-background text-muted-foreground'
            }`}
          >
            {t?.admin?.[s]}
          </button>
        ))}
      </div>

      <div className="grid gap-2 rounded-2xl border border-border bg-card p-3 sm:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t?.admin?.searchPlaceholder}
          className={cls}
        />
        <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value as any)} className={cls}>
          <option value="">{t?.admin?.allTypes}</option>
          {KIND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{t?.admin?.kinds?.[o.value]}</option>)}
        </select>
        <input value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} placeholder={t?.admin?.city} className={cls} />
        <input
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value.toUpperCase().slice(0, 4))}
          placeholder={t?.admin?.statePh}
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
                    <StatusBadge status={r.status} t={t} />
                    <span className="rounded-full bg-secondary px-2 py-0.5 text- font-semibold capitalize text-muted-foreground">{t?.admin?.kinds?.[r.kind]}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {[r.city, r.state_code].filter(Boolean).join(', ') || t?.admin?.noLocation}
                    {r.latitude!= null && r.longitude!= null && (
                      <> · {r.latitude.toFixed(3)}, {r.longitude.toFixed(3)}</>
                    )}
                    {r.website && <> · <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t?.admin?.website}</a></>}
                    {r.contact_email && <> · {r.contact_email}</>}
                    {r.contact_phone && <> · {r.contact_phone}</>}
                  </div>
                  {r.contact_name && <p className="mt-0.5 text-xs text-muted-foreground">{t?.admin?.contact}: {r.contact_name}</p>}
                  {r.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>}
                  {r.review_notes && <p className="mt-1 text-xs italic text-muted-foreground">{t?.admin?.notes}: {r.review_notes}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.status!== 'approved' && (
                    <button onClick={() => setStatus(r.id, 'approved')} className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{t?.admin?.approve}</button>
                  )}
                  {r.status!== 'rejected' && (
                    <button onClick={() => {
                      const notes = prompt(t?.admin?.rejectReason)?? null
                      setStatus(r.id, 'rejected', notes)
                    }} className="rounded-full border border-border px-3 py-1 text-xs font-semibold">{t?.admin?.reject}</button>
                  )}
                  {r.status!== 'suspended' && (
                    <button onClick={() => {
                      const notes = prompt(t?.admin?.suspendReason)?? null
                      setStatus(r.id, 'suspended', notes)
                    }} className="rounded-full border border-yellow-600 px-3 py-1 text-xs font-semibold text-yellow-700">{t?.admin?.suspend}</button>
                  )}
                  <button onClick={() => setEditing(r)} className="rounded-full border border-border px-3 py-1 text-xs font-semibold">{t?.common?.edit}</button>
                  <button onClick={() => remove(r.id)} className="rounded-full border border-destructive px-3 py-1 text-xs font-semibold text-destructive">{t?.common?.delete}</button>
                </div>
              </div>
            </li>
          ))}
          {rows!== null && rows.length === 0 && (
            <li className="p-6 text-center text-sm text-muted-foreground">{t?.admin?.noMatch}</li>
          )}
          {rows === null && <li className="p-6 text-center text-sm text-muted-foreground">{t?.common?.loading}</li>}
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

function StatusBadge({ status, t }: { status: string; t: any }) {
  const tone =
    status === 'approved'? 'bg-primary/10 text-primary'
    : status === 'pending'? 'bg-yellow-500/15 text-yellow-700'
    : status === 'suspended'? 'bg-orange-500/15 text-orange-700'
    : 'bg-destructive/15 text-destructive'
  return <span className={`rounded-full px-2 py-0.5 text- font-semibold capitalize ${tone}`}>{t?.admin?.[status] || status}</span>
}

function CreateForm({ onCreated }: { onCreated: () => void }) {
  const t = useTranslations() as any
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [kind, setKind] = useState<Kind>('gov')
  const [emoji, setEmoji] = useState('')
  const [city, setCity] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => { if (!slugTouched) setSlug(slugify(name)) }, [name, slugTouched])

    async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (!name.trim() ||!city.trim() ||!stateCode.trim() ||!countryCode.trim()) {
      setErr(t?.admin?.requiredFields)
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
          country_code: countryCode.trim().toUpperCase(),
          latitude: geo.lat,
          longitude: geo.lng,
          status: 'approved',
        } as any,
      })
      setName(''); setSlug(''); setSlugTouched(false); setEmoji('')
      setCity(''); setStateCode(''); setCountryCode(''); setWebsite(''); setDescription('')
      setOpen(false)
      onCreated()
    } catch (e: any) {
      setErr(e?.message?? t?.admin?.createFailed)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background">
        {t?.admin?.createVerified}
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">{t?.admin?.newSource}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t?.admin?.name} required className={cls} />
        <input value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')) }} placeholder="slug" className={cls} />
        <select value={kind} onChange={(e) => setKind(e.target.value as Kind)} className={cls}>
          {KIND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{t?.admin?.kinds?.[o.value]}</option>)}
        </select>
        <input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} placeholder={t?.admin?.emojiPh} className={cls} />
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t?.admin?.city} required className={cls} />
        <input value={stateCode} onChange={(e) => setStateCode(e.target.value.toUpperCase().slice(0, 4))} placeholder={t?.admin?.statePh} required className={cls} />
        <input value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase().slice(0, 2))} placeholder={t?.admin?.countryPh} required className={cls} />
        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://website" className={cls} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t?.admin?.description} rows={2} className={`${cls} sm:col-span-2`} />
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {submitting? t?.admin?.creating : t?.admin?.createApproved}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2 text-sm">{t?.common?.cancel}</button>
      </div>
    </form>
  )
}

function EditModal({ row, onClose, onSaved }: { row: VerifiedSourceAdminRow; onClose: () => void; onSaved: () => void }) {
  const t = useTranslations() as any
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
  const [countryCode, setCountryCode] = useState(row.country_code?? '')
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
        throw new Error(t?.admin?.latLngNumeric)
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
          country_code: countryCode.trim().toUpperCase() || null,
          latitude: lat,
          longitude: lng,
        } as any,
      })
      onSaved()
    } catch (e: any) {
      setErr(e?.message?? t?.admin?.saveFailed)
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
          <h3 className="font-display text-lg font-semibold">{t?.admin?.editTitle}</h3>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">{t?.common?.close}</button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t?.admin?.name} className={cls} />
          <select value={kind} onChange={(e) => setKind(e.target.value as Kind)} className={cls}>
            {KIND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{t?.admin?.kinds?.[o.value]}</option>)}
          </select>
          <input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} placeholder={t?.admin?.emojiPh} className={cls} />
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://website" className={cls} />
          <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder={t?.admin?.contactName} className={cls} />
          <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder={t?.admin?.contactEmail} className={cls} />
                    <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder={t?.admin?.contactPhone} className={cls} />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t?.admin?.city} className={cls} />
          <input value={stateCode} onChange={(e) => setStateCode(e.target.value.toUpperCase().slice(0, 4))} placeholder={t?.admin?.statePh} className={cls} />
          <input value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase().slice(0, 2))} placeholder={t?.admin?.countryPh} className={cls} />
          <div className="flex gap-2 sm:col-span-2">
            <input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder={t?.admin?.latitude} className={cls} />
            <input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder={t?.admin?.longitude} className={cls} />
            <button type="button" onClick={regeocode} className="whitespace-nowrap rounded-xl border border-border px-3 text-sm">{t?.admin?.regeocode}</button>
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder={t?.admin?.description} className={`${cls} sm:col-span-2`} />
        </div>
        {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm">{t?.common?.cancel}</button>
          <button onClick={save} disabled={saving} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {saving? t?.admin?.saving : t?.admin?.saveChanges}
          </button>
        </div>
      </div>
    </div>
  )
}

const cls = 'rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary'
