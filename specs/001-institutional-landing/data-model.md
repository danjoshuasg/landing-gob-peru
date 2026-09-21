# Data Model — Landing institucional editorial

The feature has no persistent data. This document defines the static content model used to verify completeness and navigation consistency.

## Section

| Field | Type | Rules |
|---|---|---|
| `id` | string | Unique, kebab-case, usable as an HTML anchor |
| `eyebrow` | string | Optional; short contextual label |
| `title` | string | Required; concise editorial heading |
| `body` | string or string[] | Required unless the section is purely navigational |
| `cta` | NavigationItem | Optional; must resolve internally in this delivery |
| `image` | ImageAsset | Optional |

## NavigationItem

| Field | Type | Rules |
|---|---|---|
| `label` | string | Required and understandable outside visual context |
| `href` | string | Must begin with `#` and match an existing Section `id` |
| `priority` | primary / secondary / text | Determines visual emphasis only |

## ImageAsset

| Field | Type | Rules |
|---|---|---|
| `name` | enum | `metric`, `box-right`, `panoramic-footer` |
| `master` | path | Local immutable JPEG source |
| `avif` | path[] | Local responsive derivatives |
| `webp` | path[] | Local responsive derivatives |
| `width` | positive integer | Intrinsic master width |
| `height` | positive integer | Intrinsic master height |
| `alt` | string | Required for informative images |
| `sizes` | string | Required responsive selection hint |
| `loading` | eager / lazy | Only the first-screen image may be eager |

## Principle

| Field | Type | Rules |
|---|---|---|
| `number` | string | Stable visible sequence such as `01` |
| `title` | string | Required |
| `copy` | string | One concise explanatory paragraph |

## MenuState

| Field | Type | Rules |
|---|---|---|
| `open` | boolean | Default false |
| `trigger` | button reference | Receives focus when menu closes with Escape |
| `panelId` | string | Matches trigger `aria-controls` |

### State transitions

```text
closed --activate trigger--> open
open --activate trigger--> closed
open --select link--> closed + navigate
open --press Escape--> closed + focus trigger
```

## Validation relationships

- Every `NavigationItem.href` resolves to exactly one `Section.id`.
- Every image enum maps to a JPEG master plus at least one AVIF and one WebP derivative.
- No content entity contains an unverified official contact, figure or external URL.
