'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const BOT_CONFIGS = {
  emergency: {
    path: "/api/public/bots/emergency-alerts-daily",
    secretEnv: "BOT_SECRET_KEY",
    fallbackEnv: "EMERGENCY_CRON_SECRET",
  },
  food: {
    path: "/api/public/bots/food-alerts-daily",
    secretEnv: "FOOD_ALERTS_CRON_SECRET",
    fallbackEnv: "BOT_GLOBAL_CRON_SECRET",
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

async function getAuthSafe() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    return { supabase, userId: user.id }
  } catch { return null }
}

export async function adminRunBot(input: z.infer<typeof runSchema>): Promise<{ ok: boolean; error?: string }> {
  try {
    // Phase 1 stub - disabled but house alive
    return { 
      ok: false, 
      error: "Admin bot triggers disabled in Phase 1. Will enable in Phase 2." 
    }
  } catch {
    return { ok: false, error: "Safe mode" }
  }
}
