// Server-only config. This file should only be imported in Server Components,
// Server Actions, or Route Handlers. Never import in Client Components.
//
// Next.js automatically prevents this from bundling to the client.
// Unlike Cloudflare Workers, Next.js can read process.env at module scope,
// but wrapping in a function is still good practice for consistency.

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    // Add server-only values here, e.g.:
    // databaseUrl: process.env.DATABASE_URL,
    // stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    // resendApiKey: process.env.RESEND_API_KEY,
  }
}
