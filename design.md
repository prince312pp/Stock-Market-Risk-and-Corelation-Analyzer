# Stock Market Risk & Correlation Analyzer — UI/UX Design Specification

> **Design concept:** Minimalist financial workspace with restrained neumorphism. The interface should feel calm, precise, premium, and exceptionally easy to scan. Data—not decoration—is the hero.
>
> **Primary instruction:** Redesign the existing application using this document as the visual and interaction source of truth. Improve the current UI without changing its business logic, statistical formulas, API contracts, database structure, approved stock universe, or product scope.

---

## 1. Product and design goal

The Stock Market Risk & Correlation Analyzer is an academic, presentation-focused application. Its job is to make real historical NSE stock data, statistical calculations, correlations, and portfolio risk easy to understand and explain.

The UI should communicate three things immediately:

1. **Trust:** show where data comes from and the latest date available.
2. **Clarity:** make each metric, chart, filter, and calculation understandable without financial expertise.
3. **Craft:** present the functionality in a polished, coherent interface that feels like a modern specialist fintech product.

### Desired visual character

- Minimalist, not empty.
- Premium, not flashy.
- Soft and tactile, not blurry or low contrast.
- Data-dense where necessary, never cluttered.
- Modern, but not a copy of a generic admin dashboard.
- Consistent across all four existing product areas.

### The central design rule

**Use minimalism for structure and neumorphism for selected moments of tactility.** Do not turn every panel, button, and input into a soft raised tile. Most of the page should remain flat, spacious, and easy to scan.

---

## 2. Research principles behind this design

This specification synthesizes established interface and dashboard guidance:

- Nielsen Norman Group recommends removing irrelevant information and keeping visual design focused on essential user goals. Its dashboard guidance emphasizes at-a-glance comprehension and using visual attributes such as position and length to communicate quantitative information quickly.
- Apple’s Human Interface Guidelines recommend a clear hierarchy, deliberate alignment, grouping through spacing, and layouts that adapt to available screen size. Its typography guidance stresses legibility and avoiding overly light text weights.
- IBM’s data-visualization guidance recommends concise titles and labels, useful axes and ticks, and avoiding chart clutter.
- WCAG 2.2 requires that color is not the only means of communicating information and specifies minimum text contrast of 4.5:1 for normal text and 3:1 for large text.
- Neumorphism can create a soft, tactile appearance, but relying on shadows alone can make controls hard to distinguish. Therefore this design uses it sparingly and pairs it with readable contrast, visible component boundaries, labels, and focus states.

See **Section 18 — Research references** for the source links.

---

## 3. Visual direction: “Quiet Precision”

### 3.1 Design keywords

`Minimal` · `Tactile` · `Editorial` · `Precise` · `Calm` · `Premium` · `Readable` · `Data-first`

### 3.2 What the interface should look like

- Deep ink background with a subtle tonal surface system.
- Large, confident page titles and crisp numerical typography.
- A restrained blue accent for primary actions and selected states.
- Very soft shadows for a small number of raised controls and surfaces.
- Inset treatment for selected inputs and compact data wells.
- Charts with thin axes, restrained gridlines, clear tooltips, and enough breathing room.
- Generous page spacing, consistent alignment, and predictable patterns.
- Subtle transitions that make state changes feel deliberate.

### 3.3 What it must not look like

- A generic SaaS admin template with a card around every piece of content.
- A crypto exchange with neon green/red everywhere.
- A glassmorphism-heavy concept with blur behind every panel.
- A neumorphic interface where inputs and buttons are indistinguishable from the page background.
- A dashboard filled with gradients, glowing outlines, animated numbers, decorative charts, or meaningless badges.
- A dense spreadsheet squeezed into cards.

---

## 4. Design tokens

Use semantic tokens rather than hard-coding colors separately in each component. Keep the existing palette as the starting point and standardize its usage.

### 4.1 Dark theme palette

