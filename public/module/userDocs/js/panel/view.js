/**
 * view
 * Copyright(c) 2020 Alejandro Villén
 * MIT Licensed
 */
function userDocs_panel_print_fileList(data) {
	console.log(data);
	if (data.length < 1) doNotify("info", true, "No hi teníu documents per llistar a aquesta secció");


	$(".datatable-basic").DataTable().clear().draw();
	var fullArray = [];
	var dataArray = [];
	for (var ele in data) {
		var element = data[ele];

		var status = "";
		if (parseInt(new Date().getTime()) - parseInt(new Date(element.created*1000).getTime()) <= 7 * 24 * 60 * 60) status = ` <span class="badge badge-success">Nou</span>`;
		var iconFile = "icon-file-text2";
		if (element.file.split(".")[1] === "pdf") {
			iconFile = `icon-file-${element.file.split(".")[1]}`;
		}
		dataArray.push(`<i class=${iconFile}>${status}</i>`);
		dataArray.push(element.file);
		dataArray.push(new Date(element.created*1000).toLocaleString());
		dataArray.push(`
						<a href="/api/userDocs/get/${element.fullPath}" class="btn btn-primary btn-sm" role="button" ><i class="icon-file-download"></i> Download</a>

		`);
		fullArray.push(dataArray);
		dataArray = [];
	}
	$('.datatable-basic').DataTable().rows.add(fullArray);
	$('.datatable-basic').DataTable().columns.adjust().draw();



}
