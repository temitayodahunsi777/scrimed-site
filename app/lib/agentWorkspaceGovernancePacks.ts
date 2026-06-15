export type GovernanceWorkflowPackStatus =
  | "pilot-ready"
  | "customer-tailoring-required"
  | "external-review-required";

export type GovernanceWorkflowPack = {
  slug: string;
  name: string;
  status: GovernanceWorkflowPackStatus;
  buyerSegment: string;
  customerArchetype: string;
  scope: string;
  workspaceFit: string[];
  customerInputsRequired: string[];
  retentionPolicyTemplate: {
    defaultDuration: string;
    retentionTrigger: string;
    deletionGate: string;
    approvalOwner: string;
  };
  legalReviewWorkflow: {
    steps: string[];
    requiredApprovals: string[];
    externalGates: string[];
  };
  incidentExportWorkflow: {
    trigger: string;
    severityModel: string[];
    exportPacket: string[];
    releaseGate: string;
  };
  evidenceArtifacts: string[];
  automationBoundaries: string[];
  blockedClaims: string[];
  pricingUse: string;
};

export type GovernanceWorkflowPackRoutingInput = {
  buyerSegment: string;
  organizationSize?: string;
  region?: string;
  offerInterest?: string;
  workflowTargets: string[];
  readinessNeeds: string[];
  governanceRequirements: string[];
};

export type GovernanceWorkflowPackRecommendation = {
  slug: string;
  name: string;
  status: GovernanceWorkflowPackStatus;
  route: string;
  briefRoute: string;
  reason: string;
  matchedSignals: string[];
  customerInputsRequired: string[];
  requiredApprovals: string[];
  externalGates: string[];
  retentionPolicyTemplate: GovernanceWorkflowPack["retentionPolicyTemplate"];
  incidentExportReleaseGate: string;
  evidenceArtifacts: string[];
  automationBoundaries: string[];
  blockedClaims: string[];
  boundary: string;
};

export const governanceWorkflowPackBoundary =
  "SCRIMED governance workflow packs are customer-tailored synthetic pilot operating templates. They are not legal advice, privacy advice, security certification, HIPAA certification, SOC 2 certification, FDA clearance, payer approval, reimbursement assurance, breach determination, or production authorization.";

