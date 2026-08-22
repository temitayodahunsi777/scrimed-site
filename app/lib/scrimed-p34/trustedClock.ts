import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";

export type TrustedClockSource = "server-runtime" | "synthetic-test";

export interface TrustedClock {
  readonly source: TrustedClockSource;
  now(): Date;
}

export type TrustedTimeWindowDecision = {
  valid: boolean;
  evaluatedAt: string;
  source: TrustedClockSource;
  reasonCodes: string[];
  decisionHash: string;
};

const strictIsoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function parseStrictIso(value: string) {
  if (!strictIsoPattern.test(value)) return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value ? parsed : null;
}

export class SystemTrustedClock implements TrustedClock {
  readonly source = "server-runtime" as const;

  now() {
    return new Date();
  }
}

export class FixedTrustedClock implements TrustedClock {
  readonly source = "synthetic-test" as const;
  readonly #instant: Date;

  constructor(instant: string) {
    const parsed = parseStrictIso(instant);
    if (!parsed) throw new Error("Fixed trusted clock requires an exact UTC ISO timestamp");
    this.#instant = parsed;
  }

  now() {
    return new Date(this.#instant.getTime());
  }
}

export function evaluateTrustedTimeWindow(input: {
  issuedAt: string;
  expiresAt: string;
  maximumAgeMs?: number;
  maximumFutureSkewMs?: number;
}, clock: TrustedClock): TrustedTimeWindowDecision {
  const reasonCodes: string[] = [];
  const record = (input && typeof input === "object" ? input : {}) as Partial<typeof input>;
  if (record !== input) reasonCodes.push("TRUSTED_TIME_WINDOW_INPUT_INVALID");
  let now = new Date(0);
  try {
    const candidateNow = clock.now();
    if (candidateNow instanceof Date && Number.isFinite(candidateNow.getTime())) {
      now = candidateNow;
    } else {
      reasonCodes.push("TRUSTED_CLOCK_INVALID");
    }
  } catch {
    reasonCodes.push("TRUSTED_CLOCK_INVALID");
  }
  let suppliedSource: TrustedClockSource | undefined;
  try {
    suppliedSource = clock && typeof clock === "object" ? clock.source : undefined;
  } catch {
    reasonCodes.push("TRUSTED_CLOCK_SOURCE_INVALID");
  }
  const source = suppliedSource === "server-runtime" || suppliedSource === "synthetic-test"
    ? suppliedSource
    : "server-runtime";
  if (source !== suppliedSource) reasonCodes.push("TRUSTED_CLOCK_SOURCE_INVALID");
  const issuedAtValue = typeof record.issuedAt === "string" ? record.issuedAt : "";
  const expiresAtValue = typeof record.expiresAt === "string" ? record.expiresAt : "";
  const issuedAt = parseStrictIso(issuedAtValue);
  const expiresAt = parseStrictIso(expiresAtValue);
  const configuredFutureSkewMs = record.maximumFutureSkewMs ?? 60_000;
  const maximumFutureSkewMs = Number.isFinite(configuredFutureSkewMs) && configuredFutureSkewMs >= 0
    ? configuredFutureSkewMs
    : 0;
  const maximumAgeValid = record.maximumAgeMs === undefined ||
    (Number.isFinite(record.maximumAgeMs) && record.maximumAgeMs >= 0);

  if (!issuedAt) reasonCodes.push("ISSUED_AT_INVALID");
  if (!expiresAt) reasonCodes.push("EXPIRES_AT_INVALID");
  if (maximumFutureSkewMs !== configuredFutureSkewMs) reasonCodes.push("MAXIMUM_FUTURE_SKEW_INVALID");
  if (!maximumAgeValid) reasonCodes.push("MAXIMUM_AGE_INVALID");
  if (issuedAt && expiresAt && issuedAt.getTime() >= expiresAt.getTime()) {
    reasonCodes.push("TIME_WINDOW_INVALID");
  }
  if (issuedAt && issuedAt.getTime() > now.getTime() + maximumFutureSkewMs) {
    reasonCodes.push("ISSUED_AT_IN_FUTURE");
  }
  if (expiresAt && expiresAt.getTime() <= now.getTime()) reasonCodes.push("TIME_WINDOW_EXPIRED");
  if (
    issuedAt &&
    record.maximumAgeMs !== undefined &&
    maximumAgeValid &&
    now.getTime() - issuedAt.getTime() > record.maximumAgeMs
  ) {
    reasonCodes.push("ISSUED_AT_STALE");
  }

  const normalizedReasons = [...new Set(reasonCodes)].sort();
  const payload = {
    issuedAt: issuedAtValue,
    expiresAt: expiresAtValue,
    maximumAgeMs: record.maximumAgeMs ?? null,
    maximumFutureSkewMs: configuredFutureSkewMs,
    evaluatedAt: now.toISOString(),
    source,
    reasonCodes: normalizedReasons
  };
  return {
    valid: normalizedReasons.length === 0,
    evaluatedAt: payload.evaluatedAt,
    source,
    reasonCodes: normalizedReasons,
    decisionHash: createClinicalEvidenceHash({ type: "p34-trusted-time-window", payload })
  };
}
