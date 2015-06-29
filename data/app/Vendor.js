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
			,i:this.data.info
		}

		var manifestArrayBuffer = msgpack.encode(data)
			,manifestUint8Array = new Uint8Array(manifestArrayBuffer)
			,manifestBuffer = _.buffer(manifestUint8Array)
			,manifestHex = manifestBuffer.toString('hex')
			,manifestHexMd5 = md5(manifestHex)

		var mk_private = storage.get('settings').mk_private
			,wif = _.getWif(mk_private)
			,keyPair = bitcoin.bitcoin.ECKey.fromWIF(wif)
			,manifestHexMd5Signature = bitcoin.bitcoin.Message.sign(keyPair, manifestHexMd5)
			,manifestHexMd5SignatureHex =  manifestHexMd5Signature.toString('hex')
			,manifestsCount = Math.ceil((2+manifestHex.length+manifestHexMd5SignatureHex.length)/74)

		console.log(manifestHexMd5Signature)

		var manifestHex
			= _.intToHex(manifestsCount)
			+ manifestHexMd5SignatureHex
			+ manifestHex

		var manifestPrefixRandomInt = Math.round(Math.random()*255)
			,manifestPrefixRandomHex = _.intToHex(manifestPrefixRandomInt)
			,manifestPrefixConstantHex = '6d'
			,manifestPrefix = manifestPrefixConstantHex+manifestPrefixRandomHex
			,manifestHexes = manifestHex.match(/.{1,74}/g)
			
		
		manifestHexes.forEach(function(manifestHex,index){
			manifestHexes[index] = manifestPrefix+_.intToHex(index)+manifestHex
		})
			
		this.manifestHexes = manifestHexes
		console.log(manifestHexes)
		
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
		 		if(!vendor.manifestHexes)
		 			return
		 		vendor.publishingFee = new Decimal('0.0001').times(vendor.manifestHexes.length+1).toFixed(6).toString()
		 		
		 		var shortfall = new Decimal(vendor.publishingFee).minus(vendor.balance)
				
				if(shortfall.lessThanOrEqualTo(0))
					vendor.shortfall = null
				else
					vendor.shortfall = shortfall.toFixed(6).toString()

				if(shortfall.greaterThan(0)){
					return
				}

				var mk_private = storage.get('settings').mk_private
					,wif = _.getWif(mk_private)
					,keyPair = bitcoin.bitcoin.ECKey.fromWIF(wif)
					,total = 0
					,lastTxId = null
			    	
			    	vendor.txHexes = []
	    	
			    	vendor.manifestHexes.forEach(function(manifest,index){

						var tx = new bitcoin.bitcoin.TransactionBuilder()
							,data = new bitcoin.Buffer.Buffer(manifest,'hex')
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
			,manifestsCount = null

		return $q(function(resolve,reject){
			growl.addInfoMessage('Downloading blockchain, this may take a minute...')
			blockchain
				.getTxsPromise(address)
				.then(function(txs){
					txs.forEach(function(tx){
						if(tx.inputs[0].prev_out.addr!==address)
							return true

						var script = tx.out[0].script
							,buffer = new bitcoin.Buffer.Buffer(script,'hex')

						if(buffer.length<5)
							return true

						var index = buffer[4]

						if(buffer[0]!== 106) //check OP_RETURN
							return true
						if(buffer[2]!==109) //check manifest prefix
							return true
						if(_.find(manifests,{index:index})) //ensure unique index
							return true
						if(random!== null && random !== buffer[3]) //check random prefix
							return true
						if(random === null) //set random prefix if not set
							random = buffer[3]
						if(index===0) //set manifests count
							manifestsCount = buffer[5]
						if(manifestsCount!== null && index>=manifestsCount)
							return true

						manifests.push({
							script:script
							,random:buffer[3]
							,index:buffer[4]
							,manifestPartHex:buffer.slice(5).toString('hex')
						})

						if(manifestsCount!==null && manifestsCount === manifests.length)
							return false

					})

					manifests.sort(function(a,b){
						return a.index - b.index
					})

					console.log(manifests)
					console.log(manifestsCount)
					console.log(manifests.length)
					console.log(manifestHex)
					console.log(msgHex)

					if(manifests.length != manifestsCount){
						growl.addErrorMessage('Publishing incomplete')
						throw 'Publishing incomplete'
					}

					manifests.forEach(function(manifest){
						manifestHex+=manifest.manifestPartHex
					})

					var msgHex = manifestHex.substr(2+130)
						,msgHexMd5SignatureHex = manifestHex.substr(2,130)
						,msgHexMd5Signature = _.buffer(msgHexMd5SignatureHex,'hex').toString('base64')
						,msgHexMd5 = md5(msgHex)
						,verification = bitcoin.bitcoin.Message.verify(address, msgHexMd5Signature, msgHexMd5)		

					if(verification === true)
						growl.addSuccessMessage('Signature verified')
					else{
						growl.addErrorMessage('Invalid signature')
						throw 'invalid signature'
					}

					var msgBuffer = new bitcoin.Buffer.Buffer(msgHex,'hex')
						,msgData = msgpack.decode(msgBuffer.buffer)
						,list = new openpgp.packet.List()

					list.read(msgData.k)

					var key = openpgp.key.Key(list)
						,vendorData = {
							name:msgData.n
							,currency:msgData.c
							,pgp_public:key.armor()
							,products:[]
							,mk_public:xpubkey
							,info:msgData.i
						}

					msgData.p.forEach(function(product){
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


	}

	return Vendor
})