# Wix Commercial Copy Alignment

Owner: Wix site owner. Status: **VERIFY PUBLISHED WIX CONTENT; NO MUTATION CLAIMED BY THIS PACKET**.

| Surface | Old value to remove if present | Replacement |
| --- | --- | --- |
| Protected Enterprise Pilot price or CTA | Any numeric range, immediate purchase language, or `Start Protected Pilot` promise | `Custom enterprise scope — subject to security, privacy, insurance, deployment-readiness, and written authorization requirements.` |
| Enterprise Operating License price | Any public numeric band | `Custom enterprise scope — commercial terms established following technical, security, legal, and deployment-readiness review.` |
| Strategic partnership price | Any public numeric band | `Custom strategic scope — commercial terms require regional, technical, security, legal, procurement, and authority review.` |
| Primary entry offer | A broad production or platform purchase promise | `Workflow Intelligence Assessment — starting at $25K, subject to written agreement.` |
| Synthetic pilot | Production, PHI, clinical, or customer activation implication | `Custom enterprise scope for a bounded synthetic/no-PHI evaluation; named human approval required.` |

## Wix Paths to Check

Homepage sections, product/service summaries, CMS collections, SEO descriptions, Open Graph descriptions, JSON-LD Offer/Product/Service objects, buttons, mobile-only text, hidden accessibility text, and duplicated legacy pages.

## Verification

1. Publish only through the normal Wix owner workflow.
2. Run `npm run smoke:wix-public-claims` and `npm run verify:wix-production`.
3. Inspect published desktop and 390px mobile pages.
4. Confirm no numeric protected/operating/strategic bands, no production claim, and no clinical authorization claim remain.

Wix publication, contract terms, protected-pilot activation, and external commercial distribution require separate authority.
