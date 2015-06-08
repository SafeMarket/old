angular.module('app').factory('Receipt',function(blockchain){

	function Receipt(vendor,buyer,message){
		var indexMax = Math.pow(2,31)-1
			,products = []

		vendor.products.forEach(function(product){
			if(product.quantity===0) return true
			products.push({
				id:product.id
				,quantity:product.quantity
			})
		})

		console.log(15)
		console.log(products)

		console.log(18)
		console.log(vendor.getTotal('BTC'))

		angular.extend(this,{
			vendor: vendor
			,buyer: buyer
			,index: 0//Math.random(0,10)
			,epoch: 0//Math.round((new Date()).getTime() / 1000)
			,products:products
			,total:vendor.getTotal('BTC')
			,message:message
			,status:'unpaid'
		})

		console.log(29)
		console.log(this)

		this.setAddress()
	}

	Receipt.prototype.getData = function(){
		return {
			index:this.index
			,epoch:this.epoch
			,products:this.products
			,total:this.total
			,message:this.message
			,vendorName:this.vendor.name
			,buyerName:this.buyer.name
			,buyerAddress:this.buyer.address
		}
	}

	Receipt.prototype.getUpdatePromise = function(){
		var receipt = this
		return blockchain.getAddressPromise(this.address).success(function(response){
				
				receipt.received = response.total_received / Math.pow(10,8)
				receipt.balance = response.final_balance / Math.pow(10,8)

				receipt.status = response.received >= receipt.total ? 'paid' : 'unpaid'

			}).error(function(response){
				console.log('error')
			})
	}

	Receipt.prototype.setAddress = function(){
		var bip32 = new BIP32(this.vendor.mpk.trim())
			,paths = ['m',this.index,this.epoch]
			,child = bip32.derive(paths.join('/'))
			,hash160 = child.eckey.pubKeyHash

		this.address =  (new Bitcoin.Address(hash160)).toString()
	}

	return Receipt
})