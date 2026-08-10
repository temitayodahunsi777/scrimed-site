import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";

export const strategicPartnerReadinessVersion =
  "scrimed-strategic-partner-readiness-v1-2026-08-09";

export type StrategicPartnerReadinessProfile = {
  id: string;
  organizationClass: string;
  strategicFit: string;
  technicalFit: string[];
  likelyIntegrationSurfaces: string[];
  dataRequirements: string[];
  deploymentRequirements: string[];
  governanceExpectations: string[];
  businessValueHypothesis: string;
  currentReadiness: "foundation" | "evaluation-ready" | "external-proof-required";
  missingProof: string[];
  nextTechnicalMilestone: string;
  disclaimer: "Strategic readiness profile — no partnership implied.";
};

function profile(
  input: Omit<StrategicPartnerReadinessProfile, "disclaimer">
): StrategicPartnerReadinessProfile {
  return {
    ...input,
    disclaimer: "Strategic readiness profile — no partnership implied."
  };
}

export const strategicPartnerReadinessProfiles: StrategicPartnerReadinessProfile[] = [
  profile({
    id: "nvidia",
    organizationClass: "NVIDIA",
    strategicFit: "Provider-neutral accelerated inference, edge deployment, and healthcare AI evaluation infrastructure.",
    technicalFit: ["GPU/runtime abstraction", "model conformance", "edge and private inference"],
    likelyIntegrationSurfaces: ["compute fabric", "benchmark lab", "sovereign deployment plane"],
    dataRequirements: ["synthetic benchmark inputs", "no PHI without separate authority"],
    deploymentRequirements: ["measured accelerator fit", "capacity and cost evidence", "rollback"],
    governanceExpectations: ["model passport", "supply-chain evidence", "human review for clinical output"],
    businessValueHypothesis: "Demonstrate governed healthcare workloads that can use accelerated infrastructure without vendor lock-in.",
    currentReadiness: "evaluation-ready",
    missingProof: ["hardware-specific benchmark evidence", "external technical sponsor", "commercial terms"],
    nextTechnicalMilestone: "Run the same synthetic workload on configurable CPU and GPU profiles and compare verified-task cost."
  }),
  profile({
    id: "microsoft",
    organizationClass: "Microsoft",
    strategicFit: "Enterprise identity, private networking, healthcare interoperability, and governed cloud deployment.",
    technicalFit: ["enterprise identity abstraction", "Azure-oriented deployment profile", "FHIR-ready interfaces"],
    likelyIntegrationSurfaces: ["identity plane", "sovereign enclave", "clinical data fabric"],
    dataRequirements: ["tenant-scoped synthetic data", "approved residency and retention before protected data"],
    deploymentRequirements: ["private network profile", "tenant policy", "auditable failover"],
    governanceExpectations: ["least privilege", "regional controls", "provider documentary review"],
    businessValueHypothesis: "Offer healthcare organizations an auditable path from synthetic evaluation to protected enterprise deployment.",
    currentReadiness: "foundation",
    missingProof: ["validated cloud landing zone", "external architecture review", "customer-specific requirements"],
    nextTechnicalMilestone: "Validate the Azure-oriented profile in a synthetic, nonproduction environment with no external write access."
  }),
  profile({
    id: "openai",
    organizationClass: "OpenAI",
    strategicFit: "Frontier reasoning and tool-use evaluation behind SCRIMED's provider-neutral governance and evidence layer.",
    technicalFit: ["model adapter", "structured output", "tool-use and safety evaluation"],
    likelyIntegrationSurfaces: ["model gateway", "evaluation arena", "agent runtime"],
    dataRequirements: ["synthetic or approved data only", "provider policy before protected use"],
    deploymentRequirements: ["optional credentials", "circuit breaker", "no privacy downgrade fallback"],
    governanceExpectations: ["task qualification", "model/version provenance", "human clinical review"],
    businessValueHypothesis: "Show how advanced models can be operationalized through healthcare-specific controls, evaluations, and evidence.",
    currentReadiness: "evaluation-ready",
    missingProof: ["current provider conformance run", "documentary PHI eligibility review", "external relationship"],
    nextTechnicalMilestone: "Execute an offline prompt-set conformance run through the existing adapter without production data."
  }),
  profile({
    id: "anthropic",
    organizationClass: "Anthropic",
    strategicFit: "Alternative frontier reasoning lane for governed synthesis, long-context work, and provider resilience.",
    technicalFit: ["provider adapter", "long-context evaluation", "safe fallback policy"],
    likelyIntegrationSurfaces: ["model gateway", "research pipeline", "evaluation arena"],
    dataRequirements: ["synthetic benchmark corpus", "approved retention and residency before protected use"],
    deploymentRequirements: ["capability conformance", "bounded retries", "incident handling"],
    governanceExpectations: ["no silent substitution", "task-specific promotion", "source-grounded output"],
    businessValueHypothesis: "Increase model portability and resilience while preserving identical healthcare safety gates.",
    currentReadiness: "evaluation-ready",
    missingProof: ["current conformance evidence", "commercial and policy review", "external relationship"],
    nextTechnicalMilestone: "Run a provider-failure and structured-output comparison against the same synthetic tasks."
  }),
  profile({
    id: "apple",
    organizationClass: "Apple",
    strategicFit: "Privacy-preserving on-device preprocessing, consent, and offline patient-facing utilities.",
    technicalFit: ["edge runtime contract", "local de-identification", "minimal telemetry"],
    likelyIntegrationSurfaces: ["edge runtime", "patient experience", "de-identification"],
    dataRequirements: ["local synthetic fixtures", "explicit consent and retention policy"],
    deploymentRequirements: ["device capability profile", "offline fail-safe", "no raw data telemetry"],
    governanceExpectations: ["user control", "purpose limitation", "clinical neutrality"],
    businessValueHypothesis: "Reduce privacy exposure and extend low-connectivity workflows through local processing.",
    currentReadiness: "foundation",
    missingProof: ["native device implementation", "energy/performance evidence", "external relationship"],
    nextTechnicalMilestone: "Validate the local-first contract with simulated mobile device profiles and PHI-safe telemetry tests."
  }),
  profile({
    id: "siemens",
    organizationClass: "Siemens",
    strategicFit: "Enterprise automation, infrastructure, and operational digital-twin alignment.",
    technicalFit: ["workflow twin", "edge operations", "infrastructure observability"],
    likelyIntegrationSurfaces: ["operations command", "workflow simulation", "sovereign deployment"],
    dataRequirements: ["synthetic operational events", "no facility credentials"],
    deploymentRequirements: ["read-only adapter", "network boundary", "recovery plan"],
    governanceExpectations: ["connector policy", "vendor-change monitoring", "operator approval"],
    businessValueHypothesis: "Connect healthcare workflow intelligence with governed enterprise operations and resilience.",
    currentReadiness: "foundation",
    missingProof: ["validated adapter", "operational benchmark", "external relationship"],
    nextTechnicalMilestone: "Model a synthetic hospital workflow twin with explicit handoffs, bottlenecks, cost, and evidence."
  }),
  profile({
    id: "siemens-healthineers",
    organizationClass: "Siemens Healthineers",
    strategicFit: "Vendor-neutral imaging workflow intelligence and site-validation governance.",
    technicalFit: ["DICOM metadata", "imaging worklist adapter", "site validation"],
    likelyIntegrationSurfaces: ["imaging control plane", "PACS/RIS contracts", "evidence ledger"],
    dataRequirements: ["synthetic DICOM metadata", "no image or device connectivity by default"],
    deploymentRequirements: ["offline/shadow mode", "radiologist override", "maximum-delay safeguard"],
    governanceExpectations: ["intended-use boundary", "model card", "site-specific validation"],
    businessValueHypothesis: "Improve imaging workflow readiness while preserving clinician authority and vendor neutrality.",
    currentReadiness: "foundation",
    missingProof: ["site-validation run", "device ecosystem contract", "external relationship"],
    nextTechnicalMilestone: "Complete a synthetic exam-completeness and queue-recommendation shadow evaluation."
  }),
  profile({
    id: "philips",
    organizationClass: "Philips",
    strategicFit: "Imaging, monitoring-workflow visualization, and remote service interoperability.",
    technicalFit: ["DICOM/FHIR metadata", "synthetic signal workflow", "remote support handoff"],
    likelyIntegrationSurfaces: ["imaging adapter", "MyVitals demo", "care operations"],
    dataRequirements: ["synthetic signals and metadata", "no production device feeds"],
    deploymentRequirements: ["read-only shadow profile", "site controls", "rollback"],
    governanceExpectations: ["no monitoring claim", "human review", "connector conformance"],
    businessValueHypothesis: "Explore governed workflow support around device ecosystems without claiming medical-device integration.",
    currentReadiness: "foundation",
    missingProof: ["connector conformance", "workflow study", "external relationship"],
    nextTechnicalMilestone: "Demonstrate synthetic signal visualization with explicit non-monitoring and no-device boundaries."
  }),
  profile({
    id: "ge-healthcare",
    organizationClass: "GE HealthCare",
    strategicFit: "Imaging workflow integration, fleet variance evidence, and vendor-neutral clinical operations.",
    technicalFit: ["DICOM contracts", "fleet variance metadata", "site-validation evidence"],
    likelyIntegrationSurfaces: ["imaging control plane", "operations dashboard", "evidence graph"],
    dataRequirements: ["synthetic metadata", "site and device identifiers without PHI"],
    deploymentRequirements: ["shadow mode", "operator controls", "no report finalization"],
    governanceExpectations: ["model admission", "override evidence", "no inherited regulatory status"],
    businessValueHypothesis: "Provide a governed orchestration layer around imaging operations and evidence generation.",
    currentReadiness: "foundation",
    missingProof: ["site-specific test", "technical interface review", "external relationship"],
    nextTechnicalMilestone: "Run a multi-site synthetic metadata variance test with retained subgroup results."
  }),
  profile({
    id: "emory",
    organizationClass: "Emory",
    strategicFit: "Academic health-system workflow studies, clinician feedback, research protocols, and evidence generation.",
    technicalFit: ["synthetic pilot factory", "evaluation harness", "research governance"],
    likelyIntegrationSurfaces: ["TrialCore", "clinical benchmark lab", "workflow intelligence"],
    dataRequirements: ["synthetic data until agreements and approvals exist", "protocol-governed evidence"],
    deploymentRequirements: ["research scope", "named owners", "human review"],
    governanceExpectations: ["IRB/DUA review where applicable", "publication permission", "no institutional claim"],
    businessValueHypothesis: "Co-design measurable workflow studies and benchmark methods if a formal relationship is established.",
    currentReadiness: "external-proof-required",
    missingProof: ["institutional sponsor", "approved protocol", "formal relationship"],
    nextTechnicalMilestone: "Prepare a no-PHI workflow-study protocol and synthetic evidence packet for independent review."
  }),
  profile({
    id: "large-health-systems",
    organizationClass: "Large health systems",
    strategicFit: "Governed workflow intelligence across access, documentation, RCM, interoperability, and operations.",
    technicalFit: ["tenant isolation", "workflow intelligence", "enterprise diligence"],
    likelyIntegrationSurfaces: ["SCRIMED Work", "Documentation Before Authorization", "Trust Center"],
    dataRequirements: ["synthetic discovery first", "minimum-necessary protected data only after approvals"],
    deploymentRequirements: ["identity", "audit persistence", "integration validation", "rollback"],
    governanceExpectations: ["clinical, security, privacy, legal, and operational ownership"],
    businessValueHypothesis: "Begin with a bounded assessment, prove workflow value, then expand only on verified outcomes.",
    currentReadiness: "evaluation-ready",
    missingProof: ["buyer-specific baseline", "paid engagement", "verified outcomes"],
    nextTechnicalMilestone: "Complete a buyer-specific synthetic workflow rehearsal with acceptance and expansion criteria."
  }),
  profile({
    id: "sovereign-ai-organizations",
    organizationClass: "Sovereign AI organizations",
    strategicFit: "Private, regional, air-gapped, and policy-controlled healthcare intelligence deployment.",
    technicalFit: ["sovereign enclave", "local model routing", "offline artifact promotion"],
    likelyIntegrationSurfaces: ["clinical assurance plane", "compute fabric", "audit evidence"],
    dataRequirements: ["jurisdiction-specific classification", "separate indexes, caches, logs, and keys"],
    deploymentRequirements: ["reserved capacity", "independent recovery", "default-deny egress"],
    governanceExpectations: ["customer-controlled policy", "signed artifacts", "regional legal review"],
    businessValueHypothesis: "Support healthcare AI sovereignty without coupling clinical authority to a single provider.",
    currentReadiness: "foundation",
    missingProof: ["enclave recovery evidence", "regional legal review", "deployment sponsor"],
    nextTechnicalMilestone: "Run the synthetic CAL-3 recovery and supplier-withdrawal drill against an isolated profile."
  }),
  profile({
    id: "hyperscalers",
    organizationClass: "Hyperscalers",
    strategicFit: "Portable enterprise deployment, model access, observability, and global capacity under SCRIMED policy.",
    technicalFit: ["cloud-neutral profiles", "model gateway", "capacity passports"],
    likelyIntegrationSurfaces: ["compute fabric", "sovereign deployment", "enterprise identity"],
    dataRequirements: ["tenant and residency policy", "no protected data before documentary approval"],
    deploymentRequirements: ["private network", "capacity admission", "independent failover"],
    governanceExpectations: ["provider concentration budget", "supplier change review", "no silent fallback"],
    businessValueHypothesis: "Use cloud capacity without surrendering model, provider, regional, or recovery portability.",
    currentReadiness: "foundation",
    missingProof: ["multi-cloud recovery test", "contract evidence", "measured operating economics"],
    nextTechnicalMilestone: "Simulate a provider withdrawal and prove materially independent queue transfer and audit continuity."
  })
];

export function getStrategicPartnerReadinessSummary() {
  const summary = {
    service: "scrimed-strategic-partner-readiness" as const,
    version: strategicPartnerReadinessVersion,
    status: "internal-hypothesis-no-partnership-implied" as const,
    profileCount: strategicPartnerReadinessProfiles.length,
    profiles: strategicPartnerReadinessProfiles,
    boundary:
      "Strategic readiness profiles are internal planning hypotheses. They do not imply contact, endorsement, partnership, investment, customer status, technical approval, or commercial terms.",
    externalActionsExecuted: false as const
  };

  return {
    ...summary,
    evidenceHash: createClinicalEvidenceHash(summary)
  };
}
