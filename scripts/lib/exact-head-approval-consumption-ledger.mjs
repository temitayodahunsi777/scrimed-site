import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { constants as fileConstants } from "node:fs";
import {
  access,
  lstat,
  mkdtemp,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  rm
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";

export const exactHeadApprovalConsumptionLedgerVersion =
  "scrimed-exact-head-approval-consumption-ledger-v2-2026-08-10";

const sha256Pattern = /^[0-9a-f]{64}$/;
const commitPattern = /^[0-9a-f]{40}$/;
const maximumMarkerBytes = 4096;
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

async function assertProtectedAncestorChain(resolvedDirectory) {
  if (
    typeof process.geteuid !== "function" ||
    process.platform === "win32" ||
    process.geteuid() === 0
  ) {
    throw new Error(
      "exact-head-review-consumption-ledger-runtime-identity-unsafe"
    );
  }

  let current = dirname(resolvedDirectory);
  while (true) {
    const currentStat = await lstat(current);
    if (
      !currentStat.isDirectory() ||
      currentStat.isSymbolicLink() ||
      currentStat.uid !== 0
    ) {
      throw new Error(
        "exact-head-review-consumption-ledger-ancestry-unsafe"
      );
    }

    try {
      await access(current, fileConstants.W_OK);
      throw new Error(
        "exact-head-review-consumption-ledger-ancestry-unsafe"
      );
    } catch (error) {
      if (
        error?.message ===
        "exact-head-review-consumption-ledger-ancestry-unsafe"
      ) {
        throw error;
      }
      if (error?.code !== "EACCES" && error?.code !== "EPERM") throw error;
    }

    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
}

async function assertNoSymlinkPathComponents(ledgerDirectory) {
  if (ledgerDirectory !== resolve(ledgerDirectory)) {
    throw new Error("exact-head-review-consumption-ledger-path-invalid");
  }

  let current = ledgerDirectory;
  while (true) {
    const currentStat = await lstat(current);
    if (currentStat.isSymbolicLink()) {
      throw new Error("exact-head-review-consumption-ledger-path-invalid");
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
}

function directoryIdentity(directoryStat) {
  return {
    device: String(directoryStat.dev),
    inode: String(directoryStat.ino)
  };
}

async function assertPinnedLedgerDirectory(trustedState) {
  const [pathStat, handleStat] = await Promise.all([
    lstat(trustedState.resolvedDirectory),
    trustedState.directoryHandle.stat()
  ]);
  const pathIdentity = directoryIdentity(pathStat);
  const handleIdentity = directoryIdentity(handleStat);

  if (
    !pathStat.isDirectory() ||
    pathStat.isSymbolicLink() ||
    !handleStat.isDirectory() ||
    (pathStat.mode & 0o022) !== 0 ||
    (handleStat.mode & 0o022) !== 0 ||
    pathIdentity.device !== trustedState.directoryIdentity.device ||
    pathIdentity.inode !== trustedState.directoryIdentity.inode ||
    handleIdentity.device !== trustedState.directoryIdentity.device ||
    handleIdentity.inode !== trustedState.directoryIdentity.inode
  ) {
    throw new Error("exact-head-review-consumption-ledger-path-changed");
  }
}

async function resolveProtectedLedgerDirectory(
  ledgerDirectory,
  { allowRenameableAncestorsForSelfTest = false } = {}
) {
  if (typeof ledgerDirectory !== "string" || !isAbsolute(ledgerDirectory)) {
    throw new Error("exact-head-review-consumption-ledger-path-invalid");
  }

  await assertNoSymlinkPathComponents(ledgerDirectory);
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

  if (!allowRenameableAncestorsForSelfTest) {
    await assertProtectedAncestorChain(resolved);
  }

  const noFollow = fileConstants.O_NOFOLLOW ?? 0;
  const directoryOnly = fileConstants.O_DIRECTORY ?? 0;
  const directoryHandle = await open(
    resolved,
    fileConstants.O_RDONLY | directoryOnly | noFollow
  );
  const handleStat = await directoryHandle.stat();
  const resolvedIdentity = directoryIdentity(resolvedStat);
  const handleIdentity = directoryIdentity(handleStat);
  if (
    !handleStat.isDirectory() ||
    resolvedIdentity.device !== handleIdentity.device ||
    resolvedIdentity.inode !== handleIdentity.inode
  ) {
    await directoryHandle.close();
    throw new Error("exact-head-review-consumption-ledger-path-changed");
  }

  return {
    resolvedDirectory: resolved,
    directoryHandle,
    directoryIdentity: resolvedIdentity
  };
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

async function inspectExactHeadApprovalConsumptionInternal(
  { approval, ledgerDirectory, required = false },
  { allowRenameableAncestorsForSelfTest = false } = {}
) {
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

  let protectedDirectory;
  try {
    const identity = approvalMarkerIdentity(approval);
    protectedDirectory = await resolveProtectedLedgerDirectory(
      ledgerDirectory,
      { allowRenameableAncestorsForSelfTest }
    );
    const { resolvedDirectory } = protectedDirectory;
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
        if (
          !markerStat.isFile() ||
          markerStat.size <= 0 ||
          markerStat.size > maximumMarkerBytes ||
          (markerStat.mode & 0o022) !== 0
        ) {
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

    await assertPinnedLedgerDirectory(protectedDirectory);

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
        resolvedDirectory,
        directoryHandle: protectedDirectory.directoryHandle,
        directoryIdentity: protectedDirectory.directoryIdentity,
        consumed: false
      });
      protectedDirectory = undefined;
    } else {
      await protectedDirectory.directoryHandle.close();
      protectedDirectory = undefined;
    }
    return state;
  } catch (error) {
    await protectedDirectory?.directoryHandle.close();
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

export async function inspectExactHeadApprovalConsumption(input) {
  return inspectExactHeadApprovalConsumptionInternal(input);
}

export async function releaseExactHeadApprovalConsumption(consumptionState) {
  const trustedState = trustedConsumptionStates.get(consumptionState);
  if (!trustedState) return;
  trustedConsumptionStates.delete(consumptionState);
  await trustedState.directoryHandle.close();
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
  try {
    await assertPinnedLedgerDirectory(trustedState);
    for (const descriptor of trustedState.markers) {
      await assertPinnedLedgerDirectory(trustedState);
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
      } finally {
        await handle?.close();
      }
    }

    await assertPinnedLedgerDirectory(trustedState);
    try {
      await trustedState.directoryHandle.sync();
    } catch {
      throw new Error("exact-head-review-consumption-ledger-sync-failed");
    }
    await assertPinnedLedgerDirectory(trustedState);
  } catch (error) {
    if (error?.code === "EEXIST" || recordHashes.length > 0) {
      trustedState.consumed = true;
    }
    const knownError =
      typeof error?.message === "string" &&
      error.message.startsWith("exact-head-review-consumption-")
        ? error.message
        : null;
    return {
      consumed: false,
      replayRejected: error?.code === "EEXIST",
      receiptHash: null,
      errorCode:
        error?.code === "EEXIST"
          ? "exact-head-review-replay-rejected"
          : knownError ?? "exact-head-review-consumption-ledger-write-failed"
    };
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

function buildSyntheticApproval(overrides = {}) {
  const approval = {
    approvalId: "synthetic-ledger-approval",
    replayNonce: "synthetic-ledger-replay-nonce",
    approvalDigest: "1".repeat(64),
    commitSha: "2".repeat(40),
    candidateFingerprint: "3".repeat(64),
    sourceFingerprint: "4".repeat(64),
    ...overrides
  };
  return {
    ...approval,
    approvalDigest: sha256(JSON.stringify(approval))
  };
}

async function inspectSyntheticLedger(input) {
  return inspectExactHeadApprovalConsumptionInternal(input, {
    allowRenameableAncestorsForSelfTest: true
  });
}

export async function runExactHeadApprovalConsumptionLedgerSelfTest() {
  const temporaryRoot = await mkdtemp(
    join(tmpdir(), "scrimed-exact-head-ledger-self-test-")
  );
  const root = await realpath(temporaryRoot);
  const ledgerDirectory = join(root, "ledger");
  const movedDirectory = join(root, "ledger-moved");
  const approval = buildSyntheticApproval();
  const statesToRelease = [];

  await mkdir(ledgerDirectory, { mode: 0o700 });
  try {
    const unsafeAncestry = await inspectExactHeadApprovalConsumption({
      approval,
      ledgerDirectory,
      required: true
    });
    assert.equal(unsafeAncestry.ready, false);
    assert.ok(
      [
        "exact-head-review-consumption-ledger-ancestry-unsafe",
        "exact-head-review-consumption-ledger-runtime-identity-unsafe"
      ].includes(unsafeAncestry.errorCode)
    );

    const identityProbe = buildSyntheticApproval({
      approvalId: "synthetic-ledger-identity-probe",
      replayNonce: "synthetic-ledger-identity-probe-nonce"
    });
    const identityState = await inspectSyntheticLedger({
      approval: identityProbe,
      ledgerDirectory,
      required: true
    });
    statesToRelease.push(identityState);
    identityState.markers = [];
    const substitutedIdentity = await consumeExactHeadApproval({
      approval: buildSyntheticApproval({
        ...identityProbe,
        sourceFingerprint: "5".repeat(64)
      }),
      consumptionState: identityState,
      consumedAt: "2026-08-10T00:00:00.000Z"
    });
    assert.equal(substitutedIdentity.consumed, false);
    assert.equal(
      substitutedIdentity.errorCode,
      "exact-head-review-consumption-ledger-unavailable"
    );
    const identityConsumption = await consumeExactHeadApproval({
      approval: identityProbe,
      consumptionState: identityState,
      consumedAt: "2026-08-10T00:00:01.000Z"
    });
    assert.equal(identityConsumption.consumed, true);
    assert.match(identityConsumption.receiptHash, sha256Pattern);

    const replay = await inspectSyntheticLedger({
      approval: identityProbe,
      ledgerDirectory,
      required: true
    });
    assert.equal(replay.consumed, true);
    assert.ok(replay.consumedApprovalIds.has(identityProbe.approvalId));
    assert.ok(replay.consumedApprovalIds.has(identityProbe.replayNonce));

    for (const reusedIdentifier of [
      buildSyntheticApproval({
        approvalId: identityProbe.approvalId,
        replayNonce: "synthetic-ledger-new-nonce"
      }),
      buildSyntheticApproval({
        approvalId: "synthetic-ledger-new-approval",
        replayNonce: identityProbe.replayNonce
      })
    ]) {
      const reused = await inspectSyntheticLedger({
        approval: reusedIdentifier,
        ledgerDirectory,
        required: true
      });
      assert.equal(reused.consumed, true);
    }

    const pathSwapApproval = buildSyntheticApproval({
      approvalId: "synthetic-ledger-path-swap",
      replayNonce: "synthetic-ledger-path-swap-nonce"
    });
    const pathSwapState = await inspectSyntheticLedger({
      approval: pathSwapApproval,
      ledgerDirectory,
      required: true
    });
    statesToRelease.push(pathSwapState);
    await rename(ledgerDirectory, movedDirectory);
    await mkdir(ledgerDirectory, { mode: 0o700 });
    const swapped = await consumeExactHeadApproval({
      approval: pathSwapApproval,
      consumptionState: pathSwapState,
      consumedAt: "2026-08-10T00:00:02.000Z"
    });
    assert.equal(swapped.consumed, false);
    assert.equal(
      swapped.errorCode,
      "exact-head-review-consumption-ledger-path-changed"
    );
    await rm(ledgerDirectory, { recursive: true, force: true });
    await rename(movedDirectory, ledgerDirectory);
    const restored = await consumeExactHeadApproval({
      approval: pathSwapApproval,
      consumptionState: pathSwapState,
      consumedAt: "2026-08-10T00:00:03.000Z"
    });
    assert.equal(restored.consumed, true);
    for (const marker of pathSwapState.markers) {
      const stored = JSON.parse(
        await readFile(
          join(ledgerDirectory, `${marker.markerKind}-${marker.markerKey}.json`),
          "utf8"
        )
      );
      assert.equal(stored.markerKey, marker.markerKey);
    }
  } finally {
    for (const state of statesToRelease) {
      await releaseExactHeadApprovalConsumption(state);
    }
    await rm(root, { recursive: true, force: true });
  }

  console.log(
    "pass exact-head approval consumption ledger self-test (unsafe ancestry rejection, pinned-directory continuity, directory sync, identity binding, and durable replay rejection)"
  );
}
