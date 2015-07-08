angular.module('app').controller('RegisterController',function($scope,$rootScope,storage,Vendor,ticker){
	
	function update(){
		$scope.vendor = null
		if(typeof storage.get('settings') !== 'object')
			throw 'Settings not complete'
		if(!storage.get('settings').xprvkey)
			throw 'Master private key (xprv) not set'

		var vendorData = storage.get('settings')
		vendorData.xpubkey = _.bipPrivateToPublic(vendorData.xprvkey)
		vendorData.products = storage.get('products')

		$scope.vendor = new Vendor(vendorData,true)
		$scope.vendor.setMyRegistrationTxs()
		$scope.updatedAt = (new Date).getTime()
	}

	$scope.update = function (){
		try{
			update()
		}catch(error){
			growl.addErrorMessage(error)
		}
	}

})