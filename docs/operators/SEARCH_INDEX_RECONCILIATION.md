# Search Index Reconciliation

This runbook separates repository truth from externally cached search results. It does not claim that a search engine, Wix cache, or third-party index has been updated.

1. Verify each live page directly on `https://www.scrimedsolutions.com` and `https://app.scrimedsolutions.com`.
2. Confirm canonicals use the intended `www` marketing domain or app domain and never a preview host.
3. Inspect `robots.txt` and the current sitemap for stale, duplicate, shop, cart, or legacy routes.
4. Inventory stale URLs and classify each as rewrite, archive, redirect, or `noindex`; obtain content-owner approval before destructive removal.
5. Re-run public-claims verification against HTML, SEO metadata, Open Graph, JSON-LD, Wix exports, investor decks, demos, and proof packets.
6. Publish only through the normal owner-controlled workflow, then refresh Wix-managed metadata and CDN caches.
7. Submit the canonical sitemap through the authorized search-console account and request reindexing only for corrected pages.
8. Verify direct HTML, rendered desktop, rendered 390px mobile, social previews, and external search snippets after propagation.

Record page, old result, new result, canonical, observed timestamp, operator, and evidence pointer. Keep legacy claims blocked until the live result and index are independently observed.
