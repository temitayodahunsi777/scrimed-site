#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/investorDemoCommandRoom.ts",
  "app/api/investor-demo-command-room/route.ts",
  "app/investor-demo-command-room/InvestorDemoCommandRoom.tsx",
  "app/investor-demo-command-room/page.tsx",
  "app/investor-audience-readiness/page.tsx",
  "app/lib/siteNavigation.ts",
  "app/globals.css",
  "docs/investor-demo-command-room.md",
  "docs/investor-audience-readiness.md",
  "scripts/investor-demo-command-room-policy-test.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "package.json"
];

const files = Object.fromEntries(
  await Promise.all(
    requiredFiles.map(async (path) => [path, await readFile(path, "utf8")])
  )
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(`${path} missing investor demo command-room contract text: ${expected}`);
  }
}

for (const expected of [
  "InvestorDemoCommandRoomAssessment",
  "proof-route-boundaries",
  "operator-confirmations",
  "retained-authority-boundaries",
  "ready-to-present",
  "presentation-complete",
  "proofCheckAuditHash",
  "operatorConfirmationAuditHash",
  "externalSendAuthorized: false",
  "investmentSolicitationAuthorized: false",
  "productionReleaseAuthorized: false",
  "independentApprovalRecorded: false",
  "INTERNAL_OPERATOR_REHEARSAL"
]) {
  requireIncludes("app/lib/investorDemoCommandRoom.ts", expected);
}

for (const expected of [
  "Run proof preflight",
  "Presentation clock",
  "Presenter confirmations",
  "Mark chapter presented",
  "Download internal receipt",
  'method: "HEAD"',
  'credentials: "same-origin"',
  'target="_blank"'
]) {
  requireIncludes(
    "app/investor-demo-command-room/InvestorDemoCommandRoom.tsx",
    expected
  );
}

for (const expected of [
  "not-authorized-live-care",
  "not-authorized-production-phi",
  "not-production-connector-approved",
  "not-authorized",
  "noindex, nofollow"
]) {
  requireIncludes("app/api/investor-demo-command-room/route.ts", expected);
}

requireIncludes(
  "app/investor-audience-readiness/page.tsx",
  "Open Demo Command Room"
);
requireIncludes("app/investor-demo-command-room/page.tsx", "index: false");
requireIncludes(
  "app/lib/siteNavigation.ts",
  'href: "/investor-demo-command-room"'
);
for (const expected of [
  ".investor-command-room",
  ".investor-command-chapters",
  ".investor-command-instruments",
  "@media (max-width: 980px)",
  "@media (max-width: 640px)"
]) {
  requireIncludes("app/globals.css", expected);
}
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "scripts/investor-demo-command-room-policy-test.mjs"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "scripts/investor-demo-command-room-contract-check.mjs"
);
requireIncludes(
  "package.json",
  '"test:investor-demo-command-room"'
);
requireIncludes(
  "package.json",
  '"smoke:investor-demo-command-room"'
);

for (const forbidden of [
  "guaranteed investment return",
  "customer deployment confirmed",
  "clinical validation complete",
  "payer submission enabled",
  "ehr writeback enabled",
  "phi processing approved"
]) {
  for (const path of [
    "app/lib/investorDemoCommandRoom.ts",
    "app/investor-demo-command-room/InvestorDemoCommandRoom.tsx",
    "app/investor-demo-command-room/page.tsx",
    "docs/investor-demo-command-room.md"
  ]) {
    if (files[path].toLowerCase().includes(forbidden)) {
      throw new Error(`${path} contains forbidden command-room claim: ${forbidden}`);
    }
  }
}

console.log("pass investor demo command-room contract check");
