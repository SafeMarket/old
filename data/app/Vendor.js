app.factory('Vendor',function($q,convert,ticker,storage,Order,growl,check){


	function Vendor(vendorData,manifest){

		var vendorConstraints = {
			name:{presence:true,type:'string'}
			,pgp_public:{presence:true,type:'string'}
			,currency:{presence:true,inclusion:Object.keys(ticker.rates),type:'string'}
			,products:{presence:true,type:'array'}
			,mk_public:{presence:true,startsWith:'xpub',type:'string'}
			,address:{presence:true,type:'string'}
		},productConstraints = {
			name:{presence:true,type:'string'}
			,price:{presence:true,numericality:{greaterThan:0},type:'string'}
		}

		check.constraints(vendorData,vendorConstraints)

		vendorData.products.forEach(function(product){
			check.constraints(product,productConstraints)
		})

		this.data = vendorData
		this.manifest = manifest ? manifest : null

		this.data.products.forEach(function(product){
			product.quantity = 0
		})

		this.key = openpgp.key.readArmored(this.data.pgp_public)

	}

	Vendor.prototype.getMyManifest = function(){

		var data64 = btoa(JSON.stringify(this.data))
			,signature = _.getSignature(data64,storage.get('settings').mk_private)

		return '<manifest>'+btoa(JSON.stringify({
			data64:data64
			,signature:signature
		}))+'</manifest>'
	}

	Vendor.prototype.getTotal = function(){

		var total = new Decimal(0)

		this.data.products.forEach(function(product){
			var subTotal = (new Decimal(product.quantity)).times(product.price)
			total = total.plus(subTotal)
		})

		return _.formatPrice(total,this.data.currency)
	}

	Vendor.prototype.getReceiptPromise = function(message){

		var products = []
			,vendor = this

		this.data.products.forEach(function(product){
			if(product.quantity===0) return true
		
			products.push({
				name:product.name
				,price:convert(product.price,{from:vendor.data.currency,to:'BTC'})
				,quantity:product.quantity
			})
		})
	
		var settings = storage.get('settings')
			,order = new Order({
				buyer_name:settings.name
				,buyer_pgp_public:settings.pgp_public
				,buyer_mk_public:_.bipPrivateToPublic(settings.mk_private)
				,buyer_address:settings.address
				,vendor_name:this.data.name
				,vendor_mk_public:this.data.mk_public
				,vendor_pgp_public:this.data.pgp_public
				,vendor_address:this.data.address
				,epoch:Order.getCurrentEpoch()
				,index:Order.getRandomIndex()
				,products:products
				,message:message
			})


		return order.receiptPromise
	}

	Vendor.fromManifest = function(manifest){

		var manifestData = _.json64.decode(manifest.replace('<manifest>','').replace('</manifest>',''))
			,vendorData = _.json64.decode(manifestData.data64)
			,address = _.keyToAddress(vendorData.mk_public)

		check.signature(manifestData.data64,address,manifestData.signature)

		return new Vendor(vendorData)
	}

	return Vendor
})