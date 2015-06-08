angular.module('app').factory('Receipt',function(){
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
			,index: Math.random(0,indexMax)
			,epoch: Math.round((new Date()).getTime() / 1000)
			,products:products
			,total:vendor.getTotal('BTC')
			,message:message
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

	Receipt.prototype.setAddress = function(){
		var bip32 = new BIP32(this.vendor.mpk.trim())
			,paths = ['m',this.index,this.epoch]
			,child = bip32.derive(paths.join('/'))
			,hash160 = child.eckey.pubKeyHash

		this.address =  (new Bitcoin.Address(hash160)).toString()
	}

	return Receipt
})