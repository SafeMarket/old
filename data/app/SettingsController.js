app.controller('SettingsController',function($scope,storage,$timeout,ticker,growl){
	$scope.settings = storage.data.settings
	$scope.currencies = Object.keys(ticker.rates)

	$scope.$on('ticker.rates',function($event,rates){
		$scope.currencies = Object.keys(rates)
	})


	$scope.save = function(){
		if(!$scope.settingsForm.$valid)
			return growl.addErrorMessage('Save failed')

		storage.data.settings = $scope.settings
		storage.save()
		growl.addSuccessMessage('Settings saved')
	}
})