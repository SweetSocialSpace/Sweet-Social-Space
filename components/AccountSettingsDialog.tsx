'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { title:"Privacy & data", desc:"Under GDPR and CCPA you can export your data or delete your account at any time.", export:"Export all my data (JSON)", delTitle:"Delete my account", delDesc:"We’ll erase your account, posts, likes, and profile within 30 days. Some records (billing, abuse reports) may be kept longer if required by law. Type DELETE to confirm.", placeholder:"Type DELETE", request:"Request deletion", cookie:"Cookie settings", close:"Close", downloaded:"Your data has been downloaded as JSON.", deletionReceived:"Deletion request received. Your account and data will be erased within 30 days. You can keep using the app until then or sign out now.", exportFailed:"Export failed", requestFailed:"Request failed" },
  es: { title:"Privacidad y datos", desc:"Bajo GDPR y CCPA puedes exportar tus datos o eliminar tu cuenta en cualquier momento.", export:"Exportar todos mis datos (JSON)", delTitle:"Eliminar mi cuenta", delDesc:"Borraremos tu cuenta, posts, likes y perfil en 30 días. Algunos registros pueden conservarse más si la ley lo requiere. Escribe DELETE para confirmar.", placeholder:"Escribe DELETE", request:"Solicitar eliminación", cookie:"Ajustes de cookies", close:"Cerrar", downloaded:"Tus datos se han descargado como JSON.", deletionReceived:"Solicitud recibida. Tu cuenta y datos se borrarán en 30 días.", exportFailed:"Exportación falló", requestFailed:"Solicitud falló" },
  fr: { title:"Confidentialité & données", desc:"Sous GDPR et CCPA vous pouvez exporter vos données ou supprimer votre compte à tout moment.", export:"Exporter toutes mes données (JSON)", delTitle:"Supprimer mon compte", delDesc:"Nous effacerons votre compte, posts, likes et profil sous 30 jours. Certains dossiers peuvent être conservés plus longtemps si requis par la loi. Tapez DELETE pour confirmer.", placeholder:"Tapez DELETE", request:"Demander suppression", cookie:"Paramètres cookies", close:"Fermer", downloaded:"Vos données ont été téléchargées en JSON.", deletionReceived:"Demande reçue. Votre compte sera effacé sous 30 jours.", exportFailed:"Export échoué", requestFailed:"Demande échouée" },
  de: { title:"Datenschutz & Daten", desc:"Unter DSGVO und CCPA kannst du jederzeit deine Daten exportieren oder Konto löschen.", export:"Alle meine Daten exportieren (JSON)", delTitle:"Mein Konto löschen", delDesc:"Wir löschen dein Konto, Posts, Likes und Profil innerhalb von 30 Tagen. Einige Aufzeichnungen können länger aufbewahrt werden wenn gesetzlich erforderlich. Tippe DELETE zur Bestätigung.", placeholder:"Tippe DELETE", request:"Löschung anfordern", cookie:"Cookie-Einstellungen", close:"Schließen", downloaded:"Deine Daten wurden als JSON heruntergeladen.", deletionReceived:"Löschanfrage erhalten. Dein Konto wird innerhalb von 30 Tagen gelöscht.", exportFailed:"Export fehlgeschlagen", requestFailed:"Anfrage fehlgeschlagen" },
  zh: { title:"隐私与数据", desc:"根据GDPR和CCPA，你可以随时导出数据或删除账户。", export:"导出我的所有数据 (JSON)", delTitle:"删除我的账户", delDesc:"我们将在30天内删除你的账户、帖子、点赞和资料。某些记录可能因法律要求保留更久。输入DELETE确认。", placeholder:"输入 DELETE", request:"请求删除", cookie:"Cookie设置", close:"关闭", downloaded:"你的数据已作为JSON下载。", deletionReceived:"已收到删除请求。你的账户和数据将在30天内被删除。", exportFailed:"导出失败", requestFailed:"请求失败" },
  ja: { title:"プライバシーとデータ", desc:"GDPRおよびCCPAの下でいつでもデータをエクスポートまたはアカウントを削除できます。", export:"すべてのデータをエクスポート (JSON)", delTitle:"アカウントを削除", delDesc:"アカウント、投稿、いいね、プロフィールを30日以内に削除します。一部の記録は法律で必要な場合より長く保持される場合があります。DELETEと入力して確認。", placeholder:"DELETEと入力", request:"削除をリクエスト", cookie:"Cookie設定", close:"閉じる", downloaded:"データがJSONとしてダウンロードされました。", deletionReceived:"削除リクエストを受領しました。アカウントとデータは30日以内に削除されます。", exportFailed:"エクスポート失敗", requestFailed:"リクエスト失敗" },
  ko: { title:"개인정보 및 데이터", desc:"GDPR 및 CCPA에 따라 언제든지 데이터를 내보내거나 계정을 삭제할 수 있습니다.", export:"내 모든 데이터 내보내기 (JSON)", delTitle:"계정 삭제", delDesc:"30일 이내에 계정, 게시물, 좋아요 및 프로필을 삭제합니다. 일부 기록은 법률에 따라 더 오래 보관될 수 있습니다. 확인하려면 DELETE를 입력하세요.", placeholder:"DELETE 입력", request:"삭제 요청", cookie:"쿠키 설정", close:"닫기", downloaded:"데이터가 JSON으로 다운로드되었습니다.", deletionReceived:"삭제 요청이 접수되었습니다. 계정과 데이터는 30일 이내에 삭제됩니다.", exportFailed:"내보내기 실패", requestFailed:"요청 실패" },
  pt: { title:"Privacidade e dados", desc:"Sob GDPR e CCPA você pode exportar seus dados ou excluir sua conta a qualquer momento.", export:"Exportar todos meus dados (JSON)", delTitle:"Excluir minha conta", delDesc:"Apagaremos sua conta, posts, curtidas e perfil em 30 dias. Alguns registros podem ser mantidos por mais tempo se exigido por lei. Digite DELETE para confirmar.", placeholder:"Digite DELETE", request:"Solicitar exclusão", cookie:"Configurações de cookies", close:"Fechar", downloaded:"Seus dados foram baixados como JSON.", deletionReceived:"Pedido recebido. Sua conta e dados serão apagados em 30 dias.", exportFailed:"Exportação falhou", requestFailed:"Pedido falhou" },
  ru: { title:"Конфиденциальность и данные", desc:"По GDPR и CCPA вы можете в любое время экспортировать данные или удалить аккаунт.", export:"Экспортировать все мои данные (JSON)", delTitle:"Удалить мой аккаунт", delDesc:"Мы удалим ваш аккаунт, посты, лайки и профиль в течение 30 дней. Некоторые записи могут храниться дольше если требуется законом. Введите DELETE для подтверждения.", placeholder:"Введите DELETE", request:"Запросить удаление", cookie:"Настройки cookies", close:"Закрыть", downloaded:"Ваши данные загружены как JSON.", deletionReceived:"Запрос на удаление получен. Ваш аккаунт будет удален в течение 30 дней.", exportFailed:"Экспорт не удался", requestFailed:"Запрос не удался" },
  ar: { title:"الخصوصية والبيانات", desc:"بموجب GDPR و CCPA يمكنك تصدير بياناتك أو حذف حسابك في أي وقت.", export:"تصدير جميع بياناتي (JSON)", delTitle:"حذف حسابي", delDesc:"سنحذف حسابك ومنشوراتك وإعجاباتك وملفك خلال 30 يوما. قد نحتفظ ببعض السجلات لفترة أطول إذا تطلب القانون. اكتب DELETE للتأكيد.", placeholder:"اكتب DELETE", request:"طلب الحذف", cookie:"إعدادات الكوكيز", close:"إغلاق", downloaded:"تم تنزيل بياناتك كـ JSON.", deletionReceived:"تم استلام طلب الحذف. سيتم محو حسابك وبياناتك خلال 30 يوما.", exportFailed:"فشل التصدير", requestFailed:"فشل الطلب" },
  hi: { title:"गोपनीयता और डेटा", desc:"GDPR और CCPA के तहत आप कभी भी अपना डेटा निर्यात कर सकते हैं या खाता हटा सकते हैं।", export:"मेरा सारा डेटा निर्यात करें (JSON)", delTitle:"मेरा खाता हटाएं", delDesc:"हम 30 दिनों के भीतर आपका खाता, पोस्ट, लाइक और प्रोफ़ाइल मिटा देंगे। कुछ रिकॉर्ड कानून द्वारा आवश्यक होने पर अधिक समय तक रखे जा सकते हैं। पुष्टि के लिए DELETE टाइप करें।", placeholder:"DELETE टाइप करें", request:"हटाने का अनुरोध", cookie:"कुकी सेटिंग्स", close:"बंद करें", downloaded:"आपका डेटा JSON के रूप में डाउनलोड हो गया है।", deletionReceived:"हटाने का अनुरोध प्राप्त हुआ। आपका खाता 30 दिनों में मिटा दिया जाएगा।", exportFailed:"निर्यात विफल", requestFailed:"अनुरोध विफल" },
}

