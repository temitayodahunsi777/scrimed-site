export type ClientOnboardingStageStatus =
  | "ready"
  | "human-review-required"
  | "buyer-input-required"
  | "external-review-required"
  | "blocked-before-approval";

export type ClientCommunicationChannel =
  | "email"
  | "calendar-invite"
  | "meeting-agenda"
  | "demo-script"
  | "presentation"
  | "handoff-note";

export type ClientOnboardingStage = {
  slug: string;
  name: string;
  status: ClientOnboardingStageStatus;
  buyerMoment: string;
  owner: string;
  objective: string;
  requiredInputs: string[];
  buyerOutputs: string[];
  internalOutputs: string[];
  proofRoutes: string[];
  hardStops: string[];
};

export type ClientCommunicationTemplate = {
  slug: string;
  name: string;
  channel: ClientCommunicationChannel;
  trigger: string;
  audience: string;
  subject: string;
  template: string;
  personalizationFields: string[];
  approvalGates: string[];
  blockedContent: string[];
};

export type ClientCalendarPacket = {
  slug: string;
  title: string;
  durationMinutes: number;
  meetingType: "discovery" | "demo" | "pilot-workshop" | "security-review" | "kickoff" | "renewal-review";
  calendarDescription: string;
  attendeeRules: string[];
  schedulingRules: string[];
  followUpSla: string;
  boundary: string;
};

export type ClientMeetingCadence = {
  slug: string;
  name: string;
  cadence: string;
  owner: string;
  attendees: string[];
  agenda: string[];
  inputs: string[];
  outputs: string[];
  schedulingRules: string[];
  boundary: string;
};

export type ClientPresentationPacket = {
  slug: string;
  name: string;
  audience: string;
  route: string;
  sections: string[];
  talkTrack: string[];
  proofRoutes: string[];
  blockedClaims: string[];
  approvalGate: string;
};

export type ClientOnboardingControl = {
  slug: string;
  control: string;
  status: ClientOnboardingStageStatus;
  owner: string;
  purpose: string;
  requiredEvidence: string[];
  hardStops: string[];
};

export type ClientOnboardingHandoff = {
  slug: string;
  from: string;
  to: string;
  trigger: string;
  requiredArtifacts: string[];
  nextAction: string;
  proofRoutes: string[];
  hardStops: string[];
};

export const clientOnboardingCommunicationsRoute = "/client-onboarding";
export const clientOnboardingCommunicationsApiRoute = "/api/client-onboarding";
export const clientOnboardingCommunicationsBriefRoute = "/api/client-onboarding/brief";
export const clientOnboardingCommunicationsStatus =
  "client-onboarding-communications-control-plane-active";
export const clientOnboardingCommunicationsBriefStatus =
  "client-onboarding-communications-brief-ready-no-sent-communication";
export const clientOnboardingCommunicationsUpdatedAt = "2026-06-26";

export const clientOnboardingCommunicationsBoundary =
  "SCRIMED Client Onboarding and Communications organizes buyer onboarding, demos, pilots, presentations, meeting cadences, email-ready copy, calendar-ready agendas, internal handoffs, and follow-up discipline for business-contact and workflow metadata only. It drafts and routes communications; it does not send email, create calendar invites, bind contracts, approve procurement, store PHI, process live clinical records, create customer permission, provide legal/accounting/tax advice, certify compliance, approve security posture, guarantee revenue, approve production connectors, or authorize live clinical care.";

export const clientOnboardingBlockedClaims = [
  "email sent automatically",
  "calendar invite created automatically",
  "customer approved",
  "contract approved",
  "procurement approved",
  "BAA approved",
  "security review passed",
  "HIPAA certified",
  "SOC 2 certified",
  "HITRUST certified",
  "FDA cleared",
  "ONC certified",
  "PHI processing approved",
  "live data approved",
  "production connector approved",
  "EHR writeback approved",
  "clinical use authorized",
  "revenue guaranteed",
  "ROI guaranteed"
];

