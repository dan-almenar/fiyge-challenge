import sqlite3 from 'sqlite3';

interface queryResult<T = any> {
	lastID?: number;
	changes?: number;
	data?: T | T[]; 
};
interface dbConfig {
	dbPath: string;
	initScript?: string;
};

var db: sqlite3.Database;

const initializeDB = async(config: dbConfig): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		try {
			db = new  sqlite3.Database(config.dbPath);
			if (config.initScript) runQuery(config.initScript);
			resolve(true);
		} catch(err){
			console.error('DATABASE ERROR: Something went wrong initializing the Database: ', err);
			reject(err);
		}
	})
}

async function runQuery<T = any>(query: string, params: any[]=[]): Promise<queryResult<T>> {
	return new Promise<queryResult<T>>((resolve, reject) => {
		if (!db) return reject(new Error('ERROR: Database not initialized!'));
		db.run(query, params, function(err) {
			if (err){
				console.error('DATABASE ERROR: ', err.message);
				return reject(err);
			}
			if (query.trim().toUpperCase().startsWith('SELECT')){
				db.all(query, params, (err, rows) => {
					if (err){
						console.error('DATABASE ERROR: ', err.message);
						return reject(err);
					}
					return resolve({ data: rows as T[] });
				}) 
			} else {
				return resolve({
					lastID: this.lastID,
					changes: this.changes,
				});
			};
		})
	});
}
