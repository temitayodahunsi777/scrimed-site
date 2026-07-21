#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const files = {
  registry: "app/lib/clinicalDataFabric.ts",
  route: "app/api/clinical-data-fabric/route.ts",
  briefRoute: "app/api/clinical-data-fabric/brief/route.ts",
  os: "app/lib/healthcareIntelligenceOS.ts",
  page: "app/healthcare-intelligence-os/page.tsx",
  hub: "app/lib/scrimedHub.ts",
  navigation: "app/lib/navigationAudit.ts",
  docs: "docs/clinical-data-fabric.md",
  healthcareDocs: "docs/healthcare-intelligence-os.md",
  architectureDocs: "docs/architecture.md",
  readme: "README.md",
  packageJson: "package.json",
  nonsecretSuite: "scripts/scrimed-nonsecret-test-suite.mjs"
};

async function read(path) {
  return readFile(path, "utf8");
}

function requireIncludes(label, text, expected) {
  const missing = expected.filter((value) => !text.includes(value));

  if (missing.length > 0) {
    throw new Error(`${label} missing required text: ${missing.join(", ")}`);
  }
}

function requireNotIncludes(label, text, forbidden) {
  const found = forbidden.filter((value) => text.includes(value));

  if (found.length > 0) {
    throw new Error(`${label} contains forbidden text: ${found.join(", ")}`);
  }
}

function countOccurrences(text, token) {
  return text.split(token).length - 1;
}

const contents = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await read(path)]))
);

requireIncludes("clinical data fabric registry", contents.registry, [
  "ClinicalDataFabricSummary",
  "clinical-data-fabric-control-plane-ready-no-phi",
  "validationChecks.every((check) => check.passed) ? \"passed\" : \"failed\"",
  "event.requiredReview.toLowerCase().includes(\"review\")",
  "/healthcare-intelligence-os#clinical-data-fabric",
  "/api/clinical-data-fabric",
  "/api/clinical-data-fabric/brief",
  "no-live-phi-control-plane",
  "not-production-connector-approved",
  "not-authorized-live-care",
  "semantic-layer-only-no-raw-schema-access",
  "blocked-pending-customer-authorization",
  "FHIR R4",
  "US Core",
  "USCDI",
  "SMART on FHIR",
  "HL7 v2 ADT",
  "DICOMweb",
  "X12 270/271",
  "X12 278",
  "X12 837",
  "X12 835",
  "C-CDA",
  "CCD",
  "RxNorm",
  "NCPDP SCRIPT",
  "LOINC",
  "SNOMED CT",
  "ICD-10-CM",
  "CPT",
  "HCPCS",
  "UCUM",
  "ISO/IEEE 11073",
  "HGVS",
  "treated_by",
  "diagnosed_with",
  "prescribed",
  "performed_at",
  "associated_with",
  "contraindicated",
  "member_of",
  "derived_from",
  "supports",
  "references",
  "tenant-scoped identity",
  "RBAC and ABAC",
  "purpose-of-use check",
  "consent policy check",
  "PHI classification",
  "immutable audit event",
  "live PHI ingestion enabled",
  "production connector approved",
  "EHR writeback authorized",
  "payer submission authorized",
  "patient outreach authorized",
  "autonomous diagnosis authorized",
  "autonomous treatment authorized",
  "autonomous prescribing authorized"
]);

requireNotIncludes("clinical data fabric registry", contents.registry, [
  "service_role",
  "SCRIMED_BEARER_TOKEN",
  "sk-",
  "Authorization: Bearer"
]);

if (countOccurrences(contents.registry, "id: \"") < 13) {
  throw new Error("clinical data fabric registry expected source, workflow, and event identifiers.");
}

requireIncludes("clinical data fabric API route", contents.route, [
  "evaluateScrimedSafetyGate",
  "scrimedSafetyHeaders",
  "getClinicalDataFabricSummary",
  "clinical-data-fabric-blocked",
  "X-SCRIMED-Clinical-Data-Fabric",
  "X-SCRIMED-Data-Boundary",
  "X-SCRIMED-Connector-Authority",
  "X-SCRIMED-Agent-Data-Authority",
  "X-SCRIMED-Live-Ingestion-Authority",
  "private, no-store"
]);

requireIncludes("clinical data fabric brief route", contents.briefRoute, [
  "buildClinicalDataFabricBrief",
  "scrimed-clinical-data-fabric.md",
  "text/markdown",
  "evaluateScrimedSafetyGate",
  "X-SCRIMED-Clinical-Data-Fabric"
]);

requireIncludes("healthcare intelligence OS integration", contents.os, [
  "getClinicalDataFabricSummary",
  "clinicalDataFabric",
  "sourceContractCount",
  "semanticMappingCount",
  "graphEdgeCount",
  "Clinical Data Fabric",
  "Clinical Data Fabric API",
  "Clinical Data Fabric Brief"
]);

requireIncludes("healthcare intelligence OS page integration", contents.page, [
  "summary.clinicalDataFabric",
  "id=\"clinical-data-fabric\"",
  "Clinical Data Fabric",
  "/api/clinical-data-fabric"
]);

requireIncludes("hub route registry", contents.hub, [
  "clinicalDataFabricRoute",
  "clinicalDataFabricApiRoute",
  "clinicalDataFabricBriefRoute"
]);

requireIncludes("navigation audit", contents.navigation, [
  "expectedApiRoutePatternCount = 443"
]);

requireIncludes("clinical data fabric docs", contents.docs, [
  "SCRIMED Clinical Data Fabric",
  "/api/clinical-data-fabric",
  "/api/clinical-data-fabric/brief",
  "no-live-PHI control plane",
  "FHIR",
  "HL7 v2",
  "DICOM",
  "X12",
  "Semantic Layer",
  "Health Graph Contract",
  "Governance Controls",
  "Blocked Claims"
]);

requireIncludes("healthcare intelligence docs", contents.healthcareDocs, [
  "Clinical Data Fabric API",
  "Clinical Data Fabric Brief",
  "docs/clinical-data-fabric.md"
]);

requireIncludes("architecture docs", contents.architectureDocs, [
  "Clinical Data Fabric control plane",
  "/api/clinical-data-fabric",
  "/api/clinical-data-fabric/brief"
]);

requireIncludes("readme", contents.readme, [
  "Clinical Data Fabric boundary",
  "/api/clinical-data-fabric",
  "/api/clinical-data-fabric/brief"
]);

requireIncludes("package scripts", contents.packageJson, [
  "\"smoke:clinical-data-fabric\": \"node scripts/clinical-data-fabric-contract-check.mjs\""
]);

requireIncludes("nonsecret suite", contents.nonsecretSuite, [
  "clinical data fabric contract",
  "scripts/clinical-data-fabric-contract-check.mjs"
]);

console.log("pass clinical data fabric contract");
