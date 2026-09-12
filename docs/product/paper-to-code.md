# Pen preparation and implementation workflow

This is the canonical workflow, retained at the historical `paper-to-code.md` path. [DESIGN.md](../../DESIGN.md) owns principles, tokens, audit and the screen/state matrix. Historical Paper artboards are not approved Pen designs.

## Phase 1 boundary

Audit and consolidate code foundations and documentation only. Do not open, edit or generate Pen designs. Repository inspection found Paper MCP entries in `.vscode/mcp.json` and `opencode.json`, both referencing localhost:29979, and no tracked `.pen` file or Pen configuration. These files remain unchanged. Pen availability was reported by the user; its schema, document format and connection are intentionally not tested here.

## Next-session intake

1. Read DESIGN.md, its active/retired screen matrix, App.tsx and owning feature files. Recheck behavior/state changes since the audit; preserve privacy, access, Local/Online and no-entity-photo requirements.
2. When explicitly asked to begin Pen work, inspect available Pen tools and existing documents first. Do not call Paper assuming it is Pen. Reuse an existing suitable document if found; otherwise create the system document through supported tools. Do not invent node IDs, file formats or connection settings.
3. Record the real document path/ID and tool capabilities here. Suggested repository location if Pen supports tracked local files: `design/qahal.pen`; this is a future destination, not an existing artifact. Never hand-author a fake file.
4. Establish pages/sections for foundations, reusable components, active screens and review notes. Import only approved reference assets. Keep retired map/old popup material out of active screens.

## Token and style mapping

| Code source                                                                            | Pen mapping                                                                                                                                    |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| CSS `--color-purple-<step>`, `--color-ink-<step>`, Paper/White                         | Primitive variables `color/purple/500`, `color/ink/900`, `color/paper`, etc.; match exact CSS values                                           |
| `--background-*`, `--text-*`, `--border-*`, `--action-*`, `--focus-ring`, `--status-*` | Semantic collection, slash-separated role names and light/dark modes; alias primitives when supported                                          |
| `--type-<role>-{size,weight,line}` and tracking                                        | Manrope text styles `type/display`, `type/h1`, … `type/micro`; convert rem with 16px reference and line-height multipliers to the tool's units |
| `--space-*`, `--radius-*`, target/width/border foundations                             | Numeric variables if supported; otherwise named documented styles/specifications                                                               |
| `--shadow-overlay`, grain/motion foundations                                           | Effect/behavior annotations; no automatic grain or decorative animation                                                                        |
| Existing `--theme-button-primary-*` / `--theme-input-*`                                | Component properties bound to semantic roles; do not create a duplicate legacy palette                                                         |

If Pen cannot express aliases or modes, document the limitation and maintain a reviewed mapping rather than silently flattening semantics. CSS stays the executable token source; approved visual changes must reconcile DESIGN.md, Pen values and CSS in one reviewed change. Do not create a second hand-maintained token manifest.

## Components and screen order

1. Foundations: palette/modes, nine typography styles, spacing, radii, lines, target size, focus, reduced motion and material examples.
2. Actual primitives: Button/IconButton, input/select/checkbox, tabs/navigation, divider, status/empty/error block and existing dialog pattern. Include default, hover, pressed, keyboard focus, disabled, selected, invalid and busy states where applicable.
3. Existing composites/domain patterns: CitySearch, congregation list article, location summary, MeetingLink, DiscoveryPrivacy, management member/request rows and profile badges. Preserve data/permission boundaries; do not invent avatars or detail routes.
4. Active screens in the DESIGN.md matrix: access and shell → Home Local/Online → onboarding → Profile → contextual Manage. Include each recorded loading, empty, error, permission and action state. The old map state resolves to Home in current code.
5. Approve component and screen visuals before implementation. Existing backend behavior remains authoritative; visual work does not reopen API contracts without a real requirement.

## Responsive, locale and review contract

Review 320, 375 and 420px mobile widths, keyboard-open and landscape safe areas, plus a 768px/1280px host showing the centered mobile app. These are review viewports, not newly imposed breakpoints. Resolve the current 375px outer/420px nav mismatch explicitly in approved Pen layouts. Do not invent a desktop sidebar or map split. Show light/dark, EN/ES and Hebrew RTL including mixed names, distances and long/error strings. Record intentional fallback glyph appearance and test text zoom.

For every approved screen, add a row here with: screen/state key from DESIGN.md, actual Pen document/node ID, viewport/mode/locale, reused component IDs, code owner, approval status/date, reviewer and any approved deviation. Initial status is **not started** for all screens; no IDs or approval dates exist. Use draft → needs review → approved → implemented → verified. Approval is a recorded user/reviewer decision, never inferred from a successful export.

Code owns keyboard behavior, focus management, semantics, reduced motion, auth, state and safe-area mechanics. Pen communicates their visible states. Compare implementation against the approved design and document differences; do not reinterpret it. After approved static fidelity, verify existing data flows and real Telegram behavior. Extract reusable code only where repeat usage supports it.

## Validation

From `/Users/jhonny/qahal`, use Bun only:

- `bun install`
- `bun run check`
- `bun run build`
- `bun run test:miniapp`

If sandboxed Wrangler cannot write its default log directory, use `WRANGLER_LOG_PATH=/tmp/qahal-wrangler-logs bun run build`; this remains a local dry-run build. Do not deploy as part of design validation.

Phase 1 baseline: initial JS 123.40kB gzip, CSS 15.66kB gzip. Record final build/test and contrast results below. Runtime release review still needs real Telegram launch/auth/ready/expand, theme changes, safe areas/keyboard, location permission handling, haptics and startup performance. Pen parity is not applicable until designs exist.

### Phase 1 execution results — 2026-09-12

- `TMPDIR=/tmp BUN_INSTALL_CACHE_DIR=/tmp/qahal-bun-cache bun install --frozen-lockfile`: passed, 403 installs checked across 520 packages, no changes. Initial sandbox attempts could not write Bun's temp directory/Husky Git configuration; the final permitted run completed both.
- `bun run check`: passed all three workspaces.
- `WRANGLER_LOG_PATH=/tmp/qahal-wrangler-logs bun run build`: passed. Worker ran dry-run only; its existing multiple-environment warning remains.
- `bun run test:miniapp`: 3 files, 7 tests passed.
- Initial JavaScript: **123.40kB gzip**, unchanged. CSS: **16.07kB gzip**, +0.41kB for foundations and accessibility rules. No added runtime dependency; font transfer is external and not part of Vite's JS/CSS accounting.
- Computed WCAG relative-luminance checks: 74 pairs passed (37 per mode). Normal primary/body/secondary/link/status text on primary/surface/muted/selected backgrounds and action labels meet 4.5:1; control borders/focus against primary/surface/muted backgrounds meet 3:1. Disabled/decorative borders were excluded. All CSS token references resolve. This does not certify remaining inline feature colors.
- Headless Chromium with the production stylesheet at 375×812 confirmed the Manrope family declaration, Paper/Ink light and Ink/Paper dark computed colors, solid keyboard focus and reduced-motion transition duration. Theme values were sampled after two animation frames; immediate sampling had captured pre-transition colors. This isolated fixture did not fetch the webfont or exercise application/auth flows.
- `git diff --check`: passed. No Pen actions, screen redesign, asset edits or deployment performed.

Not verified here: real Telegram WebView behavior/performance, actual Manrope delivery and Hebrew fallback rendering, full screen keyboard/target-size audit, and Pen parity. These remain explicit next-phase/release checks, not reasons to fabricate approval or change product behavior in Phase 1.
