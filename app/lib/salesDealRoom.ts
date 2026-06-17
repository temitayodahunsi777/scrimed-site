import {
  buyerPilotRoomBoundary,
  buyerPilotRoomCompetitiveEdges,
  buyerPilotRoomPacketProofStackStatus,
  buyerPilotRoomProofStackStatus
} from "./buyerPilotRoom";
import {
  commercialBoundary,
  pricingTiers,
  productAccessRoutes,
  salesMotion
} from "./commercialStrategy";
import { getPilotProgramForOpportunity, getGovernanceWorkflowPackForOpportunity, type SalesAuditEvent, type SalesOpportunity } from "./salesOperations";
import {
  buyerRoomPacketRouteForProvisioning,
  buyerRoomRouteForProvisioning,
  opportunityWorkspaceProvisioningApiRoute,
  opportunityWorkspaceProvisioningPacketApiRoute,
  opportunityWorkspaceProvisioningPacketProofStackStatus,
  opportunityWorkspaceProvisioningProofStackStatus,
  workspaceMappingModeForOpportunity,
  workspaceSlugForOpportunity
} from "./opportunityWorkspaceProvisioning";
import {
  buyerTenantLifecycleApiRoute,
  buyerTenantLifecyclePacketApiRoute,
  buyerTenantLifecyclePacketProofStackStatus,
  buyerTenantLifecycleProofStackStatus
} from "./buyerTenantLifecycle";
import {
  productionActivationReadinessApiRoute,
  productionActivationReadinessPacketApiRoute,
  productionActivationReadinessPacketProofStackStatus,
  productionActivationReadinessProofStackStatus
} from "./productionActivationReadiness";
import {
  customerActivationApprovalsApiRoute,
  customerActivationApprovalsPacketApiRoute,
  customerActivationApprovalsPacketProofStackStatus,
  customerActivationApprovalsProofStackStatus
} from "./customerActivationApprovals";
import {
  buyerDiligenceRoomApiRoute,
  buyerDiligenceRoomPacketApiRoute,
  buyerDiligenceRoomPacketProofStackStatus,
  buyerDiligenceRoomProofStackStatus
} from "./buyerDiligenceRoom";
import {
  secureEvidenceVaultReadinessApiRoute,
  secureEvidenceVaultReadinessPacketApiRoute,
  secureEvidenceVaultReadinessPacketProofStackStatus,
  secureEvidenceVaultReadinessProofStackStatus
} from "./secureEvidenceVaultReadiness";

export type SalesDealRoomStage = {
  stage: string;
  buyerQuestion: string;
  scrimedProof: string;
  primaryRoute: string;
  gatedBoundary: string;
};

export type SalesDealRoomReadinessCheck = {
  id: string;
  label: string;
  state: "ready" | "review" | "blocked";
  evidence: string;
  action: string;
};

export type SalesDealRoomSiteLane = {
  lane: string;
  audience: string;
  route: string;
  purpose: string;
  handoff: string;
};

export type SalesDealRoomSummary = {
  service: string;
  route: string;
  apiRoute: string;
  protectedPacketRoute: string;
  workspaceProvisioningRoute: string;
  workspaceProvisioningPacketRoute: string;
  buyerTenantLifecycleRoute: string;
  buyerTenantLifecyclePacketRoute: string;
  productionActivationReadinessRoute: string;
  productionActivationReadinessPacketRoute: string;
  customerActivationApprovalsRoute: string;
  customerActivationApprovalsPacketRoute: string;
  buyerDiligenceRoomRoute: string;
  buyerDiligenceRoomPacketRoute: string;
  secureEvidenceVaultReadinessRoute: string;
  secureEvidenceVaultReadinessPacketRoute: string;
  status: string;
  defaultWorkspaceSlug: string;
  proofStackStatus: string;
  buyerRoomProofStackStatus: string;
  buyerRoomPacketProofStackStatus: string;
  opportunityWorkspaceProvisioningProofStackStatus: string;
  opportunityWorkspaceProvisioningPacketProofStackStatus: string;
  buyerTenantLifecycleProofStackStatus: string;
  buyerTenantLifecyclePacketProofStackStatus: string;
  productionActivationReadinessProofStackStatus: string;
  productionActivationReadinessPacketProofStackStatus: string;
  customerActivationApprovalsProofStackStatus: string;
  customerActivationApprovalsPacketProofStackStatus: string;
  buyerDiligenceRoomProofStackStatus: string;
  buyerDiligenceRoomPacketProofStackStatus: string;
  secureEvidenceVaultReadinessProofStackStatus: string;
  secureEvidenceVaultReadinessPacketProofStackStatus: string;
  executiveThesis: string;
  stages: SalesDealRoomStage[];
  siteLanes: SalesDealRoomSiteLane[];
  competitiveEdges: typeof buyerPilotRoomCompetitiveEdges;
  limitations: Array<{
    limitation: string;
    resolution: string;
    productionGate: string;
  }>;
  boundary: string;
  updated: string;
};

