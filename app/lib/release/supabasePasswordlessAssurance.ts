import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";

export const supabasePasswordlessAssuranceVersion =
  "scrimed-supabase-passwordless-assurance-v1-2026-08-31";

export type LeakedPasswordProtectionEvidence =
  | "VERIFIED"
  | "UNAVAILABLE_CURRENT_PLAN"
  | "UNVERIFIED";

export type SupabasePasswordlessAssuranceEvidence = {
  projectAlias: string;
  evidenceDate: string;
  reviewBy: string;
  publicSignupEnabled: boolean;
  passwordlessOtpOrMagicLinkEnabled: boolean;
  shouldCreateUser: boolean;
  applicationPasswordAuthEnabled: boolean;
  productionUiPasswordCallCount: number;
  totpMfaEnabled: boolean;
  aal1MaximumSessionMinutes: number;
  protectedOperationsRequireAal2: boolean;
  passwordOnlyProtectedAccessProhibited: boolean;
  otpAndSignInRateLimitsConfigured: boolean;
  tenantMembershipRequired: boolean;
  roleAuthorizationRequired: boolean;
  serverSideAuthorizationRequired: boolean;
  leakedPasswordProtection: LeakedPasswordProtectionEvidence;
  planClass: "FREE" | "PRO_OR_HIGHER" | "UNVERIFIED";
  sourceReferences: string[];
};

export type SupabasePasswordlessAssuranceDecision = {
  policyVersion: string;
  semanticStatus: "DEFERRED_HARDENING_FOR_PASSWORD_AUTH" | "PASSWORD_CONTROL_VERIFIED";
  currentLaneState:
    | "COMPENSATING_CONTROL_ACTIVE"
    | "OPERATOR_ACTION_REQUIRED"
    | "BLOCKED_TECHNICAL";
  platformControlState: "DEFERRED_PLATFORM_CONTROL" | "PASS";
  protectedSyntheticPasswordlessAuth:
    | "ALLOW_PASSWORDLESS_SYNTHETIC_NO_PHI"
    | "DENY";
  protectedProductionAuth: "DENY";
  evidenceCurrent: boolean;
  compensatingControlsPassed: boolean;
  reasonCodes: string[];
  activationTriggers: string[];
  evidenceReferences: string[];
  passwordAuthWithoutVerifiedLeakProtectionDenied: boolean;
  productionAuthorityGranted: false;
  phiAuthorityGranted: false;
  decisionHash: string;
};

export const currentSupabasePasswordlessEvidence: SupabasePasswordlessAssuranceEvidence =
  Object.freeze({
    projectAlias: "scrimed-protected-pilot",
    evidenceDate: "2026-08-31",
    reviewBy: "2026-09-30",
    publicSignupEnabled: false,
    passwordlessOtpOrMagicLinkEnabled: true,
    shouldCreateUser: false,
    applicationPasswordAuthEnabled: false,
    productionUiPasswordCallCount: 0,
    totpMfaEnabled: true,
    aal1MaximumSessionMinutes: 15,
    protectedOperationsRequireAal2: true,
    passwordOnlyProtectedAccessProhibited: true,
    otpAndSignInRateLimitsConfigured: true,
    tenantMembershipRequired: true,
    roleAuthorizationRequired: true,
    serverSideAuthorizationRequired: true,
    leakedPasswordProtection: "UNAVAILABLE_CURRENT_PLAN",
    planClass: "FREE",
    sourceReferences: [
      "connected Supabase Auth configuration observation dated 2026-08-31",
      "Supabase Security Advisor auth_leaked_password_protection warning",
      "app/pilot-workspace/ProtectedPilotAccess.tsx",
      "app/sales-operations/SalesOperationsConsole.tsx",
      "app/lib/protectedPilotStore.ts",
      "docs/security/SUPABASE_FREE_PLAN_PASSWORDLESS_COMPENSATING_CONTROLS.md"
    ]
  });

function isEvidenceCurrent(evidence: SupabasePasswordlessAssuranceEvidence, now: Date) {
  const evidenceDate = Date.parse(`${evidence.evidenceDate}T00:00:00.000Z`);
  const reviewBy = Date.parse(`${evidence.reviewBy}T23:59:59.999Z`);
  const nowMs = now.getTime();
  return Number.isFinite(evidenceDate)
    && Number.isFinite(reviewBy)
    && Number.isFinite(nowMs)
    && evidenceDate <= nowMs
    && reviewBy >= nowMs
    && reviewBy >= evidenceDate;
}

