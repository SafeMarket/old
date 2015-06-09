angular.module('app').factory('convert',function(rates){
	return function(amount,currencies){

		if(!rates.hasOwnProperty(currencies.from) || !rates.hasOwnProperty(currencies.to))
			throw 'Invalid currency'

		amount_btc = amount/rates[currencies.from]
		return amount_btc*rates[currencies.to]
	}
})