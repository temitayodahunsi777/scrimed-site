import { createAuditHash } from "./audit";
import type { ContextSourceType, DataClassification, TrustTier } from "./types";

export type ContextRecord = {
  sourceId: string;
  sourceType: ContextSourceType;
  tenant: string;
  title: string;
  excerpt: string;
  citation: string;
  effectiveDate: string;
  expiryDate: string;
  trustTier: TrustTier;
  dataClassification: DataClassification;
  retrievalScore: number;
  semanticScore: number;
  lexicalScore: number;
  recencyScore: number;
  auditHash: string;
};

export type OntologyConcept = {
  conceptId: string;
  canonicalName: string;
  fhirMapping: string;
  description: string;
  allowedUse: string;
  prohibitedUse: string;
};

const ontologyConcepts: OntologyConcept[] = [
  { conceptId: "patient", canonicalName: "Patient", fhirMapping: "FHIR R4 Patient preview", description: "Individual receiving care.", allowedUse: "synthetic identity abstraction", prohibitedUse: "live patient identification" },
  { conceptId: "encounter", canonicalName: "Encounter", fhirMapping: "FHIR R4 Encounter preview", description: "Care interaction.", allowedUse: "workflow state preview", prohibitedUse: "EHR writeback" },
  { conceptId: "observation", canonicalName: "Observation", fhirMapping: "FHIR R4 Observation preview", description: "Clinical measurement.", allowedUse: "synthetic context retrieval", prohibitedUse: "diagnostic authority" },
  { conceptId: "condition", canonicalName: "Condition", fhirMapping: "FHIR R4 Condition preview", description: "Problem or diagnosis concept.", allowedUse: "source-attributed context", prohibitedUse: "autonomous diagnosis" },
  { conceptId: "medication", canonicalName: "Medication", fhirMapping: "FHIR R4 MedicationRequest preview", description: "Medication concept.", allowedUse: "education draft context", prohibitedUse: "prescribing or medication changes" },
  { conceptId: "procedure", canonicalName: "Procedure", fhirMapping: "FHIR R4 Procedure preview", description: "Performed or planned procedure.", allowedUse: "documentation context", prohibitedUse: "procedure recommendation authority" },
  { conceptId: "care-plan", canonicalName: "Care Plan", fhirMapping: "FHIR R4 CarePlan preview", description: "Care coordination plan.", allowedUse: "reviewable plan draft", prohibitedUse: "autonomous treatment plan" },
  { conceptId: "claim", canonicalName: "Claim", fhirMapping: "FHIR R4 Claim preview", description: "Payer claim concept.", allowedUse: "draft QA metadata", prohibitedUse: "payer submission" },
  { conceptId: "prior-authorization", canonicalName: "Prior Authorization", fhirMapping: "FHIR Task/Claim preview", description: "Coverage request workflow.", allowedUse: "draft packet preparation", prohibitedUse: "autonomous submission" },
  { conceptId: "appointment", canonicalName: "Appointment", fhirMapping: "FHIR R4 Appointment preview", description: "Scheduling concept.", allowedUse: "schedule-readiness simulation", prohibitedUse: "booking without approval" },
  { conceptId: "provider", canonicalName: "Provider", fhirMapping: "FHIR R4 Practitioner preview", description: "Care professional.", allowedUse: "synthetic reviewer routing", prohibitedUse: "real staff impersonation" },
  { conceptId: "organization", canonicalName: "Organization", fhirMapping: "FHIR R4 Organization preview", description: "Healthcare organization.", allowedUse: "tenant and facility abstraction", prohibitedUse: "cross-tenant leakage" },
  { conceptId: "consent", canonicalName: "Consent", fhirMapping: "FHIR R4 Consent preview", description: "Permission boundary.", allowedUse: "approval gate metadata", prohibitedUse: "assumed consent" },
  { conceptId: "provenance", canonicalName: "Provenance", fhirMapping: "FHIR R4 Provenance preview", description: "Source attribution.", allowedUse: "audit and citation trace", prohibitedUse: "unsupported source claims" }
];

const contextFixtures: Omit<ContextRecord, "retrievalScore" | "semanticScore" | "lexicalScore" | "recencyScore" | "auditHash">[] = [
  {
    sourceId: "ctx-care-coordination-sop",
    sourceType: "policy-document",
    tenant: "synthetic-tenant",
    title: "Care coordination review SOP",
    excerpt: "Care coordination briefs require source citations, unresolved risk flags, and human review before patient-facing use.",
    citation: "SCRIMED synthetic SOP CC-001",
    effectiveDate: "2026-01-01",
    expiryDate: "2026-12-31",
    trustTier: "reviewed-reference",
    dataClassification: "synthetic-no-phi"
  },
  {
    sourceId: "ctx-prior-auth-payer-rule",
    sourceType: "payer-rule",
    tenant: "synthetic-tenant",
    title: "Prior authorization draft documentation rule",
    excerpt: "Prior authorization packets must identify missing symptom language, functional status, visit timing, and medical necessity support before submission.",
    citation: "SCRIMED synthetic payer-rule PA-004",
    effectiveDate: "2026-02-01",
    expiryDate: "2026-12-31",
    trustTier: "synthetic-fixture",
    dataClassification: "synthetic-no-phi"
  },
  {
    sourceId: "ctx-fhir-preview",
    sourceType: "fhir-preview",
    tenant: "synthetic-tenant",
    title: "FHIR R4 preview contract",
    excerpt: "FHIR bundle previews are read-only and never write to an EHR without future connector approval.",
    citation: "SCRIMED synthetic FHIR preview FP-001",
    effectiveDate: "2026-01-01",
    expiryDate: "2027-01-01",
    trustTier: "reviewed-reference",
    dataClassification: "metadata-only"
  },
  {
    sourceId: "ctx-board-brief-template",
    sourceType: "internal-document",
    tenant: "synthetic-tenant",
    title: "Board brief evidence template",
    excerpt: "Board briefs must separate verified evidence, assumptions, unresolved risks, and next approvals.",
    citation: "SCRIMED synthetic executive template BB-002",
    effectiveDate: "2026-03-01",
    expiryDate: "2027-03-01",
    trustTier: "reviewed-reference",
    dataClassification: "metadata-only"
  }
];

function scoreLexical(query: string, record: Pick<ContextRecord, "title" | "excerpt">) {
  const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
  const haystack = `${record.title} ${record.excerpt}`.toLowerCase();
  const hits = terms.filter((term) => haystack.includes(term)).length;
  return terms.length === 0 ? 0 : Math.round((hits / terms.length) * 100);
}

function scoreTrust(tier: TrustTier) {
  if (tier === "source-of-record") return 100;
  if (tier === "reviewed-reference") return 85;
  if (tier === "synthetic-fixture") return 70;
  return 20;
}

export function getHealthcareOntologyRegistry() {
  return ontologyConcepts;
}

export function searchScrimedWorkContext(input: {
  query: string;
  tenant: string;
  sourceTypes?: ContextSourceType[];
  limit?: number;
}) {
  const limit = input.limit ?? 5;
  const records = contextFixtures
    .filter((record) => record.tenant === input.tenant || record.tenant === "synthetic-tenant")
    .filter((record) => !input.sourceTypes || input.sourceTypes.includes(record.sourceType))
    .map((record) => {
      const lexicalScore = scoreLexical(input.query, record);
      const semanticScore = Math.min(100, lexicalScore + 12);
      const recencyScore = record.expiryDate >= "2026-07-09" ? 90 : 40;
      const retrievalScore = Math.round((lexicalScore * 0.35) + (semanticScore * 0.35) + (scoreTrust(record.trustTier) * 0.2) + (recencyScore * 0.1));

      return {
        ...record,
        lexicalScore,
        semanticScore,
        recencyScore,
        retrievalScore,
        auditHash: createAuditHash({ sourceId: record.sourceId, query: input.query, retrievalScore })
      };
    })
    .sort((a, b) => b.retrievalScore - a.retrievalScore)
    .slice(0, limit);

  return {
    query: input.query,
    tenant: input.tenant,
    citationRequired: true,
    doNotAnswerWithoutEvidence: true,
    records,
    confidenceScore: records.length > 0 ? Math.round(records.reduce((sum, record) => sum + record.retrievalScore, 0) / records.length) : 0
  };
}