export const agentWorkspaceGovernanceWorkflowPacks: GovernanceWorkflowPack[] = [
  {
    slug: "provider-operations-retention-review",
    name: "Provider Operations Retention Review Pack",
    status: "pilot-ready",
    buyerSegment: "Hospitals, clinics, physician groups, and care operations leaders",
    customerArchetype: "Provider organization evaluating synthetic workflow automation before PHI access.",
    scope:
      "Retention schedule, reviewer authority, proof packet handling, and release controls for synthetic care operations work orders.",
    workspaceFit: [
      "pre-visit-chart-review",
      "post-visit-care-plan-drafting",
      "data-transformation-job"
    ],
    customerInputsRequired: [
      "Pilot sponsor",
      "Workflow owner",
      "Record retention preference",
      "Clinical reviewer role",
      "Privacy contact",
      "Security contact"
    ],
    retentionPolicyTemplate: {
      defaultDuration: "90 to 180 days for synthetic pilot evidence",
      retentionTrigger: "Work-order creation, governed transition, proof-packet release, or incident export.",
      deletionGate: "Tenant-admin attestation plus privacy/security approval before evidence deletion.",
      approvalOwner: "Customer privacy owner or designated pilot governance lead"
    },
    legalReviewWorkflow: {
      steps: [
        "Confirm synthetic-only pilot scope and no live PHI processing.",
        "Map reviewer authority for clinical-adjacent drafts.",
        "Approve proof-packet language and prohibited claims.",
        "Record retention decision in the governance ledger."
      ],
      requiredApprovals: ["Pilot sponsor", "Privacy owner", "Clinical governance owner"],
      externalGates: ["BAA/DPA path if live PHI is proposed", "Licensed clinician validation before clinical claims"]
    },
    incidentExportWorkflow: {
      trigger: "Suspected boundary violation, unsafe claim, evidence-release dispute, or customer diligence request.",
      severityModel: ["low", "moderate", "high", "critical"],
      exportPacket: [
        "Committed governance-ledger entry",
        "Workspace summary",
        "Work-order snapshot",
        "Boundary controls",
        "Known limitations"
      ],
      releaseGate: "AAL2 tenant-admin or pilot-lead request with write-before-release ledger event"
    },
    evidenceArtifacts: [
      "Retention ledger entry",
      "Legal-hold or release ledger entry when applicable",
      "Work-order proof packet",
      "Incident export packet"
    ],
    automationBoundaries: [
      "No diagnosis",
      "No treatment guidance",
      "No patient outreach",
      "No medical-record mutation",
      "No production connector execution"
    ],
    blockedClaims: [
      "HIPAA compliant",
      "SOC 2 certified",
      "FDA cleared",
      "Clinical decision support authorized"
    ],
    pricingUse: "Included in protected enterprise pilot scope and annual platform readiness review."
  },
  {
    slug: "payer-rcm-incident-export",
    name: "Payer And RCM Incident Export Pack",
    status: "pilot-ready",
    buyerSegment: "Payers, revenue cycle teams, denial management, and finance operators",
    customerArchetype: "Organization testing RCM or payer intelligence with synthetic claims and policy evidence.",
    scope:
      "Controls for denial-risk work orders, retention of policy evidence, incident export, and no-submission boundaries.",
    workspaceFit: ["rcm-denial-appeal-generation", "data-transformation-job"],
    customerInputsRequired: [
      "RCM owner",
      "Payer operations owner",
      "Policy source owner",
      "No-submission acknowledgement",
      "Revenue metric baseline"
    ],
    retentionPolicyTemplate: {
      defaultDuration: "120 to 365 days for synthetic payer workflow evidence",
      retentionTrigger: "Denial work-order creation, policy source mapping, proof packet download, or incident export.",
      deletionGate: "Finance/RCM approval plus tenant-admin attestation.",
      approvalOwner: "RCM governance lead or payer operations owner"
    },
    legalReviewWorkflow: {
      steps: [
        "Confirm no live claim identifiers, member IDs, or payer credentials.",
        "Map payer policy source handling and citation boundaries.",
        "Approve no-reimbursement-guarantee language.",
        "Record retention or legal-hold decision in the governance ledger."
      ],
      requiredApprovals: ["RCM owner", "Compliance reviewer", "Executive sponsor"],
      externalGates: ["Customer legal review before payer submission workflows", "Coding/reimbursement expert review"]
    },
    incidentExportWorkflow: {
      trigger: "Potential payer-submission implication, unsupported reimbursement claim, or policy-source dispute.",
      severityModel: ["low", "moderate", "high", "critical"],
      exportPacket: [
        "Governance-ledger incident entry",
        "Denial work-order snapshot",
        "Policy evidence status",
        "No-submission controls",
        "Revenue metric caveats"
      ],
      releaseGate: "AAL2 tenant-admin or pilot-lead request with incident severity recorded"
    },
    evidenceArtifacts: [
      "Policy-source trace",
      "Retention ledger entry",
      "Work-order proof packet",
      "Incident export packet"
    ],
    automationBoundaries: [
      "No final coding",
      "No payer submission",
      "No coverage determination",
      "No reimbursement guarantee"
    ],
    blockedClaims: ["Revenue guaranteed", "Coverage approved", "Coding finalized", "Payer submission authorized"],
    pricingUse: "Premium add-on for RCM, payer, and revenue integrity protected pilots."
  },
  {
    slug: "trialcore-research-legal-hold",
    name: "TrialCore Research Legal Hold Pack",
    status: "customer-tailoring-required",
    buyerSegment: "Academic medical centers, research operations, oncology programs, and trial networks",
    customerArchetype: "Research organization evaluating synthetic trial matching or eligibility review.",
    scope:
      "Research-review controls for eligibility evidence, legal hold, protocol-source retention, and no-outreach boundaries.",
    workspaceFit: ["clinical-trial-matching", "data-transformation-job"],
    customerInputsRequired: [
      "Research operations owner",
      "Protocol source owner",
      "IRB or governance contact where applicable",
      "Research reviewer role",
      "Protocol-version handling rule"
    ],
    retentionPolicyTemplate: {
      defaultDuration: "180 to 365 days for synthetic research evidence",
      retentionTrigger: "Eligibility work-order creation, criteria trace release, review disposition, or incident export.",
      deletionGate: "Research governance approval plus tenant-admin attestation.",
      approvalOwner: "Research governance lead"
    },
    legalReviewWorkflow: {
      steps: [
        "Confirm synthetic research workflow and no patient outreach.",
        "Map criteria source, protocol version, and eligibility uncertainty language.",
        "Approve reviewer role and escalation path.",
        "Record legal-hold decision when protocol evidence must be preserved."
      ],
      requiredApprovals: ["Research operations owner", "Governance reviewer", "Executive sponsor"],
      externalGates: ["IRB/legal review where applicable", "Licensed clinician or investigator review before claims"]
    },
    incidentExportWorkflow: {
      trigger: "Eligibility claim dispute, protocol-source issue, or patient-outreach boundary concern.",
      severityModel: ["low", "moderate", "high", "critical"],
      exportPacket: [
        "Ledger incident entry",
        "Eligibility work-order snapshot",
        "Criteria source state",
        "Reviewer status",
        "No-outreach controls"
      ],
      releaseGate: "AAL2 governance request and research reviewer awareness"
    },
    evidenceArtifacts: [
      "Eligibility trace",
      "Legal-hold ledger entry",
      "Research proof packet",
      "Incident export packet"
    ],
    automationBoundaries: [
      "No enrollment recommendation",
      "No patient outreach",
      "No treatment recommendation",
      "No live record ingestion"
    ],
    blockedClaims: ["Patient eligible", "Enrollment recommended", "Trial match clinically validated"],
    pricingUse: "Research operations premium pilot module with external governance tailoring."
  },
  {
    slug: "public-sector-sovereign-retention",
    name: "Public Sector Sovereign Retention Pack",
    status: "external-review-required",
    buyerSegment: "Government health programs, ministries of health, and public-sector agencies",
    customerArchetype: "Public-sector buyer requiring regional retention, sovereignty, and audit evidence planning.",
    scope:
      "Sovereign deployment readiness, retention controls, incident export, and jurisdiction-specific approval gates.",
    workspaceFit: ["security-scan", "data-transformation-job", "pre-visit-chart-review"],
    customerInputsRequired: [
      "Jurisdiction",
      "Data residency requirement",
      "Public-sector sponsor",
      "Procurement route",
      "Incident commander",
      "Regional counsel"
    ],
    retentionPolicyTemplate: {
      defaultDuration: "Customer-defined by jurisdiction and procurement requirements",
      retentionTrigger: "Workspace activation, work-order release, security evidence update, or incident export.",
      deletionGate: "Government sponsor approval plus regional counsel/security review.",
      approvalOwner: "Customer-designated public-sector governance owner"
    },
    legalReviewWorkflow: {
      steps: [
        "Map jurisdiction, data residency, and sovereignty expectations.",
        "Confirm synthetic-only pilot boundary until approved deployment profile exists.",
        "Approve incident owner and evidence release path.",
        "Record retention and legal-hold decisions in the governance ledger."
      ],
      requiredApprovals: ["Public-sector sponsor", "Regional counsel", "Security owner"],
      externalGates: ["Sovereign-cloud architecture review", "Procurement/legal approval", "Regional privacy review"]
    },
    incidentExportWorkflow: {
      trigger: "Sovereignty concern, evidence-release request, security review finding, or jurisdictional escalation.",
      severityModel: ["low", "moderate", "high", "critical"],
      exportPacket: [
        "Incident ledger entry",
        "Sovereign readiness controls",
        "Workspace/work-order snapshot",
        "Jurisdictional gates",
        "Production exclusions"
      ],
      releaseGate: "AAL2 request plus named public-sector incident owner"
    },
    evidenceArtifacts: [
      "Sovereign readiness register",
      "Retention ledger entry",
      "Legal-hold ledger entry",
      "Incident export packet"
    ],
    automationBoundaries: [
      "No cross-border live data movement",
      "No production connector execution",
      "No public health reporting",
      "No patient-level intervention"
    ],
    blockedClaims: ["Sovereign compliant", "Government approved", "Production authorized"],
    pricingUse: "Strategic platform partnership and public-sector protected pilot requirement."
  },
  {
    slug: "enterprise-baa-dpa-readiness",
    name: "Enterprise BAA/DPA Readiness Pack",
    status: "customer-tailoring-required",
    buyerSegment: "Large providers, payers, employers, and enterprise healthcare operators",
    customerArchetype: "Enterprise buyer preparing contract, privacy, security, and production-readiness diligence.",
    scope:
      "Contract-readiness controls for BAA/DPA path, retention schedule, legal review, incident export, and human-review operating model.",
    workspaceFit: [
      "security-scan",
      "data-transformation-job",
      "pre-visit-chart-review",
      "post-visit-care-plan-drafting"
    ],
    customerInputsRequired: [
      "Procurement owner",
      "Privacy owner",
      "Security owner",
      "Legal owner",
      "Workflow sponsor",
      "Reviewer authority matrix"
    ],
    retentionPolicyTemplate: {
      defaultDuration: "90 to 365 days until customer policy is approved",
      retentionTrigger: "Protected pilot activation, reviewer disposition, proof release, or incident export.",
      deletionGate: "Legal/privacy approval plus tenant-admin attestation.",
      approvalOwner: "Customer legal/privacy owner"
    },
    legalReviewWorkflow: {
      steps: [
        "Confirm product boundary and no-PHI pilot posture.",
        "Map BAA/DPA decision path before live data.",
        "Approve claims register and proof-packet language.",
        "Record retention/legal-hold actions in the governance ledger."
      ],
      requiredApprovals: ["Legal owner", "Privacy owner", "Security owner", "Workflow sponsor"],
      externalGates: ["BAA/DPA execution before PHI", "Security review", "Incident response runbook approval"]
    },
    incidentExportWorkflow: {
      trigger: "Diligence request, legal review question, privacy/security concern, or claims-boundary escalation.",
      severityModel: ["low", "moderate", "high", "critical"],
      exportPacket: [
        "Ledger entry",
        "Claims and boundary controls",
        "Work-order evidence",
        "Reviewer status",
        "Remaining external gates"
      ],
      releaseGate: "AAL2 governance request with customer owner mapped"
    },
    evidenceArtifacts: [
      "BAA/DPA readiness notes",
      "Retention ledger entry",
      "Legal-review packet",
      "Incident export packet"
    ],
    automationBoundaries: [
      "No PHI processing before written approval",
      "No live connector execution",
      "No autonomous clinical decision",
      "No compliance certification claim"
    ],
    blockedClaims: ["HIPAA certified", "SOC 2 certified", "BAA approved", "Production ready"],
    pricingUse: "Required for protected enterprise pilot conversion and annual operating license diligence."
  }
];

