/**
 * Samba
 * Copyright(c) 2020 Alejandro Villén
 * MIT Licensed
 */

import { MySQL } from "../../Database";
import { coreInstance } from "../../../../../core/Core";

class Samba implements UserDocsProtocolInterfaceDT {

	private ddbb: any;
	constructor() {
		this.ddbb = new MySQL();
	}

	async list(settings: UserDocsSettingsDT): Promise<ResponseDT> {
		const response: ResponseDT = {
			status: false,
			data: [],
			size: 0,
			message: "UserDocs: Controller/Scratcher/Samba: list():",
			time: ""
		};

		const CryptoTS = require("crypto-ts");
		const bytes = CryptoTS.AES.decrypt(settings.password, process.env.MODULE_USERDOCS_SETTINGS_PASSWORD);
		const plainPassword = bytes.toString(CryptoTS.enc.Utf8);

		const client = await coreInstance.service.smbClient;
		client.init({
			address: `//${settings.host}/${settings.resource}`,
			username: settings.user,
			password: plainPassword,
			domain: settings.domain
		});

		const exists = await client.fileExists(process.env.MODULE_USERDOCS_REMOTE_CONFIG_FILE);
		if (exists) {
			try {
				await client.getFile(process.env.MODULE_USERDOCS_REMOTE_CONFIG_FILE, `${__dirname}/../${process.env.MODULE_USERDOCS_FOLDER_DESTINATION_CONFIG_FILE}/${settings.entity}.json`);

				const path = require("path");
				const filename = path.resolve(`${__dirname}/../${process.env.MODULE_USERDOCS_FOLDER_DESTINATION_CONFIG_FILE}/${settings.entity}.json`);
				delete require.cache[filename];
				const folderStructure = require(`${__dirname}/../${process.env.MODULE_USERDOCS_FOLDER_DESTINATION_CONFIG_FILE}/${settings.entity}.json`);

				response.status = true;
				response.message = `${response.message} Config file exists and it's copied at local machine.`;
				response.data.push(folderStructure);
				response.size = response.data.length;

			} catch (error) {
				response.status = false;
				response.message = `${response.message} Config file exists but an error has occurred. Error ${error}`;

			}
		} else {
			response.message = `${response.message} Config file not found.`;
		}

		return response;
	}


	/**
	 * content
	 * @description
	 * @param [UserDocsSettingsDT] settings
	 * @param [UserDocsProfileDT] user
	 * @param [string] path
	 * @returns [ResponseDT]
	 */
	async content(settings: UserDocsSettingsDT, path: string): Promise<ResponseDT> {

		const response: ResponseDT = {
			status: false,
			data: [],
			size: 0,
			message: "UserDocs: Controller/Scratcher/Samba: content():",
			time: new Date().toLocaleString()
		};

		const CryptoTS = require("crypto-ts");
		const bytes = CryptoTS.AES.decrypt(settings.password, process.env.MODULE_USERDOCS_SETTINGS_PASSWORD);
		const plainPassword = bytes.toString(CryptoTS.enc.Utf8);

		const client = await coreInstance.service.smbClient;
		client.init({
			address: `//${settings.host}/${settings.resource}`,
			username: settings.user,
			password: plainPassword,
			domain: settings.domain
		});

		const pathExists = await client.dir(path);
		if (pathExists) {
			const rows = pathExists.split("\n");
			for (const i in rows) {
				// Check if row get some data
				if (rows[i] === "") continue;

				// Check if row data content a file name
				if (rows[i].match(/\s{6}(N|A)\s+\d+\s+/g) === null) continue;

				// Parse fileName
				const file = rows[i].split(/\s{6}(N|A)\s+\d+\s+/g)[0].trim();

				// File date
				const date = rows[i].split(/\s{6}(N|A)\s+\d+\s+/g)[2].trim();
				const created = Math.floor(new Date(date).getTime() / 1000);
				const fileDT: UserDocsFileDT = {
					file: file,
					path: path,
					fullPath: `${path}${file}`,
					created: created
				};
				response.data.push(fileDT);
			}
			response.status = true;
			response.message = `${response.message} Files founded.`;
			response.size = response.data.length;
			response.time = new Date().toLocaleString();

		} else {
			response.message = `${response.message} Folder not found.`;
		}

		return response;
	}

	/**
	 * get
	 * @description
	 * @param [UserDocsSettingsDT] settings
	 * @param [UserDocsProfileDT] user
	 * @param [string] path
	 * @param [string] file
	 * @returns [ResponseDT]
	 */
	async get(settings: UserDocsSettingsDT, user: UserDocsProfileDT, file: string): Promise<ResponseDT> {

		const response: ResponseDT = {
			status: false,
			data: [],
			size: 0,
			message: "UserDocs: Controller/Scratcher/Samba: get():",
			time: ""
		};

		const CryptoTS = require("crypto-ts");
		const bytes = CryptoTS.AES.decrypt(settings.password, process.env.MODULE_USERDOCS_SETTINGS_PASSWORD);
		const plainPassword = bytes.toString(CryptoTS.enc.Utf8);

		const client = await coreInstance.service.smbClient;
		client.init({
			address: `//${settings.host}/${settings.resource}`,
			username: settings.user,
			password: plainPassword,
			domain: settings.domain
		});

		const exists = await client.fileExists(`${file}`);
		if (exists) {
			try {

				const uuidv4 = require("uuid/v4");
				const destFileName = uuidv4();


				const getFileResponse = await client.getFile(file, `${__dirname}/../${process.env.MODULE_USERDOCS_FOLDER_DESTINATION_CONFIG_FILE}/${destFileName}`);
				// const getFileResponse = await client.getFile(file.replace(/\//g, "\\"), `${__dirname}/../${process.env.MODULE_USERDOCS_FOLDER_DESTINATION_CONFIG_FILE}/${destFileName}`);


				response.status = true;
				response.data.push(
					{
						remoteFile: file,
						localFile: destFileName,
						localFullPath: `${__dirname}/../${process.env.MODULE_USERDOCS_FOLDER_DESTINATION_CONFIG_FILE}/${destFileName}`,
						message: getFileResponse

					}
				);
				response.message = `${response.message} File exists and it's copied at local machine.`;
				response.size = response.data.length;

			} catch (error) {
				response.status = false;
				response.message = `${response.message} Config file exists but an error has occurred. Error ${error}`;

			}
		} else {
			response.message = `${response.message} Config file not found.`;
		}

		return response;
	}
}

export let SambaInstance = new Samba();
