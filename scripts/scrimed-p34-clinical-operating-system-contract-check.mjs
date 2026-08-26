#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimed-p34/clinicalOperatingSystem.ts",
  "docs/P34_CLINICAL_OPERATING_SYSTEM.md",
  "docs/P34_THREAT_MODEL.md",
  "docs/P34_CONTROL_MATRIX.md",
  "docs/P34_EVALUATION_AND_EXTERNAL_VALIDATION.md",
  "docs/P34_AUTONOMY_AND_APPROVAL_CONTRACT.md",
  "docs/P34_PHI_DATA_FLOW.md",
  "docs/P34_IMPLEMENTATION_MANIFEST.md",
  "docs/P34_RELEASE_GATE_REPORT.md",
  "scripts/scrimed-p34-clinical-operating-system-policy-test.mjs"
];

await Promise.all(requiredFiles.map((file) => access(file)));

const [
  types,
  operatingSystem,
  adaptive,
  index,
  route,
  p34Page,
  productConsole,
  productPage,
  packageJson,
  nonsecret,
  workflow,
  controlPlaneSmoke,
  implementation,
  threat,
  controlMatrix,
  validation,
  autonomy,
  phiFlow,
  gateReport
] = await Promise.all([
  readFile("app/lib/scrimed-p34/types.ts", "utf8"),
  readFile("app/lib/scrimed-p34/clinicalOperatingSystem.ts", "utf8"),
  readFile("app/lib/scrimed-p34/adaptiveGovernance.ts", "utf8"),
  readFile("app/lib/scrimed-p34/index.ts", "utf8"),
  readFile("app/api/scrimed-control-plane/[[...path]]/route.ts", "utf8"),
  readFile("app/scrimed-p34/page.tsx", "utf8"),
  readFile("app/lib/productConsole.ts", "utf8"),
  readFile("app/product/page.tsx", "utf8"),
  readFile("package.json", "utf8"),
  readFile("scripts/scrimed-nonsecret-test-suite.mjs", "utf8"),
  readFile(".github/workflows/node24-certification.yml", "utf8"),
  readFile("scripts/scrimed-control-plane-smoke.mjs", "utf8"),
  readFile("docs/P34_CLINICAL_OPERATING_SYSTEM.md", "utf8"),
  readFile("docs/P34_THREAT_MODEL.md", "utf8"),
  readFile("docs/P34_CONTROL_MATRIX.md", "utf8"),
  readFile("docs/P34_EVALUATION_AND_EXTERNAL_VALIDATION.md", "utf8"),
  readFile("docs/P34_AUTONOMY_AND_APPROVAL_CONTRACT.md", "utf8"),
  readFile("docs/P34_PHI_DATA_FLOW.md", "utf8"),
  readFile("docs/P34_RELEASE_GATE_REPORT.md", "utf8")
]);