export function getGovernanceWorkflowPackBySlug(slug: string) {
  return agentWorkspaceGovernanceWorkflowPacks.find((pack) => pack.slug === slug) ?? null;
}

export function recommendGovernanceWorkflowPack(
  input: GovernanceWorkflowPackRoutingInput
): GovernanceWorkflowPackRecommendation {
  const normalizedSignals = [
    input.buyerSegment,
    input.organizationSize ?? "",
    input.region ?? "",
    input.offerInterest ?? "",
    ...input.workflowTargets,
    ...input.readinessNeeds,
    ...input.governanceRequirements
  ]
    .join(" ")
    .toLowerCase();

  const matchedSignals: string[] = [];
  let selectedSlug = "provider-operations-retention-review";
  let reason =
    "Provider operations retention controls are the safest default for care-delivery workflow pilots that remain synthetic and human-reviewed.";

  function hasSignal(...patterns: string[]) {
    return patterns.some((pattern) => normalizedSignals.includes(pattern));
  }

  function addSignal(signal: string) {
    if (!matchedSignals.includes(signal)) {
      matchedSignals.push(signal);
    }
  }

  if (hasSignal("research", "life sciences", "trial", "oncology", "eligibility")) {
    selectedSlug = "trialcore-research-legal-hold";
    reason =
      "Research and trial-matching signals require protocol-source handling, research reviewer controls, legal-hold readiness, and no-outreach boundaries.";
    addSignal("research-or-trial-workflow");
  } else if (hasSignal("government", "public health", "ministry", "sovereign")) {
    selectedSlug = "public-sector-sovereign-retention";
    reason =
      "Public-sector signals require sovereign retention planning, jurisdictional approval gates, and named incident-release ownership.";
    addSignal("public-sector-buyer");
  } else if (hasSignal("payer", "health plan", "prior authorization", "rcm", "denial", "claims")) {
    selectedSlug = "payer-rcm-incident-export";
    reason =
      "Payer, prior-authorization, claims, or RCM signals require no-submission controls, policy-source retention, and incident-export readiness.";
    addSignal("payer-or-rcm-workflow");
  } else if (
    hasSignal("5000", "5,000", "large", "enterprise", "hipaa", "role-based", "security", "baa", "dpa")
  ) {
    selectedSlug = "enterprise-baa-dpa-readiness";
    reason =
      "Enterprise, HIPAA-readiness, security, or role-control signals require BAA/DPA path planning and contract-readiness governance.";
    addSignal("enterprise-diligence-required");
  } else {
    addSignal("provider-operations-default");
  }

  if (hasSignal("middle east", "uae", "saudi", "kuwait", "africa", "nigeria", "kenya", "rwanda", "ghana", "global")) {
    addSignal("regional-or-multiregion-deployment-context");
  }

  if (hasSignal("synthetic")) {
    addSignal("synthetic-only-pilot-boundary");
  }

  if (hasSignal("human review", "no autonomous", "audit")) {
    addSignal("human-reviewed-governance-boundary");
  }

  const fallbackPack = getGovernanceWorkflowPackBySlug("provider-operations-retention-review");

  if (!fallbackPack) {
    throw new Error("Governance workflow pack configuration is missing the provider operations fallback.");
  }

  const pack = getGovernanceWorkflowPackBySlug(selectedSlug) ?? fallbackPack;

  return {
    slug: pack.slug,
    name: pack.name,
    status: pack.status,
    route: "/governance-packs",
    briefRoute: "/api/agent-workspace/governance-packs/brief",
    reason,
    matchedSignals,
    customerInputsRequired: pack.customerInputsRequired,
    requiredApprovals: pack.legalReviewWorkflow.requiredApprovals,
    externalGates: pack.legalReviewWorkflow.externalGates,
    retentionPolicyTemplate: pack.retentionPolicyTemplate,
    incidentExportReleaseGate: pack.incidentExportWorkflow.releaseGate,
    evidenceArtifacts: pack.evidenceArtifacts,
    automationBoundaries: pack.automationBoundaries,
    blockedClaims: pack.blockedClaims,
    boundary: governanceWorkflowPackBoundary
  };
}

