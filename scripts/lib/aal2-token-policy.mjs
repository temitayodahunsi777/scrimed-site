import { createHash } from "node:crypto";

export const durableStoreAllowedRoles = ["tenant-admin", "pilot-lead", "reviewer"];

export const aal2SmokeTokenPolicy = {
  requiredTokenEnv: "SCRIMED_BEARER_TOKEN",
  requiredWorkspaceEnv: "SCRIMED_WORKSPACE_SLUG",
  maxTokenLifetimeSeconds: 3900,
  minRemainingSeconds: 60,
  requiredClaims: ["aal=aal2", "session_id", "exp", "iat"],
  signatureVerification:
    "Local preflight decodes JWT claims only; Supabase Auth and protected SCRIMED APIs verify the bearer before mutation."
};

export const aal2SignatureVerification = {
  localPreflight: "not-verified-local-preflight",
  pendingProtectedApi: "pending-protected-api-verification",
  protectedApi: "verified-by-protected-api",
  supabaseAuth: "verified-by-supabase-auth"
};

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function redactSensitive(value) {
  return String(value)
    .replace(/Bearer\s+[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/gi, "Bearer [REDACTED]")
    .replace(/Bearer\s+[A-Za-z0-9._-]{16,}/gi, "Bearer [REDACTED]")
    .replace(/[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, "[REDACTED_JWT]")
    .replace(/\b(?:sbp|sb_secret|sk|pk)_[A-Za-z0-9_-]{12,}\b/gi, "[REDACTED_SECRET]")
    .replace(
      /\b(access[_-]?token|refresh[_-]?token|authorization|api[_-]?key)(\s*[:=]\s*)["']?[A-Za-z0-9._-]{8,}["']?/gi,
      "$1$2[REDACTED]"
    );
}

function base64UrlDecode(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(`${base64}${padding}`, "base64").toString("utf8");
}

export function decodeJwtPayload(token) {
  const parts = cleanText(token).split(".");

  if (parts.length !== 3 || !parts[1]) {
    return {
      error: "Bearer token must be a compact JWT with header, payload, and signature segments.",
      claims: null
    };
  }

  try {
    return {
      claims: JSON.parse(base64UrlDecode(parts[1])),
      error: null
    };
  } catch {
    return {
      error: "Bearer token payload could not be decoded as JSON.",
      claims: null
    };
  }
}

function numberClaim(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(cleanText(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function isSafeWorkspaceSlug(value) {
  return /^[a-z0-9][a-z0-9-]{3,127}$/i.test(value);
}

export function isDurableStoreAuthorizedRole(role) {
  return durableStoreAllowedRoles.includes(cleanText(role));
}

export function tokenFingerprint(token) {
  return createHash("sha256").update(cleanText(token)).digest("hex").slice(0, 12);
}

export function userFingerprint(userId) {
  return cleanText(userId)
    ? createHash("sha256").update(cleanText(userId)).digest("hex").slice(0, 12)
    : "unknown";
}

export function analyzeAal2BearerToken({
  bearerToken,
  workspaceSlug,
  maxTokenLifetimeSeconds = aal2SmokeTokenPolicy.maxTokenLifetimeSeconds,
  minRemainingSeconds = aal2SmokeTokenPolicy.minRemainingSeconds,
  nowMs = Date.now()
}) {
  const errors = [];
  const warnings = [];
  const cleanToken = cleanText(bearerToken);
  const cleanWorkspaceSlug = cleanText(workspaceSlug);

  if (!cleanToken) {
    errors.push(`Missing ${aal2SmokeTokenPolicy.requiredTokenEnv}.`);
  }

  if (!cleanWorkspaceSlug) {
    errors.push(`Missing ${aal2SmokeTokenPolicy.requiredWorkspaceEnv}.`);
  } else if (!isSafeWorkspaceSlug(cleanWorkspaceSlug)) {
    errors.push(`${aal2SmokeTokenPolicy.requiredWorkspaceEnv} must be an explicit protected workspace slug.`);
  }

  if (!cleanToken) {
    return {
      ok: false,
      errors,
      warnings,
      claims: null,
      workspaceSlug: cleanWorkspaceSlug,
      remainingSeconds: null,
      tokenLifetimeSeconds: null,
      tokenFingerprint: null
    };
  }

  const decoded = decodeJwtPayload(cleanToken);

  if (decoded.error || !decoded.claims) {
    errors.push(decoded.error ?? "Bearer token could not be decoded.");
    return {
      ok: false,
      errors,
      warnings,
      claims: null,
      workspaceSlug: cleanWorkspaceSlug,
      remainingSeconds: null,
      tokenLifetimeSeconds: null,
      tokenFingerprint: tokenFingerprint(cleanToken)
    };
  }

  const claims = decoded.claims;
  const exp = numberClaim(claims.exp);
  const iat = numberClaim(claims.iat);
  const nowSeconds = Math.floor(nowMs / 1000);
  const remainingSeconds = exp === null ? null : exp - nowSeconds;
  const tokenLifetimeSeconds = exp !== null && iat !== null ? exp - iat : null;

  if (claims.aal !== "aal2") {
    errors.push("Bearer token must contain aal=aal2.");
  }

  if (typeof claims.session_id !== "string" || claims.session_id.length === 0) {
    errors.push("Bearer token must contain a non-empty session_id claim.");
  }

  if (typeof claims.sub !== "string" || claims.sub.length === 0) {
    warnings.push("Bearer token is missing a sub claim; protected API verification remains the source of truth.");
  }

  if (exp === null) {
    errors.push("Bearer token must contain a numeric exp claim.");
  } else if (remainingSeconds !== null && remainingSeconds <= 0) {
    errors.push("Bearer token is expired.");
  } else if (remainingSeconds !== null && remainingSeconds < minRemainingSeconds) {
    errors.push(
      `Bearer token expires too soon for AAL2 smoke (${remainingSeconds}s remaining, minimum ${minRemainingSeconds}s).`
    );
  } else if (remainingSeconds !== null && remainingSeconds > maxTokenLifetimeSeconds) {
    errors.push(
      `Bearer token remaining lifetime is too long (${remainingSeconds}s, maximum ${maxTokenLifetimeSeconds}s).`
    );
  }

  if (iat === null) {
    errors.push("Bearer token must contain a numeric iat claim.");
  } else if (tokenLifetimeSeconds !== null && tokenLifetimeSeconds > maxTokenLifetimeSeconds) {
    errors.push(
      `Bearer token minted lifetime is too long (${tokenLifetimeSeconds}s, maximum ${maxTokenLifetimeSeconds}s).`
    );
  }

  if (claims.role && claims.role !== "authenticated") {
    warnings.push(`Bearer token role is ${claims.role}; expected authenticated for SCRIMED tenant smoke.`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    claims,
    workspaceSlug: cleanWorkspaceSlug,
    remainingSeconds,
    tokenLifetimeSeconds,
    tokenFingerprint: tokenFingerprint(cleanToken)
  };
}

export function analyzeAal2BearerTokenFromEnv(env) {
  return analyzeAal2BearerToken({
    bearerToken: env.SCRIMED_BEARER_TOKEN,
    workspaceSlug: env.SCRIMED_WORKSPACE_SLUG,
    maxTokenLifetimeSeconds: positiveInteger(
      env.SCRIMED_AAL2_MAX_TOKEN_SECONDS,
      aal2SmokeTokenPolicy.maxTokenLifetimeSeconds
    ),
    minRemainingSeconds: positiveInteger(
      env.SCRIMED_AAL2_MIN_REMAINING_SECONDS,
      aal2SmokeTokenPolicy.minRemainingSeconds
    )
  });
}

function findToken(value) {
  if (!value || typeof value !== "object") {
    return "";
  }

  if (typeof value.access_token === "string") {
    return value.access_token;
  }

  for (const key of ["session", "currentSession", "current_session"]) {
    const nested = value[key];

    if (nested && typeof nested === "object" && typeof nested.access_token === "string") {
      return nested.access_token;
    }
  }

  for (const nested of Object.values(value)) {
    const token = findToken(nested);

    if (token) {
      return token;
    }
  }

  return "";
}

export function extractBearerTokenFromSessionJson(sessionJson) {
  const text = cleanText(sessionJson);

  if (!text) {
    return "";
  }

  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(text)) {
    return text;
  }

  try {
    return findToken(JSON.parse(text));
  } catch {
    return "";
  }
}

export function formatAal2TokenReport(
  result,
  { signatureVerification = aal2SignatureVerification.localPreflight } = {}
) {
  return [
    `workspace=${result.workspaceSlug || "missing"}`,
    `remaining=${result.remainingSeconds ?? "unknown"}s`,
    `minted_lifetime=${result.tokenLifetimeSeconds ?? "unknown"}s`,
    `token_fingerprint=${result.tokenFingerprint ?? "missing"}`,
    `signature=${signatureVerification}`
  ].join(" ");
}
