# Wix Metadata Implementation Record

**Owner:** Wix site owner

**Execution status:** Published on 2026-07-24 and automatically revalidated on 2026-07-27 UTC

**Evidence:** `docs/WIX_OPERATOR_EXECUTION_PACKET.md` and
`docs/WIX_PUBLICATION_VERIFICATION_REPORT.md`

The previously stale faith-first metadata, unverified Organization contact/location fields,
and unsafe vitals excerpt were remediated through the authenticated Wix Editor. The resulting
site was published, then checked directly on desktop and 390px mobile.

## Home Page SEO

| Location | Previous value | Published value | Verification |
| --- | --- | --- | --- |
| Pages & Menu > Home > SEO Basics > Title tag | `Scrimed Solutions \| faith-based healthcare solutions` | `SCRIMED \| Trustworthy Healthcare Intelligence and AI-Enabled Workflows` | PASS |
| Pages & Menu > Home > SEO Basics > Meta description | Faith-first company description | `SCRIMED develops trustworthy, human-supervised healthcare intelligence and AI-enabled workflows for clinicians, care teams, health systems, payers, researchers, and patients. Current public experiences are demonstration and synthetic-data environments unless separately validated and approved.` | PASS |
| Pages & Menu > Home > Social Share | Legacy inherited positioning | Approved Atlas-first Open Graph title and description | PASS |
| Pages & Menu > Home > Advanced SEO > Canonical | `https://www.scrimedsolutions.com/` | Keep `https://www.scrimedsolutions.com/` | Confirm one canonical link and no conflicting domain |

## Organization Structured Data

Open Home > SEO Basics > Advanced SEO > Structured data markup. If Wix regenerates the
Organization object from Business Info, also update Settings > Business Info > Contact Info.

| Field | Previous value | Published value |
| --- | --- | --- |
| `@type` | `Organization` | Keep |
| `name` | `SCRIMED SOLUTIONS` | Keep |
| `url` | `https://www.scrimedsolutions.com/` | `https://www.scrimedsolutions.com` |
| `email` | `scrimedsolutions@gmail.com` | Retained as the existing public SCRIMED email |
| `telephone` | `+14049814427` | Removed |
| `address` | Unverified Atlanta/locality object | Removed |
| `sameAs` | Unverified or inherited profiles | Omitted |

Published verification found no `Review`, `AggregateRating`, customer, deployment,
certification, medical-device, or clinical-outcome schema.

## Vitals Blog Card On Home

The homepage post list previously exposed this unsafe source excerpt:

`real-time, predictive, and faith-centered patient monitoring`

The post and homepage excerpt now use synthetic-only language:

- **Title:** `SCRIMED Vitals Monitoring | Synthetic Demonstration`
- **Description:** `SCRIMED Vitals Monitoring is a synthetic-data demonstration and workflow concept for visualizing configured test signals and reviewable trends. It is not intended for diagnosis, treatment, emergency monitoring, or time-critical clinical decision-making.`

FaithCore may be linked only as a distinct optional experience and must not appear to govern
clinical logic.

## Publish And Verify

1. PASS — desktop and 390px mobile preview and published-page checks.
2. PASS — editor changes were limited to the approved Wix remediation scope.
3. PASS — site published through the normal Wix production flow.
4. PASS — title, description, Open Graph, canonical, and JSON-LD checked directly.
5. PASS — strict multi-page Wix verification reported 17 pages, two retired store routes, two
   noindexed Booking routes, three redirects, six crawler files, and zero failures.
6. PASS — domain variants redirect to the preferred HTTPS www domain.

The Wix metadata/public-claims remediation is no longer an external release blocker. This
record does not resolve the separate legal, PHI, clinical activation, certification, deployment,
or customer go-live gates.
