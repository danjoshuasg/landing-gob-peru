---
description: "Implementation tasks for the Gob Perú institutional landing"
---

# Tasks: Landing institucional editorial

**Input**: Design documents from `/specs/001-institutional-landing/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Required by the T4 track and constitution. Browser tests must be written and observed failing before the corresponding fixes.

## Phase 1: Setup

**Purpose**: Make the existing partial implementation buildable and testable.

- [x] T001 Record that `/speckit.clarify` found no critical ambiguity and run `/speckit.analyze` before further construction
- [x] T002 Add Vite client types to `tsconfig.app.json` and verify the current typecheck failure is resolved
- [x] T003 Add Playwright scripts and development dependency to `package.json`
- [x] T004 Create Chrome-based Playwright configuration in `playwright.config.ts`
- [x] T005 [P] Add local source and optimized image directories to `docs/image-ledger.md`
- [x] T006 [P] Verify Source Serif 4 and Geist Sans resolve only from local WOFF2 files in `tests/landing.spec.ts`

---

## Phase 2: Foundational verification

**Purpose**: Establish failing executable checks before changing observable behavior.

- [x] T007 [US1] Write failing internal-link and fictional-contact assertions in `tests/landing.spec.ts`
- [x] T008 [US1] Write failing no-JavaScript visibility assertion in `tests/landing.spec.ts`
- [x] T009 [US2] Write failing mobile-menu keyboard contract assertions in `tests/landing.spec.ts`
- [x] T010 [P] [US3] Write image source, format, alt, lazy-loading and local-network assertions in `tests/landing.spec.ts`
- [x] T011 [P] [US3] Write responsive overflow matrix assertions for 360, 390, 768, 1024 and 1440 px in `tests/landing.spec.ts`
- [x] T012 [P] [US2] Write semantic assertions that cards, metrics and diagrams remain HTML/SVG in `tests/landing.spec.ts`

**Checkpoint**: At least T007–T009 fail against the partial implementation for the expected reasons.

---

## Phase 3: User Story 1 — Comprender la propuesta institucional (Priority: P1) 🎯 MVP

**Goal**: Deliver a legible first screen and valid navigation without fictional destinations.

**Independent Test**: The page shows brand, headline, explanation and valid CTA at desktop/mobile sizes; all links resolve internally.

- [x] T013 [US1] Replace the provisional `mailto:` with a valid internal action in `src/App.tsx`
- [x] T014 [US1] Add a visible conceptual/prototype disclosure without weakening hierarchy in `src/App.tsx` and `src/styles/global.css`
- [x] T015 [US1] Change reveal behavior to progressive enhancement so content is visible without JavaScript in `src/App.tsx` and `src/styles/global.css`
- [x] T016 [US1] Verify hero, context, method, institutional block, capabilities, territory, principles, final CTA and footer in `tests/landing.spec.ts`
- [x] T017 [US1] Run `internal-link-audit`, `no-js-content-fallback` and `typecheck-build`

**Checkpoint**: User Story 1 is independently usable as a static MVP.

---

## Phase 4: User Story 2 — Explorar capacidades y principios (Priority: P2)

**Goal**: Make the full editorial journey operable by pointer and keyboard.

**Independent Test**: Every navigation item reaches a real section; mobile menu behavior and focus satisfy the declared interaction contract.

- [x] T018 [US2] Add `aria-controls`, panel identity, Escape handling and focus return to the mobile menu in `src/App.tsx`
- [x] T019 [US2] Make the closed mobile panel non-interactive; while open, lock background scroll and focus; restore both when closed in `src/App.tsx`
- [x] T020 [US2] Verify visible focus, WCAG AA contrast and reduced-motion behavior in `src/styles/global.css`
- [x] T021 [US2] Add a 200 % text-zoom overlap check to `tests/landing.spec.ts`
- [x] T022 [US2] Run `keyboard-menu-contract`, semantic assertions, `contrast-zoom-audit` and `reduced-motion-contract`

**Checkpoint**: User Stories 1 and 2 both pass independently.

---

## Phase 5: User Story 3 — Reconocer una identidad visual coherente (Priority: P3)

**Goal**: Integrate all supplied images as a coherent responsive editorial family.

**Independent Test**: Browser requests select local AVIF/WebP variants, images have dimensions and alt text, and the layout has no horizontal overflow.

- [x] T023 [US3] Validate and, if necessary, tune `Picture` source selection in `src/components/Picture.tsx`
- [x] T024 [US3] Tune hero, institutional block, territory section and Casa de Pizarro footer crops in `src/styles/global.css`
- [x] T025 [US3] Record dimensions, formats, derivative sizes and SHA-256 hashes of immutable masters in `docs/image-ledger.md`
- [x] T026 [US3] Run `image-delivery-audit`, `source-integrity-audit` and `responsive-overflow-matrix`

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & cross-cutting verification

**Purpose**: Produce reproducible evidence and prepare independent gates.

- [x] T027 [P] Run the complete production build and browser suite using commands from `specs/001-institutional-landing/quickstart.md`
- [x] T028 [P] Run Lighthouse and require ≥95 for accessibility, SEO and best practices
- [x] T029 [P] Capture full-page desktop and mobile screenshots under `artifacts/visual/`
- [x] T030 Perform independent visual review for hierarchy, typography, Casa de Pizarro and resource integrity
- [x] T031 Record the completed `/speckit.analyze` result with harness
- [x] T032 Verify approved contract hashes are current before convergence and request reapproval if stale
- [x] T033 Run `/speckit.converge` and complete any appended convergence tasks
- [x] T034 Run independent harness QA and scope gates with unchanged-tree checks
- [x] T035 Update implementation status and verification evidence in `README.md` without claiming deployment

## Dependencies & execution order

- Phase 1 blocks Phase 2.
- Phase 2 tests must be observed failing before Phases 3–5 change behavior.
- US1 is the minimum viable slice and precedes US2 and US3 because it repairs core truthfulness and fallback behavior.
- US2 and US3 may proceed in parallel only if workers do not edit `src/App.tsx` or `src/styles/global.css` concurrently.
- Phase 6 starts after all desired stories pass their named verification.

## Parallel opportunities

- T004 can run alongside T001–T003.
- T008 and T009 can run alongside T005–T007 because they assert different concerns.
- T022 and T023 can run in parallel after the application is stable.
- Evidence collection for QA may split build, browser and traceability axes, but judges remain independent.

## MVP strategy

1. Complete Setup and Foundational verification.
2. Complete US1 and demonstrate the first screen plus internal navigation.
3. Add US2 accessibility behavior.
4. Add US3 image and responsive polish.
5. Finish analysis, convergence and independent gates.
