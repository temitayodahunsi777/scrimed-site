import type { BuyerDemoExecutionPath } from "./buyerDemoExecutionPath";
import type { SalesBuyerDemoSessionInput } from "./buyerDemoSessions";

export type SalesDemoSessionQaRun = {
  intakeId: string;
  organizationName: string;
  executedAt: string;
  executedBy: string;
  createdSessionId: string;
  sessionAuditEventId: string | null;
  packetAuditEventId: string | null;
  packetGeneratedAt: string | null;
  pathStatus: BuyerDemoExecutionPath["status"];
  readinessScore: number;
  selectedPacketRouteCount: number;
  proofStackStatus: string;
  boundary: string;
};

export const salesDemoSessionQaApiRoute = "/api/sales-operations/qa/buyer-demo-sessions";

export const salesDemoSessionQaProofStackStatus =
  "aal2-operator-buyer-demo-session-qa-short-lived-token-compatible";

export const salesDemoSessionQaBoundary =
  "The Sales Demo Session QA harness is an AAL2 tenant-admin control that writes synthetic buyer-demo verification records only. It verifies session persistence and packet audit creation without storing PHI, patient identifiers, live clinical records, payer member identifiers, credentials, secrets, source contracts, autonomous clinical decisions, or production healthcare execution authorization.";

export const salesDemoSessionQaControls = [
  "AAL2 tenant-admin session required",
  "Optional automation uses externally supplied short-lived bearer token only",
  "Selected opportunity is explicit from UI or SCRIMED_SALES_QA_INTAKE_ID",
  "Synthetic business workflow metadata only",
  "Existing guarded demo-session RPC records the session",
  "Existing guarded packet RPC commits the packet audit event",
  "No secrets, credentials, source contracts, or regulated healthcare files are accepted"
];

export function buildSalesDemoSessionQaInput({
  operator,
  path
}: {
  operator: string;
  path: BuyerDemoExecutionPath;
}): SalesBuyerDemoSessionInput {
  const packetRoutes = path.steps
    .flatMap((step) => [step.primaryRoute, step.packetRoute].filter(Boolean) as string[])
    .filter((route) => route.includes("/packet") || route.includes("/proposal") || route.includes("/brief"))
    .slice(0, 12);
  const stepIds = path.steps
    .filter((step) => step.status === "complete" || step.status === "available")
    .map((step) => step.id);

  return {
    operatorNotes:
      "SCRIMED QA harness run: synthetic buyer-demo session verification using business workflow metadata only.",
    buyerQuestions: [
      "Can SCRIMED retain governed demo outcomes without regulated healthcare data?",
      "Can SCRIMED audit packet-release evidence for enterprise review?"
    ],
    selectedStepIds: stepIds,
    selectedPacketRoutes: packetRoutes,
    nextActions: [
      "Review audited QA packet evidence with a SCRIMED operator.",
      "Continue buyer follow-up inside governed synthetic pilot boundary."
    ],
    followUpPlan: {
      owner: operator || "SCRIMED Sales QA",
      nextStep: path.nextBestAction || "Review buyer demo proof path.",
      dueAt: "",
      commercialMotion: "Synthetic Pilot Evaluation QA"
    }
  };
}
