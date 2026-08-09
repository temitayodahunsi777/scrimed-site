import { companyIdentity } from "./companyIdentity";
import { faithCorePublicCopy } from "./faithCorePolicy";

export type InterimLegalPolicySlug =
  | "privacy"
  | "terms"
  | "cookies"
  | "accessibility"
  | "refunds"
  | "healthcare-ai-disclaimer";

export type InterimLegalPolicy = {
  slug: InterimLegalPolicySlug;
  title: string;
  summary: string;
  effectiveLabel: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
};

export const interimLegalNotice =
  "Interim policy draft — subject to legal review before commercial healthcare deployment.";

export const publicHealthcareDataBoundary =
  "Do not submit protected health information, medical records, emergency information, or sensitive patient data through public forms.";

export const medicalDisclaimer =
  "SCRIMED does not provide medical diagnosis, treatment, emergency monitoring, or professional medical advice. Outputs must not replace qualified clinician judgment.";

export const aiLimitationStatement =
  "AI-generated outputs may be incomplete, inaccurate, or inappropriate and require human review.";

export const emergencyStatement =
  "If you believe you are experiencing a medical emergency, contact emergency services immediately.";

export const faithCoreNeutralityStatement =
  faithCorePublicCopy.supportingStatement;

const sharedBoundaries = [
  publicHealthcareDataBoundary,
  medicalDisclaimer,
  aiLimitationStatement,
  emergencyStatement,
  faithCoreNeutralityStatement
];

