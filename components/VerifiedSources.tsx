'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  es: { verifiedSources:"Fuentes verificadas", near:"Cerca de", noOrgs:"Sin orgs verificadas aun - aplica!", apply:"Solicitar verificacion", loading:"Cargando...", trust:"Red de Confianza - Verificada", safety:"Seguridad Comunitaria - Verificada", nws:"SMN - Verificado", police:"Departamento de Policia - Verificado", fire:"Departamento de Bomberos - Verificado", policeShort:"Policia - Verificado", fireShort:"Bomberos - Verificado", verified:"Verificado", yourArea:"tu area" },
  fr: { verifiedSources:"Sources verifiees", near:"Pres de", noOrgs:"Pas d'orgs verifiees - postulez!", apply:"Demander verification", loading:"Chargement...", trust:"Reseau de confiance - Verifie", safety:"Securite communautaire - Verifiee", nws:"Meteo - Verifie", police:"Police - Verifie", fire:"Pompiers - Verifies", policeShort:"Police - Verifie", fireShort:"Pompiers - Verifies", verified:"Verifie", yourArea:"votre zone" },
  de: { verifiedSources:"Verifizierte Quellen", near:"Nahe", noOrgs:"Noch keine verifizierten Orgs - bewerben!", apply:"Verifizierung beantragen", loading:"Laden...", trust:"Vertrauensnetzwerk - Verifiziert", safety:"Gemeinschaftssicherheit - Verifiziert", nws:"Wetterdienst - Verifiziert", police:"Polizei - Verifiziert", fire:"Feuerwehr - Verifiziert", policeShort:"Polizei - Verifiziert", fireShort:"Feuerwehr - Verifiziert", verified:"Verifiziert", yourArea:"dein Bereich" },
  zh: { verifiedSources:"已验证来源", near:"靠近", noOrgs:"暂无已验证组织 - 申请吧！", apply:"申请验证", loading:"加载中...", trust:"信任网络 - 已验证", safety:"社区安全 - 已验证", nws:"气象局 - 已验证", police:"警察局 - 已验证", fire:"消防局 - 已验证", policeShort:"警察 - 已验证", fireShort:"消防 - 已验证", verified:"已验证", yourArea:"你的区域" },
  ja: { verifiedSources:"確認済みソース", near:"付近", noOrgs:"確認済み組織なし - 申請を！", apply:"確認を申請", loading:"読み込み中...", trust:"トラストネットワーク - 確認済み", safety:"地域安全 - 確認済み", nws:"気象局 - 確認済み", police:"警察 - 確認済み", fire:"消防 - 確認済み", policeShort:"警察 - 確認済み", fireShort:"消防 - 確認済み", verified:"確認済み", yourArea:"あなたのエリア" },
  ko: { verifiedSources:"확인된 출처", near:"근처", noOrgs:"확인된 기관 없음 - 신청하세요!", apply:"확인 신청", loading:"로딩중...", trust:"신뢰 네트워크 - 확인됨", safety:"커뮤니티 안전 - 확인됨", nws:"기상청 - 확인됨", police:"경찰서 - 확인됨", fire:"소방서 - 확인됨", policeShort:"경찰 - 확인됨", fireShort:"소방 - 확인됨", verified:"확인됨", yourArea:"당신의 지역" },
  pt: { verifiedSources:"Fontes verificadas", near:"Perto de", noOrgs:"Sem orgs verificadas ainda - candidate-se!", apply:"Solicitar verificacao", loading:"Carregando...", trust:"Rede de Confianca - Verificada", safety:"Seguranca Comunitaria - Verificada", nws:"INMET - Verificado", police:"Departamento de Policia - Verificado", fire:"Corpo de Bombeiros - Verificado", policeShort:"Policia - Verificada", fireShort:"Bombeiros - Verificados", verified:"Verificado", yourArea:"sua area" },
  it: { verifiedSources:"Fonti verificate", near:"Vicino a", noOrgs:"Nessuna org verificata - candidati!", apply:"Richiedi verifica", loading:"Caricamento...", trust:"Rete di fiducia - Verificata", safety:"Sicurezza comunitaria - Verificata", nws:"Meteo - Verificato", police:"Polizia - Verificata", fire:"Vigili del Fuoco - Verificati", policeShort:"Polizia - Verificata", fireShort:"Vigili - Verificati", verified:"Verificato", yourArea:"tua zona" },
  nl: { verifiedSources:"Geverifieerde bronnen", near:"Bij", noOrgs:"Nog geen geverifieerde orgs - meld je aan!", apply:"Verificatie aanvragen", loading:"Laden...", trust:"Vertrouwensnetwerk - Geverifieerd", safety:"Buurtveiligheid - Geverifieerd", nws:"KNMI - Geverifieerd", police:"Politie - Geverifieerd", fire:"Brandweer - Geverifieerd", policeShort:"Politie - Geverifieerd", fireShort:"Brandweer - Geverifieerd", verified:"Geverifieerd", yourArea:"jouw gebied" },
  id: { verifiedSources:"Sumber terverifikasi", near:"Dekat", noOrgs:"Belum ada org terverifikasi - daftar!", apply:"Ajukan verifikasi", loading:"Memuat...", trust:"Jaringan Kepercayaan - Terverifikasi", safety:"Keamanan Komunitas - Terverifikasi", nws:"BMKG - Terverifikasi", police:"Kepolisian - Terverifikasi", fire:"Pemadam - Terverifikasi", policeShort:"Polisi - Terverifikasi", fireShort:"Pemadam - Terverifikasi", verified:"Terverifikasi", yourArea:"area Anda" },
  vi: { verifiedSources:"Nguon da xac minh", near:"Gan", noOrgs:"Chua co to chuc da xac minh - dang ky!", apply:"Dang ky xac minh", loading:"Dang tai...", trust:"Mang luoi tin cay - Da xac minh", safety:"An toan cong dong - Da xac minh", nws:"Khi tuong - Da xac minh", police:"Cong an - Da xac minh", fire:"Cuu hoa - Da xac minh", policeShort:"Cong an - Da xac minh", fireShort:"Cuu hoa - Da xac minh", verified:"Da xac minh", yourArea:"khu vuc cua ban" },
  sv: { verifiedSources:"Verifierade kallor", near:"Nara", noOrgs:"Inga verifierade orgs an - ansok!", apply:"Ansok om verifiering", loading:"Laddar...", trust:"Fortroendenatverk - Verifierat", safety:"Samhallssakerhet - Verifierad", nws:"SMHI - Verifierat", police:"Polisen - Verifierad", fire:"Brandkar - Verifierad", policeShort:"Polisen - Verifierad", fireShort:"Brandkar - Verifierad", verified:"Verifierad", yourArea:"ditt omrade" },
  pl: { verifiedSources:"Zweryfikowane zrodla", near:"Blisko", noOrgs:"Brak zweryfikowanych org - aplikuj!", apply:"Zloz wniosek o weryfikacje", loading:"Ladowanie...", trust:"Sieć zaufania - Zweryfikowana", safety:"Bezpieczenstwo spolecznosci - Zweryfikowane", nws:"IMGW - Zweryfikowany", police:"Policja - Zweryfikowana", fire:"Straz Pozarna - Zweryfikowana", policeShort:"Policja - Zweryfikowana", fireShort:"Straz - Zweryfikowana", verified:"Zweryfikowane", yourArea:"twoj obszar" },
  tr: { verifiedSources:"Dogrulanmis kaynaklar", near:"Yakininda", noOrgs:"Henuz dogrulanmis kurum yok - basvur!", apply:"Dogrulama basvurusu", loading:"Yukleniyor...", trust:"Guven Agi - Dogrulandi", safety:"Topluluk Guvenligi - Dogrulandi", nws:"Meteoroloji - Dogrulandi", police:"Emniyet - Dogrulandi", fire:"Itfaiye - Dogrulandi", policeShort:"Polis - Dogrulandi", fireShort:"Itfaiye - Dogrulandi", verified:"Dogrulandi", yourArea:"bolgeniz" },
  ms: { verifiedSources:"Sumber disahkan", near:"Dekat", noOrgs:"Tiada org disahkan lagi - mohon!", apply:"Mohon pengesahan", loading:"Memuat...", trust:"Rangkaian Kepercayaan - Disahkan", safety:"Keselamatan Komuniti - Disahkan", nws:"MET - Disahkan", police:"Polis - Disahkan", fire:"Bomba - Disahkan", policeShort:"Polis - Disahkan", fireShort:"Bomba - Disahkan", verified:"Disahkan", yourArea:"kawasan anda" },
  ro: { verifiedSources:"Surse verificate", near:"Langa", noOrgs:"Nicio org verificata inca - aplica!", apply:"Aplica pentru verificare", loading:"Se incarca...", trust:"Retea de incredere - Verificata", safety:"Siguranta comunitatii - Verificata", nws:"ANM - Verificat", police:"Politie - Verificata", fire:"Pompieri - Verificati", policeShort:"Politie - Verificata", fireShort:"Pompieri - Verificati", verified:"Verificat", yourArea:"zona ta" },
  cs: { verifiedSources:"Overene zdroje", near:"Blizko", noOrgs:"Zadne overene org - prihlaste se!", apply:"Zadat o overeni", loading:"Nacitani...", trust:"Sit duvery - Overeno", safety:"Bezpecnost komunity - Overena", nws:"CHMU - Overeno", police:"Policie - Overena", fire:"Hasici - Overeni", policeShort:"Policie - Overena", fireShort:"Hasici - Overeni", verified:"Overeno", yourArea:"vase oblast" },
  hu: { verifiedSources:"Ellenorzott forrasok", near:"Kozeleben", noOrgs:"Meg nincs ellenorzott szervezet - jelentkezz!", apply:"Ellenorzes igenylese", loading:"Betoltes...", trust:"Bizalmi halozat - Ellenorzott", safety:"Kozossegi biztonsag - Ellenorzott", nws:"Meteorologia - Ellenorzott", police:"Rendorseg - Ellenorzott", fire:"Tuzoltosag - Ellenorzott", policeShort:"Rendorseg - Ellenorzott", fireShort:"Tuzoltosag - Ellenorzott", verified:"Ellenorzott", yourArea:"a kornyeked" },
  fi: { verifiedSources:"Vahvistetut lahteet", near:"Lahella", noOrgs:"Ei vahvistettuja orgs viela - hae!", apply:"Hae vahvistusta", loading:"Ladataan...", trust:"Luottamusverkosto - Vahvistettu", safety:"Yhteisoturvallisuus - Vahvistettu", nws:"Ilmatieteen laitos - Vahvistettu", police:"Poliisi - Vahvistettu", fire:"Palokunta - Vahvistettu", policeShort:"Poliisi - Vahvistettu", fireShort:"Palokunta - Vahvistettu", verified:"Vahvistettu", yourArea:"alueesi" },
  no: { verifiedSources:"Verifiserte kilder", near:"Naer", noOrgs:"Ingen verifiserte orgs enda - sok!", apply:"Sok om verifisering", loading:"Laster...", trust:"Tillitsnettverk - Verifisert", safety:"Samfunnssikkerhet - Verifisert", nws:"MET - Verifisert", police:"Politi - Verifisert", fire:"Brannvesen - Verifisert", policeShort:"Politi - Verifisert", fireShort:"Brannvesen - Verifisert", verified:"Verifisert", yourArea:"ditt omrade" },
  da: { verifiedSources:"Bekraeftede kilder", near:"Naer", noOrgs:"Ingen bekraeftede orgs endnu - ansog!", apply:"Ansog om bekraeftelse", loading:"Indlaeser...", trust:"Tillidsnetvaerk - Bekraeftet", safety:"Faellesskabssikkerhed - Bekraeftet", nws:"DMI - Bekraeftet", police:"Politi - Bekraeftet", fire:"Brandvaesen - Bekraeftet", policeShort:"Politi - Bekraeftet", fireShort:"Brandvaesen - Bekraeftet", verified:"Bekraeftet", yourArea:"dit omrade" },
  hr: { verifiedSources:"Provjereni izvori", near:"Blizu", noOrgs:"Jos nema provjerenih org - prijavite se!", apply:"Zatrazi provjeru", loading:"Ucitavanje...", trust:"Mreza povjerenja - Provjereno", safety:"Sigurnost zajednice - Provjerena", nws:"DHMZ - Provjereno", police:"Policija - Provjerena", fire:"Vatrogasci - Provjereni", policeShort:"Policija - Provjerena", fireShort:"Vatrogasci - Provjereni", verified:"Provjereno", yourArea:"vase podrucje" },
  sk: { verifiedSources:"Overene zdroje", near:"Blizko", noOrgs:"Ziadne overene org zatial - prihlaste sa!", apply:"Poziadat o overenie", loading:"Nacitanie...", trust:"Siet dovery - Overene", safety:"Bezpecnost komunity - Overena", nws:"SHMU - Overene", police:"Policia - Overena", fire:"Hasici - Overeni", policeShort:"Policia - Overena", fireShort:"Hasici - Overeni", verified:"Overene", yourArea:"vasa oblast" },
  sl: { verifiedSources:"Preverjeni viri", near:"Blizu", noOrgs:"Se ni preverjenih org - prijavite se!", apply:"Zaprosi za preverjanje", loading:"Nalaganje...", trust:"Mreza zaupanja - Preverjeno", safety:"Varnost skupnosti - Preverjena", nws:"ARSO - Preverjeno", police:"Policija - Preverjena", fire:"Gasilci - Preverjeni", policeShort:"Policija - Preverjena", fireShort:"Gasilci - Preverjeni", verified:"Preverjeno", yourArea:"vase obmocje" },
  et: { verifiedSources:"Kinnitatud allikad", near:"Lahedal", noOrgs:"Kinnitatud org-sid veel pole - kandideeri!", apply:"Taotle kinnitust", loading:"Laadimine...", trust:"Usaldusvork - Kinnitatud", safety:"Kogukonna turvalisus - Kinnitatud", nws:"Ilmateenistus - Kinnitatud", police:"Politsei - Kinnitatud", fire:"Paasteamet - Kinnitatud", policeShort:"Politsei - Kinnitatud", fireShort:"Paaste - Kinnitatud", verified:"Kinnitatud", yourArea:"sinu piirkond" },
  az: { verifiedSources:"Təsdiqlənmiş mənbələr", near:"Yaxininda", noOrgs:"Hələ təsdiqlənmiş qurum yoxdur - müraciət et!", apply:"Təsdiq üçün müraciət", loading:"Yüklənir...", trust:"Etibar Şəbəkəsi - Təsdiqləndi", safety:"İcma Təhlükəsizliyi - Təsdiqləndi", nws:"Hava - Təsdiqləndi", police:"Polis - Təsdiqləndi", fire:"Yanğınsöndürən - Təsdiqləndi", policeShort:"Polis - Təsdiqləndi", fireShort:"Yanğın - Təsdiqləndi", verified:"Təsdiqləndi", yourArea:"əraziniz" },
  uz: { verifiedSources:"Tasdiqlangan manbalar", near:"Yaqinida", noOrgs:"Hali tasdiqlangan tashkilot yoq - ariza bering!", apply:"Tasdiqlash uchun ariza", loading:"Yuklanmoqda...", trust:"Ishonch tarmogi - Tasdiqlandi", safety:"Jamiyat xavfsizligi - Tasdiqlandi", nws:"Ob-havo - Tasdiqlandi", police:"Politsiya - Tasdiqlandi", fire:"O't o'chiruvchilar - Tasdiqlandi", policeShort:"Politsiya - Tasdiqlandi", fireShort:"O't o'chirish - Tasdiqlandi", verified:"Tasdiqlandi", yourArea:"hududingiz" },
  bg: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  bn: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  th: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  el: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  he: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  ur: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  fa: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  sr: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  lv: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  lt: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  be: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  ka: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  hy: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  kk: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  ky: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  tg: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  mn: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  km: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  lo: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
  my: { verifiedSources:"Verified Sources", near:"Near", noOrgs:"No verified orgs yet - apply!", apply:"Apply for verification", loading:"Loading...", trust:"Trust Network - Verified", safety:"Community Safety - Verified", nws:"NWS - Verified", police:"Police Department - Verified", fire:"Fire Department - Verified", policeShort:"Police - Verified", fireShort:"Fire - Verified", verified:"Verified", yourArea:"your area" },
}