function getDict(lang: string){
  const base = lang.split('-')[0]
  return D[base] || D[lang] || D.en
}

export function AccountSettingsDialog({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage()
  const d = getDict(language)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState('')
  const supabase = createClient() as any

  const exportData = async () => {
    setBusy(true); setMsg('')
    try {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return
      const [ { data: profile }, { data: privateProfile }, { data: posts }, { data: likes }, { data: reports }, { data: subs }, { data: boosts } ] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', u.user.id).maybeSingle(),
        (supabase as any).rpc('get_my_private_profile'),
        supabase.from('posts').select('*').eq('user_id', u.user.id),
        supabase.from('post_likes').select('*').eq('user_id', u.user.id),
        supabase.from('post_reports').select('*').eq('reporter_id', u.user.id),
        supabase.from('subscriptions').select('*').eq('user_id', u.user.id),
        supabase.from('post_boosts').select('*').eq('user_id', u.user.id),
      ])
      const privateRow = Array.isArray(privateProfile)? privateProfile[0] : privateProfile
      const fullProfile = {...(profile?? {}),...(privateRow?? {}) }
      const payload = { exported_at: new Date().toISOString(), account: { id: u.user.id, email: u.user.email, created_at: u.user.created_at }, profile: fullProfile, posts, likes, reports, subscriptions: subs, post_boosts: boosts }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `sweet-social-data-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url)
      setMsg(d.downloaded)
    } catch (e: any) { setMsg(e.message || d.exportFailed) } finally { setBusy(false) }
  }

  const requestDeletion = async () => {
    if (confirmDelete!== 'DELETE') return
    setBusy(true); setMsg('')
    try {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return
      const { error } = await supabase.from('account_deletion_requests').insert({ user_id: u.user.id, reason: 'user requested via settings' })
      if (error && (error as any).code!== '23505') { setMsg(error.message); return }
      setMsg(d.deletionReceived)
    } catch (e: any) { setMsg(e.message || d.requestFailed) } finally { setBusy(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-lg font-semibold">{d.title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{d.desc}</p>
        <div className="mt-4 space-y-2"><button onClick={()=>{ try { exportData() } catch {} }} disabled={busy} className="w-full rounded-xl border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50">{d.export}</button></div>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/30"><p className="text-sm font-medium text-red-900 dark:text-red-200">{d.delTitle}</p><p className="mt-1 text-xs text-red-800/80 dark:text-red-200/80">{d.delDesc}</p><input value={confirmDelete} onChange={(e) => { try { setConfirmDelete(e.target.value) } catch {} }} placeholder={d.placeholder} className="mt-2 w-full rounded-lg border border-red-300 bg-background px-3 py-2 text-sm" /><button onClick={()=>{ try { requestDeletion() } catch {} }} disabled={busy || confirmDelete!== 'DELETE'} className="mt-2 w-full rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{d.request}</button></div>
        {msg && <p className="mt-3 text-sm text-foreground">{msg}</p>}
        <div className="mt-5 flex items-center justify-between"><button onClick={() => { try { window.dispatchEvent(new Event('open-cookie-settings')) } catch {} }} className="text-xs text-muted-foreground underline">{d.cookie}</button><button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">{d.close}</button></div>
      </div>
    </div>
  )
}