export const clientOnboardingStages: ClientOnboardingStage[] = [
  {
    slug: "inquiry-qualification",
    name: "Inquiry Qualification",
    status: "ready",
    buyerMoment: "A buyer, partner, advisor, or internal sponsor asks what SCRIMED can do.",
    owner: "Founder + Revenue Operations",
    objective: "Classify buyer fit, urgency, workflow target, sponsor, no-PHI boundary, and best next meeting.",
    requiredInputs: ["Business contact", "Organization type", "Workflow pain", "Sponsor role", "No-PHI acknowledgement"],
    buyerOutputs: ["Fit response", "Discovery scheduling options", "Safe proof route"],
    internalOutputs: ["Qualified lead note", "Selected onboarding path", "Initial disqualifier check"],
    proofRoutes: ["/offerings", "/pricing", "/pilot", "/boundary-resolution"],
    hardStops: ["PHI in intake", "production credential shared", "legal or clinical approval requested"]
  },
  {
    slug: "discovery-scheduling",
    name: "Discovery Scheduling",
    status: "human-review-required",
    buyerMoment: "A qualified contact needs a meeting that is easy to accept and safe to route.",
    owner: "Revenue Operations",
    objective: "Send a concise agenda, required attendees, no-PHI rule, and outcome definition before the call.",
    requiredInputs: ["Buyer role", "Preferred times", "Target workflow", "Attendee list", "Communication consent"],
    buyerOutputs: ["Calendar-ready description", "Discovery agenda", "Pre-call no-PHI note"],
    internalOutputs: ["Meeting owner", "CRM-safe record", "Follow-up SLA timer"],
    proofRoutes: [clientOnboardingCommunicationsRoute, "/sales-operations", "/growth-engine"],
    hardStops: ["calendar invite without human approval", "PHI or credentials in event body", "unsupported promise in agenda"]
  },
  {
    slug: "demo-preparation",
    name: "Demo Preparation",
    status: "ready",
    buyerMoment: "A buyer needs a tailored demonstration matched to their use case and proof needs.",
    owner: "Sales Engineering + Product Console",
    objective: "Pair the buyer problem with the correct demo, proof route, talk track, and claim guard.",
    requiredInputs: ["Selected offer", "Buyer priority", "Demo route", "Success question", "Known objections"],
    buyerOutputs: ["Demo confirmation", "Run-of-show", "Proof route list"],
    internalOutputs: ["Demo script", "Blocked-claim checklist", "Follow-up packet plan"],
    proofRoutes: ["/demos", "/pilot-deal-room", "/qa-claim-guard", "/offerings"],
    hardStops: ["live patient data requested", "custom claim without evidence", "customer reference implied without permission"]
  },
  {
    slug: "demo-follow-up",
    name: "Demo Follow-Up",
    status: "human-review-required",
    buyerMoment: "The buyer has seen the product and needs a clear next decision path.",
    owner: "Revenue Operations + Buyer Diligence",
    objective: "Deliver recap, decision criteria, next-step options, proof routes, and unanswered-question owners within one business day.",
    requiredInputs: ["Attendee questions", "Selected next action", "Proof gaps", "Decision owner", "Follow-up owner"],
    buyerOutputs: ["Recap email", "Proof route links", "Next-step recommendation"],
    internalOutputs: ["Opportunity update", "Objection log", "Pilot or diligence handoff"],
    proofRoutes: ["/pilot-deal-room", "/sales-operations", "/offerings"],
    hardStops: ["ROI guarantee", "clinical approval implied", "unpriced custom work promised"]
  },
  {
    slug: "pilot-scoping",
    name: "Pilot Scoping",
    status: "buyer-input-required",
    buyerMoment: "A buying committee wants a governed pilot with scope, criteria, and owners.",
    owner: "Deal Desk + Product + TrustOS",
    objective: "Convert interest into scoped pilot package, decision criteria, success metrics, data boundary, and review path.",
    requiredInputs: ["Sponsor", "Workflows", "Success metrics", "Review team", "Procurement path", "Data boundary"],
    buyerOutputs: ["Pilot scoping note", "Workshop agenda", "Decision criteria"],
    internalOutputs: ["Pilot package", "Price floor", "Diligence path", "Required approvals"],
    proofRoutes: ["/pilots", "/pilot", "/enterprise-business-ops", "/global-certification-readiness"],
    hardStops: ["PHI in pilot scope", "production connector dependency", "SOW or price commitment without review"]
  },
  {
    slug: "security-procurement-review",
    name: "Security and Procurement Review",
    status: "external-review-required",
    buyerMoment: "Security, privacy, legal, procurement, or finance reviewers need diligence material.",
    owner: "TrustOps + Legal Ops + Finance",
    objective: "Route no-PHI diligence packets, blocked claims, security review needs, legal/finance owners, and remaining gates.",
    requiredInputs: ["Reviewer roles", "Questionnaire class", "Procurement process", "Security expectations", "Contract path"],
    buyerOutputs: ["Diligence packet outline", "Reviewer agenda", "Open-gate register"],
    internalOutputs: ["External-review queue", "Counsel/accounting/tax routing", "Security evidence request"],
    proofRoutes: ["/enterprise-business-ops", "/approvals-readiness", "/global-certification-readiness", "/boundary-resolution"],
    hardStops: ["certification claim without proof", "contract language approved informally", "security review represented as passed"]
  },
  {
    slug: "kickoff-onboarding",
    name: "Kickoff and Onboarding",
    status: "human-review-required",
    buyerMoment: "A scoped assessment or pilot needs a structured start with owners, cadence, and evidence rules.",
    owner: "Customer Operations + Product + TrustOS",
    objective: "Start delivery with no-PHI rules, owners, evidence cadence, escalation path, and meeting rhythm.",
    requiredInputs: ["Signed or approved scope", "Named owners", "Cadence", "Proof routes", "Escalation owners"],
    buyerOutputs: ["Kickoff invite", "Onboarding checklist", "Evidence cadence"],
    internalOutputs: ["Delivery workspace", "Owner matrix", "First-week action plan"],
    proofRoutes: ["/pilot-workspace/access", "/continuous-review-audit", "/service-reliability", "/operational-efficiency"],
    hardStops: ["scope not approved", "PHI requested before BAA/security gate", "customer invitation before tenant/access approval"]
  },
  {
    slug: "review-renewal-expansion",
    name: "Review, Renewal, and Expansion",
    status: "external-review-required",
    buyerMoment: "A pilot, assessment, or retainer needs a progress review, renewal, or expansion conversation.",
    owner: "Customer Operations + Revenue Operations + Finance",
    objective: "Summarize outcomes, open gates, next-package recommendation, renewal health, and expansion constraints.",
    requiredInputs: ["Approved evidence", "Open gates", "Buyer feedback", "Usage assumptions", "Commercial next step"],
    buyerOutputs: ["Review agenda", "Renewal or expansion packet", "Open-gate summary"],
    internalOutputs: ["Renewal health note", "Expansion scope", "Finance and claim review queue"],
    proofRoutes: ["/continuous-review-audit", "/enterprise-business-ops", "/public-market-readiness", "/qa-buyer-proof-release"],
    hardStops: ["customer value claim without permission", "revenue or ROI guarantee", "production expansion without approvals"]
  }
];

