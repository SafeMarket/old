var Request = require("sdk/request").Request
	,timers = require("sdk/timers")
	,rates = {BTC:1}

updateRates()

timers.setInterval(function(){
	updateRates()
},10*60*1000);

function updateRates(){
	Request({
		url:'https://bitpay.com/api/rates'
		,onComplete:function(response){
			var _rates = {}
			response.json.forEach(function(currency){
				_rates[currency.code] = currency.rate
			})
			rates = _rates
		}
	}).get()
}

exports.getRates = function(){ return rates }

exports.updateRates = updateRates