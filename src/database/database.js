const path = require('path');
const { app } = require('electron');
const electronLog = require('electron-log');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

class Database {
	constructor() {
		this.dbPath = path.join(app.getPath('userData'), 'nutrition.db');
		this.db = null;
	}

	async connect() {
		return new Promise((resolve, reject) => {
			this.db = new sqlite3.Database(this.dbPath, async (err) => {
				if (err) {
					electronLog.error('DB connection error:', err);
					reject(err);
				} else {
					electronLog.info('Connected to SQLite at', this.dbPath);
					try {
						await this.initVersionTable();
						await this.migrate();
						resolve();
					} catch (migrationErr) {
						reject(migrationErr);
					}
				}
			});
		});
	}

	async initVersionTable() {
		await this.run(`
      CREATE TABLE IF NOT EXISTS version (
        id INTEGER PRIMARY KEY DEFAULT 1,
        current_version INTEGER NOT NULL DEFAULT 1,
        CHECK (id = 1)
      );
      INSERT OR IGNORE INTO version (id, current_version) VALUES (1, 1);
    `);
	}

	async migrate() {
		try {
			const version = await this.getCurrentVersion();
			electronLog.info(`Current DB version before migrations: ${version}`);

			const migrationFiles = await this.findMigrations(version);
			if (migrationFiles.length === 0) {
				electronLog.info('No new migrations to apply');
				return;
			}

			for (const file of migrationFiles) {
				await this.run('BEGIN TRANSACTION');

				// Используем синхронное чтение для гарантированной работы
				const sql = fs.readFileSync(
					path.join(__dirname, 'migrations', file),
					'utf8'
				);
				await this.run(sql);

				const newVersion = parseInt(file.split('_')[0]);
				await this.run(
					'UPDATE version SET current_version = ? WHERE id = 1',
					[newVersion]
				);

				await this.run('COMMIT');
				electronLog.info(`Applied migration: ${file}. New version: ${newVersion}`);
			}
		} catch (err) {
			await this.run('ROLLBACK');
			electronLog.error('Migration failed:', err);
			throw err;
		}
	}

	async getCurrentVersion() {
		const result = await this.query('SELECT current_version FROM version WHERE id = 1');
		return result[0]?.current_version || 1;
	}

	async findMigrations(currentVersion) {
		const migrationsDir = path.join(__dirname, 'migrations');
		try {
			return require('fs').readdirSync(migrationsDir)
				.filter(f => f.endsWith('.sql'))
				.map(f => ({
					name: f,
					version: parseInt(f.split('_')[0])
				}))
				.filter(m => !isNaN(m.version) && m.version > currentVersion)
				.sort((a, b) => a.version - b.version)
				.map(m => m.name);
		} catch (err) {
			electronLog.error('Error reading migrations:', err);
			return [];
		}
	}

	run(sql, params = []) {
		return new Promise((resolve, reject) => {
			this.db.run(sql, params, function (err) {
				if (err) reject(err);
				else resolve(this);
			});
		});
	}

	query(sql, params = []) {
		return new Promise((resolve, reject) => {
			this.db.all(sql, params, (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}
}

module.exports = new Database();