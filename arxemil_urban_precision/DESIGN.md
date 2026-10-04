---
name: Arxemil Urban Precision
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#d1c6ab'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#9a9078'
  outline-variant: '#4d4632'
  surface-tint: '#eec200'
  primary: '#ffecb9'
  on-primary: '#3c2f00'
  primary-container: '#facc15'
  on-primary-container: '#6c5700'
  inverse-primary: '#735c00'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#dbf0ff'
  on-tertiary: '#00354a'
  tertiary-container: '#99d9ff'
  on-tertiary-container: '#006083'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe083'
  primary-fixed-dim: '#eec200'
  on-primary-fixed: '#231b00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  display:
    fontFamily: Syne
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Syne
    fontSize: 38px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Syne
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Syne
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Syne
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Syne
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: 0em
  headline-md:
    fontFamily: Syne
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Syne
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an urban, high-tempo, architectural aesthetic tailored for a contemporary barbershop and hair studio. Rooted in the visual juxtaposition of historic stone ramparts and cutting-edge street style, the visual identity fuses industrial precision with nightlife-inspired dark-mode energy.

### Target Audience & Personality
- **Audience:** Style-conscious urban youth, young professionals, and creatives seeking premium grooming, sharp skin fades, custom styling, and modern color treatments.
- **Brand Attributes:** Precise, energetic, unapologetic, confident, and effortless.
- **Emotional Response:** Clients experience the atmosphere of an exclusive backstage styling lounge—sharp, hygienic, premium, and rhythmically ordered. Management experiences an uncluttered, high-utility cockpit built for rapid client turnaround and operational precision.

### Design Style: Modern Technical Noir
The aesthetic blends technical minimalism with high-contrast tactile elements:
- Deep carbon slate backdrops establish optical depth and reduce eye strain in fast-paced salon environments.
- High-voltage cyber amber/gold accents provide immediate directional clarity and energetic focus.
- Micro-textures, hairline carbon borders, and translucent dark surfaces bring structural discipline to both the mobile appointment booking flow and the dense administrative desktop calendar.

## Colors

The palette relies on absolute darkness, subtle carbon gradients, and razor-sharp spectral accents. Ambient slate bases allow primary neon amber highlights to guide high-priority interactions without visual fatigue.

### Core Roles & Palette Structure
- **Canvas Base (`#090D16`):** The master ambient backdrop. A deep, tinted obsidian slate that feels warmer and more tactile than pure black.
- **Surface Elevation Layers:**
  - `surface-1` (`#0F172A`): Primary container tier for dashboard modules, scheduling panes, and service selector surfaces.
  - `surface-2` (`#18181B`): Secondary elevation for popovers, floating selectors, and hover state elevations.
  - `surface-3` (`#27272A`): Interactive chips, input backgrounds, and inactive segment tabs.
- **Primary Cyber Gold (`#FACC15`):** High-intent focus color. Used for confirmed appointment tags, active time-slot selections, primary calls to action, and focus rings.
- **Secondary Burnished Amber (`#F59E0B`):** Warm structural counterpart used for metric callouts, team availability signals, and VIP loyalty tags.
- **Tertiary Cyan Slate (`#38BDF8`):** Utility accent dedicated to real-time calendar syncing, technician notifications, and status states (in-chair, processing, completed).
- **Hairline Structural Borders (`#27272A` / 20–40% alpha overlays):** Low-contrast structural rules that frame containers cleanly against deep slate surfaces.
- **Text & Foreground Hierarchy:**
  - `text-primary` (`#F8FAFC`): Crisp titanium white for headings, selected dates, and active prices.
  - `text-secondary` (`#94A3B8`): Muted industrial slate for descriptions, duration indicators, and column labels.
  - `text-muted` (`#64748B`): Deep secondary grey for disabled slots and metadata.

## Typography

The typographic hierarchy combines three distinct voices: sculptural display geometry for brand swagger, ultra-legible humanist sans for core interactions, and technical monospaced rhythm for numbers, timestamps, and scheduling intervals.

- **Display & Section Headers (Syne):** Brings sharp, structural, editorial swagger. Used for hero screens, service category names (e.g., "SKIN FADE & BEARD SCULPT"), barber names, and metric totals.
- **Interface & Reading Flow (Plus Jakarta Sans):** Chosen for its rounded geometric friendliness and exceptional legibility at micro-scales on mobile viewports. It handles service summaries, client profiles, and administrative notes effortlessly.
- **Metrics, Tags, and Slots (Space Grotesk):** Provides an architectural cadence. Applied to appointment slot buttons (`10:45 AM`), service prices (`28.00 €`), durations (`45 MIN`), and backoffice statistical counters.

## Layout & Spacing

The system accommodates two distinct product surfaces: an ergonomic, mobile-first one-handed booking wizard and a data-dense, multi-column desktop operations hub.

### Spacing Principles
- **Base Grid (8pt System):** All component gaps, internal paddings, and vertical rhythm points align to multiples of 4px and 8px to guarantee visual cohesion across diverse screen resolutions.
- **Mobile Booking Engine (Viewport < 768px):**
  - Uses a fluid single-column stack with persistent bottom-pinned action dock.
  - Safe margins: `16px` (`margin`). Internal component padding: `16px` (`space-md`).
  - Wizard steps advance horizontally using viewport-locked snap carousels without page reloads.