| Token | Value | Intended use |
|---|---|---|
| `--bg` | `#0B1020` | Main application canvas |
| `--surface-1` | `#111827` | Sidebar and primary content surfaces |
| `--surface-2` | `#182235` | Raised panels, selected tiles, menus |
| `--surface-inset` | `#0D1422` | Inputs, chart wells, recessed controls |
| `--border-subtle` | `#293548` | Quiet component edges and table separators |
| `--text-primary` | `#F3F6FC` | Headings, key values, primary content |
| `--text-secondary` | `#A8B3C7` | Supporting text and labels |
| `--text-muted` | `#8794AA` | Metadata and secondary helper text |
| `--accent` | `#60A5FA` | Main action, links, focus, selected state |
| `--accent-soft` | `rgba(96,165,250,.12)` | Subtle selected-state background |
| `--positive` | `#34D399` | Positive returns and gains |
| `--negative` | `#F87171` | Negative returns, losses, errors |
| `--warning` | `#FBBF24` | Warnings, incomplete or stale data |
| `--chart-grid` | `rgba(168,179,199,.12)` | Chart gridlines |
| `--overlay` | `rgba(4,8,18,.72)` | Modal and drawer backdrops |

If a token fails contrast against its actual background, adjust the token rather than reducing font size or relying on a glow. Validate normal text against WCAG AA (4.5:1) and large text against 3:1.

### 4.2 Color usage rules

- Neutral surfaces should make up the majority of the interface.
- Blue is reserved for primary interactions, active navigation, links, and selected data.
- Green and red represent positive and negative values, respectively. Always pair color with a sign, label, icon, or text so meaning does not depend on color alone.
- Amber is reserved for warnings and caveats.
- Do not assign a new accent color to every section or stock.
- Avoid full-card green or red fills. Tint a small badge, icon, or value instead.
- Do not use gradients as a replacement for hierarchy.

### 4.3 Typography

Use the existing Inter font if already installed. Otherwise use a system sans-serif stack; do not add a large font dependency just for visual styling.

| Role | Desktop target | Weight | Use |
|---|---:|---:|---|
| Page title | 30–34px | 600 | Main page heading |
| Section title | 18–20px | 600 | Chart and content section headings |
| KPI value | 28–34px | 600 | Primary financial metrics |
| Sub-metric value | 18–22px | 600 | Supporting values |
| Body | 14–15px | 400 | Explanations and descriptions |
| Table data | 13–14px | 400–500 | OHLCV and statistical tables |
| Field label | 12–13px | 500 | Input and metric labels |
| Helper/meta | 12–13px | 400 | Data source, dates, contextual notes |

Typography rules:

- Use tabular numerals for prices, percentages, weights, and statistics: `font-variant-numeric: tabular-nums`.
- Use sentence case. Avoid shouting with all-caps section labels.
- Avoid very light font weights, especially for small text.
- Keep labels concise and explicit: “Annualized volatility”, not “Vol”.
- Align numbers consistently within tables and metric groups.
- Format negative values consistently, e.g. `−1.24%`.
- Define a single scale and use it across every page.

### 4.4 Shape and spacing

| Token | Value |
|---|---:|
| `--radius-sm` | 8px |
| `--radius-md` | 12px |
| `--radius-lg` | 16px |
| `--radius-xl` | 20px |
| `--radius-pill` | 999px |
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |

Use a consistent 4px/8px spacing rhythm. Prefer whitespace over decorative separators.

---

## 5. Neumorphism: use it with restraint

Neumorphism is a supporting visual language, not a universal component treatment.

### 5.1 Three surface types

**Flat — default**
- Use for page sections, most cards, tables, and text content.
- Establish groups with spacing and subtle tonal differences.
- This should be the dominant surface treatment.

**Raised — selective emphasis**
- Use for a small number of KPI surfaces, primary control clusters, floating menus, and selected interactive elements.
- Suggested shadow:

```css
box-shadow:
  7px 7px 16px rgba(0, 0, 0, 0.24),
  -4px -4px 12px rgba(255, 255, 255, 0.025);
```

**Inset — controls and wells**
- Use for date/select inputs, search fields, compact segmented controls, and chart wells when the inset appearance improves understanding.
- Suggested shadow:

```css
box-shadow:
  inset 3px 3px 7px rgba(0, 0, 0, 0.24),
  inset -2px -2px 6px rgba(255, 255, 255, 0.018);
```