export function getAgentWorkspaceGovernancePacksSummary() {
  return {
    service: "scrimed-agent-workspace-governance-packs",
    route: "/governance-packs",
    apiRoute: "/api/agent-workspace/governance-packs",
    briefRoute: "/api/agent-workspace/governance-packs/brief",
    status: "customer-governance-workflow-packs-ready",
    boundary: governanceWorkflowPackBoundary,
    packCount: agentWorkspaceGovernanceWorkflowPacks.length,
    packs: agentWorkspaceGovernanceWorkflowPacks,
    routingRules: [
      "Research, trial, oncology, or eligibility signals route to TrialCore Research Legal Hold Pack.",
      "Government, public-health, ministry, or sovereignty signals route to Public Sector Sovereign Retention Pack.",
      "Payer, prior-authorization, claims, denial, or RCM signals route to Payer And RCM Incident Export Pack.",
      "Enterprise, HIPAA-readiness, security-review, BAA/DPA, or role-based-access signals route to Enterprise BAA/DPA Readiness Pack.",
      "Provider and clinic operations pilots default to Provider Operations Retention Review Pack."
    ],
    ciSecretContract: {
      bearerTokenSecret: "SCRIMED_BEARER_TOKEN",
      optionalBaseUrlVariable: "SCRIMED_BASE_URL",
      optionalWorkspaceSlugVariable: "SCRIMED_WORKSPACE_SLUG",
      requiredSmokeFlag: "SCRIMED_REQUIRE_AUTHENTICATED_SMOKE=1"
    },
    nextImplementationStep:
      "Promote selected governance pack slugs from buyer intake into protected workspace activation records and governance-ledger metadata when an enterprise pilot is created.",
    updated: "2026-06-15"
  };
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function packLines(pack: GovernanceWorkflowPack) {
  return [
    `## ${pack.name}`,
    `- Slug: ${pack.slug}`,
    `- Status: ${pack.status}`,
    `- Buyer segment: ${pack.buyerSegment}`,
    `- Customer archetype: ${pack.customerArchetype}`,
    `- Scope: ${pack.scope}`,
    `- Pricing use: ${pack.pricingUse}`,
    "",
    "### Customer Inputs Required",
    markdownItems(pack.customerInputsRequired),
    "",
    "### Retention Policy Template",
    `- Default duration: ${pack.retentionPolicyTemplate.defaultDuration}`,
    `- Trigger: ${pack.retentionPolicyTemplate.retentionTrigger}`,
    `- Deletion gate: ${pack.retentionPolicyTemplate.deletionGate}`,
    `- Approval owner: ${pack.retentionPolicyTemplate.approvalOwner}`,
    "",
    "### Legal Review Workflow",
    markdownItems(pack.legalReviewWorkflow.steps),
    "",
    "### Required Approvals",
    markdownItems(pack.legalReviewWorkflow.requiredApprovals),
    "",
    "### External Gates",
    markdownItems(pack.legalReviewWorkflow.externalGates),
    "",
    "### Incident Export Workflow",
    `- Trigger: ${pack.incidentExportWorkflow.trigger}`,
    `- Release gate: ${pack.incidentExportWorkflow.releaseGate}`,
    markdownItems(pack.incidentExportWorkflow.exportPacket),
    "",
    "### Automation Boundaries",
    markdownItems(pack.automationBoundaries),
    "",
    "### Blocked Claims",
    markdownItems(pack.blockedClaims)
  ].join("\n");
}

export function buildAgentWorkspaceGovernancePacksBrief() {
  const summary = getAgentWorkspaceGovernancePacksSummary();

  return [
    "# SCRIMED Agent Workspace Governance Workflow Packs",
    "",
    `Status: ${summary.status}`,
    `Boundary: ${summary.boundary}`,
    "",
    "## CI Secret Contract",
    `- Bearer token secret: ${summary.ciSecretContract.bearerTokenSecret}`,
    `- Base URL variable: ${summary.ciSecretContract.optionalBaseUrlVariable}`,
    `- Workspace slug variable: ${summary.ciSecretContract.optionalWorkspaceSlugVariable}`,
    `- Required authenticated flag: ${summary.ciSecretContract.requiredSmokeFlag}`,
    "",
    ...summary.packs.flatMap((pack) => [packLines(pack), ""]),
    "## Next Implementation Step",
    summary.nextImplementationStep
  ].join("\n");
}
