import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";

export const maximumWorktreeEvidenceFileBytes = 64 * 1024 * 1024;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function resolveRepositoryFile(repositoryRoot, repositoryRelativePath) {
  if (
    typeof repositoryRelativePath !== "string" ||
    repositoryRelativePath.length === 0 ||
    repositoryRelativePath.includes("\0") ||
    path.isAbsolute(repositoryRelativePath)
  ) {
    throw new Error("Worktree evidence requires a nonempty repository-relative path.");
  }

  const resolvedRoot = path.resolve(repositoryRoot);
  const absolutePath = path.resolve(resolvedRoot, repositoryRelativePath);
  const relativePath = path.relative(resolvedRoot, absolutePath);

  if (
    relativePath.length === 0 ||
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error("Worktree evidence path resolves outside the repository.");
  }

  return absolutePath;
}

export async function inspectWorktreeEvidenceFile(repositoryRoot, repositoryRelativePath) {
  const absolutePath = resolveRepositoryFile(repositoryRoot, repositoryRelativePath);
  const fileStat = await lstat(absolutePath);

  if (fileStat.isSymbolicLink()) {
    throw new Error(`Worktree evidence rejects symbolic links: ${repositoryRelativePath}`);
  }

  if (!fileStat.isFile()) {
    throw new Error(`Worktree evidence only accepts regular files: ${repositoryRelativePath}`);
  }

  if (fileStat.size > maximumWorktreeEvidenceFileBytes) {
    throw new Error(
      `Worktree evidence file exceeds ${maximumWorktreeEvidenceFileBytes} bytes: ${repositoryRelativePath}`
    );
  }

  return {
    sha256: sha256(await readFile(absolutePath)),
    fileMode: fileStat.mode & 0o777,
    fileSizeBytes: fileStat.size
  };
}
