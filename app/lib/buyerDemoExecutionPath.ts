import { buyerRoomPacketRouteForProvisioning, buyerRoomRouteForProvisioning, workspaceMappingModeForOpportunity, workspaceSlugForOpportunity } from "./opportunityWorkspaceProvisioning";
import { isProvisioningEligible } from "./opportunityWorkspaceProvisioning";
import { isTenantLifecycleEligible } from "./buyerTenantLifecycle";
import { isProductionReadinessEligible } from "./productionActivationReadiness";
import { isCustomerActivationApprovalEligible } from "./customerActivationApprovals";
import { isBuyerDiligenceRoomEligible } from "./buyerDiligenceRoom";
import { isSecureEvidenceVaultReadinessEligible } from "./secureEvidenceVaultReadiness";
import {
  defaultDealRoomWorkspaceSlug,
  deriveSalesDealRoomForOpportunity,
  salesDealRoomBoundary,
  type SalesDealRoomOpportunityPacket
} from "./salesDealRoom";
import type { SalesAuditEvent, SalesOpportunity } from "./salesOperations";

export type BuyerDemoExecutionStepStatus =
  | "complete"
  | "available"
  | "blocked"
  | "manual-review-required";

export type BuyerDemoExecutionStep = {
  id: string;
  label: string;
  audience: string;
  status: BuyerDemoExecutionStepStatus;
  primaryRoute: string;
  packetRoute?: string;
  operatorAction: string;
  proof: string;
  blockedUntil: string;
  sourceOfTruth: string;
  noPhiBoundary: true;
};

export type BuyerDemoExecutionLimit = {
  limit: string;
  impact: string;
  workaround: string;
  retainedGate: string;
};

export type BuyerDemoExecutionPath = {
  service: "scrimed-buyer-demo-execution-path";
  status:
    | "ready-for-authenticated-operator-demo"
    | "sequenced-blockers-visible"
    | "manual-review-required";
  route: string;
  briefRoute: string;
  proofStackStatus: string;
  briefProofStackStatus: string;
  opportunityId: string;
  organizationName: string;
  buyerName: string;
  buyerEmail: string;
  buyerSegment: string;
  pipelineStage: SalesOpportunity["pipelineStage"];
  workspaceSlug: string;
  workspaceMappingMode: "default-synthetic-workspace" | "buyer-specific-workspace";
  buyerRoomRoute: string;
  buyerRoomPacketRoute: string;
  readinessScore: number;
  dealRoomReadinessScore: number;
  completedStepCount: number;
  executableStepCount: number;
  nextBestAction: string;
  currentBlockingGate: string;
  targetAudiences: string[];
  revenuePath: string[];
  demoRunbook: string[];
  steps: BuyerDemoExecutionStep[];
  knownLimits: BuyerDemoExecutionLimit[];
  hardGates: string[];
  boundary: string;
  updated: string;
};

export const buyerDemoExecutionPathProofStackStatus =
  "aal2-authenticated-buyer-demo-execution-path";
export const buyerDemoExecutionBriefProofStackStatus =
  "operator-brief-non-audited-existing-packets-remain-source-of-truth";

export const buyerDemoExecutionPathApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/demo-execution";
export const buyerDemoExecutionBriefApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/demo-execution/brief";

export const buyerDemoExecutionPathBoundary =
  "Authenticated Buyer Demo Execution Path coordinates no-PHI opportunity, sales, governance, protected-workspace, and proof-packet operations for governed synthetic pilots only. It does not create new audit evidence, store PHI, authorize live clinical workflows, certify compliance, approve customer SSO cutover, submit payer transactions, contact patients, or make medical, legal, security, regulatory, or reimbursement determinations.";

const hardGates = [
  "PHI, patient identifiers, live clinical records, payer member data, production credentials, private keys, and IdP certificates remain prohibited.",
  "No autonomous diagnosis, treatment decision, patient outreach, payer submission, or live clinical execution is authorized.",
  "Customer SSO cutover, automated invitations, production connectors, and sensitive-document storage require separate written buyer and SCRIMED approval.",
  "Legal, privacy, security, clinical, reimbursement, and regulatory decisions require qualified human review.",
  "The operator brief is not an audited evidence packet; existing audited packet routes remain the source of truth."
];