const assertions = [
  [types.includes("AutonomyTier"), "A0-A3 autonomy taxonomy"],
  [types.includes("ClinicalOperatingGovernanceRecord"), "clinical governance record contract"],
  [types.includes("ScopedAutonomyApproval"), "scoped autonomy approval contract"],
  [types.includes("PhiFieldRegistry"), "PHI field registry contract"],
  [types.includes("AgentSandboxPolicy"), "sandbox policy contract"],
  [types.includes("ClinicalRetrievalDecision"), "clinical retrieval contract"],
  [types.includes("ExternalValidationEvidence"), "external validation contract"],
  [types.includes("OversightDriftMetrics"), "oversight drift contract"],
  [types.includes("PatientTakeHomeDocument"), "Patient Take-Home contract"],
  [types.includes("MedicalCodingContract"), "medical coding contract"],
  [types.includes("OperationalRecoveryDecision"), "operational recovery contract"],
  [types.includes("ApprovedPublicClaim"), "approved public claim contract"],
  [operatingSystem.includes("evaluateAutonomyContract"), "autonomy enforcement"],
  [operatingSystem.includes("APPROVAL_PAYLOAD_MISMATCH"), "payload-bound approval"],
  [operatingSystem.includes("APPROVAL_REPLAY_DETECTED"), "approval replay prevention"],
  [operatingSystem.includes("verifyClinicalOperatingGovernanceChain"), "tamper-evident governance"],
  [operatingSystem.includes("queryClinicalOperatingGovernance"), "tenant-scoped governance retrieval"],
  [operatingSystem.includes("validatePhiFieldRegistry"), "startup PHI registry validation"],
  [operatingSystem.includes("SyntheticTenantTokenVault"), "tenant-contained token-vault adapter"],
  [operatingSystem.includes("evaluatePhiEgressBoundary"), "PHI and secret egress boundary"],
  [operatingSystem.includes("evaluateBreakGlassRequest"), "break-glass evaluator"],
  [operatingSystem.includes("evaluateAgentSandboxAdmission"), "sandbox admission evaluator"],
  [operatingSystem.includes("retrieveAuthorizedClinicalContext"), "tenant-first retrieval"],
  [operatingSystem.includes("evaluateExternalClinicalValidation"), "external clinical validation gate"],
  [operatingSystem.includes("evaluateOversightDriftControl"), "oversight drift control"],
  [operatingSystem.includes("renderPatientTakeHome"), "Patient Take-Home renderer"],
  [operatingSystem.includes("evaluateMedicalCodingContract"), "coding mode evaluator"],
  [operatingSystem.includes("evaluateOperationalRecovery"), "bounded retry and recovery"],
  [operatingSystem.includes("evaluateApprovedPublicClaim"), "evidence-bound claim evaluator"],
  [operatingSystem.includes("externalProviderCallsExecuted: false"), "provider calls disabled"],
  [operatingSystem.includes("phiProcessed: false"), "PHI processing disabled"],
  [operatingSystem.includes("billingSubmissionAuthorized: false"), "billing submission disabled"],
  [adaptive.includes("clinicalOperatingSystemEnabled"), "clinical OS feature flag"],
  [index.includes("createP34ClinicalOperatingSystemSummary"), "integrated p.34 summary"],
  [index.includes('gateId: "P34-28"'), "extended gate matrix"],
  [route.includes('endpoint === "p34/clinical-os"'), "clinical OS API"],
  [route.includes('endpoint === "p34/autonomy"'), "autonomy API"],
  [route.includes('endpoint === "p34/phi-boundary"'), "PHI boundary API"],
  [route.includes('endpoint === "p34/sandbox"'), "sandbox API"],
  [route.includes('endpoint === "p34/retrieval"'), "retrieval API"],
  [route.includes('endpoint === "p34/external-validation"'), "validation API"],
  [route.includes('endpoint === "p34/patient-take-home"'), "Patient Take-Home API"],
  [route.includes('endpoint === "p34/medical-coding"'), "medical coding API"],
  [p34Page.includes("Authority + Isolation"), "p.34 authority UI"],
  [p34Page.includes("Patient Take-Home"), "p.34 patient output UI"],
  [productConsole.includes("p34ClinicalOperatingSystem"), "product console data"],
  [productPage.includes("p.34 Clinical OS"), "product console UI"],
  [packageJson.includes('"test:scrimed-p34-clinical-os"'), "policy test script"],
  [packageJson.includes('"contract:scrimed-p34-clinical-os"'), "contract script"],
  [nonsecret.includes("scrimed-p34-clinical-operating-system-policy-test.mjs"), "nonsecret policy integration"],
  [nonsecret.includes("scrimed-p34-clinical-operating-system-contract-check.mjs"), "nonsecret contract integration"],
  [workflow.includes("test:scrimed-p34-clinical-os"), "Node 24 policy check"],
  [workflow.includes("contract:scrimed-p34-clinical-os"), "Node 24 contract check"],
  [controlPlaneSmoke.includes('/p34/clinical-os"'), "clinical OS runtime smoke"],
  [controlPlaneSmoke.includes('"clinicalProductionEligible":false'), "external-validation runtime boundary"],
  [controlPlaneSmoke.includes('"billingSubmissionAuthorized":false'), "billing runtime boundary"],
  [implementation.includes("Clinical Operating System"), "architecture documentation"],
  [implementation.includes("NO-GO"), "documented no-go boundary"],
  [threat.includes("Prompt injection"), "prompt-injection threat control"],
  [threat.includes("Cross-tenant"), "tenant-isolation threat control"],
  [controlMatrix.includes("A0-A3"), "autonomy control matrix"],
  [validation.includes("Internal validation"), "external-validation boundary documentation"],
  [autonomy.includes("idempotency"), "approval contract documentation"],
  [phiFlow.includes("provider"), "PHI route documentation"],
  [gateReport.includes("P34-28"), "release gate report coverage"],
  [gateReport.includes("NO-GO"), "release no-go status"]
];

const failures = assertions.filter(([passed]) => !passed);
if (failures.length) {
  for (const [, label] of failures) console.error(`fail ${label}`);
  process.exit(1);
}

console.log(
  `pass SCRIMED p.34 clinical operating system contract check (${assertions.length}/${assertions.length})`
);
