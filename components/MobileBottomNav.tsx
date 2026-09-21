'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, ShoppingBag, MessageCircle, Bell } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { feed:"Feed", events:"Events", market:"Market", chat:"Chat", alerts:"Alerts" },
  es: { feed:"Feed", events:"Eventos", market:"Mercado", chat:"Chat", alerts:"Alertas" },
  fr: { feed:"Fil d'actualité", events:"Événements", market:"Marché", chat:"Chat", alerts:"Alertes" },
  de: { feed:"Feed", events:"Events", market:"Markt", chat:"Chat", alerts:"Benachrichtigungen" },
  zh: { feed:"动态", events:"活动", market:"市场", chat:"聊天", alerts:"提醒" },
  ja: { feed:"フィード", events:"イベント", market:"マーケット", chat:"チャット", alerts:"通知" },
  ko: { feed:"피드", events:"이벤트", market:"마켓", chat:"채팅", alerts:"알림" },
  pt: { feed:"Feed", events:"Eventos", market:"Mercado", chat:"Chat", alerts:"Alertas" },
  ru: { feed:"Лента", events:"События", market:"Маркет", chat:"Чат", alerts:"Уведомления" },
  ar: { feed:"الخلاصة", events:"الفعاليات", market:"السوق", chat:"دردشة", alerts:"تنبيهات" },
  hi: { feed:"फ़ीड", events:"इवेंट्स", market:"बाज़ार", chat:"चैट", alerts:"अलर्ट" },
  it: { feed:"Feed", events:"Eventi", market:"Mercato", chat:"Chat", alerts:"Avvisi" },
  nl: { feed:"Feed", events:"Evenementen", market:"Markt", chat:"Chat", alerts:"Meldingen" },
  tl: { feed:"Feed", events:"Events", market:"Market", chat:"Chat", alerts:"Alerts" },
  bn: { feed:"ফিড", events:"ইভেন্ট", market:"মার্কেট", chat:"চ্যাট", alerts:"সতর্কতা" },
  id: { feed:"Beranda", events:"Acara", market:"Pasar", chat:"Obrolan", alerts:"Notifikasi" },
  vi: { feed:"Bảng tin", events:"Sự kiện", market:"Chợ", chat:"Trò chuyện", alerts:"Thông báo" },
  th: { feed:"ฟีด", events:"กิจกรรม", market:"ตลาด", chat:"แชท", alerts:"แจ้งเตือน" },
  sv: { feed:"Flöde", events:"Evenemang", market:"Marknad", chat:"Chatt", alerts:"Aviseringar" },
  pl: { feed:"Aktualności", events:"Wydarzenia", market:"Rynek", chat:"Czat", alerts:"Powiadomienia" },
  tr: { feed:"Akış", events:"Etkinlikler", market:"Pazar", chat:"Sohbet", alerts:"Bildirimler" },
  uk: { feed:"Стрічка", events:"Події", market:"Маркет", chat:"Чат", alerts:"Сповіщення" },
  el: { feed:"Ροή", events:"Εκδηλώσεις", market:"Αγορά", chat:"Συνομιλία", alerts:"Ειδοποιήσεις" },
  he: { feed:"פיד", events:"אירועים", market:"שוק", chat:"צ'אט", alerts:"התראות" },
  ur: { feed:"فیڈ", events:"ایونٹس", market:"بازار", chat:"چیٹ", alerts:"اطلاعات" },
  fa: { feed:"خوراک", events:"رویدادها", market:"بازار", chat:"گفتگو", alerts:"هشدارها" },
  ms: { feed:"Suapan", events:"Acara", market:"Pasar", chat:"Sembang", alerts:"Makluman" },
  ro: { feed:"Flux", events:"Evenimente", market:"Piață", chat:"Chat", alerts:"Alerte" },
  cs: { feed:"Kanál", events:"Události", market:"Trh", chat:"Chat", alerts:"Upozornění" },
  hu: { feed:"Hírfolyam", events:"Események", market:"Piac", chat:"Csevegés", alerts:"Értesítések" },
  fi: { feed:"Syöte", events:"Tapahtumat", market:"Tori", chat:"Keskustelu", alerts:"Ilmoitukset" },
  no: { feed:"Feed", events:"Arrangementer", market:"Marked", chat:"Chat", alerts:"Varsler" },
  da: { feed:"Feed", events:"Begivenheder", market:"Marked", chat:"Chat", alerts:"Notifikationer" },
  bg: { feed:"Емисия", events:"Събития", market:"Пазар", chat:"Чат", alerts:"Известия" },
  hr: { feed:"Feed", events:"Događaji", market:"Tržnica", chat:"Razgovor", alerts:"Obavijesti" },
  sr: { feed:"Фид", events:"Догађаји", market:"Пијаца", chat:"Ћаскање", alerts:"Обавештења" },
  sk: { feed:"Kanál", events:"Udalosti", market:"Trh", chat:"Chat", alerts:"Upozornenia" },
  sl: { feed:"Viri", events:"Dogodki", market:"Tržnica", chat:"Klepet", alerts:"Obvestila" },
  et: { feed:"Voog", events:"Sündmused", market:"Turg", chat:"Vestlus", alerts:"Teated" },
  lv: { feed:"Plūsma", events:"Notikumi", market:"Tirgus", chat:"Čats", alerts:"Paziņojumi" },
  lt: { feed:"Srautas", events:"Įvykiai", market:"Turgus", chat:"Pokalbiai", alerts:"Pranešimai" },
  be: { feed:"Стужка", events:"Падзеі", market:"Маркет", chat:"Чат", alerts:"Апавяшчэнні" },
  ka: { feed:"ფიდი", events:"ღონისძიებები", market:"მარკეტი", chat:"ჩატი", alerts:"შეტყობინებები" },
  hy: { feed:"Ժապավեն", events:"Իրադարձություններ", market:"Շուկա", chat:"Զրույց", alerts:"Ծանուցումներ" },
  az: { feed:"Lent", events:"Tədbirlər", market:"Bazar", chat:"Söhbət", alerts:"Bildirişlər" },
  kk: { feed:"Лента", events:"Оқиғалар", market:"Маркет", chat:"Чат", alerts:"Хабарландырулар" },
  ky: { feed:"Лента", events:"Окуялар", market:"Базар", chat:"Чат", alerts:"Билдирүүлөр" },
  uz: { feed:"Lenta", events:"Tadbirlar", market:"Bozor", chat:"Chat", alerts:"Bildirishnomalar" },
  tg: { feed:"Навор", events:"Чорабиниҳо", market:"Бозор", chat:"Чат", alerts:"Огоҳиҳо" },
  mn: { feed:"Мэдээ", events:"Үйл явдал", market:"Зах", chat:"Чат", alerts:"Мэдэгдэл" },
  km: { feed:"ហ្វ៊ីដ", events:"ព្រឹត្តិការណ៍", market:"ទីផ្សារ", chat:"ជជែក", alerts:"ការជូនដំណឹង" },
  lo: { feed:"ຟີດ", events:"ເຫດການ", market:"ຕະຫຼາດ", chat:"ສົນທະນາ", alerts:"ແຈ້ງເຕືອນ" },
  my: { feed:"ဖိဒ်", events:"အဖြစ်အပျက်များ", market:"ဈေး", chat:"ချတ်", alerts:"အသိပေးချက်များ" },
}

export function MobileBottomNav() {
  const pathname = usePathname() || '/'
  const { language } = useLanguage()
  const t = D[language] || D.en

  const ITEMS = [
    { href: '/', label: t.feed, Icon: Home },
    { href: '/news-events', label: t.events, Icon: Calendar },
    { href: '/marketplace', label: t.market, Icon: ShoppingBag },
    { href: '/messages', label: t.chat, Icon: MessageCircle },
    { href: '/notifications', label: t.alerts, Icon: Bell },
  ]

  return (
    <nav aria-label="Primary" className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || (href!== '/' && pathname.startsWith(href))
          return (
            <li key={href}>
              <Link href={href} className={`flex flex-col items-center justify-center gap-1 py-2 text- font-medium hover:text-foreground ${isActive? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon className="h-5 w-5" aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function MobileBottomNavSpacer() {
  return <div aria-hidden className="md:hidden h-16" />
}
