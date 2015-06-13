app.factory('Vendor',function($q,convert,ticker,storage,Order,growl,check){


	function Vendor(vendorData){

		var vendorConstraints = {
			name:{presence:true,type:'string'}
			,pgp_public:{presence:true,type:'string'}
			,currency:{presence:true,inclusion:Object.keys(ticker.rates),type:'string'}
			,products:{presence:true,type:'array'}
			,mk_public:{presence:true,startsWith:'xpub',type:'string'}
		},productConstraints = {
			name:{presence:true,type:'string'}
			,price:{presence:true,numericality:{greaterThan:0},type:'string'}
		}

		check(vendorData,vendorConstraints)

		vendorData.products.forEach(function(product){
			check(product,productConstraints)
		})

		this.data = vendorData
		this.manifest = '<manifest>'+btoa(JSON.stringify(this.data))+'</manifest>'

		this.data.products.forEach(function(product){
			product.quantity = 0
		})

		this.key = openpgp.key.readArmored(this.data.pgp_public)

	}

	Vendor.prototype.getTotal = function(currency){

		var total = new Decimal(0)

		this.data.products.forEach(function(product){
			var subTotal = (new Decimal(product.quantity)).times(product.price)
			console.log(subTotal)
			total = total.plus(subTotal)
			console.log(total)
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

		var products = []
			,vendor = this

		this.data.products.forEach(function(product){
			if(product.quantity==0) return true
		
			products.push({
				name:product.name
				,price:''+convert(product.price,{from:vendor.data.currency,to:'satoshi'})
				,quantity:product.quantity
			})
		})
	
		var settings = storage.get('settings')
			,order = new Order({
				buyer_name:settings.name
				,buyer_pgp_public:settings.pgp_public
				,buyer_mk_public:_.bipPrivateToPublic(settings.mk_private)
				,vendor_name:this.data.name
				,vendor_mk_public:this.data.mk_public
				,vendor_pgp_public:this.data.pgp_public
				,epoch:Order.getCurrentEpoch()
				,index:Order.getRandomIndex()
				,products:products
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