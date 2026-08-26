import { elevationTokens } from "./elevation";
import { motionTokens } from "./motion";
import { radiiTokens } from "./radii";
import { spacingTokens } from "./spacing";
import { typographyTokens } from "./typography";

export const colorTokens = {
  ink: "#101612",
  muted: "#536058",
  line: "#d9e2dd",
  surface: "#ffffff",
  wash: "#f3f7f5",
  success: "#10613f",
  successStrong: "#0b3d2a",
  caution: "#c89b2d",
  information: "#275f8f",
  danger: "#b95d4d",
  focus: "#275f8f"
} as const;

export const scrimedDesignTokens = {
  version: "scrimed-design-system-v1-2026-08-12",
  color: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  radii: radiiTokens,
  elevation: elevationTokens,
  motion: motionTokens,
  accessibility: {
    minimumTouchTargetPx: 44,
    focusIndicator: "2px solid #275f8f",
    focusOffsetPx: 2,
    reducedMotionSupported: true,
    colorAloneConveysStatus: false
  },
  figmaSyncStatus: "SPEC_READY_VIEW_ONLY_NO_CANVAS_MUTATION"
} as const;
