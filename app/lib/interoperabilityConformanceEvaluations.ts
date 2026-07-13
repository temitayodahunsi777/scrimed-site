import {
  getIntegrationContractBySlug
} from "./integrationContracts";
import { getIntegrationFixtureBySlug } from "./integrationFixtures";
import { validateIntegrationFixtureBySlug } from "./integrationFixtureValidation";

export type ConformanceCheckStatus = "pass" | "block";
export type ConformanceCheckScope = "synthetic" | "live-readiness";
export type ConformanceEvaluationStatus = "synthetic-pass" | "attention-required";
export type LiveReadinessStatus = "live-blocked" | "eligible-for-partner-testing";

export type ConformanceCheck = {
  id: string;
  label: string;
  category: string;
  scope: ConformanceCheckScope;
  status: ConformanceCheckStatus;
  evidence: string;
  detail: string;
};

export type ConformanceEvidenceArtifact = {
  label: string;
  status: "available" | "required-before-live";
  route?: string;
  detail: string;
};

export type InteroperabilityConformanceEvaluation = {
  slug: string;
  name: string;
  route: string;
  apiRoute: string;
  standardIds: string[];
  contractSlug: string;
  contractRoute: string;
  fixtureRoute: string;
  agentOwner: string;
  targetProfile: string;
  status: ConformanceEvaluationStatus;
  liveReadiness: LiveReadinessStatus;
  passedChecks: number;
  blockedChecks: number;
  checks: ConformanceCheck[];
  requiredEvidence: ConformanceEvidenceArtifact[];
  liveBlockers: string[];
  sourceUrls: string[];
  boundary: string;
  validatedAt: string;
};

const validatedAt = "2026-06-09T12:00:00.000Z";

export const interoperabilityConformanceEvaluationBoundary =
  "SCRIMED conformance evaluations execute deterministic checks against synthetic fixtures and declared connector contracts. A synthetic pass is not certification, partner acceptance, production authorization, or permission to exchange live healthcare data.";

function createCheck(
  id: string,
  label: string,
  category: string,
  scope: ConformanceCheckScope,
  passed: boolean,
  evidence: string,
  detail: string
): ConformanceCheck {
  return {
    id,
    label,
    category,
    scope,
    status: passed ? "pass" : "block",
    evidence,
    detail
  };
}

function asStringArray(value: string | string[] | number | boolean | undefined) {
  return Array.isArray(value) ? value : [];
}

function buildEvaluation(
  definition: Omit<
    InteroperabilityConformanceEvaluation,
    "status" | "liveReadiness" | "passedChecks" | "blockedChecks" | "boundary" | "validatedAt"
  >
): InteroperabilityConformanceEvaluation {
  const syntheticChecks = definition.checks.filter((check) => check.scope === "synthetic");
  const liveChecks = definition.checks.filter((check) => check.scope === "live-readiness");
  const syntheticPassed = syntheticChecks.every((check) => check.status === "pass");
  const liveEligible =
    liveChecks.every((check) => check.status === "pass") &&
    definition.liveBlockers.length === 0;

  return {
    ...definition,
    status: syntheticPassed ? "synthetic-pass" : "attention-required",
    liveReadiness: liveEligible ? "eligible-for-partner-testing" : "live-blocked",
    passedChecks: definition.checks.filter((check) => check.status === "pass").length,
    blockedChecks: definition.checks.filter((check) => check.status === "block").length,
    boundary: interoperabilityConformanceEvaluationBoundary,
    validatedAt
  };
}

