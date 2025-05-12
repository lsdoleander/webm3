{
	const Database = require('better-sqlite3');
    const { v4 } = require('uuid');
	const fs = require("fs");

	module.exports = function(name){
		const file_db = __dirname + '/'+name+'.sqlite'
		const create = !fs.existsSync(file_db);
		
		let db = new Database(file_db);
		db.pragma('journal_mode = WAL');

		if (create) {
			const creator = fs.readFileSync(__dirname + '/creator.sql', 'utf8').trim();
			db.exec(creator);
		}

		const API = {
			save(data) {
				let id = v4();
				
				function insertMnemonic(mnemonic) {
					let stmt = db.prepare("INSERT INTO mnemonic (id, mnemonic, usd) VALUES ($id, $mnemonic, $usd)");
					stmt.run(mnemonic)
				}

				function insertBalance(balance) {
					let stmt = db.prepare("INSERT INTO balances (id, currency, name, amount, usd) VALUES ($id, $currency, $name, $amount, $usd)");
					stmt.run(balance)
				}

				insertMnemonic({ id, mnemonic: data.mnemonic, usd: data.usd });
				for (let balance of data.balances) {
					balance.id = id
					insertBalance(balance);
				}
				return id;
			},

			load() {
				let map = {};
				const stmt = db.prepare("SELECT id, mnemonic, usd from mnemonic")
				let rows = stmt.all()
				for (let mnem of rows) {
					mnem.balances = [];
					map[mnem.id] = mnem
				}

				const stmt2 = db.prepare("SELECT id, currency, name, amount, usd from balances")
				let rows2 = stmt2.all()
				for (let balance of rows2) {
					map[balance.id].balances.push(balance);
				}

				return map;
			},

			delete(ids) {
				function deleteBalances(id) {
					let stmt = db.prepare("DELETE from balances where id = ?")
					stmt.run(id)
				}

				function deleteMnemonics(id) {
					let stmt = db.prepare("DELETE from mnemonic where id = ?")
					stmt.run(id)
				}

				for (let id of ids) {
					deleteBalances(id)
					deleteMnemonics(id)
				}
			}
		}

		return API;
	}
}