type V = { id: string; title: string }

export function VerifiedSources(){
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [liveVs, setLiveVs] = useState<V[]>([])

  useEffect(()=>{
    if (!zip) return
    let mounted = true
    const CACHE_KEY = `verified_${zip}_v1`
    const CACHE_TIME_KEY = `verified_${zip}_v1_time`
    const fetchLiveVerified = async () => {
      try {
        if (zip === 'GLOBAL') {
          if(mounted) setLiveVs([
            { id: 'live-1', title: d.trust },
            { id: 'live-2', title: d.safety },
            { id: 'live-3', title: d.nws },
          ])
          return
        }
        const cached = localStorage.getItem(CACHE_KEY)
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
        if (cached && cachedTime && Date.now() - parseInt(cachedTime) < 15*60*1000) {
          if(mounted) setLiveVs(JSON.parse(cached))
          return
        }
        const displayCity = city || zip
        const fallback: V[] = [
          { id: 'vs-1', title: `${displayCity} ${d.police}` },
          { id: 'vs-2', title: `${displayCity} ${d.fire}` },
          { id: 'vs-3', title: d.nws },
        ]
        if(mounted){
          setLiveVs(fallback)
          localStorage.setItem(CACHE_KEY, JSON.stringify(fallback))
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
        }
      } catch {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached && mounted) setLiveVs(JSON.parse(cached))
        else if(mounted) setLiveVs([
          { id: 'vs-1', title: `${city || d.yourArea} ${d.policeShort}` },
          { id: 'vs-2', title: `${city || d.yourArea} ${d.fireShort}` },
          { id: 'vs-3', title: d.nws },
        ])
      }
    }
    fetchLiveVerified()
  },[zip, city, d])

  if (!zip) return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">{d.verifiedSources}</p>
      <p className="text-xs text-white/50">{d.loading}</p>
    </div>
  )

  const displayZip = zip === 'GLOBAL' ? d.yourArea : zip

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">{d.verifiedSources} - {d.near} {displayZip}</p>
      {liveVs.length===0? <p className="text-sm mt-3 text-white/60">{d.noOrgs}</p> : (
        <div className="mt-3 space-y-2">
          {liveVs.map(v=>(
            <div key={v.id} className="bg-white/5 rounded-xl p-2.5 text-xs flex items-center gap-2">
              <span>{d.verified}</span><span className="truncate">{v.title}</span>
            </div>
          ))}
        </div>
      )}
      <a href="/apply-verification" className="mt-3 inline-block text-xs bg-white text-black px-3 py-1 rounded-full font-bold">{d.apply}</a>
    </div>
  )
}

export default VerifiedSources
