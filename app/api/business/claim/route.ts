import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const T: Record<string, { namePrefix:string, descClaim:string, badge:string, missing:string, error:string }> = {
en: { namePrefix:"Sweet Social Space", descClaim:"Claim in {zip} - Verified badge", badge:"Verified badge", missing:"Missing fields", error:"Payment error" },
es: { namePrefix:"Sweet Social Space", descClaim:"Reclamo en {zip} - Insignia verificada", badge:"Insignia verificada", missing:"Faltan campos", error:"Error de pago" },
fr: { namePrefix:"Sweet Social Space", descClaim:"Revendication a {zip} - Badge verifie", badge:"Badge verifie", missing:"Champs manquants", error:"Erreur paiement" },
de: { namePrefix:"Sweet Social Space", descClaim:"Anspruch in {zip} - Verifiziertes Abzeichen", badge:"Verifiziertes Abzeichen", missing:"Felder fehlen", error:"Zahlungsfehler" },
zh: { namePrefix:"Sweet Social Space", descClaim:"在 {zip} 认领 - 已验证徽章", badge:"已验证徽章", missing:"缺少字段", error:"支付错误" },
ja: { namePrefix:"Sweet Social Space", descClaim:"{zip} で申請 - 認証バッジ", badge:"認証バッジ", missing:"フィールド不足", error:"支払いエラー" },
ko: { namePrefix:"Sweet Social Space", descClaim:"{zip}에서 클레임 - 인증 배지", badge:"인증 배지", missing:"필드 누락", error:"결제 오류" },
pt: { namePrefix:"Sweet Social Space", descClaim:"Reivindicacao em {zip} - Selo verificado", badge:"Selo verificado", missing:"Campos faltando", error:"Erro pagamento" },
ru: { namePrefix:"Sweet Social Space", descClaim:"Заявка в {zip} - Проверенный значок", badge:"Проверенный значок", missing:"Отсутствуют поля", error:"Ошибка оплаты" },
ar: { namePrefix:"Sweet Social Space", descClaim:"مطالبة في {zip} - شارة موثقة", badge:"شارة موثقة", missing:"حقول مفقودة", error:"خطأ دفع" },
hi: { namePrefix:"Sweet Social Space", descClaim:"{zip} में दावा - सत्यापित बैज", badge:"सत्यापित बैज", missing:"फ़ील्ड गायब", error:"भुगतान त्रुटि" },
it: { namePrefix:"Sweet Social Space", descClaim:"Rivendicazione in {zip} - Badge verificato", badge:"Badge verificato", missing:"Campi mancanti", error:"Errore pagamento" },
nl: { namePrefix:"Sweet Social Space", descClaim:"Claim in {zip} - Geverifieerde badge", badge:"Geverifieerde badge", missing:"Velden ontbreken", error:"Betalingsfout" },
tl: { namePrefix:"Sweet Social Space", descClaim:"Claim sa {zip} - Verified badge", badge:"Verified badge", missing:"Kulang na fields", error:"Payment error" },
bn: { namePrefix:"Sweet Social Space", descClaim:"{zip} এ দাবি - যাচাইকৃত ব্যাজ", badge:"যাচাইকৃত ব্যাজ", missing:"ফিল্ড অনুপস্থিত", error:"পেমেন্ট ত্রুটি" },
id: { namePrefix:"Sweet Social Space", descClaim:"Klaim di {zip} - Lencana terverifikasi", badge:"Lencana terverifikasi", missing:"Field hilang", error:"Kesalahan pembayaran" },
vi: { namePrefix:"Sweet Social Space", descClaim:"Xác nhận tại {zip} - Huy hiệu đã xác minh", badge:"Huy hiệu đã xác minh", missing:"Thiếu trường", error:"Lỗi thanh toán" },
th: { namePrefix:"Sweet Social Space", descClaim:"เคลมใน {zip} - ป้ายยืนยันแล้ว", badge:"ป้ายยืนยันแล้ว", missing:"ฟิลด์หายไป", error:"ข้อผิดพลาดชำระเงิน" },
sv: { namePrefix:"Sweet Social Space", descClaim:"Anspråk i {zip} - Verifierad badge", badge:"Verifierad badge", missing:"Fält saknas", error:"Betalningsfel" },
pl: { namePrefix:"Sweet Social Space", descClaim:"Roszczenie w {zip} - Zweryfikowana odznaka", badge:"Zweryfikowana odznaka", missing:"Brak pól", error:"Błąd płatności" },
tr: { namePrefix:"Sweet Social Space", descClaim:"{zip} içinde talep - Doğrulanmış rozet", badge:"Doğrulanmış rozet", missing:"Alanlar eksik", error:"Ödeme hatası" },
uk: { namePrefix:"Sweet Social Space", descClaim:"Заявка в {zip} - Перевірений значок", badge:"Перевірений значок", missing:"Відсутні поля", error:"Помилка оплати" },
el: { namePrefix:"Sweet Social Space", descClaim:"Αξίωση σε {zip} - Επαληθευμένο σήμα", badge:"Επαληθευμένο σήμα", missing:"Λείπουν πεδία", error:"Σφάλμα πληρωμής" },
he: { namePrefix:"Sweet Social Space", descClaim:"תביעה ב-{zip} - תג מאומת", badge:"תג מאומת", missing:"שדות חסרים", error:"שגיאת תשלום" },
ur: { namePrefix:"Sweet Social Space", descClaim:"{zip} میں دعوی - تصدیق شدہ بیج", badge:"تصدیق شدہ بیج", missing:"فیلڈز غائب", error:"ادائیگی کی خرابی" },
fa: { namePrefix:"Sweet Social Space", descClaim:"ادعا در {zip} - نشان تأیید شده", badge:"نشان تأیید شده", missing:"فیلدها مفقود", error:"خطای پرداخت" },
ms: { namePrefix:"Sweet Social Space", descClaim:"Tuntutan di {zip} - Lencana disahkan", badge:"Lencana disahkan", missing:"Medan hilang", error:"Ralat pembayaran" },
ro: { namePrefix:"Sweet Social Space", descClaim:"Revendicare în {zip} - Insignă verificată", badge:"Insignă verificată", missing:"Câmpuri lipsă", error:"Eroare plată" },
cs: { namePrefix:"Sweet Social Space", descClaim:"Nárok v {zip} - Ověřený odznak", badge:"Ověřený odznak", missing:"Chybí pole", error:"Chyba platby" },
hu: { namePrefix:"Sweet Social Space", descClaim:"Igénylés itt: {zip} - Hitelesített jelvény", badge:"Hitelesített jelvény", missing:"Hiányzó mezők", error:"Fizetési hiba" },
fi: { namePrefix:"Sweet Social Space", descClaim:"Vaatimus paikassa {zip} - Vahvistettu merkki", badge:"Vahvistettu merkki", missing:"Kentät puuttuvat", error:"Maksuvirhe" },
no: { namePrefix:"Sweet Social Space", descClaim:"Krav i {zip} - Verifisert merke", badge:"Verifisert merke", missing:"Mangler felt", error:"Betalingsfeil" },
da: { namePrefix:"Sweet Social Space", descClaim:"Krav i {zip} - Bekræftet badge", badge:"Bekræftet badge", missing:"Mangler felter", error:"Betalingsfejl" },
bg: { namePrefix:"Sweet Social Space", descClaim:"Претенция в {zip} - Потвърдена значка", badge:"Потвърдена значка", missing:"Липсват полета", error:"Грешка плащане" },
hr: { namePrefix:"Sweet Social Space", descClaim:"Zahtjev u {zip} - Potvrđena značka", badge:"Potvrđena značka", missing:"Nedostaju polja", error:"Greška plaćanja" },
sr: { namePrefix:"Sweet Social Space", descClaim:"Захтев у {zip} - Потврђена значка", badge:"Потврђена значка", missing:"Недостају поља", error:"Грешка плаћања" },
sk: { namePrefix:"Sweet Social Space", descClaim:"Nárok v {zip} - Overená odznak", badge:"Overená odznak", missing:"Chýbajú polia", error:"Chyba platby" },
sl: { namePrefix:"Sweet Social Space", descClaim:"Zahtevek v {zip} - Preverjena značka", badge:"Preverjena značka", missing:"Manjkajo polja", error:"Napaka plačila" },
et: { namePrefix:"Sweet Social Space", descClaim:"Nõue kohas {zip} - Kinnitatud märk", badge:"Kinnitatud märk", missing:"Väljad puudu", error:"Makse viga" },
lv: { namePrefix:"Sweet Social Space", descClaim:"Pieprasījums {zip} - Verificēta nozīme", badge:"Verificēta nozīme", missing:"Trūkst lauku", error:"Maksājuma kļūda" },
lt: { namePrefix:"Sweet Social Space", descClaim:"Paraiška {zip} - Patvirtintas ženklelis", badge:"Patvirtintas ženklelis", missing:"Trūksta laukų", error:"Mokėjimo klaida" },
be: { namePrefix:"Sweet Social Space", descClaim:"Заяўка ў {zip} - Правераны значок", badge:"Правераны значок", missing:"Адсутнічаюць палі", error:"Памылка аплаты" },
ka: { namePrefix:"Sweet Social Space", descClaim:"მოთხოვნა {zip}-ში - დადასტურებული ნიშანი", badge:"დადასტურებული ნიშანი", missing:"ველები აკლია", error:"გადახდის შეცდომა" },
hy: { namePrefix:"Sweet Social Space", descClaim:"Հայց {zip}-ում - Հաստատված նշան", badge:"Հաստատված նշան", missing:"Դաշտերը բացակայում են", error:"Վճարման սխալ" },
az: { namePrefix:"Sweet Social Space", descClaim:"{zip}-da iddia - Təsdiqlənmiş nişan", badge:"Təsdiqlənmiş nişan", missing:"Sahələr əskikdir", error:"Ödəniş xətası" },
kk: { namePrefix:"Sweet Social Space", descClaim:"{zip} ішінде талап - Расталған белгі", badge:"Расталған белгі", missing:"Өрістер жоқ", error:"Төлем қатесі" },
ky: { namePrefix:"Sweet Social Space", descClaim:"{zip} ичинде талап - Тастыкталган белги", badge:"Тастыкталган белги", missing:"Талаалар жок", error:"Төлөм катасы" },
uz: { namePrefix:"Sweet Social Space", descClaim:"{zip} da da'vo - Tasdiqlangan nishon", badge:"Tasdiqlangan nishon", missing:"Maydonlar yo'q", error:"To'lov xatosi" },
tg: { namePrefix:"Sweet Social Space", descClaim:"Даъво дар {zip} - Нишони тасдиқшуда", badge:"Нишони тасдиқшуда", missing:"Майдонҳо нест", error:"Хатогии пардохт" },
mn: { namePrefix:"Sweet Social Space", descClaim:"{zip} дэх нэхэмжлэл - Баталгаажсан тэмдэг", badge:"Баталгаажсан тэмдэг", missing:"Талбарууд дутуу", error:"Төлбөрийн алдаа" },
km: { namePrefix:"Sweet Social Space", descClaim:"ការទាមទារនៅ {zip} - ផ្លាកសញ្ញាផ្ទៀងផ្ទាត់", badge:"ផ្លាកសញ្ញាផ្ទៀងផ្ទាត់", missing:"បាត់វាល", error:"កំហុសទូទាត់" },
lo: { namePrefix:"Sweet Social Space", descClaim:"ການຮຽກຮ້ອງໃນ {zip} - ປ້າຍຢືນຢັນ", badge:"ປ້າຍຢືນຢັນ", missing:"ຊ່ອງຂາດ", error:"ຂໍ້ຜິດພາດຊຳລະເງິນ" },
my: { namePrefix:"Sweet Social Space", descClaim:"{zip} တွင် တောင်းဆိုမှု - အတည်ပြုထားသော တံဆိပ်", badge:"အတည်ပြုထားသော တံဆိပ်", missing:"အကွက်များ ပျောက်နေသည်", error:"ငွေပေးချေမှု အမှား" },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { businessName, email, zip, lang: bodyLang } = body
    const langParam = req.nextUrl.searchParams.get('lang')
    const lang = (bodyLang || langParam || 'en').toLowerCase().split('-')[0]
    const t = T[lang] || T.en

    if (!businessName || !email) {
      return NextResponse.json({ error: t.missing }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${t.namePrefix} - ${businessName}`,
              description: t.descClaim.replace('{zip}', zip || 'your area'),
            },
            unit_amount: 2900,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/claim/success?business=${encodeURIComponent(businessName)}&lang=${lang}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/claim?lang=${lang}`,
      metadata: { businessName, zip, lang },
      locale: (lang === 'zh' ? 'zh' : lang === 'ja' ? 'ja' : lang === 'es' ? 'es' : lang === 'fr' ? 'fr' : lang === 'de' ? 'de' : 'en') as any,
    })

    return NextResponse.json({ url: session.url, lang })
  } catch (err: any) {
    console.error('Stripe error:', err)
    const lang = (req.nextUrl.searchParams.get('lang') || 'en').toLowerCase().split('-')[0]
    const t = T[lang] || T.en
    return NextResponse.json({ error: `${t.error}: ${err.message}` }, { status: 500 })
  }
}
