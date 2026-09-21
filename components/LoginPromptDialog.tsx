'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'

const logo = '/sweet-social-logo.png'

const D: Record<string, any> = {
  en: { welcome:"Welcome to Sweet Social Space", body:"Log in or create an account to see what's happening on your block.", login:"Log in", create:"Create account", browse:"Continue browsing" },
  es: { welcome:"Bienvenido a Sweet Social Space", body:"Inicia sesión o crea una cuenta para ver qué pasa en tu cuadra.", login:"Iniciar sesión", create:"Crear cuenta", browse:"Seguir navegando" },
  fr: { welcome:"Bienvenue sur Sweet Social Space", body:"Connectez-vous ou créez un compte pour voir ce qui se passe dans votre quartier.", login:"Se connecter", create:"Créer compte", browse:"Continuer navigation" },
  de: { welcome:"Willkommen bei Sweet Social Space", body:"Melde dich an oder erstelle ein Konto, um zu sehen was in deinem Block passiert.", login:"Anmelden", create:"Konto erstellen", browse:"Weiter stöbern" },
  zh: { welcome:"欢迎来到 Sweet Social Space", body:"登录或创建账户，查看你街区发生的事。", login:"登录", create:"创建账户", browse:"继续浏览" },
  ja: { welcome:"Sweet Social Spaceへようこそ", body:"ログインまたはアカウント作成して、近所で起きていることを見よう。", login:"ログイン", create:"アカウント作成", browse:"閲覧を続ける" },
  ko: { welcome:"Sweet Social Space에 오신 것을 환영합니다", body:"로그인하거나 계정을 만들어 동네 소식을 확인하세요.", login:"로그인", create:"계정 만들기", browse:"계속 둘러보기" },
  pt: { welcome:"Bem-vindo ao Sweet Social Space", body:"Faça login ou crie conta para ver o que acontece no seu quarteirão.", login:"Entrar", create:"Criar conta", browse:"Continuar navegando" },
  ru: { welcome:"Добро пожаловать в Sweet Social Space", body:"Войдите или создайте аккаунт чтобы видеть что происходит в вашем районе.", login:"Войти", create:"Создать аккаунт", browse:"Продолжить просмотр" },
  ar: { welcome:"مرحبا بكم في Sweet Social Space", body:"سجل دخول أو أنشئ حساب لترى ما يحدث في منطقتك.", login:"تسجيل دخول", create:"إنشاء حساب", browse:"متابعة التصفح" },
  hi: { welcome:"Sweet Social Space में स्वागत है", body:"लॉग इन करें या खाता बनाएं कि आपके ब्लॉक में क्या हो रहा है।", login:"लॉग इन", create:"खाता बनाएं", browse:"ब्राउज़ जारी रखें" },
  it: { welcome:"Benvenuto in Sweet Social Space", body:"Accedi o crea account per vedere cosa succede nel tuo quartiere.", login:"Accedi", create:"Crea account", browse:"Continua a navigare" },
  nl: { welcome:"Welkom bij Sweet Social Space", body:"Log in of maak account om te zien wat er in je buurt gebeurt.", login:"Inloggen", create:"Account maken", browse:"Verder bladeren" },
  tl: { welcome:"Welcome sa Sweet Social Space", body:"Mag-log in o gumawa ng account para makita anong nangyayari sa block mo.", login:"Mag-log in", create:"Gumawa ng account", browse:"Magpatuloy mag-browse" },
  bn: { welcome:"Sweet Social Space-এ স্বাগতম", body:"লগ ইন করুন বা অ্যাকাউন্ট তৈরি করুন আপনার ব্লকে কী হচ্ছে দেখতে।", login:"লগ ইন", create:"অ্যাকাউন্ট তৈরি", browse:"ব্রাউজ চালিয়ে যান" },
  id: { welcome:"Selamat Datang di Sweet Social Space", body:"Masuk atau buat akun untuk melihat apa yang terjadi di blok Anda.", login:"Masuk", create:"Buat akun", browse:"Lanjut browsing" },
  vi: { welcome:"Chào mừng đến Sweet Social Space", body:"Đăng nhập hoặc tạo tài khoản để xem điều gì xảy ra ở khu phố bạn.", login:"Đăng nhập", create:"Tạo tài khoản", browse:"Tiếp tục duyệt" },
  th: { welcome:"ยินดีต้อนรับสู่ Sweet Social Space", body:"เข้าสู่ระบบหรือสร้างบัญชีเพื่อดูสิ่งที่เกิดขึ้นในบล็อกของคุณ", login:"เข้าสู่ระบบ", create:"สร้างบัญชี", browse:"เรียกดูต่อ" },
  sv: { welcome:"Välkommen till Sweet Social Space", body:"Logga in eller skapa konto för att se vad som händer i ditt kvarter.", login:"Logga in", create:"Skapa konto", browse:"Fortsätt bläddra" },
  pl: { welcome:"Witamy w Sweet Social Space", body:"Zaloguj się lub utwórz konto by zobaczyć co dzieje się w okolicy.", login:"Zaloguj się", create:"Utwórz konto", browse:"Kontynuuj przeglądanie" },
  tr: { welcome:"Sweet Social Space'e Hoş Geldiniz", body:"Bloğunuzda neler olduğunu görmek için giriş yapın veya hesap oluşturun.", login:"Giriş Yap", create:"Hesap Oluştur", browse:"Göz atmaya devam et" },
  uk: { welcome:"Ласкаво просимо до Sweet Social Space", body:"Увійдіть або створіть акаунт щоб бачити що відбувається у вашому районі.", login:"Увійти", create:"Створити акаунт", browse:"Продовжити перегляд" },
  el: { welcome:"Καλώς ήρθατε στο Sweet Social Space", body:"Συνδεθείτε ή δημιουργήστε λογαριασμό για να δείτε τι συμβαίνει στη γειτονιά σας.", login:"Σύνδεση", create:"Δημιουργία λογαριασμού", browse:"Συνέχεια περιήγησης" },
  he: { welcome:"ברוכים הבאים ל-Sweet Social Space", body:"התחבר או צור חשבון כדי לראות מה קורה בבלוק שלך.", login:"התחבר", create:"צור חשבון", browse:"המשך גלישה" },
  ur: { welcome:"Sweet Social Space میں خوش آمدید", body:"لاگ ان کریں یا اکاؤنٹ بنائیں تاکہ دیکھ سکیں آپ کے بلاک میں کیا ہو رہا ہے۔", login:"لاگ ان", create:"اکاؤنٹ بنائیں", browse:"براؤزنگ جاری رکھیں" },
  fa: { welcome:"به Sweet Social Space خوش آمدید", body:"وارد شوید یا حساب بسازید تا ببینید در محله شما چه می‌گذرد.", login:"ورود", create:"ساخت حساب", browse:"ادامه مرور" },
  ms: { welcome:"Selamat Datang ke Sweet Social Space", body:"Log masuk atau buat akaun untuk melihat apa yang berlaku di blok anda.", login:"Log masuk", create:"Buat akaun", browse:"Teruskan melayari" },
  ro: { welcome:"Bun venit în Sweet Social Space", body:"Autentifică-te sau creează cont să vezi ce se întâmplă în cartierul tău.", login:"Autentificare", create:"Creează cont", browse:"Continuă navigarea" },
  cs: { welcome:"Vítejte v Sweet Social Space", body:"Přihlaste se nebo vytvořte účet a uvidíte co se děje ve vašem bloku.", login:"Přihlásit", create:"Vytvořit účet", browse:"Pokračovat v prohlížení" },
  hu: { welcome:"Üdv a Sweet Social Space-en", body:"Jelentkezz be vagy hozz létre fiókot hogy lásd mi történik a környékeden.", login:"Bejelentkezés", create:"Fiók létrehozása", browse:"Böngészés folytatása" },
  fi: { welcome:"Tervetuloa Sweet Social Spaceen", body:"Kirjaudu tai luo tili nähdäksesi mitä korttelissasi tapahtuu.", login:"Kirjaudu", create:"Luo tili", browse:"Jatka selaamista" },
  no: { welcome:"Velkommen til Sweet Social Space", body:"Logg inn eller opprett konto for å se hva som skjer i nabolaget.", login:"Logg inn", create:"Opprett konto", browse:"Fortsett å bla" },
  da: { welcome:"Velkommen til Sweet Social Space", body:"Log ind eller opret konto for at se hvad der sker i dit kvarter.", login:"Log ind", create:"Opret konto", browse:"Fortsæt med at browse" },
  bg: { welcome:"Добре дошли в Sweet Social Space", body:"Влезте или създайте акаунт за да видите какво се случва във вашия блок.", login:"Вход", create:"Създай акаунт", browse:"Продължи разглеждане" },
  hr: { welcome:"Dobrodošli u Sweet Social Space", body:"Prijavite se ili napravite račun da vidite što se događa u vašem kvartu.", login:"Prijava", create:"Napravi račun", browse:"Nastavi pregledavati" },
  sr: { welcome:"Добродошли у Sweet Social Space", body:"Пријавите се или направите налог да видите шта се дешава у вашем крају.", login:"Пријава", create:"Направи налог", browse:"Настави прегледање" },
  sk: { welcome:"Vitajte v Sweet Social Space", body:"Prihláste sa alebo vytvorte účet aby ste videli čo sa deje vo vašom bloku.", login:"Prihlásiť", create:"Vytvoriť účet", browse:"Pokračovať v prehliadaní" },
  sl: { welcome:"Dobrodošli v Sweet Social Space", body:"Prijavite se ali ustvarite račun da vidite kaj se dogaja v vaši soseski.", login:"Prijava", create:"Ustvari račun", browse:"Nadaljuj brskanje" },
  et: { welcome:"Tere tulemast Sweet Social Space'i", body:"Logi sisse või loo konto et näha mis sinu kvartalis toimub.", login:"Logi sisse", create:"Loo konto", browse:"Jätka sirvimist" },
  lv: { welcome:"Laipni lūdzam Sweet Social Space", body:"Piesakieties vai izveidojiet kontu lai redzētu kas notiek jūsu rajonā.", login:"Pieteikties", create:"Izveidot kontu", browse:"Turpināt pārlūkošanu" },
  lt: { welcome:"Sveiki atvykę į Sweet Social Space", body:"Prisijunkite arba sukurkite paskyrą kad pamatytumėte kas vyksta jūsų kvartale.", login:"Prisijungti", create:"Sukurti paskyrą", browse:"Tęsti naršymą" },
  be: { welcome:"Сардэчна запрашаем у Sweet Social Space", body:"Увайдзіце або стварыце акаўнт каб бачыць што адбываецца ў вашым раёне.", login:"Увайсці", create:"Стварыць акаўнт", browse:"Працягнуць прагляд" },
  ka: { welcome:"კეთილი იყოს თქვენი მობრძანება Sweet Social Space-ში", body:"შედით ან შექმენით ანგარიში რომ ნახოთ რა ხდება თქვენს უბანში.", login:"შესვლა", create:"ანგარიშის შექმნა", browse:"დათვალიერების გაგრძელება" },
  hy: { welcome:"Բարի գալուստ Sweet Social Space", body:"Մուտք գործեք կամ ստեղծեք հաշիվ՝ տեսնելու ինչ է կատարվում ձեր թաղամասում։", login:"Մուտք", create:"Ստեղծել հաշիվ", browse:"Շարունակել դիտարկումը" },
  az: { welcome:"Sweet Social Space-ə Xoş Gəlmisiniz", body:"Blokunuzda nə baş verdiyini görmək üçün daxil olun və ya hesab yaradın.", login:"Daxil ol", create:"Hesab yarat", browse:"Baxmağa davam et" },
  kk: { welcome:"Sweet Social Space-ке Қош Келдіңіз", body:"Блогыңызда не болып жатқанын көру үшін кіріңіз немесе тіркелгі жасаңыз.", login:"Кіру", create:"Тіркелгі жасау", browse:"Шолуды жалғастыру" },
  ky: { welcome:"Sweet Social Space-ке Кош Келиңиз", body:"Блогуңузда эмне болуп жатканын көрүү үчүн кириңиз же катталыңыз.", login:"Кирүү", create:"Катталуу", browse:"Кароону улантуу" },
  uz: { welcome:"Sweet Social Space-ga Xush Kelibsiz", body:"Blokingizda nima bo'layotganini ko'rish uchun kiring yoki hisob yarating.", login:"Kirish", create:"Hisob yaratish", browse:"Ko'rishni davom ettirish" },
  tg: { welcome:"Хуш омадед ба Sweet Social Space", body:"Ворид шавед ё ҳисоб созед то бубинед дар блоки шумо чӣ рӯй медиҳад.", login:"Воридшавӣ", create:"Ҳисоб сохтан", browse:"Диданро идома диҳед" },
  mn: { welcome:"Sweet Social Space-д тавтай морил", body:"Блок дээр юу болж байгааг харахын тулд нэвтэрч эсвэл бүртгэл үүсгэнэ үү.", login:"Нэвтрэх", create:"Бүртгэл үүсгэх", browse:"Үргэлжлүүлэн үзэх" },
  km: { welcome:"ស្វាគមន៍មកកាន់ Sweet Social Space", body:"ចូលឬបង្កើតគណនីដើម្បីមើលអ្វីដែលកំពុងកើតឡើងនៅលើប្លុករបស់អ្នក។", login:"ចូល", create:"បង្កើតគណនី", browse:"បន្តរុករក" },
  lo: { welcome:"ຍິນດີຕ້ອນຮັບສູ່ Sweet Social Space", body:"ເຂົ້າສູ່ລະບົບຫຼືສ້າງບັນຊີເພື່ອເບິ່ງວ່າມີຫຍັງເກີດຂຶ້ນໃນບລັອກຂອງທ່ານ", login:"ເຂົ້າສູ່ລະບົບ", create:"ສ້າງບັນຊີ", browse:"ສືບຕໍ່ເບິ່ງ" },
  my: { welcome:"Sweet Social Space မှကြိုဆိုပါသည်", body:"သင့်ဘလောက်တွင်ဘာဖြစ်နေသည်ကိုကြည့်ရန် လော့ဂ်အင်ဝင်ပါ သို့မဟုတ် အကောင့်ဖန်တီးပါ။", login:"လော့ဂ်အင်", create:"အကောင့်ဖန်တီးရန်", browse:"ကြည့်ရှုမှုဆက်လက်လုပ်ဆောင်ရန်" },
}

