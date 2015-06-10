angular.module('app').controller('OrderController',function($scope,Order){

	$scope.$watch('receipt',function(receipt){
		if(!receipt) return
		Order.fromReceiptPromise(receipt).then(function(order){
			console.log(order)
			$scope.order = order
		})
	})

	$scope.$on('receipt',function($event,receipt){
		$scope.receipt = receipt
	})

	$scope.update = function(){
		$scope.receipt.getUpdatePromise()
	}

})