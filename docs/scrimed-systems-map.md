# SCRIMED Systems Map

Updated: 2026-06-27

This map organizes SCRIMED's current build into operating lanes. It is the first place to check before adding a new route, agent, proof packet, or buyer-facing claim.

## Public Operations Lane

Purpose: explain SCRIMED as healthcare operations intelligence, governed synthetic pilots, buyer diligence, workflow evidence, and readiness coordination.

Primary surfaces:

- `/company-assessment`
- `/clinical-production-readiness`
- `/product`
- `/launch-readiness`
- `/offerings`
- `/service-delivery`
- `/client-onboarding`
- `/pilot-demo-commercial-readiness`
- `/navigation`
- `/service-reliability`
- `/operational-efficiency`
- `/capital-vitality`
- `/growth-engine`
- `/investor-audience-readiness`
- `/enterprise-business-ops`
- `/enterprise-scalability`
- `/platform-power`
- `/production-architecture`
- `/competitive-intelligence`
- `/competitive-defense`
- `/global-certification-readiness`
- `/healthcare-intelligence-os`
- `/health-records`
- `/continuous-review-audit`
- `/release-continuity`
- `/buyer-release-control-run`
- `/qa-evidence`
- `/boundary-resolution`
- `/public-market-readiness`
- `/clinical-authority-readiness`
- `/trust-center`
- `/claims`

Rules:

- Whole-company decisions should start at `/company-assessment` before routing into product, revenue, delivery, platform, health-record, launch, approvals, certification, review, workaround, or protected proof lanes.
- The persistent app-wide navigation must keep Product, Pilot, Proof, Limitations, buyer motion, trust, operations, and build surfaces reachable from every page.
- Public copy can describe workflow intelligence, evidence organization, synthetic evaluation, audit readiness, and buyer diligence.
- Public copy must not claim diagnosis, treatment recommendation, live clinical care authority, PHI processing authority, HIPAA/SOC/FDA certification, reimbursement certainty, or production connector approval.
- Public health-records copy must stay no-PHI, synthetic, source-attributed, and reviewer-gated; it cannot imply live record ingestion, patient matching, payer submission, EHR writeback, or record mutation.
- Public APIs must fail closed for tenant-scoped proof, packet, or approval surfaces.

## Production Architecture Lane

Purpose: bind SCRIMED's next-level platform architecture into one typed, review-gated operating contract before live clinical production expands.

Primary surfaces:

- `/production-architecture`
- `/api/production-architecture`
- `/api/production-architecture/brief`
- `/workflows/execution-attempts`
- `/api/workflows/execution-attempts/envelope`
- `/api/workflows/execution-attempts/envelope/brief`
- `/api/workflows/execution-attempts/durable-store`
- `/api/workflows/execution-attempts/durable-store/brief`
- `/api/workflows/execution-attempts/durable-store/record`
- `/api/workflows/execution-attempts/durable-store/replay`
- `/api/workflows/execution-attempts/durable-store/review-disposition`
- `/product`
- `/platform-power`
- `/agents`
- `/trust-os`
- `/workflows`
- `/continuous-review-audit`

Rules:

- The architecture lane can expose Agent Runtime, Context Engine, Trust Engine v2, Model Router, Evaluation Engine, ClinSecOps, deterministic Workflow Engine, provider mesh, validation checks, hard stops, and next implementation steps.
- The SCRIMED Intelligence Layer may map OpenAI, Claude, Gemini, Llama, Mistral, Qwen, Z.ai GLM, DeepSeek, and future models only as governed evaluation/provider routes with model version, cost, latency, confidence, routing rationale, fallback, and review logs.
- Execution attempts may expose metadata-only envelopes, idempotency keys, replay tokens, model-route telemetry, human review gates, audit traces, failure recovery, and no-PHI scorecards before protected execution authority exists.
- Context compression must deny PHI in current public and synthetic routes, preserve evidence references, apply least-necessary context, and attach policy/version metadata before model calls.
- LLMs may support reasoning, summarization, synthesis, and explanation. Deterministic workflow systems and qualified humans remain responsible for protected clinical, payer, billing, patient-facing, connector, or record-mutating actions.
- It must not authorize PHI processing, live patient data, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, claim submission, production model routing, production attempt persistence, certification claims, production connector approval, or clinical production use.

## Company Operating Assessment Lane

Purpose: assess SCRIMED as a whole and route company decisions through the right operating lane before claims, commitments, launches, pilots, investor materials, or service work expand.

Primary surfaces:

- `/company-assessment`
- `/api/company-assessment`
- `/api/company-assessment/brief`
- `/product`
- `/hub`
- `/offerings`
- `/service-delivery`
- `/enterprise-business-ops`
- `/pilot-demo-commercial-readiness`
- `/platform-power`
- `/health-records`
- `/launch-readiness`
- `/approvals-readiness`
- `/global-certification-readiness`
- `/continuous-review-audit`
- `/limitations-workarounds`
- `/qa-buyer-proof-release`

Rules:

