'use client'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import LanguageSelector from '@/components/LanguageSelector'

const D: Record<string, any> = {
  en: { settings:"Settings / Delete", signout:"Sign out" },
  es: { settings:"Ajustes / Eliminar", signout:"Cerrar sesión" },
  fr: { settings:"Paramètres / Supprimer", signout:"Déconnexion" },
  de: { settings:"Einstellungen / Löschen", signout:"Abmelden" },
  zh: { settings:"设置 / 删除", signout:"退出登录" },
  ja: { settings:"設定 / 削除", signout:"サインアウト" },
  ko: { settings:"설정 / 삭제", signout:"로그아웃" },
  pt: { settings:"Configurações / Excluir", signout:"Sair" },
  ru: { settings:"Настройки / Удалить", signout:"Выйти" },
  ar: { settings:"الإعدادات / حذف", signout:"تسجيل خروج" },
  hi: { settings:"सेटिंग्स / हटाएं", signout:"साइन आउट" },
  it: { settings:"Impostazioni / Elimina", signout:"Esci" },
  nl: { settings:"Instellingen / Verwijderen", signout:"Uitloggen" },
  tl: { settings:"Settings / Burahin", signout:"Mag-sign out" },
  bn: { settings:"সেটিংস / মুছুন", signout:"সাইন আউট" },
  id: { settings:"Pengaturan / Hapus", signout:"Keluar" },
  vi: { settings:"Cài đặt / Xóa", signout:"Đăng xuất" },
  th: { settings:"ตั้งค่า / ลบ", signout:"ออกจากระบบ" },
  sv: { settings:"Inställningar / Ta bort", signout:"Logga ut" },
  pl: { settings:"Ustawienia / Usuń", signout:"Wyloguj" },
  tr: { settings:"Ayarlar / Sil", signout:"Çıkış yap" },
  uk: { settings:"Налаштування / Видалити", signout:"Вийти" },
  el: { settings:"Ρυθμίσεις / Διαγραφή", signout:"Αποσύνδεση" },
  he: { settings:"הגדרות / מחיקה", signout:"התנתק" },
  ur: { settings:"سیٹنگز / حذف", signout:"سائن آؤٹ" },
  fa: { settings:"تنظیمات / حذف", signout:"خروج" },
  ms: { settings:"Tetapan / Padam", signout:"Log keluar" },
  ro: { settings:"Setări / Șterge", signout:"Deconectare" },
  cs: { settings:"Nastavení / Smazat", signout:"Odhlásit se" },
  hu: { settings:"Beállítások / Törlés", signout:"Kijelentkezés" },
  fi: { settings:"Asetukset / Poista", signout:"Kirjaudu ulos" },
  no: { settings:"Innstillinger / Slett", signout:"Logg ut" },
  da: { settings:"Indstillinger / Slet", signout:"Log ud" },
  bg: { settings:"Настройки / Изтрий", signout:"Изход" },
  hr: { settings:"Postavke / Izbriši", signout:"Odjavi se" },
  sr: { settings:"Подешавања / Обриши", signout:"Одјави се" },
  sk: { settings:"Nastavenia / Vymazať", signout:"Odhlásiť sa" },
  sl: { settings:"Nastavitve / Izbriši", signout:"Odjava" },
  et: { settings:"Seaded / Kustuta", signout:"Logi välja" },
  lv: { settings:"Iestatījumi / Dzēst", signout:"Izrakstīties" },
  lt: { settings:"Nustatymai / Ištrinti", signout:"Atsijungti" },
  be: { settings:"Налады / Выдаліць", signout:"Выйсці" },
  ka: { settings:"პარამეტრები / წაშლა", signout:"გასვლა" },
  hy: { settings:"Կարգավորումներ / Ջնջել", signout:"Դուրս գալ" },
  az: { settings:"Tənzimləmələr / Sil", signout:"Çıxış" },
  kk: { settings:"Параметрлер / Жою", signout:"Шығу" },
  ky: { settings:"Жөндөөлөр / Жок кылуу", signout:"Чыгуу" },
  uz: { settings:"Sozlamalar / O'chirish", signout:"Chiqish" },
  tg: { settings:"Танзимот / Нест кардан", signout:"Баромадан" },
  mn: { settings:"Тохиргоо / Устгах", signout:"Гарах" },
  km: { settings:"ការកំណត់ / លុប", signout:"ចាកចេញ" },
  lo: { settings:"ຕັ້ງຄ່າ / ລຶບ", signout:"ອອກຈາກລະບົບ" },
  my: { settings:"ဆက်တင်များ / ဖျက်ရန်", signout:"ထွက်ရန်" },
}

export default function Header() {
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string>('')
  const supabase = createClient()
  const router = useRouter()
  const { zip } = useLocation()

  const loadProfile = async (u: User | null) => {
    setUser(u)
    if (u) {
      const { data: profile } = await supabase.from('profiles').select('username').eq('user_id', u.id).maybeSingle()
      if (profile?.username) setUsername(`@${profile.username}`)
      else setUsername(u.email?.split('@')[0]? `@${u.email.split('@')[0]}` : '')
    } else setUsername('')
  }

  useEffect(() => {
    const getUser = async () => { const { data: { user } } = await supabase.auth.getUser(); loadProfile(user) }
    getUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => { loadProfile(session?.user?? null) })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/login') }

  return (
    <header className="bg-black/60 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/feed" className="text-xl font-bold text-white tracking-tight drop-shadow">Sweet Social Space</Link>
          {zip && <span className="text-xs font-black bg-white text-black px-2 py-1 rounded-full">• {zip} • LIVE</span>}
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          {user && (
            <>
              <Link href="/profile" className="text-sm text-white/80 hidden sm:block font-medium hover:text-white hover:underline cursor-pointer">{username || user.email}</Link>
              <Link href="/profile" className="text-xs text-white/40 hover:text-white/80 hidden md:block">{d.settings}</Link>
              <button onClick={handleSignOut} className="text-sm bg-white/10 hover:bg-white/20 border border-white/10 text-white px-3 py-1.5 rounded-full font-bold backdrop-blur">{d.signout}</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
