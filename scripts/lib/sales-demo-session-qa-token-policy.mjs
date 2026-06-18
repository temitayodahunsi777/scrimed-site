export const salesDemoSessionQaTokenPolicy = {
  requiredTokenEnv: "SCRIMED_SALES_QA_BEARER_TOKEN",
  requiredTargetEnv: "SCRIMED_SALES_QA_INTAKE_ID",
  requireSmokeEnv: "SCRIMED_REQUIRE_SALES_QA",
  maxTokenLifetimeSeconds: 3900,
  minRemainingSeconds: 60,
  requiredClaims: ["aal=aal2", "session_id", "exp", "iat"],
  signatureVerification:
    "Static preflight decodes JWT claims only; the protected SCRIMED API verifies the bearer with Supabase Auth before mutation."
};

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isSafeIntakeId(value) {
  return /^[A-Za-z0-9][A-Za-z0-9_-]{5,127}$/.test(value);
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

export function analyzeSalesDemoSessionQaToken({
  bearerToken,
  intakeId,
  maxTokenLifetimeSeconds = salesDemoSessionQaTokenPolicy.maxTokenLifetimeSeconds,
  minRemainingSeconds = salesDemoSessionQaTokenPolicy.minRemainingSeconds,
  nowMs = Date.now()
}) {
  const errors = [];
  const warnings = [];
  const cleanToken = cleanText(bearerToken);
  const cleanIntakeId = cleanText(intakeId);

  if (!cleanToken) {
    errors.push(`Missing ${salesDemoSessionQaTokenPolicy.requiredTokenEnv}.`);
  }

  if (!cleanIntakeId) {
    errors.push(`Missing ${salesDemoSessionQaTokenPolicy.requiredTargetEnv}.`);
  } else if (!isSafeIntakeId(cleanIntakeId)) {
    errors.push(
      `${salesDemoSessionQaTokenPolicy.requiredTargetEnv} must be an explicit alphanumeric, underscore, or hyphen target between 6 and 128 characters.`
    );
  }

  if (!cleanToken) {
    return {
      ok: false,
      errors,
      warnings,
      claims: null,
      intakeId: cleanIntakeId,
      remainingSeconds: null,
      tokenLifetimeSeconds: null
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
      intakeId: cleanIntakeId,
      remainingSeconds: null,
      tokenLifetimeSeconds: null
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
      `Bearer token expires too soon for CI smoke (${remainingSeconds}s remaining, minimum ${minRemainingSeconds}s).`
    );
  } else if (remainingSeconds !== null && remainingSeconds > maxTokenLifetimeSeconds) {
    errors.push(
      `Bearer token remaining lifetime is too long (${remainingSeconds}s, maximum ${maxTokenLifetimeSeconds}s).`
    );
  }

  if (iat === null) {
    errors.push("Bearer token must contain a numeric iat claim so minted lifetime can be checked.");
  } else if (tokenLifetimeSeconds !== null && tokenLifetimeSeconds > maxTokenLifetimeSeconds) {
    errors.push(
      `Bearer token minted lifetime is too long (${tokenLifetimeSeconds}s, maximum ${maxTokenLifetimeSeconds}s).`
    );
  }

  if (claims.role && claims.role !== "authenticated") {
    warnings.push(`Bearer token role is ${claims.role}; expected authenticated for tenant-admin smoke.`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    claims,
    intakeId: cleanIntakeId,
    remainingSeconds,
    tokenLifetimeSeconds
  };
}

export function analyzeSalesDemoSessionQaTokenFromEnv(env) {
  return analyzeSalesDemoSessionQaToken({
    bearerToken: env.SCRIMED_SALES_QA_BEARER_TOKEN,
    intakeId: env.SCRIMED_SALES_QA_INTAKE_ID,
    maxTokenLifetimeSeconds: positiveInteger(
      env.SCRIMED_SALES_QA_MAX_TOKEN_SECONDS,
      salesDemoSessionQaTokenPolicy.maxTokenLifetimeSeconds
    ),
    minRemainingSeconds: positiveInteger(
      env.SCRIMED_SALES_QA_MIN_REMAINING_SECONDS,
      salesDemoSessionQaTokenPolicy.minRemainingSeconds
    )
  });
}

export function formatSalesDemoSessionQaTokenReport(result) {
  const details = [
    `target=${result.intakeId || "missing"}`,
    `remaining=${result.remainingSeconds ?? "unknown"}s`,
    `minted_lifetime=${result.tokenLifetimeSeconds ?? "unknown"}s`,
    `signature=verified-by-protected-api`
  ];

  return details.join(" ");
}
