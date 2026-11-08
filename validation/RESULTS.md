# Validation results — v0.9.12

Passed: JavaScript syntax checks, Python compile check, membership model tests, mocked DOM/context-menu interaction tests.

Run from the magik_bundles folder with Node 24:

```sh
node validation/model.test.mjs
node validation/ui.test.mjs
```

No npm dependencies. The UI harness checks compact toolbar at startup, default outlines and on/off toggle, persisted scale and visibility, icon selection action, menu creation/assignment, right-click selection targeting, serialized undo state restoration, brush clicks and cursor reset, navigation closing the temporary manager, bundle duplication/deletion, search/close, bounded bundle submenus, and workflow isolation.

These are mocked host/DOM tests, not live ComfyUI or visual browser validation. A running ComfyUI instance and an installed test browser were unavailable. Use the README live check after installation.

Regression checks: selecting a bundle, switching bundles, clearing the selection, and selecting again preserve the chosen dropdown value.

New checks: persisted horizontal/vertical layout toggle, browser reload invocation, status expansion/collapse, empty/enabled/bypassed/mixed mode summaries, bulk bypass and enable, direct mode-property assignment (including hosts where changeMode rejects bypass), external mode refresh, serialized undo restoration.

Regression checks: bundle-name background uses the bundle colour; reinitialization with temporarily oversized panel measurements preserves saved drag coordinates.

New mocked checks: top-row button order, saved collapse state, four theme choices and theme persistence, pointer deltas at 200% scale, and slider preview versus scale commit on release. Live Firefox visual behavior still needs verification.
