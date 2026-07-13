# SCRIMED Dependency Security Floor

SCRIMED pins its framework security floor so dependency drift cannot silently weaken the platform.

The local no-network check verifies:

- `next` remains pinned at or above the reviewed Next.js App Router security floor.
- `react` and `react-dom` remain pinned at the same reviewed React Server Components security floor.
- `eslint-config-next` stays aligned with `next`.
- `package.json` and `package-lock.json` agree on resolved framework versions.
- the `postcss` override remains pinned until a trusted dependency review changes it.

Run:

```bash
npm run security:dependency-floor
npm run security:assurance
npm run test:nonsecret
```

This control is evidence discipline only. It does not replace `npm audit`, SBOM generation, dependency provenance signing, external vulnerability review, WAF configuration, SIEM monitoring, penetration testing, privacy review, or customer-specific security approval.