### 5.2 State design

Every interactive component must have clear states:

- **Default:** visible label and boundary; gentle or no shadow.
- **Hover:** small surface or border change; no large movement.
- **Pressed:** slight inset/depressed appearance, not a dramatic scale effect.
- **Selected:** clear accent indicator plus a visible text/icon change.
- **Focus-visible:** high-contrast 2px focus ring with offset. Never remove keyboard focus styling.
- **Disabled:** visibly disabled, still legible, and not mistaken for an active control.
- **Error:** explicit message and icon/text, not only a red outline.

Do not rely on shadows alone to indicate that an element is clickable. Use recognizable button/input shapes, labels, borders or accent states, and accessible focus styles.

### 5.3 Neumorphism limits

- No more than one raised/inset effect inside another raised/inset effect.
- Avoid large, blurry shadows.
- Do not use neumorphism on dense data tables or chart plots.
- Do not make text low contrast to preserve a monochrome look.
- Keep the main action visually obvious even when viewed on a projector.

---

## 6. Application layout

### 6.1 Desktop shell

Use a consistent left navigation and content workspace.

- Sidebar width: 232–248px.
- Main content: fluid, capped around 1440px where appropriate.
- Main horizontal padding: 32px on wide screens, 24px on medium screens.
- Main section spacing: 28–36px.
- Component spacing: 16–20px.
- Sidebar should remain visually quiet and not compete with analytical content.

### 6.2 Sidebar

The sidebar should include only the elements already supported by the product:

1. Compact product mark/name: **Stock Risk Analyzer**.
2. Primary navigation:
   - Overview
   - Stock Analysis
   - Correlation
   - Portfolio Calculator
3. Optional small footer note for the data source or academic project context, if already available in the app.

Interaction:
- Active page uses a subtle blue-tinted surface and a slim accent marker.
- Icons use Lucide React at consistent 18–20px size and stroke weight.
- Hover state is quiet and fast.
- The whole navigation item is clickable, not only its icon or label.
- Provide visible focus states and semantic links.

Do not add login, user profile, admin, subscription, trading, or other out-of-scope navigation.

### 6.3 Top page header

Each page begins with:

- Page title.
- One concise sentence explaining what the page shows.
- Relevant contextual controls (stock selector, date range, or pair selector) aligned consistently.
- Data freshness context where applicable: source and latest available data date.

Avoid filling the header with decorative badges or unrelated utility buttons.

### 6.4 Responsive behavior

**Wide desktop (≥1280px)**
- Full sidebar.
- Two-column chart and metric layouts when useful.
- Avoid excessive empty horizontal space; maintain sensible content width.

**Tablet (768–1279px)**
- Narrow or collapsible sidebar.
- Reduce metric grid columns.
- Stack chart panels when their labels or legends would become cramped.

**Mobile (<768px)**
- Compact drawer or bottom navigation.
- Single-column content.
- Keep primary selectors near the page heading.
- Tables may scroll horizontally; do not compress financial values into unreadable columns.
- Charts should retain readable tooltips, labels, and tap targets.

Use responsive breakpoints based on available layout width, not assumptions about a specific device model.

---

## 7. Shared component specifications

### 7.1 Buttons

**Primary button**
- Blue fill, high-contrast text, 40–44px minimum height.
- Used only for the primary action on a page, such as fetching/updating market data or calculating a portfolio.
- Subtle hover brightening; no glowing border.

**Secondary button**
- Neutral surface with a visible border or restrained raised treatment.
- Used for reset, cancel, export if already supported, or secondary navigation.

**Icon button**
- Minimum 40×40px hit area where practical.
- Always provide an accessible name/tooltip.
- Avoid icon-only controls when the action is not obvious.

### 7.2 Inputs and selectors

- Label placed above the field, not only inside as placeholder text.
- Minimum height: 42–44px.
- Use inset surface subtly, with a clear edge and visible focus ring.
- Selected value must have strong contrast.
- Dropdown menu should use a raised surface with clear hover and selected states.
- Error/help message appears directly below the affected control.
- Make keyboard operation and screen-reader labeling work correctly.

### 7.3 KPI / metric surfaces

