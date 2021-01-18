/**
 * MySQL
 * Copyright(c) 2019 Alejandro Villén
 * MIT Licensed
 */

import mysql = require("mysql");
import { Format } from "../../../tools/Format";


let _instance: any = undefined;

export class MySQL {
	_conn: mysql.Pool;
	constructor () {
		if (!_instance) {
			_instance = this;
		}

		console.log(`MODULE_USERDOCS_MySQL instance: id=${this.constructor.name}_${Math.random().toString(36).substr(2, 9)}`);
		if (process.env.NODE_ENV === "DEV") console.log(`Database ${process.env.MODULE_USERDOCS_MYSQL_DATABASE}`);
		this._conn = mysql.createPool({
			waitForConnections: true,
			queueLimit: 0,
			connectionLimit: parseInt(process.env.MODULE_USERDOCS_MYSQL_POOL_MAX_CONNECTIONS),
			host: process.env.MODULE_USERDOCS_MYSQL_HOST,
			user: process.env.MODULE_USERDOCS_MYSQL_USER,
			password: process.env.MODULE_USERDOCS_MYSQL_PASSWORD,
			database: process.env.MODULE_USERDOCS_MYSQL_DATABASE
		});

		return _instance;
	}

	async doQuery(query: string, args: []): Promise<ResponseDT> {
		// console.warn(`DDBB query = ${query}`);
		return await new Promise((resolve, reject) => {
			this._conn.getConnection((err, conn) => {
				// Handle error after the release.
				if (err) {
					console.error("MySQL: doQuery(): Error on getConnection:" + err);
					if (err.code === "PROTOCOL_CONNECTION_LOST") {
						console.error("Database connection was closed.");
					}
					if (err.code === "ER_CON_COUNT_ERROR") {
						console.error("Database has too many connections.");
					}
					if (err.code === "ECONNREFUSED") {
						console.error("Database connection was refused.");
					}
					return resolve(new Format(false, [], err.stack).toDataBaseObject());
				}



				conn.query(query, args, (err, results, fields) => {
					// And done with the connection.
					conn.release();
					if (err) {
						console.error(`MySQL: doQuery(): Error on query function: Query: ${err.sql} Error: ${JSON.stringify(err)}`);
						return resolve(new Format(false, [], err.stack).toDataBaseObject());
					}
					if (results.length === 0) {
						return resolve(new Format(true, results, "Query results with non results.").toDataBaseObject());
					}
					return resolve(new Format(true, results, "Query successful.").toDataBaseObject());
				});
			});
		});
	}
}
