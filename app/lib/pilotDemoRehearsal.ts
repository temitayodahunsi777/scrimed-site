import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import type { PilotDemoProofPreflightResult } from "./pilotDemoProofPreflight";
import type { PilotDemoSessionPlan, PilotDemoSessionPlanStep } from "./pilotDemoSessionPlanner";

export type PilotDemoRehearsalControlId =
  | "proof-routes-reviewed"
  | "safety-boundary-rehearsed"
  | "pilot-close-rehearsed";

export type PilotDemoRehearsalControl = {
  id: PilotDemoRehearsalControlId;
  label: string;
  description: string;
};

export type PilotDemoRehearsalCriterion = {
  id: "agenda-coverage" | PilotDemoRehearsalControlId;
  label: string;
  weight: number;
  status: "pass" | "incomplete";
  evidence: string;
};

export type PilotDemoRehearsalEvaluation = {
  planId: string;
  status: "rehearsal-incomplete" | "ready-for-protected-handoff";
  readinessScore: number;
  completedStepCount: number;
  totalStepCount: number;
  passedCriteriaCount: number;
  totalCriteriaCount: number;
  criteria: PilotDemoRehearsalCriterion[];
  blockers: string[];
  protectedHandoffRoute: string;
  evidenceBasis: "automated-route-preflight-plus-operator-self-attestation";
  storesBuyerData: false;
  humanReviewRequired: true;
  externalSendAuthorized: false;
  bindingQuoteAuthorized: false;
  pilotLaunchAuthorized: false;
  releaseAuthorityGranted: false;
  auditHash: string;
};

export type PilotDemoRehearsalReceipt = {
  receiptId: string;
  generatedAt: string;
  planId: string;
  planAuditHash: string;
  demoName: string;
  audienceLabel: string;
  focusLabel: string;
  durationMinutes: number;
  proofPreflight: PilotDemoProofPreflightResult;
  rehearsal: PilotDemoRehearsalEvaluation;
  completedStepIds: PilotDemoSessionPlanStep["id"][];
  confirmedControlIds: PilotDemoRehearsalControlId[];
  syntheticOnly: true;
  localOnly: true;
  humanReviewRequired: true;
  receiptFingerprint: string;
};

export const pilotDemoRehearsalStatus = "proof-preflight-rehearsal-gate-active";
export const pilotDemoProtectedHandoffRoute = "/sales-operations#authenticated-buyer-demo-execution";

export const pilotDemoRehearsalControls: PilotDemoRehearsalControl[] = [
  {
    id: "proof-routes-reviewed",
    label: "Proof routes checked",
    description: "Each proof route opens and supports the statement made during the walkthrough."
  },
  {
    id: "safety-boundary-rehearsed",
    label: "Safety boundary spoken",
    description: "The presenter states the no-PHI, human-review, and no-live-execution boundary."
  },
  {
    id: "pilot-close-rehearsed",
    label: "Bounded pilot close practiced",
    description: "The close names a sponsor, workflow owner, synthetic input, evidence target, and human decision."
  }
];

function uniqueKnownStepIds(
  plan: PilotDemoSessionPlan,
  stepIds: readonly PilotDemoSessionPlanStep["id"][]
) {
  const known = new Set(plan.agenda.map((step) => step.id));
  return [...new Set(stepIds)].filter((stepId) => known.has(stepId)).sort();
}

function uniqueKnownControlIds(controlIds: readonly PilotDemoRehearsalControlId[]) {
  const known = new Set(pilotDemoRehearsalControls.map((control) => control.id));
  return [...new Set(controlIds)].filter((controlId) => known.has(controlId)).sort();
}

