import type { Metadata } from "next";
import Link from "next/link";
import InvestorDemoCommandRoom from "./InvestorDemoCommandRoom";

export const metadata: Metadata = {
  title: "SCRIMED Investor Demo Command Room",
  description:
    "A timed, proof-checked, human-led command room for SCRIMED synthetic investor demonstrations.",
  alternates: {
    canonical: "/investor-demo-command-room"
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function InvestorDemoCommandRoomPage() {
  return (
    <main className="investor-command-page">
      <section className="page-hero investor-command-hero">
        <Link className="back-link" href="/investor-audience-readiness">
          Investor readiness
        </Link>
        <p className="eyebrow">Investor demo command room</p>
        <h1>Run the meeting from evidence, not improvisation.</h1>
        <p className="hero-text">
          Preflight every proof route, hold the timebox, advance through one coherent story, and
          retain a no-PII internal rehearsal receipt without creating outreach, solicitation, or
          release authority.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href="#command-room">
            Prepare presentation
          </a>
          <Link className="secondary-action" href="/api/investor-demo-command-room">
            Inspect command API
          </Link>
        </div>
      </section>
      <div id="command-room">
        <InvestorDemoCommandRoom />
      </div>
    </main>
  );
}