Use only metrics that already exist in the calculation layer.

Each KPI contains:
- Short metric label.
- Primary value with correct units.
- Optional contextual descriptor or date.
- Optional positive/negative badge, supported by text or sign.

Do not add fake percentage-change comparisons or invented insights. Do not repeat the same metric in multiple cards without a reason.

### 7.4 Tables

- Use flat surfaces, not neumorphic rows.
- Sticky header only when it helps with long data sets.
- Clear column names and units.
- Right-align numeric columns; left-align names and dates.
- Use tabular numerals.
- Keep row height comfortable (around 44–48px for primary data tables).
- Use subtle row separators; no heavy grid around every cell.
- Provide clear empty, loading, and error states.
- On mobile, provide horizontal scrolling with visible affordance and keep the first identifying column accessible if feasible.

### 7.5 Tooltips and popovers

- Dark elevated surface with high-contrast text.
- Short, direct explanation.
- Use for definitions of variance, covariance, volatility, correlation, and portfolio weight.
- Do not hide essential information exclusively inside a tooltip.
- Tooltips must also work on keyboard focus and touch-appropriate interactions.

### 7.6 Formula explanation blocks

This is an educational product; formula readability is important.

- Show the formula in a calm flat panel or lightly inset well.
- Use consistent mathematical notation.
- Display substituted actual values beneath the general formula.
- Clearly label units and whether a value is daily or annualized.
- Use a monospaced or math-friendly treatment only for formula expressions, not the whole page.
- Provide a short plain-language interpretation underneath.
- Ensure formulas wrap correctly on smaller screens.

### 7.7 Loading, empty, and error states

**Loading**
- Use skeletons that match the final component geometry.
- Add concise status text for long-running data fetches.
- Do not show fake prices or sample chart lines while data is loading.

**Empty**
- Explain why no results are present and give the next useful action.
- Examples: “Choose a stock to view historical data” or “Fetch market data for this date range”.

**Error**
- Plain-language explanation, relevant context, and a retry action if supported.
- Never display stack traces or raw provider errors to normal users.

**Stale/incomplete data**
- Clearly show the latest available date and explain that market data may not update on non-trading days or when the provider has a delay.
- Do not imply that data is real-time unless the backend truly provides real-time data.

---

## 8. Page design: Overview

### Goal

Provide an immediate, presentation-friendly snapshot of the selected stock and available market data. The user should understand the scope, the selected instrument, and its recent price behavior without scrolling through an overload of cards.

### Recommended structure

1. **Header**
   - Title: “Market Overview”.
   - Short description: “Explore historical performance and risk across the selected NSE stocks.”
   - Data source and latest available market date, shown as subdued but readable metadata.

2. **Selection row**
   - Selected stock selector.
   - Date range control if already supported.
   - Fetch/update action only if it exists in the current app.
   - Keep controls grouped and aligned.

3. **Primary metric strip**
   - Show a small set of the most useful existing metrics: latest close, daily return, annualized volatility, and selected-period mean return (only if available).
   - Use four compact, evenly spaced metrics on desktop; stack/reflow on smaller widths.
   - Do not create an oversized card for every value.

4. **Main historical price chart**
   - Give the chart the strongest visual priority on the page.
   - Use a clean line chart with a subtle area fill only if it improves visual comprehension.
   - Keep chart title, selected ticker, date range, and latest available date explicit.

5. **Secondary information**
   - A compact selected-stock information block and/or small data preview if supported.
   - Avoid duplicating the full Stock Analysis page here.

### Overview acceptance criteria

- A user can identify the selected stock and latest data date immediately.
- The historical chart is the visual anchor.
- Metrics have clear labels, units, and appropriate precision.
- The page does not contain unnecessary decorative cards or unsupported insights.

---

## 9. Page design: Stock Analysis

### Goal

Make individual stock analysis and the underlying calculations easy to inspect and explain.

### Recommended structure

1. Page heading and short explanation.
2. Stock selector and date-range controls.
3. Compact metric row:
   - Mean daily return.
   - Sample variance.
   - Daily standard deviation.
   - Annualized volatility.