export type SalesDealRoomOpportunityPacket = {
  opportunityId: string;
  organizationName: string;
  buyerName: string;
  recommendedOffer: string;
  recommendedPriceRange: string;
  buyerRoomRoute: string;
  buyerRoomPacketRoute: string;
  workspaceSlug: string;
  workspaceMappingMode: "default-synthetic-workspace" | "buyer-specific-workspace";
  readinessScore: number;
  readinessChecks: SalesDealRoomReadinessCheck[];
  nextSteps: string[];
  boundary: string;
};

export const salesDealRoomRoute = "/pilot-deal-room";
export const salesDealRoomApiRoute = "/api/pilot-deal-room";
export const salesDealRoomProofStackStatus = "sales-to-buyer-room-linkage-ready";
export const salesDealRoomPacketProofStackStatus = "aal2-audited-sales-deal-room-packets";
export const defaultDealRoomWorkspaceSlug = "atlas-synthetic-evaluation";

export const salesDealRoomBoundary =
  "SCRIMED Pilot Deal Rooms organize public product proof, tenant-admin sales evidence, buyer-room routing, pricing posture, and non-binding proposal artifacts for governed synthetic evaluations only. They do not accept PHI, authorize live clinical execution, certify compliance, guarantee reimbursement, submit payer transactions, or provide medical, legal, or regulatory advice.";

const publicStages: SalesDealRoomStage[] = [
  {
    stage: "1. Discover",
    buyerQuestion: "What is SCRIMED and why is it differentiated?",
    scrimedProof: "Official website, competitive edge page, Product Console, Trust Center, and pricing posture.",
    primaryRoute: "/competitive-edge",
    gatedBoundary: "Public education only; no buyer data or clinical claims required."
  },
  {
    stage: "2. Evaluate",
    buyerQuestion: "Can the product show governed workflow value before live data?",
    scrimedProof: "Demos, AgentOS evaluation, workflows, synthetic fixtures, Trust Cards, and proof routes.",
    primaryRoute: "/demos",
    gatedBoundary: "Synthetic scenarios only; no PHI or patient-facing execution."
  },
  {
    stage: "3. Request",
    buyerQuestion: "Can my organization scope a paid assessment or synthetic pilot?",
    scrimedProof: "Pilot intake captures buyer segment, workflow targets, governance needs, and no-PHI acknowledgement.",
    primaryRoute: "/pilot",
    gatedBoundary: "Business-contact and workflow-scope intake only."
  },
  {
    stage: "4. Qualify",
    buyerQuestion: "Can SCRIMED manage opportunity ownership and next steps?",
    scrimedProof: "Sales Operations provides tenant-admin ownership, pipeline stage, follow-up, assessment scheduling, and audit.",
    primaryRoute: "/sales-operations",
    gatedBoundary: "AAL2 tenant-admin access required; no direct table mutation."
  },
  {
    stage: "5. Prove",
    buyerQuestion: "Can we inspect tenant-scoped proof and limitations before paying for more scope?",
    scrimedProof: "Buyer Pilot Room bundles readiness, evidence counts, commercial path, competitive edge, limitations, and packet audit.",
    primaryRoute: "/pilot-workspace/access",
    gatedBoundary: "Protected tenant workspace; synthetic-only, write-before-release artifacts."
  },
  {
    stage: "6. Commit",
    buyerQuestion: "What commercial step should we approve next?",
    scrimedProof: "Non-binding deal-room packet, proposal, pricing tier, governance pack, and buyer-specific next action.",
    primaryRoute: "/pricing",
    gatedBoundary: "Final scope, legal terms, security review, and production permissions require written approval."
  }
];

