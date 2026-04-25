const test = require('node:test');
const assert = require('node:assert/strict');
const { createTemplateWrapper, replaceTemplateVariables, resolveLayout } = require('../../src/template');

test('template variables resolve front matter and print tokens', () => {
  const resolved = replaceTemplateVariables('Hello {{author}} {{pageNumber}}/{{totalPages}}', {
    author: 'Ada Lovelace'
  });

  assert.match(resolved, /Ada Lovelace/);
  assert.match(resolved, /class="pageNumber"/);
  assert.match(resolved, /class="totalPages"/);
});

test('front matter layout overrides defaults and settings', () => {
  const layout = resolveLayout({
    settingsLayout: {
      header: { left: '{{title}}', center: 'Team', right: 'Configured' },
      footer: { left: 'Configured footer', center: '', right: 'Configured right' }
    },
    frontMatterLayout: {
      header: { right: '{{author}}' },
      footer: { left: '{{project}}' }
    }
  });

  const header = createTemplateWrapper('header', layout.header, {
    title: 'Guide',
    author: 'Ada',
    project: 'md2pdf-converter'
  });
  const footer = createTemplateWrapper('footer', layout.footer, {
    title: 'Guide',
    author: 'Ada',
    project: 'md2pdf-converter'
  });

  assert.match(header, /Team/);
  assert.match(header, />Ada</);
  assert.match(footer, />md2pdf-converter</);
});
