'use server'

import { z } from 'zod'
import { createServerClient } from '@/integrations/supabase/client.server'

async function getAuth() {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error ||!user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" })
  if (error || data!== true) throw new Error("Admin only")
}

export type MoneyTip = {
  id: number
  category: "save" | "make"
  tip: string
  source: string
  used_at: string | null
  created_at: string
}

export async function listMoneyTips(): Promise<MoneyTip[]> {
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const { data, error } = await supabaseAdmin
.from("daily_money_tips")
.select("id, category, tip, source, used_at, created_at")
.order("used_at", { ascending: true, nullsFirst: true })
.order("id", { ascending: true })
  if (error) throw new Error(error.message)
  return (data?? []) as MoneyTip[]
}

const upsertSchema = z.object({
  id: z.number().int().optional(),
  category: z.enum(["save", "make"]),
  tip: z.string().min(1).max(200),
  source: z.string().min(1).max(120),
})

export async function upsertMoneyTip(input: z.infer<typeof upsertSchema>) {
  const data = upsertSchema.parse(input)
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  if (data.id) {
    const { error } = await supabaseAdmin
  .from("daily_money_tips")
  .update({ category: data.category, tip: data.tip, source: data.source })
  .eq("id", data.id)
    if (error) throw new Error(error.message)
    return { ok: true, id: data.id }
  }
  const { data: row, error } = await supabaseAdmin
 .from("daily_money_tips")
 .insert({ category: data.category, tip: data.tip, source: data.source })
 .select("id")
 .single()
  if (error) throw new Error(error.message)
  return { ok: true, id: row!.id as number }
}

export async function deleteMoneyTip(input: { id: number }) {
  const { id } = z.object({ id: z.number().int() }).parse(input)
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const { error } = await supabaseAdmin.from("daily_money_tips").delete().eq("id", id)
  if (error) throw new Error(error.message)
  return { ok: true }
}

export async function triggerMoneyTipNow() {
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { runDailyMoneyTipTick } = await import('@/routes/api/public/bots/daily-money-tip')
  return runDailyMoneyTipTick()
}

export type GeneratedTip = { category: "save" | "make"; tip: string; source: string }

export async function generateMoneyTips(): Promise<GeneratedTip[]> {
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const key = process.env.LOVABLE_API_KEY
  if (!key) throw new Error("LOVABLE_API_KEY missing")

  const { createLovableAiGatewayProvider } = await import('@/lib/ai-gateway.server')
  const { generateText } = await import("ai")
  const gateway = createLovableAiGatewayProvider(key)

  const system =
    "You generate concise, practical personal-finance tips for a neighborhood community feed. STRICT RULES: (1) every tip MUST include a specific dollar amount or % savings, (2) every tip MUST cite a real, verifiable source (gov agency, established research org, well-known publication, or reputable company), (3) NEVER mention crypto, stocks, trading, investing in securities, MLM, multi-level marketing, dropshipping, or 'get rich' schemes, (4) each tip ≤ 180 characters (excluding the source), (5) category is 'save' (saves money) or 'make' (earns money). Return ONLY valid JSON, no prose, no markdown fences."

  const prompt = `Generate exactly 10 NEW money tips as JSON array. Schema: [{"category":"save"|"make","tip":"text with $ amount","source":"Real Source Name"}]. Vary categories. Be specific and actionable.`

  const { text } = await generateText({
    model: gateway("openai/gpt-5-mini"),
    system,
    prompt,
  })

  let jsonStr = text.trim()
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) jsonStr = fenceMatch[1].trim()
  const arrStart = jsonStr.indexOf("[")
  const arrEnd = jsonStr.lastIndexOf("]")
  if (arrStart >= 0 && arrEnd > arrStart) jsonStr = jsonStr.slice(arrStart, arrEnd + 1)

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error("AI returned invalid JSON")
  }
  const schema = z.array(
    z.object({
      category: z.enum(["save", "make"]),
      tip: z.string().min(5).max(200),
      source: z.string().min(2).max(120),
    })
  ).min(1).max(15)
  const tips = schema.parse(parsed)

  const banned = /\b(crypto|bitcoin|ethereum|nft|stock|stocks|trading|forex|mlm|multi[- ]level|dropship|get rich)\b/i
  const dollarOrPct = /(\$\s?\d|\d+\s?%|\d+\s?percent)/i
  return tips.filter((t) =>!banned.test(t.tip) && dollarOrPct.test(t.tip))
}
