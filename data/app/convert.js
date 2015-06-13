app.factory('convert',function(ticker,check){
	return function(amount,currencies){
		if(currencies.from == currencies.to)
			return amount

		if(!ticker.rates.hasOwnProperty(currencies.from) || !ticker.rates.hasOwnProperty(currencies.to))
			throw 'Invalid currency'

		if(typeof amount!=='string')
			amount = amount.toString()

		check({
			amount:amount
		},{
			amount:{presence:true,type:'string',numericality:{}}
		})

		amount = new Decimal(amount)
		console.log('amount',amount)

		var amount_btc = amount.div(ticker.rates[currencies.from])
			,x =  console.log('amount_btc',amount_btc)
			,amount_final =  (new Decimal(amount_btc)).times(ticker.rates[currencies.to])
	
		console.log('amount_final',amount_final)

		return amount_final
	}
})