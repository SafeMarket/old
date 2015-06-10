angular.module('app').factory('Order',function($q,blockchain,storage,pgp){

	function Order(orderData,receipt){
		var indexMax = Math.pow(2,31)-1
			,products = []
			,order = this

		var constraints = {
			buyer_name:{presence:true}
			,buyer_mk_public:{presence:true}
			,buyer_pgp_public:{presence:true}
			,vendor_name:{presence:true}
			,vendor_mk_public:{presence:true}
			,vendor_pgp_public:{presence:true}
			,products:{presence:true,array:true}
			,index:{presence:true}
			,epoch:{presence:true}
		}

		var validation = validate(orderData,constraints)

		if(validation)
			throw validation[Object.keys(validation)[0]][0]

		this.data = orderData

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
		var bip32 = new BIP32(this.vendor.mpk.trim())
			,paths = ['m',this.index,this.epoch]
			,child = bip32.derive(paths.join('/'))
			,hash160 = child.eckey.pubKeyHash

		this.address =  (new Bitcoin.Address(hash160)).toString()
	}

	return Order
})