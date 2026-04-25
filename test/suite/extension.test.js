const assert = require('node:assert/strict');
const vscode = require('vscode');
const packageJson = require('../../package.json');

async function runTests() {
  const extensionId = `${String(packageJson.publisher || '').toLowerCase()}.${String(packageJson.name || '').toLowerCase()}`;
  const extension = vscode.extensions.getExtension(extensionId);
  assert.ok(extension, 'Extension should be discoverable');

  await extension.activate();

  const commands = await vscode.commands.getCommands(true);
  assert.ok(commands.includes('md2pdf-converter.exportToPdf'), 'Export command should be registered');
  assert.ok(commands.includes('md2pdf-converter.exportToPdfAs'), 'Export-as command should be registered');
}

module.exports = {
  runTests
};
