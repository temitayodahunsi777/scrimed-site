export type IdentityAccessReadinessStatus =
  | "decision-required"
  | "ready-for-implementation";

export type IdentityAccessControlState =
  | "defined"
  | "decision-required";

export type IdentityAccessControl = {
  name: string;
  state: IdentityAccessControlState;
  owner: string;
  requirement: string;
  riskIfMissing: string;
};

export const identityAccessControls: IdentityAccessControl[] = [
  {
    name: "Production identity provider",
    state: "decision-required",
    owner: "Security architecture",
    requirement:
      "Select the production identity provider, login policy, MFA posture, account lifecycle, and enterprise SSO support for clinical and operational users.",
    riskIfMissing:
      "Governed workflow execution could accept requests without a trusted, enterprise-ready identity boundary."
  },
  {
    name: "Tenant and organization boundary",
    state: "decision-required",
    owner: "Platform architecture",
    requirement:
      "Define organization, tenant, workspace, facility, department, environment, and customer isolation rules before any executable workflow accepts requests.",
    riskIfMissing:
      "Clinical, payer, research, or government data could cross customer or regional boundaries."
  },
  {
    name: "Role and permission model",
    state: "decision-required",
    owner: "Security",
    requirement:
      "Approve least-privilege roles, permission scopes, reviewer authority, admin boundaries, and service-specific execution permissions.",
    riskIfMissing:
      "Users or services could initiate, approve, or view workflow actions outside their authorized scope."
  },
  {
    name: "Patient-context authorization",
    state: "decision-required",
    owner: "Clinical governance",
    requirement:
      "Define how patient context, care-team relationship, encounter scope, consent, and purpose-of-use are validated before clinical workflow execution.",
    riskIfMissing:
      "A technically authenticated user could still access or act on clinical context without a legitimate care or operational relationship."
  },
  {
    name: "Service-to-service authentication",
    state: "decision-required",
    owner: "Platform security",
    requirement:
      "Define service identities, signed requests, token audience checks, rotation cadence, and connector-to-workflow trust boundaries.",
    riskIfMissing:
      "Internal agents, connectors, or background services could impersonate trusted callers or bypass human-governed controls."
  },
  {
    name: "Session and token lifecycle",
    state: "decision-required",
    owner: "Security",
    requirement:
      "Approve session duration, refresh behavior, revocation, device trust, inactivity handling, and emergency account lockout.",
    riskIfMissing:
      "Compromised or stale sessions could continue to access sensitive workflow surfaces."
  },
  {
    name: "Consent and delegation",
    state: "decision-required",
    owner: "Privacy",
    requirement:
      "Define patient consent, caregiver delegation, staff delegation, proxy access, and opt-in rules for patient-facing or FaithCore-aligned surfaces.",
    riskIfMissing:
      "SCRIMED could expose guidance, reminders, or support surfaces to users without valid consent or delegation."
  },
  {
    name: "Break-glass access",
    state: "decision-required",
    owner: "Trust operations",
    requirement:
      "Define emergency access workflow, justification capture, elevated-session expiration, retrospective review, and alerting.",
    riskIfMissing:
      "Emergency access could become an unbounded privilege path instead of an auditable safety exception."
  },
  {
    name: "Audit linkage",
    state: "defined",
    owner: "Trust infrastructure",
    requirement:
      "Denied governed execution attempts already return metadata-only evidence headers that can link future identity decisions to workflow, guard, and body-handling state without capturing request bodies.",
    riskIfMissing:
      "Identity decisions would be disconnected from execution-denial evidence and Watchtower review."
  },
  {
    name: "Regional identity compliance",
    state: "decision-required",
    owner: "Global compliance",
    requirement:
      "Map identity, access review, session, audit, and data-residency expectations for the United States, UAE, Saudi Arabia, Kuwait, Nigeria, Kenya, Rwanda, Ghana, and Europe.",
    riskIfMissing:
      "Global deployments could violate customer, sovereign-cloud, workforce, or regional privacy expectations."
  }
];

export function getIdentityAccessReadinessSummary() {
  const defined = identityAccessControls.filter((control) => control.state === "defined").length;
  const decisionRequired = identityAccessControls.length - defined;

  return {
    service: "scrimed-identity-access-readiness",
    status:
      decisionRequired === 0 ? "ready-for-implementation" : "decision-required",
    controlCount: identityAccessControls.length,
    defined,
    decisionRequired,
    runtimeBoundary: "deny-by-default-governed-execution",
    activeReplacement:
      "Deny-by-default governed execution endpoints remain the active replacement until production identity provider, tenant isolation, role permissions, patient-context authorization, service authentication, consent, break-glass, audit linkage, and regional identity decisions are approved.",
    requiredBeforeExecution:
      "Governed execution must not accept authenticated execution requests until identity and access readiness is approved.",
    controls: identityAccessControls,
    updated: "2026-06-01"
  };
}
