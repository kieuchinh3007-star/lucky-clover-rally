# Deploy Lucky Clover Rally to your own web server

The game is a **static site** (HTML + JS + assets). No backend, database or login is needed.

## Requirements
- Node.js 22+ and pnpm 10.18 (`corepack enable && corepack prepare pnpm@10.18.0 --activate`, or `npx pnpm@10.18.0 ...`)

## Build
```bash
pnpm install --frozen-lockfile
pnpm build:selfhost        # typecheck + Vite build -> dist/
```
`pnpm build` is the Manus publishing build (it also injects Manus link-preview tags); use `build:selfhost` for your own server.

## Upload
Copy **everything inside `dist/`** to the web root or to any sub-folder (e.g. `https://example.com/game/`).
All paths are relative (`base: './'`), so no config change is needed for a sub-folder.

- Must be served over `http(s)://`. Opening `dist/index.html` via `file://` does not work.
- MIME types: `.js` text/javascript, `.glb` model/gltf-binary, `.webp` image/webp, `.woff2` font/woff2, `.mp3` audio/mpeg.
  - Nginx: `types { model/gltf-binary glb; }` if missing.
  - IIS: add `<mimeMap>` entries for `.glb`, `.webp`, `.woff2` in `web.config`.
- Enable gzip/brotli for `.js`, `.css`, `.glb`. Total size is about 15 MB (music streams during play).
- Optional link preview: copy `assets/share/og.png` into the upload folder and add `og:image` / `twitter:image`
  meta tags with the **absolute** URL of that file to `index.html`.

## Local preview of the production build
```bash
pnpm build:selfhost && pnpm preview   # http://localhost:4173
```

## Development
```bash
pnpm dev          # Vite dev server (PORT/HOST from env, default 127.0.0.1:3000)
pnpm test         # simulation / track tests
pnpm brand        # re-render clover logo/favicon (scripts/brand-assets.mjs, needs Chromium)
```
