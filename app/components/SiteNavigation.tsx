import Link from "next/link";
import {
  siteNavigationJourneys,
  siteNavigationPrimaryLinks,
  siteNavigationSections
} from "../lib/siteNavigation";

const primaryShortcutRoutes = [
  "/product",
  "/demos",
  "/pilots",
  "/pricing",
  "/enterprise-healthcare-infrastructure",
  "/trust-center",
  "/investor-audience-readiness",
  "/scrimed-work",
  "/pilot"
] as const;

export function SiteNavigation() {
  const primaryShortcuts = primaryShortcutRoutes
    .map((route) => siteNavigationPrimaryLinks.find((link) => link.href === route))
    .filter((link): link is (typeof siteNavigationPrimaryLinks)[number] => Boolean(link));
  const featuredJourneys = [
    "Healthcare buyer",
    "Demo, pilot, or pricing owner",
    "Investor, strategic partner, or faith-based clinic sponsor"
  ]
    .map((audience) => siteNavigationJourneys.find((journey) => journey.audience === audience))
    .filter((journey): journey is (typeof siteNavigationJourneys)[number] => Boolean(journey));

  return (
    <header className="site-navigation-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="site-navigation-topline">
        <Link className="site-navigation-brand" href="/" aria-label="SCRIMED home">
          <span className="brand-symbol">S</span>
          <span>SCRIMED</span>
        </Link>
        <nav className="site-navigation-primary" aria-label="Primary site shortcuts">
          {primaryShortcuts.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
      </div>

      <nav className="site-navigation-groups" aria-label="Grouped site navigation">
        {siteNavigationSections.map((section) => (
          <details className="site-navigation-group" key={section.label}>
            <summary>{section.label}</summary>
            <div className="site-navigation-menu">
              <p>{section.intent}</p>
              <div className="site-navigation-menu-grid">
                {section.links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <strong>{link.label}</strong>
                    <span>{link.description}</span>
                  </Link>
                ))}
              </div>
            </div>
          </details>
        ))}
      </nav>

      <div className="site-navigation-journeys" aria-label="Role-based navigation shortcuts">
        {featuredJourneys.map((journey) => (
          <Link key={journey.audience} href={journey.route}>
            <span>{journey.audience}</span>
            <strong>{journey.start}</strong>
          </Link>
        ))}
      </div>
    </header>
  );
}
