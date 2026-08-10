import { createHash } from "node:crypto";
import { constants as fileConstants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, join } from "node:path";

export const exactHeadApprovalConsumptionLedgerVersion =
  "scrimed-exact-head-approval-consumption-ledger-v1-2026-08-10";

const sha256Pattern = /^[0-9a-f]{64}$/;
const commitPattern = /^[0-9a-f]{40}$/;
const trustedConsumptionStates = new WeakMap();

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)])
    );
  }
  return value;
}

function stableHash(value) {
  return sha256(JSON.stringify(canonicalize(value)));
}

function approvalMarkerIdentity(approval) {
  if (
    !approval ||
    typeof approval.approvalId !== "string" ||
    !approval.approvalId.trim() ||
    typeof approval.replayNonce !== "string" ||
    !approval.replayNonce.trim() ||
    !sha256Pattern.test(approval.approvalDigest) ||
    !sha256Pattern.test(approval.candidateFingerprint) ||
    !sha256Pattern.test(approval.sourceFingerprint) ||
    !commitPattern.test(approval.commitSha)
  ) {
    throw new Error("exact-head-review-consumption-approval-invalid");
  }

  return {
    approvalIdHash: sha256(approval.approvalId),
    replayNonceHash: sha256(approval.replayNonce),
    approvalDigest: approval.approvalDigest,
    commitSha: approval.commitSha,
    candidateFingerprint: approval.candidateFingerprint,
    sourceFingerprint: approval.sourceFingerprint
  };
}

function buildMarkerDescriptors(identity, resolvedDirectory) {
  return [
    {
      markerKind: "approval-id",
      identifierHash: identity.approvalIdHash
    },
    {
      markerKind: "replay-nonce",
      identifierHash: identity.replayNonceHash
    }
  ].map((descriptor) => {
    const markerKey = stableHash({
      version: exactHeadApprovalConsumptionLedgerVersion,
      ...descriptor
    });
    return {
      ...descriptor,
      markerKey,
      markerPath: join(
        resolvedDirectory,
        `${descriptor.markerKind}-${markerKey}.json`
      )
    };
  });
}

async function resolveProtectedLedgerDirectory(ledgerDirectory) {
  if (typeof ledgerDirectory !== "string" || !isAbsolute(ledgerDirectory)) {
    throw new Error("exact-head-review-consumption-ledger-path-invalid");
  }

  const initial = await lstat(ledgerDirectory);
  if (!initial.isDirectory() || initial.isSymbolicLink()) {
    throw new Error("exact-head-review-consumption-ledger-path-invalid");
  }
  if ((initial.mode & 0o022) !== 0) {
    throw new Error("exact-head-review-consumption-ledger-permissions-unsafe");
  }

  const resolved = await realpath(ledgerDirectory);
  const resolvedStat = await lstat(resolved);
  if (!resolvedStat.isDirectory() || resolvedStat.isSymbolicLink()) {
    throw new Error("exact-head-review-consumption-ledger-path-invalid");
  }
  if ((resolvedStat.mode & 0o022) !== 0) {
    throw new Error("exact-head-review-consumption-ledger-permissions-unsafe");
  }

  return resolved;
}

function validateStoredMarker(marker, descriptor) {
  if (!marker || typeof marker !== "object" || Array.isArray(marker)) {
    return false;
  }
  const { recordHash, ...payload } = marker;
  return (
    marker.version === exactHeadApprovalConsumptionLedgerVersion &&
    marker.markerKind === descriptor.markerKind &&
    marker.markerKey === descriptor.markerKey &&
    marker.identifierHash === descriptor.identifierHash &&
    sha256Pattern.test(marker.approvalIdHash) &&
    sha256Pattern.test(marker.replayNonceHash) &&
    sha256Pattern.test(marker.approvalDigest) &&
    commitPattern.test(marker.commitSha) &&
    sha256Pattern.test(marker.candidateFingerprint) &&
    sha256Pattern.test(marker.sourceFingerprint) &&
    typeof marker.consumedAt === "string" &&
    Number.isFinite(Date.parse(marker.consumedAt)) &&
    sha256Pattern.test(recordHash) &&
    recordHash === stableHash(payload)
  );
}

function unavailableState({ approval, configured, errorCode }) {
  return {
    configured,
    ready: false,
    consumed: true,
    consumedApprovalIds: new Set(
      approval ? [approval.approvalId, approval.replayNonce] : []
    ),
    markers: [],
    ledgerDirectoryFingerprint: null,
    errorCode
  };
}

