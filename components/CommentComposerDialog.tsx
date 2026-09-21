'use client'
import * as React from 'react'
import MicRecorder from '@/components/mic/MicRecorder'
import { useLanguage } from '@/lib/language-context'

function Dialog({ open, onOpenChange, children }: any) { if (!open) return null; return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { try { onOpenChange(false) } catch {} }}><div onClick={(e) => e.stopPropagation()}>{children}</div></div>) }
function DialogContent({ children, className = '' }: any) { return <div className={`w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl ${className}`}>{children}</div> }
function DialogHeader({ children }: any) { return <div className="mb-4">{children}</div> }
function DialogTitle({ children }: any) { return <h2 className="font-display text-lg font-semibold">{children}</h2> }
function DialogDescription({ children }: any) { return <p className="mt-1 text-sm text-muted-foreground">{children}</p> }

const D: Record<string, any> = {
  en: { ph:"Write something…", post:"Post", title:"Write a comment", review:"Review your full message before posting. Press Ctrl+Enter to submit.", cancel:"Cancel" },
  es: { ph:"Escribe algo…", post:"Publicar", title:"Escribe un comentario", review:"Revisa tu mensaje completo antes de publicar. Presiona Ctrl+Enter para enviar.", cancel:"Cancelar" },
  fr: { ph:"Écrivez quelque chose…", post:"Publier", title:"Écrire un commentaire", review:"Vérifiez votre message complet avant de publier. Appuyez sur Ctrl+Entrée pour envoyer.", cancel:"Annuler" },
  de: { ph:"Schreib etwas…", post:"Posten", title:"Kommentar schreiben", review:"Überprüfe deine Nachricht vor dem Posten. Drücke Strg+Enter zum Senden.", cancel:"Abbrechen" },
  zh: { ph:"写点什么…", post:"发布", title:"写评论", review:"发布前检查完整消息。按 Ctrl+Enter 提交。", cancel:"取消" },
  ja: { ph:"何か書く…", post:"投稿", title:"コメントを書く", review:"投稿前にメッセージ全体を確認してください。Ctrl+Enterで送信。", cancel:"キャンセル" },
  ko: { ph:"뭔가 쓰기…", post:"게시", title:"댓글 쓰기", review:"게시 전 전체 메시지를 검토하세요. Ctrl+Enter로 제출。", cancel:"취소" },
  pt: { ph:"Escreva algo…", post:"Postar", title:"Escrever comentário", review:"Revise sua mensagem completa antes de postar. Pressione Ctrl+Enter para enviar.", cancel:"Cancelar" },
  ru: { ph:"Напишите что-нибудь…", post:"Опубликовать", title:"Написать комментарий", review:"Проверьте полное сообщение перед публикацией. Нажмите Ctrl+Enter для отправки.", cancel:"Отмена" },
  ar: { ph:"اكتب شيئا…", post:"نشر", title:"اكتب تعليقا", review:"راجع رسالتك الكاملة قبل النشر. اضغط Ctrl+Enter للإرسال.", cancel:"إلغاء" },
  hi: { ph:"कुछ लिखें…", post:"पोस्ट करें", title:"टिप्पणी लिखें", review:"पोस्ट करने से पहले पूरा संदेश देखें। Ctrl+Enter दबाकर भेजें।", cancel:"रद्द करें" },
  it: { ph:"Scrivi qualcosa…", post:"Pubblica", title:"Scrivi un commento", review:"Rivedi il messaggio completo prima di pubblicare. Premi Ctrl+Invio per inviare.", cancel:"Annulla" },
  nl: { ph:"Schrijf iets…", post:"Posten", title:"Schrijf een reactie", review:"Controleer je volledige bericht voor het posten. Druk Ctrl+Enter om te verzenden.", cancel:"Annuleren" },
  tl: { ph:"Magsulat ng…", post:"I-post", title:"Sumulat ng komento", review:"Suriin buong mensahe bago i-post. Pindutin Ctrl+Enter para isumite.", cancel:"Kanselahin" },
  bn: { ph:"কিছু লিখুন…", post:"পোস্ট", title:"মন্তব্য লিখুন", review:"পোস্ট করার আগে সম্পূর্ণ বার্তা পর্যালোচনা করুন। জমা দিতে Ctrl+Enter চাপুন।", cancel:"বাতিল" },
  id: { ph:"Tulis sesuatu…", post:"Posting", title:"Tulis komentar", review:"Tinjau pesan lengkap sebelum posting. Tekan Ctrl+Enter untuk kirim.", cancel:"Batal" },
  vi: { ph:"Viết gì đó…", post:"Đăng", title:"Viết bình luận", review:"Xem lại tin nhắn đầy đủ trước khi đăng. Nhấn Ctrl+Enter để gửi.", cancel:"Hủy" },
  th: { ph:"เขียนบางอย่าง…", post:"โพสต์", title:"เขียนความคิดเห็น", review:"ตรวจสอบข้อความเต็มก่อนโพสต์ กด Ctrl+Enter เพื่อส่ง", cancel:"ยกเลิก" },
  sv: { ph:"Skriv något…", post:"Posta", title:"Skriv en kommentar", review:"Granska hela meddelandet innan du postar. Tryck Ctrl+Enter för att skicka.", cancel:"Avbryt" },
  pl: { ph:"Napisz coś…", post:"Opublikuj", title:"Napisz komentarz", review:"Przejrzyj pełną wiadomość przed publikacją. Naciśnij Ctrl+Enter aby wysłać.", cancel:"Anuluj" },
  tr: { ph:"Bir şeyler yaz…", post:"Gönder", title:"Yorum yaz", review:"Göndermeden önce tam mesajını gözden geçir. Göndermek için Ctrl+Enter.", cancel:"İptal" },
  uk: { ph:"Напишіть щось…", post:"Опублікувати", title:"Написати коментар", review:"Перегляньте повне повідомлення перед публікацією. Натисніть Ctrl+Enter для відправки.", cancel:"Скасувати" },
  el: { ph:"Γράψτε κάτι…", post:"Δημοσίευση", title:"Γράψτε σχόλιο", review:"Ελέγξτε πλήρες μήνυμα πριν δημοσιεύσετε. Πατήστε Ctrl+Enter για υποβολή.", cancel:"Ακύρωση" },
  he: { ph:"כתוב משהו…", post:"פרסם", title:"כתוב תגובה", review:"בדוק הודעה מלאה לפני פרסום. לחץ Ctrl+Enter לשליחה.", cancel:"ביטול" },
  ur: { ph:"کچھ لکھیں…", post:"پوسٹ", title:"تبصرہ لکھیں", review:"پوسٹ کرنے سے پہلے مکمل پیغام دیکھیں۔ جمع کرانے کے لیے Ctrl+Enter دبائیں۔", cancel:"منسوخ" },
  fa: { ph:"چیزی بنویسید…", post:"ارسال", title:"نظر بنویسید", review:"پیام کامل را قبل از ارسال بررسی کنید. برای ارسال Ctrl+Enter را فشار دهید.", cancel:"لغو" },
  ms: { ph:"Tulis sesuatu…", post:"Hantar", title:"Tulis komen", review:"Semak mesej penuh sebelum menghantar. Tekan Ctrl+Enter untuk hantar.", cancel:"Batal" },
  ro: { ph:"Scrie ceva…", post:"Postează", title:"Scrie un comentariu", review:"Verifică mesajul complet înainte de postare. Apasă Ctrl+Enter pentru trimitere.", cancel:"Anulează" },
  cs: { ph:"Napiš něco…", post:"Odeslat", title:"Napsat komentář", review:"Zkontrolujte celou zprávu před odesláním. Stiskněte Ctrl+Enter pro odeslání.", cancel:"Zrušit" },
  hu: { ph:"Írj valamit…", post:"Közzététel", title:"Komment írása", review:"Nézd át teljes üzeneted közzététel előtt. Nyomj Ctrl+Enter a küldéshez.", cancel:"Mégse" },
  fi: { ph:"Kirjoita jotain…", post:"Julkaise", title:"Kirjoita kommentti", review:"Tarkista koko viesti ennen julkaisua. Paina Ctrl+Enter lähettääksesi.", cancel:"Peruuta" },
  no: { ph:"Skriv noe…", post:"Post", title:"Skriv en kommentar", review:"Se gjennom hele meldingen før posting. Trykk Ctrl+Enter for å sende.", cancel:"Avbryt" },
  da: { ph:"Skriv noget…", post:"Slå op", title:"Skriv en kommentar", review:"Gennemgå hele beskeden før opslag. Tryk Ctrl+Enter for at sende.", cancel:"Annuller" },
  bg: { ph:"Напиши нещо…", post:"Публикувай", title:"Напиши коментар", review:"Прегледай цялото съобщение преди публикуване. Натисни Ctrl+Enter за изпращане.", cancel:"Отказ" },
  hr: { ph:"Napiši nešto…", post:"Objavi", title:"Napiši komentar", review:"Pregledaj cijelu poruku prije objave. Pritisni Ctrl+Enter za slanje.", cancel:"Odustani" },
  sr: { ph:"Напиши нешто…", post:"Објави", title:"Напиши коментар", review:"Прегледај целу поруку пре објаве. Притисните Ctrl+Enter за слање.", cancel:"Откажи" },
  sk: { ph:"Napíš niečo…", post:"Zverejniť", title:"Napísať komentár", review:"Skontrolujte celú správu pred zverejnením. Stlačte Ctrl+Enter pre odoslanie.", cancel:"Zrušiť" },
  sl: { ph:"Napiši nekaj…", post:"Objavi", title:"Napiši komentar", review:"Preglej celotno sporočilo pred objavo. Pritisni Ctrl+Enter za pošiljanje.", cancel:"Prekliči" },
  et: { ph:"Kirjuta midagi…", post:"Postita", title:"Kirjuta kommentaar", review:"Vaata kogu sõnum enne postitamist üle. Vajuta Ctrl+Enter saatmiseks.", cancel:"Tühista" },
  lv: { ph:"Uzraksti kaut ko…", post:"Publicēt", title:"Uzrakstīt komentāru", review:"Pārskatiet pilnu ziņojumu pirms publicēšanas. Nospiediet Ctrl+Enter lai nosūtītu.", cancel:"Atcelt" },
  lt: { ph:"Parašyk ką nors…", post:"Paskelbti", title:"Parašyti komentarą", review:"Peržiūrėkite visą žinutę prieš skelbdami. Paspauskite Ctrl+Enter siuntimui.", cancel:"Atšaukti" },
  be: { ph:"Напішыце што-небудзь…", post:"Апублікаваць", title:"Напісаць каментар", review:"Праверце поўнае паведамленне перад публікацыяй. Націсніце Ctrl+Enter для адпраўкі.", cancel:"Скасаваць" },
  ka: { ph:"დაწერეთ რამე…", post:"გამოქვეყნება", title:"კომენტარის დაწერა", review:"გადახედეთ სრულ შეტყობინებას გამოქვეყნებამდე. დააჭირეთ Ctrl+Enter გასაგზავნად.", cancel:"გაუქმება" },
  hy: { ph:"Գրեք ինչ-որ բան…", post:"Հրապարակել", title:"Գրել մեկնաբանություն", review:"Վերանայեք ամբողջ հաղորդագրությունը նախքան հրապարակելը։ Սեղմեք Ctrl+Enter ուղարկելու համար։", cancel:"Չեղարկել" },
  az: { ph:"Bir şey yaz…", post:"Paylaş", title:"Şərh yaz", review:"Paylaşmadan əvvəl tam mesajı nəzərdən keçir. Göndərmək üçün Ctrl+Enter.", cancel:"Ləğv et" },
  kk: { ph:"Бірдеңе жаз…", post:"Жариялау", title:"Пікір жазу", review:"Жарияламас бұрын толық хабарламаны қарап шығыңыз. Жіберу үшін Ctrl+Enter басыңыз.", cancel:"Болдырмау" },
  ky: { ph:"Бир нерсе жаз…", post:"Жарыялоо", title:"Комментарий жазуу", review:"Жарыялоодон мурун толук билдирүүнү карап чыгыңыз. Жөнөтүү үчүн Ctrl+Enter.", cancel:"Жокко чыгаруу" },
  uz: { ph:"Biror narsa yoz…", post:"Joylash", title:"Izoh yozish", review:"Joylashdan oldin to'liq xabarni ko'rib chiqing. Yuborish uchun Ctrl+Enter bosing.", cancel:"Bekor qilish" },
  tg: { ph:"Чизе нависед…", post:"Интишор", title:"Шарҳ нависед", review:"Пеш аз интишор паёми пурраро аз назар гузаронед. Барои фиристодан Ctrl+Enter пахш кунед.", cancel:"Бекор" },
  mn: { ph:"Юм бич…", post:"Нийтлэх", title:"Сэтгэгдэл бичих", review:"Нийтлэхээсээ өмнө бүрэн мессежээ хяна. Илгээхдээ Ctrl+Enter дар.", cancel:"Цуцлах" },
  km: { ph:"សរសេរអ្វីមួយ…", post:"បង្ហោះ", title:"សរសេរមតិ", review:"ពិនិត្យសារពេញលេញមុនបង្ហោះ។ ចុច Ctrl+Enter ដើម្បីផ្ញើ។", cancel:"បោះបង់" },
  lo: { ph:"ຂຽນບາງຢ່າງ…", post:"ໂພສ", title:"ຂຽນຄຳເຫັນ", review:"ກວດເບິ່ງຂໍ້ຄວາມເຕັມກ່ອນໂພສ ກົດ Ctrl+Enter ເພື່ອສົ່ງ", cancel:"ຍົກເລີກ" },
  my: { ph:"တစ်ခုခုရေးပါ…", post:"တင်ရန်", title:"မှတ်ချက်ရေးရန်", review:"မတင်မီ မက်ဆေ့ချ်အပြည့်အစုံကိုပြန်လည်သုံးသပ်ပါ။ တင်ရန် Ctrl+Enter နှိပ်ပါ။", cancel:"ပယ်ဖျက်ရန်" },
}

