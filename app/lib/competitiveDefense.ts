import { competitorMarketSources, getCompetitiveMarketIntelligenceSummary } from "./competitiveMarketIntelligence";

export type CompetitiveDefenseStatus =
  | "active"
  | "harden-now"
  | "external-review-required"
  | "protected-gated";

export type CompetitiveThreatProfile = {
  competitor: string;
  category:
    | "ambient-ai"
    | "agent-workforce"
    | "platform-incumbent"
    | "rcm-payer"
    | "safety-agent";
  officialSource: string;
  marketStrength: string;
  scrimedWeaknessExposed: string;
  counterPosition: string;
  hardeningMove: string;
  proofRoute: string;
  legalPrivacyCyberBoundary: string;
};

export type StrengthHardeningTrack = {
  pillar: string;
  status: CompetitiveDefenseStatus;
  existingStrength: string;
  weaknessToRelieve: string;
  hardeningMove: string;
  proofRoute: string;
  owner: string;
  retainedBoundary: string;
};

export type LegalPrivacyCyberControl = {
  control: string;
  status: CompetitiveDefenseStatus;
  frameworkAlignment: string[];
  riskReduced: string;
  implementation: string;
  deterrenceMechanism: string;
  evidenceRoute: string;
  retainedBoundary: string;
  owner: string;
};

export type InfiltrationDeterrenceLayer = {
  layer: string;
  status: CompetitiveDefenseStatus;
  likelyAttackPath: string;
  prevention: string;
  detection: string;
  response: string;
  evidenceRoute: string;
  hardStop: string;
};

export type ExternalReviewGate = {
  name: string;
  status: "required-before-public-claim" | "required-before-production" | "required-before-buyer-release";
  owner: string;
  trigger: string;
  output: string;
  blockedUntilComplete: string[];
};

export const competitiveDefenseRoute = "/competitive-defense";
export const competitiveDefenseApiRoute = "/api/competitive-defense";
export const competitiveDefenseBriefRoute = "/api/competitive-defense/brief";
export const competitiveDefenseStatus = "competitive-defense-hardening-active";
export const competitiveDefenseBriefStatus = "competitive-defense-brief-ready-no-legal-security-certification";

export const competitiveDefenseBoundary =
  "SCRIMED Competitive Defense translates public competitor positioning, known SCRIMED weaknesses, legal/privacy/cybersecurity requirements, and infiltration risks into owned hardening controls. It is strategic readiness evidence only. It does not copy competitor products, assert partnerships, provide legal advice, certify security or compliance, authorize PHI processing, approve penetration testing, guarantee protection from attack, approve customer release, or authorize live clinical care.";

export const frameworkSourceAlignment = [
  {
    name: "NIST Cybersecurity Framework 2.0",
    url: "https://www.nist.gov/cyberframework",
    implication:
      "Use Govern, Identify, Protect, Detect, Respond, and Recover as the operating grammar for SCRIMED cyber readiness."
  },
  {
    name: "HHS HIPAA Security Rule",
    url: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html",
    implication:
      "Treat administrative, physical, and technical safeguards as qualified-review gates before any ePHI path is enabled."
  },
  {
    name: "OWASP Top 10 for LLM Applications",
    url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
    implication:
      "Model prompt injection, sensitive information disclosure, excessive agency, supply-chain, output-handling, and model-behavior risks as product controls, not afterthoughts."
  }
];

