#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimed-p34/types.ts",
  "app/lib/scrimed-p34/adaptiveGovernance.ts",
  "app/lib/scrimed-p34/contextProvenance.ts",
  "app/lib/scrimed-p34/dicomPrivacy.ts",
  "app/lib/scrimed-p34/index.ts",
  "app/scrimed-p34/page.tsx",
  "docs/SCRIMED_P34_IMPLEMENTATION_MAP.md",
  "docs/SCRIMED_P34_ADAPTIVE_GOVERNANCE.md",
  "docs/architecture/ADR_P34_ADAPTIVE_GOVERNANCE.md",
  "docs/security/P34_THREAT_BOUNDARY_UPDATE.md",
  "docs/runbooks/P34_ADAPTIVE_GOVERNANCE_RUNBOOK.md",
  "docs/release/P34_IMPLEMENTATION_STATUS.md",
  "docs/release/P34_REVIEW_PACKET.md",
  "docs/release/P34_ADAPTIVE_GOVERNANCE_COMMIT_MANIFEST.md",
  "artifacts/p34/P34_GATE_MATRIX.json",
  "artifacts/p34/P34_VALIDATION_REPORT.json"
];

await Promise.all(requiredFiles.map((file) => access(file)));

const [
  types,
  adaptive,
  context,
  dicom,
  index,
  page,
  route,
  controlPlane,
  navigation,
  navigationAudit,
  packageJson,
  nonsecret,
  mainDoc,
  threat,
  runbook,
  claims,
  gateArtifact,
  validationArtifact
] = await Promise.all([
  readFile("app/lib/scrimed-p34/types.ts", "utf8"),
  readFile("app/lib/scrimed-p34/adaptiveGovernance.ts", "utf8"),
  readFile("app/lib/scrimed-p34/contextProvenance.ts", "utf8"),
  readFile("app/lib/scrimed-p34/dicomPrivacy.ts", "utf8"),
  readFile("app/lib/scrimed-p34/index.ts", "utf8"),
  readFile("app/scrimed-p34/page.tsx", "utf8"),
  readFile("app/api/scrimed-control-plane/[[...path]]/route.ts", "utf8"),
  readFile("app/lib/scrimed-control-plane/index.ts", "utf8"),
  readFile("app/lib/siteNavigation.ts", "utf8"),
  readFile("app/lib/navigationAudit.ts", "utf8"),
  readFile("package.json", "utf8"),
  readFile("scripts/scrimed-nonsecret-test-suite.mjs", "utf8"),
  readFile("docs/SCRIMED_P34_ADAPTIVE_GOVERNANCE.md", "utf8"),
  readFile("docs/security/P34_THREAT_BOUNDARY_UPDATE.md", "utf8"),
  readFile("docs/runbooks/P34_ADAPTIVE_GOVERNANCE_RUNBOOK.md", "utf8"),
  readFile("docs/PUBLIC_CLAIMS_REGISTER.md", "utf8"),
  readFile("artifacts/p34/P34_GATE_MATRIX.json", "utf8"),
  readFile("artifacts/p34/P34_VALIDATION_REPORT.json", "utf8")
]);

const assertions = [
  [types.includes("ProviderCapabilityEntry"), "provider capability contract"],
  [types.includes("TaskPolicy"), "task policy contract"],
  [types.includes("DicomPrivacyManifest"), "DICOM privacy contract"],
  [types.includes("ContemporaneousGovernanceRecord"), "governance record contract"],
  [adaptive.includes("UNKNOWN_MODEL_OR_ROUTE_DENIED"), "deny unknown model"],
  [adaptive.includes("techniqueOrder"), "deterministic technique ordering"],
  [adaptive.includes("evaluateControlledToolAction"), "controlled tool policy"],
  [adaptive.includes("verifyContemporaneousGovernanceChain"), "governance integrity"],
  [adaptive.includes("automaticPromotionAllowed: false"), "no automatic promotion"],
  [adaptive.includes("tenantSafeCacheKey"), "tenant-safe caching"],
  [context.includes("headingPath"), "document hierarchy"],
  [context.includes("repeatedTableHeaders"), "table-header retention"],
  [context.includes("fabricatedReferenceIds"), "fabricated-reference denial"],
  [dicom.includes("isPrivateTag"), "DICOM private-tag detection"],
  [dicom.includes("PIXEL_DATA_PHI_REMOVAL_UNCERTAIN"), "pixel quarantine"],
  [dicom.includes("METADATA_REMOVAL_DOES_NOT_ESTABLISH_ANONYMIZATION"), "no anonymization claim"],
  [index.includes("getP34AdaptiveGovernanceSummary"), "integrated summary"],
  [index.includes("externalProviderCallsExecuted: false"), "no provider execution"],
  [page.includes("Agent Operations"), "operator UI"],
  [page.includes("Cost per safe, accepted outcome"), "value objective"],
  [route.includes('endpoint === "p34"'), "p.34 summary API"],
  [route.includes('endpoint === "p34/brief"'), "p.34 brief API"],
  [route.includes('endpoint === "p34/dicom-privacy"'), "p.34 DICOM API"],
  [route.includes('endpoint === "p34/assurance"'), "p.34 assurance API"],
  [controlPlane.includes("getP34AdaptiveGovernanceSummary"), "control-plane composition"],
  [navigation.includes('href: "/scrimed-p34"'), "navigation entry"],
  [navigationAudit.includes('"/scrimed-p34"'), "navigation audit"],
  [packageJson.includes('"test:scrimed-p34"'), "policy script"],
  [packageJson.includes('"smoke:scrimed-p34"'), "smoke script"],
  [nonsecret.includes("scrimed-p34-adaptive-governance-policy-test.mjs"), "nonsecret policy integration"],
  [nonsecret.includes("scrimed-p34-adaptive-governance-contract-check.mjs"), "nonsecret contract integration"],
  [mainDoc.includes("Governance Hierarchy"), "governance hierarchy"],
  [mainDoc.includes("PHI-Capable Pilot"), "PHI pilot checklist"],
  [threat.includes("Burned-in annotation"), "threat update"],
  [runbook.includes("Incident And Rollback"), "incident runbook"],
  [claims.includes("primary source, retrieval date"), "claims control"],
  [JSON.parse(gateArtifact).productionStatus === "blocked", "production gate artifact"],
  [JSON.parse(validationArtifact).status === "PASS", "deterministic validation artifact"]
];

const failures = assertions.filter(([passed]) => !passed);
if (failures.length) {
  for (const [, label] of failures) console.error(`fail ${label}`);
  process.exit(1);
}

console.log(`pass SCRIMED p.34 adaptive governance contract check (${assertions.length}/${assertions.length})`);
