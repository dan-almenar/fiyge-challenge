import sqlite3 from 'sqlite3';

interface QueryResult<T = any> {
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
			console.log('Database successfully initialized!');
			resolve(true);
		} catch(err){
			propagateDBErr(err as Error);
		};
	});
}

async function runQuery<T = any>(query: string, params: any[]=[]): Promise<QueryResult<T>> {
	return new Promise<QueryResult<T>>((resolve, reject) => {
		if (!db) return reject(new Error('ERROR: Database not initialized!'));
		db.run(query, params, function(err) {
			if (err){
				propagateDBErr(err as Error);
			}
			if (query.trim().toUpperCase().startsWith('SELECT')){
				db.all(query, params, (err, rows) => {
					if (err){
						propagateDBErr(err as Error);
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

/* GENERIC CRUD OPERATIONS HANDLERS */
const insertData = async<T extends Record<string, any>>(
	table: string,
	data: Omit<T, 'id'>
): Promise<QueryResult<T>> => {
	const keys = Object.keys(data);
	const values = Object.values(data);
	const placeholders = keys.map(() => '?').join(', ');

	try {
		const result = await runQuery(
			`INSERT INTO ${table} (${keys.join(', ')} VALUES (${placeholders}))`, values
		);
		return { ...result, data: { id: result.lastID, ...data as T } };
	} catch(err){
		propagateDBErr(err as Error);
	};
	// placeholder return will never be reached
	return {} as T;
};

const findAll = async<T = any>(
	table: string,
	conditions: Record<string, any> = {}
): Promise<QueryResult<T>> => {
	const whereClause = Object.keys(conditions).length > 0 ?
		`WHERE ${Object.keys(conditions).map(val => `${val} = ?`).join(' AND ')}` : '';
	const params = Object.values(conditions);
	try {
		const { data } = await runQuery<T>(
			`SELECT * FROM ${table} ${whereClause}`,
			params
		);
		return data as QueryResult<T>;
	} catch(err){
		propagateDBErr(err as Error);
	};
	return {} as QueryResult<T>;
};

const findOne = async<T = any>(
	table: string,
	conditions: Record<string, any>
): Promise<QueryResult<T>> => {
	try {
		const result = await findAll<T>(table, conditions);
		return ({
			data: Array.isArray(result.data) ? result.data[0] : undefined
		});
	} catch(err){
		propagateDBErr(err as Error);
	};
	return {} as QueryResult<T>;
};

const updateRecord = async<T = any>(
	table: string,
	conditions: Record<string, any>,
	updates: Record<string, any>
): Promise<QueryResult<T>> => {
	try {
		const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
		const whereClause = Object.keys(conditions).map(k => `${k} = ?`).join(' AND ');
		const params = [...Object.values(updates), ...Object.values(conditions)];
		const result = await runQuery(
			`UPDATE ${table} SET ${setClause} WHERE ${whereClause}`, params
		);
		if (result.changes === 0) return { changes: 0 };
		const { data } = await findOne<T>(table, conditions);
		return { ...result.data };
	} catch(err){
		propagateDBErr(err as Error);
	};
	return {} as QueryResult<T>;
};

const removeData = async<T = any>(
	table: string,
	conditions: Record<string, any>
): Promise<QueryResult<T>> => {
	try {
		const whereClause = Object.keys(conditions).map(k => `${k} = ?`).join(' AND ');
		return runQuery(
			`DELETE FROM ${table} WHERE ${whereClause}`, Object.values(conditions)
		);
	} catch(err){
		propagateDBErr(err as Error);
	};
	return {} as QueryResult<T>;
};

const propagateDBErr = (err: Error): void => {
	console.error('DATABASE ERROR: ', err.message);
	throw err;
};

const tableExists = async(tableName: string): Promise<boolean> => {
	try {
		const result = await runQuery(
			`SELECT name FROM sqlite_master WHERE type='table' AND name = ?`, [tableName]
		)
		return !!result.data?.[0];
	} catch(err){
		propagateDBErr(err as Error);
	};
	return false;
};

const closeDB = async(): Promise<void> => {
	if (!db) throw new Error('DATABASE ERROR: Database not initialized');
	return new Promise((resolve, reject) => {
		db.close((err) => {
			if (err) reject(err);
			console.log('Database successfully closed!');
			resolve();
		});
	});
};

export const dbUtils = {
	initializeDB,
	runQuery,
	insertData,
	findAll,
	findOne,
	updateRecord,
	removeData,
	tableExists,
	closeDB
};
