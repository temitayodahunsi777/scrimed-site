export type ContinuousReviewSourceType =
  | "official-framework"
  | "official-standard"
  | "internal-operating-source";

export type ContinuousReviewStatus =
  | "active-control-plane"
  | "human-review-required"
  | "internal-research-only"
  | "external-readiness-required";

export type ContinuousReviewSource = {
  name: string;
  url: string;
  sourceType: ContinuousReviewSourceType;
  reviewedAt: string;
  signal: string;
  scrimedApplication: string;
};

export type ContinuousReviewAgent = {
  slug: string;
  name: string;
  status: ContinuousReviewStatus;
  mission: string;
  cadence: string;
  watches: string[];
  allowedActions: string[];
  escalationTriggers: string[];
  blockedActions: string[];
  evidenceRoutes: string[];
};

export type ContinuousReviewLoop = {
  stage: string;
  cadence: string;
  owner: string;
  action: string;
  evidence: string[];
  errorReductionMechanism: string;
  boundary: string;
};

export type ContinuousAuditControl = {
  control: string;
  owner: string;
  status: ContinuousReviewStatus;
  purpose: string;
  requiredEvidence: string[];
  hardStops: string[];
};

export type InnovationResearchTrack = {
  slug: string;
  title: string;
  visibility: "internal-only" | "board-review" | "future-public-after-approval";
  owner: string;
  researchQuestion: string;
  nearTermWork: string[];
  promotionGate: string[];
  blockedClaims: string[];
};

export type InternalResearchAssignment = {
  team: string;
  focus: string;
  cadence: string;
  outputs: string[];
  restrictions: string[];
};

export const continuousReviewAuditRoute = "/continuous-review-audit";
export const continuousReviewAuditApiRoute = "/api/continuous-review-audit";
export const continuousReviewAuditBriefRoute = "/api/continuous-review-audit/brief";
export const continuousReviewAuditStatus =
  "continuous-review-audit-innovation-control-plane-active";
export const continuousReviewAuditBriefStatus =
  "continuous-review-audit-brief-ready-no-autonomous-claims";
export const continuousReviewAuditUpdatedAt = "2026-06-25";

export const continuousReviewAuditBoundary =
  "SCRIMED Continuous Review, Audit, and Innovation Control Plane organizes 24/7 agent-assisted review, evidence checks, error reduction loops, human escalation, and internal future research. It does not provide managed 24/7 SOC/MDR coverage, autonomous production remediation, legal advice, security certification, regulatory approval, PHI processing authority, clinical care authority, public quantum capability claims, product commitment, investment advice, or permission to bypass human review.";

export const continuousReviewSources: ContinuousReviewSource[] = [
  {
    name: "NIST Cybersecurity Framework 2.0",
    url: "https://www.nist.gov/cyberframework",
    sourceType: "official-framework",
    reviewedAt: continuousReviewAuditUpdatedAt,
    signal:
      "NIST frames CSF 2.0 as a way for industry, government, and organizations to reduce cybersecurity risks, with governance, profiles, references, and practical implementation resources.",
    scrimedApplication:
      "Map 24/7 audit loops to Govern, Identify, Protect, Detect, Respond, and Recover language without claiming managed SOC coverage."
  },
  {
    name: "NIST AI Risk Management Framework",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
    sourceType: "official-framework",
    reviewedAt: continuousReviewAuditUpdatedAt,
    signal:
      "NIST AI RMF is voluntary and intended to improve incorporation of trustworthiness considerations into design, development, use, and evaluation of AI systems.",
    scrimedApplication:
      "Use Map, Measure, Manage, and Govern style evidence to review agent outputs, drift, citations, human oversight, and improvement actions."
  },
  {
    name: "NIST Post-Quantum Cryptography Standards",
    url: "https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards",
    sourceType: "official-standard",
    reviewedAt: continuousReviewAuditUpdatedAt,
    signal:
      "NIST finalized post-quantum encryption standards and encourages system administrators to begin transitioning because integration takes time.",
    scrimedApplication:
      "Assign quantum-safe cryptography readiness to internal research, beginning with dependency inventory, vendor questions, key-lifecycle mapping, and no-public-claim controls."
  },
  {
    name: "SCRIMED Trust and Safety Operations",
    url: "/trust-safety-operations",
    sourceType: "internal-operating-source",
    reviewedAt: continuousReviewAuditUpdatedAt,
    signal:
      "SCRIMED already defines trust, safety, monitoring, auditing, fixing, improving, and escalation loops while retaining production managed coverage as a staffed external gate.",
    scrimedApplication:
      "Promote TrustOps from a response model into a continuous review and audit operating system with regression, evidence, claims, security, and innovation monitors."
  },
  {
    name: "SCRIMED Global Certification Readiness",
    url: "/global-certification-readiness",
    sourceType: "internal-operating-source",
    reviewedAt: continuousReviewAuditUpdatedAt,
    signal:
      "SCRIMED already maps HIPAA/BAA, FDA CDS/SaMD, SOC 2, HITRUST, ISO, EU AI Act, GDPR, NHS DTAC, MHRA, Australia, and regional approval gates.",
    scrimedApplication:
      "Feed continuous audit exceptions into approval/certification evidence rooms before claims, pilots, or production pathways expand."
  }
];

