var data = require("sdk/self").data
	,contextMenu = require('sdk/context-menu')
	,panel = require('sdk/panel')
	,request = require('sdk/request')
	,timers = require("sdk/timers")
	,preferences = require("sdk/simple-prefs").prefs
	,tabs = require("sdk/tabs")
	,ss = require("sdk/simple-storage")

contextMenu.Item({
  	label: 'Open Trustless',
  	contentScriptFile: data.url('app/menu.js'),
 	onMessage: function () {

 		tabs.open({
		  url: data.url('index.html'),
		  isPinned: true,
		  onOpen: function onOpen(tab) {
		    var worker = tab.attach({
		    	contentScript:data.url('app/storage.js')
		    });
			worker.port.on('store',function(data){
				console.log('store',data)
				ss.storage = data
			})
		  }
		});

 		return

 		appPanel.port.emit('show')
 		appPanel.show();
 	}
});

contextMenu.Item({
  	label: 'Load Vendor',
  	context: contextMenu.SelectionContext(),
  	contentScriptFile: data.url('app/menu.js'),
 	onMessage: function (vendorXml) {
 		
 		tabs.open(data.url("index.html"));

 		return
 		vendorPanel.port.emit("show",{
			vendorXml:vendorXml
			,preferences:preferences
		});
 		
 		vendorPanel.show();
 	}
});


var appPanel = panel.Panel({
	contentURL: data.url("index.html")
	,contentScript: data.url('app/storage.js')
	,width:800
	,height:600
})

appPanel.port.on('store',function(data){
	console.log('store')
})