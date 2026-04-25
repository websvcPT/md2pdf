const puppeteer = require('puppeteer-core');
const { renderMarkdownDocument } = require('./markdownRenderer');
const { resolveBrowserExecutablePath } = require('./browser');

async function exportMarkdownToPdf({ source, filePath, targetPath, settings = {} }) {
  const renderModel = renderMarkdownDocument({ source, filePath, settings });
  const executablePath = await resolveBrowserExecutablePath({
    configuredPath: settings.browserExecutablePath
  });

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(renderModel.documentHtml, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: targetPath,
      headerTemplate: renderModel.headerTemplate,
      footerTemplate: renderModel.footerTemplate,
      ...renderModel.pdfOptions
    });
  } finally {
    await browser.close();
  }
}

module.exports = {
  exportMarkdownToPdf
};