export const continuousReviewAgents: ContinuousReviewAgent[] = [
  {
    slug: "accuracy-review-agent",
    name: "Accuracy Review Agent",
    status: "active-control-plane",
    mission:
      "Sample outputs, workflow results, API summaries, and buyer-facing copy for factual consistency, stale claims, missing caveats, and unsupported conclusions.",
    cadence: "Continuous queue with daily sampled review and weekly executive exception digest.",
    watches: ["product pages", "API summaries", "briefs", "proof packets", "buyer-facing claims"],
    allowedActions: ["flag discrepancy", "open review item", "route to owner", "recommend smoke assertion"],
    escalationTriggers: ["clinical implication", "certification claim", "buyer-impacting metric", "source-date drift"],
    blockedActions: ["silently rewrite public claims", "approve clinical content", "certify accuracy without reviewer"],
    evidenceRoutes: ["/claims", "/qa-claim-guard", "/source-intelligence", "/product"]
  },
  {
    slug: "evidence-attribution-agent",
    name: "Evidence Attribution Agent",
    status: "active-control-plane",
    mission:
      "Ensure every strategic, regulatory, market, technical, and product assertion has a source, route, owner, or explicit boundary.",
    cadence: "Continuous on new routes and briefs; daily source-drift digest.",
    watches: ["source URLs", "reviewed dates", "proof routes", "blocked claims", "documentation updates"],
    allowedActions: ["mark missing source", "queue source refresh", "add owner checklist", "request citation review"],
    escalationTriggers: ["unsupported public claim", "stale regulatory source", "broken evidence route"],
    blockedActions: ["invent source support", "quote large copyrighted text", "claim third-party endorsement"],
    evidenceRoutes: ["/source-intelligence", "/competitive-intelligence", "/global-certification-readiness"]
  },
  {
    slug: "claims-boundary-agent",
    name: "Claims and Boundary Agent",
    status: "active-control-plane",
    mission:
      "Compare public language, briefs, APIs, and sales paths against prohibited claims, authority boundaries, and no-PHI/no-live-care constraints.",
    cadence: "Every release, every buyer packet, and every claims-related route change.",
    watches: ["claims register", "release notes", "buyer packets", "homepage copy", "API boundary headers"],
    allowedActions: ["block unsupported claim", "attach boundary", "request legal/privacy review"],
    escalationTriggers: ["HIPAA/FDA/SOC/ISO claim", "ROI guarantee", "clinical authority wording", "customer reference"],
    blockedActions: ["approve legal claim", "approve advertising substantiation", "waive external review"],
    evidenceRoutes: ["/claims", "/approvals-readiness", "/global-certification-readiness", "/qa-claim-guard"]
  },
  {
    slug: "security-drift-agent",
    name: "Security Drift Agent",
    status: "human-review-required",
    mission:
      "Track dependency posture, route headers, fail-closed behavior, evidence vault boundaries, and post-quantum readiness signals.",
    cadence: "Daily dependency/config review, weekly protected fail-closed review, quarterly quantum-safe inventory.",
    watches: ["package versions", "headers", "protected API behavior", "auth gates", "cryptographic dependency inventory"],
    allowedActions: ["open security drift item", "recommend patch", "route to security owner", "request audit evidence"],
    escalationTriggers: ["critical CVE", "protected route opens publicly", "secret exposure risk", "obsolete cryptographic dependency"],
    blockedActions: ["apply unmanaged production patch", "rotate customer secrets autonomously", "claim SOC/MDR coverage"],
    evidenceRoutes: ["/service-reliability", "/trust-center/security", "/release-continuity", "/continuous-review-audit"]
  },
  {
    slug: "qa-regression-agent",
    name: "QA Regression Agent",
    status: "active-control-plane",
    mission:
      "Continuously translate discovered mistakes into deterministic smoke, typecheck, lint, build, and protected fail-closed assertions.",
    cadence: "Every change set; nightly regression queue design; weekly smoke scope review.",
    watches: ["smoke failures", "route inventory", "typecheck output", "build output", "known limitations"],
    allowedActions: ["propose test", "expand smoke coverage", "classify regression", "route owner"],
    escalationTriggers: ["route-count mismatch", "broken buyer-critical page", "missing boundary header", "protected path exposure"],
    blockedActions: ["bypass failing smoke", "mark retained proof without protected packet", "run authenticated happy path without AAL2"],
    evidenceRoutes: ["/navigation", "/qa-evidence", "/qa-run-control", "/release-continuity"]
  },
  {
    slug: "incident-learning-agent",
    name: "Incident Learning Agent",
    status: "human-review-required",
    mission:
      "Convert TrustOps incidents, near misses, buyer questions, and support gaps into root-cause notes, controls, and future prevention tasks.",
    cadence: "Immediate for high/critical issues, daily for open incidents, monthly for learning review.",
    watches: ["TrustOps incidents", "customer questions", "legal-hold watch", "post-incident reviews"],
    allowedActions: ["summarize incident", "draft prevention task", "recommend reviewer", "connect evidence route"],
    escalationTriggers: ["critical incident", "legal-hold signal", "privacy/security issue", "repeated defect"],
    blockedActions: ["make breach determination", "notify regulator", "close incident without reviewer"],
    evidenceRoutes: ["/trust-safety-operations", "/pilot-workspace/access", "/service-reliability"]
  },
  {
    slug: "innovation-scout-agent",
    name: "Innovation Scout Agent",
    status: "internal-research-only",
    mission:
      "Track AI, healthcare infrastructure, interoperability, security, quantum-safe, privacy-preserving, and deployment futures for internal research assignment.",
    cadence: "Weekly horizon scan, monthly research council, quarterly promotion gate.",
    watches: ["official standards", "technical shifts", "competitor signals", "buyer requests", "internal limitations"],
    allowedActions: ["create research brief", "assign internal team", "recommend prototype", "flag claim guard"],
    escalationTriggers: ["strategic inflection", "security standard change", "regulatory movement", "platform opportunity"],
    blockedActions: ["publish quantum claims", "promise future product", "claim clinical advantage", "commit to procurement timeline"],
    evidenceRoutes: ["/source-intelligence", "/strategic-intelligence", "/global-certification-readiness"]
  }
];

