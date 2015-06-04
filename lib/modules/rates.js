var Request = require("sdk/request").Request
	,timers = require("sdk/timers")
	,rates = {'BTC':1}

updateRates()

timers.setInterval(function(){
	updateRates()
},10*60*1000);

function updateRates(){
	Request({
		url:'https://blockchain.info/ticker'
		,onComplete:function(response){
			var _rates = {}
			Object.keys(response.json).forEach(function(currency){
				_rates[currency] = response.json[currency].last
			})
			rates = _rates
		}
	}).get()
}

exports.getRates = function(){ return rates }
exports.updateRates = updateRates