function buildFhirR4UsCoreEvaluation() {
  const contractSlug = "fhir-clinical-record-intake";
  const contract = getIntegrationContractBySlug(contractSlug);
  const fixture = getIntegrationFixtureBySlug(contractSlug);
  const validation = validateIntegrationFixtureBySlug(contractSlug);
  const entryTypes = asStringArray(fixture?.request.samplePayload.entryTypes);
  const requiredEntryTypes = [
    "Patient",
    "Encounter",
    "Observation",
    "Condition",
    "MedicationRequest",
    "CarePlan"
  ];

  return buildEvaluation({
    slug: "fhir-r4-us-core-intake",
    name: "FHIR R4 and US Core Intake Test Kit",
    route: "/interoperability/evaluations/fhir-r4-us-core-intake",
    apiRoute: "/api/interoperability/evaluations/fhir-r4-us-core-intake",
    standardIds: ["hl7-fhir", "smart-app-launch", "clinical-terminology"],
    contractSlug,
    contractRoute: contract?.route ?? `/contracts/${contractSlug}`,
    fixtureRoute: fixture?.route ?? `/integrations/fixtures/${contractSlug}`,
    agentOwner: "Interoperability Agent",
    targetProfile: "FHIR R4 with deployment-selected US Core 8.0.1 profiles",
    checks: [
      createCheck(
        "fixture-present",
        "Synthetic fixture present",
        "fixture",
        "synthetic",
        Boolean(fixture),
        fixture?.request.fixtureId ?? "missing fixture",
        "A deterministic FHIR intake fixture must be bound to this evaluation."
      ),
      createCheck(
        "synthetic-only",
        "Synthetic-only assertion",
        "privacy",
        "synthetic",
        fixture?.request.syntheticOnly === true,
        `syntheticOnly=${String(fixture?.request.syntheticOnly)}`,
        "The evaluation must reject production healthcare data."
      ),
      createCheck(
        "fhir-bundle",
        "FHIR Bundle structure",
        "structure",
        "synthetic",
        fixture?.request.samplePayload.resourceType === "Bundle",
        `resourceType=${String(fixture?.request.samplePayload.resourceType)}`,
        "The fixture declares a FHIR Bundle before resource-level normalization."
      ),
      createCheck(
        "required-resources",
        "Required resource coverage",
        "profile",
        "synthetic",
        requiredEntryTypes.every((entryType) => entryTypes.includes(entryType)),
        entryTypes.join(", "),
        "The synthetic bundle covers the resource classes required by the connector contract."
      ),
      createCheck(
        "contract-binding",
        "FHIR contract binding",
        "contract",
        "synthetic",
        Boolean(contract?.standardIds.includes("hl7-fhir")),
        contract?.conformanceTargets.join("; ") ?? "missing contract",
        "The connector contract declares FHIR and deployment-specific conformance targets."
      ),
      createCheck(
        "fixture-validation",
        "Deterministic fixture validation",
        "quality",
        "synthetic",
        validation?.status === "pass",
        validation ? `${validation.passed}/${validation.checks.length} checks passed` : "validation unavailable",
        "Required signals, safeguards, trace, prohibited actions, and live-review gates must pass."
      ),
      createCheck(
        "implementation-guide-selection",
        "Implementation guide selection",
        "profile",
        "live-readiness",
        false,
        "Decision required",
        "Select and version-pin deployment-specific US Core profiles and required extensions."
      ),
      createCheck(
        "capability-statement",
        "CapabilityStatement verification",
        "conformance",
        "live-readiness",
        false,
        "Partner artifact required",
        "Validate the partner server CapabilityStatement against the approved connector scope."
      ),
      createCheck(
        "identity-consent-audit",
        "Identity, consent, and durable audit",
        "governance",
        "live-readiness",
        false,
        "Production controls not approved",
        "Tenant identity, purpose-of-use, consent, and durable audit must be approved and tested."
      )
    ],
    requiredEvidence: [
      {
        label: "Synthetic FHIR fixture",
        status: "available",
        route: fixture?.route,
        detail: "Deterministic Bundle-shaped input with required resources, safeguards, and trace."
      },
      {
        label: "Integration fixture validation",
        status: "available",
        route: "/integrations/fixture-validation",
        detail: `${validation?.passed ?? 0} deterministic checks currently pass.`
      },
      {
        label: "Deployment CapabilityStatement",
        status: "required-before-live",
        detail: "Partner capability and supported interaction evidence must be retained."
      },
      {
        label: "Profile validation report",
        status: "required-before-live",
        detail: "Selected US Core profiles, extensions, terminology, and version pins must pass partner testing."
      }
    ],
    liveBlockers: [
      "Deployment-specific US Core profile selection and version pinning",
      "Partner CapabilityStatement and endpoint acceptance testing",
      "Tenant identity, SMART authorization, consent, and purpose-of-use approval",
      "Durable audit persistence and incident-response controls",
      "Security, privacy, clinical governance, and partner acceptance"
    ],
    sourceUrls: [
      "https://hl7.org/fhir/R4/conformance-module.html",
      "https://hl7.org/fhir/us/core/STU8/",
      "https://hl7.org/fhir/smart-app-launch/"
    ]
  });
}

