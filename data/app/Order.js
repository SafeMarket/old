angular.module('app').factory('Order',function($q,blockchain,storage,pgp,growl,check,convert){

	function Order(orderData,receipt){
		var products = []
			,order = this

		var orderConstraints = {
			buyer_name:{presence:true,type:'string'}
			,buyer_mk_public:{presence:true,type:'string'}
			,buyer_pgp_public:{presence:true,type:'string'}
			,vendor_name:{presence:true,type:'string'}
			,vendor_mk_public:{presence:true,type:'string'}
			,vendor_pgp_public:{presence:true,type:'string'}
			,products:{presence:true,type:'array'}
			,index:{presence:true,numericality:{greaterThanOrEqualTo:0,lessThan:this.indexMax,onlyInteger:true}}
			,epoch:{presence:true,numericality:{greaterThanOrEqualTo:0,lessThan:this.indexMax,onlyInteger:true}}
			,message:{presence:true}
		},productConstraints = {
			name:{presence:true,type:'string'}
			,price:{presence:true,numericality:{greaterThan:0},type:'string'}
			,quantity:{presence:true,numericality:{greaterThanOrEqualTo:0,onlyInteger:true,noStrings: true},type:'number'}
		}

		check(orderData,orderConstraints)

		var total = new Decimal(0)

		orderData.products.forEach(function(product){
			check(product,productConstraints)
			var subtotal = (new Decimal(product.price)).times(product.quantity)
			total = total.plus(subtotal)
		})

		if(total.lessThanOrEqualTo(0))
			throw 'Order total should be greater than 0'

		this.data = orderData
		this.total = total.toString()
		this.setDerivationPath() 
		this.setAddress() 

		var mk_private = storage.get('settings').mk_private
			,x = console.log(mk_private)
			,mk_public = _.bipPrivateToPublic(storage.get('settings').mk_private)
			,y = console.log(mk_public)


		this.isMine = mk_public===this.data.vendor_mk_public

		console.log('isMine',this.isMine)

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
		console.log('setwif')

		var bip32 = new BIP32(storage.get('settings').mk_private)
			,child = bip32.derive(this.derivationPath)
			,privkeyBytes = child.eckey.priv.toByteArrayUnsigned();

		console.log('privkeyBytes',privkeyBytes)
            
        while (privkeyBytes.length < 32)
        	privkeyBytes.unshift(0)

        console.log('privkeyBytes',privkeyBytes)
       
       	var bytes = [0].concat(privkeyBytes).concat([1])
       		,checksum = Crypto.SHA256(Crypto.SHA256(bytes, {asBytes: true}), {asBytes: true}).slice(0, 4)

       	this.wif = Bitcoin.Base58.encode(bytes.concat(checksum))

       	console.log('wif',this.wif)

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

				if(_.decimal(order.received).lessThan(order.total))
					order.status = 'unpaid'
				else if(_.decimal(order.balance).lessThan(order.received))
					order.status = 'complete'
				else
					order.status = 'paid'

				resolve(order)
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
			,hash160 = child.eckey.pubKeyHash

		this.address =  (new Bitcoin.Address(hash160)).toString()
	}

	return Order
})