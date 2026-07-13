import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";

export type OnDeviceDeidentificationDocumentType =
  | "pdf"
  | "scan"
  | "image"
  | "hl7_v2"
  | "cda"
  | "fhir"
  | "csv"
  | "ndjson"
  | "chat_log";

export type OnDeviceDeidentificationRuntimeTarget = "browser" | "mac" | "iphone";

export type OnDevicePhiCategory =
  | "patient_name"
  | "date_of_birth"
  | "mrn"
  | "phone"
  | "email"
  | "address"
  | "account_number"
  | "accession_number"
  | "device_identifier"
  | "free_text_identifier";

export type OnDeviceDeidentificationFixture = {
  fixtureId: string;
  label: string;
  documentType: OnDeviceDeidentificationDocumentType;
  runtimeTargets: OnDeviceDeidentificationRuntimeTarget[];
  syntheticOnly: true;
  livePhiProcessed: false;
  rawPayloadStored: false;
  simulatedDetectedCategories: OnDevicePhiCategory[];
  uncertainCategories: OnDevicePhiCategory[];
  structurePreserved: string[];
};

export type OnDeviceDeidentificationManifest = {
  fixtureId: string;
  status: "redaction_manifest_ready" | "manual_verification_required" | "blocked_raw_payload";
  documentType: OnDeviceDeidentificationDocumentType;
  runtimeTargets: OnDeviceDeidentificationRuntimeTarget[];
  localFirstRequired: true;
  externalInferenceAllowed: false;
  livePhiProcessed: false;
  rawPayloadStored: false;
  simulatedDetectedCategories: OnDevicePhiCategory[];
  uncertainCategories: OnDevicePhiCategory[];
  redactionActions: string[];
  structurePreserved: string[];
  humanVerificationRequired: true;
  automationEligibility: "metadata_manifest_only" | "blocked";
  auditHash: string;
  boundary: typeof onDeviceDeidentificationBoundary;
};

export const onDeviceDeidentificationStatus =
  "on-device-deidentification-ready-synthetic-only";

export const onDeviceDeidentificationBoundary =
  "On-Device De-Identification is a synthetic/no-PHI local-first privacy scaffold for browser, Mac, and iPhone-capable preprocessing. It emits metadata-only redaction manifests for PDFs, scans, images, HL7 v2, CDA, FHIR, CSV, NDJSON, and chat logs. It does not store raw payloads, process live PHI, send data to external inference, certify de-identification, or authorize production connector use.";

export const onDeviceDeidentificationFixtures: OnDeviceDeidentificationFixture[] = [
  fixture("deid-pdf-synthetic-intake", "Synthetic PDF intake packet", "pdf", ["browser", "mac"], ["patient_name", "date_of_birth", "mrn"], ["address"], ["pages", "headings", "tables", "labels"]),
  fixture("deid-scan-synthetic-referral", "Synthetic scanned referral", "scan", ["mac", "iphone"], ["patient_name", "phone"], ["free_text_identifier"], ["page image", "ocr block", "confidence"]),
  fixture("deid-image-synthetic-card", "Synthetic image attachment", "image", ["browser", "iphone"], ["device_identifier"], ["patient_name"], ["image metadata", "ocr region", "label"]),
  fixture("deid-hl7-v2-synthetic-adt", "Synthetic HL7 v2 ADT message", "hl7_v2", ["mac"], ["patient_name", "mrn", "phone"], ["account_number"], ["segments", "fields", "components"]),
  fixture("deid-cda-synthetic-summary", "Synthetic CDA continuity document", "cda", ["browser", "mac"], ["patient_name", "date_of_birth", "address"], ["free_text_identifier"], ["sections", "entries", "code systems"]),
  fixture("deid-fhir-synthetic-bundle", "Synthetic FHIR R4 bundle", "fhir", ["browser", "mac"], ["patient_name", "mrn", "email"], ["device_identifier"], ["resources", "references", "coding"]),
  fixture("deid-csv-synthetic-roster", "Synthetic CSV operations roster", "csv", ["browser", "mac"], ["patient_name", "phone", "email"], ["account_number"], ["headers", "rows", "columns"]),
  fixture("deid-ndjson-synthetic-export", "Synthetic NDJSON event export", "ndjson", ["mac"], ["mrn", "device_identifier"], ["free_text_identifier"], ["lines", "resource type", "event id"]),
  fixture("deid-chat-log-synthetic-support", "Synthetic chat log", "chat_log", ["browser", "mac", "iphone"], ["patient_name", "phone", "email"], ["free_text_identifier"], ["turns", "speaker labels", "timestamps"])
];

function fixture(
  fixtureId: string,
  label: string,
  documentType: OnDeviceDeidentificationDocumentType,
  runtimeTargets: OnDeviceDeidentificationRuntimeTarget[],
  simulatedDetectedCategories: OnDevicePhiCategory[],
  uncertainCategories: OnDevicePhiCategory[],
  structurePreserved: string[]
): OnDeviceDeidentificationFixture {
  return {
    fixtureId,
    label,
    documentType,
    runtimeTargets,
    syntheticOnly: true,
    livePhiProcessed: false,
    rawPayloadStored: false,
    simulatedDetectedCategories,
    uncertainCategories,
    structurePreserved
  };
}

function buildRedactionActions(fixture: OnDeviceDeidentificationFixture) {
  const detected = fixture.simulatedDetectedCategories.map(
    (category) => `redact simulated ${category.replaceAll("_", " ")}`
  );
  const uncertain = fixture.uncertainCategories.map(
    (category) => `queue manual verification for possible ${category.replaceAll("_", " ")}`
  );

  return [
    ...detected,
    ...uncertain,
    "preserve document structure metadata",
    "block external inference until explicit authorization exists"
  ];
}

export function buildOnDeviceDeidentificationManifest(
  fixtureInput: OnDeviceDeidentificationFixture
): OnDeviceDeidentificationManifest {
  const status = fixtureInput.rawPayloadStored
    ? "blocked_raw_payload"
    : fixtureInput.uncertainCategories.length > 0
      ? "manual_verification_required"
      : "redaction_manifest_ready";
  const redactionActions = buildRedactionActions(fixtureInput);

  return {
    fixtureId: fixtureInput.fixtureId,
    status,
    documentType: fixtureInput.documentType,
    runtimeTargets: fixtureInput.runtimeTargets,
    localFirstRequired: true,
    externalInferenceAllowed: false,
    livePhiProcessed: false,
    rawPayloadStored: false,
    simulatedDetectedCategories: fixtureInput.simulatedDetectedCategories,
    uncertainCategories: fixtureInput.uncertainCategories,
    redactionActions,
    structurePreserved: fixtureInput.structurePreserved,
    humanVerificationRequired: true,
    automationEligibility: status === "blocked_raw_payload" ? "blocked" : "metadata_manifest_only",
    auditHash: generateScrimedAuditHash({
      fixtureId: fixtureInput.fixtureId,
      documentType: fixtureInput.documentType,
      runtimeTargets: fixtureInput.runtimeTargets,
      simulatedDetectedCategories: fixtureInput.simulatedDetectedCategories,
      uncertainCategories: fixtureInput.uncertainCategories,
      status
    }),
    boundary: onDeviceDeidentificationBoundary
  };
}

export function getOnDeviceDeidentificationSummary() {
  const manifests = onDeviceDeidentificationFixtures.map((fixtureItem) =>
    buildOnDeviceDeidentificationManifest(fixtureItem)
  );
  const documentTypes = Array.from(
    new Set(onDeviceDeidentificationFixtures.map((fixtureItem) => fixtureItem.documentType))
  );
  const runtimeTargets = Array.from(
    new Set(onDeviceDeidentificationFixtures.flatMap((fixtureItem) => fixtureItem.runtimeTargets))
  );
  const requiredDocumentTypes: OnDeviceDeidentificationDocumentType[] = [
    "pdf",
    "scan",
    "image",
    "hl7_v2",
    "cda",
    "fhir",
    "csv",
    "ndjson",
    "chat_log"
  ];

  return {
    service: "on-device-deidentification",
    status: onDeviceDeidentificationStatus,
    syntheticOnly: true,
    livePhiProcessed: false,
    rawPayloadStored: false,
    externalInferenceAllowed: false,
    boundary: onDeviceDeidentificationBoundary,
    documentTypeCount: documentTypes.length,
    runtimeTargets,
    fixtures: onDeviceDeidentificationFixtures,
    manifests,
    validation: {
      status:
        requiredDocumentTypes.every((type) => documentTypes.includes(type)) &&
        ["browser", "mac", "iphone"].every((target) =>
          runtimeTargets.includes(target as OnDeviceDeidentificationRuntimeTarget)
        ) &&
        manifests.every(
          (manifest) =>
            manifest.localFirstRequired &&
            !manifest.externalInferenceAllowed &&
            !manifest.livePhiProcessed &&
            !manifest.rawPayloadStored &&
            manifest.humanVerificationRequired
        )
          ? "pass"
          : "fail",
      checks: [
        {
          check: "document-families-covered",
          passed: requiredDocumentTypes.every((type) => documentTypes.includes(type)),
          detail: "PDFs, scans, images, HL7 v2, CDA, FHIR, CSV, NDJSON, and chat logs must have synthetic manifest fixtures."
        },
        {
          check: "browser-mac-iphone-targets-covered",
          passed: ["browser", "mac", "iphone"].every((target) =>
            runtimeTargets.includes(target as OnDeviceDeidentificationRuntimeTarget)
          ),
          detail: "Local-first deployment targets must include browser, Mac, and iPhone-capable pathways."
        },
        {
          check: "raw-payload-storage-blocked",
          passed: manifests.every((manifest) => !manifest.rawPayloadStored),
          detail: "No raw document, connector, message, image, or transcript payload is stored in this scaffold."
        },
        {
          check: "external-inference-blocked",
          passed: manifests.every((manifest) => !manifest.externalInferenceAllowed),
          detail: "External inference remains blocked until explicit authorization, privacy review, and customer approval exist."
        },
        {
          check: "human-verification-required",
          passed: manifests.every((manifest) => manifest.humanVerificationRequired),
          detail: "Every redaction manifest requires human verification before use beyond synthetic demos."
        }
      ]
    }
  };
}
