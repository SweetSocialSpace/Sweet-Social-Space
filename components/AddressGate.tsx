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
}

function getDict(lang: string){ return D[lang.split('-')[0]] || D[lang] || D.en }

export default function AddressGate() {
  const supabase = createClient()
  const { language } = useLanguage()
  const d = getDict(language)
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => setUser(data?.user?? null))
  }, [supabase])

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
        // Open if missing required fields
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
        <p className="text- text-muted-foreground mt-1">{d.desc}</p>
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
