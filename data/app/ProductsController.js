app.controller('ProductsController',function($scope,storage,growl){
	var products = storage.get('products')
		,settings = storage.get('settings')

	$scope.products = products ? products : [{}]
	$scope.currency = settings && settings.currency ? settings.currency : 'BTC'

	$scope.save = function(){
		if(!$scope.productsForm.$valid)
			return growl.addErrorMessage('Save failed')

		storage.save('products',$scope.products)
		growl.addSuccessMessage('Products saved')
	}

	$scope.deleteProduct = function(index){
		$scope.products.splice(index,1)
	}
})