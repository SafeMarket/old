angular.module('app').factory('Vendor',function($q,Receipt){


	function Vendor(vendor,rates){

		this.rates = rates

		var constraints = {
			name:{presence:true}
			,pgpPublic:{presence:true}
			,currency:{presence:true,inclusion:Object.keys(rates)}
			,products:{presence:true,array:true}
		}

		var vendorValidation = validate(vendor,constraints)

		console.log(vendorValidation)

		if(vendorValidation)
			throw vendorValidation[Object.keys(vendorValidation)[0]][0]

		angular.extend(this,vendor)

		this.products.forEach(function(product){
			product.quantity = product.quantity ? product.quantity : 0
			product.price = parseFloat(product.price)
		})

		console.log('29')

		this.key = openpgp.key.readArmored(this.pgpPublic)

		console.log('33')
	}

	Vendor.prototype.getTotal = function(currency){

		console.log(36)
		console.log(currency)

		var total = 0

		this.products.forEach(function(product){
			total += (product.quantity*product.price)
		})

		console.log(41)
		console.log(total)

		console.log(48)

		if(!currency)
			return total
		else
			return convert(total,{
				from:this.currency
				,to:currency
			},this.rates)
	}

	Vendor.prototype.getReceiptPromise = function(buyer,message){
		
		console.log(52)
		console.log(buyer)
		console.log(message)


		var receipt = new Receipt(this,buyer,message)
			,vendor = this

		console.log(60)
		console.log(receipt)

		return $q(function(resolve,reject){

			var data = JSON.stringify(receipt.getData())

			console.log(67)
			console.log(data)

			openpgp.encryptMessage(
				vendor.key.keys
				,data
			).then(function(pgpMessage){

				console.log(75)
				console.log(data)

				angular.extend(receipt,{
					pgpMessage:pgpMessage
					,xml:'<receipt>'+btoa(pgpMessage)+'<receipt>'
				})

				resolve(receipt)
			})
		})
	}

	Vendor.fromXml = function(vendorXml,rates){

		var vendor = xml2json.parser(vendorXml).vendor

		if(!vendor)
			throw 'vendor text is not valid xml'

		if(Array.isArray(vendor.product))
			vendor.products = vendor.product
		else
			vendor.products = [vendor.product]

		vendor.pgpPublic = atob(vendor.pgppublic64)

		delete vendor.product

		return new Vendor(vendor,rates)
	}

	return Vendor
})