export const clientCommunicationTemplates: ClientCommunicationTemplate[] = [
  {
    slug: "qualified-inquiry-response",
    name: "Qualified Inquiry Response",
    channel: "email",
    trigger: "New buyer, partner, advisor, or internal sponsor passes initial no-PHI fit check.",
    audience: "Prospective buyer or partner sponsor",
    subject: "SCRIMED next step: discovery for {workflow_or_priority}",
    template:
      "Hi {first_name}, thanks for reaching out. Based on your note about {workflow_or_priority}, the safest next step is a no-PHI discovery call focused on current workflow friction, review owners, and the right SCRIMED proof route. We will not ask for patient data, credentials, production access, or sensitive records in this call. If useful, I can send a 30-minute calendar hold with the agenda below.",
    personalizationFields: ["first_name", "workflow_or_priority", "organization", "preferred_times"],
    approvalGates: ["Human send approval", "No PHI in thread", "No unsupported claims", "CRM-safe source captured"],
    blockedContent: ["patient identifiers", "production credentials", "certification claims", "guaranteed ROI"]
  },
  {
    slug: "discovery-calendar-description",
    name: "Discovery Calendar Description",
    channel: "calendar-invite",
    trigger: "Qualified inquiry is approved for discovery scheduling.",
    audience: "Buyer sponsor, workflow owner, and SCRIMED revenue owner",
    subject: "SCRIMED discovery: {workflow_or_priority}",
    template:
      "Agenda: 1. Confirm workflow priority and buyer goals. 2. Identify review owners and decision criteria. 3. Match the need to demos, offerings, or pilot paths. 4. Confirm no-PHI boundaries and next steps. Please do not include PHI, patient identifiers, production credentials, live clinical records, contract secrets, or security-sensitive artifacts in this invitation or call.",
    personalizationFields: ["workflow_or_priority", "attendees", "meeting_owner", "conference_link"],
    approvalGates: ["Calendar owner approval", "No PHI or credentials", "Attendee list approved"],
    blockedContent: ["PHI", "patient identifiers", "credentials", "signed contracts", "security secrets"]
  },
  {
    slug: "demo-confirmation",
    name: "Demo Confirmation Email",
    channel: "email",
    trigger: "Discovery identifies the right SCRIMED demonstration route.",
    audience: "Demo attendees and buyer sponsor",
    subject: "SCRIMED demo confirmation: {demo_name}",
    template:
      "Hi {first_name}, confirming our SCRIMED demo for {demo_name}. We will use synthetic examples only and focus on how the workflow, evidence, controls, and retained approval boundaries work. The goal is to decide whether a scoped assessment, pilot workshop, diligence packet, or no-go decision is the right next step.",
    personalizationFields: ["first_name", "demo_name", "demo_route", "decision_question"],
    approvalGates: ["Demo owner approval", "Claims guard reviewed", "No customer reference without permission"],
    blockedContent: ["live patient data", "customer claim without permission", "clinical validation claim"]
  },
  {
    slug: "demo-run-of-show",
    name: "Demo Run Of Show",
    channel: "demo-script",
    trigger: "Demo is scheduled and proof routes are selected.",
    audience: "SCRIMED demo operator and sales engineering",
    subject: "Internal demo run of show: {demo_name}",
    template:
      "Open with buyer problem, no-PHI boundary, and expected decision. Show the selected demo route, proof routes, and evidence controls. Pause for buyer questions, classify each as product, security, clinical, legal, finance, data, or procurement. Close with one recommended next step and blocked claims that remain unavailable.",
    personalizationFields: ["demo_name", "buyer_problem", "proof_routes", "next_step"],
    approvalGates: ["Operator runbook reviewed", "Blocked claims checked", "Follow-up owner assigned"],
    blockedContent: ["diagnosis", "treatment recommendation", "reimbursement guarantee", "security certification claim"]
  },
  {
    slug: "demo-follow-up",
    name: "Demo Follow-Up Email",
    channel: "email",
    trigger: "Demo ends and buyer questions are captured.",
    audience: "Buyer sponsor and attendees",
    subject: "SCRIMED recap and recommended next step",
    template:
      "Thank you for the time today. The main workflow themes were {themes}. The best next step appears to be {recommended_next_step}, with these proof routes: {proof_routes}. Open items: {open_items}. We are keeping this in no-PHI, synthetic-evaluation mode until any privacy, security, legal, clinical, or production approvals are formally reviewed.",
    personalizationFields: ["themes", "recommended_next_step", "proof_routes", "open_items"],
    approvalGates: ["Human send approval", "Open items assigned", "No unsupported ROI/customer claims"],
    blockedContent: ["guaranteed savings", "approved clinical use", "security review passed", "contract approved"]
  },
  {
    slug: "pilot-workshop-invite",
    name: "Pilot Workshop Invite",
    channel: "calendar-invite",
    trigger: "Buyer wants to scope a paid synthetic pilot or readiness sprint.",
    audience: "Buyer sponsor, workflow owner, security/privacy reviewer, finance/procurement contact, SCRIMED owner",
    subject: "SCRIMED pilot scoping workshop: {workflow_or_priority}",
    template:
      "Agenda: 1. Confirm pilot objective and decision criteria. 2. Identify workflows, excluded data, and no-PHI requirements. 3. Review proof routes, cadence, and reviewer roles. 4. Confirm commercial, legal, security, and procurement gates. Outcome: scoped next-step recommendation, open-gate register, and owner map.",
    personalizationFields: ["workflow_or_priority", "attendees", "decision_criteria", "review_owners"],
    approvalGates: ["Workshop owner approval", "Reviewer roles identified", "No production access request"],
    blockedContent: ["PHI", "production endpoint", "unreviewed SOW", "price commitment without deal desk"]
  },
  {
    slug: "security-procurement-note",
    name: "Security And Procurement Packet Note",
    channel: "handoff-note",
    trigger: "Security, privacy, legal, finance, or procurement diligence enters the buyer path.",
    audience: "Buyer diligence reviewers and SCRIMED legal/finance/security owners",
    subject: "SCRIMED diligence packet and open gates",
    template:
      "Attached is the SCRIMED diligence path for {buyer_context}. This material summarizes readiness evidence, proof routes, open approvals, and blocked claims. It does not certify compliance, approve security posture, authorize PHI processing, approve a BAA, or bind contract terms. Please route reviewer-specific questions to the assigned owner list.",
    personalizationFields: ["buyer_context", "assigned_owners", "open_gates", "proof_routes"],
    approvalGates: ["Qualified owner review", "No certification claim", "Contract authority separated"],
    blockedContent: ["BAA approved", "SOC 2 certified", "HIPAA certified", "contract accepted"]
  },
  {
    slug: "kickoff-invite",
    name: "Kickoff Invite And Agenda",
    channel: "calendar-invite",
    trigger: "Scope is approved for assessment, sprint, pilot, or retained review.",
    audience: "Buyer sponsor, implementation owner, review owners, SCRIMED delivery team",
    subject: "SCRIMED kickoff: {engagement_name}",
    template:
      "Agenda: 1. Confirm approved scope, owners, and no-PHI rules. 2. Review delivery cadence and proof routes. 3. Assign first-week actions and escalation owners. 4. Confirm evidence, follow-up, and change-control process. Please do not place PHI, credentials, production records, or confidential contract artifacts in the event body.",
    personalizationFields: ["engagement_name", "owners", "cadence", "first_week_actions"],
    approvalGates: ["Scope approval retained", "Access or tenant gate approved if needed", "No PHI in event"],
    blockedContent: ["PHI", "production credentials", "contract secrets", "access before approval"]
  },
  {
    slug: "renewal-expansion-review",
    name: "Renewal And Expansion Review",
    channel: "presentation",
    trigger: "Pilot, assessment, or retainer reaches review, renewal, or expansion point.",
    audience: "Executive sponsor, buyer team, SCRIMED revenue and delivery owners",
    subject: "SCRIMED review: outcomes, open gates, and next package",
    template:
      "Frame the review around approved evidence, open gates, unresolved risks, next package options, and retained approval boundaries. Avoid customer-value, ROI, clinical, security, or compliance claims unless exact language has approval and retained evidence.",
    personalizationFields: ["outcomes", "open_gates", "next_package", "approval_status"],
    approvalGates: ["Evidence reviewed", "Customer permission checked", "Finance/legal claims reviewed"],
    blockedContent: ["customer public claim", "ROI guarantee", "clinical validation claim", "compliance certified"]
  }
];