export const continuousReviewLoops: ContinuousReviewLoop[] = [
  {
    stage: "Always-on sentinels",
    cadence: "Continuous design; public smoke at release and scheduled when infrastructure is approved.",
    owner: "QA Regression Agent + Release Steward",
    action: "Watch route health, boundary headers, proof-stack posture, protected fail-closed paths, and critical API contracts.",
    evidence: ["public smoke output", "route inventory", "boundary headers", "protected fail-closed status"],
    errorReductionMechanism:
      "Turns every repeated route or header mistake into a deterministic smoke assertion.",
    boundary:
      "Continuous sentinel design is not a managed SOC/MDR service and cannot claim every issue will be detected."
  },
  {
    stage: "Accuracy sampling",
    cadence: "Daily sample queue plus high-risk output review before buyer use.",
    owner: "Accuracy Review Agent + domain owner",
    action: "Sample product copy, API summaries, briefs, and workflow outputs for factual accuracy and unsupported claims.",
    evidence: ["sample log", "owner decision", "source route", "fix or accepted-risk note"],
    errorReductionMechanism:
      "Creates feedback loops for stale facts, overclaims, missing sources, and ambiguous language.",
    boundary:
      "Sampling improves accuracy but does not replace qualified legal, clinical, security, or regulatory review."
  },
  {
    stage: "Evidence attribution sweep",
    cadence: "Daily for new source-sensitive work; weekly source aging review.",
    owner: "Evidence Attribution Agent",
    action: "Check that official sources, reviewed dates, proof routes, and blocked claims remain attached.",
    evidence: ["source register", "reviewedAt date", "linked route", "missing-source ticket"],
    errorReductionMechanism:
      "Reduces hallucination risk by requiring source-backed or boundary-backed claims.",
    boundary:
      "Source mapping does not create third-party endorsement, certification, or legal authority."
  },
  {
    stage: "Claims and authority guard",
    cadence: "Every release and every buyer packet.",
    owner: "Claims and Boundary Agent + qualified reviewer when needed",
    action: "Compare claims against allowed language, prohibited claims, approval boundaries, and data authority.",
    evidence: ["claims decision", "blocked claim list", "reviewer route", "release note"],
    errorReductionMechanism:
      "Prevents sales, product, investor, and public copy from outrunning retained evidence.",
    boundary:
      "Agents may block and route claims; they do not grant legal approval or certification."
  },
  {
    stage: "Security and dependency drift review",
    cadence: "Daily triage, weekly control review, quarterly post-quantum inventory.",
    owner: "Security Drift Agent + engineering owner",
    action: "Track dependency, auth, cryptography, route, and protected access drift.",
    evidence: ["dependency review", "config review", "cryptography inventory", "security owner note"],
    errorReductionMechanism:
      "Surfaces risky drift early before it becomes buyer-impacting or production-blocking.",
    boundary:
      "Security review is readiness evidence only; it is not certification, pentest attestation, or managed response coverage."
  },
  {
    stage: "Human escalation and remediation",
    cadence: "Immediate for high/critical items; daily for open work queue.",
    owner: "Founder, domain owner, security/privacy/legal/clinical reviewer as needed",
    action: "Assign accountable owner, implement fix, preserve evidence, and require validation before reopening path.",
    evidence: ["owner assignment", "diff", "test result", "approval note", "residual-risk note"],
    errorReductionMechanism:
      "Keeps remediation accountable instead of relying on unattended autonomous repair.",
    boundary:
      "No agent may autonomously remediate production healthcare, legal, clinical, or security-critical workflows."
  },
  {
    stage: "Innovation horizon scan",
    cadence: "Weekly internal scan and monthly research council.",
    owner: "Innovation Scout Agent + Internal Research Team",
    action: "Convert future signals into research assignments, prototype gates, and claim-guarded roadmap options.",
    evidence: ["research brief", "prototype decision", "claim guard", "promotion criteria"],
    errorReductionMechanism:
      "Separates useful future sensing from public hype or premature product commitment.",
    boundary:
      "Innovation research remains internal until governance, security, evidence, and product readiness gates approve release."
  },
  {
    stage: "Governance rehearsal",
    cadence: "Quarterly",
    owner: "Executive governance council",
    action:
      "Review repeated defects, open risks, innovation bets, quantum-safe readiness, audit gaps, and external-review needs.",
    evidence: ["quarterly review packet", "risk register", "roadmap decision", "external reviewer task"],
    errorReductionMechanism:
      "Moves recurring mistakes into durable controls and moves mature research into governed build work.",
    boundary:
      "Governance rehearsal is internal readiness; external claims still require qualified approval."
  }
];

