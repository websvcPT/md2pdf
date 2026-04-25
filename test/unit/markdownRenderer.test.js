const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { renderMarkdownDocument } = require('../../src/markdownRenderer');

test('markdown renderer supports syntax highlighting and front matter variables', () => {
  const rendered = renderMarkdownDocument({
    source: `---\ntitle: Example\nauthor: Ada Lovelace\nmd2pdf-converter:\n  header:\n    center: "{{author}}"\n---\n\n# Heading\n\n\
\`\`\`js\nconst value = 1;\n\`\`\`\n`,
    filePath: '/workspace/example.md',
    settings: {
      header: { left: '{{title}}', center: '', right: 'Page {{pageNumber}}' },
      footer: { left: '{{fileName}}', center: '', right: '{{generatedAt}}' },
      page: { format: 'A4', margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' } }
    }
  });

  assert.match(rendered.documentHtml, /markdown-body/);
  assert.match(rendered.bodyHtml, /hljs/);
  assert.match(rendered.headerTemplate, />Ada Lovelace</);
  assert.equal(rendered.context.title, 'Example');
});

test('markdown renderer preserves inline html line break snippets', () => {
  const rendered = renderMarkdownDocument({
    source: 'First line<br>Second line',
    filePath: '/workspace/example.md'
  });

  assert.match(rendered.bodyHtml, /First line<br>Second line/);
  assert.match(rendered.documentHtml, /First line<br>Second line/);
});

test('markdown renderer supports page break html snippets', () => {
  const rendered = renderMarkdownDocument({
    source: 'Section one\n\n<pagebreak />\n\n# Section two',
    filePath: '/workspace/example.md'
  });

  assert.match(rendered.bodyHtml, /Section one/);
  assert.match(rendered.bodyHtml, /<div class="page-break"[^>]*><\/div>/);
  assert.doesNotMatch(rendered.bodyHtml, /<pagebreak\s*\/?/i);
  assert.match(rendered.bodyHtml, /<h1>Section two<\/h1>/);
  assert.match(rendered.documentHtml, /\.page-break\s*\{/);
  assert.match(rendered.documentHtml, /break-before:\s*page/);
});

test('markdown renderer applies project and front matter stylesheets in precedence order', (t) => {
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'md2pdf-renderer-'));
  const markdownDirectory = path.join(tempDirectory, 'docs');
  const frontMatterStylesDirectory = path.join(tempDirectory, 'styles');
  const markdownPath = path.join(markdownDirectory, 'example.md');

  t.after(() => {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  });

  fs.mkdirSync(markdownDirectory, { recursive: true });
  fs.mkdirSync(frontMatterStylesDirectory, { recursive: true });
  fs.writeFileSync(path.join(tempDirectory, 'md2pdf-converter.css'), ':root { --project-accent: red; }\n');
  fs.writeFileSync(path.join(frontMatterStylesDirectory, 'pdf.css'), ':root { --frontmatter-accent: blue; }\n');

  const rendered = renderMarkdownDocument({
    source: `---\nmd2pdf-converter:\n  css: styles/pdf.css\n---\n\nBody`,
    filePath: markdownPath
  });

  const defaultStylesIndex = rendered.documentHtml.indexOf('color-scheme: light;');
  const projectStylesIndex = rendered.documentHtml.indexOf('--project-accent: red;');
  const frontMatterStylesIndex = rendered.documentHtml.indexOf('--frontmatter-accent: blue;');

  assert.ok(defaultStylesIndex >= 0, 'Default styles should be included');
  assert.ok(projectStylesIndex > defaultStylesIndex, 'Project stylesheet should load after built-in styles');
  assert.ok(frontMatterStylesIndex > projectStylesIndex, 'Front matter stylesheet should load after project stylesheet');
});

test('markdown renderer throws when front matter stylesheet cannot be found', () => {
  assert.throws(
    () => renderMarkdownDocument({
      source: `---\nmd2pdf-converter:\n  css: styles/missing.css\n---\n\nBody`,
      filePath: '/workspace/docs/example.md'
    }),
    /Unable to find CSS file specified in front matter: styles\/missing\.css/
  );
});