export const clientCalendarPackets: ClientCalendarPacket[] = [
  {
    slug: "discovery-call",
    title: "SCRIMED Discovery Call",
    durationMinutes: 30,
    meetingType: "discovery",
    calendarDescription:
      "Confirm workflow priority, review owners, no-PHI rule, and best SCRIMED next step. Do not include PHI, patient identifiers, credentials, or production records.",
    attendeeRules: ["Buyer sponsor", "Workflow owner when available", "SCRIMED revenue owner"],
    schedulingRules: ["Offer two to three time windows", "Include no-PHI notice", "Assign follow-up owner before send"],
    followUpSla: "Send recap and recommended next step within one business day.",
    boundary: "Discovery does not approve pilot scope, procurement, PHI, or clinical use."
  },
  {
    slug: "tailored-demo",
    title: "SCRIMED Tailored Demo",
    durationMinutes: 45,
    meetingType: "demo",
    calendarDescription:
      "Review the selected synthetic demo, proof routes, decision criteria, and retained approval boundaries.",
    attendeeRules: ["Buyer sponsor", "Workflow owner", "Optional security/privacy reviewer", "SCRIMED demo operator"],
    schedulingRules: ["Attach demo route", "Block unsupported customer claims", "Confirm synthetic-only setup"],
    followUpSla: "Send demo recap, open questions, and recommended next action within one business day.",
    boundary: "Demo uses synthetic examples only and does not authorize live data or production workflow execution."
  },
  {
    slug: "pilot-scoping-workshop",
    title: "SCRIMED Pilot Scoping Workshop",
    durationMinutes: 60,
    meetingType: "pilot-workshop",
    calendarDescription:
      "Define pilot objective, success metrics, workflow scope, review owners, commercial path, and open approval gates.",
    attendeeRules: ["Executive sponsor", "Workflow owner", "Security/privacy contact", "Procurement or finance contact", "SCRIMED deal owner"],
    schedulingRules: ["Confirm buyer decision criteria", "Reject PHI and production endpoint details", "Route custom work to deal desk"],
    followUpSla: "Deliver scoping note and owner map within two business days.",
    boundary: "Workshop does not create signed scope, price commitment, production access, or customer approval."
  },
  {
    slug: "security-procurement-review",
    title: "SCRIMED Security And Procurement Review",
    durationMinutes: 45,
    meetingType: "security-review",
    calendarDescription:
      "Review diligence evidence, open security/privacy/legal/procurement gates, blocked claims, and owner assignments.",
    attendeeRules: ["Buyer security/privacy reviewer", "Buyer procurement or legal contact", "SCRIMED security/legal/finance owner"],
    schedulingRules: ["Use no-PHI diligence material", "Separate contract authority", "Keep certification claims behind proof"],
    followUpSla: "Return open-gate register and owner list within two business days.",
    boundary: "Review does not certify security, approve BAA, approve contract terms, or authorize PHI."
  },
  {
    slug: "pilot-kickoff",
    title: "SCRIMED Pilot Kickoff",
    durationMinutes: 60,
    meetingType: "kickoff",
    calendarDescription:
      "Confirm approved scope, owners, cadence, no-PHI rules, proof routes, escalation path, and first-week actions.",
    attendeeRules: ["Buyer sponsor", "Implementation owner", "Review owners", "SCRIMED delivery and trust owners"],
    schedulingRules: ["Require approved scope", "Confirm evidence cadence", "Keep sensitive artifacts out of invite body"],
    followUpSla: "Publish owner matrix and first-week actions within one business day.",
    boundary: "Kickoff does not bypass access, tenant, BAA, security, connector, or clinical approval gates."
  },
  {
    slug: "renewal-expansion-review",
    title: "SCRIMED Renewal And Expansion Review",
    durationMinutes: 45,
    meetingType: "renewal-review",
    calendarDescription:
      "Review approved evidence, open gates, outcomes, renewal health, expansion options, and retained boundaries.",
    attendeeRules: ["Executive sponsor", "Buyer workflow owner", "SCRIMED revenue owner", "Finance or delivery owner when needed"],
    schedulingRules: ["Use approved evidence only", "Do not include customer value claims without permission", "Route expansion through deal desk"],
    followUpSla: "Send review packet and next-package recommendation within three business days.",
    boundary: "Review does not guarantee ROI, reimbursement, revenue, production approval, or customer public permission."
  }
];

