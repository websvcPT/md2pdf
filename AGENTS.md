# AGENTS.md

## Project overview

- Extension name: `md2pdf-converter`
- Goal: export Markdown documents to PDF from Visual Studio Code and VS Code Insiders
- Runtime PDF engine: `puppeteer-core` against a locally installed Chrome, Edge, or Chromium executable
- Markdown pipeline: `gray-matter` for front matter, `markdown-it` for rendering, and `highlight.js` for syntax highlighting

## Repository layout

- `src/extension.js` — VS Code activation and command wiring
- `src/exportPdf.js` — HTML-to-PDF export flow
- `src/markdownRenderer.js` — front matter parsing and Markdown rendering
- `src/template.js` — header/footer layout and variable resolution
- `src/browser.js` — local browser discovery
- `test/unit` — Node unit tests
- `test/suite` — VS Code extension tests
- `docs/README.md` — developer documentation

## Commands

- `npm run build` — bundle the extension with esbuild
- `npm test` — run build, unit tests, and extension tests
- `npm run test:extension` will use a local VS Code executable when available and otherwise attempts a download

## Current behavior expectations

- `md2pdf-converter: Export Markdown to PDF` saves beside the source Markdown file without prompting
- `md2pdf-converter: Export Markdown to PDF as ...` remains available from the Command Palette and Markdown context menus
- Header and footer each provide left, center, and right sections by default
- Front matter variables can be referenced in header and footer templates
- Code fences render with syntax highlighting in the generated PDF output
- Inline HTML `<br>` snippets are preserved for line breaks
- End-user documentation lives in `README.md`
- Developer documentation lives in `docs/README.md`
- License is MIT