function buildSmartAppLaunchEvaluation() {
  const contractSlug = "fhir-clinical-record-intake";
  const contract = getIntegrationContractBySlug(contractSlug);
  const fixture = getIntegrationFixtureBySlug(contractSlug);

  return buildEvaluation({
    slug: "smart-app-launch-authorization",
    name: "SMART App Launch Authorization Test Kit",
    route: "/interoperability/evaluations/smart-app-launch-authorization",
    apiRoute: "/api/interoperability/evaluations/smart-app-launch-authorization",
    standardIds: ["smart-app-launch", "hl7-fhir"],
    contractSlug,
    contractRoute: contract?.route ?? `/contracts/${contractSlug}`,
    fixtureRoute: fixture?.route ?? `/integrations/fixtures/${contractSlug}`,
    agentOwner: "Interoperability Agent",
    targetProfile: "SMART App Launch 2.2.0 with FHIR R4 launch context",
    checks: [
      createCheck(
        "smart-registry-target",
        "SMART registry target",
        "contract",
        "synthetic",
        Boolean(contract?.standardIds.includes("smart-app-launch")),
        contract?.standardIds.join(", ") ?? "missing contract",
        "The FHIR intake contract explicitly binds SMART App Launch."
      ),
      createCheck(
        "least-privilege-control",
        "Least-privilege control declared",
        "authorization",
        "synthetic",
        Boolean(
          contract?.conformanceTargets.some((target) =>
            target.toLowerCase().includes("smart scopes")
          )
        ),
        contract?.conformanceTargets.join("; ") ?? "missing contract",
        "The contract requires approved SMART scopes before applications receive FHIR access."
      ),
      createCheck(
        "synthetic-data-boundary",
        "Synthetic data boundary",
        "privacy",
        "synthetic",
        fixture?.request.syntheticOnly === true,
        `syntheticOnly=${String(fixture?.request.syntheticOnly)}`,
        "Authorization evaluation remains separated from live patient context."
      ),
      createCheck(
        "scope-matrix",
        "Approved scope matrix",
        "authorization",
        "live-readiness",
        false,
        "Tenant decision required",
        "Define user, patient, system, launch, and offline-access scopes per application and role."
      ),
      createCheck(
        "audience-validation",
        "Token audience validation",
        "security",
        "live-readiness",
        false,
        "Partner endpoint test required",
        "Validate aud, issuer, discovery metadata, signing keys, and token lifetime against the partner."
      ),
      createCheck(
        "launch-context-test",
        "Launch-context and revocation tests",
        "security",
        "live-readiness",
        false,
        "Partner acceptance required",
        "Test EHR launch, standalone launch, patient context, revocation, and session termination."
      ),
      createCheck(
        "authorization-audit",
        "Authorization audit linkage",
        "governance",
        "live-readiness",
        false,
        "Durable audit decision required",
        "Link token, tenant, role, patient context, purpose-of-use, and reviewer events without capturing secrets."
      )
    ],
    requiredEvidence: [
      {
        label: "SMART-bound integration contract",
        status: "available",
        route: contract?.route,
        detail: "FHIR intake contract declares SMART scope approval as a conformance target."
      },
      {
        label: "Application scope matrix",
        status: "required-before-live",
        detail: "Approved least-privilege scopes by application, tenant, role, and launch context."
      },
      {
        label: "Authorization server test report",
        status: "required-before-live",
        detail: "Discovery, audience, issuer, signing, token, launch, revocation, and session tests."
      }
    ],
    liveBlockers: [
      "Production identity provider and tenant-isolation decision",
      "Approved least-privilege scope matrix",
      "Patient-context authorization, consent, and purpose-of-use controls",
      "Partner authorization-server and launch-context testing",
      "Durable authorization audit and security acceptance"
    ],
    sourceUrls: ["https://hl7.org/fhir/smart-app-launch/"]
  });
}

