
var app = angular.module('app',[])
	,rates = {}

app.controller('VendorController',function($scope){

	$scope.totals = {
		vendor_currency:0
		,my_currency:0
		,btc:0
	}

	self.port.on('show',function onShow(options){
		$scope.rates = rates = options.rates
		
		$scope.vendor = null

		try{
			$scope.vendor = parseVendorText(options.text)
		}catch(err){
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

		$scope.totals = {
			vendor_currency:total
			,btc:convert(total,{
				from:$scope.vendor.currency
				,to:'BTC'
			})
		}


	},true)

})

validate.validators.array = function(value, options, key, attributes) {
	return Array.isArray(value) ? null : key+' is not an array'
};

validate.validators.currency = function(value, options, key, attributes) {
	return rates[value] > 0 ? null : value+' is not a valid currency'
};

var vendorConstraints = {
	name:{presence:true}
	,currency:{presence:true,currency:true}
	,products:{presence:true,array:true}
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

function convert(amount,currencies){
	console.log(currencies,rates)

	if(!rates.hasOwnProperty(currencies.from) || !rates.hasOwnProperty(currencies.to))
		throw 'Invalid currency'

	amount_btc = amount/rates[currencies.from]
	return amount_btc*rates[currencies.to]
}