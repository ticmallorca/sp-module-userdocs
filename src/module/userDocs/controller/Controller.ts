/**
 * Controller
 * Copyright(c) 2020 Alejandro Villén
 * MIT Licensed
 */

import * as dotenv from "dotenv";
if (process.env.NODE_ENV === "PRO") {
	dotenv.config({ path: "environment/module/userDocs/.pro.env" });
} else if (process.env.NODE_ENV === "DEV") {
	dotenv.config({ path: "environment/module/userDocs/.dev.env" });
}

import { MySQL } from "./Database";
import { scratch } from "./Scratcher/Scratcher";
import { coreInstance } from "./../../../core/Core";

class Controller {

	constructor () { }

	/**
	 * getSettings
	 * @description Use entity id to get the settings to communicate with the service
	 * @param [number] id
	 * @returns [ResponseDT]
	 */
	async getSettings(id: number): Promise<ResponseDT> {

		const ddbb = new MySQL();
		const query: string = `SELECT id_entity AS entity,name,host,port,resource,protocol,domain,user,password,created FROM settings AS s WHERE id_entity=?`;
		const args: any = [
			id
		];
		const responseQuery: ResponseDT = await ddbb.doQuery(query, args);
		if (responseQuery.status && responseQuery.size === 0) {
			responseQuery.status = false;
		}
		return responseQuery;
	}

	/**
	 * recordDownload
	 * @description Use entity id to get the settings to communicate with the service
	 * @param [number] id
	 * @returns [ResponseDT]
	 */
	async recordDownload(settings: UserDocsSettingsDT, user: SettingsUserProfileDT, file: string): Promise<ResponseDT> {

		const ddbb = new MySQL();
		const query: string = `INSERT INTO downloads(id_user, id_entity, name, surname, email, file, created) VALUES (?,?,?,?,?,?,UNIX_TIMESTAMP())`;
		const args: any = [
			user.id,
			settings.entity,
			user.name,
			user.surname,
			user.email,
			file
		];
		const responseQuery: ResponseDT = await ddbb.doQuery(query, args);
		if (responseQuery.status && responseQuery.size === 0) {
			responseQuery.status = false;
		}
		return responseQuery;
	}

	/**
	 * list
	 * @description
	 * @param [SettingsUserDT] user
	 * @returns [ResponseDT]
	 */
	async list(settings: UserDocsSettingsDT): Promise<ResponseDT> {
		let list: ResponseDT = {
			status: false,
			size: 0,
			data: [],
			message: "",
			time: new Date().toLocaleString()
		};

		if (settings !== undefined) list = await scratch.list(settings);
		return list;
	}

	/**
	 * content
	 * @description
	 * @param [SettingsUserDT] user
	 * @param [string] path
	 * @returns [ResponseDT]
	 */
	async content(settings: UserDocsSettingsDT, user: SettingsUserProfileDT, path: string): Promise<ResponseDT> {
		const response: ResponseDT = {
			status: false,
			size: 0,
			data: [],
			message: "",
			time: new Date().toLocaleString()
		};

		if (settings === undefined || user === undefined || path === "" || path === undefined) {
			response.message = "Module: userDocs: Controller: content(): Settings,User or Path are empty. Please check it.";
			return response;
		}

		const userLDAP: ResponseDT = await coreInstance.service.ldapClient.getUser(user.email);
		if (!userLDAP.status || userLDAP.size !== 1) {
			response.message = `Module: userDocs: Controller: content(): ${userLDAP.message}`;
			return response;
		}

		const userProfile: UserDocsProfileDT = {
			id: user.id,
			name: user.name,
			email: user.email,
			dni: userLDAP.data[0].dni
		};

		return await scratch.content(settings, userProfile, path);

	}


	/**
	 * get
	 * @description
	 * @param [UserDocsSettingsDT] settings
	 * @param [SettingsUserProfileDT] user
	 * @param [string] file
	 * @returns [ResponseDT]
	 */
	async get(settings: UserDocsSettingsDT, user: SettingsUserProfileDT, file: string): Promise<ResponseDT> {
		const response: ResponseDT = {
			status: false,
			size: 0,
			data: [],
			message: "",
			time: new Date().toLocaleString()
		};

		if (settings === undefined || user === undefined || file === "" || file === undefined) {
			response.message = "Module: userDocs: Controller: get(): Settings,User,Path or File are empty. Please check it.";
			return response;
		}


		const userLDAP: ResponseDT = await coreInstance.service.ldapClient.getUser(user.email);
		if (!userLDAP.status || userLDAP.size !== 1) {
			response.message = `Module: userDocs: Controller: get(): ${userLDAP.message}`;
			return response;
		}

		const userProfile: UserDocsProfileDT = {
			id: user.id,
			name: user.name,
			email: user.email,
			dni: userLDAP.data[0].dni
		};

		return await scratch.get(settings, userProfile, file);

	}
}

export let controller = new Controller();
