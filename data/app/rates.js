angular.module('app').factory('rates',function($interval,$http){
	
	var rates = {}

	updateRates()

	$interval(function(){
		updateRates()
	},10*60*1000);

	function updateRates(){
		$http.get('https://bitpay.com/api/rates').success(function(response){
			var _rates = {}
			response.forEach(function(currency){
				_rates[currency.code] = currency.rate
			})
			rates = _rates
		})
	}

	return rates
})