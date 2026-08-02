#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/strategicInvestorOutreach.ts",
  "app/lib/investorAudienceReadiness.ts",
  "app/investor-audience-readiness/page.tsx",
  "app/api/investor-audience-readiness/route.ts",
  "app/api/investor-audience-readiness/brief/route.ts",
  "app/api/investor-audience-readiness/meeting-packet/route.ts",
  "docs/investor-audience-readiness.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

const files = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (path) => [path, await readFile(path, "utf8")]))
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(`${path} is missing strategic investor outreach contract text: ${expected}`);
  }
}

const sourcePath = "app/lib/strategicInvestorOutreach.ts";
for (const expected of [
  "strategic-investor-outreach-packets-research-ready-no-solicitation",
  "OpenAI",
  "NVIDIA",
  "Anthropic",
  "Microsoft",
  "https://openai.com/startups",
  "https://openai.com/index/openai-for-healthcare/",
  "https://www.nvidia.com/en-us/startups/",
  "https://www.anthropic.com/startup-program-official-terms",
  "https://www.microsoft.com/en/startups/ai",
  "strategicDiligenceManifest",
  "evidence-ready",
  "qualified-review-required",
  "external-evidence-required",
  "strategicPitchOutline",
  "strategicOutreachStages",
  "strategicInvestorMeetingProfiles",
  "strategicFundingReadinessControls",
  "evaluateInvestorEngagementAction",
  "getParallelFundingTrack",
  "parallel-pre-fundraise-and-candidate-review",
  "public-discovery-conversation",
  "share-investor-deck",
  "open-diligence-room",
  "CLEAN_CANDIDATE_AND_NAMED_REVIEW_REQUIRED",
  "externalActionExecuted: false",
  "no-public-direct-investment-application-verified",
  "externalFundraisingReleaseAuthorized: false",
  "externalReleaseAuthorized: false",
  "externalOutreachSent: false",
  "investmentOrPartnershipImplied: false",
  "No autonomous diagnosis, treatment, prescribing, imaging interpretation, or live-care authority.",
  "not legal advice, an offer to sell securities, or solicitation"
]) {
  requireIncludes(sourcePath, expected);
}

for (const expected of [
  "getStrategicInvestorOutreachSummary",
  "strategicInvestorOutreach",
  "strategicTargetCount",
  "diligenceEvidenceReadyCount",
  "Diligence Manifest",
  "Strategic Ecosystem Targets"
]) {
  requireIncludes("app/lib/investorAudienceReadiness.ts", expected);
}

for (const routePath of [
  "app/api/investor-audience-readiness/route.ts",
  "app/api/investor-audience-readiness/brief/route.ts"
]) {
  requireIncludes(routePath, "X-SCRIMED-Investor-Diligence");
  requireIncludes(routePath, "candidate-review-required");
  requireIncludes(routePath, "X-SCRIMED-Investor-Discovery");
  requireIncludes(routePath, "human-controlled-public-materials-only");
}

for (const expected of [
  "Four company-specific theses replace generic logo outreach.",
  "Strategic diligence manifest",
  "A twelve-question deck earns the next diligence step.",
  "No outreach has been sent and no investment or partnership is implied."
]) {
  requireIncludes("app/investor-audience-readiness/page.tsx", expected);
}

for (const expected of [
  "Strategic investor meeting room",
  "Funding release controls",
  "Public proof can start a conversation; reviewed provenance unlocks diligence.",
  "Candidate binding:",
  "direct investment path is not assumed",
  "Download {profile.organization} Meeting Brief"
]) {
  requireIncludes("app/investor-audience-readiness/page.tsx", expected);
}

for (const expected of [
  "strategic_investor_target_not_found",
  "strategic_investor_packet_format_not_supported",
  "X-SCRIMED-Fundraising-Release",
  "not-authorized",
  "format === \"markdown\"",
  "externalReleaseAuthorized: false",
  "externalOutreachSent: false",
  "relationshipImplied: false"
]) {
  requireIncludes("app/api/investor-audience-readiness/meeting-packet/route.ts", expected);
}

requireIncludes(
  "package.json",
  '"smoke:strategic-investor-outreach": "node scripts/strategic-investor-outreach-contract-check.mjs"'
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "scripts/strategic-investor-outreach-contract-check.mjs"
);
requireIncludes("docs/investor-audience-readiness.md", "Strategic Ecosystem Outreach");
requireIncludes("docs/investor-audience-readiness.md", "not claimed investors or partners");
requireIncludes("docs/investor-audience-readiness.md", "Strategic Meeting Room");
requireIncludes("docs/investor-audience-readiness.md", "Funding Release Ledger");
requireIncludes("docs/investor-audience-readiness.md", "Parallel Pre-Fundraise Lane");
requireIncludes("docs/investor-audience-readiness.md", "Even fully satisfied external-release inputs return `REQUIRE_HUMAN`");

const combined = Object.values(files).join("\n");
for (const forbidden of [
  "OpenAI has invested in SCRIMED",
  "NVIDIA has invested in SCRIMED",
  "Anthropic has invested in SCRIMED",
  "Microsoft has invested in SCRIMED",
  "SCRIMED is FDA cleared",
  "SCRIMED is HIPAA certified",
  "guaranteed investor return"
]) {
  if (combined.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`Strategic investor outreach contains forbidden claim: ${forbidden}`);
  }
}

console.log(
  "pass strategic investor outreach contract (company-specific thesis, official paths, diligence gaps, claim guards, no outreach)"
);
