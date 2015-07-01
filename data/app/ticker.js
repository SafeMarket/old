app.factory('ticker',function($interval,$timeout,$http,$rootScope,storage,growl){
	
	var storageRates = storage.get('rates')

	var ticker = {
		rates:storageRates?storageRates:{}
		,isSet:storageRates?true:false
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
			rates['satoshi'] = rates['BTC'].times(Math.pow(10,8));

			ticker.isSet = true
			ticker.rates = rates
			storage.save('rates',rates)
			$rootScope.$broadcast('ticker.rates',rates)

		}).error(function(){
			growl.addErrorMessage('Could not update rates data. Trying again in 30 seconds.')
			$timeout(updateRates,30*1000)
		})
	}

	return ticker
})