function buildDicomwebEvaluation() {
  const contractSlug = "dicom-imaging-exchange";
  const contract = getIntegrationContractBySlug(contractSlug);
  const fixture = getIntegrationFixtureBySlug(contractSlug);
  const validation = validateIntegrationFixtureBySlug(contractSlug);
  const services = asStringArray(fixture?.request.samplePayload.services);
  const requiredServices = ["QIDO-RS", "WADO-RS", "STOW-RS"];

  return buildEvaluation({
    slug: "dicomweb-imaging-exchange",
    name: "DICOMweb Imaging Exchange Test Kit",
    route: "/interoperability/evaluations/dicomweb-imaging-exchange",
    apiRoute: "/api/interoperability/evaluations/dicomweb-imaging-exchange",
    standardIds: ["dicom-dicomweb", "ihe-profiles"],
    contractSlug,
    contractRoute: contract?.route ?? `/contracts/${contractSlug}`,
    fixtureRoute: fixture?.route ?? `/integrations/fixtures/${contractSlug}`,
    agentOwner: "Interoperability Agent",
    targetProfile: "DICOM current edition with deployment-scoped DICOMweb services",
    checks: [
      createCheck(
        "dicom-fixture-present",
        "Synthetic imaging fixture present",
        "fixture",
        "synthetic",
        Boolean(fixture),
        fixture?.request.fixtureId ?? "missing fixture",
        "A deterministic imaging metadata fixture is bound to the DICOM contract."
      ),
      createCheck(
        "dicomweb-services",
        "DICOMweb service coverage",
        "service",
        "synthetic",
        requiredServices.every((service) => services.includes(service)),
        services.join(", "),
        "Synthetic scope declares query, retrieve, and store service families."
      ),
      createCheck(
        "pixel-data-separation",
        "Metadata and pixel-data separation",
        "privacy",
        "synthetic",
        fixture?.request.samplePayload.includesPixelData === false,
        `includesPixelData=${String(fixture?.request.samplePayload.includesPixelData)}`,
        "The current fixture validates metadata workflows without production image or pixel data."
      ),
      createCheck(
        "no-diagnostic-interpretation",
        "Diagnostic interpretation prohibited",
        "clinical-safety",
        "synthetic",
        Boolean(
          fixture?.expectedResponse.prohibitedActions.includes("diagnostic interpretation")
        ),
        fixture?.expectedResponse.prohibitedActions.join(", ") ?? "missing fixture",
        "The connector may exchange approved artifacts but cannot interpret images or issue diagnosis."
      ),
      createCheck(
        "dicom-fixture-validation",
        "Deterministic fixture validation",
        "quality",
        "synthetic",
        validation?.status === "pass",
        validation ? `${validation.passed}/${validation.checks.length} checks passed` : "validation unavailable",
        "Required imaging signals, safeguards, trace, prohibited actions, and review gates must pass."
      ),
      createCheck(
        "part-2-conformance-statement",
        "DICOM Part 2 conformance statement",
        "conformance",
        "live-readiness",
        false,
        "Deployment artifact required",
        "Retain a deployment-specific conformance statement covering supported roles and services."
      ),
      createCheck(
        "transfer-syntax-deid",
        "Transfer syntax and de-identification tests",
        "security",
        "live-readiness",
        false,
        "Partner test required",
        "Validate accepted transfer syntaxes, metadata handling, de-identification, and failure behavior."
      ),
      createCheck(
        "imaging-identity-audit",
        "Identity, consent, audit, and security profile",
        "governance",
        "live-readiness",
        false,
        "Production controls not approved",
        "Approve endpoint identity, purpose-of-use, consent, audit linkage, and applicable IHE security profiles."
      )
    ],
    requiredEvidence: [
      {
        label: "Synthetic DICOMweb fixture",
        status: "available",
        route: fixture?.route,
        detail: "Metadata-only request with QIDO-RS, WADO-RS, STOW-RS, and prohibited diagnostic interpretation."
      },
      {
        label: "Integration fixture validation",
        status: "available",
        route: "/integrations/fixture-validation",
        detail: `${validation?.passed ?? 0} deterministic checks currently pass.`
      },
      {
        label: "DICOM Part 2 conformance statement",
        status: "required-before-live",
        detail: "Deployment roles, services, transfer syntaxes, security, and limitations."
      },
      {
        label: "Partner DICOMweb acceptance report",
        status: "required-before-live",
        detail: "Endpoint, service, transfer syntax, de-identification, error, and audit tests."
      }
    ],
    liveBlockers: [
      "Deployment-specific DICOM Part 2 conformance statement",
      "Partner DICOMweb endpoint and transfer syntax acceptance testing",
      "Approved de-identification and metadata-minimization profile",
      "Endpoint identity, consent, purpose-of-use, and durable audit",
      "Imaging informatics, privacy, security, and clinical governance approval"
    ],
    sourceUrls: [
      "https://www.dicomstandard.org/current",
      "https://profiles.ihe.net/"
    ]
  });
}

