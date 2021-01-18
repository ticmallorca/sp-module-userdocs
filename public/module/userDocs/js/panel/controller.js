/**
 * controller
 * Copyright(c) 2020 Alejandro Villén
 * MIT Licensed
 */

function userDocs_panel_fileList() {

	var apiURL = `/api/userDocs/docs`;
	$.ajax({
		type: "GET",
		url: apiURL

	}).done(function (response) {
		if (response.status === true) {
			userDocs_panel_print_fileList(response.data);
		} else {
			// Message sended
			doNotify("error", response.status, response.message);
		}
	});

}
