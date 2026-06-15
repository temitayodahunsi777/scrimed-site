export type DeploymentProfileStatus =
  | "synthetic-fixture-ready"
  | "protected-pilot-ready"
  | "external-approval-required";

export type DeploymentMetric = {
  metric: string;
  target: string;
  evidence: string;
  boundary: string;
};

export type DeploymentProfile = {
  slug: string;
  name: string;
  status: DeploymentProfileStatus;
  buyer: string;
  environment: string;
  deploymentThesis: string;
  revenueUse: string;
  primaryRoute: string;
  proofRoutes: string[];
  costModel: string;
  latencyPosture: string;
  dataResidencyPosture: string;
  securityControls: string[];
  interoperabilityFit: string[];
  metrics: DeploymentMetric[];
  productionGates: string[];
  blockedClaims: string[];
};

export const deploymentProfileBoundary =
  "SCRIMED deployment profiles are synthetic pilot and enterprise evaluation readiness fixtures. They are not cloud certifications, HIPAA certifications, SOC 2 reports, sovereign-cloud approvals, medical-device authorizations, or production clinical execution approvals.";

export const deploymentProfiles: DeploymentProfile[] = [
  {
    slug: "managed-cloud",
    name: "Managed Cloud Pilot Profile",
    status: "protected-pilot-ready",
    buyer: "US providers, payers, and healthcare operators evaluating SCRIMED on managed cloud infrastructure.",
    environment: "Vercel application runtime with Supabase Auth/Postgres and Upstash rate limiting.",
    deploymentThesis:
      "Fastest commercial path for governed synthetic evaluations and protected enterprise pilots when buyers do not require on-prem or sovereign isolation.",
    revenueUse: "Default paid assessment, synthetic pilot, and protected pilot deployment profile.",
    primaryRoute: "/pilot-workspace",
    proofRoutes: ["/api/pilot-workspaces/readiness", "/api/product/console", "/api/strategic-intelligence"],
    costModel: "Platform license plus protected pilot fee, workflow modules, implementation services, and usage bands after validation.",
    latencyPosture: "Interactive workflow evaluation target; exact latency is measured per synthetic work order before production claims.",
    dataResidencyPosture: "US managed cloud posture for current protected-pilot workspace; regional expansion requires customer review.",
    securityControls: [
      "Supabase Auth",
      "Postgres row-level security",
      "AAL2-protected mutations",
      "Upstash-backed rate limiting",
      "append-only audit events",
      "synthetic-only intake boundary"
    ],
    interoperabilityFit: ["FHIR", "HL7 v2", "DICOMweb", "X12", "SMART on FHIR", "MCP"],
    metrics: [
      {
        metric: "Cost per synthetic work order",
        target: "Measured during pilot",
        evidence: "Agent Workspace work-order outcome metrics and proof packets.",
        boundary: "Directional pilot metric; not a guaranteed production price."
      },
      {
        metric: "Review latency",
        target: "Buyer-approved workflow target",
        evidence: "Work-order event timeline and reviewer checkpoints.",
        boundary: "Human review remains required for clinical-adjacent outputs."
      },
      {
        metric: "Evidence completeness",
        target: "Trust Card, source attribution, reviewer status, and blocked actions attached",
        evidence: "Pilot proof packet and TrustOS decision ledger.",
        boundary: "Evidence completeness is not clinical correctness certification."
      }
    ],
    productionGates: [
      "Customer security review",
      "Contract and data-processing terms",
      "BAA/DPA if PHI scope is proposed",
      "Workflow-specific human-review operating procedure",
      "Production connector approval"
    ],
    blockedClaims: ["HIPAA certified", "SOC 2 certified", "production clinical system", "autonomous diagnosis"]
  },
  {
    slug: "private-cloud",
    name: "Private Cloud Readiness Profile",
    status: "external-approval-required",
    buyer: "Health systems and payers requiring customer-controlled cloud tenancy or private network posture.",
    environment: "Customer cloud or private-cloud architecture review with SCRIMED runtime components mapped before deployment.",
    deploymentThesis:
      "Enterprise buyers can evaluate how AgentOS, Atlas, TrustOS, and protected workspaces would move into controlled infrastructure after a synthetic proof phase.",
    revenueUse: "Premium implementation and annual platform license expansion for larger enterprise accounts.",
    primaryRoute: "/strategic-intelligence",
    proofRoutes: ["/api/strategic-intelligence", "/api/agent-workspace", "/api/enterprise-readiness"],
    costModel: "Annual platform license plus private-cloud implementation, security review, connector scope, and support tier.",
    latencyPosture: "Latency must be benchmarked in customer environment with model-router and connector constraints.",
    dataResidencyPosture: "Customer-defined residency and backup posture; no cross-border assumption.",
    securityControls: [
      "customer identity boundary",
      "least-privilege service accounts",
      "tenant-isolated audit storage",
      "private networking review",
      "secrets-management review",
      "incident-response ownership matrix"
    ],
    interoperabilityFit: ["FHIR", "HL7 v2", "C-CDA", "DICOMweb", "X12", "LOINC", "SNOMED CT"],
    metrics: [
      {
        metric: "Deployment portability",
        target: "Architecture map approved before build",
        evidence: "Deployment profile packet and customer security checklist.",
        boundary: "Architecture readiness is not deployment approval."
      },
      {
        metric: "Connector readiness",
        target: "Synthetic fixture pass before live connector work",
        evidence: "Integration fixture validation and conformance evaluations.",
        boundary: "Synthetic conformance does not imply EHR vendor certification."
      }
    ],
    productionGates: [
      "Customer architecture review",
      "Security and privacy sign-off",
      "Secrets and key-management plan",
      "Operational monitoring plan",
      "Disaster recovery and backup review"
    ],
    blockedClaims: ["customer environment approved", "private cloud certified", "EHR production connected"]
  },
  {
    slug: "hospital-controlled",
    name: "Hospital-Controlled Runtime Profile",
    status: "external-approval-required",
    buyer: "Hospitals that require clinical-adjacent workflows to run inside hospital-controlled infrastructure.",
    environment: "Hospital-controlled runtime with local policy, identity, audit, and clinical-review ownership.",
    deploymentThesis:
      "SCRIMED can be positioned as an intelligence sidecar that respects the hospital record of truth and does not mutate clinical systems without approval.",
    revenueUse: "High-value enterprise operating license for multi-department workflow ownership.",
    primaryRoute: "/interoperability",
    proofRoutes: ["/api/interoperability/conformance", "/api/workflows/contracts", "/api/trust-os"],
    costModel: "Enterprise license plus department workflow modules, integration services, and clinical governance support.",
    latencyPosture: "Latency targets must be negotiated per workflow: documentation review, referral intake, RCM, or care-gap operations.",
    dataResidencyPosture: "Hospital-controlled data boundary; live PHI cannot leave approved environment.",
    securityControls: [
      "hospital identity integration plan",
      "role-based reviewer authority",
      "purpose-of-use controls",
      "audit-log retention",
      "clinical safety escalation",
      "no-writeback default"
    ],
    interoperabilityFit: ["FHIR R4/R5", "SMART on FHIR", "HL7 v2", "DICOMweb", "IHE", "CPT/HCPCS"],
    metrics: [
      {
        metric: "No-writeback assurance",
        target: "All synthetic workflows blocked from EHR mutation",
        evidence: "Denied execution audit and connector contracts.",
        boundary: "No-writeback proof is a pilot control, not vendor certification."
      },
      {
        metric: "Reviewer coverage",
        target: "Every clinical-adjacent recommendation has reviewer status",
        evidence: "TrustOS reviewer events and proof packets.",
        boundary: "Reviewer coverage does not make output medical advice."
      }
    ],
    productionGates: [
      "Clinical governance committee approval",
      "EHR integration approval",
      "Licensed reviewer workflow",
      "Patient safety review",
      "Incident response and rollback plan"
    ],
    blockedClaims: ["clinical decision support authorized", "EHR writeback enabled", "patient treatment automation"]
  },
  {
    slug: "sovereign-cloud",
    name: "Sovereign Cloud And Public Sector Profile",
    status: "external-approval-required",
    buyer: "Governments, ministries of health, national programs, and public-sector healthcare agencies.",
    environment: "Government or sovereign-cloud profile with jurisdiction-specific residency, procurement, and incident ownership.",
    deploymentThesis:
      "SCRIMED can support public-sector evaluation as a synthetic, jurisdiction-aware healthcare intelligence fabric before any live data movement.",
    revenueUse: "Strategic platform partnership and multi-year public-sector transformation program.",
    primaryRoute: "/governance-packs",
    proofRoutes: ["/api/agent-workspace/governance-packs", "/api/enterprise-readiness", "/api/strategic-intelligence"],
    costModel: "Multi-year strategic agreement with jurisdictional customization, regional support, and governance reporting.",
    latencyPosture: "Measured after sovereign runtime, model, and data-residency constraints are defined.",
    dataResidencyPosture: "Jurisdiction-defined; cross-border transfer denied until reviewed and approved.",
    securityControls: [
      "jurisdictional approval gate",
      "data residency register",
      "public-sector incident owner",
      "regional counsel review",
      "procurement route documentation",
      "sovereign retention policy"
    ],
    interoperabilityFit: ["FHIR", "HL7 v2", "DICOM", "X12 where applicable", "national terminology sets"],
    metrics: [
      {
        metric: "Sovereign readiness",
        target: "Jurisdiction, residency, retention, and incident owner mapped",
        evidence: "Public Sector Sovereign Retention Pack and deployment profile.",
        boundary: "Mapping is not government approval."
      },
      {
        metric: "Public-sector proof completeness",
        target: "Governance gates, blocked claims, and procurement route visible",
        evidence: "Activation governance and enterprise readiness packets.",
        boundary: "Proof packet is not legal or procurement authorization."
      }
    ],
    productionGates: [
      "Regional legal review",
      "Government procurement approval",
      "Data residency approval",
      "Security architecture review",
      "Public-sector incident response tabletop"
    ],
    blockedClaims: ["sovereign compliant", "government approved", "public health reporting authorized"]
  },
  {
    slug: "edge-on-prem",
    name: "Edge And On-Prem Evaluation Profile",
    status: "external-approval-required",
    buyer: "Hospitals, imaging groups, labs, and device-heavy environments evaluating edge or on-prem constraints.",
    environment: "Edge or on-prem runtime planning for imaging, device, lab, and facility-signal workflows using synthetic fixtures first.",
    deploymentThesis:
      "SCRIMED should be ready for medical-device and facility-adjacent intelligence without controlling devices, making diagnoses, or operating equipment.",
    revenueUse: "Premium device, imaging, lab, and facility integration module after synthetic proof.",
    primaryRoute: "/integrations",
    proofRoutes: ["/api/integration-fixtures", "/api/interoperability/standards", "/api/observability"],
    costModel: "Platform module plus device/integration implementation, support, monitoring, and safety review.",
    latencyPosture: "Near-real-time claims require device-specific benchmarking and safety review; current posture is synthetic evaluation only.",
    dataResidencyPosture: "Local-first where customer requires; external transfer denied until approved.",
    securityControls: [
      "no device command execution",
      "synthetic device fixture only",
      "network segmentation review",
      "device vendor source attribution",
      "edge monitoring plan",
      "facility safety exclusion"
    ],
    interoperabilityFit: ["DICOM", "DICOMweb", "HL7 v2 ORU", "FHIR Device", "IEEE 11073", "IHE"],
    metrics: [
      {
        metric: "Device fixture coverage",
        target: "Monitor, lab, DICOM, and facility scenarios mapped before live data",
        evidence: "Synthetic fixture contracts and integration validation.",
        boundary: "Fixture coverage does not authorize device control."
      },
      {
        metric: "Edge safety posture",
        target: "All device-control and diagnostic actions blocked",
        evidence: "Runtime safety readiness and denied execution audit.",
        boundary: "Safety posture is a development gate, not medical-device clearance."
      }
    ],
    productionGates: [
      "Medical-device regulatory review if applicable",
      "Hospital biomedical engineering approval",
      "Network and edge security review",
      "Vendor integration approval",
      "Human reviewer workflow"
    ],
    blockedClaims: ["device control", "diagnostic imaging interpretation", "medical-device cleared", "real-time clinical automation"]
  }
];

