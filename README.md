# SCRIMED AI Platform

SCRIMED is an AI-driven healthcare intelligence platform designed to support clinical decision-making, workflow automation, and population health insights through advanced artificial intelligence systems.

Official website: https://www.scrimedsolutions.com

The mission of SCRIMED is to help modernize healthcare operations, improve patient outcomes, and reduce systemic inefficiencies by building trustworthy, scalable AI infrastructure for the healthcare ecosystem.

Current product boundary: this repository presents SCRIMED as a governed synthetic pilot and enterprise evaluation product. It does not execute live clinical care, autonomous diagnosis, payer submission, patient outreach, or production medical-record workflows.

Enterprise readiness boundary: `/trust-center` and `/claims` expose accountable legal, security, privacy, brand, governance, marketing, PR, sales, advertising, and claims-control readiness. These surfaces are operational registers, not legal advice, certification, regulatory approval, or authorization for live clinical execution.

Protected release governance: `/pilot-workspace/access` includes no-PHI finance methodology, external approval evidence, release decisions, named reviewer sign-offs, disabled distribution lockbox, release authority attestation controls, evidence-room recipient/access-log/provider-adapter controls, provider security review readiness, procurement evidence routing, the Protected Clinical Authority Evidence Room, and the Protected Clinical Authority Owner Matrix. These controls produce audited synthetic pilot evidence only and do not authorize public release, external distribution, legal claims, customer proof, advertising claims, security approval, procurement approval, BAA/DPA execution, production use, live integration, PHI processing, or clinical care.

Global reach boundary: `/global-reach`, `/api/global-reach`, and `/api/global-reach/brief` expose region focus, buyer localization packs, partner channels, procurement questions, competitive edge, and contained boundary workarounds for global expansion. This is localization and go-to-market readiness only. It is not legal advice, regional regulatory approval, public-sector procurement approval, compliance certification, reimbursement assurance, production authorization, or live clinical execution authority.

Clinical authority boundary: `/clinical-authority-readiness`, `/api/clinical-authority-readiness`, `/api/clinical-authority-readiness/brief`, `/pilot-workspace/access#clinical-authority-evidence-room`, `/pilot-workspace/access#clinical-authority-owner-matrix`, `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room`, `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room/packet`, `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix`, and `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix/packet` expose hard-gate preparation and protected no-PHI evidence and owner routing for live clinical care authority, PHI processing, legal approval, regional regulatory approval, reimbursement review, security certification, connector acceptance, and production clinical authorization. This is readiness only. It is not legal advice, privacy advice, reimbursement advice, security certification, clinical validation, regional regulatory approval, PHI processing authority, production authorization, or live clinical-care authority.

---

## Core Vision

Healthcare systems today operate with fragmented data, administrative overload, and limited decision support. SCRIMED aims to serve as an intelligence layer that sits above existing healthcare infrastructure and enables organizations to:

- Improve clinical decision support
- Automate operational workflows
- Enhance healthcare accessibility
- Reduce administrative burden on clinicians
- Improve transparency in healthcare costs and care pathways

---

## Platform Architecture

SCRIMED is being designed as a modular AI platform consisting of several core components:

### Clinical Copilot
AI-assisted support for clinicians that helps summarize patient data, generate insights, and assist with documentation.

### DocuTwin
Automated medical documentation generation from structured and conversational inputs.

### CarePath AI
Patient intake, triage support, and care navigation optimization.

### TrialCore
AI-assisted clinical trial discovery and patient matching.

### TrustWatch (Watchtower)
Continuous post-deployment monitoring system designed to detect AI performance regressions, model drift, trust signals, and system reliability across healthcare workflows.

### SCRIMED AgentOS
Governed multi-agent orchestration layer with planner, router, specialist registry, memory fabric, TrustQA verification, audit logging, human approval checkpoints, RBAC posture, MCP connector framework, sandbox runtime, and task-planning endpoints.

### SCRIMED Atlas Intelligence Core
Enterprise intelligence layer for structural document understanding, evidence-backed reasoning, Trust Cards, agent sandbox posture, continuous validation, AI asset governance, shadow-AI detection, and reimbursement-aware operating design.

### SCRIMED Interoperability Control Plane
Standards-aware connector governance for FHIR, SMART App Launch, HL7 v2, DICOM/DICOMweb, X12, C-CDA, IHE profiles, NCPDP SCRIPT, ISO/IEEE 11073, and clinical terminology. The control plane binds standards to synthetic connector contracts, conformance evidence, required controls, and explicit pre-live gates.

---

## Watchtower Monitoring System

SCRIMED includes a continuous regression monitoring system designed for healthcare-grade AI systems. The Watchtower system monitors:

- workflow performance
- AI output consistency
- trust and safety signals
- latency and cost metrics
- deployment scorecards
- approval patterns and system drift