- Company Assessment can expose readiness score, dimensions, strengths, whole-company audit findings, revenue builders, competitive edge amplifiers, improvement priorities, weakness relief, missing capability closure records, upgrade workstreams, team lanes, source alignment, priority sequence, evidence routes, and hard stops.
- It must route buyer, investor, board, launch, delivery, product, security, certification, finance, accounting, tax, AI, health-record, or protected proof decisions into the owning SCRIMED lane.
- It must not claim legal/accounting/tax advice, audited financial reporting, investment advice, securities material, solicitation, valuation assurance, certification, security assurance, PHI authority, connector approval, customer permission, public launch approval, contractual SLA, revenue guarantee, profit-margin guarantee, reimbursement assurance, or live clinical care.
- Every company weakness must have owner, relief move, proof route, retained boundary, and escalation path before external commitments expand.
- Every missing capability must have current workaround, permanent build, owner, proof route, success metric, blocked-until condition, and retained boundary before it is discussed as a planned expansion.
- Every revenue builder must name the buyer, package motion, margin lever, conversion path, proof routes, and retained boundary before it is used in sales or investor materials.

## Clinical Production Readiness Lane

Purpose: track the tasks that must be complete before live clinical production while keeping current no-PHI commercial, strategic, and structural motions active.

Primary surfaces:

- `/clinical-production-readiness`
- `/api/clinical-production-readiness`
- `/api/clinical-production-readiness/brief`
- `/company-assessment`
- `/clinical-authority-readiness`
- `/global-certification-readiness`
- `/health-records`
- `/platform-power`
- `/continuous-review-audit`
- `/service-reliability`
- `/enterprise-business-ops`
- `/service-delivery`
- `/qa-buyer-proof-release`
- `/pilot-workspace/access`

Rules:

- Clinical Production Readiness can track required tasks, owners, completion criteria, missing evidence, dependencies, current safe use, official source references, current capability motions, and retained boundaries.
- It must preserve that SCRIMED is not yet clinical-production-ready while allowing no-PHI demos, paid readiness services, synthetic pilots, diligence packets, AI governance reviews, health-record sandbox planning, and investor or clinic readiness conversations.
- It must not claim legal advice, medical advice, regulatory approval, HIPAA compliance, SOC 2/HITRUST/ISO certification, FDA clearance, ONC certification, EU AI Act conformity, GDPR compliance assurance, PHI authority, production connector approval, customer permission, launch approval, reimbursement assurance, SLA, revenue guarantee, profit guarantee, securities material, investment advice, valuation assurance, or live clinical care.
- Every task promotion must update Product Console, Hub, Navigation Audit, README, docs, and smoke checks before external claims expand.

## Healthcare Intelligence OS Lane

Purpose: organize medical capability planning, clinical awareness, patient safety, clinical workflow automation, patient-engagement analysis, interoperability standards, operations optimization, and clinician administrative burden reduction without crossing into live clinical authority.

Primary surfaces:

- `/healthcare-intelligence-os`
- `/api/clinical-data-fabric`
- `/api/clinical-data-fabric/brief`
- `/api/clinical-data-governance`
- `/api/clinical-data-governance/brief`
- `/api/clinical-context-gateway`
- `/api/clinical-context-gateway/brief`
- `/api/healthcare-intelligence-os`
- `/api/healthcare-intelligence-os/brief`
- `/api/scrimed-os/upgrade-batch`
- `/api/scrimed-os/upgrade-batch/brief`
- `/health-records`
- `/clinical-care-activation`
- `/clinical-authority-readiness`
- `/interoperability`
- `/qa-claim-guard`
- `/product`

Rules:

- Healthcare Intelligence OS can expose clinical workflow automation tracks, clinical awareness, draft automation scope, patient-safety controls, patient-engagement analysis signals, interoperability bindings, clinician burden-reduction motions, operations optimization levers, proof routes, blocked actions, required evidence before live use, and retained boundaries.
- Current safe use is synthetic, metadata-only, draft-only, queueing, evidence organization, readiness, and human-reviewed support for demos, assessments, pilots, and buyer diligence.
- Patient engagement analysis may identify access friction, follow-up readiness, portal/message readiness, communication barriers, and aggregate engagement signals; it must not create autonomous outreach, patient-specific risk scoring, clinical advice, or emergency triage.
- Workflow automation may reduce chart-prep, documentation drafting, prior-auth evidence prep, referral queueing, med-rec discrepancy sorting, transition checklist assembly, and inbox triage burden; it must not file notes, mutate records, enter orders, prescribe, submit claims, contact patients, or execute live clinical workflows without approved authority.
- Every clinical workflow track must keep patient safety controls, interoperability bindings, blocked actions, proof routes, required-before-live criteria, and retained boundary visible before buyer copy, pilot scope, investor diligence, or product packaging expands.
- It must not authorize PHI processing, live chart pulls, patient matching, patient outreach, diagnosis, treatment, prescribing, emergency triage, EHR filing, EHR writeback, order entry, payer submission, clinical-risk prediction, reimbursement guarantees, security certification, regulatory approval, or autonomous clinical execution.

## Launch Readiness Lane

Purpose: keep launch structure, sandbox DNS limitations, strict branded-domain verification, fallback continuity, service paths, product packaging, protected proof, and hard stops in one go/no-go operating lane.

Primary surfaces:

- `/launch-readiness`
- `/api/launch-readiness`
- `/api/launch-readiness/brief`
- `/product`
- `/hub`
- `/operations`
- `/release-continuity`
- `/navigation`
- `/service-reliability`
- `/limitations-workarounds`
- `/enterprise-business-ops`
- `/enterprise-scalability`

Rules:

- Launch Readiness can classify restricted sandbox DNS failures such as `ENOTFOUND` separately from app health.
- The fallback Vercel URL is continuity evidence only; it is not launch approval.
- Public launch approval still requires the branded domain to resolve and pass public smoke from an unrestricted or approved network.
- Launch claims must keep product, service, support, legal, finance, certification, PHI, connector, SLA, customer-release, and live-care authority hard stops visible.
- Launch Readiness does not bypass sandbox restrictions, override DNS, approve production clinical use, authorize PHI processing, certify security/compliance, create contractual SLAs, approve customer release, or replace qualified human review.

## Competitive Market Intelligence Lane

Purpose: convert public competitor positioning, product packaging, API posture, healthcare intelligence themes, sales motions, target-audience needs, and trust expectations into original SCRIMED product work.

Primary surfaces:

- `/competitive-intelligence`
- `/api/competitive-intelligence`
- `/competitive-edge`
- `/strategic-intelligence`
- `/api/strategic-intelligence`
- `/product`
- `/hub`

Rules:

- Competitive Market Intelligence can expose public sources, source-informed product patterns, target-audience strategies, buyer roles, offer motions, conversion triggers, proof routes, proof metrics, governance gates, blocked claims, buyer segments, owners, and next actions.
- Target-audience strategy must include a SCRIMED counter-position, sales message, retained boundary, and blocked claims before it is used in buyer, investor, partner, clinic, or public-sector language.
- Strategic Platform Intelligence can expose SCRIMED-specific execution bets, execution commands, execution scorecards, horizons, priorities, build motions, sell motions, revenue motions, commercial outcomes, operating cadences, proof metrics, stop conditions, owners, proof routes, current proof, missing proof, leading indicators, lagging indicators, retained boundaries, decision gates, allow conditions, block conditions, promotion criteria, demotion triggers, escalation paths, and blocked expansion controls.
- Strategic execution commands must keep this-week, 30-day, 60-day, and 90-day work tied to required proof, decision gates, dependencies, success metrics, next actions, and retained boundaries before they guide public copy, buyer outreach, investor packets, pilot packaging, platform licensing, clinical/global approval work, or protected proof release.
- Strategic execution scorecards must keep proof-ready, proof-building, watch, sequenced, and external-review-required states visible before work is promoted into buyer-facing copy, protected evidence, investor language, service scope, clinical/global approval preparation, or platform commitments.
- Strategic bets require a proof metric, stop condition, owner set, proof route, and retained boundary before they are used in sales, investor, partner, or product-planning language.
- Decision gates must block PHI, live clinical authority, customer proof release, public API SLA, regional approval, security/certification, legal/finance, securities, revenue, or profit claims when evidence or qualified review is missing.
- It must not copy third-party code, proprietary workflows, private APIs, branding, datasets, model weights, customer proof, security certifications, regulatory approvals, partnerships, or live clinical authority.

## Competitive Defense Lane

Purpose: turn competitor pressure, SCRIMED weakness relief, legal/privacy/cybersecurity controls, and infiltration risks into owned hardening work.

Primary surfaces:

- `/competitive-defense`
- `/api/competitive-defense`
- `/api/competitive-defense/brief`
- `/competitive-intelligence`
- `/claims`
- `/trust-center`
- `/global-certification-readiness`
- `/health-records`
- `/platform-power`
- `/trust-os`
- `/release-continuity`
- `/pilot-workspace/access`

Rules:

- Competitive Defense can name public competitor pressure, the SCRIMED weakness exposed, the original counter-position, the proof route, and the hardening move.
- Competitive Defense must preserve no-copy, no-PHI, no-certification, no-penetration-test-authorization, no-competitor-partnership, no-attack-guarantee, no-customer-release, and no-live-care boundaries.
- Legal, privacy, security, penetration-test, customer proof, competitor comparison, and production data claims require qualified human review before public use.
- Infiltration risks must be expressed as likely attack path, prevention, detection, response, evidence route, and hard stop.
- Every competitor-inspired pattern must become SCRIMED-specific build work with no-PHI proof metrics, human-review controls, and blocked-claim language before sales use.

## Commercial Growth Engine Lane

Purpose: keep buyer segments, sellable offers, revenue motions, conversion lanes, revenue proof steps, bottlenecks, owners, and proof routes in one execution map.

Primary surfaces:

- `/growth-engine`
- `/api/growth-engine`
- `/api/growth-engine/brief`
- `/product`
- `/hub`
- `/offerings`
- `/capital-vitality`
- `/investor-audience-readiness`
- `/pilot-deal-room`
- `/pricing`
- `/pilot-demo-commercial-readiness`
- `/pilot`

Rules:

- Growth Engine can expose prioritized plays, buyer triggers, conversion events, disqualifiers, proof ladders, bottlenecks, owners, and next actions.
- It must not claim customer revenue guarantees, investment advice, securities offering material, audited financial reporting, valuation assurance, legal advice, tax advice, reimbursement assurance, procurement approval, customer permission, security certification, regulatory approval, PHI authority, production connector authority, or live clinical authority.
- Buyer-specific proof, fundraising materials, valuation claims, customer references, and regulated authority claims require retained external review before use.

## Pilot Demo Commercial Readiness Lane

Purpose: make SCRIMED demos and pilots seamless to buy by mapping each demo into one recommended pilot path, price band, proof asset list, no-PHI intake route, market benchmark, margin rule, and retained boundary before custom buyer work expands.

Primary surfaces:

- `/pilot-demo-commercial-readiness`
- `/api/pilot-demo-commercial-readiness`
- `/api/pilot-demo-commercial-readiness/brief`
- `/demos`
- `/pilots`
- `/pricing`
- `/offerings`
- `/service-delivery`
- `/client-onboarding`
- `/enterprise-business-ops`
- `/growth-engine`
- `/product`

Rules:

- Pilot Demo Commercial Readiness can expose demo offer paths, conversion steps, price bands, market benchmarks, recommended pilot packages, proof assets, intake routes, margin rules, and next actions.
- It should be opened before qualified demo calls, pilot scoping, pricing conversations, investor demo prep, and custom SOW work so SCRIMED leaves each conversation with one selected path instead of an open-ended bespoke request.
- It must not create signed quotes, contracts, procurement approval, customer permission, legal/accounting/tax advice, audited financial reporting, securities material, valuation assurance, revenue guarantees, profit guarantees, ROI guarantees, reimbursement guarantees, PHI authority, connector approval, security certification, or live clinical authority.
- Buyer-specific discounts, custom terms, protected pilot activation, PHI exposure, production connector work, customer-value claims, and investor-use pricing language require Enterprise Business Ops, Claim Guard, and qualified human review before external use.

## Investor And Audience Readiness Lane

Purpose: turn weaknesses, competitive edge, sellable value, and target audiences into owned relief tracks, proof-backed packets, next moves, and qualified-review gates.

Primary surfaces:

- `/investor-audience-readiness`
- `/api/investor-audience-readiness`
- `/api/investor-audience-readiness/brief`
- `/product`
- `/hub`
- `/capital-vitality`
- `/growth-engine`
- `/enterprise-business-ops`
- `/public-market-readiness`
- `/client-onboarding`
- `/pilot-deal-room`
- `/qa-claim-guard`

Rules:

- Investor and Audience Readiness can expose weakness relief, competitive edge, audience packets, diligence packet checklists, official-source routing references, proof routes, next moves, and blocked claims.
- It must not claim investment advice, securities offering material, solicitation, audited financial reporting, valuation assurance, legal advice, tax advice, accounting advice, nonprofit tax advice, donor advice, faith-based endorsement, customer revenue guarantee, profit guarantee, reimbursement assurance, security certification, regulatory approval, PHI authority, production connector authority, partnership approval, customer permission, or live clinical authority.
- Angel, corporate strategic, private investor, faith-based clinic, public-sector, payer, provider, clinician, global-partner, and transformation-sponsor language must route through Claim Guard and qualified review before external fundraising, grant, donor, term-sheet, partnership, or public-use language expands.

## Product And Services Portfolio Lane

Purpose: package SCRIMED offers, service tiers, delivery playbooks, proof routes, qualification gates, margin controls, and retained boundaries into one sellable operating layer.

Primary surfaces:

- `/offerings`
- `/api/offerings`
- `/api/offerings/brief`
- `/service-delivery`
- `/api/service-delivery`
- `/api/service-delivery/brief`
- `/pilot-demo-commercial-readiness`
- `/product`
- `/pricing`
- `/pilot`
- `/growth-engine`
- `/enterprise-business-ops`
- `/health-records`
- `/interoperability`
- `/continuous-review-audit`
- `/boundary-resolution`

Rules:

- The portfolio is the canonical source for package, offer, proof route, margin control, and retained-boundary alignment before pricing, pilots, diligence, implementation, or enterprise-license work expands.
- `/pilot-demo-commercial-readiness` is the commercial bridge from public demos into package selection, price-band selection, market-aligned proof, and no-PHI intake before scoped delivery begins.
- It can expose offers, package tiers, buyer triggers, deliverables, qualification gates, delivery playbooks, margin controls, hard stops, and safe workarounds.
- It must not claim legal/accounting/tax advice, audited financial reporting, securities offering material, customer permission, revenue guarantees, profit guarantees, reimbursement assurance, certification, PHI authority, production connector approval, EHR writeback approval, payer submission approval, or live clinical authority.
- Custom SOWs, discounting, production connector work, PHI exposure, customer-value claims, global certification claims, partner economics, and implementation labor require qualified human review before external commitment.

## Service Delivery Workbench Lane

Purpose: convert packaged SCRIMED offers into scoped work orders, delivery phases, acceptance criteria, artifacts, buyer handoffs, margin protections, and retained authority gates.

Primary surfaces:

- `/service-delivery`
- `/api/service-delivery`
- `/api/service-delivery/brief`
- `/offerings`
- `/product`
- `/client-onboarding`
- `/enterprise-business-ops`
- `/qa-claim-guard`
- `/qa-buyer-proof-release`
- `/pilot-workspace/access`
- `/growth-engine`

Rules:

- Service Delivery is the canonical source for no-PHI intake, scope matrix, work-order templates, artifacts, acceptance criteria, release gates, and handoff routines after an offer is selected.
- It can expose delivery offers, delivery phases, work-order templates, artifact requirements, package bindings, escalation triggers, margin protections, and hard stops.
- It must not create statements of work, approve contracts, create contractual SLAs, authorize managed-service commitments, grant customer permission, guarantee revenue or profit, process PHI, approve production connectors, approve EHR writeback, approve payer submission, validate clinical performance, certify compliance/security, or authorize live clinical care.
- Buyer-specific proof release, contract language, pricing commitments, clinical claims, security claims, and production connector requests must route through AAL2 release controls and qualified human review before use.

