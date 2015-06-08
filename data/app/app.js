angular.module('app',[])

validate.validators.array = function(value, options, key, attributes) {
	return Array.isArray(value) ? null : key+' is not an array'
};

function convert(amount,currencies,rates){

	if(!rates.hasOwnProperty(currencies.from) || !rates.hasOwnProperty(currencies.to))
		throw 'Invalid currency'

	amount_btc = amount/rates[currencies.from]
	return amount_btc*rates[currencies.to]
}