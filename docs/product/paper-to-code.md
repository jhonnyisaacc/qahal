# Pen preparation and implementation workflow

This is the canonical workflow, retained at the historical `paper-to-code.md` path. [DESIGN.md](../../DESIGN.md) owns principles, tokens, audit and the screen/state matrix. Historical Paper artboards are not approved Pen designs.

## Phase 1 boundary

Audit and consolidate code foundations and documentation only. Do not open, edit or generate Pen designs. Repository inspection found Paper MCP entries in `.vscode/mcp.json` and `opencode.json`, both referencing localhost:29979, and no tracked `.pen` file or Pen configuration. These files remain unchanged. Pen availability was reported by the user; its schema, document format and connection are intentionally not tested here.

## Next-session intake

1. Read DESIGN.md, its active/retired screen matrix, App.tsx and owning feature files. Recheck behavior/state changes since the audit; preserve privacy, access, Local/Online and no-entity-photo requirements.
2. When explicitly asked to begin Pen work, inspect available Pen tools and existing documents first. Do not call Paper assuming it is Pen. Reuse an existing suitable document if found; otherwise create the system document through supported tools. Do not invent node IDs, file formats or connection settings.
3. Record the real document path/ID and tool capabilities here. The live file is [`design/qahal.pen`](../../design/qahal.pen). Never hand-author a fake file.
4. Establish pages/sections for foundations, reusable components, active screens and review notes. Import only approved reference assets. Keep retired map/old popup material out of active screens.

## Phase 2 — 2026-09-13

Pen document created through the local `pencil` MCP (`user-pencil`) against the open desktop file, then copied to the repo path. Do not Read/Grep `.pen` files; they are accessed only via MCP.

| Item                         | Value                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| Document                     | [`design/qahal.pen`](../../design/qahal.pen)                                                          |
| Desktop source while drawing | `~/.pencil/documents/f5c15fe0-2a68-41a7-89f7-de67dcb4d4a8/pencil-new.pen`                             |
| MCP tools                    | `get_app_state`, `read_skill`, `get_style`, `execute`, `browser`                                      |
| Connection                   | Cursor `~/.cursor/mcp.json` `pencil` → Pen.app `mcp-server-darwin-arm64 --app desktop --agent cursor` |
| Status                       | **draft** for every row. Not approved.                                                                |

Reusable component IDs: `Button/Primary` `Bw7kW`, `Button/Secondary` `vF842`, `Button/Icon` `HYXG6`, `Button/Quiet` `h0QKMz`, `StatusBar` `KptYp`, `Input` `t8LEvd`, `Tab/Selected` `PpwCi`, `Tab/Idle` `R8Cur`, `Nav/Item` `xbqsZ`, `Status/Block` `PvGGb`, `Congregation/Row` `s8UjJU`, `MeetingLink` `T9hrF`, `DiscoveryPrivacy` `S1v48`, `Member/Row` `VsErY`, `Request/Row` `sIwRn`, `Verified` `LsKT9`, `Fact/Row` `x9Cai`, `Logo/Qof` `p5r2D4`, `Count/Badge` `KabzR`. Masters live only on `01 Components` `Wl6YY` (Actions, Fields, Chrome, Directory, Rows, Marks). Do not leave reusable frames loose on the canvas.

### Phase 2 revision — same day

Open file is [`design/qahal.pen`](../../design/qahal.pen). DESIGN.md v2.1 records the same visual decisions. Screens remain **draft** (not approved, not implemented). CSS matches Black as the dark canvas; Purple 800 actions and purple inputs are specified but not yet in CSS.

