const DEFAULT_LAYOUT = {
  header: {
    left: '{{title}}',
    center: '',
    right: 'Page {{pageNumber}} / {{totalPages}}'
  },
  footer: {
    left: '{{fileName}}',
    center: '',
    right: '{{generatedAt}}'
  }
};

const PRINT_TOKEN_MAP = {
  pageNumber: '<span class="pageNumber"></span>',
  totalPages: '<span class="totalPages"></span>'
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getNestedValue(source, key) {
  return key.split('.').reduce((current, part) => {
    if (current && Object.prototype.hasOwnProperty.call(current, part)) {
      return current[part];
    }

    return undefined;
  }, source);
}

function replaceTemplateVariables(template, context) {
  return String(template ?? '').replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    if (Object.prototype.hasOwnProperty.call(PRINT_TOKEN_MAP, key)) {
      return PRINT_TOKEN_MAP[key];
    }

    const resolved = getNestedValue(context, key);
    return resolved === undefined || resolved === null ? '' : escapeHtml(resolved);
  });
}

function normalizeSections(sectionSource = {}) {
  return {
    left: String(sectionSource.left ?? ''),
    center: String(sectionSource.center ?? ''),
    right: String(sectionSource.right ?? '')
  };
}

function pickDefinedSections(sectionSource = {}) {
  const output = {};

  for (const key of ['left', 'center', 'right']) {
    if (sectionSource[key] !== undefined && sectionSource[key] !== null) {
      output[key] = String(sectionSource[key]);
    }
  }

  return output;
}

function normalizeLayout(layout = {}) {
  return {
    header: normalizeSections(layout.header),
    footer: normalizeSections(layout.footer)
  };
}

function mergeLayouts(baseLayout, overrideLayout) {
  const base = normalizeLayout(baseLayout);
  const override = {
    header: pickDefinedSections(overrideLayout?.header),
    footer: pickDefinedSections(overrideLayout?.footer)
  };

  return {
    header: { ...base.header, ...override.header },
    footer: { ...base.footer, ...override.footer }
  };
}

function createTemplateWrapper(type, sections, context) {
  const resolved = normalizeSections(sections);

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 8px;
        color: #57606a;
      }
      .md2pdf-converter-${type} {
        width: 100%;
        padding: 0 12mm;
        box-sizing: border-box;
      }
      .md2pdf-converter-row {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
      }
      .md2pdf-converter-cell {
        flex: 1 1 0;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .md2pdf-converter-cell.center {
        text-align: center;
      }
      .md2pdf-converter-cell.right {
        text-align: right;
      }
    </style>
  </head>
  <body>
    <div class="md2pdf-converter-${type}">
      <div class="md2pdf-converter-row">
        <div class="md2pdf-converter-cell left">${replaceTemplateVariables(resolved.left, context)}</div>
        <div class="md2pdf-converter-cell center">${replaceTemplateVariables(resolved.center, context)}</div>
        <div class="md2pdf-converter-cell right">${replaceTemplateVariables(resolved.right, context)}</div>
      </div>
    </div>
  </body>
</html>`;
}

function resolveLayout({ settingsLayout, frontMatterLayout }) {
  const mergedSettings = mergeLayouts(DEFAULT_LAYOUT, settingsLayout);
  return mergeLayouts(mergedSettings, frontMatterLayout);
}

module.exports = {
  DEFAULT_LAYOUT,
  escapeHtml,
  replaceTemplateVariables,
  resolveLayout,
  createTemplateWrapper
};
