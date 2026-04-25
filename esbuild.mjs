import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/extension.js'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  sourcemap: true,
  outfile: 'dist/extension.js',
  external: ['vscode', 'puppeteer-core'],
  logLevel: 'info'
});