- Dark ground is Black `#000000`. Ink 950 is not the dark canvas.
- Primary CTAs are Purple 800 liquid-glass pills. Continue is label-only. Join / Contact keep icons.
- Inputs use Purple 50 / Purple 900, Purple 300/400 borders and a leading icon. No language field on the name step.
- Data screens are sheet-style: large titles/subtitles, hairline rows with icons. Necessary choice boxes keep a light purple panel plus an icon.
- Product frames are 375×812 phones. Splash (`bagWD`, `j6B9C6`) uses the mark at 72×106: purple `qof.png` on Paper, white-body / purple-foot `qof-dark.png` on Black.
- Qahal details `NCUVj`: leader + verified mark, established year, place, Request to join.
- Manage is split: Qahal `bhann`, People `z8Kj5`, Requests `dn9Co`. Accept/Decline live on request detail `DPoTE`.
- Leader path adds Endorsement `KLY1B`; leaders see the request on Home `kTI1S` / `L39IJI`.
- Verified mark `LsKT9` (leaders). Member mark `t6xFfb` (community members). Logo `p5r2D4`. Count badge `KabzR`. All masters live on `Wl6YY`.
- UX rules live in [ux.md](./ux.md). Visibility is a dedicated screen `XpdBM`, then Profile — not part of the name step. Gender uses guy/girl icons. Request detail shows sex and age.
- Product phones sit in five labeled rows: Onboarding `v084PW`, Create Qahal `Buh5R`, Manage Qahal `sSnVW`, Profile `GmsVY`, Home `ThZhy`. Copy on those frames is Spanish only. Hebrew locale frames were removed (`g2qmxS`, `aLelE`, `PgElM`). Foundations, Components and Review stay in English.

| Screen                    | Device frame |
| ------------------------- | ------------ |
| Access invitation         | `MIlmq`      |
| Access invitation dark    | `Fe3F4`      |
| Home Local populated      | `wS7zW`      |
| Home Local empty + people | `p8jCYm`     |
| Home Local dark           | `unBpo`      |

