import { lstat, readdir } from "node:fs/promises";
import path from "node:path";

export const duplicateGeneratedSuffixPattern = / \d+(?:\.|$)/;

export async function inspectNextRoot(root = ".") {
  const nextPath = path.join(root, ".next");

  try {
    const stats = await lstat(nextPath);

    if (!stats.isDirectory() || stats.isSymbolicLink()) {
      return { exists: true, safe: false, reason: "generated root is not a regular directory" };
    }

    return { exists: true, safe: true };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { exists: false, safe: false, reason: "generated root is absent" };
    }

    throw error;
  }
}

export async function inspectPreservableNextCache(root = ".") {
  const rootInspection = await inspectNextRoot(root);
  if (!rootInspection.safe) {
    return rootInspection;
  }

  const cachePath = path.join(root, ".next", "cache");

  try {
    const cacheStats = await lstat(cachePath);
    if (!cacheStats.isDirectory() || cacheStats.isSymbolicLink()) {
      return { exists: true, safe: false, reason: "cache root is not a regular directory" };
    }

    const entries = await readdir(cachePath, { recursive: true, withFileTypes: true });
    const unsafeEntry = entries.find(
      (entry) => entry.isSymbolicLink() || duplicateGeneratedSuffixPattern.test(entry.name)
    );

    if (unsafeEntry) {
      return {
        exists: true,
        safe: false,
        reason: unsafeEntry.isSymbolicLink()
          ? "cache contains a symbolic link"
          : "cache contains duplicate-suffixed output"
      };
    }

    return { exists: true, safe: true };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { exists: false, safe: false, reason: "cache is absent" };
    }

    throw error;
  }
}

export async function inspectCacheOnlyNextRoot(root = ".") {
  const rootInspection = await inspectNextRoot(root);
  if (!rootInspection.safe) {
    return rootInspection;
  }

  const entries = await readdir(path.join(root, ".next"), { withFileTypes: true });
  if (
    entries.length !== 1 ||
    entries[0].name !== "cache" ||
    !entries[0].isDirectory() ||
    entries[0].isSymbolicLink()
  ) {
    return {
      exists: true,
      safe: false,
      reason: "generated root contains authoritative or unexpected output"
    };
  }

  return inspectPreservableNextCache(root);
}
