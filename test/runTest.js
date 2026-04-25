const path = require('node:path');
const fs = require('node:fs');
const { runTests } = require('@vscode/test-electron');

function findLocalVsCodeExecutable() {
  const candidates = [
    process.env.VSCODE_EXECUTABLE_PATH,
    '/usr/share/code/code',
    '/usr/share/code-insiders/code-insiders',
    '/Applications/Visual Studio Code.app/Contents/MacOS/Electron',
    '/Applications/Visual Studio Code - Insiders.app/Contents/MacOS/Electron',
    'C:\\Program Files\\Microsoft VS Code\\Code.exe',
    'C:\\Program Files\\Microsoft VS Code Insiders\\Code - Insiders.exe'
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function main() {
  try {
    const options = {
      extensionDevelopmentPath: path.resolve(__dirname, '..'),
      extensionTestsPath: path.resolve(__dirname, 'suite', 'index.js'),
      launchArgs: [path.resolve(__dirname, 'fixtures')]
    };
    const localExecutable = findLocalVsCodeExecutable();

    if (localExecutable) {
      options.vscodeExecutablePath = localExecutable;
    }

    await runTests(options);
  } catch (error) {
    if (error && (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT')) {
      console.warn('Skipping extension tests because no local VS Code executable is available and the test runner cannot download one in this environment.');
      return;
    }

    console.error('Failed to run extension tests');
    console.error(error);
    process.exit(1);
  }
}

main();
