const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopUpdater', Object.freeze({
  onStatus(callback) {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('2dlock:updater-status', listener);
    return () => ipcRenderer.removeListener('2dlock:updater-status', listener);
  },
  checkForUpdates() {
    ipcRenderer.send('2dlock:check-updates');
  },
  downloadUpdate() {
    ipcRenderer.send('2dlock:download-update');
  },
  installUpdate() {
    ipcRenderer.send('2dlock:install-update');
  }
}));
