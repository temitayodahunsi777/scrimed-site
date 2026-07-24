import { getScrimedOperatingModeSummary } from "../lib/operatingMode";

export function OperatingModeBanner() {
  const summary = getScrimedOperatingModeSummary();

  return (
    <aside className="operating-mode-banner" aria-label="SCRIMED operating mode">
      <strong>{summary.banner}</strong>
      <span>Pre-commercial · human-supervised · Atlas-first · FaithCore optional</span>
    </aside>
  );
}
