
app = angular.module('app',[])

app.controller('VendorController',function($scope){

	$scope.total = 0

	self.port.on('show',function onShow(vendorText){
		$scope.vendor = null
		
		try{
			$scope.vendor = parseVendorText(vendorText)
		}catch(err){
			console.log(err)
			$scope.error=err
		}
		
		$scope.$apply()
	})

	$scope.$watch('vendor.products',function(product){
		if(!$scope.vendor) return

		var total = 0;
		$scope.vendor.products.forEach(function(product){
			total += product.quantity * product.price
		});

		$scope.total = total


	},true)

})

validate.validators.isArray = function(value, options, key, attributes) {
	return Array.isArray(value) ? null : 'is not an array'
};

var vendorConstraints = {
	name:{presence:true}
	,currency:{presence:true,inclusion:['BTC','USD']}
	,products:{presence:true,isArray:true}
}

function parseVendorText(vendorText){
	var x2js = new X2JS()
		,vendor = x2js.xml_str2json(vendorText).vendor

	if(!vendor)
		throw 'vendor text is not valid xml'

	if(Array.isArray(vendor.product))
		vendor.products = vendor.product
	else
		vendor.products = [vendor.product]

	vendor.products.forEach(function(product){
		product.quantity=0
		product.price = parseFloat(product.price)
	})

	delete vendor.product

	var vendorValidation = validate(vendor,vendorConstraints)

	if(vendorValidation)
		throw vendorValidation[Object.keys(vendorValidation)[0]][0]

	return vendor
}