export type CertificationSourceType =
  | "official-government"
  | "official-regulator"
  | "official-standard"
  | "health-system-assurance";

export type CertificationTrackStatus =
  | "foundation-active"
  | "evidence-build-required"
  | "external-review-required"
  | "blocked-before-approval";

export type CertificationReadinessSource = {
  name: string;
  jurisdiction: string;
  sourceType: CertificationSourceType;
  url: string;
  reviewedAt: string;
  requirementSignal: string;
  scrimedImplication: string;
};

export type CertificationTrack = {
  slug: string;
  title: string;
  jurisdiction: "United States" | "European Union" | "United Kingdom" | "Australia" | "Global";
  status: CertificationTrackStatus;
  sourceNames: string[];
  operatingGoal: string;
  requiredEvidence: string[];
  implementationWork: string[];
  proofRoutes: string[];
  accountableOwners: string[];
  externalAuthority: string;
  blockedClaims: string[];
  nextAction: string;
};

export type CertificationGate = {
  gate: string;
  purpose: string;
  owner: string;
  requiredBefore: string[];
  evidenceArtifacts: string[];
  blockedUntilComplete: string[];
};

export type RegionalCertificationPack = {
  region: string;
  priority: "launch" | "strategic" | "watch";
  requiredWorkstreams: string[];
  buyerDiligencePacket: string[];
  productionHardStops: string[];
  safeNearTermMotion: string;
};

export type CertificationRoadmapItem = {
  phase: string;
  objective: string;
  buildNow: string;
  exitCriteria: string;
};

export const globalCertificationReadinessRoute = "/global-certification-readiness";
export const globalCertificationReadinessApiRoute = "/api/global-certification-readiness";
export const globalCertificationReadinessBriefRoute = "/api/global-certification-readiness/brief";
export const globalCertificationReadinessStatus =
  "global-approval-certification-readiness-control-plane-active";
export const globalCertificationReadinessBriefStatus =
  "global-approval-certification-brief-ready-no-certification-claim";
export const globalCertificationReadinessUpdatedAt = "2026-06-25";

export const globalCertificationReadinessBoundary =
  "SCRIMED Global Approval and Certification Readiness organizes domestic and international privacy, security, AI governance, medical-device, clinical-safety, interoperability, and procurement evidence needed before production healthcare operation. It is readiness planning only. It does not grant legal advice, regulatory approval, HIPAA compliance certification, SOC 2/HITRUST/ISO certification, FDA clearance, ONC certification, EU AI Act conformity, GDPR compliance assurance, NHS approval, MHRA approval, Australian cyber certification, PHI processing authority, public-sector procurement approval, reimbursement assurance, production connector approval, or live clinical care authority.";

