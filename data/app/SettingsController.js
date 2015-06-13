app.controller('SettingsController',function($scope,storage,$timeout,ticker,growl){
	$scope.settings = storage.get('settings')
	$scope.currencies = Object.keys(ticker.rates)

	$scope.$on('ticker.rates',function($event,rates){
		$scope.currencies = Object.keys(rates)
	})


	$scope.save = function(){
		if(!$scope.settingsForm.$valid)
			return growl.addErrorMessage('Save failed')

		storage.save('settings',$scope.settings)
		growl.addSuccessMessage('Settings saved')
	}

})