export const clientMeetingCadences: ClientMeetingCadence[] = [
  {
    slug: "lead-response-triage",
    name: "Lead Response Triage",
    cadence: "Daily business-day review with same-day response target for qualified inbound interest.",
    owner: "Revenue Operations",
    attendees: ["Founder or revenue owner", "Product Console owner when technical fit is unclear"],
    agenda: ["Classify source and buyer role", "Check no-PHI boundary", "Assign next communication", "Log follow-up SLA"],
    inputs: ["Inbound note", "Source attribution", "Buyer organization", "Workflow topic"],
    outputs: ["Qualified, nurture, partner, or no-fit label", "Approved response template", "Owner assignment"],
    schedulingRules: ["Do not request PHI", "Do not promise a demo before fit is checked", "Use CRM-safe notes only"],
    boundary: "Triage is not customer acceptance, clinical advice, legal advice, or contract approval."
  },
  {
    slug: "demo-office-hours",
    name: "Demo Office Hours",
    cadence: "Twice weekly pooled demo blocks for qualified prospects.",
    owner: "Sales Engineering",
    attendees: ["Demo operator", "Revenue owner", "Product owner as needed"],
    agenda: ["Confirm demo fit", "Review script", "Check claims guard", "Capture buyer questions"],
    inputs: ["Buyer profile", "Selected demo", "Proof routes", "Blocked claims"],
    outputs: ["Demo-ready runbook", "Follow-up owner", "Pilot or diligence recommendation"],
    schedulingRules: ["Use synthetic demos only", "Avoid customer-specific claims", "Keep unsupported requests in open items"],
    boundary: "Demo office hours do not create production approval or customer reference permission."
  },
  {
    slug: "pilot-scope-board",
    name: "Pilot Scope Board",
    cadence: "Weekly review of active pilot scoping opportunities.",
    owner: "Deal Desk + Product",
    attendees: ["Revenue owner", "Product owner", "TrustOS owner", "Finance or legal reviewer when needed"],
    agenda: ["Review scope", "Check data boundary", "Confirm price floor", "Assign open approvals"],
    inputs: ["Pilot workshop notes", "Buyer decision criteria", "Workflow count", "Open gates"],
    outputs: ["Pilot package", "Diligence path", "Approval owner map", "Next action"],
    schedulingRules: ["No unpriced implementation work", "No PHI-dependent pilot scope", "Separate custom proof packets from standard work"],
    boundary: "Pilot scope board does not approve contract terms, PHI, security posture, or production connectors."
  },
  {
    slug: "security-procurement-queue",
    name: "Security And Procurement Queue",
    cadence: "Weekly or deal-triggered review when diligence questions arrive.",
    owner: "TrustOps + Legal Ops + Finance",
    attendees: ["Security owner", "Legal owner", "Finance owner", "Revenue owner"],
    agenda: ["Classify diligence request", "Attach existing proof routes", "Assign qualified reviewer", "Block unsupported claims"],
    inputs: ["Questionnaire", "Reviewer role", "Contract path", "Open claims"],
    outputs: ["Reviewer packet", "Open-gate register", "Owner list", "Blocked claim note"],
    schedulingRules: ["Do not self-certify", "Do not approve contract terms in operational notes", "Do not store sensitive artifacts"],
    boundary: "Queue prepares evidence only; qualified reviewers retain authority."
  },
  {
    slug: "pilot-steering",
    name: "Pilot Steering Cadence",
    cadence: "Weekly during active pilot or readiness sprint; biweekly for retainer review.",
    owner: "Customer Operations + TrustOS",
    attendees: ["Buyer sponsor", "Workflow owner", "SCRIMED delivery owner", "TrustOS or QA owner"],
    agenda: ["Review progress", "Inspect open gates", "Confirm evidence cadence", "Assign next actions"],
    inputs: ["Approved scope", "Evidence route", "Open blockers", "Buyer feedback"],
    outputs: ["Action register", "Risk update", "Next proof packet", "Renewal or expansion signal"],
    schedulingRules: ["Keep PHI out of notes", "Route scope changes to deal desk", "Do not expand claims without proof"],
    boundary: "Steering cadence does not authorize clinical use, public claims, or production expansion."
  }
];

