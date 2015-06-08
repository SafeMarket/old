angular.module('app').controller('VendorController',function($scope,$q,$timeout,Vendor){

	$scope.totals = {
		vendor_currency:0
		,my_currency:0
		,btc:0
	}

	self.port.on('show',function onShow(options){
		$scope.preferences = options.preferences
		$scope.vendor = null

		try{
			$scope.vendor = Vendor.fromXml(options.vendorXml,options.rates)
			console.log($scope.vendor)
		}catch(err){
			$scope.error=err
		}

		$scope.$apply()
	})

	$scope.$watch('vendor.products',function(product){
		if(!$scope.vendor) return

		$scope.totals = {
			vendor_currency:$scope.vendor.getTotal()
			,btc:$scope.vendor.getTotal('BTC')
			,my_currency:$scope.vendor.getTotal($scope.preferences.currency)
		}
	},true)

	$scope.checkout = function(){
		self.port.emit('receipt',{vendor:$scope.vendor,message:$scope.message})
		console.log('checkout')
	}

})