var data = require("sdk/self").data
	,contextMenu = require('sdk/context-menu')
	,panel = require('sdk/panel')
	,request = require('sdk/request')
	,timers = require("sdk/timers")
	,rates = require('./modules/rates')
	,preferences = require("sdk/simple-prefs").prefs

var menuItem = contextMenu.Item({
  	label: 'Load Vendor',
  	context: contextMenu.SelectionContext(),
  	contentScriptFile: data.url('menu/menu.js'),
 	onMessage: function (vendorXml) {
 		
 		vendorPanel.port.emit("show",{
			vendorXml:vendorXml
			,rates:rates.getRates()
			,preferences:preferences
		});
 		
 		vendorPanel.show();
 	}
});

var vendorPanel = panel.Panel({
	contentURL: data.url("vendor/vendor.html")
	,contentScriptFile: [
		data.url('components/angular/angular.min.js')
		,data.url('components/xml2json/xml2json.js')
		,data.url('components/validate/validate.min.js')
		,data.url("vendor/vendor.js")
	],focus:false
	,width:600
	,height:600
	,contentStyleFile:data.url("components/bootstrap/dist/css/bootstrap.min.css")
});