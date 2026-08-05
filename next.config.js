/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self), fullscreen=(self)' },
          { 
            key: 'Content-Security-Policy', 
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.vercel-scripts.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "media-src 'self' blob: https://*.supabase.co https://*.elevenlabs.io",
                       // FIXED 28th - added ipapi.co + nominatim + vercel live for GLOBAL detection
              // FIXED - added LiveKit for Go Live feature
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://ipapi.co https://overpass-api.de https://api.weather.gov https://api.openweathermap.org https://date.nager.at https://*.openstreetmap.org https://nominatim.openstreetmap.org https://api.elevenlabs.io https://*.elevenlabs.io https://api.stripe.com https://vercel.live https://*.vercel.app https://*.livekit.cloud wss://*.livekit.cloud"   
            ].join("; ")
          }
        ],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/terms', destination: '/legal/terms', permanent: true },
      { source: '/privacy', destination: '/legal/privacy', permanent: true },
      { source: '/contact', destination: '/legal/contact', permanent: true },
      { source: '/security', destination: '/legal/security', permanent: true },
      { source: '/verification', destination: '/legal/verification', permanent: true },
      { source: '/guarantees', destination: '/legal/guarantees', permanent: true },
      { source: '/about', destination: '/legal/about', permanent: true },
      { source: '/legal', destination: '/legal/legal', permanent: false },
    ]
  },
}

module.exports = nextConfig