export function evaluateSupabasePasswordlessAssurance(
  evidence: SupabasePasswordlessAssuranceEvidence,
  now: Date = new Date()
): SupabasePasswordlessAssuranceDecision {
  const reasonCodes: string[] = [];
  const evidenceCurrent = isEvidenceCurrent(evidence, now);
  if (!evidenceCurrent) reasonCodes.push("SUPABASE_AUTH_EVIDENCE_STALE_OR_INVALID");

  const controlChecks: Array<[boolean, string]> = [
    [!evidence.publicSignupEnabled, "PUBLIC_SIGNUP_MUST_REMAIN_DISABLED"],
    [evidence.passwordlessOtpOrMagicLinkEnabled, "PASSWORDLESS_ENTRY_REQUIRED"],
    [!evidence.shouldCreateUser, "OTP_USER_CREATION_MUST_REMAIN_DISABLED"],
    [evidence.productionUiPasswordCallCount === 0, "PRODUCTION_UI_PASSWORD_CALL_DETECTED"],
    [evidence.totpMfaEnabled, "TOTP_MFA_REQUIRED"],
    [evidence.aal1MaximumSessionMinutes <= 15, "AAL1_SESSION_LIMIT_EXCEEDED"],
    [evidence.protectedOperationsRequireAal2, "PROTECTED_AAL2_REQUIRED"],
    [evidence.passwordOnlyProtectedAccessProhibited, "PASSWORD_ONLY_PROTECTED_ACCESS_PROHIBITION_REQUIRED"],
    [evidence.otpAndSignInRateLimitsConfigured, "OTP_AND_SIGNIN_RATE_LIMITS_REQUIRED"],
    [evidence.tenantMembershipRequired, "TENANT_MEMBERSHIP_REQUIRED"],
    [evidence.roleAuthorizationRequired, "ROLE_AUTHORIZATION_REQUIRED"],
    [evidence.serverSideAuthorizationRequired, "SERVER_SIDE_AUTHORIZATION_REQUIRED"]
  ];
  for (const [passed, reasonCode] of controlChecks) {
    if (!passed) reasonCodes.push(reasonCode);
  }

  const passwordAuthWithoutVerifiedLeakProtectionDenied =
    evidence.applicationPasswordAuthEnabled
    && evidence.leakedPasswordProtection !== "VERIFIED";
  if (passwordAuthWithoutVerifiedLeakProtectionDenied) {
    reasonCodes.push("PASSWORD_AUTH_REQUIRES_VERIFIED_LEAKED_PASSWORD_PROTECTION");
  }

  const compensatingControlsPassed = controlChecks.every(([passed]) => passed);
  const currentLaneAllowed = evidenceCurrent
    && compensatingControlsPassed
    && !passwordAuthWithoutVerifiedLeakProtectionDenied
    && (!evidence.applicationPasswordAuthEnabled
      || evidence.leakedPasswordProtection === "VERIFIED");
  const currentLaneState: SupabasePasswordlessAssuranceDecision["currentLaneState"] = currentLaneAllowed
    ? "COMPENSATING_CONTROL_ACTIVE"
    : evidenceCurrent
      ? "BLOCKED_TECHNICAL"
      : "OPERATOR_ACTION_REQUIRED";
  const platformControlState: SupabasePasswordlessAssuranceDecision["platformControlState"] = evidence.leakedPasswordProtection === "VERIFIED"
    ? "PASS"
    : "DEFERRED_PLATFORM_CONTROL";
  const semanticStatus: SupabasePasswordlessAssuranceDecision["semanticStatus"] = evidence.leakedPasswordProtection === "VERIFIED"
    ? "PASSWORD_CONTROL_VERIFIED"
    : "DEFERRED_HARDENING_FOR_PASSWORD_AUTH";

  if (currentLaneAllowed && platformControlState === "DEFERRED_PLATFORM_CONTROL") {
    reasonCodes.push("PASSWORDLESS_SYNTHETIC_COMPENSATING_CONTROLS_ACTIVE");
    reasonCodes.push("LEAKED_PASSWORD_FEATURE_NOT_AVAILABLE_ON_CURRENT_PLAN");
  }

  const decisionBase: Omit<SupabasePasswordlessAssuranceDecision, "decisionHash"> = {
    policyVersion: supabasePasswordlessAssuranceVersion,
    semanticStatus,
    currentLaneState,
    platformControlState,
    protectedSyntheticPasswordlessAuth: currentLaneAllowed
      ? ("ALLOW_PASSWORDLESS_SYNTHETIC_NO_PHI" as const)
      : ("DENY" as const),
    protectedProductionAuth: "DENY" as const,
    evidenceCurrent,
    compensatingControlsPassed,
    reasonCodes: [...new Set(reasonCodes)].sort(),
    activationTriggers: [
      "application password authentication is introduced for a protected path",
      "the Supabase plan exposes leaked-password protection",
      "any compensating control changes or expires"
    ],
    evidenceReferences: evidence.sourceReferences,
    passwordAuthWithoutVerifiedLeakProtectionDenied,
    productionAuthorityGranted: false as const,
    phiAuthorityGranted: false as const
  };

  return {
    ...decisionBase,
    decisionHash: createClinicalEvidenceHash({
      type: "supabase-passwordless-assurance-decision",
      evidence,
      decision: decisionBase
    })
  };
}

export function getCurrentSupabasePasswordlessAssurance(now: Date = new Date()) {
  return evaluateSupabasePasswordlessAssurance(currentSupabasePasswordlessEvidence, now);
}
