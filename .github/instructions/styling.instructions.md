---
applyTo: 'apps/client/**'
---

# Styling

## Tailwind v4

- `src/index.css` is the single Tailwind source — use `@import 'tailwindcss'`, `@theme inline`, `@custom-variant`
- Always prefer semantic tokens: `bg-background`, `text-foreground`, `border-border`, etc.
- No arbitrary values unless required for Radix/Base UI CSS variables or advanced state selectors
- Layout: simple flexbox, minimal wrappers — style elements directly with tokens and CVA variants

## shadcn

- Install and configure components via the shadcn MCP only
- Extend existing components before creating new ones
- No overrides to shadcn internals
- Use CVA for any component that takes visual variants (color, size, state)

## Components

- Never use raw HTML elements — always use shadcn components or shared primitives
- No inline styles
- No deeply nested wrapper divs — if a wrapper is needed, one `div` is enough
- Keep JSX flat, short, and readable and create components always instead of adding complexity to the View