interface CommentComposerDialogProps { value: string; onChange: (value: string) => void; onSubmit: () => void; placeholder?: string; maxLength?: number; submitLabel?: string; disabled?: boolean; title?: string; dialogRows?: number; previewClassName?: string; open?: boolean; onOpenChange?: (open: boolean) => void }

export function CommentComposerDialog({ value, onChange, onSubmit, placeholder, maxLength = 2000, submitLabel, disabled = false, title, dialogRows = 10, previewClassName, open: controlledOpen, onOpenChange }: CommentComposerDialogProps) {
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen!== undefined
  const open = isControlled? controlledOpen : internalOpen
  const setOpen = (next: boolean) => { try { if (!isControlled) setInternalOpen(next); onOpenChange?.(next) } catch {} }
  const handleSubmit = () => { try { onSubmit(); setOpen(false) } catch {} }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSubmit() } }

  const ph = placeholder?? d.ph
  const sLabel = submitLabel?? d.post
  const t = title?? d.title

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={previewClassName?? 'flex-1 cursor-text rounded-2xl border border-border bg-background px-3 py-2 text-left text-sm outline-none transition hover:bg-muted focus:ring-2 focus:ring-primary'}>{value? (<span className="block line-clamp-1 text-foreground">{value}</span>) : (<span className="text-muted-foreground">{ph}</span>)}</button>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-lg gap-4"><DialogHeader><DialogTitle>{t}</DialogTitle><DialogDescription>{d.review}</DialogDescription></DialogHeader><textarea value={value} onChange={(e) => { try { onChange(e.target.value) } catch {} }} onKeyDown={handleKeyDown} placeholder={ph} maxLength={maxLength} rows={dialogRows} autoFocus className="w-full resize-none rounded-md border border-border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" /><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><MicRecorder onTranscript={(t:string) => { try { onChange(t) } catch {} }} /><span className="text-xs text-muted-foreground">{value.length}/{maxLength}</span></div><div className="flex gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">{d.cancel}</button><button type="button" onClick={handleSubmit} disabled={disabled} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{sLabel}</button></div></div></DialogContent></Dialog>
    </>
  )
}
