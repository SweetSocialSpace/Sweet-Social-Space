'use server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

async function getAuthSafe() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    return { supabase, userId: user.id }
  } catch { return null }
}

async function assertAdminSafe(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" })
    return !error && data === true
  } catch { return false }
}

const ERR_DICT: Record<string, { disabled: string; safe: string }> = {
  en: { disabled:"Admin CMS disabled in Phase 1", safe:"Safe mode" },
  es: { disabled:"CMS de administrador deshabilitado en Fase 1", safe:"Modo seguro" },
  fr: { disabled:"CMS admin desactive en Phase 1", safe:"Mode securise" },
  de: { disabled:"Admin-CMS in Phase 1 deaktiviert", safe:"Sicherer Modus" },
  zh: { disabled:"第一阶段管理CMS已禁用", safe:"安全模式" },
  ja: { disabled:"フェーズ1で管理CMS無効", safe:"セーフモード" },
  ko: { disabled:"1단계에서 관리자 CMS 비활성화됨", safe:"안전 모드" },
  pt: { disabled:"CMS admin desativado na Fase 1", safe:"Modo seguro" },
  it: { disabled:"CMS admin disabilitato in Fase 1", safe:"Modalita sicura" },
  nl: { disabled:"Admin CMS uitgeschakeld in Fase 1", safe:"Veilige modus" },
  id: { disabled:"CMS Admin dinonaktifkan di Fase 1", safe:"Mode aman" },
  vi: { disabled:"CMS quan tri bi tat trong Giai doan 1", safe:"Che do an toan" },
  sv: { disabled:"Admin CMS inaktiverat i Fas 1", safe:"Sakert lage" },
  pl: { disabled:"CMS administratora wylaczone w Fazie 1", safe:"Tryb bezpieczny" },
  tr: { disabled:"Yonetici CMS'si Asama 1'de devre disi", safe:"Guvenli mod" },
  ms: { disabled:"CMS Admin dilumpuhkan dalam Fasa 1", safe:"Mod selamat" },
  ro: { disabled:"CMS admin dezactivat in Faza 1", safe:"Mod sigur" },
  cs: { disabled:"Admin CMS zakazano ve Fazi 1", safe:"Bezpecny rezim" },
  hu: { disabled:"Admin CMS letiltva az 1. fazisban", safe:"Biztonsagos mod" },
  fi: { disabled:"Admin CMS poistettu kaytosta Vaiheessa 1", safe:"Vikasietotila" },
  no: { disabled:"Admin CMS deaktivert i Fase 1", safe:"Sikker modus" },
  da: { disabled:"Admin CMS deaktiveret i Fase 1", safe:"Sikker tilstand" },
  hr: { disabled:"Admin CMS onemogucen u Fazi 1", safe:"Siguran nacin" },
  sk: { disabled:"Admin CMS zakazane vo Faze 1", safe:"Bezpecny rezim" },
  sl: { disabled:"Admin CMS onemogocen v Fazi 1", safe:"Varen nacin" },
  et: { disabled:"Admin CMS keelatud 1. faasis", safe:"Turvareziim" },
  az: { disabled:"Admin CMS Faza 1-de deaktivdir", safe:"Tehlukesiz rejim" },
  uz: { disabled:"Admin CMS 1-bosqichda o'chirilgan", safe:"Xavfsiz rejim" },
}

function getErr(lang = "en"): { disabled: string; safe: string } {
  return ERR_DICT[lang] || ERR_DICT.en
}

export type PostVisibility = "published" | "draft" | "unpublished"
export type AdminPostDTO = {
  id: string; user_id: string; author_name: string | null; author_is_bot: boolean;
  body: string; tag: string | null; media_url: string | null; media_type: string | null;
  hidden: boolean; moderation_status: string | null; visibility: PostVisibility;
  zip_code: string | null; created_at: string; updated_at: string
}

function toVisibility(hidden: boolean, status: string | null): PostVisibility {
  try {
    if (!hidden && (status === "visible" || status === null)) return "published"
    if (status === "under_review") return "draft"
    return "unpublished"
  } catch { return "unpublished" }
}

const BOT_IDS = new Set([
  "b0700000-0000-0000-0000-000000911911",
  "b0700000-0000-0000-0000-000000555555",
  "b07b07b0-0000-4000-8000-000000071175",
  "b07b07b0-0000-4000-8000-000000071176",
])

const listSchema = z.object({
  user_id: z.string().uuid().optional(),
  user_ids: z.array(z.string().uuid()).optional(),
  search: z.string().trim().max(120).optional(),
  limit: z.number().int().min(1).max(200).optional(),
})

export async function listAdminPosts(input?: z.infer<typeof listSchema>): Promise<AdminPostDTO[]> {
  try { return [] } catch { return [] }
}

const updateSchema = z.object({
  id: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
  tag: z.string().trim().max(40).optional().or(z.literal("")),
  lang: z.string().optional(),
})

export async function updateAdminPost(input: z.infer<typeof updateSchema>): Promise<{ ok: boolean; error?: string }> {
  try {
    const e = getErr((input as any)?.lang)
    return { ok: false, error: e.disabled }
  } catch {
    const e = getErr((input as any)?.lang)
    return { ok: false, error: e.safe }
  }
}

export async function deleteAdminPost(input: { id: string; lang?: string }): Promise<{ ok: boolean; error?: string }> {
  try {
    const e = getErr((input as any)?.lang)
    return { ok: false, error: e.disabled }
  } catch {
    const e = getErr((input as any)?.lang)
    return { ok: false, error: e.safe }
  }
}

export async function setAdminPostVisibility(input: { id: string; visibility: "published" | "draft" | "unpublished"; lang?: string }): Promise<{ ok: boolean; error?: string }> {
  try {
    const e = getErr((input as any)?.lang)
    return { ok: false, error: e.disabled }
  } catch {
    const e = getErr((input as any)?.lang)
    return { ok: false, error: e.safe }
  }
}

export type PostAuditEntry = {
  id: string; post_id: string | null; actor_id: string | null; actor_name: string | null;
  actor_is_bot: boolean; action: string; snapshot: any; created_at: string
}

const auditSchema = z.object({
  post_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  user_ids: z.array(z.string().uuid()).optional(),
  limit: z.number().int().min(1).max(500).optional(),
})

export async function listPostAuditLog(input?: z.infer<typeof auditSchema>): Promise<PostAuditEntry[]> {
  try { return [] } catch { return [] }
}
