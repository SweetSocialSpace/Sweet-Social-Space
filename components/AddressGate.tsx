'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { title:"Add your address", desc:"Needed for local delivery and verification", street:"Street", city:"City", state:"State / Region", zip:"Postal Code", country:"Country", save:"Save address", skip:"Skip for now", saved:"Address saved", enter:"Please enter your address to continue" },
  es: { title:"Agrega tu dirección", desc:"Necesaria para entrega local y verificación", street:"Calle", city:"Ciudad", state:"Estado / Región", zip:"Código postal", country:"País", save:"Guardar dirección", skip:"Omitir por ahora", saved:"Dirección guardada", enter:"Por favor ingresa tu dirección para continuar" },
  fr: { title:"Ajoutez votre adresse", desc:"Nécessaire pour livraison locale et vérification", street:"Rue", city:"Ville", state:"État / Région", zip:"Code postal", country:"Pays", save:"Enregistrer l'adresse", skip:"Ignorer pour l'instant", saved:"Adresse enregistrée", enter:"Veuillez entrer votre adresse pour continuer" },
  de: { title:"Adresse hinzufügen", desc:"Erforderlich für lokale Lieferung und Verifizierung", street:"Straße", city:"Stadt", state:"Bundesland / Region", zip:"Postleitzahl", country:"Land", save:"Adresse speichern", skip:"Erstmal überspringen", saved:"Adresse gespeichert", enter:"Bitte gib deine Adresse ein um fortzufahren" },
  zh: { title:"添加你的地址", desc:"本地配送和验证所需", street:"街道", city:"城市", state:"州 / 地区", zip:"邮政编码", country:"国家", save:"保存地址", skip:"暂时跳过", saved:"地址已保存", enter:"请输入你的地址以继续" },
  ja: { title:"住所を追加", desc:"地域配送と確認に必要", street:"番地", city:"市区町村", state:"都道府県 / 地域", zip:"郵便番号", country:"国", save:"住所を保存", skip:"今はスキップ", saved:"住所が保存されました", enter:"続行するには住所を入力してください" },
  ko: { title:"주소 추가", desc:"지역 배달 및 확인에 필요", street:"거리", city:"도시", state:"주 / 지역", zip:"우편번호", country:"국가", save:"주소 저장", skip:"나중에", saved:"주소 저장됨", enter:"계속하려면 주소를 입력하세요" },
  pt: { title:"Adicione seu endereço", desc:"Necessário para entrega local e verificação", street:"Rua", city:"Cidade", state:"Estado / Região", zip:"CEP", country:"País", save:"Salvar endereço", skip:"Pular por enquanto", saved:"Endereço salvo", enter:"Por favor insira seu endereço para continuar" },
  ru: { title:"Добавьте адрес", desc:"Нужно для локальной доставки и верификации", street:"Улица", city:"Город", state:"Область / Регион", zip:"Индекс", country:"Страна", save:"Сохранить адрес", skip:"Пропустить", saved:"Адрес сохранен", enter:"Пожалуйста введите адрес для продолжения" },
  ar: { title:"أضف عنوانك", desc:"مطلوب للتوصيل المحلي والتحقق", street:"الشارع", city:"المدينة", state:"الولاية / المنطقة", zip:"الرمز البريدي", country:"البلد", save:"حفظ العنوان", skip:"تخطي الآن", saved:"تم حفظ العنوان", enter:"الرجاء إدخال عنوانك للمتابعة" },
  hi: { title:"अपना पता जोड़ें", desc:"स्थानीय डिलीवरी और सत्यापन के लिए आवश्यक", street:"गली", city:"शहर", state:"राज्य / क्षेत्र", zip:"पिन कोड", country:"देश", save:"पता सहेजें", skip:"अभी छोड़ें", saved:"पता सहेजा गया", enter:"जारी रखने के लिए अपना पता दर्ज करें" },
  it: { title:"Aggiungi indirizzo", desc:"Necessario per consegna locale e verifica", street:"Via", city:"Città", state:"Stato / Regione", zip:"CAP", country:"Paese", save:"Salva indirizzo", skip:"Salta per ora", saved:"Indirizzo salvato", enter:"Inserisci indirizzo per continuare" },
  nl: { title:"Adres toevoegen", desc:"Nodig voor lokale levering en verificatie", street:"Straat", city:"Stad", state:"Provincie / Regio", zip:"Postcode", country:"Land", save:"Adres opslaan", skip:"Nu overslaan", saved:"Adres opgeslagen", enter:"Voer je adres in om door te gaan" },
  tl: { title:"Idagdag ang address", desc:"Kailangan para sa local delivery at verification", street:"Kalye", city:"Lungsod", state:"State / Rehiyon", zip:"Postal Code", country:"Bansa", save:"I-save address", skip:"Laktawan muna", saved:"Na-save ang address", enter:"Ilagay ang address para magpatuloy" },
  bn: { title:"আপনার ঠিকানা যোগ করুন", desc:"স্থানীয় ডেলিভারি ও যাচাইকরণের জন্য প্রয়োজন", street:"রাস্তা", city:"শহর", state:"রাজ্য / অঞ্চল", zip:"পোস্টাল কোড", country:"দেশ", save:"ঠিকানা সংরক্ষণ", skip:"এখন এড়িয়ে যান", saved:"ঠিকানা সংরক্ষিত", enter:"চালিয়ে যেতে ঠিকানা লিখুন" },
  id: { title:"Tambah alamat", desc:"Diperlukan untuk pengiriman lokal dan verifikasi", street:"Jalan", city:"Kota", state:"Provinsi / Wilayah", zip:"Kode pos", country:"Negara", save:"Simpan alamat", skip:"Lewati dulu", saved:"Alamat disimpan", enter:"Masukkan alamat untuk melanjutkan" },
  vi: { title:"Thêm địa chỉ", desc:"Cần cho giao hàng địa phương và xác minh", street:"Đường", city:"Thành phố", state:"Tiểu bang / Vùng", zip:"Mã bưu chính", country:"Quốc gia", save:"Lưu địa chỉ", skip:"Bỏ qua", saved:"Đã lưu địa chỉ", enter:"Vui lòng nhập địa chỉ để tiếp tục" },
  th: { title:"เพิ่มที่อยู่", desc:"จำเป็นสำหรับการจัดส่งในพื้นที่และการยืนยัน", street:"ถนน", city:"เมือง", state:"รัฐ / ภูมิภาค", zip:"รหัสไปรษณีย์", country:"ประเทศ", save:"บันทึกที่อยู่", skip:"ข้ามตอนนี้", saved:"บันทึกที่อยู่แล้ว", enter:"กรุณากรอกที่อยู่เพื่อดำเนินการต่อ" },
  sv: { title:"Lägg till adress", desc:"Behövs för lokal leverans och verifiering", street:"Gata", city:"Stad", state:"Stat / Region", zip:"Postnummer", country:"Land", save:"Spara adress", skip:"Hoppa över nu", saved:"Adress sparad", enter:"Ange adress för att fortsätta" },
  pl: { title:"Dodaj adres", desc:"Potrzebny do lokalnej dostawy i weryfikacji", street:"Ulica", city:"Miasto", state:"Województwo / Region", zip:"Kod pocztowy", country:"Kraj", save:"Zapisz adres", skip:"Pomiń na razie", saved:"Adres zapisany", enter:"Wprowadź adres aby kontynuować" },
  tr: { title:"Adresini ekle", desc:"Yerel teslimat ve doğrulama için gerekli", street:"Sokak", city:"Şehir", state:"Eyalet / Bölge", zip:"Posta kodu", country:"Ülke", save:"Adresi kaydet", skip:"Şimdilik atla", saved:"Adres kaydedildi", enter:"Devam etmek için adresinizi girin" },
  uk: { title:"Додайте адресу", desc:"Потрібно для локальної доставки та перевірки", street:"Вулиця", city:"Місто", state:"Область / Регіон", zip:"Поштовий індекс", country:"Країна", save:"Зберегти адресу", skip:"Пропустити зараз", saved:"Адресу збережено", enter:"Введіть адресу щоб продовжити" },
  el: { title:"Προσθήκη διεύθυνσης", desc:"Απαραίτητο για τοπική παράδοση και επαλήθευση", street:"Οδός", city:"Πόλη", state:"Πολιτεία / Περιοχή", zip:"Ταχυδρομικός κώδικας", country:"Χώρα", save:"Αποθήκευση διεύθυνσης", skip:"Παράλειψη τώρα", saved:"Η διεύθυνση αποθηκεύτηκε", enter:"Εισάγετε διεύθυνση για συνέχεια" },
  he: { title:"הוסף כתובת", desc:"נדרש למשלוח מקומי ואימות", street:"רחוב", city:"עיר", state:"מדינה / אזור", zip:"מיקוד", country:"מדינה", save:"שמור כתובת", skip:"דלג לעת עתה", saved:"הכתובת נשמרה", enter:"הכנס כתובת כדי להמשיך" },
  ur: { title:"اپنا پتہ شامل کریں", desc:"مقامی ترسیل اور تصدیق کے لیے ضروری", street:"گلی", city:"شہر", state:"ریاست / علاقہ", zip:"پوسٹل کوڈ", country:"ملک", save:"پتہ محفوظ کریں", skip:"ابھی چھوڑیں", saved:"پتہ محفوظ ہو گیا", enter:"جاری رکھنے کے لیے پتہ درج کریں" },
  fa: { title:"آدرس خود را اضافه کنید", desc:"برای تحویل محلی و تأیید لازم است", street:"خیابان", city:"شهر", state:"استان / منطقه", zip:"کد پستی", country:"کشور", save:"ذخیره آدرس", skip:"فعلاً رد کردن", saved:"آدرس ذخیره شد", enter:"لطفاً آدرس خود را برای ادامه وارد کنید" },
  ms: { title:"Tambah alamat", desc:"Diperlukan untuk penghantaran tempatan dan pengesahan", street:"Jalan", city:"Bandar", state:"Negeri / Wilayah", zip:"Poskod", country:"Negara", save:"Simpan alamat", skip:"Langkau sekarang", saved:"Alamat disimpan", enter:"Sila masukkan alamat untuk meneruskan" },
  ro: { title:"Adaugă adresa", desc:"Necesar pentru livrare locală și verificare", street:"Stradă", city:"Oraș", state:"Județ / Regiune", zip:"Cod poștal", country:"Țară", save:"Salvează adresa", skip:"Sari acum", saved:"Adresă salvată", enter:"Introduce adresa pentru a continua" },
  cs: { title:"Přidat adresu", desc:"Potřebné pro místní doručení a ověření", street:"Ulice", city:"Město", state:"Kraj / Region", zip:"PSČ", country:"Země", save:"Uložit adresu", skip:"Přeskočit", saved:"Adresa uložena", enter:"Zadejte adresu pro pokračování" },
  hu: { title:"Cím hozzáadása", desc:"Helyi kézbesítéshez és ellenőrzéshez szükséges", street:"Utca", city:"Város", state:"Állam / Régió", zip:"Irányítószám", country:"Ország", save:"Cím mentése", skip:"Kihagyás most", saved:"Cím elmentve", enter:"Add meg a címed a folytatáshoz" },
  fi: { title:"Lisää osoite", desc:"Tarvitaan paikalliseen toimitukseen ja vahvistukseen", street:"Katu", city:"Kaupunki", state:"Osavaltio / Alue", zip:"Postinumero", country:"Maa", save:"Tallenna osoite", skip:"Ohita nyt", saved:"Osoite tallennettu", enter:"Syötä osoite jatkaaksesi" },
  no: { title:"Legg til adresse", desc:"Trengs for lokal levering og verifisering", street:"Gate", city:"By", state:"Stat / Region", zip:"Postnummer", country:"Land", save:"Lagre adresse", skip:"Hopp over nå", saved:"Adresse lagret", enter:"Skriv inn adresse for å fortsette" },
  da: { title:"Tilføj adresse", desc:"Nødvendig til lokal levering og verifikation", street:"Gade", city:"By", state:"Stat / Region", zip:"Postnummer", country:"Land", save:"Gem adresse", skip:"Spring over nu", saved:"Adresse gemt", enter:"Indtast adresse for at fortsætte" },
  bg: { title:"Добави адрес", desc:"Необходимо за локална доставка и верификация", street:"Улица", city:"Град", state:"Област / Регион", zip:"Пощенски код", country:"Държава", save:"Запази адрес", skip:"Пропусни сега", saved:"Адресът запазен", enter:"Въведете адрес за да продължите" },
  hr: { title:"Dodaj adresu", desc:"Potrebno za lokalnu dostavu i verifikaciju", street:"Ulica", city:"Grad", state:"Županija / Regija", zip:"Poštanski broj", country:"Država", save:"Spremi adresu", skip:"Preskoči sada", saved:"Adresa spremljena", enter:"Unesite adresu za nastavak" },
  sr: { title:"Додај адресу", desc:"Потребно за локалну доставу и верификацију", street:"Улица", city:"Град", state:"Држава / Регион", zip:"Поштански број", country:"Држава", save:"Сачувај адресу", skip:"Прескочи сада", saved:"Адреса сачувана", enter:"Унесите адресу да наставите" },
  sk: { title:"Pridať adresu", desc:"Potrebné pre lokálne doručenie a overenie", street:"Ulica", city:"Mesto", state:"Štát / Región", zip:"PSČ", country:"Krajina", save:"Uložiť adresu", skip:"Preskočiť teraz", saved:"Adresa uložená", enter:"Zadajte adresu pre pokračovanie" },
  sl: { title:"Dodaj naslov", desc:"Potrebno za lokalno dostavo in preverjanje", street:"Ulica", city:"Mesto", state:"Država / Regija", zip:"Poštna številka", country:"Država", save:"Shrani naslov", skip:"Preskoči zdaj", saved:"Naslov shranjen", enter:"Vnesite naslov za nadaljevanje" },
  et: { title:"Lisa aadress", desc:"Vajalik kohalikuks kättetoimetamiseks ja kinnitamiseks", street:"Tänav", city:"Linn", state:"Osariik / Piirkond", zip:"Postiindeks", country:"Riik", save:"Salvesta aadress", skip:"Jäta praegu vahele", saved:"Aadress salvestatud", enter:"Sisesta aadress jätkamiseks" },
  lv: { title:"Pievienot adresi", desc:"Nepieciešams vietējai piegādei un verifikācijai", street:"Iela", city:"Pilsēta", state:"Štats / Reģions", zip:"Pasta indekss", country:"Valsts", save:"Saglabāt adresi", skip:"Izlaist pagaidām", saved:"Adrese saglabāta", enter:"Ievadiet adresi lai turpinātu" },
  lt: { title:"Pridėti adresą", desc:"Reikia vietiniam pristatymui ir patvirtinimui", street:"Gatvė", city:"Miestas", state:"Valstija / Regionas", zip:"Pašto kodas", country:"Šalis", save:"Išsaugoti adresą", skip:"Praleisti dabar", saved:"Adresas išsaugotas", enter:"Įveskite adresą kad tęstumėte" },
  be: { title:"Дадаць адрас", desc:"Патрэбна для мясцовай дастаўкі і верыфікацыі", street:"Вуліца", city:"Горад", state:"Вобласць / Рэгіён", zip:"Паштовы індэкс", country:"Краіна", save:"Захаваць адрас", skip:"Прапусціць зараз", saved:"Адрас захаваны", enter:"Увядзіце адрас каб працягнуць" },
  ka: { title:"მისამართის დამატება", desc:"საჭიროა ადგილობრივი მიწოდებისა და დადასტურებისთვის", street:"ქუჩა", city:"ქალაქი", state:"შტატი / რეგიონი", zip:"საფოსტო კოდი", country:"ქვეყანა", save:"მისამართის შენახვა", skip:"ახლა გამოტოვება", saved:"მისამართი შენახულია", enter:"გთხოვთ შეიყვანეთ მისამართი გასაგრძელებლად" },
  hy: { title:"Ավելացնել հասցե", desc:"Անհրաժեշտ է տեղական առաքման և հաստատման համար", street:"Փողոց", city:"Քաղաք", state:"Նահանգ / Տարածաշրջան", zip:"Փոստային ինդեքս", country:"Երկիր", save:"Պահպանել հասցեն", skip:"Բաց թողնել հիմա", saved:"Հասցեն պահպանված է", enter:"Մուտքագրեք հասցեն շարունակելու համար" },
  az: { title:"Ünvan əlavə et", desc:"Yerli çatdırılma və təsdiq üçün lazımdır", street:"Küçə", city:"Şəhər", state:"Ştat / Bölgə", zip:"Poçt indeksi", country:"Ölkə", save:"Ünvanı yadda saxla", skip:"Hələlik keç", saved:"Ünvan yadda saxlandı", enter:"Davam etmək üçün ünvan daxil edin" },
  kk: { title:"Мекенжай қосу", desc:"Жергілікті жеткізу және растау үшін қажет", street:"Көше", city:"Қала", state:"Штат / Аймақ", zip:"Пошта индексі", country:"Ел", save:"Мекенжайды сақтау", skip:"Қазір өткізіп жіберу", saved:"Мекенжай сақталды", enter:"Жалғастыру үшін мекенжай енгізіңіз" },
  ky: { title:"Дарек кошуу", desc:"Жергиликтүү жеткирүү жана тастыктоо үчүн керек", street:"Көчө", city:"Шаар", state:"Штат / Аймак", zip:"Почта индекси", country:"Өлкө", save:"Даректи сактоо", skip:"Азыр өткөрүп жиберүү", saved:"Дарек сакталды", enter:"Улантуу үчүн дарек киргизиңиз" },
  uz: { title:"Manzil qo'shish", desc:"Mahalliy yetkazib berish va tasdiqlash uchun kerak", street:"Ko'cha", city:"Shahar", state:"Shtat / Hudud", zip:"Pochta indeksi", country:"Mamlakat", save:"Manzilni saqlash", skip:"Hozir o'tkazib yuborish", saved:"Manzil saqlandi", enter:"Davom etish uchun manzil kiriting" },
  tg: { title:"Суроға илова кунед", desc:"Барои расонидани маҳаллӣ ва тасдиқ зарур аст", street:"Кӯча", city:"Шаҳр", state:"Иёлот / Минтақа", zip:"Индекси почта", country:"Кишвар", save:"Суроғаро захира кунед", skip:"Ҳоло гузаред", saved:"Суроға захира шуд", enter:"Барои идома суроға ворид кунед" },
  mn: { title:"Хаяг нэмэх", desc:"Орон нутгийн хүргэлт, баталгаажуулалтад хэрэгтэй", street:"Гудамж", city:"Хот", state:"Муж / Бүс", zip:"Шуудангийн код", country:"Улс", save:"Хаяг хадгалах", skip:"Одоо алгасах", saved:"Хаяг хадгалагдлаа", enter:"Үргэлжлүүлэхийн тулд хаягаа оруулна уу" },
  km: { title:"បន្ថែមអាសយដ្ឋាន", desc:"ត្រូវការសម្រាប់ការដឹកជញ្ជូនក្នុងស្រុក និងផ្ទៀងផ្ទាត់", street:"ផ្លូវ", city:"ទីក្រុង", state:"រដ្ឋ / តំបន់", zip:"លេខប្រៃសណីយ៍", country:"ប្រទេស", save:"រក្សាទុកអាសយដ្ឋាន", skip:"រំលងឥឡូវ", saved:"អាសយដ្ឋានបានរក្សាទុក", enter:"បញ្ចូលអាសយដ្ឋានដើម្បីបន្ត" },
  lo: { title:"ເພີ່ມທີ່ຢູ່", desc:"ຈຳເປັນສຳລັບການຈັດສົ່ງທ້ອງຖິ່ນແລະການຢືນຢັນ", street:"ຖະໜົນ", city:"ເມືອງ", state:"ລັດ / ພາກພື້ນ", zip:"ລະຫັດໄປສະນີ", country:"ປະເທດ", save:"ບັນທຶກທີ່ຢູ່", skip:"ຂ້າມດຽວນີ້", saved:"ບັນທຶກທີ່ຢູ່ແລ້ວ", enter:"ກະລຸນາໃສ່ທີ່ຢູ່ເພື່ອສືບຕໍ່" },
  my: { title:"လိပ်စာထည့်ပါ", desc:"ဒေသတွင်းပို့ဆောင်မှုနှင့်အတည်ပြုရန်လိုအပ်", street:"လမ်း", city:"မြို့", state:"ပြည်နယ် / ဒေသ", zip:"စာပို့သင်္ကေတ", country:"နိုင်ငံ", save:"လိပ်စာသိမ်းရန်", skip:"ယခုကျော်ရန်", saved:"လိပ်စာသိမ်းပြီးပါပြီ", enter:"ဆက်လက်ရန် လိပ်စာထည့်ပါ" },
}

