# SCRIMED Design Source of Truth

## Current Authority

No editable canonical Figma file is linked to the SCRIMED release process. The connected Figma account has a view-only seat, so SCRIMED does not represent Figma as the current design authority.

Until an editable design owner and canonical file are approved, the production source of truth is:

1. semantic React structure in `app/`;
2. shared navigation components in `app/components/`;
3. design tokens and responsive rules in `app/globals.css`;
4. browser screenshots generated from the reviewed build;
5. accessibility, navigation, public smoke, and visual acceptance evidence bound to the release SHA.

This avoids blocking product delivery on an unavailable design seat while preventing an unlinked design mockup from overruling production behavior.

## Baseline Tokens

The current code-owned palette uses `--ink`, `--muted`, `--line`, `--surface`, `--wash`, `--green`, `--green-dark`, `--gold`, `--blue`, and `--coral`. Changes require contrast review, responsive screenshots, and release-bound evidence.

## Figma Promotion Gate

A Figma file becomes canonical only after:

- an accountable product-design owner has edit authority;
- its file key and page ownership are recorded outside public UI;
- tokens map to code-owned variables;
- shared components and states are documented;
- desktop and mobile acceptance screenshots match the reviewed build;
- accessibility and claims review pass;
- the release steward records the design revision alongside the Git SHA.

## Required Visual Acceptance

- desktop and mobile navigation remain usable without overlap;
- text fits controls and cards without clipping;
- keyboard focus and skip navigation remain visible;
- contrast and semantic heading order are reviewed;
- synthetic/no-PHI labels and consequential-action boundaries remain visible;
- no customer logo, testimonial, clinical claim, certification mark, or outcome metric appears without approval evidence.

## Boundary

This workaround does not claim a Figma design system exists, grant edit access, approve public claims, or authorize production deployment. It keeps code review and accessibility evidence authoritative until an editable design source is intentionally linked.
