import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

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

export function getScrimedClinicalBenchmarkSuiteSummary() {
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
    "- No autonomous diagnosis, treatment, prescribing, payer submission, or EHR writeback"
  ].join("\n");
}
