const path = require('node:path');

function parseRepoSlug(value) {
  if (!value) return null;
  const cleaned = String(value)
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '');
  const parts = cleaned.split('/').filter(Boolean);
  return parts.length === 2 ? { owner: parts[0], repo: parts[1] } : null;
}

const slug = process.env.UPDATE_REPO || process.env.GITHUB_REPOSITORY || '';
const repo = parseRepoSlug(slug);

/**
 * Release updates are served by GitHub Releases. The repository is inferred at
 * build time from UPDATE_REPO or GitHub Actions' GITHUB_REPOSITORY.
 * Regular local builds can be made without configuring a release feed.
 */
module.exports = {
  appId: 'com.2dlock.desktop',
  productName: '2Dlock',
  artifactName: '${productName}-${version}-${arch}.${ext}',
  directories: {
    output: 'dist',
    buildResources: 'build'
  },
  files: [
    'index.html',
    'desktop-updater-ui.js',
    'main.cjs',
    'preload.cjs',
    'package.json'
  ],
  asar: true,
  compression: 'maximum',
  npmRebuild: false,
  win: {
    target: ['nsis'],
    signAndEditExecutable: false
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    deleteAppDataOnUninstall: false,
    shortcutName: '2Dlock'
  },
  ...(repo ? { publish: [{ provider: 'github', owner: repo.owner, repo: repo.repo }] } : {})
};
