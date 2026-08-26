#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedProofPacketStudio.ts",
  "app/lib/proofPacketShareReadiness.ts",
  "app/api/scrimed-proof-packet-studio/route.ts",
  "app/api/scrimed-proof-packet-studio/[packetId]/brief/route.ts",
  "app/api/scrimed-proof-packet-studio/share-readiness/route.ts",
  "app/scrimed-proof-packet-studio/page.tsx",
  "app/scrimed-proof-packet-studio/ProofPacketShareReadinessWorkbench.tsx",
  "docs/scrimed-proof-packet-studio.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "app/lib/siteNavigation.ts",
  "app/lib/navigationAudit.ts",
  "scripts/public-production-smoke.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} missing required SCRIMED Proof Packet Studio text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedProofPacketStudio.ts"];

for (const expected of [
  "ProofPacketShareReadinessInput",
  "ProofPacketShareReadinessAssessment",
  "READY_FOR_PROTECTED_INTAKE",
  "validateProofPacketShareReadinessInput",
  "assessProofPacketShareReadiness",
  "protectedRequiredReviewerRoles",
  "ProtectedDistributionAudience",
  "ProtectedDistributionChannelControl",
  "externalDistributionAuthorized: false",
  "investorSolicitationAuthorized: false",
  "customerPermissionCreated: false",
  "productionReleaseAuthorized: false",
  "phiAuthorized: false",
  "liveClinicalExecutionAuthorized: false",
  "Unexpected fields are not accepted",
  "lockboxRecordCreated: false",
  "sha256"
]) {
  requireIncludes(
    "app/lib/proofPacketShareReadiness.ts",
    files["app/lib/proofPacketShareReadiness.ts"],
    expected
  );
}

for (const expected of [
  "scrimed-proof-packet-studio-active-synthetic-no-phi",
  "ScrimedProofPacketManifest",
  "ScrimedProofPacketArtifact",
  "ScrimedProofPacketStudioScorecard",
  "investor_pitch_packet",
  "buyer_demo_packet",
  "pilot_scope_packet",
  "partner_implementation_packet",
  "internal_execution_packet",
  "strategic_partner_packet",
  "enterprise_buyer_packet",
  "clinical_reviewer_packet",
  "security_reviewer_packet",
  "legal_reviewer_packet",
  "regulatory_reviewer_packet",
  "technical_diligence_packet",
  "ScrimedProofPacketCandidateBinding",
  "createScrimedProofPacketCandidateBinding",
  "exactCandidateSha",
  "sourceFingerprint",
  "evidenceFingerprint",
  "packetFingerprint",
  "exactArtifactHashes",
  "distributionStatus: \"NOT_AUTHORIZED\"",
  "externalDistributionAuthorized: false",
  "deckSections",
  "demoScript",
  "proofArtifacts",
  "pricingMotion",
  "acceptanceCriteria",
  "limitationDisclosures",
  "followUpAction",
  "retainedBoundary",
  "scrimedProofPacketManifests",
  "scrimedProofPacketStudioScorecard",
  "scrimedProofPacketBriefRouteFor",
  "getScrimedProofPacketManifest",
  "buildScrimedProofPacketMarkdown",
  "downloadablePacketRoutes",
  "Required Operator Review",
  "getScrimedProofPacketStudioSummary",
  "No PHI",
  "no autonomous clinical care",
  "no payer submission",
  "no EHR writeback",
  "no customer go-live"
]) {
  requireIncludes("app/lib/scrimedProofPacketStudio.ts", source, expected);
}

