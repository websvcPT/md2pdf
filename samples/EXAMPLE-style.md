---
project: MD2PDF Converter
title: Sprint Notes
author: Ada Lovelace
version: 1.0
versionDate: "2026-04-24"
md2pdf-converter:
  css: style.css
  header:
    left: "{{project}}"
    center: "{{title}}"
    right: "V{{version}} ({{versionDate}})"
  footer:
    left: "{{author}}"
    center: "internal"
    right: "{{pageNumber}} / {{totalPages}}"
---
# MD2PDF Converter example document

This is an example Markdown document to demonstrate the features of the MD2PDF Converter extension. It includes front matter variables, headers, footers, and various Markdown elements.

## Code snippets

```javascript
function greet(name) {
    return `Hello, ${name}!`;
}
```

```bash
npm install md2pdf-converter
```

```json
{
    "name": "md2pdf-converter",
    "version": "0.1.0",
    "description": "Generate PDF files from Markdown documents with configurable headers and footers."
}
```

```php
<?php
function greet($name) {
    return "Hello, $name!";
}
?>
```

```python
def greet(name):
    return f"Hello, {name}!"
```

## Line breaks

This is the first line.<br>
This is the second line.

## Text block

Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate 

velit esse cillum dolore eu fugiat nulla pariatur.
Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

<pagebreak />

# New page

This content should appear on a new page in the generated PDF output.

lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Commod consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