4. Historical price chart.
5. Daily returns chart.
6. Formula and calculation explanation.
7. OHLCV data table.

### Layout guidance

- On desktop, price chart may receive full width; daily return chart can follow in a second panel or below it.
- Formula explanations should be visually connected to the metric they explain.
- OHLCV data should be below the main visualization, not competing with it at the top.
- Clearly indicate whether the return calculation uses Adjusted Close or Close.
- Clearly identify sample variance and sample standard deviation (`ddof=1`) in educational notes where appropriate.
- Date range and data-field selection should remain visible when users inspect the table.

### Formula presentation

For simple daily return:

`Rₜ = (Pₜ − Pₜ₋₁) / Pₜ₋₁`

Show the actual prices substituted for a selected date pair, when the current backend/UI supports it. Label the price field used. Explain that returns are proportions or percentages, not rupee prices.

For annualized volatility:

`σannual = σdaily × √252`

Explain the 252-trading-day convention in one short sentence.

### Stock Analysis acceptance criteria

- The user can select a stock and date range without confusion.
- Price and return charts have appropriate scales and labels.
- Statistical definitions and units are visible.
- The source price field is disclosed.
- OHLCV records are readable and sortable if sorting already exists.

---

## 10. Page design: Correlation

### Goal

Help users understand how the selected stocks move relative to one another and how strong the observed relationships are.

### Recommended structure

1. Page title and concise description.
2. Date-range selector and stock selection controls, if supported.
3. Correlation heatmap as the primary visual.
4. Correlation table and covariance table in clearly separated sections or tabs.
5. Selected-pair interpretation below the matrix.

### Heatmap behavior

- Use a diverging color scale centered at zero.
- Positive and negative correlation must be visually distinct.
- Show numeric values in cells where legibility allows.
- Use a tooltip with both stock names/symbols, exact coefficient, date range, and a plain-language strength description only if a valid interpretation function already exists.
- Keep diagonal self-correlation values visually subdued or clearly identified as 1.00.
- Use consistent stock ordering across rows and columns.
- On narrow screens, allow a deliberate horizontal-scroll region instead of shrinking all labels.

### Correlation interpretation

Explain the selected pair in plain language, for example: “A positive correlation indicates that the two return series tended to move in the same direction over this period.” Avoid saying that correlation proves causation or guarantees future co-movement.

### Correlation acceptance criteria

- The heatmap can be read without guessing what colors mean.
- Exact numeric coefficients are available.
- The date range and selected stocks are clear.
- Missing/unaligned observations are handled and explained, not hidden.
- No stock pair is matched by row position; date alignment is respected by the existing analysis logic.

---

## 11. Page design: Portfolio Calculator

### Goal

Make the effect of combining two stocks on portfolio risk understandable, transparent, and suitable for a live classroom demonstration.

### Recommended structure

1. Page title and short explanation.
2. Two-stock selection area.
3. Weight controls.
4. Portfolio calculation action and validation feedback.
5. Result summary.
6. Formula explanation with actual substituted values.
7. Individual-stock versus combined-portfolio risk comparison chart.

### Input experience

- Place the two stock selectors side by side on desktop and vertically on mobile.
- Use clear labels: “Stock 1” and “Stock 2”.
- Show weight as percentage, with a slider only if the current implementation supports it; pair it with a numeric input so precise values can be entered.
- Make the 100% total constraint explicit and visible.
- Show an immediate, understandable validation state when weights do not total 100%.
- Preserve long-only behavior; do not introduce leverage or short-selling controls.

### Results

Present the key portfolio results in a clear hierarchy:

- Portfolio mean return.
- Portfolio variance.
- Portfolio standard deviation.
- Individual stock risk values for comparison.

Clearly label whether each result is daily or annualized. Do not mix daily and annualized statistics in the same visual group without explicit units.

### Formula explanation

Show:

`Rₚ = w₁R₁ + w₂R₂`

`μₚ = w₁μ₁ + w₂μ₂`

`σₚ² = w₁²σ₁² + w₂²σ₂² + 2w₁w₂Cov(R₁,R₂)`

`σₚ = √σₚ²`

Below each formula, show the actual selected weights and calculated values. Add one plain-language sentence explaining the covariance term and why it matters.

