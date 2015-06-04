var data = require("sdk/self").data
	,contextMenu = require('sdk/context-menu')
	,panel = require('sdk/panel')
	,request = require('sdk/request')
	,text = null
	,Request = require("sdk/request").Request

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
	vendorPanel.port.emit("show",text);
})

Request({
	url:'https://google.com'
	,onComplete:function(response){
		console.log('response',response)
	}
}).get()

function get(url, callback){
    var xmlhttp;
    // compatible with IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            callback(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}