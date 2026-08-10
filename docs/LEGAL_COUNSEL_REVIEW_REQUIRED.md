# Legal Counsel Review Required

All policies below are interim drafts. They do not establish legal compliance.

## Pages Requiring Review

| Route | Review focus | Priority |
| --- | --- | --- |
| `/legal/privacy` | data categories, lawful basis, rights, retention, processors, state and international scope | P0 |
| `/legal/terms` | entity, governing law, warranties, liability, dispute terms, acceptable use | P0 |
| `/legal/cookies` | Wix/application cookie inventory, consent mechanism, regional requirements | P0 |
| `/legal/healthcare-ai-disclaimer` | medical, emergency, AI, FaithCore, device, and intended-use language | P0 |
| `/legal/accessibility` | applicable standard, response process, statement scope | P1 |
| `/legal/refunds` | interaction with future signed agreements and any external checkout | P1 |

## Unresolved Questions

- Verified registered legal entity, public address, governing jurisdiction, and service-of-process details.
- Privacy-law scope by user location and target market.
- Whether any future healthcare arrangement will involve a business associate agreement, data processing agreement, research authorization, consent, or regulated-device review.
- Final retention, deletion, legal-hold, incident-notification, minors, and international-transfer rules.
- Commercial terms for assessments, pilots, subscriptions, cancellations, refunds, and intellectual property.

## Public Form Data

The repository-controlled pilot form collects business contact, organization, role, optional phone and website, workflow interests, governance needs, timeline, and nonclinical scope. It prohibits patient names, records, diagnoses, biometric data, identifiers, member data, and emergency details. The current durable-store schema defines a 180-day default retention period; counsel and privacy owners must approve the final rule.

## Technology And Processors Found

- Vercel/Next.js application hosting and deployment tooling.
- Supabase database/authentication interfaces when configured.
- Upstash rate limiting when configured.
- Optional CRM webhook.
- Separate Wix marketing site with Forms, Chat, Bookings, Blog, Store, SEO, consent, and analytics capabilities visible in the installed-app inventory. The public Shop/cart surfaces were not visible on 2026-07-23, but installation alone does not establish whether Store data or processor obligations remain.
- GitHub source control and CI.

Contract scope, subprocessors, residency, retention, and protected-data authorization were not established by this code review.

The live Wix Organization JSON-LD still included an Atlanta locality and telephone number
on 2026-07-23. Founder and counsel must verify those facts and publication need or remove
them from the Wix SEO settings.

## Healthcare Questions

Qualified counsel and clinical/regulatory specialists must review intended use, public claims, device and vitals concepts, patient-facing experiences, research workflows, reimbursement workflows, emergency language, accessibility, advertising, and FaithCore consent/separation before commercial healthcare deployment.
