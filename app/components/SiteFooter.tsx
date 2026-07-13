import Link from "next/link";
import { limitationControlLinks, siteNavigationFooterLinks } from "../lib/siteNavigation";

export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="SCRIMED site footer">
      <div>
        <strong>SCRIMED</strong>
        <p>
          Healthcare operations intelligence for governed synthetic pilots, buyer diligence, proof routing,
          and readiness coordination.
        </p>
      </div>
      <div>
        <span>Limitations</span>
        <nav aria-label="Limitation controls">
          {limitationControlLinks.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
      </div>
      <div>
        <span>Core Links</span>
        <nav aria-label="Footer navigation">
          {siteNavigationFooterLinks.map((link) =>
            link.href.startsWith("http") ? (
              <a key={link.href} href={link.href}>{link.label}</a>
            ) : (
              <Link key={link.href} href={link.href}>{link.label}</Link>
            )
          )}
        </nav>
      </div>
    </footer>
  );
}