function buildHl7V2EventEvaluation() {
  const contractSlug = "hl7-event-feed";
  const contract = getIntegrationContractBySlug(contractSlug);
  const fixture = getIntegrationFixtureBySlug(contractSlug);
  const validation = validateIntegrationFixtureBySlug(contractSlug);
  const segmentTypes = asStringArray(fixture?.request.samplePayload.segmentTypes);
  const requiredSegments = ["MSH", "EVN", "PID", "PV1"];

  return buildEvaluation({
    slug: "hl7-v2-adt-event-feed",
    name: "HL7 v2 ADT / Order / Result Event Test Kit",
    route: "/interoperability/evaluations/hl7-v2-adt-event-feed",
    apiRoute: "/api/interoperability/evaluations/hl7-v2-adt-event-feed",
    standardIds: ["hl7-v2", "clinical-terminology"],
    contractSlug,
    contractRoute: contract?.route ?? `/contracts/${contractSlug}`,
    fixtureRoute: fixture?.route ?? `/integrations/fixtures/${contractSlug}`,
    agentOwner: "Interoperability Agent",
    targetProfile: "Deployment-selected HL7 v2 ADT, ORM, and ORU message profiles",
    checks: [
      createCheck(
        "hl7-fixture-present",
        "Synthetic HL7 event fixture present",
        "fixture",
        "synthetic",
        Boolean(fixture),
        fixture?.request.fixtureId ?? "missing fixture",
        "A deterministic event fixture must remain bound to the HL7 connector contract."
      ),
      createCheck(
        "hl7-synthetic-only",
        "Synthetic-only event assertion",
        "privacy",
        "synthetic",
        fixture?.request.syntheticOnly === true,
        `syntheticOnly=${String(fixture?.request.syntheticOnly)}`,
        "The test kit must reject production messages and patient identifiers."
      ),
      createCheck(
        "hl7-message-family",
        "ADT message family declared",
        "structure",
        "synthetic",
        typeof fixture?.request.samplePayload.messageType === "string" &&
          String(fixture.request.samplePayload.messageType).startsWith("ADT_"),
        `messageType=${String(fixture?.request.samplePayload.messageType)}`,
        "The fixture declares an administrative event without authorizing a live interface-engine channel."
      ),
      createCheck(
        "hl7-required-segments",
        "Required segment coverage",
        "profile",
        "synthetic",
        requiredSegments.every((segment) => segmentTypes.includes(segment)),
        segmentTypes.join(", "),
        "The synthetic message carries the core header, event, patient-reference, and visit segments needed for routing tests."
      ),
      createCheck(
        "hl7-replay-and-timestamp",
        "Replay and timestamp controls",
        "reliability",
        "synthetic",
        Boolean(
          fixture?.request.guardrails.some((guardrail) => /replay/i.test(guardrail)) &&
          fixture.request.guardrails.some((guardrail) => /timestamp/i.test(guardrail))
        ),
        fixture?.request.guardrails.join("; ") ?? "missing fixture",
        "Event replay and original source time must stay explicit to prevent silent workflow-state drift."
      ),
      createCheck(
        "hl7-fixture-validation",
        "Deterministic fixture validation",
        "quality",
        "synthetic",
        validation?.status === "pass",
        validation ? `${validation.passed}/${validation.checks.length} checks passed` : "validation unavailable",
        "Required signals, safeguards, traces, prohibited actions, and live-review gates must pass."
      ),
      createCheck(
        "hl7-version-profile",
        "Version and message-profile selection",
        "conformance",
        "live-readiness",
        false,
        "Trading-partner artifact required",
        "Pin the sending system version, trigger events, segment cardinality, Z-segments, vocabulary, and acknowledgement profile."
      ),
      createCheck(
        "hl7-engine-acceptance",
        "Integration-engine ACK/NACK acceptance",
        "reliability",
        "live-readiness",
        false,
        "Partner testing required",
        "Test ACK/NACK, dead-letter, retry, ordering, duplicate, timeout, and replay behavior with the approved interface engine."
      ),
      createCheck(
        "hl7-identity-consent-audit",
        "Identity, purpose, and durable audit",
        "governance",
        "live-readiness",
        false,
        "Production controls not approved",
        "Approve tenant isolation, patient-context authorization, purpose-of-use, retention, and durable event audit before live routing."
      )
    ],
    requiredEvidence: [
      {
        label: "Synthetic HL7 event fixture",
        status: "available",
        route: fixture?.route,
        detail: "Deterministic ADT event metadata with required segments, replay controls, and no-writeback boundaries."
      },
      {
        label: "Integration fixture validation",
        status: "available",
        route: "/integrations/fixture-validation",
        detail: `${validation?.passed ?? 0} deterministic checks currently pass.`
      },
      {
        label: "Deployment message profile",
        status: "required-before-live",
        detail: "Version-pinned events, segments, Z-segments, code sets, acknowledgements, and error behavior."
      },
      {
        label: "Interface-engine acceptance report",
        status: "required-before-live",
        detail: "ACK/NACK, retry, duplicate, order, dead-letter, replay, security, and monitoring evidence."
      }
    ],
    liveBlockers: [
      "Deployment-specific HL7 v2 version and message-profile selection",
      "Approved interface-engine channel, network route, and endpoint identity",
      "ACK/NACK, retry, duplicate, ordering, dead-letter, and replay acceptance testing",
      "Patient-context authorization, purpose-of-use, retention, and durable audit",
      "Integration architecture, privacy, security, workflow-owner, and clinical governance approval"
    ],
    sourceUrls: [
      "https://www.hl7.org/implement/standards/product_section.cfm?section=13",
      "https://profiles.ihe.net/"
    ]
  });
}