export const competitiveThreatProfiles: CompetitiveThreatProfile[] = [
  {
    competitor: "Abridge",
    category: "ambient-ai",
    officialSource: "https://www.abridge.com/",
    marketStrength:
      "Full clinical conversation workflow, health-system adoption proof, clinician-facing trust, and downstream documentation/revenue-cycle story.",
    scrimedWeaknessExposed:
      "SCRIMED cannot yet claim comparable ambient clinical deployment, health-system customer outcomes, or production note-generation authority.",
    counterPosition:
      "Position SCRIMED as governed healthcare workflow intelligence, not a scribe clone: evidence trace, TrustOS gate, synthetic pilot, and downstream operating proof.",
    hardeningMove:
      "Package every demo as a context-to-evidence-to-human-review operating loop with explicit no-live-care and no-PHI boundaries.",
    proofRoute: "/competitive-intelligence",
    legalPrivacyCyberBoundary:
      "No copied clinical documentation models, no patient data, no customer-logo implication, and no clinical superiority claim."
  },
  {
    competitor: "Ambience Healthcare",
    category: "ambient-ai",
    officialSource: "https://www.ambiencehealthcare.com/",
    marketStrength:
      "Specialty-oriented documentation, coding, measurable adoption, bake-off proof, and enterprise clinical quality positioning.",
    scrimedWeaknessExposed:
      "SCRIMED needs clearer specialty scorecards and buyer-controlled success metrics before larger clinical operations teams will compare it fairly.",
    counterPosition:
      "Run synthetic specialty bake-offs where buyers score evidence completeness, review friction, policy fit, operational actionability, and claim safety.",
    hardeningMove:
      "Create a no-PHI bake-off packet and route all time-saved, ROI, coding, and clinical-quality phrases through claim guard and qualified review.",
    proofRoute: "/qa-claim-guard",
    legalPrivacyCyberBoundary:
      "No specialty performance, coding accuracy, reimbursement, or clinical quality claims without qualified external review."
  },
  {
    competitor: "Nabla",
    category: "ambient-ai",
    officialSource: "https://www.nabla.com/",
    marketStrength:
      "Visible API, mobile/web/extension footprint, EHR integration posture, security, privacy, and governance packaging.",
    scrimedWeaknessExposed:
      "SCRIMED must make connector and API boundaries easier for technical buyers to inspect before live integrations exist.",
    counterPosition:
      "Use the Health Records Safety Exchange, interoperability conformance, API contract catalog, and Platform Power controls as the visible trust catalog.",
    hardeningMove:
      "Label every connector family as synthetic-ready, contract-ready, protected-gated, or blocked-live-use.",
    proofRoute: "/health-records",
    legalPrivacyCyberBoundary:
      "No production connector, EHR integration, API SLA, PHI authority, or customer deployment claim until buyer-approved contracts exist."
  },
  {
    competitor: "Suki",
    category: "ambient-ai",
    officialSource: "https://www.suki.ai/",
    marketStrength:
      "Enterprise ambient intelligence, EHR breadth, partner tooling, revenue-cycle assistance, clinical reasoning positioning, and trust portal signaling.",
    scrimedWeaknessExposed:
      "SCRIMED needs a clearer answer for large-enterprise security diligence and revenue/documentation adjacency without sounding like a generic assistant.",
    counterPosition:
      "Lead with healthcare operating-system breadth: Atlas evidence, AgentOS workflows, TrustOS controls, PayerIQ evidence, and protected buyer proof.",
    hardeningMove:
      "Add security-and-revenue adjacency controls to every sales packet and keep all ROI/security/certification claims in blocked-claim registers.",
    proofRoute: "/enterprise-business-ops",
    legalPrivacyCyberBoundary:
      "No trust-portal equivalence, EHR breadth claim, ROI guarantee, security certification, or clinical reasoning authority."
  },
  {
    competitor: "Microsoft Dragon Copilot",
    category: "platform-incumbent",
    officialSource: "https://www.microsoft.com/en-us/ai/health",
    marketStrength:
      "Massive enterprise platform trust, healthcare AI brand recognition, Azure ecosystem, Microsoft security tooling, and Dragon clinical workflow footprint.",
    scrimedWeaknessExposed:
      "SCRIMED cannot win by claiming scale parity with Microsoft; it needs sharper category focus and faster buyer-specific proof.",
    counterPosition:
      "Win as the inspectable governance-and-workflow overlay that can prepare no-PHI proof packets before an incumbent platform procurement decision hardens.",
    hardeningMove:
      "Make launch readiness, legal/privacy/cyber boundaries, buyer packet evidence, and workflow loops visible before every sales call.",
    proofRoute: "/launch-readiness",
    legalPrivacyCyberBoundary:
      "No Microsoft partnership, Azure equivalence, platform-scale equivalence, Dragon parity, or managed-security implication."
  },
  {
    competitor: "Oracle Health",
    category: "platform-incumbent",
    officialSource: "https://www.oracle.com/health/",
    marketStrength:
      "Incumbent EHR, payer, financial, cloud, data, interoperability, service, and enterprise operations footprint.",
    scrimedWeaknessExposed:
      "SCRIMED needs to avoid any EHR-replacement impression and present itself as an overlay proof and workflow intelligence layer.",
    counterPosition:
      "Position SCRIMED as complementing incumbent systems through governed no-PHI pilots, connector prerequisites, and operational evidence packets.",
    hardeningMove:
      "Attach an incumbent-system complement boundary to interoperability, health records, payer, financial, and deployment profile copy.",
    proofRoute: "/interoperability",
    legalPrivacyCyberBoundary:
      "No Oracle integration, EHR replacement, ONC certification, production connector, or incumbent-data migration claim."
  },
  {
    competitor: "Hippocratic AI",
    category: "safety-agent",
    officialSource: "https://www.hippocraticai.com/",
    marketStrength:
      "Safety-first healthcare agent brand, human escalation, voice-agent category ownership, customer proof, and clinical validation emphasis.",
    scrimedWeaknessExposed:
      "SCRIMED must show safety as product infrastructure, not just legal caution, and must avoid public claims before validation.",
    counterPosition:
      "Treat TrustOS, Clinical Guardian, human review, no-live-care boundary, claim guard, and protected evidence release as the safety product.",
    hardeningMove:
      "Add agent threat modeling, clinical escalation boundaries, and model-output review to the defense operating cadence.",
    proofRoute: "/trust-os",
    legalPrivacyCyberBoundary:
      "No clinical validation, voice-agent parity, autonomous care, diagnosis, prescribing, or customer-logo claim."
  },
  {
    competitor: "Notable",
    category: "agent-workforce",
    officialSource: "https://www.notablehealth.com/",
    marketStrength:
      "AI agent workforce story across access, revenue cycle, care operations, contact center, workflow builder, and connector hub.",
    scrimedWeaknessExposed:
      "SCRIMED needs reusable workflow templates and clearer operations-to-value proof without overclaiming autonomous execution.",
    counterPosition:
      "Package AgentOS as a governed workforce builder with approvals, audit, no-PHI fixtures, and buyer-defined success metrics.",
    hardeningMove:
      "Add agent permission boundaries, tool-call approvals, and excessive-agency checks to every workflow template.",
    proofRoute: "/agents",
    legalPrivacyCyberBoundary:
      "No autonomous patient outreach, production writeback, connector-hub parity, or unsupervised operations claim."
  },
  {
    competitor: "Commure",
    category: "rcm-payer",
    officialSource: "https://www.commure.com/",
    marketStrength:
      "Patient access, ambient AI, RCM automation, EHR breadth, unified data model, and quantified operational-scale story.",
    scrimedWeaknessExposed:
      "SCRIMED needs a tighter financial-evidence story that does not promise reimbursement, revenue, or live RCM integration.",
    counterPosition:
      "Use PayerIQ, Atlas, finance methodology gates, and no-PHI revenue-risk packets to show evidence readiness before value claims.",
    hardeningMove:
      "Route every revenue, denial, coding, or margin phrase through Enterprise Business Ops and finance methodology controls.",
    proofRoute: "/capital-vitality",
    legalPrivacyCyberBoundary:
      "No reimbursement guarantee, revenue guarantee, ROI guarantee, coding finality, or production billing automation claim."
  },
  {
    competitor: "Cohere Health",
    category: "rcm-payer",
    officialSource: "https://www.coherehealth.com/",
    marketStrength:
      "Utilization management, prior authorization, payment integrity, appeals, care management, quality, APIs, and human-in-control payer operations.",
    scrimedWeaknessExposed:
      "SCRIMED needs payer-policy proof that stays clearly separated from actual payer submission or authorization.",
    counterPosition:
      "Make PayerIQ policy evidence, appeal packet preparation, and payer-friction detection human-reviewed and synthetic-only.",
    hardeningMove:
      "Add payer-submission hard stops to workflow outputs and brief exports.",
    proofRoute: "/workflows/results",
    legalPrivacyCyberBoundary:
      "No payer approval, prior authorization submission, payment-integrity certification, claim submission, or appeal filing authority."
  }
];

