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
  	contentScriptFile: data.url('app/menu.js'),
 	onMessage: function (vendorXml) {
 		
 		vendorPanel.port.emit("show",{
			vendorXml:vendorXml
			,rates:rates.getRates()
			,preferences:preferences
		});
 		
 		vendorPanel.show();
 	}
});

var scripts = [
	data.url('components/angular/angular.min.js')
	,data.url('components/xml2json/xml2json.js')
	,data.url('components/validate/validate.min.js')
	,data.url('components/openpgp/dist/openpgp.min.js')
	,data.url('components/bip32.github.io/js/jquery.js')
	,data.url('components/bip32.github.io/js/bitcoinjs-min.js')
	,data.url('components/bip32.github.io/js/modsqrt.js')
	,data.url('components/bip32.github.io/js/sha256.js')
	,data.url('components/bip32.github.io/js/sha512.js')
	,data.url('components/bip32.github.io/js/bip32.js')
	,data.url("app/app.js")
	,data.url("app/blockchain.js")
	,data.url("app/Vendor.js")
	,data.url("app/Receipt.js")
	,data.url("app/VendorController.js")
	,data.url("app/ReceiptController.js")
]

var vendorPanel = panel.Panel({
	contentURL: data.url("views/vendor.html")
	,contentScriptFile: scripts
	,width:600
	,height:600
	,contentStyleFile:data.url("components/bootstrap/dist/css/bootstrap.min.css")
})

var receiptPanel = panel.Panel({
	contentURL: data.url("views/receipt.html")
	,contentScriptFile: scripts
	,width:600
	,height:600
	,contentStyleFile:data.url("components/bootstrap/dist/css/bootstrap.min.css")
})

vendorPanel.port.on('receipt',function(options){
	options.preferences = preferences
	options.rates = rates.getRates()
	receiptPanel.port.emit('receipt',options)
	receiptPanel.show()
})