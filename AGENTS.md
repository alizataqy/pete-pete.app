<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Custom Workspace Rules (PETE-PETE App Design & Color System)

## 1. Maximize Untitled UI Integration
- When building or editing web interfaces, prioritize using established design system components located in `src/components/base/` (e.g., `Button`, `Input`, `Avatar`, `FeaturedIcon`).
- Use icons from `@untitledui/icons` exclusively instead of emojis, raw SVG paths, or other generic icon libraries. Set them using component props like `iconLeading={IconName}` wherever available to maintain consistent spacing and scaling.

## 2. Strict Color Palette Constraint
- Do NOT introduce any color classes outside of the predefined color system in `src/app/globals.css` and `src/styles/theme.css`.
- Rely entirely on the project's Tailwind v4 custom theme palette:
  - Backgrounds: `bg-powder-blue-950`, `bg-lilac-ash-950`, `bg-jet-black-900`, `bg-jet-black-950`
  - Accents/Buttons: `bg-alice-blue-600` (hover: `bg-alice-blue-700`), `bg-emerald-600` (hover: `bg-emerald-700`), `border-lilac-ash-800`
  - Texts: `text-alice-blue-400`, `text-jet-black-50`, `text-jet-black-300`, `text-jet-black-400`
- Do NOT use absolute inline HEX/RGB color values in components, inline CSS, or non-palette Tailwind utility classes.