This enables early detection of regressions and operational risks before they impact healthcare delivery.

---

## Development Status

SCRIMED is currently under active development. The platform is being designed and iterated through AI-assisted development workflows and modern engineering tooling.

Current focus areas include:

- buyer-ready product demos and structured pilot programs
- AI agent architecture
- SCRIMED AgentOS v1 multi-agent orchestration
- SCRIMED Atlas Intelligence Core v1
- Trust Cards, evidence attribution, and TrustQA checks
- memory fabric, audit surfaces, and observability dashboards
- enterprise pilot intake and CRM-ready buyer handoff
- tenant-admin sales opportunity operations with audited proposals and controlled CRM synchronization
- synthetic workflow execution readiness
- deterministic workflow execution result fixtures
- workflow result validation and synthetic-only promotion review
- governed execution API contracts
- identity and access readiness
- execution-attempt readiness
- runtime safety readiness
- product console and commercial pilot packaging
- governed synthetic pilot request capture at `/pilot` and `/api/pilot/intake`
- deny-by-default governed execution endpoints
- denied execution audit boundaries
- audit persistence readiness
- clinical workflow automation
- healthcare data interoperability
- fixture change review and quality gates
- safety and governance infrastructure
- deployment monitoring systems
- public-market claim controls with external approval evidence, versioned release decisions, named reviewer sign-off metadata packets, disabled distribution lockbox controls, release authority attestations, metadata-only evidence-room recipient attestations, access-log reconciliation, provider-adapter contract readiness, provider security review readiness, and procurement evidence routing
- global partner and buyer localization with region packs, audience packs, partner channels, procurement questions, competitive edge, and retained legal/privacy/clinical gates
- clinical authority readiness with hard-gate preparation for live care, PHI, legal approval, regional approval, reimbursement, security certification, connectors, and production authorization
- protected clinical authority evidence rooms with AAL2 no-PHI reviewer owners, retained authority gates, expiration posture, audit history, and audited authority evidence packets
- protected clinical authority owner matrices with customer, SCRIMED, and qualified external approver routing for every hard gate

---

## Repository Purpose

This repository serves as part of the SCRIMED development environment and will contain components related to the SCRIMED web platform and supporting infrastructure.

Additional repositories and modules will be added as the SCRIMED platform expands.

---

## Enterprise Pilot Intake

SCRIMED now includes a governed buyer-intake surface at `/pilot` and a validated API endpoint at `/api/pilot/intake`.

The intake captures business-contact information, buyer segment, target workflows, readiness needs, governance requirements, timeline, interoperability context, and pilot goals. It explicitly rejects protected health information, patient identifiers, live clinical records, diagnosis details, payer member identifiers, and production clinical data.

Validated intake is retained in a private, token-gated Supabase ledger before follow-up. If `SCRIMED_PILOT_INTAKE_WEBHOOK_URL` is configured in Vercel, the API also forwards the sanitized handoff payload to the configured HubSpot, Wix, Zapier/Make, or secure CRM webhook. The API does not report an intake as accepted unless a durable destination accepted it.

Approved SCRIMED tenant-admins manage retained intake at `/sales-operations`. The console supports AAL2 passwordless access, opportunity assignment, due-action cadence, audited non-binding proposal downloads, vendor-neutral CRM imports, optional webhook synchronization, human-reviewed follow-up drafts, audited assessment invitations, and an append-only sales audit trail. Direct access to private lead and audit tables remains denied.

## Demo and Pilot Center

SCRIMED now packages existing executable proof into buyer-ready product and service paths:

- `/demos` and `/api/demos` expose five governed product demos for CarePath AI, DocuTwin, TrialCore, Atlas interoperability readiness, and AgentOS governance evaluation.
- `/pilots` and `/api/pilots` expose four structured enterprise programs with duration, engagement model, deliverables, buyer inputs, success metrics, governance gates, and production exclusions.
- `/demos/[slug]`, `/api/demos/[slug]`, `/pilots/[slug]`, and `/api/pilots/[slug]` expose detailed proof and program packets.
- `/api/demos/[slug]/brief` and `/api/pilots/[slug]/proposal` generate downloadable buyer-ready demo briefs and non-binding pilot proposals.

All demos and programs preserve the synthetic evaluation boundary. They do not authorize live clinical execution, production data exchange, autonomous diagnosis, payer submission, or patient outreach.

---

## AgentOS and Atlas Core Routes

Core enterprise evaluation surfaces:

- `/agents` - SCRIMED AgentOS v1 control plane, service registry, and governance controls
- `/sales-operations` - AAL2 tenant-admin opportunity pipeline, cadence control, audited commercial artifacts, assessment scheduling, and vendor-neutral CRM handoff
- `/demos` - executable buyer demos with guided proof paths and retained production exclusions
- `/pilots` - structured sellable programs with measurable decision criteria and governance gates
- `/pricing` - pricing tiers, sales motion, value metrics, and commercial guardrails
- `/clinical-authority-readiness` - hard-gate readiness for live clinical care authority, PHI, legal approval, regional approval, reimbursement, security certification, connectors, and production clinical authorization
- `/pilot-workspace/access#clinical-authority-evidence-room` - AAL2 protected no-PHI clinical authority evidence assembly for reviewer owners, retained gates, audit history, expiration posture, and readiness packet export
- `/pilot-workspace/access#clinical-authority-owner-matrix` - AAL2 protected no-PHI approver routing for customer, SCRIMED, and qualified external authority owners
- `/global-reach` - region focus, buyer localization packs, partner channels, procurement questions, and retained approval gates
- `/operations` - company operations readiness, blockers, owners, fallbacks, and buyer route checklist
- `/trust-center` - enterprise readiness domains, owners, evidence, required actions, launch gates, and external-review requirements
- `/claims` - approved, evidence-required, and prohibited public claims
- `/evaluation` - interactive AgentOS synthetic evaluation workspace
- `/trust-os` - executable synthetic governance decisions with PHI Shield, Agent Firewall, Clinical Guardian, model routing, explainability, and Clinical Trace
- `/workflows` - workflow engine and sandbox runtime
- `/memory` - session, operational, and knowledge memory fabric
- `/audit` - audit channels, AI Asset Registry, and approval checkpoints
- `/trust` - TrustQA, Trust Cards, and evidence governance
- `/observability` - continuous validation and operational metrics
- `/atlas` - Atlas Intelligence Core v1 subsystems
- `/interoperability` - standards registry, conformance controls, terminology resolution, and connector bindings
- `/interoperability/evaluations` - executable FHIR R4 and US Core, SMART App Launch, and DICOMweb synthetic conformance test kits
- `/integrations` - standards-bound connector contracts and synthetic fixture validation

Core APIs:

- `/api/agent-os`
- `/api/demos`
- `/api/pilots`
- `/api/commercial/pricing`
- `/api/clinical-authority-readiness`
- `/api/clinical-authority-readiness/brief`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room/packet`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix`
- `/api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix/packet`
- `/api/global-reach`
- `/api/global-reach/brief`
- `/api/operations/readiness`
- `/api/enterprise-readiness`
- `/api/enterprise-readiness/claims`
- `/api/enterprise-readiness/diligence-brief`
- `/api/agent-os/evaluation`
- `/api/trust-os`
- `/api/trust-os/evaluate`
- `/api/agent-os/tasks`
- `/api/atlas/intelligence-core`
- `/api/memory`
- `/api/audit`
- `/api/trust/cards`
- `/api/observability`
- `/api/interoperability/standards`
- `/api/interoperability/conformance`
- `/api/interoperability/evaluations`

The task-planning API accepts synthetic pilot and enterprise assessment requests only. Production requests are explicitly denied until tenant identity, live connector controls, durable audit logging, privacy/security review, business associate agreement readiness, and human approval controls are approved.

Interoperability evaluations execute deterministic checks against synthetic fixtures and connector contracts while retaining exact live-use blockers. A synthetic pass does not mean a live connector is implemented, certified, trading-partner approved, or authorized to exchange production healthcare data.

Recommended buyer path: keep the official Wix site at `scrimedsolutions.com`, link product CTAs to `app.scrimedsolutions.com`, and route buyers into `/product`, `/pricing`, `/evaluation`, and `/pilot` without requiring buyers to have Vercel accounts.

Current go-live blockers and manual actions are tracked in `/operations`: the public-versus-protected route policy remains open. GitHub push authentication, Wix CTA routing, `app.scrimedsolutions.com`, local package-manager verification, and Vercel Git deployment are working.

The Product Console and readiness brief also include operations readiness so buyer, investor, and operator reviews see launch blockers, owners, fallback paths, and remaining manual actions in one place.

Protected pilot workspaces now include metadata-only evidence-room access-log reconciliation, provider-adapter contract readiness, provider security review readiness, procurement evidence routing, Protected Clinical Authority Evidence Room assembly, and Protected Clinical Authority Owner Matrix routing. This gives SCRIMED a buyer/investor diligence path for externally retained access logs, provider contract references, audit-log import stubs, security/procurement review metadata, clinical authority readiness packets, and customer-specific approver routing while keeping raw logs, recipient identifiers, provider credentials, URLs, tokens, signed approvals, legal opinions, sensitive artifacts, PHI, export approval, live integration approval, and live clinical execution outside the product boundary.

---

## Vision for the Future

The long-term vision for SCRIMED is to become a foundational healthcare intelligence platform capable of supporting hospitals, healthcare systems, insurers, and global health initiatives with scalable, trustworthy AI systems.

---

## Founder

Temitayo Dahunsi  
Founder, SCRIMED Solutions

Atlanta, Georgia