const siteLanes: SalesDealRoomSiteLane[] = [
  {
    lane: "Official Website",
    audience: "Public buyers, partners, advisors, and press",
    route: productAccessRoutes[0]?.route ?? "https://www.scrimedsolutions.com",
    purpose: "Brand credibility, founder story, broad education, and top-of-funnel trust.",
    handoff: "Route serious buyers to the product app, pilot intake, or competitive-edge page."
  },
  {
    lane: "Product App",
    audience: "Enterprise evaluators, investors, and sales engineering",
    route: "https://app.scrimedsolutions.com",
    purpose: "Show the actual SCRIMED product console, demos, pricing, trust posture, workflows, and protected pilot access.",
    handoff: "Move from self-guided proof to a paid assessment or synthetic pilot."
  },
  {
    lane: "Protected Workspace",
    audience: "Approved tenant admins, pilot leads, reviewers, and SCRIMED operators",
    route: "/pilot-workspace/access",
    purpose: "Package tenant-scoped synthetic sessions, audit evidence, demo readiness, TrustOps, and buyer-room packets.",
    handoff: "Use audited packets for diligence follow-up and protected-pilot planning."
  },
  {
    lane: "Sales Operations",
    audience: "SCRIMED tenant-admin commercial operators",
    route: "/sales-operations",
    purpose: "Own opportunities, proposals, follow-ups, CRM export, attribution packets, assessment invites, and deal-room packets.",
    handoff: "Create a buyer-specific packet that links opportunity scope to product proof and the protected Buyer Pilot Room."
  }
];

function firstPricingTier(names: string[]) {
  return pricingTiers.find((tier) => names.includes(tier.name)) ?? pricingTiers[1] ?? pricingTiers[0];
}

function tierForOpportunity(opportunity: SalesOpportunity) {
  const offer = opportunity.payload.scope.offerInterest;

  if (/synthetic/i.test(offer)) {
    return firstPricingTier(["Synthetic Pilot Evaluation"]);
  }

  if (/blueprint|clinical operations/i.test(offer)) {
    return firstPricingTier(["Protected Enterprise Pilot", "Clinical Operations Automation Blueprint"]);
  }

  if (/governance|audit/i.test(offer)) {
    return firstPricingTier(["AI Readiness + Governance Audit", "Workflow Intelligence Assessment"]);
  }

  return firstPricingTier(["Workflow Intelligence Assessment"]);
}

function hasRecentEvent(events: SalesAuditEvent[], eventType: SalesAuditEvent["eventType"]) {
  return events.some((event) => event.eventType === eventType);
}

function readinessState(condition: boolean, reviewCondition = false): SalesDealRoomReadinessCheck["state"] {
  if (condition) return "ready";
  return reviewCondition ? "review" : "blocked";
}

function scoreChecks(checks: SalesDealRoomReadinessCheck[]) {
  return Math.round((checks.filter((check) => check.state === "ready").length / checks.length) * 100);
}

