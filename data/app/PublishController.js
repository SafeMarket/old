angular.module('app').controller('PublishController',function($scope,$rootScope,storage,Vendor,ticker,growl){
	
	function update(){
		$scope.vendor = null
		growl.addInfoMessage('Fetching current balance...')
		if(typeof storage.get('settings') !== 'object')
			throw 'Settings not complete'
		if(typeof storage.get('products') !== 'object' || !storage.get('products').length)
			throw 'Products not complete'
		if(!storage.get('settings').info)
			throw 'Vendor info not set'
		if(!storage.get('settings').xprvkey)
			throw 'Master private key (xprv) not set'

		var vendorData = storage.get('settings')
		vendorData.xpubkey = _.bipPrivateToPublic(vendorData.xprvkey)
		vendorData.products = storage.get('products')

		$scope.vendor = new Vendor(vendorData,true)
		$scope.vendor.setMyPublishingTxs()
	}

	$scope.update = function (){
		try{
			update()
		}catch(error){
			console.log(error)
			growl.addErrorMessage(error)
		}
	}

	$scope.preview = function(){
		$rootScope.$broadcast('vendorData',$scope.vendor.data)
	}

})