export const certificationReadinessSources: CertificationReadinessSource[] = [
  {
    name: "HHS HIPAA Security Rule",
    jurisdiction: "United States",
    sourceType: "official-government",
    url: "https://www.hhs.gov/hipaa/for-professionals/security/index.html",
    reviewedAt: globalCertificationReadinessUpdatedAt,
    requirementSignal:
      "HHS frames the Security Rule around administrative, physical, and technical safeguards for electronic protected health information, with a January 2025 proposed cybersecurity update noted by HHS.",
    scrimedImplication:
      "SCRIMED needs a HIPAA risk analysis, safeguard map, BAA/DPA pathway, breach process, access review, and subprocessor register before PHI or ePHI scope."
  },
  {
    name: "FDA Clinical Decision Support Software Guidance",
    jurisdiction: "United States",
    sourceType: "official-regulator",
    url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software",
    reviewedAt: globalCertificationReadinessUpdatedAt,
    requirementSignal:
      "FDA's January 2026 final CDS guidance clarifies when certain decision-support software functions may be excluded from device definition and when device policies continue to apply.",
    scrimedImplication:
      "SCRIMED must maintain intended-use analysis, human-review transparency, non-device CDS criteria review, and SaMD escalation gates before clinical recommendation claims."
  },
  {
    name: "FDA Artificial Intelligence in Software as a Medical Device",
    jurisdiction: "United States",
    sourceType: "official-regulator",
    url: "https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-software-medical-device",
    reviewedAt: globalCertificationReadinessUpdatedAt,
    requirementSignal:
      "FDA highlights lifecycle management, premarket pathways, modifications, good machine-learning practice, transparency, predetermined change control, and AI-enabled device guidance work.",
    scrimedImplication:
      "If SCRIMED deliberately enters regulated SaMD territory, it needs QMS, clinical evidence, risk management, performance monitoring, change control, transparency, and regulatory counsel before launch."
  },
  {
    name: "NIST AI Risk Management Framework",
    jurisdiction: "United States",
    sourceType: "official-government",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
    reviewedAt: globalCertificationReadinessUpdatedAt,
    requirementSignal:
      "NIST AI RMF is voluntary and intended to improve incorporation of trustworthiness considerations into design, development, use, and evaluation of AI systems.",
    scrimedImplication:
      "SCRIMED should map AI inventory, risk taxonomy, measurement routines, model evaluation, incident response, and TrustOS evidence to NIST AI RMF language."
  },
  {
    name: "EU Artificial Intelligence Act",
    jurisdiction: "European Union",
    sourceType: "official-regulator",
    url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
    reviewedAt: globalCertificationReadinessUpdatedAt,
    requirementSignal:
      "The EU describes high-risk AI obligations including risk assessment, data quality, activity logging, documentation, deployer information, human oversight, robustness, cybersecurity, and accuracy; current implementation timelines include 2027 and 2028 high-risk transition dates.",
    scrimedImplication:
      "SCRIMED needs EU high-risk triage, technical documentation, data governance, logs, human oversight, post-market monitoring, serious-incident routing, and conformity-assessment planning before EU production claims."
  },
  {
    name: "European Commission GDPR Legal Framework",
    jurisdiction: "European Union",
    sourceType: "official-government",
    url: "https://commission.europa.eu/law/law-topic/data-protection/legal-framework-eu-data-protection_en",
    reviewedAt: globalCertificationReadinessUpdatedAt,
    requirementSignal:
      "The Commission identifies the GDPR as the EU data-protection framework, applying since 25 May 2018 and covering personal-data rights, controllers/processors, supervisory authorities, and cross-border mechanisms.",
    scrimedImplication:
      "SCRIMED needs GDPR role mapping, lawful-basis review, DPIA, DPA/SCC workflows, data-subject rights process, retention schedule, transfer mechanism, and DPO escalation before EU personal-data scope."
  },
  {
    name: "ISO/IEC 42001:2023",
    jurisdiction: "Global",
    sourceType: "official-standard",
    url: "https://www.iso.org/standard/42001",
    reviewedAt: globalCertificationReadinessUpdatedAt,
    requirementSignal:
      "ISO describes ISO/IEC 42001 as an AI management system standard for establishing, implementing, maintaining, and continually improving responsible AI management.",
    scrimedImplication:
      "SCRIMED should build an AI Management System with policy, objectives, risk treatment, traceability, transparency, audit cadence, and continuous improvement before pursuing ISO 42001 certification."
  },
  {
    name: "NHS Digital Technology Assessment Criteria",
    jurisdiction: "United Kingdom",
    sourceType: "health-system-assurance",
    url: "https://digital.nhs.uk/services/digital-technology-assessment-criteria-dtac",
    reviewedAt: globalCertificationReadinessUpdatedAt,
    requirementSignal:
      "NHS DTAC covers clinical safety, data protection, technical security, interoperability, usability, and accessibility; NHS notes it does not replace other required approvals.",
    scrimedImplication:
      "SCRIMED needs a UK buyer pack for clinical safety, data protection, security, interoperability, usability, accessibility, DSPT alignment, and medical-device escalation."
  },
  {
    name: "MHRA Software and AI as a Medical Device Change Programme",
    jurisdiction: "United Kingdom",
    sourceType: "official-regulator",
    url: "https://www.gov.uk/government/publications/software-and-ai-as-a-medical-device-change-programme/software-and-ai-as-a-medical-device-change-programme-roadmap",
    reviewedAt: globalCertificationReadinessUpdatedAt,
    requirementSignal:
      "MHRA roadmap work covers SaMD qualification, intended purpose, classification, premarket requirements, clinical evidence, post-market surveillance, change management, cybersecurity, and AIaMD-specific issues.",
    scrimedImplication:
      "SCRIMED needs UK intended-purpose classification, clinical evidence plan, post-market surveillance model, change-control process, cybersecurity evidence, and MHRA counsel before UK clinical claims."
  },
  {
    name: "Australian Cyber Security Centre Essential Eight",
    jurisdiction: "Australia",
    sourceType: "official-government",
    url: "https://www.cyber.gov.au/business-government/asds-cyber-security-frameworks/essential-eight",
    reviewedAt: globalCertificationReadinessUpdatedAt,
    requirementSignal:
      "The ACSC describes Essential Eight as eight baseline mitigation strategies that make compromise harder, while noting no set of mitigations guarantees protection from every cyber threat.",
    scrimedImplication:
      "SCRIMED should map Australian buyer security diligence to Essential Eight maturity evidence, incident reporting, access hardening, patching, backups, application controls, and logging."
  }
];

