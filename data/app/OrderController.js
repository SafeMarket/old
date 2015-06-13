angular.module('app').controller('OrderController',function($scope,Order,growl){

	$scope.$watch('receipt',function(receipt){
		if(!receipt) {
			$scope.order = null
			return
		}
		
		try{
			Order.fromReceiptPromise(receipt).then(function(order){
				$scope.order = order
			},function(error){
				growl.addErrorMessage(error)
			})
		}catch(error){
			growl.addErrorMessage(error)
		}
	})

	$scope.$on('receipt',function($event,receipt){
		$scope.receipt = receipt
	})

	$scope.update = function(){
		$scope.receipt.getUpdatePromise()
	}

})