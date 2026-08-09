export const scrimedPreproductionDisclosure =
  "SCRIMED is currently operating in a synthetic-data, pre-production demonstration environment. Features shown may represent planned, simulated, or research functionality and are not authorized for live clinical use, emergency monitoring, diagnosis, treatment, PHI processing, or autonomous healthcare decisions.";

export function PreproductionDisclosure() {
  return (
    <aside className="operating-mode-banner" aria-label="SCRIMED pre-production disclosure">
      <strong>Pre-production synthetic demonstration</strong>
      <span>{scrimedPreproductionDisclosure}</span>
      <span>Human-supervised · Atlas-first · FaithCore optional and clinically neutral</span>
    </aside>
  );
}
