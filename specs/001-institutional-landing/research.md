# Research — Landing institucional editorial

## Decision 1: Pair Source Serif 4 with Geist Sans

**Decision**: Use Source Serif 4 variable for editorial headings and Geist Sans variable for navigation, body copy, controls and UI data; host both WOFF2 files locally.

**Rationale**: The reference uses this exact functional contrast. The serif provides institutional authority while the sans maintains digital clarity. Both support Spanish punctuation and accents.

**Alternatives considered**:

- Georgia + system sans: simpler, but changes metrics substantially and weakens visual fidelity.
- A single sans family: clearer but loses the editorial character requested.
- Remote font service: rejected because the feature forbids external requests.

## Decision 2: Preserve JPEG masters and serve modern derivatives

**Decision**: Keep supplied JPEG files immutable in `public/images/source/`; serve responsive AVIF and WebP files from `public/images/optimized/` through `picture`, retaining local JPEG fallback.

**Rationale**: This preserves source provenance while reducing transfer size and supporting browser negotiation.

**Alternatives considered**:

- JPEG only: rejected due to multi-megabyte masters.
- CSS backgrounds only: rejected because informative images require alt text and explicit dimensions.
- CDN transformation: rejected because deployment infrastructure and third-party requests are out of scope.

## Decision 3: Use internal anchors until official destinations exist

**Decision**: Every CTA navigates to an existing section in the page. No fictional email, domain or official service is included.

**Rationale**: The constitution prioritizes institutional truthfulness. An internal journey is complete and testable without inventing operational information.

**Alternatives considered**:

- Placeholder `mailto:`: rejected as misleading.
- Disabled buttons: rejected because they create dead controls.
- External gob.pe link: rejected because no official destination was supplied.

## Decision 4: Progressive enhancement for motion

**Decision**: Content remains visible by default. JavaScript adds an enhancement class before applying reveal states. Reduced-motion users receive no reveal transitions or smooth scrolling.

**Rationale**: The current pattern hides content in CSS before JavaScript runs, violating the no-JS edge case. Enhancement must never be a prerequisite for reading.

**Alternatives considered**:

- CSS-only reveal: rejected because it cannot reliably detect visibility while preserving fallback.
- Always-on animation: rejected for accessibility.
- No motion: acceptable but less faithful; retained as automatic fallback.

## Decision 5: Playwright over Chrome local for end-to-end verification

**Decision**: Use `@playwright/test` with the installed Chrome channel for navigation, keyboard, responsive overflow, reduced-motion and network assertions.

**Rationale**: The landing's risks are behavioral and visual, not algorithmic. Browser tests provide direct evidence against the acceptance scenarios.

**Alternatives considered**:

- Unit tests only: rejected because they cannot verify layout overflow or actual focus behavior.
- Download Playwright browsers: unnecessary because Chrome is installed locally.
- Manual-only QA: rejected because core criteria are deterministic and automatable.

## Decision 6: Keep the first component boundary small

**Decision**: Retain `App.tsx` plus the reusable `Picture` component for this delivery. Extract more components only when a concrete test or maintenance need appears.

**Rationale**: A single static page does not benefit from a premature component hierarchy. The plan favors observable simplicity.

**Alternatives considered**:

- One component per section: rejected as ceremony without independent behavior.
- Static HTML only: viable, but React is already approved and the mobile menu requires controlled interaction.

## Remaining non-blocking unknowns

- Final institutional copy, logo, contact destination, domain and publication environment.
- Exact Lighthouse score until a production build is served and audited.

These items do not block the static prototype because the spec explicitly excludes official destinations and publication.
