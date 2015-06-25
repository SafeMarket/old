angular.module('app').controller('ManifestController',function($scope,$rootScope,storage,Vendor,ticker){
	
	function updateManifest(){
		$scope.areSettingsComplete = typeof storage.get('settings') === 'object'
		$scope.areProductsComplete = typeof storage.get('products') === 'object' && storage.get('products').length>0

		if(!storage.get('settings') || !storage.get('products'))
			return

		var vendorData = storage.get('settings')
		vendorData.mk_public = _.bipPrivateToPublic(vendorData.mk_private)
		vendorData.products = storage.get('products')

		$scope.vendor = new Vendor(vendorData)
	}

	$scope.$on('ticker.rates',function(){
		updateManifest()
	})

	$scope.$on('storage.save',function(){
		updateManifest()
	})

	$scope.preview = function(){
		if(!$scope.manifest) throw 'Manifest not set'
		$rootScope.$broadcast('manifest',$scope.manifest)
	}


	if(ticker.isSet)
		updateManifest()
})