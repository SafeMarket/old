angular.module('app').factory('Order',function($q,blockchain,storage){

	function Order(orderData){
		var indexMax = Math.pow(2,31)-1
			,products = []

		var constraints = {
			buyer_name:{presence:true}
			,vendor_name:{presence:true}
			,buyer_pgp_public:{presence:true}
			,products:{presence:true,array:true}
		}

		var validation = validate(orderData,constraints)

		if(validation)
			throw validation[Object.keys(validation)[0]][0]

		this.data = orderData
	}


	Order.fromReceiptPromise = function(receipt){

		var key = storage.data.settings.pgp_private
			,privateKey = openpgp.key.readArmored(key).keys[0];
		
		privateKey.decrypt(storage.data.settings.pgp_password)

		var pgpMessage = atob(receipt.replace('<receipt>','').replace('</receipt>',''))
			,pgpMessage = openpgp.message.readArmored(pgpMessage);

		return $q(function(resolve,reject){
			console.log('sdf')
			openpgp.decryptMessage(privateKey, pgpMessage).then(function(orderDataJson) {
				console.log(orderDataJson)
			    
			    var orderData = JSON.parse(orderDataJson)
			    
			    try{
			    	var order = new Order(orderData)
			    }catch(error){
			    	console.log(error)
			    	reject(error) 
			    }

			    console.log(order)

			    resolve(order)
			}).catch(function(error) {
			    // failure
			});
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