## Client Onboarding And Communications Lane

Purpose: convert buyer interest into governed discovery, demos, pilot workshops, diligence reviews, kickoff meetings, presentation packets, email-ready copy, calendar-ready agendas, follow-up SLAs, and handoffs.

Primary surfaces:

- `/client-onboarding`
- `/api/client-onboarding`
- `/api/client-onboarding/brief`
- `/product`
- `/offerings`
- `/pilot-demo-commercial-readiness`
- `/service-delivery`
- `/demos`
- `/pilots`
- `/pilot`
- `/pilot-deal-room`
- `/sales-operations`
- `/enterprise-business-ops`
- `/boundary-resolution`

Rules:

- Client Onboarding is the canonical source for buyer-stage classification, meeting cadence, communication templates, calendar-safe packets, presentation packets, follow-up SLAs, and internal handoffs.
- It can draft email-ready and calendar-ready language, but humans must approve every external send, recipient list, meeting invite, deck, and buyer-specific follow-up.
- It must not send email, create calendar invites, bind contracts, approve procurement, approve BAA/security posture, store PHI, process live clinical records, create customer permission, certify compliance, guarantee revenue or ROI, approve production connectors, or authorize live clinical care.
- PHI, credentials, live records, security-sensitive artifacts, legal/finance conclusions, custom SOW commitments, customer-value claims, and clinical/production requests must route to their named boundary owners before use.
- Demo and pilot communications should reference `/pilot-demo-commercial-readiness` before a buyer receives package, price-band, proof-list, or next-step language.

## Capital Vitality Lane

Purpose: keep revenue capabilities, competitive moat evidence, investor-readiness milestones, funding workstreams, proof routes, and retained external-review gates in one governed growth map.

Primary surfaces:

- `/capital-vitality`
- `/api/capital-vitality`
- `/api/capital-vitality/brief`
- `/product`
- `/hub`
- `/public-market-readiness`
- `/pricing`
- `/pilot-deal-room`

Rules:

- Capital Vitality can expose packaged revenue paths, moat evidence, investor diligence milestones, funding workstreams, and proof routes.
- It must not claim investment advice, securities offering material, audited financial reporting, valuation assurance, legal advice, tax advice, reimbursement assurance, customer revenue guarantee, security certification, regulatory approval, PHI authority, production connector authority, or live clinical authority.
- Funding, valuation, securities, legal, tax, audited-financial, and investor-solicitation materials require qualified external review before use.

## Enterprise Business Operations Lane

Purpose: strengthen enterprise revenue capability, profit-margin discipline, legal operations, finance/accounting controls, tax-awareness routing, deal approvals, billing readiness, and audit evidence before business commitments expand.

Primary surfaces:

- `/enterprise-business-ops`
- `/api/enterprise-business-ops`
- `/api/enterprise-business-ops/brief`
- `/product`
- `/hub`
- `/offerings`
- `/pilot-demo-commercial-readiness`
- `/growth-engine`
- `/investor-audience-readiness`
- `/capital-vitality`
- `/public-market-readiness`
- `/sales-operations`
- `/pilot-deal-room`

Rules:

- Enterprise Business Operations can expose revenue capabilities, margin controls, deal-desk gates, legal/finance/accounting/tax roles, enterprise controls, operating cadences, profit levers, official-source anchors, and blocked business claims.
- It must not claim legal advice, accounting advice, tax advice, audited financial reporting, securities offering material, investment advice, valuation assurance, contract approval, revenue guarantee, profit-margin guarantee, reimbursement assurance, customer permission, certification, PHI authority, production connector authority, or live clinical authority.
- Quote-to-contract packets, discounts, customer-specific terms, tax posture, revenue recognition, investor materials, valuation language, public financial claims, and partner economics require qualified human review before external use.
- Demo-to-pilot pricing exceptions should start in `/pilot-demo-commercial-readiness` and graduate into Enterprise Business Operations only when a buyer-specific quote, discount, contract, revenue-recognition, or margin decision is needed.

## Enterprise Scalability Operations Lane

Purpose: prepare enterprise capacity, tenant scale, queueing, observability, SLO readiness, incident/change operations, support load, global deployment, disaster recovery, and cost controls before scale commitments expand.

Primary surfaces:

- `/enterprise-scalability`
- `/api/enterprise-scalability`
- `/api/enterprise-scalability/brief`
- `/product`
- `/hub`
- `/service-reliability`
- `/operational-efficiency`
- `/client-onboarding`
- `/enterprise-business-ops`
- `/global-certification-readiness`
- `/deployment-profiles`
- `/boundary-resolution`

Rules:

- Enterprise Scalability Operations can expose capacity assumptions, tenant owners, queue/backpressure controls, SLO candidates, support-tier drafts, incident/change cadences, regional deployment questions, disaster recovery evidence needs, usage thresholds, and cost/margin controls.
- It must not claim contractual SLAs, uptime guarantees, managed service commitments, 24/7 production support staffing, SOC/MDR coverage, security certification, production hosting approval, data-residency approval, PHI authority, production connector approval, customer-specific tenancy approval, revenue guarantees, profit guarantees, or live clinical authority.
- SLO/SLA wording, response targets, support tiers, residency, DR, hosting, customer-specific tenant, and cost/margin commitments require qualified legal, security, privacy, finance, platform, and customer-authority review before external use.

## Platform Power Operations Lane

