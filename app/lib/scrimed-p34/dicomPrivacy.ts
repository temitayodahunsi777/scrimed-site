import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type {
  DicomDeidentificationProfile,
  DicomMetadataElement,
  DicomPrivacyManifest,
  SyntheticDicomObject
} from "./types";

export const p34DicomPrivacyVersion =
  "scrimed-p34-dicom-privacy-v1-2026-08-15";

export const p34DicomPrivacyBoundary =
  "SCRIMED p.34 DICOM Privacy operates on synthetic metadata fixtures and hash-only manifests. It does not claim anonymization, inspect or interpret production pixels, perform re-identification, export studies, connect to PACS/RIS/VNA systems, or authorize research or clinical use.";

const hashPattern = /^[0-9a-f]{64}$/i;
const tagPattern = /^\([0-9A-Fa-f]{4},[0-9A-Fa-f]{4}\)$/;

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.toUpperCase()))].sort();
}

function isPrivateTag(tag: string) {
  if (!tagPattern.test(tag)) return false;
  return Number.parseInt(tag.slice(1, 5), 16) % 2 === 1;
}

function tagHash(element: DicomMetadataElement) {
  return createClinicalEvidenceHash({
    tag: element.tag.toUpperCase(),
    vr: element.vr,
    valueDigest: createClinicalEvidenceHash(element.value)
  });
}

function metadataManifest(metadata: DicomMetadataElement[]) {
  return metadata
    .map((element) => ({
      tag: element.tag.toUpperCase(),
      vr: element.vr,
      valueDigest: createClinicalEvidenceHash(element.value),
      clinicalAttribute: element.clinicalAttribute,
      privateTag: isPrivateTag(element.tag)
    }))
    .sort((left, right) => left.tag.localeCompare(right.tag));
}

export const p34BasicDicomDeidentificationProfile: DicomDeidentificationProfile = {
  profileId: "dicom-basic-confidentiality-synthetic-evaluation",
  version: "2026-08-15.1",
  supportedTransferSyntaxUids: [
    "1.2.840.10008.1.2",
    "1.2.840.10008.1.2.1",
    "1.2.840.10008.1.2.2"
  ],
  retainedClinicalTags: [
    "(0008,0060)",
    "(0018,0015)",
    "(0020,0013)",
    "(0028,0010)",
    "(0028,0011)"
  ],
  removedIdentifierTags: [
    "(0008,0050)",
    "(0008,0080)",
    "(0008,0090)",
    "(0010,0010)",
    "(0010,0020)",
    "(0010,0030)",
    "(0010,0040)",
    "(0020,000D)",
    "(0020,000E)"
  ],
  removeAllPrivateTags: true,
  requirePixelReviewWhenUncertain: true,
  humanApprovalBeforeExport: true,
  effectiveAt: "2026-08-15T00:00:00.000Z"
};