export async function inspectExactHeadApprovalConsumption({
  approval,
  ledgerDirectory,
  required = false
}) {
  if (!approval) {
    return {
      configured: Boolean(ledgerDirectory),
      ready: true,
      consumed: false,
      consumedApprovalIds: new Set(),
      markers: [],
      ledgerDirectoryFingerprint: null,
      errorCode: null
    };
  }

  if (!ledgerDirectory) {
    if (required) {
      return unavailableState({
        approval,
        configured: false,
        errorCode: "exact-head-review-consumption-ledger-required"
      });
    }
    return {
      configured: false,
      ready: true,
      consumed: false,
      consumedApprovalIds: new Set(),
      markers: [],
      ledgerDirectoryFingerprint: null,
      errorCode: null
    };
  }

  try {
    const identity = approvalMarkerIdentity(approval);
    const resolvedDirectory = await resolveProtectedLedgerDirectory(
      ledgerDirectory
    );
    const markers = buildMarkerDescriptors(identity, resolvedDirectory);
    let consumed = false;

    for (const descriptor of markers) {
      let markerHandle;
      try {
        const markerPathStat = await lstat(descriptor.markerPath);
        if (markerPathStat.isSymbolicLink()) {
          throw new Error("exact-head-review-consumption-ledger-tampered");
        }
        const noFollow = fileConstants.O_NOFOLLOW ?? 0;
        markerHandle = await open(
          descriptor.markerPath,
          fileConstants.O_RDONLY | noFollow
        );
        const markerStat = await markerHandle.stat();
        if (!markerStat.isFile() || (markerStat.mode & 0o022) !== 0) {
          throw new Error("exact-head-review-consumption-ledger-tampered");
        }
        const marker = JSON.parse(await markerHandle.readFile("utf8"));
        if (!validateStoredMarker(marker, descriptor)) {
          throw new Error("exact-head-review-consumption-ledger-tampered");
        }
        consumed = true;
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      } finally {
        await markerHandle?.close();
      }
    }

    const state = {
      configured: true,
      ready: true,
      consumed,
      consumedApprovalIds: consumed
        ? new Set([approval.approvalId, approval.replayNonce])
        : new Set(),
      markers: markers.map(({ markerKind, markerKey, identifierHash }) => ({
        markerKind,
        markerKey,
        identifierHash
      })),
      ledgerDirectoryFingerprint: sha256(resolvedDirectory),
      errorCode: null
    };
    if (!consumed) {
      trustedConsumptionStates.set(state, {
        approvalIdentityHash: stableHash(identity),
        markers: markers.map((marker) => Object.freeze({ ...marker })),
        consumed: false
      });
    }
    return state;
  } catch (error) {
    return unavailableState({
      approval,
      configured: true,
      errorCode:
        typeof error?.message === "string" &&
        error.message.startsWith("exact-head-review-consumption-")
          ? error.message
          : "exact-head-review-consumption-ledger-unavailable"
    });
  }
}

export async function consumeExactHeadApproval({
  approval,
  consumptionState,
  consumedAt = new Date().toISOString()
}) {
  const trustedState = trustedConsumptionStates.get(consumptionState);
  if (
    !consumptionState?.ready ||
    !trustedState ||
    !Array.isArray(trustedState.markers) ||
    trustedState.markers.length !== 2 ||
    trustedState.consumed ||
    consumptionState.consumed ||
    typeof consumedAt !== "string" ||
    !Number.isFinite(Date.parse(consumedAt))
  ) {
    return {
      consumed: false,
      replayRejected: Boolean(
        trustedState?.consumed || consumptionState?.consumed
      ),
      receiptHash: null,
      errorCode: trustedState?.consumed || consumptionState?.consumed
        ? "exact-head-review-replay-rejected"
        : "exact-head-review-consumption-ledger-unavailable"
    };
  }

  const identity = approvalMarkerIdentity(approval);
  if (stableHash(identity) !== trustedState.approvalIdentityHash) {
    return {
      consumed: false,
      replayRejected: false,
      receiptHash: null,
      errorCode: "exact-head-review-consumption-ledger-unavailable"
    };
  }
  const expectedKinds = new Map(
    buildMarkerDescriptors(identity, "/").map((descriptor) => [
      descriptor.markerKind,
      descriptor.markerKey
    ])
  );
  if (
    trustedState.markers.some(
      (descriptor) =>
        expectedKinds.get(descriptor.markerKind) !== descriptor.markerKey
    )
  ) {
    return {
      consumed: false,
      replayRejected: false,
      receiptHash: null,
      errorCode: "exact-head-review-consumption-ledger-unavailable"
    };
  }

  const recordHashes = [];
  const noFollow = fileConstants.O_NOFOLLOW ?? 0;
  for (const descriptor of trustedState.markers) {
    const payload = {
      version: exactHeadApprovalConsumptionLedgerVersion,
      markerKind: descriptor.markerKind,
      markerKey: descriptor.markerKey,
      identifierHash: descriptor.identifierHash,
      approvalIdHash: identity.approvalIdHash,
      replayNonceHash: identity.replayNonceHash,
      approvalDigest: identity.approvalDigest,
      commitSha: identity.commitSha,
      candidateFingerprint: identity.candidateFingerprint,
      sourceFingerprint: identity.sourceFingerprint,
      consumedAt
    };
    const marker = {
      ...payload,
      recordHash: stableHash(payload)
    };
    let handle;

    try {
      handle = await open(
        descriptor.markerPath,
        fileConstants.O_CREAT |
          fileConstants.O_EXCL |
          fileConstants.O_WRONLY |
          noFollow,
        0o600
      );
      await handle.writeFile(`${JSON.stringify(marker)}\n`, "utf8");
      await handle.sync();
      recordHashes.push(marker.recordHash);
    } catch (error) {
      if (error?.code === "EEXIST" || recordHashes.length > 0) {
        trustedState.consumed = true;
      }
      return {
        consumed: false,
        replayRejected: error?.code === "EEXIST",
        receiptHash: null,
        errorCode:
          error?.code === "EEXIST"
            ? "exact-head-review-replay-rejected"
            : "exact-head-review-consumption-ledger-write-failed"
      };
    } finally {
      await handle?.close();
    }
  }

  trustedState.consumed = true;

  return {
    consumed: true,
    replayRejected: false,
    receiptHash: stableHash({
      version: exactHeadApprovalConsumptionLedgerVersion,
      recordHashes: [...recordHashes].sort()
    }),
    errorCode: null
  };
}
