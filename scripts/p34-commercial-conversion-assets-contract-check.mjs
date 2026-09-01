#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const assets = [
  "docs/commercial/WORKFLOW_INTELLIGENCE_ASSESSMENT_SALES_PACK.md",
  "docs/commercial/ENTERPRISE_AI_GOVERNANCE_PILOT_ONE_PAGER.md",
  "docs/commercial/RCM_WORKFLOW_INTELLIGENCE_PILOT_ONE_PAGER.md",
  "docs/commercial/ENTERPRISE_DISCOVERY_QUESTIONNAIRE.md",
  "docs/commercial/SYNTHETIC_PILOT_SOW_TEMPLATE.md",
  "docs/diligence/SCRIMED_ENTERPRISE_DILIGENCE_INDEX.md",
  "docs/commercial/EXECUTIVE_PILOT_READOUT_TEMPLATE.md",
  "docs/commercial/ROI_VALUE_HYPOTHESIS_WORKSHEET.md",
  "docs/commercial/PRICING_SCENARIO_CALCULATOR.md",
  "docs/commercial/BUYER_QUALIFICATION_CHECKLIST.md"
];
const contents = Object.fromEntries(await Promise.all(assets.map(async (path) => [
  path,
  await readFile(path, "utf8")
])));
const combined = Object.values(contents).join("\n");

for (const offer of [
  "Workflow Intelligence Assessment",
  "Enterprise AI Governance Pilot",
  "RCM Workflow Intelligence Pilot"
]) assert.ok(combined.includes(offer), offer);

for (const required of [
  "NO_PHI=true",
  "NONPRODUCTION=true",
  "clinicalExecution=false",
  "payerSubmission=false",
  "ehrWriteback=false",
  "deviceWriteback=false",
  "APPROVE",
  "ESTIMATED",
  "SIMULATED",
  "custom enterprise scope"
]) assert.ok(combined.toLowerCase().includes(required.toLowerCase()), required);

for (const prohibited of [
  "SCRIMED guarantees savings",
  "production authorized",
  "clinically proven",
  "HIPAA compliant",
  "FDA approved",
  "SOC 2 certified"
]) assert.equal(combined.toLowerCase().includes(prohibited.toLowerCase()), false, prohibited);

const pricing = await readFile("app/lib/commercialStrategy.ts", "utf8");
for (const protectedOffer of ["Protected Enterprise Pilot", "Enterprise Operating License"]) {
  const start = pricing.indexOf(`name: \"${protectedOffer}\"`);
  assert.notEqual(start, -1, protectedOffer);
  const block = pricing.slice(start, start + 1200);
  assert.ok(block.includes("CUSTOM_SCOPE_REQUIRED"));
  assert.equal(/\$\s*\d|\b\d+(?:\.\d+)?\s*[kKmM]\b/.test(block), false);
}

assert.ok(combined.includes("cannot sign") || combined.includes("cannot quote"));
assert.ok(combined.includes("No real claim submission"));

console.log(`pass SCRIMED p.34 commercial conversion assets (${assets.length} internal controls)`);
