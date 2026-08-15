export const typographyTokens = {
  fontFamily: {
    sans: "Arial, Helvetica, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.375rem",
    display: "clamp(2rem, 4vw, 4rem)"
  },
  lineHeight: { tight: 1.2, body: 1.55, relaxed: 1.7 },
  fontWeight: { regular: 400, medium: 600, strong: 800, brand: 900 }
} as const;
