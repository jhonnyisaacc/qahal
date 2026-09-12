# Qahal design system

Version 2.0 · Phase 1 foundations · 2026-09-12

Qahal is a quiet, warm directory for communities: discovering, finding, browsing and organizing congregations, understanding their identity, and belonging in a place. Community, place, congregation, discovery, belonging and organization guide every visual decision. Editorial and notebook qualities describe the material, not a research or knowledge-management product.

## Authority and scope

This document is the canonical design policy, inventory and migration record. `apps/miniapp/src/styles/index.css` is the canonical executable token source. `tailwind.config.ts` consumes it; HTML owns font loading; neither defines a competing palette. Existing screens are evidence of behavior, not approved visual specifications.

Phase 1 changes foundations, font loading and shared accessibility styling. It does **not** redesign screen composition, create a component library, revive map navigation, or create/edit Pen documents. Inline legacy values remain explicitly tracked below. Do not mistake token adoption for completed screen migration.

The future workflow is current product → audit → Qahal system → Pen system → Pen screens → implementation. Once a screen is approved in Pen, **Pen is its visual source of truth** for hierarchy, layout, spacing, typography, color, component appearance and responsive intent. Code remains authoritative for behavior, data, business logic, state, accessibility behavior and architecture. Until approval, this document governs visual decisions. Conflicts require reconciliation and an explicit recorded decision, never silent reinterpretation. The only workflow document is [Pen preparation and implementation](docs/product/paper-to-code.md), retained at its existing path for stable links.

## Principles and material

Clarity, restraint, community, warmth, legibility, information hierarchy, consistency, calmness, negative space and subtle physicality are the ten principles. Information comes before decoration. Favor aligned text, thin lines and breathing room over nested cards. Avoid generic SaaS dashboard styling, glassmorphism, neon, crypto, cyberpunk, gaming, futuristic interfaces and ornamental editorial layouts.

The three brand materials are Purple `#7A55EE` (community, presence, identity, action), Ink `#09194D` (language, information, structure, depth) and Paper `#F7F5F1` (space, calm, physicality). No peach, orange, coral, cyan or extra decorative hues. No normal UI black. White is available only when a surface benefits from contrast; do not grow a beige palette.

Purple represents the presence of community. Individual points → density → congregation → qahal may inform a future discovery illustration or approved brand moment. It is optional, not a requirement to decorate every screen. Maps and clusters are conceptual possibilities only; active navigation is list based.

Paper grain should be almost invisible, approximately 1.5–3% (foundation opacity 2%). It must not compromise text, visibly repeat, introduce expensive filters or large payloads. No texture is applied in Phase 1. Future expressive purple grain belongs only in approved onboarding/discovery/empty-state brand moments. Gradients may use Purple → Purple → transparent, Purple → Ink → Purple, Purple → transparent or Ink → Purple. Prefer spacious, low-opacity radial pigment/light with soft transitions; avoid loud linear decoration. Richness comes from density, opacity, grain, blur and Purple/Ink interaction, not extra hues.

## Tokens

Primitive → semantic → component alias is the dependency direction. New code consumes semantic roles. Existing `--theme-*` component/feature names remain compatibility aliases so foundation changes do not require rewriting feature behavior. Add a component token only for an actual shared need. Do not create JSON or TypeScript copies of the CSS palette.

### Primitive palette

| Step | Purple  | Ink     |
| ---- | ------- | ------- |
| 50   | #F4F0FE | #F1F3F7 |
| 100  | #E9E1FD | #DDE1EA |
| 200  | #D5C5FA | #BDC4D3 |
| 300  | #BBA4F7 | #929DB3 |
| 400  | #9979F2 | #687590 |
| 500  | #7A55EE | #4A5876 |
| 600  | #6844D7 | #354466 |
| 700  | #5435B3 | #25355D |
| 800  | #40298A | #172756 |
| 900  | #2C1E5F | #09194D |
| 950  | —       | #050D29 |