const knownLimits: BuyerDemoExecutionLimit[] = [
  {
    limit: "No PHI or live healthcare data can be accepted in the sales/demo path.",
    impact: "Enterprise buyers can evaluate workflows, governance, and proof packets without using real patients.",
    workaround: "Use synthetic fixtures, business-contact metadata, workflow-scope notes, and protected no-PHI workspaces.",
    retainedGate: "Execute a signed BAA/DPA path, privacy review, security review, and connector validation before any regulated data."
  },
  {
    limit: "The product is not approved for autonomous clinical execution.",
    impact: "Demos must show decision support, review queues, evidence, and governance rather than independent care decisions.",
    workaround: "Frame every agent output as human-reviewed operational intelligence with Trust Cards, audit trails, and escalation.",
    retainedGate: "Licensed clinical validation, production safety case, and authorized human review policy."
  },
  {
    limit: "Production SSO and automated invitation delivery are still blocked.",
    impact: "Buyer access can be demonstrated safely, but customer identity cutover remains a paid implementation step.",
    workaround: "Use passkey or magic-link plus AAL2, manual onboarding packets, approved redirect-origin planning, and access-review packets.",
    retainedGate: "Buyer domain verification, IdP approval, legal/security-approved invitation copy, and transactional provider approval."
  },
  {
    limit: "Sensitive buyer diligence files and secure evidence vault uploads remain disabled.",
    impact: "Legal/security diligence can start without prematurely collecting regulated or secret material.",
    workaround: "Track metadata-only control decisions, signed-control status, storage provider decisions, and upload approval workflow.",
    retainedGate: "Approved storage, DLP, malware scanning, retention, legal hold, deletion workflow, residency policy, and counsel review."
  },
  {
    limit: "Authenticated happy-path automation needs a short-lived AAL2 session.",
    impact: "Public smoke tests can prove fail-closed routes, while packet generation remains human-operated.",
    workaround: "Use protected browser sessions for operator demos and keep public smoke checks focused on no-secret fail-closed coverage.",
    retainedGate: "Approved CI secret rotation, token expiry policy, and identity operations."
  },
  {
    limit: "Live connectors, payer transactions, patient outreach, and customer production systems are not connected.",
    impact: "The demo remains sellable as a synthetic pilot and enterprise readiness assessment, not a live care deployment.",
    workaround: "Use interoperability contracts, conformance evaluations, simulated workflows, and buyer-specific activation packets.",
    retainedGate: "Signed production scope, connector credentials, conformance evidence, monitoring, incident response, and human approval."
  }
];

const targetAudiences = [
  "health system CIO",
  "health system CISO",
  "privacy and compliance officer",
  "clinical operations executive",
  "revenue cycle leader",
  "payer operations leader",
  "government health buyer",
  "investor diligence reviewer"
];

const revenuePath = [
  "Workflow Intelligence Assessment",
  "AI Readiness + Governance Audit",
  "Synthetic Pilot Evaluation",
  "Clinical Operations Automation Blueprint",
  "Secure Evidence Vault implementation workstream",
  "Protected enterprise workspace expansion"
];

const demoRunbook = [
  "Verify tenant-admin AAL2 access and restate the no-PHI governed synthetic pilot boundary.",
  "Open Product Console, Pilot Deal Room, Sales Operations, and the Buyer Pilot Room for the selected workspace.",
  "Walk the buyer through the AgentOS, TrustOS, workflow engine, interoperability, and evidence dashboards using synthetic scenarios.",
  "Generate only the audited packet routes that are available for the opportunity stage.",
  "Use blockers as paid implementation scope, not as hidden product gaps.",
  "Record human owners for legal, privacy, security, clinical, SSO, connector, and revenue-cycle approvals.",
  "Close with one commercial next step: paid assessment, synthetic pilot, governance audit, or automation blueprint."
];

