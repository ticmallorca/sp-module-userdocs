/**
 * panel
 * Copyright(c) 2020 Alejandro Villén
 * MIT Licensed
 */

$("#userDocsReloadContent").click(function (){
	userDocs_panel_fileList();
});

$(window).on('load', function () {
	$(".datatable-basic").dataTable({
		autoWidth: false,
		responsive: true,
		stateSave: true,
		columnDefs: [{
			orderable: true
		}, {
			type: 'date',
			targets: [2],
			orderable: true
		}],
		buttons: {
			dom: {
				button: {
					className: 'btn btn-light'
				}
			}
		},
		dom: '<"datatable-header"fl><"datatable-scroll"t><"datatable-footer"ip>',
		language: {
			search: '<span>Filter:</span> _INPUT_ ',
			lengthMenu: '<span>Show:</span> _MENU_',
			paginate: {
				'first': 'First',
				'last': 'Last',
				'next': '→',
				'previous': '←'
			}
		}
	});

	userDocs_panel_fileList();
});