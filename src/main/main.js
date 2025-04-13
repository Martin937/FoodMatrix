const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const electronLog = require('electron-log');
const WindowManager = require('./windows');
const Database = require('../database/database');
const fs = require('fs');

if (process.env.NODE_ENV === 'development') {
	try {
		const electronReload = require('electron-reload');

		electronReload(path.join(__dirname, '..'), {
			electron: require('electron'),
			ignored: [
				/node_modules[\\/]/,
				/\.db$/,
				/\.json$/,
				/src[\\/]database[\\/]/,
				/src[\\/]assets[\\/]/,
				/tests[\\/]/
			],
			argv: ['--enable-logging'],
			hardResetMethod: 'exit',
			forceHardReset: true,
			chokidar: {
				awaitWriteFinish: {
					stabilityThreshold: 1000,
					pollInterval: 100
				}
			}
		});

		electronLog.info('Hot-reload enabled in development mode');
	} catch (err) {
		electronLog.error('Hot-reload init error:', err);
	}
}

const migrationsPath = path.join(__dirname, '../database/migrations');
electronLog.info('Migration files:', fs.readdirSync(migrationsPath));

// Конфигурация логов
electronLog.initialize({ preload: true });
electronLog.info('Application starting...');

// Глобальный обработчик ошибок
process.on('uncaughtException', (error) => {
	electronLog.error(`Uncaught Exception: ${error.stack}`);
});

let mainWindow;

app.whenReady().then(async () => {
	// Инициализация БД
	try {
		await Database.connect();
		// await Database.migrate();
		electronLog.info('Database initialized');
	} catch (err) {
		electronLog.error('Database init failed:', err);
	}

	WindowManager.setupIPCHandlers();

	// Создание главного окна
	mainWindow = WindowManager.createMainWindow();

	// Логирование из DevTools
	mainWindow.webContents.on('console-message', (event, level, message) => {
		electronLog.info(`Renderer Console: ${message}`);
	});

	ipcMain.on('renderer-error', (event, error) => {
		electronLog.error(`Renderer error: ${error}`);
	});

	// Обработчик для переключения тем
	ipcMain.handle('switch-theme', (event, theme) => {
		WindowManager.applyThemeToAllWindows(theme);
	});

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			mainWindow = WindowManager.createMainWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// Экспорт для тестов
if (process.env.NODE_ENV === 'test') {
	module.exports = { app, WindowManager };
}

electronLog.info('Preload path:', path.join(__dirname, '../renderer/preload.js'));