CSS names are `--color-purple-500`, `--color-ink-900`, `--color-paper` and `--color-white`. Not every primitive needs a UI role.

### Semantic color roles

| CSS role                             | Light                  | Dark       |
| ------------------------------------ | ---------------------- | ---------- |
| `--background-primary`               | Paper                  | Ink 950    |
| `--background-surface`               | White                  | Ink 900    |
| `--background-muted`                 | Ink 50                 | Ink 800    |
| `--background-selected`              | Purple 50              | Purple 900 |
| `--text-primary`                     | Ink 900                | Paper      |
| `--text-body`                        | Ink 700                | Ink 100    |
| `--text-secondary`                   | Ink 500                | Ink 200    |
| `--text-disabled`                    | Ink 300                | Ink 400    |
| `--border-subtle`                    | Ink 100                | Ink 700    |
| `--border-control`                   | Ink 400                | Ink 400    |
| `--action-primary` / hover / pressed | Purple 500 / 600 / 700 | Same       |
| `--action-text`                      | White                  | White      |
| `--text-link`                        | Purple 700             | Purple 300 |
| `--focus-ring`                       | Purple 600             | Purple 300 |
| `--status-success`                   | #276443                | #94C9A7    |
| `--status-warning`                   | #775A16                | #DCC18A    |
| `--status-error`                     | #A52D42                | #F1A3AE    |

Functional status colors are muted, subordinate, and paired with text or icons. They are not brand accents. Information uses ordinary text and structure; no fourth status hue is needed. Subtle dividers are decorative separation, not sufficient control boundaries; inputs and secondary buttons use the stronger control border. Disabled text/opacity must never carry essential instructions. Dark mode uses Ink surfaces rather than the retired brown palette. Native controls follow `color-scheme`; Telegram AppRoot retains its own runtime appearance integration.

Compatibility aliases include `--theme-bg-*`, `--theme-card-*`, `--theme-button-*`, `--theme-input-*`, `--theme-nav-*`, `--theme-onboarding-*`, `--theme-map-*`, `--theme-surface-warm-*`, `--theme-toggle-*` and `--theme-sheet-shadow`. Names containing “warm” are historical, not another palette. `--brand-navy`, `--brand-text` and `--brand-accent` are legacy text-role aliases that adapt to dark mode; canonical brand primitives remain immutable. Unused teal/gold/parchment and mono tokens were removed. Missing `--brand-success` and `--brand-warning` now alias functional semantics.

### Typography

