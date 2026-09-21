# Image ledger

## Immutable masters

| Asset | Dimensions | SHA-256 | Role |
|---|---:|---|---|
| `public/images/source/box-right.jpeg` | 2390×1792 | `49ed39a68992f355b67144f15cf8616b0dac957e6c996e61b26d16581a6c9a28` | Institutional field scene |
| `public/images/source/segunda-imagen.jpeg` | 2732×1536 | `1f6db47cbfd9b401c73e0596b5bdb69cde9364b6863e8cc2d82c93d53b423920` | Hero panorama of San Isidro |
| `public/images/source/metric.jpeg` | 2390×1792 | `209d05f387b0c2a76512b902f6ecfc62311e3bfdfdc2da140e92abac537f2d67` | Territorial view |
| `public/images/source/panoramic-footer.jpeg` | 3652×1152 | `c21881eae326e0b5c42295c889639fcbcb5ef8396bb0c773109c8f088bed4a7b` | Casa de Pizarro footer panorama |

The hashes above are the source-integrity contract. Optimizing derivatives must never alter these files.

## Responsive derivatives

| Asset | Bytes |
|---|---:|
| `box-right-800.avif` | 102,615 |
| `box-right-800.webp` | 166,766 |
| `box-right-1600.avif` | 345,005 |
| `box-right-1600.webp` | 623,770 |
| `segunda-imagen-960.avif` | 97,505 |
| `segunda-imagen-960.webp` | 141,696 |
| `segunda-imagen-1920.avif` | 260,177 |
| `segunda-imagen-1920.webp` | 410,764 |
| `metric-960.avif` | 116,368 |
| `metric-960.webp` | 177,438 |
| `metric-1920.avif` | 304,799 |
| `metric-1920.webp` | 540,038 |
| `panoramic-footer-1200.avif` | 88,871 |
| `panoramic-footer-1200.webp` | 121,742 |
| `panoramic-footer-2560.avif` | 308,774 |
| `panoramic-footer-2560.webp` | 446,288 |

## Delivery policy

- AVIF is offered first, WebP second and the local JPEG master only as fallback.
- The first hero image loads eagerly; all later images load lazily.
- Every `img` declares intrinsic dimensions and useful alternative text.
- No image is requested from a third-party host.
- Browser selection is controlled by `srcset` and `sizes` in `src/components/Picture.tsx`.