export const strengthHardeningTracks: StrengthHardeningTrack[] = [
  {
    pillar: "Governance-first healthcare intelligence OS",
    status: "active",
    existingStrength:
      "SCRIMED already links Atlas, AgentOS, TrustOS, protected workspaces, launch readiness, and claim guard into one visible operating map.",
    weaknessToRelieve:
      "The breadth can look abstract unless every page proves a buyer-facing workflow and a hard boundary.",
    hardeningMove:
      "Attach one proof route, one buyer outcome, one blocked claim, and one human-review gate to each product claim.",
    proofRoute: "/product",
    owner: "Product strategy",
    retainedBoundary:
      "Operating-system language cannot imply production integration, autonomous care, security certification, or regulatory approval."
  },
  {
    pillar: "No-PHI protected pilot pathway",
    status: "active",
    existingStrength:
      "Protected buyer workspaces, release controls, lockbox-style evidence routing, AAL2 checks, and synthetic proof packets are already visible.",
    weaknessToRelieve:
      "Buyers may still ask whether diligence evidence can be shared externally or whether PHI can be processed immediately.",
    hardeningMove:
      "Keep protected evidence exports disabled or gated until named reviewer signoff, customer permission, and release authority are recorded.",
    proofRoute: "/pilot-workspace/access",
    owner: "Trust and release operations",
    retainedBoundary:
      "No external distribution, PHI processing, customer proof use, or production connector activation without explicit approval."
  },
  {
    pillar: "Interoperability and health-record safety",
    status: "harden-now",
    existingStrength:
      "Health Records Safety Exchange and interoperability conformance already map FHIR, HL7, DICOM, X12, terminology, and live-data blockers.",
    weaknessToRelieve:
      "Competitors often appear stronger because they show EHR integration earlier in the buying motion.",
    hardeningMove:
      "Expose connector maturity labels and required contracts before any pilot, demo, or API conversation.",
    proofRoute: "/health-records",
    owner: "Interoperability and security",
    retainedBoundary:
      "No live PHI ingestion, EHR writeback, patient matching, payer submission, or production connector claim."
  },
  {
    pillar: "Claims-safe competitor counter-positioning",
    status: "harden-now",
    existingStrength:
      "Competitive intelligence already translates public market patterns into original SCRIMED build priorities with no-copy boundaries.",
    weaknessToRelieve:
      "Competitive analysis can create legal risk if sales or investor language drifts into parity, partnership, customer proof, or certification claims.",
    hardeningMove:
      "Route all competitor-counter statements through no-copy, no-partnership, no-parity, no-certification, no-customer-proof checks.",
    proofRoute: "/competitive-intelligence",
    owner: "Founder, product marketing, and counsel",
    retainedBoundary:
      "No copied proprietary workflows, confidential data, customer-logo implication, or competitor-certified comparison."
  },
  {
    pillar: "Legal, privacy, and cybersecurity gatekeeping",
    status: "external-review-required",
    existingStrength:
      "SCRIMED has explicit authority headers and boundaries across launch, claims, PHI, clinical care, finance, and customer release.",
    weaknessToRelieve:
      "Headers and internal controls are not a substitute for counsel review, HIPAA risk analysis, SOC 2 readiness, penetration testing, or incident-response rehearsal.",
    hardeningMove:
      "Define qualified-review gates, evidence owners, and blocked public claims for each legal/privacy/cyber domain before public growth campaigns expand.",
    proofRoute: "/global-certification-readiness",
    owner: "Legal, privacy, and security leads",
    retainedBoundary:
      "No legal advice, HIPAA certification, SOC 2 certification, penetration-test approval, data-residency approval, or security guarantee."
  },
  {
    pillar: "24/7 review and innovation loop",
    status: "active",
    existingStrength:
      "Continuous Review and Audit already routes agent-assisted accuracy checks, evidence attribution, claims guard, drift watch, QA regression, and internal research.",
    weaknessToRelieve:
      "Always-on review language can be mistaken for managed SOC/MDR, autonomous remediation, or public quantum capability.",
    hardeningMove:
      "Keep the loop as internal readiness, create escalation-only incident handoff, and keep future research private until qualified review.",
    proofRoute: "/continuous-review-audit",
    owner: "Trust, safety, and research operations",
    retainedBoundary:
      "No autonomous production remediation, public quantum claim, managed 24/7 SOC/MDR promise, or bypass of human review."
  }
];