export function evaluatePilotDemoRehearsal({
  plan,
  completedStepIds,
  confirmedControlIds,
  proofPreflight
}: {
  plan: PilotDemoSessionPlan;
  completedStepIds: readonly PilotDemoSessionPlanStep["id"][];
  confirmedControlIds: readonly PilotDemoRehearsalControlId[];
  proofPreflight: PilotDemoProofPreflightResult;
}): PilotDemoRehearsalEvaluation {
  const completed = uniqueKnownStepIds(plan, completedStepIds);
  const confirmed = uniqueKnownControlIds(confirmedControlIds);
  const agendaComplete = completed.length === plan.agenda.length;
  const proofPreflightPassed =
    proofPreflight.planId === plan.planId && proofPreflight.status === "passed";
  const criteria: PilotDemoRehearsalCriterion[] = [
    {
      id: "agenda-coverage",
      label: "All presentation steps practiced",
      weight: 40,
      status: agendaComplete ? "pass" : "incomplete",
      evidence: `${completed.length}/${plan.agenda.length} governed steps self-attested as practiced.`
    },
    ...pilotDemoRehearsalControls.map((control) => {
      const operatorConfirmed = confirmed.includes(control.id);
      const passed =
        operatorConfirmed &&
        (control.id !== "proof-routes-reviewed" || proofPreflightPassed);
      let evidence = operatorConfirmed
        ? `Operator self-attested: ${control.description}`
        : `Pending operator self-attestation: ${control.description}`;

      if (control.id === "proof-routes-reviewed") {
        if (!proofPreflightPassed) {
          evidence = `Same-origin route preflight ${proofPreflight.status}; operator confirmation cannot satisfy this control alone.`;
        } else if (operatorConfirmed) {
          evidence = `Same-origin route preflight passed ${proofPreflight.reachableCount}/${proofPreflight.targetCount} routes. Operator self-attested that the evidence supports the walkthrough.`;
        } else {
          evidence = `Same-origin route preflight passed ${proofPreflight.reachableCount}/${proofPreflight.targetCount} routes. Evidence-content review remains pending.`;
        }
      }

      return {
        id: control.id,
        label: control.label,
        weight: 20,
        status: passed ? "pass" as const : "incomplete" as const,
        evidence
      };
    })
  ];
  const readinessScore = criteria.reduce(
    (total, criterion) => total + (criterion.status === "pass" ? criterion.weight : 0),
    0
  );
  const blockers = criteria
    .filter((criterion) => criterion.status !== "pass")
    .map((criterion) => criterion.label);
  const status = blockers.length === 0 ? "ready-for-protected-handoff" : "rehearsal-incomplete";
  const evidenceIdentity = {
    planId: plan.planId,
    planAuditHash: plan.auditHash,
    completedStepIds: completed,
    confirmedControlIds: confirmed,
    proofPreflightAuditHash: proofPreflight.auditHash,
    proofPreflightStatus: proofPreflight.status,
    status
  };

  return {
    planId: plan.planId,
    status,
    readinessScore,
    completedStepCount: completed.length,
    totalStepCount: plan.agenda.length,
    passedCriteriaCount: criteria.filter((criterion) => criterion.status === "pass").length,
    totalCriteriaCount: criteria.length,
    criteria,
    blockers,
    protectedHandoffRoute: pilotDemoProtectedHandoffRoute,
    evidenceBasis: "automated-route-preflight-plus-operator-self-attestation",
    storesBuyerData: false,
    humanReviewRequired: true,
    externalSendAuthorized: false,
    bindingQuoteAuthorized: false,
    pilotLaunchAuthorized: false,
    releaseAuthorityGranted: false,
    auditHash: generateScrimedAuditHash(evidenceIdentity)
  };
}

