
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
		$scope.preferences = options.preferences
		$scope.vendor = null

		try{
			$scope.vendor = getVendorFromXml(options.vendorXml)
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
		console.log($scope.vendor.getReceipt())
	}

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

function getVendorFromXml(vendorXml){

	var vendor = xml2json.parser(vendorXml).vendor

	if(!vendor)
		throw 'vendor text is not valid xml'

	if(Array.isArray(vendor.product))
		vendor.products = vendor.product
	else
		vendor.products = [vendor.product]

	delete vendor.product

	return new Vendor(vendor)
}

function Vendor(vendor){
	var vendorValidation = validate(vendor,vendorConstraints)

	if(vendorValidation)
		throw vendorValidation[Object.keys(vendorValidation)[0]][0]

	angular.extend(this,vendor)

	this.products.forEach(function(product){
		product.quantity=0
		product.price = parseFloat(product.price)
	})
}

Vendor.prototype.getTotal = function(currency){
	var total = 0

	this.products.forEach(function(product){
		total += (product.quantity*product.price)
	})

	if(!currency)
		return total
	else
		return convert(total,{
			from:this.currency
			,to:currency
		})
}

Vendor.prototype.getReceipt = function(message){
	return new Receipt(this,message)
}

function Receipt(vendor,message){
	var indexMax = Math.pow(2,31)-1
		,products = []

	vendor.products.forEach(function(product){
		if(product.quantity===0) return true
		products.push({
			id:product.id
			,quantity:product.quantity
		})
	})

	angular.extend(this,{
		index: Math.random(0,indexMax)
		,epoch: Math.round((new Date()).getTime() / 1000)
		,products:products
		,total:vendor.getTotal('BTC')
		,message:message
	})
}

Receipt.prototype.getEncrypted = function(){

}

Receipt.prototype.getXml = function(){
	return '<receipt>'+this.getEncrypted()+'</receipt>'
}

function convert(amount,currencies){

	if(!rates.hasOwnProperty(currencies.from) || !rates.hasOwnProperty(currencies.to))
		throw 'Invalid currency'

	amount_btc = amount/rates[currencies.from]
	return amount_btc*rates[currencies.to]
}