import React from 'react'
import { LegalLayout } from '@/components/LegalLayout'

type LegalContent = {
  title: string
  updated: string
  content: React.ReactNode
}

const PAGES: Record<string, LegalContent> = {
  terms: {
    title: 'Terms of Service',
    updated: 'August 11, 2026',
    content: (
      <div>
        <p><strong>Welcome to Sweet Social Space. By using sweetsocialspace.com you agree to these Terms of Service.</strong></p>
        <h2>1. What We Are</h2>
        <p>Hyperlocal private network - your block within 5-20 miles of YOU wherever you are.</p>
        <h2>2. Eligibility</h2>
        <p>13+ (16+ EU). One account. Zip for proximity. Zip code based location - no IP tracking. Supabase RLS.</p>
        <h2>3. Your Content</h2>
        <p>You own it. License to display to neighbors within your chosen radius. Delete anytime.</p>
        <h2>4. Rules</h2>
        <p>Speak Freely Love Neighbor. No harassment, no illegal, no spam bots. No shadowbans for faith.</p>
        <h2>5. Privacy</h2>
        <p>Minimal email zip city. No selling. No Pixel. Private 5-20 miles of YOU.</p>
        <h2>6. Contact</h2>
        <p>support@sweetsocialspace.com</p>
      </div>
    ),
  },
  privacy: {
  title: 'Privacy Policy',
  updated: 'August 11, 2026',
  content: (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p><strong>We built Sweet Social Space to be private - your block, not the world.</strong> We only ask for what we need to put you near neighbors within 5-20 miles of YOU.</p>
      <p><strong>What We Collect:</strong> Email to log you in, username you choose, zip and city for proximity. No IP tracking - purely zip code based location.</p>
      <p><strong>What We NEVER Do:</strong> No selling your data. Ever. No Facebook Pixel. No Google trackers. No ad networks watching your feed. Your feed is chronological by zip_code and radius, not by algorithm selling your attention. Supabase Row Level Security means even we can't read what we shouldn't.</p>
      <p><strong>Your Rights:</strong> You own you. View, correct, or delete your info anytime via Profile. Request export or deletion at privacy@sweetsocialspace.com - we respond within 48 hours. No dark patterns.</p>
      <p><strong>Why We Care:</strong> Independent - No Big Tech. We live on your block too. Speak Freely Love Neighbor means your porch talk stays on your porch - within 5-20 miles, SSL SECURED, TLS 1.3 via Vercel, not sold to the world.</p>
    </div>
  ),
},
  security: {
    title: 'Security Policy',
    updated: 'August 11, 2026',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2>Supported Versions</h2>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>Version</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Supported</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>1.0.x</td>
              <td style={{ padding: '8px' }}>✅</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>&​lt; 1.0</td>
              <td style={{ padding: '8px' }}>❌</td>
            </tr>
          </tbody>
        </table>

        <h2>Reporting a Vulnerability</h2>
        <p>If you discover a security vulnerability in Sweet Social Space, please report it responsibly.</p>
        
        <h3>How to Report</h3>
        <p><strong>Email:</strong> security@sweetsocialspace.com</p>
        <p>Please include:</p>
        <ul>
          <li>A description of the vulnerability</li>
          <li>Steps to reproduce the issue</li>
          <li>Potential impact on users</li>
          <li>Any suggested fixes (if known)</li>
        </ul>

        <h3>What to Expect</h3>
        <ul>
          <li><strong>Response Time:</strong> We will acknowledge your report within 48 hours</li>
          <li><strong>Updates:</strong> We will provide regular updates on the remediation progress</li>
          <li><strong>Resolution:</strong> We aim to resolve critical vulnerabilities within 7 days, moderate within 14 days</li>
          <li><strong>Disclosure:</strong> We will coordinate disclosure timing with you to ensure users are protected before public announcement</li>
        </ul>

        <h3>Security Considerations</h3>
        <p>As a local-first social platform, we prioritize:</p>
        <ul>
          <li><strong>Location Privacy:</strong> User location data is protected and only used for neighborhood content filtering</li>
          <li><strong>Data Minimization:</strong> We collect only necessary information for local social features</li>
          <li><strong>Anonymous Options:</strong> Users can participate anonymously when desired</li>
          <li><strong>Secure Authentication:</strong> Using Supabase Auth with email magic links</li>
          <li><strong>Encrypted Storage:</strong> Sensitive data is encrypted at rest and in transit</li>
        </ul>

        <h3>Accepted vs Declined</h3>
        <p><strong>Accepted vulnerabilities include:</strong></p>
        <ul>
          <li>Authentication bypasses</li>
          <li>Data exposure (personal info, location data)</li>
          <li>Privilege escalation</li>
          <li>SQL injection or API abuses</li>
          <li>Cross-site scripting (XSS)</li>
          <li>Location tracking vulnerabilities</li>
        </ul>

        <p><strong>Lower priority (may be declined):</strong></p>
        <ul>
          <li>UI/UX issues without security impact</li>
          <li>Performance optimizations</li>
          <li>Feature requests</li>
          <li>Third-party dependency issues (we'll address through normal updates)</li>
        </ul>

        <h3>Recognition</h3>
        <p>We appreciate responsible disclosure and will:</p>
        <ul>
          <li>Credit you in our security advisories (if desired)</li>
          <li>Send Sweet Social Space merchandise as thanks</li>
          <li>Invite you to our security contributor program</li>
        </ul>

        <p>Thank you for helping keep Sweet Social Space safe for local communities everywhere.</p>
      </div>
    ),
  },
  verification: {
    title: 'Verification',
    updated: 'August 11, 2026',
    content: (
            <div>
        <p>1. SSL Secured - https://sweetsocialspace.com TLS 1.3 Vercel</p>
        <p>2. Domain - sweetsocialspace.com only DNS Vercel iad1</p>
        <p>3. LOCAL Test - Incognito /feed shows your local area - zip code based only</p>
        <p>4. Verified Sources - Local Fire Stations, verified local businesses, Events near you</p>
        <p>5. Privacy - Private 5-20 miles of YOU wherever you are No tracking RLS</p>
        <p>6. Independent - No Big Tech No robots Speak Freely Love Neighbor</p>
      </div>
    ),
  },
  guarantees: {
    title: 'Our Guarantees',
    updated: 'August 11, 2026',
    content: (
      <div>
        <p>1. YOUR BLOCK FIRST - Private within 5-20 miles of YOU</p>
        <p>2. NO SHADOWBANS FOR FAITH - SPEAK FREELY LOVE YOUR NEIGHBOR</p>
        <p>3. NO ROBOTS - Chronological by zip_code and radius, no bots</p>
        <p>4. LOCAL DETECTION - Zip code based only, no IP detection</p>
        <p>5. VERIFIED SOURCES LIVE - Latest Alerts, local weather, Fire Stations, verified businesses</p>
        <p>6. SSL SECURED - Full TLS Vercel RLS Supabase</p>
        <p>7. INDEPENDENT - Not Big Tech independent</p>
      </div>
    ),
  },
  legal: { title: 'Legal', updated: 'August 11, 2026', content:
<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
<p><strong>DMCA / Copyright</strong><br/>If you believe content infringes your copyright, email legal@sweetsocialspace.com with: (1) description of work, (2) URL on site, (3) your contact, (4) good faith statement, (5) signature. We respond within 48 hours and remove verified infringement.</p>
<p><strong>Governing Law</strong><br/>Disputes shall be resolved through good faith negotiations. If unresolved, disputes may be resolved through binding arbitration in a mutually agreed jurisdiction, respecting applicable international laws and regulations.</p>
<p><strong>Contact</strong><br/>Legal: legal@sweetsocialspace.com<br/>Support: support@sweetsocialspace.com<br/>Security: security@sweetsocialspace.com</p>
<p><strong>Platform</strong><br/>Sweet Social Space • Works Anywhere • SSL SECURED • Zip code based only • Supabase RLS • Vercel iad1 • Independent - No Big Tech.</p>
</div>},
}

const ALIASES: Record<string, string> = {
  guarantee: 'guarantees',
  term: 'terms',
  termsofservice: 'terms',
}

export default function LegalSlugPage({ params }: { params: { slug: string } }) {
  const raw = params.slug.toLowerCase().replace(/[^a-z]/g, '')
  const key = ALIASES[raw] || raw
  const page = PAGES[key] || PAGES.legal
  return <LegalLayout title={page.title} updated={page.updated}>{page.content}</LegalLayout>
}
