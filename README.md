# electron_sqlite_multi-window

Десктопное приложение для управления питанием с мультиоконным интерфейсом.

## Технологии

- Electron.js 25+
- SQLite3 (с миграциями)
- Electron Forge (сборка)
- Jest (тестирование)

## Установка

git clone https://github.com/yourrepo/electron_sqlite_multi-window.git
cd electron_sqlite_multi-window
npm install
Запуск
Разработка: npm run start:dev

Продакшен: npm start

Тесты: npm test

<!-- ------------------- -->

// Development-режим с автообновлением
if (process.env.NODE_ENV === 'development') {
const electronReload = require('electron-reload');

    // Путь к корневой папке проекта (где лежит package.json)
    const projectRoot = path.join(__dirname, '../..');

    electronReload(projectRoot, {
    	electron: path.join(projectRoot, 'node_modules', '.bin', 'electron' + (process.platform === 'win32' ? '.cmd' : '')),
    	hardResetMethod: 'exit',
    	awaitWriteFinish: true,
    	ignored: [
    		/node_modules|[/\\]\./,
    		/\.json$/,
    		/database\.db/,
    		/\.log$/
    	]
    });

```

```