function appBase(baseUrl: string) {
  return baseUrl.replace(/\/$/, "");
}

function routeFor({
  appBaseUrl,
  intakeId,
  template
}: {
  appBaseUrl: string;
  intakeId: string;
  template: string;
}) {
  return `${appBase(appBaseUrl)}${template.replace("{intakeId}", encodeURIComponent(intakeId))}`;
}

function hasEvent(events: SalesAuditEvent[], eventType: SalesAuditEvent["eventType"]) {
  return events.some((event) => event.eventType === eventType);
}

function statusFor({
  complete,
  available
}: {
  complete: boolean;
  available: boolean;
}): BuyerDemoExecutionStepStatus {
  if (complete) return "complete";
  return available ? "available" : "blocked";
}

function scoreSteps(steps: BuyerDemoExecutionStep[]) {
  const executable = steps.filter((step) => step.status !== "manual-review-required");
  if (executable.length === 0) return 0;

  const score = executable.reduce((total, step) => {
    if (step.status === "complete") return total + 1;
    if (step.status === "available") return total + 0.5;
    return total;
  }, 0);

  return Math.round((score / executable.length) * 100);
}

function completedStepCount(steps: BuyerDemoExecutionStep[]) {
  return steps.filter((step) => step.status === "complete").length;
}

function executableStepCount(steps: BuyerDemoExecutionStep[]) {
  return steps.filter((step) => step.status !== "manual-review-required").length;
}

function nextBestAction(steps: BuyerDemoExecutionStep[]) {
  const available = steps.find((step) => step.status === "available");
  if (available) return available.operatorAction;

  const blocked = steps.find((step) => step.status === "blocked");
  if (blocked) return `${blocked.operatorAction} Blocked until: ${blocked.blockedUntil}`;

  const review = steps.find((step) => step.status === "manual-review-required");
  return review?.operatorAction ?? "Review the opportunity with the buyer and convert to paid synthetic pilot scope.";
}

function currentBlockingGate(steps: BuyerDemoExecutionStep[]) {
  return steps.find((step) => step.status === "blocked")?.blockedUntil ?? "No sequenced blocker is visible.";
}

function pathStatus(steps: BuyerDemoExecutionStep[]): BuyerDemoExecutionPath["status"] {
  if (steps.some((step) => step.status === "blocked")) return "sequenced-blockers-visible";
  if (steps.some((step) => step.status === "manual-review-required")) return "manual-review-required";
  return "ready-for-authenticated-operator-demo";
}

function step({
  id,
  label,
  audience,
  status,
  primaryRoute,
  packetRoute,
  operatorAction,
  proof,
  blockedUntil,
  sourceOfTruth
}: Omit<BuyerDemoExecutionStep, "noPhiBoundary">): BuyerDemoExecutionStep {
  return {
    id,
    label,
    audience,
    status,
    primaryRoute,
    packetRoute,
    operatorAction,
    proof,
    blockedUntil,
    sourceOfTruth,
    noPhiBoundary: true
  };
}