### Risk comparison chart

- Compare stock 1, stock 2, and the combined portfolio using the same risk measure and time basis.
- Label the measure explicitly (for example, daily standard deviation or annualized volatility).
- Use a horizontal bar chart or clean column chart, whichever is easiest to read with the current data.
- Do not imply that a lower-risk portfolio is guaranteed to perform better.

### Portfolio acceptance criteria

- Weights are understandable and validation is immediate.
- Daily versus annualized metrics are never ambiguous.
- The displayed formula matches the calculation implementation.
- The comparison chart uses the same metric for all three entries.
- No investment advice, buy/sell signal, recommendation, prediction, or trading action appears.

---

## 12. Data visualization system

Charts are the most important visual elements in this application. They must prioritize precision and comparison over decoration.

### General chart rules

- Every chart has a concise, meaningful title.
- Axis labels include units where appropriate (₹, %, trading date, or coefficient).
- Use a sensible tick density; avoid crowding the chart with every date or value.
- Use thin, low-contrast gridlines and clearly visible data lines.
- Use direct labels when they improve comprehension; otherwise use a compact legend.
- Keep legends consistent and place them where they do not obscure data.
- Tooltips must provide exact values and dates, with appropriate number formatting.
- Ensure chart tooltips work with keyboard and pointer interactions where supported by the chart library.
- Do not rely on hover alone to communicate a critical value.
- Include a visible empty/loading/error state instead of drawing fabricated sample data.
- Avoid 3D charts, unnecessary chart animation, and decorative gradients.

### Chart-specific guidance

| Chart | Preferred treatment | Important details |
|---|---|---|
| Historical price | Line chart | ₹ axis, date axis, selected stock, exact tooltip values |
| Daily returns | Zero-centered line or bar chart | Percentage axis; positive/negative shown with color and sign |
| Volatility comparison | Horizontal bar or column chart | Same calculation window and annualization convention for all stocks |
| Correlation | Diverging heatmap | Fixed scale from −1 to +1, zero midpoint, numeric values and labels |
| Portfolio risk comparison | Horizontal bar/column chart | Compare stock 1, stock 2, and portfolio with the same metric and time basis |

### Chart motion

- Keep transitions short and subtle (roughly 150–220ms) when changing selected stock or filters.
- Do not animate every data point independently.
- Respect `prefers-reduced-motion`.
- Avoid motion that delays the reading of the chart or causes visual distraction during a presentation.

---

## 13. Motion and interaction language

Motion should communicate state, not entertain.

| Interaction | Recommended behavior |
|---|---|
| Navigation change | Subtle background/indicator transition, 150–180ms |
| Button hover | Slight tone change, 120–160ms |
| Button press | Small inset/shadow change; no bounce |
| Dropdown open | Short opacity/translate transition, 140–180ms |
| Chart/filter update | Short fade or line transition, 150–220ms |
| Modal/drawer | Soft fade and small movement, 160–220ms |
| Loading | Calm skeleton shimmer or static skeleton; not a flashy spinner |

Rules:
- No parallax, cursor-following effects, scroll-jacking, or excessive page entrance animations.
- No large spring/bounce effects on financial controls.
- Motion should never be required to understand a state change.
- Disable or reduce nonessential motion when `prefers-reduced-motion: reduce` is set.

---

## 14. Accessibility and usability requirements

Treat accessibility as a core quality requirement, not a final polish task.

### Contrast and color

- Target WCAG 2.2 AA contrast: 4.5:1 for normal text and 3:1 for large text.
- Do not use color as the sole indicator of positive/negative values, selected states, errors, or warnings.
- Preserve focus visibility on every interactive element.
- Do not use faint gray text for important labels or data.

### Keyboard and semantics

- All page navigation and controls must be keyboard operable.
- Provide a visible focus ring.
- Use semantic buttons, links, labels, inputs, tables, and headings.
- Give icon-only buttons accessible names.
- Do not use clickable `div` elements where a semantic control is appropriate.
- Ensure menus and dialogs manage focus correctly.

### Text and scaling

