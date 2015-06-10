angular.module('app').factory('Order',function($q,blockchain,storage,pgp){

	function Order(orderData,receipt){
		var products = []
			,order = this

		var orderConstraints = {
			buyer_name:{presence:true}
			,buyer_mk_public:{presence:true}
			,buyer_pgp_public:{presence:true}
			,vendor_name:{presence:true}
			,vendor_mk_public:{presence:true}
			,vendor_pgp_public:{presence:true}
			,products:{presence:true,array:true}
			,index:{presence:true,numericality:{noStrings: true,greaterThanOrEqualTo:0,lessThan:this.indexMax,onlyInteger:true,}}
			,epoch:{presence:true,numericality:{noStrings: true,greaterThanOrEqualTo:0,lessThan:this.indexMax,onlyInteger:true}}
			,message:{presence:true}
		},productConstraints = {
			name:{presence:true}
			,price:{presence:true,numericality:{noStrings:true,greaterThan:0}}
			,quantity:{presence:true,numericality:{noStrings:true,greaterThanOrEqualTo:0}}
		}

		var orderValidation = validate(orderData,orderConstraints)

		if(orderValidation)
			throw orderValidation[Object.keys(orderValidation)[0]][0]

		var total = 0
		orderData.products.forEach(function(product){
			var productValidation = validate(orderData,orderConstraints)
			total+=(product.price*product.quantity)

			if(productValidation)
				throw productValidation[Object.keys(productValidation)[0]][0]
		})

		if(!total>0)
			throw 'Order total should be greater than 0'

		this.data = orderData
		this.setDerivationPath() 
		this.setAddress() 

		var orderDataJson = JSON.stringify(orderData)
	
		if(receipt)
			this.receipt = receipt
		else
			this.receiptPromise = $q(function(resolve,reject){
				console.log('receiptPromise')
				pgp.getEncryptPromise([orderData.buyer_pgp_public],orderDataJson).then(function(pgpMessage){
					console.log(pgpMessage)
					order.receipt = '<receipt>'+btoa(pgpMessage)+'</receipt>'
					resolve(order.receipt)
				}).catch(function(error){
					console.log(error)
					reject(error)
				})
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



	Order.fromReceiptPromise = function(receipt){
		return $q(function(resolve,reject){
			pgp.getDecryptPromise(
					storage.data.settings.pgp_private
					,storage.data.settings.pgp_password
					,atob(receipt.replace('<receipt>','').replace('</receipt>',''))
				).then(function(orderDataJson){
					resolve(new Order(JSON.parse(orderDataJson),receipt))
				})
		})

	}

	Order.prototype.getUpdatePromise = function(){
		var receipt = this
		return blockchain.getAddressPromise(this.address).success(function(response){
				
				receipt.received = response.total_received / Math.pow(10,8)
				receipt.balance = response.final_balance / Math.pow(10,8)

				receipt.status = response.received >= receipt.total ? 'paid' : 'unpaid'

			}).error(function(response){
				console.log('error')
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