var data = require("sdk/self").data
	,contextMenu = require('sdk/context-menu')
	,panel = require('sdk/panel')
	,request = require('sdk/request')
	,timers = require("sdk/timers")
	,preferences = require("sdk/simple-prefs").prefs

contextMenu.Item({
  	label: 'Open Trustless',
  	contentScriptFile: data.url('app/menu.js'),
 	onMessage: function () {
 		appPanel.port.emit('show')
 		appPanel.show();
 	}
});

contextMenu.Item({
  	label: 'Load Vendor',
  	context: contextMenu.SelectionContext(),
  	contentScriptFile: data.url('app/menu.js'),
 	onMessage: function (vendorXml) {
 		
 		vendorPanel.port.emit("show",{
			vendorXml:vendorXml
			,preferences:preferences
		});
 		
 		vendorPanel.show();
 	}
});


var appPanel = panel.Panel({
	contentURL: data.url("app.html")
	,width:600
	,height:600
})