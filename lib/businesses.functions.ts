'use server'
import { z } from 'zod'

export type BusinessDirectoryDTO = {
  id: string; name: string; slug: string; category: string | null; description: string | null
  address: string | null; city: string | null; state_code: string | null
  latitude: number | null; longitude: number | null; website: string | null; logo_url: string | null; verified: boolean
}

const scopeInput = z.object({
  scope: z.enum(["5mi", "20mi", "50mi", "state", "nationwide"]).optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  state_code: z.string().nullable().optional(),
  country_code: z.string().nullable().optional(),
}).partial()

export async function listBusinesses(input?: { limit?: number; scope?: any }): Promise<BusinessDirectoryDTO[]> {
  try { return [] } catch { return [] }
}

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const
export type DayKey = typeof DAYS[number]
export type DayHours = { closed: boolean; open?: string; close?: string }
export type HoursJson = Partial<Record<DayKey, DayHours>>

const DAYS_DICT: Record<string, Record<DayKey, string>> = {
  en: { mon:"Monday", tue:"Tuesday", wed:"Wednesday", thu:"Thursday", fri:"Friday", sat:"Saturday", sun:"Sunday" },
  es: { mon:"Lunes", tue:"Martes", wed:"Miercoles", thu:"Jueves", fri:"Viernes", sat:"Sabado", sun:"Domingo" },
  fr: { mon:"Lundi", tue:"Mardi", wed:"Mercredi", thu:"Jeudi", fri:"Vendredi", sat:"Samedi", sun:"Dimanche" },
  de: { mon:"Montag", tue:"Dienstag", wed:"Mittwoch", thu:"Donnerstag", fri:"Freitag", sat:"Samstag", sun:"Sonntag" },
  zh: { mon:"星期一", tue:"星期二", wed:"星期三", thu:"星期四", fri:"星期五", sat:"星期六", sun:"星期日" },
  ja: { mon:"月曜日", tue:"火曜日", wed:"水曜日", thu:"木曜日", fri:"金曜日", sat:"土曜日", sun:"日曜日" },
  ko: { mon:"월요일", tue:"화요일", wed:"수요일", thu:"목요일", fri:"금요일", sat:"토요일", sun:"일요일" },
  pt: { mon:"Segunda", tue:"Terca", wed:"Quarta", thu:"Quinta", fri:"Sexta", sat:"Sabado", sun:"Domingo" },
  it: { mon:"Lunedi", tue:"Martedi", wed:"Mercoledi", thu:"Giovedi", fri:"Venerdi", sat:"Sabato", sun:"Domenica" },
  nl: { mon:"Maandag", tue:"Dinsdag", wed:"Woensdag", thu:"Donderdag", fri:"Vrijdag", sat:"Zaterdag", sun:"Zondag" },
  id: { mon:"Senin", tue:"Selasa", wed:"Rabu", thu:"Kamis", fri:"Jumat", sat:"Sabtu", sun:"Minggu" },
  vi: { mon:"Thu Hai", tue:"Thu Ba", wed:"Thu Tu", thu:"Thu Nam", fri:"Thu Sau", sat:"Thu Bay", sun:"Chu Nhat" },
  sv: { mon:"Mandag", tue:"Tisdag", wed:"Onsdag", thu:"Torsdag", fri:"Fredag", sat:"Lordag", sun:"Sondag" },
  pl: { mon:"Poniedzialek", tue:"Wtorek", wed:"Sroda", thu:"Czwartek", fri:"Piatek", sat:"Sobota", sun:"Niedziela" },
  tr: { mon:"Pazartesi", tue:"Sali", wed:"Carsamba", thu:"Persembe", fri:"Cuma", sat:"Cumartesi", sun:"Pazar" },
  ms: { mon:"Isnin", tue:"Selasa", wed:"Rabu", thu:"Khamis", fri:"Jumaat", sat:"Sabtu", sun:"Ahad" },
  ro: { mon:"Luni", tue:"Marti", wed:"Miercuri", thu:"Joi", fri:"Vineri", sat:"Sambata", sun:"Duminica" },
  cs: { mon:"Pondeli", tue:"Utery", wed:"Streda", thu:"Ctvrtek", fri:"Patek", sat:"Sobota", sun:"Nedele" },
  hu: { mon:"Hetfo", tue:"Kedd", wed:"Szerda", thu:"Csutortok", fri:"Pentek", sat:"Szombat", sun:"Vasarnap" },
  fi: { mon:"Maanantai", tue:"Tiistai", wed:"Keskiviikko", thu:"Torstai", fri:"Perjantai", sat:"Lauantai", sun:"Sunnuntai" },
  no: { mon:"Mandag", tue:"Tirsdag", wed:"Onsdag", thu:"Torsdag", fri:"Fredag", sat:"Lordag", sun:"Sondag" },
  da: { mon:"Mandag", tue:"Tirsdag", wed:"Onsdag", thu:"Torsdag", fri:"Fredag", sat:"Lordag", sun:"Sondag" },
  hr: { mon:"Ponedjeljak", tue:"Utorak", wed:"Srijeda", thu:"Cetvrtak", fri:"Petak", sat:"Subota", sun:"Nedjelja" },
  sk: { mon:"Pondelok", tue:"Utorok", wed:"Streda", thu:"Stvrtok", fri:"Piatok", sat:"Sobota", sun:"Nedela" },
  sl: { mon:"Ponedeljek", tue:"Torek", wed:"Sreda", thu:"Cetrtek", fri:"Petek", sat:"Sobota", sun:"Nedelja" },
  et: { mon:"Esmaspaev", tue:"Teisipaev", wed:"Kolmapaev", thu:"Neljapaev", fri:"Reede", sat:"Laupaev", sun:"Puhapaev" },
  az: { mon:"Bazar ertesi", tue:"Cersenbe axsami", wed:"Cersenbe", thu:"Cume axsami", fri:"Cume", sat:"Senbe", sun:"Bazar" },
  uz: { mon:"Dushanba", tue:"Seshanba", wed:"Chorshanba", thu:"Payshanba", fri:"Juma", sat:"Shanba", sun:"Yakshanba" },
}

