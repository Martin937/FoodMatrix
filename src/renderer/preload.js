const { contextBridge, ipcRenderer } = require('electron');

// Минимальный безопасный API
contextBridge.exposeInMainWorld('electronAPI', {
	createWindow: (pageName) => ipcRenderer.invoke('create-window', pageName),
	invoke: (channel, ...args) => {
		const validChannels = ['switch-theme', 'create-window'];
		if (validChannels.includes(channel)) {
			return ipcRenderer.invoke(channel, ...args);
		}
		return Promise.reject('Invalid channel');
	},
	on: (channel, listener) => {
		const validChannels = ['theme-changed'];
		if (validChannels.includes(channel)) {
			ipcRenderer.on(channel, listener);
		}
	},
});