# macOS SWC Environment Note

The local macOS environment may report `next-swc-native-binding-unavailable-wasm-fallback`. The warning remains visible. It is environmental, not classified as a pass for native SWC, and does not grant production authority. A candidate may proceed to human review only when the supported WASM fallback completes the same typecheck, build, route/render baseline, public-smoke, and generated-integrity checks without behavioral drift. CI and any authorized deployment must still use a supported Node 24 environment and report their actual native/fallback state.