export const certificationTracks: CertificationTrack[] = [
  {
    slug: "us-hipaa-baa-phi-readiness",
    title: "U.S. HIPAA, BAA, and PHI Readiness",
    jurisdiction: "United States",
    status: "evidence-build-required",
    sourceNames: ["HHS HIPAA Security Rule"],
    operatingGoal:
      "Prepare SCRIMED for healthcare buyer diligence and future PHI/ePHI scope while keeping current public and pilot flows synthetic-only.",
    requiredEvidence: [
      "HIPAA security risk analysis",
      "Administrative, physical, and technical safeguard matrix",
      "BAA/DPA template and non-PHI determination workflow",
      "Breach notification and incident response runbook",
      "Vendor, subprocessor, access-review, and audit-log registers"
    ],
    implementationWork: [
      "Create a HIPAA evidence-room checklist",
      "Map Supabase/Vercel/subprocessor controls to ePHI boundaries",
      "Add quarterly access review and incident tabletop evidence",
      "Keep PHI hard-stop tests in public and protected smoke"
    ],
    proofRoutes: ["/approvals-readiness", "/trust-center", "/trust-safety-operations", "/pilot-workspace/access"],
    accountableOwners: ["Privacy", "Security", "Legal", "Operations"],
    externalAuthority: "Qualified healthcare privacy counsel and customer BAA/DPA review",
    blockedClaims: ["HIPAA certified", "PHI approved", "BAA executed", "production ePHI processing"],
    nextAction:
      "Stand up a metadata-only HIPAA evidence room and assign risk-analysis, BAA, breach, access-review, and subprocessor owners."
  },
  {
    slug: "us-fda-cds-samd-classification",
    title: "U.S. FDA CDS and SaMD Classification",
    jurisdiction: "United States",
    status: "external-review-required",
    sourceNames: [
      "FDA Clinical Decision Support Software Guidance",
      "FDA Artificial Intelligence in Software as a Medical Device"
    ],
    operatingGoal:
      "Prevent clinical-intelligence features from becoming unauthorized device claims while preserving a route to regulated clinical productization if deliberately chosen.",
    requiredEvidence: [
      "Intended-use memo per module",
      "CDS non-device criteria analysis",
      "SaMD risk classification and pathway memo",
      "Clinical evidence and validation plan",
      "Human factors, transparency, model-change, and post-market monitoring plan"
    ],
    implementationWork: [
      "Tag every module with operations-only, CDS-review, or SaMD-review posture",
      "Route clinical claims through Claim Guard and Clinical Authority Readiness",
      "Create Q-Submission decision inputs for regulated scopes",
      "Keep patient-specific recommendation, diagnosis, and treatment actions blocked"
    ],
    proofRoutes: ["/clinical-authority-readiness", "/clinical-care-activation", "/qa-claim-guard", "/trust-os"],
    accountableOwners: ["Product", "Clinical governance", "Regulatory counsel", "Quality"],
    externalAuthority: "FDA digital-health regulatory counsel and FDA pathway where required",
    blockedClaims: ["FDA cleared", "diagnostic device", "autonomous clinical decision", "medical device approved"],
    nextAction:
      "Produce a module-by-module intended-use and CDS/SaMD classification memo before adding any patient-specific clinical claim."
  },
  {
    slug: "security-assurance-certifications",
    title: "SOC 2, HITRUST, ISO 27001, and ISO 42001 Sequencing",
    jurisdiction: "Global",
    status: "evidence-build-required",
    sourceNames: ["NIST AI Risk Management Framework", "ISO/IEC 42001:2023"],
    operatingGoal:
      "Move from internal control readiness to independent security, privacy, and AI governance assurance without claiming certification early.",
    requiredEvidence: [
      "Control inventory and ownership map",
      "Risk register and audit evidence cadence",
      "Change management, incident response, access control, vendor risk, and backup evidence",
      "AI inventory, model evaluation, TrustOS decisions, and AI risk treatment plan",
      "External auditor selection and readiness assessment"
    ],
    implementationWork: [
      "Map current TrustOS, QA, release, access, and audit artifacts to SOC 2 control families",
      "Add ISO 42001-style AI management policy and risk treatment cadence",
      "Retain 60 to 90 days of control evidence before SOC 2 Type I timing",
      "Use HITRUST and ISO 27001 only after buyer demand and control maturity justify them"
    ],
    proofRoutes: ["/trust-center", "/service-reliability", "/release-continuity", "/qa-evidence"],
    accountableOwners: ["Security", "Engineering", "Operations", "External auditor"],
    externalAuthority: "Independent auditor or accredited certification body",
    blockedClaims: ["SOC 2 certified", "HITRUST certified", "ISO certified", "security certified"],
    nextAction:
      "Create a certification sequencing board: SOC 2 readiness first, ISO 42001 AI management in parallel, HITRUST/ISO 27001 after buyer-driven scope."
  },
  {
    slug: "eu-ai-act-gdpr-ehds-readiness",
    title: "EU AI Act, GDPR, and European Health Data Readiness",
    jurisdiction: "European Union",
    status: "external-review-required",
    sourceNames: ["EU Artificial Intelligence Act", "European Commission GDPR Legal Framework"],
    operatingGoal:
      "Prepare SCRIMED for EU deployment conversations with high-risk AI triage, personal-data governance, cross-border transfer controls, and deployer documentation.",
    requiredEvidence: [
      "EU AI Act high-risk classification memo",
      "Technical documentation and logging plan",
      "Data governance, quality, bias, and representative-dataset controls",
      "Human oversight, robustness, cybersecurity, and accuracy evidence",
      "GDPR DPIA, lawful basis, DPA/SCC, retention, data-subject rights, and transfer mechanism"
    ],
    implementationWork: [
      "Create EU deployment profile labels for no-personal-data, personal-data, high-risk-AI-review, and medical-device-review",
      "Add serious-incident and post-market monitoring placeholders",
      "Route EU customer proof through legal/privacy review before external distribution",
      "Keep EU production data movement blocked until DPA/SCC and hosting decisions are approved"
    ],
    proofRoutes: ["/global-reach", "/deployment-profiles", "/strategic-intelligence", "/trust-center"],
    accountableOwners: ["EU privacy counsel", "AI governance", "Security", "Deployment"],
    externalAuthority: "EU privacy counsel, notified body or market surveillance/conformity route where applicable",
    blockedClaims: ["GDPR compliant", "EU AI Act conformant", "CE marked", "EU production approved"],
    nextAction:
      "Add EU-specific deployment-profile gates for AI Act high-risk triage, GDPR DPIA, SCC/DPA, hosting, and post-market monitoring."
  },
  {
    slug: "uk-nhs-mhra-dtac-readiness",
    title: "UK NHS DTAC and MHRA Software/AI Readiness",
    jurisdiction: "United Kingdom",
    status: "external-review-required",
    sourceNames: [
      "NHS Digital Technology Assessment Criteria",
      "MHRA Software and AI as a Medical Device Change Programme"
    ],
    operatingGoal:
      "Prepare SCRIMED for UK NHS and private-provider review with DTAC evidence, clinical-safety controls, MHRA intended-purpose classification, and medical-device escalation gates.",
    requiredEvidence: [
      "DTAC clinical safety, data protection, technical security, interoperability, usability, and accessibility evidence",
      "DCB0129/DCB0160 clinical-risk-management routing where applicable",
      "DSPT and pre-acquisition questionnaire alignment",
      "MHRA SaMD/AIaMD intended-purpose and classification memo",
      "Post-market surveillance, change-management, and cybersecurity plan"
    ],
    implementationWork: [
      "Create a UK buyer diligence pack mapped to DTAC sections",
      "Separate NHS assurance from medical-device approval and ICO registration",
      "Add UK intended-purpose and manufacturer-role review to clinical authority gates",
      "Keep NHS use, MHRA approval, and UKCA/CE language blocked until evidence exists"
    ],
    proofRoutes: ["/global-reach", "/clinical-authority-readiness", "/interoperability", "/trust-center"],
    accountableOwners: ["UK clinical safety officer", "Security", "Privacy", "Regulatory counsel"],
    externalAuthority: "NHS buyer assurance, ICO, MHRA, Approved Body, or qualified UK counsel where applicable",
    blockedClaims: ["NHS approved", "DTAC passed", "MHRA approved", "UK medical device certified"],
    nextAction:
      "Build a UK DTAC/MHRA evidence checklist and attach it to the global buyer localization pack."
  },
  {
    slug: "australia-essential-eight-health-deployment",
    title: "Australia Essential Eight and Health Deployment Readiness",
    jurisdiction: "Australia",
    status: "evidence-build-required",
    sourceNames: ["Australian Cyber Security Centre Essential Eight"],
    operatingGoal:
      "Prepare SCRIMED for Australian provider, public-sector, and partner diligence with cyber baseline evidence and local privacy/procurement review gates.",
    requiredEvidence: [
      "Essential Eight maturity mapping",
      "Patch, MFA, application control, macro hardening, privilege, backup, and logging evidence",
      "Australian privacy and hosting review",
      "Incident-reporting and buyer security questionnaire packet",
      "Local partner authority and implementation support model"
    ],
    implementationWork: [
      "Map service reliability and release controls to Essential Eight maturity language",
      "Add Australia deployment profile with hosting, privacy, cyber, and public-sector review gates",
      "Keep Australian government, health, or cyber certification claims blocked until qualified evidence exists"
    ],
    proofRoutes: ["/global-reach", "/service-reliability", "/deployment-profiles", "/trust-center"],
    accountableOwners: ["Security", "Global partnerships", "Regional counsel", "Implementation"],
    externalAuthority: "Australian buyer security review, privacy counsel, and public-sector procurement process where applicable",
    blockedClaims: ["Australian government approved", "Essential Eight certified", "public-sector approved", "health deployment authorized"],
    nextAction:
      "Add Australia to deployment-profile readiness with Essential Eight evidence labels and privacy/procurement hard stops."
  }
];

