const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');
const { createTemplateWrapper, resolveLayout, escapeHtml } = require('./template');

const PAGE_BREAK_HTML_PATTERN = /^\s*<\s*(?:pagebreak|page-break)(?:\s*\/)?\s*>\s*(?:<\s*\/\s*(?:pagebreak|page-break)\s*>\s*)?$/i;
const PAGE_BREAK_MARKUP = '<div class="page-break" style="break-before: page; page-break-before: always;"></div>';
const PROJECT_STYLESHEET_NAMES = ['md2pdf-converter.css', 'md2pdf.css'];
const DEFAULT_DOCUMENT_CSS = `
      :root {
        color-scheme: light;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        --md2pdf-font-monospace: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      }
      body {
        margin: 0;
        background: #ffffff;
        color: #1f2328;
      }
      .markdown-body {
        box-sizing: border-box;
        max-width: 900px;
        margin: 0 auto;
        padding: 24px;
        font-size: 14px;
        line-height: 1.6;
      }
      .markdown-body h1,
      .markdown-body h2,
      .markdown-body h3,
      .markdown-body h4,
      .markdown-body h5,
      .markdown-body h6 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
        line-height: 1.25;
      }
      .markdown-body h1,
      .markdown-body h2 {
        border-bottom: 1px solid #d0d7de;
        padding-bottom: 0.3em;
      }
      .markdown-body p,
      .markdown-body ul,
      .markdown-body ol,
      .markdown-body table,
      .markdown-body blockquote,
      .markdown-body pre {
        margin-top: 0;
        margin-bottom: 16px;
      }
      .markdown-body table {
        width: 100%;
        border-collapse: collapse;
      }
      .markdown-body th,
      .markdown-body td {
        border: 1px solid #d0d7de;
        padding: 6px 13px;
      }
      .markdown-body blockquote {
        margin-left: 0;
        padding: 0 1em;
        color: #57606a;
        border-left: 0.25em solid #d0d7de;
      }
      .markdown-body code {
        padding: 0.2em 0.4em;
        background: rgba(175, 184, 193, 0.2);
        border-radius: 6px;
        font-family: var(--md2pdf-font-monospace);
        font-size: 85%;
      }
      .markdown-body pre {
        padding: 16px;
        overflow: auto;
        border-radius: 6px;
        background: #f6f8fa;
        font-family: var(--md2pdf-font-monospace);
      }
      .markdown-body pre code {
        padding: 0;
        background: transparent;
        border-radius: 0;
      }
      .markdown-body a {
        color: #0969da;
        text-decoration: none;
      }
      .markdown-body a:hover {
        text-decoration: underline;
      }
      .hljs {
        color: #24292f;
        background: #f6f8fa;
        font-family: var(--md2pdf-font-monospace);
      }
      .hljs-keyword,
      .hljs-selector-tag,
      .hljs-literal,
      .hljs-title,
      .hljs-section,
      .hljs-doctag,
      .hljs-type,
      .hljs-name,
      .hljs-strong {
        color: #cf222e;
      }
      .hljs-string,
      .hljs-attr,
      .hljs-template-tag,
      .hljs-template-variable,
      .hljs-addition,
      .hljs-bullet {
        color: #0a3069;
      }
      .hljs-comment,
      .hljs-quote,
      .hljs-meta {
        color: #6e7781;
      }
      .hljs-number,
      .hljs-symbol,
      .hljs-regexp,
      .hljs-variable,
      .hljs-link {
        color: #0550ae;
      }
      .hljs-built_in,
      .hljs-params,
      .hljs-property,
      .hljs-attribute {
        color: #8250df;
      }
      .hljs-emphasis {
        font-style: italic;
      }
      .page-break {
        display: block;
        height: 0;
        margin: 0;
        break-before: page;
        page-break-before: always;
      }
`;

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(code, language) {
    if (language && hljs.getLanguage(language)) {
      return `<pre class="hljs"><code>${hljs.highlight(code, { language, ignoreIllegals: true }).value}</code></pre>`;
    }

    return `<pre class="hljs"><code>${escapeHtml(code)}</code></pre>`;
  }
});

markdown.renderer.rules.html_block = (tokens, idx) => {
  const html = tokens[idx].content || '';

  if (PAGE_BREAK_HTML_PATTERN.test(html)) {
    return `${PAGE_BREAK_MARKUP}\n`;
  }

  return html;
};

function defaultFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function defaultReadFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function getFrontMatterOptions(frontMatter) {
  return frontMatter?.['md2pdf-converter'] || frontMatter?.md2pdf || {};
}

