angular.module('app').controller('ReceiptController',function($scope,Vendor){

	self.port.on('receipt',function(options){
		var vendor = new Vendor(options.vendor,options.rates)

		vendor.getReceiptPromise(options.preferences,options.message).then(function(receipt){
			$scope.receipt = receipt
		})
	})

	$scope.update = function(){
		console.log($scope.receipt.getUpdatePromise)
		$scope.receipt.getUpdatePromise()
	}

})