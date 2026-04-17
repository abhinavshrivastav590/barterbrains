# Design Brief: BarterBrains

## Direction & Tone
Productivity platform for peer-to-peer skill exchange. Modern, clean, minimal aesthetic with warm approachability. Emphasizes trust, clarity, and community. No decoration — information-dense layouts optimized for matching, booking, and real-time communication.

## Color Palette
| Role | OKLCH | Purpose |
|------|--------|---------|
| Primary | 0.52 0.1 210 (Teal) | Buttons, active states, CTAs — conveys trust and openness |
| Secondary | 0.88 0.05 180 (Soft cyan) | Subtle backgrounds, skill badges, secondary UI |
| Accent | 0.65 0.12 35 (Warm amber) | Highlights, warnings, trust score icons |
| Destructive | 0.55 0.24 25 (Red) | Reject/cancel actions, alerts |
| Neutral | 0.14–0.98 L / 0 C (Achromatic) | Background, cards, borders, foreground text |

## Typography
| Tier | Font | Use |
|------|------|-----|
| Display | General Sans (600/700) | Headers, skill titles, match names |
| Body | DM Sans (400/500) | Descriptions, labels, chat, form inputs |
| Mono | Geist Mono | Code snippets (ratings, timestamps) |

## Structural Zones
| Zone | Treatment |
|------|-----------|
| Header | `bg-background` with `border-b border-border`, sticky, contains logo, search, notifications |
| Main content | `bg-background`, cards use `bg-card border-border`, 2–3 column grid on desktop |
| Skill cards | `bg-secondary/20` badge backgrounds, clean skill pill labels |
| Match cards | `bg-card` with subtle `shadow-xs`, hover `shadow-md`, trust score as inline badge |
| Session state | Color-coded: active=green, pending=amber, completed=blue |
| Footer | `bg-muted/40 border-t border-border` (if needed) |

## Component Patterns
- **Buttons**: Primary (teal bg, white text), Secondary (border only), Ghost (text only)
- **Badges**: Skill badges in `secondary/20` bg; trust score as inline flex with star icon
- **Cards**: Uniform `rounded-lg`, `border-border`, `shadow-xs` (elevates on hover)
- **Forms**: Inputs with `bg-input border-border`, focus ring in primary teal
- **Notifications**: In-app badge counts only (no email); inline toast notifications for actions
- **States**: Active matches highlighted via primary teal accent; inactive/rejected faded to `muted-foreground`

## Spacing & Rhythm
- Container padding: `2rem` (desktop), `1.5rem` (tablet), `1rem` (mobile)
- Card gaps: `1.5rem` between cards in grid
- Typography line-height: 1.5 (body), 1.2 (display)
- Density: Moderate — white space emphasized to reduce cognitive load

## Motion
- **Transitions**: All interactive elements use `.transition-smooth` (0.3s cubic-bezier)
- **Hover**: Cards elevate via shadow; buttons scale slightly (1.02)
- **State changes**: Match acceptance/rejection fade with 200ms easing
- **Chat**: Messages slide in from bottom with 150ms stagger

## Accessibility & Constraints
- Minimum contrast: WCAG AA+ for foreground on background (L diff ≥ 0.7)
- Focus ring: 2px primary teal outline on all interactive elements
- Responsive: Mobile-first; breakpoints at 640px, 768px, 1024px
- Dark mode: Full support with tuned chroma for readability (primary 0.68 L, lower contrast relief)

## Signature Detail
Skill badge system with soft, rounded pill design and semantic color coding: offered skills in primary teal, wanted skills in accent amber. Trust score displayed as stars with small numeric label. This visual language reinforces the bidirectional, collaborative nature of the platform.
