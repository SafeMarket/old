var data = require("sdk/self").data
	,contextMenu = require('sdk/context-menu')
	,panel = require('sdk/panel')
	,request = require('sdk/request')
	,timers = require("sdk/timers")
	,rates = require('./modules/rates')
	,text = null

var menuItem = contextMenu.Item({
  	label: 'Load Vendor',
  	context: contextMenu.SelectionContext(),
  	contentScriptFile: data.url('menu/menu.js'),
 	onMessage: function (_text) {
 		text = _text
  		vendorPanel.show();
 	}
});

var vendorPanel = panel.Panel({
	contentURL: data.url("vendor/vendor.html")
	,contentScriptFile: [
		data.url('components/angular/angular.min.js')
		,data.url('components/abdmob/x2js/xml2json.min.js')
		,data.url('components/validate/validate.min.js')
		,data.url("vendor/vendor.js")
	],focus:false
	,width:600
	,contentStyleFile:data.url("components/bootstrap/dist/css/bootstrap.min.css")
});

vendorPanel.on('show',function(options){
	vendorPanel.port.emit("show",{
		text:text
		,rates:rates.getRates()
	});
})