| Screen/state key                  | Pen node | Viewport / mode / locale | Reused components                           | Code owner                           | Status |
| --------------------------------- | -------- | ------------------------ | ------------------------------------------- | ------------------------------------ | ------ |
| Foundations                       | `t5aau9` | system / light / EN      | —                                           | DESIGN.md, index.css                 | draft  |
| Components                        | `Wl6YY`  | system / light / EN      | all above                                   | feature composites                   | draft  |
| Splash                            | `Mtcbw`  | 375 / light / ES         | Logo/Qof                                    | new splash                           | draft  |
| Splash                            | `zhVmO`  | 375 / dark / ES          | Logo/Qof                                    | new splash                           | draft  |
| AccessGate loading                | `n8oeTq` | 375 / light / ES         | —                                           | AccessGate.tsx                       | draft  |
| AccessGate invitation             | `nJioE`  | 375 / light / ES         | Input, Button/Primary                       | AccessGate.tsx                       | draft  |
| AccessGate invalid                | `Lt3Za`  | 375 / light / ES         | Input, Button/Primary                       | AccessGate.tsx                       | draft  |
| AccessGate submitting             | `eQgZh`  | 375 / light / ES         | Input, Button/Primary                       | AccessGate.tsx                       | draft  |
| AccessGate error                  | `sQg5F`  | 375 / light / ES         | Button/Secondary                            | AccessGate.tsx                       | draft  |
| AccessGate invitation             | `pA982`  | 375 / dark / ES          | Input, Button/Primary                       | AccessGate.tsx                       | draft  |
| App loading                       | `D0Jgf`  | 375 / light / ES         | —                                           | App.tsx                              | draft  |
| App error                         | `Z9K6Jt` | 375 / light / ES         | Button/Secondary                            | App.tsx                              | draft  |
| OnboardingCarousel slide 1        | `Pq33s`  | 375 / light / ES         | Button/Primary                              | OnboardingCarouselScreen.tsx         | draft  |
| OnboardingCarousel slide 2        | `yWkZv`  | 375 / light / ES         | Button/Primary, Button/Secondary            | OnboardingCarouselScreen.tsx         | draft  |
| OnboardingCarousel slide 3        | `lpgmu`  | 375 / light / ES         | Button/Primary, Button/Secondary            | OnboardingCarouselScreen.tsx         | draft  |
| OnboardingState                   | `FGvB6`  | 375 / light / ES         | Button/Primary, Button/Secondary            | OnboardingStateScreen.tsx            | draft  |
| Onboarding endorsement            | `Rp8bh`  | 375 / light / ES         | Input, Button/Primary, Verified             | new endorsement step                 | draft  |
| OnboardingQuestions               | `rlG9J`  | 375 / light / ES         | Button/Primary, Button/Secondary            | OnboardingQuestionsScreen.tsx        | draft  |
| OnboardingData name · Leader      | `Ekhhs`  | 375 / light / ES         | Input, Button/Primary                       | OnboardingDataScreen.tsx             | draft  |
| OnboardingData name · Experienced | `b058RV` | 375 / light / ES         | Input, Button/Primary                       | OnboardingDataScreen.tsx             | draft  |
| OnboardingData city               | `GAjZ9`  | 375 / light / ES         | Input, Button/Primary, Button/Secondary     | OnboardingDataScreen.tsx, CitySearch | draft  |
| Visibility                        | `EeRnm`  | 375 / light / ES         | Button/Primary                              | new pre-home consent                 | draft  |
| Home Local populated              | `XvWm6`  | 375 / light / ES         | Tab, Congregation/Row, MeetingLink, Nav     | HomeScreen.tsx                       | draft  |
| Home Local empty + people         | `eu9lF`  | 375 / light / ES         | Tab, Nav                                    | HomeScreen.tsx                       | draft  |
| Home Local no area                | `x62V02` | 375 / light / ES         | Tab, Input, Nav                             | HomeScreen.tsx                       | draft  |
| Home Local loading                | `J1oas`  | 375 / light / ES         | Tab, Nav                                    | HomeScreen.tsx                       | draft  |
| Home Local error                  | `k97Jb9` | 375 / light / ES         | Tab, Status/Block, Nav                      | HomeScreen.tsx                       | draft  |
| Home Local create                 | `Q8FAc`  | 375 / light / ES         | Input, Button/Primary, Nav                  | HomeScreen.tsx                       | draft  |
| Home Local 420 host               | `UPcAL`  | 420 / light / ES         | Tab, Nav                                    | HomeScreen.tsx                       | draft  |
| Home Local                        | `zjXXO`  | 375 / dark / ES          | Tab, Congregation/Row, Nav                  | HomeScreen.tsx                       | draft  |
| Home Online populated             | `a5HvGy` | 375 / light / ES         | Tab, Congregation/Row, Nav                  | HomeScreen.tsx                       | draft  |
| Home Online empty                 | `tzb8Q`  | 375 / light / ES         | Tab, Button/Primary, Nav                    | HomeScreen.tsx                       | draft  |
| Home Online loading               | `tAtMB`  | 375 / light / ES         | Tab, Nav                                    | HomeScreen.tsx                       | draft  |
| Home endorsement request          | `s1fUk`  | 375 / light / ES         | Congregation/Row, Button/Quiet, Nav         | HomeScreen.tsx                       | draft  |
| Home endorsement detail           | `Nfxqh`  | 375 / light / ES         | Fact/Row, Button/Primary, Button/Quiet, Nav | HomeScreen.tsx                       | draft  |
| Qahal details                     | `FoO1r`  | 375 / light / ES         | Fact/Row, Verified, Button/Icon, Nav        | new details screen                   | draft  |
| Profile                           | `CVKMt`  | 375 / light / ES         | Input, DiscoveryPrivacy, Nav                | ProfileScreen.tsx                    | draft  |
| Profile                           | `c7OQEQ` | 375 / dark / ES          | Input, DiscoveryPrivacy, Nav                | ProfileScreen.tsx                    | draft  |
| Manage Qahal                      | `j3g3y`  | 375 / light / ES         | Input, Fact/Row, MeetingLink, Tab, Nav      | ManageQahalScreen.tsx                | draft  |
| Manage People                     | `Q4zUDM` | 375 / light / ES         | Member/Row, Verified, Tab, Nav              | ManageQahalScreen.tsx                | draft  |
| Manage Requests                   | `CooW0`  | 375 / light / ES         | Request/Row, Tab, Nav                       | ManageQahalScreen.tsx                | draft  |
| Manage request detail             | `rCsCE`  | 375 / light / ES         | Fact/Row, Button/Primary, Button/Quiet, Nav | ManageQahalScreen.tsx                | draft  |
| Manage empty                      | `I14Zm`  | 375 / light / ES         | Nav                                         | ManageQahalScreen.tsx                | draft  |
| Manage loading                    | `ZUHSY`  | 375 / light / ES         | Nav                                         | ManageQahalScreen.tsx                | draft  |
| Manage error                      | `r2bAQq` | 375 / light / ES         | Status/Block, Nav                           | ManageQahalScreen.tsx                | draft  |
| Review notes                      | `n0JsuO` | system                   | —                                           | paper-to-code.md                     | draft  |

## Token and style mapping

