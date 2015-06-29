var data = require("sdk/self").data
	,contextMenu = require('sdk/context-menu')
	,tabs = require("sdk/tabs")
	,ss = require("sdk/simple-storage")

var scripts = [ 
	data.url("components/lodash/lodash.min.js")
	,data.url("components/angular/angular.min.js")
	,data.url("components/angular-bootstrap/ui-bootstrap.min.js")
	,data.url("components/angular-growl/build/angular-growl.min.js")
	,data.url("components/angular-timeago/src/timeAgo.js")
	,data.url("components/angularjs-json-rpc/angular-json-rpc.min.js")
	,data.url("components/xml2json/xml2json.js")
	,data.url("components/decimal.js/decimal.min.js")
	,data.url("components/validate/validate.min.js")
	,data.url("components/openpgp/dist/openpgp.js")
	,data.url("components/bip32.github.io/js/jquery.js")
	,data.url("components/bip32.github.io/js/bitcoinjs-min.js")
	,data.url("components/bip32.github.io/js/modsqrt.js")
	,data.url("components/bip32.github.io/js/sha256.js")
	,data.url("components/bip32.github.io/js/sha512.js")
	,data.url("components/bip32.github.io/js/bip32.js")
	,data.url("components/bip39/src/js/wordlist_english.js")
	,data.url("components/bip39/src/js/wordlist_english.js")
	,data.url("components/bip39/src/js/jsbip39.js")
	,data.url("components/msgpack-js/msgpack.js")
	,data.url("components/utf8/utf8.js")
	,data.url("components/js-md5/js/md5.min.js")
	,data.url("browserified/bitcoin.js")
	,data.url("app/app.js")
	,data.url("app/storage.js")
	,data.url("app/check.js")
	,data.url("app/pgp.js")
	,data.url("app/ticker.js")
	,data.url("app/convert.js")
	,data.url("app/blockchain.js")
	,data.url("app/Vendor.js")
	,data.url("app/Order.js")
	,data.url("app/AppController.js")
	,data.url("app/SettingsController.js")
	,data.url("app/ProductsController.js")
	,data.url("app/VendorController.js")
	,data.url("app/OrderController.js")
	,data.url("app/PublishController.js")
]

var tabWorker

contextMenu.Item({
  	label: 'Open SafeMarket',
  	contentScriptFile: data.url('app/menu.js'),
 	onMessage: function () {
 		tabs.open({
		  	url: data.url('index.html')
		  	,isPinned:false
		  	,onReady: function onOpen(tab) {
			    tabWorker = tab.attach({
			    	contentScriptFile:scripts
			    });
		  	},onLoad:function(){
		  		tabWorker.port.emit('load',ss.storage.data)
			    tabWorker.port.on('store',function(data){
					ss.storage.data = data
				})
		  	}
		});
 	}
});

contextMenu.Item({
  	label: 'Load Receipt',
  	context: contextMenu.SelectionContext(),
  	contentScriptFile: data.url('app/menu.js'),
 	onMessage: function (receipt) {
 		
 		tabs.open({
 			url:data.url("index.html")
 			,onReady: function onOpen(tab) {
			    tabWorker = tab.attach({
			    	contentScriptFile:scripts
			    });
		  	},onLoad:function(){
		  		tabWorker.port.emit('load',ss.storage.data)
		  		tabWorker.port.on('bootstrapped',function(data){
		  			console.log('emit')
					tabWorker.port.emit('receipt',receipt)
				})
			    tabWorker.port.on('store',function(data){
					ss.storage.data = data
				})
		  	}
 		});

 	}
});
