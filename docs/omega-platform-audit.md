# SCRIMED Omega Platform Audit

SCRIMED Omega Platform Audit exposes `/omega-audit`, `/api/omega-audit`, and `/api/omega-audit/brief` as the complete platform audit and upgrade control plane.

Updated: 2026-06-29

## Purpose

Omega discovers and tracks SCRIMED products, modules, services, APIs, agents, workflows, UI surfaces, backend processes, and infrastructure components. It audits each product across the required 12 lenses:

- architecture
- technical-debt
- performance
- security
- clinical-safety
- accessibility
- scalability
- maintainability
- reliability
- user-experience
- developer-experience
- compliance

## Product Coverage

Omega currently tracks SCRIMED OS, Sanar AI, MyVitals AI, DocuTwin, Ambient Scribe, CareExplain, Perfect Chart, Clinical Copilot, Contact Center AI, Patient Education, TrialCore, OncoID, Trust Engine, Trust Dashboard, Clinical Intelligence Platform, Imaging Platform, Referral Intelligence, Prior Authorization, Revenue Cycle, Payer Intelligence, Population Health, Clinical Research, Provider Dashboard, Executive Dashboard, Admin Console, Patient Portal, SCRIMED University, Atlas Platform, Mobile Applications, Agent Marketplace, and Internal Operations Platform.

## Upgrade Lanes

- Clinical Robustness Lab
- Agent Runtime and MCP Gateway
- Private and Edge AI Architecture
- Payer, Referral, and Revenue Engine
- Observability and Progressive Delivery
- Enterprise Infrastructure, IaC, and Disaster Recovery

## Operating Boundary

Omega is no-PHI, no-live-care, and readiness-only. It does not authorize PHI processing, live clinical care, autonomous diagnosis, autonomous treatment, autonomous prescribing, autonomous billing, payer submission, EHR writeback, production connector activation, public API SLA, legal advice, accounting advice, tax advice, audited financial reporting, securities material, regulatory approval, HIPAA certification, SOC 2 certification, HITRUST certification, FDA clearance, ONC certification, security certification, accessibility certification, or buyer release.

## Verification

Use `npm run smoke:omega-audit` to verify:

- Omega source exists
- page, API, and brief routes exist
- all named products are represented
- all 12 audit lenses are represented
- no-authority safety headers are present
- navigation exposes `/omega-audit`
- the nonsecret test suite includes the Omega contract check

Use `npm run test:nonsecret` before deploy to include Omega in the SCRIMED nonsecret validation suite.
