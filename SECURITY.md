# SCRIMED Security Policy

## Supported Versions

Security fixes target the current `main` branch and the latest explicitly identified release candidate. Older local candidates, screenshots, demos, generated packets, and deployed revisions are not presumed supported unless a written support scope identifies the exact commit and environment.

## Private Reporting

Do not open a public GitHub issue for a suspected vulnerability. Start a private disclosure request through the contact channel on `https://www.scrimedsolutions.com` with the subject **Private Security Disclosure Request**. Do not include exploit payloads, credentials, access tokens, PHI, patient identifiers, customer data, or confidential logs in the initial message. Request a secure transfer channel before sharing technical evidence.

Include only:

- a concise description of the affected SCRIMED surface;
- the repository, route, or component name;
- the observed impact and safe reproduction preconditions;
- whether active exploitation is suspected;
- a non-sensitive contact method for coordination.

SCRIMED will triage the report, establish an authorized evidence channel, assign an internal owner, and coordinate remediation and disclosure timing. This policy is not a response-time SLA, bug-bounty offer, authorization to access systems, or permission to test production, customer, payer, EHR, identity, or clinical infrastructure.

Expected handling stages are acknowledgment, scope confirmation, severity and exposure review, containment, remediation validation, and coordinated disclosure. Timing depends on impact, reproducibility, customer exposure, and required clinical, privacy, legal, or infrastructure review; no fixed response or remediation deadline is promised by this repository policy.

## Scope

In scope are SCRIMED-owned application code, APIs, authentication and authorization boundaries, tenant isolation, audit controls, build and release tooling, and published SCRIMED domains when the reporter has explicit testing authorization. Third-party services, customer systems, payer systems, EHRs, identities, devices, cloud accounts, and vendor infrastructure are outside scope unless their owner separately authorizes testing.

## Safe Evidence Handling

Use hashes, bounded metadata, redacted request identifiers, and the minimum reproducible evidence. Do not send gists, public paste links, public issue attachments, raw prompts, raw connector payloads, signed URLs, session cookies, secrets, PHI, or customer-confidential material. SCRIMED may request deletion or secure return of evidence after validation and legal-hold review.

## Research Boundaries

- Test only systems and data you own or are explicitly authorized to assess.
- Use synthetic, no-PHI test data.
- Do not perform denial-of-service, persistence, social engineering, credential attacks, data exfiltration, destructive mutation, or automated scanning against production.
- Stop immediately if PHI, credentials, customer data, or cross-tenant access becomes visible.
- Preserve the minimum evidence needed for review and follow SCRIMED's requested secure-disposal process.

## Repository Controls

The repository keeps consequential actions deny-by-default, secrets server-side, PHI out of logs and fixtures, model/provider calls feature-flagged, and clinical, payer, EHR, deployment, migration, and external-communication authority human-gated. A passing automated check is engineering evidence only and does not establish compliance, certification, clinical validation, deployment approval, or customer authorization.