export function getSalesDealRoomSummary(): SalesDealRoomSummary {
  return {
    service: "scrimed-sales-deal-room",
    route: salesDealRoomRoute,
    apiRoute: salesDealRoomApiRoute,
    protectedPacketRoute: "/api/sales-operations/opportunities/{intakeId}/deal-room-packet",
    workspaceProvisioningRoute: opportunityWorkspaceProvisioningApiRoute,
    workspaceProvisioningPacketRoute: opportunityWorkspaceProvisioningPacketApiRoute,
    buyerTenantLifecycleRoute: buyerTenantLifecycleApiRoute,
    buyerTenantLifecyclePacketRoute: buyerTenantLifecyclePacketApiRoute,
    productionActivationReadinessRoute: productionActivationReadinessApiRoute,
    productionActivationReadinessPacketRoute: productionActivationReadinessPacketApiRoute,
    customerActivationApprovalsRoute: customerActivationApprovalsApiRoute,
    customerActivationApprovalsPacketRoute: customerActivationApprovalsPacketApiRoute,
    buyerDiligenceRoomRoute: buyerDiligenceRoomApiRoute,
    buyerDiligenceRoomPacketRoute: buyerDiligenceRoomPacketApiRoute,
    secureEvidenceVaultReadinessRoute: secureEvidenceVaultReadinessApiRoute,
    secureEvidenceVaultReadinessPacketRoute: secureEvidenceVaultReadinessPacketApiRoute,
    status: "public-organization-and-protected-packet-ready",
    defaultWorkspaceSlug: defaultDealRoomWorkspaceSlug,
    proofStackStatus: salesDealRoomProofStackStatus,
    buyerRoomProofStackStatus: buyerPilotRoomProofStackStatus,
    buyerRoomPacketProofStackStatus: buyerPilotRoomPacketProofStackStatus,
    opportunityWorkspaceProvisioningProofStackStatus,
    opportunityWorkspaceProvisioningPacketProofStackStatus,
    buyerTenantLifecycleProofStackStatus,
    buyerTenantLifecyclePacketProofStackStatus,
    productionActivationReadinessProofStackStatus,
    productionActivationReadinessPacketProofStackStatus,
    customerActivationApprovalsProofStackStatus,
    customerActivationApprovalsPacketProofStackStatus,
    buyerDiligenceRoomProofStackStatus,
    buyerDiligenceRoomPacketProofStackStatus,
    secureEvidenceVaultReadinessProofStackStatus,
    secureEvidenceVaultReadinessPacketProofStackStatus,
    executiveThesis:
      "SCRIMED converts public product proof, governed pilot intake, tenant-admin sales operations, buyer-room diligence, premium pricing, and protected workspace evidence into one enterprise-ready pilot acquisition path.",
    stages: publicStages,
    siteLanes,
    competitiveEdges: buyerPilotRoomCompetitiveEdges,
    limitations: [
      {
        limitation: "Opportunities now support buyer-specific protected workspace provisioning and lifecycle activation after qualification.",
        resolution:
          "Qualified opportunities can provision a protected workspace, activate buyer tenant lifecycle controls, package domain SSO policy, manual invitation delivery, access review cadence, retention/archive controls, and audited packets. Unprovisioned opportunities still route to the default synthetic workspace with clear labeling.",
        productionGate: "Signed customer tenant architecture, production SSO configuration, transactional email approval, legal review, and live connector authorization."
      },
      {
        limitation: "Production SSO, automated invitations, and workspace archive execution still require customer-specific approval.",
        resolution:
          "Production readiness packets now package buyer-domain verification, redirect/origin registry, invitation template approval, transactional delivery guardrails, access-review attestation, and archive runbook before any automated send or SSO cutover.",
        productionGate: "Verified buyer domain, approved IdP configuration, approved sending provider, legal/privacy/security sign-off, incident response path, and written enterprise authorization."
      },
      {
        limitation: "Written SCRIMED approval can unblock paid pilot setup, but not live healthcare operations.",
        resolution:
          "Customer activation approval packets now record paid-pilot setup authorization, allowed setup actions, retained blockers, owner approvals, and evidence requirements after production readiness exists.",
        productionGate: "Separate buyer and SCRIMED written approval for PHI, production connectors, customer SSO cutover, automated bulk invitations, payer submission, patient outreach, clinical validation, and live workflow execution."
      },
      {
        limitation: "Sensitive buyer diligence documents should not be uploaded until storage, DLP, retention, and legal hold controls are approved.",
        resolution:
          "Buyer diligence rooms now track metadata-only evidence requirements, signed-control status, BAA/DPA posture, IdP/domain proof needs, transactional provider decisions, production connector readiness, and packet history without collecting sensitive files.",
        productionGate: "Approved document storage, malware scanning, DLP, retention/legal hold, access reviews, buyer-approved secure exchange path, and counsel-reviewed signed controls."
      },
      {
        limitation: "Sensitive evidence vaulting is not enabled until security, privacy, legal, residency, and incident controls are approved.",
        resolution:
          "Secure evidence vault readiness now packages disabled-by-default storage-provider decisioning, encryption/key management, DLP, malware scanning, retention/legal hold, access reviews, evidence classification, upload approval, incident response, regional residency, target audience, and revenue-path controls.",
        productionGate: "Approved vault provider, BAA/DPA path, encryption key ownership, DLP/malware controls, legal hold, deletion workflow, access review cadence, incident response, region policy, counsel review, and buyer authorization."
      },
      {
        limitation: "Authenticated happy-path automation still requires a short-lived AAL2 bearer token.",
        resolution:
          "Keep fail-closed public smoke checks and use human AAL2 browser sessions for buyer packet generation.",
        productionGate: "Approved CI secret rotation, token expiry, and identity operations."
      },
      {
        limitation: "Direct live connectors, PHI workflows, payer submission, and patient outreach remain blocked.",
        resolution:
          "Use synthetic fixtures, contracts, conformance evidence, and human-reviewed proof packets until production scope is signed.",
        productionGate: "Legal, privacy, security, clinical governance, BAA/DPA path, and connector validation."
      }
    ],
    boundary: salesDealRoomBoundary,
    updated: "2026-06-17"
  };
}

