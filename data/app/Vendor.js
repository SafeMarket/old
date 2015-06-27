app.factory('Vendor',function($q,convert,ticker,storage,Order,growl,check,blockchain){


	function Vendor(vendorData,doSetManifests){

		var vendorConstraints = {
			name:{presence:true,type:'string'}
			,info:{presence:true,type:'string'}
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
		
		if(doSetManifests)
			this.setMyManifests()
		
		this.getUpdatePromise()

		this.data.products.forEach(function(product){
			product.quantity = 0
		})

		this.key = openpgp.key.readArmored(this.data.pgp_public)

	}

	Vendor.prototype.setMyManifests = function(){
		
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

		var manifestArrayBuffer = msgpack.encode(data)
			,manifestUint8Array = new Uint8Array(manifestArrayBuffer)
			,manifestBuffer = new bitcoin.Buffer.Buffer(manifestUint8Array)
			,manifestHex = manifestBuffer.toString('hex')
		
		this.manifests = manifestHex.match(/.{1,74}/g)

		
	}

	Vendor.prototype.getUpdatePromise = function(){
		var vendor = this
		return $q(function(resolve,reject){
		 	blockchain.getUtxosPromise(vendor.address).then(function(response){
		 		vendor.utxos = response.unspent_outputs

				var totalSatoshi = 0

				vendor.utxos.forEach(function(utxo) {
				    totalSatoshi += utxo.value
				})

				vendor.balance = convert(totalSatoshi,{from:'satoshi',to:'BTC'})

				resolve()
		 	},function(){
		 		vendor.utxos = []
		 		vendor.balance = '0'
		 		reject()
		 	}).then(function(){
		 		if(!vendor.manifests)
		 			return
		 		vendor.publishingFee = new Decimal('0.0001').times(vendor.manifests.length+1).toFixed(6).toString()
		 		
		 		var shortfall = new Decimal(vendor.publishingFee).minus(vendor.balance)
				
				if(shortfall.lessThanOrEqualTo(0))
					vendor.shortfall = null
				else
					vendor.shortfall = shortfall.toFixed(6).toString()

				if(shortfall.greaterThan(0)){
					return
				}

				var mk_private = storage.get('settings').mk_private
					,prefixRandom = ((Math.round(Math.random()*255)).toString(16))
					,prefixRandom = prefixRandom.length==2?prefixRandom : '0'+prefixRandom
					,prefixManifest =  '6d'
					,wif = _.getWif(mk_private)
					,keyPair = bitcoin.bitcoin.ECKey.fromWIF(wif)
					,total = 0
					,lastTxId = null
			    	
			    	vendor.txHexes = []
	    	
			    	vendor.manifests.forEach(function(manifest,index){

						var prefixIndex = index.toString(16)
							,prefixIndex = prefixIndex.length===2 ? prefixIndex : '0'+prefixIndex
							,prefix = prefixManifest+prefixRandom+prefixIndex
							,tx = new bitcoin.bitcoin.TransactionBuilder()
							,data = new bitcoin.Buffer.Buffer(prefix + manifest,'hex')
			    			,dataScript = bitcoin.bitcoin.scripts.nullDataOutput(data)

			    		if(index===0)
							vendor.utxos.forEach(function(utxo) {
							    tx.addInput(utxo.tx_hash_big_endian, utxo.tx_output_n)
								total+=utxo.value
							})
						else
							tx.addInput(lastTxId, 1)

						tx.addOutput(dataScript, 0)

						var change = total-(10000*(index+1))
						tx.addOutput(vendor.address, change)

						tx.inputs.forEach(function(input,index){
							tx.sign(index, keyPair)
						})


						var txHex = tx.build().toHex()
						lastTxId = bitcoin.bitcoin.Transaction.fromHex(txHex).getId()
						
						vendor.txHexes.push(txHex)
					})
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
				,buyer_address:settings.address
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

	Vendor.getFromXpubkeyPromise = function(xpubkey){

		var address = _.keyToAddress(xpubkey)
			,manifests = []
			,random = null
			,manifestHex = ''

		return $q(function(resolve,reject){
			growl.addInfoMessage('Downloading blockchain, this may take a minute...')
			blockchain
				.getTxsPromise(address)
				.then(function(txs){
					txs.forEach(function(tx){
						if(tx.inputs[0].prev_out.addr!==address)
							return true

						if(tx.out.length<2) return true

						var script = tx.out[0].script
							,buffer = new bitcoin.Buffer.Buffer(script,'hex')

						if(buffer[0]!== 106)
							return true
						if(buffer[2]!==109)
							return true

						if(random!== null && random !== buffer[3])
							return true

						if(random === null)
							random = buffer[3]

						manifests.push({
							script:script
							,random:buffer[3]
							,index:buffer[4]
							,manifestPartHex:buffer.slice(5).toString('hex')
						})

					})

					manifests.sort(function(a,b){
						return a.index - b.index
					})

					manifests.forEach(function(manifest){
						manifestHex+=manifest.manifestPartHex
					})

					var manifestBuffer = new bitcoin.Buffer.Buffer(manifestHex,'hex')
						,manifestData = msgpack.decode(manifestBuffer.buffer)
						,list = new openpgp.packet.List()

					list.read(manifestData.k)

					var key = openpgp.key.Key(list)
						,vendorData = {
							name:manifestData.n
							,currency:manifestData.c
							,pgp_public:key.armor()
							,products:[]
							,mk_public:xpubkey
						}

					manifestData.p.forEach(function(product){
						vendorData.products.push({
							name:product.n
							,price:product.p
							,image_url:product.i
						})
					})

					var vendor = new Vendor(vendorData)
					resolve(vendor)
						
				})
		})


		var manifestData = _.json64.decode(manifest.replace('<manifest>','').replace('</manifest>',''))
			,vendorData = _.json64.decode(manifestData.data64)
			,address = _.keyToAddress(vendorData.mk_public)

		check.signature(manifestData.data64,address,manifestData.signature)

		return new Vendor(vendorData)
	}

	return Vendor
})