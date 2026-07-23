'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Phase 1: Admin bot triggers stubbed. Will wire up in Phase 2.

const BOT_CONFIGS = {
  emergency: {
    path: "/api/public/bots/emergency-alerts-daily",
    secretEnv: "BOT_SECRET_KEY",
    fallbackEnv: "EMERGENCY_CRON_SECRET", // GLOBAL FIX: was BOT_95122_CRON_SECRET
  },
  food: {
    path: "/api/public/bots/food-alerts-daily",
    secretEnv: "FOOD_ALERTS_CRON_SECRET",
    fallbackEnv: "BOT_GLOBAL_CRON_SECRET", // GLOBAL FIX: was BOT_95122_CRON_SECRET
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
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error ||!user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

export async function adminRunBot(input: z.infer<typeof runSchema>) {
  // Phase 1 stub: don't actually trigger bots yet
  return { 
    ok: false, 
    error: "Admin bot triggers disabled in Phase 1. Will enable in Phase 2." 
  }
}