export const certificationGates: CertificationGate[] = [
  {
    gate: "Intended-use and claim classification",
    purpose:
      "Decide whether each SCRIMED module is operations intelligence, non-device CDS candidate, SaMD review candidate, or blocked care-delivery scope.",
    owner: "Product + clinical governance + regulatory counsel",
    requiredBefore: ["clinical claims", "patient-specific workflows", "FDA/MHRA/EU medical-device planning"],
    evidenceArtifacts: ["intended-use memo", "claims register", "module classification table"],
    blockedUntilComplete: ["diagnosis language", "treatment language", "autonomous triage", "medical-device approval claims"]
  },
  {
    gate: "Privacy and data-boundary approval",
    purpose:
      "Prove whether a workflow remains synthetic/no-PHI/no-personal-data or needs HIPAA, GDPR, DPA, SCC, hosting, consent, and retention controls.",
    owner: "Privacy + legal + security",
    requiredBefore: ["PHI processing", "EU personal-data processing", "cross-border transfer", "customer data ingestion"],
    evidenceArtifacts: ["risk analysis", "DPIA", "BAA/DPA", "SCC decision", "retention schedule"],
    blockedUntilComplete: ["production PHI", "EU personal-data movement", "customer upload", "patient outreach"]
  },
  {
    gate: "Security assurance and audit evidence",
    purpose:
      "Move internal controls toward audit-ready evidence for SOC 2, ISO 27001, HITRUST, ISO 42001, and buyer security reviews.",
    owner: "Security + engineering + operations",
    requiredBefore: ["enterprise license", "protected production pilot", "security certification claims"],
    evidenceArtifacts: ["control owner map", "audit trail", "incident response", "access reviews", "vendor risk register"],
    blockedUntilComplete: ["SOC 2 certified", "HITRUST certified", "ISO certified", "security approved"]
  },
  {
    gate: "Human oversight and post-market monitoring",
    purpose:
      "Make AI oversight, model drift, incidents, serious malfunctions, and change control inspectable before regulated or global deployment.",
    owner: "TrustOS + quality + clinical governance",
    requiredBefore: ["EU high-risk AI use", "SaMD production scope", "adaptive AI deployment"],
    evidenceArtifacts: ["human oversight plan", "monitoring plan", "incident taxonomy", "change protocol", "rollback plan"],
    blockedUntilComplete: ["autonomous operation", "adaptive model release", "high-risk AI conformity", "post-market compliance claim"]
  },
  {
    gate: "Regional procurement and localization authority",
    purpose:
      "Confirm local legal, privacy, procurement, hosting, language, accessibility, and partner authority before country-specific sales claims.",
    owner: "Global partnerships + regional counsel + sales",
    requiredBefore: ["public-sector claims", "country launch", "sovereign deployment", "local customer proof"],
    evidenceArtifacts: ["regional counsel memo", "hosting decision", "localized claim review", "partner authority record"],
    blockedUntilComplete: ["government approved", "country-wide deployment", "sovereign-ready approved", "local certification complete"]
  }
];

