import {
  getContractSlug,
  integrationContracts
} from "./integrationContracts";

export type IntegrationFixtureRequest = {
  fixtureId: string;
  syntheticOnly: true;
  contractSlug: string;
  sourceSystem: string;
  schemaVersion: string;
  requestSignals: Record<string, string>;
  samplePayload: Record<string, string | string[] | number | boolean>;
  guardrails: string[];
};

export type IntegrationFixtureExpectedResponse = {
  normalizedSignals: string[];
  requiredTrace: string[];
  rejectedIfMissing: string[];
  reviewBeforeLive: string;
  prohibitedActions: string[];
};

export type IntegrationFixture = {
  contractSlug: string;
  contractRoute: string;
  route: string;
  request: IntegrationFixtureRequest;
  expectedResponse: IntegrationFixtureExpectedResponse;
};

export const integrationFixtures: IntegrationFixture[] = [
  {
    contractSlug: "fhir-clinical-record-intake",
    contractRoute: "/contracts/fhir-clinical-record-intake",
    route: "/integrations/fixtures/fhir-clinical-record-intake",
    request: {
      fixtureId: "fixture-fhir-clinical-record-intake-v1",
      syntheticOnly: true,
      contractSlug: "fhir-clinical-record-intake",
      sourceSystem: "synthetic-fhir-server",
      schemaVersion: "fhir-r4-synthetic-v1",
      requestSignals: {
        patient: "Synthetic Patient resource with demographic band only.",
        encounter: "Synthetic Encounter resource with class, period, and care setting.",
        observation: "Synthetic Observation resources for vitals and lab-like signals.",
        condition: "Synthetic Condition resources with coded problem context.",
        medication: "Synthetic MedicationRequest resources with active/reconciled status.",
        carePlan: "Synthetic CarePlan resource with reviewable care coordination goals."
      },
      samplePayload: {
        resourceType: "Bundle",
        type: "collection",
        syntheticOnly: true,
        entryTypes: ["Patient", "Encounter", "Observation", "Condition", "MedicationRequest", "CarePlan"]
      },
      guardrails: [
        "minimum necessary fields only",
        "audit trail",
        "retain source resource trace",
        "source system traceability",
        "reject production identifiers",
        "no silent mutation",
        "human review before live connector promotion"
      ]
    },
    expectedResponse: {
      normalizedSignals: ["patient", "encounter", "observation", "condition", "medication", "carePlan"],
      requiredTrace: [
        "fixture_received",
        "resource_types_validated",
        "signals_normalized",
        "source_trace_attached",
        "connector_review_required"
      ],
      rejectedIfMissing: ["patient", "encounter", "source resource trace"],
      reviewBeforeLive: "integration architect and clinical governance review before live FHIR connection",
      prohibitedActions: ["production data ingestion", "silent mutation", "clinical action without review"]
    }
  },
  {
    contractSlug: "hl7-event-feed",
    contractRoute: "/contracts/hl7-event-feed",
    route: "/integrations/fixtures/hl7-event-feed",
    request: {
      fixtureId: "fixture-hl7-event-feed-v1",
      syntheticOnly: true,
      contractSlug: "hl7-event-feed",
      sourceSystem: "synthetic-hl7-feed",
      schemaVersion: "hl7-v2-event-synthetic-v1",
      requestSignals: {
        eventType: "Synthetic ADT, ORM, or ORU event category.",
        patientReference: "Synthetic patient pointer without production identifiers.",
        timestamp: "Original event timestamp preserved as the orchestration clock.",
        facility: "Synthetic facility code and care setting.",
        orderingContext: "Synthetic order/result metadata for workflow routing."
      },
      samplePayload: {
        messageType: "ADT_A08",
        syntheticOnly: true,
        facility: "SCRIMED-SYNTH-FACILITY",
        segmentTypes: ["MSH", "EVN", "PID", "PV1", "ORC"]
      },
      guardrails: [
        "message validation required",
        "dead-letter handling",
        "dead-letter invalid messages",
        "preserve original timestamp",
        "timestamp preservation",
        "support replay policy",
        "event replay policy",
        "no autonomous clinical workflow trigger until reviewed"
      ]
    },
    expectedResponse: {
      normalizedSignals: ["eventType", "patientReference", "timestamp", "facility", "orderingContext"],
      requiredTrace: [
        "message_received",
        "segments_validated",
        "event_normalized",
        "dead_letter_policy_checked",
        "workflow_review_required"
      ],
      rejectedIfMissing: ["eventType", "patientReference", "timestamp"],
      reviewBeforeLive: "interface engine and workflow owner review before live HL7 event routing",
      prohibitedActions: ["silent event drop", "timestamp overwrite", "unreviewed clinical trigger"]
    }
  },
  {
    contractSlug: "dicom-imaging-exchange",
    contractRoute: "/contracts/dicom-imaging-exchange",
    route: "/integrations/fixtures/dicom-imaging-exchange",
    request: {
      fixtureId: "fixture-dicom-imaging-exchange-v1",
      syntheticOnly: true,
      contractSlug: "dicom-imaging-exchange",
      sourceSystem: "synthetic-dicomweb-endpoint",
      schemaVersion: "dicomweb-imaging-synthetic-v1",
      requestSignals: {
        study: "Synthetic study identifier and study-level metadata.",
        series: "Synthetic series identifier and series-level metadata.",
        instance: "Synthetic SOP instance identifier without production image data.",
        patientReference: "Synthetic patient pointer without production identifiers.",
        modality: "Synthetic imaging modality code.",
        accession: "Synthetic accession reference.",
        acquisitionTimestamp: "Synthetic acquisition timestamp preserved from the source fixture.",
        sourceEndpoint: "Synthetic DICOMweb endpoint identifier."
      },
      samplePayload: {
        exchangeType: "DICOMweb-metadata",
        syntheticOnly: true,
        services: ["QIDO-RS", "WADO-RS", "STOW-RS"],
        modality: "SYN-CT",
        includesPixelData: false
      },
      guardrails: [
        "DICOM conformance statement required",
        "de-identification profile required",
        "transfer syntax validation required",
        "metadata and pixel separation required",
        "no diagnostic interpretation",
        "human review",
        "reject production identifiers",
        "no live image exchange before approved conformance testing"
      ]
    },
    expectedResponse: {
      normalizedSignals: ["study", "series", "instance", "patientReference", "modality", "accession", "acquisitionTimestamp", "sourceEndpoint"],
      requiredTrace: [
        "imaging_request_received",
        "dicom_metadata_validated",
        "transfer_syntax_policy_checked",
        "de_identification_policy_checked",
        "imaging_review_required"
      ],
      rejectedIfMissing: ["study", "series", "instance", "sourceEndpoint"],
      reviewBeforeLive: "imaging informatics, privacy, and clinical governance review before live DICOM or DICOMweb exchange",
      prohibitedActions: ["diagnostic interpretation", "production image exchange", "unreviewed record mutation"]
    }
  },
  {
    contractSlug: "claims-utilization-dataset",
    contractRoute: "/contracts/claims-utilization-dataset",
    route: "/integrations/fixtures/claims-utilization-dataset",
    request: {
      fixtureId: "fixture-claims-utilization-dataset-v1",
      syntheticOnly: true,
      contractSlug: "claims-utilization-dataset",
      sourceSystem: "synthetic-claims-warehouse",
      schemaVersion: "claims-utilization-synthetic-v1",
      requestSignals: {
        member: "Synthetic member key and eligibility band.",
        claim: "Synthetic claim header and line metadata.",
        diagnosis: "Synthetic diagnosis grouping for analytics only.",
        procedure: "Synthetic procedure grouping for utilization review.",
        payer: "Synthetic payer and plan category.",
        allowedAmount: "Synthetic allowed amount value for cost modeling."
      },
      samplePayload: {
        datasetType: "claims-utilization",
        syntheticOnly: true,
        lineCount: 3,
        currency: "USD",
        includesDeniedLine: true
      },
      guardrails: [
        "de-identification option required",
        "lineage metadata required",
        "schema versioning required",
        "partition access by role",
        "access partitioning",
        "no final reimbursement determination"
      ]
    },
    expectedResponse: {
      normalizedSignals: ["member", "claim", "diagnosis", "procedure", "payer", "allowedAmount"],
      requiredTrace: [
        "dataset_received",
        "schema_version_validated",
        "lineage_attached",
        "signals_normalized",
        "analytics_review_required"
      ],
      rejectedIfMissing: ["member", "claim", "payer", "allowedAmount"],
      reviewBeforeLive: "data governance and revenue operations review before live claims analytics",
      prohibitedActions: ["final reimbursement decision", "unpartitioned access", "unversioned schema change"]
    }
  },
  {
    contractSlug: "pricing-transparency-dataset",
    contractRoute: "/contracts/pricing-transparency-dataset",
    route: "/integrations/fixtures/pricing-transparency-dataset",
    request: {
      fixtureId: "fixture-pricing-transparency-dataset-v1",
      syntheticOnly: true,
      contractSlug: "pricing-transparency-dataset",
      sourceSystem: "synthetic-pricing-feed",
      schemaVersion: "pricing-transparency-synthetic-v1",
      requestSignals: {
        payer: "Synthetic payer or plan category.",
        facility: "Synthetic site of care.",
        serviceCode: "Synthetic service, CPT, DRG, or internal service code.",
        cashPrice: "Synthetic cash-price amount for transparency modeling.",
        negotiatedRate: "Synthetic negotiated-rate amount by payer category.",
        effectiveDate: "Effective date used for staleness and rate-version review."
      },
      samplePayload: {
        datasetType: "pricing-transparency",
        syntheticOnly: true,
        serviceCode: "SYN-CPT-0001",
        cashPrice: 425,
        negotiatedRate: 315
      },
      guardrails: [
        "retain source URL or source file reference",
        "source URL retention",
        "track effective date",
        "effective-date tracking",
        "normalize rates before comparison",
        "rate normalization",
        "detect stale pricing records",
        "staleness detection",
        "no patient-specific estimate without review"
      ]
    },
    expectedResponse: {
      normalizedSignals: ["payer", "facility", "serviceCode", "cashPrice", "negotiatedRate", "effectiveDate"],
      requiredTrace: [
        "pricing_record_received",
        "effective_date_checked",
        "rate_normalized",
        "source_reference_attached",
        "staleness_review_required"
      ],
      rejectedIfMissing: ["payer", "facility", "serviceCode", "effectiveDate"],
      reviewBeforeLive: "pricing, compliance, and data governance review before live transparency analytics",
      prohibitedActions: ["patient-specific estimate guarantee", "stale rate publication", "source reference removal"]
    }
  }
];

export function getIntegrationFixtureBySlug(slug: string) {
  return integrationFixtures.find((fixture) => fixture.contractSlug === slug);
}

export function getIntegrationFixtureSummary() {
  const nonSyntheticContracts = integrationContracts.filter(
    (contract) => contract.sourceType !== "synthetic"
  );
  const coveredContracts = nonSyntheticContracts.filter((contract) =>
    getIntegrationFixtureBySlug(getContractSlug(contract))
  );

  return {
    service: "scrimed-integration-fixtures",
    status:
      coveredContracts.length === nonSyntheticContracts.length
        ? "fixture-contracts-ready"
        : "fixture-coverage-gap",
    fixtureCount: integrationFixtures.length,
    nonSyntheticContractCount: nonSyntheticContracts.length,
    coveredContractCount: coveredContracts.length,
    fixtures: integrationFixtures,
    updated: "2026-06-09"
  };
}