export const legalPrivacyCyberControls: LegalPrivacyCyberControl[] = [
  {
    control: "Claims and legal review firewall",
    status: "harden-now",
    frameworkAlignment: ["Qualified counsel review", "Claims register", "No-copy competitor boundary"],
    riskReduced:
      "False advertising, competitor IP misuse, unauthorized partnership implication, investment overclaim, regulatory overclaim, and customer-proof misuse.",
    implementation:
      "Every sales, investor, marketing, PR, website, and competitor-comparison claim must map to approved, evidence-required, or prohibited status.",
    deterrenceMechanism:
      "Prevents public language from becoming an attack surface for legal challenge, buyer distrust, or competitor escalation.",
    evidenceRoute: "/claims",
    retainedBoundary:
      "This is not legal advice or final approval; qualified counsel remains required for legal positions.",
    owner: "Legal operations and founder"
  },
  {
    control: "No-PHI default and minimum-necessary privacy path",
    status: "active",
    frameworkAlignment: ["HHS HIPAA Security Rule", "Data minimization", "Protected workspace no-PHI boundary"],
    riskReduced:
      "Premature ePHI processing, accidental sensitive-data collection, unauthorized health-record use, and privacy claims before BAA/DPA execution.",
    implementation:
      "Public and pilot workflows remain synthetic, metadata-only, or business-contact-only until PHI authority, BAA/DPA, risk analysis, and customer approvals exist.",
    deterrenceMechanism:
      "Narrows breach impact and reduces the value of public routes to attackers because live patient data is not present.",
    evidenceRoute: "/health-records",
    retainedBoundary:
      "No PHI processing authority, HIPAA compliance certification, BAA execution, or live data approval is created by this control.",
    owner: "Privacy and interoperability"
  },
  {
    control: "NIST CSF operating profile",
    status: "harden-now",
    frameworkAlignment: ["NIST CSF 2.0 Govern", "Identify", "Protect", "Detect", "Respond", "Recover"],
    riskReduced:
      "Unowned cyber controls, missing incident owners, unsupported security claims, and untested recovery paths.",
    implementation:
      "Map each SCRIMED launch and buyer route to an owner, protected asset class, preventive control, detection signal, response action, and recovery evidence.",
    deterrenceMechanism:
      "Converts cybersecurity into accountable operating proof, making infiltration harder to hide and easier to contain.",
    evidenceRoute: "/service-reliability",
    retainedBoundary:
      "This profile is readiness evidence only; it is not SOC 2, HITRUST, ISO, penetration-test, or managed-security certification.",
    owner: "Security operations"
  },
  {
    control: "LLM and agent threat model",
    status: "harden-now",
    frameworkAlignment: ["OWASP LLM Top 10", "AgentOS approval gates", "TrustOS evaluation"],
    riskReduced:
      "Prompt injection, sensitive-information disclosure, excessive agency, tool abuse, unsafe output handling, and model-route drift.",
    implementation:
      "Each agent workflow must name allowed tools, denied tools, prompt-injection checks, output handling rules, human-review triggers, and audit evidence.",
    deterrenceMechanism:
      "Limits what an infiltrator can coerce an agent to read, reveal, call, write, or approve.",
    evidenceRoute: "/trust-os",
    retainedBoundary:
      "This is not a model-safety certification, live autonomous AI approval, or permission to process PHI.",
    owner: "AI safety and TrustOS"
  },
  {
    control: "Identity, AAL2, and secret hygiene",
    status: "active",
    frameworkAlignment: ["AAL2 operator boundary", "Passkey authentication", "No-secret public smoke"],
    riskReduced:
      "Credential compromise, token leakage, unauthorized protected workspace access, and secret exposure in public tests.",
    implementation:
      "Protected mutation and packet routes require tenant identity, AAL2-capable operator proof, no-secret test flows, and explicit token-disposal instructions.",
    deterrenceMechanism:
      "Raises attacker cost by separating public read paths from protected mutation and evidence-release authority.",
    evidenceRoute: "/pilot-workspace/access",
    retainedBoundary:
      "No bypass of AAL2, no token minting by readiness pages, and no public secret storage.",
    owner: "Identity and workspace operations"
  },
  {
    control: "Dependency and supply-chain review",
    status: "harden-now",
    frameworkAlignment: ["NIST CSF Identify/Protect", "Software supply-chain review", "Build verification"],
    riskReduced:
      "Compromised dependencies, unsafe package upgrades, build-time injection, and unreviewed generated artifacts.",
    implementation:
      "Run typecheck, lint, build, audit, and integrity checks before production promotion; record exceptions as limitation packets.",
    deterrenceMechanism:
      "Makes compromise harder to ship silently and forces unresolved supply-chain risk into visible launch hard stops.",
    evidenceRoute: "/launch-readiness",
    retainedBoundary:
      "This is not a completed third-party security assessment or guarantee against supply-chain attack.",
    owner: "Engineering and release operations"
  },
  {
    control: "Incident response and breach-notification readiness",
    status: "external-review-required",
    frameworkAlignment: ["NIST CSF Respond/Recover", "HIPAA breach-review readiness", "Trust Safety Ops"],
    riskReduced:
      "Slow containment, unclear legal notification paths, unmanaged customer communication, and evidence loss after a suspected incident.",
    implementation:
      "Classify incidents, preserve audit evidence, notify qualified legal/privacy/security reviewers, freeze affected releases, and prepare customer-safe communications.",
    deterrenceMechanism:
      "Reduces dwell time and prevents attackers from exploiting confusion between engineering, legal, privacy, and customer teams.",
    evidenceRoute: "/trust-safety-operations",
    retainedBoundary:
      "This does not provide legal advice, breach determination, notification approval, or managed incident-response service.",
    owner: "Trust safety, legal, and security"
  },
  {
    control: "Vendor, connector, and buyer evidence room gate",
    status: "protected-gated",
    frameworkAlignment: ["BAA/DPA readiness", "Vendor-risk review", "Connector approval"],
    riskReduced:
      "Unauthorized integrations, vendor-risk blind spots, evidence-room leakage, customer-permission confusion, and procurement blockers.",
    implementation:
      "Route provider security reviews, procurement evidence, external approval evidence, and connector references through protected metadata-only workspaces.",
    deterrenceMechanism:
      "Prevents infiltrators or rushed operators from turning diligence artifacts into live integration authority.",
    evidenceRoute: "/pilot-workspace/access",
    retainedBoundary:
      "No BAA/DPA execution, vendor approval, connector approval, customer release, or procurement approval is created here.",
    owner: "Security, procurement, and release authority"
  }
];

