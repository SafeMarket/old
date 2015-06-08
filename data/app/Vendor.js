angular.module('app').factory('Vendor',function(Receipt){

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

	Vendor.fromXml = function(vendorXml){

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

	return Vendor
})