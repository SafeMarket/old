angular.module('app').factory('Order',function($q,blockchain,storage,pgp,growl,check,convert){

	function Order(orderData,receipt){
		var products = []
			,order = this

		var orderConstraints = {
			buyer_name:{presence:true,type:'string'}
			,buyer_pgp_public:{presence:true,type:'string',startsWith:'-----BEGIN PGP PUBLIC KEY BLOCK-----',endsWith:'-----END PGP PUBLIC KEY BLOCK-----'}
			,buyer_address:{presence:true,type:'string'}
			,vendor_name:{presence:true,type:'string'}
			,vendor_mk_public:{presence:true,type:'string',startsWith:'xpub'}
			,vendor_pgp_public:{presence:true,type:'string',startsWith:'-----BEGIN PGP PUBLIC KEY BLOCK-----',endsWith:'-----END PGP PUBLIC KEY BLOCK-----'}
			,products:{presence:true,type:'array'}
			,index:{presence:true,numericality:{greaterThanOrEqualTo:0,lessThan:this.indexMax,onlyInteger:true},type:'number'}
			,epoch:{presence:true,numericality:{greaterThanOrEqualTo:0,lessThan:this.indexMax,onlyInteger:true},type:'number'}
			,message:{presence:true,type:'string'}
		},productConstraints = {
			name:{presence:true,type:'string'}
			,price:{presence:true,numericality:{greaterThan:0},type:'string'}
			,quantity:{presence:true,numericality:{greaterThanOrEqualTo:0,onlyInteger:true,noStrings: true},type:'number'}
			,image_url:{type:'string'}
		}

		check.constraints(orderData,orderConstraints)

		var total = new Decimal(0)

		orderData.products.forEach(function(product){
			check.constraints(product,productConstraints)
			var subtotal = (new Decimal(product.price)).times(product.quantity)
			total = total.plus(subtotal)
		})

		total = total.toString()

		check.constraints({total:total},{total:{presence:true,type:'string',numericality:{greaterThan:0}}})

		this.data = orderData
		this.dataJson = JSON.stringify(orderData,null,'    ')
		this.height = null
		this.total = total.toString()
		this.setDerivationPath() 
		this.setAddress() 

		var mk_private = storage.get('settings').mk_private
			,mk_public = _.bipPrivateToPublic(storage.get('settings').mk_private)


		this.isMine = mk_public===this.data.vendor_mk_public

		if(this.isMine)
			this.setWif()

		var orderDataJson = JSON.stringify(orderData)
	
		if(receipt)
			this.receipt = receipt
		else
			this.receiptPromise = $q(function(resolve,reject){
				pgp.getEncryptPromise([orderData.buyer_pgp_public],orderDataJson).then(function(pgpMessage){
					order.receipt = '<receipt>'+btoa(pgpMessage)+'</receipt>'
					resolve(order.receipt)
				}).catch(function(error){
					reject(error)
				})
			})

		this.updated = 0
		this.received = 0
		this.balance = 0

		this.update()
	}

	Order.prototype.update = function(){
		growl.addInfoMessage('Updating order status from blockchain')
		this.getUpdatePromise().then(function(order){
			growl.addSuccessMessage('Order updated')
		}).catch(function(error){
			growl.addErrorMessage(error)
		})
	}

	Order.indexMax = Math.pow(2,31)-1

	Order.getRandomIndex = function(){
		return Math.round(Math.random()*Order.indexMax)
	}

	Order.getCurrentEpoch = function(){
		return Math.floor(((new Date).getTime())/1000)
	}

	Order.prototype.setDerivationPath = function(){
		this.derivationPath = ['m',1337,this.data.index,this.data.epoch].join('/')
	}

	Order.prototype.setWif = function(){

		var bip32 = new BIP32(storage.get('settings').mk_private)
			,child = bip32.derive(this.derivationPath)

		this.wif = _.bipToWif(child)

	}

	Order.prototype.withdraw = function(){
		var order = this
		growl.addInfoMessage('Withdrawing...')
		this
			.getCashoutPromise(storage.get('settings').address)
			.then(function(){
				growl.addSuccessMessage('Withdraw complete')
				order.update()
			},function(){
				growl.addErrorMessage('Something went wrong')	
			})
	}

	Order.prototype.setHeight = function(){
		var order = this

		this.txs.forEach(function(tx){
			if(!tx.block_height){
				order.height = null
				return false
			}else if(!order.height || tx.block_height>order.height){
				order.height = tx.block_height
			}
		})
	}

	Order.prototype.refund = function(){
		var order = this
		growl.addInfoMessage('Refunding...')
		this
			.getCashoutPromise(this.data.buyer_address)
			.then(function(){
				growl.addSuccessMessage('Refund complete')
				order.update()
			},function(){
				growl.addErrorMessage('Something went wrong')	
			})
	}

	Order.prototype.getCashoutPromise = function(address){
		var order = this
			,keyPair = bitcoin.bitcoin.ECKey.fromWIF(this.wif)
	    	,tx = new bitcoin.bitcoin.TransactionBuilder()
	    	,total = 0

		this.utxos.forEach(function(utxo) {
		    tx.addInput(utxo.tx_hash_big_endian, utxo.tx_output_n)
		    total += utxo.value
		})

		tx.addOutput(address, total)
		tx.sign(0, keyPair)

		var txHex = tx.build().toHex()

		return blockchain.getPushTxPromise(txHex)
	}

	Order.fromReceiptPromise = function(receipt){
		return $q(function(resolve,reject){
			var settings = storage.get('settings')

			pgp.getDecryptPromise(
					settings.pgp_private
					,settings.pgp_passphrase
					,atob(receipt.replace('<receipt>','').replace('</receipt>',''))
				).then(function(orderDataJson){
					try{
						var orderData = JSON.parse(orderDataJson)
							,order = new Order(orderData,receipt)
					}catch(error){
						throw reject(error)
					}
					resolve(order)
				},function(error){
					reject(error)
				})
		})

	}

	Order.prototype.getUpdatePromise = function(){
		var order = this
			,satoshiMultiplier = Math.pow(10,8)

		return $q(function(resolve,reject){
			blockchain.getAddressPromise(order.address).then(function(response){
				order.updated = (new Date).getTime()
				order.received = _.decimal(response.total_received).div(satoshiMultiplier).toString()
				order.balance = _.decimal(response.final_balance).div(satoshiMultiplier).toString()
				order.txs = response.txs
				order.setHeight()
				
				if(_.decimal(order.balance).lessThan(order.received))
					order.status = 'withdrawn/refunded'
				else if(_.decimal(order.received).lessThan(order.total))
					order.status = 'unpaid'
				else
					order.status = 'paid'

				if(_.decimal(order.balance).isZero())
					resolve(order)
				else
					blockchain.getUtxosPromise(order.address).then(function(response){
						order.utxos = response.unspent_outputs
						resolve(order)
					},function(error){
						reject(error)
					})
			},function(error){
				reject(error)
			})
		})
	}

	Order.prototype.setAddress = function(){
		if(!this.derivationPath)
			throw 'Derivation path not set'

		var bip32 = new BIP32(this.data.vendor_mk_public)
			,child = bip32.derive(this.derivationPath)

		this.address = _.keyToAddress(child.extended_public_key_string())
	}

	return Order
})