export const regionalCertificationPacks: RegionalCertificationPack[] = [
  {
    region: "United States",
    priority: "launch",
    requiredWorkstreams: ["HIPAA/BAA", "SOC 2 readiness", "FDA/CDS/SaMD classification", "ONC/EHR connector review"],
    buyerDiligencePacket: ["security questionnaire", "BAA path", "intended-use memo", "SOC 2 readiness map"],
    productionHardStops: ["PHI authority", "clinical authority", "production connector approval", "security assurance evidence"],
    safeNearTermMotion:
      "Sell governed synthetic evaluations and no-PHI workflow intelligence while HIPAA, FDA, and SOC 2 evidence matures."
  },
  {
    region: "European Union",
    priority: "strategic",
    requiredWorkstreams: ["EU AI Act high-risk triage", "GDPR DPIA/DPA/SCC", "hosting and transfer review", "CE/MDR review if medical-device scope"],
    buyerDiligencePacket: ["AI Act technical-documentation outline", "GDPR data map", "human oversight plan", "deployment profile"],
    productionHardStops: ["GDPR role/lawful-basis approval", "high-risk AI conformity route", "EU hosting decision", "medical-device review"],
    safeNearTermMotion:
      "Use no-personal-data strategic evaluations and EU buyer localization packs before EU personal-data or high-risk AI commitments."
  },
  {
    region: "United Kingdom",
    priority: "strategic",
    requiredWorkstreams: ["NHS DTAC", "DSPT alignment", "MHRA SaMD/AIaMD classification", "UK GDPR/ICO review"],
    buyerDiligencePacket: ["DTAC evidence checklist", "clinical safety file outline", "interoperability proof", "UK intended-purpose memo"],
    productionHardStops: ["NHS assurance", "clinical safety signoff", "MHRA/medical-device route", "ICO/privacy review"],
    safeNearTermMotion:
      "Offer UK synthetic pilot proof with DTAC-style diligence packets while medical-device and NHS assurance remain gated."
  },
  {
    region: "Australia",
    priority: "watch",
    requiredWorkstreams: ["Essential Eight maturity", "privacy and hosting review", "health procurement review", "regional partner qualification"],
    buyerDiligencePacket: ["Essential Eight mapping", "incident-response summary", "deployment profile", "privacy/hosting decision memo"],
    productionHardStops: ["buyer security acceptance", "privacy counsel review", "public-sector procurement", "production data approval"],
    safeNearTermMotion:
      "Use cyber-aligned partner discovery and synthetic pilots while Essential Eight and local privacy evidence are prepared."
  },
  {
    region: "Middle East strategic markets",
    priority: "strategic",
    requiredWorkstreams: ["regional counsel", "data residency", "public-sector procurement", "Arabic/English claims review", "sovereign deployment profile"],
    buyerDiligencePacket: ["sovereign deployment profile", "regional privacy review", "partner authority register", "public-sector procurement questions"],
    productionHardStops: ["government authority", "data residency approval", "local hosting decision", "qualified partner signoff"],
    safeNearTermMotion:
      "Lead with executive synthetic evidence, deployment profiles, and qualified partner review before national-program or sovereign claims."
  }
];