The only default typeface is **Manrope**, loaded with variable weights 400–700 through the existing Google Fonts stylesheet and `display=swap`. The stack is `"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. No additional sans or monospace family is introduced. Display, body and Hebrew compatibility aliases all resolve to the same stack. Platform fallback handles unsupported glyphs; do not assume Manrope covers Hebrew. Validate real Hebrew and mixed-direction strings on target devices, including niqqud, before visual approval. Do not download a second family to conceal coverage problems without a documented functional decision.

| Role    | Size | Weight | Line height |
| ------- | ---- | ------ | ----------- |
| display | 40px | 600    | 1.10        |
| h1      | 32px | 600    | 1.20        |
| h2      | 24px | 600    | 1.25        |
| h3      | 18px | 600    | 1.35        |
| body-lg | 16px | 400    | 1.55        |
| body    | 14px | 400    | 1.55        |
| label   | 13px | 500    | 1.30        |
| caption | 12px | 500    | 1.40        |
| micro   | 10px | 600    | 1.30        |

CSS stores sizes in rem (16px reference) as `--type-<role>-size`, weight and line. These foundations are encoded, not forcibly applied to every old inline heading. Buttons should use 14px/500; 700 is rare emphasis, never dominant, and light weights are excluded. Headings use roughly −0.025em tracking; editorial micro labels may use uppercase and +0.1em, e.g. “BUENOS AIRES · 24 CONGREGATIONS”. Never uppercase ordinary buttons/body. Do not apply Latin tracking or uppercase rules to Hebrew. Use tabular numerals (`.qahal-tabular`) for aligned times, counts and distances. Micro text is for supplementary labels, never essential instructions. Preserve text zoom and document any platform/accessibility deviation before changing the scale. External font delivery and fallback metrics remain part of WebView QA.

### Geometry and behavior

| Foundation | Values and rationale                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spacing    | 4, 8, 12, 16, 24, 32, 48px: compact control gaps through section separation; CSS `--space-<px>`                                                                              |
| Radius     | control 10px, panel 14px, pill 9999px: existing controls/inner panels support a small two-radius system; pills only for genuine tags, filters, statuses and compact controls |
| Lines      | 1px Ink-derived borders; alignment/dividers should often replace a card or shadow                                                                                            |
| Elevation  | none for normal cards/navigation/buttons; one `--shadow-overlay` (0 8px 24px Ink at 12%) for functional floating layers                                                      |
| Targets    | at least 44×44px including label hit area; retain visible keyboard focus                                                                                                     |
| Width      | `--content-width: 420px` records the current list-shell maximum; the older 375px outer shell remains a tracked mismatch                                                      |
| Motion     | 120/180/220ms, ease-out; opacity/subtle translate, very small scale only when useful                                                                                         |
| Disabled   | 0.55 opacity only for disabled controls; preserve explanatory text at full contrast                                                                                          |

No bounce, dramatic springs, parallax or ornamental motion. Shared reduced-motion CSS neutralizes transitions/animations, including old carousel transitions. Layout spacing, old 18px cards, 12px controls and inline sizes remain for Pen-led migration, not endorsed additional tokens. Keep content over containers; cards require meaningful grouping and should not nest by default.

## Repository audit and disposition

Audit date: 2026-09-12. Scope: tracked application code, global CSS/config, dependencies, docs/editor guidance, assets and repository MCP configuration. Searches included style declarations, raw colors, font loading, responsive utilities, SVG/images, motion, design/Paper/Pen references and files. Five local image assets were visually inspected. No Pen tool was opened or called. This is a code/assets audit, not a claim of full runtime visual QA.

### Design sources

| Path                                                                       | Current responsibility and disposition                                                                                                |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `DESIGN.md`                                                                | Keep; replaces v1.2's stale Playfair/Inter, warm-brown/card-stack and map-first guidance with this policy and audit                   |
| `apps/miniapp/src/styles/index.css`                                        | Keep/consolidate; only custom global stylesheet, palette, semantic roles, aliases and `.redesign-*` shared rules                      |
| `apps/miniapp/tailwind.config.ts`                                          | Keep; Tailwind 3 defaults for geometry plus legacy brand mappings; font aliases now reference CSS, no second font definition          |
| `apps/miniapp/postcss.config.js`, `vite.config.ts`                         | Keep; build pipeline, no independent design system                                                                                    |
| `apps/miniapp/index.html`                                                  | Keep; replaced Inter/Playfair loading with Manrope, Telegram script unchanged                                                         |
| `apps/miniapp/src/main.tsx`, `app/theme.ts`, `lib/telegram.ts`             | Keep; AppRoot, initial theme/storage/events, ready/expand and safe-area plumbing; these are behavior owners                           |
| `apps/miniapp/src/App.tsx`                                                 | Keep; conditional screen router, lazy Home/Profile/Manage, theme toggle and 375px shell; not a token authority                        |
| `apps/miniapp/src/features/**`                                             | Keep; current product behavior, extensive inline styles and repeated navigation/cards; migration targets below                        |
| `apps/miniapp/package.json`                                                | Keep React 19, TelegramUI, Headless UI combobox and Leaflet dependencies; no icon library or Storybook dependency                     |
| `apps/miniapp/src/app/paperMapping.ts`                                     | Legacy diagnostic IDs only; duplicate Home/Manage ID `4RP-0`, no dedicated state-selection mapping; never reuse as Pen IDs            |
| `docs/product/paper-to-code.md`                                            | Consolidated as the one future Pen workflow; old path retained                                                                        |
| `AGENTS.md`, `.github/instructions/{qahal,stack,telegram}.instructions.md` | Keep engineering rules; replace conflicting visual/Paper authority with links to canonical documents                                  |
| `.github/instructions/skills.required.md`                                  | Capability checklist, not installed skills or visual specifications; historical Paper terminology deferred to canonical workflow      |
| `.cursor/rules/qahal-project.mdc`                                          | Existing editor/stack guidance; defer visuals to DESIGN.md                                                                            |
| `README.md`, `docs/architecture/overview.md`                               | Keep navigation and architecture documentation; clarify active list discovery and canonical design links                              |
| `docs/product/redesign-{plan,issue,operations}.md`                         | Keep product/operations history and constraints (controlled access, no entity photos); historical plans do not define current visuals |
| `docs/ONBOARDING-FLOW.md`, `docs/QUESTIONS.md`                             | Keep behavioral/question context; onboarding's “implementation pending” and map references are historical, verify against code        |
| `.vscode/mcp.json`, `opencode.json`                                        | Keep untouched: existing **Paper**, not Pen, connection at localhost:29979; not proof of a Pen connection                             |
| `design/*`                                                                 | Preserve reference artwork; no files are current token definitions or approved screen specifications                                  |

No tracked `.pen` file, Pen-specific repository configuration, Storybook, standalone token JSON, local font binary, texture, illustration set, screenshot suite or product mockup was found. The five `design/` images are logo studies, not screens. Generated dependency/build images (including TelegramUI's SVG) are vendor artifacts, not Qahal assets. User reports Pen is installed/connected; Phase 2 must inspect its capabilities then, without assuming Paper and Pen share a protocol.

### Screens and states (the future Pen screen matrix)

All paths below are under `apps/miniapp/src/`. Routing is conditional application state in `App.tsx`/`app/useAppFlow.ts`, not URL pages. Every active row needs light/dark and relevant EN/ES/HE coverage. Pen status for every row: **not started; no approved artifact**.

| Screen/state                                                                     | Purpose, components and required state coverage                                                                                                                                                                                                       | Current patterns / migration priority                                                                                                   |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `features/access/AccessGate.tsx`                                                 | Telegram access check; loading, invitation entry, invalid code, submitting, network/auth error/retry, admitted transition                                                                                                                             | `.redesign-screen`, native form; first priority with shared form foundations                                                            |
| `App.tsx` loading/error/Suspense                                                 | Profile loading, failed fetch/retry, lazy-route loading                                                                                                                                                                                               | Shared status text; include in shell baseline                                                                                           |
| `features/onboarding/OnboardingCarouselScreen.tsx`                               | Three introductory slides, previous/next/start, swipe                                                                                                                                                                                                 | Inline 62/40/38px titles, translated layouts, 300ms motion; high priority after shell                                                   |
| `features/onboarding/OnboardingStateScreen.tsx`                                  | Leader/experienced/starting selection, selected/unselected, continue/back                                                                                                                                                                             | Rounded choice cards, hardcoded old purple alpha; high priority                                                                         |
| `features/onboarding/OnboardingQuestionsScreen.tsx`                              | Role-dependent questions, answers, progress, back/next/exit                                                                                                                                                                                           | Card pairs, inline 34px heading and 15px body; high priority                                                                            |
| `features/onboarding/OnboardingDataScreen.tsx`                                   | Name, city, language, submit, validation/busy/retry; `CitySearch`                                                                                                                                                                                     | Inline inputs and sizes; high priority, keyboard and safe-area coverage                                                                 |
| `features/home/HomeScreen.tsx`                                                   | Local/Online tabs; area/location permission; 10/25/50/100km radius (25 default); pagination; loading/error/retry; communities; successful empty result with opted-in people; no area/no people; join pending/member/manage; conditional creation form | Text-only articles, repeated `.redesign-card`, nested `MeetingLink`, fixed Home/Profile nav; highest product priority                   |
| `features/profile/ProfileScreen.tsx`                                             | Name editing, birth-date confirmation, badges, debug roles/scenarios/reset when enabled; `DiscoveryPrivacy` loading/saving/error and independent discoverable/contact checkboxes                                                                      | Dense inline card stack, local dialog and icon nav; high priority; debug UI is separate from normal product                             |
| `features/manage/ManageQahalScreen.tsx`                                          | Permission/empty/loading/error; community name edits, members/invitations, pending requests and actions; editable `MeetingLink`                                                                                                                       | Repeated inner panels/compact controls, orange/error and disabled-gray literals, local navigation; high priority, contextual entry only |
| `features/map/MapScreen.tsx`, `MapView.tsx`, `components/Map*.tsx`               | Retired map, city switcher, permission overlay, people panel/person sheet, floating controls and bottom nav                                                                                                                                           | No active render in App; `state.screen === 'map'` renders Home instead. Legacy backlog only, not Pen product scope                      |
| `features/home/components/{HomePopups,JoinRequestToast,ProfileTestingPanel}.tsx` | Old popup/toast/debug views                                                                                                                                                                                                                           | No current importers found; legacy references, not active Pen screens                                                                   |

There is no standalone congregation detail route or MeetingSchedule component in current code. Congregation identity, location metadata, join/manage actions and member meeting access live in Home/Manage. Do not invent detail pages, avatars or map screens to fill a component checklist. Personal avatars and congregation logo images remain prohibited; the app Qof mark remains valid.

### Components, repeats and implementation debt

| Classification         | Existing source/pattern                                                                                    | Disposition                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Primitive dependency   | TelegramUI `AppRoot` and vendor stylesheet; native buttons/inputs/selects/checkboxes; Headless UI Combobox | Keep libraries. Define actual control states in Pen before extracting shared wrappers                                       |
| Shared CSS primitive   | `.redesign-screen`, `.redesign-card`, `.redesign-nav`, `.qahal-display`                                    | Keep transitional class names, consume canonical roles; not a finished reusable component API                               |
| Reusable composite     | `onboarding/CitySearch.tsx`                                                                                | Search + location flow used by onboarding/Home; model query/loading/options/selection/permission/error states               |
| Domain component       | `manage/MeetingLink.tsx`                                                                                   | Shared member-only link and editable form; reuse, eliminate unnecessary nested card visually in Phase 2                     |
| Domain component       | `profile/DiscoveryPrivacy.tsx`                                                                             | Consent controls with persisted state; preserve independent toggles and authorization                                       |
| Inline domain blocks   | Congregation/people articles in Home; member/request rows in Manage; badge rows in Profile                 | Candidates for CongregationListItem, LocationSummary and member rows only after approved contracts; not existing exports    |
| Duplicated composition | Header/card/inner surface/button style objects and icon bottom navigation in Profile/Manage                | Future shared ScreenHeader, NavigationItem, Button/IconButton and section/list primitives; no blanket extraction in Phase 1 |
| Page-specific          | Carousel slide layout, questionnaire options/progress, profile date dialog, management edit forms          | Keep feature ownership, compose shared controls later                                                                       |
| Legacy                 | Map composites and old home overlays/testing panel                                                         | Preserve without treating as approved/current UI; remove only with separate dead-code verification                          |

A minimum future library starts with typography roles, button/icon button, text input/select/checkbox, CitySearch, divider, selected tab/navigation item, status/empty/error block and existing dialog behavior. Add a badge/tag where current profile/status content needs it. No speculative table, avatar, radio, tooltip, popover or toast library is required.

Observed debt: raw old-purple `rgba(125,90,242,…)`, raw red/orange/green feedback and gray disabled colors; teal map markers; invalid alpha suffixes such as `var(--brand-purple)33` in Manage and `var(--brand-purple)4D` in the retired testing panel (use semantic selected/border roles instead); parchment testing-panel colors; literal 11–17px text and 30–62px titles; 38–42px utility controls below target; repeated radii 10/12/14/16/18 and pills; local shadows; 300ms carousel transition; backdrop blur in retired maps. Semantic hover/pressed/selected and type/space/radius foundations now exist but old inline controls are not automatically migrated. Replace them with approved components, not global find-and-replace of raw colors.

### Responsive and accessibility audit

Tailwind's default breakpoints remain 640/768/1024/1280/1536px; no feature `sm:`, `md:` or `lg:` layout variants were found. Current product is a centered mobile column on desktop. App clamps at 375px while access/list CSS and fixed Home nav permit 420px; Profile dialog caps at 320px. Profile/Manage use fixed viewport height and internal scrolling, Home uses minimum height. Two-column action grids occur in onboarding, not a desktop dashboard. There is no active map/list split or desktop navigation transformation. Preserve these behaviors in Phase 1; Phase 2 should explicitly reconcile width and nav alignment rather than infer desktop redesigns.

Existing safe-area variables are initialized before render and updated from Telegram; root theme initializes before rendering and responds to Telegram changes/user toggle. Some features reserve only top/bottom insets or hardcode header padding: test all four edges, keyboard and landscape. Preserve ready/expand, auth freshness and haptics as behavior requirements.

Foundation acceptance requires 4.5:1 normal text, 3:1 large text and essential control/focus boundaries against actual adjacent surfaces. Selected states need text/shape or semantic attributes in addition to color. Focus must remain visible above overlays, with logical tab order and dialog focus restoration. Check tab keyboard navigation, combobox announcements, labels/error association and busy feedback; CSS alone cannot certify these. Shared focus-visible and reduced-motion rules are implemented. Known checks for future screen work: 40px theme toggle and compact utility targets; checkbox layout outside `.redesign-screen`; outline suppression in local inputs; long translations, 200% zoom, Hebrew direction and numeric fragments. Keep readable prose lines roughly 45–70 characters where space allows; mobile content must wrap without clipping.

### Asset inventory

| Path                | Observed content                                                   | Decision                                                                     |
| ------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `design/logo.png`   | 1024×1024 transparent PNG, cyan dotted Qof on white circular field | Legacy alternate direction, preserve reference; cyan is not approved palette |
| `design/logo_1.jpg` | 1600×1600, light Qof + dark “qahal.” wordmark on purple            | Historical brand lockup reference                                            |
| `design/logo_2.jpg` | 1597×1600, light Qof with Ink terminal on purple                   | Historical symbol reference                                                  |
| `design/logo_3.jpg` | 1600×1600, purple Qof with Ink terminal on light                   | Historical symbol reference                                                  |
| `design/logo_4.jpg` | 1600×1600, purple Qof + Ink wordmark on light                      | Historical lockup reference                                                  |

These raster colors/type are not exact v2 specifications. Preserve artwork unchanged; Phase 2 can establish an approved vector mark from the Qof references. No logo asset import was found in active screens. Inline SVG outline icons occur in shell/Profile/Manage/maps, with roughly 1.5–2px strokes and 16–24px canvases. Keep this source rather than adding a library; future reusable icons should use currentColor, consistent 1.75px stroke on 24px and accessible labels on icon-only controls. Illustrative Qof geometry is distinct from UI iconography.

## Migration and validation record

Phase 1 consolidates palette/semantic aliases, Manrope font loading, typography/space/radius/motion foundations, focus/reduced-motion behavior, removes unused legacy tokens and reconciles documentation. Screen hierarchy and product logic are unchanged. Remaining visual debt above is deliberately not an alternate source of truth.

Run from repository root: `bun install`, `bun run check`, `bun run build`, and applicable existing tests. Compare initial JS gzip with the pre-change build (123.40kB; CSS 15.66kB gzip). No new JS dependency, font package or texture payload is introduced. Validation outcomes are recorded in the workflow document after execution. Real Telegram WebView and approved Pen parity remain release gates, not completed Phase 1 claims.