export function deriveSalesDealRoomForOpportunity({
  opportunity,
  auditEvents,
  appBaseUrl,
  workspaceSlug = defaultDealRoomWorkspaceSlug
}: {
  opportunity: SalesOpportunity;
  auditEvents: SalesAuditEvent[];
  appBaseUrl: string;
  workspaceSlug?: string;
}): SalesDealRoomOpportunityPacket {
  const baseUrl = appBaseUrl.replace(/\/$/, "");
  const tier = tierForOpportunity(opportunity);
  const governancePack = getGovernanceWorkflowPackForOpportunity(opportunity);
  const pilot = getPilotProgramForOpportunity(opportunity);
  const hasProposal = hasRecentEvent(auditEvents, "proposal-downloaded");
  const hasAttribution = hasRecentEvent(auditEvents, "attribution-analytics-packet-downloaded");
  const hasDealRoom = hasRecentEvent(auditEvents, "buyer-deal-room-packet-downloaded");
  const hasWorkspaceProvisioned = hasRecentEvent(auditEvents, "opportunity-workspace-provisioned");
  const hasTenantLifecycle = hasRecentEvent(auditEvents, "buyer-tenant-lifecycle-activated");
  const hasProductionReadiness = hasRecentEvent(auditEvents, "production-readiness-prepared");
  const hasCustomerActivationApprovals = hasRecentEvent(auditEvents, "customer-activation-approvals-recorded");
  const hasBuyerDiligenceRoom = hasRecentEvent(auditEvents, "buyer-diligence-room-prepared");
  const hasSecureEvidenceVaultReadiness = hasRecentEvent(
    auditEvents,
    "secure-evidence-vault-readiness-prepared"
  );
  const workflowTargetCount = opportunity.payload.scope.workflowTargets.length;
  const governanceCount = opportunity.payload.scope.governanceRequirements.length;
  const reviewStage = ["qualified", "discovery", "proposal", "pilot-planning", "won"].includes(
    opportunity.pipelineStage
  );
  const resolvedWorkspaceSlug = workspaceSlugForOpportunity(opportunity, workspaceSlug);
  const workspaceMappingMode = workspaceMappingModeForOpportunity(opportunity);
  const checks: SalesDealRoomReadinessCheck[] = [
    {
      id: "commercial-fit",
      label: "Commercial fit identified",
      state: readinessState(Boolean(opportunity.payload.scope.offerInterest), true),
      evidence: `Offer interest: ${opportunity.payload.scope.offerInterest || "not captured"}.`,
      action: "Confirm whether this buyer should enter assessment, synthetic pilot, protected pilot, or strategic review."
    },
    {
      id: "workflow-scope",
      label: "Workflow scope captured",
      state: readinessState(workflowTargetCount > 0, true),
      evidence: `${workflowTargetCount} workflow target${workflowTargetCount === 1 ? "" : "s"} captured.`,
      action: "Narrow the first paid motion to one to three workflows with measurable friction."
    },
    {
      id: "governance-scope",
      label: "Governance requirements captured",
      state: readinessState(governanceCount > 0, true),
      evidence: `${governanceCount} governance requirement${governanceCount === 1 ? "" : "s"} captured; recommended pack: ${governancePack.name}.`,
      action: "Confirm legal, privacy, security, clinical, and workflow decision owners before buyer diligence."
    },
    {
      id: "pipeline-qualification",
      label: "Pipeline qualification advanced",
      state: readinessState(reviewStage, opportunity.pipelineStage === "new"),
      evidence: `Pipeline stage: ${opportunity.pipelineStage}.`,
      action: "Move qualified opportunities into discovery, proposal, or pilot planning with a dated next action."
    },
    {
      id: "cadence",
      label: "Next action owned",
      state: readinessState(Boolean(opportunity.nextAction && opportunity.nextActionDueAt), Boolean(opportunity.nextAction)),
      evidence: opportunity.nextActionDueAt
        ? `Next action due ${opportunity.nextActionDueAt}.`
        : opportunity.nextAction
          ? "Next action exists without a due date."
          : "No next action is recorded.",
      action: "Set a human-owned next step and due date before a deal-room packet is buyer-facing."
    },
    {
      id: "pricing",
      label: "Premium pricing path selected",
      state: "ready",
      evidence: `${tier.name}: ${tier.recommendedDisplayPrice}.`,
      action: "Anchor scope to enterprise value; discount only by reducing scope, duration, services, or support."
    },
    {
      id: "proposal-proof",
      label: "Proposal artifact available",
      state: readinessState(hasProposal, true),
      evidence: hasProposal ? "Audited proposal download exists." : "No audited proposal download is visible yet.",
      action: "Generate the proposal packet after scope, governance pack, and pricing path are reviewed."
    },
    {
      id: "source-intelligence",
      label: "Source and attribution evidence",
      state: readinessState(Boolean(opportunity.payload.attribution) || hasAttribution, true),
      evidence: opportunity.payload.attribution
        ? `${opportunity.payload.attribution.sourceCategory} attribution captured.`
        : hasAttribution
          ? "Attribution analytics packet exists."
          : "No attribution signal is visible yet.",
      action: "Use source intelligence to decide speed, buyer language, deployment profile, and proof emphasis."
    },
    {
      id: "buyer-room-link",
      label: "Buyer Pilot Room route attached",
      state: "ready",
      evidence: `Protected Buyer Pilot Room route uses workspace slug ${resolvedWorkspaceSlug}.`,
      action: "Use the protected room for tenant-scoped readiness, evidence, limitations, and buyer packet downloads."
    },
    {
      id: "workspace-provisioning",
      label: "Buyer-specific workspace provisioning",
      state: readinessState(Boolean(opportunity.workspaceProvisioning), reviewStage || hasWorkspaceProvisioned),
      evidence: opportunity.workspaceProvisioning
        ? `Provisioned workspace ${opportunity.workspaceProvisioning.workspaceSlug}.`
        : hasWorkspaceProvisioned
          ? "Workspace provisioning audit exists; refresh the opportunity dashboard."
          : "No buyer-specific workspace has been provisioned yet.",
      action: "Provision a buyer-specific protected workspace after qualification, then release the workspace packet."
    },
    {
      id: "buyer-tenant-lifecycle",
      label: "Buyer tenant lifecycle activated",
      state: readinessState(Boolean(opportunity.buyerTenantLifecycle), Boolean(opportunity.workspaceProvisioning) || hasTenantLifecycle),
      evidence: opportunity.buyerTenantLifecycle
        ? `Lifecycle active for ${opportunity.buyerTenantLifecycle.workspaceSlug}; SSO policy ${opportunity.buyerTenantLifecycle.ssoPolicy.status}.`
        : hasTenantLifecycle
          ? "Buyer tenant lifecycle audit exists; refresh the opportunity dashboard."
          : opportunity.workspaceProvisioning
            ? "Workspace is provisioned; lifecycle controls are ready to activate."
            : "No buyer-specific workspace is provisioned yet.",
      action: "Activate tenant-per-buyer lifecycle controls before buyer expansion or paid pilot onboarding."
    },
    {
      id: "production-readiness",
      label: "Production SSO and invitation readiness prepared",
      state: readinessState(
        Boolean(opportunity.productionActivationReadiness),
        Boolean(opportunity.buyerTenantLifecycle) || hasProductionReadiness
      ),
      evidence: opportunity.productionActivationReadiness
        ? `Prepared for ${opportunity.productionActivationReadiness.workspaceSlug}; direct send ${opportunity.productionActivationReadiness.transactionalDeliveryPolicy.directSendEnabled ? "enabled" : "disabled"}.`
        : hasProductionReadiness
          ? "Production readiness audit exists; refresh the opportunity dashboard."
          : opportunity.buyerTenantLifecycle
            ? "Lifecycle is active; production readiness controls are ready to prepare."
            : "Buyer tenant lifecycle is not activated yet.",
      action:
        "Prepare domain verification, redirect origins, approved invitation templates, delivery guardrails, access attestations, and archive runbook before customer SSO or automated invitation delivery."
    },
    {
      id: "customer-activation-approvals",
      label: "Paid pilot setup approval recorded",
      state: readinessState(
        Boolean(opportunity.customerActivationApprovals),
        Boolean(opportunity.productionActivationReadiness) || hasCustomerActivationApprovals
      ),
      evidence: opportunity.customerActivationApprovals
        ? `Approval scope ${opportunity.customerActivationApprovals.approvalScope}; retained blockers ${opportunity.customerActivationApprovals.retainedBlockers.length}.`
        : hasCustomerActivationApprovals
          ? "Customer activation approval audit exists; refresh the opportunity dashboard."
          : opportunity.productionActivationReadiness
            ? "Production readiness is prepared; paid pilot setup approval is ready to record."
            : "Production readiness is not prepared yet.",
      action:
        "Record paid-pilot setup approval only for synthetic evaluation setup, then keep PHI, live clinical execution, payer submission, patient outreach, customer SSO cutover, and autonomous care blocked."
    },
    {
      id: "buyer-diligence-room",
      label: "Buyer evidence diligence room prepared",
      state: readinessState(
        Boolean(opportunity.buyerDiligenceRoom),
        Boolean(opportunity.customerActivationApprovals) || hasBuyerDiligenceRoom
      ),
      evidence: opportunity.buyerDiligenceRoom
        ? `Evidence scope ${opportunity.buyerDiligenceRoom.evidenceScope}; next approvals ${opportunity.buyerDiligenceRoom.nextRequiredApprovals.length}.`
        : hasBuyerDiligenceRoom
          ? "Buyer diligence room audit exists; refresh the opportunity dashboard."
          : opportunity.customerActivationApprovals
            ? "Customer activation approval is recorded; buyer diligence room is ready to prepare."
            : "Customer activation approval is not recorded yet.",
      action:
        "Prepare metadata-only diligence before collecting signed controls, IdP evidence, legal/privacy/security approvals, or production connector decisions."
    },
    {
      id: "secure-evidence-vault-readiness",
      label: "Secure evidence vault readiness prepared",
      state: readinessState(
        Boolean(opportunity.secureEvidenceVaultReadiness),
        Boolean(opportunity.buyerDiligenceRoom) || hasSecureEvidenceVaultReadiness
      ),
      evidence: opportunity.secureEvidenceVaultReadiness
        ? `Vault mode ${opportunity.secureEvidenceVaultReadiness.vaultMode}; status ${opportunity.secureEvidenceVaultReadiness.readinessStatus}.`
        : hasSecureEvidenceVaultReadiness
          ? "Secure evidence vault readiness audit exists; refresh the opportunity dashboard."
          : opportunity.buyerDiligenceRoom
            ? "Buyer diligence room is prepared; secure evidence vault readiness is ready to prepare."
            : "Buyer diligence room is not prepared yet.",
      action:
        "Prepare disabled-by-default vault controls before any sensitive document storage, PHI handling, legal hold, DLP, malware scanning, or regional storage decision."
    },
    {
      id: "deal-room-audit",
      label: "Deal-room packet audit",
      state: readinessState(hasDealRoom, true),
      evidence: hasDealRoom
        ? "A dedicated buyer-deal-room-packet-downloaded event exists."
        : "This download will create the dedicated deal-room packet audit event.",
      action: "Download only after the packet is ready for human review and buyer follow-up."
    }
  ];

  return {
    opportunityId: opportunity.intakeId,
    organizationName: opportunity.payload.organization.name,
    buyerName: opportunity.payload.contact.fullName,
    recommendedOffer: pilot?.name ?? tier.name,
    recommendedPriceRange: tier.recommendedDisplayPrice,
    buyerRoomRoute: buyerRoomRouteForProvisioning({
      appBaseUrl: baseUrl,
      intakeId: opportunity.intakeId,
      workspaceSlug: resolvedWorkspaceSlug
    }),
    buyerRoomPacketRoute: buyerRoomPacketRouteForProvisioning({
      appBaseUrl: baseUrl,
      workspaceSlug: resolvedWorkspaceSlug
    }),
    workspaceSlug: resolvedWorkspaceSlug,
    workspaceMappingMode,
    readinessScore: scoreChecks(checks),
    readinessChecks: checks,
    nextSteps: [
      "Confirm executive sponsor, workflow owner, buyer review team, and decision date.",
      "Send the non-binding opportunity proposal and deal-room packet after human review.",
      "Use the protected Buyer Pilot Room for readiness evidence, limitations, and packet audit.",
      "Activate the buyer tenant lifecycle packet before paid pilot onboarding or SSO review.",
      "Prepare the production readiness packet before customer-domain SSO, automated invitation delivery, access attestation, or archive execution.",
      "Record customer activation approvals before paid-pilot setup, while retaining live clinical, PHI, payer, patient-facing, SSO cutover, and autonomous-care hard gates.",
      "Prepare the buyer diligence room to track signed controls, BAA/DPA posture, domain proof, IdP readiness, transactional provider decisions, and connector readiness without storing sensitive documents.",
      "Prepare secure evidence vault readiness to turn sensitive-document handling into a controlled paid implementation workstream while storage remains disabled.",
      "Convert to paid assessment or synthetic pilot only within the no-PHI governed evaluation boundary."
    ],
    boundary: salesDealRoomBoundary
  };
}