export const clientPresentationPackets: ClientPresentationPacket[] = [
  {
    slug: "executive-buyer-overview",
    name: "Executive Buyer Overview",
    audience: "C-suite, transformation, operations, clinical informatics, and board-adjacent buyer sponsors",
    route: "/product",
    sections: ["Buyer problem", "SCRIMED operating model", "Offer path", "Proof routes", "Retained boundaries", "Recommended next step"],
    talkTrack: [
      "Start with workflow friction and governance risk, not AI novelty.",
      "Show the route from assessment to synthetic pilot to protected diligence.",
      "End with one next decision and the no-PHI boundary."
    ],
    proofRoutes: ["/product", "/offerings", "/pilot-deal-room", "/boundary-resolution"],
    blockedClaims: ["clinical validation", "customer value proof without permission", "security certification"],
    approvalGate: "Claims governance review before buyer-specific sharing."
  },
  {
    slug: "demo-operator-deck",
    name: "Demo Operator Deck",
    audience: "Sales engineering, buyer workflow owners, and product reviewers",
    route: "/demos",
    sections: ["No-PHI boundary", "Demo objective", "Workflow walkthrough", "Evidence controls", "Questions", "Next step"],
    talkTrack: [
      "Anchor every scene to the buyer decision question.",
      "Show source trace, review state, controls, and limits.",
      "Capture objections into the follow-up owner map."
    ],
    proofRoutes: ["/demos", "/qa-claim-guard", "/pilot-deal-room"],
    blockedClaims: ["live patient use", "autonomous clinical decision", "guaranteed savings"],
    approvalGate: "Demo script and blocked claims reviewed before use."
  },
  {
    slug: "security-procurement-packet",
    name: "Security And Procurement Packet",
    audience: "Security, privacy, legal, procurement, finance, and compliance reviewers",
    route: "/enterprise-business-ops",
    sections: ["Scope boundary", "Evidence routes", "Approval tracks", "Open gates", "Reviewer owner map", "Blocked claims"],
    talkTrack: [
      "Separate readiness evidence from certification or approval claims.",
      "Make open gates explicit and owned.",
      "Route sensitive artifacts to approved external systems rather than event bodies or public pages."
    ],
    proofRoutes: ["/approvals-readiness", "/global-certification-readiness", "/enterprise-business-ops", "/boundary-resolution"],
    blockedClaims: ["BAA approved", "SOC 2 certified", "contract approved", "PHI approved"],
    approvalGate: "Qualified legal, security, privacy, and finance review for buyer-specific use."
  },
  {
    slug: "pilot-kickoff-deck",
    name: "Pilot Kickoff Deck",
    audience: "Buyer sponsor, workflow owner, delivery team, and review owners",
    route: "/pilot-workspace/access",
    sections: ["Approved scope", "Owner matrix", "No-PHI rules", "Cadence", "Evidence route", "Escalation path", "First-week actions"],
    talkTrack: [
      "Confirm what is approved and what remains blocked.",
      "Give every owner a first-week action.",
      "Keep proof cadence and escalation visible from day one."
    ],
    proofRoutes: ["/pilot-workspace/access", "/continuous-review-audit", "/service-reliability"],
    blockedClaims: ["production activation", "live data approved", "clinical care authorized"],
    approvalGate: "Scope, owner, access, and evidence-cadence approval retained before kickoff."
  },
  {
    slug: "renewal-expansion-proof-review",
    name: "Renewal And Expansion Proof Review",
    audience: "Executive sponsor, finance, operations, product, and delivery owners",
    route: "/public-market-readiness",
    sections: ["Approved evidence", "Operational outcomes", "Open gates", "Renewal health", "Expansion options", "Claim constraints"],
    talkTrack: [
      "Use approved evidence and open gates side by side.",
      "Keep financial or customer-value language qualified until reviewed.",
      "Convert expansion interest into scoped package options."
    ],
    proofRoutes: ["/public-market-readiness", "/enterprise-business-ops", "/qa-buyer-proof-release", "/offerings"],
    blockedClaims: ["ROI guaranteed", "customer endorsement", "public case study approved"],
    approvalGate: "Customer permission, counsel, finance, and release decision before external value claims."
  }
];

export const clientOnboardingControls: ClientOnboardingControl[] = [
  {
    slug: "human-send-approval",
    control: "Human send approval",
    status: "human-review-required",
    owner: "Revenue Operations",
    purpose: "Prevent drafts from becoming external communications without accountable review.",
    requiredEvidence: ["Template selected", "Recipient context checked", "No-PHI scan", "Claim guard reviewed"],
    hardStops: ["automatic send attempted", "unsupported claim present", "recipient list unknown"]
  },
  {
    slug: "no-phi-communication",
    control: "No-PHI communication boundary",
    status: "blocked-before-approval",
    owner: "Privacy + TrustOS",
    purpose: "Keep email, invite bodies, agendas, and presentation notes free of PHI, identifiers, credentials, and live records.",
    requiredEvidence: ["No-PHI reminder in calendar-ready content", "Sensitive artifact route separated", "Owner assigned for exceptions"],
    hardStops: ["PHI in message", "production credentials in invite", "live record attached"]
  },
  {
    slug: "calendar-safe-fields",
    control: "Calendar-safe field policy",
    status: "ready",
    owner: "Revenue Operations + Security",
    purpose: "Make events schedulable without leaking sensitive data or implying approvals.",
    requiredEvidence: ["Meeting type", "duration", "approved attendees", "no-PHI description", "follow-up SLA"],
    hardStops: ["sensitive artifacts in event body", "attendees not approved", "approval claim in title"]
  },
  {
    slug: "presentation-claim-guard",
    control: "Presentation claim guard",
    status: "external-review-required",
    owner: "Claims Governance + Legal Ops",
    purpose: "Keep demos, decks, and meeting language aligned to retained evidence and blocked claims.",
    requiredEvidence: ["Proof route list", "Blocked claims reviewed", "Buyer-specific claims approved before use"],
    hardStops: ["customer claim without permission", "certification claim", "ROI or revenue guarantee"]
  },
  {
    slug: "crm-and-source-logging",
    control: "CRM and source logging",
    status: "ready",
    owner: "Sales Operations",
    purpose: "Capture contact source, stage, owner, and next action without storing sensitive content.",
    requiredEvidence: ["Source captured", "Stage assigned", "Owner assigned", "Follow-up SLA set"],
    hardStops: ["contact source missing", "owner missing", "sensitive notes copied into CRM"]
  },
  {
    slug: "follow-up-sla",
    control: "Follow-up SLA",
    status: "ready",
    owner: "Revenue Operations + Customer Operations",
    purpose: "Ensure demos, workshops, diligence reviews, and kickoff meetings produce timely next actions.",
    requiredEvidence: ["Meeting outcome", "Open items", "Owner map", "Due date"],
    hardStops: ["no owner for open item", "follow-up without boundary review", "unreviewed custom scope"]
  },
  {
    slug: "handoff-before-commitment",
    control: "Handoff before commitment",
    status: "human-review-required",
    owner: "Deal Desk + Product + TrustOS",
    purpose: "Move opportunities between sales, product, delivery, trust, legal, finance, and customer operations with artifacts instead of informal memory.",
    requiredEvidence: ["Selected package", "Proof routes", "Open gates", "Decision owner", "Next action"],
    hardStops: ["commitment made before handoff", "price or scope not reviewed", "production gate omitted"]
  },
  {
    slug: "meeting-notes-boundary",
    control: "Meeting notes boundary",
    status: "ready",
    owner: "Customer Operations",
    purpose: "Keep notes useful for execution while excluding PHI, secrets, unsupported claims, and contract conclusions.",
    requiredEvidence: ["Notes owner", "No-PHI scan", "Open claims separated", "Sensitive artifact references externalized"],
    hardStops: ["PHI in notes", "contract conclusion in notes", "security-sensitive artifact copied"]
  }
];