export const certificationRoadmap: CertificationRoadmapItem[] = [
  {
    phase: "Phase 1",
    objective: "Turn approval requirements into SCRIMED-owned evidence packages.",
    buildNow:
      "Global certification route, API, brief, evidence tracks, regional packs, and blocked-claim register.",
    exitCriteria:
      "Every buyer-facing approval or certification question has an owner, evidence artifact, proof route, and blocked claim."
  },
  {
    phase: "Phase 2",
    objective: "Stand up audit-ready security, privacy, and AI governance foundations.",
    buildNow:
      "HIPAA risk-analysis packet, SOC 2 readiness map, ISO 42001 AI management policy, AI inventory, access-review cadence, and incident tabletop.",
    exitCriteria:
      "60 to 90 days of retained control evidence and a qualified external readiness review."
  },
  {
    phase: "Phase 3",
    objective: "Prepare regulated healthcare AI productization only where strategically chosen.",
    buildNow:
      "FDA/MHRA/EU intended-use classifications, clinical evidence plan, human factors, post-market monitoring, change-control plan, and QMS decision.",
    exitCriteria:
      "Qualified regulatory counsel confirms the correct pathway before clinical, patient-specific, or medical-device claims enter sales."
  },
  {
    phase: "Phase 4",
    objective: "Scale global deployments through localized assurance packs.",
    buildNow:
      "EU, UK, Australia, Middle East, and U.S. buyer diligence packets tied to deployment profiles and protected workspace gates.",
    exitCriteria:
      "Regional counsel, privacy, hosting, procurement, security, and customer signoffs are retained before production use."
  }
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function buildGlobalCertificationReadinessBrief() {
  const summary = getGlobalCertificationReadinessSummary();

  return [
    "# SCRIMED Global Approval and Certification Readiness Brief",
    "",
    `Status: ${summary.status}`,
    `Reviewed: ${summary.updated}`,
    `Tracks: ${summary.trackCount}`,
    `Sources: ${summary.sourceCount}`,
    `Gates: ${summary.gateCount}`,
    `Regional packs: ${summary.regionalPackCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not legal advice, regulatory approval, HIPAA compliance certification, SOC 2/HITRUST/ISO certification, FDA clearance, ONC certification, EU AI Act conformity, GDPR compliance assurance, NHS approval, MHRA approval, Australian cyber certification, PHI processing authority, public-sector procurement approval, reimbursement assurance, production connector approval, or live clinical care authority.",
    "",
    "## Tracks",
    ...summary.tracks.map(
      (track) =>
        `- ${track.title} (${track.status}, ${track.jurisdiction}): ${track.operatingGoal} Next: ${track.nextAction} Blocked claims: ${track.blockedClaims.join(", ")}`
    ),
    "",
    "## Gates",
    ...summary.gates.map(
      (gate) =>
        `- ${gate.gate}: ${gate.purpose} Owner: ${gate.owner} Blocked until complete: ${gate.blockedUntilComplete.join(", ")}`
    ),
    "",
    "## Regional Packs",
    ...summary.regionalPacks.map(
      (pack) =>
        `- ${pack.region} (${pack.priority}): ${pack.safeNearTermMotion} Hard stops: ${pack.productionHardStops.join(", ")}`
    ),
    "",
    "## Source Review",
    ...summary.sources.map(
      (source) =>
        `- ${source.name} (${source.jurisdiction}): ${source.scrimedImplication} Source: ${source.url}`
    )
  ].join("\n");
}

export function getGlobalCertificationReadinessSummary() {
  const proofRoutes = unique(certificationTracks.flatMap((track) => track.proofRoutes));
  const blockedClaims = unique(certificationTracks.flatMap((track) => track.blockedClaims));
  const owners = unique([
    ...certificationTracks.flatMap((track) => track.accountableOwners),
    ...certificationGates.map((gate) => gate.owner)
  ]);
  const jurisdictions = unique(certificationTracks.map((track) => track.jurisdiction));
  const requiredEvidence = unique(certificationTracks.flatMap((track) => track.requiredEvidence));

  return {
    service: "scrimed-global-approval-certification-readiness",
    status: globalCertificationReadinessStatus,
    briefStatus: globalCertificationReadinessBriefStatus,
    route: globalCertificationReadinessRoute,
    apiRoute: globalCertificationReadinessApiRoute,
    briefRoute: globalCertificationReadinessBriefRoute,
    boundary: globalCertificationReadinessBoundary,
    updated: globalCertificationReadinessUpdatedAt,
    sourceCount: certificationReadinessSources.length,
    trackCount: certificationTracks.length,
    gateCount: certificationGates.length,
    regionalPackCount: regionalCertificationPacks.length,
    roadmapPhaseCount: certificationRoadmap.length,
    jurisdictionCount: jurisdictions.length,
    proofRouteCount: proofRoutes.length,
    blockedClaimCount: blockedClaims.length,
    ownerCount: owners.length,
    requiredEvidenceCount: requiredEvidence.length,
    foundationActiveCount: certificationTracks.filter((track) => track.status === "foundation-active").length,
    evidenceBuildRequiredCount: certificationTracks.filter(
      (track) => track.status === "evidence-build-required"
    ).length,
    externalReviewRequiredCount: certificationTracks.filter(
      (track) => track.status === "external-review-required"
    ).length,
    blockedBeforeApprovalCount: certificationTracks.filter(
      (track) => track.status === "blocked-before-approval"
    ).length,
    jurisdictions,
    proofRoutes,
    blockedClaims,
    owners,
    requiredEvidence,
    sources: certificationReadinessSources,
    tracks: certificationTracks,
    gates: certificationGates,
    regionalPacks: regionalCertificationPacks,
    roadmap: certificationRoadmap,
    nextBuildStep:
      "Create metadata-only evidence rooms for HIPAA/BAA, SOC 2/ISO 42001, FDA/CDS/SaMD classification, EU AI Act/GDPR, UK DTAC/MHRA, and regional deployment packs."
  };
}
