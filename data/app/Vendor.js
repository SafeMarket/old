app.factory('Vendor',function($q,convert,ticker,storage,Order,growl,check,blockchain){


	function Vendor(vendorData,manifest){

		var vendorConstraints = {
			name:{presence:true,type:'string'}
			,pgp_public:{presence:true,type:'string'}
			,currency:{presence:true,inclusion:Object.keys(ticker.rates),type:'string'}
			,products:{presence:true,type:'array'}
			,mk_public:{presence:true,startsWith:'xpub',type:'string'}
		},productConstraints = {
			name:{presence:true,type:'string'}
			,price:{presence:true,numericality:{greaterThan:0},type:'string'}
			,image_url:{type:'string'}
		}

		check.constraints(vendorData,vendorConstraints)

		vendorData.products.forEach(function(product){
			check.constraints(product,productConstraints)
		})

		this.data = vendorData
		this.address = _.keyToAddress(this.data.mk_public)
		this.manifest = manifest ? manifest : null
		this.getUpdatePromise()

		this.data.products.forEach(function(product){
			product.quantity = 0
		})

		this.key = openpgp.key.readArmored(this.data.pgp_public)
		console.log(this.key)

	}

	Vendor.prototype.setMyManifest = function(){
		
		var products = []

		this.data.products.forEach(function(product){
			products.push(
				{
					n:product.name
					,p:product.price
					,i:product.image_url
				}
			)
		})

		var data = {
			n:this.data.name
			,c:this.data.currency
			,p:products
			,k:openpgp.armor.decode(storage.get('settings').pgp_public).data
		}

		this.manifest = msgpack.pack(data,true)
		
		var manifestBuffer = new bitcoin.Buffer.Buffer(this.manifest)
			,manifestHex = manifestBuffer.toString('hex')
		
		this.manifestParts = manifestHex.match(/.{1,314}/g)

		if(this.manifestParts.length>256){
	    	growl.addErrorMessage('Message too large')
	    	throw 'Message too large'
	    }
	
	    this.publishingFeeSatoshi = 1000*this.manifestParts.length
	    this.publishingFee = convert(this.publishingFeeSatoshi,{from:'satoshi',to:'BTC'})

	}

	Vendor.prototype.getUpdatePromise = function(){
		var vendor = this
		return $q(function(resolve,reject){
		 	blockchain.getUtxosPromise(vendor.address).then(function(response){
		 		vendor.utxos = response.unspent_outputs

		 		var utxos = response.unspent_outputs
					,totalSatoshi = 0

				utxos.forEach(function(utxo) {
				    totalSatoshi += utxo.value
				})

				vendor.balance = convert(totalSatoshi,{from:'satoshi',to:'BTC'})

				resolve()
		 	},function(){
		 		vendor.balance = '0'
		 		reject()
		 	}).then(function(){
		 		var shortfall = new Decimal(vendor.publishingFee).minus(vendor.balance)
				console.log(shortfall)

				if(shortfall.lessThanOrEqualTo(0))
					vendor.shortfall = null
				else
					vendor.shortfall = shortfall.toString()
		 	})
		 })
	}

	Vendor.prototype.publish = function(){
		var mk_private = storage.get('settings').mk_private
			,prefixLength = this.manifestParts.length.toString(16)
			,prefixLength = prefixLength.length===2 ? prefixLength : '0'+prefixLength
			,prefixManifest = '6d'
			,wif = _.getWif(mk_private)
			,keyPair = bitcoin.bitcoin.ECKey.fromWIF(wif)
	    	,vendor = this
	    	,txHexes = []
	    
	    this.getUpdatePromise().then(function(response){
	    	

			if(new Decimal(vendor.balance).lessThan(vendor.publishingFee)){
				growl.addErrorMessage('Not enough funds. '+vendor.balance+' of '+vendor.publishingFee+' necessary to publish.')
				throw 'Not enough funds'
			}
	    	
	    	vendor.manifestParts.forEach(function(manifestPart,index){

				var prefixIndex = index.toString(16)
					,prefixIndex = prefixIndex.length===2 ? prefixIndex : '0'+prefixIndex
					,prefix = prefixManifest+prefixIndex+prefixLength
					,tx = new bitcoin.bitcoin.TransactionBuilder()
					,data = new bitcoin.Buffer.Buffer('hello world')
	    			,dataScript = bitcoin.bitcoin.scripts.nullDataOutput(data)

	    		console.log(dataScript)


	    		var total = 0
				vendor.utxos.forEach(function(utxo) {
				    tx.addInput(utxo.tx_hash_big_endian, utxo.tx_output_n)
					total+=utxo.value
				})

				tx.addOutput(dataScript, total-10000)
				tx.inputs.forEach(function(input,index){
					tx.sign(index, keyPair)
				})

				var txHex = tx.build().toHex()
				console.log(txHex)
				txHexes.push(txHex)
			})
	    })
		
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
				,image_url:product.image_url
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