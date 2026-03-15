# HMS Tracker — Design System
`File 4 of 12 | v1.0 | March 2026`

---

## Design Philosophy

Dark mode first. Premium fintech feel. Gold as the hero colour — every rupee matters, every number commands attention.

Language: *Capital Deployed* not *Expense*. *Your Capital Today* not *Balance*. *Wealth Purification* not *Zakat Due*.

---

## Colour Palette

| Token | Value | Usage |
|---|---|---|
| `--color-bg-primary` | `#1A1A2E` | App background — deep navy |
| `--color-bg-secondary` | `#16213E` | Cards, modals |
| `--color-bg-tertiary` | `#0F3460` | Elevated surfaces, inputs |
| `--color-accent` | `#C9A84C` | Gold — hero numbers, CTAs, active states |
| `--color-accent-soft` | `#F5DFA0` | Soft gold — velocity positive |
| `--color-text-primary` | `#F0EAD6` | Warm white — body text |
| `--color-text-secondary` | `#A8A8B3` | Muted — labels, metadata |
| `--color-success` | `#10B981` | Positive velocity, completed goals |
| `--color-danger` | `#EF4444` | Negative velocity, overdue, delete |
| `--color-warning` | `#F59E0B` | Stale rates, near-deadline goals |

---

## Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Body | Sora | 400/500 | 1rem |
| Headings | Sora | 600/700 | 1.125–1.75rem |
| Hero amounts | JetBrains Mono | 700 | clamp(1.875rem, 8vw, 2.75rem) |
| All amounts | JetBrains Mono | 600/700 | 0.875–1.375rem |
| Labels | Sora | 600 | 0.6875rem + uppercase + letter-spacing |

---

## Spacing Scale

```
--space-xs:  4px
--space-sm:  8px
--space-md:  16px
--space-lg:  24px
--space-xl:  32px
--space-2xl: 48px
```

---

## Radius Scale

```
--radius-sm:   8px   (inputs, small buttons)
--radius-md:   12px  (cards, modals)
--radius-lg:   20px  (bottom sheets)
--radius-full: 9999px (pills, FAB, dots)
```

---

## Components

### Capital Hero Card
- Gold top border gradient
- JetBrains Mono hero amount
- Velocity badge (green up / red down)
- SVG sparkline below

### Goal Progress Ring (SVG)
- 44×44 viewBox, r=18
- Background track: `--color-bg-tertiary`
- Fill: green ≥70%, amber 30-70%, red <30%
- Text label: percentage centred inside ring
- `role="img"` + `aria-label` for accessibility

### FAB (Floating Action Button)
- Fixed, bottom-centre above nav
- Gold background, navy icon
- Gold box-shadow glow
- Rotates icon 45° when modal is open

### Bottom Sheet Modal
- Slides up from bottom
- Drag handle (decorative CSS ::before)
- Backdrop blur
- Max-height 90dvh, overscroll-behavior: contain

### Toast
- Slides in from top
- Left border accent colour per type
- Auto-dismiss 3 seconds
- role="status" for screen readers

### PIN Keypad
- 3×4 grid
- 64px tall keys
- Dot indicators (4 dots, gold when filled)
- Shake animation on wrong PIN

---

## Progress Bar Colours

| Range | Colour | Meaning |
|---|---|---|
| 0–30% | `--color-danger` red | Urgent — barely started |
| 30–70% | `--color-warning` amber | In progress |
| 70–100% | `--color-success` green | On track |
