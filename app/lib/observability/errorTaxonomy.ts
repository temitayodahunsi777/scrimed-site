export type ScrimedErrorCategory =
  | "AUTHENTICATION"
  | "AUTHORIZATION"
  | "POLICY_DENIAL"
  | "VALIDATION"
  | "PROVIDER"
  | "TOOL"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "DEPENDENCY"
  | "INTERNAL"
  | "UNKNOWN";

export type SafeErrorDescriptor = {
  category: ScrimedErrorCategory;
  code: string;
  retryable: boolean;
};

const boundedCodePattern = /^[A-Z][A-Z0-9_]{2,79}$/;

export function normalizeErrorDescriptor(input: Partial<SafeErrorDescriptor>): SafeErrorDescriptor {
  const category = input.category ?? "UNKNOWN";
  const code = input.code && boundedCodePattern.test(input.code) ? input.code : "UNCLASSIFIED_ERROR";
  const retryable = Boolean(input.retryable) && !new Set<ScrimedErrorCategory>([
    "AUTHENTICATION",
    "AUTHORIZATION",
    "POLICY_DENIAL",
    "VALIDATION"
  ]).has(category);

  return { category, code, retryable };
}

export function classifyHttpError(status: number): SafeErrorDescriptor {
  if (status === 401) return { category: "AUTHENTICATION", code: "AUTH_REQUIRED", retryable: false };
  if (status === 403) return { category: "AUTHORIZATION", code: "ACCESS_DENIED", retryable: false };
  if (status === 408 || status === 504) return { category: "TIMEOUT", code: "REQUEST_TIMEOUT", retryable: true };
  if (status === 409 || status === 422) return { category: "VALIDATION", code: "REQUEST_CONFLICT", retryable: false };
  if (status === 429) return { category: "RATE_LIMIT", code: "RATE_LIMITED", retryable: true };
  if (status >= 500) return { category: "INTERNAL", code: "SERVER_FAILURE", retryable: true };
  return { category: "UNKNOWN", code: "UNCLASSIFIED_ERROR", retryable: false };
}