export const continuousAuditControls: ContinuousAuditControl[] = [
  {
    control: "No autonomous production remediation",
    owner: "Release Steward + Security",
    status: "human-review-required",
    purpose: "Prevent agents from silently changing production behavior or regulated workflows.",
    requiredEvidence: ["owner approval", "diff", "validation result", "rollback note"],
    hardStops: ["production change without reviewer", "clinical workflow mutation", "credential rotation without owner"]
  },
  {
    control: "No-PHI review queue",
    owner: "Privacy + TrustOps",
    status: "active-control-plane",
    purpose: "Keep review and audit evidence metadata-only until PHI authority exists.",
    requiredEvidence: ["PHI hard-stop result", "safe metadata template", "protected route status"],
    hardStops: ["patient identifier", "clinical record", "payer member identifier", "artifact URL"]
  },
  {
    control: "Boundary header enforcement",
    owner: "QA Regression Agent",
    status: "active-control-plane",
    purpose: "Ensure buyer-critical APIs carry no-authority, no-PHI, no-certification, and no-live-care headers.",
    requiredEvidence: ["smoke assertion", "API route", "header list"],
    hardStops: ["missing data boundary", "missing PHI block", "missing security certification block"]
  },
  {
    control: "Evidence source aging",
    owner: "Evidence Attribution Agent",
    status: "active-control-plane",
    purpose: "Refresh official-source review dates and route stale source-sensitive claims for human review.",
    requiredEvidence: ["source URL", "reviewedAt", "owner", "refresh decision"],
    hardStops: ["stale legal/regulatory source", "unsupported market claim", "missing source owner"]
  },
  {
    control: "Post-incident learning",
    owner: "Incident Learning Agent",
    status: "human-review-required",
    purpose: "Require every meaningful incident, near miss, or repeated defect to create a prevention action.",
    requiredEvidence: ["root cause", "owner", "prevention task", "validation route"],
    hardStops: ["incident closed without review", "legal hold ignored", "customer-impacting issue unowned"]
  },
  {
    control: "Internal research claim guard",
    owner: "Innovation Scout Agent + Claims reviewer",
    status: "internal-research-only",
    purpose: "Keep quantum, frontier AI, privacy-preserving compute, and future infrastructure work internal until approved.",
    requiredEvidence: ["research brief", "visibility flag", "blocked claims", "promotion gate"],
    hardStops: ["public quantum advantage claim", "future product guarantee", "clinical superiority claim"]
  }
];

