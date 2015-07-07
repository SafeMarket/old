app.factory('ticker',function($interval,$timeout,$http,$rootScope,storage,growl,blockchain){
	
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

		blockchain.getTickerPromise().then(function(ticker){
			var rates = {}
			_.keys(ticker).forEach(function(currency){
				rates[currency] = new Decimal(ticker[currency]['15m'])
			})

			rates['BTC'] = new Decimal(1)
			rates['satoshi'] = rates['BTC'].times(Math.pow(10,8));

			ticker.isSet = true
			ticker.rates = rates
			storage.save('rates',rates)
			$rootScope.$broadcast('ticker.rates',rates)
		},function(error){
			growl.addErrorMessage('Could not update rates data. Trying again in 30 seconds.')
			$timeout(updateRates,30*1000)
		})
	}

	return ticker
})