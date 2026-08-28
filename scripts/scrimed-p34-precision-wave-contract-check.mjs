import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

let passed = 0;
async function check(name, run) {
  await run();
  passed += 1;
  console.log(`pass ${name}`);
}

const files = {
  pilot: await readFile("app/lib/commercial/syntheticPilotReadiness.ts", "utf8"),
  pilotPage: await readFile("app/synthetic-pilot/page.tsx", "utf8"),
  pilotApi: await readFile("app/api/synthetic-pilot/route.ts", "utf8"),
  review: await readFile("app/lib/scrimed-p34/reviewReadiness.ts", "utf8"),
  controlPlane: await readFile("app/api/scrimed-control-plane/[[...path]]/route.ts", "utf8"),
  product: await readFile("app/product/page.tsx", "utf8"),
  navigation: await readFile("app/lib/siteNavigation.ts", "utf8"),
  homepage: await readFile("app/page.tsx", "utf8"),
  pricing: await readFile("app/lib/commercialStrategy.ts", "utf8"),
  demoPrograms: await readFile("app/lib/demoPilotPrograms.ts", "utf8"),
  pilotCommercial: await readFile("app/lib/pilotDemoCommercialReadiness.ts", "utf8"),
  publicMarket: await readFile("app/lib/publicMarketReadiness.ts", "utf8"),
  marketActivation: await readFile("app/lib/marketActivation.ts", "utf8"),
  pilotCommercialDocs: await readFile("docs/pilot-demo-commercial-readiness.md", "utf8"),
  pilotSmoke: await readFile("scripts/synthetic-pilot-smoke.mjs", "utf8"),
  operator: await readFile("docs/operators/P34_OPERATOR_COMMAND_CENTER.md", "utf8"),
  preview: await readFile("docs/review/P34_PREVIEW_ACCEPTANCE_PACKET.md", "utf8"),
  aal2Verifier: await readFile("scripts/run-aal2-candidate-verification.mjs", "utf8"),
  p34: await readFile("app/lib/scrimed-p34/index.ts", "utf8")
};

await check("synthetic-pilot-domain-contract", async () => {
  for (const required of [
    "SCRIMED Synthetic Workflow Pilot",
    "SYNTHETIC / NON-PRODUCTION",
    "evaluateSyntheticPilotReadiness",
    "evaluateSyntheticPilotBudget",
    "calculateVerifiedIntelligenceYield",
    "calculateSyntheticPilotEconomics",
    "buildSyntheticPilotCommercialHandoff",
    "buildWorkflowIntelligenceAssessment",
    "bindingQuoteAuthorized: false",
    "productionAuthorityGranted: false"
  ]) assert.ok(files.pilot.includes(required), required);
});

await check("synthetic-pilot-page-and-api-contract", async () => {
  assert.ok(files.pilotPage.includes("No PHI"));
  assert.ok(files.pilotPage.includes("Inspect Evidence"));
  assert.ok(files.pilotApi.includes("X-SCRIMED-Authority"));
  assert.ok(!files.pilotApi.includes("export async function POST"));
  assert.ok(files.pilotSmoke.includes('get("/synthetic-pilot")'));
  assert.ok(files.pilotSmoke.includes('get("/api/synthetic-pilot")'));
  assert.ok(files.pilotSmoke.includes('get("/api/scrimed-control-plane/review-readiness")'));
});

await check("review-readiness-is-read-only-and-no-authority", async () => {
  assert.ok(files.controlPlane.includes('endpoint === "review-readiness"'));
  assert.ok(files.review.includes('trustClass: "trusted-external"'));
  assert.ok(files.review.includes("signatureVerified: true"));
  assert.ok(files.review.includes("independentlyVerifiedByRuntime: trustedReceiptValid"));
  assert.ok(files.review.includes("mergeAuthorityGranted: false"));
  assert.ok(files.review.includes("productionAuthorityGranted: false"));
});

await check("product-console-exposes-truthful-review-and-commercial-state", async () => {
  assert.ok(files.product.includes("Exact-head review readiness"));
  assert.ok(files.product.includes("commercialReadiness.customerActivation"));
  assert.ok(files.product.includes("Supabase posture"));
});

await check("navigation-registers-synthetic-pilot", async () => {
  assert.ok(files.navigation.includes('href: "/synthetic-pilot"'));
});

await check("public-commercial-posture-is-bounded", async () => {
  const joined = [
    files.homepage,
    files.pricing,
    files.demoPrograms,
    files.pilotCommercial,
    files.publicMarket,
    files.marketActivation,
    files.pilotCommercialDocs
  ].join("\n");
  assert.ok(joined.includes("Starting at $25K, subject to written agreement"));
  assert.ok(joined.includes("Custom enterprise scope"));
  assert.ok(!joined.includes("Illustrative planning range: $125k-$500k"));
  assert.ok(!joined.includes("Illustrative planning range: $400k-$2M+"));
  assert.ok(!joined.includes("standard `$125k-$350k`"));
  assert.ok(!joined.includes("standard `$400k-$1.25M`"));
  assert.ok(!joined.includes("Starts at $750k; typical range $1M-$2.5M"));
});

await check("operator-and-preview-packets-retain-gates", async () => {
  for (const required of ["independent technical reviewer", "AAL2", "leaked-password", "no production alias"]) {
    assert.ok(`${files.operator}\n${files.preview}`.toLowerCase().includes(required.toLowerCase()), required);
  }
});

await check("aal2-verifier-gates-network-and-token-use", async () => {
  assert.ok(files.aal2Verifier.includes("SCRIMED_AAL2_ALLOWED_PREVIEW_ORIGINS"));
  assert.ok(files.aal2Verifier.includes("if (origin && targetEligible)"));
  assert.ok(files.aal2Verifier.includes("if (origin && token && targetBinding.passed)"));
  assert.ok(files.aal2Verifier.includes("disallowedFetches !== 0"));
});

await check("canonical-p34-summary-includes-pilot-gates", async () => {
  assert.ok(files.p34.includes("syntheticPilotReadiness"));
  assert.ok(files.p34.includes('gateId: "P34-39"'));
  assert.ok(files.p34.includes('gateId: "P34-40"'));
});

console.log(`SCRIMED p.34 precision-wave contract checks: ${passed}/${passed} passed`);