- Support browser zoom to at least 200% without loss of core functionality.
- Avoid fixed heights that clip labels or values.
- Make layouts adapt when text wraps.
- Keep the smallest important labels comfortably readable.

### Touch and pointer

- Keep interactive hit areas around 40–44px high where possible.
- Do not make tiny heatmap cells or chart controls the only way to access information.
- Ensure essential information is not available only through hover.

---

## 15. Implementation guidance for the existing stack

Use the installed stack and current architecture. Do not introduce a new design framework or replace working chart/data components just for stylistic reasons.

### Frontend

- React + Vite + TypeScript.
- Tailwind CSS for layout and styling, using shared design tokens.
- Recharts for existing data visualizations.
- Lucide React for icons.
- React Router for the existing four pages.
- Preserve existing TanStack Query usage if already present and useful.

### Implementation rules

1. Inspect the current component tree and styling before editing.
2. Identify shared shell elements and implement the design system there first.
3. Create reusable components for page headers, metric values, selectors, buttons, data tables, formula blocks, chart containers, empty states, and error states.
4. Store colors, radii, shadows, spacing, typography, and motion values centrally.
5. Avoid duplicate one-off CSS for the same component state.
6. Keep chart calculations and API fetching outside presentational components where the current architecture already separates them.
7. Do not change formulas, market-data behavior, tickers, or backend functionality as part of a visual redesign.
8. Do not add fake data to make a chart look populated.
9. Do not install large UI libraries unless there is a demonstrated need and approval.
10. Prefer a few excellent reusable components over many bespoke components.

### Suggested CSS token starting point

