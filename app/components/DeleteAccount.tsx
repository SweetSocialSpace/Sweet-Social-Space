'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { confirm:"Delete your account and all your posts in this zip forever? Cannot be undone.", btn:"Delete account / Unsubscribe", deleting:"Deleting...", failed:"Delete failed: ", hint:" — add SERVICE_ROLE_KEY in Vercel env" },
  es: { confirm:"¿Eliminar tu cuenta y todos tus posts en este zip para siempre? No se puede deshacer.", btn:"Eliminar cuenta / Cancelar suscripción", deleting:"Eliminando...", failed:"Error al eliminar: ", hint:" — agrega SERVICE_ROLE_KEY en Vercel env" },
  fr: { confirm:"Supprimer votre compte et tous vos posts dans ce zip pour toujours? Irréversible.", btn:"Supprimer le compte / Se désabonner", deleting:"Suppression...", failed:"Échec de suppression: ", hint:" — ajoutez SERVICE_ROLE_KEY dans Vercel env" },
  de: { confirm:"Konto und alle Posts in dieser PLZ für immer löschen? Kann nicht rückgängig gemacht werden.", btn:"Konto löschen / Abmelden", deleting:"Löschen...", failed:"Löschen fehlgeschlagen: ", hint:" — SERVICE_ROLE_KEY in Vercel env hinzufügen" },
  zh: { confirm:"永远删除您的账户和此邮编中的所有帖子？无法撤消。", btn:"删除账户 / 退订", deleting:"删除中...", failed:"删除失败: ", hint:" — 在 Vercel env 中添加 SERVICE_ROLE_KEY" },
  ja: { confirm:"アカウントとこの郵便番号のすべての投稿を完全に削除しますか？元に戻せません。", btn:"アカウント削除 / 退会", deleting:"削除中...", failed:"削除失敗: ", hint:" — Vercel env に SERVICE_ROLE_KEY を追加" },
  ko: { confirm:"계정과 이 zip의 모든 게시물을 영구 삭제하시겠습니까? 되돌릴 수 없습니다.", btn:"계정 삭제 / 구독 취소", deleting:"삭제 중...", failed:"삭제 실패: ", hint:" — Vercel env에 SERVICE_ROLE_KEY 추가" },
  pt: { confirm:"Excluir sua conta e todos os posts neste cep para sempre? Não pode ser desfeito.", btn:"Excluir conta / Cancelar inscrição", deleting:"Excluindo...", failed:"Falha ao excluir: ", hint:" — adicione SERVICE_ROLE_KEY no Vercel env" },
  ru: { confirm:"Удалить ваш аккаунт и все посты в этом zip навсегда? Нельзя отменить.", btn:"Удалить аккаунт / Отписаться", deleting:"Удаление...", failed:"Ошибка удаления: ", hint:" — добавьте SERVICE_ROLE_KEY в Vercel env" },
  ar: { confirm:"حذف حسابك وجميع منشوراتك في هذا الرمز البريدي للأبد؟ لا يمكن التراجع.", btn:"حذف الحساب / إلغاء الاشتراك", deleting:"جاري الحذف...", failed:"فشل الحذف: ", hint:" — أضف SERVICE_ROLE_KEY في Vercel env" },
  hi: { confirm:"अपना खाता और इस ज़िप के सभी पोस्ट हमेशा के लिए हटाएं? इसे वापस नहीं किया जा सकता।", btn:"खाता हटाएं / अनसब्सक्राइब", deleting:"हटा रहा है...", failed:"हटाना विफल: ", hint:" — Vercel env में SERVICE_ROLE_KEY जोड़ें" },
  it: { confirm:"Eliminare il tuo account e tutti i post in questo zip per sempre? Impossibile annullare.", btn:"Elimina account / Annulla iscrizione", deleting:"Eliminazione...", failed:"Eliminazione fallita: ", hint:" — aggiungi SERVICE_ROLE_KEY in Vercel env" },
  nl: { confirm:"Je account en alle posts in deze zip voor altijd verwijderen? Kan niet ongedaan worden.", btn:"Account verwijderen / Uitschrijven", deleting:"Verwijderen...", failed:"Verwijderen mislukt: ", hint:" — voeg SERVICE_ROLE_KEY toe in Vercel env" },
  tl: { confirm:"Burahin ang account at lahat ng posts sa zip na ito magpakailanman? Hindi na maibabalik.", btn:"Burahin account / Unsubscribe", deleting:"Binubura...", failed:"Nabigo burahin: ", hint:" — magdagdag ng SERVICE_ROLE_KEY sa Vercel env" },
  bn: { confirm:"আপনার অ্যাকাউন্ট এবং এই জিপের সমস্ত পোস্ট চিরতরে মুছে ফেলবেন? পূর্বাবস্থায় ফেরানো যাবে না।", btn:"অ্যাকাউন্ট মুছুন / আনসাবস্ক্রাইব", deleting:"মুছছে...", failed:"মুছতে ব্যর্থ: ", hint:" — Vercel env-এ SERVICE_ROLE_KEY যোগ করুন" },
  id: { confirm:"Hapus akun dan semua postingan di zip ini selamanya? Tidak dapat dibatalkan.", btn:"Hapus akun / Berhenti berlangganan", deleting:"Menghapus...", failed:"Gagal menghapus: ", hint:" — tambahkan SERVICE_ROLE_KEY di Vercel env" },
  vi: { confirm:"Xóa tài khoản và tất cả bài đăng trong zip này mãi mãi? Không thể hoàn tác.", btn:"Xóa tài khoản / Hủy đăng ký", deleting:"Đang xóa...", failed:"Xóa thất bại: ", hint:" — thêm SERVICE_ROLE_KEY trong Vercel env" },
  th: { confirm:"ลบบัญชีและโพสต์ทั้งหมดใน zip นี้ถาวร? ไม่สามารถยกเลิกได้", btn:"ลบบัญชี / ยกเลิกการสมัคร", deleting:"กำลังลบ...", failed:"ลบล้มเหลว: ", hint:" — เพิ่ม SERVICE_ROLE_KEY ใน Vercel env" },
  sv: { confirm:"Ta bort ditt konto och alla inlägg i detta zip för alltid? Kan inte ångras.", btn:"Ta bort konto / Avsluta prenumeration", deleting:"Tar bort...", failed:"Borttagning misslyckades: ", hint:" — lägg till SERVICE_ROLE_KEY i Vercel env" },
  pl: { confirm:"Usunąć konto i wszystkie posty w tym zip na zawsze? Nie można cofnąć.", btn:"Usuń konto / Anuluj subskrypcję", deleting:"Usuwanie...", failed:"Usuwanie nie powiodło się: ", hint:" — dodaj SERVICE_ROLE_KEY w Vercel env" },
  tr: { confirm:"Hesabınızı ve bu zip'teki tüm gönderilerinizi sonsuza kadar silinsin mi? Geri alınamaz.", btn:"Hesabı Sil / Aboneliği İptal Et", deleting:"Siliniyor...", failed:"Silme başarısız: ", hint:" — Vercel env'e SERVICE_ROLE_KEY ekleyin" },
  uk: { confirm:"Видалити ваш акаунт і всі пости в цьому zip назавжди? Неможливо скасувати.", btn:"Видалити акаунт / Відписатися", deleting:"Видалення...", failed:"Помилка видалення: ", hint:" — додайте SERVICE_ROLE_KEY у Vercel env" },
  el: { confirm:"Διαγραφή λογαριασμού και όλων των αναρτήσεων σε αυτό το zip για πάντα; Δεν αναιρείται.", btn:"Διαγραφή λογαριασμού / Κατάργηση εγγραφής", deleting:"Διαγραφή...", failed:"Αποτυχία διαγραφής: ", hint:" — προσθέστε SERVICE_ROLE_KEY στο Vercel env" },
  he: { confirm:"למחוק את החשבון וכל הפוסטים במיקוד זה לצמיתות? לא ניתן לביטול.", btn:"מחק חשבון / בטל הרשמה", deleting:"מוחק...", failed:"מחיקה נכשלה: ", hint:" — הוסף SERVICE_ROLE_KEY ב-Vercel env" },
  ur: { confirm:"اپنا اکاؤنٹ اور اس زپ کی تمام پوسٹس ہمیشہ کے لیے حذف کریں؟ واپس نہیں ہو سکتا۔", btn:"اکاؤنٹ حذف کریں / ان سبسکرائب", deleting:"حذف ہو رہا ہے...", failed:"حذف ناکام: ", hint:" — Vercel env میں SERVICE_ROLE_KEY شامل کریں" },
  fa: { confirm:"حساب و تمام پست‌ها در این زیپ برای همیشه حذف شود؟ قابل بازگشت نیست.", btn:"حذف حساب / لغو اشتراک", deleting:"در حال حذف...", failed:"حذف ناموفق: ", hint:" — SERVICE_ROLE_KEY را در Vercel env اضافه کنید" },
  ms: { confirm:"Padam akaun dan semua siaran dalam zip ini selamanya? Tidak boleh dibatalkan.", btn:"Padam akaun / Nyahlanggan", deleting:"Memadam...", failed:"Gagal memadam: ", hint:" — tambah SERVICE_ROLE_KEY dalam Vercel env" },
  ro: { confirm:"Șterge contul și toate postările din acest zip pentru totdeauna? Nu poate fi anulat.", btn:"Șterge contul / Dezabonare", deleting:"Se șterge...", failed:"Ștergere eșuată: ", hint:" — adaugă SERVICE_ROLE_KEY în Vercel env" },
  cs: { confirm:"Smazat účet a všechny příspěvky v tomto zip navždy? Nelze vrátit.", btn:"Smazat účet / Odhlásit", deleting:"Maže se...", failed:"Mazání selhalo: ", hint:" — přidejte SERVICE_ROLE_KEY do Vercel env" },
  hu: { confirm:"Törli fiókját és az összes bejegyzést ebben az irányítószámban örökre? Nem vonható vissza.", btn:"Fiók törlése / Leiratkozás", deleting:"Törlés...", failed:"Törlés sikertelen: ", hint:" — adja hozzá a SERVICE_ROLE_KEY-t a Vercel env-hez" },
  fi: { confirm:"Poistetaanko tilisi ja kaikki postaukset tässä zipissä pysyvästi? Ei voi peruuttaa.", btn:"Poista tili / Peru tilaus", deleting:"Poistetaan...", failed:"Poisto epäonnistui: ", hint:" — lisää SERVICE_ROLE_KEY Vercel env:iin" },
  no: { confirm:"Slette kontoen din og alle innlegg i denne zip-en for alltid? Kan ikke angres.", btn:"Slett konto / Avslutt abonnement", deleting:"Sletter...", failed:"Sletting feilet: ", hint:" — legg til SERVICE_ROLE_KEY i Vercel env" },
  da: { confirm:"Slette din konto og alle opslag i denne zip for evigt? Kan ikke fortrydes.", btn:"Slet konto / Afmeld", deleting:"Sletter...", failed:"Sletning mislykkedes: ", hint:" — tilføj SERVICE_ROLE_KEY i Vercel env" },
  bg: { confirm:"Да изтрия акаунта и всички публикации в този zip завинаги? Не може да се отмени.", btn:"Изтрий акаунт / Отписване", deleting:"Изтриване...", failed:"Изтриването неуспешно: ", hint:" — добавете SERVICE_ROLE_KEY в Vercel env" },
  hr: { confirm:"Izbrisati račun i sve objave u ovom zipu zauvijek? Ne može se poništiti.", btn:"Izbriši račun / Odjavi se", deleting:"Brisanje...", failed:"Brisanje neuspjelo: ", hint:" — dodajte SERVICE_ROLE_KEY u Vercel env" },
  sr: { confirm:"Обрисати налог и све објаве у овом зип-у заувек? Не може се поништити.", btn:"Обриши налог / Одјави се", deleting:"Брисање...", failed:"Брисање није успело: ", hint:" — додајте SERVICE_ROLE_KEY у Vercel env" },
  sk: { confirm:"Vymazať účet a všetky príspevky v tomto zip navždy? Nedá sa vrátiť.", btn:"Vymazať účet / Odhlásiť", deleting:"Mazanie...", failed:"Mazanie zlyhalo: ", hint:" — pridajte SERVICE_ROLE_KEY do Vercel env" },
  sl: { confirm:"Izbrisati račun in vse objave v tej poštni številki za vedno? Ni mogoče razveljaviti.", btn:"Izbriši račun / Odjavi se", deleting:"Brisanje...", failed:"Brisanje ni uspelo: ", hint:" — dodajte SERVICE_ROLE_KEY v Vercel env" },
  et: { confirm:"Kustutada konto ja kõik postitused selles zipis igaveseks? Ei saa tagasi võtta.", btn:"Kustuta konto / Loobu tellimusest", deleting:"Kustutamine...", failed:"Kustutamine ebaõnnestus: ", hint:" — lisa SERVICE_ROLE_KEY Vercel env-i" },
  lv: { confirm:"Dzēst kontu un visus ierakstus šajā zip uz visiem laikiem? Nevar atsaukt.", btn:"Dzēst kontu / Anulēt abonementu", deleting:"Dzēš...", failed:"Dzēšana neizdevās: ", hint:" — pievienojiet SERVICE_ROLE_KEY Vercel env" },
  lt: { confirm:"Ištrinti paskyrą ir visus įrašus šiame zip visam laikui? Negalima atšaukti.", btn:"Ištrinti paskyrą / Atsisakyti prenumeratos", deleting:"Trinama...", failed:"Trinti nepavyko: ", hint:" — pridėkite SERVICE_ROLE_KEY į Vercel env" },
  be: { confirm:"Выдаліць акаўнт і ўсе пасты ў гэтым zip назаўжды? Нельга адмяніць.", btn:"Выдаліць акаўнт / Адпісацца", deleting:"Выдаленне...", failed:"Выдаленне не ўдалося: ", hint:" — дадайце SERVICE_ROLE_KEY у Vercel env" },
  ka: { confirm:"წავშალო ანგარიში და ყველა პოსტი ამ zip-ში სამუდამოდ? ვერ დაბრუნდება.", btn:"ანგარიშის წაშლა / გამოწერის გაუქმება", deleting:"იშლება...", failed:"წაშლა ვერ მოხერხდა: ", hint:" — დაამატეთ SERVICE_ROLE_KEY Vercel env-ში" },
  hy: { confirm:"Ջնջե՞լ հաշիվը և բոլոր գրառումները այս zip-ում ընդմիշտ: Չի կարող հետարկվել:", btn:"Ջնջել հաշիվը / Ապաբաժանորդագրվել", deleting:"Ջնջվում է...", failed:"Ջնջումը ձախողվեց: ", hint:" — ավելացրեք SERVICE_ROLE_KEY Vercel env-ում" },
  az: { confirm:"Hesabınızı və bu zip-dəki bütün paylaşımları həmişəlik silinsin? Geri qaytarmaq olmaz.", btn:"Hesabı Sil / Abunəliyi Ləğv Et", deleting:"Silinir...", failed:"Silinmədi: ", hint:" — Vercel env-ə SERVICE_ROLE_KEY əlavə edin" },
  kk: { confirm:"Есептік жазбаңызды және осы zip-тегі барлық жазбаларды мәңгі жою керек пе? Қайтару мүмкін емес.", btn:"Есептік жазбаны жою / Жазылымнан бас тарту", deleting:"Жойылуда...", failed:"Жою сәтсіз: ", hint:" — Vercel env-ге SERVICE_ROLE_KEY қосыңыз" },
  ky: { confirm:"Каттоо эсебиңизди жана бул zip-теги бардык постторду түбөлүккө жок кылуу керекпи? Кайтаруу мүмкүн эмес.", btn:"Каттоо эсебин жок кылуу / Жазылуудан баш тартуу", deleting:"Жок кылынууда...", failed:"Жок кылуу ишке ашпады: ", hint:" — Vercel envге SERVICE_ROLE_KEY кошуңуз" },
  uz: { confirm:"Hisobingiz va ushbu zip-dagi barcha postlarni abadiy o'chirish kerakmi? Qaytarib bo'lmaydi.", btn:"Hisobni o'chirish / Obunani bekor qilish", deleting:"O'chirilmoqda...", failed:"O'chirish muvaffaqiyatsiz: ", hint:" — Vercel env ga SERVICE_ROLE_KEY qo'shing" },
  tg: { confirm:"Ҳисоби шумо ва ҳама паёмҳо дар ин zip абадан нест карда шавад? Бозгардонда намешавад.", btn:"Ҳисобро нест кардан / Обунаро бекор кардан", deleting:"Нест карда истодааст...", failed:"Нест кардан ноком: ", hint:" — SERVICE_ROLE_KEY-ро дар Vercel env илова кунед" },
  mn: { confirm:"Бүртгэл болон энэ зип дэх бүх нийтлэлийг үүрд устгах уу? Буцаах боломжгүй.", btn:"Бүртгэл устгах / Захиалга цуцлах", deleting:"Устгаж байна...", failed:"Устгах амжилтгүй: ", hint:" — Vercel env-д SERVICE_ROLE_KEY нэмнэ үү" },
  km: { confirm:"លុបគណនី និងការបង្ហោះទាំងអស់ក្នុង zip នេះជារៀងរហូត? មិនអាចត្រឡប់វិញបានទេ។", btn:"លុបគណនី / លុបការជាវ", deleting:"កំពុងលុប...", failed:"លុបបរាជ័យ: ", hint:" — បន្ថែម SERVICE_ROLE_KEY ក្នុង Vercel env" },
  lo: { confirm:"ລຶບບັນຊີ ແລະ ໂພສທັງໝົດໃນ zip ນີ້ຕະຫຼອດໄປ? ບໍ່ສາມາດຍົກເລີກໄດ້", btn:"ລຶບບັນຊີ / ຍົກເລີກການສະໝັກ", deleting:"ກຳລັງລຶບ...", failed:"ລຶບລົ້ມເຫຼວ: ", hint:" — ເພີ່ມ SERVICE_ROLE_KEY ໃນ Vercel env" },
  my: { confirm:"သင့်အကောင့်နှင့် ဤ zip ရှိ ပို့စ်အားလုံးကို အမြဲတမ်း ဖျက်မလား? ပြန်ပြင်၍ မရပါ။", btn:"အကောင့်ဖျက်ရန် / စာရင်းသွင်းမှု ဖျက်ရန်", deleting:"ဖျက်နေသည်...", failed:"ဖျက်ရန် မအောင်မြင်: ", hint:" — Vercel env တွင် SERVICE_ROLE_KEY ထည့်ပါ" },
}

export default function DeleteAccount() {
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const doDelete = async () => {
    if (!window.confirm(d.confirm)) return
    setDeleting(true)
    try {
      const res = await fetch('/api/delete-account', { method: 'POST' })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Failed')
      await supabase.auth.signOut()
      localStorage.clear()
      router.push('/')
    } catch (e:any) {
      alert(d.failed + e.message + d.hint)
      setDeleting(false)
    }
  }

  return (
    <div className="mt-8 border-t border-white/10 pt-6 flex gap-3">
      <button onClick={doDelete} disabled={deleting} className="text-xs text-white/40 hover:text-red-400 underline">
        {deleting? d.deleting : d.btn}
      </button>
    </div>
  )
}
