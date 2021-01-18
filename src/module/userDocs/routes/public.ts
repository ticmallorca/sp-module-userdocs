
/**
 * public - userDocs
 * Copyright(c) 2020 Alejandro Villén
 * MIT Licensed
 */

import { Request, Response, Router } from "express";
const api: Router = Router();
import { settingsInstance } from "../../../core/Settings";

/**
 * GET Get file
 * @description Return the file selected.
 */
api.get("/panel/*", async (req: Request, res: Response) => {

	settingsInstance.setPageTitle(req, "UserDocs - Panel Section");
	const currentPanel: SettingsCurrentPanelDT = {
		module: "userDocs",
		component: "panel"
	};
	settingsInstance.setCurrentPanel(req, currentPanel);

	if (req.params === undefined || req.params[0].match(/((.+)\/)+/g).length !== 1) return res.render("pages/base", await settingsInstance.getSettings(req));
	if (req.session.userDocs === undefined) req.session.userDocs = {};
	req.session.userDocs.path = req.params[0];
	return res.render("pages/base", await settingsInstance.getSettings(req));

});

export const userDocsController: Router = api;

