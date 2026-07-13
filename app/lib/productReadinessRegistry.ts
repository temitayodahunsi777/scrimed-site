export type ScrimedProductReadinessStage =
  | "synthetic-demo-ready"
  | "diligence-ready"
  | "protected-pilot-prep"
  | "blocked-before-clinical-production";

export type ScrimedProductReadinessItem = {
  name: string;
  slug: string;
  description: string;
  currentStage: ScrimedProductReadinessStage;
  allowedDemoMode: string;
  blockedProductionMode: string;
  nextEngineeringMilestone: string;
  investorNarrative: string;
  complianceNote: string;
};

export const productReadinessRegistryApiRoute = "/api/products/readiness";
export const productReadinessRegistryStatus =
  "scrimed-product-readiness-registry-active-no-phi";
export const productReadinessRegistryUpdatedAt = "2026-06-29";

const standardClinicalBlock =
  "No live PHI, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, connector writes, certification claims, or clinical validation claims.";

export const scrimedProductReadinessRegistry: ScrimedProductReadinessItem[] = [
  {
    name: "SCRIMED OS",
    slug: "scrimed-os",
    description: "AI-native healthcare intelligence operating system for governed workflows, evidence, agents, trust, and enterprise readiness.",
    currentStage: "diligence-ready",
    allowedDemoMode: "No-PHI operating-system walkthrough, readiness evidence, architecture review, and buyer diligence snapshot.",
    blockedProductionMode: standardClinicalBlock,
    nextEngineeringMilestone: "Bind command-center readiness status to authenticated buyer workspaces and release-control artifacts.",
    investorNarrative: "Positions SCRIMED as the horizontal control plane across clinical, operational, payer, and research intelligence.",
    complianceNote: "Readiness posture only; no HIPAA/SOC/FDA/ONC certification or production approval is claimed."
  },
  {
    name: "Sanar AI",
    slug: "sanar-ai",
    description: "Synthetic clinical-assistant layer for evidence-aware reasoning support, uncertainty surfacing, and reviewer escalation.",
    currentStage: "synthetic-demo-ready",
    allowedDemoMode: "Synthetic cases with missing-data, conflict, timeline, citation, and human-review scorecards.",
    blockedProductionMode: standardClinicalBlock,
    nextEngineeringMilestone: "Add reviewer-calibrated evaluation datasets and licensed clinical governance before any live-care expansion.",
    investorNarrative: "Shows SCRIMED can support high-trust clinical reasoning workflows without autonomous clinical authority.",
    complianceNote: "Research/demo use only; not for diagnosis, treatment, prescribing, or live patient care."
  },
  {
    name: "MyVitals AI",
    slug: "myvitals-ai",
    description: "Patient-facing vitals education and engagement concept for future RPM and virtual-care support.",
    currentStage: "blocked-before-clinical-production",
    allowedDemoMode: "Synthetic educational examples and no-PHI workflow mapping.",
    blockedProductionMode: "No live vitals ingestion, patient advice, remote monitoring decisions, outreach, escalation, or device integration.",
    nextEngineeringMilestone: "Design consent, RPM device, alerting, data-retention, and clinician-review architecture.",
    investorNarrative: "Expands SCRIMED's patient engagement surface while keeping clinical escalation gated.",
    complianceNote: "Requires privacy, security, clinical, consent, and device/data governance before pilot use."
  },
  {
    name: "DocuTwin",
    slug: "docutwin",
    description: "Documentation twin for source-traced draft notes, missing-source detection, and clinician signoff workflows.",
    currentStage: "synthetic-demo-ready",
    allowedDemoMode: "Synthetic note drafting with source trace, note-only blind-spot warnings, and unsigned draft boundaries.",
    blockedProductionMode: "No signed documentation, record mutation, EHR writeback, or clinician replacement.",
    nextEngineeringMilestone: "Attach durable review dispositions and source-trace evidence cards to every draft.",
    investorNarrative: "Targets clinician documentation burden while preserving accountable signoff.",
    complianceNote: "Draft-only and no-PHI until customer authority, BAA/DPA, and EHR connector controls exist."
  },
  {
    name: "CareExplain",
    slug: "careexplain",
    description: "Plain-language, citation-aware patient education drafting with multilingual uncertainty handling.",
    currentStage: "synthetic-demo-ready",
    allowedDemoMode: "Synthetic general education drafts with citation requirements and reviewer queues.",
    blockedProductionMode: "No patient-specific instructions, diagnosis explanation, outreach, or treatment advice.",
    nextEngineeringMilestone: "Add approved education content library, translation QA, and reviewer release workflow.",
    investorNarrative: "Creates a high-margin communication layer for clinics while reducing unsafe advice risk.",
    complianceNote: "General education only; clinical and patient-specific release requires qualified review."
  },
  {
    name: "Ambient Scribe",
    slug: "ambient-scribe",
    description: "Ambient clinical workflow foundation for conversation capture, draft notes, and review-gated downstream support.",
    currentStage: "synthetic-demo-ready",
    allowedDemoMode: "Synthetic conversation artifacts, noise handling, prompt-injection refusal, and unsigned drafts.",
    blockedProductionMode: "No live patient capture, orders, prescribing, patient instructions, or EHR filing.",
    nextEngineeringMilestone: "Design local speech, consent, retention, speaker diarization, and clinician signoff pipeline.",
    investorNarrative: "Competes in ambient AI by extending beyond transcription into governed workflow support.",
    complianceNote: "Live audio and PHI remain blocked until consent, security, privacy, and clinical governance are approved."
  },
  {
    name: "Co-Pilot Intake",
    slug: "co-pilot-intake",
    description: "No-PHI buyer and workflow intake assistant for demo, pilot, requirement, and operational triage.",
    currentStage: "diligence-ready",
    allowedDemoMode: "Synthetic intake triage, routing, readiness checklist, and follow-up packet creation.",
    blockedProductionMode: "No patient intake, clinical triage, outreach, live scheduling, or record creation.",
    nextEngineeringMilestone: "Add authenticated workspace intake storage with tenant-level permissions and retention.",
    investorNarrative: "Turns sales, onboarding, and operational discovery into repeatable workflow evidence.",
    complianceNote: "Business intake only unless explicit clinical-data authorization exists."
  },
  {
    name: "Perfect Chart",
    slug: "perfect-chart",
    description: "Chart completeness and documentation-quality intelligence for missing evidence, conflicts, and draft CDI support.",
    currentStage: "synthetic-demo-ready",
    allowedDemoMode: "Synthetic chart-gap checklists and reviewer-held CDI support.",
    blockedProductionMode: "No final coding, billing, chart completion claim, claim submission, or record mutation.",
    nextEngineeringMilestone: "Persist source-backed completion evidence and reviewer dispositions in the durable attempt store.",
    investorNarrative: "Links clinical documentation quality to defensible RCM value without overclaiming automation.",
    complianceNote: "CDI support is draft-only and human-reviewed."
  },
  {
    name: "Trust Engine",
    slug: "trust-engine",
    description: "Policy, evidence, confidence, review, clinical-risk, refusal, and audit controls for SCRIMED outputs.",
    currentStage: "diligence-ready",
    allowedDemoMode: "Evidence cards, no-go boundaries, scorecards, immutable metadata, and human-review states.",
    blockedProductionMode: standardClinicalBlock,
    nextEngineeringMilestone: "Attach Trust Engine decisions to every protected route and reviewer queue.",
    investorNarrative: "Differentiates SCRIMED through safety infrastructure rather than raw chatbot output.",
    complianceNote: "Governance layer only; does not create regulatory approval or certification."
  },
  {
    name: "TrialCore",
    slug: "trialcore",
    description: "Clinical research and trial-matching workflow simulator with criteria traceability and uncertainty flags.",
    currentStage: "synthetic-demo-ready",
    allowedDemoMode: "Synthetic eligibility uncertainty, criteria trace, evidence ranking, and reviewer queues.",
    blockedProductionMode: "No patient enrollment, live matching, recruitment outreach, or clinical trial recommendation.",
    nextEngineeringMilestone: "Add literature/trial source registry, evidence grading, and investigator review workflow.",
    investorNarrative: "Opens research and pharma-adjacent value while remaining source-attributed and review-gated.",
    complianceNote: "Research simulation only until trial, IRB, privacy, and consent requirements are approved."
  },
  {
    name: "Onco-ID",
    slug: "onco-id",
    description: "Oncology evidence and guideline comparison layer for ambiguous staging, therapy history, and source-grounded review.",
    currentStage: "synthetic-demo-ready",
    allowedDemoMode: "Synthetic oncology evidence checks with guideline/citation and model-disagreement controls.",
    blockedProductionMode: "No oncology diagnosis, staging finalization, treatment selection, or therapy recommendation.",
    nextEngineeringMilestone: "Add oncology evidence registry, guideline versioning, and specialist reviewer workflow.",
    investorNarrative: "Specialty depth creates strategic value while demonstrating caution in high-risk clinical areas.",
    complianceNote: "Requires oncology clinician governance before any live-care workflow."
  },
  {
    name: "Clinical MCP Adapter",
    slug: "clinical-mcp-adapter",
    description: "MCP-compatible tool-access foundation for scoped, permissioned, audited healthcare tools.",
    currentStage: "protected-pilot-prep",
    allowedDemoMode: "Synthetic tool registry, scoped permissions, and no-external-side-effect route planning.",
    blockedProductionMode: "No tool execution against production EHR, payer, device, patient, or connector systems.",
    nextEngineeringMilestone: "Implement OAuth scoped tokens, revocation, tool-level auth, and audit events.",
    investorNarrative: "Sets up SCRIMED for agentic interoperability without unsafe tool autonomy.",
    complianceNote: "Tool access must be least-privilege, tenant-scoped, and human-reviewed."
  },
  {
    name: "Trust QA Loop",
    slug: "trust-qa-loop",
    description: "Continuous review, audit, regression, and safety-loop foundation for SCRIMED products.",
    currentStage: "diligence-ready",
    allowedDemoMode: "No-secret contract tests, synthetic scorecards, boundary checks, and reviewer evidence.",
    blockedProductionMode: "No claim that synthetic QA validates live clinical performance.",
    nextEngineeringMilestone: "Add persisted evaluation datasets, reviewer calibration, and release gates.",
    investorNarrative: "Turns quality and safety into operating leverage and buyer confidence.",
    complianceNote: "Evaluation readiness only; not clinical validation."
  },
  {
    name: "Agent Commander",
    slug: "agent-commander",
    description: "Agent orchestration command surface for identity, permissions, review gates, trace logs, and recovery.",
    currentStage: "protected-pilot-prep",
    allowedDemoMode: "Synthetic agent run plans, model-route telemetry, and human approval gates.",
    blockedProductionMode: "No autonomous protected workflow execution or production tool access.",
    nextEngineeringMilestone: "Add live steering, supervisor policies, and durable trace replay under tenant RBAC.",
    investorNarrative: "Shows SCRIMED as an AI operating system with governable agents, not a chatbot.",
    complianceNote: "All protected agent actions require explicit permissions and human review."
  },
  {
    name: "Edge Runtime",
    slug: "edge-runtime",
    description: "Private hospital-deployable architecture for local inference, local knowledge, FHIR gateway, and offline processing.",
    currentStage: "protected-pilot-prep",
    allowedDemoMode: "Architecture and synthetic local-processing readiness review.",
    blockedProductionMode: "No hospital deployment, local PHI processing, or connector approval yet.",
    nextEngineeringMilestone: "Define local inference, speech, vision, FHIR, encryption, backup, and data-residency controls.",
    investorNarrative: "Creates a path to privacy-preserving enterprise deployments and strategic infrastructure partnerships.",
    complianceNote: "Private AI claims require customer-specific architecture, contracts, and security review."
  },
  {
    name: "InsightLoop",
    slug: "insightloop",
    description: "Continuous operational intelligence loop for reviews, bottlenecks, innovation queue, and system improvement.",
    currentStage: "diligence-ready",
    allowedDemoMode: "Synthetic operations scorecards, improvement lanes, and release evidence.",
    blockedProductionMode: "No autonomous operational changes to live clinical, payer, outreach, or record systems.",
    nextEngineeringMilestone: "Add metrics store, anomaly detection, and reviewer-approved action queues.",
    investorNarrative: "Compounds SCRIMED learning velocity while preserving governance.",
    complianceNote: "Recommendation and audit layer only until operations owners approve actions."
  },
  {
    name: "RCM / Payer Agent",
    slug: "rcm-payer-agent",
    description: "Reviewer-held revenue-cycle and payer policy synthesis for prior auth, appeals, and documentation packets.",
    currentStage: "synthetic-demo-ready",
    allowedDemoMode: "Synthetic policy summaries, missing-document checklists, and reviewer-held packet drafts.",
    blockedProductionMode: "No claim submission, prior authorization submission, appeal filing, coding finalization, or reimbursement guarantee.",
    nextEngineeringMilestone: "Add payer-source registry, packet review workflow, and durable audit binding.",
    investorNarrative: "Targets clear ROI through administrative burden reduction while blocking risky submission automation.",
    complianceNote: "Human-reviewed payer support only; no payer action authority."
  },
  {
    name: "Referral Intelligence",
    slug: "referral-intelligence",
    description: "Referral workflow intelligence for routing, leakage analysis, wait-time signals, and closed-loop status tracking.",
    currentStage: "synthetic-demo-ready",
    allowedDemoMode: "Synthetic routing, provider matching, insurance-check placeholders, leakage dashboard, and status tracking.",
    blockedProductionMode: "No patient outreach, live scheduling, referral order placement, or EHR update.",
    nextEngineeringMilestone: "Add no-PHI referral ROI dashboard, appointment workflow simulator, and reviewer-held handoff.",
    investorNarrative: "Converts a major health-system leakage problem into measurable workflow intelligence.",
    complianceNote: "Operational intelligence only until patient, payer, and EHR authority exist."
  },
  {
    name: "Clinical Robustness Lab",
    slug: "clinical-robustness-lab",
    description: "Synthetic adversarial clinical-readiness evaluation for SCRIMED agents and products.",
    currentStage: "diligence-ready",
    allowedDemoMode: "No-PHI scenario scorecards across missing evidence, hallucination, citations, bias, freshness, and reviewer gates.",
    blockedProductionMode: "No clinical validation, diagnosis, treatment, prescribing, or live patient care.",
    nextEngineeringMilestone: "Persist evaluation reports and bind them to release-control gates.",
    investorNarrative: "Proves SCRIMED measures clinical readiness in a domain-specific way rather than relying on leaderboards.",
    complianceNote: "Research/demo use only. Not for diagnosis, treatment, prescribing, or live patient care."
  },
  {
    name: "Investor Readiness Command Center",
    slug: "investor-readiness-command-center",
    description: "Enterprise diligence snapshot for deployment, safety, risk, evidence, model, integration, and milestone readiness.",
    currentStage: "diligence-ready",
    allowedDemoMode: "Investor and buyer diligence command center with no-go boundaries and evidence links.",
    blockedProductionMode: "No securities advice, investment solicitation, valuation assurance, certification, or production approval.",
    nextEngineeringMilestone: "Attach live CI/build artifact ingestion and protected buyer workspace evidence.",
    investorNarrative: "Makes SCRIMED's operating discipline legible to strategic, corporate, private, and clinic investors.",
    complianceNote: "Diligence material only; legal, financial, accounting, and securities review required before use externally."
  }
];

function countByStage(items: ScrimedProductReadinessItem[]) {
  return items.reduce<Record<ScrimedProductReadinessStage, number>>(
    (counts, item) => {
      counts[item.currentStage] += 1;
      return counts;
    },
    {
      "synthetic-demo-ready": 0,
      "diligence-ready": 0,
      "protected-pilot-prep": 0,
      "blocked-before-clinical-production": 0
    }
  );
}

export function getProductReadinessRegistrySummary() {
  const stageCounts = countByStage(scrimedProductReadinessRegistry);

  return {
    service: "scrimed-product-readiness-registry",
    apiRoute: productReadinessRegistryApiRoute,
    status: productReadinessRegistryStatus,
    updated: productReadinessRegistryUpdatedAt,
    productCount: scrimedProductReadinessRegistry.length,
    stageCounts,
    currentSellableMotion:
      "GO for no-PHI synthetic demos, enterprise readiness assessments, buyer diligence packets, and protected-pilot preparation. NO-GO for live PHI, autonomous clinical action, patient outreach, payer submission, EHR writeback, connector approval, certification claims, or clinical validation claims.",
    products: scrimedProductReadinessRegistry
  };
}
