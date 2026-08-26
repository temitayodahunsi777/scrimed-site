# Vercel Runtime, Caching, and Headers Review

## Runtime

The repository owns the Node 24 declaration. Vercel remains preview-first, with automatic `main` deployment disabled in `vercel.json`.

## Caching

- `/api/build-info`, `/api/health`, `/api/readiness`, and `/api/product/console` emit `Cache-Control: no-store`.
- Protected and tenant-scoped APIs must remain private/no-store and must never enter shared CDN caches.
- Static public pages and approved nonpatient reference content may use Next.js static generation or bounded revalidation.
- Patient-specific, credential-bearing, approval, audit, review, and mutation responses are never public-cache candidates.

## Headers

`next.config.js` centrally applies CSP, HSTS, MIME sniffing protection, frame denial, referrer policy, permissions policy, opener/resource isolation, and explicit SCRIMED authority boundary headers. The migration adds no permissive source, frame, device, payment, or sensor capability.

The production CSP still permits inline styles and inline scripts required by the current Next.js output. Removing those allowances requires nonce/hash architecture and separate browser regression work; they are not silently weakened or misrepresented here.