for (const expected of [
  "buildScrimedProofPacketMarkdown",
  "getScrimedProofPacketManifest",
  "scrimedProofPacketBriefRouteFor",
  "Content-Disposition",
  "text/markdown; charset=utf-8",
  "X-SCRIMED-Packet-Human-Review",
  "required-before-external-sharing",
  "scrimed-proof-packet-not-found"
]) {
  requireIncludes(
    "app/api/scrimed-proof-packet-studio/[packetId]/brief/route.ts",
    files["app/api/scrimed-proof-packet-studio/[packetId]/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "getScrimedProofPacketStudioSummary",
  "evaluateScrimedSafetyGate",
  "scrimedSafetyHeaders",
  "X-SCRIMED-Proof-Packet-Studio",
  "synthetic-and-metadata-only"
]) {
  requireIncludes("app/api/scrimed-proof-packet-studio/route.ts", files["app/api/scrimed-proof-packet-studio/route.ts"], expected);
}

for (const expected of [
  "SCRIMED Proof Packet Studio",
  "Packet Manifests",
  "Protected Share Readiness",
  "ProofPacketShareReadinessWorkbench",
  "Presentation + Demo Structure",
  "Proof Artifacts",
  "Strategic Packaging",
  "Downloadable Markdown Packets",
  "Markdown packet"
]) {
  requireIncludes("app/scrimed-proof-packet-studio/page.tsx", files["app/scrimed-proof-packet-studio/page.tsx"], expected);
}

for (const expected of [
  "validateProofPacketShareReadinessInput",
  "assessProofPacketShareReadiness",
  "enforceRequestRateLimit",
  "payload-too-large",
  "unsupported-content-type",
  "X-SCRIMED-External-Distribution",
  "not-authorized",
  "noindex, nofollow"
]) {
  requireIncludes(
    "app/api/scrimed-proof-packet-studio/share-readiness/route.ts",
    files["app/api/scrimed-proof-packet-studio/share-readiness/route.ts"],
    expected
  );
}

for (const expected of [
  "Operator preflight confirmations",
  "Assess protected handoff",
  "Download handoff receipt",
  "No recipient identity",
  "READY_FOR_PROTECTED_INTAKE"
]) {
  requireIncludes(
    "app/scrimed-proof-packet-studio/ProofPacketShareReadinessWorkbench.tsx",
    files["app/scrimed-proof-packet-studio/ProofPacketShareReadinessWorkbench.tsx"],
    expected
  );
}

for (const expected of [
  "SCRIMED Proof Packet Studio",
  "Packet Types",
  "Required Packet Fields",
  "Exact Candidate Binding",
  "Downloadable Markdown Packets",
  "Protected Share Readiness",
  "Canonical Distribution Path",
  "Safety Boundary",
  "Next Build Step"
]) {
  requireIncludes("docs/scrimed-proof-packet-studio.md", files["docs/scrimed-proof-packet-studio.md"], expected);
}

const forbiddenClaimParts = [
  ["HIPAA", " certified"],
  ["FDA", " cleared"],
  ["autonomous", " diagnosis"],
  ["autonomous", " treatment"],
  ["pres", "cribes"],
  ["replaces", " doctors"],
  ["EHR writeback", " enabled"],
  ["payer submission", " enabled"],
  ["customer go-live", " approved"]
];

for (const path of [
  "app/lib/scrimedProofPacketStudio.ts",
  "app/lib/proofPacketShareReadiness.ts",
  "app/api/scrimed-proof-packet-studio/route.ts",
  "app/api/scrimed-proof-packet-studio/[packetId]/brief/route.ts",
  "app/api/scrimed-proof-packet-studio/share-readiness/route.ts",
  "app/scrimed-proof-packet-studio/page.tsx",
  "app/scrimed-proof-packet-studio/ProofPacketShareReadinessWorkbench.tsx",
  "docs/scrimed-proof-packet-studio.md"
]) {
  const lower = files[path].toLowerCase();

  for (const parts of forbiddenClaimParts) {
    const forbidden = parts.join("").toLowerCase();
    if (lower.includes(forbidden)) {
      throw new Error(`${path} contains forbidden SCRIMED claim: ${forbidden}`);
    }
  }
}

requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-proof-packet-studio\"");
requireIncludes("package.json", files["package.json"], "\"test:proof-packet-share-readiness\"");
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/scrimed-proof-packet-studio-contract-check.mjs"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/proof-packet-share-readiness-policy-test.mjs"
);
requireIncludes("app/lib/siteNavigation.ts", files["app/lib/siteNavigation.ts"], "/scrimed-proof-packet-studio");
requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], "/scrimed-proof-packet-studio");
requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], "/scrimed-proof-packet-studio");

console.log("pass SCRIMED Proof Packet Studio contract check");
