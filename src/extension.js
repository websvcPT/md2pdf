const path = require('node:path');
const vscode = require('vscode');
const { exportMarkdownToPdf } = require('./exportPdf');
const { getSiblingPdfPath } = require('./exportTargets');

function getSettings(resource) {
  const config = vscode.workspace.getConfiguration('md2pdf-converter', resource);

  return {
    browserExecutablePath: config.get('browserExecutablePath') || '',
    header: {
      left: config.get('header.left') || '',
      center: config.get('header.center') || '',
      right: config.get('header.right') || ''
    },
    footer: {
      left: config.get('footer.left') || '',
      center: config.get('footer.center') || '',
      right: config.get('footer.right') || ''
    },
    page: {
      format: config.get('page.format') || 'A4',
      margin: {
        top: config.get('page.margin.top') || '20mm',
        right: config.get('page.margin.right') || '15mm',
        bottom: config.get('page.margin.bottom') || '20mm',
        left: config.get('page.margin.left') || '15mm'
      }
    }
  };
}

async function readSourceDocument(resource) {
  const openDocument = vscode.workspace.textDocuments.find((document) => document.uri.toString() === resource.toString());
  if (openDocument) {
    return openDocument.getText();
  }

  const document = await vscode.workspace.openTextDocument(resource);
  return document.getText();
}

function getResourceUri(commandUri) {
  if (commandUri && commandUri.scheme === 'file' && commandUri.fsPath.toLowerCase().endsWith('.md')) {
    return commandUri;
  }

  const activeDocument = vscode.window.activeTextEditor?.document;
  if (activeDocument && (activeDocument.languageId === 'markdown' || activeDocument.uri.fsPath.toLowerCase().endsWith('.md'))) {
    return activeDocument.uri;
  }

  return undefined;
}

function getSiblingPdfUri(resource) {
  if (resource.scheme !== 'file' || !resource.fsPath) {
    throw new Error('Save the Markdown document to disk before exporting the PDF beside it.');
  }

  return vscode.Uri.file(getSiblingPdfPath(resource.fsPath));
}

async function promptForDestination(resource) {
  const defaultName = path.basename(getSiblingPdfPath(resource.fsPath || 'document.md'));

  return vscode.window.showSaveDialog({
    defaultUri: resource.scheme === 'file'
      ? vscode.Uri.file(path.join(path.dirname(resource.fsPath), defaultName))
      : undefined,
    filters: {
      PDF: ['pdf']
    },
    saveLabel: 'Export PDF'
  });
}

async function exportActiveMarkdown(commandUri, { promptForTarget = false } = {}) {
  const resource = getResourceUri(commandUri);
  if (!resource) {
    throw new Error('Open a Markdown document or right-click a .md file to export it.');
  }

  const sourceText = await readSourceDocument(resource);
  const destination = promptForTarget
    ? await promptForDestination(resource)
    : getSiblingPdfUri(resource);

  if (!destination) {
    return;
  }

  const settings = getSettings(resource);
  await exportMarkdownToPdf({
    source: sourceText,
    filePath: resource.fsPath || 'document.md',
    targetPath: destination.fsPath,
    settings
  });

  vscode.window.showInformationMessage(`PDF exported to ${destination.fsPath}`);
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('md2pdf-converter.exportToPdf', async (uri) => {
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'md2pdf-converter',
            cancellable: false
          },
          () => exportActiveMarkdown(uri, { promptForTarget: false })
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`md2pdf-converter: ${message}`);
      }
    }),
    vscode.commands.registerCommand('md2pdf-converter.exportToPdfAs', async (uri) => {
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'md2pdf-converter',
            cancellable: false
          },
          () => exportActiveMarkdown(uri, { promptForTarget: true })
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`md2pdf-converter: ${message}`);
      }
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
  getSettings,
  getResourceUri,
  getSiblingPdfUri,
  promptForDestination,
  exportActiveMarkdown
};
