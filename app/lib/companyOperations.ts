export type OperationsStatus = "ready" | "blocked" | "manual-action" | "planned";
export type OperationsArea = "publishing" | "deployment" | "domain" | "sales" | "quality" | "security";

export type OperationsBlocker = {
  id: string;
  area: OperationsArea;
  status: OperationsStatus;
  blocker: string;
  impact: string;
  currentEvidence: string;
  owner: string;
  resolutionPath: string[];
  fallback: string;
};

export type BuyerRouteChecklist = {
  step: string;
  source: string;
  destination: string;
  requiredAction: string;
  verification: string;
};

export type SmoothOpsPrinciple = {
  principle: string;
  operatingRule: string;
};

export const operationsBoundary =
  "SCRIMED operational readiness tracks deployment, sales, domain, and quality blockers for the synthetic pilot and enterprise evaluation product. It does not authorize live clinical execution.";

export const operationsBlockers: OperationsBlocker[] = [
  {
    id: "github-auth",
    area: "publishing",
    status: "ready",
    blocker: "GitHub push authentication is configured for the current workspace.",
    impact:
      "SCRIMED commits can now be pushed through the authenticated GitHub CLI path, allowing Vercel Git integration to deploy from `main`.",
    currentEvidence:
      "GitHub CLI authenticated as `temitayodahunsi777`; `git push origin main` successfully publishes reviewed local commits to GitHub.",
    owner: "Repository administrator",
    resolutionPath: [
      "Keep GitHub CLI authentication active for future local pushes.",
      "Prefer normal `git push origin main` after local commits are reviewed.",
      "Use GitHub connector publishing only as a fallback when local Git auth is unavailable."
    ],
    fallback:
      "Re-run GitHub device auth or use the connected GitHub app for a connector-backed branch after accepting the history reconciliation plan."
  },
  {
    id: "package-manager",
    area: "quality",
    status: "ready",
    blocker: "A controlled Node.js quality path is available even when npm is unavailable in the local shell.",
    impact:
      "Integrity, lint, TypeScript validation, and production builds can run before promotion without relying on the npm shell command.",
    currentEvidence:
      "`npm` is unavailable in the current local shell, so SCRIMED uses direct Node entrypoints: `node scripts/check-generated-integrity.mjs`, `node node_modules/eslint/bin/eslint.js .`, `node node_modules/typescript/bin/tsc --noEmit`, and `node node_modules/next/dist/bin/next build --webpack`.",
    owner: "Engineering",
    resolutionPath: [
      "Keep the committed lockfile synchronized with intentional dependency changes.",
      "Use direct Node entrypoints when npm is unavailable.",
      "Use Vercel production deploys and GitHub Actions as independent remote verification paths.",
      "Restore npm only as a convenience path, not as the single quality gate."
    ],
    fallback:
      "If local Node entrypoints fail, rely on Vercel deployment status, GitHub Actions, and route smoke checks while the local toolchain is repaired."
  },
  {
    id: "vercel-cli",
    area: "deployment",
    status: "ready",
    blocker: "Vercel Git deployment path is working from GitHub `main`.",
    impact:
      "Production deploys can proceed through GitHub push even without a local Vercel CLI install.",
    currentEvidence:
      "Vercel production deploys from pushed GitHub `main` commits and has returned READY for the latest pushed SCRIMED product builds.",
    owner: "Engineering",
    resolutionPath: [
      "Use GitHub push as the primary deploy trigger.",
      "Monitor Vercel production deployments after each pushed commit.",
      "Install Vercel CLI only if manual deployment, env management, or domain operations require it."
    ],
    fallback:
      "Use the Vercel dashboard or connector inspection if the CLI is unavailable."
  },
  {
    id: "app-subdomain",
    area: "domain",
    status: "ready",
    blocker: "`app.scrimedsolutions.com` is connected to the Vercel product app.",
    impact:
      "Buyers can reach the SCRIMED product through a branded domain without needing Vercel accounts.",
    currentEvidence:
      "The production deployment lists `app.scrimedsolutions.com` as an alias, and `https://app.scrimedsolutions.com/api/health` returns HTTP 200 with SCRIMED ready status.",
    owner: "Domain/DNS administrator",
    resolutionPath: [
      "Keep `app.scrimedsolutions.com` attached to the Vercel `scrimed-site` production deployment.",
      "Monitor DNS, SSL, and health-route availability after domain or deployment changes.",
      "Keep Wix product CTAs pointed to the branded app domain."
    ],
    fallback:
      "Use `https://scrimed-site.vercel.app` if the branded product domain experiences an outage."
  },
  {
    id: "sandbox-dns-preflight",
    area: "domain",
    status: "ready",
    blocker: "Sandbox DNS failures are now classified separately from production domain health.",
    impact:
      "Restricted Codex sandbox runs can return `getaddrinfo ENOTFOUND app.scrimedsolutions.com`; launch operators can now distinguish that false negative from a real branded-domain outage.",
    currentEvidence:
      "`/launch-readiness`, `/api/launch-readiness`, and `npm run smoke:launch-domain-preflight` define the strict primary-domain gate and fallback continuity path.",
    owner: "Release Steward + Domain/DNS administrator",
    resolutionPath: [
      "Run strict public smoke against `https://app.scrimedsolutions.com` from approved network access before launch.",
      "Run `npm run smoke:launch-domain-preflight` to classify sandbox DNS failures and fallback reachability.",
      "Keep fallback Vercel URL success as continuity evidence only, never launch approval."
    ],
    fallback:
      "Use `SCRIMED_ALLOW_DNS_FALLBACK=1 npm run smoke:launch-domain-preflight` for internal continuity proof when the sandbox cannot resolve the branded domain."
  },
  {
    id: "competitive-defense-hardening",
    area: "security",
    status: "ready",
    blocker:
      "Competitor pressure, legal/privacy/cyber claims, and infiltration-risk language now require an explicit hardening lane before public expansion.",
    impact:
      "SCRIMED can respond to Abridge, Ambience, Nabla, Suki, Microsoft, Oracle Health, Hippocratic AI, Notable, Commure, Cohere, and similar buyer comparisons without copying, overclaiming, exposing PHI, or implying security certification.",
    currentEvidence:
      "`/competitive-defense`, `/api/competitive-defense`, and `/api/competitive-defense/brief` expose threat profiles, weakness relief, legal/privacy/cyber controls, infiltration-deterrence layers, external review gates, and no-authority headers.",
    owner: "Founder + Legal Ops + Privacy + Security + TrustOS",
    resolutionPath: [
      "Run competitor, legal, privacy, security, claims, and investor statements through Competitive Defense before public use.",
      "Keep security-certification, penetration-test, PHI, legal-advice, customer-release, competitor-partnership, and attack-guarantee claims blocked until qualified review.",
      "Treat public APIs, protected workspaces, agent tools, health-record paths, claims, and build/dependency pipeline as explicit infiltration-deterrence layers."
    ],
    fallback:
      "If a claim cannot be mapped to a defense profile, proof route, and external-review gate, keep it internal or route it to `/limitations-workarounds`."
  },
  {
    id: "wix-cta-routing",
    area: "sales",
    status: "ready",
    blocker: "Wix CTAs are connected to SCRIMED product routes.",
    impact:
      "Buyers can move from the official website into product, pricing, evaluation, and pilot-intake experiences.",
    currentEvidence:
      "The website administrator confirmed the Wix CTAs are connected, and the branded product domain is active.",
    owner: "Website administrator",
    resolutionPath: [
      "Keep View Product Console, Review Pricing, Run Evaluation, and Request Pilot buttons mapped to the intended routes.",
      "Keep CTA targets on `https://app.scrimedsolutions.com/product`, `/pricing`, `/evaluation`, and `/pilot`.",
      "Re-run buyer-path smoke checks after any Wix or product-domain change."
    ],
    fallback:
      "Share direct Vercel links manually during buyer conversations."
  },
  {
    id: "deployment-protection",
    area: "security",
    status: "planned",
    blocker: "Public vs protected route policy needs an explicit decision before broad buyer access.",
    impact:
      "If deployment protection is on, buyers may hit Vercel authentication. If off, public preview routes need careful no-PHI boundaries.",
    currentEvidence: "Earlier protected Vercel URLs required connector-authenticated checks.",
    owner: "Security and product",
    resolutionPath: [
      "Keep public preview routes no-PHI and synthetic-only.",
      "Decide which routes are public: `/`, `/product`, `/pricing`, `/evaluation`, `/pilot`, `/trust`.",
      "Keep future tenant dashboards protected behind auth."
    ],
    fallback:
      "Use Vercel share links or authenticated demos for early enterprise review."
  }
];