const CLOSED_DICT: Record<string, string> = {
  en:"Closed", es:"Cerrado", fr:"Ferme", de:"Geschlossen", zh:"已关闭", ja:"休業", ko:"휴무", pt:"Fechado", it:"Chiuso", nl:"Gesloten", id:"Tutup", vi:"Dong cua", sv:"Stangt", pl:"Zamkniete", tr:"Kapali", ms:"Tutup", ro:"Inchis", cs:"Zavreno", hu:"Zarva", fi:"Suljettu", no:"Stengt", da:"Lukket", hr:"Zatvoreno", sk:"Zatvorene", sl:"Zaprto", et:"Suletud", az:"Bagli", uz:"Yopiq",
}

export const DAY_LABELS: Record<DayKey, string> = DAYS_DICT.en

export function getDayLabel(day: DayKey, lang = "en"): string {
  const dict = DAYS_DICT[lang] || DAYS_DICT.en
  return dict[day] || DAYS_DICT.en[day]
}

export function getClosedLabel(lang = "en"): string {
  return CLOSED_DICT[lang] || CLOSED_DICT.en
}

const dayHoursSchema = z.object({
  closed: z.boolean(),
  open: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  close: z.string().regex(/^\d{2}:\d{2}$/).optional(),
})
const hoursSchema = z.object({
  mon: dayHoursSchema.optional(), tue: dayHoursSchema.optional(), wed: dayHoursSchema.optional(), thu: dayHoursSchema.optional(), fri: dayHoursSchema.optional(), sat: dayHoursSchema.optional(), sun: dayHoursSchema.optional(),
})

