angular.module('app').controller('PublishController',function($scope,$rootScope,storage,Vendor,ticker){
	
	function updateManifest(){
		$scope.areSettingsComplete = typeof storage.get('settings') === 'object'
		$scope.areProductsComplete = typeof storage.get('products') === 'object' && storage.get('products').length>0
		$scope.isInfoSet = $scope.areSettingsComplete ? !!storage.get('settings').info : false
		$scope.isMasterPrivateKeySet = $scope.areSettingsComplete ? !!storage.get('settings').mk_private : false

		if(!$scope.areSettingsComplete || !$scope.areProductsComplete || !$scope.isInfoSet ||!$scope.isMasterPrivateKeySet){
			$scope.vendor = null
			return
		}

		var vendorData = storage.get('settings')
		vendorData.mk_public = _.bipPrivateToPublic(vendorData.mk_private)
		vendorData.products = storage.get('products')

		$scope.vendor = new Vendor(vendorData,true)
	}

	$scope.$on('ticker.rates',function(){
		updateManifest()
	})

	$scope.$on('storage.settings.save',function(){
		updateManifest()
	})

	$scope.preview = function(){
		$rootScope.$broadcast('vendorData',$scope.vendor.data)
	}


	if(ticker.isSet)
		updateManifest()
})