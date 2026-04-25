const test = require('node:test');
const assert = require('node:assert/strict');
const packageJson = require('../../package.json');

test('package contributes both export commands and markdown context menus', () => {
  const command = packageJson.contributes.commands.find((entry) => entry.command === 'md2pdf-converter.exportToPdf');
  const saveAsCommand = packageJson.contributes.commands.find((entry) => entry.command === 'md2pdf-converter.exportToPdfAs');
  assert.ok(command, 'Expected export command contribution');
  assert.ok(saveAsCommand, 'Expected export-as command contribution');
  assert.equal(command.title, 'Export Markdown to PDF');
  assert.equal(saveAsCommand.title, 'Export Markdown to PDF as ...');

  const explorerMenu = packageJson.contributes.menus['explorer/context'].find((entry) => entry.command === 'md2pdf-converter.exportToPdf');
  const editorMenu = packageJson.contributes.menus['editor/context'].find((entry) => entry.command === 'md2pdf-converter.exportToPdf');
  const explorerSaveAsMenu = packageJson.contributes.menus['explorer/context'].find((entry) => entry.command === 'md2pdf-converter.exportToPdfAs');
  const editorSaveAsMenu = packageJson.contributes.menus['editor/context'].find((entry) => entry.command === 'md2pdf-converter.exportToPdfAs');

  assert.ok(explorerMenu, 'Expected explorer context menu contribution');
  assert.ok(editorMenu, 'Expected editor context menu contribution');
  assert.ok(explorerSaveAsMenu, 'Expected explorer context menu export-as contribution');
  assert.ok(editorSaveAsMenu, 'Expected editor context menu export-as contribution');
  assert.equal(packageJson.displayName, 'MD2PDF Converter');
});
