#!/usr/bin/env node

import assert from "node:assert/strict";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  assessInvestorDemoRehearsal,
  buildInvestorDemoRunOfShow,
  investorDemoModes
} from "../app/lib/investorDemoRunOfShow.ts";

const selfTest = process.argv.includes("--self-test");
const strict = process.argv.includes("--strict");
const json = process.argv.includes("--json");
const valueArg = (name, fallback = null) =>
  process.argv.find((argument) => argument.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;

async function routeExists(route) {
  const direct = route === "/" ? "app/page.tsx" : `app${route}/page.tsx`;
  try {
    await access(direct);
    return true;
  } catch {
    const parts = route.split("/").filter(Boolean);
    if (parts.length > 1) {
      try {
        await access(`app/${parts[0]}/[slug]/page.tsx`);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export async function rehearseInvestorDemo(uiReport = null) {
  const plans = investorDemoModes.map((mode) => buildInvestorDemoRunOfShow(mode.id));
  const routes = [...new Set(plans.flatMap((plan) => [
    ...plan.chapters.flatMap((chapter) => [chapter.primaryProof.route, ...chapter.supportingProof.map((proof) => proof.route)]),
    ...plan.evidenceMap.flatMap((item) => item.proofRoutes)
  ]))].sort();
  const routeChecks = [];
  for (const route of routes) routeChecks.push({ route, exists: await routeExists(route) });
  const deterministic = plans.every((plan) => buildInvestorDemoRunOfShow(plan.mode).auditHash === plan.auditHash);
  const boundaries = plans.every((plan) =>
    plan.syntheticOnly &&
    !plan.phiAllowed &&
    !plan.clinicalExecutionAllowed &&
    !plan.externalSendAuthorized &&
    !plan.investmentSolicitationAuthorized
  );
  const browserPassed = uiReport?.passed === true;
  const consoleErrorCount = uiReport?.results?.reduce(
    (total, result) => total + (result.consoleErrors?.length ?? 0) + (result.pageErrors?.length ?? 0),
    0
  ) ?? null;
  const http5xxCount = uiReport?.results?.reduce(
    (total, result) => total + (result.http5xx?.length ?? 0),
    0
  ) ?? null;
  const checks = [
    { id: "three-deterministic-modes", passed: plans.length === 3 && deterministic },
    { id: "all-proof-routes-present", passed: routeChecks.every((entry) => entry.exists) },
    { id: "no-phi-and-no-live-authority", passed: boundaries },
    { id: "proof-and-fallback-contract", passed: plans.every((plan) => plan.evidenceMap.length === 11 && assessInvestorDemoRehearsal(plan.mode).internalRehearsalReady) },
    { id: "safe-cta", passed: plans.every((plan) => /schedule|define|record/i.test(plan.closingDecision)) },
    { id: "desktop-and-mobile", passed: browserPassed },
    { id: "no-console-errors", passed: consoleErrorCount === 0 },
    { id: "no-http-5xx", passed: http5xxCount === 0 }
  ];
  const staticChecks = checks.slice(0, 5);
  const staticReady = staticChecks.every((check) => check.passed);
  const fullyRehearsed = checks.every((check) => check.passed);
  return {
    service: "scrimed-investor-demo-rehearsal-gate",
    status: fullyRehearsed
      ? "REHEARSAL_VERIFIED"
      : staticReady
        ? "READY_FOR_BROWSER_REHEARSAL"
        : "BLOCKED",
    staticReady,
    fullyRehearsed,
    checks,
    routeChecks,
    modes: plans.map((plan) => ({ mode: plan.mode, durationSeconds: plan.durationSeconds, auditHash: plan.auditHash })),
    browserEvidenceProvided: Boolean(uiReport),
    distributionAuthorized: false,
    productionAuthorityGranted: false,
    boundary: "Internal synthetic rehearsal only. No solicitation, artifact distribution, customer proof, PHI, clinical execution, deployment, or go-live authority."
  };
}

if (selfTest) {
  const report = await rehearseInvestorDemo({ passed: true, results: [] });
  assert.equal(report.fullyRehearsed, true);
  assert.equal(report.modes.length, 3);
  assert.equal(report.distributionAuthorized, false);
  const pendingBrowser = await rehearseInvestorDemo(null);
  assert.equal(pendingBrowser.status, "READY_FOR_BROWSER_REHEARSAL");
  console.log(`pass SCRIMED investor demo rehearsal gate self-test (${report.routeChecks.length} proof routes)`);
  process.exit(0);
}

let uiReport = null;
const uiReportPath = valueArg("ui-evidence", "artifacts/ui-verification/preview-ui-verification.json");
try {
  uiReport = JSON.parse(await readFile(uiReportPath, "utf8"));
} catch {
  // The report remains explicitly pending browser rehearsal.
}
const report = await rehearseInvestorDemo(uiReport);
const outputPath = valueArg("output", "artifacts/investor/investor-demo-rehearsal.json");
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
if (json) console.log(JSON.stringify(report, null, 2));
else console.log(`${report.status === "REHEARSAL_VERIFIED" ? "pass" : "review"} SCRIMED investor demo rehearsal (${report.checks.filter((check) => check.passed).length}/${report.checks.length})`);
if (strict && !report.fullyRehearsed) process.exitCode = 1;
