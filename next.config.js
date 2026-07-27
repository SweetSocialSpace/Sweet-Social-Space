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
          // GLOBAL FIX - Allow camera, mic, location for Go Live - all devices
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self), fullscreen=(self)' },
          { 
            key: 'Content-Security-Policy', 
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "media-src 'self' blob: https://*.supabase.co https://*.elevenlabs.io",
              // GLOBAL CONNECT - automated ribs: maps, weather, holidays, voice, supabase - works on any zip on earth
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://overpass-api.de https://api.weather.gov https://api.openweathermap.org https://date.nager.at https://*.openstreetmap.org https://api.elevenlabs.io https://*.elevenlabs.io https://api.stripe.com"
            ].join("; ")
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig
