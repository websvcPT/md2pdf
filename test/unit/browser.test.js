const test = require('node:test');
const assert = require('node:assert/strict');
const { getCandidateBrowserPaths, resolveBrowserExecutablePath } = require('../../src/browser');

test('configured browser path wins over discovered paths', async () => {
  const resolved = await resolveBrowserExecutablePath({
    configuredPath: '/custom/browser',
    env: { PUPPETEER_EXECUTABLE_PATH: '/env/browser' },
    platform: 'linux',
    fileExists(candidate) {
      return candidate === '/custom/browser';
    }
  });

  assert.equal(resolved, '/custom/browser');
});

test('environment variable path is used when configuration is absent', async () => {
  const resolved = await resolveBrowserExecutablePath({
    env: { PUPPETEER_EXECUTABLE_PATH: '/env/browser' },
    platform: 'linux',
    fileExists(candidate) {
      return candidate === '/env/browser';
    }
  });

  assert.equal(resolved, '/env/browser');
});

test('browser candidates are returned for each platform', () => {
  assert.ok(getCandidateBrowserPaths({ platform: 'linux' }).length > 0);
  assert.ok(getCandidateBrowserPaths({ platform: 'darwin', homeDirectory: '/Users/tester' }).some((candidate) => candidate.includes('Google Chrome.app')));
  assert.ok(getCandidateBrowserPaths({ platform: 'win32', env: { LOCALAPPDATA: 'C:/Users/tester/AppData/Local' } }).some((candidate) => candidate.endsWith('chrome.exe')));
});
