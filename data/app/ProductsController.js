app.controller('ProductsController',function($scope,storage,growl){
	$scope.products = storage.data.products ? storage.data.products : [{}]
	$scope.currency = storage.data.settings ? storage.data.settings.currency : 'BTC'

	$scope.save = function(){
		if(!$scope.productsForm.$valid)
			return growl.addErrorMessage('Save failed')

		storage.data.products = $scope.products
		storage.save()
		growl.addSuccessMessage('Products saved')
	}

	$scope.deleteProduct = function(index){
		$scope.products.splice(index,1)
	}
})