import { getHealthcareValueRealizationSummary } from "./healthcareValueRealization";
import { getPilotDemoCommercialReadinessSummary } from "./pilotDemoCommercialReadiness";
import { getServiceDeliverySummary } from "./serviceDelivery";
import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type PilotValueEvidenceStage =
  | "discovery-ready"
  | "pilot-scope-ready"
  | "review-ready"
  | "external-approval-required";

export type PilotValueEvidenceArtifact = {
  id: string;
  title: string;
  audience: string;
  linkedValuePackage: string;
  linkedMetrics: string[];
  baselineProxy: string;
  targetEvidence: string;
  measurementPlan: string;
  reviewerRole: string;
  reviewGate: string;
  allowedUse: string;
  blockedClaims: string[];
  proofRoutes: string[];
  stage: PilotValueEvidenceStage;
  evidenceScore: number;
  auditHash: string;
};

export type PilotValueEvidencePacket = {
  id: string;
  name: string;
  buyerSegment: string;
  pilotWindow: "30-day" | "60-day" | "90-day";
  packetPurpose: string;
  evidenceArtifacts: string[];
  acceptanceCriteria: string[];
  humanReviewGate: string;
  commercialNextStep: string;
  retainedBoundary: string;
  auditHash: string;
};

export type PilotValueReviewerCheckpoint = {
  id: string;
  reviewerRole: string;
  checkpoint: string;
  passCriteria: string;
  failClosedBehavior: string;
};

export type PilotValueClaimControl = {
  claimRisk: string;
  blockedPhrase: string;
  safeReplacement: string;
  requiredEvidence: string;
};

export const pilotValueEvidenceRoute = "/pilot-value-evidence";
export const pilotValueEvidenceApiRoute = "/api/pilot-value-evidence";
export const pilotValueEvidenceBriefRoute = "/api/pilot-value-evidence/brief";
export const pilotValueEvidenceStatus =
  "pilot-value-evidence-packets-active-synthetic-no-commercial-guarantee";
export const pilotValueEvidenceBriefStatus =
  "pilot-value-evidence-brief-ready-no-customer-activation-authority";
export const pilotValueEvidenceUpdatedAt = "2026-07-09";

export const pilotValueEvidenceBoundary =
  "SCRIMED Pilot Value Evidence packages synthetic-only value metrics into buyer-ready pilot packets, acceptance criteria, reviewer checkpoints, and claim controls. It does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, final imaging interpretation, production deployment, customer activation, certification claims, audited financial reporting, valuation assurance, revenue guarantees, profit guarantees, ROI guarantees, or binding commercial offers.";

