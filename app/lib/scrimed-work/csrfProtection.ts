export const scrimedWorkCsrfPolicyVersion = "scrimed-work-csrf-v1-2026-07-17";
export const scrimedWorkRequestContextHeader = "x-scrimed-request-context";
export const scrimedWorkOperatorSmokeContext = "operator-smoke-v1";
export const scrimedWorkCsrfBoundary =
  "SCRIMED Work browser mutations require an exact same-origin request. Non-browser operator smoke requests must declare a fixed, nonsecret request context and still pass bearer authentication, AAL2, RBAC, tenant scope, idempotency, safety, and durable-store controls.";

export type ScrimedWorkRequestProvenance =
  | "same-origin-browser"
  | "non-browser-operator-smoke";

export type ScrimedWorkCsrfDecision = {
  allowed: boolean;
  policyVersion: typeof scrimedWorkCsrfPolicyVersion;
  provenance: ScrimedWorkRequestProvenance | "denied";
  reason:
    | "same-origin-browser-request"
    | "explicit-non-browser-operator-smoke"
    | "cross-origin-browser-request"
    | "invalid-origin-header"
    | "browser-origin-header-required"
    | "unsafe-browser-fetch-metadata"
    | "non-browser-request-context-required";
  auditTags: string[];
};

type DeniedReason = Exclude<
  ScrimedWorkCsrfDecision["reason"],
  "same-origin-browser-request" | "explicit-non-browser-operator-smoke"
>;

function deny(reason: DeniedReason, auditTag: string): ScrimedWorkCsrfDecision {
  return {
    allowed: false,
    policyVersion: scrimedWorkCsrfPolicyVersion,
    provenance: "denied",
    reason,
    auditTags: ["csrf-denied", auditTag]
  };
}

function normalizeOrigin(value: string) {
  try {
    const parsed = new URL(value);
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== "/" ||
      parsed.search ||
      parsed.hash
    ) {
      return "";
    }
    return parsed.origin;
  } catch {
    return "";
  }
}

export function evaluateScrimedWorkWriteRequestProvenance(
  request: Request
): ScrimedWorkCsrfDecision {
  const rawOrigin = request.headers.get("origin")?.trim() ?? "";
  const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase() ?? "";
  const fetchMode = request.headers.get("sec-fetch-mode")?.trim().toLowerCase() ?? "";
  const fetchDestination =
    request.headers.get("sec-fetch-dest")?.trim().toLowerCase() ?? "";
  const requestContext =
    request.headers.get(scrimedWorkRequestContextHeader)?.trim().toLowerCase() ?? "";

  if (rawOrigin) {
    const requestOrigin = normalizeOrigin(rawOrigin);
    const targetOrigin = normalizeOrigin(new URL(request.url).origin);

    if (!requestOrigin || !targetOrigin) {
      return deny("invalid-origin-header", "origin-invalid");
    }

    if (requestOrigin !== targetOrigin) {
      return deny("cross-origin-browser-request", "origin-mismatch");
    }

    if (
      (fetchSite && fetchSite !== "same-origin") ||
      (fetchMode && !["cors", "same-origin"].includes(fetchMode)) ||
      (fetchDestination && fetchDestination !== "empty")
    ) {
      return deny("unsafe-browser-fetch-metadata", "fetch-metadata-denied");
    }

    return {
      allowed: true,
      policyVersion: scrimedWorkCsrfPolicyVersion,
      provenance: "same-origin-browser",
      reason: "same-origin-browser-request",
      auditTags: ["csrf-verified", "same-origin-browser"]
    };
  }

  if (fetchSite || fetchMode || fetchDestination) {
    return deny("browser-origin-header-required", "browser-origin-missing");
  }

  if (requestContext !== scrimedWorkOperatorSmokeContext) {
    return deny("non-browser-request-context-required", "operator-context-missing");
  }

  return {
    allowed: true,
    policyVersion: scrimedWorkCsrfPolicyVersion,
    provenance: "non-browser-operator-smoke",
    reason: "explicit-non-browser-operator-smoke",
    auditTags: ["csrf-not-applicable", "explicit-non-browser-operator-smoke"]
  };
}
