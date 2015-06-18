app.controller('ProductsController',function($scope,storage,growl,check){
	var products = storage.get('products')
		,settings = storage.get('settings')

	$scope.products = products ? products : [{}]

	$scope.save = function(){
		if(!$scope.productsForm.$valid)
			return growl.addErrorMessage('Save failed')

		check({
			products:$scope.products
		},{
			products:{presence:true,type:'array'}
		})

		$scope.products.forEach(function(product){
			check(product,{
				name:{presence:true,type:'string'}
				,price:{presence:true,type:'string',numericality:{greaterThan:0}}
			})
		})

		storage.save('products',$scope.products)
		growl.addSuccessMessage('Products saved')
	}

	$scope.deleteProduct = function(index){
		$scope.products.splice(index,1)
	}
})