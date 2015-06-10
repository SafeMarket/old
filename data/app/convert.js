app.factory('convert',function(ticker){
	return function(amount,currencies){

		if(!ticker.rates.hasOwnProperty(currencies.from) || !ticker.rates.hasOwnProperty(currencies.to))
			throw 'Invalid currency'

		amount_btc = amount/ticker.rates[currencies.from]
		return amount_btc*ticker.rates[currencies.to]
	}
})