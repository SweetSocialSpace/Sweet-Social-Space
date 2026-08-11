# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Sweet Social Space, please report it responsibly.

### How to Report

**Email:** security@sweetsocialspace.com

Please include:
- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact on users
- Any suggested fixes (if known)

### What to Expect

- **Response Time:** We will acknowledge your report within 48 hours
- **Updates:** We will provide regular updates on the remediation progress
- **Resolution:** We aim to resolve critical vulnerabilities within 7 days, moderate within 14 days
- **Disclosure:** We will coordinate disclosure timing with you to ensure users are protected before public announcement

### Security Considerations

As a local-first social platform, we prioritize:

- **Location Privacy:** User location data is protected and only used for neighborhood content filtering
- **Data Minimization:** We collect only necessary information for local social features
- **Anonymous Options:** Users can participate anonymously when desired
- **Secure Authentication:** Using Supabase Auth with email magic links
- **Encrypted Storage:** Sensitive data is encrypted at rest and in transit

### Accepted vs Declined

**Accepted vulnerabilities include:**
- Authentication bypasses
- Data exposure (personal info, location data)
- Privilege escalation
- SQL injection or API abuses
- Cross-site scripting (XSS)
- Location tracking vulnerabilities

**Lower priority (may be declined):**
- UI/UX issues without security impact
- Performance optimizations
- Feature requests
- Third-party dependency issues (we'll address through normal updates)

### Recognition

We appreciate responsible disclosure and will:
- Credit you in our security advisories (if desired)
- Send Sweet Social Space merchandise as thanks
- Invite you to our security contributor program

Thank you for helping keep Sweet Social Space safe for local communities everywhere.
