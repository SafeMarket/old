app.factory('ticker',function($interval,$http,$rootScope,storage){
	
	var ticker = {
		rates:{}
		,isSet:false
	}

	updateRates()

	$interval(function(){
		updateRates()
	},10*60*1000);

	function updateRates(){
		$http.get('https://bitpay.com/api/rates').success(function(response){
			var rates = {}
			response.forEach(function(currency){
				rates[currency.code] = new Decimal(currency.rate)
			})

			if(rates['BTC'])
			rates['satoshi'] = rates['BTC'].times(Math.pow(10,9));

			ticker.isSet = true
			ticker.rates = rates
			$rootScope.$broadcast('ticker.rates',rates)

		})
	}

	return ticker
})