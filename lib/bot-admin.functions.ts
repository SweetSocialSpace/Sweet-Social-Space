'use server'

import { z } from 'zod'
import { createServerClient } from '@/integrations/supabase/client.server'

const BOT_CONFIGS = {
  emergency: {
    path: "/api/public/bots/emergency-alerts-daily",
    secretEnv: "BOT_SECRET_KEY",
    fallbackEnv: "BOT_95122_CRON_SECRET",
  },
  food: {
    path: "/api/public/bots/food-alerts-daily",
    secretEnv: "FOOD_ALERTS_CRON_SECRET",
    fallbackEnv: "BOT_95122_CRON_SECRET",
  },
  money: {
    path: "/api/public/bots/money-tip-daily",
    secretEnv: "BOT_SECRET_KEY",
    fallbackEnv: "DAILY_MONEY_TIP_CRON_SECRET",
  },
} as const

const runSchema = z.object({
  bot: z.enum(["emergency", "food", "money"]),
})

async function getAuth() {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error ||!user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

export async function adminRunBot(input: z.infer<typeof runSchema>) {
  const data = runSchema.parse(input)
  const { supabase, userId } = await getAuth()
  const { data: ok } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" })
  if (ok!== true) throw new Error("Admin only")

  const cfg = BOT_CONFIGS[data.bot]
  const secret = process.env[cfg.secretEnv]?? process.env[cfg.fallbackEnv]
  if (!secret) throw new Error(`Secret not configured for ${data.bot}`)

  const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL || 'localhost:3000'
  const proto = host.includes("localhost")? "http" : "https"
  const url = `${proto}://${host}${cfg.path}`

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
    body: "{}",
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Bot run failed (${res.status}): ${text.slice(0, 200)}`)
  }
  try {
    return { ok: true, result: JSON.parse(text) }
  } catch {
    return { ok: true, result: { raw: text.slice(0, 200) } }
  }
}
