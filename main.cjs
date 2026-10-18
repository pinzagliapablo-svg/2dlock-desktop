const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { fileURLToPath } = require('node:url');
const { autoUpdater } = require('electron-updater');

const APP_DATA_DIR = path.join(app.getPath('appData'), '2Dlock');
// Keep user data outside the installation folder so updates/uninstalls do not erase localStorage saves.
app.setPath('userData', APP_DATA_DIR);
app.setAppUserModelId('com.2dlock.desktop');

let mainWindow = null;
let updateTimer = null;
let updateFeedConfigured = false;
let isQuittingForUpdate = false;

function sendUpdaterStatus(type, extra = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('2dlock:updater-status', { type, ...extra });
  }
}

function getPackagedUpdateConfigPath() {
  return path.join(process.resourcesPath, 'app-update.yml');
}

function openAllowedExternal(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return shell.openExternal(url);
    }
  } catch (_) {
    // Ignore malformed URLs.
  }
  return Promise.resolve();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#05020c',
    title: '2Dlock',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow && mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void openAllowedExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const expectedFile = path.resolve(path.join(__dirname, 'index.html'));
    let targetPath = '';
    try {
      const target = new URL(navigationUrl);
      if (target.protocol === 'file:') targetPath = path.resolve(fileURLToPath(target));
      else if (target.protocol === 'http:' || target.protocol === 'https:') {
        event.preventDefault();
        void openAllowedExternal(navigationUrl);
        return;
      } else {
        event.preventDefault();
        return;
      }
    } catch (_) {
      event.preventDefault();
      return;
    }
    if (targetPath !== expectedFile) event.preventDefault();
  });
  mainWindow.on('closed', () => { mainWindow = null; });
  void mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

function configureUpdater() {
  if (!app.isPackaged) {
    sendUpdaterStatus('disabled', { message: 'Aggiornamenti automatici disponibili solo nella versione installata.' });
    return;
  }
  updateFeedConfigured = fs.existsSync(getPackagedUpdateConfigPath());
  if (!updateFeedConfigured) {
    sendUpdaterStatus('disabled', { message: 'Feed aggiornamenti non configurato per questa build.' });
    return;
  }

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;

  autoUpdater.on('checking-for-update', () => sendUpdaterStatus('checking'));
  autoUpdater.on('update-available', (info) => sendUpdaterStatus('available', {
    version: info.version,
    releaseDate: info.releaseDate || null,
    releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : ''
  }));
  autoUpdater.on('update-not-available', (info) => sendUpdaterStatus('not-available', { version: info.version }));
  autoUpdater.on('download-progress', (progress) => sendUpdaterStatus('progress', {
    percent: Math.max(0, Math.min(100, Math.round(progress.percent || 0))),
    transferred: progress.transferred || 0,
    total: progress.total || 0
  }));
  autoUpdater.on('update-downloaded', (info) => sendUpdaterStatus('downloaded', { version: info.version }));
  autoUpdater.on('error', (error) => {
    sendUpdaterStatus('error', { message: error && error.message ? error.message : 'Errore durante il controllo aggiornamenti.' });
  });

  // Check once shortly after launch, then periodically. Offline errors are non-fatal.
  setTimeout(() => {
    if (app.isQuitting || !updateFeedConfigured) return;
    autoUpdater.checkForUpdates().catch((error) => {
      sendUpdaterStatus('error', { message: error && error.message ? error.message : 'Controllo aggiornamenti non riuscito.' });
    });
  }, 8000);
  updateTimer = setInterval(() => {
    if (!app.isQuitting && updateFeedConfigured) {
      autoUpdater.checkForUpdates().catch(() => {});
    }
  }, 6 * 60 * 60 * 1000);
}

ipcMain.on('2dlock:check-updates', () => {
  if (!updateFeedConfigured) {
    sendUpdaterStatus('disabled', { message: 'Gli aggiornamenti automatici non sono configurati in questa build.' });
    return;
  }
  autoUpdater.checkForUpdates().catch((error) => sendUpdaterStatus('error', { message: error.message }));
});

ipcMain.on('2dlock:download-update', async () => {
  if (!updateFeedConfigured) return;
  try {
    sendUpdaterStatus('downloading-started');
    await autoUpdater.downloadUpdate();
  } catch (error) {
    sendUpdaterStatus('error', { message: error && error.message ? error.message : 'Download aggiornamento fallito.' });
  }
});

ipcMain.on('2dlock:install-update', () => {
  if (!updateFeedConfigured) return;
  isQuittingForUpdate = true;
  autoUpdater.quitAndInstall(false, true);
});

app.on('before-quit', () => {
  if (updateTimer) clearInterval(updateTimer);
  if (isQuittingForUpdate) return;
});

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    configureUpdater();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  }).catch((error) => {
    dialog.showErrorBox('2Dlock', `Impossibile avviare il gioco.\n\n${error.message || error}`);
    app.quit();
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
