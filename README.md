# SCRIMED AI Platform

SCRIMED is an AI-driven healthcare intelligence platform designed to support clinical decision-making, workflow automation, and population health insights through advanced artificial intelligence systems.

Official website: https://www.scrimedsolutions.com

The mission of SCRIMED is to help modernize healthcare operations, improve patient outcomes, and reduce systemic inefficiencies by building trustworthy, scalable AI infrastructure for the healthcare ecosystem.

Current product boundary: this repository presents SCRIMED as a governed synthetic pilot and enterprise evaluation product. It does not execute live clinical care, autonomous diagnosis, payer submission, patient outreach, or production medical-record workflows.

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

- AI agent architecture
- SCRIMED AgentOS v1 multi-agent orchestration
- SCRIMED Atlas Intelligence Core v1
- Trust Cards, evidence attribution, and TrustQA checks
- memory fabric, audit surfaces, and observability dashboards
- enterprise pilot intake and CRM-ready buyer handoff
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

---

## Repository Purpose

This repository serves as part of the SCRIMED development environment and will contain components related to the SCRIMED web platform and supporting infrastructure.

Additional repositories and modules will be added as the SCRIMED platform expands.

---

## Enterprise Pilot Intake

SCRIMED now includes a governed buyer-intake surface at `/pilot` and a validated API endpoint at `/api/pilot/intake`.

The intake captures business-contact information, buyer segment, target workflows, readiness needs, governance requirements, timeline, interoperability context, and pilot goals. It explicitly rejects protected health information, patient identifiers, live clinical records, diagnosis details, payer member identifiers, and production clinical data.

If `SCRIMED_PILOT_INTAKE_WEBHOOK_URL` is configured in Vercel, the API forwards a sanitized CRM-ready handoff payload to the configured HubSpot, Wix, Zapier/Make, or secure CRM webhook. Without that variable, the endpoint returns a manual CRM-ready handoff packet.

---

## AgentOS and Atlas Core Routes

Core enterprise evaluation surfaces:

- `/agents` - SCRIMED AgentOS v1 control plane, service registry, and governance controls
- `/pricing` - pricing tiers, sales motion, value metrics, and commercial guardrails
- `/evaluation` - interactive AgentOS synthetic evaluation workspace
- `/workflows` - workflow engine and sandbox runtime
- `/memory` - session, operational, and knowledge memory fabric
- `/audit` - audit channels, AI Asset Registry, and approval checkpoints
- `/trust` - TrustQA, Trust Cards, and evidence governance
- `/observability` - continuous validation and operational metrics
- `/atlas` - Atlas Intelligence Core v1 subsystems

Core APIs:

- `/api/agent-os`
- `/api/commercial/pricing`
- `/api/agent-os/evaluation`
- `/api/agent-os/tasks`
- `/api/atlas/intelligence-core`
- `/api/memory`
- `/api/audit`
- `/api/trust/cards`
- `/api/observability`

The task-planning API accepts synthetic pilot and enterprise assessment requests only. Production requests are explicitly denied until tenant identity, live connector controls, durable audit logging, privacy/security review, business associate agreement readiness, and human approval controls are approved.

Recommended buyer path: keep the official Wix site at `scrimedsolutions.com`, link product CTAs to `app.scrimedsolutions.com`, and route buyers into `/product`, `/pricing`, `/evaluation`, and `/pilot` without requiring buyers to have Vercel accounts.

---

## Vision for the Future

The long-term vision for SCRIMED is to become a foundational healthcare intelligence platform capable of supporting hospitals, healthcare systems, insurers, and global health initiatives with scalable, trustworthy AI systems.

---

## Founder

Temitayo Dahunsi  
Founder, SCRIMED Solutions

Atlanta, Georgia