Purpose: strengthen SCRIMED's API, UI, and AI platform power through contract-backed APIs, role-based command surfaces, model-route readiness, agent approval, evaluation loops, evidence retrieval, accessibility readiness, and cost telemetry before external claims expand.

Primary surfaces:

- `/platform-power`
- `/api/platform-power`
- `/api/platform-power/brief`
- `/product`
- `/hub`
- `/navigation`
- `/agents`
- `/trust-os`
- `/continuous-review-audit`
- `/service-reliability`
- `/enterprise-scalability`
- `/boundary-resolution`

Rules:

- Platform Power Operations can expose API contract posture, route ownership, versioning, auth/scope boundaries, rate limits, idempotency, operator UI journeys, model-route registers, agent approval gates, eval/red-team loops, evidence retrieval, and platform cost controls.
- It must not claim public API SLA approval, production API marketplace launch, unlimited API scale, live autonomous AI authority, production model-routing approval, external LLM provider approval for PHI, autonomous protected tool execution, clinical validation, accessibility certification, security certification, PHI authority, EHR access, production connector approval, contractual uptime, managed service commitment, or trillion-dollar-company-equivalent capacity.
- API marketplace, SDK, model-route, live AI, accessibility, security, clinical, EHR, PHI, support, SLA, and scale-equivalence claims require qualified human or external review before buyer use.

## Limitations And Workaround Operations Lane

Purpose: convert blocked requests, unresolved limitations, repeated defects, and unsupported claims into safe workaround packets, escalation owners, proof routes, expiration rules, and graduation gates.

Primary surfaces:

- `/limitations-workarounds`
- `/api/limitations-workarounds`
- `/api/limitations-workarounds/brief`
- `/boundary-release-approvals`
- `/api/boundary-release-approvals`
- `/api/boundary-release-approvals/brief`
- `/product`
- `/hub`
- `/navigation`
- `/boundary-resolution`
- `/operational-efficiency`
- `/platform-power`
- `/client-onboarding`
- `/health-records`
- `/qa-claim-guard`

Rules:

- Limitations and Workaround Operations can expose issue tracks, workaround packets, boundary escalation matrix entries, escalation triggers, hard stops, blocked claims, review cadences, and graduation gates.
- Boundary Release Approval Matrix can expose the exact approval path, evidence artifacts, signoff lanes, owner routing, release hashes, and fail-closed decision for each preserved NO-GO boundary.
- It must not authorize PHI processing, live clinical care, production connectors, public API SLAs, autonomous remediation, live autonomous AI, production model routing, legal/accounting/tax advice, audited financial reporting, security certification, accessibility certification, regulatory approval, buyer release, public quantum capability claims, revenue guarantees, or profit-margin guarantees.
- PHI/live data, live clinical care, production connector, security certification, API/SLA/scale, autonomous agent action, legal/finance/investor, payer submission, EHR writeback, customer go-live, and regional/global approval requests must route through the Boundary Escalation Matrix and Boundary Release Approval Matrix before external language or execution expands.
- Repeated workarounds should graduate into smoke coverage, route inventory, Boundary Resolution records, Operational Efficiency sprints, Platform Power controls, Service Reliability controls, or protected AAL2 operator routines before buyer claims expand.

## Operational Efficiency Lane

Purpose: resolve recurring gaps, inefficiencies, bottlenecks, fault classes, hard stops, proof-route gaps, and execution drag across release, route, reliability, commercial, enterprise, audit, and boundary systems.

Primary surfaces:

- `/operational-efficiency`
- `/api/operational-efficiency`
- `/api/operational-efficiency/brief`
- `/product`
- `/hub`
- `/offerings`
- `/pilot-demo-commercial-readiness`
- `/navigation`
- `/release-continuity`
- `/service-reliability`
- `/enterprise-scalability`
- `/platform-power`
- `/limitations-workarounds`
- `/growth-engine`
- `/enterprise-business-ops`
- `/health-records`
- `/continuous-review-audit`
- `/boundary-resolution`

Rules:

- Operational Efficiency can expose gap records, open-bottleneck pressure, owners, hard stops, proof routes, discrepancy and fault triage items, resolution sprints, and execution metrics.
- It must not authorize autonomous production remediation, bypass AAL2, process PHI, approve live clinical care, certify security or compliance, provide legal/accounting/tax advice, approve production connectors, guarantee revenue, guarantee profit margin, approve buyer release, or replace qualified human review.
- Conflicting source signals should route through discrepancy and fault triage before release, buyer use, investor language, or protected proof references expand.
- Repeated defects should graduate into smoke coverage, route inventory, Service Reliability controls, Boundary Resolution records, or protected operator routines before public claims or buyer commitments expand.
- Packaging defects should graduate into `/offerings` so every recurring sales or delivery gap has a package, margin control, proof route, and retained boundary.
- Demo-to-pilot bottlenecks should route through `/pilot-demo-commercial-readiness` so every qualified buyer conversation has a recommended package, price band, proof list, no-PHI intake route, and retained hard stop.
- Health-record, connector, extraction, and patient-safety bottlenecks should route through `/health-records` before sandbox, PHI, writeback, payer, or clinical requests expand.
- API, UI, AI, model-route, agent-tool, accessibility, and scale-equivalence bottlenecks should route through `/platform-power` before external claims or buyer commitments expand.
- Blocked requests and repeated limitations should route through `/limitations-workarounds` so each safe path has a packet, owner, proof route, expiration rule, and graduation gate.
- Investor, clinic, capital, public-sector, partner, and audience-specific pitch bottlenecks should route through `/investor-audience-readiness` before external outreach, fundraising language, grant language, or diligence packets expand.

