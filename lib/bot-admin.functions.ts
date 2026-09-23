'use server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const BOT_CONFIGS = {
  emergency: { path: "/api/public/bots/emergency-alerts-daily", secretEnv: "BOT_SECRET_KEY", fallbackEnv: "EMERGENCY_CRON_SECRET" },
  food: { path: "/api/public/bots/food-alerts-daily", secretEnv: "FOOD_ALERTS_CRON_SECRET", fallbackEnv: "BOT_GLOBAL_CRON_SECRET" },
  money: { path: "/api/public/bots/money-tip-daily", secretEnv: "BOT_SECRET_KEY", fallbackEnv: "DAILY_MONEY_TIP_CRON_SECRET" },
} as const

const ERR_DICT: Record<string, { disabled: string; safe: string }> = {
  en: { disabled:"Admin bot triggers disabled in Phase 1. Will enable in Phase 2.", safe:"Safe mode" },
  es: { disabled:"Disparadores de bot de administrador deshabilitados en Fase 1. Se habilitaran en Fase 2.", safe:"Modo seguro" },
  fr: { disabled:"Declencheurs bot admin desactives en Phase 1. Actives en Phase 2.", safe:"Mode securise" },
  de: { disabled:"Admin-Bot-Trigger in Phase 1 deaktiviert. Wird in Phase 2 aktiviert.", safe:"Sicherer Modus" },
  zh: { disabled:"管理机器人触发器在第一阶段已禁用。将在第二阶段启用。", safe:"安全模式" },
  ja: { disabled:"管理ボットトリガーはフェーズ1で無効。フェーズ2で有効化予定。", safe:"セーフモード" },
  ko: { disabled:"관리 봇 트리거가 1단계에서 비활성화됨. 2단계에서 활성화됩니다.", safe:"안전 모드" },
  pt: { disabled:"Gatilhos de bot admin desativados na Fase 1. Sera ativado na Fase 2.", safe:"Modo seguro" },
  it: { disabled:"Trigger bot admin disabilitati in Fase 1. Abilitati in Fase 2.", safe:"Modalita sicura" },
  nl: { disabled:"Admin bot-triggers uitgeschakeld in Fase 1. Wordt ingeschakeld in Fase 2.", safe:"Veilige modus" },
  id: { disabled:"Pemicu bot admin dinonaktifkan di Fase 1. Akan diaktifkan di Fase 2.", safe:"Mode aman" },
  vi: { disabled:"Trinh kich hoat bot quan tri bi tat trong Giai doan 1. Se bat trong Giai doan 2.", safe:"Che do an toan" },
  sv: { disabled:"Admin bot-triggers inaktiverade i Fas 1. Aktiveras i Fas 2.", safe:"Sakert lage" },
  pl: { disabled:"Wyzwalacze botow admin wylaczone w Fazie 1. Wlaczone w Fazie 2.", safe:"Tryb bezpieczny" },
  tr: { disabled:"Yonetici bot tetikleyicileri Asama 1'de devre disi. Asama 2'de etkinlesecek.", safe:"Guvenli mod" },
  ms: { disabled:"Pencetus bot admin dilumpuhkan dalam Fasa 1. Akan diaktifkan dalam Fasa 2.", safe:"Mod selamat" },
  ro: { disabled:"Declansatoare bot admin dezactivate in Faza 1. Vor fi activate in Faza 2.", safe:"Mod sigur" },
  cs: { disabled:"Spoustece admin botu zakazany ve Fazi 1. Povoli se ve Fazi 2.", safe:"Bezpecny rezim" },
  hu: { disabled:"Admin bot triggerek letiltva az 1. fazisban. A 2. fazisban engedelyezve.", safe:"Biztonsagos mod" },
  fi: { disabled:"Admin bot -liipaisimet poistettu kaytosta Vaiheessa 1. Otetaan kayttoon Vaiheessa 2.", safe:"Vikasietotila" },
  no: { disabled:"Admin bot-triggere deaktivert i Fase 1. Aktiveres i Fase 2.", safe:"Sikker modus" },
  da: { disabled:"Admin bot-triggere deaktiveret i Fase 1. Aktiveres i Fase 2.", safe:"Sikker tilstand" },
  hr: { disabled:"Admin bot okidaci onemoguceni u Fazi 1. Omogucit ce se u Fazi 2.", safe:"Siguran nacin" },
  sk: { disabled:"Admin bot spoustace zakazane vo Faze 1. Povolia sa vo Faze 2.", safe:"Bezpecny rezim" },
  sl: { disabled:"Admin bot sprozilci onemogoceni v Fazi 1. Omogoceni v Fazi 2.", safe:"Varen nacin" },
  et: { disabled:"Admin boti paastikut keelatud 1. faasis. Lubatakse 2. faasis.", safe:"Turvareziim" },
  az: { disabled:"Admin bot tetikleyicileri Faza 1-de deaktivdir. Faza 2-de aktivlesecek.", safe:"Tehlukesiz rejim" },
  uz: { disabled:"Admin bot triggerlari 1-bosqichda o'chirilgan. 2-bosqichda yoqiladi.", safe:"Xavfsiz rejim" },
}

function getErr(lang = "en"){ return ERR_DICT[lang] || ERR_DICT.en }

const runSchema = z.object({
  bot: z.enum(["emergency", "food", "money"]),
  lang: z.string().optional(),
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
    const e = getErr((input as any)?.lang)
    return { ok: false, error: e.disabled }
  } catch {
    const e = getErr((input as any)?.lang)
    return { ok: false, error: e.safe }
  }
}
