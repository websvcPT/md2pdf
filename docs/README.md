# Developer Guide

## Prerequisites

- Node.js 20+
- npm 10+
- Visual Studio Code or Visual Studio Code Insiders
- A local Chrome, Edge, or Chromium executable for manual export testing

## Setup

```bash
cd <project-root>
npm install
```

## Build

The extension is bundled with `esbuild` following the VS Code bundling guidance.

```bash
npm run build
```

This creates `dist/extension.js`.

## Test

```bash
npm test
```

The test suite runs:

- Node unit tests for template resolution, rendering, and browser discovery
- VS Code extension tests for command registration

## Run locally

1. Open the project root in VS Code or VS Code Insiders.
2. Run `npm install`.
3. Press `F5` to open an Extension Development Host.
4. Open a Markdown file and run `md2pdf-converter: Export Markdown to PDF` to save the PDF beside the Markdown source.
5. Use `md2pdf-converter: Export Markdown to PDF as ...` if you want to choose another destination.

## Package manually

The recommended manual packaging flow follows the VS Code publishing documentation.

```bash
cd <project-root>
npm run build
npx @vscode/vsce package
```

This creates a `.vsix` file that can be installed in VS Code or VS Code Insiders.

## Publish manually

1. Create a Visual Studio Marketplace publisher and Personal Access Token as described in the VS Code publishing documentation.
2. Authenticate `vsce`.
3. Publish the extension.

Example:

```bash
cd <project-root>
npm run build
npx @vscode/vsce login <publisher>
npx @vscode/vsce publish
```

## Notes

- Keep `README.md` focused on end users.
- Keep this file focused on contributors and maintainers.
- If you change runtime dependencies, run `npm audit` and the existing tests before publishing.
- Keep `AGENTS.md` aligned with current commands and export behavior.