## Service Reliability Lane

Purpose: keep product/service controls, known fault classes, efficiency improvements, owners, proof routes, and retained approval boundaries in one hardening map.

Primary surfaces:

- `/service-reliability`
- `/api/service-reliability`
- `/api/service-reliability/brief`
- `/product`
- `/hub`
- `/navigation`
- `/release-continuity`
- `/operational-efficiency`

Rules:

- Service Reliability can expose barriers, mitigations, owners, proof routes, source alignment, open gates, and fault classes.
- It must not claim release approval, legal approval, HIPAA/SOC/FDA/ONC/security certification, PHI authority, public customer proof, reimbursement assurance, production connector approval, or live clinical care authority.
- Newly discovered faults or bottlenecks should be added here before buyer language or public release claims expand.

## Navigation Audit Lane

Purpose: keep the page route inventory, API route pattern count, persistent site navigation, role journeys, limitation controls, smoke coverage, protected fail-closed checks, and retained AAL2 or external-review bottlenecks in one operating map.

Primary surfaces:

- `/navigation`
- `/api/navigation-audit`
- `/api/navigation-audit/brief`
- `/product`
- `/hub`
- `/release-continuity`
- `/limitations-workarounds`

Rules:

- Navigation Audit can expose route groups, source counts, app-wide navigation sections, role-based journeys, limitation-control links, smoke scope, protected fail-closed posture, and known bottlenecks.
- It must not claim that every protected happy path has executed, bypass AAL2, store token values, store PHI, approve release, certify compliance, approve production connectors, or authorize live clinical care.
- Add new buyer-critical routes to the relevant navigation group and public smoke coverage before treating them as externally ready.
- Use `/limitations-workarounds` when a route exposes a blocked request, workaround packet, or retained gate that should stay visible across buyer, operator, and reviewer paths.

## Release Continuity Lane

Purpose: keep production deployment proof, source-control checkpoints, public smoke, protected fail-closed checks, and human AAL2 operator proof aligned after each release.

Primary surfaces:

- `/release-continuity`
- `/api/release-continuity`
- `/api/release-continuity/brief`
- `/product`
- `/pilot-workspace/access`
- `/buyer-release-control-run`

Rules:

- Release continuity can expose routes, commit/tag baselines, smoke status, gate counts, and operator workarounds.
- It must never expose bearer token values, long-lived secrets, CI credentials, PHI, signed approvals, raw audit logs, or sensitive customer artifacts.
- It cannot approve release, bypass AAL2, certify compliance, authorize PHI processing, grant legal approval, approve production connectors, guarantee reimbursement, or authorize live clinical care.
- Protected happy-path evidence must use the active browser AAL2 session or a deliberate short-lived operator token that is disposed of immediately after no-secret evidence is recorded.

## Protected Buyer Release Lane

Purpose: verify buyer-specific release readiness through AAL2-authenticated, no-PHI metadata checks.

Primary surfaces:

- `/pilot-workspace/access#buyer-release-control-verifier`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/packet`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/timeline`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/reconciliation`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/remediation`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/metadata-drafts`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/metadata-drafts/checklist`

Rules:

- Protected verifier reads may use the active browser session.
- Durable packet evidence must remain no-PHI and append-only audited.
- Release-control records can show readiness, blocked gates, next actions, and metadata templates.
- They cannot approve public sharing, create customer permission, store signed artifacts, store recipient lists, store raw logs, or bypass qualified human review.

## QA Evidence Lane

Purpose: turn human AAL2 synthetic QA runs into buyer-safe, no-secret evidence.

Primary surfaces:

- `/qa-run-control`
- `/qa-human-run-packet`
- `/qa-manual-execution-console`
- `/qa-aal2-run-evidence`
- `/qa-buyer-proof-release`
- `/api/qa-evidence/*`
- `/api/pilot-workspaces/{workspaceSlug}/qa-evidence/*`

Rules:

- QA evidence may reference workflow IDs, packet hashes, synthetic targets, audit event IDs, and no-secret attestations.
- QA evidence cannot store bearer tokens, credentials, PHI, live patient data, or production-system details.
- Buyer-proof language stays blocked until retained protected evidence is visible and human review is complete.

## Health Records Safety Exchange Lane

Purpose: prepare no-PHI health-record extraction, source attribution, standards mapping, patient-safety lint, and live-data workaround routing before any record workflow or connector expands.

Primary surfaces:

- `/health-records`
- `/api/health-records`
- `/api/health-records/brief`
- `/api/health-records/extract`
- `/interoperability`
- `/interoperability/evaluations`
- `/clinical-care-activation`
- `/boundary-resolution`

Rules:

- Health Records Safety Exchange can classify synthetic FHIR, HL7 v2, C-CDA, DICOM metadata, X12/prior-auth, CSV, and note-like fixtures into extraction plans, missing-field registers, safety checks, and reviewer packets.
- It must reject PHI, patient identifiers, payer member data, production endpoints, credentials, source medical records, patient matching, diagnosis, treatment, emergency triage, prescribing, patient outreach, payer submission, EHR writeback, record mutation, and production sync requests.
- Live record exchange requires signed BAA/DPA or non-PHI determination, customer sandbox approval, privacy/security/legal review, clinical governance, consent and purpose-of-use controls, durable audit, monitoring, rollback, and customer go-live approval.