export function LoginPromptDialog() {
  const [open, setOpen] = useState(false)
  const { language } = useLanguage()
  const d = D[language] || D.en

  useEffect(() => {
    try {
      if (typeof window!== 'undefined' && sessionStorage.getItem('login_prompt_dismissed')) return
    } catch {}
    const timer = setTimeout(() => { try { setOpen(true) } catch {} }, 1200)
    return () => { try { clearTimeout(timer) } catch {} }
  }, [])

  const dismiss = () => { try { if (typeof window!== 'undefined') sessionStorage.setItem('login_prompt_dismissed','1'); setOpen(false) } catch { setOpen(false) } }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={dismiss}>
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]" role="dialog" aria-modal="true" aria-labelledby="login-prompt-title" onClick={(e)=>e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Sweet Social Space" className="h-16 w-16 rounded-full object-cover ring-1 ring-border" onError={(e)=>{ try { (e.target as any).style.display='none' } catch {} }} />
          <h2 id="login-prompt-title" className="mt-4 font-display text-xl font-semibold">{d.welcome}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{d.body}</p>
          <div className="mt-6 flex w-full flex-col gap-3">
            <Link href="/auth?mode=signin" onClick={dismiss} className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-100" style={{ background: 'var(--gradient-warm)', boxShadow: 'var(--shadow-sweet)' } as any}>{d.login}</Link>
            <Link href="/auth?mode=signup" onClick={dismiss} className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold transition hover:bg-secondary">{d.create}</Link>
            <button onClick={dismiss} className="mt-1 text-xs text-muted-foreground hover:underline">{d.browse}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
