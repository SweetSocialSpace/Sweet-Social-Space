'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { notifs:"Notifications", unread:"unread notifications" },
  es: { notifs:"Notificaciones", unread:"notificaciones no leídas" },
  fr: { notifs:"Notifications", unread:"notifications non lues" },
  de: { notifs:"Benachrichtigungen", unread:"ungelesene Benachrichtigungen" },
  zh: { notifs:"通知", unread:"未读通知" },
  ja: { notifs:"通知", unread:"未読の通知" },
  ko: { notifs:"알림", unread:"읽지 않은 알림" },
  pt: { notifs:"Notificações", unread:"notificações não lidas" },
  ru: { notifs:"Уведомления", unread:"непрочитанных уведомлений" },
  ar: { notifs:"الإشعارات", unread:"إشعارات غير مقروءة" },
  hi: { notifs:"सूचनाएं", unread:"अपठित सूचनाएं" },
  it: { notifs:"Notifiche", unread:"notifiche non lette" },
  nl: { notifs:"Meldingen", unread:"ongelezen meldingen" },
  tl: { notifs:"Mga Abiso", unread:"hindi pa nabasang abiso" },
  bn: { notifs:"বিজ্ঞপ্তি", unread:"অপঠিত বিজ্ঞপ্তি" },
  id: { notifs:"Notifikasi", unread:"notifikasi belum dibaca" },
  vi: { notifs:"Thông báo", unread:"thông báo chưa đọc" },
  th: { notifs:"การแจ้งเตือน", unread:"การแจ้งเตือนที่ยังไม่ได้อ่าน" },
  sv: { notifs:"Aviseringar", unread:"olästa aviseringar" },
  pl: { notifs:"Powiadomienia", unread:"nieprzeczytane powiadomienia" },
  tr: { notifs:"Bildirimler", unread:"okunmamış bildirimler" },
  uk: { notifs:"Сповіщення", unread:"непрочитаних сповіщень" },
  el: { notifs:"Ειδοποιήσεις", unread:"μη αναγνωσμένες ειδοποιήσεις" },
  he: { notifs:"התראות", unread:"התראות שלא נקראו" },
  ur: { notifs:"اطلاعات", unread:"غیر پڑھی اطلاعات" },
  fa: { notifs:"اعلان‌ها", unread:"اعلان‌های خوانده نشده" },
  ms: { notifs:"Pemberitahuan", unread:"pemberitahuan belum dibaca" },
  ro: { notifs:"Notificări", unread:"notificări necitite" },
  cs: { notifs:"Oznámení", unread:"nepřečtených oznámení" },
  hu: { notifs:"Értesítések", unread:"olvasatlan értesítések" },
  fi: { notifs:"Ilmoitukset", unread:"lukemattomia ilmoituksia" },
  no: { notifs:"Varsler", unread:"uleste varsler" },
  da: { notifs:"Notifikationer", unread:"ulæste notifikationer" },
  bg: { notifs:"Известия", unread:"непрочетени известия" },
  hr: { notifs:"Obavijesti", unread:"nepročitanih obavijesti" },
  sr: { notifs:"Обавештења", unread:"непрочитаних обавештења" },
  sk: { notifs:"Upozornenia", unread:"neprečítaných upozornení" },
  sl: { notifs:"Obvestila", unread:"neprebranih obvestil" },
  et: { notifs:"Teated", unread:"lugemata teateid" },
  lv: { notifs:"Paziņojumi", unread:"nelasīti paziņojumi" },
  lt: { notifs:"Pranešimai", unread:"neperskaitytų pranešimų" },
  be: { notifs:"Апавяшчэнні", unread:"непрачытаных апавяшчэнняў" },
  ka: { notifs:"შეტყობინებები", unread:"წაუკითხავი შეტყობინებები" },
  hy: { notifs:"Ծանուցումներ", unread:"չկարդացված ծանուցումներ" },
  az: { notifs:"Bildirişlər", unread:"oxunmamış bildirişlər" },
  kk: { notifs:"Хабарландырулар", unread:"оқылмаған хабарландырулар" },
  ky: { notifs:"Билдирүүлөр", unread:"окула элек билдирүүлөр" },
  uz: { notifs:"Bildirishnomalar", unread:"o'qilmagan bildirishnomalar" },
  tg: { notifs:"Огоҳиҳо", unread:"огоҳиҳои хонда нашуда" },
  mn: { notifs:"Мэдэгдэл", unread:"уншаагүй мэдэгдэл" },
  km: { notifs:"ការជូនដំណឹង", unread:"ការជូនដំណឹងមិនទាន់អាន" },
  lo: { notifs:"ການແຈ້ງເຕືອນ", unread:"ການແຈ້ງເຕືອນທີ່ຍັງບໍ່ໄດ້ອ່ານ" },
  my: { notifs:"အသိပေးချက်များ", unread:"မဖတ်ရသေးသော အသိပေးချက်များ" },
}

async function countMyUnreadNotifications(): Promise<{ count: number }> {
  try {
    const supabase = createClient() as any
    let user: any = null; try { const { data } = await supabase.auth.getUser(); user = data.user } catch {}
    if (!user) return { count: 0 }
    const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false)
    if (error) throw error
    return { count: count || 0 }
  } catch { return { count: 0 } }
}

export function NotificationBell({ className = '' }: { className?: string }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [count, setCount] = useState(0)
  const { language } = useLanguage()
  const d = D[language] || D.en

  useEffect(() => {
    try {
      const supabase = createClient() as any
      supabase.auth.getUser().then(({ data }: any) => { try { setUserId(data.user?.id?? null) } catch {} }).catch(()=>{})
      const { data: sub } = supabase.auth.onAuthStateChange((_e: any, s: any) => { try { setUserId(s?.user?.id?? null) } catch {} })
      return () => { try { sub.subscription.unsubscribe() } catch {} }
    } catch {}
  }, [])

  useEffect(() => {
    if (!userId) { setCount(0); return }
    let cancelled = false
    const refresh = () => { try { countMyUnreadNotifications().then((r) => { if (!cancelled) try { setCount(r.count) } catch {} }).catch(() => {}) } catch {} }
    refresh()
    let channel: any = null
    try {
      const supabase = createClient() as any
      const safeId = String(userId).slice(0,36)
      channel = supabase.channel(`notif-bell-${safeId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${safeId}` }, () => refresh()).subscribe()
    } catch {}
    return () => { cancelled = true; try { if (channel) { const supabase = createClient() as any; supabase.removeChannel(channel) } } catch {} }
  }, [userId])

  if (!userId) return null

  return (
    <Link href="/notifications" aria-label={count? `${count} ${d.unread}` : d.notifs} className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-secondary ${className}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
      {count > 0 && (<span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text- font-bold leading-4 text-primary-foreground">{count > 99? '99+' : count}</span>)}
    </Link>
  )
}
