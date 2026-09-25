# Tasks: Organigrama Abierto

**Input**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md` in `specs/003-rewrite-platform-landing/`.
**Strategy**: All Playwright tests first, run and preserve failure before any implementation. No new dependencies; do not change `src/components/PlatformSection.tsx` or the existing files in `src/components/diagrams/` (amended during execution by explicit user request: new scene and method-illustration files are added there, see T016).

## Phase 1: Setup

- [x] T001 Verify approved SHA-256 of `specs/003-rewrite-platform-landing/spec.md` and identify existing regression tests in `tests/landing.spec.ts` and `tests/platform.spec.ts`.

## Phase 2: Foundation — red barrier

- [x] T002 Write US1 Playwright tests in `tests/rewrite-landing.spec.ts`: brand in nav/title/hero/footer without «Gob Perú» (FR-001); one hero CTA «Conoce la plataforma» to `#plataforma`, correct hero explanation (FR-002); new fallback without JS (FR-012).
- [x] T003 Write US2 Playwright tests in `tests/rewrite-landing.spec.ts`: ordered sections `top, problema, metodo, para-quien, plataforma, principios, cierre` and footer (FR-003); desktop/mobile links resolve (FR-009); «Cómo funciona» sources, each power's stated depth, autonomous bodies excluded, Monday cut of Friday validation, human review before publishing (FR-004/005); withdrawn mockup phrases (SC-001); four provided pictures, territory image in «Para quién», platform unchanged (FR-010/011).
- [x] T004 Write US3 Playwright tests in `tests/rewrite-landing.spec.ts`: sourced data, neutral linking without opinion, personal-data protection (FR-006); independent and «en construcción» without launch dates or promises (FR-007); no official emblems/domains, officials' names, invented figures, specific laws, external links (FR-008/SC-003/007); no horizontal overflow at 360, 390, 768, 1024 and 1440 px including text at 200 % (SC-004).
- [x] T005 Update text-dependent legacy expectations only in `tests/landing.spec.ts` (section ids/count, menu label, no-JS heading) without weakening behavioral assertions (SC-005).
- [x] T006 Run Playwright against the UNCHANGED implementation, save literal failing output in `artifacts/003-red.txt`; do not implement until the new tests fail.

## Phase 3: US1 — first screen (P1)

**Goal**: Identify the independent platform and offer a single action to the existing Platform section.
**Independent test**: Filter `tests/rewrite-landing.spec.ts` for brand/hero/fallback.

- [x] T007 [US1] Rewrite brand, hero heading/lead, hero card and single CTA in `src/App.tsx`; CTA label exactly «Conoce la plataforma» → `#plataforma` (FR-001/002), no official-looking branding.
- [x] T008 [US1] Rewrite title, description, Open Graph metadata and no-JS fallback in `index.html` with new brand, explanation and internal destination (FR-001/012).

## Phase 4: US2 — coherent narrative (P2)

**Goal**: Problem, method, audiences, unchanged Platform and working navigation.
**Independent test**: Filter `tests/rewrite-landing.spec.ts` for order/method/audience; verify existing platform suite.

- [x] T009 [US2] Rewrite navigation, problem, method and audience in `src/App.tsx`: source → human validation → periodic publication, scope by power and depth, Monday cut of validated changes through Friday, autonomous-body exclusion (FR-003/004/005/009).
- [x] T010 [US2] Merge capacities into roles and territory image into «Para quién» in `src/App.tsx`; retain all four supplied images and place unchanged `<PlatformSection />` after that section (FR-003/010/011).
- [x] T011 [US2] Adjust only necessary responsive rules in `src/styles/global.css` for merged content and widths 360–1440, preserving keyboard/reduced-motion behavior (FR-011/SC-004).

## Phase 5: US3 — editorial trust (P3)

**Goal**: Explain principles and independence without operational or launch claims.
**Independent test**: Filter `tests/rewrite-landing.spec.ts` for principles/construction/prohibited content.

- [x] T012 [US3] Rewrite principles, close and footer in `src/App.tsx`: each datum with source, neutral links without opinion, personal-data protection, «en construcción», internal invitation and independent identity (FR-006/007/008).

## Final phase: verification and review

- [x] T013 Run `npm run typecheck`, `npm run build`, `npm run test:e2e` twice and save literal output to `artifacts/003-final.txt` (SC-005); verify spec hash and that the diff leaves `PlatformSection.tsx` and the pre-existing diagram files untouched (only new files are added, see T016).
- [x] T014 Obtain independent QA and project-scope review against `src/App.tsx`, `index.html` and `vite.config.ts`; record QA/PROYECTO separately (SC-003).
- [x] T015 Run Lighthouse audit for accessibility, SEO and best practices >=95 (SC-006): lighthouse 12.8.2 on the production build gives 100/100/100 (performance 91, no threshold in the spec); literal output in `artifacts/003-lighthouse.txt`, together with the SC-004 overflow check at 360/390/768/1024/1440 px.
- [x] T016 Amendment by explicit user request during execution: replace the generic method icons in `src/App.tsx` with isometric engraved illustrations in `src/components/diagrams/ArchiveDrawerScene.tsx` (Consultar), `StampScene.tsx` (Validar) and `NoticeBoardScene.tsx` (Publicar), one solid accent each, 10 s loops with 0 % = 100 % and no animation under reduced motion; each figure approved by the user, static and animated. Remove the unused `.observe`, `.connect`, `.act` and `.method-icon i` rules.

## Dependencies & execution order

T001 → T002–T005 → T006 **red barrier** → T007–T008 → T009–T011 → T012 → T016 → T013 → T014 → T015. The stories remain independently testable by filtering their Playwright tests, but edits to `src/App.tsx` are serialized. No concurrent writes to the same path. T002–T004 can be drafted independently but must be consolidated before writing the shared test file; T008 may proceed in parallel with T007 because they touch different files only after T006. MVP: US1. Commit to `main` authorized by the user at closure.