function countByStatus(status: DeploymentProfileStatus) {
  return deploymentProfiles.filter((profile) => profile.status === status).length;
}

export function getDeploymentProfileSummary() {
  return {
    service: "scrimed-deployment-profiles",
    status: "deployment-readiness-fixtures-ready",
    route: "/deployment-profiles",
    apiRoute: "/api/deployment-profiles",
    boundary: deploymentProfileBoundary,
    profileCount: deploymentProfiles.length,
    protectedPilotReady: countByStatus("protected-pilot-ready"),
    syntheticFixtureReady: countByStatus("synthetic-fixture-ready"),
    externalApprovalRequired: countByStatus("external-approval-required"),
    profiles: deploymentProfiles,
    proofPacketSection:
      "Deployment profiles are attached to protected pilot proof packets as readiness evidence and production gate context.",
    knownLimitationResolution: [
      "npm unavailable in the local shell is handled through direct Node entrypoints for lint, typecheck, integrity, and build.",
      "Local Turbopack is blocked by macOS SWC code-signature validation, so production verification uses Next's Webpack fallback while Vercel builds continue to report READY.",
      "GitHub authenticated smoke remains gated by the out-of-band SCRIMED_BEARER_TOKEN secret and cannot be safely resolved in source code."
    ],
    nextBuildStep:
      "Create synthetic device, imaging, and deployment-profile scenarios, then connect selected profile IDs to buyer intake and protected workspace activation metadata.",
    updated: "2026-06-15"
  };
}

export function deploymentMetricLines(profile: DeploymentProfile) {
  return profile.metrics
    .map(
      (metric) =>
        `- ${metric.metric}: ${metric.target}. Evidence: ${metric.evidence} Boundary: ${metric.boundary}`
    )
    .join("\n");
}

export function buildDeploymentProfilesBrief() {
  const summary = getDeploymentProfileSummary();

  return [
    "# SCRIMED Deployment Profiles Brief",
    "",
    `Status: ${summary.status}`,
    `Boundary: ${summary.boundary}`,
    "",
    "## Profiles",
    ...summary.profiles.flatMap((profile) => [
      `- ${profile.name} (${profile.status}): ${profile.deploymentThesis}`,
      `  Revenue use: ${profile.revenueUse}`,
      `  Production gates: ${profile.productionGates.join(", ")}`
    ]),
    "",
    "## Known Limitation Resolution",
    ...summary.knownLimitationResolution.map((item) => `- ${item}`),
    "",
    "## Next Build Step",
    summary.nextBuildStep
  ].join("\n");
}
