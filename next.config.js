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
          // GLOBAL FIX - Allow camera, mic, location for Go Live
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self), fullscreen=(self)' },
          { 
            key: 'Content-Security-Policy', 
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "media-src 'self' blob: https://*.supabase.co",
              // GLOBAL CONNECT - allow your maps, weather, holidays + supabase
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://overpass-api.de https://api.weather.gov https://date.nager.at https://*.openstreetmap.org"
            ].join("; ")
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig
