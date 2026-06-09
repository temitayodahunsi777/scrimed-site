export type InteroperabilityStandardKind =
  | "exchange"
  | "profile"
  | "administrative"
  | "imaging"
  | "pharmacy"
  | "device"
  | "terminology";

export type InteroperabilityStandardStatus =
  | "registry-defined"
  | "profile-selection-required"
  | "license-review-required";

export type InteroperabilityStandard = {
  slug: string;
  acronym: string;
  name: string;
  steward: string;
  kind: InteroperabilityStandardKind;
  status: InteroperabilityStandardStatus;
  implementationTarget: string;
  versionsAndProfiles: string[];
  capabilities: string[];
  conformanceEvidence: string[];
  requiredControls: string[];
  sourceUrls: string[];
};

export type InteroperabilityConformanceControl = {
  id: string;
  status: "active" | "required-before-live";
  control: string;
  evidence: string;
  liveBoundary: string;
};

export type InteroperabilityTerminologyResolution = {
  requestedTerm: string;
  status: "unresolved";
  resolution: string;
  likelyIntendedStandards: string[];
};

export const interoperabilityBoundary =
  "SCRIMED defines and validates standards-aware synthetic connector contracts. No registry entry authorizes live data exchange, autonomous clinical action, diagnosis, payer submission, or production record mutation.";

export const interoperabilityStandards: InteroperabilityStandard[] = [
  {
    slug: "hl7-fhir",
    acronym: "FHIR",
    name: "HL7 Fast Healthcare Interoperability Resources",
    steward: "HL7 International",
    kind: "exchange",
    status: "profile-selection-required",
    implementationTarget:
      "Use deployment-approved FHIR R4 or R4B profiles for current enterprise integrations; monitor R5 and require explicit version negotiation.",
    versionsAndProfiles: ["FHIR R4", "FHIR R4B", "FHIR R5 monitored", "US Core", "USCDI-aligned data classes"],
    capabilities: ["clinical resource exchange", "REST APIs", "bundles", "subscriptions", "document references"],
    conformanceEvidence: ["CapabilityStatement", "StructureDefinition profiles", "ImplementationGuide", "synthetic validation fixtures"],
    requiredControls: ["minimum necessary scope", "resource provenance", "version negotiation", "terminology validation", "no silent mutation"],
    sourceUrls: ["https://hl7.org/fhir/", "https://hl7.org/fhir/us/core/"]
  },
  {
    slug: "smart-app-launch",
    acronym: "SMART",
    name: "SMART App Launch",
    steward: "HL7 International",
    kind: "profile",
    status: "profile-selection-required",
    implementationTarget:
      "Use SMART App Launch profiles for approved user-facing FHIR applications with least-privilege scopes and tenant-aware authorization.",
    versionsAndProfiles: ["SMART App Launch 2.2", "FHIR R4-based launch context"],
    capabilities: ["OAuth 2.0 authorization", "OIDC identity context", "scoped FHIR access", "EHR launch"],
    conformanceEvidence: ["approved scopes", "launch-context tests", "token audience validation", "revocation tests"],
    requiredControls: ["least privilege", "tenant isolation", "patient-context authorization", "token audience checks", "audit linkage"],
    sourceUrls: ["https://hl7.org/fhir/smart-app-launch/"]
  },
  {
    slug: "hl7-v2",
    acronym: "HL7 v2",
    name: "HL7 Version 2 Messaging",
    steward: "HL7 International",
    kind: "exchange",
    status: "profile-selection-required",
    implementationTarget:
      "Negotiate message versions, local profiles, segment requirements, acknowledgements, and replay behavior per source system.",
    versionsAndProfiles: ["ADT", "ORM/OML", "ORU", "SIU", "deployment-specific HL7 v2 versions"],
    capabilities: ["admission and transfer events", "orders", "results", "scheduling events", "interface-engine feeds"],
    conformanceEvidence: ["message profile", "sample messages", "ACK/NACK behavior", "dead-letter and replay tests"],
    requiredControls: ["message validation", "timestamp preservation", "dead-letter handling", "source-system traceability", "human workflow review"],
    sourceUrls: ["https://www.hl7.org/implement/standards/product_brief.cfm?product_id=185"]
  },
  {
    slug: "dicom-dicomweb",
    acronym: "DICOM",
    name: "Digital Imaging and Communications in Medicine",
    steward: "DICOM Standards Committee",
    kind: "imaging",
    status: "profile-selection-required",
    implementationTarget:
      "Use approved DICOM and DICOMweb services for imaging exchange, with a deployment-specific conformance statement and no diagnostic interpretation by the connector.",
    versionsAndProfiles: ["DICOM current edition", "DICOMweb QIDO-RS", "WADO-RS", "STOW-RS"],
    capabilities: ["study and series discovery", "image object retrieval", "image object storage", "imaging metadata exchange"],
    conformanceEvidence: ["DICOM Part 2 conformance statement", "transfer syntax tests", "DICOMweb service tests", "de-identification validation"],
    requiredControls: ["pixel-data separation", "metadata minimization", "transfer syntax validation", "de-identification profile", "no autonomous interpretation"],
    sourceUrls: ["https://www.dicomstandard.org/current"]
  },
  {
    slug: "x12",
    acronym: "X12",
    name: "X12 Insurance and Administrative Transactions",
    steward: "X12",
    kind: "administrative",
    status: "license-review-required",
    implementationTarget:
      "Select payer-approved transaction versions and implementation guides before eligibility, claim, remittance, status, or authorization exchange.",
    versionsAndProfiles: ["270/271 eligibility", "276/277 claim status", "278 services review", "837 claims", "835 remittance"],
    capabilities: ["eligibility", "claim status", "prior authorization transactions", "claims", "remittance advice"],
    conformanceEvidence: ["licensed implementation guide", "trading-partner agreement", "synthetic transaction tests", "acknowledgement validation"],
    requiredControls: ["payer-specific validation", "trading-partner approval", "financial audit trace", "no final reimbursement decision", "human exception review"],
    sourceUrls: ["https://x12.org/"]
  },
  {
    slug: "c-cda",
    acronym: "C-CDA",
    name: "Consolidated Clinical Document Architecture",
    steward: "HL7 International",
    kind: "exchange",
    status: "profile-selection-required",
    implementationTarget:
      "Use deployment-approved C-CDA document templates when clinical document exchange is required alongside resource-level FHIR exchange.",
    versionsAndProfiles: ["C-CDA document templates", "deployment-approved implementation guide"],
    capabilities: ["clinical summaries", "transitions of care", "structured clinical documents", "document provenance"],
    conformanceEvidence: ["template validation", "document parser tests", "source document retention", "terminology validation"],
    requiredControls: ["document provenance", "template validation", "minimum necessary sections", "human review", "no silent record mutation"],
    sourceUrls: ["https://www.hl7.org/implement/standards/product_brief.cfm?product_id=492"]
  },
  {
    slug: "ihe-profiles",
    acronym: "IHE",
    name: "Integrating the Healthcare Enterprise Profiles",
    steward: "IHE International",
    kind: "profile",
    status: "profile-selection-required",
    implementationTarget:
      "Select deployment-specific IHE profiles to constrain standards into testable cross-enterprise workflows.",
    versionsAndProfiles: ["XDS.b", "MHD", "PIX/PDQ", "ATNA", "deployment-selected profiles"],
    capabilities: ["cross-enterprise document sharing", "mobile health documents", "patient identity query", "audit and node authentication"],
    conformanceEvidence: ["selected integration profile", "actor and transaction map", "Connectathon-style tests", "security profile validation"],
    requiredControls: ["identity reconciliation", "consent policy", "audit trace", "profile-level conformance", "regional exchange governance"],
    sourceUrls: ["https://profiles.ihe.net/"]
  },
  {
    slug: "ncpdp-script",
    acronym: "NCPDP SCRIPT",
    name: "NCPDP SCRIPT Standard",
    steward: "National Council for Prescription Drug Programs",
    kind: "pharmacy",
    status: "license-review-required",
    implementationTarget:
      "Select the approved SCRIPT version and transaction scope before any pharmacy or electronic-prescribing integration.",
    versionsAndProfiles: ["deployment-approved SCRIPT version", "transaction-specific profiles"],
    capabilities: ["electronic prescribing", "medication history", "renewal requests", "pharmacy messaging"],
    conformanceEvidence: ["licensed standard", "transaction tests", "trading-partner approval", "pharmacy workflow review"],
    requiredControls: ["prescriber authorization", "medication safety review", "identity validation", "audit trace", "no autonomous prescribing"],
    sourceUrls: ["https://standards.ncpdp.org/Access-to-Standards.aspx"]
  },
  {
    slug: "iso-ieee-11073",
    acronym: "ISO/IEEE 11073",
    name: "Health Informatics Device Interoperability",
    steward: "ISO and IEEE",
    kind: "device",
    status: "profile-selection-required",
    implementationTarget:
      "Select device classes, transport profiles, and validation procedures before ingesting wearable or medical-device observations.",
    versionsAndProfiles: ["deployment-selected device specializations", "personal health device profiles"],
    capabilities: ["medical device observations", "wearable measurements", "device identity", "measurement metadata"],
    conformanceEvidence: ["device profile", "measurement validation", "clock synchronization tests", "source-device trace"],
    requiredControls: ["device identity", "measurement units", "clock integrity", "signal quality", "human review before clinical use"],
    sourceUrls: ["https://standards.ieee.org/ieee/11073-10101/10341/"]
  },
  {
    slug: "clinical-terminology",
    acronym: "Terminology",
    name: "Clinical Terminology Governance",
    steward: "SNOMED International, Regenstrief Institute, and U.S. National Library of Medicine",
    kind: "terminology",
    status: "license-review-required",
    implementationTarget:
      "Govern code systems, value sets, mappings, licenses, versions, and validation timestamps independently from transport standards.",
    versionsAndProfiles: ["SNOMED CT", "LOINC", "RxNorm", "deployment-approved value sets"],
    capabilities: ["clinical concept coding", "laboratory and observation coding", "medication normalization", "value-set validation"],
    conformanceEvidence: ["terminology version inventory", "value-set expansion", "mapping review", "validation timestamp"],
    requiredControls: ["license review", "version pinning", "mapping provenance", "semantic drift monitoring", "human terminology review"],
    sourceUrls: [
      "https://docs.snomed.org/snomed-ct-specifications/snomed-ct-release-file-specification",
      "https://loinc.org/about/",
      "https://www.nlm.nih.gov/research/umls/rxnorm/index.html"
    ]
  }
];

