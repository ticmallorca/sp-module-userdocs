
/**
 * api - userDocs
 * Copyright(c) 2020 Alejandro Villén
 * MIT Licensed
 */

import { Request, Response, Router } from "express";
const api: Router = Router();
import { settingsInstance } from "../../../core/Settings";
import { controller } from "./../controller/Controller";

/**
 * GET List of folders and files
 * @description Return a list of folders and files.
 */
api.get("/list", async (req: Request, res: Response) => {
	const module: SettingsModuleDT = await settingsInstance.getModuleSettings(req, "userDocs");
	if (module.settings === undefined) return res.json({ "no": "list" });

	const userDocsSettings: UserDocsSettingsDT = module.settings;
	const list: ResponseDT = await controller.list(userDocsSettings);
	return res.json(list);
});

/**
 * GET Get user file's list
 * @description Return user file's list.
 */
api.get("/docs", async (req: Request, res: Response) => {

	if (req.session.userDocs === undefined || req.session.userDocs.path === undefined || req.session.userDocs.path.match(/((.+)\/)+/g).length !== 1) return res.json({ "status": false, "message": "Bad param construction." });

	const module: SettingsModuleDT = await settingsInstance.getModuleSettings(req, "userDocs");
	const user: SettingsUserDT = await settingsInstance.getUser(req);
	const file: ResponseDT = await controller.content(module.settings, user.profile, req.session.userDocs.path);

	return res.json(file);
});

/**
 * GET Get file
 * @description Return the file selected.
 */
api.get("/get/*", async (req: Request, res: Response) => {

	if (req.params === undefined || req.params[0].match(/((.+)\/)+/g).length !== 1) return res.json({ "status": false, "message": "Bad param construction." });

	const module: SettingsModuleDT = await settingsInstance.getModuleSettings(req, "userDocs");
	const user: SettingsUserDT = await settingsInstance.getUser(req);

	const file: ResponseDT = await controller.get(module.settings, user.profile, req.params[0]);
	if (!file.status || file.size < 1) return res.json(file);

	const recordResponse: ResponseDT = await controller.recordDownload(module.settings, user.profile, file.data[0].remoteFile);
	if (!recordResponse.status) return recordResponse;

	const path = require("path");
	return res.download(file.data[0].localFullPath, path.basename(file.data[0].remoteFile));

});

export const userDocsController: Router = api;