function buildX12PayerEvaluation() {
  const contractSlug = "claims-utilization-dataset";
  const contract = getIntegrationContractBySlug(contractSlug);
  const fixture = getIntegrationFixtureBySlug(contractSlug);
  const validation = validateIntegrationFixtureBySlug(contractSlug);
  const lineCount = Number(fixture?.request.samplePayload.lineCount ?? 0);

  return buildEvaluation({
    slug: "x12-payer-rcm-evidence",
    name: "X12 Payer / RCM Evidence Test Kit",
    route: "/interoperability/evaluations/x12-payer-rcm-evidence",
    apiRoute: "/api/interoperability/evaluations/x12-payer-rcm-evidence",
    standardIds: ["x12", "clinical-terminology"],
    contractSlug,
    contractRoute: contract?.route ?? `/contracts/${contractSlug}`,
    fixtureRoute: fixture?.route ?? `/integrations/fixtures/${contractSlug}`,
    agentOwner: "Revenue Cycle Agent",
    targetProfile: "Trading-partner-selected X12 eligibility, authorization, claim, remittance, and acknowledgement guides",
    checks: [
      createCheck(
        "x12-fixture-present",
        "Synthetic payer fixture present",
        "fixture",
        "synthetic",
        Boolean(fixture),
        fixture?.request.fixtureId ?? "missing fixture",
        "A deterministic payer-data fixture must remain bound to the claims and utilization contract."
      ),
      createCheck(
        "x12-synthetic-only",
        "Synthetic-only payer assertion",
        "privacy",
        "synthetic",
        fixture?.request.syntheticOnly === true,
        `syntheticOnly=${String(fixture?.request.syntheticOnly)}`,
        "The test kit cannot accept live member, subscriber, policy, claim, or payer credentials."
      ),
      createCheck(
        "x12-structured-lines",
        "Structured line metadata",
        "structure",
        "synthetic",
        Number.isFinite(lineCount) && lineCount > 0,
        `lineCount=${lineCount}`,
        "Synthetic line-level metadata supports deterministic completeness and denial-risk checks."
      ),
      createCheck(
        "x12-lineage-and-partition",
        "Lineage and access partitioning",
        "governance",
        "synthetic",
        Boolean(
          fixture?.request.guardrails.some((guardrail) => /lineage/i.test(guardrail)) &&
          fixture.request.guardrails.some((guardrail) => /partition/i.test(guardrail))
        ),
        fixture?.request.guardrails.join("; ") ?? "missing fixture",
        "Payer evidence must preserve source lineage and role-scoped access."
      ),
      createCheck(
        "x12-no-final-reimbursement",
        "Final reimbursement prohibited",
        "financial-safety",
        "synthetic",
        Boolean(
          fixture?.expectedResponse.prohibitedActions.some((action) =>
            /final reimbursement/i.test(action)
          )
        ),
        fixture?.expectedResponse.prohibitedActions.join("; ") ?? "missing fixture",
        "SCRIMED may prepare or validate evidence but cannot determine reimbursement or submit a transaction."
      ),
      createCheck(
        "x12-fixture-validation",
        "Deterministic fixture validation",
        "quality",
        "synthetic",
        validation?.status === "pass",
        validation ? `${validation.passed}/${validation.checks.length} checks passed` : "validation unavailable",
        "Required claims signals, safeguards, lineage, trace, and prohibited actions must pass."
      ),
      createCheck(
        "x12-version-guide",
        "Transaction version and guide selection",
        "conformance",
        "live-readiness",
        false,
        "Licensed guide and partner decision required",
        "Select transaction sets, implementation guides, companion guides, code sets, and version pins with the trading partner."
      ),
      createCheck(
        "x12-partner-acknowledgement",
        "Trading-partner acknowledgement testing",
        "reliability",
        "live-readiness",
        false,
        "Clearinghouse or payer acceptance required",
        "Test envelope validation, acknowledgements, rejection paths, duplicates, retries, balancing, and reconciliation."
      ),
      createCheck(
        "x12-human-submission-gate",
        "Human submission authority",
        "governance",
        "live-readiness",
        false,
        "Payer submission remains disabled",
        "A named authorized operator, approved workflow, contract, audit trail, and explicit release gate are required before any payer-facing action."
      )
    ],
    requiredEvidence: [
      {
        label: "Synthetic payer and claims fixture",
        status: "available",
        route: fixture?.route,
        detail: "Line-level metadata, lineage, denial signal, and no-final-reimbursement boundary."
      },
      {
        label: "Integration fixture validation",
        status: "available",
        route: "/integrations/fixture-validation",
        detail: `${validation?.passed ?? 0} deterministic checks currently pass.`
      },
      {
        label: "Trading-partner implementation profile",
        status: "required-before-live",
        detail: "Licensed implementation guide, companion guide, transaction scope, version, code sets, and endpoint rules."
      },
      {
        label: "Payer or clearinghouse acceptance report",
        status: "required-before-live",
        detail: "Envelope, acknowledgement, rejection, duplicate, retry, balancing, security, and reconciliation evidence."
      }
    ],
    liveBlockers: [
      "Trading-partner agreement and licensed implementation or companion guides",
      "Transaction set, version, endpoint, code-set, and acknowledgement selection",
      "Payer or clearinghouse conformance, rejection, duplicate, retry, and reconciliation testing",
      "Authorized operator, least-privilege identity, audit, retention, and release workflow",
      "Revenue-cycle, compliance, privacy, security, legal, and payer-owner approval",
      "Payer submission remains disabled until separately authorized"
    ],
    sourceUrls: [
      "https://x12.org/products/health-care",
      "https://x12.org/resources"
    ]
  });
}