function buildSteps({
  opportunity,
  auditEvents,
  appBaseUrl,
  dealRoom
}: {
  opportunity: SalesOpportunity;
  auditEvents: SalesAuditEvent[];
  appBaseUrl: string;
  dealRoom: SalesDealRoomOpportunityPacket;
}): BuyerDemoExecutionStep[] {
  const proposalDownloaded = hasEvent(auditEvents, "proposal-downloaded");
  const attributionDownloaded =
    hasEvent(auditEvents, "attribution-analytics-packet-downloaded") ||
    Boolean(opportunity.lastAttributionAnalyticsPacketAt);
  const dealRoomDownloaded =
    hasEvent(auditEvents, "buyer-deal-room-packet-downloaded") ||
    Boolean(opportunity.lastBuyerDealRoomPacketAt);
  const workspacePacketDownloaded =
    hasEvent(auditEvents, "opportunity-workspace-packet-downloaded") ||
    Boolean(opportunity.workspaceProvisioning?.lastPacketGeneratedAt);
  const lifecyclePacketDownloaded =
    hasEvent(auditEvents, "buyer-tenant-lifecycle-packet-downloaded") ||
    Boolean(opportunity.buyerTenantLifecycle?.lastPacketGeneratedAt);
  const productionReadinessPacketDownloaded =
    hasEvent(auditEvents, "production-readiness-packet-downloaded") ||
    Boolean(opportunity.productionActivationReadiness?.lastPacketGeneratedAt);
  const approvalsPacketDownloaded =
    hasEvent(auditEvents, "customer-activation-approvals-packet-downloaded") ||
    Boolean(opportunity.customerActivationApprovals?.lastPacketGeneratedAt);
  const diligencePacketDownloaded =
    hasEvent(auditEvents, "buyer-diligence-packet-downloaded") ||
    Boolean(opportunity.buyerDiligenceRoom?.lastPacketGeneratedAt);
  const vaultPacketDownloaded =
    hasEvent(auditEvents, "secure-evidence-vault-readiness-packet-downloaded") ||
    Boolean(opportunity.secureEvidenceVaultReadiness?.lastPacketGeneratedAt);

  return [
    step({
      id: "operator-brief",
      label: "Operator demo brief",
      audience: "SCRIMED operator",
      status: "available",
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: buyerDemoExecutionBriefApiRoute
      }),
      operatorAction: "Download the operator brief before the buyer demo and use audited packets as source of truth.",
      proof: buyerDemoExecutionBriefProofStackStatus,
      blockedUntil: "AAL2 tenant-admin session required.",
      sourceOfTruth: "Non-audited operator runbook."
    }),
    step({
      id: "proposal",
      label: "Audited opportunity proposal",
      audience: "economic buyer",
      status: statusFor({ complete: proposalDownloaded, available: true }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/proposal"
      }),
      operatorAction: "Download the proposal after scope, pricing, and governance pack are reviewed.",
      proof: proposalDownloaded ? "proposal-downloaded" : "proposal-ready-for-human-review",
      blockedUntil: "Human commercial review required before buyer release.",
      sourceOfTruth: "Audited proposal route."
    }),
    step({
      id: "attribution-analytics",
      label: "Attribution analytics packet",
      audience: "growth and investor diligence",
      status: statusFor({
        complete: attributionDownloaded,
        available: Boolean(opportunity.payload.attribution)
      }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/attribution-analytics-packet"
      }),
      operatorAction: "Release attribution analytics if this buyer has source intelligence attached.",
      proof: attributionDownloaded ? "attribution-analytics-packet-downloaded" : "source-intelligence-dependent",
      blockedUntil: "Attribution signal or manual source analysis.",
      sourceOfTruth: "Audited attribution analytics packet route."
    }),
    step({
      id: "deal-room-packet",
      label: "Pilot deal-room packet",
      audience: "buyer evaluation team",
      status: statusFor({ complete: dealRoomDownloaded, available: true }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/deal-room-packet"
      }),
      packetRoute: dealRoom.buyerRoomPacketRoute,
      operatorAction: "Download the deal-room packet after confirming buyer-facing proof and next step.",
      proof: dealRoomDownloaded ? "buyer-deal-room-packet-downloaded" : "deal-room-packet-ready",
      blockedUntil: "Human review of buyer-facing language.",
      sourceOfTruth: "Audited deal-room packet route."
    }),
    step({
      id: "workspace-provisioning",
      label: "Buyer-specific protected workspace",
      audience: "pilot sponsor",
      status: statusFor({
        complete: Boolean(opportunity.workspaceProvisioning),
        available: isProvisioningEligible(opportunity)
      }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/workspace-provisioning"
      }),
      packetRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/workspace-provisioning/packet"
      }),
      operatorAction: "Provision the buyer workspace after qualification, then release the workspace packet.",
      proof: opportunity.workspaceProvisioning
        ? `workspace ${opportunity.workspaceProvisioning.workspaceSlug}`
        : "qualified-opportunity-required",
      blockedUntil: "Pipeline stage qualified, discovery, proposal, pilot-planning, or won.",
      sourceOfTruth: "Workspace provisioning RPC and audited workspace packet."
    }),
    step({
      id: "workspace-provisioning-packet",
      label: "Workspace provisioning packet",
      audience: "buyer admin",
      status: statusFor({
        complete: workspacePacketDownloaded,
        available: Boolean(opportunity.workspaceProvisioning)
      }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/workspace-provisioning/packet"
      }),
      operatorAction: "Release the workspace packet after provisioning exists.",
      proof: workspacePacketDownloaded ? "opportunity-workspace-packet-downloaded" : "workspace-required",
      blockedUntil: "Buyer-specific workspace provisioning.",
      sourceOfTruth: "Audited workspace packet route."
    }),
    step({
      id: "buyer-tenant-lifecycle",
      label: "Buyer tenant lifecycle",
      audience: "CIO, CISO, tenant admin",
      status: statusFor({
        complete: Boolean(opportunity.buyerTenantLifecycle),
        available: isTenantLifecycleEligible(opportunity)
      }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle"
      }),
      packetRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle/packet"
      }),
      operatorAction: "Activate tenant lifecycle controls before buyer expansion, SSO review, or paid onboarding.",
      proof: opportunity.buyerTenantLifecycle
        ? opportunity.buyerTenantLifecycle.lifecycleStatus
        : "workspace-required",
      blockedUntil: "Buyer-specific workspace provisioning.",
      sourceOfTruth: "Tenant lifecycle RPC and audited lifecycle packet."
    }),
    step({
      id: "buyer-tenant-lifecycle-packet",
      label: "Lifecycle packet",
      audience: "security and access reviewers",
      status: statusFor({
        complete: lifecyclePacketDownloaded,
        available: Boolean(opportunity.buyerTenantLifecycle)
      }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle/packet"
      }),
      operatorAction: "Release the lifecycle packet to show SSO policy, manual delivery, access review, and archive controls.",
      proof: lifecyclePacketDownloaded ? "buyer-tenant-lifecycle-packet-downloaded" : "tenant-lifecycle-required",
      blockedUntil: "Buyer tenant lifecycle activation.",
      sourceOfTruth: "Audited lifecycle packet route."
    }),
    step({
      id: "production-readiness",
      label: "Production readiness controls",
      audience: "CISO, identity owner, legal",
      status: statusFor({
        complete: Boolean(opportunity.productionActivationReadiness),
        available: isProductionReadinessEligible(opportunity)
      }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/production-readiness"
      }),
      packetRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/production-readiness/packet"
      }),
      operatorAction: "Prepare production-readiness controls before SSO, invitations, access attestation, or archive execution.",
      proof: opportunity.productionActivationReadiness
        ? opportunity.productionActivationReadiness.readinessStatus
        : "tenant-lifecycle-required",
      blockedUntil: "Buyer tenant lifecycle activation.",
      sourceOfTruth: "Production readiness RPC and audited readiness packet."
    }),
    step({
      id: "production-readiness-packet",
      label: "Production readiness packet",
      audience: "security and implementation reviewers",
      status: statusFor({
        complete: productionReadinessPacketDownloaded,
        available: Boolean(opportunity.productionActivationReadiness)
      }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/production-readiness/packet"
      }),
      operatorAction: "Release the readiness packet before any customer-domain SSO or automated invitation discussion.",
      proof: productionReadinessPacketDownloaded
        ? "production-readiness-packet-downloaded"
        : "production-readiness-required",
      blockedUntil: "Production readiness preparation.",
      sourceOfTruth: "Audited production readiness packet route."
    }),
    step({
      id: "customer-activation-approvals",
      label: "Paid-pilot setup approvals",
      audience: "SCRIMED founder, operations, legal/security",
      status: statusFor({
        complete: Boolean(opportunity.customerActivationApprovals),
        available: isCustomerActivationApprovalEligible(opportunity)
      }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/activation-approvals"
      }),
      packetRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/activation-approvals/packet"
      }),
      operatorAction: "Record written setup approval while retaining PHI, clinical, payer, SSO cutover, and patient-facing gates.",
      proof: opportunity.customerActivationApprovals
        ? opportunity.customerActivationApprovals.approvalStatus
        : "production-readiness-required",
      blockedUntil: "Production readiness preparation.",
      sourceOfTruth: "Customer activation approval RPC and audited approval packet."
    }),
    step({
      id: "customer-activation-approval-packet",
      label: "Activation approval packet",
      audience: "implementation governance",
      status: statusFor({
        complete: approvalsPacketDownloaded,
        available: Boolean(opportunity.customerActivationApprovals)
      }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/activation-approvals/packet"
      }),
      operatorAction: "Release the approval packet to show setup-only scope and retained hard gates.",
      proof: approvalsPacketDownloaded
        ? "customer-activation-approvals-packet-downloaded"
        : "customer-activation-approvals-required",
      blockedUntil: "Customer activation approval recording.",
      sourceOfTruth: "Audited approval packet route."
    }),
    step({
      id: "buyer-diligence-room",
      label: "Buyer diligence room",
      audience: "legal, privacy, security, procurement",
      status: statusFor({
        complete: Boolean(opportunity.buyerDiligenceRoom),
        available: isBuyerDiligenceRoomEligible(opportunity)
      }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/buyer-diligence"
      }),
      packetRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/buyer-diligence/packet"
      }),
      operatorAction: "Prepare metadata-only diligence before collecting signed controls, IdP details, or production decisions.",
      proof: opportunity.buyerDiligenceRoom
        ? opportunity.buyerDiligenceRoom.diligenceStatus
        : "customer-activation-approval-required",
      blockedUntil: "Customer activation approval recording.",
      sourceOfTruth: "Buyer diligence RPC and audited diligence packet."
    }),
    step({
      id: "buyer-diligence-packet",
      label: "Buyer diligence packet",
      audience: "buyer diligence team",
      status: statusFor({
        complete: diligencePacketDownloaded,
        available: Boolean(opportunity.buyerDiligenceRoom)
      }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/buyer-diligence/packet"
      }),
      operatorAction: "Release the diligence packet after metadata-only controls are prepared.",
      proof: diligencePacketDownloaded ? "buyer-diligence-packet-downloaded" : "buyer-diligence-room-required",
      blockedUntil: "Buyer diligence room preparation.",
      sourceOfTruth: "Audited buyer diligence packet route."
    }),
    step({
      id: "secure-evidence-vault-readiness",
      label: "Secure evidence vault readiness",
      audience: "CISO, privacy, counsel, procurement",
      status: statusFor({
        complete: Boolean(opportunity.secureEvidenceVaultReadiness),
        available: isSecureEvidenceVaultReadinessEligible(opportunity)
      }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/evidence-vault-readiness"
      }),
      packetRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/evidence-vault-readiness/packet"
      }),
      operatorAction: "Prepare disabled-by-default vault readiness before sensitive-document handling becomes implementation scope.",
      proof: opportunity.secureEvidenceVaultReadiness
        ? opportunity.secureEvidenceVaultReadiness.readinessStatus
        : "buyer-diligence-room-required",
      blockedUntil: "Buyer diligence room preparation.",
      sourceOfTruth: "Secure evidence vault readiness RPC and audited vault packet."
    }),
    step({
      id: "secure-evidence-vault-readiness-packet",
      label: "Secure evidence vault readiness packet",
      audience: "enterprise diligence reviewers",
      status: statusFor({
        complete: vaultPacketDownloaded,
        available: Boolean(opportunity.secureEvidenceVaultReadiness)
      }),
      primaryRoute: routeFor({
        appBaseUrl,
        intakeId: opportunity.intakeId,
        template: "/api/sales-operations/opportunities/{intakeId}/evidence-vault-readiness/packet"
      }),
      operatorAction: "Release the vault packet after readiness exists and storage remains disabled.",
      proof: vaultPacketDownloaded
        ? "secure-evidence-vault-readiness-packet-downloaded"
        : "secure-evidence-vault-readiness-required",
      blockedUntil: "Secure evidence vault readiness preparation.",
      sourceOfTruth: "Audited secure evidence vault readiness packet route."
    }),
    step({
      id: "protected-buyer-room",
      label: "Protected Buyer Pilot Room",
      audience: "pilot reviewers",
      status: "available",
      primaryRoute: dealRoom.buyerRoomRoute,
      packetRoute: dealRoom.buyerRoomPacketRoute,
      operatorAction: "Open the protected buyer room to show workspace evidence, limitations, and synthetic proof surfaces.",
      proof: `workspace ${dealRoom.workspaceSlug}`,
      blockedUntil: "AAL2 tenant-admin or approved buyer-workspace access.",
      sourceOfTruth: "Protected Buyer Pilot Room and buyer-room packet route."
    }),
    step({
      id: "enterprise-proof-packet",
      label: "Enterprise proof packet",
      audience: "executive sponsor and investor diligence",
      status: "manual-review-required",
      primaryRoute: `${appBase(appBaseUrl)}/api/pilot-workspaces/${encodeURIComponent(
        dealRoom.workspaceSlug
      )}/enterprise-proof-packet`,
      operatorAction: "Release only after workspace evidence is current and human review confirms buyer-facing readiness.",
      proof: "tenant-admin-aggregate-write-before-release",
      blockedUntil: "Workspace-level proof review and AAL2 packet release.",
      sourceOfTruth: "Protected pilot workspace enterprise proof packet route."
    })
  ];
}

