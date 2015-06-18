angular.module('app').controller('OrderController',function($scope,$interval,Order,growl){

	$scope.$watch('receipt',function(receipt){
		$scope.order = null
		
		if(!receipt) return
		
		Order.fromReceiptPromise(receipt).then(function(order){
			$scope.order = order
		})
	})

	$interval(function(){
		if(!$scope.order) return
	},1000*60)

	$scope.$on('receipt',function($event,receipt){
		$scope.receipt = receipt
	})

})