| Code source                                                                            | Pen mapping                                                                                                                                    |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| CSS `--color-purple-<step>`, `--color-ink-<step>`, Paper/White/Black                   | Primitive variables `color/purple/500`, `color/ink/900`, `color/paper`, `color/black`, etc.; match exact CSS values                            |
| `--background-*`, `--text-*`, `--border-*`, `--action-*`, `--focus-ring`, `--status-*` | Semantic collection, slash-separated role names and light/dark modes; alias primitives when supported                                          |
| `--type-<role>-{size,weight,line}` and tracking                                        | Manrope text styles `type/display`, `type/h1`, … `type/micro`; convert rem with 16px reference and line-height multipliers to the tool's units |
| `--space-*`, `--radius-*`, target/width/border foundations                             | Numeric variables if supported; otherwise named documented styles/specifications                                                               |
| `--shadow-overlay`, grain/motion foundations                                           | Effect/behavior annotations; no automatic grain or decorative animation                                                                        |
| Existing `--theme-button-primary-*` / `--theme-input-*`                                | Component properties bound to semantic roles; do not create a duplicate legacy palette                                                         |

If Pen cannot express aliases or modes, document the limitation and maintain a reviewed mapping rather than silently flattening semantics. CSS stays the executable token source; approved visual changes must reconcile DESIGN.md, Pen values and CSS in one reviewed change. Do not create a second hand-maintained token manifest.

## Components and screen order

1. Foundations: palette/modes, nine typography styles, spacing, radii, lines, target size, focus, reduced motion and material examples.
2. Actual primitives: Button/IconButton, input/select/checkbox, tabs/navigation, divider, status/empty/error block and existing dialog pattern. Include default, hover, pressed, keyboard focus, disabled, selected, invalid and busy states where applicable.
3. Existing composites/domain patterns: CitySearch, Congregation/Row, Fact/Row, MeetingLink, DiscoveryPrivacy, Member/Row, Request/Row, Verified, Logo/Qof and profile badges. Preserve data/permission boundaries; do not invent avatars. Qahal details and endorsement are specified product screens.
4. Active screens in the DESIGN.md matrix: splash → access and shell → onboarding (including endorsement) → Home Local/Online → Qahal details → Profile → contextual Manage (Qahal / People / Requests). Include each recorded loading, empty, error, permission and action state. The old map state resolves to Home in current code.
5. Approve component and screen visuals before implementation. Existing backend behavior remains authoritative; visual work does not reopen API contracts without a real requirement.

## Responsive, locale and review contract

Review 320, 375 and 420px mobile widths, keyboard-open and landscape safe areas, plus a 768px/1280px host showing the centered mobile app. These are review viewports, not newly imposed breakpoints. Resolve the current 375px outer/420px nav mismatch explicitly in approved Pen layouts. Do not invent a desktop sidebar or map split. The current Pen draft is Spanish-only on product phones. Show light/dark in that locale. Hebrew RTL, EN, mixed names, distances and long/error strings remain a later review pass. Record intentional fallback glyph appearance and test text zoom.

For every approved screen, add a row here with: screen/state key from DESIGN.md, actual Pen document/node ID, viewport/mode/locale, reused component IDs, code owner, approval status/date, reviewer and any approved deviation. Phase 2 rows are listed above; all are **draft**, with no approval dates. Use draft → needs review → approved → implemented → verified. Approval is a recorded user/reviewer decision, never inferred from a successful export.

Code owns keyboard behavior, focus management, semantics, reduced motion, auth, state and safe-area mechanics. Pen communicates their visible states. Compare implementation against the approved design and document differences; do not reinterpret it. After approved static fidelity, verify existing data flows and real Telegram behavior. Extract reusable code only where repeat usage supports it.

## Validation

From `/Users/jhonny/qahal`, use Bun only:

- `bun install`
- `bun run check`
- `bun run build`
- `bun run test:miniapp`

If sandboxed Wrangler cannot write its default log directory, use `WRANGLER_LOG_PATH=/tmp/qahal-wrangler-logs bun run build`; this remains a local dry-run build. Do not deploy as part of design validation.

Phase 1 baseline: initial JS 123.40kB gzip, CSS 15.66kB gzip. Record final build/test and contrast results below. Runtime release review still needs real Telegram launch/auth/ready/expand, theme changes, safe areas/keyboard, location permission handling, haptics and startup performance. Pen drafts exist; parity is a release gate after approval and implementation.

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
