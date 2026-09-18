'use client'
import { useState, useEffect } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useTranslations } from '@/lib/translations'

export default function TrustPage() {
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const isEs = language?.toLowerCase().startsWith('es')
  const t = useTranslations() as any
  const [trustData, setTrustData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!zip) return
    const loadTrust = async () => {
      try {
        const res = await fetch(`/api/trust?zip=${encodeURIComponent(zip)}`)
        const data = await res.json()
        setTrustData(data)
      } catch (e) {
        console.log('Trust data error:', e)
      } finally {
        setLoading(false)
      }
    }
    loadTrust()
  }, [zip])

  const displayArea = city || zip || (t?.common?.yourArea || (isEs? 'tu área' : 'your area'))

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">{t?.trust?.title || (isEs? 'Medidor de Confianza' : 'Trust Meter')}</h1>
        <p className="text-white/60">{t?.trust?.subtitle || (isEs? `Estadísticas de confianza comunitaria para ${displayArea}` : `Community trust statistics for ${displayArea}`)}</p>
      </div>

      {loading ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-white/60">{t?.common?.loading || (isEs? 'Cargando datos de confianza...' : 'Loading trust data...')}</p>
        </div>
      ) : trustData ? (
        <div className="space-y-6">
          {/* Trust Score */}
          <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black">{t?.trust?.communityScore || (isEs? 'Puntaje de Confianza Comunitaria' : 'Community Trust Score')}</h2>
              <div className="text-4xl font-black text-green-400">{trustData.percent}%</div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all"
                style={{ width: `${trustData.percent}%` }}
              />
            </div>
            <p className="text-white/60 text-sm mt-2">
              {trustData.verified} {t?.trust?.of || (isEs? 'de' : 'of')} {trustData.total} {t?.trust?.usersIn || (isEs? 'usuarios en' : 'users in')} {displayArea} {t?.trust?.areVerified || (isEs? 'están verificados' : 'are verified')}
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-black text-blue-400">{trustData.total}</div>
              <p className="text-white/60 text-sm mt-1">{t?.trust?.totalUsers || (isEs? 'Usuarios Totales' : 'Total Users')}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-black text-green-400">{trustData.verified}</div>
              <p className="text-white/60 text-sm mt-1">{t?.trust?.verifiedUsers || (isEs? 'Usuarios Verificados' : 'Verified Users')}</p>
            </div>
          </div>

          {/* What This Means */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-black mb-4">{t?.trust?.whatThisMeans || (isEs? 'Qué Significa Esto' : 'What This Means')}</h2>
            <div className="space-y-3 text-white/70 text-sm">
              <p><strong>✅ {t?.trust?.verifiedUsersLabel || (isEs? 'Usuarios Verificados:' : 'Verified Users:')}</strong> {t?.trust?.verifiedDesc || (isEs? 'Usuarios que han completado la verificación de identidad' : 'Users who have completed identity verification through our system')}</p>
              <p><strong>🔒 {t?.trust?.securePlatform || (isEs? 'Plataforma Segura:' : 'Secure Platform:')}</strong> {t?.trust?.secureDesc || (isEs? 'Encriptación SSL, no vendemos datos, diseño con privacidad primero' : 'SSL encryption, no data selling, privacy-first design')}</p>
              <p><strong>🏘 {t?.trust?.localFocus || (isEs? 'Enfoque Local:' : 'Local Focus:')}</strong> {t?.trust?.localDesc || (isEs? 'La confianza se mide dentro de tu radio de 5-20 millas, no globalmente' : 'Trust is measured within your 5-20 mile radius, not globally')}</p>
              <p><strong>🤝 {t?.trust?.communityBuilding || (isEs? 'Construcción Comunitaria:' : 'Community Building:')}</strong> {t?.trust?.communityDesc || (isEs? 'Puntajes de confianza más altos indican una comunidad local más comprometida y verificada' : 'Higher trust scores indicate a more engaged, verified local community')}</p>
            </div>
          </div>

          {/* How to Improve */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-black mb-4">{t?.trust?.howToIncrease || (isEs? 'Cómo Aumentar la Confianza' : 'How to Increase Trust')}</h2>
            <div className="space-y-2 text-white/70 text-sm">
              <p>• {t?.trust?.completeVerification || (isEs? 'Completa tu verificación de perfil' : 'Complete your profile verification')}</p>
              <p>• {t?.trust?.engagePositively || (isEs? 'Interactúa positivamente con los vecinos' : 'Engage positively with neighbors')}</p>
              <p>• {t?.trust?.postHelpful || (isEs? 'Publica contenido útil para tu comunidad' : 'Post helpful content for your community')}</p>
              <p>• {t?.trust?.reportSuspicious || (isEs? `Reporta actividad sospechosa para mantener ${displayArea} seguro` : `Report suspicious activity to help keep ${displayArea} safe`)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-white/60">{t?.trust?.unavailable || (isEs? 'Datos de confianza no disponibles para tu área. Asegúrate de que tu código postal esté configurado en tu perfil.' : 'Trust data unavailable for your area. Make sure your zip code is set in your profile.')}</p>
        </div>
      )}
    </div>
  )
}