- **Desktop Backoffice Cockpit (Viewport >= 1024px):**
  - Operates on an asymmetrical 12-column split: a 260px fixed collapsible rail for navigation, combined with an interactive 12-column multi-barber calendar grid.
  - Column gutters: `24px` (`gutter-desktop`). Outer viewport margins: `32px` (`margin-desktop`).
  - Agenda time intervals scale on vertical increments of `48px` per 30-minute block.

## Elevation & Depth

This design system avoids heavy drop shadows in favor of a layered carbon approach using luminosity, subtle backdrop blurs, and chromatic perimeter strokes.

### Tiers of Elevation
- **Layer 0 (Canvas Floor):** Unlit `#090D16` matte surface.
- **Layer 1 (Card & Module Foundation):** `#0F172A` filled with a 1px perimeter border of `#27272A`. This creates clear spatial division without drop shadows.
- **Layer 2 (Floating Pickers & Active States):** `#18181B` with `backdrop-filter: blur(12px)` and a directional top highlight: a hairline gradient stroke transitioning from `rgba(250, 204, 21, 0.35)` to `transparent`.
- **Layer 3 (Modals, Overlays & Dragged Blocks):** `#18181B` elevated via ambient drop shadow: `0 20px 40px -15px rgba(0, 0, 0, 0.8)` paired with an inner edge border `rgba(255, 255, 255, 0.08)`.

### Active Glow & Energy Accent
When an appointment card or calendar slot is active or dragged, a localized luminous glow is applied:
- `box-shadow: 0 0 24px -4px rgba(250, 204, 21, 0.25)`
This visual feedback reinforces tactile confirmation on touch devices and provides immediate status cues in dense calendar displays.

## Shapes

The geometric vocabulary balances modern ergonomics with high-end industrial polish.

- **Corner Radius Scale:**
  - Base Elements (`0.5rem` / `8px`): Compact time-slot pills, calendar entry chips, and backoffice table badges.
  - Standard Containers (`1rem` / `16px`): Service selection cards, stylist profile panels, and form fields.
  - Hero Panels (`1.5rem` / `24px`): Booking wizard step dialogs, bottom sheets, and metric overview widgets.
- **Pill Geometry (`9999px`):** Reserved exclusively for status indicators (`AVAILABLE`, `IN SEAT`, `OFF DUTY`) and the primary mobile checkout slide trigger.

## Components

### 1. Buttons
- **Primary (Action Hero):** Filled with Cyber Gold (`#FACC15`), solid `#090D16` typography using `Space Grotesk Bold`. On hover: subtle scale `1.02` with an ambient glow of `rgba(250, 204, 21, 0.4)`.
- **Secondary (Outline Precision):** 1px border `#27272A`, background `rgba(24, 24, 27, 0.6)`, text `#F8FAFC`. On hover: border shifts to Cyber Gold with text illumination.
- **Ghost (Operational):** Transparent base, `#94A3B8` text, transitioning to `#F8FAFC` over a `rgba(255, 255, 255, 0.05)` backdrop.

### 2. Service Selection Cards (Mobile Booking)
- Structural containers built on `rounded-2xl` (`1.5rem`), background `#0F172A`, bordered by `#27272A`.
- Display layout: Service title (`headline-sm`), duration chip with clock glyph (`Space Grotesk`), descriptive details (`body-sm`), and a right-aligned price badge in bold titanium white.
- Selection behavior: Tapping toggles a 1.5px border of `#FACC15` alongside a subtle gold wash overlay (`rgba(250, 204, 21, 0.04)`).

### 3. Professional / Barber Selection Cards
- Square/compact cards featuring high-contrast grayscale portraits of the barber with an active gradient rim.
- Indicator dot: Emerald for available today, Cyber Amber for limited slots remaining.
- Displays specialist tags (e.g., "Fade Specialist", "Beard Sculptor") in `label-sm`.

### 4. Interactive Time Slot Matrix
- Dense grid layout (`3` or `4` columns on mobile, dynamic flex wrap on desktop).
- Inactive slots: `#18181B` surface, `#64748B` text, no border.
- Available slots: `#0F172A` surface, 1px border `#27272A`, `#F8FAFC` text.
- Selected slot: Solid `#FACC15` surface, `#090D16` bold text, high-visibility elevation glow.

### 5. Input Fields & Form Controls
- Height: 48px standard touch target.
- Background: `#0F172A` with `#27272A` hairline perimeter.
- Focus State: Border snaps to `#FACC15` with a `0 0 0 2px rgba(250, 204, 21, 0.15)` focus ring. Placeholder text styled in `#64748B`.

### 6. Backoffice Agenda Calendar View
- Multi-column agenda view where columns represent styling chairs / barbers.
- Current Time Marker: Horizontal neon laser rule (`#FACC15`) spanning the full width with a pulsing beacon point.
- Booking blocks: Rounded `8px` container chips color-coded by service tier:
  - Standard Cuts: `#18181B` border `#27272A`.
  - VIP / Chemical Services: `#0F172A` with Amber accent stripe on the left edge (`3px`).
- Quick-actions panel on right-click / tap: Reschedule, Mark No-show, Complete & Pay.

### 7. Team Stats & KPI Widgets
- Compact dark containers featuring large-scale Syne display numbers.
- Micro trend graphs rendered in monochrome slate with high-visibility accent peaks (`#38BDF8` or `#FACC15`).