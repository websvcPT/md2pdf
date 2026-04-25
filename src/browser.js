const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function createWindowsCandidates(env) {
  return [
    env.LOCALAPPDATA && path.join(env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    env.PROGRAMFILES && path.join(env.PROGRAMFILES, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    env['PROGRAMFILES(X86)'] && path.join(env['PROGRAMFILES(X86)'], 'Google', 'Chrome', 'Application', 'chrome.exe'),
    env.LOCALAPPDATA && path.join(env.LOCALAPPDATA, 'Chromium', 'Application', 'chrome.exe'),
    env.LOCALAPPDATA && path.join(env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    env.PROGRAMFILES && path.join(env.PROGRAMFILES, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    env['PROGRAMFILES(X86)'] && path.join(env['PROGRAMFILES(X86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe')
  ].filter(Boolean);
}

function createMacCandidates(homeDirectory) {
  return [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    path.join(homeDirectory, 'Applications', 'Google Chrome.app', 'Contents', 'MacOS', 'Google Chrome'),
    path.join(homeDirectory, 'Applications', 'Microsoft Edge.app', 'Contents', 'MacOS', 'Microsoft Edge'),
    path.join(homeDirectory, 'Applications', 'Chromium.app', 'Contents', 'MacOS', 'Chromium')
  ];
}

function createLinuxCandidates() {
  return [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
    '/usr/bin/microsoft-edge',
    '/usr/bin/microsoft-edge-stable'
  ];
}

function getCandidateBrowserPaths({ platform = process.platform, env = process.env, homeDirectory = os.homedir() } = {}) {
  if (platform === 'win32') {
    return createWindowsCandidates(env);
  }

  if (platform === 'darwin') {
    return createMacCandidates(homeDirectory);
  }

  return createLinuxCandidates();
}

function defaultFileExists(candidatePath) {
  try {
    return fs.existsSync(candidatePath);
  } catch {
    return false;
  }
}

async function resolveBrowserExecutablePath({
  configuredPath,
  env = process.env,
  platform = process.platform,
  homeDirectory = os.homedir(),
  fileExists = defaultFileExists
} = {}) {
  const candidates = [
    configuredPath,
    env.PUPPETEER_EXECUTABLE_PATH,
    ...getCandidateBrowserPaths({ platform, env, homeDirectory })
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (await Promise.resolve(fileExists(candidate))) {
      return candidate;
    }
  }

  throw new Error('Unable to find a local Chrome, Edge, or Chromium executable. Set the md2pdf-converter.browserExecutablePath setting to continue.');
}

module.exports = {
  getCandidateBrowserPaths,
  resolveBrowserExecutablePath
};
