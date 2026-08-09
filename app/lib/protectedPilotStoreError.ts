export type ProtectedPilotStoreFailure = {
  code: string;
  message: string;
  status: number;
  reauthenticationRequired: boolean;
};

type ProtectedPilotStoreErrorLike = {
  code?: unknown;
  details?: unknown;
  hint?: unknown;
  message?: unknown;
};

type ProtectedPilotStoreFailureFallback = Omit<ProtectedPilotStoreFailure, "reauthenticationRequired">;

function errorText(error: unknown) {
  if (!error || typeof error !== "object") {
    return "";
  }

  const candidate = error as ProtectedPilotStoreErrorLike;
  return [candidate.code, candidate.message, candidate.details, candidate.hint]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

export function isGovernanceAal2SessionError(error: unknown) {
  const text = errorText(error);
  return text.includes("governance-aal2-session-required") || text.includes("aal2-session-required");
}

export function classifyProtectedPilotStoreFailure(
  error: unknown,
  fallback: ProtectedPilotStoreFailureFallback
): ProtectedPilotStoreFailure {
  if (isGovernanceAal2SessionError(error)) {
    return {
      code: "governance-aal2-session-required",
      message:
        "A fresh AAL2 governance session is required. Sign out, sign in again, verify the enrolled authenticator, and retry.",
      status: 403,
      reauthenticationRequired: true
    };
  }

  return {
    ...fallback,
    reauthenticationRequired: false
  };
}
