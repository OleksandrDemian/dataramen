// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onMainMessage: (callback) =>
    ipcRenderer.on('from-main', (_event, data) => callback(data))
});