export const buyerRouteChecklist: BuyerRouteChecklist[] = [
  {
    step: "1. Website discovery",
    source: "https://www.scrimedsolutions.com",
    destination: "https://app.scrimedsolutions.com/launch-readiness",
    requiredAction: "Verify Launch Readiness and the branded app domain before promoting buyer CTAs.",
    verification: "Launch Readiness exposes primary-domain, fallback-domain, service path, hard-stop, and no-authority launch boundaries."
  },
  {
    step: "2. Defense and trust review",
    source: "https://www.scrimedsolutions.com",
    destination: "https://app.scrimedsolutions.com/competitive-defense",
    requiredAction: "Review competitor, legal, privacy, cybersecurity, and infiltration-deterrence hardening before promoting market claims.",
    verification: "Competitive Defense exposes no-copy, no-PHI, no-certification, no-penetration-test, no-partnership, and no-protection-guarantee boundaries."
  },
  {
    step: "3. Product discovery",
    source: "https://www.scrimedsolutions.com",
    destination: "https://app.scrimedsolutions.com/product",
    requiredAction: "Keep the primary Wix View Product Console CTA mapped to the branded product route.",
    verification: "CTA opens Product Console without requiring buyer-owned Vercel access."
  },
  {
    step: "4. Commercial review",
    source: "https://www.scrimedsolutions.com",
    destination: "https://app.scrimedsolutions.com/pricing",
    requiredAction: "Keep the Wix Review Pricing or Enterprise Pricing CTA mapped to the branded pricing route.",
    verification: "Pricing page shows public preview, assessment, synthetic pilot, protected pilot, enterprise license, and strategic partnership tiers."
  },
  {
    step: "5. Product proof",
    source: "https://app.scrimedsolutions.com/product",
    destination: "https://app.scrimedsolutions.com/evaluation",
    requiredAction: "Route qualified buyers into the AgentOS Evaluation Workspace.",
    verification: "Synthetic evaluation generates task plan, Trust Card, audit preview, and observability packet."
  },
  {
    step: "6. Sales conversion",
    source: "https://app.scrimedsolutions.com/evaluation",
    destination: "https://app.scrimedsolutions.com/pilot",
    requiredAction: "Route buyers from evaluation to pilot intake.",
    verification: "Pilot intake rejects PHI and produces a CRM-ready handoff packet."
  },
  {
    step: "7. Opportunity operations",
    source: "https://app.scrimedsolutions.com/pilot",
    destination: "https://app.scrimedsolutions.com/sales-operations",
    requiredAction: "Use the protected tenant-admin console to assign ownership, advance the pipeline, release an audited proposal, and synchronize the approved CRM destination.",
    verification: "Every accepted no-PHI buyer intake is durably retained and every opportunity mutation, proposal download, and CRM result is auditable."
  }
];