export const clientOnboardingHandoffs: ClientOnboardingHandoff[] = [
  {
    slug: "inquiry-to-discovery",
    from: "Inbound or referral source",
    to: "Revenue Operations",
    trigger: "Buyer fit and no-PHI acknowledgement are present.",
    requiredArtifacts: ["Qualified lead note", "Source attribution", "Initial workflow priority", "Preferred scheduling windows"],
    nextAction: "Approve response and send discovery calendar-ready copy.",
    proofRoutes: [clientOnboardingCommunicationsRoute, "/sales-attribution", "/growth-engine"],
    hardStops: ["PHI in intake", "no contact consent", "no owner assigned"]
  },
  {
    slug: "discovery-to-demo",
    from: "Revenue Operations",
    to: "Sales Engineering + Product Console",
    trigger: "Discovery identifies a demo-worthy use case and decision question.",
    requiredArtifacts: ["Buyer problem", "Selected demo", "Decision question", "Blocked claims", "Proof route list"],
    nextAction: "Prepare demo script and confirmation email.",
    proofRoutes: ["/demos", "/offerings", "/qa-claim-guard"],
    hardStops: ["demo requires live patient data", "unsupported customer reference requested", "no follow-up owner"]
  },
  {
    slug: "demo-to-pilot-scoping",
    from: "Sales Engineering",
    to: "Deal Desk + Product + TrustOS",
    trigger: "Buyer asks for pilot, assessment, diligence, or implementation path.",
    requiredArtifacts: ["Demo recap", "Open questions", "Recommended package", "Decision criteria", "Open gates"],
    nextAction: "Schedule pilot scoping workshop and price-floor review.",
    proofRoutes: ["/pilots", "/enterprise-business-ops", "/pilot-deal-room"],
    hardStops: ["price commitment without deal desk", "PHI-dependent scope", "unreviewed SOW language"]
  },
  {
    slug: "pilot-to-security-procurement",
    from: "Deal Desk",
    to: "TrustOps + Legal Ops + Finance",
    trigger: "Buyer diligence, security, privacy, procurement, legal, or finance review begins.",
    requiredArtifacts: ["Scope draft", "Reviewer roles", "Open-gate register", "Blocked claims", "Diligence packet route"],
    nextAction: "Assign qualified reviewers and return no-authority packet.",
    proofRoutes: ["/approvals-readiness", "/global-certification-readiness", "/boundary-resolution"],
    hardStops: ["certification self-claim", "contract approval implied", "BAA or PHI approval represented"]
  },
  {
    slug: "approved-scope-to-kickoff",
    from: "Deal Desk + Revenue Operations",
    to: "Customer Operations + Delivery + TrustOS",
    trigger: "Assessment, sprint, pilot, or retainer scope is approved for kickoff.",
    requiredArtifacts: ["Approved scope", "Owner matrix", "No-PHI rules", "Meeting cadence", "Evidence routes", "Escalation path"],
    nextAction: "Schedule kickoff and publish first-week action register.",
    proofRoutes: ["/pilot-workspace/access", "/continuous-review-audit", "/operational-efficiency"],
    hardStops: ["scope not approved", "access gate skipped", "sensitive data requested before approval"]
  },
  {
    slug: "delivery-to-renewal",
    from: "Customer Operations + Delivery",
    to: "Revenue Operations + Finance + Product",
    trigger: "Pilot, assessment, or retainer reaches review or renewal checkpoint.",
    requiredArtifacts: ["Approved evidence", "Open gates", "Buyer feedback", "Support load", "Next-package option"],
    nextAction: "Prepare renewal or expansion review with claims and finance review.",
    proofRoutes: ["/public-market-readiness", "/enterprise-business-ops", "/qa-buyer-proof-release"],
    hardStops: ["customer value claim without permission", "ROI guarantee", "production expansion without approvals"]
  }
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function countStatuses<T extends string>(
  values: Array<{ status: T }>
): Record<T, number> {
  return values.reduce(
    (counts, value) => ({
      ...counts,
      [value.status]: (counts[value.status] ?? 0) + 1
    }),
    {} as Record<T, number>
  );
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function getClientOnboardingCommunicationsSummary() {
  const proofRoutes = unique([
    clientOnboardingCommunicationsRoute,
    clientOnboardingCommunicationsApiRoute,
    clientOnboardingCommunicationsBriefRoute,
    ...clientOnboardingStages.flatMap((stage) => stage.proofRoutes),
    ...clientPresentationPackets.flatMap((packet) => packet.proofRoutes),
    ...clientOnboardingHandoffs.flatMap((handoff) => handoff.proofRoutes)
  ]);
  const hardStops = unique([
    ...clientOnboardingStages.flatMap((stage) => stage.hardStops),
    ...clientOnboardingControls.flatMap((control) => control.hardStops),
    ...clientOnboardingHandoffs.flatMap((handoff) => handoff.hardStops)
  ]);
  const blockedContent = unique([
    ...clientOnboardingBlockedClaims,
    ...clientCommunicationTemplates.flatMap((template) => template.blockedContent),
    ...clientPresentationPackets.flatMap((packet) => packet.blockedClaims)
  ]);
  const personalizationFields = unique(
    clientCommunicationTemplates.flatMap((template) => template.personalizationFields)
  );
  const approvalGates = unique([
    ...clientCommunicationTemplates.flatMap((template) => template.approvalGates),
    ...clientPresentationPackets.map((packet) => packet.approvalGate)
  ]);
  const owners = unique([
    ...clientOnboardingStages.map((stage) => stage.owner),
    ...clientMeetingCadences.map((cadence) => cadence.owner),
    ...clientOnboardingControls.map((control) => control.owner)
  ]);

  return {
    service: "scrimed-client-onboarding-communications",
    route: clientOnboardingCommunicationsRoute,
    apiRoute: clientOnboardingCommunicationsApiRoute,
    briefRoute: clientOnboardingCommunicationsBriefRoute,
    status: clientOnboardingCommunicationsStatus,
    briefStatus: clientOnboardingCommunicationsBriefStatus,
    boundary: clientOnboardingCommunicationsBoundary,
    authority: {
      communicationAuthority: "templates-only-human-send-required",
      calendarAuthority: "calendar-ready-not-invite-created",
      dataBoundary: "business-contact-workflow-and-metadata-only",
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      contractAuthority: "not-contract-approval",
      procurementAuthority: "not-procurement-approval",
      legalAuthority: "qualified-review-required",
      accountingAuthority: "qualified-accounting-review-required",
      securityCertification: "not-security-certified",
      revenueAuthority: "not-revenue-guarantee"
    },
    stageCount: clientOnboardingStages.length,
    humanReviewStageCount: clientOnboardingStages.filter((stage) => stage.status === "human-review-required").length,
    externalReviewStageCount: clientOnboardingStages.filter((stage) => stage.status === "external-review-required").length,
    templateCount: clientCommunicationTemplates.length,
    emailTemplateCount: clientCommunicationTemplates.filter((template) => template.channel === "email").length,
    calendarTemplateCount: clientCommunicationTemplates.filter((template) => template.channel === "calendar-invite").length,
    calendarPacketCount: clientCalendarPackets.length,
    meetingCadenceCount: clientMeetingCadences.length,
    presentationPacketCount: clientPresentationPackets.length,
    controlCount: clientOnboardingControls.length,
    handoffCount: clientOnboardingHandoffs.length,
    proofRouteCount: proofRoutes.length,
    hardStopCount: hardStops.length,
    blockedContentCount: blockedContent.length,
    personalizationFieldCount: personalizationFields.length,
    approvalGateCount: approvalGates.length,
    ownerCount: owners.length,
    stageStatusCounts: countStatuses(clientOnboardingStages),
    controlStatusCounts: countStatuses(clientOnboardingControls),
    recommendedOperatingPath: [
      "Inquiry qualification",
      "Discovery scheduling",
      "Demo preparation",
      "Demo follow-up",
      "Pilot scoping",
      "Security and procurement review",
      "Kickoff and onboarding",
      "Review, renewal, and expansion"
    ],
    nextBuildStep:
      "Use /client-onboarding as the communication control plane for every buyer meeting: choose the stage, select a human-reviewed template, use the calendar-safe packet, assign follow-up owner, and route any legal, finance, security, PHI, production, or clinical request to the proper boundary owner before external commitments expand.",
    clientOnboardingStages,
    clientCommunicationTemplates,
    clientCalendarPackets,
    clientMeetingCadences,
    clientPresentationPackets,
    clientOnboardingControls,
    clientOnboardingHandoffs,
    proofRoutes,
    hardStops,
    blockedContent,
    personalizationFields,
    approvalGates,
    owners,
    updated: clientOnboardingCommunicationsUpdatedAt
  };
}

export function buildClientOnboardingCommunicationsBrief() {
  const summary = getClientOnboardingCommunicationsSummary();

  return [
    "# SCRIMED Client Onboarding And Communications Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Stages: ${summary.stageCount}`,
    `Templates: ${summary.templateCount}`,
    `Calendar packets: ${summary.calendarPacketCount}`,
    `Meeting cadences: ${summary.meetingCadenceCount}`,
    `Presentation packets: ${summary.presentationPacketCount}`,
    `Controls: ${summary.controlCount}`,
    `Handoffs: ${summary.handoffCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is communication readiness only. It does not send email, create calendar invites, bind contracts, approve procurement, approve BAA or security posture, store PHI, process live clinical records, create customer permission, provide legal/accounting/tax advice, certify compliance, approve production connectors, guarantee revenue or ROI, or authorize live clinical care.",
    "",
    "## Recommended Operating Path",
    markdownItems(summary.recommendedOperatingPath),
    "",
    "## Stages",
    ...summary.clientOnboardingStages.map(
      (stage) =>
        `- ${stage.name} (${stage.status}): ${stage.objective} Owner: ${stage.owner}. Hard stops: ${stage.hardStops.join(", ")}`
    ),
    "",
    "## Communication Templates",
    ...summary.clientCommunicationTemplates.map(
      (template) =>
        `- ${template.name} (${template.channel}): ${template.subject}. Approval gates: ${template.approvalGates.join(", ")}`
    ),
    "",
    "## Calendar Packets",
    ...summary.clientCalendarPackets.map(
      (packet) =>
        `- ${packet.title} (${packet.durationMinutes} min): ${packet.calendarDescription} Follow-up: ${packet.followUpSla}`
    ),
    "",
    "## Meeting Cadences",
    ...summary.clientMeetingCadences.map(
      (cadence) =>
        `- ${cadence.name}: ${cadence.cadence} Owner: ${cadence.owner}. Boundary: ${cadence.boundary}`
    ),
    "",
    "## Presentation Packets",
    ...summary.clientPresentationPackets.map(
      (packet) =>
        `- ${packet.name}: ${packet.audience}. Gate: ${packet.approvalGate}`
    ),
    "",
    "## Handoffs",
    ...summary.clientOnboardingHandoffs.map(
      (handoff) =>
        `- ${handoff.from} -> ${handoff.to}: ${handoff.trigger} Next: ${handoff.nextAction}`
    ),
    "",
    "## Blocked Content",
    markdownItems(summary.blockedContent),
    "",
    "## Next Build Step",
    summary.nextBuildStep
  ].join("\n");
}