## Clinical Authority Lane

Purpose: prepare external authority evidence and owner routing before any future regulated or live-care posture.

Primary surfaces:

- `/clinical-authority-readiness`
- `/pilot-workspace/access#clinical-authority-evidence-room`
- `/pilot-workspace/access#clinical-authority-owner-matrix`
- `/pilot-workspace/access#clinical-authority-artifact-intake`
- `/pilot-workspace/access#authority-artifact-references`

Rules:

- This lane tracks readiness only.
- It does not store sensitive artifacts, signed approvals, legal opinions, privacy opinions, security reports, PHI, or production credentials.
- External counsel, qualified reviewers, buyer approvals, and applicable regulatory pathways remain outside the product until formally retained.

## Approvals Readiness Lane

Purpose: organize the operating path toward public claims control, HIPAA/BAA readiness, SOC 2/HITRUST assurance, FDA/CDS/SaMD classification, ONC/interoperability acceptance, state care-delivery review, and buyer-specific release gates.

Primary surfaces:

- `/approvals-readiness`
- `/api/approvals-readiness`
- `/api/approvals-readiness/brief`
- `/claims`
- `/boundary-resolution`
- `/clinical-authority-readiness`
- `/buyer-release-control-run`

Rules:

- Approvals Readiness can say what evidence is needed, who owns it, what workaround is safe, and what remains blocked.
- It cannot claim legal approval, HIPAA certification, SOC 2 certification, HITRUST certification, FDA clearance, ONC certification, reimbursement certainty, PHI authority, production connector approval, or live clinical authority.
- Approval-aware agents may classify, route, draft, and reconcile evidence; named humans and external reviewers retain authority.

## Global Certification Readiness Lane

Purpose: prepare domestic and global approval, privacy, security, AI governance, medical-device, clinical-safety, cyber, procurement, and regional buyer evidence before SCRIMED expands into production healthcare operation.

Primary surfaces:

- `/global-certification-readiness`
- `/api/global-certification-readiness`
- `/api/global-certification-readiness/brief`
- `/approvals-readiness`
- `/global-reach`
- `/deployment-profiles`
- `/trust-center`

Rules:

- Global Certification Readiness can map official-source expectations, evidence artifacts, owners, gates, proof routes, regional buyer packs, roadmap phases, and blocked certification claims.
- It cannot claim legal advice, HIPAA compliance certification, SOC 2/HITRUST/ISO certification, FDA clearance, ONC certification, EU AI Act conformity, GDPR compliance assurance, NHS approval, MHRA approval, Australian cyber certification, PHI authority, public-sector procurement approval, reimbursement assurance, production authorization, or live clinical authority.
- Regional deployment, clinical-device, privacy-transfer, security-audit, and public-sector claims require qualified counsel, external auditors, regulators, buyers, or certification bodies before sales language can expand.

## Continuous Review, Audit, and Innovation Lane

Purpose: run 24/7 agent-assisted review, evidence checks, error reduction, incident learning, and internal future research without granting autonomous authority.

Primary surfaces:

- `/continuous-review-audit`
- `/api/continuous-review-audit`
- `/api/continuous-review-audit/brief`
- `/trust-safety-operations`
- `/qa-evidence`
- `/source-intelligence`
- `/global-certification-readiness`

Rules:

- Continuous Review and Audit can expose agents, loops, controls, evidence routes, sources, blocked claims, and internal research assignments.
- It must not claim managed 24/7 SOC/MDR coverage, autonomous production remediation, legal advice, security certification, regulatory approval, PHI processing authority, clinical care authority, product commitment, investment advice, or permission to bypass human review.
- Quantum-safe and post-quantum work remains internal research until security owners, external reviewers, vendor evidence, and claim guards approve any public posture.
- Repeated defects should become deterministic smoke assertions, owner tasks, retained evidence, or blocked-claim updates before buyer language expands.

## Agent And Workflow Lane

Purpose: keep agent execution synthetic, governed, audited, and human-reviewed.

Primary surfaces:

- `/agents`
- `/agent-workspace`
- `/workflows`
- `/evaluation`
- `/trust-os`
- `/memory`
- `/audit`
- `/observability`

Rules:

- Agent tasks remain synthetic or enterprise-assessment scoped.
- Agents cannot mutate medical records, submit payer actions, contact patients, provide autonomous diagnosis or treatment guidance, or execute production connectors.
- New agent capabilities should define blocked actions, human checkpoints, audit events, and packet evidence before UI exposure.

## Cleanup And Quality Lane

Purpose: keep the working tree inspectable and prevent generated artifacts from corrupting checks.

Commands:

- `node scripts/clean-generated-cache.mjs`
- `node scripts/check-generated-integrity.mjs`
- `node node_modules/typescript/bin/tsc --noEmit`
- `node node_modules/eslint/bin/eslint.js .`
- `node scripts/public-production-smoke.mjs`

Rules:

- `.next`, `.next-quarantine-*`, `node_modules`, `.tools`, `.vercel`, and `*.tsbuildinfo` are disposable local/generated state.
- Generated artifact cleanup must not delete source routes, docs, migrations, or scripts.
- Typecheck, lint, and public smoke should pass before deployment or buyer-demo handoff.
