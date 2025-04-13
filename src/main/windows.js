const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const electronLog = require('electron-log');
const url = require('url');

class WindowManager {
	static windows = new Map();

	static createMainWindow() {
		const win = new BrowserWindow({
			width: 1200,
			height: 800,
			minWidth: 800,
			minHeight: 600,
			webPreferences: {
				preload: path.join(__dirname, '../renderer/preload.js'),
				sandbox: true,
				nodeIntegration: false,
				contextIsolation: true
			},
			icon: path.join(__dirname, '../../assets/icons/logotype_1.jpg')
		});

		const startUrl = url.format({
			pathname: path.join(__dirname, '../pages/dashboard/dashboard.html'),
			protocol: 'file:',
			slashes: true
		});

		win.loadURL(startUrl);

		// DevTools в development-режиме
		if (process.env.NODE_ENV === 'development') {
			win.webContents.openDevTools({
				mode: 'right', // Открытие справа
				activate: true,
				title: 'Developer Tools'
			});
		}

		win.on('closed', () => {
			this.windows.delete(win.id);
		});

		this.windows.set(win.id, win);
		electronLog.info(`Main window created (ID: ${win.id})`);

		return win;
	}

	static createWindow(pageName) {
		const validPages = ['dashboard', 'nutritionTable', 'cookbook', 'nutritionSchedule'];
		if (!validPages.includes(pageName)) {
			electronLog.error(`Invalid page: ${pageName}`);
			return null; // Возвращаем null вместо ошибки
		}

		const win = new BrowserWindow({
			width: 1000,
			height: 700,
			webPreferences: {
				preload: path.join(__dirname, '../renderer/preload.js'),
				nodeIntegration: false,
				contextIsolation: true
			}
		});

		win.loadFile(path.join(__dirname, `../pages/${pageName}/${pageName}.html`));

		this.windows.set(win.id, win);
		electronLog.info(`Created window for: ${pageName}`);

		return win.id; // Возвращаем только ID окна вместо всего объекта
	}

	static applyThemeToAllWindows(theme) {
		this.windows.forEach(win => {
			win.webContents.send('theme-changed', theme);
		});
	}

	static setupIPCHandlers() {
		ipcMain.handle('create-window', (event, pageName) => {
			const winId = this.createWindow(pageName);
			return {
				success: !!winId,
				winId: winId || null
			};
		});
	}
}

module.exports = WindowManager;