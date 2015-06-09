app.controller('SettingsController',function($scope,storage){
	$scope.settings = storage.data.settings

	$scope.saveSettings = function(){
		storage.data.settings = $scope.settings
		storage.save()
	}
})