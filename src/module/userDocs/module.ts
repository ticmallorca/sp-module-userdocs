/**
 * module userDocs
 * Copyright(c) 2020 Alejandro Villén
 * MIT Licensed
 */

import { controller } from "./controller/Controller";
import settings from "./settings.json";

export class Module {

	private configuration: SettingsModuleDT;

	constructor () {
		console.log("* Module User Docs Instantiated at " + new Date().toLocaleString() + " *");
	}

	async init(user: SettingsUserDT) {
		this.configuration = JSON.parse(JSON.stringify(settings));

		// Get user data connection
		const connection: ResponseDT = await controller.getSettings(user.entityActivated);
		if (connection.status && connection.size === 1) {
			// UserDocsSettingsDT type
			this.configuration.settings.settings = connection.data[0];
			const listResponse: ResponseDT = await controller.list(this.configuration.settings.settings);
			if (listResponse.status && listResponse.size === 1) {
				this.configuration.settings.settings.folder = listResponse.data[0];
			}
		}

		for (const i in this.configuration.language) {
			const lang = await require("./language/" + i + ".json");
			this.configuration.language[i] = lang;
		}

	}
	public getSettings() {
		return this.configuration;
	}
}
