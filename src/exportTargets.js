const path = require('node:path');

function getSiblingPdfPath(filePath) {
  const sourcePath = String(filePath || '');
  const baseName = path.basename(sourcePath);
  const fileName = /\.md$/i.test(baseName)
    ? baseName.slice(0, -3)
    : path.basename(sourcePath, path.extname(sourcePath));

  return path.join(path.dirname(sourcePath), `${fileName || 'document'}.pdf`);
}

module.exports = {
  getSiblingPdfPath
};