function findNearestProjectStylesheet(markdownFilePath, fileExists = defaultFileExists) {
  if (!markdownFilePath) {
    return '';
  }

  let currentDirectory = path.dirname(path.resolve(markdownFilePath));

  while (true) {
    for (const fileName of PROJECT_STYLESHEET_NAMES) {
      const candidate = path.join(currentDirectory, fileName);
      if (fileExists(candidate)) {
        return candidate;
      }
    }

    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      break;
    }

    currentDirectory = parentDirectory;
  }

  return '';
}

function resolveFrontMatterStylesheet(markdownFilePath, configuredPath, fileExists = defaultFileExists) {
  if (!configuredPath || typeof configuredPath !== 'string' || !markdownFilePath) {
    return '';
  }

  if (path.isAbsolute(configuredPath)) {
    return configuredPath;
  }

  let currentDirectory = path.dirname(path.resolve(markdownFilePath));

  while (true) {
    const candidate = path.resolve(currentDirectory, configuredPath);
    if (fileExists(candidate)) {
      return candidate;
    }

    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      break;
    }

    currentDirectory = parentDirectory;
  }

  return path.resolve(path.dirname(path.resolve(markdownFilePath)), configuredPath);
}

function sanitizeStyleContent(styleContent) {
  return String(styleContent || '').replace(/<\/style/gi, '<\\/style');
}

function buildDocumentStyles({ filePath, frontMatter, fileExists = defaultFileExists, readFile = defaultReadFile }) {
  const sections = [`/* md2pdf-converter default styles */\n${DEFAULT_DOCUMENT_CSS.trim()}`];
  const projectStylesheetPath = findNearestProjectStylesheet(filePath, fileExists);
  const frontMatterOptions = getFrontMatterOptions(frontMatter);
  const frontMatterCssPath = typeof frontMatterOptions.css === 'string' ? frontMatterOptions.css.trim() : '';

  if (projectStylesheetPath) {
    sections.push(`/* Project stylesheet: ${path.basename(projectStylesheetPath)} */\n${readFile(projectStylesheetPath)}`);
  }

  if (frontMatterCssPath) {
    const resolvedFrontMatterPath = resolveFrontMatterStylesheet(filePath, frontMatterCssPath, fileExists);

    if (!resolvedFrontMatterPath || !fileExists(resolvedFrontMatterPath)) {
      throw new Error(`Unable to find CSS file specified in front matter: ${frontMatterCssPath}`);
    }

    sections.push(`/* Front matter stylesheet: ${frontMatterCssPath} */\n${readFile(resolvedFrontMatterPath)}`);
  }

  return sections.map(sanitizeStyleContent).join('\n\n');
}

function buildContext({ frontMatter, filePath }) {
  const extension = path.extname(filePath || '');
  const fileName = filePath ? path.basename(filePath) : 'untitled.md';
  const fileStem = filePath ? path.basename(filePath, extension) : 'untitled';
  const generatedAt = new Date().toLocaleString();
  const title = frontMatter.title || fileStem;

  return {
    ...frontMatter,
    title,
    fileName,
    fileStem,
    filePath: filePath || '',
    generatedAt
  };
}

function createDocumentHtml(bodyHtml, documentTitle, documentStyles) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(documentTitle)}</title>
    <style>
${documentStyles}
    </style>
  </head>
  <body>
    <main class="markdown-body">${bodyHtml}</main>
  </body>
</html>`;
}

function renderMarkdownDocument({ source, filePath, settings = {} }) {
  const parsed = matter(source ?? '');
  const context = buildContext({ frontMatter: parsed.data || {}, filePath });
  const frontMatterOptions = getFrontMatterOptions(parsed.data);
  const bodyHtml = markdown.render(parsed.content);
  const documentStyles = buildDocumentStyles({ filePath, frontMatter: parsed.data || {} });
  const layout = resolveLayout({
    settingsLayout: {
      header: settings.header,
      footer: settings.footer
    },
    frontMatterLayout: frontMatterOptions
  });

  return {
    context,
    frontMatter: parsed.data || {},
    bodyHtml,
    documentHtml: createDocumentHtml(bodyHtml, context.title, documentStyles),
    headerTemplate: createTemplateWrapper('header', layout.header, context),
    footerTemplate: createTemplateWrapper('footer', layout.footer, context),
    pdfOptions: {
      displayHeaderFooter: true,
      printBackground: true,
      preferCSSPageSize: true,
      format: settings.page?.format || 'A4',
      margin: {
        top: settings.page?.margin?.top || '20mm',
        right: settings.page?.margin?.right || '15mm',
        bottom: settings.page?.margin?.bottom || '20mm',
        left: settings.page?.margin?.left || '15mm'
      }
    }
  };
}

module.exports = {
  renderMarkdownDocument
};