export const innovationResearchTracks: InnovationResearchTrack[] = [
  {
    slug: "quantum-safe-readiness",
    title: "Quantum-Safe and Post-Quantum Readiness",
    visibility: "internal-only",
    owner: "Internal Research Team - Quantum Horizon",
    researchQuestion:
      "How should SCRIMED inventory cryptographic dependencies, vendor commitments, key lifecycles, and buyer questions before post-quantum migration becomes procurement-critical?",
    nearTermWork: [
      "Map public/private key use across app, Supabase, Vercel, vendor APIs, and buyer evidence exchange",
      "Track NIST PQC standards and vendor support timelines",
      "Prepare buyer-facing answers that say readiness planning is internal and no quantum-safe certification is claimed",
      "Identify where hybrid TLS, signatures, backups, and archive retention may matter later"
    ],
    promotionGate: [
      "Security owner approves inventory",
      "Vendor posture is documented",
      "No customer cryptography promise is made",
      "External security review confirms messaging"
    ],
    blockedClaims: ["quantum-safe certified", "quantum clinical advantage", "post-quantum production ready"]
  },
  {
    slug: "agentic-review-automation",
    title: "Agentic Review Automation",
    visibility: "board-review",
    owner: "Internal Research Team - AgentOS Lab",
    researchQuestion:
      "How can SCRIMED reduce human error by using agents to propose review items, tests, and evidence links while humans retain approval authority?",
    nearTermWork: [
      "Prototype review queues for accuracy, source attribution, claims boundaries, and smoke suggestions",
      "Score confidence and route low-confidence outputs to human reviewers",
      "Measure false-positive and false-negative rates in synthetic review tasks"
    ],
    promotionGate: [
      "Human override is retained",
      "False-negative threshold is acceptable",
      "Audit trail is durable",
      "No clinical approval is delegated"
    ],
    blockedClaims: ["autonomous audit approval", "error-free AI review", "clinician-free validation"]
  },
  {
    slug: "privacy-preserving-compute",
    title: "Privacy-Preserving Compute",
    visibility: "internal-only",
    owner: "Internal Research Team - Privacy Lab",
    researchQuestion:
      "Which privacy-preserving methods could eventually support analytics, evaluation, or federation without moving sensitive healthcare data?",
    nearTermWork: [
      "Compare de-identification, synthetic data, confidential compute, federated evaluation, and differential privacy patterns",
      "Define no-PHI prototype constraints",
      "Map privacy counsel review questions"
    ],
    promotionGate: [
      "Privacy/legal approval",
      "Threat model complete",
      "Customer data path blocked until agreement",
      "Synthetic-only proof exists"
    ],
    blockedClaims: ["privacy guaranteed", "HIPAA approved analytics", "customer data safe by default"]
  },
  {
    slug: "clinical-simulation-lab",
    title: "Clinical Simulation and Synthetic Safety Lab",
    visibility: "board-review",
    owner: "Internal Research Team - Validation Trust Lab",
    researchQuestion:
      "How can SCRIMED improve synthetic evaluation depth for clinical operations workflows without crossing diagnosis or treatment boundaries?",
    nearTermWork: [
      "Add adversarial synthetic scenarios",
      "Measure source attribution, escalation, abstention, and reviewer burden",
      "Create specialty-specific review prompts for oncology, cardiology, endocrinology, and RCM"
    ],
    promotionGate: [
      "Clinical governance review",
      "No patient-specific claims",
      "Synthetic-only data",
      "FDA/CDS/SaMD classification review before external claims"
    ],
    blockedClaims: ["clinical validation complete", "diagnostic accuracy", "treatment optimization"]
  },
  {
    slug: "interoperability-futures",
    title: "Interoperability and Sovereign Deployment Futures",
    visibility: "future-public-after-approval",
    owner: "Internal Research Team - Interoperability Futures",
    researchQuestion:
      "Which interoperability, data residency, and sovereign deployment patterns will matter most for global health-system buyers?",
    nearTermWork: [
      "Track FHIR, SMART, DICOMweb, X12, IHE, terminology, residency, and regional procurement signals",
      "Prototype deployment-profile gates",
      "Map public-sector buyer evidence requirements"
    ],
    promotionGate: [
      "Regional counsel review",
      "Customer-specific deployment profile",
      "Security/privacy evidence",
      "No production connector promise"
    ],
    blockedClaims: ["sovereign-ready certified", "EHR production approved", "public-sector approved"]
  }
];