export function buildBuyerDemoExecutionPath({
  opportunity,
  auditEvents,
  appBaseUrl,
  workspaceSlug = defaultDealRoomWorkspaceSlug
}: {
  opportunity: SalesOpportunity;
  auditEvents: SalesAuditEvent[];
  appBaseUrl: string;
  workspaceSlug?: string;
}): BuyerDemoExecutionPath {
  const baseUrl = appBase(appBaseUrl);
  const resolvedWorkspaceSlug = workspaceSlugForOpportunity(opportunity, workspaceSlug);
  const dealRoom = deriveSalesDealRoomForOpportunity({
    opportunity,
    auditEvents,
    appBaseUrl: baseUrl,
    workspaceSlug: resolvedWorkspaceSlug
  });
  const steps = buildSteps({ opportunity, auditEvents, appBaseUrl: baseUrl, dealRoom });
  const route = routeFor({
    appBaseUrl: baseUrl,
    intakeId: opportunity.intakeId,
    template: buyerDemoExecutionPathApiRoute
  });
  const briefRoute = routeFor({
    appBaseUrl: baseUrl,
    intakeId: opportunity.intakeId,
    template: buyerDemoExecutionBriefApiRoute
  });

  return {
    service: "scrimed-buyer-demo-execution-path",
    status: pathStatus(steps),
    route,
    briefRoute,
    proofStackStatus: buyerDemoExecutionPathProofStackStatus,
    briefProofStackStatus: buyerDemoExecutionBriefProofStackStatus,
    opportunityId: opportunity.intakeId,
    organizationName: opportunity.payload.organization.name,
    buyerName: opportunity.payload.contact.fullName,
    buyerEmail: opportunity.payload.contact.workEmail,
    buyerSegment: opportunity.payload.organization.buyerSegment,
    pipelineStage: opportunity.pipelineStage,
    workspaceSlug: resolvedWorkspaceSlug,
    workspaceMappingMode: workspaceMappingModeForOpportunity(opportunity),
    buyerRoomRoute: buyerRoomRouteForProvisioning({
      appBaseUrl: baseUrl,
      intakeId: opportunity.intakeId,
      workspaceSlug: resolvedWorkspaceSlug
    }),
    buyerRoomPacketRoute: buyerRoomPacketRouteForProvisioning({
      appBaseUrl: baseUrl,
      workspaceSlug: resolvedWorkspaceSlug
    }),
    readinessScore: scoreSteps(steps),
    dealRoomReadinessScore: dealRoom.readinessScore,
    completedStepCount: completedStepCount(steps),
    executableStepCount: executableStepCount(steps),
    nextBestAction: nextBestAction(steps),
    currentBlockingGate: currentBlockingGate(steps),
    targetAudiences,
    revenuePath,
    demoRunbook,
    steps,
    knownLimits,
    hardGates,
    boundary: buyerDemoExecutionPathBoundary,
    updated: "2026-06-17"
  };
}

