angular.module('app').factory('Order',function($q,blockchain,storage,pgp,growl,check){

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
			,price:{presence:true,numericality:{greaterThan:0,onlyInteger:true},type:'string'}
			,quantity:{presence:true,numericality:{greaterThanOrEqualTo:0,onlyInteger:true},type:'string'}
		}

		check(orderData,orderConstraints)

		var total = 0

		orderData.products.forEach(function(product){
			check(product,productConstraints)
			total+=(product.price*product.quantity)
		})

		if(total<=0)
			throw 'Order total should be greater than 0'

		this.data = orderData
		this.total = convert(total,{from:'satoshi',to:'btc'})
		this.setDerivationPath() 
		this.setAddress() 

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

		growl.addInfoMessage('Updating order status from blockchain')
		order.getUpdatePromise(function(order){
			growl.addSuccessMessage('Order updated')
		},function(error){
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
		return $q(function(resolve,reject){
			blockchain.getAddressPromise(order.address).then(function(response){
				order.received = response.total_received / Math.pow(10,8)
				order.balance = response.final_balance / Math.pow(10,8)
				order.status = response.received >= order.data.total ? 'paid' : 'unpaid'
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