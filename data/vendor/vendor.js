
var app = angular.module('app',[])
	,rates = {}


app.controller('VendorController',function($scope,$q){

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
		this.vendor.getReceiptPromise($q,$scope.message).then(function(receipt){
			$scope.receipt = receipt
		})
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
	,pgppublic64:{presence:true}
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

	this.pgppublic = atob(this.pgppublic64)
	this.key = openpgp.key.readArmored(this.pgppublic)
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

Vendor.prototype.getReceiptPromise = function($q,message){
	var receipt = new Receipt(this,message)
		,vendor = this

	return $q(function(resolve,reject){

		var message = JSON.stringify(receipt.getData())

		openpgp.encryptMessage(
			vendor.key.keys
			,JSON.stringify(receipt.getData())
		).then(function(pgpMessage){


			angular.extend(receipt,{
				pgpMessage:pgpMessage
				,xml:'<receipt>'+btoa(pgpMessage)+'<receipt>'
			})

			resolve(receipt)
		})
	})
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
		vendor: vendor
		,index: Math.random(0,indexMax)
		,epoch: Math.round((new Date()).getTime() / 1000)
		,products:products
		,total:vendor.getTotal('BTC')
		,message:message
	})

	this.setAddress()
	console.log(this.address)
}

Receipt.prototype.getData = function(){
	return {
		index:this.index
		,epoch:this.epoch
		,products:this.products
		,total:this.total
		,message:this.message
	}
}

Receipt.prototype.setAddress = function(){
	console.log('setAddress')
	console.log(this.vendor.mpk)
	var bip32 = new BIP32(this.vendor.mpk.trim())

	console.log('a')
	var paths = ['m',this.index,this.epoch]
		console.log(paths)
	var child = bip32.derive(paths.join('/'))
	console.log('child')
	var hash160 = child.eckey.pubKeyHash

	console.log(hash160)

	this.address =  (new Bitcoin.Address(hash160)).toString()
}

function convert(amount,currencies){

	if(!rates.hasOwnProperty(currencies.from) || !rates.hasOwnProperty(currencies.to))
		throw 'Invalid currency'

	amount_btc = amount/rates[currencies.from]
	return amount_btc*rates[currencies.to]
}