# Sleep Mode Campaign Website

An English Next.js site (App Router) with a soft, playful illustration style to present the “Let’s Go into Sleep Mode” campaign for Hardy Middle School, Washington, D.C.

## Tech
- Next.js 14 (App Router)
- React 18
- Tailwind CSS 3

## Quick Start

1) Install
```
npm install
```

2) Run dev
```
npm run dev
```
Open http://localhost:3000

3) Build & Start
```
npm run build
npm start
```

## Content
- Home highlights key sections with navigation and basic interactions.
- The complete plan is embedded inline on the homepage. To update content, edit `content/campaign.md`.
  - For richer formatting later, we can switch to MDX and render by sections.

## Structure
```
app/
  layout.tsx       # global layout, fonts, metadata
  page.tsx         # single-page site with sections + inline full content
  components/      # Nav, Accordion, Tabs, etc.
content/
  campaign.md      # complete campaign content
public/
  illustrations/   # soft SVG illustration placeholders
```

## Styling
- Soft pastel palette, rounded cards, subtle shadows.
- Tailwind design tokens in `tailwind.config.ts`.

## Notes
- This initial version includes core copy highlights on the homepage and the full text under `/full`.
- This initial version is single-page (overview + full content inline).
- Simple interactions: sticky scrollspy nav, accordion, and tabs.
- Replace the placeholder SVG with your own illustrations when ready.