export function buildPilotDemoRehearsalReceipt({
  plan,
  completedStepIds,
  confirmedControlIds,
  proofPreflight,
  generatedAt
}: {
  plan: PilotDemoSessionPlan;
  completedStepIds: readonly PilotDemoSessionPlanStep["id"][];
  confirmedControlIds: readonly PilotDemoRehearsalControlId[];
  proofPreflight: PilotDemoProofPreflightResult;
  generatedAt: string;
}): PilotDemoRehearsalReceipt {
  const completed = uniqueKnownStepIds(plan, completedStepIds);
  const confirmed = uniqueKnownControlIds(confirmedControlIds);
  const rehearsal = evaluatePilotDemoRehearsal({
    plan,
    completedStepIds: completed,
    confirmedControlIds: confirmed,
    proofPreflight
  });
  const receiptFingerprint = generateScrimedAuditHash({
    planAuditHash: plan.auditHash,
    rehearsalAuditHash: rehearsal.auditHash,
    generatedAt
  });

  return {
    receiptId: `demo-rehearsal-${receiptFingerprint.replace("scrimed-intel-", "")}`,
    generatedAt,
    planId: plan.planId,
    planAuditHash: plan.auditHash,
    demoName: plan.demoName,
    audienceLabel: plan.audienceLabel,
    focusLabel: plan.focusLabel,
    durationMinutes: plan.durationMinutes,
    proofPreflight,
    rehearsal,
    completedStepIds: completed,
    confirmedControlIds: confirmed,
    syntheticOnly: true,
    localOnly: true,
    humanReviewRequired: true,
    receiptFingerprint
  };
}

function markdownList(items: readonly string[]) {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- None.";
}

export function serializePilotDemoRehearsalReceiptMarkdown(receipt: PilotDemoRehearsalReceipt) {
  return [
    `# ${receipt.demoName} - Rehearsal Record`,
    "",
    `Generated: ${receipt.generatedAt}`,
    `Receipt ID: ${receipt.receiptId}`,
    `Receipt fingerprint: ${receipt.receiptFingerprint}`,
    `Plan ID: ${receipt.planId}`,
    `Plan audit hash: ${receipt.planAuditHash}`,
    `Status: ${receipt.rehearsal.status}`,
    `Readiness score: ${receipt.rehearsal.readinessScore}%`,
    `Evidence basis: ${receipt.rehearsal.evidenceBasis}`,
    `Proof preflight: ${receipt.proofPreflight.status} (${receipt.proofPreflight.reachableCount}/${receipt.proofPreflight.targetCount} reachable)`,
    `Proof preflight audit hash: ${receipt.proofPreflight.auditHash}`,
    "",
    "## Presentation Configuration",
    `- Audience: ${receipt.audienceLabel}`,
    `- Focus: ${receipt.focusLabel}`,
    `- Duration: ${receipt.durationMinutes} minutes`,
    "",
    "## Criteria",
    ...receipt.rehearsal.criteria.map(
      (criterion) => `- ${criterion.label}: ${criterion.status} (${criterion.weight} points). ${criterion.evidence}`
    ),
    "",
    "## Completed Steps",
    markdownList(receipt.completedStepIds),
    "",
    "## Confirmed Controls",
    markdownList(receipt.confirmedControlIds),
    "",
    "## Same-Origin Proof Preflight",
    ...receipt.proofPreflight.routeChecks.map(
      (check) =>
        `- ${check.label}: ${check.passed ? "reachable" : check.outcome}; route=${check.requestPath}; status=${check.httpStatus ?? "not observed"}; latency=${check.latencyMs ?? "not observed"}ms`
    ),
    "",
    "## Remaining Blockers",
    markdownList(receipt.rehearsal.blockers),
    "",
    "## Protected Handoff",
    `- Route: ${receipt.rehearsal.protectedHandoffRoute}`,
    "- Opening the protected handoff may carry bounded canonical plan and fingerprint metadata for validation. It does not upload this record or persist anything automatically.",
    "",
    "This is a local rehearsal record using automated same-origin route reachability plus operator self-attestation and synthetic metadata only. Route reachability does not validate clinical correctness or buyer outcomes. This record is not independent verification, a binding quote, a clinical validation result, pilot launch approval, customer permission, external distribution authority, production release authority, PHI authorization, payer submission authority, EHR writeback authority, or live clinical care authorization. Human review remains required."
  ].join("\n");
}
