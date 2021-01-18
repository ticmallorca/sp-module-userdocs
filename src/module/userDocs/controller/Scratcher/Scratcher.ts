/**
 * Scratcher
 * Copyright(c) 2020 Alejandro Villén
 * MIT Licensed
 */

import { SambaInstance } from "./protocol/Samba";

class Scratcher {
	constructor () {

	}

	/**
	 * list
	 * @description
	 * @param [UserDocsSettingsDT] settings
	 * @returns [ResponseDT]
	 */
	async list(settings: UserDocsSettingsDT): Promise<ResponseDT> {

		switch (settings.protocol) {
			case "smb":
				return await SambaInstance.list(settings);
			default:
				break;
		}
		return {
			status: false,
			data: [],
			size: 0,
			message: "UserDocs: Controller: Scratcher: list(): No protocol recognized.",
			time: ""
		};
	}

	/**
	 * content
	 * @description
	 * @param [UserDocsSettingsDT] settings
	 * @param [string] path
	 * @returns [ResponseDT]
	 */
	async content(settings: UserDocsSettingsDT, user: UserDocsProfileDT, path: string): Promise<ResponseDT> {
		let contentFiles: ResponseDT = {
			status: false,
			data: [],
			size: 0,
			message: "UserDocs: Controller: Scratcher: content(): No data found.",
			time: ""
		};
		switch (settings.protocol) {
			case "smb":
				contentFiles = await SambaInstance.content(settings, path);
			default:
				break;
		}

		const pathArray = path.split("/").filter(item => item);
		let folderLevel = JSON.parse(JSON.stringify(settings.folder));

		let folderRoot = true;
		for (const item in pathArray) {

			if (folderRoot) folderLevel = folderLevel[pathArray[item]];
			if (!folderRoot) folderLevel = folderLevel.child[pathArray[item]];
			folderRoot = false;

			if (folderLevel === undefined) {
				contentFiles.status = false;
				contentFiles.data = [];
				contentFiles.size = contentFiles.data.length;
				contentFiles.message = "UserDocs: Controller: Scratcher: content(): The folder does not exist";
				return contentFiles;
			}
		}

		const dataMatched: ResponseDT = await this.match(folderLevel, user, contentFiles.data);
		if (!dataMatched) {
			contentFiles.message += "No matched data.";
			return contentFiles;
		}
		return dataMatched;
	}

	/**
	 * get
	 * @description
	 * @param [UserDocsSettingsDT] settings
	 * @param [string] path
	 * @param [string] file
	 * @returns [ResponseDT]
	 */
	async get(settings: UserDocsSettingsDT, user: UserDocsProfileDT, path: string): Promise<ResponseDT> {

		let response: ResponseDT = {
			status: false,
			data: [],
			size: 0,
			message: "UserDocs: Controller: Scratcher: get(): No protocol recognized.",
			time: ""
		};


		// if (file.match(userLDAP.data[0].dni) === null) {
		// 	response.message = `Module: userDocs: Controller: get(): Warning! Person identifiers do not match. Please use yours.`;
		// 	return response;
		// }
		switch (settings.protocol) {
			case "smb":
				response = await SambaInstance.get(settings, user, path);
			default:
				break;
		}


		const pathArray = path.split("/").filter(item => item);
		const fileName = pathArray.pop();
		let folderLevel = JSON.parse(JSON.stringify(settings.folder));

		let folderRoot = true;
		for (const item in pathArray) {

			if (folderRoot) folderLevel = folderLevel[pathArray[item]];
			if (!folderRoot) folderLevel = folderLevel.child[pathArray[item]];
			folderRoot = false;

			if (folderLevel === undefined) {
				response.status = false;
				response.data = [];
				response.size = response.data.length;
				response.message = "UserDocs: Controller: Scratcher: content(): The file does not exist";
				return response;
			}
		}

		if (folderLevel.content !== "public" && folderLevel.content !== "private") {
			response.status = false;
			response.data = [];
			response.size = response.data.length;
			response.message += `Folder content not recognized. content=${folderLevel.content}`;
			return response;
		}


		let re;
		if (folderLevel.content === "public") re = new RegExp(folderLevel.filter, "g");
		if (folderLevel.content === "private") re = new RegExp(`^${user.dni}`, "g");


		if (!fileName.match(re)) {
			response.status = false;
			response.data = [];
			response.size = response.data.length;
			response.message = `Warning! Person or patterns does not match. Please contact with your admin.`;
			return response;
		}

		response.status = true;
		response.size = response.data.length;
		response.message += `Data files matched!.`;
		return response;
	}

	/**
	 * match
	 * @description Match data with folder params and user id
	 * @param [UserDocsFolderDT] folder
	 * @param [UserDocsProfileDT] user
	 * @param [any[]] data
	 * @returns [ResponseDT]
	 */
	async match(folder: UserDocsFolderDT, user: UserDocsProfileDT, data: any[]): Promise<ResponseDT> {

		const response: ResponseDT = {
			status: false,
			data: [],
			size: 0,
			message: "UserDocs: Controller: Scratcher: match(): ",
			time: ""
		};

		if (folder.content !== "public" && folder.content !== "private") {
			response.message += `Folder content not recognized. content=${folder.content}`;
			return response;
		}


		let re;
		if (folder.content === "public") re = new RegExp(folder.filter, "g");
		if (folder.content === "private") re = new RegExp(`^${user.dni}`, "g");

		for (const item in data) {
			if (data[item].file.match(re)) response.data.push(data[item]);
		}

		response.status = true;
		response.size = response.data.length;
		response.message += `Data files matched!.`;
		return response;
	}
}

export let scratch = new Scratcher();
