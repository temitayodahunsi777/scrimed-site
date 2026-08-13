# SCRIMED Figma Sync Specification

## Current State

The code repository is the current design source of truth. The connected Figma seat was observed as view-only, so no canvas mutation or Code Connect publication is claimed. `artifacts/design/design-tokens.json` and `artifacts/design/code-connect-manifest.json` are implementation-ready handoff artifacts.

## Token Contract

- Colors use semantic names for ink, muted text, line, surfaces, status, and focus.
- Spacing uses a 4px base rhythm.
- Controls use 4px radii and cards use no more than 8px.
- Typography does not scale body text with viewport width and uses zero letter spacing.
- Motion has a reduced-motion rule and no essential interaction depends on animation.
- Focus indicators and minimum 44px touch targets are explicit accessibility requirements.

## Component Mapping

The manifest covers Button, Card, MetricCard, StatusBadge, GateStatus, EvidenceCard, DecisionCard, WorkflowStep, AgentRunCard, ModelRouteCard, ProofPacketCard, TrustReadinessCard, InvestorReadinessCard, Navigation, Modal, Table, EmptyState, and Alert. Each mapping records source, props, variants, states, and token dependencies.

## Operator Sync

1. Obtain Figma edit access and the approved design-system file key.
2. Create variables matching the machine-readable token names and values.
3. Map components to existing code paths; do not create duplicate component families.
4. Enter verified Figma node IDs in a reviewed manifest update.
5. Run `npm run check:design-system-artifacts` and the visual preview workflow.
6. Require design and accessibility review before calling the mapping synchronized.

No Figma canvas synchronization, design approval, or production release is represented by these files.
