import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import type { IncidentEvidenceBundle, IncidentFailureClass } from "./scrimed-work/p32Contracts";
import { scrimedP32ContractVersion } from "./scrimed-work/p32Contracts";

export const scrimedTrustIncidentForensicsVersion = "scrimed-trust-incident-forensics-v1-2026-07-20";

export const scrimedTrustIncidentForensicsBoundary =
  "SCRIMED incident forensics preserves restricted, PHI-safe evidence references for investigation. It does not determine malpractice, causation, breach notification, legal liability, or regulatory responsibility.";

export type IncidentEvidenceBundleInput = Omit<
  IncidentEvidenceBundle,
  "bundleVersion" | "bundleHash" | "liabilityDeterminationAllowed"
>;

export type IncidentTimelineEntry = {
  eventId: string;
  eventType: "tool" | "user" | "service";
  occurredAt: string;
  summary: string;
};

const forbiddenSensitiveText = [
  /\bbearer\s+[a-z0-9._~-]+/i,
  /\beyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+\b/i,
  /\b(secret|password|access[_ -]?token|service[_ -]?role[_ -]?key)\s*[:=]/i,
  /\b(mrn|medical record number|patient name|date of birth|dob|member id|subscriber id)\s*[:#=]/i,
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/
];

function isIsoTimestamp(value: string) {
  return Number.isFinite(Date.parse(value));
}

function isHash(value: string) {
  return /^[a-f0-9]{64}$/i.test(value);
}

function assertPhiSafeReferences(input: IncidentEvidenceBundleInput) {
  const serialized = JSON.stringify(input);
  if (forbiddenSensitiveText.some((pattern) => pattern.test(serialized))) {
    throw new Error("Incident evidence bundle contains prohibited sensitive text");
  }
  if (!input.tenantId || !input.incidentId || !input.correlationId) {
    throw new Error("Incident evidence bundle requires tenant, incident, and correlation identifiers");
  }
  if (!isIsoTimestamp(input.createdAt)) throw new Error("Incident evidence bundle createdAt is invalid");
  if (!isHash(input.model.configurationHash) || !isHash(input.outputGeneratedHash)) {
    throw new Error("Incident evidence outputs and model configuration must be represented by hashes");
  }
  if (input.outputDisplayedHash !== null && !isHash(input.outputDisplayedHash)) {
    throw new Error("Displayed output must be represented by a hash");
  }
  if (input.previousBundleHash !== null && !isHash(input.previousBundleHash)) {
    throw new Error("Previous incident bundle reference must be a hash");
  }
  for (const event of [...input.toolEvents, ...input.userEvents, ...input.serviceEvents]) {
    if (!isIsoTimestamp(event.occurredAt)) throw new Error(`Incident event ${event.eventId} has an invalid timestamp`);
    if (Date.parse(event.occurredAt) > Date.parse(input.createdAt)) {
      throw new Error(`Incident event ${event.eventId} occurs after the evidence bundle creation time`);
    }
  }
}

export function buildIncidentEvidenceBundle(input: IncidentEvidenceBundleInput): IncidentEvidenceBundle {
  assertPhiSafeReferences(input);
  const withoutHash = {
    ...input,
    bundleVersion: scrimedP32ContractVersion as typeof scrimedP32ContractVersion,
    liabilityDeterminationAllowed: false as const
  };

  return {
    ...withoutHash,
    bundleHash: createClinicalEvidenceHash({
      forensicsVersion: scrimedTrustIncidentForensicsVersion,
      ...withoutHash
    })
  };
}

export function verifyIncidentEvidenceBundle(bundle: IncidentEvidenceBundle) {
  const { bundleHash, ...withoutHash } = bundle;
  const expectedHash = createClinicalEvidenceHash({
    forensicsVersion: scrimedTrustIncidentForensicsVersion,
    ...withoutHash
  });
  let semanticSafetyValid = false;
  try {
    const semanticInput: Partial<typeof withoutHash> = { ...withoutHash };
    delete semanticInput.bundleVersion;
    delete semanticInput.liabilityDeterminationAllowed;
    assertPhiSafeReferences(semanticInput as IncidentEvidenceBundleInput);
    semanticSafetyValid = true;
  } catch {
    semanticSafetyValid = false;
  }
  return {
    valid:
      semanticSafetyValid &&
      bundle.bundleVersion === scrimedP32ContractVersion &&
      isHash(bundleHash) &&
      bundleHash === expectedHash,
    semanticSafetyValid,
    expectedHash,
    actualHash: bundleHash,
    legalConclusionAllowed: false as const
  };
}

export function reconstructIncidentTimeline(bundle: IncidentEvidenceBundle): IncidentTimelineEntry[] {
  return [
    ...bundle.toolEvents.map((event) => ({
      eventId: event.eventId,
      eventType: "tool" as const,
      occurredAt: event.occurredAt,
      summary: `${event.toolId}:${event.status}:${event.resultReference}`
    })),
    ...bundle.userEvents.map((event) => ({
      eventId: event.eventId,
      eventType: "user" as const,
      occurredAt: event.occurredAt,
      summary: `${event.action}:${event.approvalStatus}`
    })),
    ...bundle.serviceEvents.map((event) => ({
      eventId: event.eventId,
      eventType: "service" as const,
      occurredAt: event.occurredAt,
      summary: `${event.serviceId}:${event.status}:latency-${event.latencyMs}ms`
    }))
  ].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt) || left.eventId.localeCompare(right.eventId));
}

export function classifyIncidentEvidence(input: {
  inputValidationFailed: boolean;
  modelValidationFailed: boolean;
  retrievalFailed: boolean;
  integrationFailed: boolean;
  interfaceMismatch: boolean;
  configurationDrift: boolean;
  policyViolation: boolean;
  exceptionalCase: boolean;
}) {
  const classes: IncidentFailureClass[] = [];
  if (input.inputValidationFailed) classes.push("data-input");
  if (input.modelValidationFailed) classes.push("model");
  if (input.retrievalFailed) classes.push("retrieval");
  if (input.integrationFailed) classes.push("integration");
  if (input.interfaceMismatch) classes.push("interface");
  if (input.configurationDrift) classes.push("configuration");
  if (input.policyViolation) classes.push("policy");
  if (input.exceptionalCase) classes.push("exceptional-case");
  return {
    failureClasses: classes,
    legalLiabilityDetermined: false as const,
    requiresQualifiedInvestigation: classes.length > 0
  };
}

export function appendIncidentEvidenceBundle(
  prior: IncidentEvidenceBundle,
  next: Omit<IncidentEvidenceBundleInput, "previousBundleHash">
) {
  if (prior.tenantId !== next.tenantId || prior.incidentId !== next.incidentId) {
    throw new Error("Incident evidence hash chains cannot cross tenant or incident boundaries");
  }
  if (!verifyIncidentEvidenceBundle(prior).valid) {
    throw new Error("Prior incident evidence bundle failed integrity validation");
  }
  if (Date.parse(next.createdAt) <= Date.parse(prior.createdAt)) {
    throw new Error("Incident evidence bundles must be appended in chronological order");
  }
  return buildIncidentEvidenceBundle({ ...next, previousBundleHash: prior.bundleHash });
}
