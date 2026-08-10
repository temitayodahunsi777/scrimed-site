import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";

export const scrimedP32RepoOpsVersion = "scrimed-p32-repo-ops-v1-2026-07-20";

export const scrimedP32RepoOpsBoundary =
  "SCRIMED RepoOps produces local, no-secret, fingerprint-bound evidence. It does not approve a pull request, enable remote GitHub controls, sign an artifact, authorize a release, or permit production actions.";

export type DeveloperSessionReceipt = {
  receiptId: string;
  issueReference: string;
  sessionId: string;
  actorIdentityHash: string;
  candidateFingerprint: string;
  sourceFingerprint: string;
  changeSetDigest: string;
  testEvidence: Array<{
    checkId: string;
    status: "passed" | "failed" | "not-run";
    evidenceHash: string | null;
  }>;
  pullRequestReference: string | null;
  reviewEvidenceReferences: string[];
  releaseEvidenceReferences: string[];
  externalDistributionAuthorized: false;
  productionMutationAuthorized: false;
  createdAt: string;
  receiptHash: string;
};

export type SecretFinding = {
  detector: "jwt" | "private-key" | "api-key" | "generic-assignment";
  line: number;
  fingerprint: string;
};

const sha256Pattern = /^[0-9a-f]{64}$/i;

export function createDeveloperSessionReceipt(
  input: Omit<
    DeveloperSessionReceipt,
    "externalDistributionAuthorized" | "productionMutationAuthorized" | "receiptHash"
  >
): DeveloperSessionReceipt {
  if (
    ![
      input.actorIdentityHash,
      input.candidateFingerprint,
      input.sourceFingerprint,
      input.changeSetDigest
    ].every((value) => sha256Pattern.test(value))
  ) {
    throw new Error("Developer session receipt requires SHA-256 identity and candidate digests");
  }
  if (!Number.isFinite(Date.parse(input.createdAt)) || !input.issueReference || !input.sessionId) {
    throw new Error("Developer session receipt requires issue, session, and timestamp attribution");
  }
  if (input.testEvidence.some((test) => test.evidenceHash !== null && !sha256Pattern.test(test.evidenceHash))) {
    throw new Error("Developer session test evidence hashes are invalid");
  }
  const withoutHash = {
    ...input,
    testEvidence: [...input.testEvidence].sort((left, right) => left.checkId.localeCompare(right.checkId)),
    reviewEvidenceReferences: [...new Set(input.reviewEvidenceReferences)].sort(),
    releaseEvidenceReferences: [...new Set(input.releaseEvidenceReferences)].sort(),
    externalDistributionAuthorized: false as const,
    productionMutationAuthorized: false as const
  };
  return {
    ...withoutHash,
    receiptHash: createClinicalEvidenceHash({
      version: scrimedP32RepoOpsVersion,
      receipt: withoutHash
    })
  };
}

function lineNumberAt(content: string, offset: number) {
  return content.slice(0, offset).split("\n").length;
}

function candidateMatches(content: string) {
  const patterns: Array<{ detector: SecretFinding["detector"]; pattern: RegExp }> = [
    {
      detector: "jwt",
      pattern: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g
    },
    {
      detector: "private-key",
      pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g
    },
    {
      detector: "api-key",
      pattern: /\b(?:sk-|sbp_)[A-Za-z0-9_-]{20,}\b/g
    },
    {
      detector: "generic-assignment",
      pattern: /\b(?:password|secret|access_token|refresh_token|service_role_key)\s*[:=]\s*["'][A-Za-z0-9+/_=-]{20,}["']/gi
    }
  ];
  return patterns.flatMap(({ detector, pattern }) =>
    [...content.matchAll(pattern)].map((match) => ({ detector, match }))
  );
}

export function scanSecretLikeMaterial(content: string): SecretFinding[] {
  return candidateMatches(content)
    .filter(({ match }) => !/(?:synthetic|example|redacted|placeholder|fake)/i.test(match[0]))
    .map(({ detector, match }) => ({
      detector,
      line: lineNumberAt(content, match.index ?? 0),
      fingerprint: createClinicalEvidenceHash({ detector, value: match[0] }).slice(0, 16)
    }));
}

export type RemoteRepoControlStatus = {
  control:
    | "branch-protection"
    | "private-vulnerability-reporting"
    | "secret-scanning"
    | "push-protection"
    | "required-reviews"
    | "force-push-protection"
    | "required-status-checks";
  status: "UNVERIFIED_REMOTE_OPERATOR_REQUIRED" | "VERIFIED_ENABLED" | "VERIFIED_DISABLED";
  evidenceReference: string | null;
  mutationAuthorized: false;
};

export function buildRemoteRepoControlReport(
  evidence: Partial<Record<RemoteRepoControlStatus["control"], string>> = {}
): RemoteRepoControlStatus[] {
  const controls: RemoteRepoControlStatus["control"][] = [
    "branch-protection",
    "private-vulnerability-reporting",
    "secret-scanning",
    "push-protection",
    "required-reviews",
    "force-push-protection",
    "required-status-checks"
  ];
  return controls.map((control) => ({
    control,
    status: evidence[control]
      ? "VERIFIED_ENABLED" as const
      : "UNVERIFIED_REMOTE_OPERATOR_REQUIRED" as const,
    evidenceReference: evidence[control] ?? null,
    mutationAuthorized: false as const
  }));
}
