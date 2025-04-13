const electronLog = require('electron-log');

class BackupManager {
	constructor(db) {
		this.db = db;
	}

	async exportToJson() {
		electronLog.warn('Backup: exportToJson not implemented yet');
		return { status: 'not_implemented' };
	}

	async importFromJson(data) {
		electronLog.warn('Backup: importFromJson not implemented yet');
		return { status: 'not_implemented' };
	}
}

module.exports = BackupManager;