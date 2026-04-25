# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2026-04-25

### Added

- Added explicit page break support for Markdown exports via `<pagebreak />` and `<div class="page-break"></div>`.
- Added layered stylesheet support with built-in defaults, nearest project `md2pdf-converter.css` or `md2pdf.css`, and highest-priority front matter CSS overrides.
- Added extension icon assets and wired the packaged extension icon through `media/icon.png`.
- Added organized sample content under `samples/`, including default and styled Markdown examples, a sample stylesheet, and exported sample PDFs.

### Changed

- Renamed the extension from `md2pdf` to `md2pdf-converter` across package metadata, command IDs, settings keys, menus, documentation, examples, and tests.
- Updated the display name, publisher, repository metadata, and license attribution to match the new branded extension release.
- Switched header and footer template CSS class names to the `md2pdf-converter-*` namespace.
- Set a shared default monospace font for inline code, fenced code blocks, and syntax-highlighted output.
- Refreshed the sample stylesheet with a cleaner GitHub-like theme for document and code-block styling.

### Documentation

- Updated the main README and developer docs for the renamed commands and settings.
- Documented page breaks, stylesheet precedence, and front matter CSS configuration.
- Replaced the old top-level example files with the new samples-based documentation assets.

### Fixed

- Fixed extension test discovery by resolving the extension ID from package metadata and exporting the expected test runner entry point.
- Updated browser and runtime error messages to reference the `md2pdf-converter.browserExecutablePath` setting.
- Expanded renderer and package tests to cover renamed commands, page break rendering, stylesheet precedence, and new sample/front matter behavior.