export default function AddressGate() {
  const supabase = createClient()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [user, setUser] = useState<any>(null)
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [stateRegion, setStateRegion] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { supabase.auth.getUser().then(({ data }: any) => setUser(data?.user?? null)) }, [supabase])

  useEffect(() => {
    if (!user) { setLoaded(true); return }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await (supabase as any).rpc('get_my_private_profile')
        if (cancelled) return
        const p = (Array.isArray(data)? data[0] : data)?? {}
        setStreet(p.street?? '')
        setCity(p.city?? '')
        setStateRegion(p.state_code?? '')
        setPostalCode(p.postal_code?? '')
        setCountry(p.country?? '')
        if (!p.street ||!p.city ||!p.postal_code) setOpen(true)
        else setOpen(false)
        setLoaded(true)
      } catch { setLoaded(true) }
    })()
    return () => { cancelled = true }
  }, [user, supabase])

  const save = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await (supabase as any).from('private_profiles').upsert({
        user_id: user.id,
        street, city, state_code: stateRegion, postal_code: postalCode, country,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      if (error) throw error
      setMsg(d.saved)
      setTimeout(()=> setOpen(false), 800)
    } catch (e: any) { setMsg(e.message) }
    finally { setSaving(false) }
  }

  if (!loaded) return null
  if (!user) return null
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border p-5 shadow-xl">
        <h2 className="font-bold text-lg">{d.title}</h2>
        <p className="text-xs text-muted-foreground mt-1">{d.enter}</p>
        <p className="text-xs text-muted-foreground mt-1">{d.desc}</p>
        <div className="mt-4 space-y-3">
          <input value={street} onChange={e=>setStreet(e.target.value)} placeholder={d.street} className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-background" />
          <div className="grid grid-cols-2 gap-2">
            <input value={city} onChange={e=>setCity(e.target.value)} placeholder={d.city} className="rounded-xl border border-border px-3 py-2 text-sm bg-background" />
            <input value={stateRegion} onChange={e=>setStateRegion(e.target.value)} placeholder={d.state} className="rounded-xl border border-border px-3 py-2 text-sm bg-background" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={postalCode} onChange={e=>setPostalCode(e.target.value)} placeholder={d.zip} className="rounded-xl border border-border px-3 py-2 text-sm bg-background" />
            <input value={country} onChange={e=>setCountry(e.target.value)} placeholder={d.country} className="rounded-xl border border-border px-3 py-2 text-sm bg-background" />
          </div>
        </div>
        {msg && <p className="mt-3 text-xs">{msg}</p>}
        <div className="mt-5 flex gap-2">
          <button onClick={()=>setOpen(false)} className="flex-1 rounded-full border border-border py-2 text-sm">{d.skip}</button>
          <button onClick={save} disabled={saving} className="flex-1 rounded-full bg-black text-white dark:bg-white dark:text-black py-2 text-sm font-bold disabled:opacity-50">{d.save}</button>
        </div>
      </div>
    </div>
  )
}
