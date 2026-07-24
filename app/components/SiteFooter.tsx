import Link from "next/link";
import { companyIdentity } from "../lib/companyIdentity";
import { limitationControlLinks, siteNavigationFooterLinks } from "../lib/siteNavigation";

export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="SCRIMED site footer">
      <div>
        <strong>{companyIdentity.displayName}</strong>
        <p>
          Pre-commercial, Atlas-first healthcare intelligence for governed synthetic evaluation. No PHI and
          no live clinical execution.
        </p>
        <a href={`mailto:${companyIdentity.publicContactEmail}`}>{companyIdentity.publicContactEmail}</a>
      </div>
      <div>
        <span>Evidence and Legal</span>
        <nav aria-label="Evidence and legal navigation">
          <Link href="/validation-evidence">Validation and Evidence</Link>
          <Link href="/legal">Legal and Policy Center</Link>
          <Link href="/legal/privacy">Privacy Notice</Link>
          <Link href="/legal/terms">Terms of Use</Link>
          <Link href="/legal/cookies">Cookie Notice</Link>
          <Link href="/legal/accessibility">Accessibility</Link>
          <Link href="/legal/healthcare-ai-disclaimer">Healthcare and AI Disclaimer</Link>
        </nav>
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