const blockedPilotValueClaims = [
  "live PHI processing",
  "autonomous clinical care",
  "diagnosis, treatment, prescribing, or triage",
  "patient outreach without consent and human approval",
  "payer submission or coverage determination",
  "EHR, RIS, PACS, HIS, pharmacy, or production connector writeback",
  "final imaging interpretation",
  "production deployment or customer activation",
  "certification, legal, or regulatory approval claim",
  "audited financial statement",
  "ROI guarantee",
  "revenue guarantee",
  "profit guarantee",
  "valuation assurance",
  "binding commercial offer"
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function evidenceHash(id: string, label: string) {
  return generateScrimedAuditHash({
    id,
    label,
    boundary: pilotValueEvidenceBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    updated: pilotValueEvidenceUpdatedAt
  });
}

function createArtifact(
  artifact: Omit<PilotValueEvidenceArtifact, "auditHash" | "evidenceScore"> & {
    evidenceScore: number;
  }
): PilotValueEvidenceArtifact {
  return {
    ...artifact,
    evidenceScore: clampScore(artifact.evidenceScore),
    auditHash: evidenceHash(artifact.id, artifact.title)
  };
}

function createPacket(packet: Omit<PilotValueEvidencePacket, "auditHash">): PilotValueEvidencePacket {
  return {
    ...packet,
    auditHash: evidenceHash(packet.id, packet.name)
  };
}

export function getPilotValueEvidenceSummary() {
  const valueRealization = getHealthcareValueRealizationSummary();
  const pilotReadiness = getPilotDemoCommercialReadinessSummary();
  const serviceDelivery = getServiceDeliverySummary();

  const artifacts: PilotValueEvidenceArtifact[] = [
    createArtifact({
      id: "workflow-baseline-proxy",
      title: "Workflow baseline proxy",
      audience: "Clinical operations and CMIO",
      linkedValuePackage: "30-day workflow value discovery",
      linkedMetrics: ["documentation-time-saved-proxy", "missing-documentation-risk-reduction"],
      baselineProxy: "Synthetic current-state packet assembly time, missing evidence count, and reviewer burden.",
      targetEvidence: "Reviewer-gated SCRIMED packet with time proxy, missing-evidence map, and audit hash.",
      measurementPlan: "Compare synthetic baseline artifact against the human-reviewed SCRIMED packet completion record.",
      reviewerRole: "Clinical operations reviewer",
      reviewGate: "Reviewer must approve metric interpretation before external sharing.",
      allowedUse: "Pilot value hypothesis, demo proof, and workflow discovery.",
      blockedClaims: ["ROI guarantee", "staffing reduction guarantee", "clinical outcome guarantee"],
      proofRoutes: [valueRealization.route, "/healthcare-optimization-command", "/clinical-robustness-lab"],
      stage: "pilot-scope-ready",
      evidenceScore: 93
    }),
    createArtifact({
      id: "prior-auth-evidence-map",
      title: "Prior authorization evidence map",
      audience: "RCM, payer workflow, compliance",
      linkedValuePackage: "Revenue-cycle documentation readiness packet",
      linkedMetrics: ["prior-auth-packet-completeness", "missing-documentation-risk-reduction"],
      baselineProxy: "Synthetic policy criteria mapped to incomplete symptoms, timing, and functional-status fields.",
      targetEvidence: "Human-reviewed completeness map with missing language and blocked-submission status.",
      measurementPlan: "Track evidence coverage, missing fields, source references, and reviewer signoff.",
      reviewerRole: "RCM compliance reviewer",
      reviewGate: "Human approval required before any payer-facing use.",
      allowedUse: "Prior-auth readiness demo and internal packet QA.",
      blockedClaims: ["payer submission authority", "coverage determination", "reimbursement guarantee"],
      proofRoutes: [pilotReadiness.route, "/scrimed-clinical-benchmark-suite", serviceDelivery.route],
      stage: "review-ready",
      evidenceScore: 94
    }),
    createArtifact({
      id: "referral-delay-proof",
      title: "Referral delay proof packet",
      audience: "Patient access and care coordination",
      linkedValuePackage: "Patient engagement readiness packet",
      linkedMetrics: ["referral-cycle-time-readiness", "follow-up-completion-readiness"],
      baselineProxy: "Synthetic referral queue with missing packet, provider-match, wait-time, and status drift signals.",
      targetEvidence: "Closed-loop synthetic status map with owner routing and reviewer escalation.",
      measurementPlan: "Measure synthetic time-to-review, missing packet detection, and owner assignment completeness.",
      reviewerRole: "Patient access lead",
      reviewGate: "Human review and consent pathway required before any live outreach.",
      allowedUse: "Access-center workflow demo and pilot scoping.",
      blockedClaims: ["patient outreach authority", "appointment scheduling authority", "care-plan modification"],
      proofRoutes: ["/scrimed-patient-context-gateway", "/health-records", valueRealization.route],
      stage: "pilot-scope-ready",
      evidenceScore: 89
    }),
    createArtifact({
      id: "interoperability-readiness-matrix",
      title: "Interoperability readiness matrix",
      audience: "CIO, integration, security, data governance",
      linkedValuePackage: "Interoperability readiness value packet",
      linkedMetrics: ["interoperability-discovery-completeness", "source-contract-completeness"],
      baselineProxy: "Synthetic HL7, FHIR, DICOM, X12, RIS, HIS, PACS, VPN, VM, database, and firewall map.",
      targetEvidence: "Connector readiness matrix with standards, authority blockers, and proof routes.",
      measurementPlan: "Score interface inventory, source contract completeness, security owner coverage, and blocked writeback controls.",
      reviewerRole: "Integration security reviewer",
      reviewGate: "External technical approval required before live connector implementation.",
      allowedUse: "Integration discovery and technical diligence.",
      blockedClaims: ["production connector approval", "raw schema exposure", "EHR writeback authority"],
      proofRoutes: ["/enterprise-healthcare-infrastructure", "/clinical-data-fabric", "/scrimed-hybrid-retrieval"],
      stage: "external-approval-required",
      evidenceScore: 92
    }),
    createArtifact({
      id: "agent-trace-diligence-proof",
      title: "Agent trace diligence proof",
      audience: "Enterprise diligence, security, AI governance",
      linkedValuePackage: "90-day enterprise value evidence packet",
      linkedMetrics: ["agent-trace-completeness", "source-contract-completeness"],
      baselineProxy: "Synthetic agent run with missing policy decision, missing tool permission, or missing reviewer note.",
      targetEvidence: "Trace-complete run envelope with model, tool, latency, cost, policy, reviewer, and failure metadata.",
      measurementPlan: "Score trace field completeness, policy decision coverage, blocked action clarity, and audit hash presence.",
      reviewerRole: "TrustOps reviewer",
      reviewGate: "Reviewer must confirm no token, PHI, or raw connector payload is exposed.",
      allowedUse: "AI governance diligence and pilot QA.",
      blockedClaims: ["protected tenant execution proof without AAL2", "security certification", "breach guarantee"],
      proofRoutes: ["/scrimed-llmops-observability", "/scrimed-agent-governance", "/scrimed-trustops"],
      stage: "review-ready",
      evidenceScore: 96
    }),
    createArtifact({
      id: "patient-education-readability-proof",
      title: "Patient education readability proof",
      audience: "Patient experience, care coordination, outpatient leadership",
      linkedValuePackage: "Patient engagement readiness packet",
      linkedMetrics: ["patient-education-comprehension-readiness", "follow-up-completion-readiness"],
      baselineProxy: "Synthetic education material with readability, accessibility, language, and source gaps.",
      targetEvidence: "Plain-language draft review with evidence, uncertainty, escalation wording, and reviewer checkpoint.",
      measurementPlan: "Score source attribution, reading level, accessibility flags, and final human approval state.",
      reviewerRole: "Patient education reviewer",
      reviewGate: "Clinical or patient-education reviewer must approve before patient-facing use.",
      allowedUse: "Education quality demo and draft review.",
      blockedClaims: ["treatment instruction", "prescribing guidance", "patient-specific medical advice"],
      proofRoutes: ["/scrimed-patient-context-gateway", "/scrimed-intelligence-platform", valueRealization.route],
      stage: "pilot-scope-ready",
      evidenceScore: 90
    }),
    createArtifact({
      id: "operations-capacity-signal-proof",
      title: "Operations capacity signal proof",
      audience: "Hospital operations and service-line leadership",
      linkedValuePackage: "60-day no-PHI operations optimization pilot",
      linkedMetrics: ["hospital-capacity-signal-review", "problem-resolution-value-closure"],
      baselineProxy: "Synthetic bed, discharge, staffing, throughput, escalation, and owner-routing signals.",
      targetEvidence: "Owner-routed operations signal map with escalation states and no-command boundary.",
      measurementPlan: "Measure signal classification, owner assignment, escalation completeness, and blocked production command state.",
      reviewerRole: "Operations command reviewer",
      reviewGate: "Operations leader review required before any external operational recommendation.",
      allowedUse: "Operations readiness demo and command-center pilot scope.",
      blockedClaims: ["bed assignment authority", "staffing command", "emergency operations authority"],
      proofRoutes: ["/enterprise-healthcare-infrastructure", "/scrimed-operating-command", "/strategic-problem-resolution"],
      stage: "discovery-ready",
      evidenceScore: 87
    }),
    createArtifact({
      id: "investor-proof-manifest",
      title: "Investor proof manifest",
      audience: "Investor diligence and strategic partners",
      linkedValuePackage: "90-day enterprise value evidence packet",
      linkedMetrics: ["investor-proof-completeness", "buyer-pilot-conversion-readiness"],
      baselineProxy: "Synthetic diligence artifact list with missing smoke, boundary, or proof-route evidence.",
      targetEvidence: "Dated proof manifest with route checks, owner gates, blocked claims, and next milestones.",
      measurementPlan: "Score smoke coverage, artifact presence, owner assignment, risk register linkage, and no-go boundary clarity.",
      reviewerRole: "Founder or diligence owner",
      reviewGate: "Qualified review required before investor distribution.",
      allowedUse: "Investor diligence readiness and narrative alignment.",
      blockedClaims: ["securities offering material", "valuation assurance", "investment advice"],
      proofRoutes: ["/investor-readiness", "/investor-audience-readiness", "/deployment-drift-guard"],
      stage: "review-ready",
      evidenceScore: 91
    })
  ];

  const packets: PilotValueEvidencePacket[] = [
    createPacket({
      id: "workflow-discovery-packet",
      name: "Workflow discovery evidence packet",
      buyerSegment: "Clinical operations and CMIO",
      pilotWindow: "30-day",
      packetPurpose: "Turn documentation and missing-evidence pain into a measurable no-PHI discovery scope.",
      evidenceArtifacts: ["workflow-baseline-proxy", "agent-trace-diligence-proof"],
      acceptanceCriteria: [
        "Synthetic baseline and target packet are both audit-hashed.",
        "Every clinical-facing output is reviewer-gated.",
        "Blocked claims include ROI, staffing reduction, and clinical outcome guarantees."
      ],
      humanReviewGate: "Clinical operations reviewer approval before buyer distribution.",
      commercialNextStep: "Convert to paid workflow discovery assessment with retained no-live-care boundary.",
      retainedBoundary: "Not an ROI guarantee, audited labor-savings report, or clinical outcome claim."
    }),
    createPacket({
      id: "rcm-documentation-packet",
      name: "RCM documentation evidence packet",
      buyerSegment: "RCM and prior authorization teams",
      pilotWindow: "60-day",
      packetPurpose: "Show documentation completeness and denial-review readiness without payer submission.",
      evidenceArtifacts: ["prior-auth-evidence-map", "agent-trace-diligence-proof"],
      acceptanceCriteria: [
        "Payer submission remains blocked.",
        "Each missing documentation signal has source provenance.",
        "Reviewer signoff is required before external packet use."
      ],
      humanReviewGate: "RCM compliance reviewer approval.",
      commercialNextStep: "Offer a review-gated RCM documentation readiness pilot.",
      retainedBoundary: "No payer submission, billing submission, coverage determination, or reimbursement guarantee."
    }),
    createPacket({
      id: "patient-access-packet",
      name: "Patient access evidence packet",
      buyerSegment: "Patient access and care coordination",
      pilotWindow: "60-day",
      packetPurpose: "Show referral and follow-up risk visibility without patient outreach or scheduling authority.",
      evidenceArtifacts: ["referral-delay-proof", "patient-education-readability-proof"],
      acceptanceCriteria: [
        "Synthetic-only patient journey scenarios are used.",
        "Human review and consent path are required for any live outreach.",
        "Education drafts preserve uncertainty and source attribution."
      ],
      humanReviewGate: "Patient access lead and patient education reviewer approval.",
      commercialNextStep: "Scope a patient engagement readiness pilot with no live outreach.",
      retainedBoundary: "No live patient outreach, scheduling command, care-plan modification, or patient-specific medical advice."
    }),
    createPacket({
      id: "interoperability-diligence-packet",
      name: "Interoperability diligence packet",
      buyerSegment: "CIO, security, integration teams",
      pilotWindow: "90-day",
      packetPurpose: "Convert healthcare IT complexity into a standards, source-contract, and approval evidence map.",
      evidenceArtifacts: ["interoperability-readiness-matrix", "agent-trace-diligence-proof"],
      acceptanceCriteria: [
        "No raw schemas or connector payloads are exposed.",
        "Production connector approval remains external-review-required.",
        "EHR writeback and payer actions stay blocked."
      ],
      humanReviewGate: "Integration security reviewer and data governance owner approval.",
      commercialNextStep: "Sell technical discovery before any connector implementation.",
      retainedBoundary: "Not production connector approval, EHR writeback, raw schema review, or live PHI authorization."
    }),
    createPacket({
      id: "investor-diligence-packet",
      name: "Investor diligence evidence packet",
      buyerSegment: "Angel, strategic, private, clinic, and partner investors",
      pilotWindow: "90-day",
      packetPurpose: "Turn product, proof, route, safety, and commercial readiness signals into a claims-safe diligence package.",
      evidenceArtifacts: ["investor-proof-manifest", "workflow-baseline-proxy", "operations-capacity-signal-proof"],
      acceptanceCriteria: [
        "No securities, valuation, or investment-advice language.",
        "No certification, customer go-live, or production deployment claims.",
        "Every artifact has proof routes and audit hashes."
      ],
      humanReviewGate: "Founder and qualified diligence reviewer approval before distribution.",
      commercialNextStep: "Use as investor-readiness appendix and buyer-pilot proof map.",
      retainedBoundary: "Not securities material, valuation assurance, investment advice, certification, or customer go-live approval."
    })
  ];

  const reviewerCheckpoints: PilotValueReviewerCheckpoint[] = [
    {
      id: "clinical-output-boundary",
      reviewerRole: "Clinical reviewer",
      checkpoint: "Clinical-facing artifacts are decision-support and education only.",
      passCriteria: "No diagnosis, treatment, prescribing, triage, or live-care language appears.",
      failClosedBehavior: "Block packet promotion and route to clinical authority readiness."
    },
    {
      id: "finance-roi-boundary",
      reviewerRole: "Finance reviewer",
      checkpoint: "Value evidence is not represented as audited savings, revenue, profit, or ROI.",
      passCriteria: "All metrics are labeled proxy, synthetic, or measurement framework evidence.",
      failClosedBehavior: "Remove financial claim and require qualified finance review."
    },
    {
      id: "payer-boundary",
      reviewerRole: "RCM compliance reviewer",
      checkpoint: "RCM artifacts do not imply payer submission, claim submission, or coverage determination.",
      passCriteria: "Draft-only and human-review language is present.",
      failClosedBehavior: "Block RCM packet distribution until corrected."
    },
    {
      id: "connector-boundary",
      reviewerRole: "Integration security reviewer",
      checkpoint: "Interoperability artifacts do not expose raw schemas, raw connector payloads, or writeback authority.",
      passCriteria: "Synthetic metadata and external approval blockers are visible.",
      failClosedBehavior: "Move packet to external-approval-required."
    },
    {
      id: "distribution-boundary",
      reviewerRole: "Founder or diligence owner",
      checkpoint: "Buyer or investor packet is safe to distribute.",
      passCriteria: "No secrets, PHI, token values, certification claims, valuation assurance, or customer go-live statements.",
      failClosedBehavior: "Hold packet in internal review and refresh proof routes."
    }
  ];

  const claimControls: PilotValueClaimControl[] = [
    {
      claimRisk: "ROI overclaim",
      blockedPhrase: "ROI guarantee",
      safeReplacement: "synthetic value hypothesis with reviewer-gated measurement plan",
      requiredEvidence: "baseline proxy, target direction, proof route, and reviewer signoff"
    },
    {
      claimRisk: "Revenue overclaim",
      blockedPhrase: "revenue guarantee",
      safeReplacement: "commercial readiness signal",
      requiredEvidence: "pilot scope, buyer segment, offer path, and retained boundary"
    },
    {
      claimRisk: "Clinical authority overclaim",
      blockedPhrase: "clinical outcome guarantee",
      safeReplacement: "decision-support workflow readiness",
      requiredEvidence: "clinical reviewer checkpoint and no-live-care boundary"
    },
    {
      claimRisk: "Payer workflow overclaim",
      blockedPhrase: "payer submission authority",
      safeReplacement: "draft documentation completeness review",
      requiredEvidence: "human review gate and blocked-submission state"
    },
    {
      claimRisk: "Integration overclaim",
      blockedPhrase: "production connector approved",
      safeReplacement: "synthetic interoperability discovery complete",
      requiredEvidence: "standards map, approval owner, and no-writeback boundary"
    },
    {
      claimRisk: "Investor overclaim",
      blockedPhrase: "valuation assurance",
      safeReplacement: "diligence readiness evidence",
      requiredEvidence: "dated proof manifest, risk register link, and qualified-review note"
    },
    {
      claimRisk: "Customer activation overclaim",
      blockedPhrase: "customer activation authority",
      safeReplacement: "pilot-readiness packet prepared for review",
      requiredEvidence: "acceptance criteria, reviewer gate, and no-production-authorization header"
    }
  ];

  return {
    service: "scrimed-pilot-value-evidence",
    status: pilotValueEvidenceStatus,
    briefStatus: pilotValueEvidenceBriefStatus,
    route: pilotValueEvidenceRoute,
    apiRoute: pilotValueEvidenceApiRoute,
    briefRoute: pilotValueEvidenceBriefRoute,
    updated: pilotValueEvidenceUpdatedAt,
    boundary: pilotValueEvidenceBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    authority: {
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      commercialAuthority: "not-binding-commercial-offer",
      customerActivationAuthority: "not-customer-go-live-approval",
      financialAuthority: "not-audited-financial-report",
      roiAuthority: "not-roi-guarantee",
      revenueAuthority: "not-revenue-guarantee",
      productionAuthority: "not-production-authorized",
      payerAuthority: "not-authorized",
      ehrWritebackAuthority: "not-authorized",
      certificationAuthority: "not-certified"
    },
    sourceAlignment: {
      valueRealizationStatus: valueRealization.status,
      valueMetricCount: valueRealization.metricCount,
      valuePackageCount: valueRealization.packageCount,
      pilotReadinessStatus: pilotReadiness.status,
      serviceDeliveryStatus: serviceDelivery.status
    },
    artifactCount: artifacts.length,
    packetCount: packets.length,
    reviewerCheckpointCount: reviewerCheckpoints.length,
    claimControlCount: claimControls.length,
    humanReviewRequiredCount: artifacts.length + packets.length,
    averageEvidenceScore: clampScore(
      artifacts.reduce((total, artifact) => total + artifact.evidenceScore, 0) / artifacts.length
    ),
    proofRouteCount: new Set([
      ...artifacts.flatMap((artifact) => artifact.proofRoutes),
      ...packets.flatMap((packet) =>
        packet.evidenceArtifacts.flatMap(
          (artifactId) => artifacts.find((artifact) => artifact.id === artifactId)?.proofRoutes ?? []
        )
      )
    ]).size,
    artifacts,
    topArtifacts: artifacts.slice(0, 5),
    packets,
    topPackets: packets.slice(0, 4),
    reviewerCheckpoints,
    claimControls,
    blockedClaims: blockedPilotValueClaims,
    nextBestMove:
      "Attach the highest-fit packet to a buyer segment, demo route, acceptance criteria, reviewer checkpoint, and no-authority distribution gate before external sharing."
  };
}

export function buildPilotValueEvidenceBrief() {
  const summary = getPilotValueEvidenceSummary();

  return [
    "# SCRIMED Pilot Value Evidence Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Evidence artifacts: ${summary.artifactCount}`,
    `Evidence packets: ${summary.packetCount}`,
    `Reviewer checkpoints: ${summary.reviewerCheckpointCount}`,
    `Claim controls: ${summary.claimControlCount}`,
    `Average evidence score: ${summary.averageEvidenceScore}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is synthetic-only pilot value evidence. It does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, final imaging interpretation, production deployment, customer activation, certification claims, audited financial reporting, valuation assurance, revenue guarantees, profit guarantees, ROI guarantees, or binding commercial offers.",
    "",
    "## Evidence Packets",
    ...summary.packets.map(
      (packet) =>
        `- ${packet.name} (${packet.pilotWindow}, ${packet.buyerSegment}): ${packet.packetPurpose} Boundary: ${packet.retainedBoundary}`
    ),
    "",
    "## Evidence Artifacts",
    ...summary.topArtifacts.map(
      (artifact) =>
        `- ${artifact.title} (${artifact.stage}, score ${artifact.evidenceScore}): ${artifact.measurementPlan} Review: ${artifact.reviewGate}`
    ),
    "",
    "## Reviewer Checkpoints",
    ...summary.reviewerCheckpoints.map(
      (checkpoint) =>
        `- ${checkpoint.reviewerRole}: ${checkpoint.checkpoint} Pass: ${checkpoint.passCriteria} Fail closed: ${checkpoint.failClosedBehavior}`
    ),
    "",
    "## Claim Controls",
    ...summary.claimControls.map(
      (control) =>
        `- ${control.claimRisk}: block "${control.blockedPhrase}" and use "${control.safeReplacement}" with ${control.requiredEvidence}.`
    ),
    "",
    `Next best move: ${summary.nextBestMove}`
  ].join("\n");
}
