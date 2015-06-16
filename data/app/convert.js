app.factory('convert',function(ticker,check,growl){
	return function(amount,currencies){
		if(!amount) return

		if(currencies.from == currencies.to)
			return amount

		if(typeof amount!=='string')
			amount = amount.toString()

		check({
			amount:amount
			,currency_from:currencies.from
			,currency_to:currencies.to
		},{
			amount:{presence:true,type:'string',numericality:{}}
			,currency_from:{presence:true,inclusion:Object.keys(ticker.rates),type:'string'}
			,currency_to:{presence:true,inclusion:Object.keys(ticker.rates),type:'string'}
		})

		amount = new Decimal(amount)

		var amount_btc = amount.div(ticker.rates[currencies.from])
			,amount_final = (new Decimal(amount_btc)).times(ticker.rates[currencies.to])
	
		if(currencies.to==='BTC')
			var places = 6
		else
			var places = 2

		return (new Decimal(amount_final)).toFixed(places)
	}
})