export const infiltrationDeterrenceLayers: InfiltrationDeterrenceLayer[] = [
  {
    layer: "Public route and API surface",
    status: "harden-now",
    likelyAttackPath:
      "Enumeration, spam, scraping, abuse of public APIs, malformed requests, and attempts to infer protected-state details.",
    prevention:
      "Keep public APIs read-only, synthetic-only, rate-limit-ready, cache-safe, header-bounded, and free of secrets or PHI.",
    detection:
      "Monitor unusual request volume, response-code spikes, route misses, API schema drift, and smoke failures.",
    response:
      "Freeze release promotion, add limitation record, tighten API output, and route firewall or hosting changes through qualified operators.",
    evidenceRoute: "/navigation",
    hardStop: "No public endpoint may expose secrets, PHI, protected packet contents, or tenant mutation authority."
  },
  {
    layer: "Tenant identity and protected workspace",
    status: "active",
    likelyAttackPath:
      "Credential theft, session replay, role confusion, unauthorized packet export, or protected mutation attempts.",
    prevention:
      "Require tenant-scoped identity, AAL2-capable operator proof, fail-closed protected routes, and explicit release authority.",
    detection:
      "Track access-log reconciliation, packet export attempts, reviewer signoff gaps, and tenant session verification failures.",
    response:
      "Disable export, revoke passkeys or sessions, require named reviewer signoff, and preserve audit packet.",
    evidenceRoute: "/pilot-workspace/access",
    hardStop: "No protected packet export without authenticated workspace access and release authority chain."
  },
  {
    layer: "Agent tool execution",
    status: "harden-now",
    likelyAttackPath:
      "Prompt injection, tool misuse, excessive agency, unauthorized data retrieval, or hidden instruction escalation.",
    prevention:
      "Use tool allowlists, human approval checkpoints, denied action lists, prompt-injection review, and output handling boundaries.",
    detection:
      "Record tool attempts, denied action counts, reviewer overrides, anomalous prompt patterns, and TrustOS decisions.",
    response:
      "Quarantine workflow result, require human review, downgrade model/tool authority, and update the claims/workaround register.",
    evidenceRoute: "/agents",
    hardStop: "No autonomous clinical action, payer submission, writeback, patient outreach, or production connector call."
  },
  {
    layer: "Health-record and interoperability path",
    status: "protected-gated",
    likelyAttackPath:
      "Attempted live PHI ingestion, connector impersonation, patient matching, unsafe extraction, or EHR writeback pressure.",
    prevention:
      "Restrict to synthetic fixtures, no-PHI extraction, metadata-only connector planning, and contract-ready/live-blocked labels.",
    detection:
      "Flag live-data fields, production endpoint URLs, patient identifiers, connector credential requests, and writeback verbs.",
    response:
      "Stop workflow, remove sensitive input, issue privacy/legal review task, and update Health Records Safety Exchange boundaries.",
    evidenceRoute: "/health-records",
    hardStop: "No PHI, patient matching, live connector, diagnosis, order entry, payer submission, or EHR writeback."
  },
  {
    layer: "Commercial, investor, and legal claims",
    status: "harden-now",
    likelyAttackPath:
      "Sales overclaim, investor overclaim, competitor-comparison drift, security-certification drift, or public customer-proof misuse.",
    prevention:
      "Claims register, QA Claim Guard, no-copy competitor boundary, investor-readiness boundaries, and legal review gates.",
    detection:
      "Scan copy for guarantee, certification, partnership, valuation, securities, reimbursement, clinical, or customer-permission phrases.",
    response:
      "Block publication, route to qualified review, replace with evidence-safe language, and retain the redline reason.",
    evidenceRoute: "/qa-claim-guard",
    hardStop: "No public claim of certification, approval, partnership, customer proof, revenue guarantee, or legal conclusion."
  },
  {
    layer: "Build and dependency pipeline",
    status: "harden-now",
    likelyAttackPath:
      "Dependency compromise, build-cache drift, malicious generated artifacts, test bypass, or unreviewed deployment.",
    prevention:
      "Run typecheck, lint, build, audit, public smoke, launch-domain preflight, and no-secret operator checks before promotion.",
    detection:
      "Compare smoke deltas, lockfile changes, generated artifacts, route inventory changes, and unexpected API/header changes.",
    response:
      "Block deployment, record limitation, isolate the package or artifact, and require maintainer review before release.",
    evidenceRoute: "/release-continuity",
    hardStop: "No production promotion when build, smoke, audit, or launch-domain evidence fails without documented workaround."
  }
];