function mdCell(value: string | number) {
  return String(value).replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function stepTable(steps: BuyerDemoExecutionStep[]) {
  return [
    "| Step | Status | Audience | Source of truth | Operator action |",
    "| --- | --- | --- | --- | --- |",
    ...steps.map(
      (item) =>
        `| ${mdCell(item.label)} | ${mdCell(item.status)} | ${mdCell(item.audience)} | ${mdCell(
          item.sourceOfTruth
        )} | ${mdCell(item.operatorAction)} |`
    )
  ].join("\n");
}

function limitLines(limits: BuyerDemoExecutionLimit[]) {
  return limits
    .map(
      (item) =>
        `- ${item.limit} Impact: ${item.impact} Workaround: ${item.workaround} Retained gate: ${item.retainedGate}`
    )
    .join("\n");
}

function auditLines(events: SalesAuditEvent[]) {
  if (events.length === 0) return "- No recent sales audit events are visible for this opportunity.";

  return events
    .slice(0, 20)
    .map((event) => `- ${event.createdAt}: ${event.eventType} by ${event.actorUserId}`)
    .join("\n");
}

export function buildBuyerDemoExecutionBrief({
  generatedAt,
  generatedBy,
  path,
  auditEvents
}: {
  generatedAt: string;
  generatedBy: string;
  path: BuyerDemoExecutionPath;
  auditEvents: SalesAuditEvent[];
}) {
  return `# SCRIMED Authenticated Buyer Demo Execution Brief

## Brief Control
- Generated: ${generatedAt}
- Generated by: ${generatedBy}
- Opportunity ID: ${path.opportunityId}
- Organization: ${path.organizationName}
- Buyer contact: ${path.buyerName} (${path.buyerEmail})
- Brief audited: no
- Brief proof status: ${path.briefProofStackStatus}
- Source of truth: existing audited packet routes and protected workspaces
- Data boundary: business-contact, workflow-scope, and synthetic pilot metadata only

## Current Path
- Status: ${path.status}
- Readiness score: ${path.readinessScore}%
- Deal-room readiness score: ${path.dealRoomReadinessScore}%
- Completed executable steps: ${path.completedStepCount}/${path.executableStepCount}
- Workspace slug: ${path.workspaceSlug}
- Workspace mapping mode: ${path.workspaceMappingMode}
- Buyer room route: ${path.buyerRoomRoute}
- Buyer room packet API: ${path.buyerRoomPacketRoute}
- Next best action: ${path.nextBestAction}
- Current blocking gate: ${path.currentBlockingGate}

## Demo Runbook
${markdownList(path.demoRunbook)}

## Execution Steps
${stepTable(path.steps)}

## Revenue Path
${markdownList(path.revenuePath)}

## Target Audiences
${markdownList(path.targetAudiences)}

## Known Limits And Workarounds
${limitLines(path.knownLimits)}

## Hard Gates
${markdownList(path.hardGates)}

## Recent Sales Audit Events
${auditLines(auditEvents)}

## Deal Room Boundary
${salesDealRoomBoundary}

## Demo Execution Boundary
${path.boundary}

This brief is an operator runbook for an authenticated no-PHI buyer demo. It does not replace audited proposal, deal-room, workspace, lifecycle, production-readiness, activation-approval, diligence, secure-vault, buyer-room, or enterprise proof packets.
`;
}
