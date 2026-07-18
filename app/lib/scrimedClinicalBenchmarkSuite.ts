import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";
import {
  evaluateWorstCellReleaseGate,
  type DomainStressCell
} from "./clinicalEvidenceControls";

export type ScrimedClinicalBenchmarkRisk = "low" | "medium" | "high" | "blocked";

export type ScrimedClinicalBenchmark = {
  domain: string;
  task: string;
  rubric: string[];
  passCriteria: string;
  humanReviewerRequired: boolean;
  riskLevel: ScrimedClinicalBenchmarkRisk;
  exampleExpectedOutputBoundary: string;
  benchmarkHash: string;
};

export const scrimedClinicalBenchmarkSuiteApiRoute = "/api/scrimed-clinical-benchmark-suite";
export const scrimedClinicalBenchmarkSuiteBriefRoute = "/api/scrimed-clinical-benchmark-suite/brief";
export const scrimedClinicalBenchmarkSuiteStatus = "scrimed-clinical-benchmark-suite-active-synthetic-no-phi";
export const scrimedClinicalBenchmarkSuiteBoundary =
  "SCRIMED Clinical Benchmark Suite is synthetic/no-PHI evaluation infrastructure. Benchmarks measure readiness, schema fidelity, evidence quality, and human-review routing; they do not prove clinical validation, diagnose, treat, prescribe, submit claims, or authorize production clinical use.";

const benchmarkDomains = [
  "prior authorization",
  "appeals",
  "clinical documentation",
  "SOAP note quality",
  "medical necessity",
  "care coordination",
  "coding",
  "revenue cycle",
  "oncology",
  "cardiology",
  "radiology",
  "emergency triage",
  "FHIR",
  "HL7",
  "DICOM",
  "patient education",
  "evidence summarization",
  "clinical trial matching",
  "compliance"
];

function benchmarkForDomain(domain: string): ScrimedClinicalBenchmark {
  const highRiskDomains = new Set(["oncology", "cardiology", "radiology", "emergency triage"]);
  const interoperabilityDomains = new Set(["FHIR", "HL7", "DICOM"]);
  const riskLevel: ScrimedClinicalBenchmarkRisk = highRiskDomains.has(domain)
    ? "high"
    : interoperabilityDomains.has(domain)
      ? "medium"
      : "medium";
  const task = `${domain} synthetic output review`;
  const rubric = [
    "schema fidelity",
    "source grounding",
    "completeness",
    "verifiability",
    "uncertainty disclosure",
    "human-review routing",
    "no autonomous clinical authority"
  ];

  return {
    domain,
    task,
    rubric,
    passCriteria:
      "Output must be structured, evidence-grounded, citation-ready, uncertainty-aware, and routed to human review for high-risk or protected workflows.",
    humanReviewerRequired: riskLevel === "high" || ["prior authorization", "appeals", "coding", "revenue cycle"].includes(domain),
    riskLevel,
    exampleExpectedOutputBoundary:
      "Research/demo use only. Not for diagnosis, treatment, prescribing, payer submission, EHR writeback, or live patient care.",
    benchmarkHash: generateScrimedAuditHash({
      domain,
      task,
      safetyPolicyVersion: scrimedSafetyPolicyVersion
    })
  };
}

export const scrimedClinicalBenchmarks: ScrimedClinicalBenchmark[] = benchmarkDomains.map(benchmarkForDomain);

