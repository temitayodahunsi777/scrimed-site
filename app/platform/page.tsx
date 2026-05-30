const modules = [
  {
    name: "Clinical Copilot",
    href: "/modules/clinical-copilot",
    maturity: "Design",
    users: "Clinicians and care teams",
    outcome: "Summarize patient context, surface decision support, and reduce documentation load."
  },
  {
    name: "DocuTwin",
    href: "/modules/docutwin",
    maturity: "Design",
    users: "Clinical operations",
    outcome: "Turn structured and conversational inputs into governed documentation workflows."
  },
  {
    name: "CarePath AI",
    href: "/modules/carepath-ai",
    maturity: "Design",
    users: "Patients, navigators, and intake teams",
    outcome: "Support intake, triage, routing, and care pathway coordination."
  },
  {
    name: "TrialCore",
    href: "/modules/trialcore",
    maturity: "Design",
    users: "Research and trial operations",
    outcome: "Match patients to trial opportunities using structured eligibility signals."
  },
  {
    name: "Watchtower",
    href: "/modules/watchtower",
    maturity: "Foundation",
    users: "Platform, safety, and compliance teams",
    outcome: "Monitor drift, regressions, latency, cost, traces, and trust signals."
  },
  {
    name: "SCRIMED Atlas",
    href: "/atlas",
    maturity: "Operating model",
    users: "Hospitals, governments, payers, and enterprise healthcare organizations",
    outcome: "Govern trust, compliance, interoperability, ROI, and agentic healthcare operations."
  },
  {
    name: "FaithCore",
    href: "/faithcore",
    maturity: "Trust layer",
    users: "Opt-in communities, patients, care teams, and aligned organizations",
    outcome: "Support dignity, encouragement, ethics, and trust while preserving clinical boundaries."
  }
];

export default function PlatformPage() {
  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/">SCRIMED</a>
        <p className="eyebrow">Platform architecture</p>
        <h1>The SCRIMED platform is organized around care intelligence, workflow execution, and trust monitoring.</h1>
        <p className="hero-text">
          Each module is staged so the product can grow from a deployable foundation into a governed healthcare intelligence ecosystem.
        </p>
      </section>

      <section className="table-section" aria-label="SCRIMED platform modules">
        {modules.map((module) => (
          <article className="module-row" key={module.name}>
            <div>
              <span>{module.maturity}</span>
              <h2>{module.name}</h2>
            </div>
            <p>{module.users}</p>
            <a className="module-link" href={module.href}>{module.outcome}</a>
          </article>
        ))}
      </section>
    </main>
  );
}