export const externalReviewGates: ExternalReviewGate[] = [
  {
    name: "Counsel-reviewed claims and competitor comparison",
    status: "required-before-public-claim",
    owner: "Qualified counsel and founder",
    trigger:
      "Any page, deck, PR, investor packet, email, or sales call compares SCRIMED to a named competitor or asserts legal/security/compliance status.",
    output: "Approved, evidence-required, or prohibited claim classification.",
    blockedUntilComplete: [
      "Partnership implication",
      "competitor superiority claim",
      "certification claim",
      "customer-proof claim",
      "securities or valuation language"
    ]
  },
  {
    name: "Privacy and HIPAA risk analysis",
    status: "required-before-production",
    owner: "Privacy officer, counsel, and security lead",
    trigger:
      "Any workflow proposes ePHI, patient identifiers, live health records, provider connector credentials, or customer production data.",
    output: "Risk analysis, BAA/DPA path, minimum-necessary scope, retention rule, and incident-response owner.",
    blockedUntilComplete: [
      "PHI processing",
      "live connector activation",
      "patient matching",
      "clinical data retention",
      "customer production import"
    ]
  },
  {
    name: "Security assessment and penetration-test authorization",
    status: "required-before-production",
    owner: "Security lead and qualified assessor",
    trigger:
      "Any customer asks for production deployment, security certification, public trust badge, or penetration-test proof.",
    output: "Scoped test authorization, remediation plan, evidence packet, and public-claim decision.",
    blockedUntilComplete: [
      "security certification claim",
      "penetration-test claim",
      "production support guarantee",
      "public trust badge",
      "customer-specific security approval"
    ]
  },
  {
    name: "Customer release and evidence distribution",
    status: "required-before-buyer-release",
    owner: "Named reviewer, release authority, and customer sponsor",
    trigger:
      "Any buyer proof packet, customer-named result, diligence artifact, or protected workspace evidence is proposed for external distribution.",
    output: "Named reviewer signoff, recipient list, lockbox/access log, approved language, and expiry.",
    blockedUntilComplete: [
      "public customer proof",
      "external distribution",
      "buyer packet release",
      "sales deck evidence",
      "investor customer-reference claim"
    ]
  }
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function getCompetitiveDefenseSummary() {
  const marketIntelligenceSummary = getCompetitiveMarketIntelligenceSummary();
  const competitorSourceUrls = unique([
    ...competitorMarketSources.map((source) => source.url),
    ...competitiveThreatProfiles.map((profile) => profile.officialSource)
  ]);
  const externalReviewCount = [
    ...strengthHardeningTracks,
    ...legalPrivacyCyberControls
  ].filter((item) => item.status === "external-review-required").length;
  const hardenNowCount = [
    ...strengthHardeningTracks,
    ...legalPrivacyCyberControls,
    ...infiltrationDeterrenceLayers
  ].filter((item) => item.status === "harden-now").length;
  const hardStops = infiltrationDeterrenceLayers.map((layer) => layer.hardStop);

  return {
    service: "scrimed-competitive-defense",
    status: competitiveDefenseStatus,
    briefStatus: competitiveDefenseBriefStatus,
    route: competitiveDefenseRoute,
    apiRoute: competitiveDefenseApiRoute,
    briefRoute: competitiveDefenseBriefRoute,
    reviewedAt: "2026-06-26",
    posture:
      "competitor-aware-legal-privacy-cyber-hardening-with-no-copy-no-phi-no-certification-boundaries",
    boundary: competitiveDefenseBoundary,
    marketIntelligenceStatus: marketIntelligenceSummary.status,
    marketIntelligenceRoute: marketIntelligenceSummary.route,
    competitorSourceCount: competitorSourceUrls.length,
    competitorThreatProfileCount: competitiveThreatProfiles.length,
    strengthHardeningTrackCount: strengthHardeningTracks.length,
    hardenNowCount,
    externalReviewRequiredCount: externalReviewCount,
    legalPrivacyCyberControlCount: legalPrivacyCyberControls.length,
    infiltrationDeterrenceLayerCount: infiltrationDeterrenceLayers.length,
    externalReviewGateCount: externalReviewGates.length,
    hardStopCount: hardStops.length,
    frameworkSourceCount: frameworkSourceAlignment.length,
    competitorSourceUrls,
    frameworkSourceAlignment,
    threatProfiles: competitiveThreatProfiles,
    strengthHardeningTracks,
    legalPrivacyCyberControls,
    infiltrationDeterrenceLayers,
    externalReviewGates,
    hardStops,
    noAuthority: {
      legalAdvice: "not-legal-advice",
      privacyAdvice: "qualified-privacy-review-required",
      securityCertification: "not-security-certified",
      penetrationTesting: "not-penetration-test-authorization",
      phiProcessing: "not-authorized-production-phi",
      customerRelease: "customer-permission-and-release-control-required",
      competitorPartnership: "not-third-party-partnership",
      attackGuarantee: "not-protection-guarantee",
      clinicalCare: "not-authorized-live-care"
    },
    nextHardeningMove:
      "Run every public competitor, investor, sales, security, privacy, and launch claim through Competitive Defense before expansion: prove the source, name the SCRIMED counter-position, attach the proof route, preserve no-copy/no-PHI/no-certification boundaries, and escalate legal/privacy/cyber claims to qualified review."
  };
}

export function buildCompetitiveDefenseBrief() {
  const summary = getCompetitiveDefenseSummary();

  return [
    "# SCRIMED Competitive Defense Brief",
    "",
    `Status: ${summary.status}`,
    `Reviewed: ${summary.reviewedAt}`,
    `Route: ${summary.route}`,
    `API: ${summary.apiRoute}`,
    `Boundary: ${summary.boundary}`,
    "",
    "## Competitive Threat Profiles",
    ...summary.threatProfiles.map(
      (profile) =>
        `- ${profile.competitor}: ${profile.counterPosition} Hardening: ${profile.hardeningMove} Boundary: ${profile.legalPrivacyCyberBoundary}`
    ),
    "",
    "## Strength Hardening Tracks",
    ...summary.strengthHardeningTracks.map(
      (track) =>
        `- ${track.pillar}: ${track.status}. ${track.hardeningMove} Proof: ${track.proofRoute}.`
    ),
    "",
    "## Legal, Privacy, And Cyber Controls",
    ...summary.legalPrivacyCyberControls.map(
      (control) =>
        `- ${control.control}: ${control.status}. ${control.implementation} Boundary: ${control.retainedBoundary}`
    ),
    "",
    "## Infiltration Deterrence Layers",
    ...summary.infiltrationDeterrenceLayers.map(
      (layer) =>
        `- ${layer.layer}: prevent ${layer.prevention} Detect: ${layer.detection} Hard stop: ${layer.hardStop}`
    ),
    "",
    "## External Review Gates",
    ...summary.externalReviewGates.map(
      (gate) =>
        `- ${gate.name}: ${gate.status}. Trigger: ${gate.trigger} Output: ${gate.output}`
    ),
    "",
    "## No-Authority Boundary",
    ...Object.entries(summary.noAuthority).map(([key, value]) => `- ${key}: ${value}`),
    "",
    summary.nextHardeningMove
  ].join("\n");
}