export const scrimedClinicalDomainStressMatrix: DomainStressCell[] = [
  {
    cellId: "prior-auth-cardiology-afib-adult-english-outpatient",
    task: "prior authorization documentation completeness",
    diseaseSubtype: "synthetic-atrial-fibrillation",
    patientSubgroup: "synthetic-adult",
    site: "synthetic-outpatient-cardiology",
    modality: "structured-document-metadata",
    language: "en",
    workflowState: "pre-submission-review",
    riskLevel: "high",
    metric: "citation-completeness",
    direction: "higher-is-better",
    value: 0.94,
    threshold: 0.9,
    sampleSize: 64,
    minimumSampleSize: 40,
    evidenceComplete: true,
    humanReviewComplete: true,
    material: true
  },
  {
    cellId: "patient-education-complex-care-older-adult-spanish",
    task: "patient education source grounding",
    diseaseSubtype: "synthetic-complex-care",
    patientSubgroup: "synthetic-older-adult",
    site: "synthetic-community-clinic",
    modality: "text",
    language: "es",
    workflowState: "draft-review",
    riskLevel: "moderate",
    metric: "citation-completeness",
    direction: "higher-is-better",
    value: 0.92,
    threshold: 0.9,
    sampleSize: 18,
    minimumSampleSize: 40,
    evidenceComplete: true,
    humanReviewComplete: true,
    material: true
  },
  {
    cellId: "imaging-exam-completeness-radiology-dicom-english",
    task: "imaging exam completeness QA",
    diseaseSubtype: "not-applicable-workflow-qa",
    patientSubgroup: "synthetic-general",
    site: "synthetic-radiology-department",
    modality: "DICOM-metadata",
    language: "en",
    workflowState: "pre-interpretation-worklist",
    riskLevel: "high",
    metric: "selective-accuracy",
    direction: "higher-is-better",
    value: 0.91,
    threshold: 0.9,
    sampleSize: 55,
    minimumSampleSize: 40,
    evidenceComplete: true,
    humanReviewComplete: false,
    material: true
  },
  {
    cellId: "denial-evidence-extraction-general-rcm-english",
    task: "denial evidence extraction",
    diseaseSubtype: "not-applicable-administrative",
    patientSubgroup: "synthetic-general",
    site: "synthetic-central-rcm",
    modality: "structured-document-metadata",
    language: "en",
    workflowState: "appeal-draft-review",
    riskLevel: "moderate",
    metric: "precision",
    direction: "higher-is-better",
    value: 0.93,
    threshold: 0.9,
    sampleSize: 100,
    minimumSampleSize: 40,
    evidenceComplete: true,
    humanReviewComplete: true,
    material: true
  }
];

export function getScrimedClinicalBenchmarkSuiteSummary() {
  const domainStressGate = evaluateWorstCellReleaseGate(scrimedClinicalDomainStressMatrix);

  return {
    service: "scrimed-clinical-benchmark-suite",
    status: scrimedClinicalBenchmarkSuiteStatus,
    apiRoute: scrimedClinicalBenchmarkSuiteApiRoute,
    briefRoute: scrimedClinicalBenchmarkSuiteBriefRoute,
    boundary: scrimedClinicalBenchmarkSuiteBoundary,
    benchmarkCount: scrimedClinicalBenchmarks.length,
    highRiskCount: scrimedClinicalBenchmarks.filter((benchmark) => benchmark.riskLevel === "high").length,
    humanReviewerRequiredCount: scrimedClinicalBenchmarks.filter((benchmark) => benchmark.humanReviewerRequired).length,
    benchmarks: scrimedClinicalBenchmarks,
    domainStressGate,
    productionReadiness: false,
    noPhiConfirmed: true
  };
}

export function buildScrimedClinicalBenchmarkSuiteBrief() {
  const summary = getScrimedClinicalBenchmarkSuiteSummary();

  return [
    "# SCRIMED Clinical Benchmark Suite",
    "",
    summary.boundary,
    "",
    "## Benchmark Domains",
    ...summary.benchmarks.map(
      (benchmark) =>
        `- ${benchmark.domain}: ${benchmark.task}; risk=${benchmark.riskLevel}; reviewer_required=${benchmark.humanReviewerRequired}`
    ),
    "",
    "## Pass Criteria",
    "- Structured schema fidelity",
    "- Source grounding and citation readiness",
    "- Completeness and verifiability",
    "- Human review for high-risk and protected workflows",
    "- No autonomous diagnosis, treatment, prescribing, payer submission, or EHR writeback",
    "",
    "## Worst-Cell Release Gate",
    `- Decision: ${summary.domainStressGate.decision}`,
    `- Basis: ${summary.domainStressGate.releaseBasis}`,
    `- Worst material cell: ${summary.domainStressGate.worstMaterialCell?.cellId ?? "none"}`,
    `- Sparse material cells: ${summary.domainStressGate.summary.sparse}`,
    "- Aggregate averages cannot override a failed, sparse, or unreviewed material cell.",
    "- Clinical authority remains disabled regardless of synthetic benchmark status."
  ].join("\n");
}