export const interoperabilityConformanceControls: InteroperabilityConformanceControl[] = [
  {
    id: "standards-registry",
    status: "active",
    control: "Standards and profile registry",
    evidence: "Typed registry exposes steward, implementation target, profiles, capabilities, evidence, controls, and primary-source references.",
    liveBoundary: "Registry definition is planning evidence only; it does not prove a connector is conformant."
  },
  {
    id: "contract-binding",
    status: "active",
    control: "Contract-to-standard binding",
    evidence: "Every external connector contract declares standards and deployment-specific conformance targets.",
    liveBoundary: "A bound contract must still pass implementation, security, privacy, and trading-partner review."
  },
  {
    id: "synthetic-fixture-validation",
    status: "active",
    control: "Synthetic conformance fixtures",
    evidence: "Non-synthetic contracts require deterministic synthetic request, expected response, safeguard mapping, and diff fingerprints.",
    liveBoundary: "Synthetic fixtures cannot substitute for production conformance, certification, or partner acceptance testing."
  },
  {
    id: "identity-consent-audit",
    status: "required-before-live",
    control: "Identity, consent, and audit linkage",
    evidence: "Tenant identity, patient-context authorization, consent, purpose-of-use, and durable audit decisions remain explicit readiness gates.",
    liveBoundary: "Live exchange stays denied until these controls are approved and tested."
  },
  {
    id: "implementation-certification",
    status: "required-before-live",
    control: "Implementation testing and certification",
    evidence: "Each deployment needs selected versions, profiles, conformance artifacts, partner tests, and owner approval.",
    liveBoundary: "No standard is marketed as implemented merely because it appears in the registry."
  }
];

export const interoperabilityTerminologyResolutions: InteroperabilityTerminologyResolution[] = [
  {
    requestedTerm: "XICOM",
    status: "unresolved",
    resolution:
      "No recognized healthcare interoperability standard by this name is represented. SCRIMED will not claim support until the intended standard is confirmed.",
    likelyIntendedStandards: ["X12 for payer transactions", "DICOM/DICOMweb for imaging", "IHE XDS.b or MHD for document exchange"]
  }
];

export function getInteroperabilityStandardBySlug(slug: string) {
  return interoperabilityStandards.find((standard) => standard.slug === slug);
}

export function getInteroperabilitySummary() {
  const requiredBeforeLive = interoperabilityConformanceControls.filter(
    (control) => control.status === "required-before-live"
  ).length;

  return {
    service: "scrimed-interoperability-control-plane",
    status: "standards-control-plane-defined",
    boundary: interoperabilityBoundary,
    standardCount: interoperabilityStandards.length,
    activeControls: interoperabilityConformanceControls.length - requiredBeforeLive,
    requiredBeforeLive,
    unresolvedTerms: interoperabilityTerminologyResolutions.length,
    standards: interoperabilityStandards,
    conformanceControls: interoperabilityConformanceControls,
    terminologyResolutions: interoperabilityTerminologyResolutions,
    updated: "2026-06-09"
  };
}