function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function checkLines(checks: SalesDealRoomReadinessCheck[]) {
  return checks
    .map((check) => `- ${check.label}: ${check.state}. Evidence: ${check.evidence} Action: ${check.action}`)
    .join("\n");
}

function auditLines(events: SalesAuditEvent[]) {
  if (events.length === 0) return "- No recent sales audit events are visible for this opportunity.";

  return events
    .slice(0, 20)
    .map((event) => `- ${event.createdAt}: ${event.eventType} by ${event.actorUserId}`)
    .join("\n");
}

export function buildSalesDealRoomPacket({
  generatedAt,
  auditEventId,
  generatedBy,
  opportunity,
  packet,
  auditEvents
}: {
  generatedAt: string;
  auditEventId: string;
  generatedBy: string;
  opportunity: SalesOpportunity;
  packet: SalesDealRoomOpportunityPacket;
  auditEvents: SalesAuditEvent[];
}) {
  const governancePack = getGovernanceWorkflowPackForOpportunity(opportunity);
  const attribution = opportunity.payload.attribution;

  return `# SCRIMED Pilot Deal Room Packet

## Packet Control
- Generated: ${generatedAt}
- Packet audit event ID: ${auditEventId}
- Generated by: ${generatedBy}
- Opportunity ID: ${packet.opportunityId}
- Data boundary: business-contact and workflow-scope only
- Proof status: ${salesDealRoomPacketProofStackStatus}

## Buyer And Opportunity
- Organization: ${packet.organizationName}
- Buyer contact: ${packet.buyerName}
- Buyer email: ${opportunity.payload.contact.workEmail}
- Buyer role: ${opportunity.payload.contact.role}
- Region: ${opportunity.payload.organization.region}
- Pipeline stage: ${opportunity.pipelineStage}
- Assigned owner: ${opportunity.assignedOwner || "Unassigned"}
- Next action: ${opportunity.nextAction || "Confirm buyer decision path"}
- Next action due: ${opportunity.nextActionDueAt ?? "not set"}

## Recommended Commercial Path
- Recommended offer: ${packet.recommendedOffer}
- Recommended pricing posture: ${packet.recommendedPriceRange}
- Governance workflow pack: ${governancePack.name}
- Governance pack route: ${governancePack.route}
- Buyer room route: ${packet.buyerRoomRoute}
- Buyer room packet API: ${packet.buyerRoomPacketRoute}
- Workspace slug: ${packet.workspaceSlug}
- Workspace mapping mode: ${packet.workspaceMappingMode}
- Buyer tenant lifecycle: ${opportunity.buyerTenantLifecycle ? `${opportunity.buyerTenantLifecycle.lifecycleStatus} (${opportunity.buyerTenantLifecycle.tenantMode})` : "not activated"}
- Buyer tenant SSO policy: ${opportunity.buyerTenantLifecycle?.ssoPolicy.status ?? "not activated"}
- Production readiness: ${opportunity.productionActivationReadiness ? opportunity.productionActivationReadiness.readinessStatus : "not prepared"}
- Transactional invitation send: ${opportunity.productionActivationReadiness?.transactionalDeliveryPolicy.directSendEnabled ? "enabled" : "disabled or not prepared"}
- Customer activation approval: ${opportunity.customerActivationApprovals ? opportunity.customerActivationApprovals.approvalStatus : "not recorded"}
- Paid pilot setup scope: ${opportunity.customerActivationApprovals?.approvalScope ?? "not approved"}
- Buyer diligence room: ${opportunity.buyerDiligenceRoom ? opportunity.buyerDiligenceRoom.diligenceStatus : "not prepared"}
- Buyer diligence evidence scope: ${opportunity.buyerDiligenceRoom?.evidenceScope ?? "not prepared"}
- Secure evidence vault readiness: ${opportunity.secureEvidenceVaultReadiness ? opportunity.secureEvidenceVaultReadiness.readinessStatus : "not prepared"}
- Secure evidence vault mode: ${opportunity.secureEvidenceVaultReadiness?.vaultMode ?? "disabled"}

## Buyer Scope
- Offer interest: ${opportunity.payload.scope.offerInterest}
- Timeline: ${opportunity.payload.scope.timeline}
- Workflow targets: ${opportunity.payload.scope.workflowTargets.join(", ")}
- Readiness needs: ${opportunity.payload.scope.readinessNeeds.join(", ")}
- Governance requirements: ${opportunity.payload.scope.governanceRequirements.join(", ")}
- Interoperability context: ${opportunity.payload.scope.interoperabilityContext || "To be confirmed"}
- Pilot goals: ${opportunity.payload.scope.pilotGoals}

## Source And Attribution
- Source: ${opportunity.payload.source}
- Attribution category: ${attribution?.sourceCategory ?? "not captured"}
- Campaign channel: ${attribution?.campaign.matchedChannel ?? "not captured"}
- Target audience: ${attribution?.market.targetAudience ?? "to be confirmed"}
- Deployment profile: ${attribution?.deployment.profileName ?? "to be confirmed"}
- First response SLA: ${attribution?.cadence.firstResponseSla ?? "to be confirmed"}

## Deal Room Readiness
- Score: ${packet.readinessScore}%
${checkLines(packet.readinessChecks)}

## Competitive Edge To Emphasize
${buyerPilotRoomCompetitiveEdges
  .map((edge) => `- ${edge.pillar}: ${edge.claim} Proof: ${edge.proof} Blocked claim: ${edge.blockedClaim}`)
  .join("\n")}

## Next Steps
${markdownList(packet.nextSteps)}

## Recent Sales Audit Events
${auditLines(auditEvents)}

## Commercial Boundary
${commercialBoundary}

## Buyer Room Boundary
${buyerPilotRoomBoundary}

## Deal Room Boundary
${packet.boundary}

This is a non-binding enterprise diligence artifact. Final scope, pricing, legal terms, security requirements, success criteria, implementation plan, and production permissions require written buyer and SCRIMED approval.
`;
}

export const salesDealRoomPublicSummary = {
  motions: salesMotion.map((step) => ({
    phase: step.phase,
    name: step.name,
    route: step.route,
    nextCommitment: step.nextCommitment
  }))
};