export function evaluateDicomDeidentification(input: {
  object: SyntheticDicomObject;
  profile: DicomDeidentificationProfile;
  operatorIdHash: string;
  evaluatedAt: string;
}): DicomPrivacyManifest {
  const { object, profile } = input;
  const reasonCodes: string[] = [];
  if (!hashPattern.test(object.sourceBytesHash)) reasonCodes.push("SOURCE_HASH_INVALID");
  if (!hashPattern.test(input.operatorIdHash)) reasonCodes.push("OPERATOR_IDENTITY_HASH_INVALID");
  if (!Number.isFinite(Date.parse(input.evaluatedAt))) reasonCodes.push("EVALUATION_TIME_INVALID");
  if (!object.syntheticOnly || object.containsRawPhi) reasonCodes.push("SYNTHETIC_NO_PHI_BOUNDARY_REQUIRED");
  if (object.malformed || object.metadata.some((element) => !tagPattern.test(element.tag))) {
    reasonCodes.push("MALFORMED_DICOM_METADATA");
  }
  if (!profile.supportedTransferSyntaxUids.includes(object.transferSyntaxUid)) {
    reasonCodes.push("UNSUPPORTED_TRANSFER_SYNTAX");
  }

  const detectedPrivateTags = canonical(
    object.metadata.filter((element) => isPrivateTag(element.tag)).map((element) => element.tag)
  );
  const removedTags = object.metadata.filter((element) =>
    isPrivateTag(element.tag) ||
    profile.removedIdentifierTags.includes(element.tag.toUpperCase()) ||
    !profile.retainedClinicalTags.includes(element.tag.toUpperCase())
  );
  const retainedTags = object.metadata.filter((element) =>
    !isPrivateTag(element.tag) && profile.retainedClinicalTags.includes(element.tag.toUpperCase())
  );

  if (object.pixelDataPresent && object.burnedInAnnotation !== "NO") {
    reasonCodes.push("PIXEL_DATA_PHI_REMOVAL_UNCERTAIN");
  }
  if (object.burnedInAnnotation === "YES") reasonCodes.push("BURNED_IN_ANNOTATION_DETECTED");
  if (object.burnedInAnnotation === "UNKNOWN") reasonCodes.push("BURNED_IN_ANNOTATION_STATUS_UNKNOWN");

  const hardBlock = reasonCodes.some((reason) => [
    "SOURCE_HASH_INVALID",
    "OPERATOR_IDENTITY_HASH_INVALID",
    "EVALUATION_TIME_INVALID",
    "SYNTHETIC_NO_PHI_BOUNDARY_REQUIRED",
    "MALFORMED_DICOM_METADATA",
    "UNSUPPORTED_TRANSFER_SYNTAX"
  ].includes(reason));
  const pixelQuarantine = reasonCodes.some((reason) => [
    "PIXEL_DATA_PHI_REMOVAL_UNCERTAIN",
    "BURNED_IN_ANNOTATION_DETECTED",
    "BURNED_IN_ANNOTATION_STATUS_UNKNOWN"
  ].includes(reason));
  const beforeManifestHash = createClinicalEvidenceHash({
    type: "p34-dicom-before-manifest",
    sourceBytesHash: object.sourceBytesHash,
    metadata: metadataManifest(object.metadata),
    pixelDataPresent: object.pixelDataPresent,
    burnedInAnnotation: object.burnedInAnnotation
  });
  const afterManifestHash = hardBlock || pixelQuarantine
    ? null
    : createClinicalEvidenceHash({
        type: "p34-dicom-after-manifest",
        retainedTagHashes: retainedTags.map(tagHash).sort(),
        profileId: profile.profileId,
        profileVersion: profile.version
      });
  const payload = {
    manifestId: `dicom-manifest-${createClinicalEvidenceHash({ objectId: object.objectId, profile: profile.version }).slice(0, 24)}`,
    objectId: object.objectId,
    sourceBytesHash: object.sourceBytesHash,
    sourceUnmodified: true as const,
    profileId: profile.profileId,
    profileVersion: profile.version,
    operatorIdHash: input.operatorIdHash,
    evaluatedAt: input.evaluatedAt,
    detectedPrivateTags,
    removedTagHashes: removedTags.map(tagHash).sort(),
    retainedTagHashes: retainedTags.map(tagHash).sort(),
    pixelDisposition: !object.pixelDataPresent
      ? "not-present" as const
      : pixelQuarantine
        ? "quarantined-uncertain" as const
        : "reviewed-no-annotation" as const,
    disposition: hardBlock
      ? "blocked" as const
      : pixelQuarantine
        ? "quarantined" as const
        : "review-ready" as const,
    decision: hardBlock || pixelQuarantine ? "BLOCK" as const : "REQUIRE_HUMAN" as const,
    reasonCodes: canonical([
      ...reasonCodes,
      "HUMAN_APPROVAL_REQUIRED_BEFORE_EXPORT",
      "METADATA_REMOVAL_DOES_NOT_ESTABLISH_ANONYMIZATION"
    ]),
    exportAuthorized: false as const,
    researchUseAuthorized: false as const,
    beforeManifestHash,
    afterManifestHash
  };
  return {
    ...payload,
    manifestHash: createClinicalEvidenceHash({
      type: "p34-dicom-privacy-manifest",
      version: p34DicomPrivacyVersion,
      payload
    })
  };
}

export function createP34SyntheticDicomObject(
  overrides: Partial<SyntheticDicomObject> = {}
): SyntheticDicomObject {
  return {
    objectId: "synthetic-dicom-object-001",
    tenantId: "synthetic-tenant",
    transferSyntaxUid: "1.2.840.10008.1.2.1",
    sourceBytesHash: createClinicalEvidenceHash("synthetic-dicom-bytes-001"),
    metadata: [
      { tag: "(0010,0010)", vr: "PN", value: "SYNTHETIC^SUBJECT", clinicalAttribute: false },
      { tag: "(0008,0060)", vr: "CS", value: "CT", clinicalAttribute: true },
      { tag: "(0018,0015)", vr: "CS", value: "CHEST", clinicalAttribute: true },
      { tag: "(0019,1001)", vr: "LO", value: "SYNTHETIC-PRIVATE", clinicalAttribute: false },
      { tag: "(0028,0010)", vr: "US", value: "512", clinicalAttribute: true },
      { tag: "(0028,0011)", vr: "US", value: "512", clinicalAttribute: true }
    ],
    pixelDataPresent: false,
    burnedInAnnotation: "NO",
    malformed: false,
    syntheticOnly: true,
    containsRawPhi: false,
    ...overrides
  };
}
