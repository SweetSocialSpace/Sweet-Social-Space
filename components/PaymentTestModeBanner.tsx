'use client'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { prefix:"Payments in the preview are in test mode. Use card", suffix:", any future expiry, any CVC.", learn:"Learn more" },
  es: { prefix:"Los pagos en la vista previa están en modo prueba. Usa tarjeta", suffix:", cualquier vencimiento futuro, cualquier CVC.", learn:"Más información" },
  fr: { prefix:"Les paiements en aperçu sont en mode test. Utilisez la carte", suffix:", toute expiration future, tout CVC.", learn:"En savoir plus" },
  de: { prefix:"Zahlungen in der Vorschau sind im Testmodus. Verwende Karte", suffix:", beliebiges zukünftiges Ablaufdatum, beliebiger CVC.", learn:"Mehr erfahren" },
  zh: { prefix:"预览中的支付处于测试模式。使用卡号", suffix:"，任意未来有效期，任意 CVC。", learn:"了解更多" },
  ja: { prefix:"プレビューでの支払いはテストモードです。カード", suffix:"を使用、任意の将来の有効期限、任意のCVC。", learn:"詳細を見る" },
  ko: { prefix:"미리보기 결제는 테스트 모드입니다. 카드", suffix:"를 사용하세요, 미래 만료일 아무거나, CVC 아무거나.", learn:"더 알아보기" },
  pt: { prefix:"Pagamentos na prévia estão em modo teste. Use cartão", suffix:", qualquer validade futura, qualquer CVC.", learn:"Saiba mais" },
  ru: { prefix:"Платежи в превью в тестовом режиме. Используйте карту", suffix:", любой будущий срок, любой CVC.", learn:"Узнать больше" },
  ar: { prefix:"المدفوعات في المعاينة في وضع الاختبار. استخدم بطاقة", suffix:"، أي انتهاء مستقبلي، أي CVC.", learn:"اعرف المزيد" },
  hi: { prefix:"प्रीव्यू में भुगतान टेस्ट मोड में हैं। कार्ड उपयोग करें", suffix:", कोई भी भविष्य की समाप्ति, कोई भी CVC।", learn:"और जानें" },
  it: { prefix:"I pagamenti in anteprima sono in modalità test. Usa carta", suffix:", qualsiasi scadenza futura, qualsiasi CVC.", learn:"Scopri di più" },
  nl: { prefix:"Betalingen in preview zijn in testmodus. Gebruik kaart", suffix:", elke toekomstige vervaldatum, elke CVC.", learn:"Meer info" },
  tl: { prefix:"Payments sa preview ay nasa test mode. Gamitin card", suffix:", anumang future expiry, anumang CVC.", learn:"Matuto pa" },
  bn: { prefix:"প্রিভিউতে পেমেন্ট টেস্ট মোডে। কার্ড ব্যবহার করুন", suffix:", যেকোনো ভবিষ্যৎ মেয়াদ, যেকোনো CVC।", learn:"আরও জানুন" },
  id: { prefix:"Pembayaran di pratinjau dalam mode uji. Gunakan kartu", suffix:", expiry masa depan apa saja, CVC apa saja.", learn:"Pelajari lebih lanjut" },
  vi: { prefix:"Thanh toán trong bản xem trước ở chế độ thử. Dùng thẻ", suffix:", bất kỳ hạn tương lai, bất kỳ CVC.", learn:"Tìm hiểu thêm" },
  th: { prefix:"การชำระเงินในพรีวิวอยู่ในโหมดทดสอบ ใช้บัตร", suffix:", วันหมดอายุอนาคตใดก็ได้, CVC ใดก็ได้", learn:"เรียนรู้เพิ่มเติม" },
  sv: { prefix:"Betalningar i förhandsvisningen är i testläge. Använd kort", suffix:", valfritt framtida utgångsdatum, valfritt CVC.", learn:"Läs mer" },
  pl: { prefix:"Płatności w podglądzie są w trybie testowym. Użyj karty", suffix:", dowolna przyszła data ważności, dowolny CVC.", learn:"Dowiedz się więcej" },
  tr: { prefix:"Önizlemede ödemeler test modunda. Kart kullan", suffix:", herhangi gelecek son tarih, herhangi CVC.", learn:"Daha fazla bilgi" },
  uk: { prefix:"Платежі в прев'ю в тестовому режимі. Використовуйте картку", suffix:", будь-який майбутній термін, будь-який CVC.", learn:"Дізнатися більше" },
  el: { prefix:"Οι πληρωμές στην προεπισκόπηση είναι σε δοκιμαστική λειτουργία. Χρησιμοποιήστε κάρτα", suffix:", οποιαδήποτε μελλοντική λήξη, οποιοδήποτε CVC.", learn:"Μάθετε περισσότερα" },
  he: { prefix:"תשלומים בתצוגה מקדימה במצב בדיקה. השתמש בכרטיס", suffix:", כל תוקף עתידי, כל CVC.", learn:"למידע נוסף" },
  ur: { prefix:"پریویو میں ادائیگیاں ٹیسٹ موڈ میں ہیں۔ کارڈ استعمال کریں", suffix:", کوئی بھی مستقبل کی میعاد، کوئی بھی CVC۔", learn:"مزید جانیں" },
  fa: { prefix:"پرداخت‌ها در پیش‌نمایش در حالت آزمایشی هستند. از کارت", suffix:" استفاده کنید، هر انقضای آینده، هر CVC.", learn:"بیشتر بدانید" },
  ms: { prefix:"Pembayaran dalam pratonton dalam mod ujian. Guna kad", suffix:", sebarang tamat tempoh masa depan, sebarang CVC.", learn:"Ketahui lebih lanjut" },
  ro: { prefix:"Plățile în previzualizare sunt în mod test. Folosește cardul", suffix:", orice expirare viitoare, orice CVC.", learn:"Află mai multe" },
  cs: { prefix:"Platby v náhledu jsou v testovacím režimu. Použijte kartu", suffix:", jakékoli budoucí datum expirace, jakékoli CVC.", learn:"Zjistit více" },
  hu: { prefix:"A fizetések az előnézetben teszt módban vannak. Használd a kártyát", suffix:", bármilyen jövőbeli lejárat, bármilyen CVC.", learn:"Tudj meg többet" },
  fi: { prefix:"Maksut esikatselussa ovat testitilassa. Käytä korttia", suffix:", mikä tahansa tuleva voimassaolo, mikä tahansa CVC.", learn:"Lue lisää" },
  no: { prefix:"Betalinger i forhåndsvisning er i testmodus. Bruk kort", suffix:", hvilken som helst fremtidig utløpsdato, hvilken som helst CVC.", learn:"Lær mer" },
  da: { prefix:"Betalinger i preview er i testtilstand. Brug kort", suffix:", enhver fremtidig udløbsdato, enhver CVC.", learn:"Lær mere" },
  bg: { prefix:"Плащанията в прегледа са в тестов режим. Използвайте карта", suffix:", всяко бъдещо изтичане, всеки CVC.", learn:"Научете повече" },
  hr: { prefix:"Plaćanja u pregledu su u testnom načinu. Koristite karticu", suffix:", bilo koji budući istek, bilo koji CVC.", learn:"Saznajte više" },
  sr: { prefix:"Плаћања у прегледу су у тест режиму. Користите картицу", suffix:", било који будући истек, било који CVC.", learn:"Сазнајте више" },
  sk: { prefix:"Platby v náhľade sú v testovacom režime. Použite kartu", suffix:", akýkoľvek budúci dátum expirácie, akékoľvek CVC.", learn:"Zistiť viac" },
  sl: { prefix:"Plačila v predogledu so v testnem načinu. Uporabite kartico", suffix:", kateri koli prihodnji potek, kateri koli CVC.", learn:"Več informacij" },
  et: { prefix:"Maksed eelvaates on testrežiimis. Kasuta kaarti", suffix:", suvaline tulevane kehtivus, suvaline CVC.", learn:"Loe lisaks" },
  lv: { prefix:"Maksājumi priekšskatījumā ir testa režīmā. Izmantojiet karti", suffix:", jebkurš nākotnes derīguma termiņš, jebkurš CVC.", learn:"Uzzināt vairāk" },
  lt: { prefix:"Mokėjimai peržiūroje yra bandomajame režime. Naudokite kortelę", suffix:", bet koks būsimas galiojimas, bet koks CVC.", learn:"Sužinoti daugiau" },
  be: { prefix:"Плацяжы ў папярэднім праглядзе ў тэставым рэжыме. Выкарыстоўвайце карту", suffix:", любы будучы тэрмін, любы CVC.", learn:"Даведацца больш" },
  ka: { prefix:"გადახდები გადახედვაში ტესტის რეჟიმშია. გამოიყენეთ ბარათი", suffix:", ნებისმიერი მომავალი ვადა, ნებისმიერი CVC.", learn:"გაიგეთ მეტი" },
  hy: { prefix:"Վճարումները նախադիտման մեջ թեստային ռեժիմում են։ Օգտագործեք քարտը", suffix:", ցանկացած ապագա ժամկետ, ցանկացած CVC։", learn:"Իմանալ ավելին" },
  az: { prefix:"Önizləmədə ödənişlər test rejimindədir. Kartdan istifadə edin", suffix:", hər hansı gələcək bitmə, hər hansı CVC.", learn:"Daha çox öyrən" },
  kk: { prefix:"Алдын ала қараудағы төлемдер сынақ режимінде. Картаны пайдаланыңыз", suffix:", кез келген болашақ мерзім, кез келген CVC.", learn:"Көбірек білу" },
  ky: { prefix:"Алдын ала көрүүдөгү төлөмдөр тест режиминде. Картаны колдонуңуз", suffix:", каалаган келечектеги мөөнөт, каалаган CVC.", learn:"Көбүрөөк билүү" },
  uz: { prefix:"Ko'rib chiqishda to'lovlar test rejimida. Kartadan foydalaning", suffix:", har qanday kelajakdagi muddat, har qanday CVC.", learn:"Ko'proq o'rganish" },
  tg: { prefix:"Пардохтҳо дар пешнамоиш дар ҳолати тестӣ. Кортро истифода баред", suffix:", ҳар гуна мӯҳлати оянда, ҳар гуна CVC.", learn:"Бештар омӯзед" },
  mn: { prefix:"Урьдчилан харахад төлбөр тест горимд байна. Карт ашиглана уу", suffix:", дурын ирээдүйн хугацаа, дурын CVC.", learn:"Илүү мэдэх" },
  km: { prefix:"ការទូទាត់ក្នុងការមើលជាមុនស្ថិតក្នុងរបៀបសាកល្បង។ ប្រើកាត", suffix:", ផុតកំណត់អនាគតណាមួយ, CVC ណាមួយ។", learn:"ស្វែងយល់បន្ថែម" },
  lo: { prefix:"ການຈ່າຍເງິນໃນຕົວຢ່າງຢູ່ໃນໂໝດທົດສອບ. ໃຊ້ບັດ", suffix:", ໝົດອາຍຸອະນາຄົດໃດກໍໄດ້, CVC ໃດກໍໄດ້", learn:"ຮຽນຮູ້ເພີ່ມເຕີມ" },
  my: { prefix:"အစမ်းကြည့်ရှုမှုတွင် ငွေပေးချေမှုများသည် စမ်းသပ်မုဒ်တွင်ရှိသည်။ ကတ်", suffix:" ကိုသုံးပါ၊ မည်သည့်အနာဂတ်သက်တမ်းမဆို၊ မည်သည့် CVC မဆို။", learn:"ပိုမိုလေ့လာရန်" },
}

const clientToken = process.env.NEXT_PUBLIC_PAYMENTS_CLIENT_TOKEN

export function PaymentTestModeBanner() {
  const { language } = useLanguage()
  const d = D[language] || D.en
  try {
    if (!clientToken?.startsWith('pk_test_')) return null
    return (
      <div className="w-full bg-orange-100 border-b border-orange-300 px-4 py-2 text-center text-xs sm:text-sm text-orange-800">
        {d.prefix} <code className="font-mono font-semibold">4242 4242 4242 4242</code>{d.suffix}{' '}
        <a href="https://docs.lovable.dev/features/payments#test-and-live-environments" target="_blank" rel="noopener noreferrer" className="underline font-medium">{d.learn}</a>
      </div>
    )
  } catch { return null }
}
