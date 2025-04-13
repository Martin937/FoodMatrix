const electronLog = require('electron-log');

class ThemeManager {
	constructor() {
		this.currentTheme = 'light';
		this.initTheme();
	}

	initTheme() {
		// Загрузка темы из localStorage или БД
		const savedTheme = localStorage.getItem('appTheme') || 'light';
		this.switchTheme(savedTheme);
	}

	switchTheme(themeName) {
		if (['light', 'dark'].includes(themeName)) {
			this.currentTheme = themeName;
			document.documentElement.setAttribute('data-theme', themeName);
			localStorage.setItem('appTheme', themeName);

			// Уведомляем main процесс
			if (window.electronAPI) {
				window.electronAPI.log.info(`Theme switched to ${themeName}`);
				window.electronAPI.switchTheme(themeName);
			}
		}
	}
}

module.exports = new ThemeManager();