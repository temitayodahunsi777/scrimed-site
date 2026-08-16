#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimed-p33/types.ts",
  "app/lib/scrimed-p33/contextFabric.ts",
  "app/lib/scrimed-p33/decisionEvidenceLedger.ts",
  "app/lib/scrimed-p33/regulatoryOversight.ts",
  "app/lib/scrimed-p33/changeControl.ts",
  "app/lib/scrimed-p33/agentPortability.ts",
  "app/lib/scrimed-p33/clinicalTrajectoryLab.ts",
  "app/lib/scrimed-p33/continuousAssurance.ts",
  "app/lib/scrimed-p33/opportunityModules.ts",
  "app/lib/scrimed-p33/pilotProfiles.ts",
  "app/lib/scrimed-p33/index.ts",
  "app/scrimed-p33/page.tsx",
  "docs/SCRIMED_P33_INTEGRATED_UPGRADES.md",
  "docs/assurance/CONTINUOUS_ASSURANCE_AND_PILOT_READINESS.md",
  "docs/release/P33_INTEGRATED_UPGRADES_COMMIT_MANIFEST.md",
  "docs/release/P33_IMPLEMENTATION_STATUS.md",
  "docs/release/P33_REVIEW_PACKET.md",
  "docs/security/P33_THREAT_BOUNDARY_UPDATE.md",
  "docs/runbooks/P33_OPERATOR_RUNBOOK.md",
  "artifacts/p33/P33_GATE_MATRIX.json",
  "artifacts/p33/P33_VALIDATION_REPORT.json",
  "docs/investor/SCRIMED_P33_INVESTOR_DECK.md",
  "docs/investor/SCRIMED_P33_INVESTOR_DECK_MANIFEST.json"
];

await Promise.all(requiredFiles.map((file) => access(file)));

const [
  index,
  context,
  ledger,
  continuousAssurance,
  pilots,
  page,
  route,
  nav,
  packageJson,
  threatBoundary,
  operatorRunbook,
  investorManifest
] = await Promise.all([
  readFile("app/lib/scrimed-p33/index.ts", "utf8"),
  readFile("app/lib/scrimed-p33/contextFabric.ts", "utf8"),
  readFile("app/lib/scrimed-p33/decisionEvidenceLedger.ts", "utf8"),
  readFile("app/lib/scrimed-p33/continuousAssurance.ts", "utf8"),
  readFile("app/lib/scrimed-p33/pilotProfiles.ts", "utf8"),
  readFile("app/scrimed-p33/page.tsx", "utf8"),
  readFile("app/api/scrimed-control-plane/[[...path]]/route.ts", "utf8"),
  readFile("app/lib/siteNavigation.ts", "utf8"),
  readFile("package.json", "utf8"),
  readFile("docs/security/P33_THREAT_BOUNDARY_UPDATE.md", "utf8"),
  readFile("docs/runbooks/P33_OPERATOR_RUNBOOK.md", "utf8"),
  readFile("docs/investor/SCRIMED_P33_INVESTOR_DECK_MANIFEST.json", "utf8")
]);

const assertions = [
  [index.includes("Walk with doctors, not replace them"), "mission boundary"],
  [index.includes("getP33IntegratedSummary"), "integrated summary"],
  [context.includes("ClinicalExtractionReleaseGate"), "clinical extraction release gate"],
  [context.includes("scalarOffsetToUtf16"), "Unicode offset conversion"],
  [ledger.includes("previousRecordHash"), "tamper-evident decision ledger"],
  [ledger.includes("hiddenChainOfThoughtStored: false"), "hidden-reasoning prohibition"],
  [continuousAssurance.includes("evaluateAgentActionPolicy"), "central action policy"],
  [continuousAssurance.includes("FALLBACK_NOT_MATERIALLY_INDEPENDENT"), "independent failover control"],
  [continuousAssurance.includes("evaluateProviderResilienceDrill"), "circuit-breaker recovery drill"],
  [continuousAssurance.includes("evaluateShadowPilotRehearsal"), "shadow pilot rehearsal"],
  [continuousAssurance.includes("automaticPromotionAllowed: false"), "quality-ratchet promotion boundary"],
  [continuousAssurance.includes('G21: {') && continuousAssurance.includes('G25: {'), "strategic gate coverage"],
  [continuousAssurance.includes("CONTROLLED_NON_PHI_PILOT") && continuousAssurance.includes("PRODUCTION_CUSTOMER_GO_LIVE"), "separate readiness decisions"],
  [pilots.includes("ENVIRONMENT_FLAG_CANNOT_BYPASS_PROFILE_GATE"), "pilot bypass denial"],
  [page.includes("Opportunity + Operations"), "integrated opportunity UI"],
  [page.includes("Continuous Assurance"), "continuous assurance UI"],
  [route.includes('endpoint === "p33"'), "p.33 API"],
  [route.includes('endpoint === "p33/brief"'), "p.33 brief API"],
  [route.includes('endpoint === "p33/assurance"'), "p.33 assurance API"],
  [nav.includes('href: "/scrimed-p33"'), "navigation entry"],
  [packageJson.includes('"test:scrimed-p33"'), "p.33 policy script"],
  [packageJson.includes('"smoke:scrimed-p33"'), "p.33 smoke script"],
  [threatBoundary.includes("deny-by-default network"), "threat-boundary network control"],
  [operatorRunbook.includes("does not authorize deployment"), "operator authorization boundary"],
  [investorManifest.includes("b042b32834de48bceb337d8b33fe14242ca7bff8869722ca41e096b75999b4b9"), "rendered deck fingerprint"]
];

const failures = assertions.filter(([passed]) => !passed);
if (failures.length) {
  for (const [, label] of failures) console.error(`fail ${label}`);
  process.exit(1);
}

console.log(`SCRIMED p.33 integrated contract check passed: ${assertions.length} checks.`);