export const smoothOpsPrinciples: SmoothOpsPrinciple[] = [
  {
    principle: "No silent blockers",
    operatingRule: "Every blocked tool, auth issue, deployment gap, and manual action must appear in readiness output with owner and fallback."
  },
  {
    principle: "No unbounded healthcare claims",
    operatingRule: "Every buyer-facing route must preserve synthetic/evaluation boundaries until approved production controls exist."
  },
  {
    principle: "No orphan surfaces",
    operatingRule: "Every new page needs a route, API where useful, Hub entry, Product Console linkage, and documentation entry."
  },
  {
    principle: "No buyer confusion",
    operatingRule: "Wix is the official marketing site; Vercel is the product app; buyers do not need Vercel accounts."
  },
  {
    principle: "No production promotion by vibes",
    operatingRule: "Promotion requires build verification, deployment verification, route smoke tests, auth/DNS checks, and documented rollback path."
  },
  {
    principle: "No unreviewed competitor or security claims",
    operatingRule:
      "Every competitor comparison, cybersecurity claim, privacy claim, penetration-test claim, customer-proof claim, and infiltration-risk statement must map to Competitive Defense, a proof route, and qualified review before public use."
  },
  {
    principle: "No fallback-only launch",
    operatingRule: "Fallback Vercel URLs can preserve internal continuity, but branded-domain smoke must pass before public launch approval."
  }
];

export function getCompanyOperationsSummary() {
  const blocked = operationsBlockers.filter((item) => item.status === "blocked").length;
  const manualAction = operationsBlockers.filter((item) => item.status === "manual-action").length;
  const ready = operationsBlockers.filter((item) => item.status === "ready").length;

  return {
    service: "scrimed-company-operations",
    route: "/operations",
    apiRoute: "/api/operations/readiness",
    status: blocked === 0 ? "operational-readiness-clear" : "blocked-actions-visible",
    boundary: operationsBoundary,
    blocked,
    manualAction,
    ready,
    total: operationsBlockers.length,
    operationsBlockers,
    buyerRouteChecklist,
    smoothOpsPrinciples,
    updated: "2026-06-26"
  };
}
