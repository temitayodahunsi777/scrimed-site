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
    blocker: "A controlled Node.js and npm toolchain is available for local quality verification.",
    impact:
      "Dependency installation, security audit, TypeScript validation, and production builds can run before promotion.",
    currentEvidence:
      "Node.js 22.22.3 and npm 10.9.8 completed `npm ci`, a zero-vulnerability `npm audit`, `npm run lint`, `npm run typecheck`, and `npm run build`; a committed lockfile now supports reproducible CI installs.",
    owner: "Engineering",
    resolutionPath: [
      "Keep the committed lockfile synchronized with intentional dependency changes.",
      "Run `npm ci`, `npm audit --audit-level=moderate`, `npm run lint`, `npm run typecheck`, and `npm run build` before production promotion.",
      "Keep the controlled local toolchain out of source control."
    ],
    fallback:
      "Restore the official Node.js 22 toolchain, then use Vercel and GitHub Actions as independent remote verification paths."
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
    destination: "https://app.scrimedsolutions.com/product",
    requiredAction: "Keep the primary Wix View Product Console CTA mapped to the branded product route.",
    verification: "CTA opens Product Console without requiring buyer-owned Vercel access."
  },
  {
    step: "2. Commercial review",
    source: "https://www.scrimedsolutions.com",
    destination: "https://app.scrimedsolutions.com/pricing",
    requiredAction: "Keep the Wix Review Pricing or Enterprise Pricing CTA mapped to the branded pricing route.",
    verification: "Pricing page shows public preview, assessment, synthetic pilot, protected pilot, enterprise license, and strategic partnership tiers."
  },
  {
    step: "3. Product proof",
    source: "https://app.scrimedsolutions.com/product",
    destination: "https://app.scrimedsolutions.com/evaluation",
    requiredAction: "Route qualified buyers into the AgentOS Evaluation Workspace.",
    verification: "Synthetic evaluation generates task plan, Trust Card, audit preview, and observability packet."
  },
  {
    step: "4. Sales conversion",
    source: "https://app.scrimedsolutions.com/evaluation",
    destination: "https://app.scrimedsolutions.com/pilot",
    requiredAction: "Route buyers from evaluation to pilot intake.",
    verification: "Pilot intake rejects PHI and produces a CRM-ready handoff packet."
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
    updated: "2026-06-09"
  };
}
