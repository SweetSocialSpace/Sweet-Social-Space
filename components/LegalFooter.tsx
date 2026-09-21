'use client'
import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'

const LEGAL = { entityName: 'Sweet Social Space' }

const D: Record<string, any> = {
  en: { security:"🛡 Security Policy", terms:"Terms", privacy:"Privacy", cookies:"Cookies", community:"Community Guidelines", dmca:"DMCA", contact:"Contact", verification:"Verification", rights:"All rights reserved. Works Anywhere • SSL SECURED" },
  es: { security:"🛡 Política de Seguridad", terms:"Términos", privacy:"Privacidad", cookies:"Cookies", community:"Normas Comunitarias", dmca:"DMCA", contact:"Contacto", verification:"Verificación", rights:"Todos los derechos reservados. Funciona en cualquier lugar • SSL SEGURO" },
  fr: { security:"🛡 Politique de Sécurité", terms:"Conditions", privacy:"Confidentialité", cookies:"Cookies", community:"Règles Communautaires", dmca:"DMCA", contact:"Contact", verification:"Vérification", rights:"Tous droits réservés. Fonctionne Partout • SSL SÉCURISÉ" },
  de: { security:"🛡 Sicherheitsrichtlinie", terms:"Bedingungen", privacy:"Datenschutz", cookies:"Cookies", community:"Community-Richtlinien", dmca:"DMCA", contact:"Kontakt", verification:"Verifizierung", rights:"Alle Rechte vorbehalten. Funktioniert Überall • SSL GESICHERT" },
  zh: { security:"🛡 安全政策", terms:"条款", privacy:"隐私", cookies:"Cookies", community:"社区准则", dmca:"DMCA", contact:"联系", verification:"验证", rights:"版权所有。随处可用 • SSL 安全" },
  ja: { security:"🛡 セキュリティポリシー", terms:"利用規約", privacy:"プライバシー", cookies:"Cookie", community:"コミュニティガイドライン", dmca:"DMCA", contact:"お問い合わせ", verification:"認証", rights:"無断複写・転載を禁じます。どこでも動作 • SSL保護" },
  ko: { security:"🛡 보안 정책", terms:"약관", privacy:"개인정보", cookies:"쿠키", community:"커뮤니티 가이드라인", dmca:"DMCA", contact:"연락처", verification:"인증", rights:"모든 권리 보유. 어디서나 작동 • SSL 보안" },
  pt: { security:"🛡 Política de Segurança", terms:"Termos", privacy:"Privacidade", cookies:"Cookies", community:"Diretrizes da Comunidade", dmca:"DMCA", contact:"Contato", verification:"Verificação", rights:"Todos direitos reservados. Funciona em Qualquer Lugar • SSL SEGURO" },
  ru: { security:"🛡 Политика Безопасности", terms:"Условия", privacy:"Конфиденциальность", cookies:"Cookies", community:"Правила Сообщества", dmca:"DMCA", contact:"Контакт", verification:"Верификация", rights:"Все права защищены. Работает Везде • SSL ЗАЩИЩЕНО" },
  ar: { security:"🛡 سياسة الأمان", terms:"الشروط", privacy:"الخصوصية", cookies:"الكوكيز", community:"إرشادات المجتمع", dmca:"DMCA", contact:"اتصل", verification:"التحقق", rights:"جميع الحقوق محفوظة. يعمل في أي مكان • SSL آمن" },
  hi: { security:"🛡 सुरक्षा नीति", terms:"शर्तें", privacy:"गोपनीयता", cookies:"कुकीज़", community:"समुदाय दिशानिर्देश", dmca:"DMCA", contact:"संपर्क", verification:"सत्यापन", rights:"सभी अधिकार सुरक्षित। कहीं भी काम करता है • SSL सुरक्षित" },
  it: { security:"🛡 Politica Sicurezza", terms:"Termini", privacy:"Privacy", cookies:"Cookie", community:"Linee Guida Comunità", dmca:"DMCA", contact:"Contatto", verification:"Verifica", rights:"Tutti i diritti riservati. Funziona Ovunque • SSL SICURO" },
  nl: { security:"🛡 Beveiligingsbeleid", terms:"Voorwaarden", privacy:"Privacy", cookies:"Cookies", community:"Communityrichtlijnen", dmca:"DMCA", contact:"Contact", verification:"Verificatie", rights:"Alle rechten voorbehouden. Werkt Overal • SSL BEVEILIGD" },
  tl: { security:"🛡 Patakaran sa Seguridad", terms:"Tuntunin", privacy:"Privacy", cookies:"Cookies", community:"Mga Alituntunin ng Komunidad", dmca:"DMCA", contact:"Contact", verification:"Beripikasyon", rights:"Lahat ng karapatan nakalaan. Gumagana Kahit Saan • SSL SECURED" },
  bn: { security:"🛡 নিরাপত্তা নীতি", terms:"শর্তাবলী", privacy:"গোপনীয়তা", cookies:"কুকিজ", community:"কমিউনিটি নির্দেশিকা", dmca:"DMCA", contact:"যোগাযোগ", verification:"যাচাইকরণ", rights:"সর্বস্বত্ব সংরক্ষিত। যে কোন জায়গায় কাজ করে • SSL সুরক্ষিত" },
  id: { security:"🛡 Kebijakan Keamanan", terms:"Syarat", privacy:"Privasi", cookies:"Cookie", community:"Pedoman Komunitas", dmca:"DMCA", contact:"Kontak", verification:"Verifikasi", rights:"Hak cipta dilindungi. Berfungsi Di Mana Saja • SSL AMAN" },
  vi: { security:"🛡 Chính Sách Bảo Mật", terms:"Điều khoản", privacy:"Riêng tư", cookies:"Cookie", community:"Hướng Dẫn Cộng Đồng", dmca:"DMCA", contact:"Liên hệ", verification:"Xác minh", rights:"Bảo lưu mọi quyền. Hoạt động Mọi Nơi • SSL AN TOÀN" },
  th: { security:"🛡 นโยบายความปลอดภัย", terms:"ข้อกำหนด", privacy:"ความเป็นส่วนตัว", cookies:"คุกกี้", community:"แนวทางชุมชน", dmca:"DMCA", contact:"ติดต่อ", verification:"การยืนยัน", rights:"สงวนลิขสิทธิ์ทั้งหมด ใช้งานได้ทุกที่ • SSL ปลอดภัย" },
  sv: { security:"🛡 Säkerhetspolicy", terms:"Villkor", privacy:"Integritet", cookies:"Cookies", community:"Communityriktlinjer", dmca:"DMCA", contact:"Kontakt", verification:"Verifiering", rights:"Alla rättigheter förbehållna. Fungerar Överallt • SSL SÄKER" },
  pl: { security:"🛡 Polityka Bezpieczeństwa", terms:"Warunki", privacy:"Prywatność", cookies:"Cookies", community:"Zasady Społeczności", dmca:"DMCA", contact:"Kontakt", verification:"Weryfikacja", rights:"Wszelkie prawa zastrzeżone. Działa Wszędzie • SSL ZABEZPIECZONE" },
  tr: { security:"🛡 Güvenlik Politikası", terms:"Şartlar", privacy:"Gizlilik", cookies:"Çerezler", community:"Topluluk Kuralları", dmca:"DMCA", contact:"İletişim", verification:"Doğrulama", rights:"Tüm hakları saklıdır. Her Yerde Çalışır • SSL GÜVENLİ" },
  uk: { security:"🛡 Політика Безпеки", terms:"Умови", privacy:"Конфіденційність", cookies:"Cookies", community:"Правила Спільноти", dmca:"DMCA", contact:"Контакт", verification:"Верифікація", rights:"Всі права захищені. Працює Скрізь • SSL ЗАХИЩЕНО" },
  el: { security:"🛡 Πολιτική Ασφαλείας", terms:"Όροι", privacy:"Απόρρητο", cookies:"Cookies", community:"Οδηγίες Κοινότητας", dmca:"DMCA", contact:"Επικοινωνία", verification:"Επαλήθευση", rights:"Με επιφύλαξη παντός δικαιώματος. Λειτουργεί Παντού • SSL ΑΣΦΑΛΕΣ" },
  he: { security:"🛡 מדיניות אבטחה", terms:"תנאים", privacy:"פרטיות", cookies:"עוגיות", community:"כללי קהילה", dmca:"DMCA", contact:"צור קשר", verification:"אימות", rights:"כל הזכויות שמורות. עובד בכל מקום • SSL מאובטח" },
  ur: { security:"🛡 سیکیورٹی پالیسی", terms:"شرائط", privacy:"رازداری", cookies:"کوکیز", community:"کمیونٹی رہنما", dmca:"DMCA", contact:"رابطہ", verification:"تصدیق", rights:"جملہ حقوق محفوظ ہیں۔ کہیں بھی کام کرتا ہے • SSL محفوظ" },
  fa: { security:"🛡 سیاست امنیتی", terms:"شرایط", privacy:"حریم خصوصی", cookies:"کوکی‌ها", community:"دستورالعمل‌های جامعه", dmca:"DMCA", contact:"تماس", verification:"تأیید", rights:"تمامی حقوق محفوظ است. همه جا کار می کند • SSL امن" },
  ms: { security:"🛡 Polisi Keselamatan", terms:"Terma", privacy:"Privasi", cookies:"Kuki", community:"Garis Panduan Komuniti", dmca:"DMCA", contact:"Hubungi", verification:"Pengesahan", rights:"Hak cipta terpelihara. Berfungsi Di Mana-mana • SSL SELAMAT" },
  ro: { security:"🛡 Politica de Securitate", terms:"Termeni", privacy:"Confidențialitate", cookies:"Cookies", community:"Ghid Comunitate", dmca:"DMCA", contact:"Contact", verification:"Verificare", rights:"Toate drepturile rezervate. Funcționează Oriunde • SSL SECURIZAT" },
  cs: { security:"🛡 Bezpečnostní Zásady", terms:"Podmínky", privacy:"Soukromí", cookies:"Cookies", community:"Pokyny Komunity", dmca:"DMCA", contact:"Kontakt", verification:"Ověření", rights:"Všechna práva vyhrazena. Funguje Kdekoli • SSL ZABEZPEČENO" },
  hu: { security:"🛡 Biztonsági Irányelv", terms:"Feltételek", privacy:"Adatvédelem", cookies:"Cookie-k", community:"Közösségi Irányelvek", dmca:"DMCA", contact:"Kapcsolat", verification:"Ellenőrzés", rights:"Minden jog fenntartva. Bárhol Működik • SSL VÉDETT" },
  fi: { security:"🛡 Tietoturvakäytäntö", terms:"Ehdot", privacy:"Yksityisyys", cookies:"Evästeet", community:"Yhteisön Ohjeet", dmca:"DMCA", contact:"Yhteys", verification:"Vahvistus", rights:"Kaikki oikeudet pidätetään. Toimii Kaikkialla • SSL SUOJATTU" },
  no: { security:"🛡 Sikkerhetspolicy", terms:"Vilkår", privacy:"Personvern", cookies:"Informasjonskapsler", community:"Retningslinjer for Fellesskap", dmca:"DMCA", contact:"Kontakt", verification:"Verifisering", rights:"Alle rettigheter forbeholdt. Fungerer Overalt • SSL SIKRET" },
  da: { security:"🛡 Sikkerhedspolitik", terms:"Vilkår", privacy:"Privatliv", cookies:"Cookies", community:"Fællesskabsretningslinjer", dmca:"DMCA", contact:"Kontakt", verification:"Verifikation", rights:"Alle rettigheder forbeholdes. Virker Overalt • SSL SIKRET" },
  bg: { security:"🛡 Политика за Сигурност", terms:"Условия", privacy:"Поверителност", cookies:"Бисквитки", community:"Насоки на Общността", dmca:"DMCA", contact:"Контакт", verification:"Верификация", rights:"Всички права запазени. Работи Навсякъде • SSL ЗАЩИТЕНО" },
  hr: { security:"🛡 Sigurnosna Politika", terms:"Uvjeti", privacy:"Privatnost", cookies:"Kolačići", community:"Smjernice Zajednice", dmca:"DMCA", contact:"Kontakt", verification:"Verifikacija", rights:"Sva prava pridržana. Radi Svugdje • SSL OSIGURANO" },
  sr: { security:"🛡 Безбедносна Политика", terms:"Услови", privacy:"Приватност", cookies:"Колачићи", community:"Смернице Заједнице", dmca:"DMCA", contact:"Контакт", verification:"Верификација", rights:"Сва права задржана. Ради Свудa • SSL ОБЕЗБЕЂЕНО" },
  sk: { security:"🛡 Bezpečnostná Politika", terms:"Podmienky", privacy:"Súkromie", cookies:"Cookies", community:"Pokyny Komunity", dmca:"DMCA", contact:"Kontakt", verification:"Overenie", rights:"Všetky práva vyhradené. Funguje Všade • SSL ZABEZPEČENÉ" },
  sl: { security:"🛡 Varnostna Politika", terms:"Pogoji", privacy:"Zasebnost", cookies:"Piškotki", community:"Smernice Skupnosti", dmca:"DMCA", contact:"Kontakt", verification:"Preverjanje", rights:"Vse pravice pridržane. Deluje Povsod • SSL ZAVAROVANO" },
  et: { security:"🛡 Turvapoliitika", terms:"Tingimused", privacy:"Privaatsus", cookies:"Küpsised", community:"Kogukonna Juhised", dmca:"DMCA", contact:"Kontakt", verification:"Kinnitamine", rights:"Kõik õigused kaitstud. Töötab Igal Pool • SSL KAITSTUD" },
  lv: { security:"🛡 Drošības Politika", terms:"Noteikumi", privacy:"Privātums", cookies:"Sīkdatnes", community:"Kopienas Vadlīnijas", dmca:"DMCA", contact:"Kontakts", verification:"Verifikācija", rights:"Visas tiesības aizsargātas. Darbojas Visur • SSL AIZSARGĀTS" },
  lt: { security:"🛡 Saugumo Politika", terms:"Sąlygos", privacy:"Privatumas", cookies:"Slapukai", community:"Bendruomenės Gairės", dmca:"DMCA", contact:"Kontaktas", verification:"Patvirtinimas", rights:"Visos teisės saugomos. Veikia Visur • SSL APSAUGOTA" },
  be: { security:"🛡 Палітыка Бяспекі", terms:"Умовы", privacy:"Прыватнасць", cookies:"Cookies", community:"Кіраўніцтва Супольнасці", dmca:"DMCA", contact:"Кантакт", verification:"Верыфікацыя", rights:"Усе правы абаронены. Працуе Ўсюды • SSL АБАРОНЕНА" },
  ka: { security:"🛡 უსაფრთხოების პოლიტიკა", terms:"წესები", privacy:"კონფიდენციალურობა", cookies:"Cookies", community:"საზოგადოების წესები", dmca:"DMCA", contact:"კონტაქტი", verification:"ვერიფიკაცია", rights:"ყველა უფლება დაცულია. მუშაობს ყველგან • SSL დაცული" },
  hy: { security:"🛡 Անվտանգության Քաղաքականություն", terms:"Պայմաններ", privacy:"Գաղտնիություն", cookies:"Քուքիներ", community:"Համայնքի Ուղեցույցներ", dmca:"DMCA", contact:"Կապ", verification:"Ստուգում", rights:"Բոլոր իրավունքները պաշտպանված են։ Աշխատում է Ամենուր • SSL ՊԱՇՏՊԱՆՎԱԾ" },
  az: { security:"🛡 Təhlükəsizlik Siyasəti", terms:"Şərtlər", privacy:"Məxfilik", cookies:"Cookies", community:"İcma Qaydaları", dmca:"DMCA", contact:"Əlaqə", verification:"Doğrulama", rights:"Bütün hüquqlar qorunur. Hər Yerdə İşləyir • SSL QORUNUR" },
  kk: { security:"🛡 Қауіпсіздік Саясаты", terms:"Шарттар", privacy:"Құпиялылық", cookies:"Cookies", community:"Қауымдастық Нұсқаулығы", dmca:"DMCA", contact:"Байланыс", verification:"Тексеру", rights:"Барлық құқықтар қорғалған. Барлық Жерде Жұмыс Істейді • SSL ҚОРҒАЛҒАН" },
  ky: { security:"🛡 Коопсуздук Саясаты", terms:"Шарттар", privacy:"Купуялуулук", cookies:"Cookies", community:"Коомчулук Жетекчилиги", dmca:"DMCA", contact:"Байланыш", verification:"Текшерүү", rights:"Бардык укуктар корголгон. Бардык Жерде Иштейт • SSL КОРГОЛГОН" },
  uz: { security:"🛡 Xavfsizlik Siyosati", terms:"Shartlar", privacy:"Maxfiylik", cookies:"Cookies", community:"Hamjamiyat Qoidalari", dmca:"DMCA", contact:"Aloqa", verification:"Tasdiqlash", rights:"Barcha huquqlar himoyalangan. Har Joyda Ishlaydi • SSL HIMOYALANGAN" },
  tg: { security:"🛡 Сиёсати Амният", terms:"Шартҳо", privacy:"Махфият", cookies:"Cookies", community:"Дастурҳои Ҷомеа", dmca:"DMCA", contact:"Тамос", verification:"Тасдиқ", rights:"Ҳамаи ҳуқуқҳо ҳифз шудаанд. Дар Ҳар Ҷо Кор Мекунад • SSL ҲИФЗ ШУДА" },
  mn: { security:"🛡 Аюулгүй Байдлын Бодлого", terms:"Нөхцөл", privacy:"Нууцлал", cookies:"Күүки", community:"Олон Нийтийн Удирдамж", dmca:"DMCA", contact:"Холбоо барих", verification:"Баталгаажуулалт", rights:"Бүх эрх хуулиар хамгаалагдсан. Хаана Ч Гэс Ажиллана • SSL ХАМГААЛАГДСАН" },
  km: { security:"🛡 គោលការណ៍សុវត្ថិភាព", terms:"លក្ខខណ្ឌ", privacy:"ឯកជនភាព", cookies:"ខូឃី", community:"គោលការណ៍ណែនាំសហគមន៍", dmca:"DMCA", contact:"ទំនាក់ទំនង", verification:"ផ្ទៀងផ្ទាត់", rights:"រក្សាសិទ្ធិគ្រប់យ៉ាង។ ដំណើរការគ្រប់ទីកន្លែង • SSL មានសុវត្ថិភាព" },
  lo: { security:"🛡 ນະໂຍບາຍຄວາມປອດໄພ", terms:"ເງື່ອນໄຂ", privacy:"ຄວາມເປັນສ່ວນຕົວ", cookies:"ຄຸກກີ", community:"ຄຳແນະນຳຊຸມຊົນ", dmca:"DMCA", contact:"ຕິດຕໍ່", verification:"ການຢືນຢັນ", rights:"ສະຫງວນລິຂະສິດທັງໝົດ ເຮັດວຽກທຸກບ່ອນ • SSL ປອດໄພ" },
  my: { security:"🛡 လုံခြုံရေးမူဝါဒ", terms:"စည်းမျဉ်းများ", privacy:"ကိုယ်ရေးကိုယ်တာ", cookies:"ကွတ်ကီးများ", community:"အသိုင်းအဝိုင်းလမ်းညွှန်ချက်များ", dmca:"DMCA", contact:"ဆက်သွယ်ရန်", verification:"အတည်ပြုခြင်း", rights:"မူပိုင်ခွင့်အားလုံးလုံခြုံသည်။ နေရာတိုင်းတွင်အလုပ်လုပ်သည် • SSL လုံခြုံသည်" },
}

export function LegalFooter() {
  const { language } = useLanguage()
  const d = D[language] || D.en
  return (
    <footer className="mt-12 border-t border-border bg-card/40">
      <div className="mx-auto max-w-5xl px-6 py-8 text-xs text-muted-foreground">
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/legal/security" className="hover:text-foreground font-medium text-foreground">{d.security}</Link>
          <Link href="/legal/terms" className="hover:text-foreground">{d.terms}</Link>
          <Link href="/legal/privacy" className="hover:text-foreground">{d.privacy}</Link>
          <Link href="/legal/privacy" className="hover:text-foreground">{d.cookies}</Link>
          <Link href="/legal/guarantees" className="hover:text-foreground">{d.community}</Link>
          <Link href="/legal/legal" className="hover:text-foreground">{d.dmca}</Link>
          <Link href="/legal/contact" className="hover:text-foreground">{d.contact}</Link>
          <Link href="/legal/verification" className="hover:text-foreground">{d.verification}</Link>
        </nav>
        <p className="mt-4">© {new Date().getFullYear()} {LEGAL.entityName}. {d.rights}</p>
      </div>
    </footer>
  )
}