export type BusinessPhotoDTO = { id: string; business_id: string; url: string; caption: string | null; sort_order: number; created_at: string }
export type BusinessPromotionDTO = { id: string; business_id: string; title: string; body: string | null; starts_at: string | null; ends_at: string | null; created_at: string }

export async function getBusinessExtras(input: { business_id: string }): Promise<{ photos: BusinessPhotoDTO[]; promotions: BusinessPromotionDTO[]; hours: HoursJson | null }> {
  try { return { photos: [], promotions: [], hours: null } } catch { return { photos: [], promotions: [], hours: null } }
}
export async function setBusinessHours(input: { business_id: string; hours: HoursJson }): Promise<{ ok: true }> {
  try { return { ok: true } } catch { return { ok: true } }
}
export async function addBusinessPhoto(input: { business_id: string; url: string; caption?: string | null }): Promise<{ id: string }> {
  try { return { id: "stubbed-for-phase-1" } } catch { return { id: "stubbed" } }
}
export async function deleteBusinessPhoto(input: { id: string }): Promise<{ ok: true }> {
  try { return { ok: true } } catch { return { ok: true } }
}
export async function addBusinessPromotion(input: { business_id: string; title: string; body?: string | null; starts_at?: string | null; ends_at?: string | null }): Promise<{ id: string }> {
  try { return { id: "stubbed-for-phase-1" } } catch { return { id: "stubbed" } }
}
export async function deleteBusinessPromotion(input: { id: string }): Promise<{ ok: true }> {
  try { return { ok: true } } catch { return { ok: true } }
}

export type BusinessClaimDTO = {
  id: string; business_id: string; business_name: string | null; business_slug: string | null;
  claimant_id: string; claimant_name: string | null; message: string | null;
  contact_email: string | null; proof_url: string | null;
  status: "pending" | "approved" | "rejected"; created_at: string; resolved_at: string | null
}

export async function submitBusinessClaim(input: { business_id: string; message?: string | null; contact_email?: string | null; proof_url?: string | null }): Promise<{ id: string }> {
  try { return { id: "stubbed-for-phase-1" } } catch { return { id: "stubbed" } }
}
export async function listMyBusinessClaims(): Promise<BusinessClaimDTO[]> {
  try { return [] } catch { return [] }
}
export async function adminListBusinessClaims(input?: { status?: "pending" | "approved" | "rejected" | "all" }): Promise<BusinessClaimDTO[]> {
  try { return [] } catch { return [] }
}
export async function adminResolveBusinessClaim(input: { id: string; action: "approve" | "reject"; verify?: boolean }): Promise<{ ok: true }> {
  try { return { ok: true } } catch { return { ok: true } }
}
export async function adminSetBusinessVerified(input: { business_id: string; verified: boolean }): Promise<{ ok: true }> {
  try { return { ok: true } } catch { return { ok: true } }
}

export function formatHoursForDay(h: DayHours | undefined, lang = "en"): string {
  try {
    const closedLabel = getClosedLabel(lang)
    if (!h || h.closed) return closedLabel
    if (!h.open ||!h.close) return "—"
    return `${h.open} – ${h.close}`
  } catch { return "—" }
}

export function isOpenNow(hours: HoursJson | null): boolean | null {
  try {
    if (!hours) return null
    const now = new Date()
    const key = DAYS[(now.getDay() + 6) % 7]
    const today = hours[key]
    if (!today || today.closed ||!today.open ||!today.close) return false
    const [oH, oM] = today.open.split(":").map(Number)
    const [cH, cM] = today.close.split(":").map(Number)
    if (isNaN(oH) || isNaN(oM) || isNaN(cH) || isNaN(cM)) return false
    const cur = now.getHours() * 60 + now.getMinutes()
    return cur >= oH * 60 + oM && cur <= cH * 60 + cM
  } catch { return null }
}
