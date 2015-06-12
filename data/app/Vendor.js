app.factory('Vendor',function($q,convert,ticker,storage,Order){


	function Vendor(vendorData){

		vendorData.mk_public = vendorData.mk_public ?
			vendorData.mk_public : (new BIP32(vendorData.mk_private)).extended_public_key_string()

		var constraints = {
			name:{presence:true}
			,pgp_public:{presence:true}
			,currency:{presence:true,inclusion:Object.keys(ticker.rates)}
			,products:{presence:true,array:true}
			,mk_public:{presence:true,startsWith:'xpub'}
		}

		var vendorValidation = validate(vendorData,constraints)

		if(vendorValidation)
			throw vendorValidation[Object.keys(vendorValidation)[0]][0]

		
		this.data = vendorData
		this.manifestData = {
			name:this.data.name
			,currency:this.data.currency
			,pgp_public:this.data.pgp_public
			,mk_public: this.data.mk_public
			,products:angular.copy(this.data.products)
		}
		this.manifest = '<manifest>'+btoa(JSON.stringify(this.manifestData))+'</manifest>'

		this.data.products.forEach(function(product){
			product.quantity = product.quantity ? product.quantity : 0
			product.price = parseFloat(product.price)
		})

		this.key = openpgp.key.readArmored(this.data.pgp_public)

	}

	Vendor.prototype.getTotal = function(currency){

		var total = 0

		this.data.products.forEach(function(product){
			total += (product.quantity*product.price)
		})

		if(!currency)
			return total
		else
			return convert(total,{
				from:this.data.currency
				,to:currency
			},ticker.rates)
	}

	Vendor.prototype.getReceiptPromise = function(message){
	
		var vendor = this
			,order = new Order({
				buyer_name:storage.data.settings.name
				,buyer_pgp_public:storage.data.settings.pgp_public
				,buyer_mk_public:new BIP32(storage.data.settings.mk_private).extended_public_key_string()
				,vendor_name:this.data.name
				,vendor_mk_public:this.data.mk_public
				,vendor_pgp_public:this.data.pgp_public
				,epoch:Order.getCurrentEpoch()
				,index:Order.getRandomIndex()
				,products:this.data.products
				,message:message
			})


		return order.receiptPromise
	}

	Vendor.fromManifest = function(manifest){

		var vendorData = _.json64.decode(manifest.replace('<manifest>','').replace('</manifest>',''))

		if(!vendorData)
			throw 'Invalid manifest'

		return new Vendor(vendorData)
	}

	return Vendor
})