```css
:root {
  color-scheme: dark;
  --bg: #0B1020;
  --surface-1: #111827;
  --surface-2: #182235;
  --surface-inset: #0D1422;
  --border-subtle: #293548;
  --text-primary: #F3F6FC;
  --text-secondary: #A8B3C7;
  --text-muted: #8794AA;
  --accent: #60A5FA;
  --positive: #34D399;
  --negative: #F87171;
  --warning: #FBBF24;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  --shadow-raised: 7px 7px 16px rgba(0, 0, 0, 0.24),
                   -4px -4px 12px rgba(255, 255, 255, 0.025);
  --shadow-inset: inset 3px 3px 7px rgba(0, 0, 0, 0.24),
                  inset -2px -2px 6px rgba(255, 255, 255, 0.018);
  --focus-ring: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);
}

:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This is a starting point, not permission to overwrite the current stylesheet wholesale. Validate token contrast against the actual rendered backgrounds and adapt the existing theme carefully.

---

## 16. Redesign workflow for the coding agent

The app already exists. Treat this as a UI/UX refinement of the current working application, not a new product build.

### Phase 1 — Audit before changes

- Run the existing application and inspect all four pages.
- Review the current responsive behavior, styles, reusable components, and chart configurations.
- Record obvious visual inconsistencies, layout issues, and usability problems.
- Identify existing features and interactions that must remain unchanged.
- Do not start a full rewrite before understanding the existing implementation.

### Phase 2 — Build the design foundation

- Standardize design tokens.
- Refine typography, spacing, radii, surfaces, buttons, inputs, and focus states.
- Build a consistent application shell and navigation.
- Verify the shell at desktop, tablet, and mobile widths.

### Phase 3 — Refine each page

Recommended sequence:

1. Overview
2. Stock Analysis
3. Correlation
4. Portfolio Calculator

Complete one page at a time. Preserve its current behavior while improving hierarchy and clarity.

### Phase 4 — Interaction and accessibility pass

- Review keyboard navigation and focus states.
- Verify labels, empty states, loading states, error handling, and tooltips.
- Check text contrast and ensure values are not distinguished by color alone.
- Test chart readability and table overflow.
- Check reduced-motion behavior.

### Phase 5 — Visual QA and completion

- Run the app at common desktop, tablet, and mobile widths.
- Check for clipped text, inconsistent spacing, accidental horizontal overflow, chart label collisions, and inconsistent control heights.
- Compare all four pages for consistency.
- Run existing lint, type-check, and tests when available.
- Report exactly what changed and what was actually verified.

---

## 17. Final quality checklist

The redesign is complete only when these statements are true:

### Visual quality
- [ ] The application feels cohesive across all four pages.
- [ ] The page hierarchy is clear without relying on decoration.
- [ ] Neumorphism is subtle and selective, never overwhelming.
- [ ] Cards are not used for every element.
- [ ] Typography, spacing, radii, and colors are consistent.
- [ ] The UI looks polished on both a laptop and a projector.

### Usability
- [ ] A first-time user can understand where to start.
- [ ] Selectors, date controls, buttons, and navigation are obvious.
- [ ] Every key metric has a clear label and unit.
- [ ] Formula explanations are readable and educational.
- [ ] Empty, loading, stale-data, and error states are handled gracefully.

### Data visualization
- [ ] Charts use only real fetched/calculated data.
- [ ] Titles, axes, units, legends, and tooltips are clear.
- [ ] Chart colors are consistent and meaningful.
- [ ] Correlation heatmap has a clear zero midpoint and readable values.
- [ ] Portfolio risk comparison uses the same risk measure and time basis.

### Accessibility and responsive behavior
- [ ] Normal text meets WCAG AA contrast targets.
- [ ] Color is not the only signal for important meanings.
- [ ] All controls have visible keyboard focus.
- [ ] The interface works at 200% browser zoom.
- [ ] Mobile and tablet layouts do not clip or compress important data.
- [ ] Reduced-motion preferences are respected.

### Scope preservation
- [ ] No existing statistical formula or result was changed for styling purposes.
- [ ] No new stock symbols or unsupported data were introduced.
- [ ] No fake sample data was introduced.
- [ ] No authentication, trading, investment advice, prediction, payment, or unrelated features were added.
- [ ] Existing routes, API contracts, and database behavior remain intact.

---

## 18. Research references

These references informed the design principles in this document. Use them as guidance, not as templates to copy pixel-for-pixel.

1. **Nielsen Norman Group — 10 Usability Heuristics for User Interface Design**  
   https://www.nngroup.com/articles/ten-usability-heuristics/  
   Relevant: aesthetic and minimalist design; remove irrelevant information that competes with useful content.

2. **Nielsen Norman Group — Dashboards: Making Charts and Graphs Easier to Understand**  
   https://www.nngroup.com/articles/dashboards-preattentive/  
   Relevant: at-a-glance dashboards and visual attributes that help people interpret quantitative information quickly.

3. **Nielsen Norman Group — Visual Hierarchy in UX**  
   https://www.nngroup.com/articles/visual-hierarchy-ux-definition/  
   Relevant: hierarchy through scale, contrast, grouping, and whitespace.

4. **Apple Human Interface Guidelines — Layout**  
   https://developer.apple.com/design/human-interface-guidelines/layout  
   Relevant: alignment, grouping, progressive disclosure, and adaptive layouts.

5. **Apple Human Interface Guidelines — Typography**  
   https://developer.apple.com/design/human-interface-guidelines/typography  
   Relevant: legibility, hierarchy, and readable font weights.

6. **IBM Design Language — Data Visualization: Design Basics**  
   https://www.ibm.com/design/language/data-visualization/design/basics/  
   Relevant: chart anatomy, concise titles, axis and tick density, and purposeful color.

7. **W3C — Web Content Accessibility Guidelines (WCAG) 2.2**  
   https://www.w3.org/TR/WCAG22/  
   Relevant: contrast, use of color, resizing text, and accessible interaction requirements.

8. **Google — Material Design 3: Color and Theming**  
   https://developer.android.com/codelabs/m3-design-theming  
   Relevant: semantic color roles, surface hierarchy, and restrained use of primary color.

9. **Webflow — Neumorphism: Its Rise and Fall in UI Design**  
   https://webflow.com/blog/neumorphism  
   Relevant: use neumorphic dimensionality sparingly and maintain strong contrast and recognizable controls.

---

## Final direction

Build a **minimalist, data-first financial interface with a restrained neumorphic touch**. Let spacing, alignment, typography, and accurate charts create the premium feel. Use soft raised and inset surfaces only where they make interaction feel more tactile. The result should be beautiful at first glance, effortless to use, and clear enough to explain in a college presentation.
