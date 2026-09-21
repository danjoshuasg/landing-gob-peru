# Quickstart — Landing institucional editorial

## Prerequisites

- Node.js 20 or newer.
- npm 10 or newer.
- Google Chrome installed locally for browser verification.

## Setup

```bash
npm install
```

Expected result: dependencies install with zero reported vulnerabilities.

## Development

```bash
npm run dev
```

Expected result: Vite prints a local URL and serves the landing with hot reload.

## Static verification

```bash
npm run typecheck
npm run build
```

Expected result: both commands exit with code 0 and `dist/` is generated.

## Browser verification

```bash
npm run test:e2e
```

Expected result: navigation, keyboard menu, internal links, responsive overflow, image delivery and reduced-motion checks pass in local Chrome.

## Production preview

```bash
npm run preview -- --host 127.0.0.1
```

Expected result: the generated production build is served locally for visual review and Lighthouse.

## Visual matrix

Review full-page screenshots at:

- 360 × 800
- 390 × 844
- 768 × 1024
- 1024 × 768
- 1440 × 1000

Confirm:

- no horizontal overflow;
- no clipped headings, cards or controls;
- the three illustrations remain recognizable;
- the Casa de Pizarro closes the footer without covering navigation;
- Source Serif 4 and Geist Sans load locally;
- no placeholder contact or broken asset remains.
