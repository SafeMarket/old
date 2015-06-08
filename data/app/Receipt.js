angular.module('app').factory('Receipt',function(blockchain){

	console.log(blockchain)

	function Receipt(vendor,message){
		var indexMax = Math.pow(2,31)-1
			,products = []

		vendor.products.forEach(function(product){
			if(product.quantity===0) return true
			products.push({
				id:product.id
				,quantity:product.quantity
			})
		})

		angular.extend(this,{
			vendor: vendor
			,index: 0//Math.random(0,10)
			,epoch: 0//Math.round((new Date()).getTime() / 1000)
			,products:products
			,total:vendor.getTotal('BTC')
			,message:message
			,status:'unpaid'
		})

		this.setAddress()
	}

	Receipt.prototype.getData = function(){
		return {
			index:this.index
			,epoch:this.epoch
			,products:this.products
			,total:this.total
			,message:this.message
		}
	}

	Receipt.prototype.getUpdatePromise = function(){
		var receipt = this
		return blockchain.getAddressPromise(this.address).success(function(response){
				receipt.blockchain = response
				console.log(response)
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