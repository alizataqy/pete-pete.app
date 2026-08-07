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
- Do NOT introduce any color classes outside of the predefined color system in `src/app/globals.css`.
- Rely entirely on the project's Tailwind v4 custom theme palette:
  - Backgrounds: `bg-background`, `bg-background-900`, `bg-background-950`, `bg-secondary-950`
  - Accents/Buttons: `bg-primary` (hover: `bg-primary-600`/`bg-primary-700`), `bg-secondary`, `bg-accent`, `bg-emerald-600` (hover: `bg-emerald-700`), `border-secondary-800`
  - Texts: `text-text`, `text-foreground`, `text-text-50`, `text-text-300`, `text-text-400`, `text-primary-400`
- Do NOT use absolute inline HEX/RGB color values in components, inline CSS, or non-palette Tailwind utility classes.

## 3. Jakarta Slang Typography Style
- Gunakan bahasa slang/gaul Jakarta untuk semua tulisan (typography) di aplikasi (seperti "Gua", "Lo", "Pesen", "Udah kelar", "Bagi tagihan", "Pete-pete", dll.) agar terkesan kasual dan ramah bagi pengguna lokal.