export const internalResearchAssignments: InternalResearchAssignment[] = [
  {
    team: "Quantum Horizon",
    focus: "Post-quantum cryptography inventory, vendor posture, key lifecycle, and future buyer diligence.",
    cadence: "Monthly internal research brief; quarterly security review.",
    outputs: ["PQC dependency inventory", "vendor question set", "blocked quantum claims", "migration watchlist"],
    restrictions: ["internal-only", "no buyer quantum claims", "no production cryptography change without security review"]
  },
  {
    team: "AgentOS Lab",
    focus: "Agent-assisted review queues, audit scoring, auto-test suggestions, and human approval checkpoints.",
    cadence: "Weekly prototype review; monthly governance demo.",
    outputs: ["review queue spec", "false-negative metrics", "human override matrix"],
    restrictions: ["no autonomous approval", "no clinical validation delegation", "no unattended protected happy path"]
  },
  {
    team: "Validation Trust Lab",
    focus: "Adversarial synthetic scenarios, accuracy sampling, and specialty workflow safety evaluation.",
    cadence: "Weekly scenario review; monthly clinical-governance readout.",
    outputs: ["synthetic scenario set", "error taxonomy", "reviewer-burden metric"],
    restrictions: ["synthetic-only", "no diagnosis claims", "clinical reviewer required before external use"]
  },
  {
    team: "Privacy Lab",
    focus: "Privacy-preserving analytics, de-identification boundaries, and no-PHI evaluation methods.",
    cadence: "Biweekly privacy research review.",
    outputs: ["privacy pattern comparison", "DPIA question set", "no-PHI prototype constraints"],
    restrictions: ["no customer data", "no PHI processing", "privacy counsel gate before promotion"]
  }
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function buildContinuousReviewAuditBrief() {
  const summary = getContinuousReviewAuditSummary();

  return [
    "# SCRIMED Continuous Review, Audit, and Innovation Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Agents: ${summary.agentCount}`,
    `Loops: ${summary.loopCount}`,
    `Audit controls: ${summary.controlCount}`,
    `Innovation tracks: ${summary.innovationTrackCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not managed 24/7 SOC/MDR coverage, autonomous production remediation, legal advice, security certification, regulatory approval, PHI authority, clinical care authority, public quantum capability claim, product commitment, investment advice, or permission to bypass human review.",
    "",
    "## Review Agents",
    ...summary.agents.map(
      (agent) =>
        `- ${agent.name} (${agent.status}): ${agent.mission} Cadence: ${agent.cadence} Blocked: ${agent.blockedActions.join(", ")}`
    ),
    "",
    "## Loops",
    ...summary.loops.map(
      (loop) =>
        `- ${loop.stage} (${loop.cadence}): ${loop.action} Error reduction: ${loop.errorReductionMechanism}`
    ),
    "",
    "## Internal Innovation Research",
    ...summary.innovationTracks.map(
      (track) =>
        `- ${track.title} (${track.visibility}): ${track.researchQuestion} Blocked claims: ${track.blockedClaims.join(", ")}`
    ),
    "",
    "## Sources",
    ...summary.sources.map((source) => `- ${source.name}: ${source.scrimedApplication} Source: ${source.url}`)
  ].join("\n");
}

export function getContinuousReviewAuditSummary() {
  const blockedClaims = unique([
    ...continuousReviewAgents.flatMap((agent) => agent.blockedActions),
    ...continuousAuditControls.flatMap((control) => control.hardStops),
    ...innovationResearchTracks.flatMap((track) => track.blockedClaims)
  ]);
  const evidenceRoutes = unique(continuousReviewAgents.flatMap((agent) => agent.evidenceRoutes));
  const owners = unique([
    ...continuousReviewAgents.map((agent) => agent.name),
    ...continuousReviewLoops.map((loop) => loop.owner),
    ...continuousAuditControls.map((control) => control.owner),
    ...innovationResearchTracks.map((track) => track.owner),
    ...internalResearchAssignments.map((assignment) => assignment.team)
  ]);

  return {
    service: "scrimed-continuous-review-audit-innovation",
    status: continuousReviewAuditStatus,
    briefStatus: continuousReviewAuditBriefStatus,
    route: continuousReviewAuditRoute,
    apiRoute: continuousReviewAuditApiRoute,
    briefRoute: continuousReviewAuditBriefRoute,
    boundary: continuousReviewAuditBoundary,
    updated: continuousReviewAuditUpdatedAt,
    sourceCount: continuousReviewSources.length,
    agentCount: continuousReviewAgents.length,
    loopCount: continuousReviewLoops.length,
    controlCount: continuousAuditControls.length,
    innovationTrackCount: innovationResearchTracks.length,
    internalResearchAssignmentCount: internalResearchAssignments.length,
    evidenceRouteCount: evidenceRoutes.length,
    ownerCount: owners.length,
    blockedClaimCount: blockedClaims.length,
    humanReviewRequiredAgentCount: continuousReviewAgents.filter(
      (agent) => agent.status === "human-review-required"
    ).length,
    internalResearchOnlyAgentCount: continuousReviewAgents.filter(
      (agent) => agent.status === "internal-research-only"
    ).length,
    activeControlAgentCount: continuousReviewAgents.filter(
      (agent) => agent.status === "active-control-plane"
    ).length,
    quantumTrackStatus: "internal-research-only-no-public-claim",
    managedCoverageAuthority: "not-managed-24-7-soc-mdr",
    autonomousRemediationAuthority: "human-review-required-before-production-change",
    dataBoundary: "synthetic-and-metadata-only",
    sources: continuousReviewSources,
    agents: continuousReviewAgents,
    loops: continuousReviewLoops,
    controls: continuousAuditControls,
    innovationTracks: innovationResearchTracks,
    internalResearchAssignments,
    evidenceRoutes,
    owners,
    blockedClaims,
    nextBuildStep:
      "Turn the continuous review model into protected work queues for accuracy sampling, evidence source aging, claims guard review, security drift, post-incident learning, and internal research promotion gates."
  };
}
