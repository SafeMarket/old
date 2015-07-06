angular.module('app').controller('RegisterController',function($scope,$rootScope,storage,Vendor,ticker){
	
	function updateManifest(){
		$scope.areSettingsComplete = typeof storage.get('settings') === 'object'
		$scope.isMasterPrivateKeySet = $scope.areSettingsComplete ? !!storage.get('settings').xprvkey : false

		if(!$scope.areSettingsComplete || !$scope.isMasterPrivateKeySet){
			$scope.vendor = null
			return
		}

		var vendorData = storage.get('settings')
		vendorData.xpubkey = _.bipPrivateToPublic(vendorData.xprvkey)
		vendorData.products = storage.get('products')

		$scope.vendor = new Vendor(vendorData,true)
		$scope.vendor.setMyFlags()
	}

	$scope.$on('ticker.rates',function(){
		updateManifest()
	})

	$scope.$on('storage.settings.save',function(){
		updateManifest()
	})
	$scope.$on('storage.products.save',function(){
		updateManifest()
	})

	$scope.preview = function(){
		$rootScope.$broadcast('vendorData',$scope.vendor.data)
	}


	if(ticker.isSet)
		updateManifest()
})