export const interimLegalPolicies: InterimLegalPolicy[] = [
  {
    slug: "privacy",
    title: "Interim Privacy Notice",
    summary:
      "This notice describes the limited business-contact and workflow-scope data used by SCRIMED's pre-commercial, no-PHI public experience.",
    effectiveLabel: "Draft updated July 23, 2026",
    sections: [
      {
        heading: "Current scope",
        paragraphs: [
          "SCRIMED currently operates public product surfaces as pre-commercial, synthetic-data and demonstration environments.",
          publicHealthcareDataBoundary
        ]
      },
      {
        heading: "Data collected",
        paragraphs: [
          "Public pilot intake may collect business contact details, organization information, selected workflow interests, governance requirements, referral source, and campaign attribution.",
          "SCRIMED does not ask for patient names, medical history, diagnoses, biometric data, payer-member data, medical records, or emergency details through public forms."
        ]
      },
      {
        heading: "Purpose, providers, and retention",
        paragraphs: [
          "Business-contact data is used to respond to an inquiry, qualify a no-PHI evaluation, maintain security, and measure business-source attribution. The current repository defines a 180-day default retention period for durable pilot intake; final retention and deletion policy requires counsel and privacy review.",
          "Configured providers may include application hosting, database, rate-limiting, CRM webhook, and the separately operated Wix marketing site. Provider scope and contractual status must be verified before protected data use."
        ]
      },
      {
        heading: "Requests and contact",
        paragraphs: [
          `To request access, correction, or deletion of public business-contact data, email ${companyIdentity.privacyContactEmail}. Identity and applicable legal requirements will be verified before action.`,
          "SCRIMED does not make a blanket jurisdictional compliance claim in this interim notice."
        ]
      }
    ]
  },
  {
    slug: "terms",
    title: "Interim Terms of Use",
    summary:
      "These interim terms govern public research, demonstration, workflow, and synthetic-data surfaces while final commercial terms remain subject to counsel review.",
    effectiveLabel: "Draft updated July 23, 2026",
    sections: [
      {
        heading: "Permitted use",
        paragraphs: [
          "Use the public product only for lawful evaluation of SCRIMED's current synthetic and demonstration capabilities.",
          "Do not submit PHI, credentials, confidential customer records, malicious content, or material you lack authority to provide."
        ]
      },
      {
        heading: "Healthcare and AI limitations",
        paragraphs: [medicalDisclaimer, aiLimitationStatement, emergencyStatement]
      },
      {
        heading: "No production authorization",
        paragraphs: [
          "Public access does not authorize live clinical use, device connection, EHR writeback, payer submission, autonomous care, production deployment, certification claims, or customer go-live.",
          "Commercial pilots and protected environments require a separately reviewed and executed agreement."
        ]
      },
      {
        heading: "Intellectual property and changes",
        paragraphs: [
          "SCRIMED and its product materials remain subject to applicable ownership and license rights. Do not copy, reverse engineer, or redistribute restricted materials except as permitted by law or written authorization.",
          "Governing law, dispute terms, liability terms, warranty terms, and entity details remain unresolved pending qualified counsel review."
        ]
      }
    ]
  },
  {
    slug: "cookies",
    title: "Interim Cookie Notice",
    summary:
      "This notice describes the current cookie boundary for SCRIMED's application and the separately managed Wix marketing site.",
    effectiveLabel: "Draft updated July 23, 2026",
    sections: [
      {
        heading: "Application cookies",
        paragraphs: [
          "The repository does not intentionally configure behavioral advertising trackers. Essential security, authentication, routing, or provider cookies may be used when protected services are enabled.",
          "Server-side rate limiting may record pseudonymous request fingerprints; full form contents are not used as client-side analytics events."
        ]
      },
      {
        heading: "Wix marketing site",
        paragraphs: [
          "The separate Wix site may use Wix platform, forms, chat, bookings, blog, store, SEO, consent, or analytics technologies according to its active configuration.",
          "The Wix cookie inventory and consent experience require owner and counsel review before commercial healthcare marketing."
        ]
      },
      {
        heading: "Choices",
        paragraphs: [
          "Browser controls can restrict cookies, but essential functionality may be affected. A final consent policy and region-specific treatment remain pending legal review."
        ]
      }
    ]
  },
  {
    slug: "accessibility",
    title: "Interim Accessibility Statement",
    summary:
      "SCRIMED aims to provide usable, keyboard-accessible, readable product experiences and records known limitations rather than claiming certification.",
    effectiveLabel: "Draft updated July 23, 2026",
    sections: [
      {
        heading: "Commitment",
        paragraphs: [
          "SCRIMED uses semantic structure, keyboard navigation, visible focus behavior, responsive layouts, and plain-language boundaries where supported by the current application.",
          "No formal accessibility certification or complete conformance claim is made."
        ]
      },
      {
        heading: "Report a barrier",
        paragraphs: [
          `Email ${companyIdentity.accessibilityContactEmail} with the page, barrier, assistive technology if relevant, and a non-sensitive description. Do not include PHI or confidential records.`
        ]
      }
    ]
  },
  {
    slug: "refunds",
    title: "Interim Refund Policy",
    summary:
      "SCRIMED's application does not offer an authorized self-service healthcare checkout or automatic refund workflow.",
    effectiveLabel: "Draft updated July 23, 2026",
    sections: [
      {
        heading: "Current commercial boundary",
        paragraphs: [
          "SCRIMED is pre-commercial. Any paid assessment or pilot must be governed by a separately reviewed agreement, statement of work, payment schedule, cancellation terms, and refund terms.",
          "Do not rely on Wix Store, cart, or checkout surfaces as authorized SCRIMED commercial terms."
        ]
      },
      {
        heading: "Questions",
        paragraphs: [
          `For a payment question relating to an executed SCRIMED agreement, contact ${companyIdentity.publicContactEmail}. Do not include patient or sensitive health data.`
        ]
      }
    ]
  },
  {
    slug: "healthcare-ai-disclaimer",
    title: "Healthcare and AI Disclaimer",
    summary:
      "SCRIMED provides pre-commercial, synthetic-data and workflow demonstrations under explicit human-supervision and no-live-care boundaries.",
    effectiveLabel: "Draft updated July 23, 2026",
    sections: [
      {
        heading: "Required boundaries",
        paragraphs: sharedBoundaries
      },
      {
        heading: "MyVitals and device concepts",
        paragraphs: [
          "Any vitals, wearable, sensor, trend, or alert experience is a workflow visualization using configured test or synthetic signals.",
          "Not intended for diagnosis, treatment, emergency monitoring, or time-critical clinical decision-making.",
          "Do not connect production medical devices or live patient data without separate technical, security, clinical, legal, and regulatory approval."
        ]
      }
    ]
  }
];

export function getInterimLegalPolicy(slug: string) {
  return interimLegalPolicies.find((policy) => policy.slug === slug);
}

export function getInterimLegalSummary() {
  return {
    service: "scrimed-interim-legal-policies",
    notice: interimLegalNotice,
    policies: interimLegalPolicies.map(({ slug, title, summary, effectiveLabel }) => ({
      slug,
      title,
      summary,
      effectiveLabel,
      route: `/legal/${slug}`
    })),
    finalCounselApproval: false,
    publicHealthcareDataBoundary,
    medicalDisclaimer,
    aiLimitationStatement,
    emergencyStatement,
    faithCoreNeutralityStatement
  };
}
