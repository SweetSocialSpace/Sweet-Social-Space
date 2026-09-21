'use client'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { last:"Last updated:", feed:"Feed →", terms:"Terms", privacy:"Privacy", contact:"Contact", secured:"SSL SECURED" },
  es: { last:"Última actualización:", feed:"Feed →", terms:"Términos", privacy:"Privacidad", contact:"Contacto", secured:"SSL SEGURO" },
  fr: { last:"Dernière mise à jour:", feed:"Feed →", terms:"Conditions", privacy:"Confidentialité", contact:"Contact", secured:"SSL SÉCURISÉ" },
  de: { last:"Zuletzt aktualisiert:", feed:"Feed →", terms:"Bedingungen", privacy:"Datenschutz", contact:"Kontakt", secured:"SSL GESICHERT" },
  zh: { last:"最后更新:", feed:"动态 →", terms:"条款", privacy:"隐私", contact:"联系", secured:"SSL 安全" },
  ja: { last:"最終更新:", feed:"フィード →", terms:"利用規約", privacy:"プライバシー", contact:"お問い合わせ", secured:"SSL保護" },
  ko: { last:"마지막 업데이트:", feed:"피드 →", terms:"약관", privacy:"개인정보", contact:"연락처", secured:"SSL 보안" },
  pt: { last:"Última atualização:", feed:"Feed →", terms:"Termos", privacy:"Privacidade", contact:"Contato", secured:"SSL SEGURO" },
  ru: { last:"Последнее обновление:", feed:"Лента →", terms:"Условия", privacy:"Конфиденциальность", contact:"Контакт", secured:"SSL ЗАЩИЩЕНО" },
  ar: { last:"آخر تحديث:", feed:"الموجز →", terms:"الشروط", privacy:"الخصوصية", contact:"اتصل", secured:"SSL آمن" },
  hi: { last:"अंतिम अपडेट:", feed:"फ़ीड →", terms:"शर्तें", privacy:"गोपनीयता", contact:"संपर्क", secured:"SSL सुरक्षित" },
  it: { last:"Ultimo aggiornamento:", feed:"Feed →", terms:"Termini", privacy:"Privacy", contact:"Contatto", secured:"SSL SICURO" },
  nl: { last:"Laatst bijgewerkt:", feed:"Feed →", terms:"Voorwaarden", privacy:"Privacy", contact:"Contact", secured:"SSL BEVEILIGD" },
  tl: { last:"Huling update:", feed:"Feed →", terms:"Tuntunin", privacy:"Privacy", contact:"Contact", secured:"SSL SECURED" },
  bn: { last:"শেষ আপডেট:", feed:"ফিড →", terms:"শর্তাবলী", privacy:"গোপনীয়তা", contact:"যোগাযোগ", secured:"SSL সুরক্ষিত" },
  id: { last:"Terakhir diperbarui:", feed:"Feed →", terms:"Syarat", privacy:"Privasi", contact:"Kontak", secured:"SSL AMAN" },
  vi: { last:"Cập nhật lần cuối:", feed:"Bảng tin →", terms:"Điều khoản", privacy:"Riêng tư", contact:"Liên hệ", secured:"SSL AN TOÀN" },
  th: { last:"อัปเดตล่าสุด:", feed:"ฟีด →", terms:"ข้อกำหนด", privacy:"ความเป็นส่วนตัว", contact:"ติดต่อ", secured:"SSL ปลอดภัย" },
  sv: { last:"Senast uppdaterad:", feed:"Flöde →", terms:"Villkor", privacy:"Integritet", contact:"Kontakt", secured:"SSL SÄKER" },
  pl: { last:"Ostatnia aktualizacja:", feed:"Feed →", terms:"Warunki", privacy:"Prywatność", contact:"Kontakt", secured:"SSL ZABEZPIECZONE" },
  tr: { last:"Son güncelleme:", feed:"Akış →", terms:"Şartlar", privacy:"Gizlilik", contact:"İletişim", secured:"SSL GÜVENLİ" },
  uk: { last:"Останнє оновлення:", feed:"Стрічка →", terms:"Умови", privacy:"Конфіденційність", contact:"Контакт", secured:"SSL ЗАХИЩЕНО" },
  el: { last:"Τελευταία ενημέρωση:", feed:"Ροή →", terms:"Όροι", privacy:"Απόρρητο", contact:"Επικοινωνία", secured:"SSL ΑΣΦΑΛΕΣ" },
  he: { last:"עדכון אחרון:", feed:"פיד →", terms:"תנאים", privacy:"פרטיות", contact:"צור קשר", secured:"SSL מאובטח" },
  ur: { last:"آخری اپڈیٹ:", feed:"فیڈ →", terms:"شرائط", privacy:"رازداری", contact:"رابطہ", secured:"SSL محفوظ" },
  fa: { last:"آخرین به روز رسانی:", feed:"فید →", terms:"شرایط", privacy:"حریم خصوصی", contact:"تماس", secured:"SSL امن" },
  ms: { last:"Kemaskini terakhir:", feed:"Feed →", terms:"Terma", privacy:"Privasi", contact:"Hubungi", secured:"SSL SELAMAT" },
  ro: { last:"Ultima actualizare:", feed:"Feed →", terms:"Termeni", privacy:"Confidențialitate", contact:"Contact", secured:"SSL SECURIZAT" },
  cs: { last:"Poslední aktualizace:", feed:"Feed →", terms:"Podmínky", privacy:"Soukromí", contact:"Kontakt", secured:"SSL ZABEZPEČENO" },
  hu: { last:"Utolsó frissítés:", feed:"Hírfolyam →", terms:"Feltételek", privacy:"Adatvédelem", contact:"Kapcsolat", secured:"SSL VÉDETT" },
  fi: { last:"Viimeksi päivitetty:", feed:"Syöte →", terms:"Ehdot", privacy:"Yksityisyys", contact:"Yhteys", secured:"SSL SUOJATTU" },
  no: { last:"Sist oppdatert:", feed:"Feed →", terms:"Vilkår", privacy:"Personvern", contact:"Kontakt", secured:"SSL SIKRET" },
  da: { last:"Sidst opdateret:", feed:"Feed →", terms:"Vilkår", privacy:"Privatliv", contact:"Kontakt", secured:"SSL SIKRET" },
  bg: { last:"Последна актуализация:", feed:"Емисия →", terms:"Условия", privacy:"Поверителност", contact:"Контакт", secured:"SSL ЗАЩИТЕНО" },
  hr: { last:"Zadnje ažuriranje:", feed:"Feed →", terms:"Uvjeti", privacy:"Privatnost", contact:"Kontakt", secured:"SSL OSIGURANO" },
  sr: { last:"Последње ажурирање:", feed:"Фид →", terms:"Услови", privacy:"Приватност", contact:"Контакт", secured:"SSL ОБЕЗБЕЂЕНО" },
  sk: { last:"Posledná aktualizácia:", feed:"Feed →", terms:"Podmienky", privacy:"Súkromie", contact:"Kontakt", secured:"SSL ZABEZPEČENÉ" },
  sl: { last:"Zadnja posodobitev:", feed:"Viri →", terms:"Pogoji", privacy:"Zasebnost", contact:"Kontakt", secured:"SSL ZAVAROVANO" },
  et: { last:"Viimati uuendatud:", feed:"Voog →", terms:"Tingimused", privacy:"Privaatsus", contact:"Kontakt", secured:"SSL KAITSTUD" },
  lv: { last:"Pēdējoreiz atjaunināts:", feed:"Plūsma →", terms:"Noteikumi", privacy:"Privātums", contact:"Kontakts", secured:"SSL AIZSARGĀTS" },
  lt: { last:"Paskutinį kartą atnaujinta:", feed:"Srautas →", terms:"Sąlygos", privacy:"Privatumas", contact:"Kontaktas", secured:"SSL APSAUGOTA" },
  be: { last:"Апошняе абнаўленне:", feed:"Стужка →", terms:"Умовы", privacy:"Прыватнасць", contact:"Кантакт", secured:"SSL АБАРОНЕНА" },
  ka: { last:"ბოლო განახლება:", feed:"ფიდი →", terms:"წესები", privacy:"კონფიდენციალურობა", contact:"კონტაქტი", secured:"SSL დაცული" },
  hy: { last:"Վերջին թարմացումը.", feed:"Հոսք →", terms:"Պայմաններ", privacy:"Գաղտնիություն", contact:"Կապ", secured:"SSL ՊԱՇՏՊԱՆՎԱԾ" },
  az: { last:"Son yeniləmə:", feed:"Lent →", terms:"Şərtlər", privacy:"Məxfilik", contact:"Əlaqə", secured:"SSL QORUNUR" },
  kk: { last:"Соңғы жаңарту:", feed:"Лента →", terms:"Шарттар", privacy:"Құпиялылық", contact:"Байланыс", secured:"SSL ҚОРҒАЛҒАН" },
  ky: { last:"Акыркы жаңыртуу:", feed:"Лента →", terms:"Шарттар", privacy:"Купуялуулук", contact:"Байланыш", secured:"SSL КОРГОЛГОН" },
  uz: { last:"So'nggi yangilanish:", feed:"Lenta →", terms:"Shartlar", privacy:"Maxfiylik", contact:"Aloqa", secured:"SSL HIMOYALANGAN" },
  tg: { last:"Навсозии охирин:", feed:"Навор →", terms:"Шартҳо", privacy:"Махфият", contact:"Тамос", secured:"SSL ҲИФЗ ШУДА" },
  mn: { last:"Сүүлд шинэчилсэн:", feed:"Feed →", terms:"Нөхцөл", privacy:"Нууцлал", contact:"Холбоо барих", secured:"SSL ХАМГААЛАГДСАН" },
  km: { last:"អាប់ដេតចុងក្រោយ:", feed:"Feed →", terms:"លក្ខខណ្ឌ", privacy:"ឯកជនភាព", contact:"ទំនាក់ទំនង", secured:"SSL មានសុវត្ថិភាព" },
  lo: { last:"ອັບເດຫຼ້າສຸດ:", feed:"ຟີດ →", terms:"ເງື່ອນໄຂ", privacy:"ຄວາມເປັນສ່ວນຕົວ", contact:"ຕິດຕໍ່", secured:"SSL ປອດໄພ" },
  my: { last:"နောက်ဆုံးအပ်ဒိတ်:", feed:"Feed →", terms:"စည်းမျဉ်းများ", privacy:"ကိုယ်ရေးကိုယ်တာ", contact:"ဆက်သွယ်ရန်", secured:"SSL လုံခြုံသည်" },
}

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  const { language } = useLanguage()
  const d = D[language] || D.en
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: '0', zIndex: -2, backgroundImage: "url('/golden_droplet_heart_wallpaper.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: '0', zIndex: -1, background: 'rgba(0,0,0,0.18)' }} />
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '20px', background: 'rgba(0,0,0,0.32)' }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: '700', color: '#fff', textDecoration: 'none' }}>Sweet Social Space •</Link>
          <Link href="/feed" style={{ fontSize: '14px', color: '#ddd', textDecoration: 'none' }}>{d.feed}</Link>
        </div>
      </header>
      <main style={{ maxWidth: '768px', margin: '0 auto', width: '100%', flex: '1', padding: '48px 24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff' }}>{title}</h1>
        <p style={{ fontSize: '13px', color: '#bbb', marginBottom: '32px' }}>{d.last} {updated}</p>
        <div style={{ lineHeight: '1.8', fontSize: '15px', color: '#eee', background: 'rgba(0,0,0,0.30)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)' }}>{children}</div>
      </main>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '20px', textAlign: 'center', fontSize: '12px', color: '#aaa', background: 'rgba(0,0,0,0.32)' }}>
       © Sweet Social Space • {d.secured} • <Link href="/legal/terms" style={{ marginLeft: '8px', color: '#ccc' }}>{d.terms}</Link> • <Link href="/legal/privacy" style={{ marginLeft: '8px', color: '#ccc' }}>{d.privacy}</Link> • <Link href="/legal/contact" style={{ marginLeft: '8px', color: '#ccc' }}>{d.contact}</Link>
      </footer>
    </div>
  )
}