export function getInteroperabilityConformanceEvaluations() {
  return [
    buildFhirR4UsCoreEvaluation(),
    buildSmartAppLaunchEvaluation(),
    buildDicomwebEvaluation(),
    buildHl7V2EventEvaluation(),
    buildX12PayerEvaluation()
  ];
}

export function getInteroperabilityConformanceEvaluationBySlug(slug: string) {
  return getInteroperabilityConformanceEvaluations().find(
    (evaluation) => evaluation.slug === slug
  );
}

export function getInteroperabilityConformanceEvaluationSummary() {
  const evaluations = getInteroperabilityConformanceEvaluations();
  const syntheticPassed = evaluations.filter(
    (evaluation) => evaluation.status === "synthetic-pass"
  ).length;
  const liveBlocked = evaluations.filter(
    (evaluation) => evaluation.liveReadiness === "live-blocked"
  ).length;

  return {
    service: "scrimed-interoperability-conformance-evaluations",
    status:
      syntheticPassed === evaluations.length
        ? "synthetic-conformance-evaluations-ready"
        : "attention-required",
    boundary: interoperabilityConformanceEvaluationBoundary,
    evaluationCount: evaluations.length,
    syntheticPassed,
    attentionRequired: evaluations.length - syntheticPassed,
    liveBlocked,
    passedChecks: evaluations.reduce(
      (total, evaluation) => total + evaluation.passedChecks,
      0
    ),
    blockedChecks: evaluations.reduce(
      (total, evaluation) => total + evaluation.blockedChecks,
      0
    ),
    evaluations,
    updated: "2026-07-10"
  };
}
