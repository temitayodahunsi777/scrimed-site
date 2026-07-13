# SCRIMED Clinical Data Fabric

Updated: 2026-07-03

## Status

SCRIMED Clinical Data Fabric is a no-live-PHI control plane for healthcare source contracts, semantic normalization, provenance, governance, and health-graph projection rules.

Routes:

- API: `/api/clinical-data-fabric`
- Brief: `/api/clinical-data-fabric/brief`
- OS section: `/healthcare-intelligence-os#clinical-data-fabric`

## Scope

The layer defines governed source contracts for FHIR, HL7 v2, DICOM/DICOMweb, X12, C-CDA/CCD, clinical documents, pharmacy feeds, medical devices, wearables, pathology, genomics, scheduling, portals, and patient-access context.

It maps approved source concepts into canonical healthcare entities such as patients, providers, organizations, facilities, medications, conditions, encounters, claims, images, lab results, procedures, devices, care plans, social determinants, genomic findings, research studies, observations, documents, coverage, appointments, consent, and audit events.

## Semantic Layer

Agents may request governed semantic concepts only. They do not receive raw database schemas, raw connector payloads, credentials, unrestricted source queries, or direct system-of-record access.

Semantic mappings must preserve:

- terminology systems and versions
- profile or message evidence
- source provenance and lineage
- confidence inputs
- review state
- blocked autonomous actions

## Health Graph Contract

The health graph control plane defines node and edge contracts for relationships including:

- `treated_by`
- `diagnosed_with`
- `prescribed`
- `performed_at`
- `associated_with`
- `contraindicated`
- `member_of`
- `derived_from`
- `supports`
- `references`

Every graph projection must retain tenant scope, source system, source artifact, timestamp, confidence, review state, data class, purpose of use, retention policy, residency policy, and minimum-necessary tags.

## Governance Controls

Required controls include tenant-scoped identity, RBAC and ABAC, purpose-of-use checks, consent policy checks, PHI classification, minimum-necessary field policy, terminology-version capture, provenance and lineage capture, immutable audit events, human review for clinical or payer-impacting output, production connector approval gates, retention and deletion policy, data residency policy, and incident response routing.

## Blocked Claims

This layer does not authorize live PHI ingestion, production connector approval, EHR writeback, payer submission, patient outreach, autonomous diagnosis, autonomous treatment, autonomous prescribing, imaging interpretation, clinical validation claims, certification claims, or customer go-live approval.

## Operating Rule

Use Clinical Data Fabric before any SCRIMED agent, workflow, or integration path requests healthcare context. It is the control-plane contract for future approved customer environments, not a live source-system connector.
